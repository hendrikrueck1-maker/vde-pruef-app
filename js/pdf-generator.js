let cardCounter = 0;

function addCircuitCard(data = {}) {
  cardCounter++;
  const container = document.getElementById('circuitsContainer');
  const card = document.createElement('div');
  card.className = 'circuit-card';
  card.id = `circuit_${cardCounter}`;
  
  card.innerHTML = `
    <div class="circuit-header">
      <span>Stromkreis #${cardCounter}</span>
      <button type="button" class="btn-danger" onclick="removeCard('circuit_${cardCounter}')">Entfernen</button>
    </div>

    <div class="grid">
      <div class="form-group">
        <label>Bezeichnung / Zweck:</label>
        <input type="text" class="c-bez" value="${data.bez || ''}" placeholder="z. B. Schukosteckdose Tonregie">
      </div>
      <div class="form-group">
        <label>Kabeltyp:</label>
        <input type="text" class="c-kabel-typ" id="kabel_typ_${cardCounter}" value="${data.kabel || ''}" placeholder="z. B. NYM-J / UP">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'NYM-J')">NYM-J</button>
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'H07RN-F')">H07RN-F</button>
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'TITANEX')">TITANEX</button>
        </div>
      </div>
      <div class="form-group">
        <label>Leiter-Anzahl:</label>
        <input type="text" class="c-leiter" id="leiter_${cardCounter}" value="${data.leiter || '3G'}" placeholder="z. B. 3G">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '3G')">3G</button>
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '5G')">5G</button>
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '4G')">4G</button>
        </div>
      </div>
      <div class="form-group">
        <label>Querschnitt:</label>
        <input type="text" inputmode="decimal" class="c-querschnitt" id="qs_${cardCounter}" value="${data.qs || '1.5 mm²'}" placeholder="z. B. 1.5 mm²">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '1.5 mm²')">1.5 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '2.5 mm²')">2.5 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '4.0 mm²')">4.0 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '6.0 mm²')">6.0 mm²</button>
        </div>
      </div>
    </div>

    <!-- MESSWERTE: R_PE & R_ISO -->
    <div class="sub-section">
      <div class="sub-title">1. Schutzleiter- & Isolationswiderstand</div>
      <div class="grid">
        <div class="form-group">
          <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
          <input type="text" inputmode="decimal" class="c-rpe" value="${data.rpe || ''}" placeholder="z. B. 0.11" oninput="validateCardNorms(${cardCounter})">
          <div class="limit-hint">DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit (Prüfstrom &ge; 200 mA), keinen festen Grenzwert. Die Schutzwirkung wird über Z<sub>S</sub>/I<sub>K</sub> bewertet.</div>
        </div>
        <div class="form-group">
          <label>R<sub>ISO</sub> Prüfspannung (DIN VDE 0100-600, Tab. 6.1):</label>
          <select class="c-riso-mode" onchange="validateCardNorms(${cardCounter})">
            <option value="500 V DC (Stromkreis bis 500 V)">500 V DC &ndash; Stromkreis bis 500 V (&ge; 1,0 M&Omega;)</option>
            <option value="250 V DC (SELV/PELV)">250 V DC &ndash; SELV/PELV (&ge; 0,5 M&Omega;)</option>
            <option value="1000 V DC (Stromkreis über 500 V)">1000 V DC &ndash; Stromkreis über 500 V (&ge; 1,0 M&Omega;)</option>
            <option value="250 V DC (Praxismessung mit Verbrauchern)">250 V DC &ndash; Praxismessung mit Verbrauchern (kein Normfall)</option>
          </select>
        </div>
        <div class="form-group">
          <label>R<sub>ISO</sub> Messwert (M&Omega;):</label>
          <input type="text" inputmode="decimal" class="c-riso" value="${data.riso || ''}" placeholder="z. B. > 500" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <!-- MESSWERTE: ABSICHERUNG -->
    <div class="sub-section">
      <div class="sub-title">2. Überstromschutzeinrichtung (Absicherung)</div>
      <div class="grid">
        <div class="form-group">
          <label>Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${data.sich || 'B 16A'}" placeholder="z. B. B 16A" oninput="validateCardNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 16A'); validateCardNorms(${cardCounter})">B 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 10A'); validateCardNorms(${cardCounter})">B 10A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 16A'); validateCardNorms(${cardCounter})">C 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 32A'); validateCardNorms(${cardCounter})">C 32A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Z<sub>S</sub> (&Omega;):</label>
          <input type="text" inputmode="decimal" class="c-zs" value="${data.zs || ''}" placeholder="z. B. 0.38">
        </div>
        <div class="form-group">
          <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>
          <input type="text" inputmode="decimal" class="c-ik" value="${data.ik || ''}" placeholder="z. B. 605" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <!-- MESSWERTE: RCD -->
    <div class="sub-section">
      <div class="sub-title">3. Fehlerstrom-Schutzeinrichtung (RCD / FI)</div>
      <div class="grid">
        <div class="form-group">
          <label>RCD Typ:</label>
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${data.rcd_typ || 'Typ A'}" placeholder="z. B. Typ A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ A')">Typ A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B')">Typ B</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B+')">Typ B+</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ F')">Typ F</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Ohne RCD')">Ohne RCD</button>
          </div>
        </div>
        <div class="form-group">
          <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${data.rcd_idn || '30 mA'}" placeholder="z. B. 30 mA" oninput="validateCardNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '10 mA'); validateCardNorms(${cardCounter})">10 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '30 mA'); validateCardNorms(${cardCounter})">30 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '300 mA'); validateCardNorms(${cardCounter})">300 mA</button>
          </div>
        </div>
        <div class="form-group">
          <label>Auslösestrom I<sub>&Delta;mess</sub> (mA) [0,5&ndash;1,0 &times; I<sub>&Delta;n</sub>]:</label>
          <input type="text" inputmode="decimal" class="c-rcd-imess" value="${data.rcd_imess || ''}" placeholder="z. B. 22" oninput="validateCardNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Prüfstrom für Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateCardNorms(${cardCounter})">
            <option value="1">1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>
            <option value="2">2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>
            <option value="5">5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="ta_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rcd-ta" value="${data.rcd_ta || ''}" placeholder="z. B. 24" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <!-- MESSWERTE: BERÜHRUNGSSPANNUNG -->
    <div class="sub-section">
      <div class="sub-title">4. Berührungsspannung & Netzart</div>
      <div class="grid">
        <div class="form-group">
          <label>Spannungsart Netzeinspeisung:</label>
          <select class="c-spannung-art" id="art_${cardCounter}" onchange="updateMaxSpannung(${cardCounter}, this.value)">
            <option value="AC">AC (Wechselstrom)</option>
            <option value="DC">DC (Gleichstrom)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Maximal zulässige Spannung U<sub>L</sub>:</label>
          <input type="text" class="c-ul-max" id="ul_max_${cardCounter}" value="&le; 50 V AC" readonly>
        </div>
        <div class="form-group">
          <label>Gemessene Berührungsspannung U<sub>mess</sub> (V):</label>
          <input type="text" inputmode="decimal" class="c-umess" value="${data.umess || ''}" placeholder="z. B. 2.5 V" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);

  if (data.riso_mode) card.querySelector('.c-riso-mode').value = data.riso_mode;
  if (data.rcd_pruefstrom) card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom;
  if (data.art) {
    card.querySelector('.c-spannung-art').value = data.art;
    updateMaxSpannung(cardCounter, data.art);
  }

  validateCardNorms(cardCounter);
}

function validateCardNorms(cardId) {
  const card = document.getElementById(`circuit_${cardId}`);
  if (!card) return;
  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseFloat(rpeElem.value.replace(',', '.'));
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  // R_ISO: Mindestwert haengt von der gewaehlten Pruefspannung ab
  // (SELV/PELV 0,5 MOhm, sonst 1,0 MOhm - DIN VDE 0100-600 Tabelle 6.1)
  const risoElem = card.querySelector('.c-riso');
  const risoModeElem = card.querySelector('.c-riso-mode');
  const risoMin = (risoModeElem && risoModeElem.value.includes('SELV')) ? 0.5 : 1.0;
  if (risoElem && risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseFloat(txt.replace(',', '.'));
      if (!isNaN(num) && num < risoMin) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else if (risoElem) risoElem.classList.remove('out-of-norm');

  // RCD-Ausloesezeit gegen den zum Pruefstrom passenden Grenzwert pruefen.
  // Zuvor wurde pauschal gegen 40 ms geprueft - dieser Wert gilt aber nur bei
  // 5x I_dn. Bei der ueblichen Messung mit 1x I_dn sind 300 ms zulaessig.
  const pruefstromElem = card.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  const taMax = getRcdMaxAusloesezeitMs(pruefstromElem ? pruefstromElem.value : '1', istSelektiv);
  const taLimitLabel = document.getElementById(`ta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = `[max. ${taMax} ms]`;

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taElem.value.trim() !== '' && taElem.value.trim() !== '-') {
    const num = parseFloat(taElem.value.replace(',', '.'));
    if (!isNaN(num) && num > taMax) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein (DIN VDE 0100-600).
  // Fehlende Messwerte werden markiert, statt stillschweigend als "-" zu drucken.
  const imessEl = card.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  const messwertFehlt = v => !v || v.trim() === '' || v.trim() === '-';
  [imessEl, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && messwertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });

  const umessElem = card.querySelector('.c-umess');
  const artElem = card.querySelector('.c-spannung-art');
  if (umessElem && umessElem.value.trim() !== '') {
    const num = parseFloat(umessElem.value.replace(',', '.'));
    const limit = (artElem && artElem.value === 'DC') ? 120 : 50;
    if (!isNaN(num) && num > limit) umessElem.classList.add('out-of-norm'); else umessElem.classList.remove('out-of-norm');
  } else if (umessElem) umessElem.classList.remove('out-of-norm');

  const sichElem = card.querySelector('.c-sich-typ');
  const ikElem = card.querySelector('.c-ik');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;
  if (ikElem) {
    ikElem.placeholder = minIk !== null ? `z. B. ${Math.round(minIk * 1.2)} (min. ${minIk} A erforderlich)` : 'z. B. 605';
    if (ikElem.value.trim() !== '' && minIk !== null) {
      const num = parseFloat(ikElem.value.replace(',', '.'));
      if (!isNaN(num) && num < minIk) ikElem.classList.add('out-of-norm'); else ikElem.classList.remove('out-of-norm');
    } else {
      ikElem.classList.remove('out-of-norm');
    }
  }

  const idnElem = card.querySelector('.c-rcd-idn');
  const imessElem = card.querySelector('.c-rcd-imess');
  if (imessElem && imessElem.value.trim() !== '') {
    const range = idnElem ? getRcdIdnRangeMa(idnElem.value) : null;
    const num = parseFloat(imessElem.value.replace(',', '.'));
    if (range && !isNaN(num) && (num < range.min || num > range.max)) imessElem.classList.add('out-of-norm'); else imessElem.classList.remove('out-of-norm');
  } else if (imessElem) imessElem.classList.remove('out-of-norm');
}

