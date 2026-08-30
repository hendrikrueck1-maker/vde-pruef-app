// STAMMDATEN LOGIK (LOCALSTORAGE)
function getMasterData() {
  const saved = localStorage.getItem('vde_master_data');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return {
    auftraggeber: "Stadttheater Konstanz, Inselgasse 2-6, 78462 Konstanz",
    gebaeude: "Gr. Haus",
    vnb: "Stadtwerke Konstanz",
    hausanschluss: "",
    pruefer: "",
    messgeraet: "Fluke 1663",
    seriennummer: "SN-1663-98214",
    ort: "Konstanz"
  };
}

function saveMasterData(showNotification = false) {
  const data = {
    auftraggeber: document.getElementById('m_auftraggeber').value,
    gebaeude: document.getElementById('m_gebaeude').value,
    vnb: document.getElementById('m_vnb').value,
    hausanschluss: document.getElementById('m_hausanschluss')?.value || '',
    pruefer: document.getElementById('m_pruefer').value,
    messgeraet: document.getElementById('m_messgeraet').value,
    seriennummer: document.getElementById('m_seriennummer').value,
    ort: document.getElementById('m_ort').value
  };
  localStorage.setItem('vde_master_data', JSON.stringify(data));
  if (showNotification) alert("Zentrale Stammdaten erfolgreich gespeichert!");
}

function loadMasterDataToDashboard() {
  const data = getMasterData();
  document.getElementById('m_auftraggeber').value = data.auftraggeber || '';
  document.getElementById('m_gebaeude').value = data.gebaeude || '';
  document.getElementById('m_vnb').value = data.vnb || '';
  if (document.getElementById('m_hausanschluss')) document.getElementById('m_hausanschluss').value = data.hausanschluss || '';
  document.getElementById('m_pruefer').value = data.pruefer || '';
  document.getElementById('m_messgeraet').value = data.messgeraet || '';
  document.getElementById('m_seriennummer').value = data.seriennummer || '';
  document.getElementById('m_ort').value = data.ort || '';
}

// NULL-SICHER, DA VERSCHIEDENE PROTOKOLLTYPEN NUR EINE TEILMENGE DIESER FELDER BESITZEN
function applyMasterDataToForm() {
  const data = getMasterData();
  const setIfPresent = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setIfPresent('auftraggeber', data.auftraggeber || '');
  if (document.getElementById('gebaeude_select')) syncGebaeudeSelect(data.gebaeude || 'Gr. Haus');
  setIfPresent('vnb', data.vnb || '');
  setIfPresent('hausanschluss', data.hausanschluss || '');
  setIfPresent('pruefer', data.pruefer || '');
  setIfPresent('messgeraet', data.messgeraet || '');
  setIfPresent('seriennummer', data.seriennummer || '');
  setIfPresent('unterschrift_ort', data.ort || '');
}

function toggleGebaeudeCustom(val) {
  const customInput = document.getElementById('gebaeude_custom');
  if (val === 'custom') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = val;
  }
}

// HÄLT DAS SICHTBARE DROPDOWN UND DAS TATSÄCHLICH VERWENDETE FELD SYNCHRON
function syncGebaeudeSelect(value) {
  const select = document.getElementById('gebaeude_select');
  const customInput = document.getElementById('gebaeude_custom');
  const presetValues = Array.from(select.options).map(o => o.value).filter(v => v !== 'custom');

  customInput.value = value;
  if (presetValues.includes(value)) {
    select.value = value;
    customInput.style.display = 'none';
  } else {
    select.value = 'custom';
    customInput.style.display = 'block';
  }
}

// GEMEINSAME ZÄHLER-LOGIK FÜR initProtokollNummer() UND neuesProtokoll(),
// DAMIT BEIDE PFADE DEN TAGESWECHSEL GLEICH BEHANDELN.
//
// WICHTIG: Zaehler und Datum werden JE PROTOKOLLTYP gefuehrt. Zuvor teilten sich
// alle drei Formulare die Keys 'vde_counter'/'vde_last_date' und gaben immer das
// Praefix "PR-" aus. Folge: ein Pruefprotokoll, eine Anschlusspruefung und eine
// Geraetepruefung, die am selben Tag erstellt wurden, trugen alle dieselbe Nummer
// (z. B. PR-2026-08-11-001). Damit war kein Dokument mehr eindeutig identifizierbar.
const PROTOKOLL_PRAEFIXE = { PR: 'Prüfprotokoll', AP: 'Anschlussprüfung', GP: 'Geräteprüfung', EB: 'Errichterbescheinigung' };

