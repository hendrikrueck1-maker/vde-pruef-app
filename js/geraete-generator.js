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
      <span>
        <button type="button" class="btn btn-secondary" onclick="dupliziereGeraet('device_${cardCounter}')" title="Neue Karte mit derselben Schutzklasse, Leitungslänge und Messmethode. Messwerte und Inventarnummer bleiben leer.">⧉ Duplizieren</button>
        <button type="button" class="btn-danger" onclick="removeCard('device_${cardCounter}')">Entfernen</button>
      </span>
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
        <input type="text" inputmode="decimal" class="c-heizleistung" value="${attrEsc(data.heizleistung)}" placeholder="z. B. 2,0" oninput="heizleistungGeaendert(${cardCounter})">
        <div class="limit-hint">Nach DIN EN 50699 darf der Schutzleiterstrom bei Heizleistung &gt; 3,5 kW auf 1 mA je kW steigen, höchstens 10 mA.</div>
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">1. Besichtigen</div>
      <div class="grid">
        <div class="form-group"><label>Gehäuse / Isolierung / Lüftungsschlitze:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select></div>
        <div class="form-group"><label>Anschlussleitung / Stecker / Zugentlastung:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select></div>
        <div class="form-group"><label>Kennzeichnung / Typenschild lesbar:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select></div>
        <div class="form-group"><label>Keine unsachgemäßen Reparaturen / Überhitzung:</label><select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select></div>
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
          <input type="text" inputmode="decimal" class="c-rpe" value="${attrEsc(data.rpe)}" placeholder="z. B. 0,20" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>R<sub>ISO</sub> (M&Omega;) <span class="limit-hint" id="riso_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-riso" value="${attrEsc(data.riso)}" placeholder="z. B. > 100" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Ableitstrom (mA) <span class="limit-hint" id="ableit_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-ableitstrom" value="${attrEsc(data.ableitstrom)}" placeholder="z. B. 0,3" oninput="validateDeviceNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Messmethode Ableitstrom:</label>
          <select class="c-ableit-methode" onchange="ableitMethodeGeaendert(${cardCounter})">
            <option>Ersatzableitstrom</option>
            <option>Differenzstrommessung</option>
            <option>Direktmessung Berührungsstrom</option>
          </select>
          <div class="limit-hint" id="ableit_methode_hint_${cardCounter}"></div>
        </div>
      </div>
    </div>
  `;
  if (data.ableit_methode) {
    const m = card.querySelector('.c-ableit-methode');
    if (m) m.value = data.ableit_methode;
  }
  container.appendChild(card);
  nummeriereKartenNeu('#devicesContainer', '.feed-card', 'Gerät');
  validateDeviceNorms(cardCounter);
  ableitMethodeGeaendert(cardCounter);
}

/* Karte duplizieren - ohne Messwerte und ohne Inventarnummer.
 * Auf einer Buehne stehen 24 baugleiche Scheinwerfer: gleiche Schutzklasse,
 * gleiche Leitungslaenge, gleiches Messverfahren, verschiedene Inventarnummern
 * und verschiedene Messwerte. Die Inventarnummer wird bewusst NICHT kopiert -
 * sie identifiziert den Prueflinge eindeutig (DIN EN 50699) und darf nie
 * doppelt vergeben werden. */
function dupliziereGeraet(cardDomId) {
  const card = document.getElementById(cardDomId);
  if (!card) return;
  const w = (sel) => card.querySelector(sel)?.value || '';
  const bezAlt = w('.c-bez').trim();
  addDeviceCard({
    bez: bezAlt ? bezAlt + ' (Kopie)' : '',
    typ: w('.c-typ'),
    schutzklasse: w('.c-schutzklasse'),
    laenge: w('.c-laenge'),
    heizelement: card.querySelector('.c-heizelement')?.checked || false,
    heizleistung: w('.c-heizleistung'),
    ableit_methode: w('.c-ableit-methode')
    // invnr, rpe, riso, ableitstrom bleiben leer.
  });
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  const neu = document.querySelector('#devicesContainer .feed-card:last-child .c-invnr');
  if (neu) neu.focus();
}

/* MESSVERFAHREN DES ABLEITSTROMS
 * Die Ersatzableitstrommessung speist eine Pruefspannung ein, bei der
 * netzspannungsabhaengige Schaltelemente NICHT arbeiten. Bei Geraeten mit
 * Elektronik - LED-Scheinwerfer, Movinglights, elektronische Vorschaltgeraete,
 * Schaltnetzteile, Dimmer, Endstufen - misst sie deshalb systematisch zu
 * niedrig. Auf einer Konzertbuehne ist das heute der Regelfall, nicht die
 * Ausnahme: das Verfahren liefert dort einen unauffaelligen Wert, der nichts
 * beweist. DIN EN 50699 verlangt in diesem Fall die Differenzstrom- oder die
 * direkte Messung des Beruehrungsstroms.
 * Der Hinweis blockiert nichts - es gibt Geraete ohne Elektronik, bei denen
 * das Ersatzverfahren richtig ist. Er sagt nur, worauf zu achten ist. */
function ableitMethodeGeaendert(cardId) {
  const card = document.getElementById(`device_${cardId}`);
  if (!card) return;
  const hint = document.getElementById(`ableit_methode_hint_${cardId}`);
  const methode = card.querySelector('.c-ableit-methode')?.value || '';
  if (hint) {
    /* Bewusst nur ein Hinweis, keine Beanstandung: bei einem Verlaengerungs-
     * kabel oder einem Geraet ohne Elektronik ist das Ersatzverfahren richtig.
     * Ob Elektronik verbaut ist, kann nur die pruefende Person wissen - eine
     * Annahme waere hier so falsch wie beim RCD-Pruefstrom. Deshalb erinnert
     * die Zeile, statt zu markieren. */
    hint.textContent = /ersatzableitstrom/i.test(methode)
      ? 'Hinweis: bei Geräten mit Elektronik (LED, EVG, Netzteil, Dimmer, Endstufe) nicht aussagekräftig – dort Differenzstrom- oder Direktmessung. Bei Kabeln und Geräten ohne Elektronik ist das Verfahren richtig.'
      : '';
    hint.classList.remove('out-of-norm');
  }
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
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
    rpeElem.placeholder = 'z. B. 0,20';
    if (rpeElem.value.trim() !== '') {
      const num = parseMesswert(rpeElem.value);
      if (!isNaN(num) && (num > rpeMax || num < 0)) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
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
      const num = parseMesswert(txt);
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
    const num = parseMesswert(ableitElem.value);
    if (!isNaN(num) && ableitMax !== null && (num > ableitMax || num < 0)) ableitElem.classList.add('out-of-norm'); else ableitElem.classList.remove('out-of-norm');
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
  addDeviceCard({ bez: 'PAR-Scheinwerfer Lichtregie', typ: 'ADB PAR64', invnr: 'INV-0231', schutzklasse: 'I', laenge: '10', rpe: '0,22', riso: '> 100', ableitstrom: '0,3' });
  addDeviceCard({ bez: 'Verlängerungskabel 25m', typ: 'H07RN-F 3G2,5', invnr: 'INV-0455', schutzklasse: 'I', laenge: '25', rpe: '0,48', riso: '> 200', ableitstrom: '0,1' });
}

// KOPFDATEN. Der Titel folgt jetzt dem Sprachgebrauch der geltenden Normen:
// DIN EN 50678/50699 sprechen von "elektrischen Geräten", nicht mehr von
// "ortsveränderlichen Betriebsmitteln" (Begriff der zurueckgezogenen VDE 0701-0702).
const GERAETE_KOPF = {
  titel: "PRÜFUNG ELEKTRISCHER GERÄTE",
  normzeile: "Wiederholungsprüfung nach DIN EN 50699 (VDE 0702) / Prüfung nach Reparatur nach DIN EN 50678 (VDE 0701)"
};
const GERAETE_REVISION = "Formular Rev. 2026-09 · Normstand: DIN EN 50678:2021-02 · DIN EN 50699:2021-06";

/* ===========================================================================
 *  LEERFORMULAR ZUM AUSFUELLEN VON HAND
 * ---------------------------------------------------------------------------
 *  FRUEHER hatte dieses Formular 16 Zeilen, keine Blattzahl-Auswahl und keine
 *  Fortsetzungsblaetter. Bei einer Open-Air-Buehne mit 186 Prueflingen musste
 *  man dasselbe Blatt zwoelfmal ausdrucken: jedes Mal "Nr. 1-16", jedes Mal
 *  ein eigener Unterschriftenblock, keine Blattzaehlung - formal zwoelf
 *  getrennte Protokolle fuer einen Pruefvorgang. Genau dieser Zustand war bei
 *  Anlagen- und Anschlusspruefung bereits beseitigt; hier fehlte er.
 *
 *  Zeilenhoehe 6,5 mm -> 8,0 mm: 6,5 mm reichen zum Drucken, nicht zum
 *  Schreiben. 8,0 mm ist dieselbe Hoehe wie in den beiden anderen Protokollen.
 * ======================================================================== */
const LEER_ZEILEN_BLATT1_GP = 13;   // 4.5.0: 16 -> 14, damit Bewertung, Unterschriften
                                    // und die Legende auf Blatt 1 passen (Befund C1).
                                    // 4.6.0 (N5): 14 -> 13, um Platz fuer die neue
                                    // Pruefumfang-Zeile in Sektion 3 zu schaffen.
const LEER_ZEILEN_FOLGE_GP  = 30;   // Zeilen je Fortsetzungsblatt
const LEER_ZEILENHOEHE_GP   = 8.0;  // mm, Handschrift

const GERAETE_HEAD = [[
  'Nr.',
  'Bezeichnung / Typ',
  'Inv.-Nr.\nSeriennr.',
  'Schutz-\nklasse',
  'Leitung\n(m)',
  'Sicht-\nprüfung',
  'Funk-\ntion',
  'R_{PE} (Ω)\n≤ 0,30 bis 5 m\n+0,1 je 7,5 m\nmax. 1,00 Ω (normativer Deckel)',
  'R_{ISO} (MΩ) @ 500 V\nSK I ≥ 1,0 (Heiz. 0,3)\nSK II ≥ 2,0 · III ≥ 0,25',
  'Ableitstrom (mA)\nSK I ≤ 3,5 (>3,5 kW: 1/kW, max 10)\nSK II/III ≤ 0,5 · Messverfahren'
]];

// 4.7.0: Summe = 180 mm statt vorher 190 mm - seit PDF_MARGIN_LEFT auf
// 20 mm vergroessert wurde (Locherrand), quetschte die Tabelle sonst 10 mm
// ueber den neuen Satzspiegel hinaus. Alle Spalten proportional verkleinert.
const GERAETE_SPALTEN = {
  0: { cellWidth: 8 }, 1: { cellWidth: 32, halign: 'left' }, 2: { cellWidth: 15 },
  3: { cellWidth: 9 }, 4: { cellWidth: 9 }, 5: { cellWidth: 23 },
  6: { cellWidth: 11 }, 7: { cellWidth: 18 }, 8: { cellWidth: 19 },
  9: { cellWidth: 36 }
};

/* Legende fuer das handschriftlich ausgefuellte Blatt. Ohne sie sind die
 * Formelzeichen im Tabellenkopf fuer Auszubildende im ersten Lehrjahr nicht
 * aufloesbar - in der App steht die Erklaerung unter jedem Feld, auf dem
 * Papier stand sie nirgends. */
const LEER_LEGENDE_GP =
  'Legende: R_{PE} = Schutzleiterwiderstand (Messstrom ≥ 200 mA, Leitung dabei bewegen, max. 1,00 Ω nach DIN EN 50699 unabhängig von der Leitungslänge) · ' +
  'R_{ISO} = Isolationswiderstand bei 500 V DC · SK = Schutzklasse (I mit Schutzleiter, II schutzisoliert, III Kleinspannung) · ' +
  'Ableitstrom: SK I = Schutzleiterstrom, SK II/III = Berührungsstrom · ' +
  'Ersatzableitstrommessung ist bei Geräten mit Elektronik (LED, EVG, Netzteil, Dimmer) nicht aussagekräftig - dort Differenzstrom- oder Direktmessung.';

function leerBlattzahlGeraete() {
  const roh = parseInt(document.getElementById('leer_blaetter')?.value || '1', 10);
  if (isNaN(roh)) return 1;
  return Math.min(Math.max(roh, 1), 4);
}

/* 5.0.0 (BUG #8 aus der 4.7.2-Prüfung): try/catch-Wrapper um den PDF-Aufbau,
 * analog zu generatePDF()/generatePDFInner() in pdf-generator.js - siehe dort
 * für die ausführliche Begründung. */
function generatePDFGeraete(isBlank = false) {
  try {
    generatePDFGeraeteInner(isBlank);
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

function generatePDFGeraeteInner(isBlank = false) {
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

  /* Ein Geraet ohne einen einzigen Messwert ist ebenso wenig eine Pruefung wie
   * ein Protokoll ohne Geraet - und beim Start legt das Formular automatisch
   * eine leere Karte an. Siehe prueflingeOhneMessung() in pdf-utils.js.
   * R_PE entfaellt bei SK II/III (kein Schutzleiter), dort reicht R_ISO oder
   * der Ableitstrom. */
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      document.querySelectorAll('#devicesContainer .feed-card'),
      ['.c-rpe', '.c-riso', '.c-ableitstrom']);
    if (ohneMessung.length) { ohneMessungMelden(ohneMessung, 'Gerät'); return; }
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
  /* Das Feld ist ein <input type="month"> und liefert "JJJJ-MM".
   * FRUEHER war es ein type="date"-Feld, in das updateNaechsterTermin() einen
   * Monatswert schrieb - den der Browser verwarf. Das Feld blieb leer und im
   * PDF stand bei "Nächster Prüftermin" nichts. */
  const naechsterTermin = isBlank ? "" : formatMonat(document.getElementById('res_termin_date').value);
  /* Im Leerformular bleibt der Ort offen: frueher stand dort fest "Konstanz",
   * weil getVal() bei isBlank den Vorgabewert zurueckgibt. Auf einem
   * unterschriebenen Dokument von einem auswaertigen Spielort war das eine
   * falsche Ortsangabe. (In pdf-generator.js war das bereits behoben.) */
  const ort = isBlank ? "" : getVal('unterschrift_ort', "");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // [Befund A6, 6.0.0] Qualifikation der pruefenden Person - siehe
  // pdf-generator.js fuer dieselbe Logik.
  const pruegerQualiVal = isBlank ? "" : feldWert('pruefer_qualifikation');
  const pruegerQualiKurz = pruegerQualiVal.startsWith('Elektrotechnisch') ? 'EuP unter Aufsicht einer EFK' : pruegerQualiVal;
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
  // 4.7.0: spL von 13 auf PDF_MARGIN_LEFT + 3 (23) verschoben (Locherrand),
  // spB entsprechend von 90 auf 80 verkleinert, damit die Zeile weiterhin
  // vor spR (107) endet.
  const spL = PDF_MARGIN_LEFT + 3, spR = 107, spB = 80;

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
  drawFeldZeile(doc, "Prüfgerät:",        messgeraetText,              spL, z1(3), spB, isBlank);

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
  doc.text("Grenzwerte je Spalte im Tabellenkopf (DIN EN 50678 / 50699). Unzulässige Werte werden rot hinterlegt.", PDF_MARGIN_LEFT, y + 3.4);
  doc.setTextColor(...textColor);

  const tableRows = [];
  let anyDeviceOut = false;
  // Gewaehlte Blattzahl des Leerformulars (1-4).
  const blaetterGp = isBlank ? leerBlattzahlGeraete() : 1;

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
    for (let i = 1; i <= LEER_ZEILEN_BLATT1_GP; i++) tableRows.push([i, "", "", "", "", "", "", "", "", ""]);
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
      /* Bei Beanstandung wird benannt, WELCHER Punkt betroffen ist, statt ein
       * pauschales "n.i.O." auszugeben.
       * "n.a." wird ebenfalls benannt: ein selbstkonfektioniertes Kabel hat
       * kein Typenschild - ohne diesen Zustand stand dort "i.O." fuer einen
       * Punkt, den es nicht gibt. */
      const sichtNa = sichtVals.map((v, i) => v === 'n.a.' ? sichtLabelsGeraet[i] : null).filter(Boolean);
      let sichtText;
      if (sichtNiO) {
        sichtText = 'n.i.O.: ' + sichtVals.map((v, i) => v === 'n.i.O.' ? sichtLabelsGeraet[i] : null).filter(Boolean).join(', ');
      } else if (sichtNa.length === sichtVals.length) {
        sichtText = 'n.a.';
      } else if (sichtNa.length) {
        sichtText = 'i.O. (n.a.: ' + sichtNa.join(', ') + ')';
      } else {
        sichtText = 'i.O.';
      }

      const funktion = card.querySelector('.c-funktion').value;

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeMax = getRpeMaxDevice(laengeVal);
      const rpeNum = parseMesswert(rpeVal);
      // SK II/III haben keinen Schutzleiter -> R_PE ist nicht anwendbar.
      // "n.a." sagt das ausdruecklich; ein blosser Strich liesse offen, ob nur
      // die Messung fehlt.
      const rpeGiltPdf = sk === 'I';
      const isRpeOut = rpeGiltPdf && ((!isNaN(rpeNum) && (rpeNum > rpeMax || rpeNum < 0)) || istMesswertUngueltig(rpeVal));
      // Grenzwert mitdrucken: er haengt von der Leitungslaenge ab und war fuer
      // den Leser des PDF sonst nicht nachvollziehbar.
      const rpeText = !rpeGiltPdf ? 'n.a.'
        : (rpeVal ? `${kommaZahlGeprueft(rpeVal)} Ω\n(max. ${kommaZahl(rpeMax.toFixed(2))})` : '-');

      const risoVal = card.querySelector('.c-riso').value;
      const risoMin = getIsoMin(sk, card.querySelector('.c-heizelement').checked);
      const isRisoOut = (!risoVal.trim().startsWith('>') && risoMin !== null && !isNaN(parseMesswert(risoVal)) && parseMesswert(risoVal) < risoMin)
        || (!risoVal.trim().startsWith('>') && istMesswertUngueltig(risoVal));
      const risoText = risoVal ? `${risoVal.trim().startsWith('>') ? kommaZahl(risoVal) : kommaZahlGeprueft(risoVal)} MΩ\n(min. ${kommaZahl(risoMin)})` : '-';

      const ableitVal = card.querySelector('.c-ableitstrom').value;
      const heizleistung = card.querySelector('.c-heizleistung')?.value;
      const ableitMax = getAbleitstromMax(sk, heizleistung);
      const isAbleitOut = (ableitMax !== null && !isNaN(parseMesswert(ableitVal)) && (parseMesswert(ableitVal) > ableitMax || parseMesswert(ableitVal) < 0))
        || istMesswertUngueltig(ableitVal);
      // Messverfahren gehoert ins Protokoll - die Grenzwerte gelten verfahrensabhaengig
      const methode = card.querySelector('.c-ableit-methode').value || '';
      const methodeKurz = methode.replace('Direktmessung Berührungsstrom', 'Direktmessung').replace('Differenzstrommessung', 'Differenzstrom');
      const ableitText = ableitVal
        ? `${kommaZahlGeprueft(ableitVal)} mA (max. ${kommaZahl(ableitMax)})\n${getAbleitstromBezeichnung(sk)}\n${methodeKurz}`
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
        // [Befund N1, 6.0.0] ungueltige Laenge (z.B. "1,2,3") rot markieren -
        // sie fliesst in getRpeMaxDevice() ein und wuerde sonst unbemerkt
        // einen falschen R_PE-Grenzwert erzeugen.
        laengeVal ? makeCell(cleanStr(`${kommaZahlGeprueft(laengeVal)} m`), istMesswertUngueltig(laengeVal)) : '-',
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
    head: GERAETE_HEAD,
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
    columnStyles: GERAETE_SPALTEN,
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
              minCellHeight: isBlank ? LEER_ZEILENHOEHE_GP : 5, overflow: 'linebreak',
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
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  // 4.5.0 (C1): 4 -> 3 Schreiblinien. Zusammen mit einer Geraetezeile weniger
  // passen Bewertung UND Unterschriften wieder auf Blatt 1.
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  // [Befund N5] Pruefumfang (Vollpruefung/Stichprobe, DIN VDE 0105-100)
  // bekommt die erste Zeile im Kasten, UNTER dem Kastentitel (Titel-Baseline
  // liegt bei y+5, siehe drawKategorieBox) - alles Weitere ruesckt um
  // denselben Abstand nach unten.
  const offUmfang = 9;
  // Die Ergebniszeile braucht seit dem dritten Ankreuzfeld ("Mängel behoben")
  // die volle Breite -> die Prüfplakette bekommt eine eigene Zeile.
  const offErgebnis = offUmfang + 5.5;
  const offPlakette = offErgebnis + 5.5;
  const offBemLabel = offPlakette + 5.5;
  const offBemStart = offBemLabel + 4.2;
  const boxHeight   = offBemStart + bemZeilen * 4.2 + 1.5;

  /* 4.5.0 (C1): Bewertungskasten und Abschlussblock gemeinsam pruefen, damit
   * nie eine Seite entsteht, auf der nur die beiden Unterschriftslinien stehen. */
  finalY = pdfPlatzPruefen(doc, finalY, boxHeight + 5 + 32);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "3. GESAMTBEURTEILUNG", kat: 'ergebnis' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  // [Befund N5] Pruefumfang: Vollpruefung oder Stichprobe (DIN VDE 0105-100).
  drawFeldZeile(doc, "Prüfumfang:", feldWert('pruefumfang'), PDF_MARGIN_LEFT + 3, finalY + offUmfang, 177, isBlank);

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
  doc.text("Prüfergebnis:", PDF_MARGIN_LEFT + 3, finalY + offErgebnis);
  drawCheckbox(doc, 44, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 92, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, behobenTrotzOffener);
  drawCheckbox(doc, 156, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfplakette erteilt:", PDF_MARGIN_LEFT + 3, finalY + offPlakette);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand).
  drawCheckbox(doc, 55, finalY + offPlakette, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 67, finalY + offPlakette, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Bemerkungen / Mängel:", PDF_MARGIN_LEFT + 3, finalY + offBemLabel);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    drawSchreibLinien(doc, PDF_MARGIN_LEFT + 3, finalY + offBemStart + 1, 177, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, PDF_MARGIN_LEFT + 3, finalY + offBemStart);
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

  // Dieselbe Logik fuer die Pruefplakette: sie ist das Einzige, was an der
  // Anlage sichtbar bleibt, wenn das Protokoll im Ordner liegt.
  if (plaketteWidersprichtBefund(isBlank, hasIssues, document.getElementById('res_plakette')?.value)) {
    alert(plaketteWiderspruchHinweis());
    document.getElementById('res_plakette')?.focus();
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
  const complianceLines = doc.splitTextToSize(complianceText, PDF_CONTENT_WIDTH);
  finalY = pdfPlatzPruefen(doc, finalY, 4 + complianceLines.length * 3.2 + 4 + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", PDF_MARGIN_LEFT, finalY);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, PDF_MARGIN_LEFT jetzt 20 mm).
  drawCheckbox(doc, 68, finalY, "Ja (Geräte entsprechen den Normen)", !isBlank && gewaehrleistungVal === "Ja");
  drawCheckbox(doc, 128, finalY, "Nein (Sicherheitsrisiko)", !isBlank && gewaehrleistungVal === "Nein", true);

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  doc.text(complianceLines, PDF_MARGIN_LEFT, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 4;

  const ortDatum = isBlank
    ? '________________, den ____________'
    : (unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`);

  if (!isBlank && !padPruefer.isEmpty()) {
    // 4.7.0: x=10 -> PDF_MARGIN_LEFT (20 mm, Locherrand).
    doc.addImage(padPruefer.toDataURL('image/png'), 'PNG', PDF_MARGIN_LEFT, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(PDF_MARGIN_LEFT, finalY + 12, PDF_MARGIN_LEFT + 80, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  // [Befund A6, 6.0.0] siehe pdf-generator.js: drawFittedText() statt rohem
  // doc.text(), damit die zusaetzliche Qualifikationsangabe nicht in die
  // zweite Unterschriftspalte (ab x=115) laeuft.
  drawFittedText(doc, `${ortDatum} - Unterschrift Prüfer/-in${pruegerQualiKurz ? ' (' + pruegerQualiKurz + ')' : ''}`,
    PDF_MARGIN_LEFT, finalY + 15, 80, 6.5, 5);
  doc.setFontSize(6.5);

  if (!isBlank && !padKunde.isEmpty()) {
    doc.addImage(padKunde.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 200, finalY + 12);
  doc.text(`${ortDatum} - Unterschrift Auftraggeber/Betreiber`, 115, finalY + 15);

  /* --- LEERFORMULAR: LEGENDE IM FUSSBEREICH VON BLATT 1 -------------------
   * Auf dem Papier gibt es keine Hinweiszeile unter jedem Feld wie in der App.
   * Ohne diese Legende ist der Tabellenkopf fuer Auszubildende im ersten
   * Lehrjahr nicht aufloesbar. Der Fussbereich reicht bis 291 mm. */
  /* 4.5.0 (C4): 6 pt statt 4,8 pt und auf JEDEM Blatt - das Fortsetzungsblatt
   * traegt denselben Tabellenkopf mit denselben Formelzeichen. */
  if (isBlank) {
    doc.setPage(1);
    drawLeerFuss(doc, [LEER_LEGENDE_GP]);
  }

  /* --- FORTSETZUNGSBLAETTER DES LEERFORMULARS ----------------------------
   * Nur die Geraetetabelle, mit fortlaufender Nummerierung. Kopfdaten,
   * Gesamtbewertung und Unterschriften stehen genau einmal auf Blatt 1 -
   * sonst waeren es formal mehrere Protokolle fuer denselben Pruefvorgang.
   * Die Seitenzahl in der Kopfbox ("Seite 2 von 3") stimmt dadurch
   * automatisch; eine Blattzaehlung von Hand entfaellt. */
  if (isBlank && blaetterGp > 1) {
    let laufendeNr = LEER_ZEILEN_BLATT1_GP + 1;
    for (let blatt = 2; blatt <= blaetterGp; blatt++) {
      doc.addPage();
      let yy = PDF_CONTENT_TOP;
      drawKategorieTitel(doc, `FORTSETZUNG DER GERÄTEPRÜFUNG (BLATT ${blatt} VON ${blaetterGp})`, yy, 'messen');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...PDF_MUTED);
      doc.text('Gehört zum Protokoll mit der oben stehenden Protokoll-Nr. Kopfdaten, Gesamtbeurteilung und ' +
               'Unterschriften stehen auf Blatt 1.', PDF_MARGIN_LEFT, yy + 3.4);
      doc.setTextColor(...PDF_TEXT);

      const folgeZeilen = [];
      for (let i = 0; i < LEER_ZEILEN_FOLGE_GP; i++) {
        folgeZeilen.push([laufendeNr++, "", "", "", "", "", "", "", "", ""]);
      }
      doc.autoTable(mitFormelHooks(doc, {
        startY: yy + 5,
        head: GERAETE_HEAD,
        body: folgeZeilen,
        theme: 'grid',
        rowPageBreak: 'avoid',
        headStyles: {
          fillColor: katMessen.kopf, textColor: katMessen.akzent,
          fontSize: 5.4, fontStyle: 'bold', halign: 'center', valign: 'middle',
          lineColor: katMessen.rand, lineWidth: 0.15,
          cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
        },
        bodyStyles: { fontSize: 6, textColor: textColor, halign: 'center', valign: 'middle' },
        columnStyles: GERAETE_SPALTEN,
        margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
        styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
                  minCellHeight: LEER_ZEILENHOEHE_GP, overflow: 'linebreak',
                  cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
      }));

      // 4.5.0 (C4): Legende auch auf dem Fortsetzungsblatt.
      drawLeerFuss(doc, [LEER_LEGENDE_GP]);
    }
  }

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
    nachPdfNeuesFormularAnbieten('GP', nummerRoh, resetGeraeteForm, clearGeraeteAutosave, function () {
      AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('GP');
    });
  });
}

