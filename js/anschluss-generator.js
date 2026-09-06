// ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG
// Grundlage: DIN VDE 0100-704 (Definition Übergabepunkt: Netzbetreiber-Anlage endet, Anlage des
// Nutzers beginnt), DIN VDE 0100-711 (Ausstellungen, Shows und Stände), DIN VDE 0100-718
// (Bauliche Anlagen für Menschenansammlungen - fuer Versammlungsstaetten wie das Theater
// einschlaegig), DIN VDE 0100-740 (Fliegende Bauten),
// DIN VDE 0100-600 (allgemeine Prüfmethodik Besichtigen-Erproben-Messen), DIN VDE 0100-520
// (max. 4% Spannungsfall vom Übergabepunkt zum Verbrauchsmittel).

let cardCounter = 0;

/* Siehe pdf-generator.js pruefstromSel(): bei einer NEUEN Karte ist "5x In
 * (max. 40 ms)" der in der Praxis fast immer verwendete Pruefstrom und wird
 * vorbelegt; ein wiederhergestellter (auch bewusst leerer) Zwischenstand
 * behaelt seinen eigenen Wert. */
function pruefstromSel(wert, optionWert) {
  const eff = wert === undefined ? '5' : wert;
  return eff === optionWert ? ' selected' : '';
}

function addFeedCard(data = {}) {
  cardCounter++;
  const container = document.getElementById('feedsContainer');
  const card = document.createElement('div');
  card.className = 'feed-card';
  card.id = `feed_${cardCounter}`;

  card.innerHTML = `
    <div class="feed-header">
      <span>Übergabepunkt #${cardCounter}</span>
      <span>
        <button type="button" class="btn btn-secondary" onclick="dupliziereUebergabepunkt('feed_${cardCounter}')" title="Neue Karte mit denselben Netz- und Schutzdaten. Messwerte bleiben leer.">⧉ Duplizieren</button>
        <button type="button" class="btn-danger" onclick="removeCard('feed_${cardCounter}')">Entfernen</button>
      </span>
    </div>

    <div class="grid">
      <div class="form-group grid-full">
        <label>Bezeichnung Übergabepunkt:</label>
        <input type="text" class="c-bez" value="${attrEsc(data.bez)}" placeholder="z. B. Bühnenversorgung Haupthaus">
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
        <input type="text" inputmode="decimal" class="c-spannung" value="${attrEsc(data.spannung)}" placeholder="z. B. 230 / 400" oninput="formatNetzspannung(this)">
      </div>
      <div class="form-group">
        <label>Frequenz (Hz):</label>
        <input type="text" inputmode="decimal" class="c-frequenz" value="${attrEsc(data.frequenz)}" placeholder="z. B. 50 Hz">
      </div>
      <div class="form-group">
        <label>Rechtsdrehfeld (bei Drehstrom):</label>
        <select class="c-drehfeld"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('rpe', 'fluke1663').icon}<span class="titel-text">1. Schutzleiter & Spannung N–PE</span></div>
      <div class="grid">
        <div class="form-group">
          <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
          <input type="text" inputmode="decimal" class="c-rpe" value="${attrEsc(data.rpe)}" placeholder="z. B. 0,15" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>U<sub>N&ndash;PE</sub> (V) [Sollwert 0 V] &ndash; Pflichtangabe:</label>
          <input type="text" inputmode="decimal" class="c-unpe" value="${attrEsc(data.unpe)}" placeholder="z. B. 0,3" oninput="validateFeedNorms(${cardCounter})">
          <div class="limit-hint">Neu in 4.5.0. Der einzige Wert, der eigenständig einen Fehler findet:
            hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat. Hinter einem
            fremden Übergabepunkt ist das der wichtigste Messwert &ndash; deshalb Pflichtangabe.</div>
        </div>
      </div>
      ${messgroesseBlock('rpe', 'fluke1663').karten}
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('zs', 'fluke1663').icon}<span class="titel-text">2. Absicherung & Schleifenimpedanz am Übergabepunkt</span></div>
      <div class="grid">
        <div class="form-group">
          <label>Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${attrEsc(data.sich)}" placeholder="z. B. B 32A" oninput="validateFeedNorms(${cardCounter})" autocomplete="off">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 16A'); validateFeedNorms(${cardCounter})">B 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 32A'); validateFeedNorms(${cardCounter})">B 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 32A'); validateFeedNorms(${cardCounter})">C 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 63A'); validateFeedNorms(${cardCounter})">C 63A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Z<sub>S</sub> (&Omega;) &ndash; Schleifenimpedanz L&ndash;PE <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>
          <input type="text" inputmode="decimal" class="c-zs" value="${attrEsc(data.zs)}" placeholder="z. B. 0.28" oninput="onFeedZsInput(${cardCounter})">
          <div class="limit-hint" id="fzs_limit_${cardCounter}"></div>
        </div>
        <div class="form-group">
          <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>
          <input type="text" inputmode="decimal" class="c-ik" value="${attrEsc(data.ik)}" placeholder="z. B. 605" oninput="onFeedIkInput(${cardCounter})">
          <div class="limit-hint">Wird aus Z<sub>S</sub> berechnet (I<sub>K</sub> = 230 V / Z<sub>S</sub>), solange nichts von Hand eingetragen wird.</div>
        </div>
      </div>
      ${messgroesseBlock('zs', 'fluke1663').karten}
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('rcd', 'fluke1663').icon}<span class="titel-text">3. Fehlerstrom-Schutzeinrichtung (RCD / FI) am Übergabepunkt</span></div>
      <div class="grid">
        <div class="form-group">
          <label>RCD Typ:</label>
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${attrEsc(data.rcd_typ)}" placeholder="z. B. Typ A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ A')">Typ A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B')">Typ B</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B+')">Typ B+</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Ohne RCD')">Ohne RCD</button>
          </div>
        </div>
        <div class="form-group">
          <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${attrEsc(data.rcd_idn)}" placeholder="z. B. 30 mA" oninput="validateFeedNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '30 mA'); validateFeedNorms(${cardCounter})">30 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '300 mA'); validateFeedNorms(${cardCounter})">300 mA</button>
          </div>
        </div>
        <div class="form-group">
          <label>Auslösestrom I<sub>&Delta;mess</sub> (mA):</label>
          <input type="text" inputmode="decimal" class="c-rcd-imess" value="${attrEsc(data.rcd_imess)}" placeholder="z. B. 22" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Prüfstrom für Auslösestrom / Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateFeedNorms(${cardCounter})">
            <option value=""${pruefstromSel(data.rcd_pruefstrom, '')}>&ndash; bitte wählen &ndash;</option>
            <option value="1"${pruefstromSel(data.rcd_pruefstrom, '1')}>1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>
            <option value="2"${pruefstromSel(data.rcd_pruefstrom, '2')}>2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>
            <option value="5"${pruefstromSel(data.rcd_pruefstrom, '5')}>5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="fta_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rcd-ta" value="${attrEsc(data.rcd_ta)}" placeholder="z. B. 24" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
      ${messgroesseBlock('rcd', 'fluke1663').karten}
    </div>
  `;
  // Pruefstrom: bei einer neuen Karte ist "5" bereits per <option selected>
  // vorbelegt (siehe pruefstromSel oben) - das darf hier nicht ueberschrieben
  // werden. Ein wiederhergestellter, auch bewusst leerer Wert wird weiterhin
  // exakt uebernommen.
  if (data.rcd_pruefstrom !== undefined) card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom;
  container.appendChild(card);
  nummeriereKartenNeu('#feedsContainer', '.feed-card', 'Übergabepunkt');
  validateFeedNorms(cardCounter);
}

