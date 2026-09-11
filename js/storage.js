// STAMMDATEN LOGIK (LOCALSTORAGE)

/* ---------------------------------------------------------------------------
 *  5.0.0: ZENTRALE, ABGESICHERTE localStorage.setItem()-HÜLLE
 * ----------------------------------------------------------------------------
 *  VORHER: Jede Stelle im Code rief localStorage.setItem() entweder ganz
 *  ungeschützt auf (z. B. saveMasterData() - ein voller Speicher warf hier
 *  eine unbehandelte Exception) oder fing Fehler mit "catch (e) {}" ohne
 *  jede Meldung ab. Beides führte dazu, dass ein voller localStorage
 *  (Browser-Limit typischerweise 5-10 MB pro Domain) STILL zu Datenverlust
 *  führte: der Autosave schlug fehl, ohne dass die Nutzerin es bemerkte.
 *
 *  JETZT: sicherSetItem() ist die einzige Stelle, die tatsächlich
 *  localStorage.setItem() aufruft. Bei einem QuotaExceededError (oder jedem
 *  anderen Fehler) wird EINMAL pro Sitzung eine deutliche Warnung angezeigt
 *  ("Speicher voll - Änderungen werden nicht mehr gespeichert!") und der
 *  Fehler zusätzlich in der Konsole protokolliert, statt ihn stillschweigend
 *  zu verschlucken. Rückgabewert: true bei Erfolg, false bei Fehler - Aufrufer
 *  können das optional auswerten, müssen es aber nicht (die Warnung erscheint
 *  in jedem Fall automatisch). */
let SPEICHER_VOLL_GEMELDET = false;

function sicherSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error('[VDE-App] localStorage.setItem fehlgeschlagen für Schlüssel "' + key + '":', e);
    if (!SPEICHER_VOLL_GEMELDET) {
      SPEICHER_VOLL_GEMELDET = true;
      const hinweis = 'ACHTUNG: Der Speicher dieses Browsers ist voll (oder blockiert). ' +
        'Neue Änderungen an diesem Protokoll oder den Stammdaten werden NICHT mehr ' +
        'gespeichert, bis Speicherplatz frei wird!\n\n' +
        'Empfehlung: Fertige Prüfungen jetzt als PDF exportieren, danach unter ' +
        '"Offene Prüfungen" bzw. im Archiv nicht mehr benötigte alte Entwürfe löschen.';
      if (typeof showNotification === 'function') {
        showNotification(hinweis, 'error');
      }
      // Zusätzlich als Dialog, da eine verpasste Statusleisten-Meldung hier
      // besonders teuer wäre (stiller Datenverlust) - bewusst redundant.
      // sicherSetItem() selbst bleibt synchron (wird an sehr vielen Stellen
      // im Code aufgerufen) - appAlert() daher bewusst NICHT awaited, das
      // Promise wird ignoriert ("fire and forget"), niemand wartet auf die
      // Bestaetigung dieser Meldung.
      try { appAlert(hinweis); } catch (e2) {}
    }
    return false;
  }
}

/* Felder, die applyMasterDataToForm() aus den zentralen Stammdaten setzt.
 * WICHTIG: Ein wiederhergestellter Autosave-/Archiv-Zwischenstand darf einen
 * LEEREN Wert in diesen Feldern nicht ueber den gerade frisch aus den
 * zentralen Stammdaten uebernommenen Wert schreiben - sonst verschwindet
 * z. B. der Hausanschluss/die Seriennummer wieder, sobald ein aelterer
 * Autosave-Stand (der diese Angabe noch nicht enthielt) restauriert wird.
 * Diese Liste wird von allen drei restore*State()-Funktionen genutzt, um
 * genau das zu verhindern - siehe dort. */
