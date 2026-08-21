// PRÜFUNG ELEKTRISCHER GERÄTE
// Grundlage: DIN EN 50678 (VDE 0701):2021-02 – "Allgemeines Verfahren zur Überprüfung
// der Wirksamkeit der Schutzmaßnahmen von Elektrogeräten nach Reparatur",
// DIN EN 50699 (VDE 0702):2021-06 – "Wiederholungsprüfung für elektrische Geräte".
// Hinweis zur Begrifflichkeit: Beide Normen sprechen von "elektrischen Geräten";
// der Begriff "ortsveränderliche Betriebsmittel" stammt aus der zurückgezogenen
// DIN VDE 0701-0702 und ist enger als der heutige Anwendungsbereich. Beide Normen ersetzen seit 21.09.2023
// die zurückgezogene DIN VDE 0701-0702:2008-06 (Grenzwerte für R_ISO/Ableitstrom inhaltlich
// unverändert übernommen; R_PE-Berechnung bei langen/großen Leitungsquerschnitten verschärft).
// Prüffrist frei wählbar (1/3/6 Monate, 1 oder 2 Jahre) je nach Einsatzbedingungen,
// vgl. Anlage 4 DGUV Information 203-070/203-072.

let cardCounter = 0;

function updateNaechsterTermin() {
  const monate = parseInt(document.getElementById('pruefintervall').value, 10);
  const next = new Date();
  next.setMonth(next.getMonth() + monate);
  // Lokale Monatsangabe: valueAsDate rechnet auch bei <input type="month"> in
  // UTC und lag in den ersten Stunden des Monats einen Monat daneben.
  document.getElementById('res_termin_date').value =
    next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0');
}

