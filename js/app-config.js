/* ============================================================================
 *  app-config.js  –  ZENTRALE KONFIGURATION DER APP
 * ----------------------------------------------------------------------------
 *  >>> DIES IST DIE EINZIGE DATEI, DIE DU ANFASSEN MUSST, WENN DU
 *  >>> EIN NEUES PROTOKOLL HINZUFUEGEN WILLST.
 *
 *  Diese Datei wird an ZWEI Stellen geladen:
 *    1. von jeder HTML-Seite  (<script src="js/app-config.js">)
 *    2. vom Service Worker    (importScripts) -> daraus entsteht der Offline-Cache
 *
 *  Deshalb: nur klassisches "var", keine import/export-Syntax!
 *
 *  ANLEITUNG NEUES PROTOKOLL -> siehe docs/ERWEITERN.md
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * 1. VERSION
 * ---------------------------------------------------------------------------
 * Bei JEDER Aenderung an App-Dateien hochzaehlen!
 * Dadurch laedt der Service Worker alles neu und die Nutzer bekommen
 * automatisch den "Neue Version verfuegbar"-Hinweis.
 * (Das Skript UPDATE.bat erhoeht diese Zahl automatisch.)
 */
var APP_VERSION = '4.6.0';

/* ---------------------------------------------------------------------------
 * 2. PROTOKOLLE
 * ---------------------------------------------------------------------------
 * Jeder Eintrag erzeugt automatisch:
 *   - eine Kachel auf der Startseite (index.html)
 *   - einen Eintrag im Offline-Cache (Service Worker)
 *   - eine App-Verknuepfung (Manifest-Shortcut, siehe manifest.json)
 *
 * Felder:
 *   id            eindeutiger Schluessel (klein, ohne Leerzeichen)
 *   datei         Dateiname der HTML-Seite (im Hauptordner)
 *   titel         Ueberschrift auf der Kachel
 *   kurz          Kurzname (fuer App-Verknuepfungen)
 *   norm          Normbezug, wird klein unter dem Titel angezeigt
 *   beschreibung  Text auf der Kachel
 *   status        'aktiv'  = nutzbar  |  'geplant' = ausgegraut
 *   scripts       zusaetzliche JS-Dateien dieser Seite (fuer Offline-Cache)
 */
var PROTOKOLLE = [
  {
    id: 'vde0100',
    datei: 'vde0100.html',
    titel: 'Prüfprotokoll elektrischer Anlagen',
    kurz: 'Anlage',
    norm: 'DIN VDE 0100-600 / DIN VDE 0105-100',
    beschreibung: 'Erst- und Wiederholungsprüfung nach DIN VDE 0100-600 / DIN VDE 0105-100 (Verteilungen, Stromkreise, DGUV V3).',
    status: 'aktiv',
    scripts: ['js/pdf-generator.js']
  },
  {
    id: 'anschluss',
    datei: 'anschlusspruefung.html',
    titel: 'Anschlussprüfung Übergabepunkt',
    kurz: 'Anschluss',
    norm: 'DIN VDE 0100-704 / -711 / -740',
    beschreibung: 'Prüfung/Übergabe der Stromversorgung von Netzbetreiber, Vermieter oder Generator an den Veranstalter.',
    status: 'aktiv',
    scripts: ['js/anschluss-generator.js']
  },
  {
    id: 'geraete',
    datei: 'geraetepruefung.html',
    titel: 'Prüfung elektrischer Geräte',
    kurz: 'Gerät',
    norm: 'DIN EN 50699 (VDE 0702) / DIN EN 50678 (VDE 0701)',
    beschreibung: 'Wiederholungsprüfung und Prüfung nach Reparatur (Scheinwerfer, Verlängerungskabel, Geräte).',
    status: 'aktiv',
    scripts: ['js/geraete-generator.js']
  }

  /* ----------------------------------------------------------------
   * BEISPIEL fuer ein neues Protokoll – einfach einkommentieren
   * und die Datei "meinprotokoll.html" aus der Vorlage erstellen:
   *
   * ,{
   *   id: 'meinprotokoll',
   *   datei: 'meinprotokoll.html',
   *   titel: 'Mein neues Protokoll',
   *   kurz: 'Neu',
   *   norm: 'DIN VDE XXXX',
   *   beschreibung: 'Kurze Beschreibung für die Kachel.',
   *   status: 'aktiv',
   *   scripts: ['js/meinprotokoll-generator.js']
   * }
   * ---------------------------------------------------------------- */
];

/* ---------------------------------------------------------------------------
 * 3. GRUNDDATEIEN (werden immer offline vorgehalten)
 * ---------------------------------------------------------------------------
 * Nur anfassen, wenn du eine NEUE gemeinsame Datei ergaenzt
 * (z.B. eine weitere Bibliothek in js/vendor/).
 */
var CORE_ASSETS = [
  './',
  'index.html',
  'archiv.html',
  'manifest.json',
  'css/style.css',
  'js/app-config.js',
  'js/storage.js',
  'js/archiv.js',
  'js/pdf-utils.js',
  'js/pwa.js',
  'js/vendor/jspdf.umd.min.js',
  'js/vendor/jspdf.plugin.autotable.min.js',
  'js/vendor/liberation-sans-font.js',
  'js/vendor/signature_pad.umd.min.js',
  'js/vendor/jszip.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-192-maskable.png',
  'icons/icon-512-maskable.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

/* ---------------------------------------------------------------------------
 * 4. Abgeleitete Liste aller Dateien (nichts aendern)
 * ------------------------------------------------------------------------ */
var ALL_ASSETS = (function () {
  var liste = CORE_ASSETS.slice();
  for (var i = 0; i < PROTOKOLLE.length; i++) {
    var p = PROTOKOLLE[i];
    if (p.status !== 'aktiv') continue;
    if (p.datei && liste.indexOf(p.datei) === -1) liste.push(p.datei);
    var s = p.scripts || [];
    for (var j = 0; j < s.length; j++) {
      if (liste.indexOf(s[j]) === -1) liste.push(s[j]);
    }
  }
  return liste;
})();