/* WANN WIRD EINE NUMMER VERBRAUCHT?
 * Frueher beim Oeffnen des Formulars. Wer das Formular schloss, neu lud oder
 * die App neu startete, bekam dieselbe Nummer erneut - zwei verschiedene
 * Anlagen konnten so unter identischer Nummer dokumentiert werden.
 *
 * Jetzt gilt: Beim Oeffnen wird die naechste freie Nummer nur VORGESCHLAGEN.
 * Verbraucht (= Zaehler hochgesetzt) wird sie erst, wenn tatsaechlich ein
 * ausgefuelltes PDF entstanden ist. Das Leerformular verbraucht nie eine Nummer.
 * Der gespeicherte Zaehler bedeutet damit: "zuletzt VERBRAUCHTE Nummer". */

function protokollZaehlerKeys(praefix) {
  if (!PROTOKOLL_PRAEFIXE[praefix]) praefix = 'PR';
  return { praefix: praefix, dateKey: `vde_last_date_${praefix}`, cntKey: `vde_counter_${praefix}` };
}

// Naechste freie Nummer BERECHNEN, ohne etwas zu speichern (reiner Vorschlag).
function naechsteProtokollNummer(praefix = 'PR') {
  const k = protokollZaehlerKeys(praefix);
  // Lokales Datum (heuteIso aus pdf-utils.js): toISOString() liefert UTC und
  // haette einer Pruefung um 00:30 Uhr die Nummer des Vortags gegeben.
  const today = (typeof heuteIso === 'function') ? heuteIso() : new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem(k.dateKey);
  const counter = parseInt(localStorage.getItem(k.cntKey) || '0', 10);
  // Tageswechsel setzt die laufende Nummer zurueck.
  const naechste = (lastDate !== today) ? 1 : counter + 1;
  return `${k.praefix}-${today}-${String(naechste).padStart(3, '0')}`;
}

/* Rueckwaertskompatibel: aeltere Aufrufe von updateProtokollCounter() liefern
 * weiterhin eine Nummer, verbrauchen sie aber nicht mehr. Der Parameter
 * forceNew hat dadurch keine Wirkung mehr und bleibt nur der Signatur wegen
 * erhalten. */
function updateProtokollCounter(forceNew, praefix = 'PR') {
  return naechsteProtokollNummer(praefix);
}

/* --- Liste der tatsaechlich vergebenen Nummern ---------------------------
 * Dient der Doppelvergabe-Warnung. Bewusst eine schlichte Liste in
 * localStorage: sie muss nur "kenne ich diese Nummer schon?" beantworten. */
const VERGEBENE_NUMMERN_KEY = 'vde_vergebene_nummern';
const VERGEBENE_NUMMERN_MAX = 500;

function ladeVergebeneNummern() {
  try {
    const roh = localStorage.getItem(VERGEBENE_NUMMERN_KEY);
    const liste = roh ? JSON.parse(roh) : [];
    return Array.isArray(liste) ? liste : [];
  } catch (e) { return []; }
}

function istNummerVergeben(nummer) {
  return !!nummer && ladeVergebeneNummern().indexOf(nummer) !== -1;
}

function merkeVergebeneNummer(nummer) {
  if (!nummer) return;
  const liste = ladeVergebeneNummern();
  if (liste.indexOf(nummer) !== -1) return;
  liste.push(nummer);
  // aelteste Eintraege verwerfen, damit der Speicher nicht unbegrenzt waechst
  while (liste.length > VERGEBENE_NUMMERN_MAX) liste.shift();
  try { localStorage.setItem(VERGEBENE_NUMMERN_KEY, JSON.stringify(liste)); } catch (e) {}
}