// [7.2.0, Nutzerwunsch #11] "adresse" ist bewusst NICHT als eigene Feld-ID
// aufgenommen: die drei Pruefformulare haben (wie schon vorher) nur ein
// einzeiliges Freitextfeld "auftraggeber" - dort landet die Adresse bereits
// im Text mit (siehe applyMasterDataToForm() unten und
// fillExampleDataStamm() in pdf-generator.js, die dasselbe Muster nutzt).
// Ein zusaetzliches eigenes Adressfeld je Formular haette PDF-Layout und
// Formularstruktur aller drei Protokolle veraendert - das war nicht verlangt,
// die Adresse muss nur in den zentralen Stammdaten erfasst werden koennen.
// [7.4.0, Punkt 8] 'seriennummer' (EIN gemeinsames Feld fuer beide Geraete)
// bleibt als Alt-/Kompatibilitaetsfeld bestehen (aeltere Sicherungen/bereits
// gespeicherte Stammdaten nutzen nur dieses), zusaetzlich gibt es jetzt zwei
// GETRENNTE Seriennummern: Installationstester (Fluke 1663, fuer
// vde0100.html/anschlusspruefung.html) und Geraetetester (Fluke 6500-2, fuer
// geraetepruefung.html) - siehe applyMasterDataToForm() unten, wo je nach
// Formulartyp die passende Nummer in das gemeinsame Formularfeld
// "seriennummer" uebernommen wird.
const MASTERDATA_FIELD_IDS = ['auftraggeber', 'vnb', 'hausanschluss', 'pruefer', 'pruefer_qualifikation', 'messgeraet', 'seriennummer', 'unterschrift_ort'];

function getMasterData() {
  const saved = localStorage.getItem('vde_master_data');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  // [Befund N2, 6.0.0] Vorher standen hier erfundene Beispieldaten
  // ("Stadttheater Konstanz", "Fluke 1663" usw.) als stiller Default. Ein
  // Nutzer, der die Stammdaten noch nie ausgefuellt hat, bekam damit
  // Fantasiewerte in echte Pruefprotokolle gedruckt, ohne das zu merken.
  // Jetzt: alle Defaults leer, Struktur/Keys unveraendert.
  return {
    auftraggeber: "",
    adresse: "",
    gebaeude: "",
    vnb: "",
    hausanschluss: "",
    pruefer: "",
    pruefer_qualifikation: "",
    messgeraet: "",
    seriennummer: "",
    // [7.4.0, Punkt 8] Getrennte Seriennummern je Pruefgeraet.
    seriennummer_installationstester: "",
    seriennummer_geraetetester: "",
    ort: ""
  };
}

/* 5.0.0: Parameter umbenannt (vorher "showNotification") - der alte Name
 * verdeckte innerhalb dieser Funktion die gleichnamige globale Funktion
 * showNotification() aus pdf-utils.js, wodurch sicherSetItem() bei einem
 * vollen Speicher hier keine Warnung hätte anzeigen können. */
async function saveMasterData(erfolgMelden = false) {
  const data = {
    auftraggeber: document.getElementById('m_auftraggeber').value,
    adresse: document.getElementById('m_adresse')?.value || '',
    gebaeude: document.getElementById('m_gebaeude').value,
    vnb: document.getElementById('m_vnb').value,
    hausanschluss: document.getElementById('m_hausanschluss')?.value || '',
    pruefer: document.getElementById('m_pruefer').value,
    pruefer_qualifikation: document.getElementById('m_pruefer_qualifikation')?.value || '',
    messgeraet: document.getElementById('m_messgeraet')?.value || '',
    seriennummer: document.getElementById('m_seriennummer')?.value || '',
    // [7.4.0, Punkt 8] Getrennte Seriennummern je Pruefgeraet.
    seriennummer_installationstester: document.getElementById('m_seriennummer_installationstester')?.value || '',
    seriennummer_geraetetester: document.getElementById('m_seriennummer_geraetetester')?.value || '',
    // [8.0.0, Teil 6.2] Getrennte, frei editierbare Geraetenamen je Pruefgeraet
    // (vorher fest im Label-Text einprogrammiert).
    geraet_installationstester: document.getElementById('m_geraet_installationstester')?.value || '',
    geraet_geraetetester: document.getElementById('m_geraet_geraetetester')?.value || '',
    ort: document.getElementById('m_ort').value
  };
  // 5.0.0: sicherSetItem() statt direktem localStorage.setItem() - siehe
  // Erläuterung am Dateianfang. Vorher konnte ein voller Speicher hier eine
  // unbehandelte Exception werfen (BUG #1 aus der 4.7.2-Prüfung).
  const ok = sicherSetItem('vde_master_data', JSON.stringify(data));
  if (erfolgMelden && ok) await appAlert("Zentrale Stammdaten erfolgreich gespeichert!");
}