// Erdungs-Richtwert und validateErdung() liegen jetzt zentral in pdf-utils.js
// (ERDUNG_RE_RICHTWERT). Die frueheren Kopien hier waren Duplikate.
const ERDUNG_RE_GRENZWERT = ERDUNG_RE_RICHTWERT;

function updateMaxSpannung(cardId, art) { document.getElementById(`ul_max_${cardId}`).value = (art === 'DC') ? '≤ 120 V DC' : '≤ 50 V AC'; validateCardNorms(cardId); }

function fillExampleData() {
  document.getElementById('pruefungsnummer').value = "PR-2026-081";
  document.getElementById('pruefer').value = "Max Mustermann (Elektrofachkraft)";
  document.getElementById('anlage_bez').value = "Hauptverteilung Unterbühne UV-1";
  document.getElementById('netzspannung').value = "230 / 400";
  document.getElementById('netzfrequenz').value = "50 Hz";
  document.getElementById('anschluss_typ').value = "H07RN-F";
  document.getElementById('anschluss_leiter').value = "5G";
  document.getElementById('anschluss_qs').value = "10 mm²";
  document.getElementById('erdung_re').value = "0.18";
  validateErdung();
  // Der frueher hier hinterlegte Text "Sicherung in Kreis 2 erneuert" stand im
  // Widerspruch zum angekreuzten "Keine Mängel festgestellt". Fuer den Fall einer
  // behobenen Beanstandung gibt es jetzt die eigene Option im Feld res_maengel.
  document.getElementById('res_bemerkungen').value = "Alle Messwerte innerhalb der zulässigen Grenzen. Keine Mängel festgestellt.";

  const checkboxes = document.querySelectorAll('.erdung-cb');
  if (checkboxes.length > 4) { checkboxes[0].checked = true; checkboxes[2].checked = true; checkboxes[4].checked = true; }

  document.getElementById('circuitsContainer').innerHTML = '';
  cardCounter = 0;
  // Beide Beispielkreise haben einen RCD -> beide bekommen auch Messwerte.
  // Zuvor stand bei Kreis 1 "- mA / - ms", was einen vorhandenen, aber ungeprueften
  // RCD dokumentierte. Die Pruefung ist nach DIN VDE 0100-600 zwingend.
  // Werte ohne Einheit eintragen - die Einheit haengt der Generator an.
  addCircuitCard({ bez: '1 - Schukosteckdose Lichtregie', kabel: 'NYM-J', leiter: '3G', qs: '1.5 mm²', rpe: '0.08', riso: '> 500', sich: 'B 10A', zs: '0.35', ik: '657', rcd_imess: '19', rcd_ta: '24', rcd_pruefstrom: '1', umess: '1.2' });
  addCircuitCard({ bez: '2 - CEE 16A Hauptbühne', kabel: 'H07RN-F', leiter: '5G', qs: '2.5 mm²', rpe: '0.12', riso: '450', sich: 'B 16A', zs: '0.42', ik: '547', rcd_imess: '22', rcd_ta: '18', rcd_pruefstrom: '1', umess: '2.4' });
}

