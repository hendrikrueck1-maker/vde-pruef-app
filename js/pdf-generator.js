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

    <!-- MESSWERTE: R_PE & R_ISO
         Zwei klar getrennte Gruppen: sonst wirkte am Desktop die Prüfspannung
         wie eine Angabe zu R_PE, obwohl sie zum Isolationswiderstand gehört. -->
    <div class="sub-section">
      <div class="sub-title">1. Schutzleiter- & Isolationswiderstand</div>
      <div class="mess-gruppen">
        <div class="mess-gruppe">
          <div class="mess-gruppe-titel">Schutzleiter R<sub>PE</sub></div>
          <div class="form-group">
            <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
            <input type="text" inputmode="decimal" class="c-rpe" value="${data.rpe || ''}" placeholder="z. B. 0.11" oninput="validateCardNorms(${cardCounter})">
            <div class="limit-hint">DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit (Prüfstrom &ge; 200 mA), keinen festen Grenzwert. Die Schutzwirkung wird über Z<sub>S</sub>/I<sub>K</sub> bewertet.</div>
          </div>
        </div>
        <div class="mess-gruppe">
          <div class="mess-gruppe-titel">Isolationswiderstand R<sub>ISO</sub></div>
          <div class="grid">
            <div class="form-group">
              <label>Prüfspannung (VDE 0100-600, Tab. 6.1):</label>
              <select class="c-riso-mode" onchange="validateCardNorms(${cardCounter})">
                <option value="500 V DC (Stromkreis bis 500 V)">500 V DC &ndash; bis 500 V (&ge; 1,0 M&Omega;)</option>
                <option value="250 V DC (SELV/PELV)">250 V DC &ndash; SELV/PELV (&ge; 0,5 M&Omega;)</option>
                <option value="1000 V DC (Stromkreis über 500 V)">1000 V DC &ndash; über 500 V (&ge; 1,0 M&Omega;)</option>
                <option value="250 V DC (Praxismessung mit Verbrauchern)">250 V DC &ndash; Praxismessung (kein Normfall)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Messwert R<sub>ISO</sub> (M&Omega;):</label>
              <input type="text" inputmode="decimal" class="c-riso" value="${data.riso || ''}" placeholder="z. B. > 500" oninput="validateCardNorms(${cardCounter})">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MESSWERTE: ABSICHERUNG -->
    <div class="sub-section">
      <div class="sub-title">2. Überstromschutzeinrichtung (Absicherung)</div>
      <div class="grid">
        <div class="form-group">
          <label>Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${data.sich || ''}" placeholder="z. B. B 16A" oninput="validateCardNorms(${cardCounter})">
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
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${data.rcd_typ || ''}" placeholder="z. B. Typ A">
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
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${data.rcd_idn || ''}" placeholder="z. B. 30 mA" oninput="validateCardNorms(${cardCounter})">
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
          <label>Prüfstrom für Auslösestrom / Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateCardNorms(${cardCounter})">
            <option value="" selected>&ndash; bitte wählen &ndash;</option>
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
  // Kein Vorgabewert: der Prüfstrom muss bewusst gewählt werden, weil davon
  // der zulaessige Grenzwert der Ausloesezeit abhaengt.
  card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom || '';
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
  // Ohne gewaehlten Pruefstrom gibt es keinen definierten Grenzwert -> es wird
  // weder ein Limit angezeigt noch die Ausloesezeit bewertet.
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById(`ta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '' && taElem.value.trim() !== '-') {
    const num = parseFloat(taElem.value.replace(',', '.'));
    if (!isNaN(num) && num > taMax) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein (DIN VDE 0100-600).
  // Fehlende Messwerte werden markiert, statt stillschweigend als "-" zu drucken.
  const imessEl = card.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  // messwertFehlt lag hier als eigene Kopie - jetzt zentral (pdf-utils.js),
  // damit Anlagen- und Anschlusspruefung dieselbe Regel verwenden.
  const messwertFehlt = rcdWertFehlt;
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
  document.getElementById('pa_widerstand').value = "0.11";
  document.getElementById('erdung_messpunkt').value = "HES (Haupterdungsschiene) Keller Gr. Haus";
  validateErdung();
  // Der frueher hier hinterlegte Text "Sicherung in Kreis 2 erneuert" stand im
  // Widerspruch zum angekreuzten "Keine Mängel festgestellt". Fuer den Fall einer
  // behobenen Beanstandung gibt es jetzt die eigene Option im Feld res_maengel.
  document.getElementById('res_bemerkungen').value = "Alle Messwerte innerhalb der zulässigen Grenzen. Keine Mängel festgestellt.";

  document.getElementById('circuitsContainer').innerHTML = '';
  cardCounter = 0;
  // Beide Beispielkreise haben einen RCD -> beide bekommen auch Messwerte.
  // Zuvor stand bei Kreis 1 "- mA / - ms", was einen vorhandenen, aber ungeprueften
  // RCD dokumentierte. Die Pruefung ist nach DIN VDE 0100-600 zwingend.
  // Werte ohne Einheit eintragen - die Einheit haengt der Generator an.
  // Prüfstrom 5 x I_dn ist der Standard -> Auslösezeiten entsprechend unter 40 ms
  // Typ und I_dn muessen mitgegeben werden: die Beispieldaten sind das
  // Musterprotokoll der App und duerfen keine unvollstaendige RCD-Zelle erzeugen.
  addCircuitCard({ bez: '1 - Schukosteckdose Lichtregie', kabel: 'NYM-J', leiter: '3G', qs: '1.5 mm²', rpe: '0.08', riso: '> 500', sich: 'B 10A', zs: '0.35', ik: '657', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '19', rcd_ta: '12', rcd_pruefstrom: '5', umess: '1.2' });
  addCircuitCard({ bez: '2 - CEE 16A Hauptbühne', kabel: 'H07RN-F', leiter: '5G', qs: '2.5 mm²', rpe: '0.12', riso: '450', sich: 'B 16A', zs: '0.42', ik: '547', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '22', rcd_ta: '15', rcd_pruefstrom: '5', umess: '2.4' });
}

// KOPFDATEN DES PROTOKOLLS (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet)
const VDE0100_KOPF = {
  titel: "PRÜFPROTOKOLL ELEKTRISCHER ANLAGEN",
  normzeile: "Erst- und Wiederholungsprüfung nach DIN VDE 0100-600 / DIN VDE 0105-100"
};
const FORMULAR_REVISION = "Formular Rev. 2026-08 · Normstand: VDE 0100-600:2017-06 · VDE 0105-100:2015-10";

// GENERATOR FÜR DAS PDF-DOKUMENT
function generatePDF(isBlank = false) {
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung. Deshalb Abbruch VOR dem Aufbau des PDF.
   * Das Leerformular ist davon nie betroffen - dort wird nichts behauptet. */
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

  // Wert eines Feldes ODER leerer String -> drawFeldZeile zeichnet dann eine
  // durchgehende Schreiblinie statt einer kurzen Unterstrich-Kette.
  const feldWert = (id) => {
    if (isBlank) return '';
    const el = document.getElementById(id);
    return el && el.value.trim() ? cleanStr(el.value.trim()) : '';
  };

  const protokollNr = getVal('protokollnummer', "PR-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");

  const formatDatum = (isoDate) => {
    if (!isoDate) return "";
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [jahr, monat, tag] = parts;
    return `${tag}.${monat}.${jahr}`;
  };
  const datum = isBlank ? "" : (formatDatum(document.getElementById('datum').value) || "");
  const ort = getVal('unterschrift_ort', "Konstanz");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // Im Leerformular bleiben Kopf-Felder leer -> die Kopfbox zeichnet dort
  // Schreiblinien, auf die von Hand eingetragen werden kann.
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  // Auch im AUSGEFUELLTEN Protokoll darf kein Ausfuell-Platzhalter stehen: ist
  // die Prueflings-ID leer, zeichnet kopfFeld() dort eine Schreiblinie. Ein
  // "__________" in einem fertigen Dokument sieht aus wie ein vergessenes Feld.
  const kopfPruefNr = isBlank ? "" : feldWert('pruefungsnummer');

  // HEADER: zentrale Funktion aus pdf-utils.js, passt die Schriftgroesse
  // automatisch an die verfuegbare Breite an (verhindert Ueberdrucken der Infobox)
  drawProtokollHeader(doc, VDE0100_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN ---------------------------------------------
   * Kompakt gehalten: 5 Zeilen je Spalte, Zeilenabstand 4,6 mm.
   * Protokoll-Nr. und Prueflings-ID stehen bereits in der Kopfbox oben rechts
   * und werden hier nicht wiederholt - das spart eine ganze Zeile. */
  const SEK1_H = 31;
  const ZA = 4.6;                        // Zeilenabstand innerhalb der Boxen
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN, NETZSYSTEM & MESSGERÄTE", kat: 'stamm' });

  doc.setFontSize(7.2);
  const spL = 13, spR = 107, spB = 90;   // linke/rechte Spalte, Spaltenbreite

  let volt = feldWert('netzspannung');
  if (volt && !volt.toLowerCase().includes('v')) volt += ' V';
  let freq = feldWert('netzfrequenz');
  if (freq && !freq.toLowerCase().includes('hz')) freq += ' Hz';
  const spannungFreq = [volt, freq].filter(Boolean).join(' / ');

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
  drawFeldZeile(doc, "Auftraggeber:",     feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",  feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Anlage:",           feldWert('anlage_bez'),      spL, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",       feldWert('pruefer'),         spL, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",        datum,                       spL, z1(4), spB, isBlank);

  drawFeldZeile(doc, "Prüfnorm:",            feldWert('pruefnorm'),  spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Netzsystem:",          feldWert('netzsystem'), spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Spannung / Frequenz:", spannungFreq,           spR, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Netzbetreiber:",       feldWert('vnb'),        spR, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfgerät:",           messgeraetText,         spR, z1(4), spB, isBlank);

  y += SEK1_H + 4;

  /* --- SEKTION 2: BESICHTIGEN & ERPROBEN ---------------------------------
   * Wieder 3 Spalten (spart gegenueber 2 Spalten zwei Zeilen Hoehe).
   * Damit der Beschreibungstext nicht mehr unter die Kaestchen laeuft, sind
   * die Bezeichnungen gekuerzt UND die Kaestchen stehen weiter rechts;
   * zusaetzlich verkleinert drawFittedText zu lange Texte automatisch. */
  const SEK2_H = 34;
  drawKategorieBox(doc, { y, h: SEK2_H, titel: "2. BESICHTIGEN & ERPROBEN (SICHT- UND FUNKTIONSPRÜFUNG)", kat: 'sicht' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Betriebsmittel", "2. Kabel/Leitungen", "3. Zugänglichkeit",
    "4. Schaltgeräte", "5. Kennzeichnung", "6. Doku/Warnung",
    "7. Zus. Potenzialausgl.", "8. Berührungsschutz", "9. Typenschild"
  ];
  const SICHT_LABEL_X = [13, 76, 139];   // Textbeginn je Spalte
  const SICHT_CB_X    = [42, 105, 168];  // "i.O."-Kaestchen (29 mm Textbreite)
  const SICHT_LABEL_W = 27;

  sichtLabels.forEach((label, i) => {
    const spalte = Math.floor(i / 3);
    const zeile = i % 3;
    const yy = y + 10 + zeile * ZA;
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', SICHT_LABEL_X[spalte], yy, SICHT_LABEL_W, 7, 5.4);
    doc.setFontSize(7);
    drawCheckbox(doc, SICHT_CB_X[spalte], yy, "i.O.", !isBlank && s[i]?.value === "i.O.");
    drawCheckbox(doc, SICHT_CB_X[spalte] + 12, yy, "n.i.O.", !isBlank && s[i]?.value === "n.i.O.", true);
  });

  // Anschlusskabel: im Leerformular als durchgehende Linie ueber die volle Breite
  const kabelAnschluss = [feldWert('anschluss_typ'), feldWert('anschluss_leiter'), feldWert('anschluss_qs')]
    .filter(p => p).join(' ');
  doc.setFontSize(7);
  const yKabel = y + 10 + 3 * ZA + 1;
  drawFeldZeile(doc, "Anschlusskabel (Typ / Adern / Querschnitt):", kabelAnschluss, 13, yKabel, 184, isBlank);

  const yErp = yKabel + ZA + 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Erproben:", 13, yErp);
  doc.setFont("helvetica", "normal");

  doc.text("Funktion Anlage:", 32, yErp);
  drawCheckbox(doc, 54, yErp, "i.O.", !isBlank && document.getElementById('erp_anlage')?.value === "i.O.");
  drawCheckbox(doc, 66, yErp, "n.i.O.", !isBlank && document.getElementById('erp_anlage')?.value === "n.i.O.", true);

  doc.text("Schutzeinrichtungen:", 84, yErp);
  drawCheckbox(doc, 111, yErp, "i.O.", !isBlank && document.getElementById('erp_schutz')?.value === "i.O.");
  drawCheckbox(doc, 123, yErp, "n.i.O.", !isBlank && document.getElementById('erp_schutz')?.value === "n.i.O.", true);

  doc.text("Drehfeld:", 143, yErp);
  drawCheckbox(doc, 156, yErp, "i.O.", !isBlank && document.getElementById('erp_drehfeld')?.value === "i.O.");
  drawCheckbox(doc, 168, yErp, "n.i.O.", !isBlank && document.getElementById('erp_drehfeld')?.value === "n.i.O.", true);
  drawCheckbox(doc, 182, yErp, "n.a.", !isBlank && document.getElementById('erp_drehfeld')?.value === "n.a.");

  y += SEK2_H + 6;

  // SEKTION 3: TABELLE
  const katMessen = drawKategorieTitel(doc, "3. MESSTECHNISCHE PRÜFUNGEN DER STROMKREISE", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Grenzwerte je Spalte im Tabellenkopf. Werte außerhalb des zulässigen Bereichs werden rot hinterlegt.", 10, y + 3.4);
  doc.setTextColor(...textColor);

  const tableRows = [];
  let anyMeasurementOut = false;
  // Fehlende ANGABEN werden getrennt gefuehrt: sie machen das Protokoll
  // unvollstaendig, kehren aber den Freigabetext nicht um.
  let anyDokumentationsmangel = false;

  // BEISPIELZEILE IM LEERFORMULAR: zeigt Format, Einheiten und plausible Werte.
  // Sie wird grau/kursiv gesetzt und als "Bsp." gekennzeichnet, damit sie nicht
  // mit einer echten Messung verwechselt werden kann.
  const BEISPIEL_ZEILE_VDE = [
    "Bsp",
    "Schukosteckdose Lichtregie",
    "NYM-J 3G 1,5 mm2",
    "0,08 Ohm",
    "> 500 MOhm\n(500 V DC)",
    "B 16A",
    "0,35 Ohm / 657 A",
    "Typ A (30 mA)\n19 mA / 12 ms @ 5x",
    "1,2 V"
  ];

  // Index der Beispielzeile (fuer die Formatierung in didParseCell).
  // Sie steht am ENDE der Tabelle, damit die Eintragezeilen oben beginnen.
  let beispielIndex = -1;

  if (isBlank) {
    // Zeilenzahl so gewaehlt, dass das GESAMTE Leerformular auf eine A4-Seite passt
    for (let i = 1; i <= 7; i++) tableRows.push([i, "", "", "", "", "", "", "", ""]);
    beispielIndex = tableRows.length;
    tableRows.push(BEISPIEL_ZEILE_VDE);
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
      // KEIN Fallback auf '1': ein nicht gewaehlter Pruefstrom darf im
      // Beweisdokument nicht als gewaehlte Messbedingung erscheinen.
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '';

      // Zelltext und Dokumentationsmaengel zentral aufbauen (siehe pdf-utils.js).
      // Messwerte erscheinen dadurch auch dann, wenn das Typ-Feld leer blieb.
      const rcdZelle = buildRcdZelle({
        typ: rcdTyp, idn: rcdIdn, imess: rcdImess, ta: rcdTa, pruefstrom: rcdPruefstrom
      });

      // Ausloesezeit nur bewerten, wenn der Pruefstrom bekannt ist - sonst gibt
      // es keinen definierten Grenzwert (DIN EN 61008-1/61009-1).
      const taNum = parseFloat(rcdTa.replace(',', '.'));
      const isTaOut = rcdZelle.taMax !== null && !isNaN(taNum) && taNum > rcdZelle.taMax;
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseFloat(rcdImess.replace(',', '.'));
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);

      // Zelle rot: sowohl bei fehlender Angabe als auch bei echter Beanstandung.
      const isRcdOut = isTaOut || isImessOut || rcdZelle.isOut;
      // In die GESAMTBEWERTUNG geht nur ein, was die Sicherheit betrifft.
      // Eine fehlende Typ- oder Prüfstromangabe macht das Protokoll
      // unvollstaendig, aber nicht die Anlage unsicher.
      const isRcdBeanstandung = isTaOut || isImessOut || rcdZelle.isPruefungUnvollstaendig;
      if (rcdZelle.isDokumentationsmangel) anyDokumentationsmangel = true;
      const rcdText = rcdZelle.text;

      const uMessVal = card.querySelector('.c-umess').value;
      const uNum = parseFloat(uMessVal.replace(',', '.'));
      const limitU = (card.querySelector('.c-spannung-art')?.value === 'DC') ? 120 : 50;
      const isUOut = !isNaN(uNum) && uNum > limitU;

      // withUnit haengt "V" nur an, wenn die Einheit nicht schon eingetippt wurde
      // (fruehere Ausgabe: "1.2 V V")
      // Der Grenzwert steht bereits im Tabellenkopf -> hier nur der Messwert
      const uText = uMessVal ? withUnit(uMessVal, 'V') : '-';

      if (isRpeOut || isRisoOut || isIkOut || isRcdBeanstandung || isUOut) anyMeasurementOut = true;

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
    startY: y + 5,
    // Tabellenkopf mit ZEILENUMBRUECHEN: Bezeichnung / Einheit / Grenzwert
    // stehen jetzt sauber untereinander statt in einer ueberlangen Zeile.
    head: [[
      'Nr.',
      'Bezeichnung / Zweck\ndes Stromkreises',
      'Leitung\nTyp / Adern / Querschnitt',
      'R_PE\n(Ohm)\nRichtwert <= 0,30',
      'R_ISO\n(MOhm)\n>= 1,0 (SELV 0,5)',
      'Sicherung\nTyp / I_n',
      'Z_S (Ohm) / I_K (A)\nI_K >= 5x I_n (B)\n10x (C) / 20x (D)',
      'RCD: Typ (I_dn)\nI_dmess 0,5-1,0x I_dn\nt_A <= 40 ms bei 5x',
      'U_mess (V)\n<= 50 V AC\n<= 120 V DC'
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
    columnStyles: {
      0: { cellWidth: 7 }, 1: { cellWidth: 34, halign: 'left' }, 2: { cellWidth: 26 },
      3: { cellWidth: 16 }, 4: { cellWidth: 20 }, 5: { cellWidth: 18 },
      6: { cellWidth: 25 }, 7: { cellWidth: 26 }, 8: { cellWidth: 18 }
    },
    // margin.top gilt fuer alle FOLGESEITEN: haelt den Abstand zum Seitenkopf ein.
    // margin.bottom bestimmt, wann umgebrochen wird - so laeuft nichts in die Fusszeile.
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: [203, 213, 225], lineWidth: 0.1, minCellHeight: isBlank ? 6.5 : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } },
    didParseCell: (data) => {
      // Beispielzeile im Leerformular grau/kursiv absetzen
      if (data.section === 'body' && data.row.index === beispielIndex) {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [100, 116, 139];
        data.cell.styles.fillColor = [248, 250, 252];
        data.cell.styles.fontSize = 5.6;
      }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 6;

  /* --- SEKTION 4: ERDUNG / POTENZIALAUSGLEICH (Kategorie "erdung" = violett)
   * Neu: Messpunkt + Bezugspunkt sowie ein Freitextblock fuer eigene
   * Messstellen, die die Haekchenliste nicht abdeckt. */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, 178) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  // Relative Abstaende innerhalb der Box (mm ab Boxoberkante)
  const OFF_R = 10;
  const OFF_PUNKT = OFF_R + ZA;
  const offErgebnis   = OFF_PUNKT + ZA + 2;
  const offTermin     = offErgebnis + 5.5;
  const offBemLabel   = offTermin + 5.5;
  const offBemStart   = offBemLabel + 4.2;
  const boxHeight     = offBemStart + bemZeilen * 4.2 + 2.5;

  // Passt der Block nicht mehr komplett auf die Seite -> sauber umbrechen
  finalY = pdfPlatzPruefen(doc, finalY, boxHeight);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "4. ERDUNG, POTENZIALAUSGLEICH & GESAMTBEWERTUNG", kat: 'erdung' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const erdungReNum = parseFloat((document.getElementById('erdung_re')?.value || '').replace(',', '.'));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && erdungReNum > ERDUNG_RE_GRENZWERT;
  if (isErdungOut) { doc.setTextColor(...redCellText); doc.setFont("helvetica", "bold"); }
  drawFeldZeile(doc, `Erdungswiderstand R_E (<= ${ERDUNG_RE_GRENZWERT} Ohm):`,
                feldWert('erdung_re') ? withUnit(feldWert('erdung_re'), 'Ohm') : '', 13, finalY + OFF_R, 90, isBlank);
  if (isErdungOut) { doc.setTextColor(...textColor); doc.setFont("helvetica", "normal"); }

  drawFeldZeile(doc, "Durchgängigkeit PE/PA R_PA (<= 1,0 Ohm):",
                feldWert('pa_widerstand') ? withUnit(feldWert('pa_widerstand'), 'Ohm') : '', 107, finalY + OFF_R, 90, isBlank);

  // MESSPUNKT / BEZUGSPUNKT - damit nachvollziehbar ist, WO gemessen wurde
  drawFeldZeile(doc, "Messpunkt / Bezugspunkt (z. B. HES, PA-Schiene, UV, Fundamenterder):",
                feldWert('erdung_messpunkt'), 13, finalY + OFF_PUNKT, 184, isBlank);

  /* --- DREI ZUSTAENDE STATT ZWEI -----------------------------------------
   * "behoben" ist ein eigener Zustand mit eigenem Ankreuzfeld und nicht mehr
   * ein Sonderfall von "Mängel festgestellt". */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  /* Beanstandungen, die UNABHAENGIG von dieser Auswahl im Protokoll stehen.
   * Nur wenn keine davon uebrig ist, darf "behoben" positiv ausgehen - sonst
   * liesse sich der Widerspruch durch die Auswahl einfach umdrehen. */
  const gewaehrleistungVal = document.getElementById('res_gewaehrleistung')?.value || 'Ja';
  const anySichtNiO = Array.from(s).some(el => el?.value === 'n.i.O.');
  const anyErpNiO = ['erp_anlage', 'erp_schutz', 'erp_drehfeld'].some(id => document.getElementById(id)?.value === 'n.i.O.');
  const restBeanstandungen = !isBlank && (gewaehrleistungVal === 'Nein' || anySichtNiO || anyErpNiO || anyMeasurementOut || isErdungOut);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", 13, finalY + offErgebnis);
  drawCheckbox(doc, 34, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 82, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, behobenTrotzOffener);
  drawCheckbox(doc, 146, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  const terminVal = document.getElementById('res_termin_date')?.value || "";
  let terminText = "";
  if (!isBlank && terminVal) {
    const parts = terminVal.split('-');
    terminText = parts.length === 2 ? `${parts[1]} / ${parts[0]}` : terminVal;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  drawFeldZeile(doc, "Nächster Prüftermin (Monat / Jahr):", terminText, 13, finalY + offTermin, 90, isBlank);

  // Die Prüfplakette steht jetzt in dieser Zeile: die Ergebniszeile darueber
  // braucht die volle Breite fuer das dritte Ankreuzfeld ("Mängel behoben").
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Prüfplakette erteilt:", 120, finalY + offTermin);
  drawCheckbox(doc, 150, finalY + offTermin, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 162, finalY + offTermin, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

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

  // DER FREIGABETEXT DARF NUR ERSCHEINEN, WENN TATSÄCHLICH ALLES I.O. IST –
  // BEI MÄNGELN, SICHERHEITSRISIKO ODER N.I.O.-ERGEBNISSEN MUSS EINE WARNUNG STEHEN
  /* Ein "behoben" mit noch offenen roten Werten bleibt ein Mangelprotokoll -
   * sonst koennte man den Widerspruch einfach in die andere Richtung erzeugen. */
  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  // Kein Dokument, das gleichzeitig "Ja" ankreuzt und "NICHT gewährleistet" schreibt.
  if (freigabeWidersprichtBefund(isBlank, hasIssues, gewaehrleistungVal)) {
    alert(freigabeWiderspruchHinweis('Sicherer Gebrauch gewährleistet'));
    document.getElementById('res_gewaehrleistung')?.focus();
    return;
  }

  const complianceText = isBlank
    // Im Leerformular waere die Konformitaetsaussage eine unbelegte Behauptung -
    // dort steht nur der Hinweis, dass sie nach der Pruefung anzukreuzen ist.
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei Sicht-/Funktionsprüfung oder ein Sicherheitsrisiko festgestellt. Die elektrische Anlage entspricht in diesem Zustand NICHT den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch ist NICHT gewährleistet, bis die genannten Mängel behoben und erneut geprüft wurden."
      : behobenOk
        ? MAENGEL_BEHOBEN_TEXT_ANLAGE
        : "Die elektrische Anlage entspricht den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.";

  // Fehlende Angaben anhaengen, statt sie nur rot in der Tabelle zu zeigen.
  const complianceGesamt = complianceText + (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, 190);

  // Bedarf fuer Bestaetigungszeile + Hinweistext + Unterschriftenblock exakt
  // ausrechnen, damit nur dann umgebrochen wird, wenn es wirklich nicht passt.
  const abschlussHoehe = 4 + complianceLines.length * 3.2 + 2 + 16;
  finalY += boxHeight + 5;
  finalY = pdfPlatzPruefen(doc, finalY, abschlussHoehe);

  // GEWÄHRLEISTUNG & UNTERSCHRIFTEN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", 10, finalY);
  drawCheckbox(doc, 58, finalY, "Ja (Anlage entspricht VDE-Regeln)", !isBlank && gewaehrleistungVal === "Ja");
  drawCheckbox(doc, 115, finalY, "Nein (Sicherheitsrisiko)", !isBlank && gewaehrleistungVal === "Nein", true);

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  doc.text(complianceLines, 10, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 2;

  // ORT UND DATUM DER UNTERZEICHNUNG (Datum kommt jetzt aus dem Formularfeld
  // 'unterschrift_datum'; frueher stand dort immer eine leere Linie)
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

  // KOPF DER FOLGESEITEN + INFOBOX MIT SEITENZAHL + REVISIONSVERMERK
  drawProtokollSeitenkoepfe(doc, {
    ...VDE0100_KOPF, protokollNr: kopfProtokollNr, pruefNr: kopfPruefNr, datum, revision: FORMULAR_REVISION
  });

  const filename = isBlank
    ? `VDE_0100_Pruefprotokoll_Leerformular.pdf`
    : `Pruefprotokoll_${protokollNr}_${(datum || '').replace(/\./g, '-')}.pdf`;

  /* Die Nummer wird ERST JETZT verbraucht - und nur, wenn wirklich eine Datei
   * entstanden ist. Ein abgebrochener Teilen-Dialog kostet keine Nummer,
   * ein Leerformular ebenfalls nicht. */
  Promise.resolve(savePdfCompatible(doc, filename, archivMetaSammeln('PR', nummerRoh, filename, isBlank)))
    .then(function (gespeichert) {
    if (isBlank || gespeichert === false) return;
    verbraucheProtokollNummer(nummerRoh, 'PR');
    protokollNummerNachPdf('PR');
  });
}

function initSignaturePads() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    kunde: setupSignatureCanvas('sigKunde')
  };
}

// AUTOSAVE DES AKTUELLEN FORMULARS (localStorage), DAMIT EIN VERSEHENTLICHER
// RELOAD NICHT ALLE BEREITS EINGETRAGENEN MESSWERTE VERWIRFT
// Einheitliches Praefix 'vde_' fuer ALLE Autosave-Schluessel, damit die
// Datensicherung sie zuverlaessig erfasst (migriereAutosaveSchluessel in
// storage.js benennt vorhandene Staende beim Start um).
const AUTOSAVE_KEY = 'vde_autosave_pr';

const AUTOSAVE_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'pruefnorm', 'netzsystem',
  'netzspannung', 'netzfrequenz', 'vnb', 'messgeraet', 'seriennummer',
  'kalibriert_bis',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'erp_anlage', 'erp_schutz', 'erp_drehfeld',
  'erdung_re', 'pa_widerstand', 'erdung_messpunkt',
  'res_maengel', 'res_plakette', 'res_termin_date', 'res_gewaehrleistung',
  'res_bemerkungen', 'unterschrift_ort', 'unterschrift_datum', 'protokollnummer'
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
    if (!el) return;
    // Ein wiederhergestelltes Formular behaelt SEINE Protokollnummer. Nur wenn
    // im Zwischenstand keine steht, bleibt der Vorschlag von
    // initProtokollNummer() erhalten - sonst stuende dort ploetzlich nichts.
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    el.value = val;
  });

  if (state.anlage_bez !== undefined) {
    const ta = document.getElementById('anlage_bez');
    ta.value = state.anlage_bez;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  // Mitwachsende Textfelder nach dem Wiederherstellen auf Inhaltshoehe bringen
  ['res_bemerkungen'].forEach(id => {
    const ta = document.getElementById(id);
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  validateErdung();

  const sichtEls = document.querySelectorAll('.sicht-item');
  (state.sicht || []).forEach((val, i) => { if (sichtEls[i]) sichtEls[i].value = val; });

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
  document.getElementById('unterschrift_datum').valueAsDate = new Date();
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