function loadMasterDataToDashboard() {
  const data = getMasterData();
  document.getElementById('m_auftraggeber').value = data.auftraggeber || '';
  if (document.getElementById('m_adresse')) document.getElementById('m_adresse').value = data.adresse || '';
  // [7.2.0, Nutzerwunsch #13] Standard-Gebaeude/Bereich jetzt ueber ein
  // Auswahlfeld mit vordefinierten Spielstaetten + "Sonstiges..." (analog zu
  // gebaeude_select in den einzelnen Formularen) statt eines reinen
  // Freitextfelds - syncMasterGebaeudeSelect() haelt Auswahl und tatsaechlich
  // gespeicherten Freitextwert synchron.
  if (document.getElementById('m_gebaeude_select')) syncMasterGebaeudeSelect(data.gebaeude || 'Gr. Haus');
  else document.getElementById('m_gebaeude').value = data.gebaeude || '';
  document.getElementById('m_vnb').value = data.vnb || '';
  if (document.getElementById('m_hausanschluss')) document.getElementById('m_hausanschluss').value = data.hausanschluss || '';
  document.getElementById('m_pruefer').value = data.pruefer || '';
  if (document.getElementById('m_pruefer_qualifikation')) document.getElementById('m_pruefer_qualifikation').value = data.pruefer_qualifikation || '';
  if (document.getElementById('m_messgeraet')) document.getElementById('m_messgeraet').value = data.messgeraet || '';
  if (document.getElementById('m_seriennummer')) document.getElementById('m_seriennummer').value = data.seriennummer || '';
  // [7.4.0, Punkt 8] Getrennte Seriennummern je Pruefgeraet.
  if (document.getElementById('m_seriennummer_installationstester')) document.getElementById('m_seriennummer_installationstester').value = data.seriennummer_installationstester || '';
  if (document.getElementById('m_seriennummer_geraetetester')) document.getElementById('m_seriennummer_geraetetester').value = data.seriennummer_geraetetester || '';
  // [8.0.0, Teil 6.2] Getrennte, frei editierbare Geraetenamen je Pruefgeraet.
  // Vorbelegung mit den bisherigen Fluke-Standardnamen, falls noch keine
  // Stammdaten gespeichert wurden (erster Aufruf / neue Installation).
  if (document.getElementById('m_geraet_installationstester')) document.getElementById('m_geraet_installationstester').value = data.geraet_installationstester || 'Fluke 1663';
  if (document.getElementById('m_geraet_geraetetester')) document.getElementById('m_geraet_geraetetester').value = data.geraet_geraetetester || 'Fluke 6500-2';
  document.getElementById('m_ort').value = data.ort || '';
}

// NULL-SICHER, DA VERSCHIEDENE PROTOKOLLTYPEN NUR EINE TEILMENGE DIESER FELDER BESITZEN
function applyMasterDataToForm() {
  const data = getMasterData();
  const setIfPresent = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  // [7.2.0, Nutzerwunsch #11] Die drei Pruefformulare haben nur EIN
  // einzeiliges Feld "Auftraggeber / Prüfort" - die separat erfasste Adresse
  // wird deshalb an den Auftraggeber-Namen angehaengt (gleiches Muster wie
  // in fillExampleDataStamm(), siehe pdf-generator.js), statt ein eigenes
  // Adressfeld in jedem der drei Formulare/PDFs zu ergaenzen.
  const auftraggeberMitAdresse = data.adresse
    ? (data.auftraggeber || '') + (data.auftraggeber ? ', ' : '') + data.adresse
    : (data.auftraggeber || '');
  setIfPresent('auftraggeber', auftraggeberMitAdresse);
  if (document.getElementById('gebaeude_select')) syncGebaeudeSelect(data.gebaeude || 'Gr. Haus');
  setIfPresent('vnb', data.vnb || '');
  setIfPresent('hausanschluss', data.hausanschluss || '');
  setIfPresent('pruefer', data.pruefer || '');
  setIfPresent('pruefer_qualifikation', data.pruefer_qualifikation || '');
  // [7.4.0, Punkt 8 + 8.0.0, Teil 6.2] Je nach Formulartyp den passenden,
  // getrennt erfassten Geraetenamen UND die passende Seriennummer in die
  // gemeinsamen Formularfelder "Verwendetes Prüfgerät"/"Seriennummer
  // Messgerät" uebernehmen: Installationstester fuer Anlagen-/
  // Anschlusspruefung, Geraetetester fuer die Geraetepruefung. Erkennung
  // ueber dieselbe Container-ID wie in infokarten.js (zusatzIconsEinbinden) -
  // eindeutig pro Formulartyp vorhanden. Ist noch kein getrennter Name/keine
  // getrennte Nummer erfasst, faellt der Wert auf das alte gemeinsame Feld
  // "messgeraet"/"seriennummer" zurueck (Rueckwaertskompatibilitaet mit vor
  // 7.4.0/8.0.0 gespeicherten Stammdaten).
  const istGeraetepruefungsformular = !!document.getElementById('devicesContainer');
  const passenderGeraetename = istGeraetepruefungsformular
    ? (data.geraet_geraetetester || data.messgeraet || '')
    : (data.geraet_installationstester || data.messgeraet || '');
  const passendeSeriennummer = istGeraetepruefungsformular
    ? (data.seriennummer_geraetetester || data.seriennummer || '')
    : (data.seriennummer_installationstester || data.seriennummer || '');
  setIfPresent('messgeraet', passenderGeraetename);
  setIfPresent('seriennummer', passendeSeriennummer);
  setIfPresent('unterschrift_ort', data.ort || '');
}

