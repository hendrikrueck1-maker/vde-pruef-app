/* ============================================================================
 *  OFFENE PRÜFUNGEN (MEHRERE PARALLELE ENTWÜRFE)
 * ----------------------------------------------------------------------------
 *  FRÜHER gab es je Formulartyp genau EINEN Autosave-Zwischenstand
 *  (localStorage-Key 'vde_autosave_pr' / '_ap' / '_gp'). Wer zwei
 *  Anschlussstellen gleichzeitig prüfte (z. B. Bühne links UND Bühne rechts),
 *  konnte immer nur an einer davon arbeiten - das Öffnen der zweiten
 *  überschrieb den Zwischenstand der ersten. Ein fertiges PDF landete zwar im
 *  Archiv, aber das Archiv speichert nur FERTIGE PDFs - ein angefangenes,
 *  noch nicht exportiertes Formular ließ sich dort nicht ablegen und später
 *  weiterbearbeiten.
 *
 *  JETZT: Jeder Formularstand ist ein eigener "Entwurf" mit eigener ID und
 *  eigenem Autosave-Key. Ein Index (DRAFTS_INDEX_KEY) verzeichnet alle
 *  offenen Entwürfe aller drei Formulartypen. Pro Formulartyp merkt sich die
 *  App zusätzlich, welcher Entwurf gerade "aktiv" ist (AKTIVER_ENTWURF_KEY) -
 *  das ist der, den ein normales erneutes Öffnen der Seite automatisch
 *  fortsetzt (bisheriges Autosave-Verhalten, jetzt nur pro Entwurf statt
 *  global).
 *
 *  Ein Entwurf bleibt bestehen, bis "Neues Formular anfordern" explizit
 *  einen neuen anlegt oder der Entwurf über die Liste "Offene Prüfungen"
 *  gelöscht wird. Ein PDF-Export SCHLIESST den Entwurf NICHT ab - das
 *  Formular bleibt bearbeitbar, ein erneuter Export ersetzt lediglich die
 *  zuvor heruntergeladene PDF-Datei (siehe pdf-utils.js savePdfCompatible).
 * ========================================================================== */

const DRAFTS_INDEX_KEY = 'vde_entwuerfe_index';

function aktiverEntwurfKey(praefix) {
  return 'vde_aktiver_entwurf_' + praefix;
}

function autosaveKeyFuerEntwurf(praefix, entwurfId) {
  return 'vde_autosave_' + praefix.toLowerCase() + '_' + entwurfId;
}

function ladeEntwuerfeIndex() {
  try {
    const raw = localStorage.getItem(DRAFTS_INDEX_KEY);
    const liste = raw ? JSON.parse(raw) : [];
    return Array.isArray(liste) ? liste : [];
  } catch (e) { return []; }
}

function speichereEntwuerfeIndex(liste) {
  // 5.0.0: sicherSetItem() (storage.js) statt direktem try/catch ohne
  // Meldung - ein voller Speicher wird jetzt sichtbar gemeldet statt still
  // zu scheitern (BUG #1 aus der 4.7.2-Prüfung).
  if (typeof sicherSetItem === 'function') {
    sicherSetItem(DRAFTS_INDEX_KEY, JSON.stringify(liste));
  } else {
    try { localStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(liste)); } catch (e) {}
  }
}

/* 5.0.0 (BUG #7 aus der 4.7.2-Prüfung): ein monoton steigender Zaehler kommt
 * zum Zeitstempel+Zufallsteil hinzu. Vorher war eine Kollision zweier IDs
 * theoretisch moeglich, wenn zwei Entwuerfe in derselben Millisekunde UND
 * mit gleichem Zufallsteil angelegt wuerden - dann haette der zweite den
 * ersten im Index ueberschrieben. Der Zaehler macht das unabhaengig von
 * Zeitstempel und Zufall ausgeschlossen, ohne eine externe UUID-Bibliothek
 * zu benoetigen. */
let ENTWURF_ID_ZAEHLER = 0;

