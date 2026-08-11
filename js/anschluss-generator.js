// ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG
// Grundlage: DIN VDE 0100-704 (Definition Übergabepunkt: Netzbetreiber-Anlage endet, Anlage des
// Nutzers beginnt), DIN VDE 0100-711 (Ausstellungen, Shows und Stände), DIN VDE 0100-718
// (Bauliche Anlagen für Menschenansammlungen - fuer Versammlungsstaetten wie das Theater
// einschlaegig), DIN VDE 0100-740 (Fliegende Bauten),
// DIN VDE 0100-600 (allgemeine Prüfmethodik Besichtigen-Erproben-Messen), DIN VDE 0100-520
// (max. 4% Spannungsfall vom Übergabepunkt zum Verbrauchsmittel).

let cardCounter = 0;

function addFeedCard(data = {}) {
  cardCounter++;
  const container = document.getElementById('feedsContainer');
  const card = document.createElement('div');
  card.className = 'feed-card';
  card.id = `feed_${cardCounter}`;

  card.innerHTML = `
    <div class="feed-header">
      <span>Übergabepunkt #${cardCounter}</span>
      <button type="button" class="btn-danger" onclick="removeCard('feed_${cardCounter}')">Entfernen</button>
    </div>

    <div class="grid">
      <div class="form-group grid-full">
        <label>Bezeichnung Übergabepunkt:</label>
        <input type="text" class="c-bez" value="${data.bez || ''}" placeholder="z. B. Bühnenversorgung Haupthaus">
      </div>
      <div class="form-group">
        <label>Netzsystem:</label>
        <select class="c-netzsystem">
          <option${!data.netzsystem || data.netzsystem === 'TN-S' ? ' selected' : ''}>TN-S</option>
          <option${data.netzsystem === 'TN-C-S' ? ' selected' : ''}>TN-C-S</option>
          <option${data.netzsystem === 'TN-C' ? ' selected' : ''}>TN-C</option>
          <option${data.netzsystem === 'TT' ? ' selected' : ''}>TT</option>
          <option${data.netzsystem === 'IT' ? ' selected' : ''}>IT</option>
        </select>
      </div>
      <div class="form-group">
        <label>Netzspannung (V):</label>
        <input type="text" inputmode="decimal" class="c-spannung" value="${data.spannung || ''}" placeholder="z. B. 230 / 400" oninput="formatNetzspannung(this)">
      </div>
      <div class="form-group">
        <label>Frequenz (Hz):</label>
        <input type="text" inputmode="decimal" class="c-frequenz" value="${data.frequenz || ''}" placeholder="z. B. 50 Hz">
      </div>
      <div class="form-group">
        <label>Rechtsdrehfeld (bei Drehstrom):</label>
        <select class="c-drehfeld"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select>
      </div>
      <div class="form-group">
        <label>Geplante Last dieser Versorgung (kVA):</label>
        <input type="text" inputmode="decimal" class="c-last" value="${data.last || ''}" placeholder="z. B. 25">
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">1. Schutzleiterdurchgängigkeit</div>
      <div class="grid">
        <div class="form-group">
          <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
          <input type="text" inputmode="decimal" class="c-rpe" value="${data.rpe || ''}" placeholder="z. B. 0.15" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">2. Absicherung & Schleifenimpedanz am Übergabepunkt</div>
      <div class="grid">
        <div class="form-group">
          <label>Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${data.sich || ''}" placeholder="z. B. B 32A" oninput="validateFeedNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 16A'); validateFeedNorms(${cardCounter})">B 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 32A'); validateFeedNorms(${cardCounter})">B 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 32A'); validateFeedNorms(${cardCounter})">C 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 63A'); validateFeedNorms(${cardCounter})">C 63A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Z<sub>S</sub> (&Omega;):</label>
          <input type="text" inputmode="decimal" class="c-zs" value="${data.zs || ''}" placeholder="z. B. 0.28">
        </div>
        <div class="form-group">
          <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>
          <input type="text" inputmode="decimal" class="c-ik" value="${data.ik || ''}" placeholder="z. B. 605" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">3. Fehlerstrom-Schutzeinrichtung (RCD / FI) am Übergabepunkt</div>
      <div class="grid">
        <div class="form-group">
          <label>RCD Typ:</label>
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${data.rcd_typ || ''}" placeholder="z. B. Typ A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ A')">Typ A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B')">Typ B</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B+')">Typ B+</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Ohne RCD')">Ohne RCD</button>
          </div>
        </div>
        <div class="form-group">
          <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${data.rcd_idn || ''}" placeholder="z. B. 30 mA" oninput="validateFeedNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '30 mA'); validateFeedNorms(${cardCounter})">30 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '300 mA'); validateFeedNorms(${cardCounter})">300 mA</button>
          </div>
        </div>
        <div class="form-group">
          <label>Auslösestrom I<sub>&Delta;mess</sub> (mA):</label>
          <input type="text" inputmode="decimal" class="c-rcd-imess" value="${data.rcd_imess || ''}" placeholder="z. B. 22" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Prüfstrom für Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateFeedNorms(${cardCounter})">
            <option value="1">1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>
            <option value="2">2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>
            <option value="5">5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="fta_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rcd-ta" value="${data.rcd_ta || ''}" placeholder="z. B. 24" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
    </div>
  `;
  if (data.rcd_pruefstrom) card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom;
  container.appendChild(card);
  validateFeedNorms(cardCounter);
}