/* Karte duplizieren - ohne Messwerte. Begruendung siehe pdf-generator.js:
 * uebernommen wird, was den Uebergabepunkt beschreibt, nicht was gemessen
 * wurde. Ein kopierter Messwert waere eine erfundene Messung. */
function dupliziereUebergabepunkt(cardDomId) {
  const card = document.getElementById(cardDomId);
  if (!card) return;
  const w = (sel) => card.querySelector(sel)?.value || '';
  const bezAlt = w('.c-bez').trim();
  addFeedCard({
    bez: bezAlt ? bezAlt + ' (Kopie)' : '',
    netzsystem: w('.c-netzsystem'),
    spannung: w('.c-spannung'),
    frequenz: w('.c-frequenz'),
    sich: w('.c-sich-typ'),
    rcd_typ: w('.c-rcd-typ'),
    rcd_idn: w('.c-rcd-idn'),
    rcd_pruefstrom: w('.c-rcd-pruefstrom')
    // drehfeld, rpe, unpe, zs, ik, rcd_imess, rcd_ta bleiben leer.
  });
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  const neu = document.querySelector('#feedsContainer .feed-card:last-child .c-bez');
  if (neu) { neu.focus(); neu.select(); }
}

function validateFeedNorms(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;

  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseMesswert(rpeElem.value);
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  /* 4.5.0 (B1): U N-PE bewerten. Sollwert 0 V, ab 1 V Beanstandung.
   * Fehlt der Wert ganz, wird das Feld als fehlende Pflichtangabe markiert -
   * dieselbe Farbe wie bei einem eingetragenen, aber ungeprueften RCD. */
  const unpeElem = card.querySelector('.c-unpe');
  if (unpeElem) {
    const leer = unpeElem.value.trim() === '';
    unpeElem.classList.toggle('out-of-norm', npeUeberschritten(unpeElem.value));
    unpeElem.classList.toggle('missing-value', leer);
  }

  const sichElem = card.querySelector('.c-sich-typ');
  const ikElem = card.querySelector('.c-ik');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;

  /* Z_S GEGEN DEN ZULAESSIGEN HOECHSTWERT PRUEFEN (Zs_max = 230 V / I_a).
   * In der Anlagenpruefung gab es das laengst, in der Anschlusspruefung war
   * Z_S ein reines Textfeld: ein Uebergabepunkt mit Z_S = 5 Ohm an C 63 A
   * wurde freigegeben, solange nur das I_K-Feld leer blieb. */
  const maxZs = sichElem ? getMaxZs(sichElem.value) : null;
  const zsElem = card.querySelector('.c-zs');
  const zsLimitLabel = document.getElementById(`fzs_limit_${cardId}`);
  if (zsLimitLabel) {
    zsLimitLabel.innerHTML = maxZs !== null
      ? `max. ${maxZs.toFixed(2).replace('.', ',')} &Omega; &middot; Praxiswert (2/3): ${(maxZs * 2 / 3).toFixed(2).replace('.', ',')} &Omega;`
      : 'Absicherung eintragen, dann erscheint der zulässige Höchstwert.';
  }
  if (zsElem) {
    const zsNum = parseMesswert(zsElem.value);
    if (zsElem.value.trim() !== '' && maxZs !== null && !isNaN(zsNum) && (zsNum > maxZs || zsNum < 0)) zsElem.classList.add('out-of-norm');
    else zsElem.classList.remove('out-of-norm');
  }
  // Widerspruch zwischen Z_S und I_K sichtbar machen (I = 230 V / Z).
  if (zsLimitLabel && !zsIkPaarPruefen(card, '.c-zs', '.c-ik')) {
    zsLimitLabel.innerHTML += ' &middot; <b>Z und I<sub>K</sub> passen nicht zusammen (I = 230 V / Z) &ndash; einer der Werte ist falsch.</b>';
  }

  if (ikElem) {
    ikElem.placeholder = minIk !== null ? `z. B. ${Math.round(minIk * 1.2)} (min. ${minIk} A erforderlich)` : 'z. B. 605';
    if (ikElem.value.trim() !== '' && minIk !== null) {
      const num = parseMesswert(ikElem.value);
      if (!isNaN(num) && num < minIk) ikElem.classList.add('out-of-norm'); else ikElem.classList.remove('out-of-norm');
    } else {
      ikElem.classList.remove('out-of-norm');
    }
  }

  const idnElem = card.querySelector('.c-rcd-idn');
  const imessElem = card.querySelector('.c-rcd-imess');
  if (imessElem && imessElem.value.trim() !== '') {
    const range = idnElem ? getRcdIdnRangeMa(idnElem.value) : null;
    const num = parseMesswert(imessElem.value);
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
    const num = parseMesswert(taElem.value);
    if (!isNaN(num) && (num > taMax || num < 0)) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
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

/* Z_S -> I_K automatisch rechnen; eine Eingabe von Hand hebt die Kopplung auf.
 * Gleiche Logik wie in der Anlagenpruefung (koppleImpedanzMitStrom in
 * pdf-utils.js). */
function onFeedZsInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zs', '.c-ik');
  validateFeedNorms(cardId);
}

function onFeedIkInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const el = card && card.querySelector('.c-ik');
  if (el) delete el.dataset.auto;
  validateFeedNorms(cardId);
}