/* ---------------------------------------------------------------------------
 *  [8.0.0, Teil 6.1] GEBÄUDE/BEREICH-VERWALTUNG (EIGENE EINTRÄGE HINZUFÜGEN)
 * ----------------------------------------------------------------------------
 *  Die Liste der Gebäude/Bereiche (Werkstatt, Spiegelhalle, ...) war bisher
 *  fest im HTML jeder der drei Formularseiten einprogrammiert - Änderungen
 *  waren nur durch einen Code-Eingriff möglich. Jetzt kann Hendrik über einen
 *  kleinen "Verwalten"-Button direkt neben dem Dropdown eigene Einträge
 *  hinzufügen oder wieder entfernen. Gespeichert wird EINE gemeinsame,
 *  zusätzliche Liste in localStorage (GEBAEUDE_ZUSATZ_KEY) - sie gilt
 *  einheitlich für alle drei Prüfformulare (nicht für die Startseite,
 *  index.html hat bewusst ihre eigene, unabhängige Liste). Die fünf
 *  eingebauten Standard-Einträge (Gr. Haus/Werkstatt/Spiegelhalle/
 *  Münsterplatz/Probebühne) bleiben als HTML-<option> bestehen und werden
 *  NICHT dupliziert - nur zusätzliche, von Hendrik selbst angelegte Einträge
 *  liegen in localStorage und werden dynamisch vor "Sonstiges..." eingefügt. */
const GEBAEUDE_ZUSATZ_KEY = 'vde_gebaeude_zusatz';

function gebaeudeZusatzListeLaden() {
  try {
    const roh = localStorage.getItem(GEBAEUDE_ZUSATZ_KEY);
    const liste = roh ? JSON.parse(roh) : [];
    return Array.isArray(liste) ? liste.filter(s => typeof s === 'string' && s.trim() !== '') : [];
  } catch (e) {
    console.error('[VDE-App] Gebäude-Zusatzliste konnte nicht gelesen werden:', e);
    return [];
  }
}

function gebaeudeZusatzListeSpeichern(liste) {
  sicherSetItem(GEBAEUDE_ZUSATZ_KEY, JSON.stringify(liste));
}

/* Ergänzt die im HTML fest vorhandenen <option>-Werte (alle außer "custom")
 * um die zusätzlichen, selbst angelegten Eintraege aus localStorage - jeweils
 * VOR der letzten Option ("Sonstiges..."), damit diese immer den Abschluss
 * bildet. Wird beim Laden jeder der drei Formularseiten sowie direkt nach
 * einer Aenderung im Verwalten-Dialog aufgerufen. Mehrfacher Aufruf ist
 * unschaedlich: bereits vorhandene Zusatz-Optionen (erkennbar an
 * data-gebaeude-zusatz) werden vorher entfernt und neu aufgebaut. */
