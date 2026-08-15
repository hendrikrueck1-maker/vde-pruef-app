/* ============================================================================
 *  archiv.js  –  PROTOKOLL-ARCHIV (ab App-Version 4.0.0)
 * ----------------------------------------------------------------------------
 *  Jedes ausgefuellte PDF wird zusaetzlich zum Download/Teilen IM GERAET
 *  abgelegt. Grund: bisher verliess das PDF die App sofort und war danach nur
 *  noch im Download-Ordner des Geraets zu finden - auf iPad/iPhone in der
 *  Praxis unauffindbar, sobald ein paar Wochen vergangen sind.
 *
 *  Speicherort: IndexedDB (Datenbank 'vde_archiv'). Anders als localStorage
 *  kann IndexedDB Binaerdaten (Blobs) und mehrere hundert MB aufnehmen.
 *
 *  Was NICHT passiert: nichts wird ins Internet uebertragen. Das Archiv liegt
 *  ausschliesslich auf dem Geraet, auf dem geprueft wurde.
 *
 *  Nur klassisches "var"/function - die Datei wird auch vom Service Worker
 *  vorgehalten und muss ohne Modulsystem laufen.
 * ========================================================================== */

var ARCHIV_DB = 'vde_archiv';
var ARCHIV_DB_VERSION = 1;
var ARCHIV_STORE = 'protokolle';

/* Zuordnung Protokoll-Praefix -> Anzeigename, Formular und Autosave-Schluessel */
var ARCHIV_TYPEN = {
  PR: { label: 'Anlagenprüfung', kurz: 'Anlage', datei: 'vde0100.html', autosave: 'vde_autosave_pr', einheit: 'Stromkreise' },
  AP: { label: 'Anschlussprüfung', kurz: 'Anschluss', datei: 'anschlusspruefung.html', autosave: 'vde_autosave_ap', einheit: 'Einspeisungen' },
  GP: { label: 'Geräteprüfung', kurz: 'Gerät', datei: 'geraetepruefung.html', autosave: 'vde_autosave_gp', einheit: 'Prüflinge' }
};

function archivTyp(praefix) {
  return ARCHIV_TYPEN[praefix] || { label: 'Protokoll', kurz: 'Prot.', datei: 'index.html', autosave: '', einheit: 'Einträge' };
}

/* ---------------------------------------------------------------- DATENBANK */
function archivDbOeffnen() {
  return new Promise(function (resolve, reject) {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB nicht verfügbar'));
    var req = indexedDB.open(ARCHIV_DB, ARCHIV_DB_VERSION);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains(ARCHIV_STORE)) {
        var store = db.createObjectStore(ARCHIV_STORE, { keyPath: 'id' });
        store.createIndex('erstellt', 'erstellt');
        store.createIndex('praefix', 'praefix');
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function archivTx(modus, arbeit) {
  return archivDbOeffnen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(ARCHIV_STORE, modus);
      var store = tx.objectStore(ARCHIV_STORE);
      var ergebnis;
      try { ergebnis = arbeit(store); } catch (e) { reject(e); return; }
      tx.oncomplete = function () { db.close(); resolve(ergebnis && ergebnis.result !== undefined ? ergebnis.result : ergebnis); };
      tx.onerror = function () { db.close(); reject(tx.error); };
      tx.onabort = function () { db.close(); reject(tx.error); };
    });
  });
}

/* -------------------------------------------------------------- SCHREIBEN */
/* Wird aus savePdfCompatible() aufgerufen, nachdem die Datei erzeugt wurde.
 * Fehler beim Archivieren duerfen den PDF-Vorgang NIE abbrechen - das
 * Beweisdokument selbst ist wichtiger als sein Archiveintrag. */