function validateFeedNorms(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;

  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseFloat(rpeElem.value.replace(',', '.'));
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

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

  // Ausloesezeit gegen den zum Pruefstrom passenden Grenzwert pruefen
  // (40 ms gelten nur bei 5x I_dn, bei 1x I_dn sind 300 ms zulaessig)
  const pruefstromElem = card.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  const taMax = getRcdMaxAusloesezeitMs(pruefstromElem ? pruefstromElem.value : '1', istSelektiv);
  const taLimitLabel = document.getElementById(`fta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = `[max. ${taMax} ms]`;

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taElem.value.trim() !== '') {
    const num = parseFloat(taElem.value.replace(',', '.'));
    if (!isNaN(num) && num > taMax) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');
}

function feedHasOutOfNorm(card) {
  return Array.from(card.querySelectorAll('.c-rpe, .c-ik, .c-rcd-imess, .c-rcd-ta')).some(el => el.classList.contains('out-of-norm'));
}

// validateErdungAnschluss() liegt zentral in pdf-utils.js (Alias auf validateErdung).
// Die frueher hier stehende Kopie ueberschrieb sie beim Laden.
const ERDUNG_RE_GRENZWERT_ANSCHLUSS = ERDUNG_RE_RICHTWERT;

function initSignaturePadsAnschluss() {
  return {
    uebergeber: setupSignatureCanvas('sigUebergeber'),
    uebernehmer: setupSignatureCanvas('sigUebernehmer')
  };
}

function fillExampleDataAnschluss() {
  document.getElementById('pruefungsnummer').value = 'AP-2026-014';
  document.getElementById('pruefer').value = 'Max Mustermann (Elektrofachkraft)';
  document.getElementById('veranstaltung').value = 'Gastspiel "Sommernachtstraum", Freilichtbühne Münsterplatz';
  document.getElementById('bereitsteller_ansprechpartner').value = 'Frau Schneider';
  document.getElementById('bereitsteller_telefon').value = '07531 / 900-0';
  document.getElementById('einspeisung_art').value = 'Baustromverteiler';
  document.getElementById('uebergabe_standort').value = 'Verteilerkasten Bühnenzugang Ost';
  document.getElementById('anschlussleistung_vertrag').value = '63';
  document.getElementById('erdung_re').value = '3.2';
  validateErdungAnschluss();
  document.getElementById('res_bemerkungen').value = 'Übergabepunkt in einwandfreiem Zustand. Keine Mängel festgestellt.';

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard({ bez: 'Bühnenversorgung Haupt', netzsystem: 'TN-S', spannung: '230 / 400', frequenz: '50 Hz', last: '25', rpe: '0.12', sich: 'C 32A', zs: '0.31', ik: '740', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '21', rcd_ta: '24', rcd_pruefstrom: '1' });
}

// KOPFDATEN (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet).
// DIN VDE 0100-718 ergaenzt: Das Stadttheater ist eine Versammlungsstaette,
// fuer die diese Norm (Bauliche Anlagen fuer Menschenansammlungen) einschlaegig ist.
const ANSCHLUSS_KOPF = {
  titel: "ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG",
  normzeile: "Übergabe der Einspeisung nach DIN VDE 0100-704 / -711 / -718 / -740 i.V.m. DIN VDE 0100-600"
};
const ANSCHLUSS_REVISION = "Formular Rev. 2026-08 · Normstand: VDE 0100-600:2017-06 · VDE 0100-718:2019-06";

function generatePDFAnschluss(isBlank = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const primaryColor = [0, 51, 102];
  const textColor = [15, 23, 42];
  const boxBorder = [203, 213, 225];
  const tableHeaderBg = [226, 232, 240];
  const redCellText = [153, 27, 27];

  const getVal = (id, defaultBlank = "____________________") => {
    if (isBlank) return defaultBlank;
    const elem = document.getElementById(id);
    if (!elem) return defaultBlank;
    const val = elem.value ? elem.value.trim() : "";
    return val ? cleanStr(val) : defaultBlank;
  };

  const formatDatum = (isoDate) => {
    if (!isoDate) return "____.____.20__";
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [jahr, monat, tag] = parts;
    return `${tag}.${monat}.${jahr}`;
  };

  const protokollNr = getVal('protokollnummer', "AP-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");
  const datum = isBlank ? "____.____.20__" : formatDatum(document.getElementById('datum').value);
  const ort = getVal('unterschrift_ort', "Konstanz");

  // HEADER: zentrale Funktion aus pdf-utils.js. Sie skaliert Titel und Normzeile
  // automatisch auf die verfuegbaren 112 mm, damit sie die Infobox oben rechts
  // nicht mehr ueberdrucken (fruehere Ausgabe: "STROMVEPRroStoOkolRl-NGr:").
  drawProtokollHeader(doc, ANSCHLUSS_KOPF);

  let y = 24;

  // SEKTION 1: STAMMDATEN + BEREITSTELLER
  doc.setDrawColor(...boxBorder);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.roundedRect(10, y, 190, 46, 1, 1, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("1. STAMMDATEN & BEREITSTELLER DER EINSPEISUNG", 13, y + 5);

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  const gebaeudeVal = getVal('gebaeude_custom', "________");

  doc.text(`Auftraggeber: ${getVal('auftraggeber', 'Stadttheater Konstanz, Inselgasse 2-6')}`, 13, y + 11);
  doc.text(`Gebäude/Bereich: ${gebaeudeVal}`, 13, y + 16);
  doc.text(`Veranstaltung/Anlass: ${getVal('veranstaltung', '____________________')}`, 13, y + 21);
  doc.text(`Prüfer/-in: ${getVal('pruefer', '____________________')}`, 13, y + 26);
  doc.text(`Prüfdatum: ${datum}`, 13, y + 31);
  doc.text(`Prüfgerät: ${getVal('messgeraet', '__________')} (SN: ${getVal('seriennummer', '__________')}, kal. bis ${getVal('kalibriert_bis', '__.__.____')})`, 13, y + 36);

  doc.text(`Firma/Netzbetreiber: ${getVal('vnb', '____________________')}`, 115, y + 11);
  doc.text(`Ansprechpartner/-in: ${getVal('bereitsteller_ansprechpartner', '____________________')}`, 115, y + 16);
  doc.text(`Telefon: ${getVal('bereitsteller_telefon', '____________________')}`, 115, y + 21);
  doc.text(`Art der Einspeisung: ${getVal('einspeisung_art', '____________________')}`, 115, y + 26);
  doc.text(`Standort Übergabepunkt: ${getVal('uebergabe_standort', '____________________')}`, 115, y + 31);
  doc.text(`Vertragl. Anschlussleistung: ${getVal('anschlussleistung_vertrag', '____')} kVA`, 115, y + 36);

  y += 50;

  // SEKTION 2: BESICHTIGEN
  doc.setDrawColor(...boxBorder);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, y, 190, 30, 1, 1, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("2. BESICHTIGEN (SICHTPRÜFUNG ÜBERGABEPUNKT)", 13, y + 5);

  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Verteiler/Zählerschrank:", "2. Steckvorr./Kupplungen:", "3. Zuleitung/Kabel:",
    "4. Kennzeichnung:", "5. Zugänglichkeit:", "6. Zugang Not-Aus:",
    "7. Witterungsschutz:", "8. Berührungsschutz:", "9. Prüfplakette Verteiler:"
  ];
  const sichtCols = [13, 75, 138];
  const sichtChkX = [36, 98, 161];
  sichtLabels.forEach((label, i) => {
    const col = Math.floor(i / 3);
    const row = i % 3;
    const yy = y + 11 + row * 5;
    doc.text(label, sichtCols[col], yy);
    drawCheckbox(doc, sichtChkX[col], yy, "i.O.", !isBlank && s[i]?.value === "i.O.");
    drawCheckbox(doc, sichtChkX[col] + 12, yy, "n.i.O.", !isBlank && s[i]?.value === "n.i.O.", true);
    // Dritte Checkbox: Punkt 7 (Witterungsschutz) kann "n.a." sein, wenn der
    // Uebergabepunkt im Innenbereich liegt. Ohne diese Box blieben bei "n.a."
    // beide Felder leer und das Protokoll sah aus wie "nicht geprueft".
    if (s[i]?.querySelector?.('option[value="n.a."]') || Array.from(s[i]?.options || []).some(o => o.value === 'n.a.')) {
      drawCheckbox(doc, sichtChkX[col] + 26, yy, "n.a.", !isBlank && s[i]?.value === "n.a.");
    }
  });

  y += 34;

  // SEKTION 3: ÜBERGABEPUNKTE TABELLE
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("3. MESSTECHNISCHE PRÜFUNGEN JE ÜBERGABEPUNKT (SCHUTZLEITER, SCHLEIFENIMPEDANZ, RCD)", 10, y);

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: [254, 226, 226], textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const tableRows = [];
  let anyFeedMeasurementOut = false;
  if (isBlank) {
    for (let i = 1; i <= 4; i++) tableRows.push([i, "", "", "", "", "", "", "", ""]);
  } else {
    const cards = document.querySelectorAll('.feed-card');
    cards.forEach((card, idx) => {
      const netzsystem = card.querySelector('.c-netzsystem').value;
      let volt = card.querySelector('.c-spannung').value;
      if (volt && !volt.toLowerCase().includes('v')) volt += ' V';
      let freq = card.querySelector('.c-frequenz').value;
      if (freq && !freq.toLowerCase().includes('hz')) freq += ' Hz';
      const netzSpannungFreq = [netzsystem, [volt, freq].filter(p => p).join(', ')].filter(p => p).join(' - ') || '-';

      const drehfeld = card.querySelector('.c-drehfeld').value;

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeNum = parseFloat(rpeVal.replace(',', '.'));
      const isRpeOut = !isNaN(rpeNum) && rpeNum > 0.30;
      const rpeText = rpeVal ? `${rpeVal} Ohm` : '-';

      const sich = card.querySelector('.c-sich-typ').value || '-';
      const zs = card.querySelector('.c-zs').value;
      const ik = card.querySelector('.c-ik').value;
      const minIk = getMinIk(sich);
      const ikNum = parseFloat(ik.replace(',', '.'));
      const isIkOut = minIk !== null && !isNaN(ikNum) && ikNum < minIk;
      let zsik = '-';
      if (zs || ik) zsik = `${zs || '-'} Ohm / ${ik || '-'} A`;

      const rcdTyp = card.querySelector('.c-rcd-typ').value || '-';
      const rcdIdn = card.querySelector('.c-rcd-idn').value || '-';
      const rcdImess = card.querySelector('.c-rcd-imess').value;
      const rcdTa = card.querySelector('.c-rcd-ta').value;
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '1';
      const istSelektivPdf = /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTyp);
      const taMaxPdf = getRcdMaxAusloesezeitMs(rcdPruefstrom, istSelektivPdf);
      const taNum = parseFloat(rcdTa.replace(',', '.'));
      const isTaOut = !isNaN(taNum) && taNum > taMaxPdf;
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseFloat(rcdImess.replace(',', '.'));
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);
      const isRcdOut = isTaOut || isImessOut;

      let rcdText = `${rcdTyp} (${rcdIdn})`;
      if (rcdImess || rcdTa) rcdText += `\n${rcdImess || '-'} mA / ${rcdTa || '-'} ms bei ${rcdPruefstrom}x IdN`;

      const last = card.querySelector('.c-last').value;

      if (isRpeOut || isIkOut || isRcdOut) anyFeedMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(netzSpannungFreq),
        cleanStr(drehfeld),
        makeCell(cleanStr(rpeText), isRpeOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut),
        makeCell(cleanStr(rcdText), isRcdOut),
        last ? `${cleanStr(last)} kVA` : '-'
      ]);
    });
  }

  doc.autoTable({
    startY: y + 2.5,
    head: [['Nr.', 'Bezeichnung', 'Netzsystem/Spannung/Freq.', 'Drehfeld', 'R_PE', 'Absicherung', 'Z_S / I_K', 'RCD (Typ/Idn/Mess)', 'Geplante Last']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: tableHeaderBg, textColor: primaryColor, fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 6 }, 1: { cellWidth: 26, halign: 'left' }, 2: { cellWidth: 32 },
      3: { cellWidth: 12 }, 4: { cellWidth: 16 }, 5: { cellWidth: 16 },
      6: { cellWidth: 22 }, 7: { cellWidth: 42 }, 8: { cellWidth: 16 }
    },
    margin: { left: 10, right: 10 },
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 8 : 5 }
  });

  let finalY = doc.lastAutoTable.finalY + 6;
  if (finalY > 210) { doc.addPage(); finalY = 15; }

  // SEKTION 4: ERDUNG, BEWERTUNG & FREIGABE
  let bemerkungenText = getVal('res_bemerkungen', '');
  if (isBlank) bemerkungenText = "________________________________________________________________________________________________________";
  const splitBemerkung = doc.splitTextToSize(bemerkungenText, 180);
  const boxHeight = 42 + (splitBemerkung.length * 4);

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

  const paVal = document.getElementById('pa_angeschlossen')?.value || '';
  doc.text(`Potenzialausgleich angeschlossen: ${isBlank ? '________' : paVal}`, 13, finalY + 11);

  const erdungReNum = parseFloat((document.getElementById('erdung_re')?.value || '').replace(',', '.'));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS;
  if (isErdungOut) { doc.setTextColor(...redCellText); doc.setFont("helvetica", "bold"); }
  doc.text(`Erdungswiderstand R_E: ${getVal('erdung_re', '__________')} Ohm (Richtwert <= ${ERDUNG_RE_GRENZWERT_ANSCHLUSS} Ohm)`, 13, finalY + 16);
  if (isErdungOut) { doc.setTextColor(...textColor); doc.setFont("helvetica", "normal"); }

  const maengelVal = document.getElementById('res_maengel')?.value || "";
  const hatKeineMaengel = maengelVal.startsWith("Keine");
  const hatMaengel = !hatKeineMaengel && maengelVal !== "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Prüfergebnis:", 13, finalY + 22);
  drawCheckbox(doc, 35, finalY + 22, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 80, finalY + 22, "Mängel festgestellt", !isBlank && hatMaengel, true);

  const leistungVal = document.getElementById('res_leistung_ausreichend')?.value || '';
  doc.text("Anschlussleistung ausreichend:", 118, finalY + 22);
  drawCheckbox(doc, 156, finalY + 22, "Ja", !isBlank && leistungVal === "Ja");
  drawCheckbox(doc, 165, finalY + 22, "Nein", !isBlank && leistungVal === "Nein", true);
  // "n.a." war im Formular waehlbar, im PDF aber nicht darstellbar
  drawCheckbox(doc, 178, finalY + 22, "n.a.", !isBlank && leistungVal === "n.a.");

  const freigabeVal = document.getElementById('res_freigabe')?.value || 'Ja';
  doc.text("Freigabe zur Nutzung:", 13, finalY + 28);
  drawCheckbox(doc, 45, finalY + 28, "Ja", !isBlank && freigabeVal === "Ja");
  drawCheckbox(doc, 55, finalY + 28, "Nein", !isBlank && freigabeVal === "Nein", true);

  const terminVal = document.getElementById('res_termin_date')?.value || '';
  const terminText = isBlank ? "____.____.20__" : formatDatum(terminVal);
  doc.setFont("helvetica", "normal");
  doc.text(`Befristet bis / Rückgabe am: ${terminText}`, 100, finalY + 28);

  doc.setFont("helvetica", "bold");
  doc.text("Bemerkungen / Mängel:", 13, finalY + 34);
  doc.setFont("helvetica", "normal");
  doc.text(splitBemerkung, 13, finalY + 39);

  finalY += boxHeight + 5;
  if (finalY > 270) { doc.addPage(); finalY = 15; }

  const anySichtNiO = Array.from(s).some(el => el?.value === 'n.i.O.');
  const hasIssues = !isBlank && (hatMaengel || freigabeVal === 'Nein' || leistungVal === 'Nein' || anySichtNiO || anyFeedMeasurementOut || isErdungOut);

  const complianceText = hasIssues
    ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei der Sichtprüfung, eine nicht ausreichende Anschlussleistung oder ein Sicherheitsrisiko festgestellt. Der Übergabepunkt ist in diesem Zustand NICHT freigegeben. Eine Nutzung ist erst nach Beseitigung der genannten Mängel und erneuter Prüfung zulässig."
    : "Der Übergabepunkt wurde besichtigt, erprobt und gemessen. Er entspricht den anerkannten Regeln der Elektrotechnik und ist zur Nutzung durch den Veranstalter im genannten Rahmen freigegeben.";

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  const complianceLines = doc.splitTextToSize(complianceText, 190);
  doc.text(complianceLines, 10, finalY);
  doc.setTextColor(...textColor);

  finalY += complianceLines.length * 3.2 + 6;

  if (!isBlank && !padUebergeber.isEmpty()) {
    doc.addImage(padUebergeber.toDataURL('image/png'), 'PNG', 10, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(10, finalY + 12, 65, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ort}, den ____________ (Übergebende/-r)`, 10, finalY + 15);

  if (!isBlank && !padUebernehmer.isEmpty()) {
    doc.addImage(padUebernehmer.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 170, finalY + 12);
  doc.text(`${ort}, den ____________ (Übernehmende/-r)`, 115, finalY + 15);

  drawProtokollSeitenkoepfe(doc, { ...ANSCHLUSS_KOPF, protokollNr, pruefNr, revision: ANSCHLUSS_REVISION });

  const filename = isBlank
    ? `Anschlusspruefung_Uebergabepunkt_Leerformular.pdf`
    : `Anschlusspruefung_${protokollNr}_${datum.replace(/\./g, '-')}.pdf`;

  savePdfCompatible(doc, filename);
}

// AUTOSAVE
const ANSCHLUSS_AUTOSAVE_KEY = 'anschluss_protocol_autosave';

const ANSCHLUSS_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'messgeraet', 'seriennummer',
  'kalibriert_bis',
  'bereitsteller_ansprechpartner', 'bereitsteller_telefon', 'einspeisung_art',
  'uebergabe_standort', 'anschlussleistung_vertrag', 'vnb',
  'pa_angeschlossen', 'erdung_re', 'res_maengel', 'res_leistung_ausreichend',
  'res_freigabe', 'res_termin_date', 'res_bemerkungen', 'unterschrift_ort'
];

