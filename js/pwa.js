/* PWA-Steuerung: Service-Worker-Registrierung, Installations-Button,
 * iOS-Anleitung, Update-Hinweis und Offline-Anzeige.
 * Einbinden mit: <script src="js/pwa.js" defer></script>
 */
(function () {
  'use strict';

  /* ---------- 1. Service Worker registrieren ---------- */
  let swRegistration = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // Pfad relativ zur Seite -> funktioniert im Wurzelverzeichnis
      // UND unter https://<name>.github.io/<repo>/ ohne Anpassung
      var swUrl = new URL('sw.js', document.baseURI).toString();
      var swScope = new URL('./', document.baseURI).toString();

      // updateViaCache: 'none' -> sw.js UND die per importScripts geladenen
      // Dateien werden bei der Update-Pruefung immer frisch vom Server geholt.
      // Mit dem Standardwert 'imports' kam js/app-config.js aus dem HTTP-Cache
      // und eine neue Versionsnummer wurde nicht bemerkt.
      navigator.serviceWorker.register(swUrl, { scope: swScope, updateViaCache: 'none' })
        .then(function (reg) {
          swRegistration = reg;

          // Bereits ein Update wartend?
          if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);

          reg.addEventListener('updatefound', function () {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateBanner(nw);
              }
            });
          });

          // Aktiv nach Updates suchen: beim Start und jedes Mal, wenn die App
          // wieder in den Vordergrund kommt (hoechstens alle 60 Sekunden).
          let letztePruefung = 0;
          function updatePruefen() {
            if (Date.now() - letztePruefung < 60000) return;
            letztePruefung = Date.now();
            reg.update().catch(function () {});
            pruefeVersionUeberNetz();
          }
          updatePruefen();
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') updatePruefen();
          });
          window.addEventListener('online', updatePruefen);
        })
        .catch(function (err) {
          console.warn('[PWA] Service Worker Registrierung fehlgeschlagen:', err);
        });

      // Nach Aktivierung eines neuen SW einmalig neu laden
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });
    });
  } else {
    window.addEventListener('load', pruefeVersionUeberNetz);
  }

  /* ---------- 1b. Sicherheitsnetz: Versionsvergleich direkt am Server -------
   * Falls der Service-Worker-Mechanismus einmal klemmt (z. B. weil sw.js
   * unveraendert blieb), faellt das hier trotzdem auf: die laufende
   * APP_VERSION wird mit der Version auf dem Server verglichen.
   * ?nocache= wird vom Service Worker durchgereicht (siehe sw.js). */
  function pruefeVersionUeberNetz() {
    if (typeof APP_VERSION === 'undefined') return;
    fetch('js/app-config.js?nocache=' + Date.now(), { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.text() : null; })
      .then(function (txt) {
        if (!txt) return;
        const m = txt.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
        if (m && m[1] !== APP_VERSION) showServerUpdateBanner(m[1]);
      })
      .catch(function () { /* offline -> nichts tun */ });
  }

  function showServerUpdateBanner(serverVersion) {
    if (document.querySelector('.pwa-banner[data-typ="server"]')) return;
    const el = makeBanner(
      '<span class="pwa-text">🔄 Auf dem Server liegt Version <b>' + serverVersion +
      '</b>, hier läuft <b>' + APP_VERSION + '</b>.</span>' +
      '<button class="pwa-primary" data-act="hard">Jetzt aktualisieren</button>' +
      '<button class="pwa-ghost" data-act="later">Später</button>'
    );
    el.dataset.typ = 'server';
    el.querySelector('[data-act="hard"]').onclick = function () {
      el.remove();
      appZuruecksetzen();
    };
    el.querySelector('[data-act="later"]').onclick = function () { el.remove(); };
  }

  /* ---------- 1c. Notfall-Reset (auch von der Startseite aufrufbar) --------
   * Loescht alle Offline-Caches und meldet den Service Worker ab, danach
   * wird neu geladen. Eingaben in localStorage (Stammdaten, Zaehler,
   * Zwischenspeicher) bleiben dabei erhalten. */
  function appZuruecksetzen() {
    const schritte = [];
    if (window.caches && caches.keys) {
      schritte.push(caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }));
    }
    if ('serviceWorker' in navigator) {
      schritte.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(regs.map(function (r) { return r.unregister(); }));
      }));
    }
    Promise.all(schritte).catch(function () {}).then(function () {
      // Cache-Buster in der URL erzwingt einen echten Neuaufbau
      const u = new URL(window.location.href);
      u.searchParams.set('reload', Date.now());
      window.location.replace(u.toString());
    });
  }
  window.appZuruecksetzen = appZuruecksetzen;
  window.pruefeVersionUeberNetz = pruefeVersionUeberNetz;

  // Manuelle Update-Suche (Knopf auf der Startseite)
  window.nachUpdateSuchen = function () {
    if (!swRegistration) { pruefeVersionUeberNetz(); return; }
    swRegistration.update()
      .then(function () {
        if (swRegistration.waiting) { showUpdateBanner(swRegistration.waiting); return; }
        pruefeVersionUeberNetz();
        setTimeout(function () {
          if (!document.querySelector('.pwa-banner')) {
            const el = makeBanner(
              '<span class="pwa-text">✅ Die App ist aktuell (Version ' + APP_VERSION + ').</span>' +
              '<button class="pwa-primary" data-act="ok">OK</button>'
            );
            el.querySelector('[data-act="ok"]').onclick = function () { el.remove(); };
          }
        }, 1500);
      })
      .catch(function () { pruefeVersionUeberNetz(); });
  };

  /* ---------- 2. Styles ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .pwa-install-btn {
      background: var(--accent, #2563eb); color: #fff; border: none;
      padding: 8px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; display: none; align-items: center; gap: 6px;
    }
    .pwa-install-btn:hover { filter: brightness(1.1); }
    .pwa-install-btn.visible { display: inline-flex; }

    .pwa-banner {
      position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 9999;
      background: #003366; color: #fff; padding: 14px 16px; border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,.25); font-size: 0.88rem;
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      max-width: 620px; margin: 0 auto;
    }
    .pwa-banner button {
      border: none; border-radius: 6px; padding: 7px 12px; font-size: 0.82rem;
      font-weight: 600; cursor: pointer;
    }
    .pwa-banner .pwa-primary { background: #facc15; color: #1e293b; }
    .pwa-banner .pwa-ghost { background: transparent; color: #cbd5e1; }
    .pwa-banner .pwa-text { flex: 1 1 200px; line-height: 1.4; }

    .pwa-offline {
      position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
      background: #b45309; color: #fff; text-align: center;
      padding: 6px; font-size: 0.8rem; font-weight: 600;
    }
    @media print { .pwa-banner, .pwa-offline, .pwa-install-btn { display: none !important; } }
  `;
  document.head.appendChild(css);

  /* ---------- 3. Hilfsfunktionen ---------- */
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function makeBanner(html) {
    document.querySelectorAll('.pwa-banner').forEach(function (b) { b.remove(); });
    const el = document.createElement('div');
    el.className = 'pwa-banner';
    el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }

  /* ---------- 4. Update-Hinweis ---------- */
  function showUpdateBanner(worker) {
    const el = makeBanner(
      '<span class="pwa-text">🔄 Eine neue Version der App ist verfügbar.</span>' +
      '<button class="pwa-primary" data-act="update">Jetzt aktualisieren</button>' +
      '<button class="pwa-ghost" data-act="later">Später</button>'
    );
    el.querySelector('[data-act="update"]').onclick = function () {
      worker.postMessage({ type: 'SKIP_WAITING' });
      el.remove();
    };
    el.querySelector('[data-act="later"]').onclick = function () { el.remove(); };
  }

  /* ---------- 5. Installations-Button (Android / Chrome / Edge) ---------- */
  let deferredPrompt = null;

  function getInstallButton() {
    let btn = document.getElementById('pwaInstallBtn');
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.type = 'button';
    btn.className = 'pwa-install-btn';
    btn.innerHTML = '⬇️ App installieren';
    const header = document.querySelector('.header-bar');
    if (header) {
      header.appendChild(btn);
    } else {
      btn.style.position = 'fixed';
      btn.style.right = '14px';
      btn.style.bottom = '14px';
      btn.style.zIndex = '9998';
      document.body.appendChild(btn);
    }
    return btn;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const btn = getInstallButton();
    btn.classList.add('visible');
    btn.onclick = async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice.outcome === 'accepted') btn.classList.remove('visible');
    };
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.classList.remove('visible');
    try { localStorage.setItem('pwa_ios_hint_dismissed', '1'); } catch (e) {}
  });

  /* ---------- 6. iOS-Anleitung (Safari kennt kein beforeinstallprompt) ---------- */
  window.addEventListener('load', function () {
    if (!isIOS() || isStandalone()) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem('pwa_ios_hint_dismissed') === '1'; } catch (e) {}
    if (dismissed) return;

    setTimeout(function () {
      const el = makeBanner(
        '<span class="pwa-text">📲 <b>Auf dem iPhone/iPad installieren:</b><br>' +
        'In Safari unten auf <b>Teilen</b> <span style="font-size:1.05em">&#x2934;</span> tippen &rarr; ' +
        '<b>„Zum Home-Bildschirm“</b> &rarr; <b>Hinzufügen</b>.</span>' +
        '<button class="pwa-primary" data-act="ok">Verstanden</button>'
      );
      el.querySelector('[data-act="ok"]').onclick = function () {
        try { localStorage.setItem('pwa_ios_hint_dismissed', '1'); } catch (e) {}
        el.remove();
      };
    }, 2500);
  });

  /* ---------- 7. Offline-Anzeige ---------- */
  function updateOnlineStatus() {
    let bar = document.getElementById('pwaOfflineBar');
    if (navigator.onLine) {
      if (bar) bar.remove();
    } else if (!bar) {
      bar = document.createElement('div');
      bar.id = 'pwaOfflineBar';
      bar.className = 'pwa-offline';
      bar.textContent = '⚠️ Offline – Eingaben und PDF-Erstellung funktionieren weiterhin.';
      document.body.appendChild(bar);
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('load', updateOnlineStatus);
})();