function feedHasOutOfNorm(card) {
  return Array.from(card.querySelectorAll('.c-rpe, .c-zs, .c-ik, .c-rcd-imess, .c-rcd-ta')).some(el => el.classList.contains('out-of-norm'));
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
  document.getElementById('erdung_re').value = '3,2';
  document.getElementById('pa_messpunkt').value = 'PA-Schiene im Übergabeverteiler Bühnenzugang Ost';
  // Netzmessung am Uebergabepunkt (neu in 4.5.0)
  document.getElementById('u_l1n').value = '231';
  document.getElementById('u_l2n').value = '230';
  document.getElementById('u_l3n').value = '229';
  document.getElementById('u_l12').value = '399';
  document.getElementById('u_l23').value = '400';
  document.getElementById('u_l13').value = '401';
  document.getElementById('netzfrequenz').value = '50';
  validateErdungAnschluss();
  document.getElementById('res_bemerkungen').value = 'Übergabepunkt in einwandfreiem Zustand. Keine Mängel festgestellt.';

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard({ bez: 'Bühnenversorgung Haupt', netzsystem: 'TN-S', spannung: '230 / 400', frequenz: '50 Hz', rpe: '0,12', unpe: '0,3', sich: 'C 32A', zs: '0,31', ik: '740', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '21', rcd_ta: '17', rcd_pruefstrom: '5' });
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
const ANSCHLUSS_REVISION = "Formular Rev. 2026-09 · Normstand: VDE 0100-600:2017-06 · VDE 0100-718:2019-06";

/* ===========================================================================
 *  LEERFORMULAR ZUM AUSFUELLEN VON HAND  (siehe Kommentar in pdf-generator.js)
 *  RCD in drei schmale Spalten, groessere Zeilenhoehe, echte
 *  Fortsetzungsblaetter statt mehrfachem Ausdruck desselben Blattes.
 * ======================================================================== */
// 4.5.0: 10 -> 9 Zeilen. Der Kopfkasten traegt jetzt zwei Zeilen Netzmessung
// (Befund B1); die Zeile wird dort gebraucht, damit Blatt 1 ein Blatt bleibt.
const LEER_ZEILEN_BLATT1_AP = 7;
const LEER_ZEILEN_FOLGE_AP  = 28;
const LEER_ZEILENHOEHE_AP   = 8.0;

const LEER_HEAD_AP = [[
  'Nr.',
  'Bezeichnung\nÜbergabepunkt',
  'Netzsystem\nSpannung / Frequenz',
  'Dreh-\nfeld',
  'R_{PE}\n(Ω)\n≤ 0,30',
  'U_{N-PE}\n(V)\nSoll 0',
  'Absicherung\nTyp / I_{n}',
  'Z_{S} (Ω) / I_{K} (A)\nZ_{S} ≤ 230 V / I_{a}',
  'RCD\nTyp / I_{Δn}',
  'I_{Δmess}\n(mA)',
  't_{A} (ms)\n@ ____ x I_{Δn}'
]];

// 4.7.0: Summe = 180 mm statt vorher 190 mm - seit PDF_MARGIN_LEFT auf
// 20 mm vergroessert wurde (Locherrand), quetschte die Tabelle sonst 10 mm
// ueber den neuen Satzspiegel hinaus. Alle Spalten proportional verkleinert.
const LEER_SPALTEN_AP = {
  0: { cellWidth: 6 }, 1: { cellWidth: 29, halign: 'left' }, 2: { cellWidth: 24 },
  3: { cellWidth: 11 }, 4: { cellWidth: 13 }, 5: { cellWidth: 12 },
  6: { cellWidth: 14 }, 7: { cellWidth: 23 }, 8: { cellWidth: 18 },
  9: { cellWidth: 12 }, 10: { cellWidth: 18 }
};

const LEER_LEGENDE_AP =
  'Legende: I_{a} = Strom der magnetischen Schnellauslösung (B: 5×I_{n} · C: 10×I_{n} · D: 20×I_{n}) · ' +
  'Z_{S} = Schleifenimpedanz, zulässig ≤ 230 V / I_{a} · I_{K} = Kurzschlussstrom · ' +
  'I_{Δn} = Nennfehlerstrom des RCD · I_{Δmess} = gemessener Auslösestrom (zulässig 0,5–1,0 × I_{Δn}) · ' +
  't_{A} = Auslösezeit: ≤ 40 ms bei 5×I_{Δn}, ≤ 150 ms bei 2×, ≤ 300 ms bei 1× (Typ S: 150 / 200 / 500 ms) · ' +
  'Drehfeld: rechts drehend bei CEE 16–125 A · R_{PE} = Schutzleiterwiderstand, Messstrom ≥ 200 mA · ' +
  'U_{N-PE} = Spannung Neutralleiter gegen Schutzleiter, Sollwert 0 V. Ein Wert über 1 V weist auf einen ' +
  'hochohmigen PEN, eine Fremdeinspeisung oder eine vertauschte Einspeisung am Aggregat hin.';

/* Sollwerte der Netzmessung - stehen im Fussbereich jedes Leerformulars (4.5.0). */
const LEER_SOLLWERTE_AP =
  'Netzmessung Sollwerte: L gegen N je 230 V - L gegen L je 400 V - N gegen PE 0 V - Frequenz 50 Hz.';

const LEER_BEISPIEL_TEXT_AP =
  'Beispiel: Bühnenversorgung Haupt | TN-S 230 / 400 V, 50 Hz | Drehfeld i.O. | R_{PE} 0,12 Ω | ' +
  'U_{N-PE} 0,3 V | C 32A | Z_{S} 0,31 Ω / I_{K} 740 A | RCD Typ A 30 mA | I_{Δmess} 21 mA | t_{A} 17 ms @ 5x';

function leerBlattzahlAnschluss() {
  const roh = parseInt(document.getElementById('leer_blaetter')?.value || '1', 10);
  if (isNaN(roh)) return 1;
  return Math.min(Math.max(roh, 1), 4);
}

/* 5.0.0 (BUG #8 aus der 4.7.2-Prüfung): try/catch-Wrapper um den PDF-Aufbau,
 * analog zu generatePDF()/generatePDFInner() in pdf-generator.js - siehe dort
 * für die ausführliche Begründung. */
function generatePDFAnschluss(isBlank = false) {
  try {
    generatePDFAnschlussInner(isBlank);
  } catch (err) {
    console.error('[PDF] Unerwarteter Fehler bei der PDF-Erzeugung:', err);
    alert(
      'Beim Erzeugen des PDFs ist ein unerwarteter Fehler aufgetreten.\n\n' +
      'Das Formular wurde NICHT gespeichert oder zurückgesetzt - deine Eingaben ' +
      'bleiben erhalten (Autosave läuft weiter).\n\n' +
      'Bitte versuche es erneut. Falls der Fehler wiederholt auftritt, hilft oft ' +
      'ein Blick auf sehr lange Freitextfelder (Bemerkungen o.Ä.) - oder melde den ' +
      'Fehler mit einer Beschreibung, was gerade im Formular stand.\n\n' +
      'Technische Details: ' + (err && err.message ? err.message : String(err))
    );
  }
}

function generatePDFAnschlussInner(isBlank = false) {
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung -> Abbruch vor dem Aufbau des PDF.
   * Gilt nie fuer das Leerformular. */
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(
      ['.sicht-item', '.c-drehfeld', '#pa_angeschlossen', '#res_maengel',
       '#res_leistung_ausreichend', '#res_freigabe']);
    if (offeneAuswahl) { offeneBewertungMelden(offeneAuswahl); return; }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    alert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Ohne einen einzigen Uebergabepunkt gibt es nichts zu uebergeben. */
  if (!isBlank && document.querySelectorAll('.feed-card').length === 0) {
    keinePrueflingeMelden('Übergabepunkt');
    return;
  }

  // Ein Uebergabepunkt ohne Messwert ist keine Pruefung - siehe pdf-utils.js.
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      document.querySelectorAll('#feedsContainer .feed-card'),
      ['.c-rpe', '.c-unpe', '.c-zs', '.c-ik', '.c-rcd-imess', '.c-rcd-ta']);
    if (ohneMessung.length) { ohneMessungMelden(ohneMessung, 'Übergabepunkt'); return; }
  }

  /* 4.5.0 (B1): U N-PE ist Pflichtangabe je Uebergabepunkt.
   * Hinter einem fremden Uebergabepunkt ist die N-PE-Spannung der einzige
   * Messwert, der eigenstaendig einen Fehler findet (hochohmiger PEN,
   * Fremdeinspeisung, vertauschte Einspeisung am Aggregat). Ein Uebergabe-
   * protokoll ohne diesen Wert gibt eine Anlage frei, deren gefaehrlichsten
   * Fehler niemand gesucht hat.
   * (Soll der Wert einmal wirklich nicht messbar sein: diesen Block
   *  auskommentieren - die Bewertung selbst bleibt davon unberuehrt.) */
  if (!isBlank) {
    const feeds = Array.from(document.querySelectorAll('#feedsContainer .feed-card'));
    const ohneNpe = feeds
      .map((k, i) => (String(k.querySelector('.c-unpe')?.value || '').trim() === '' ? i + 1 : null))
      .filter(n => n !== null);
    if (ohneNpe.length) {
      alert('Spannung U N–PE fehlt bei Übergabepunkt ' + ohneNpe.join(', ') + '.\n\n' +
            'Sollwert 0 V. Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler ' +
            'findet (hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat) - ' +
            'genau die Fehler, die hinter einem fremden Übergabepunkt liegen.\n\n' +
            'Das PDF wurde deshalb nicht erstellt.');
      feeds[ohneNpe[0] - 1]?.querySelector('.c-unpe')?.focus();
      return;
    }
  }

  /* Mindestangaben eines ausgefuellten Protokolls. */
  if (!isBlank) {
    const fehlend = erstesLeerePflichtfeld(['datum', 'pruefer', 'veranstaltung', 'uebergabe_standort']);
    if (fehlend) { pflichtfeldMelden(fehlend); return; }
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
  const redCellBg = [254, 226, 226];

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
  // Im Leerformular bleibt der Ort offen (Gastspiel, Freilicht, Fremdhaus).
  const ort = isBlank ? "" : getVal('unterschrift_ort', "");
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
  // 4.5.0 (B1): 36 -> 45 mm. Der Kopfkasten traegt jetzt zusaetzlich die
  // Netzmessung am Uebergabepunkt (zwei Zeilen Kurzfelder).
  const SEK1_H = 45;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN & BEREITSTELLER DER EINSPEISUNG", kat: 'stamm' });

  doc.setFontSize(7.2);
  // 4.7.0: spL von 13 auf PDF_MARGIN_LEFT + 3 (23) verschoben (Locherrand),
  // spB entsprechend von 90 auf 80 verkleinert, damit die Zeile weiterhin
  // vor spR (107) endet.
  const spL = PDF_MARGIN_LEFT + 3, spR = 107, spB = 80;

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    let t = g;
    if (sn) t += ` (SN ${sn})`;
    return t;
  })();

  const z1 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Auftraggeber:",         feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",      feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Veranstaltung/Anlass:", feldWert('veranstaltung'),   spL, z1(2), spB, isBlank);
  // [Befund A6, 6.0.0] Qualifikation der pruefenden Person (EFK / EuP unter
  // Aufsicht einer EFK) wird als Kurzform an den Namen angehaengt - eine
  // eigene Zeile wuerde das voll belegte 6-Zeilen-Raster dieser Spalte sprengen.
  const pruegerQualiValAP = feldWert('pruefer_qualifikation');
  const pruegerQualiKurzAP = pruegerQualiValAP.startsWith('Elektrotechnisch') ? 'EuP unter Aufsicht einer EFK' : pruegerQualiValAP;
  const prueferNameAP = feldWert('pruefer');
  const prueferMitQualiAP = prueferNameAP + (prueferNameAP && pruegerQualiKurzAP ? ' (' + pruegerQualiKurzAP + ')' : '');
  drawFeldZeile(doc, "Prüfer/-in:",           prueferMitQualiAP,            spL, z1(3), spB, isBlank);
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

  /* --- NETZMESSUNG AM ÜBERGABEPUNKT (neu in 4.5.0, Befund B1) -------------
   * Die Anschlusspruefung enthielt bisher keine einzige Spannungsmessung.
   * Hinter einem fremden Uebergabepunkt liegen aber genau die Fehler, die man
   * nur an der Spannung sieht: hochohmiger PEN, Fremdeinspeisung, vertauschte
   * Einspeisung am Aggregat. Die N-PE-Spannung steht je Uebergabepunkt in der
   * Messtabelle, die Aussenleiterspannungen des Speisepunkts hier im Kopf. */
  const NETZMESS_FELDER_AP = ['u_l1n', 'u_l2n', 'u_l3n', 'netzfrequenz', 'u_l12', 'u_l23', 'u_l13'];
  const netzWert = (id) => isBlank ? '' : (document.getElementById(id)?.value || '').trim();

  if (isBlank || NETZMESS_FELDER_AP.some(id => netzWert(id))) {
    doc.setFont('helvetica', 'bold');
    // 4.7.0: seit spL auf 23 mm verschoben wurde (Locherrand), passte die fett
    // gesetzte Beschriftung "Netzmessung:" bei 7 pt nicht mehr vor die bei
    // x = 36 beginnende erste Kurzfeld-Spalte und ueberdeckte "U L1-N".
    drawFittedText(doc, 'Netzmessung:', spL, z1(6), 36 - spL - 1, 7, 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    const NM_X0 = 36, NM_DX = 41, NM_FELD_B = 38;
    const nmZelle = (label, id, spalte, zeile) => {
      const wert = netzWert(id);
      const einheit = id === 'netzfrequenz' ? 'Hz' : 'V';
      // Im fertigen Protokoll steht bei einem nicht gemessenen Wert "n. gem."
      // statt einer leeren Schreiblinie (die sonst wie ein vergessenes Feld aussieht).
      const text = wert ? withUnit(wert, einheit) : (isBlank ? '' : 'n. gem.');
      // Diese sechs Aussenleiterwerte wurden bisher nie bewertet - weder live
      // im Formular noch im PDF. netzspannungAusserNorm() (pdf-utils.js)
      // prueft jetzt zentral gegen das 10%-Toleranzband um 230 V (L-N) bzw.
      // 400 V (L-L).
      const rot = !isBlank && netzspannungAusserNorm(id, wert);
      drawFeldZeile(doc, label + ':', text,
                    NM_X0 + spalte * NM_DX, z1(6) + zeile * ZA, NM_FELD_B, isBlank, { rot: !!rot });
    };
    doc.setFontSize(6.6);
    nmZelle('U L1-N',  'u_l1n', 0, 0);
    nmZelle('U L2-N',  'u_l2n', 1, 0);
    nmZelle('U L3-N',  'u_l3n', 2, 0);
    nmZelle('f',       'netzfrequenz', 3, 0);
    nmZelle('U L1-L2', 'u_l12', 0, 1);
    nmZelle('U L2-L3', 'u_l23', 1, 1);
    nmZelle('U L1-L3', 'u_l13', 2, 1);
    doc.setFontSize(6.2);
    doc.setTextColor(...PDF_MUTED);
    doc.text('U N-PE: siehe Messtabelle', NM_X0 + 3 * NM_DX, z1(6) + ZA);
    doc.setTextColor(...textColor);
    doc.setFontSize(7.2);
  }

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
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, PDF_MARGIN_LEFT jetzt 20 mm),
  // dabei Spaltenbreite leicht gestaucht, damit Spalte 3 weiterhin vor dem
  // rechten Rand endet (200 mm Satzspiegel-Ende, ehemals 10, jetzt 20 mm Rand).
  const SICHT_LABEL_X = [23, 82, 141];
  const SICHT_CB_X    = [50, 109, 167];
  // In der dritten Spalte stiess die Beschriftung bisher ohne Abstand an das
  // i.O.-Kaestchen. Die verfuegbare Textbreite ist dort deshalb begrenzt;
  // die laengste Beschriftung wurde zusaetzlich gekuerzt. Das Kaestchen bleibt
  // in Spalte 3, damit die dritte Box ("n.a.") rechts nicht ueber den
  // Satzspiegel hinauslaeuft.
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
    /* Dritte Checkbox "n.a." fuer JEDEN Punkt.
     * FRUEHER hatte nur Punkt 7 (Witterungsschutz) diesen Zustand. Ein
     * Uebergabepunkt am Notstromaggregat hat aber keinen Zaehlerschrank
     * (Punkt 1) und oft keine Pruefplakette eines Verteilers (Punkt 9) - der
     * Pruefer musste trotzdem i.O. oder n.i.O. ankreuzen und bestaetigte oder
     * beanstandete damit etwas, das gar nicht existiert. Im Anlagenprotokoll
     * war dieser Zustand von Anfang an vorgesehen. */
    drawCheckbox(doc, SICHT_CB_X[spalte] + 24, yy, "n.a.", !isBlank && s[i]?.value === "n.a.");
  });

  y += SEK2_H + 6;

  // SEKTION 3: ÜBERGABEPUNKTE TABELLE (Kategorie "messen" = gruen)
  const katMessen = drawKategorieTitel(doc, "3. MESSTECHNISCHE PRÜFUNGEN JE ÜBERGABEPUNKT", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Schutzleiter, Schleifenimpedanz, RCD. Grenzwerte je Spalte im Tabellenkopf; unzulässige Werte werden rot hinterlegt.", PDF_MARGIN_LEFT, y + 3.4);
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
  const blaetter = isBlank ? leerBlattzahlAnschluss() : 1;

  if (isBlank) {
    // Die Musterangabe steht jetzt als graue Zeile im Fussbereich und
    // verbraucht keine Schreibzeile mehr.
    for (let i = 1; i <= LEER_ZEILEN_BLATT1_AP; i++) {
      tableRows.push([i, "", "", "", "", "", "", "", "", "", ""]);
    }
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
      /* Ein Linksdrehfeld am Uebergabepunkt ist in der Veranstaltungstechnik
       * eine echte Beanstandung: Kettenzuege, Winden und Motoren laufen damit
       * verkehrt herum. Der Wert wurde bisher nur gedruckt und ging in keine
       * Bewertung ein - der Uebergabepunkt wurde trotz "n.i.O." freigegeben. */
      const isDrehfeldOut = drehfeld === 'n.i.O.';

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeNum = parseMesswert(rpeVal);
      const isRpeOut = (!isNaN(rpeNum) && (rpeNum > 0.30 || rpeNum < 0)) || istMesswertUngueltig(rpeVal);
      const rpeText = rpeVal ? `${kommaZahlGeprueft(rpeVal)} Ω` : '-';

      /* 4.5.0 (B1): Spannung N-PE je Uebergabepunkt. Sollwert 0 V. */
      const unpeVal = card.querySelector('.c-unpe')?.value || '';
      const isUnpeOut = npeUeberschritten(unpeVal) || istMesswertUngueltig(unpeVal);
      const unpeText = unpeVal ? (istMesswertUngueltig(unpeVal) ? kommaZahlGeprueft(unpeVal) : withUnit(unpeVal, 'V')) : '-';

      const sich = card.querySelector('.c-sich-typ').value || '-';
      const zs = card.querySelector('.c-zs').value;
      const ik = card.querySelector('.c-ik').value;
      const minIk = getMinIk(sich);
      const ikNum = parseMesswert(ik);
      const isIkOut = minIk !== null && !isNaN(ikNum) && ikNum < minIk;
      // Z_S wird jetzt auch hier bewertet (Zs_max = 230 V / I_a), inklusive
      // Plausibilitaet gegen I_K - bisher war das Feld reine Dokumentation.
      const maxZsPdf = getMaxZs(sich);
      const zsNumPdf = parseMesswert(zs);
      const isZsOut = (maxZsPdf !== null && !isNaN(zsNumPdf) && (zsNumPdf > maxZsPdf || zsNumPdf < 0))
        || istMesswertUngueltig(zs) || istMesswertUngueltig(ik);
      const zsIkWiderspruch = !zIkPlausibel(zs, ik);
      if (zsIkWiderspruch) anyDokumentationsmangel = true;
      let zsik = '-';
      if (zs || ik) zsik = `${kommaZahlGeprueft(zs) || '-'} Ω / ${kommaZahlGeprueft(ik) || '-'} A`;

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

      const taNum = parseMesswert(rcdTa);
      const isTaOut = rcdZelle.taMax !== null && !isNaN(taNum) && (taNum > rcdZelle.taMax || taNum < 0);
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseMesswert(rcdImess);
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);
      // Zelle rot: sowohl bei fehlender Angabe als auch bei echter Beanstandung.
      const isRcdOut = isTaOut || isImessOut || rcdZelle.isOut;
      // In die GESAMTBEWERTUNG geht nur ein, was die Sicherheit betrifft.
      const isRcdBeanstandung = isTaOut || isImessOut || rcdZelle.isPruefungUnvollstaendig;
      if (rcdZelle.isDokumentationsmangel) anyDokumentationsmangel = true;

      const rcdText = rcdZelle.text;

      if (isRpeOut || isIkOut || isZsOut || isRcdBeanstandung || isDrehfeldOut || isUnpeOut) anyFeedMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(kommaZahl(netzSpannungFreq)),
        makeCell(cleanStr(drehfeld), isDrehfeldOut),
        makeCell(cleanStr(rpeText), isRpeOut),
        makeCell(cleanStr(unpeText), isUnpeOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut || isZsOut || zsIkWiderspruch),
        makeCell(cleanStr(rcdText), isRcdOut)
      ]);
    });
  }

  const HEAD_AUSGEFUELLT_AP = [[
    'Nr.',
    'Bezeichnung\nÜbergabepunkt',
    'Netzsystem\nSpannung / Frequenz',
    'Dreh-\nfeld',
    'R_{PE}\n(Ω)\nRichtw. ≤ 0,30',
    'U_{N-PE}\n(V)\nSollwert 0',
    'Absicherung\nTyp / I_{n}',
    'Z_{S} (Ω) / I_{K} (A)\nZ_{S} ≤ 230 V / I_{a}\nI_{K} ≥ 5x/10x/20x I_{n}',
    'RCD: Typ (I_{Δn})\nI_{Δmess} 0,5-1,0x I_{Δn}\nt_{A} ≤ 40 ms bei 5x'
  ]];

  doc.autoTable(mitFormelHooks(doc, {
    startY: y + 5,
    // Kopfzeilen mit Umbruch: Groesse / Einheit / Grenzwert stehen untereinander
    head: isBlank ? LEER_HEAD_AP : HEAD_AUSGEFUELLT_AP,
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
    // 4.7.0: Summe = 180 mm (210 - 20 mm linker Rand - 10 mm rechter Rand).
    // Vorher 190 mm (bei 10 mm Rand beidseitig) - seit PDF_MARGIN_LEFT auf
    // 20 mm vergroessert wurde (Locherrand), quetschte die Tabelle sonst
    // 10 mm ueber den neuen Satzspiegel hinaus. Alle Spalten proportional
    // verkleinert (Faktor 180/190).
    columnStyles: isBlank ? LEER_SPALTEN_AP : {
      0: { cellWidth: 7 }, 1: { cellWidth: 29, halign: 'left' }, 2: { cellWidth: 27 },
      3: { cellWidth: 11 }, 4: { cellWidth: 16 }, 5: { cellWidth: 14 },
      6: { cellWidth: 17 }, 7: { cellWidth: 23 }, 8: { cellWidth: 36 }
    },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
              minCellHeight: isBlank ? LEER_ZEILENHOEHE_AP : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
  }));

  let finalY = doc.lastAutoTable.finalY + 6;

  /* --- SEKTION 4: ERDUNG / POTENZIALAUSGLEICH & FREIGABE ------------------
   * Neu: Messpunkt/Bezugspunkt sowie Freitextzeilen fuer eigene Messstellen. */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  /* Schrift VOR dem Umbruch setzen: splitTextToSize misst mit der gerade
   * aktiven Schrift. Nach doc.autoTable() ist das nicht die Schrift, mit der
   * unten gedruckt wird - die Zeilen liefen dadurch ueber die Papierkante und
   * die letzten Zeichen fehlten im PDF. */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  const OFF_PA = 10;
  const OFF_PUNKT = OFF_PA + ZA;
  const offErgebnis   = OFF_PUNKT + ZA + 2;
  const offFreigabe   = offErgebnis + 5.5;
  const offBemLabel   = offFreigabe + 5.5;
  const offBemStart   = offBemLabel + 4.2;
  const boxHeight     = offBemStart + bemZeilen * 4.2 + 2.5;

  /* 4.5.0 (C1): Kasten 4 und der Abschlussblock werden GEMEINSAM auf Platz
   * geprueft - sonst passt der Kasten noch, der Unterschriftenblock aber nicht
   * mehr, und es entsteht eine zweite Seite mit nichts als zwei Linien darauf. */
  finalY = pdfPlatzPruefen(doc, finalY, boxHeight + 5 + 32);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "4. ERDUNG, POTENZIALAUSGLEICH & GESAMTBEWERTUNG", kat: 'erdung' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const paVal = document.getElementById('pa_angeschlossen')?.value || '';
  doc.text("Potenzialausgleich angeschlossen:", PDF_MARGIN_LEFT + 3, finalY + OFF_PA);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, Label startet jetzt
  // bei PDF_MARGIN_LEFT + 3 = 23 statt vorher 13).
  drawCheckbox(doc, 68, finalY + OFF_PA, "Ja", !isBlank && paVal === "Ja");
  drawCheckbox(doc, 80, finalY + OFF_PA, "Nein", !isBlank && paVal === "Nein", true);
  drawCheckbox(doc, 95, finalY + OFF_PA, "n.a.", !isBlank && paVal === "n.a.");

  const erdungReNum = parseMesswert((document.getElementById('erdung_re')?.value || ''));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && (erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS || erdungReNum < 0);

  drawFeldZeile(doc, `Erdungswiderstand R_{E} (≤ ${ERDUNG_RE_GRENZWERT_ANSCHLUSS} Ω):`,
                feldWert('erdung_re') ? withUnit(feldWert('erdung_re'), 'Ω') : '', 107, finalY + OFF_PA, 90, isBlank, { rot: isErdungOut });

  drawFeldZeile(doc, "Messpunkt / Bezugspunkt (z. B. HES, PA-Schiene, Erdspieß, Fundamenterder):",
                feldWert('pa_messpunkt'), PDF_MARGIN_LEFT + 3, finalY + OFF_PUNKT, 177, isBlank);

  /* --- DREI ZUSTAENDE STATT ZWEI (identisch zum Anlagenprotokoll) --------- */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  const leistungVal = document.getElementById('res_leistung_ausreichend')?.value || '';
  const freigabeVal = document.getElementById('res_freigabe')?.value || 'Ja';
  const anySichtNiOFrueh = Array.from(s).some(el => el?.value === 'n.i.O.');
  // Beanstandungen unabhaengig von der Auswahl - nur ohne sie darf "behoben"
  // positiv ausgehen.
  /* "Potenzialausgleich angeschlossen: Nein" wurde bisher nur gedruckt und
   * ging in keine Bewertung ein - der Uebergabepunkt wurde trotzdem
   * freigegeben. "n.a." bleibt bewusst ohne Wirkung (es gibt Uebergabepunkte
   * ohne eigenen Potenzialausgleich, z. B. reine Schutztrennung). */
  const isPaFehlt = paVal === 'Nein';
  const restBeanstandungen = !isBlank && (freigabeVal === 'Nein' || leistungVal === 'Nein' ||
                             anySichtNiOFrueh || anyFeedMeasurementOut || isErdungOut || isPaFehlt);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;
  // anschlusspruefung.html kennt kein Totlegen einzelner Uebergabepunkte
  // (typischerweise nur 1-3 Karten) - Ampel bleibt hier zweistufig gruen/rot,
  // ueber ermittleAmpelStatus() aber technisch dieselbe Funktion wie in den
  // anderen beiden Formularen (Befund #2).
  const ampelStatus = ermittleAmpelStatus({
    isBlank, hatKeineMaengel, hatBehoben, hatMaengel, restBeanstandungen,
    einzelDefektAnzahl: 0
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", PDF_MARGIN_LEFT + 3, finalY + offErgebnis);
  drawCheckbox(doc, 44, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel, hatKeineMaengel ? ampelStatus : 'neutral');
  drawCheckbox(doc, 92, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, hatBehoben ? (behobenTrotzOffener ? 'rot' : ampelStatus) : 'neutral');
  drawCheckbox(doc, 156, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, 'rot');

  doc.text("Freigabe zur Nutzung:", PDF_MARGIN_LEFT + 3, finalY + offFreigabe);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand).
  drawCheckbox(doc, 55, finalY + offFreigabe, "Ja", !isBlank && freigabeVal === "Ja", freigabeVal === "Ja" ? ampelStatus : 'neutral');
  drawCheckbox(doc, 66, finalY + offFreigabe, "Nein", !isBlank && freigabeVal === "Nein", 'rot');

  // "Leistung ausreichend" steht jetzt in dieser Zeile: die Ergebniszeile
  // darueber braucht die volle Breite fuer das dritte Ankreuzfeld.
  doc.text("Leistung ausreichend:", 100, finalY + offFreigabe);
  drawCheckbox(doc, 132, finalY + offFreigabe, "Ja", !isBlank && leistungVal === "Ja");
  drawCheckbox(doc, 143, finalY + offFreigabe, "Nein", !isBlank && leistungVal === "Nein", true);
  // "n.a." war im Formular waehlbar, im PDF aber nicht darstellbar
  drawCheckbox(doc, 158, finalY + offFreigabe, "n.a.", !isBlank && leistungVal === "n.a.");

  /* [Nutzerwunsch] Ein eingetragener Mangel/eine Bemerkung ging im PDF bisher
   * in normaler Schrift unter - auf einen Blick war nicht erkennbar, ob dort
   * ueberhaupt etwas vermerkt wurde. Jetzt: sobald Text eingetragen wurde,
   * wird der Bereich rot hinterlegt und in Fettschrift gedruckt (gleiche
   * Rot-Palette wie bei einer rot markierten Messzelle). */
  const hatBemerkungstext = !isBlank && splitBemerkung.length > 0;
  if (hatBemerkungstext) {
    const bemHighlightY = finalY + offBemLabel - 3.3;
    const bemHighlightH = 4.2 + bemZeilen * 4.2 + 1.8;
    doc.setFillColor(...redCellBg);
    doc.roundedRect(PDF_MARGIN_LEFT + 1.5, bemHighlightY, PDF_CONTENT_WIDTH - 3, bemHighlightH, 0.8, 0.8, 'F');
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...(hatBemerkungstext ? redCellText : textColor));
  doc.text("Bemerkungen / Mängel:", PDF_MARGIN_LEFT + 3, finalY + offBemLabel);
  doc.setFont("helvetica", hatBemerkungstext ? "bold" : "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    doc.setTextColor(...textColor);
    drawSchreibLinien(doc, PDF_MARGIN_LEFT + 3, finalY + offBemStart + 1, 177, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, PDF_MARGIN_LEFT + 3, finalY + offBemStart);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
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
  const complianceGesamt = complianceText +
    (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  /* Der Warntext bei Maengeln wird FETT gesetzt und ist damit rund 7 %
   * breiter als in normaler Schrift. Wurde er normal gemessen und fett
   * gedruckt, lief er ueber die rechte Papierkante hinaus und die letzten
   * Zeichen fehlten im PDF. Schrift deshalb VOR splitTextToSize setzen. */
  doc.setFont("helvetica", ampelStatus === 'neutral' ? "italic" : "bold");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, PDF_CONTENT_WIDTH);
  // Umbruch nur, wenn Hinweistext + Unterschriftenblock wirklich nicht mehr passen
  finalY = pdfPlatzPruefen(doc, finalY, complianceLines.length * 3.2 + 6 + 16);

  const ampelTextFarbeAnschluss = { rot: redCellText, gelb: [133, 77, 6], gruen: [21, 101, 52], neutral: [71, 85, 105] }[ampelStatus] || [71, 85, 105];
  doc.setTextColor(...ampelTextFarbeAnschluss);
  doc.text(complianceLines, PDF_MARGIN_LEFT, finalY);
  doc.setTextColor(...textColor);

  finalY += complianceLines.length * 3.2 + 6;

  const ortDatum = isBlank
    ? '________________, den ____________'
    : (unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`);

  if (!isBlank && !padUebergeber.isEmpty()) {
    // 4.7.0: x=10 -> PDF_MARGIN_LEFT (20 mm, Locherrand).
    doc.addImage(padUebergeber.toDataURL('image/png'), 'PNG', PDF_MARGIN_LEFT, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(PDF_MARGIN_LEFT, finalY + 12, PDF_MARGIN_LEFT + 80, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Übergebende/-r (Netzbetreiber/Bereitsteller)`, PDF_MARGIN_LEFT, finalY + 15);

  // 4.7.0: rechte Unterschriftsspalte beginnt jetzt bei 125 statt 115, damit
  // die laengere Beschriftung "- Übernehmende/-r (Veranstalter/Elektrofachkraft)"
  // vor dem rechten Rand (200 mm Satzspiegel-Ende) endet, statt darueber
  // hinauszulaufen.
  const SIG_R_X = 125;
  if (!isBlank && !padUebernehmer.isEmpty()) {
    doc.addImage(padUebernehmer.toDataURL('image/png'), 'PNG', SIG_R_X, finalY, 38, 12);
  }
  doc.line(SIG_R_X, finalY + 12, 200, finalY + 12);
  drawFittedText(doc, `${ortDatum} - Übernehmende/-r (Veranstalter/Elektrofachkraft)`,
                 SIG_R_X, finalY + 15, 200 - SIG_R_X, 6.5, 5.2);
  doc.setFontSize(6.5);

  /* Fussbereich von Blatt 1: Musterangabe und Legende.
   * 4.5.0 (C4): 6 pt statt 4,6 pt, von unten nach oben gesetzt, mit Abstand
   * zur Unterschriftenzeile. Die Legende steht jetzt auf jedem Blatt. */
  if (isBlank) {
    doc.setPage(1);
    drawLeerFuss(doc, [LEER_BEISPIEL_TEXT_AP, LEER_SOLLWERTE_AP, LEER_LEGENDE_AP]);
  }

  /* --- FORTSETZUNGSBLAETTER DES LEERFORMULARS ---------------------------- */
  if (isBlank && blaetter > 1) {
    let laufendeNr = LEER_ZEILEN_BLATT1_AP + 1;
    for (let blatt = 2; blatt <= blaetter; blatt++) {
      doc.addPage();
      let yy = PDF_CONTENT_TOP;
      drawKategorieTitel(doc, `FORTSETZUNG DER MESSTECHNISCHEN FESTSTELLUNGEN (BLATT ${blatt} VON ${blaetter})`, yy, 'messen');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...PDF_MUTED);
      doc.text('Gehört zum Protokoll mit der oben stehenden Protokoll-Nr. Stammdaten, Besichtigung, ' +
               'Gesamtbewertung und Unterschriften stehen auf Blatt 1.', PDF_MARGIN_LEFT, yy + 3.4);
      doc.setTextColor(...PDF_TEXT);

      const folgeZeilen = [];
      for (let i = 0; i < LEER_ZEILEN_FOLGE_AP; i++) {
        folgeZeilen.push([laufendeNr++, "", "", "", "", "", "", "", "", "", ""]);
      }
      doc.autoTable(mitFormelHooks(doc, {
        startY: yy + 5,
        head: LEER_HEAD_AP,
        body: folgeZeilen,
        theme: 'grid',
        rowPageBreak: 'avoid',
        headStyles: {
          fillColor: katMessen.kopf, textColor: katMessen.akzent,
          fontSize: 5.6, fontStyle: 'bold', halign: 'center', valign: 'middle',
          lineColor: katMessen.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
        },
        bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center', valign: 'middle' },
        columnStyles: LEER_SPALTEN_AP,
        margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
        styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18, minCellHeight: LEER_ZEILENHOEHE_AP,
                  overflow: 'linebreak', cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
      }));

      // 4.5.0 (C4): Legende auch auf dem Fortsetzungsblatt.
      drawLeerFuss(doc, [LEER_LEGENDE_AP]);
    }
  }

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
    nachPdfNeuesFormularAnbieten('AP', nummerRoh, resetAnschlussForm, clearAnschlussAutosave, function () {
      AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('AP');
    });
  });
}