function gebaeudeOptionenAktualisieren(selectId) {
  const select = document.getElementById(selectId || 'gebaeude_select');
  if (!select) return;
  const bisherigerWert = select.value;
  Array.from(select.querySelectorAll('option[data-gebaeude-zusatz]')).forEach(o => o.remove());
  const sonstigesOption = Array.from(select.options).find(o => o.value === 'custom');
  gebaeudeZusatzListeLaden().forEach(eintrag => {
    // Keine doppelten Eintraege, falls ein Zusatzeintrag zufaellig genauso
    // heisst wie einer der fest eingebauten.
    if (Array.from(select.options).some(o => o.value === eintrag)) return;
    const opt = document.createElement('option');
    opt.value = eintrag;
    opt.textContent = eintrag;
    opt.setAttribute('data-gebaeude-zusatz', '1');
    if (sonstigesOption) select.insertBefore(opt, sonstigesOption);
    else select.appendChild(opt);
  });
  if (Array.from(select.options).some(o => o.value === bisherigerWert)) select.value = bisherigerWert;
}

/* Baut den Verwalten-Dialog auf: Liste der aktuellen Zusatz-Einträge mit
 * je einem Löschen-Button, plus ein Eingabefeld zum Hinzufügen. Die fünf
 * eingebauten Standard-Einträge sind absichtlich NICHT löschbar (sie sind
 * Teil des HTML, nicht dieser Liste) - nur selbst hinzugefügte Einträge
 * lassen sich wieder entfernen. selectId: das Dropdown, das nach dem
 * Schliessen aktualisiert werden soll (jede der drei Formularseiten ruft
 * dies mit ihrer eigenen 'gebaeude_select' auf - alle teilen sich dieselbe
 * ID, daher reicht ein einziger Parameter). */
function gebaeudeVerwaltenOeffnen(selectId) {
  const dialog = document.createElement('dialog');
  dialog.className = 'app-dialog gebaeude-verwalten-dialog';

  const titel = document.createElement('div');
  titel.className = 'app-dialog-text';
  titel.innerHTML = '<strong>Gebäude / Bereiche verwalten</strong><br>' +
    '<span style="font-weight:normal; font-size:0.82rem;">Gilt einheitlich für alle drei Prüfformulare.</span>';
  dialog.appendChild(titel);

  const liste = document.createElement('div');
  liste.className = 'gebaeude-verwalten-liste';
  dialog.appendChild(liste);

  function listeNeuZeichnen() {
    liste.innerHTML = '';
    const eintraege = gebaeudeZusatzListeLaden();
    if (eintraege.length === 0) {
      const leer = document.createElement('div');
      leer.className = 'gebaeude-verwalten-leer';
      leer.textContent = 'Noch keine eigenen Einträge angelegt.';
      liste.appendChild(leer);
    }
    eintraege.forEach((eintrag, i) => {
      const zeile = document.createElement('div');
      zeile.className = 'gebaeude-verwalten-zeile';
      const label = document.createElement('span');
      label.textContent = eintrag;
      const entfernenBtn = document.createElement('button');
      entfernenBtn.type = 'button';
      entfernenBtn.className = 'btn-danger btn-klein';
      entfernenBtn.textContent = 'Entfernen';
      entfernenBtn.addEventListener('click', () => {
        const aktuelle = gebaeudeZusatzListeLaden();
        aktuelle.splice(i, 1);
        gebaeudeZusatzListeSpeichern(aktuelle);
        listeNeuZeichnen();
      });
      zeile.appendChild(label);
      zeile.appendChild(entfernenBtn);
      liste.appendChild(zeile);
    });
  }
  listeNeuZeichnen();

  const hinzufuegenZeile = document.createElement('div');
  hinzufuegenZeile.className = 'gebaeude-verwalten-hinzufuegen';
  const neuEingabe = document.createElement('input');
  neuEingabe.type = 'text';
  neuEingabe.placeholder = 'z. B. Foyer, Werkstattbühne …';
  const hinzufuegenBtn = document.createElement('button');
  hinzufuegenBtn.type = 'button';
  hinzufuegenBtn.className = 'btn btn-secondary';
  hinzufuegenBtn.textContent = '+ Hinzufügen';
  function eintragHinzufuegen() {
    const wert = neuEingabe.value.trim();
    if (!wert) return;
    const aktuelle = gebaeudeZusatzListeLaden();
    if (!aktuelle.includes(wert)) {
      aktuelle.push(wert);
      gebaeudeZusatzListeSpeichern(aktuelle);
      listeNeuZeichnen();
    }
    neuEingabe.value = '';
    neuEingabe.focus();
  }
  hinzufuegenBtn.addEventListener('click', eintragHinzufuegen);
  neuEingabe.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); eintragHinzufuegen(); } });
  hinzufuegenZeile.appendChild(neuEingabe);
  hinzufuegenZeile.appendChild(hinzufuegenBtn);
  dialog.appendChild(hinzufuegenZeile);

  const aktionen = document.createElement('div');
  aktionen.className = 'app-dialog-aktionen';
  const schliessenBtn = document.createElement('button');
  schliessenBtn.type = 'button';
  schliessenBtn.className = 'btn';
  schliessenBtn.textContent = 'Fertig';
  function schliessenUndAktualisieren() {
    gebaeudeOptionenAktualisieren(selectId);
    if (dialog.open) dialog.close();
    dialog.remove();
  }
  schliessenBtn.addEventListener('click', schliessenUndAktualisieren);
  aktionen.appendChild(schliessenBtn);
  dialog.appendChild(aktionen);

  dialog.addEventListener('cancel', schliessenUndAktualisieren);
  document.body.appendChild(dialog);
  dialog.showModal();
  setTimeout(() => neuEingabe.focus(), 0);
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