function collectAnschlussState() {
  const state = { fields: {} };
  ANSCHLUSS_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.veranstaltung = document.getElementById('veranstaltung').value;
  state.gebaeude = document.getElementById('gebaeude_custom').value;
  state.sicht = Array.from(document.querySelectorAll('.sicht-item')).map(s => s.value);

  state.feeds = Array.from(document.querySelectorAll('.feed-card')).map(card => ({
    bez: card.querySelector('.c-bez').value,
    netzsystem: card.querySelector('.c-netzsystem').value,
    spannung: card.querySelector('.c-spannung').value,
    frequenz: card.querySelector('.c-frequenz').value,
    drehfeld: card.querySelector('.c-drehfeld').value,
    last: card.querySelector('.c-last').value,
    rpe: card.querySelector('.c-rpe').value,
    sich: card.querySelector('.c-sich-typ').value,
    zs: card.querySelector('.c-zs').value,
    ik: card.querySelector('.c-ik').value,
    rcd_typ: card.querySelector('.c-rcd-typ').value,
    rcd_idn: card.querySelector('.c-rcd-idn').value,
    rcd_imess: card.querySelector('.c-rcd-imess').value,
    rcd_ta: card.querySelector('.c-rcd-ta').value,
    rcd_pruefstrom: card.querySelector('.c-rcd-pruefstrom').value
  }));

  return state;
}