/* Vor dem Erzeugen eines ausgefuellten PDF aufrufen. Liefert false, wenn die
 * Nutzerin die Doppelvergabe NICHT bestaetigt hat. */
function protokollNummerFreigeben(nummer) {
  if (!istNummerVergeben(nummer)) return true;
  return confirm(
    `Die Protokollnummer ${nummer} wurde in dieser App bereits für ein fertiges PDF vergeben.\n\n` +
    `Zwei Protokolle mit derselben Nummer sind nicht mehr eindeutig zuzuordnen.\n\n` +
    `Trotzdem fortfahren?`);
}

/* Nach dem erfolgreichen Erzeugen eines ausgefuellten PDF aufrufen:
 * Zaehler auf diese Nummer setzen und sie als vergeben vermerken. */
function verbraucheProtokollNummer(nummer, praefix = 'PR') {
  merkeVergebeneNummer(nummer);

  // Von Hand geaenderte Nummern (abweichendes Format) duerfen den Zaehler
  // nicht durcheinanderbringen - sie werden nur in der Liste vermerkt.
  const m = /^([A-Z]{2})-(\d{4}-\d{2}-\d{2})-(\d{1,4})$/.exec(String(nummer || '').trim());
  if (!m) return;

  const k = protokollZaehlerKeys(m[1]);
  if (k.praefix !== m[1]) return;

  const datum = m[2];
  const nr = parseInt(m[3], 10);
  const lastDate = localStorage.getItem(k.dateKey);
  const aktuell = parseInt(localStorage.getItem(k.cntKey) || '0', 10);

  if (lastDate !== datum) {
    localStorage.setItem(k.dateKey, datum);
    localStorage.setItem(k.cntKey, String(nr));
  } else if (nr > aktuell) {
    localStorage.setItem(k.cntKey, String(nr));
  }
}

/* Nach dem PDF: naechste freie Nummer ins Feld setzen und kurz melden. */
function protokollNummerNachPdf(praefix = 'PR') {
  const elem = document.getElementById('protokollnummer');
  if (!elem) return;
  const naechste = naechsteProtokollNummer(praefix);
  elem.value = naechste;
  // Zwischenstand mitziehen, sonst stuende nach einem Neuladen wieder die
  // bereits verbrauchte Nummer im Formular.
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  if (typeof showNotification === 'function') {
    showNotification(`Nummer vergeben. Nächstes Protokoll: ${naechste}`, 'success');
  }
}

/* ---------------------------------------------------------------------------
 *  NACH DEM FERTIGEN PDF: NEUES FORMULAR ANBIETEN
 * ---------------------------------------------------------------------------
 *  Frueher wurde nur die naechste Nummer eingesetzt und "Naechstes Protokoll:
 *  PR-...-002" gemeldet. Das liest sich wie "bereit fuer die naechste
 *  Pruefung" - tatsaechlich standen aber saemtliche Messwerte, Sicht-
 *  bewertungen und Bemerkungen der gerade abgeschlossenen Pruefung
 *  unveraendert im Formular. Wer nicht ausdruecklich "+ Neues Formular"
 *  drueckte, dokumentierte die naechste Verteilung mit den Werten der
 *  vorherigen.
 * ------------------------------------------------------------------------ */
function nachPdfNeuesFormularAnbieten(praefix, nummerAlt, resetFn, clearFn) {
  var naechste = naechsteProtokollNummer(praefix);
  var neu = confirm(
    'Protokoll ' + (nummerAlt || '') + ' wurde erstellt.\n\n' +
    'Neues Formular für die nächste Anlage anlegen?\n\n' +
    'OK: Formular zurücksetzen, alle Messwerte werden gelöscht. Die nächste Nummer ist ' +
    naechste + '.\n' +
    'Abbrechen: im aktuellen Formular weiterarbeiten - die Messwerte dieser Prüfung bleiben stehen.');
  if (!neu) { protokollNummerNachPdf(praefix); return false; }
  if (typeof clearFn === 'function') clearFn();
  if (typeof resetFn === 'function') resetFn();
  var el = document.getElementById('protokollnummer');
  if (el) el.value = naechste;
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  if (typeof showNotification === 'function') {
    showNotification('Neues Formular angelegt: ' + naechste, 'success');
  }
  return true;
}