function archivPdfAblegen(blob, meta) {
  meta = meta || {};
  if (!blob || meta.isBlank) return Promise.resolve(null);

  var jetzt = new Date();
  var eintrag = {
    id: 'a_' + jetzt.getTime() + '_' + Math.random().toString(36).slice(2, 8),
    nummer: meta.nummer || '',
    praefix: meta.praefix || 'PR',
    dateiname: meta.dateiname || 'Protokoll.pdf',
    erstellt: jetzt.toISOString(),
    pruefdatum: meta.pruefdatum || '',
    gebaeude: meta.gebaeude || '',
    pruefer: meta.pruefer || '',
    ergebnis: meta.ergebnis || '',
    maengel: meta.maengel || '',
    anzahl: meta.anzahl || 0,
    naechsterTermin: meta.naechsterTermin || '',
    appVersion: (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '',
    groesse: blob.size || 0,
    formState: meta.formState || null,
    blob: blob
  };

  return archivTx('readwrite', function (store) { store.put(eintrag); })
    .then(function () { return eintrag; })
    .catch(function (e) { console.warn('[Archiv] Ablegen fehlgeschlagen:', e); return null; });
}

/* ---------------------------------------------------------------- LESEN */
function archivAlle() {
  return archivDbOeffnen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(ARCHIV_STORE, 'readonly');
      var req = tx.objectStore(ARCHIV_STORE).getAll();
      req.onsuccess = function () {
        db.close();
        var liste = req.result || [];
        liste.sort(function (a, b) { return String(b.erstellt).localeCompare(String(a.erstellt)); });
        resolve(liste);
      };
      req.onerror = function () { db.close(); reject(req.error); };
    });
  }).catch(function (e) { console.warn('[Archiv] Lesen fehlgeschlagen:', e); return []; });
}

function archivHolen(id) {
  return archivDbOeffnen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(ARCHIV_STORE, 'readonly');
      var req = tx.objectStore(ARCHIV_STORE).get(id);
      req.onsuccess = function () { db.close(); resolve(req.result || null); };
      req.onerror = function () { db.close(); reject(req.error); };
    });
  }).catch(function () { return null; });
}

function archivLoeschen(ids) {
  var liste = Array.isArray(ids) ? ids : [ids];
  return archivTx('readwrite', function (store) {
    liste.forEach(function (id) { store.delete(id); });
  }).catch(function (e) { console.warn('[Archiv] Löschen fehlgeschlagen:', e); });
}

function archivAnzahl() {
  return archivDbOeffnen().then(function (db) {
    return new Promise(function (resolve) {
      var tx = db.transaction(ARCHIV_STORE, 'readonly');
      var req = tx.objectStore(ARCHIV_STORE).count();
      req.onsuccess = function () { db.close(); resolve(req.result || 0); };
      req.onerror = function () { db.close(); resolve(0); };
    });
  }).catch(function () { return 0; });
}

/* ------------------------------------------------- METADATEN AUS FORMULAR */
/* Die Angaben werden aus dem gerade ausgefuellten Formular gelesen. Dadurch
 * muessen die drei Generatoren nur Nummer, Typ und Dateiname mitgeben. */
function archivFeld(id) {
  var el = document.getElementById(id);
  return el ? String(el.value || '').trim() : '';
}

function archivMetaSammeln(praefix, nummer, dateiname, isBlank) {
  var typ = archivTyp(praefix);
  var anzahl = 0;
  if (praefix === 'PR') anzahl = document.querySelectorAll('.circuit-card').length;
  else if (praefix === 'GP') anzahl = document.querySelectorAll('#devicesContainer .feed-card').length;
  else if (praefix === 'AP') anzahl = document.querySelectorAll('.feed-card').length;

  var formState = null;
  try {
    var roh = typ.autosave ? localStorage.getItem(typ.autosave) : null;
    if (roh) formState = JSON.parse(roh);
  } catch (e) { formState = null; }

  return {
    praefix: praefix,
    nummer: nummer || '',
    dateiname: dateiname || '',
    isBlank: !!isBlank,
    pruefdatum: archivFeld('datum'),
    gebaeude: archivFeld('gebaeude_custom') || archivFeld('anlage_bez') || archivFeld('veranstaltung'),
    pruefer: archivFeld('pruefer'),
    maengel: archivFeld('res_maengel'),
    ergebnis: archivFeld('res_gewaehrleistung') || archivFeld('res_freigabe'),
    naechsterTermin: archivFeld('res_termin_date'),
    anzahl: anzahl,
    formState: formState
  };
}

