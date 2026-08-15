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
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${data.sich || ''}" placeholder="z. B. B 32A" oninput="validateFeedNorms(${cardCounter})" autocomplete="off">
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
          <label>Prüfstrom für Auslösestrom / Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateFeedNorms(${cardCounter})">
            <option value="" selected>&ndash; bitte wählen &ndash;</option>
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
  // Kein Vorgabewert: der Prüfstrom bestimmt den zulaessigen Grenzwert der
  // Ausloesezeit und muss deshalb bewusst gewaehlt werden.
  card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom || '';
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
  // Ohne gewaehlten Pruefstrom gibt es keinen definierten Grenzwert.
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById(`fta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '') {
    const num = parseFloat(taElem.value.replace(',', '.'));
    if (!isNaN(num) && num > taMax) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein
  // (DIN VDE 0100-600 Abschn. 6.4.3.7). Fehlende Messwerte werden markiert,
  // statt stillschweigend als "-" gedruckt zu werden. Diese Pruefung fehlte in
  // der Anschlusspruefung bisher komplett - ein nie ausgeloester RCD fiel
  // dadurch niemandem auf.
  const imessMarkElem = card.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  [imessMarkElem, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && rcdWertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });
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
  toggleEinspeisungSonstiges('Baustromverteiler');
  document.getElementById('uebergabe_standort').value = 'Verteilerkasten Bühnenzugang Ost';
  document.getElementById('anschlussleistung_vertrag').value = '63';
  document.getElementById('erdung_re').value = '3.2';
  document.getElementById('pa_widerstand').value = '0.14';
  document.getElementById('pa_messpunkt').value = 'PA-Schiene im Übergabeverteiler Bühnenzugang Ost';
  validateErdungAnschluss();
  document.getElementById('res_bemerkungen').value = 'Übergabepunkt in einwandfreiem Zustand. Keine Mängel festgestellt.';

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard({ bez: 'Bühnenversorgung Haupt', netzsystem: 'TN-S', spannung: '230 / 400', frequenz: '50 Hz', rpe: '0.12', sich: 'C 32A', zs: '0.31', ik: '740', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '21', rcd_ta: '17', rcd_pruefstrom: '5' });
}

// KOPFDATEN (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet).
// Der Titel wurde gekuerzt: mit dem Zusatz "STROMVERSORGUNG" war er so lang,
// dass drawFittedText ihn deutlich staerker verkleinern musste als bei den
// anderen beiden Protokollen - die Kopfzeile sah dadurch anders aus.
// Der Zusatz steht jetzt in der Normzeile.
// DIN VDE 0100-718 ergaenzt: Das Stadttheater ist eine Versammlungsstaette,
// fuer die diese Norm (Bauliche Anlagen fuer Menschenansammlungen) einschlaegig ist.
const ANSCHLUSS_KOPF = {
  titel: "ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT",
  normzeile: "Übergabe der Stromversorgung nach DIN VDE 0100-704 / -711 / -718 / -740 i.V.m. DIN VDE 0100-600"
};
const ANSCHLUSS_REVISION = "Formular Rev. 2026-08 · Normstand: VDE 0100-600:2017-06 · VDE 0100-718:2019-06";

function generatePDFAnschluss(isBlank = false) {
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung -> Abbruch vor dem Aufbau des PDF.
   * Gilt nie fuer das Leerformular. */
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);
  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    alert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Doppelvergabe: wurde diese Nummer in dieser App schon einmal fuer ein
   * fertiges PDF verwendet, muss das ausdruecklich bestaetigt werden. */
  const nummerRoh = isBlank ? '' : (document.getElementById('protokollnummer')?.value || '').trim();
  if (!isBlank && !protokollNummerFreigeben(nummerRoh)) return;

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

  const protokollNr = getVal('protokollnummer', "AP-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");
  const datum = isBlank ? "" : (formatDatum(document.getElementById('datum').value) || "");
  const ort = getVal('unterschrift_ort', "Konstanz");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // Im Leerformular bleiben die Kopf-Felder leer -> dort erscheinen Schreiblinien
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  // Auch im AUSGEFUELLTEN Protokoll darf kein Ausfuell-Platzhalter stehen: ist
  // die Prueflings-ID leer, zeichnet kopfFeld() dort eine Schreiblinie.
  const kopfPruefNr = isBlank ? "" : feldWert('pruefungsnummer');

  // HEADER: zentrale Funktion aus pdf-utils.js. Sie skaliert Titel und Normzeile
  // automatisch auf die verfuegbaren 112 mm, damit sie die Infobox oben rechts
  // nicht mehr ueberdrucken (fruehere Ausgabe: "STROMVEPRroStoOkolRl-NGr:").
  drawProtokollHeader(doc, ANSCHLUSS_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN + BEREITSTELLER ------------------------------
   * Kompakt: 6 Zeilen je Spalte, Zeilenabstand 4,6 mm. Protokoll-Nr. und
   * Prueflings-ID stehen in der Kopfbox und werden hier nicht wiederholt. */
  const ZA = 4.6;
  const SEK1_H = 36;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN & BEREITSTELLER DER EINSPEISUNG", kat: 'stamm' });

  doc.setFontSize(7.2);
  const spL = 13, spR = 107, spB = 90;

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    const kal = formatDatum(document.getElementById('kalibriert_bis')?.value);
    let t = g;
    if (sn) t += ` (SN ${sn}`;
    if (sn && kal) t += `, kal. bis ${kal}`;
    if (sn) t += ')';
    return t;
  })();

  const z1 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Auftraggeber:",         feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",      feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Veranstaltung/Anlass:", feldWert('veranstaltung'),   spL, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",           feldWert('pruefer'),         spL, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",            datum,                       spL, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Prüfgerät:",            messgeraetText,              spL, z1(5), spB, isBlank);

  drawFeldZeile(doc, "Firma/Netzbetreiber:",     feldWert('vnb'),                           spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Ansprechpartner/-in:",     feldWert('bereitsteller_ansprechpartner'),  spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Telefon:",                 feldWert('bereitsteller_telefon'),          spR, z1(2), spB, isBlank);
  // Bei "Sonstiges" wird die eingetragene Herkunft mit ausgegeben
  const einspeisungText = (() => {
    const art = feldWert('einspeisung_art');
    const sonst = feldWert('einspeisung_sonstiges');
    if (art && /sonstig/i.test(art) && sonst) return `${art}: ${sonst}`;
    return art;
  })();
  drawFeldZeile(doc, "Art der Einspeisung:",     einspeisungText,                            spR, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Standort Übergabepunkt:",  feldWert('uebergabe_standort'),             spR, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Anschlussleistung (kVA):", feldWert('anschlussleistung_vertrag'),      spR, z1(5), spB, isBlank);

  y += SEK1_H + 4;

  /* --- SEKTION 2: BESICHTIGEN ---------------------------------------------
   * 3 Spalten (spart zwei Zeilen Hoehe). Die Bezeichnungen sind gekuerzt und
   * werden bei Bedarf automatisch verkleinert, damit sie nicht unter die
   * Ankreuzkaestchen laufen. */
  const SEK2_H = 23;
  drawKategorieBox(doc, { y, h: SEK2_H, titel: "2. BESICHTIGEN (SICHTPRÜFUNG ÜBERGABEPUNKT)", kat: 'sicht' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Verteiler/Zählerschr.", "2. Steckvorr./Kuppl.", "3. Zuleitung/Kabel",
    "4. Kennzeichnung", "5. Zugänglichkeit", "6. Not-Aus/Hauptschalter",
    "7. Witterungsschutz", "8. Berührungsschutz", "9. Prüfplakette"
  ];
  const SICHT_LABEL_X = [13, 76, 139];
  const SICHT_CB_X    = [42, 105, 165];
  // In der dritten Spalte stiess die Beschriftung bisher ohne Abstand an das
  // i.O.-Kaestchen (139 + 27 = 166 gegen Kaestchen bei 165). Die verfuegbare
  // Textbreite ist dort deshalb auf 23 mm begrenzt (Ende 162, also 3 mm Luft);
  // die laengste Beschriftung wurde zusaetzlich gekuerzt. Das Kaestchen bleibt
  // bei 165, damit die dritte Box ("n.a.") rechts nicht ueber den Satzspiegel
  // hinauslaeuft.
  const SICHT_LABEL_W = [27, 27, 23];

  sichtLabels.forEach((label, i) => {
    const spalte = Math.floor(i / 3);
    const zeile = i % 3;
    const yy = y + 10 + zeile * ZA;
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', SICHT_LABEL_X[spalte], yy, SICHT_LABEL_W[spalte], 7, 5.4);
    doc.setFontSize(7);
    drawCheckbox(doc, SICHT_CB_X[spalte], yy, "i.O.", !isBlank && s[i]?.value === "i.O.");
    drawCheckbox(doc, SICHT_CB_X[spalte] + 11, yy, "n.i.O.", !isBlank && s[i]?.value === "n.i.O.", true);
    // Dritte Checkbox: Punkt 7 (Witterungsschutz) kann "n.a." sein, wenn der
    // Uebergabepunkt im Innenbereich liegt. Ohne diese Box blieben bei "n.a."
    // beide Felder leer und das Protokoll sah aus wie "nicht geprueft".
    const hatNa = isBlank ? (i === 6) : Array.from(s[i]?.options || []).some(o => o.value === 'n.a.');
    if (hatNa) drawCheckbox(doc, SICHT_CB_X[spalte] + 24, yy, "n.a.", !isBlank && s[i]?.value === "n.a.");
  });

  y += SEK2_H + 6;

  // SEKTION 3: ÜBERGABEPUNKTE TABELLE (Kategorie "messen" = gruen)
  const katMessen = drawKategorieTitel(doc, "3. MESSTECHNISCHE PRÜFUNGEN JE ÜBERGABEPUNKT", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Schutzleiter, Schleifenimpedanz, RCD. Grenzwerte je Spalte im Tabellenkopf; unzulässige Werte werden rot hinterlegt.", 10, y + 3.4);
  doc.setTextColor(...textColor);

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: [254, 226, 226], textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const tableRows = [];
  let anyFeedMeasurementOut = false;
  // Fehlende ANGABEN werden getrennt gefuehrt: sie machen das Protokoll
  // unvollstaendig, kehren aber den Freigabetext nicht um.
  let anyDokumentationsmangel = false;
  // BEISPIELZEILE IM LEERFORMULAR (grau/kursiv, als "Bsp" gekennzeichnet)
  const BEISPIEL_ZEILE_AP = [
    "Bsp",
    "Bühnenversorgung Haupt",
    "TN-S\n230 / 400 V, 50 Hz",
    "i.O.",
    "0,12 Ohm",
    "C 32A",
    "0,31 Ohm / 740 A",
    "Typ A (30 mA)\n21 mA / 17 ms @ 5x"
  ];

  // Die Beispielzeile steht am ENDE der Tabelle, damit die Eintragezeilen
  // direkt unter dem Tabellenkopf beginnen.
  let beispielIndex = -1;

  if (isBlank) {
    // Zeilenzahl so gewaehlt, dass das GESAMTE Leerformular auf eine A4-Seite passt
    for (let i = 1; i <= 10; i++) tableRows.push([i, "", "", "", "", "", "", ""]);
    beispielIndex = tableRows.length;
    tableRows.push(BEISPIEL_ZEILE_AP);
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

      // Die frueheren "|| '-'"-Vorgaben erzeugten Zellen wie "- (-)". Die
      // Rohwerte gehen jetzt unveraendert in die gemeinsame Auswertung.
      const rcdTyp = card.querySelector('.c-rcd-typ').value;
      const rcdIdn = card.querySelector('.c-rcd-idn').value;
      const rcdImess = card.querySelector('.c-rcd-imess').value;
      const rcdTa = card.querySelector('.c-rcd-ta').value;
      // KEIN Fallback auf '1': ein nicht gewaehlter Pruefstrom darf im
      // Beweisdokument nicht als gewaehlte Messbedingung erscheinen.
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '';

      // Identische Auswertung wie im Anlagenprotokoll (pdf-utils.js): damit
      // erkennt auch die Anschlusspruefung eingetragene, aber ungepruefte RCD.
      const rcdZelle = buildRcdZelle({
        typ: rcdTyp, idn: rcdIdn, imess: rcdImess, ta: rcdTa, pruefstrom: rcdPruefstrom
      });

      const taNum = parseFloat(rcdTa.replace(',', '.'));
      const isTaOut = rcdZelle.taMax !== null && !isNaN(taNum) && taNum > rcdZelle.taMax;
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseFloat(rcdImess.replace(',', '.'));
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);
      // Zelle rot: sowohl bei fehlender Angabe als auch bei echter Beanstandung.
      const isRcdOut = isTaOut || isImessOut || rcdZelle.isOut;
      // In die GESAMTBEWERTUNG geht nur ein, was die Sicherheit betrifft.
      const isRcdBeanstandung = isTaOut || isImessOut || rcdZelle.isPruefungUnvollstaendig;
      if (rcdZelle.isDokumentationsmangel) anyDokumentationsmangel = true;

      const rcdText = rcdZelle.text;

      if (isRpeOut || isIkOut || isRcdBeanstandung) anyFeedMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(netzSpannungFreq),
        cleanStr(drehfeld),
        makeCell(cleanStr(rpeText), isRpeOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut),
        makeCell(cleanStr(rcdText), isRcdOut)
      ]);
    });
  }

  doc.autoTable({
    startY: y + 5,
    // Kopfzeilen mit Umbruch: Groesse / Einheit / Grenzwert stehen untereinander
    head: [[
      'Nr.',
      'Bezeichnung\nÜbergabepunkt',
      'Netzsystem\nSpannung / Frequenz',
      'Dreh-\nfeld',
      'R_PE\n(Ohm)\nRichtw. <= 0,30',
      'Absicherung\nTyp / I_n',
      'Z_S (Ohm) / I_K (A)\nI_K >= 5x I_n (B)\n10x (C) / 20x (D)',
      'RCD: Typ (I_dn)\nI_dmess 0,5-1,0x I_dn\nt_A <= 40 ms bei 5x'
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
      fontSize: 5.6, fontStyle: 'bold', halign: 'center', valign: 'middle',
      lineColor: katMessen.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
    },
    bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center', valign: 'middle' },
    // Summe = 190 mm (210 - 2 x 10 mm Rand). Vorher 188 -> autoTable meldete
    // "content width could not fit page" und rechnete die Spalten selbst um.
    columnStyles: {
      0: { cellWidth: 7 }, 1: { cellWidth: 34, halign: 'left' }, 2: { cellWidth: 32 },
      3: { cellWidth: 12 }, 4: { cellWidth: 18 }, 5: { cellWidth: 19 },
      6: { cellWidth: 26 }, 7: { cellWidth: 42 }
    },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 6.5 : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === beispielIndex) {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [100, 116, 139];
        data.cell.styles.fillColor = [248, 250, 252];
        data.cell.styles.fontSize = 5.6;
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 6;

  /* --- SEKTION 4: ERDUNG / POTENZIALAUSGLEICH & FREIGABE ------------------
   * Neu: Messpunkt/Bezugspunkt sowie Freitextzeilen fuer eigene Messstellen. */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, 178) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  const OFF_PA = 10;
  const OFF_MESS = OFF_PA + ZA;
  const OFF_PUNKT = OFF_MESS + ZA;
  const offErgebnis   = OFF_PUNKT + ZA + 2;
  const offFreigabe   = offErgebnis + 5.5;
  const offBemLabel   = offFreigabe + 5.5;
  const offBemStart   = offBemLabel + 4.2;
  const boxHeight     = offBemStart + bemZeilen * 4.2 + 2.5;

  finalY = pdfPlatzPruefen(doc, finalY, boxHeight);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "4. ERDUNG, POTENZIALAUSGLEICH & GESAMTBEWERTUNG", kat: 'erdung' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const paVal = document.getElementById('pa_angeschlossen')?.value || '';
  doc.text("Potenzialausgleich angeschlossen:", 13, finalY + OFF_PA);
  drawCheckbox(doc, 58, finalY + OFF_PA, "Ja", !isBlank && paVal === "Ja");
  drawCheckbox(doc, 70, finalY + OFF_PA, "Nein", !isBlank && paVal === "Nein", true);
  drawCheckbox(doc, 85, finalY + OFF_PA, "n.a.", !isBlank && paVal === "n.a.");

  drawFeldZeile(doc, "Durchgängigkeit PE/PA R_PA (<= 1,0 Ohm):",
                feldWert('pa_widerstand') ? withUnit(feldWert('pa_widerstand'), 'Ohm') : '', 107, finalY + OFF_PA, 90, isBlank);

  const erdungReNum = parseFloat((document.getElementById('erdung_re')?.value || '').replace(',', '.'));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS;
  if (isErdungOut) { doc.setTextColor(...redCellText); doc.setFont("helvetica", "bold"); }
  drawFeldZeile(doc, `Erdungswiderstand R_E (<= ${ERDUNG_RE_GRENZWERT_ANSCHLUSS} Ohm):`,
                feldWert('erdung_re') ? withUnit(feldWert('erdung_re'), 'Ohm') : '', 13, finalY + OFF_MESS, 90, isBlank);
  if (isErdungOut) { doc.setTextColor(...textColor); doc.setFont("helvetica", "normal"); }

  drawFeldZeile(doc, "Messpunkt / Bezugspunkt (z. B. HES, PA-Schiene, Erdspieß, Fundamenterder):",
                feldWert('pa_messpunkt'), 13, finalY + OFF_PUNKT, 184, isBlank);

  /* --- DREI ZUSTAENDE STATT ZWEI (identisch zum Anlagenprotokoll) --------- */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  const leistungVal = document.getElementById('res_leistung_ausreichend')?.value || '';
  const freigabeVal = document.getElementById('res_freigabe')?.value || 'Ja';
  const anySichtNiOFrueh = Array.from(s).some(el => el?.value === 'n.i.O.');
  // Beanstandungen unabhaengig von der Auswahl - nur ohne sie darf "behoben"
  // positiv ausgehen.
  const restBeanstandungen = !isBlank && (freigabeVal === 'Nein' || leistungVal === 'Nein' ||
                             anySichtNiOFrueh || anyFeedMeasurementOut || isErdungOut);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", 13, finalY + offErgebnis);
  drawCheckbox(doc, 34, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 82, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, behobenTrotzOffener);
  drawCheckbox(doc, 146, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  doc.text("Freigabe zur Nutzung:", 13, finalY + offFreigabe);
  drawCheckbox(doc, 45, finalY + offFreigabe, "Ja", !isBlank && freigabeVal === "Ja");
  drawCheckbox(doc, 56, finalY + offFreigabe, "Nein", !isBlank && freigabeVal === "Nein", true);

  // "Leistung ausreichend" steht jetzt in dieser Zeile: die Ergebniszeile
  // darueber braucht die volle Breite fuer das dritte Ankreuzfeld.
  doc.text("Leistung ausreichend:", 100, finalY + offFreigabe);
  drawCheckbox(doc, 132, finalY + offFreigabe, "Ja", !isBlank && leistungVal === "Ja");
  drawCheckbox(doc, 143, finalY + offFreigabe, "Nein", !isBlank && leistungVal === "Nein", true);
  // "n.a." war im Formular waehlbar, im PDF aber nicht darstellbar
  drawCheckbox(doc, 158, finalY + offFreigabe, "n.a.", !isBlank && leistungVal === "n.a.");

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

  // Kein Dokument, das gleichzeitig "Ja" ankreuzt und "NICHT freigegeben" schreibt.
  if (freigabeWidersprichtBefund(isBlank, hasIssues, freigabeVal)) {
    alert(freigabeWiderspruchHinweis('Freigabe zur Nutzung'));
    document.getElementById('res_freigabe')?.focus();
    return;
  }

  const complianceText = isBlank
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei der Sichtprüfung, eine nicht ausreichende Anschlussleistung oder ein Sicherheitsrisiko festgestellt. Der Übergabepunkt ist in diesem Zustand NICHT freigegeben. Eine Nutzung ist erst nach Beseitigung der genannten Mängel und erneuter Prüfung zulässig."
      : behobenOk
        ? MAENGEL_BEHOBEN_TEXT_ANSCHLUSS
        : "Der Übergabepunkt wurde besichtigt, erprobt und gemessen. Er entspricht den anerkannten Regeln der Elektrotechnik und ist zur Nutzung durch den Veranstalter im genannten Rahmen freigegeben.";

  // Fehlende Angaben anhaengen, statt sie nur rot in der Tabelle zu zeigen.
  const complianceGesamt = complianceText + (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, 190);
  // Umbruch nur, wenn Hinweistext + Unterschriftenblock wirklich nicht mehr passen
  finalY = pdfPlatzPruefen(doc, finalY, complianceLines.length * 3.2 + 6 + 16);

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  doc.text(complianceLines, 10, finalY);
  doc.setTextColor(...textColor);

  finalY += complianceLines.length * 3.2 + 6;

  const ortDatum = unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`;

  if (!isBlank && !padUebergeber.isEmpty()) {
    doc.addImage(padUebergeber.toDataURL('image/png'), 'PNG', 10, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(10, finalY + 12, 90, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Übergebende/-r (Netzbetreiber/Bereitsteller)`, 10, finalY + 15);

  if (!isBlank && !padUebernehmer.isEmpty()) {
    doc.addImage(padUebernehmer.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 200, finalY + 12);
  doc.text(`${ortDatum} - Übernehmende/-r (Veranstalter/Elektrofachkraft)`, 115, finalY + 15);

  drawProtokollSeitenkoepfe(doc, {
    ...ANSCHLUSS_KOPF, protokollNr: kopfProtokollNr, pruefNr: kopfPruefNr, datum, revision: ANSCHLUSS_REVISION
  });

  const filename = isBlank
    ? `Anschlusspruefung_Uebergabepunkt_Leerformular.pdf`
    : `Anschlusspruefung_${protokollNr}_${(datum || '').replace(/\./g, '-')}.pdf`;

  /* Die Nummer wird ERST JETZT verbraucht - und nur, wenn wirklich eine Datei
   * entstanden ist. Ein abgebrochener Teilen-Dialog kostet keine Nummer,
   * ein Leerformular ebenfalls nicht. */
  Promise.resolve(savePdfCompatible(doc, filename, archivMetaSammeln('AP', nummerRoh, filename, isBlank)))
    .then(function (gespeichert) {
    if (isBlank || gespeichert === false) return;
    verbraucheProtokollNummer(nummerRoh, 'AP');
    protokollNummerNachPdf('AP');
  });
}

// AUTOSAVE
// Einheitliches Praefix 'vde_': der alte Schluessel 'anschluss_protocol_autosave'
// wurde von der Datensicherung nicht erfasst (siehe storage.js).
const ANSCHLUSS_AUTOSAVE_KEY = 'vde_autosave_ap';

const ANSCHLUSS_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'messgeraet', 'seriennummer',
  'kalibriert_bis',
  'bereitsteller_ansprechpartner', 'bereitsteller_telefon', 'einspeisung_art', 'einspeisung_sonstiges',
  'uebergabe_standort', 'anschlussleistung_vertrag', 'vnb',
  'pa_angeschlossen', 'erdung_re', 'pa_widerstand', 'pa_messpunkt',
  'res_maengel', 'res_leistung_ausreichend',
  'res_freigabe', 'res_bemerkungen', 'unterschrift_ort', 'unterschrift_datum',
  'protokollnummer'
];

// Zeigt das Freitextfeld nur, wenn "Sonstiges" gewaehlt ist.
function toggleEinspeisungSonstiges(wert) {
  const gruppe = document.getElementById('einspeisung_sonstiges_gruppe');
  if (!gruppe) return;
  gruppe.style.display = /sonstig/i.test(wert || '') ? 'flex' : 'none';
}

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
    if (!el) return;
    // Ein wiederhergestelltes Formular behaelt SEINE Protokollnummer.
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    el.value = val;
  });

  if (state.veranstaltung !== undefined) {
    const ta = document.getElementById('veranstaltung');
    ta.value = state.veranstaltung;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  ['res_bemerkungen'].forEach(id => {
    const ta = document.getElementById(id);
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  toggleEinspeisungSonstiges(document.getElementById('einspeisung_art').value);
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
  document.getElementById('unterschrift_datum').valueAsDate = new Date();
  document.getElementById('veranstaltung').style.height = 'auto';
  document.getElementById('res_bemerkungen').style.height = 'auto';
  toggleEinspeisungSonstiges(document.getElementById('einspeisung_art').value);

  applyMasterDataToForm();

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard();

  if (typeof padUebergeber !== 'undefined' && padUebergeber) padUebergeber.clear();
  if (typeof padUebernehmer !== 'undefined' && padUebernehmer) padUebernehmer.clear();
}

function neuesAnschlussProtokoll() {
  if (!confirm('Neues Formular anlegen? Alle aktuell eingetragenen Daten in diesem Formular werden zurückgesetzt.')) return;

  const nr = naechsteProtokollNummer('AP');
  resetAnschlussForm();
  document.getElementById('protokollnummer').value = nr;
  clearAnschlussAutosave();
  alert(`Neues Protokoll angelegt: ${nr}\n\nDie Nummer wird erst mit dem fertigen PDF verbraucht.`);
}