/* Beim Oeffnen: nur vorschlagen. Ein vorhandener Autosave-Stand ueberschreibt
 * den Vorschlag anschliessend mit seiner eigenen Nummer (siehe restore*State),
 * damit ein wiederhergestelltes Formular seine urspruengliche Nummer behaelt. */
function initProtokollNummer(praefix = 'PR') {
  const elem = document.getElementById('protokollnummer');
  if (elem) elem.value = naechsteProtokollNummer(praefix);
}

function neuesProtokoll() {
  if (!confirm('Neues Formular anlegen? Alle aktuell eingetragenen Daten in diesem Formular (Stromkreise, Prüfergebnisse, Unterschriften) werden zurückgesetzt.')) return;

  const nr = naechsteProtokollNummer('PR');
  resetVdeForm();
  document.getElementById('protokollnummer').value = nr;
  clearAutosave();
  alert(`Neues Protokoll angelegt: ${nr}\n\nDie Nummer wird erst mit dem fertigen PDF verbraucht.`);
}

/* ============================================================================
 *  DATENSICHERUNG (Export / Import)
 * ----------------------------------------------------------------------------
 *  Sichert alle App-Daten (Stammdaten, Protokollzähler, Zwischenspeicher)
 *  in eine JSON-Datei. Wichtig auf iPad/iPhone: iOS kann den Browserspeicher
 *  nach längerer Nichtnutzung löschen.
 * ========================================================================== */
/* SICHERUNGS-FILTER
 * Frueher wurde nur auf 'vde_' gefiltert. Die Autosave-Schluessel der Geraete-
 * und Anschlusspruefung hiessen aber 'geraete_protocol_autosave' bzw.
 * 'anschluss_protocol_autosave' - genau diese beiden Zwischenstaende landeten
 * NIE in der Sicherung. Auf dem iPad, wo iOS den Browserspeicher loeschen kann
 * (der Grund fuer die Sicherung), gingen sie damit verloren.
 *
 * Ab 3.0.0 heissen alle Autosave-Schluessel einheitlich 'vde_autosave_*'
 * (siehe migriereAutosaveSchluessel). Die alten Praefixe bleiben im Filter als
 * Sicherheitsnetz stehen, damit auch Geraete mit noch nicht migriertem Stand
 * vollstaendig gesichert werden. */
const BACKUP_PRAEFIXE = ['vde_', 'geraete_', 'anschluss_'];

function sammleAppDaten() {
  const daten = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    for (let p = 0; p < BACKUP_PRAEFIXE.length; p++) {
      if (key.indexOf(BACKUP_PRAEFIXE[p]) === 0) { daten[key] = localStorage.getItem(key); break; }
    }
  }
  return {
    typ: 'vde-pruefprotokoll-backup',
    version: (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '?',
    erstellt: new Date().toISOString(),
    daten: daten
  };
}

/* ---------------------------------------------------------------------------
 *  EINMALIGE UMBENENNUNG DER AUTOSAVE-SCHLUESSEL AUF EIN EINHEITLICHES PRAEFIX
 * ---------------------------------------------------------------------------
 *  Laeuft beim Laden jeder Seite, bevor ein Formular seinen Zwischenstand
 *  liest. Vorhandene Staende werden umkopiert und der alte Schluessel entfernt;
 *  ist der neue Schluessel schon belegt, gewinnt der neue (dann wurde bereits
 *  mit der neuen Version gearbeitet). Danach ist der Aufruf wirkungslos.
 * ------------------------------------------------------------------------ */
const AUTOSAVE_UMBENENNUNGEN = [
  ['vde_protocol_autosave', 'vde_autosave_pr'],
  ['anschluss_protocol_autosave', 'vde_autosave_ap'],
  ['geraete_protocol_autosave', 'vde_autosave_gp']
];