function addDeviceCard(data = {}) {
  cardCounter++;
  const container = document.getElementById('devicesContainer');
  const card = document.createElement('div');
  card.className = 'feed-card';
  card.id = `device_${cardCounter}`;

  card.innerHTML = `
    <div class="feed-header">
      <span>Gerät #${cardCounter}</span>
      <button type="button" class="btn-danger" onclick="removeCard('device_${cardCounter}')">Entfernen</button>
    </div>

    <div class="grid">
      <div class="form-group grid-full">
        <label>Bezeichnung / Verwendungszweck:</label>
        <input type="text" class="c-bez" value="${attrEsc(data.bez)}" placeholder="z. B. PAR-Scheinwerfer Lichtregie">
      </div>
      <div class="form-group">
        <label>Hersteller / Typ:</label>
        <input type="text" class="c-typ" value="${attrEsc(data.typ)}" placeholder="z. B. ADB, PAR64">
      </div>
      <div class="form-group">
        <label>Inventar- / Seriennummer:</label>
        <input type="text" class="c-invnr" value="${attrEsc(data.invnr)}" placeholder="z. B. INV-0231">
      </div>
      <div class="form-group">
        <label>Schutzklasse:</label>
        <select class="c-schutzklasse" id="sk_${cardCounter}" onchange="validateDeviceNorms(${cardCounter})">
          <option value="I"${!data.schutzklasse || data.schutzklasse === 'I' ? ' selected' : ''}>I (Schutzleiter)</option>
          <option value="II"${data.schutzklasse === 'II' ? ' selected' : ''}>II (Schutzisoliert)</option>
          <option value="III"${data.schutzklasse === 'III' ? ' selected' : ''}>III (Schutzkleinspannung)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Anschlussleitung Länge (m):</label>
        <input type="text" inputmode="decimal" class="c-laenge" value="${attrEsc(data.laenge)}" placeholder="z. B. 10" oninput="validateDeviceNorms(${cardCounter})">
      </div>
      <div class="form-group">
        <label class="checkbox-item" style="margin-top: 20px;">
          <input type="checkbox" class="c-heizelement" ${(data.heizelement || String(data.heizleistung || '').trim() !== '') ? 'checked' : ''} onchange="heizelementGeaendert(${cardCounter})"> Gerät mit Heizelement
        </label>
      </div>
      <div class="form-group">
        <label>Heizleistung (kW), falls Heizelement:</label>
        <input type="text" inputmode="decimal" class="c-heizleistung" value="${attrEsc(data.heizleistung)}" placeholder="z. B. 2.0" oninput="heizleistungGeaendert(${cardCounter})">
        <div class="limit-hint">Nach DIN EN 50699 darf der Schutzleiterstrom bei Heizleistung &gt; 3,5 kW auf 1 mA je kW steigen, höchstens 10 mA.</div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">1. Besichtigen</div>
      <div class="grid">
        <div class="form-group"><label>Gehäuse / Isolierung / Lüftungsschlitze:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option></select></div>
        <div class="form-group"><label>Anschlussleitung / Stecker / Zugentlastung:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option></select></div>
        <div class="form-group"><label>Kennzeichnung / Typenschild lesbar:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option></select></div>
        <div class="form-group"><label>Keine unsachgemäßen Reparaturen / Überhitzung:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option></select></div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">2. Erproben</div>
      <div class="grid">
        <div class="form-group"><label>Funktionsprüfung:</label><select class="c-funktion"><option>i.O.</option><option>n.i.O.</option></select></div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">3. Messen</div>
      <div class="grid">
        <div class="form-group">
          <label>R<sub>PE</sub> (&Omega;) <span class="limit-hint" id="rpe_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rpe" value="${attrEsc(data.rpe)}" placeholder="z. B. 0.20" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>R<sub>ISO</sub> (M&Omega;) <span class="limit-hint" id="riso_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-riso" value="${attrEsc(data.riso)}" placeholder="z. B. > 100" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Ableitstrom (mA) <span class="limit-hint" id="ableit_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-ableitstrom" value="${attrEsc(data.ableitstrom)}" placeholder="z. B. 0.3" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Messmethode Ableitstrom:</label>
          <select class="c-ableit-methode">
            <option>Ersatzableitstrom</option>
            <option>Differenzstrommessung</option>
            <option>Direktmessung Berührungsstrom</option>
          </select>
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);
  validateDeviceNorms(cardCounter);
}

/* Haekchen umgeschaltet: ohne Heizelement ist eine Heizleistung gegenstandslos
 * und wird geleert, damit keine widerspruechliche Angabe stehen bleibt. */
function heizelementGeaendert(cardId) {
  const card = document.getElementById(`device_${cardId}`);
  if (!card) return;
  const cb = card.querySelector('.c-heizelement');
  const feld = card.querySelector('.c-heizleistung');
  if (cb && feld && !cb.checked) feld.value = '';
  validateDeviceNorms(cardId);
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

/* Heizleistung eingetragen -> es handelt sich um ein Geraet mit Heizelement.
 * Das Haekchen wird mitgesetzt, damit R_ISO- und Ableitstrom-Grenzwert
 * zusammenpassen. */
function heizleistungGeaendert(cardId) {
  const card = document.getElementById(`device_${cardId}`);
  if (!card) return;
  const cb = card.querySelector('.c-heizelement');
  const feld = card.querySelector('.c-heizleistung');
  if (cb && feld && feld.value.trim() !== '') cb.checked = true;
  validateDeviceNorms(cardId);
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

function validateDeviceNorms(cardId) {
  const card = document.getElementById(`device_${cardId}`);
  if (!card) return;

  const schutzklasse = card.querySelector('.c-schutzklasse').value;
  const hatHeizelement = card.querySelector('.c-heizelement').checked;
  const laenge = card.querySelector('.c-laenge').value;
  const heizleistung = card.querySelector('.c-heizleistung')?.value;

  /* HEIZELEMENT UND HEIZLEISTUNG GEHOEREN ZUSAMMEN
   * Das Haekchen steuert den R_ISO-Grenzwert (DIN EN 50699), das Feld
   * Heizleistung den Ableitstrom-Grenzwert. Wer nur eines von beiden ausfuellt,
   * bekommt eine halb angepasste Bewertung.
   * Diese Funktion LIEST den Zustand nur - das Umschalten der beiden Felder
   * erledigen heizelementGeaendert()/heizleistungGeaendert(). Wuerde hier
   * beides gleichzeitig geregelt, haetten sich die Regeln gegenseitig
   * aufgehoben (Haekchen abwaehlen -> Feld noch gefuellt -> sofort wieder
   * gesetzt). */
  const heizCheckbox = card.querySelector('.c-heizelement');
  const heizLeistungElem = card.querySelector('.c-heizleistung');
  if (heizCheckbox && heizLeistungElem) {
    if (!heizCheckbox.checked) {
      heizLeistungElem.disabled = true;
      heizLeistungElem.required = false;
      heizLeistungElem.classList.remove('missing-value');
    } else {
      // Haekchen gesetzt -> Heizleistung ist Pflicht (sie veraendert den
      // zulaessigen Schutzleiterstrom)
      heizLeistungElem.disabled = false;
      heizLeistungElem.required = true;
      if (heizLeistungElem.value.trim() === '') heizLeistungElem.classList.add('missing-value');
      else heizLeistungElem.classList.remove('missing-value');
    }
  }
  const hatHeizelementJetzt = heizCheckbox ? heizCheckbox.checked : hatHeizelement;
  // Ohne Haekchen zaehlt eine (evtl. noch stehende) Heizleistung nicht mit.
  const heizleistungJetzt = heizCheckbox && heizCheckbox.checked ? heizleistung : '';

  /* R_PE NUR BEI SCHUTZKLASSE I
   * Schutzisolierte (SK II) und Schutzkleinspannungs-Geraete (SK III) haben
   * keinen Schutzleiter - ein R_PE-Grenzwert ist dort gegenstandslos. Frueher
   * wurde trotzdem einer eingeblendet. */
  const rpeElem = card.querySelector('.c-rpe');
  const rpeGilt = schutzklasse === 'I';
  const rpeMax = getRpeMaxDevice(laenge);
  const rpeLimitLabel = document.getElementById(`rpe_limit_${cardId}`);
  if (rpeLimitLabel) rpeLimitLabel.textContent = rpeGilt ? `[max. ${rpeMax.toFixed(2)} \u03A9]` : '[n.a. – kein Schutzleiter]';
  if (!rpeGilt) {
    rpeElem.value = '';
    rpeElem.disabled = true;
    rpeElem.placeholder = 'n.a.';
    rpeElem.classList.remove('out-of-norm');
  } else {
    rpeElem.disabled = false;
    rpeElem.placeholder = 'z. B. 0.20';
    if (rpeElem.value.trim() !== '') {
      const num = parseFloat(rpeElem.value.replace(',', '.'));
      if (!isNaN(num) && num > rpeMax) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
    } else rpeElem.classList.remove('out-of-norm');
  }

  const risoElem = card.querySelector('.c-riso');
  // Haekchen-Stand NACH der Kopplung verwenden, sonst weichen R_ISO- und
  // Ableitstrom-Grenzwert voneinander ab.
  const risoMin = getIsoMin(schutzklasse, hatHeizelementJetzt);
  const risoLimitLabel = document.getElementById(`riso_limit_${cardId}`);
  if (risoLimitLabel) risoLimitLabel.textContent = risoMin !== null ? `[min. ${risoMin} M\u03A9]` : '';
  if (risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseFloat(txt.replace(',', '.'));
      if (!isNaN(num) && risoMin !== null && num < risoMin) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else risoElem.classList.remove('out-of-norm');

  const ableitElem = card.querySelector('.c-ableitstrom');
  const ableitMax = getAbleitstromMax(schutzklasse, heizleistungJetzt);
  const ableitLimitLabel = document.getElementById(`ableit_limit_${cardId}`);
  if (ableitLimitLabel) {
    ableitLimitLabel.textContent = ableitMax !== null
      ? `[${getAbleitstromBezeichnung(schutzklasse)}, max. ${ableitMax} mA]` : '';
  }
  if (ableitElem.value.trim() !== '') {
    const num = parseFloat(ableitElem.value.replace(',', '.'));
    if (!isNaN(num) && ableitMax !== null && num > ableitMax) ableitElem.classList.add('out-of-norm'); else ableitElem.classList.remove('out-of-norm');
  } else ableitElem.classList.remove('out-of-norm');
}

function deviceHasOutOfNorm(card) {
  return Array.from(card.querySelectorAll('.c-rpe, .c-riso, .c-ableitstrom')).some(el => el.classList.contains('out-of-norm'));
}

function initSignaturePads() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    kunde: setupSignatureCanvas('sigKunde')
  };
}

function fillExampleDataGeraete() {
  document.getElementById('pruefungsnummer').value = 'GP-2026-033';
  document.getElementById('pruefer').value = 'Max Mustermann (Elektrofachkraft)';
  document.getElementById('pruefintervall').value = '12';
  updateNaechsterTermin();
  document.getElementById('res_bemerkungen').value = 'Alle geprüften Geräte in einwandfreiem Zustand. Keine Mängel festgestellt.';

  document.getElementById('devicesContainer').innerHTML = '';
  cardCounter = 0;
  addDeviceCard({ bez: 'PAR-Scheinwerfer Lichtregie', typ: 'ADB PAR64', invnr: 'INV-0231', schutzklasse: 'I', laenge: '10', rpe: '0.22', riso: '> 100', ableitstrom: '0.3' });
  addDeviceCard({ bez: 'Verlängerungskabel 25m', typ: 'H07RN-F 3G2.5', invnr: 'INV-0455', schutzklasse: 'I', laenge: '25', rpe: '0.48', riso: '> 200', ableitstrom: '0.1' });
}

// KOPFDATEN. Der Titel folgt jetzt dem Sprachgebrauch der geltenden Normen:
// DIN EN 50678/50699 sprechen von "elektrischen Geräten", nicht mehr von
// "ortsveränderlichen Betriebsmitteln" (Begriff der zurueckgezogenen VDE 0701-0702).
const GERAETE_KOPF = {
  titel: "PRÜFUNG ELEKTRISCHER GERÄTE",
  normzeile: "Wiederholungsprüfung nach DIN EN 50699 (VDE 0702) / Prüfung nach Reparatur nach DIN EN 50678 (VDE 0701)"
};
const GERAETE_REVISION = "Formular Rev. 2026-08 · Normstand: DIN EN 50678:2021-02 · DIN EN 50699:2021-06";

function generatePDFGeraete(isBlank = false) {
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung -> Abbruch vor dem Aufbau des PDF.
   * Gilt nie fuer das Leerformular. */
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(
      ['.c-sicht-item', '.c-funktion', '.c-ableit-methode', '#res_maengel',
       '#res_plakette', '#res_gewaehrleistung']);
    if (offeneAuswahl) { offeneBewertungMelden(offeneAuswahl); return; }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    alert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Doppelvergabe: wurde diese Nummer in dieser App schon einmal fuer ein
   * fertiges PDF verwendet, muss das ausdruecklich bestaetigt werden. */
  const nummerRoh = isBlank ? '' : (document.getElementById('protokollnummer')?.value || '').trim();
  if (!isBlank && !protokollNummerFreigeben(nummerRoh)) return;

  /* Ohne einen einzigen Pruefling gibt es nichts zu bewerten. */
  if (!isBlank && document.querySelectorAll('#devicesContainer .feed-card').length === 0) {
    keinePrueflingeMelden('Gerät');
    return;
  }

  /* Mindestangaben eines ausgefuellten Protokolls. */
  if (!isBlank) {
    const fehlend = erstesLeerePflichtfeld(['datum', 'pruefer', 'auftraggeber']);
    if (fehlend) { pflichtfeldMelden(fehlend); return; }
  }

  /* Heizelement ohne Heizleistung: der zulaessige Schutzleiterstrom haengt nach
   * DIN EN 50699 von der Heizleistung ab. Ohne sie wuerde gegen 3,5 mA statt
   * gegen den hoeheren zulaessigen Wert geprueft - das Ergebnis waere falsch. */
  if (!isBlank) {
    const ohneLeistung = Array.from(document.querySelectorAll('#devicesContainer .feed-card'))
      .map((c, i) => ({ nr: i + 1, c }))
      .filter(o => o.c.querySelector('.c-heizelement')?.checked &&
                   String(o.c.querySelector('.c-heizleistung')?.value || '').trim() === '');
    if (ohneLeistung.length) {
      alert('Bei Gerät ' + ohneLeistung.map(o => '#' + o.nr).join(', ') +
            ' ist "Heizelement" angekreuzt, aber keine Heizleistung eingetragen.\n\n' +
            'Der zulässige Schutzleiterstrom hängt nach DIN EN 50699 von der Heizleistung ab. ' +
            'Ohne diese Angabe wäre die Bewertung des Ableitstroms nicht belastbar.\n\n' +
            'Das PDF wurde deshalb nicht erstellt.');
      ohneLeistung[0].c.querySelector('.c-heizleistung')?.focus();
      return;
    }
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const primaryColor = [0, 51, 102];
  const textColor = [15, 23, 42];
  const boxBorder = [203, 213, 225];
  const tableHeaderBg = [226, 232, 240];
  const redCellText = [153, 27, 27];

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: [254, 226, 226], textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const getVal = (id, defaultBlank = "____________________") => {
    if (isBlank) return defaultBlank;
    const elem = document.getElementById(id);
    if (!elem) return defaultBlank;
    const val = elem.value ? elem.value.trim() : "";
    return val ? cleanStr(val) : defaultBlank;
  };

  const feldWert = (id) => {
    if (isBlank) return '';
    const el = document.getElementById(id);
    return el && el.value.trim() ? cleanStr(el.value.trim()) : '';
  };

  const formatDatum = (isoDate) => {
    if (!isoDate) return "";
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [jahr, monat, tag] = parts;
    return `${tag}.${monat}.${jahr}`;
  };

  const protokollNr = getVal('protokollnummer', "GP-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");
  const datum = isBlank ? "" : (formatDatum(document.getElementById('datum').value) || "");
  const naechsterTermin = isBlank ? "" : formatDatum(document.getElementById('res_termin_date').value);
  const ort = getVal('unterschrift_ort', "Konstanz");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // Im Leerformular bleiben die Kopf-Felder leer -> dort erscheinen Schreiblinien
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  // Auch im AUSGEFUELLTEN Protokoll darf kein Ausfuell-Platzhalter stehen: ist
  // die Prueflings-ID leer, zeichnet kopfFeld() dort eine Schreiblinie.
  const kopfPruefNr = isBlank ? "" : feldWert('pruefungsnummer');

  drawProtokollHeader(doc, GERAETE_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN ---------------------------------------------
   * Kompakt: 5 Zeilen je Spalte. Protokoll-Nr. und Prueflings-ID stehen in
   * der Kopfbox oben rechts und werden hier nicht wiederholt. */
  const ZA = 4.6;
  const SEK1_H = 31;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN & PRÜFART", kat: 'stamm' });

  doc.setFontSize(7.2);
  const spL = 13, spR = 107, spB = 90;

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    return sn ? `${g} (SN ${sn})` : g;
  })();

  const pruefintervallSelect = document.getElementById('pruefintervall');
  const pruefintervallText = isBlank
    ? ''
    : cleanStr(pruefintervallSelect.options[pruefintervallSelect.selectedIndex].text);

  const z1 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Auftraggeber:",     feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",  feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",       feldWert('pruefer'),         spL, z1(2), spB, isBlank);
  // Kalibrierung zum Pruefzeitpunkt abgelaufen -> Zeile rot; der Hinweis
  // erscheint zusaetzlich im Freigabetext (KALIBRIERUNG_HINWEIS_PDF).
  const isKalAbgelaufen = !isBlank &&
    kalibrierungAbgelaufen(document.getElementById('kalibriert_bis')?.value,
                           document.getElementById('datum')?.value);
  if (isKalAbgelaufen) { doc.setTextColor(...PDF_RED_TEXT); doc.setFont("helvetica", "bold"); }
  drawFeldZeile(doc, "Prüfgerät:",        messgeraetText,              spL, z1(3), spB, isBlank);
  if (isKalAbgelaufen) { doc.setTextColor(...PDF_TEXT); doc.setFont("helvetica", "normal"); }
  // Kalibriergueltigkeit des Pruefmittels: nach DGUV V3 fuer die Beweiskraft
  // der Messwerte erforderlich.
  drawFeldZeile(doc, "Prüfgerät kalibriert bis:", formatDatum(document.getElementById('kalibriert_bis')?.value) || '', spL, z1(4), spB, isBlank);

  drawFeldZeile(doc, "Prüfart:",             feldWert('pruefart'), spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Prüffrist:",           pruefintervallText,   spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",           datum,                spR, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Nächster Prüftermin:", naechsterTermin,      spR, z1(3), spB, isBlank);

  y += SEK1_H + 6;

  // SEKTION 2: GERÄTE-TABELLE
  const katMessen = drawKategorieTitel(doc, "2. GERÄTE: BESICHTIGEN, ERPROBEN, MESSEN", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Grenzwerte je Spalte im Tabellenkopf (DIN EN 50678 / 50699). Unzulässige Werte werden rot hinterlegt.", 10, y + 3.4);
  doc.setTextColor(...textColor);

  const tableRows = [];
  let anyDeviceOut = false;

  // BEISPIELZEILE IM LEERFORMULAR (grau/kursiv, als "Bsp" gekennzeichnet)
  const BEISPIEL_ZEILE_GP = [
    "Bsp",
    "PAR-Scheinwerfer Lichtregie (ADB PAR64)",
    "INV-0231",
    "Kl. I",
    "10 m",
    "i.O.",
    "i.O.",
    "0,22 Ω\n(max. 0,40)",
    "> 100 MΩ\n(min. 1)",
    "0,3 mA (max. 3,5)\nSchutzleiterstrom\nErsatzableitstrom"
  ];

  // Die Beispielzeile steht am ENDE der Tabelle, damit die Eintragezeilen
  // direkt unter dem Tabellenkopf beginnen.
  let beispielIndex = -1;

  if (isBlank) {
    // Zeilenzahl so gewaehlt, dass Tabelle, Gesamtbeurteilung und Unterschriften
    // gemeinsam auf eine A4-Seite passen.
    for (let i = 1; i <= 16; i++) tableRows.push([i, "", "", "", "", "", "", "", "", ""]);
    beispielIndex = tableRows.length;
    tableRows.push(BEISPIEL_ZEILE_GP);
  } else {
    const cards = document.querySelectorAll('#devicesContainer .feed-card');
    cards.forEach((card, idx) => {
      const bez = card.querySelector('.c-bez').value || '-';
      const typ = card.querySelector('.c-typ').value || '-';
      const sk = card.querySelector('.c-schutzklasse').value;
      // Inventar-/Seriennummer: nach DIN EN 50699 Pflichtangabe zur eindeutigen
      // Identifikation des Prueflings. Wurde bisher erfasst, aber nicht gedruckt.
      const invnr = card.querySelector('.c-invnr').value || '-';
      const laengeVal = card.querySelector('.c-laenge').value;

      const sichtLabelsGeraet = ['Gehäuse/Isolierung', 'Leitung/Stecker', 'Kennzeichnung', 'Reparaturspuren'];
      const sichtVals = Array.from(card.querySelectorAll('.c-sicht-item')).map(el => el.value);
      const sichtNiO = sichtVals.some(v => v === 'n.i.O.');
      // Bei Beanstandung wird jetzt benannt, WELCHER Punkt betroffen ist,
      // statt nur ein pauschales "n.i.O." auszugeben.
      const sichtText = sichtNiO
        ? 'n.i.O.: ' + sichtVals.map((v, i) => v === 'n.i.O.' ? sichtLabelsGeraet[i] : null).filter(Boolean).join(', ')
        : 'i.O.';

      const funktion = card.querySelector('.c-funktion').value;

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeMax = getRpeMaxDevice(laengeVal);
      const rpeNum = parseFloat(rpeVal.replace(',', '.'));
      // SK II/III haben keinen Schutzleiter -> R_PE ist nicht anwendbar.
      // "n.a." sagt das ausdruecklich; ein blosser Strich liesse offen, ob nur
      // die Messung fehlt.
      const rpeGiltPdf = sk === 'I';
      const isRpeOut = rpeGiltPdf && !isNaN(rpeNum) && rpeNum > rpeMax;
      // Grenzwert mitdrucken: er haengt von der Leitungslaenge ab und war fuer
      // den Leser des PDF sonst nicht nachvollziehbar.
      const rpeText = !rpeGiltPdf ? 'n.a.'
        : (rpeVal ? `${rpeVal} Ω\n(max. ${rpeMax.toFixed(2)})` : '-');

      const risoVal = card.querySelector('.c-riso').value;
      const risoMin = getIsoMin(sk, card.querySelector('.c-heizelement').checked);
      const isRisoOut = !risoVal.trim().startsWith('>') && risoMin !== null && !isNaN(parseFloat(risoVal.replace(',', '.'))) && parseFloat(risoVal.replace(',', '.')) < risoMin;
      const risoText = risoVal ? `${risoVal} MΩ\n(min. ${risoMin})` : '-';

      const ableitVal = card.querySelector('.c-ableitstrom').value;
      const heizleistung = card.querySelector('.c-heizleistung')?.value;
      const ableitMax = getAbleitstromMax(sk, heizleistung);
      const isAbleitOut = ableitMax !== null && !isNaN(parseFloat(ableitVal.replace(',', '.'))) && parseFloat(ableitVal.replace(',', '.')) > ableitMax;
      // Messverfahren gehoert ins Protokoll - die Grenzwerte gelten verfahrensabhaengig
      const methode = card.querySelector('.c-ableit-methode').value || '';
      const methodeKurz = methode.replace('Direktmessung Berührungsstrom', 'Direktmessung').replace('Differenzstrommessung', 'Differenzstrom');
      const ableitText = ableitVal
        ? `${ableitVal} mA (max. ${ableitMax})\n${getAbleitstromBezeichnung(sk)}\n${methodeKurz}`
        : '-';

      const isFunktionOut = funktion === 'n.i.O.';
      const isDeviceOut = isRpeOut || isRisoOut || isAbleitOut || sichtNiO || isFunktionOut;
      if (isDeviceOut) anyDeviceOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(`${bez}${typ !== '-' ? ' (' + typ + ')' : ''}`),
        cleanStr(invnr),
        `Kl. ${sk}`,
        // auch dieses Feld ist Freitext -> ueber cleanStr ausgeben
        laengeVal ? cleanStr(`${laengeVal} m`) : '-',
        makeCell(cleanStr(sichtText), sichtNiO),
        makeCell(cleanStr(funktion), isFunktionOut),
        makeCell(cleanStr(rpeText), isRpeOut),
        makeCell(cleanStr(risoText), isRisoOut),
        makeCell(cleanStr(ableitText), isAbleitOut)
      ]);
    });
  }

  doc.autoTable(mitFormelHooks(doc, {
    startY: y + 5,
    // Kopfzeilen mit Umbruch: Groesse / Einheit / Grenzwert untereinander
    head: [[
      'Nr.',
      'Bezeichnung / Typ',
      'Inv.-Nr.\nSeriennr.',
      'Schutz-\nklasse',
      'Leitung\n(m)',
      'Sicht-\nprüfung',
      'Funk-\ntion',
      'R_{PE} (Ω)\n≤ 0,30 bis 5 m\n+0,1 je 7,5 m',
      'R_{ISO} (MΩ)\nSK I ≥ 1,0\nSK II ≥ 2,0',
      'Ableitstrom (mA)\nSK I ≤ 3,5 / SK II ≤ 0,5\nMessverfahren'
    ]],
    body: tableRows,
    theme: 'grid',
    // Eine Messzeile darf nie am Seitenumbruch zerschnitten werden: das Fragment
    // auf der Folgeseite haette keine Zeilennummer mehr und waere keiner Messung
    // zuzuordnen. Passt die Zeile nicht mehr, wandert sie komplett auf die
    // naechste Seite (der Tabellenkopf wird dort automatisch wiederholt).
    rowPageBreak: 'avoid',
    headStyles: {
      fillColor: katMessen.kopf, textColor: katMessen.akzent,
      fontSize: 5.4, fontStyle: 'bold', halign: 'center', valign: 'middle',
      lineColor: katMessen.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
    },
    bodyStyles: { fontSize: 6, textColor: textColor, halign: 'center', valign: 'middle' },
    // Summe = 190 mm (Seitenbreite 210 abzueglich 2 x 10 mm Rand)
    columnStyles: {
      0: { cellWidth: 8 }, 1: { cellWidth: 34, halign: 'left' }, 2: { cellWidth: 16 },
      3: { cellWidth: 9 }, 4: { cellWidth: 10 }, 5: { cellWidth: 24 },
      6: { cellWidth: 12 }, 7: { cellWidth: 19 }, 8: { cellWidth: 20 },
      9: { cellWidth: 38 }
    },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 6.5 : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === beispielIndex) {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [100, 116, 139];
        data.cell.styles.fillColor = [248, 250, 252];
        data.cell.styles.fontSize = 5.4;
      }
    }
  }));

  let finalY = doc.lastAutoTable.finalY + 6;

  // SEKTION 3: GESAMTBEWERTUNG (Kategorie "ergebnis")
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  /* Schrift VOR dem Umbruch setzen: splitTextToSize misst mit der gerade
   * aktiven Schrift. Nach doc.autoTable() ist das nicht die Schrift, mit der
   * unten gedruckt wird - die Zeilen liefen dadurch ueber die Papierkante und
   * die letzten Zeichen fehlten im PDF. */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, 178) : [];
  const bemZeilen = isBlank ? 4 : Math.max(splitBemerkung.length, 1);

  // Die Ergebniszeile braucht seit dem dritten Ankreuzfeld ("Mängel behoben")
  // die volle Breite -> die Prüfplakette bekommt eine eigene Zeile.
  const offErgebnis = 11;
  const offPlakette = offErgebnis + 5.5;
  const offBemLabel = offPlakette + 5.5;
  const offBemStart = offBemLabel + 4.2;
  const boxHeight   = offBemStart + bemZeilen * 4.2 + 2.5;

  finalY = pdfPlatzPruefen(doc, finalY, boxHeight);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "3. GESAMTBEURTEILUNG", kat: 'ergebnis' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  /* --- DREI ZUSTAENDE STATT ZWEI (identisch zu den anderen Protokollen) --- */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  // Beanstandungen unabhaengig von der Auswahl - nur ohne sie darf "behoben"
  // positiv ausgehen.
  const gewaehrleistungVal = document.getElementById('res_gewaehrleistung')?.value || 'Ja';
  const restBeanstandungen = !isBlank && (gewaehrleistungVal === 'Nein' || anyDeviceOut);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", 13, finalY + offErgebnis);
  drawCheckbox(doc, 34, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 82, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, behobenTrotzOffener);
  drawCheckbox(doc, 146, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfplakette erteilt:", 13, finalY + offPlakette);
  drawCheckbox(doc, 45, finalY + offPlakette, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 57, finalY + offPlakette, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Bemerkungen / Mängel:", 13, finalY + offBemLabel);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    drawSchreibLinien(doc, 13, finalY + offBemStart + 1, 184, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, 13, finalY + offBemStart);
  }

  finalY += boxHeight + 5;

  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  // Kein Dokument, das gleichzeitig "Ja" ankreuzt und "NICHT ... betrieben werden" schreibt.
  if (freigabeWidersprichtBefund(isBlank, hasIssues, gewaehrleistungVal)) {
    alert(freigabeWiderspruchHinweis('Sicherer Gebrauch gewährleistet'));
    document.getElementById('res_gewaehrleistung')?.focus();
    return;
  }

  const complianceText = isBlank
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte oder ein n.i.O.-Ergebnis bei Sicht-/Funktionsprüfung festgestellt. Die betroffenen Geräte entsprechen NICHT den anerkannten Regeln der Elektrotechnik und dürfen bis zur Mängelbeseitigung und erneuten Prüfung NICHT weiter betrieben werden."
      : behobenOk
        ? MAENGEL_BEHOBEN_TEXT_GERAETE
        : "Die geprüften Geräte entsprechen den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.";

  /* Der Warntext bei Maengeln wird FETT gesetzt und ist damit rund 7 %
   * breiter als in normaler Schrift. Wurde er normal gemessen und fett
   * gedruckt, lief er ueber die rechte Papierkante hinaus und die letzten
   * Zeichen fehlten im PDF. Schrift deshalb VOR splitTextToSize setzen. */
  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceText + (isKalAbgelaufen ? KALIBRIERUNG_HINWEIS_PDF : ''), 190);
  finalY = pdfPlatzPruefen(doc, finalY, 4 + complianceLines.length * 3.2 + 4 + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", 10, finalY);
  drawCheckbox(doc, 58, finalY, "Ja (Geräte entsprechen den Normen)", !isBlank && gewaehrleistungVal === "Ja");
  drawCheckbox(doc, 118, finalY, "Nein (Sicherheitsrisiko)", !isBlank && gewaehrleistungVal === "Nein", true);

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  doc.text(complianceLines, 10, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 4;

  const ortDatum = unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`;

  if (!isBlank && !padPruefer.isEmpty()) {
    doc.addImage(padPruefer.toDataURL('image/png'), 'PNG', 10, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(10, finalY + 12, 90, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Unterschrift Prüfer/-in`, 10, finalY + 15);

  if (!isBlank && !padKunde.isEmpty()) {
    doc.addImage(padKunde.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 200, finalY + 12);
  doc.text(`${ortDatum} - Unterschrift Auftraggeber/Betreiber`, 115, finalY + 15);

  drawProtokollSeitenkoepfe(doc, {
    ...GERAETE_KOPF, protokollNr: kopfProtokollNr, pruefNr: kopfPruefNr, datum, revision: GERAETE_REVISION
  });

  const filename = isBlank
    ? `Geraetepruefung_50678_50699_Leerformular.pdf`
    : `Geraetepruefung_${protokollNr}_${(datum || '').replace(/\./g, '-')}.pdf`;

  /* Die Nummer wird ERST JETZT verbraucht - und nur, wenn wirklich eine Datei
   * entstanden ist. Ein abgebrochener Teilen-Dialog kostet keine Nummer,
   * ein Leerformular ebenfalls nicht. */
  Promise.resolve(savePdfCompatible(doc, filename, archivMetaSammeln('GP', nummerRoh, filename, isBlank)))
    .then(function (gespeichert) {
    if (isBlank || gespeichert === false) return;
    verbraucheProtokollNummer(nummerRoh, 'GP');
    nachPdfNeuesFormularAnbieten('GP', nummerRoh, resetGeraeteForm, clearGeraeteAutosave);
  });
}

// AUTOSAVE
// Einheitliches Praefix 'vde_': der alte Schluessel 'geraete_protocol_autosave'
// wurde von der Datensicherung nicht erfasst (siehe storage.js).
const GERAETE_AUTOSAVE_KEY = 'vde_autosave_gp';

const GERAETE_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'messgeraet', 'seriennummer',
  'kalibriert_bis', 'pruefart', 'pruefintervall', 'res_termin_date',
  'res_maengel', 'res_plakette', 'res_gewaehrleistung', 'res_bemerkungen',
  'unterschrift_ort', 'unterschrift_datum', 'protokollnummer'
];

function collectGeraeteState() {
  const state = { fields: {} };
  GERAETE_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.gebaeude = document.getElementById('gebaeude_custom').value;

  state.devices = Array.from(document.querySelectorAll('#devicesContainer .feed-card')).map(card => ({
    bez: card.querySelector('.c-bez').value,
    typ: card.querySelector('.c-typ').value,
    invnr: card.querySelector('.c-invnr').value,
    schutzklasse: card.querySelector('.c-schutzklasse').value,
    laenge: card.querySelector('.c-laenge').value,
    heizelement: card.querySelector('.c-heizelement').checked,
    heizleistung: card.querySelector('.c-heizleistung')?.value || '',
    sicht: Array.from(card.querySelectorAll('.c-sicht-item')).map(el => el.value),
    funktion: card.querySelector('.c-funktion').value,
    rpe: card.querySelector('.c-rpe').value,
    riso: card.querySelector('.c-riso').value,
    ableitstrom: card.querySelector('.c-ableitstrom').value,
    ableit_methode: card.querySelector('.c-ableit-methode').value
  }));

  return state;
}

function restoreGeraeteState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Ein wiederhergestelltes Formular behaelt SEINE Protokollnummer.
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    /* Leere Datumsangaben aus einer Archiv-Vorlage duerfen die Vorbelegung
     * (heutiges Datum, Folgetermin) nicht ueberschreiben. */
    if ((id === 'datum' || id === 'unterschrift_datum' || id === 'res_termin_date') &&
        !String(val || '').trim()) return;
    el.value = val;
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  validateKalibrierung();

  if (state.devices && state.devices.length) {
    document.getElementById('devicesContainer').innerHTML = '';
    cardCounter = 0;
    state.devices.forEach(d => addDeviceCard(d));
    document.querySelectorAll('#devicesContainer .feed-card').forEach((card, i) => {
      const d = state.devices[i];
      const sichtEls = card.querySelectorAll('.c-sicht-item');
      (d.sicht || []).forEach((val, j) => { if (sichtEls[j]) sichtEls[j].value = val; });
      /* Auch LEERE Werte setzen: eine aus dem Archiv uebernommene Vorlage
       * liefert Funktionspruefung und Messverfahren bewusst leer. Mit der
       * frueheren Kurzpruefung blieb der Vorgabewert "i.O." stehen - ein
       * Ergebnis, das nie geprueft wurde. */
      if (d.funktion !== undefined) card.querySelector('.c-funktion').value = d.funktion;
      if (d.ableit_methode !== undefined) card.querySelector('.c-ableit-methode').value = d.ableit_methode;
      validateDeviceNorms(i + 1);
    });
  }

  return true;
}

function autosaveProtocol() {
  try { localStorage.setItem(GERAETE_AUTOSAVE_KEY, JSON.stringify(collectGeraeteState())); } catch (e) {}
}

function loadGeraeteAutosave() {
  try {
    const raw = localStorage.getItem(GERAETE_AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearGeraeteAutosave() {
  localStorage.removeItem(GERAETE_AUTOSAVE_KEY);
}

function resetGeraeteForm() {
  document.getElementById('geraeteForm').reset();

  // Lokales Datum, siehe heuteIso() in pdf-utils.js
  datumsfeldAufHeute('datum');
  datumsfeldAufHeute('unterschrift_datum');
  updateNaechsterTermin();
  document.getElementById('res_bemerkungen').style.height = 'auto';

  applyMasterDataToForm();

  document.getElementById('devicesContainer').innerHTML = '';
  cardCounter = 0;
  addDeviceCard();

  if (typeof padPruefer !== 'undefined' && padPruefer) padPruefer.clear();
  if (typeof padKunde !== 'undefined' && padKunde) padKunde.clear();
}

function neuesGeraeteProtokoll() {
  if (!confirm('Neues Formular anlegen? Alle aktuell eingetragenen Daten in diesem Formular werden zurückgesetzt.')) return;

  const nr = naechsteProtokollNummer('GP');
  resetGeraeteForm();
  document.getElementById('protokollnummer').value = nr;
  clearGeraeteAutosave();
  alert(`Neues Protokoll angelegt: ${nr}\n\nDie Nummer wird erst mit dem fertigen PDF verbraucht.`);
}
