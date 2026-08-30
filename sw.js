/* ============================================================================
 *  Service Worker – VDE Prüfprotokoll Manager
 * ----------------------------------------------------------------------------
 *  Diese Datei muss normalerweise NICHT angefasst werden.
 *  Neue Protokolle/Dateien werden in js/app-config.js eingetragen und
 *  landen von dort automatisch im Offline-Cache.
 *
 *  Strategie:
 *    - HTML/Navigation : Network-First  -> immer die aktuellste Version,
 *                                          offline trotzdem nutzbar
 *    - CSS/JS/Icons    : Cache-First    -> maximal schnell, offline sicher
 *
 *  Wichtig: Alle Pfade sind RELATIV. Dadurch laeuft die App sowohl unter
 *  https://user.github.io/vde-pruef-app/ als auch unter einer eigenen Domain
 *  im Wurzelverzeichnis – ohne Aenderung.
 * ========================================================================== */

/* ============================================================================
 *  WICHTIG BEI JEDEM RELEASE: SW_VERSION MIT HOCHZAEHLEN!
 * ----------------------------------------------------------------------------
 *  Ein Browser installiert einen neuen Service Worker NUR, wenn sich der
 *  Inhalt DIESER Datei (sw.js) byteweise geaendert hat. Aenderungen an
 *  js/app-config.js oder anderen Dateien reichen NICHT: der alte Service
 *  Worker bleibt aktiv und liefert weiter die alten Dateien aus dem Cache -
 *  die App zeigt dann trotz erfolgreichem Upload die alte Version.
 *
 *  Deshalb steht die Version hier ein zweites Mal. Sie muss identisch zu
 *  APP_VERSION in js/app-config.js sein.
 * ========================================================================== */
const SW_VERSION = '4.6.1';

/* Konfiguration + Dateiliste laden (relativ zum Speicherort dieser Datei).
 * Der Parameter ?v= erzwingt eine frische Kopie: importScripts wird sonst aus
 * dem HTTP-Cache bedient (Standard updateViaCache: 'imports') und APP_VERSION
 * waere weiterhin der alte Wert. */
importScripts('js/app-config.js?v=' + SW_VERSION);

const BASE       = self.registration.scope;            // z.B. .../vde-pruef-app/
const CACHE_NAME = 'vde-pruefprotokoll-' + SW_VERSION;

/* Relative Eintraege in absolute URLs umwandeln */
const PRECACHE_URLS = ALL_ASSETS.map(function (u) {
  return new URL(u, BASE).toString();
});
const OFFLINE_FALLBACK = new URL('index.html', BASE).toString();

/* ---------------------------------------------------------------- INSTALL */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Einzeln cachen: eine fehlende Datei darf die Installation nicht abbrechen
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch (err) {
        console.warn('[SW] Precache fehlgeschlagen:', url, err);
      }
    }));
    // Neuer SW wartet, bis der Nutzer im Banner auf "Jetzt aktualisieren" tippt
  })());
});

/* --------------------------------------------------------------- ACTIVATE */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('vde-pruefprotokoll-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
    );
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
    await self.clients.claim();
  })());
});

/* ------------------------------------------------------------------ FETCH */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;      // externe Requests durchlassen

  // Versions-/Diagnoseabfragen duerfen NIE aus dem Cache kommen.
  // (Ohne diesen Bypass wuerde caches.match(..., {ignoreSearch:true}) den
  //  Cache-Buster ignorieren und die alte Datei zurueckgeben.)
  if (url.searchParams.has('nocache')) return;

  /* 1) Seitenaufrufe (HTML): Network-First */
  const wantsHTML = req.mode === 'navigate' ||
                    (req.headers.get('accept') || '').includes('text/html');

  if (wantsHTML) {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        const fresh = preload || await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached) return cached;
        const home = await caches.match(OFFLINE_FALLBACK, { ignoreSearch: true });
        if (home) return home;
        return new Response(
          '<!doctype html><meta charset="utf-8"><title>Offline</title>' +
          '<body style="font-family:sans-serif;padding:2rem">' +
          '<h1>Offline</h1><p>Diese Seite ist noch nicht im Offline-Speicher. ' +
          'Bitte einmal mit Internetverbindung öffnen.</p></body>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
        );
      }
    })());
    return;
  }

  /* 2) Statische Dateien: Cache-First + Aktualisierung im Hintergrund */
  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) {
      fetch(req).then((fresh) => {
        if (fresh && fresh.ok && fresh.type === 'basic') {
          caches.open(CACHE_NAME).then((c) => c.put(req, fresh));
        }
      }).catch(() => {});
      return cached;
    }
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && fresh.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});

/* -------------------------------------------------------- UPDATESTEUERUNG */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
  if (data && data.type === 'GET_VERSION') {
    event.source && event.source.postMessage({
      type: 'VERSION', version: APP_VERSION, swVersion: SW_VERSION, cache: CACHE_NAME
    });
  }
  // Notfall-Reset: alle Caches leeren (z. B. ueber den Knopf auf der Startseite)
  if (data && data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => event.source && event.source.postMessage({ type: 'CACHES_CLEARED' }))
    );
  }
});