function migriereAutosaveSchluessel() {
  try {
    for (let i = 0; i < AUTOSAVE_UMBENENNUNGEN.length; i++) {
      const alt = AUTOSAVE_UMBENENNUNGEN[i][0];
      const neu = AUTOSAVE_UMBENENNUNGEN[i][1];
      const wert = localStorage.getItem(alt);
      if (wert === null) continue;
      if (localStorage.getItem(neu) === null) localStorage.setItem(neu, wert);
      localStorage.removeItem(alt);
    }
  } catch (e) { /* Speicher nicht verfuegbar - Autosave ist ohnehin best effort */ }
}

migriereAutosaveSchluessel();

function exportAppData() {
  const inhalt = JSON.stringify(sammleAppDaten(), null, 2);
  const blob = new Blob([inhalt], { type: 'application/json' });
  const name = 'VDE-Sicherung_' + new Date().toISOString().slice(0, 10) + '.json';

  const file = (typeof File !== 'undefined') ? new File([blob], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
    navigator.share({ files: [file], title: name }).catch(function () { downloadBlob(blob, name); });
    return;
  }
  downloadBlob(blob, name);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 30000);
}

/* Klartext-Bericht statt einer nackten Zahl: vor dem Einspielen soll erkennbar
 * sein, WAS in der Datei steckt - und hinterher, was wiederhergestellt wurde. */
function beschreibeSicherung(daten) {
  const hat = function (k) { return Object.prototype.hasOwnProperty.call(daten, k); };
  const zeilen = [];

  zeilen.push('• Stammdaten: ' + (hat('vde_master_data') ? 'ja' : 'nein'));

  const staende = [
    ['vde_autosave_pr', 'vde_protocol_autosave', 'Anlagenprüfung'],
    ['vde_autosave_ap', 'anschluss_protocol_autosave', 'Anschlussprüfung'],
    ['vde_autosave_gp', 'geraete_protocol_autosave', 'Geräteprüfung']
  ];
  const vorhanden = staende.filter(function (s) { return hat(s[0]) || hat(s[1]); })
                           .map(function (s) { return s[2]; });
  zeilen.push('• Zwischenstände: ' + vorhanden.length +
              (vorhanden.length ? ' (' + vorhanden.join(', ') + ')' : ''));

  const zaehler = Object.keys(PROTOKOLL_PRAEFIXE)
    .filter(function (p) { return hat('vde_counter_' + p); })
    .map(function (p) { return p + ': ' + daten['vde_counter_' + p]; });
  zeilen.push('• Protokollzähler: ' + (zaehler.length ? zaehler.join(', ') : 'keine'));

  if (hat(VERGEBENE_NUMMERN_KEY)) {
    let n = 0;
    try { n = (JSON.parse(daten[VERGEBENE_NUMMERN_KEY]) || []).length; } catch (e) {}
    zeilen.push('• Bereits vergebene Nummern: ' + n);
  }

  zeilen.push('• Einträge insgesamt: ' + Object.keys(daten).length);
  return zeilen.join('\n') + '\n';
}

function importAppData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const obj = JSON.parse(String(reader.result));
      if (!obj || obj.typ !== 'vde-pruefprotokoll-backup' || !obj.daten) {
        alert('Das ist keine gültige Sicherungsdatei dieser App.');
        return;
      }
      const bericht = beschreibeSicherung(obj.daten);
      if (!confirm('Sicherung vom ' + String(obj.erstellt).slice(0, 10) +
                   ' (App-Version ' + obj.version + ') einspielen?\n\n' + bericht +
                   '\nVorhandene Daten auf diesem Gerät werden überschrieben.')) return;
      Object.keys(obj.daten).forEach(function (k) { localStorage.setItem(k, obj.daten[k]); });
      // Sicherungen aelterer Versionen bringen die alten Autosave-Schluessel mit
      migriereAutosaveSchluessel();
      alert('Sicherung eingespielt:\n\n' + bericht + '\nDie Seite wird neu geladen.');
      location.reload();
    } catch (e) {
      alert('Datei konnte nicht gelesen werden: ' + e.message);
    }
  };
  reader.readAsText(file);
}