// AUTOSAVE
// Einheitliches Praefix 'vde_': der alte Schluessel 'anschluss_protocol_autosave'
// wurde von der Datensicherung nicht erfasst (siehe storage.js).
// 4.7.0: siehe pdf-generator.js AUTOSAVE_KEY_AKTUELL() - mehrere parallele
// Entwuerfe statt eines einzigen festen Schluessels.
entwurfAusUrlUebernehmen('AP');
let AKTUELLER_ENTWURF_ID = aktivenEntwurfSicherstellen('AP', 'vde_autosave_ap');
function ANSCHLUSS_AUTOSAVE_KEY_AKTUELL() { return autosaveKeyFuerEntwurf('AP', AKTUELLER_ENTWURF_ID); }

const ANSCHLUSS_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'pruefer_qualifikation', 'datum', 'messgeraet', 'seriennummer',
  'bereitsteller_ansprechpartner', 'bereitsteller_telefon', 'einspeisung_art', 'einspeisung_sonstiges',
  'uebergabe_standort', 'anschlussleistung_vertrag', 'vnb',
  // Netzmessung am Uebergabepunkt (neu in 4.5.0, Befund B1)
  'u_l1n', 'u_l2n', 'u_l3n', 'u_l12', 'u_l23', 'u_l13', 'netzfrequenz',
  'pa_angeschlossen', 'erdung_re', 'pa_messpunkt',
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
    unpe: card.querySelector('.c-unpe')?.value || '',
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
    /* Leere Datumsangaben aus einer Archiv-Vorlage duerfen die Vorbelegung
     * (heutiges Datum) nicht ueberschreiben. */
    if ((id === 'datum' || id === 'unterschrift_datum') && !String(val || '').trim()) return;
    /* BUGFIX: siehe pdf-generator.js restoreProtocolState() - ein leerer
     * Wert in einem Stammdatenfeld darf den frisch aus den zentralen
     * Stammdaten uebernommenen Wert nicht ueberschreiben. */
    if (MASTERDATA_FIELD_IDS.includes(id) && !String(val || '').trim()) return;
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
      /* Auch ein LEERER Wert muss gesetzt werden: eine aus dem Archiv
       * uebernommene Vorlage liefert das Drehfeld bewusst leer. Mit der
       * frueheren Kurzpruefung "if (f.drehfeld)" blieb stattdessen der
       * Vorgabewert "i.O." stehen - ein Ergebnis, das nie gemessen wurde. */
      if (f.drehfeld !== undefined) card.querySelector('.c-drehfeld').value = f.drehfeld;
    });
  }

  /* [Nutzerwunsch] siehe gleichlautender Kommentar in pdf-generator.js/
   * restoreProtocolState(): sichtErpNiOPruefen() (pdf-utils.js) muss auch
   * beim Wiederherstellen eines gespeicherten Standes angestossen werden,
   * nicht nur bei manueller Auswahl im Formular - sonst bleibt ein bereits
   * gespeichertes n.i.O. unmarkiert. Erst NACH dem Wiederherstellen der
   * Einspeisepunkte, damit der darin ausgeloeste autosaveProtocol()-Aufruf
   * nicht mit noch leerem feedsContainer speichert. */
  document.querySelectorAll('.sicht-item').forEach(el => sichtErpNiOPruefen(el));

  return true;
}