function neueEntwurfId() {
  ENTWURF_ID_ZAEHLER = (ENTWURF_ID_ZAEHLER + 1) % 1679616; // 36^4, bleibt kurz
  return Date.now().toString(36) + '-' + ENTWURF_ID_ZAEHLER.toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* Traegt einen Entwurf im Index ein oder aktualisiert seine Metadaten
 * (Bezeichnung, Protokollnummer, Zeitstempel) - aufgerufen bei jedem
 * Autosave, damit die Liste "Offene Prüfungen" immer aktuell ist. */
function entwurfMerken(praefix, entwurfId, meta) {
  const liste = ladeEntwuerfeIndex();
  const idx = liste.findIndex(e => e.id === entwurfId);
  const eintrag = {
    id: entwurfId,
    praefix: praefix,
    protokollnummer: (meta && meta.protokollnummer) || '',
    bezeichnung: (meta && meta.bezeichnung) || '',
    zuletzt: Date.now()
  };
  if (idx === -1) liste.push(eintrag); else liste[idx] = eintrag;
  speichereEntwuerfeIndex(liste);
}

function entwurfEntfernen(entwurfId) {
  const liste = ladeEntwuerfeIndex().filter(e => e.id !== entwurfId);
  speichereEntwuerfeIndex(liste);
  const alle = { PR: null, AP: null, GP: null };
  Object.keys(alle).forEach(praefix => {
    try {
      const idx = localStorage.getItem(aktiverEntwurfKey(praefix));
      if (idx === entwurfId) localStorage.removeItem(aktiverEntwurfKey(praefix));
    } catch (e) {}
  });
}

function entwuerfeFuerTyp(praefix) {
  return ladeEntwuerfeIndex()
    .filter(e => e.praefix === praefix)
    .sort((a, b) => (b.zuletzt || 0) - (a.zuletzt || 0));
}

/* Liefert die ID des aktuell aktiven Entwurfs fuer einen Formulartyp und legt
 * beim allerersten Aufruf (kein aktiver Entwurf hinterlegt) automatisch einen
 * neuen an - inklusive Uebernahme eines eventuell noch vorhandenen alten,
 * globalen Autosave-Standes (Ruecksicht auf Nutzer, die von einer Version vor
 * 4.7.0 aktualisieren: ihr angefangenes Formular geht dabei nicht verloren). */
function aktivenEntwurfSicherstellen(praefix, altAutosaveKey) {
  const key = aktiverEntwurfKey(praefix);
  let id;
  try { id = localStorage.getItem(key); } catch (e) { id = null; }

  if (id) return id;

  id = neueEntwurfId();
  try { sicherSetItem(key, id); } catch (e) {}

  // Migration: ein alter, formularweiter Autosave-Stand wird zum ersten Entwurf.
  // 5.0.0 (BUG #5 aus der 4.7.2-Prüfung): removeItem() steht jetzt in einem
  // eigenen try/catch NACH dem setItem, statt in derselben try-Klammer - so
  // wird der Alt-Key auch dann entfernt, wenn setItem am Ende doch fehlschlug
  // (z. B. Speicher wird erst zwischen den zwei Aufrufen voll). Vorher konnte
  // ein Fehler beim setItem verhindern, dass removeItem ueberhaupt erreicht
  // wird, wodurch der alte Key liegen blieb.
  if (altAutosaveKey) {
    let alt = null;
    try { alt = localStorage.getItem(altAutosaveKey); } catch (e) {}
    if (alt !== null) {
      sicherSetItem(autosaveKeyFuerEntwurf(praefix, id), alt);
      try { localStorage.removeItem(altAutosaveKey); } catch (e) {}
    }
  }
  return id;
}

function entwurfWechseln(praefix, entwurfId) {
  sicherSetItem(aktiverEntwurfKey(praefix), entwurfId);
}

/* Beim Aufruf einer Formularseite mit ?entwurf=<id> (Link aus der Liste
 * "Offene Prüfungen") wird dieser Entwurf sofort zum aktiven gemacht, BEVOR
 * aktivenEntwurfSicherstellen() greift - so oeffnet der Link direkt den
 * gewuenschten Zwischenstand statt des zuletzt aktiven. */
function entwurfAusUrlUebernehmen(praefix) {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('entwurf');
    if (id) entwurfWechseln(praefix, id);
  } catch (e) {}
}

/* Legt einen frischen, leeren Entwurf an und macht ihn zum aktiven - fuer
 * "Neues Formular anfordern". Der bisherige Entwurf bleibt unangetastet im
 * Index stehen (er ist ja nicht abgeschlossen, nur nicht mehr aktiv offen). */