// AUTOSAVE
// Einheitliches Praefix 'vde_': der alte Schluessel 'geraete_protocol_autosave'
// wurde von der Datensicherung nicht erfasst (siehe storage.js).
// 4.7.0: siehe pdf-generator.js AUTOSAVE_KEY_AKTUELL() - mehrere parallele
// Entwuerfe statt eines einzigen festen Schluessels.
entwurfAusUrlUebernehmen('GP');
let AKTUELLER_ENTWURF_ID = aktivenEntwurfSicherstellen('GP', 'vde_autosave_gp');
function GERAETE_AUTOSAVE_KEY_AKTUELL() { return autosaveKeyFuerEntwurf('GP', AKTUELLER_ENTWURF_ID); }

const GERAETE_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'pruefer_qualifikation', 'datum', 'messgeraet', 'seriennummer',
  'pruefart', 'pruefintervall', 'res_termin_date',
  'pruefumfang',
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
    /* BUGFIX: siehe pdf-generator.js restoreProtocolState() - ein leerer
     * Wert in einem Stammdatenfeld darf den frisch aus den zentralen
     * Stammdaten uebernommenen Wert nicht ueberschreiben. */
    if (MASTERDATA_FIELD_IDS.includes(id) && !String(val || '').trim()) return;
    el.value = val;
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