// [Bug #1 aus 4.7.2-Pruefung, 6.0.0] sicherSetItem() statt direktem
// localStorage.setItem() - siehe Erlaeuterung in pdf-generator.js
// autosaveProtocol(). Ein voller Speicher wird jetzt sichtbar gemeldet statt
// still zu scheitern.
function autosaveProtocol() {
  try {
    sicherSetItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectAnschlussState()));
    entwurfMerken('AP', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('AP', () => ({
        anlage: document.getElementById('uebergabe_standort')?.value,
        gebaeude: document.getElementById('gebaeude_custom')?.value
      }))
    });
  } catch (e) {}
}

function loadAnschlussAutosave() {
  try {
    const raw = localStorage.getItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL());
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearAnschlussAutosave() {
  localStorage.removeItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL());
  entwurfEntfernen(AKTUELLER_ENTWURF_ID);
}

function resetAnschlussForm() {
  document.getElementById('anschlussForm').reset();

  // Lokales Datum, siehe heuteIso() in pdf-utils.js
  datumsfeldAufHeute('datum');
  datumsfeldAufHeute('unterschrift_datum');
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
  if (!confirm('Neues Formular anlegen? Das aktuelle Formular bleibt unter "Offene Prüfungen" erhalten und kann dort später fortgesetzt werden.')) return;

  const nr = naechsteProtokollNummer('AP');
  verbraucheProtokollNummer(nr, 'AP');
  AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('AP');
  resetAnschlussForm();
  document.getElementById('protokollnummer').value = nr;
  autosaveProtocol();
  alert(`Neues Protokoll angelegt: ${nr}`);
}