function neuenEntwurfAnlegen(praefix) {
  const id = neueEntwurfId();
  entwurfWechseln(praefix, id);
  return id;
}

function entwurfBezeichnung(praefix, fieldGetter) {
  // fieldGetter liefert { anlage, gebaeude, protokollnummer } je Formulartyp
  const f = fieldGetter ? fieldGetter() : {};
  const teile = [f.anlage, f.gebaeude].filter(Boolean);
  return teile.join(' – ') || (PROTOKOLL_PRAEFIXE[praefix] || praefix);
}

const ENTWURF_DATEI = { PR: 'vde0100.html', AP: 'anschlusspruefung.html', GP: 'geraetepruefung.html' };

/* Rendert die Liste "Offene Prüfungen" in ein Container-Element (z. B. auf
 * index.html). Jede Zeile fuehrt per Link direkt zum betroffenen Formular
 * mit dem passenden ?entwurf=<id> - ein Klick oeffnet also GENAU diesen
 * Zwischenstand, nicht irgendeinen. */
function renderOffenePruefungen(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const alle = ['PR', 'AP', 'GP'].flatMap(entwuerfeFuerTyp);
  alle.sort((a, b) => (b.zuletzt || 0) - (a.zuletzt || 0));

  if (!alle.length) {
    el.innerHTML = '<p style="font-size:0.85rem; color:var(--secondary);">Keine offenen Prüfungen – jede neu gestartete Prüfung erscheint hier, solange sie nicht abgeschlossen wurde.</p>';
    return;
  }

  el.innerHTML = alle.map(function (e) {
    const datei = ENTWURF_DATEI[e.praefix] || '#';
    const typLabel = PROTOKOLL_PRAEFIXE[e.praefix] || e.praefix;
    const titel = e.protokollnummer ? (e.protokollnummer + (e.bezeichnung ? ' – ' + esc(e.bezeichnung) : '')) : esc(e.bezeichnung || typLabel);
    return (
      '<div class="offene-pruefung-zeile">' +
        '<div class="offene-pruefung-info">' +
          '<span class="offene-pruefung-typ">' + esc(typLabel) + '</span>' +
          '<strong>' + titel + '</strong>' +
          '<span class="offene-pruefung-zeit">zuletzt bearbeitet ' + formatZuletzt(e.zuletzt) + '</span>' +
        '</div>' +
        '<div class="offene-pruefung-aktionen">' +
          '<a class="btn btn-success" href="' + datei + '?entwurf=' + encodeURIComponent(e.id) + '">Öffnen</a>' +
          '<button type="button" class="btn-danger" onclick="offenePruefungLoeschen(\'' + attrEsc(e.id) + '\', \'' + attrEsc(e.praefix) + '\')">Löschen</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

/* 5.0.0 (BUG #9 aus der 4.7.2-Prüfung): escapt jetzt auch " und ' - vorher
 * fehlte das, obwohl esc() auch innerhalb von HTML-Attributen verwendet wird
 * (z. B. onclick="offenePruefungLoeschen('...')" oben in renderOffenePruefungen).
 * In der Praxis bestehen Entwurf-IDs und Präfixe nur aus Base36-Zeichen bzw.
 * PR/AP/GP, ein Anführungszeichen konnte dort also nicht auftreten - aber
 * esc() wird auch auf freien Text (Bezeichnung) angewendet, und ein
 * ungeschütztes " in einem HTML-Attribut ist grundsätzlich unsicher designt. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function offenePruefungLoeschen(entwurfId, praefix) {
  if (!confirm('Diese offene Prüfung endgültig löschen? Ein noch nicht als PDF gespeicherter Zwischenstand geht dabei verloren.')) return;
  entwurfEntfernen(entwurfId);
  try { localStorage.removeItem(autosaveKeyFuerEntwurf(praefix, entwurfId)); } catch (e) {}
  if (typeof renderOffenePruefungen === 'function') renderOffenePruefungen('offenePruefungenListe');
}

function formatZuletzt(ts) {
  if (!ts) return '';
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return 'vor ' + diffMin + ' Min.';
  const diffStd = Math.round(diffMin / 60);
  if (diffStd < 24) return 'vor ' + diffStd + ' Std.';
  const d = new Date(ts);
  return d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
