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
  document.getElementById('res_termin_date').valueAsDate = next;
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
        <input type="text" class="c-bez" value="${data.bez || ''}" placeholder="z. B. PAR-Scheinwerfer Lichtregie">
      </div>
      <div class="form-group">
        <label>Hersteller / Typ:</label>
        <input type="text" class="c-typ" value="${data.typ || ''}" placeholder="z. B. ADB, PAR64">
      </div>
      <div class="form-group">
        <label>Inventar- / Seriennummer:</label>
        <input type="text" class="c-invnr" value="${data.invnr || ''}" placeholder="z. B. INV-0231">
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
        <input type="text" inputmode="decimal" class="c-laenge" value="${data.laenge || ''}" placeholder="z. B. 10" oninput="validateDeviceNorms(${cardCounter})">
      </div>
      <div class="form-group">
        <label class="checkbox-item" style="margin-top: 20px;">
          <input type="checkbox" class="c-heizelement" ${data.heizelement ? 'checked' : ''} onchange="validateDeviceNorms(${cardCounter})"> Gerät mit Heizelement
        </label>
      </div>
      <div class="form-group">
        <label>Heizleistung (kW), falls Heizelement:</label>
        <input type="text" inputmode="decimal" class="c-heizleistung" value="${data.heizleistung || ''}" placeholder="z. B. 2.0" oninput="validateDeviceNorms(${cardCounter})">
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
          <input type="text" inputmode="decimal" class="c-rpe" value="${data.rpe || ''}" placeholder="z. B. 0.20" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>R<sub>ISO</sub> (M&Omega;) <span class="limit-hint" id="riso_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-riso" value="${data.riso || ''}" placeholder="z. B. > 100" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Ableitstrom (mA) <span class="limit-hint" id="ableit_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-ableitstrom" value="${data.ableitstrom || ''}" placeholder="z. B. 0.3" oninput="validateDeviceNorms(${cardCounter})">
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

