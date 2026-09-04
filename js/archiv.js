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

/* [Befund N4, 6.0.0] Seit 4.7.0 gibt es pro Formulartyp keinen EINEN
 * Autosave-Schluessel mehr, sondern einen pro parallelem Entwurf
 * (autosaveKeyFuerEntwurf() in entwuerfe.js, aktueller Stand global in
 * AKTUELLER_ENTWURF_ID der jeweiligen *-generator.js-Datei). typ.autosave
 * (z. B. 'vde_autosave_pr') ist der ALTE, statische Schluessel - er wird nur
 * einmalig bei der Migration eines Alt-Standes befuellt und existiert danach
 * praktisch nie wieder. archivMetaSammeln() suchte bisher trotzdem dort und
 * fand nie einen Formularstand -> "Erneut pruefen (Vorlage)" scheiterte
 * IMMER, weil der Archiv-Eintrag ohne formState angelegt wurde.
 *
 * JETZT: bevorzugt wird der Autosave-Key des GERADE AKTIVEN Entwurfs gelesen
 * (autosaveKeyFuerEntwurf() + AKTUELLER_ENTWURF_ID sind auf jeder der drei
 * Formularseiten bereits vor archiv.js/den Generatoren geladen bzw. als
 * globale Variable gesetzt). Der alte statische Key bleibt als Fallback fuer
 * den Uebergangsfall, dass diese Funktionen aus irgendeinem Grund fehlen. */
function archivAktuellerAutosaveKey(praefix) {
  try {
    if (typeof autosaveKeyFuerEntwurf === 'function' && typeof AKTUELLER_ENTWURF_ID !== 'undefined' && AKTUELLER_ENTWURF_ID) {
      return autosaveKeyFuerEntwurf(praefix, AKTUELLER_ENTWURF_ID);
    }
  } catch (e) {}
  return null;
}

