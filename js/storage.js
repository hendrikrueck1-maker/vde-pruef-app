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
    pruefer: "",
    messgeraet: "Fluke 1663",
    seriennummer: "SN-1663-98214",
    kalibriert_bis: "",
    ort: "Konstanz"
  };
}

function saveMasterData(showNotification = false) {
  const data = {
    auftraggeber: document.getElementById('m_auftraggeber').value,
    gebaeude: document.getElementById('m_gebaeude').value,
    vnb: document.getElementById('m_vnb').value,
    pruefer: document.getElementById('m_pruefer').value,
    messgeraet: document.getElementById('m_messgeraet').value,
    seriennummer: document.getElementById('m_seriennummer').value,
    kalibriert_bis: document.getElementById('m_kalibriert_bis')?.value || '',
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
  document.getElementById('m_pruefer').value = data.pruefer || '';
  document.getElementById('m_messgeraet').value = data.messgeraet || '';
  document.getElementById('m_seriennummer').value = data.seriennummer || '';
  if (document.getElementById('m_kalibriert_bis')) document.getElementById('m_kalibriert_bis').value = data.kalibriert_bis || '';
  document.getElementById('m_ort').value = data.ort || '';
}

// NULL-SICHER, DA VERSCHIEDENE PROTOKOLLTYPEN NUR EINE TEILMENGE DIESER FELDER BESITZEN
function applyMasterDataToForm() {
  const data = getMasterData();
  const setIfPresent = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setIfPresent('auftraggeber', data.auftraggeber || '');
  if (document.getElementById('gebaeude_select')) syncGebaeudeSelect(data.gebaeude || 'Gr. Haus');
  setIfPresent('vnb', data.vnb || '');
  setIfPresent('pruefer', data.pruefer || '');
  setIfPresent('messgeraet', data.messgeraet || '');
  setIfPresent('seriennummer', data.seriennummer || '');
  setIfPresent('kalibriert_bis', data.kalibriert_bis || '');
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
const PROTOKOLL_PRAEFIXE = { PR: 'Prüfprotokoll', AP: 'Anschlussprüfung', GP: 'Geräteprüfung' };

function updateProtokollCounter(forceNew, praefix = 'PR') {
  if (!PROTOKOLL_PRAEFIXE[praefix]) praefix = 'PR';

  const today = new Date().toISOString().split('T')[0];
  const dateKey = `vde_last_date_${praefix}`;
  const cntKey = `vde_counter_${praefix}`;

  const lastDate = localStorage.getItem(dateKey);
  let counter = parseInt(localStorage.getItem(cntKey) || '0', 10);

  if (lastDate !== today) {
    counter = 1;
  } else if (forceNew) {
    counter += 1;
  } else if (counter === 0) {
    counter = 1;
  }

  localStorage.setItem(dateKey, today);
  localStorage.setItem(cntKey, counter);
  return `${praefix}-${today}-${String(counter).padStart(3, '0')}`;
}

function initProtokollNummer(praefix = 'PR') {
  const elem = document.getElementById('protokollnummer');
  if (elem) elem.value = updateProtokollCounter(false, praefix);
}

function neuesProtokoll() {
  if (!confirm('Neues Formular anlegen? Alle aktuell eingetragenen Daten in diesem Formular (Stromkreise, Prüfergebnisse, Unterschriften) werden zurückgesetzt.')) return;

  const nr = updateProtokollCounter(true);
  resetVdeForm();
  document.getElementById('protokollnummer').value = nr;
  clearAutosave();
  alert(`Neues Protokoll angelegt: ${nr}`);
}

/* ============================================================================
 *  DATENSICHERUNG (Export / Import)
 * ----------------------------------------------------------------------------
 *  Sichert alle App-Daten (Stammdaten, Protokollzähler, Zwischenspeicher)
 *  in eine JSON-Datei. Wichtig auf iPad/iPhone: iOS kann den Browserspeicher
 *  nach längerer Nichtnutzung löschen.
 * ========================================================================== */
function sammleAppDaten() {
  const daten = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.indexOf('vde_') === 0) daten[key] = localStorage.getItem(key);
  }
  return {
    typ: 'vde-pruefprotokoll-backup',
    version: (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '?',
    erstellt: new Date().toISOString(),
    daten: daten
  };
}

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
      const anzahl = Object.keys(obj.daten).length;
      if (!confirm('Sicherung vom ' + String(obj.erstellt).slice(0, 10) + ' einspielen?\n' +
                   anzahl + ' Einträge werden überschrieben.')) return;
      Object.keys(obj.daten).forEach(function (k) { localStorage.setItem(k, obj.daten[k]); });
      alert('Sicherung eingespielt. Die Seite wird neu geladen.');
      location.reload();
    } catch (e) {
      alert('Datei konnte nicht gelesen werden: ' + e.message);
    }
  };
  reader.readAsText(file);
}