function validateDeviceNorms(cardId) {
  const card = document.getElementById(`device_${cardId}`);
  if (!card) return;

  const schutzklasse = card.querySelector('.c-schutzklasse').value;
  const hatHeizelement = card.querySelector('.c-heizelement').checked;
  const laenge = card.querySelector('.c-laenge').value;
  const heizleistung = card.querySelector('.c-heizleistung')?.value;

  const rpeElem = card.querySelector('.c-rpe');
  const rpeMax = getRpeMaxDevice(laenge);
  const rpeLimitLabel = document.getElementById(`rpe_limit_${cardId}`);
  if (rpeLimitLabel) rpeLimitLabel.textContent = `[max. ${rpeMax.toFixed(2)} Ohm]`;
  if (rpeElem.value.trim() !== '') {
    const num = parseFloat(rpeElem.value.replace(',', '.'));
    if (!isNaN(num) && num > rpeMax) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else rpeElem.classList.remove('out-of-norm');

  const risoElem = card.querySelector('.c-riso');
  const risoMin = getIsoMin(schutzklasse, hatHeizelement);
  const risoLimitLabel = document.getElementById(`riso_limit_${cardId}`);
  if (risoLimitLabel) risoLimitLabel.textContent = risoMin !== null ? `[min. ${risoMin} MOhm]` : '';
  if (risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseFloat(txt.replace(',', '.'));
      if (!isNaN(num) && risoMin !== null && num < risoMin) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else risoElem.classList.remove('out-of-norm');

  const ableitElem = card.querySelector('.c-ableitstrom');
  const ableitMax = getAbleitstromMax(schutzklasse, heizleistung);
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
  const datum = isBlank ? "____.____.20__" : (formatDatum(document.getElementById('datum').value) || "____.____.20__");
  const naechsterTermin = isBlank ? "" : formatDatum(document.getElementById('res_termin_date').value);
  const ort = getVal('unterschrift_ort', "Konstanz");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);

  drawProtokollHeader(doc, GERAETE_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN (Kategorie "stamm" = blau) ------------------- */
  const SEK1_H = 37;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN & PRÜFART", kat: 'stamm' });

  doc.setFontSize(7.5);
  const spL = 14, spR = 108, spB = 88;

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

  drawFeldZeile(doc, "Auftraggeber:",     feldWert('auftraggeber'),    spL, y + 11, spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",  feldWert('gebaeude_custom'), spL, y + 16, spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",       feldWert('pruefer'),         spL, y + 21, spB, isBlank);
  drawFeldZeile(doc, "Prüfgerät:",        messgeraetText,              spL, y + 26, spB, isBlank);
  // Kalibriergueltigkeit des Pruefmittels: nach DGUV V3 fuer die Beweiskraft
  // der Messwerte erforderlich.
  drawFeldZeile(doc, "Prüfgerät kalibriert bis:", formatDatum(document.getElementById('kalibriert_bis')?.value) || '', spL, y + 31, spB, isBlank);

  drawFeldZeile(doc, "Prüfart:",             feldWert('pruefart'),       spR, y + 11, spB, isBlank);
  drawFeldZeile(doc, "Prüffrist:",           pruefintervallText,         spR, y + 16, spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",           isBlank ? '' : datum,       spR, y + 21, spB, isBlank);
  drawFeldZeile(doc, "Nächster Prüftermin:", naechsterTermin,            spR, y + 26, spB, isBlank);
  drawFeldZeile(doc, "Protokoll-Nr.:",       isBlank ? '' : protokollNr, spR, y + 31, spB, isBlank);

  y += SEK1_H + 8;

  // SEKTION 2: GERÄTE-TABELLE (Kategorie "messen" = gruen)
  const katMessen = drawKategorieTitel(doc, "2. GERÄTE: BESICHTIGEN, ERPROBEN, MESSEN", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Grenzwerte je Spalte im Tabellenkopf (DIN EN 50678 / 50699). Unzulässige Werte werden rot hinterlegt.", 13.5, y + 3.6);
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
    "0,22 Ohm\n(max. 0,40)",
    "> 100 MOhm\n(min. 1)",
    "0,3 mA (max. 3,5)\nSchutzleiterstrom\nErsatzableitstrom"
  ];

  if (isBlank) {
    tableRows.push(BEISPIEL_ZEILE_GP);
    // 12 Leerzeilen: Tabelle, Gesamtbeurteilung und Unterschriften passen so
    // gemeinsam auf eine Seite.
    for (let i = 1; i <= 12; i++) tableRows.push([i, "", "", "", "", "", "", "", "", ""]);
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
      const isRpeOut = !isNaN(rpeNum) && rpeNum > rpeMax;
      // Grenzwert mitdrucken: er haengt von der Leitungslaenge ab und war fuer
      // den Leser des PDF sonst nicht nachvollziehbar.
      const rpeText = rpeVal ? `${rpeVal} Ohm\n(max. ${rpeMax.toFixed(2)})` : '-';

      const risoVal = card.querySelector('.c-riso').value;
      const risoMin = getIsoMin(sk, card.querySelector('.c-heizelement').checked);
      const isRisoOut = !risoVal.trim().startsWith('>') && risoMin !== null && !isNaN(parseFloat(risoVal.replace(',', '.'))) && parseFloat(risoVal.replace(',', '.')) < risoMin;
      const risoText = risoVal ? `${risoVal} MOhm\n(min. ${risoMin})` : '-';

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
        laengeVal ? `${laengeVal} m` : '-',
        makeCell(cleanStr(sichtText), sichtNiO),
        makeCell(cleanStr(funktion), isFunktionOut),
        makeCell(cleanStr(rpeText), isRpeOut),
        makeCell(cleanStr(risoText), isRisoOut),
        makeCell(cleanStr(ableitText), isAbleitOut)
      ]);
    });
  }

  doc.autoTable({
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
      'R_PE (Ohm)\n<= 0,30 bis 5 m\n+0,1 je 7,5 m',
      'R_ISO (MOhm)\nSK I >= 1,0\nSK II >= 2,0',
      'Ableitstrom (mA)\nSK I <= 3,5 / SK II <= 0,5\nMessverfahren'
    ]],
    body: tableRows,
    theme: 'grid',
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
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 8 : 5, overflow: 'linebreak' },
    didParseCell: (data) => {
      if (isBlank && data.section === 'body' && data.row.index === 0) {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [100, 116, 139];
        data.cell.styles.fillColor = [248, 250, 252];
        data.cell.styles.fontSize = 5.4;
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 6;

  // SEKTION 3: GESAMTBEWERTUNG (Kategorie "ergebnis")
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, 178) : [];
  const bemZeilen = isBlank ? 4 : Math.max(splitBemerkung.length, 1);

  const offErgebnis = 12;
  const offBemLabel = offErgebnis + 7;
  const offBemStart = offBemLabel + 4.5;
  const boxHeight   = offBemStart + bemZeilen * 4.5 + 3;

  finalY = pdfPlatzPruefen(doc, finalY, boxHeight);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "3. GESAMTBEURTEILUNG", kat: 'ergebnis' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  const maengelVal = document.getElementById('res_maengel')?.value || "";
  const hatKeineMaengel = maengelVal.startsWith("Keine");
  const hatMaengel = !hatKeineMaengel && maengelVal !== "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Prüfergebnis:", 14, finalY + offErgebnis);
  drawCheckbox(doc, 36, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 82, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  doc.text("Prüfplakette erteilt:", 122, finalY + offErgebnis);
  drawCheckbox(doc, 152, finalY + offErgebnis, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 164, finalY + offErgebnis, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Bemerkungen / Mängel:", 14, finalY + offBemLabel);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  if (isBlank || splitBemerkung.length === 0) {
    drawSchreibLinien(doc, 14, finalY + offBemStart + 1, 182, bemZeilen, 4.5);
  } else {
    doc.text(splitBemerkung, 14, finalY + offBemStart);
  }

  finalY += boxHeight + 6;
  finalY = pdfPlatzPruefen(doc, finalY, 36);

  const gewaehrleistungVal = document.getElementById('res_gewaehrleistung')?.value || 'Ja';
  const hasIssues = !isBlank && (hatMaengel || gewaehrleistungVal === 'Nein' || anyDeviceOut);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", 10, finalY);
  drawCheckbox(doc, 58, finalY, "Ja (Geräte entsprechen den Normen)", !isBlank && gewaehrleistungVal === "Ja");
  drawCheckbox(doc, 118, finalY, "Nein (Sicherheitsrisiko)", !isBlank && gewaehrleistungVal === "Nein", true);

  const complianceText = hasIssues
    ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte oder ein n.i.O.-Ergebnis bei Sicht-/Funktionsprüfung festgestellt. Die betroffenen Geräte entsprechen NICHT den anerkannten Regeln der Elektrotechnik und dürfen bis zur Mängelbeseitigung und erneuten Prüfung NICHT weiter betrieben werden."
    : "Die geprüften Geräte entsprechen den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.";

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  const complianceLines = doc.splitTextToSize(complianceText, 190);
  doc.text(complianceLines, 10, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 4;
  finalY = pdfPlatzPruefen(doc, finalY, 20);

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
  doc.text(`${ortDatum} – Unterschrift Prüfer/-in`, 10, finalY + 15);

  if (!isBlank && !padKunde.isEmpty()) {
    doc.addImage(padKunde.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 200, finalY + 12);
  doc.text(`${ortDatum} – Unterschrift Auftraggeber/Betreiber`, 115, finalY + 15);

  drawProtokollSeitenkoepfe(doc, { ...GERAETE_KOPF, protokollNr, pruefNr, datum, revision: GERAETE_REVISION });

  const filename = isBlank
    ? `Geraetepruefung_50678_50699_Leerformular.pdf`
    : `Geraetepruefung_${protokollNr}_${datum.replace(/\./g, '-')}.pdf`;

  savePdfCompatible(doc, filename);
}

// AUTOSAVE
const GERAETE_AUTOSAVE_KEY = 'geraete_protocol_autosave';

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
    if (el) el.value = val;
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);

  if (state.devices && state.devices.length) {
    document.getElementById('devicesContainer').innerHTML = '';
    cardCounter = 0;
    state.devices.forEach(d => addDeviceCard(d));
    document.querySelectorAll('#devicesContainer .feed-card').forEach((card, i) => {
      const d = state.devices[i];
      const sichtEls = card.querySelectorAll('.c-sicht-item');
      (d.sicht || []).forEach((val, j) => { if (sichtEls[j]) sichtEls[j].value = val; });
      if (d.funktion) card.querySelector('.c-funktion').value = d.funktion;
      if (d.ableit_methode) card.querySelector('.c-ableit-methode').value = d.ableit_methode;
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

  document.getElementById('datum').valueAsDate = new Date();
  document.getElementById('unterschrift_datum').valueAsDate = new Date();
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

  const nr = updateProtokollCounter(true, 'GP');
  resetGeraeteForm();
  document.getElementById('protokollnummer').value = nr;
  clearGeraeteAutosave();
  alert(`Neues Protokoll angelegt: ${nr}`);
}