function archivMetaSammeln(praefix, nummer, dateiname, isBlank) {
  var typ = archivTyp(praefix);
  var anzahl = 0;
  if (praefix === 'PR') anzahl = document.querySelectorAll('.circuit-card').length;
  else if (praefix === 'GP') anzahl = document.querySelectorAll('#devicesContainer .feed-card').length;
  else if (praefix === 'AP') anzahl = document.querySelectorAll('.feed-card').length;

  // Aktueller Entwurf zuerst, alter statischer Key nur als Rueckfallebene.
  var autosaveKey = archivAktuellerAutosaveKey(praefix) || typ.autosave;

  var formState = null;
  try {
    var roh = autosaveKey ? localStorage.getItem(autosaveKey) : null;
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

/* ============================================================================
 *  ZIP-EXPORT (ab App-Version 4.6.0)
 * ----------------------------------------------------------------------------
 *  Alle archivierten PDFs eines Monats werden zu einer einzigen .zip-Datei
 *  gepackt und heruntergeladen. Zweck: bequemer Versand per E-Mail, ohne
 *  jedes PDF einzeln anhaengen zu muessen. Die PDFs liegen in der ZIP-Datei
 *  flach (kein Unterordner) und sind mit jedem Zip-Programm entpackbar.
 * ========================================================================== */

/* Schluessel im Format 'YYYY-MM', passend zur Sortierung von archivAlle(). */
function archivMonatSchluessel(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return 'ohne-datum';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

/* Liefert die im Archiv vorkommenden Monate als Liste { schluessel, label, anzahl },
 * neueste zuerst - fuer die Monatsauswahl im ZIP-Export. */
function archivMonateListe(eintraege) {
  var liste = eintraege || [];
  var karte = {};
  var reihenfolge = [];
  liste.forEach(function (e) {
    var schluessel = archivMonatSchluessel(e.erstellt);
    if (!karte[schluessel]) {
      karte[schluessel] = { schluessel: schluessel, label: archivMonatLabel(e.erstellt), anzahl: 0 };
      reihenfolge.push(schluessel);
    }
    karte[schluessel].anzahl++;
  });
  return reihenfolge.map(function (s) { return karte[s]; });
}

/* Macht aus einem Dateinamen einen innerhalb der ZIP-Datei eindeutigen Namen,
 * falls zwei Protokolle zufaellig denselben Dateinamen haetten. */
function archivZipEindeutigerName(name, vergeben) {
  var basis = name || 'Protokoll.pdf';
  var stamm = basis.replace(/\.pdf$/i, '');
  var endung = '.pdf';
  var kandidat = basis;
  var n = 2;
  while (vergeben[kandidat]) {
    kandidat = stamm + ' (' + n + ')' + endung;
    n++;
  }
  vergeben[kandidat] = true;
  return kandidat;
}

/* Packt alle Eintraege des angegebenen Monats (Schluessel 'YYYY-MM') zu einer
 * ZIP-Datei und stoesst den Download an. Gibt die Anzahl gepackter PDFs zurueck
 * (0 = nichts zu tun, ruft dann keinen Download auf). */
function archivZipMonatErstellen(monatSchluessel, alleEintraege) {
  if (typeof JSZip === 'undefined') {
    alert('ZIP-Funktion nicht verfügbar (JSZip nicht geladen). Bitte Seite neu laden.');
    return Promise.resolve(0);
  }
  var treffer = (alleEintraege || []).filter(function (e) {
    return archivMonatSchluessel(e.erstellt) === monatSchluessel;
  });
  if (!treffer.length) return Promise.resolve(0);

  var zip = new JSZip();
  var vergeben = {};
  treffer.forEach(function (e) {
    var name = archivZipEindeutigerName(e.dateiname, vergeben);
    zip.file(name, e.blob);
  });

  var monatLabel = treffer.length ? archivMonatLabel(treffer[0].erstellt) : monatSchluessel;
  var dateiname = 'VDE-Protokolle_' + monatSchluessel + '.zip';

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    .then(function (zipBlob) {
      var url = URL.createObjectURL(zipBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = dateiname;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 60000);
      return treffer.length;
    })
    .catch(function (err) {
      console.warn('[Archiv] ZIP-Erstellung fehlgeschlagen:', err);
      alert('Die ZIP-Datei konnte nicht erstellt werden: ' + (err && err.message ? err.message : err));
      return 0;
    });
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

/* ---------------------------------------------------------------------------
 *  WAS DARF UEBERNOMMEN WERDEN?  ->  POSITIVLISTE
 * ---------------------------------------------------------------------------
 *  Frueher stand hier ein AUSSCHLUSS-Muster ("alles, was nach Messwert
 *  aussieht, wird geleert"). Ein Ausschlussmuster laesst jedes Feld durch, an
 *  das beim Schreiben des Musters niemand gedacht hat - und genau das ist
 *  passiert: t_A, U_mess, Z_L-N, I_K2, die Erproben-Punkte, die komplette
 *  Gesamtbewertung (Maengel, Plakette, Gewaehrleistung, Bemerkungen) sowie
 *  Protokollnummer und Pruefdatum wanderten unbemerkt in die neue Pruefung.
 *  Der Hinweis im Formular behauptete gleichzeitig das Gegenteil.
 *
 *  Jetzt gilt die Umkehrung: WAS HIER NICHT STEHT, WIRD GELEERT. Ein spaeter
 *  ergaenztes Messfeld ist dadurch automatisch auf der sicheren Seite - es
 *  kann nur noch durch eine bewusste Ergaenzung dieser Liste uebernommen
 *  werden.
 *
 *  Aufgenommen sind ausschliesslich BESCHREIBENDE Angaben: wer, wo, welche
 *  Anlage, welche Leitung, welche Absicherung, welches Messgeraet. Alles,
 *  was ein ERGEBNIS ist (Messwert, i.O./n.i.O., Bewertung, Freigabe,
 *  Unterschrift, Datum, Protokollnummer), wird geleert.
 * ------------------------------------------------------------------------ */
var ARCHIV_UEBERNEHMEN = [
  /* --- Kopf- und Stammdaten (alle drei Protokolltypen) --- */
  'auftraggeber', 'gebaeude', 'gebaeude_custom', 'anlage_bez', 'veranstaltung',
  'pruefungsnummer', 'pruefer',
  'pruefnorm', 'pruefgrund', 'pruefart', 'pruefintervall',
  'netzsystem', 'einspeisung', 'einspeisung_art', 'einspeisung_sonstiges',
  'hausanschluss', 'vnb',
  'bereitsteller_ansprechpartner', 'bereitsteller_telefon',
  'uebergabe_standort', 'anschlussleistung_vertrag',
  'messgeraet', 'seriennummer',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'erdung_messpunkt', 'pa_messpunkt', 'unterschrift_ort',

  /* --- je Stromkreis (Anlagenpruefung) --- */
  'bez', 'kabel', 'leiter', 'qs', 'sich', 'rcd_typ', 'rcd_idn', 'art', 'gefaehrdung',

  /* Bewusst NICHT uebernommen: netzspannung / netzfrequenz (Anlagenpruefung)
   * und spannung / frequenz je Uebergabepunkt (Anschlusspruefung). Sie sehen
   * wie Nennwerte aus, sind aber bei Netzersatzanlagen und Wechselrichtern
   * echte Messwerte - das Formular weist die Frequenz dort ausdruecklich als
   * Pflicht-Messwert aus. Zwei Sekunden Nachtragen sind billiger als ein
   * uebernommener Messwert, der nie gemessen wurde. */

  /* --- je Geraet (Geraetepruefung): Typenschild- und Bauartangaben --- */
  'typ', 'invnr', 'schutzklasse', 'laenge', 'heizelement', 'heizleistung'
];

function archivWertLeeren(wert) {
  if (typeof wert === 'boolean') return false;
  if (Array.isArray(wert)) return wert.map(function () { return ''; });
  return '';
}

function archivUebernahmeErlaubt(key) {
  return ARCHIV_UEBERNEHMEN.indexOf(key) !== -1;
}

/* Geht rekursiv durch den gespeicherten Formularstand.
 * WICHTIG: Container werden DURCHLAUFEN, nicht bewertet. Der frueher hier
 * stehende Code stieg nur in Arrays ab - dadurch wurden state.fields und
 * state.erproben (beides einfache Objekte) nie angefasst und ihr kompletter
 * Inhalt unveraendert uebernommen. Bewertet wird immer nur der einzelne Wert
 * an seinem Schluessel. */
function archivVorlageBereinigen(knoten) {
  if (Array.isArray(knoten)) {
    return knoten.map(function (eintrag) {
      // Liste von Objekten (Stromkreise, Uebergabepunkte, Geraete): absteigen
      if (eintrag && typeof eintrag === 'object') return archivVorlageBereinigen(eintrag);
      // Liste von Einzelwerten (z. B. Sichtpruefungs-Ergebnisse): immer leeren
      return '';
    });
  }
  if (knoten && typeof knoten === 'object') {
    Object.keys(knoten).forEach(function (key) {
      var wert = knoten[key];
      if (wert && typeof wert === 'object') {
        knoten[key] = archivVorlageBereinigen(wert);
      } else if (!archivUebernahmeErlaubt(key)) {
        knoten[key] = archivWertLeeren(wert);
      }
    });
    return knoten;
  }
  return knoten;
}

function archivStateAlsVorlage(state) {
  if (!state || typeof state !== 'object') return null;
  var kopie = JSON.parse(JSON.stringify(state));
  /* Protokollnummer und Pruefdatum liegen in state.fields, nicht auf der
   * obersten Ebene. Sie stehen nicht in ARCHIV_UEBERNEHMEN und werden von
   * archivVorlageBereinigen() dadurch zuverlaessig geleert - anders als bei
   * der frueheren Zuweisung kopie.protokollnummer = '', die ins Leere lief. */
  return archivVorlageBereinigen(kopie);
}

/* Schreibt die bereinigte Vorlage in den Zwischenspeicher des passenden
 * Formulars und liefert die Zieldatei zurueck.
 *
 * [Befund N4, 6.0.0] Frueher landete die Vorlage im ALTEN, seit 4.7.0 nicht
 * mehr verwendeten statischen Autosave-Key (typ.autosave, z. B.
 * 'vde_autosave_pr'). Das Zielformular liest beim Start aber ausschliesslich
 * den Autosave-Key seines AKTIVEN Entwurfs (aktivenEntwurfSicherstellen() in
 * entwuerfe.js) - die Migration von typ.autosave greift dabei nur, wenn noch
 * gar kein aktiver Entwurf existiert. In der Praxis existiert nach der
 * ersten Nutzung immer schon einer, wodurch die Vorlage nie ankam und "Erneut
 * pruefen (Vorlage)" wirkungslos blieb.
 *
 * JETZT: es wird ein NEUER, eigener Entwurf angelegt (neuenEntwurfAnlegen()
 * aus entwuerfe.js, das archiv.html jetzt ebenfalls einbindet), die Vorlage
 * geht in dessen Autosave-Key, und dieser Entwurf wird sofort zum aktiven
 * Entwurf des Zielformulars gemacht. Ein eventuell noch offener Zwischenstand
 * bleibt dadurch unangetastet im Index stehen (Datenverlust vermieden), statt
 * ueberschrieben zu werden. */
function archivVorlageUebernehmen(eintrag) {
  var typ = archivTyp(eintrag.praefix);
  if (!eintrag.formState) return null;
  if (typeof neuenEntwurfAnlegen !== 'function' || typeof autosaveKeyFuerEntwurf !== 'function') return null;
  var vorlage = archivStateAlsVorlage(eintrag.formState);
  if (!vorlage) return null;
  try {
    var neueId = neuenEntwurfAnlegen(eintrag.praefix); // legt an UND macht ihn aktiv
    localStorage.setItem(autosaveKeyFuerEntwurf(eintrag.praefix, neueId), JSON.stringify(vorlage));
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