// [Bug #1 aus 4.7.2-Pruefung, 6.0.0] sicherSetItem() statt direktem
// localStorage.setItem() - siehe Erlaeuterung in pdf-generator.js
// autosaveProtocol(). Ein voller Speicher wird jetzt sichtbar gemeldet statt
// still zu scheitern.
function autosaveProtocol() {
  try {
    sicherSetItem(GERAETE_AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectGeraeteState()));
    const anzahl = document.querySelectorAll('#devicesContainer .feed-card').length;
    entwurfMerken('GP', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('GP', () => ({
        anlage: document.getElementById('auftraggeber')?.value,
        gebaeude: (document.getElementById('gebaeude_custom')?.value || '') + (anzahl ? ' · ' + anzahl + ' Geräte' : '')
      }))
    });
  } catch (e) {}
}

function loadGeraeteAutosave() {
  try {
    const raw = localStorage.getItem(GERAETE_AUTOSAVE_KEY_AKTUELL());
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearGeraeteAutosave() {
  localStorage.removeItem(GERAETE_AUTOSAVE_KEY_AKTUELL());
  entwurfEntfernen(AKTUELLER_ENTWURF_ID);
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
  if (!confirm('Neues Formular anlegen? Das aktuelle Formular bleibt unter "Offene Prüfungen" erhalten und kann dort später fortgesetzt werden.')) return;

  const nr = naechsteProtokollNummer('GP');
  verbraucheProtokollNummer(nr, 'GP');
  AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('GP');
  resetGeraeteForm();
  document.getElementById('protokollnummer').value = nr;
  autosaveProtocol();
  alert(`Neues Protokoll angelegt: ${nr}`);
}