function restoreAnschlussState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  if (state.veranstaltung !== undefined) {
    const ta = document.getElementById('veranstaltung');
    ta.value = state.veranstaltung;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  validateErdungAnschluss();

  const sichtEls = document.querySelectorAll('.sicht-item');
  (state.sicht || []).forEach((val, i) => { if (sichtEls[i]) sichtEls[i].value = val; });

  if (state.feeds && state.feeds.length) {
    document.getElementById('feedsContainer').innerHTML = '';
    cardCounter = 0;
    state.feeds.forEach(f => addFeedCard(f));
    document.querySelectorAll('.feed-card').forEach((card, i) => {
      const f = state.feeds[i];
      if (f.drehfeld) card.querySelector('.c-drehfeld').value = f.drehfeld;
    });
  }

  return true;
}

function autosaveProtocol() {
  try { localStorage.setItem(ANSCHLUSS_AUTOSAVE_KEY, JSON.stringify(collectAnschlussState())); } catch (e) {}
}

function loadAnschlussAutosave() {
  try {
    const raw = localStorage.getItem(ANSCHLUSS_AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearAnschlussAutosave() {
  localStorage.removeItem(ANSCHLUSS_AUTOSAVE_KEY);
}

function resetAnschlussForm() {
  document.getElementById('anschlussForm').reset();

  document.getElementById('datum').valueAsDate = new Date();
  document.getElementById('veranstaltung').style.height = 'auto';
  document.getElementById('res_bemerkungen').style.height = 'auto';

  applyMasterDataToForm();

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard();

  if (typeof padUebergeber !== 'undefined' && padUebergeber) padUebergeber.clear();
  if (typeof padUebernehmer !== 'undefined' && padUebernehmer) padUebernehmer.clear();
}

function neuesAnschlussProtokoll() {
  if (!confirm('Neues Formular anlegen? Alle aktuell eingetragenen Daten in diesem Formular werden zurückgesetzt.')) return;

  const nr = updateProtokollCounter(true, 'AP');
  resetAnschlussForm();
  document.getElementById('protokollnummer').value = nr;
  clearAnschlussAutosave();
  alert(`Neues Protokoll angelegt: ${nr}`);
}