/* ------------------------------------------------------------- DARSTELLUNG */
function archivDatumKurz(isoOderDeutsch) {
  var s = String(isoOderDeutsch || '');
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return m[3] + '.' + m[2] + '.' + m[1];
  return s;
}

function archivMonatLabel(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return 'Ohne Datum';
  var monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                'August', 'September', 'Oktober', 'November', 'Dezember'];
  return monate[d.getMonth()] + ' ' + d.getFullYear();
}

function archivGroesse(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

/* Beanstandet oder in Ordnung? Grundlage ist die Gesamtbewertung im Formular. */
function archivStatus(eintrag) {
  var m = String(eintrag.maengel || '');
  var frei = String(eintrag.ergebnis || '');
  if (/^keine/i.test(m) && frei !== 'Nein') return { text: 'i. O.', bg: '#dcfce7', fg: '#166534' };
  if (/behoben/i.test(m)) return { text: 'behoben', bg: '#fef9c3', fg: '#854d0e' };
  if (m) return { text: 'Mängel', bg: '#fef2f2', fg: '#991b1b' };
  return { text: 'ohne Angabe', bg: '#f1f5f9', fg: '#475569' };
}

/* ----------------------------------------------------------- PDF AUSGEBEN */
function archivPdfOeffnen(eintrag) {
  var url = URL.createObjectURL(eintrag.blob);
  var fenster = window.open(url, '_blank');
  if (!fenster) {
    // Popup-Blocker oder installierte App ohne neues Fenster -> Download
    archivPdfHerunterladen(eintrag);
  }
  setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
}

function archivPdfHerunterladen(eintrag) {
  var url = URL.createObjectURL(eintrag.blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = eintrag.dateiname || 'Protokoll.pdf';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 60000);
}

function archivPdfTeilen(eintraege) {
  var liste = Array.isArray(eintraege) ? eintraege : [eintraege];
  if (typeof File === 'undefined' || !navigator.share) {
    liste.forEach(archivPdfHerunterladen);
    return Promise.resolve(false);
  }
  var dateien = liste.map(function (e) {
    return new File([e.blob], e.dateiname || 'Protokoll.pdf', { type: 'application/pdf' });
  });
  if (!navigator.canShare || !navigator.canShare({ files: dateien })) {
    liste.forEach(archivPdfHerunterladen);
    return Promise.resolve(false);
  }
  return navigator.share({ files: dateien, title: dateien.length === 1 ? dateien[0].name : 'Prüfprotokolle' })
    .then(function () { return true; })
    .catch(function () { return false; });
}

/* ============================================================================
 *  ERNEUT PRÜFEN: ALTES PROTOKOLL ALS VORLAGE
 * ----------------------------------------------------------------------------
 *  Uebernommen werden nur BESCHREIBENDE Angaben (Anlagen-/Geraetebezeichnung,
 *  Standort, Schutzklasse, Leitungslaenge, Sicherung ...). Jeder Messwert,
 *  jede Sicht- und Funktionsbewertung, alle Unterschriften und das
 *  Gesamtergebnis werden GELEERT.
 *
 *  Das ist bewusst streng gehalten: ein uebernommener Messwert waere eine
 *  Messung, die nie stattgefunden hat. Lieber ein Feld zu viel neu ausfuellen.
 * ========================================================================== */

/* Felder, die in KEINEM Fall uebernommen werden (Namensmuster). */
var ARCHIV_CLEAR_MUSTER = /(rpe|riso|iso|ableit|zs|z_s|^ik$|imess|^ta$|^re$|^uf$|durchgang|schleife|spannung|strom|zeit|messwert|sicht|funktion|drehfeld|ergebnis|bemerk|plakette|gewaehrleistung|freigabe|maengel|unterschrift|signatur|termin|heizleistung)/i;

function archivWertLeeren(wert) {
  if (typeof wert === 'boolean') return false;
  if (Array.isArray(wert)) return wert.map(function () { return ''; });
  return '';
}

function archivStateAlsVorlage(state) {
  if (!state || typeof state !== 'object') return null;
  var kopie = JSON.parse(JSON.stringify(state));

  Object.keys(kopie).forEach(function (key) {
    var wert = kopie[key];
    if (Array.isArray(wert)) {
      kopie[key] = wert.map(function (eintrag) {
        if (eintrag && typeof eintrag === 'object') {
          Object.keys(eintrag).forEach(function (k) {
            if (ARCHIV_CLEAR_MUSTER.test(k)) eintrag[k] = archivWertLeeren(eintrag[k]);
          });
          return eintrag;
        }
        return '';   // z. B. die Sichtprüfungs-Liste
      });
      return;
    }
    if (ARCHIV_CLEAR_MUSTER.test(key)) kopie[key] = archivWertLeeren(wert);
  });

  // Nummer und Datum gehoeren zur neuen Pruefung, nicht zur alten.
  kopie.protokollnummer = '';
  kopie.datum = '';
  return kopie;
}

/* Schreibt die bereinigte Vorlage in den Zwischenspeicher des passenden
 * Formulars und liefert die Zieldatei zurueck. */
function archivVorlageUebernehmen(eintrag) {
  var typ = archivTyp(eintrag.praefix);
  if (!typ.autosave || !eintrag.formState) return null;
  var vorlage = archivStateAlsVorlage(eintrag.formState);
  if (!vorlage) return null;
  try {
    localStorage.setItem(typ.autosave, JSON.stringify(vorlage));
    localStorage.setItem('vde_vorlage_hinweis', JSON.stringify({
      quelle: eintrag.nummer, typ: eintrag.praefix, zeit: new Date().toISOString()
    }));
  } catch (e) { return null; }
  return typ.datei;
}

/* ---------------------------------------------------------------------------
 *  HINWEIS IM FORMULAR, WENN AUS EINER VORLAGE GEOEFFNET WURDE
 * ---------------------------------------------------------------------------
 *  Ohne diesen Hinweis waere am Formular nicht erkennbar, dass die Angaben aus
 *  einer frueheren Pruefung stammen - und warum die Messfelder leer sind.
 * ------------------------------------------------------------------------ */
function archivVorlageHinweisAnzeigen() {
  var roh;
  try { roh = localStorage.getItem('vde_vorlage_hinweis'); } catch (e) { return; }
  if (!roh) return;

  var info;
  try { info = JSON.parse(roh); } catch (e) { return; }
  var typ = archivTyp(info.typ);
  if (location.pathname.indexOf(typ.datei) === -1) return;
  try { localStorage.removeItem('vde_vorlage_hinweis'); } catch (e) {}

  var box = document.createElement('div');
  box.className = 'vorlage-hinweis';
  box.innerHTML = '<strong>Aus Vorlage ' + (info.quelle || 'einem Archivprotokoll') + ' angelegt.</strong> ' +
    'Übernommen wurden nur die beschreibenden Angaben. Sämtliche Messwerte, Sicht- und ' +
    'Funktionsbewertungen sowie das Gesamtergebnis sind leer und müssen neu erfasst werden. ' +
    'Die Protokollnummer wird neu vergeben.';
  var ziel = document.querySelector('.app-container');
  var kopf = ziel && ziel.querySelector('.header-bar');
  if (kopf && kopf.nextSibling) ziel.insertBefore(box, kopf.nextSibling);
  else if (ziel) ziel.insertBefore(box, ziel.firstChild);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', archivVorlageHinweisAnzeigen);
}