/* [7.2.0, Nutzerwunsch #13] Gleiches Auswahl/Freitext-Muster wie
 * toggleGebaeudeCustom()/syncGebaeudeSelect() oben, aber fuer die zentralen
 * Stammdaten auf der Hauptseite (index.html, Felder m_gebaeude_select /
 * m_gebaeude) statt fuer ein einzelnes Formular. Getrennt gehalten, damit
 * eine kuenftige Aenderung an einem der beiden Orte den anderen nicht
 * versehentlich mit veraendert. */
function toggleMasterGebaeudeCustom(val) {
  const customInput = document.getElementById('m_gebaeude');
  if (val === 'custom') {
    customInput.style.display = 'block';
    customInput.value = '';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = val;
  }
}

function syncMasterGebaeudeSelect(value) {
  const select = document.getElementById('m_gebaeude_select');
  const customInput = document.getElementById('m_gebaeude');
  if (!select || !customInput) return;
  const presetValues = Array.from(select.options).map(o => o.value).filter(v => v !== 'custom');

  customInput.value = value;
  if (presetValues.includes(value)) {
    select.value = value;
    customInput.style.display = 'none';
  } else {
    select.value = 'custom';
    customInput.style.display = value ? 'block' : 'none';
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
  sicherSetItem(VERGEBENE_NUMMERN_KEY, JSON.stringify(liste));
}

/* Vor dem Erzeugen eines ausgefuellten PDF aufrufen. Liefert false, wenn die
 * Nutzerin die Doppelvergabe NICHT bestaetigt hat. */
async function protokollNummerFreigeben(nummer) {
  if (!istNummerVergeben(nummer)) return true;
  return await appConfirm(
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
    sicherSetItem(k.dateKey, datum);
    sicherSetItem(k.cntKey, String(nr));
  } else if (nr > aktuell) {
    sicherSetItem(k.cntKey, String(nr));
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
/* 4.7.0: Das fertige PDF SCHLIESST die Pruefung nicht mehr ab - das
 * Formular bleibt bearbeitbar (siehe pdf-utils.js savePdfCompatible: ein
 * erneuter Export ersetzt einfach die zuvor heruntergeladene Datei). Wer
 * hier "OK" waehlt, legt bewusst einen NEUEN Entwurf fuer die naechste
 * Anlage an - der gerade abgeschlossene Entwurf bleibt unter "Offene
 * Prüfungen" bestehen und ist weiterhin aufrufbar (z. B. um doch noch eine
 * Korrektur zu drucken). setzeAktivenEntwurf ist eine der drei
 * formular-spezifischen Funktionen (siehe pdf-generator.js,
 * anschluss-generator.js, geraete-generator.js), die AKTUELLER_ENTWURF_ID
 * neu setzen. */
async function nachPdfNeuesFormularAnbieten(praefix, nummerAlt, resetFn, clearFn, setzeAktivenEntwurf) {
  var naechste = naechsteProtokollNummer(praefix);
  var neu = await appConfirm(
    'Protokoll ' + (nummerAlt || '') + ' wurde erstellt.\n\n' +
    'Neues Formular für die nächste Anlage anlegen?\n\n' +
    'OK: Neuer, leerer Entwurf für die nächste Anlage. Die nächste Nummer ist ' +
    naechste + '. Das gerade erstellte Protokoll bleibt unter "Offene Prüfungen" erhalten.\n' +
    'Abbrechen: im aktuellen Formular weiterarbeiten - ein erneutes PDF ersetzt einfach das gerade erstellte.');
  if (!neu) { protokollNummerNachPdf(praefix); return false; }
  verbraucheProtokollNummer(naechste, praefix);
  if (typeof setzeAktivenEntwurf === 'function') setzeAktivenEntwurf();
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

/* 4.7.0: "Neues Formular" LEGT EINEN NEUEN ENTWURF AN, statt den aktuellen
 * zu ueberschreiben - der bisherige Entwurf bleibt unter "Offene Prüfungen"
 * bestehen und ist jederzeit wieder aufrufbar (siehe entwuerfe.js). Das
 * Formular auf dem Bildschirm wird trotzdem sofort zurueckgesetzt, damit
 * direkt an der naechsten Anlage weitergearbeitet werden kann.
 *
 * 4.7.0: Der Protokollzaehler wird jetzt HIER verbraucht (nicht mehr erst
 * beim fertigen PDF) - ein Klick auf "Neues Formular" ist der Moment, in dem
 * die Nutzerin bewusst zur naechsten Anlage wechselt, und genau dann soll
 * die Nummer weiterzaehlen. */
async function neuesProtokoll() {
  if (!await appConfirm('Neues Formular anlegen? Das aktuelle Formular bleibt unter "Offene Prüfungen" erhalten und kann dort später fortgesetzt werden.')) return;

  const nr = naechsteProtokollNummer('PR');
  /* 5.0.0 (BUG #2 aus der 4.7.2-Prüfung): Reihenfolge getauscht - der Entwurf
   * wird jetzt ZUERST angelegt, die Nummer erst DANACH verbraucht. Vorher
   * konnte ein Absturz/Browser-Crash zwischen den beiden Aufrufen die Nummer
   * verbrauchen, ohne dass ein Entwurf entstand ("Nummerierungslücke"). In
   * dieser Reihenfolge existiert der Entwurf bereits, bevor die Nummer als
   * vergeben gilt - im ungünstigsten Fall bleibt ein leerer Entwurf ohne
   * verbrauchte Nummer zurück, was harmlos ist (kann gelöscht werden),
   * statt einer nicht mehr nachvollziehbaren Lücke in der Nummerierung. */
  AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('PR');
  verbraucheProtokollNummer(nr, 'PR');
  resetVdeForm();
  document.getElementById('protokollnummer').value = nr;
  autosaveProtocol();
  await appAlert(`Neues Protokoll angelegt: ${nr}`);
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
      if (localStorage.getItem(neu) === null) sicherSetItem(neu, wert);
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
  reader.onload = async function () {
    try {
      const obj = JSON.parse(String(reader.result));
      if (!obj || obj.typ !== 'vde-pruefprotokoll-backup' || !obj.daten) {
        await appAlert('Das ist keine gültige Sicherungsdatei dieser App.');
        return;
      }
      const bericht = beschreibeSicherung(obj.daten);
      if (!await appConfirm('Sicherung vom ' + String(obj.erstellt).slice(0, 10) +
                   ' (App-Version ' + obj.version + ') einspielen?\n\n' + bericht +
                   '\nVorhandene Daten auf diesem Gerät werden überschrieben.')) return;
      Object.keys(obj.daten).forEach(function (k) { sicherSetItem(k, obj.daten[k]); });
      // Sicherungen aelterer Versionen bringen die alten Autosave-Schluessel mit
      migriereAutosaveSchluessel();
      await appAlert('Sicherung eingespielt:\n\n' + bericht + '\nDie Seite wird neu geladen.');
      location.reload();
    } catch (e) {
      await appAlert('Datei konnte nicht gelesen werden: ' + e.message);
    }
  };
  reader.readAsText(file);
}