// KOPFDATEN DES PROTOKOLLS (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet)
const VDE0100_KOPF = {
  titel: "PRÜFPROTOKOLL ELEKTRISCHER ANLAGEN",
  normzeile: "Erst- und Wiederholungsprüfung nach DIN VDE 0100-600 / DIN VDE 0105-100"
};
const FORMULAR_REVISION = "Formular Rev. 2026-08 · Normstand: VDE 0100-600:2017-06 · VDE 0105-100:2015-10";

// GENERATOR FÜR DAS PDF-DOKUMENT
function generatePDF(isBlank = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  
  const primaryColor = [0, 51, 102];
  const textColor = [15, 23, 42];
  const boxBorder = [203, 213, 225];
  const tableHeaderBg = [226, 232, 240];

  const redCellBg = [254, 226, 226];  
  const redCellText = [153, 27, 27];   

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: redCellBg, textColor: redCellText, fontStyle: 'bold' } };
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

  const protokollNr = getVal('protokollnummer', "PR-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");

  const formatDatum = (isoDate) => {
    if (!isoDate) return "____.____.20__";
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [jahr, monat, tag] = parts;
    return `${tag}.${monat}.${jahr}`;
  };
  const datum = isBlank ? "____.____.20__" : formatDatum(document.getElementById('datum').value);
  const ort = getVal('unterschrift_ort', "Konstanz");

  // HEADER: zentrale Funktion aus pdf-utils.js, passt die Schriftgroesse
  // automatisch an die verfuegbare Breite an (verhindert Ueberdrucken der Infobox)
  drawProtokollHeader(doc, VDE0100_KOPF);

  let y = 24;

  // SEKTION 1
  doc.setDrawColor(...boxBorder);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.roundedRect(10, y, 190, 41, 1, 1, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("1. STAMMDATEN, NETZSYSTEM & MESSGERÄTE", 13, y + 5);

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  
  const gebaeudeVal = getVal('gebaeude_custom', "________");
  // BLANKO-SPANNUNG BRAUCHT PLATZ FÜR ZWEI VON-HAND EINGETRAGENE WERTE (z. B. 230 / 400 V)
  let volt = isBlank ? "____ / ____ V" : getVal('netzspannung', "____ V");
  if (!isBlank && volt && !volt.toLowerCase().includes('v') && volt !== "____ V") {
    volt += " V";
  }
  let freq = isBlank ? "____ Hz" : getVal('netzfrequenz', "____ Hz");
  if (!isBlank && freq && !freq.toLowerCase().includes('hz') && freq !== "____ Hz") {
    freq += " Hz";
  }
  const netzSysVal = isBlank ? "________" : getVal('netzsystem');

  doc.text(`Auftraggeber: ${getVal('auftraggeber', 'Stadttheater Konstanz, Inselgasse 2-6')}`, 13, y + 11);
  doc.text(`Gebäude/Bereich: ${gebaeudeVal}`, 13, y + 16);
  doc.text(`Anlage: ${getVal('anlage_bez', '____________________')}`, 13, y + 21);
  doc.text(`Prüfer/-in: ${getVal('pruefer', '____________________')}`, 13, y + 26);

  doc.text(`Prüfdatum: ${datum}`, 115, y + 11);
  doc.text(`Prüfnorm: ${getVal('pruefnorm')}`, 115, y + 16);
  doc.text(`Netzsystem: ${netzSysVal}`, 115, y + 21);
  doc.text(`Spannung / Frequenz: ${volt}, ${freq}`, 115, y + 26);
  doc.text(`Netzbetreiber: ${getVal('vnb', 'Stadtwerke Konstanz')}`, 115, y + 31);
  doc.text(`Prüfgerät: ${getVal('messgeraet', 'Fluke 1663')} (SN: ${getVal('seriennummer', '__________')}, kal. bis ${getVal('kalibriert_bis', '__.__.____')})`, 115, y + 36);

  y += 45;

  // SEKTION 2
  doc.setDrawColor(...boxBorder);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, y, 190, 38, 1, 1, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("2. BESICHTIGEN & ERPROBEN (SICHT- UND FUNKTIONSPRÜFUNG)", 13, y + 5);

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  
  const s = document.querySelectorAll('.sicht-item');
  
  doc.text("1. Betriebsmittel:", 13, y + 11);
  drawCheckbox(doc, 38, y + 11, "i.O.", !isBlank && s[0]?.value === "i.O.");
  drawCheckbox(doc, 52, y + 11, "n.i.O.", !isBlank && s[0]?.value === "n.i.O.", true);

  doc.text("2. Kabel & Leitungen:", 13, y + 16);
  drawCheckbox(doc, 38, y + 16, "i.O.", !isBlank && s[1]?.value === "i.O.");
  drawCheckbox(doc, 52, y + 16, "n.i.O.", !isBlank && s[1]?.value === "n.i.O.", true);

  doc.text("3. Zugänglichkeit:", 13, y + 21);
  drawCheckbox(doc, 38, y + 21, "i.O.", !isBlank && s[2]?.value === "i.O.");
  drawCheckbox(doc, 52, y + 21, "n.i.O.", !isBlank && s[2]?.value === "n.i.O.", true);

  doc.text("4. Schaltgeräte:", 75, y + 11);
  drawCheckbox(doc, 102, y + 11, "i.O.", !isBlank && s[3]?.value === "i.O.");
  drawCheckbox(doc, 116, y + 11, "n.i.O.", !isBlank && s[3]?.value === "n.i.O.", true);

  doc.text("5. Kennzeichnung:", 75, y + 16);
  drawCheckbox(doc, 102, y + 16, "i.O.", !isBlank && s[4]?.value === "i.O.");
  drawCheckbox(doc, 116, y + 16, "n.i.O.", !isBlank && s[4]?.value === "n.i.O.", true);

  doc.text("6. Doku / Warnung:", 75, y + 21);
  drawCheckbox(doc, 102, y + 21, "i.O.", !isBlank && s[5]?.value === "i.O.");
  drawCheckbox(doc, 116, y + 21, "n.i.O.", !isBlank && s[5]?.value === "n.i.O.", true);

  doc.text("7. Zus. Potenzialausgl.:", 138, y + 11);
  drawCheckbox(doc, 168, y + 11, "i.O.", !isBlank && s[6]?.value === "i.O.");
  drawCheckbox(doc, 182, y + 11, "n.i.O.", !isBlank && s[6]?.value === "n.i.O.", true);

  doc.text("8. Berührungsschutz:", 138, y + 16);
  drawCheckbox(doc, 168, y + 16, "i.O.", !isBlank && s[7]?.value === "i.O.");
  drawCheckbox(doc, 182, y + 16, "n.i.O.", !isBlank && s[7]?.value === "n.i.O.", true);

  doc.text("9. Typenschild:", 138, y + 21);
  drawCheckbox(doc, 168, y + 21, "i.O.", !isBlank && s[8]?.value === "i.O.");
  drawCheckbox(doc, 182, y + 21, "n.i.O.", !isBlank && s[8]?.value === "n.i.O.", true);

  const typA = getVal('anschluss_typ', '');
  const leiA = getVal('anschluss_leiter', '');
  const qsA = getVal('anschluss_qs', '');
  let kabelAnschluss = [typA, leiA, qsA].filter(p => p).join(' ');
  if (!kabelAnschluss) kabelAnschluss = '____________________';

  doc.text(`Anschlusskabel: ${kabelAnschluss}`, 13, y + 27);

  doc.setFont("helvetica", "bold");
  doc.text("Erproben:", 13, y + 33);
  doc.setFont("helvetica", "normal");

  doc.text("Funktion Anlage:", 30, y + 33);
  drawCheckbox(doc, 52, y + 33, "i.O.", !isBlank && document.getElementById('erp_anlage')?.value === "i.O.");
  drawCheckbox(doc, 64, y + 33, "n.i.O.", !isBlank && document.getElementById('erp_anlage')?.value === "n.i.O.", true);

  doc.text("Schutzeinrichtungen:", 80, y + 33);
  drawCheckbox(doc, 108, y + 33, "i.O.", !isBlank && document.getElementById('erp_schutz')?.value === "i.O.");
  drawCheckbox(doc, 120, y + 33, "n.i.O.", !isBlank && document.getElementById('erp_schutz')?.value === "n.i.O.", true);

  doc.text("Drehfeld:", 138, y + 33);
  drawCheckbox(doc, 151, y + 33, "i.O.", !isBlank && document.getElementById('erp_drehfeld')?.value === "i.O.");
  drawCheckbox(doc, 163, y + 33, "n.i.O.", !isBlank && document.getElementById('erp_drehfeld')?.value === "n.i.O.", true);
  drawCheckbox(doc, 178, y + 33, "n.a.", !isBlank && document.getElementById('erp_drehfeld')?.value === "n.a.");

  y += 42;

  // SEKTION 3: TABELLE
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("3. MESSTECHNISCHE PRÜFUNGEN DER STROMKREISE", 10, y);

  const tableRows = [];
  let anyMeasurementOut = false;

  if (isBlank) {
    for (let i = 1; i <= 7; i++) tableRows.push([i, "", "", "", "", "", "", "", ""]);
  } else {
    const cards = document.querySelectorAll('.circuit-card');
    cards.forEach((card, idx) => {
      const kTyp = card.querySelector('.c-kabel-typ').value;
      const kLei = card.querySelector('.c-leiter').value;
      const kQs = card.querySelector('.c-querschnitt').value;
      let kabel = [kTyp, kLei, kQs].filter(p => p && p.trim()).join(' ');
      if (!kabel) kabel = '-';

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeNum = parseFloat(rpeVal.replace(',', '.'));
      const isRpeOut = !isNaN(rpeNum) && rpeNum > 0.30;
      const rpeText = rpeVal ? `${rpeVal} Ohm` : '-';

      const risoVal = card.querySelector('.c-riso').value;
      const risoModeVal = card.querySelector('.c-riso-mode')?.value || '';
      // Mindestwert je Pruefspannung (SELV/PELV 0,5 MOhm, sonst 1,0 MOhm)
      const risoMinPdf = risoModeVal.includes('SELV') ? 0.5 : 1.0;
      const risoNum = parseFloat(risoVal.replace(',', '.'));
      const isRisoOut = !risoVal.trim().startsWith('>') && !isNaN(risoNum) && risoNum < risoMinPdf;
      // Die Pruefspannung gehoert nach DIN VDE 0100-600 mit ins Protokoll,
      // weil der Grenzwert von ihr abhaengt.
      const risoText = risoVal ? `${risoVal} MOhm\n(${risoModeVal.replace(/\s*\(.*\)/, '')})` : '-';

      const sich = card.querySelector('.c-sich-typ').value || '-';

      const zs = card.querySelector('.c-zs').value;
      const ik = card.querySelector('.c-ik').value;
      const minIk = getMinIk(sich);
      const ikNum = parseFloat(ik.replace(',', '.'));
      const isIkOut = minIk !== null && !isNaN(ikNum) && ikNum < minIk;
      let zsik = '-';
      if (zs || ik) zsik = `${zs || '-'} Ohm / ${ik || '-'} A`;

      const rcdTyp = card.querySelector('.c-rcd-typ').value;
      const rcdIdn = card.querySelector('.c-rcd-idn').value;
      const rcdImess = card.querySelector('.c-rcd-imess').value;
      const rcdTa = card.querySelector('.c-rcd-ta').value;
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '1';
      const istSelektiv = /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTyp);
      // Grenzwert richtet sich nach dem tatsaechlich verwendeten Pruefstrom
      const taMax = getRcdMaxAusloesezeitMs(rcdPruefstrom, istSelektiv);
      const taNum = parseFloat(rcdTa.replace(',', '.'));
      const isTaOut = !isNaN(taNum) && taNum > taMax;
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseFloat(rcdImess.replace(',', '.'));
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);

      // Ein eingetragener RCD ohne Messwerte ist ein Dokumentationsmangel und
      // wird jetzt als solcher markiert, statt unauffaellig als "-" zu erscheinen.
      const hatRcd = rcdTyp.trim() !== '' && !/ohne\s*rcd/i.test(rcdTyp);
      const fehlt = v => !v || v.trim() === '' || v.trim() === '-';
      const isRcdUngeprueft = hatRcd && (fehlt(rcdImess) || fehlt(rcdTa));
      const isRcdOut = isTaOut || isImessOut || isRcdUngeprueft;

      let rcdText = `${rcdTyp} (${rcdIdn})`;
      if (hatRcd) {
        rcdText += isRcdUngeprueft
          ? `\nnicht geprüft`
          : `\n${rcdImess} mA / ${rcdTa} ms bei ${rcdPruefstrom}x IdN`;
      }

      const uMessVal = card.querySelector('.c-umess').value;
      const uMaxVal = card.querySelector('.c-ul-max').value;
      const uNum = parseFloat(uMessVal.replace(',', '.'));
      const limitU = (card.querySelector('.c-spannung-art')?.value === 'DC') ? 120 : 50;
      const isUOut = !isNaN(uNum) && uNum > limitU;

      // withUnit haengt "V" nur an, wenn die Einheit nicht schon eingetippt wurde
      // (fruehere Ausgabe: "1.2 V V")
      let uText = uMessVal ? withUnit(uMessVal, 'V') : '-';
      if (uMaxVal) uText += `\n(${uMaxVal})`;

      if (isRpeOut || isRisoOut || isIkOut || isRcdOut || isUOut) anyMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(kabel),
        makeCell(cleanStr(rpeText), isRpeOut),
        makeCell(cleanStr(risoText), isRisoOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut),
        makeCell(cleanStr(rcdText), isRcdOut),
        makeCell(cleanStr(uText), isUOut)
      ]);
    });
  }

  doc.autoTable({
    startY: y + 2.5,
    head: [['Nr.', 'Bezeichnung', 'Leitung', 'R_PE', 'R_ISO', 'Sicherung', 'Z_S / I_K', 'RCD (Typ / Idn / Mess)', 'U_mess (U_L)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: tableHeaderBg, textColor: primaryColor, fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 7 }, 1: { cellWidth: 34, halign: 'left' }, 2: { cellWidth: 26 },
      3: { cellWidth: 16 }, 4: { cellWidth: 20 }, 5: { cellWidth: 18 },
      6: { cellWidth: 25 }, 7: { cellWidth: 26 }, 8: { cellWidth: 18 }
    },
    margin: { left: 10, right: 10 },
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 8 : 5 }
  });

  let finalY = doc.lastAutoTable.finalY + 6;
  if (finalY > 225) { doc.addPage(); finalY = 15; }

  // SEKTION 4: ERDUNG, BEWERTUNG & NÄCHSTER PRÜFTERMIN
  let bemerkungenText = getVal('res_bemerkungen', '');
  if (isBlank) bemerkungenText = "________________________________________________________________________________________________________";
  const splitBemerkung = doc.splitTextToSize(bemerkungenText, 180);
  const boxHeight = 50 + (splitBemerkung.length * 4);

  if (finalY + boxHeight > 280) { doc.addPage(); finalY = 15; }

  doc.setDrawColor(...boxBorder);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, finalY, 190, boxHeight, 1, 1, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("4. ERDUNG & GESAMTBEWERTUNG", 13, finalY + 5);

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  const selectedErdung = Array.from(document.querySelectorAll('.erdung-cb:checked')).map(cb => cb.value);

  const erdungReNum = parseFloat((document.getElementById('erdung_re')?.value || '').replace(',', '.'));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && erdungReNum > ERDUNG_RE_GRENZWERT;
  if (isErdungOut) { doc.setTextColor(...redCellText); doc.setFont("helvetica", "bold"); }
  doc.text(`Erdungswiderstand R_E: ${getVal('erdung_re', '__________')} Ohm (Richtwert <= ${ERDUNG_RE_GRENZWERT} Ohm)`, 13, finalY + 11);
  if (isErdungOut) { doc.setTextColor(...textColor); doc.setFont("helvetica", "normal"); }
  doc.text("Gemessen an:", 13, finalY + 16);

  drawCheckbox(doc, 33, finalY + 16, "Fundamenterder", !isBlank && selectedErdung.includes("Fundamenterder"));
  drawCheckbox(doc, 73, finalY + 16, "Blitzschutz", !isBlank && selectedErdung.includes("Blitzschutzanlage"));
  drawCheckbox(doc, 108, finalY + 16, "Hauptwasserleitung", !isBlank && selectedErdung.includes("Hauptwasserleitung"));
  drawCheckbox(doc, 150, finalY + 16, "Heizung", !isBlank && selectedErdung.includes("Heizungsanlage"));

  drawCheckbox(doc, 33, finalY + 21, "PA-Schiene", !isBlank && selectedErdung.includes("Potenzialausgleichsschiene"));
  drawCheckbox(doc, 73, finalY + 21, "Gebäudekonstr.", !isBlank && selectedErdung.includes("Gebäudekonstruktion"));
  drawCheckbox(doc, 108, finalY + 21, "Wasserleitung", !isBlank && selectedErdung.includes("Wasserleitung"));
  drawCheckbox(doc, 150, finalY + 21, "Klimaanlage", !isBlank && selectedErdung.includes("Klimaanlage"));

  drawCheckbox(doc, 33, finalY + 26, "Hauptschutzleiter", !isBlank && selectedErdung.includes("Hauptschutzleiter"));
  drawCheckbox(doc, 73, finalY + 26, "Traverse/Tribüne", !isBlank && selectedErdung.includes("Traverse/Tribüne"));
  drawCheckbox(doc, 108, finalY + 26, "Gasleitung", !isBlank && selectedErdung.includes("Gasleitung"));

  const maengelVal = document.getElementById('res_maengel')?.value || "";
  const hatKeineMaengel = maengelVal.startsWith("Keine");
  const hatMaengel = !hatKeineMaengel && maengelVal !== "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Prüfergebnis:", 13, finalY + 32);
  drawCheckbox(doc, 35, finalY + 32, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 80, finalY + 32, "Mängel festgestellt", !isBlank && hatMaengel, true);

  doc.text("Prüfplakette erteilt:", 120, finalY + 32);
  drawCheckbox(doc, 150, finalY + 32, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 162, finalY + 32, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

  const terminVal = document.getElementById('res_termin_date')?.value || "";
  let terminText = "Monat: _____ / Jahr: 20___";
  if (!isBlank && terminVal) {
    const parts = terminVal.split('-');
    if (parts.length === 2) {
      terminText = `Monat: ${parts[1]} / Jahr: ${parts[0]}`;
    } else {
      terminText = terminVal;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text("Nächster Prüftermin:", 13, finalY + 38);
  doc.setFont("helvetica", "normal");
  doc.text(terminText, 48, finalY + 38);

  doc.setFont("helvetica", "bold");
  doc.text("Bemerkungen / Mängel:", 13, finalY + 44);
  doc.setFont("helvetica", "normal");
  doc.text(splitBemerkung, 13, finalY + 49);

  finalY += boxHeight + 5;
  if (finalY > 270) { doc.addPage(); finalY = 15; }

  // GEWÄHRLEISTUNG & UNTERSCHRIFTEN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", 10, finalY);
  drawCheckbox(doc, 58, finalY, "Ja (Anlage entspricht VDE-Regeln)", !isBlank && document.getElementById('res_gewaehrleistung')?.value === "Ja");
  drawCheckbox(doc, 115, finalY, "Nein (Sicherheitsrisiko)", !isBlank && document.getElementById('res_gewaehrleistung')?.value === "Nein", true);

  // DER FREIGABETEXT DARF NUR ERSCHEINEN, WENN TATSÄCHLICH ALLES I.O. IST –
  // BEI MÄNGELN, SICHERHEITSRISIKO ODER N.I.O.-ERGEBNISSEN MUSS EINE WARNUNG STEHEN
  const gewaehrleistungVal = document.getElementById('res_gewaehrleistung')?.value || 'Ja';
  const anySichtNiO = Array.from(s).some(el => el?.value === 'n.i.O.');
  const anyErpNiO = ['erp_anlage', 'erp_schutz', 'erp_drehfeld'].some(id => document.getElementById(id)?.value === 'n.i.O.');
  const hasIssues = !isBlank && (hatMaengel || gewaehrleistungVal === 'Nein' || anySichtNiO || anyErpNiO || anyMeasurementOut || isErdungOut);

  const complianceText = hasIssues
    ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei Sicht-/Funktionsprüfung oder ein Sicherheitsrisiko festgestellt. Die elektrische Anlage entspricht in diesem Zustand NICHT den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch ist NICHT gewährleistet, bis die genannten Mängel behoben und erneut geprüft wurden."
    : "Die elektrische Anlage entspricht den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.";

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  const complianceLines = doc.splitTextToSize(complianceText, 190);
  doc.text(complianceLines, 10, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 2;

  // HÄNDISCHES DATUM BEI UNTERSCHRIFTEN!
  if (!isBlank && !padPruefer.isEmpty()) {
    doc.addImage(padPruefer.toDataURL('image/png'), 'PNG', 10, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(10, finalY + 12, 65, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ort}, den ____________ (Unterschrift Prüfer/-in)`, 10, finalY + 15);

  if (!isBlank && !padKunde.isEmpty()) {
    doc.addImage(padKunde.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 170, finalY + 12);
  doc.text(`${ort}, den ____________ (Unterschrift Auftraggeber/Betreiber)`, 115, finalY + 15);

  // KOPF DER FOLGESEITEN + INFOBOX MIT SEITENZAHL + REVISIONSVERMERK
  drawProtokollSeitenkoepfe(doc, { ...VDE0100_KOPF, protokollNr, pruefNr, revision: FORMULAR_REVISION });

  const filename = isBlank
    ? `VDE_0100_Pruefprotokoll_Leerformular.pdf`
    : `Pruefprotokoll_${protokollNr}_${datum.replace(/\./g, '-')}.pdf`;

  savePdfCompatible(doc, filename);
}

function initSignaturePads() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    kunde: setupSignatureCanvas('sigKunde')
  };
}

// AUTOSAVE DES AKTUELLEN FORMULARS (localStorage), DAMIT EIN VERSEHENTLICHER
// RELOAD NICHT ALLE BEREITS EINGETRAGENEN MESSWERTE VERWIRFT
const AUTOSAVE_KEY = 'vde_protocol_autosave';

const AUTOSAVE_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'pruefnorm', 'netzsystem',
  'netzspannung', 'netzfrequenz', 'vnb', 'messgeraet', 'seriennummer',
  'kalibriert_bis',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'erp_anlage', 'erp_schutz', 'erp_drehfeld',
  'erdung_re', 'res_maengel', 'res_plakette', 'res_termin_date', 'res_gewaehrleistung',
  'res_bemerkungen', 'unterschrift_ort'
];

function collectProtocolState() {
  const state = { fields: {} };
  AUTOSAVE_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.anlage_bez = document.getElementById('anlage_bez').value;
  state.gebaeude = document.getElementById('gebaeude_custom').value;
  state.sicht = Array.from(document.querySelectorAll('.sicht-item')).map(s => s.value);
  state.erdung = Array.from(document.querySelectorAll('.erdung-cb')).map(cb => cb.checked);

  state.circuits = Array.from(document.querySelectorAll('.circuit-card')).map(card => ({
    bez: card.querySelector('.c-bez').value,
    kabel: card.querySelector('.c-kabel-typ').value,
    leiter: card.querySelector('.c-leiter').value,
    qs: card.querySelector('.c-querschnitt').value,
    rpe: card.querySelector('.c-rpe').value,
    riso_mode: card.querySelector('.c-riso-mode').value,
    riso: card.querySelector('.c-riso').value,
    sich: card.querySelector('.c-sich-typ').value,
    zs: card.querySelector('.c-zs').value,
    ik: card.querySelector('.c-ik').value,
    rcd_typ: card.querySelector('.c-rcd-typ').value,
    rcd_idn: card.querySelector('.c-rcd-idn').value,
    rcd_imess: card.querySelector('.c-rcd-imess').value,
    rcd_ta: card.querySelector('.c-rcd-ta').value,
    rcd_pruefstrom: card.querySelector('.c-rcd-pruefstrom').value,
    art: card.querySelector('.c-spannung-art').value,
    umess: card.querySelector('.c-umess').value
  }));

  return state;
}

function restoreProtocolState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  if (state.anlage_bez !== undefined) {
    const ta = document.getElementById('anlage_bez');
    ta.value = state.anlage_bez;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  validateErdung();

  const sichtEls = document.querySelectorAll('.sicht-item');
  (state.sicht || []).forEach((val, i) => { if (sichtEls[i]) sichtEls[i].value = val; });

  const erdungEls = document.querySelectorAll('.erdung-cb');
  (state.erdung || []).forEach((checked, i) => { if (erdungEls[i]) erdungEls[i].checked = checked; });

  if (state.circuits && state.circuits.length) {
    document.getElementById('circuitsContainer').innerHTML = '';
    cardCounter = 0;
    state.circuits.forEach(c => addCircuitCard(c));
  }

  return true;
}

function autosaveProtocol() {
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(collectProtocolState())); } catch (e) {}
}

function loadAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

// SETZT DAS GESAMTE FORMULAR AUF DEN AUSGANGSZUSTAND ZURÜCK (FÜR "NEUES FORMULAR")
function resetVdeForm() {
  document.getElementById('vdeForm').reset();

  document.getElementById('datum').valueAsDate = new Date();
  const nextD = new Date();
  nextD.setFullYear(nextD.getFullYear() + 1);
  document.getElementById('res_termin_date').value = nextD.toISOString().slice(0, 7);

  document.getElementById('anlage_bez').style.height = 'auto';
  document.getElementById('res_bemerkungen').style.height = 'auto';

  applyMasterDataToForm();

  document.getElementById('circuitsContainer').innerHTML = '';
  cardCounter = 0;
  addCircuitCard();
  addCircuitCard();

  if (typeof padPruefer !== 'undefined' && padPruefer) padPruefer.clear();
  if (typeof padKunde !== 'undefined' && padKunde) padKunde.clear();
}