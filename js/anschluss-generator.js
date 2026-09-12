// ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG
// Grundlage: DIN VDE 0100-704 (Definition Übergabepunkt: Netzbetreiber-Anlage endet, Anlage des
// Nutzers beginnt), DIN VDE 0100-711 (Ausstellungen, Shows und Stände), DIN VDE 0100-718
// (Bauliche Anlagen für Menschenansammlungen - fuer Versammlungsstaetten wie das Theater
// einschlaegig), DIN VDE 0100-740 (Fliegende Bauten),
// DIN VDE 0100-600 (allgemeine Prüfmethodik Besichtigen-Erproben-Messen), DIN VDE 0100-520
// (max. 4% Spannungsfall vom Übergabepunkt zum Verbrauchsmittel).
//
// [9.0.0] KOMPLETTER STRUKTURUMBAU (siehe Aenderungsbericht 9.0.0):
// -----------------------------------------------------------------------------
// Bisher konnte dieses Formular beliebig viele Uebergabepunkte als
// .feed-card-Karten in #feedsContainer verwalten (addFeedCard/removeCard/
// dupliziereUebergabepunkt). Der Nutzer hat das als zu kompliziert
// zurueckgemeldet und ausdruecklich EINEN Uebergabepunkt pro Protokoll
// vorgegeben: wer mehrere Uebergabepunkte hat, fuellt mehrere separate
// Protokolle aus. Der gesamte Karten-Mechanismus (cardCounter,
// addFeedCard/removeCard/dupliziereUebergabepunkt, kartenId je Karte) entfaellt
// deshalb komplett - die Felder des einen Uebergabepunkts sind direkt Teil
// des Formulars (siehe anschlusspruefung.html, #uebergabepunktBlock), genauso
// wie Stammdaten. Die fachliche Validierungslogik (validateFeedNorms,
// onFeedZsInput, onFeedIkInput, koppleImpedanzMitStrom, getRcdIdnRangeMa,
// getRcdMaxAusloesezeitMs, npeUeberschritten, zsIkPaarPruefen) bleibt
// vollstaendig erhalten, nur ohne cardId-Parameter (es gibt nur noch ein
// Element pro Selektor statt vieler Karten).
//
// Neu hinzugekommen: Potenzialausgleich/Erdung wieder als Unterpunkt INNERHALB
// der messtechnischen Feststellungen (Punkt 5.2), ein Schutzeinrichtungs-
// Basisdaten-Aufklapp-Panel (1:1 nach dem Muster aus vde0100.html/
// js/pdf-generator.js), automatisches Einklappen der RCD-Messwerte bei
// "Ohne RCD" (analog syncRcdMesswerteAnzeige()), sowie mehrere neue Einzelfelder
// (Z_L-N/I_K2 gab es hier schon aus 7.4.0, neu: I_n RCD, Bereich/Gefährdung,
// U_L-Felder, Prüfumfang, Prüfplakette - siehe unten).

/* [7.4.0, Punkt 4] Automatische Prueffrist-Berechnung, analog zu
 * updateNaechsterTermin() in js/geraete-generator.js (dort im selben Zug
 * korrigiert): Basis ist das eingetragene Pruefdatum (#datum), NICHT der
 * Tag der Protokollerstellung/des PDF-Exports - "heute" dient nur als
 * Rueckfallwert, solange noch kein Pruefdatum gesetzt ist. */
function updateNaechsterTerminAnschluss() {
  const intervallFeld = document.getElementById('pruefintervall');
  if (!intervallFeld) return;
  const monate = parseInt(intervallFeld.value, 10);
  if (!monate) return;
  const datumFeld = document.getElementById('datum');
  const basis = (datumFeld && datumFeld.value) ? new Date(datumFeld.value + 'T00:00:00') : new Date();
  const next = isNaN(basis.getTime()) ? new Date() : basis;
  next.setMonth(next.getMonth() + monate);
  const zielFeld = document.getElementById('res_termin_date');
  if (zielFeld) {
    zielFeld.value = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0');
  }
}

/* [9.0.0] DREHSTROM vs. 1-PHASIG - jetzt GLOBAL statt kartenbezogen, weil es
 * nur noch EINEN Uebergabepunkt gibt (frueher: istFeedDrehstrom(cardId)/
 * updateFeedNetzart(cardId) je .feed-card). 1:1 uebernommenes Muster aus
 * vde0100.html (istNetzmessungDrehstrom()/updateNetzmessungNetzart()).
 * Drehstrom ist der praxisuebliche Regelfall bei einer Veranstaltungs-
 * Einspeisung (CEE) und deshalb vorausgewaehlt. */
function istFeedDrehstrom() {
  const sel = document.getElementById('netzart');
  return !sel || sel.value !== '1-phasig';
}

function updateFeedNetzart() {
  const drehstrom = istFeedDrehstrom();
  document.querySelectorAll('.netzmessung-drehstrom-feld').forEach(function (el) {
    el.style.display = drehstrom ? '' : 'none';
    if (!drehstrom) {
      // Ausgeblendete Drehstromwerte duerfen nicht unsichtbar als Messwert
      // im PDF landen bzw. eine Pflichtfeld-Warnung ausloesen (siehe
      // updateNetzmessungNetzart() in js/pdf-generator.js, gleiches Muster).
      const feld = el.querySelector('input, select');
      if (feld && feld.tagName === 'INPUT') feld.value = '';
    }
  });
  const label = document.querySelector('.c-l1n-label');
  if (label) label.textContent = drehstrom ? 'U L1–N (V):' : 'U (V):';
  if (!drehstrom) {
    const drehfeldSel = document.getElementById('drehfeld');
    if (drehfeldSel) drehfeldSel.value = '';
  }
  validateFeedNorms();
}

/* [9.0.0] Live-Validierung der sechs Aussenleiterfelder - jetzt global statt
 * kartenbezogen (frueher validateFeedNetzspannungsfeld(cardId, klasse, feldName)). */
function validateFeedNetzspannungsfeld(klasse, feldName) {
  const el = document.querySelector('.c-' + klasse);
  if (!el) return;
  el.classList.toggle('out-of-norm', netzspannungAusserNorm(feldName, el.value));
}

/* [9.0.0] Schutzeinrichtungs-Basisdaten-Aufklappmenue: spiegelt die vier
 * Sammel-Felder (Absicherung, RCD-Typ, I_n, I_dn) 1:1 in die jeweils "echten"
 * Einzelfelder weiter unten (Absicherung/RCD-Sektion) und umgekehrt - beide
 * Eingabewege bleiben synchron. 1:1 nach dem Muster
 * schutzBasisdatenGeaendert(cardId, feld) aus js/pdf-generator.js, hier ohne
 * cardId (nur ein Uebergabepunkt-Block). */
function schutzBasisdatenGeaendert(feld) {
  const paare = {
    sich:    ['.c-basis-sich',    '.c-sich-typ'],
    rcd_typ: ['.c-basis-rcd-typ', '.c-rcd-typ'],
    rcd_in:  ['.c-basis-rcd-in',  '.c-rcd-in'],
    rcd_idn: ['.c-basis-rcd-idn', '.c-rcd-idn']
  };
  const paar = paare[feld];
  if (!paar) return;
  const basisElem = document.querySelector(paar[0]);
  const zielElem = document.querySelector(paar[1]);
  if (basisElem && zielElem) zielElem.value = basisElem.value;
  if (feld === 'rcd_typ') syncRcdMesswerteAnzeigeAnschluss();
  validateFeedNorms();
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

/* Umgekehrte Richtung: die "echten" Einzelfelder in die Basisdaten-Sammel-
 * ansicht uebernehmen - aufgerufen beim Aufklappen des Panels (siehe
 * toggleMessSections() in js/pdf-utils.js), damit das Panel von Anfang an
 * denselben Stand zeigt. Ohne Parameter, da es nur einen Uebergabepunkt-
 * Block gibt (js/pdf-utils.js ruft die Funktion je nach Formular mit oder
 * ohne cardId auf, siehe dort). */
function schutzBasisdatenAusEinzelfeldernUebernehmen() {
  const paare = [
    ['.c-basis-sich',    '.c-sich-typ'],
    ['.c-basis-rcd-typ', '.c-rcd-typ'],
    ['.c-basis-rcd-in',  '.c-rcd-in'],
    ['.c-basis-rcd-idn', '.c-rcd-idn']
  ];
  paare.forEach(([basisSel, zielSel]) => {
    const basisElem = document.querySelector(basisSel);
    const zielElem = document.querySelector(zielSel);
    if (basisElem && zielElem) basisElem.value = zielElem.value;
  });
}

/* [9.0.0] RCD-MESSWERTE EIN-/AUSKLAPPEN JE NACH "OHNE RCD" - 1:1 nach dem
 * Muster syncRcdMesswerteAnzeige(cardId) aus js/pdf-generator.js, hier ohne
 * cardId (nur ein Uebergabepunkt-Block, .c-rcd-messwerte ist global
 * eindeutig). Das ist der Kern der urspruenglichen Nutzer-Beschwerde: "wenn
 * ohne RCD geprueft wird, sollen sich Felder einklappen". */
function syncRcdMesswerteAnzeigeAnschluss() {
  const rcdTypElem = document.querySelector('.c-rcd-typ');
  const ohneRcd = !!(rcdTypElem && /ohne\s*rcd/i.test(rcdTypElem.value));
  const wrapper = document.querySelector('.c-rcd-messwerte');
  if (wrapper) wrapper.classList.toggle('mess-sections-collapsed', ohneRcd);
}

function validateFeedNorms() {
  const block = document.getElementById('uebergabepunktBlock');
  if (!block) return;

  const rpeElem = block.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseMesswert(rpeElem.value);
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  const risoElem = block.querySelector('.c-riso');
  if (risoElem && risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseMesswert(txt);
      if (!isNaN(num) && num < 1.0) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else if (risoElem) risoElem.classList.remove('out-of-norm');

  /* 4.5.0 (B1): U N-PE bewerten. Sollwert 0 V, ab 1 V Beanstandung.
   * Fehlt der Wert ganz, wird das Feld als fehlende Pflichtangabe markiert. */
  const unpeElem = block.querySelector('.c-unpe');
  if (unpeElem) {
    const leer = unpeElem.value.trim() === '';
    unpeElem.classList.toggle('out-of-norm', npeUeberschritten(unpeElem.value));
    unpeElem.classList.toggle('missing-value', leer);
  }

  /* U_L (Beruehrungsspannung) bei der RCD-Pruefung, analog zu
   * validateCardNorms() in js/pdf-generator.js: Grenzwert haengt von
   * Spannungsart (hier immer AC, Netzmessung) und Gefaehrdungsbereich ab. */
  const umessElem = block.querySelector('.c-umess');
  const gefElem = block.querySelector('.c-gefaehrdung');
  const gefVal = gefElem ? gefElem.value : 'normal';
  const ulFeld = block.querySelector('.c-ul-max');
  const ulLimit = getUlGrenzwert('AC', gefVal);
  if (ulFeld) ulFeld.value = `≤ ${ulLimit} V AC`;
  if (umessElem && umessElem.value.trim() !== '') {
    const num = parseMesswert(umessElem.value);
    if (!isNaN(num) && num > ulLimit) umessElem.classList.add('out-of-norm'); else umessElem.classList.remove('out-of-norm');
  } else if (umessElem) umessElem.classList.remove('out-of-norm');

  const sichElem = block.querySelector('.c-sich-typ');
  const ikElem = block.querySelector('.c-ik');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;

  /* Z_S GEGEN DEN ZULAESSIGEN HOECHSTWERT PRUEFEN (Zs_max = 230 V / I_a). */
  const maxZs = sichElem ? getMaxZs(sichElem.value) : null;
  const zsElem = block.querySelector('.c-zs');
  const zsLimitLabel = document.getElementById('fzs_limit');
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
  /* Z_L-N gegen denselben Hoechstwert wie Z_S bewerten. */
  const zlnElem = block.querySelector('.c-zln');
  if (zlnElem) {
    const zlnNum = parseMesswert(zlnElem.value);
    if (zlnElem.value.trim() !== '' && maxZs !== null && !isNaN(zlnNum) && (zlnNum > maxZs || zlnNum < 0)) zlnElem.classList.add('out-of-norm');
    else zlnElem.classList.remove('out-of-norm');
  }

  // Widerspruch zwischen Z_S und I_K sichtbar machen (I = 230 V / Z).
  const zlnIkOk = zsIkPaarPruefen(block, '.c-zln', '.c-ik2');
  if (zsLimitLabel && (!zsIkPaarPruefen(block, '.c-zs', '.c-ik') || !zlnIkOk)) {
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

  const idnElem = block.querySelector('.c-rcd-idn');
  const imessElem = block.querySelector('.c-rcd-imess');
  if (imessElem && imessElem.value.trim() !== '') {
    const range = idnElem ? getRcdIdnRangeMa(idnElem.value) : null;
    const num = parseMesswert(imessElem.value);
    if (range && !isNaN(num) && (num < range.min || num > range.max)) imessElem.classList.add('out-of-norm'); else imessElem.classList.remove('out-of-norm');
  } else if (imessElem) imessElem.classList.remove('out-of-norm');

  // Ausloesezeit gegen den zum Pruefstrom passenden Grenzwert pruefen
  // (40 ms gelten nur bei 5x I_dn, bei 1x I_dn sind 300 ms zulaessig)
  const pruefstromElem = block.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = block.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById('fta_limit');
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = block.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '') {
    const num = parseMesswert(taElem.value);
    if (!isNaN(num) && (num > taMax || num < 0)) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein
  // (DIN VDE 0100-600 Abschn. 6.4.3.7).
  const imessMarkElem = block.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  [imessMarkElem, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && rcdWertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });
}

/* Z_S -> I_K automatisch rechnen; eine Eingabe von Hand hebt die Kopplung auf.
 * Gleiche Logik wie in der Anlagenpruefung (koppleImpedanzMitStrom in
 * pdf-utils.js), hier ohne cardId. */
function onFeedZsInput() {
  const block = document.getElementById('uebergabepunktBlock');
  if (block) koppleImpedanzMitStrom(block, '.c-zs', '.c-ik');
  validateFeedNorms();
}

function onFeedZlnInput() {
  const block = document.getElementById('uebergabepunktBlock');
  if (block) koppleImpedanzMitStrom(block, '.c-zln', '.c-ik2');
  validateFeedNorms();
}

function onFeedIkInput() {
  const el = document.querySelector('.c-ik');
  if (el) delete el.dataset.auto;
  validateFeedNorms();
}

// validateErdungAnschluss() liegt zentral in pdf-utils.js (Alias auf validateErdung).
const ERDUNG_RE_GRENZWERT_ANSCHLUSS = ERDUNG_RE_RICHTWERT;

function initSignaturePadsAnschluss() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    auftraggeber: setupSignatureCanvas('sigAuftraggeber')
  };
}

function fillExampleDataAnschluss() {
  document.getElementById('protokollnummer').value = 'AP-2026-014';
  document.getElementById('pruefer').value = 'Max Mustermann';
  document.getElementById('pruefer_qualifikation').value = 'Elektrofachkraft (EFK)';
  document.getElementById('messgeraet').value = 'Fluke 1663';
  document.getElementById('seriennummer').value = '12345678';
  document.getElementById('pruefnorm').value = 'DIN VDE 0105-100 (Wiederholungsprüfung)';
  document.getElementById('auftraggeber').value = 'TESTDATEN – Stadttheater Konstanz, Inselgasse 2-6, 78462 Konstanz';
  document.getElementById('anlage_bez').value = 'Übergabepunkt Bühneneingang, Gastspiel „Sommernachtstraum"';
  document.getElementById('firma_vermieter').value = 'Veranstaltungstechnik Mustermann GmbH';
  document.getElementById('vnb').value = 'Stadtwerke Konstanz';
  document.getElementById('bereitsteller_ansprechpartner').value = 'Frau Schneider';
  document.getElementById('bereitsteller_telefon').value = '07531 / 900-0';
  document.getElementById('einspeisung_art').value = 'Baustromverteiler';
  toggleEinspeisungSonstiges('Baustromverteiler');
  document.getElementById('uebergabe_standort').value = 'Verteilerkasten Bühnenzugang Ost';
  document.getElementById('anschlussleistung_vertrag').value = '63';
  document.getElementById('netzspannung').value = '230 / 400';
  document.getElementById('hausanschluss').value = 'CEE 63 A Einspeisung';
  document.getElementById('pruefintervall').value = '12';
  document.getElementById('pruefumfang').value = 'Übergabepunkt vollständig geprüft (Besichtigen, Erproben, Messen)';
  document.getElementById('res_plakette').value = 'Ja';
  updateNaechsterTerminAnschluss();
  document.getElementById('res_bemerkungen').value =
    TESTDATEN_HINWEISTEXT + ' Übergabepunkt in einwandfreiem Zustand. Keine Mängel festgestellt.';

  // [M1] Sichtpruefungsfelder muessen mit ausgefuellt werden - sonst
  // blockiert ersteLeereAuswahl() ("Es ist noch eine Bewertung offen") den
  // PDF-Export des eigenen Beispieldatensatzes.
  document.querySelectorAll('.sicht-item').forEach(el => { el.value = 'i.O.'; });

  // Uebergabepunkt-Block
  document.getElementById('bez').value = 'Bühnenversorgung Haupt';
  document.getElementById('netzsystem').value = 'TN-S';
  document.getElementById('netzart').value = 'Drehstrom';
  document.getElementById('frequenz').value = '50';
  document.getElementById('u_l1n').value = '231';
  document.getElementById('u_l2n').value = '230';
  document.getElementById('u_l3n').value = '229';
  document.getElementById('u_l12').value = '399';
  document.getElementById('u_l23').value = '400';
  document.getElementById('u_l13').value = '401';
  document.getElementById('unpe').value = '0,3';
  document.getElementById('drehfeld').value = 'i.O.';
  document.getElementById('pa_angeschlossen').value = 'Ja';
  document.getElementById('erdung_re').value = '3,2';
  document.getElementById('pa_messpunkt').value = 'PA-Schiene im Übergabeverteiler Bühnenzugang Ost';
  document.getElementById('pa_durchg').value = 'i.O.';
  document.getElementById('pa_widerstand').value = '0,20';
  document.getElementById('sich').value = 'C 32A';
  document.getElementById('zs').value = '0,31';
  document.getElementById('ik').value = '740';
  document.getElementById('zln').value = '0,29';
  document.getElementById('ik2').value = '793';
  document.getElementById('rcd_typ').value = 'Typ A';
  document.getElementById('rcd_in').value = '40 A';
  document.getElementById('rcd_idn').value = '30 mA';
  document.getElementById('rcd_imess').value = '21';
  document.getElementById('rcd_ta').value = '17';
  document.getElementById('rcd_pruefstrom').value = '5';
  document.getElementById('gef').value = 'normal';
  document.getElementById('umess').value = '2,5';

  updateFeedNetzart();
  syncRcdMesswerteAnzeigeAnschluss();
  validateErdungAnschluss();
  validateFeedNorms();

  // Ampel-Status nach dem Setzen der Werte nachziehen (das blosse Setzen von
  // .value loest kein 'change'-Ereignis aus).
  document.querySelectorAll('.sicht-item, .erp-item').forEach(el => sichtErpNiOPruefen(el));
  document.querySelectorAll('.erp-item').forEach(el => { el.value = 'i.O.'; sichtErpNiOPruefen(el); });

  testdatensatzSetzen();
}

// KOPFDATEN (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet).
const ANSCHLUSS_KOPF = {
  titel: "ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT",
  normzeile: "Übergabe der Stromversorgung nach DIN VDE 0100-704 / -711 / -718 / -740 i.V.m. DIN VDE 0100-600"
};
const ANSCHLUSS_REVISION = "Formular Rev. 2026-09 · Normstand: VDE 0100-600:2017-06 · VDE 0100-718:2019-06";

/* ===========================================================================
 *  [9.0.0] PDF-AUFBAU - KOMPLETT NEU NACH DEM KATEGORIE-BOXEN-STIL DER
 *  ANLAGENPRUEFUNG (siehe Aenderungsbericht 9.0.0)
 * ---------------------------------------------------------------------------
 *  Bisher: eine autoTable-Zeilentabelle mit einer Zeile je .feed-card
 *  (HEAD_AUSGEFUELLT_AP/LEER_HEAD_AP). Das ergab bei mehreren Uebergabepunkten
 *  Sinn, ist aber bei GENAU EINEM Uebergabepunkt (Nutzervorgabe) unnoetig
 *  komprimiert und fachlich schlechter lesbar als eine Kategorie-Box mit
 *  Einzelfeldern.
 *  Jetzt: Kategorie-Boxen mit drawKategorieBox/drawFeldZeile/drawCheckbox aus
 *  pdf-utils.js - GENAU der visuelle Stil, den vde0100.html fuer die
 *  Anlagenpruefung nutzt. Sowohl das ausgefuellte PDF als auch das
 *  Leerformular durchlaufen densselben Code mit isBlank-Parameter (etabliertes
 *  Muster im Projekt) - bei isBlank=true zeichnet drawFeldZeile automatisch
 *  eine Schreiblinie statt eines Werts.
 * ======================================================================== */

async function generatePDFAnschluss(isBlank = false) {
  try {
    // [7.1.0] Fotos liegen im IndexedDB und muessen asynchron geladen werden
    // (siehe js/fotos.js) - deshalb hier vor dem eigentlichen (synchronen)
    // PDF-Aufbau geladen und als zusaetzliches Argument durchgereicht.
    const fotoLadenPromise = Promise.all([
      (typeof fotosFuerPdfLaden === 'function') ? fotosFuerPdfLaden('.anschluss-uebergabepunkt', isBlank) : Promise.resolve([]),
      (typeof fotosFuerEinzelkarteLaden === 'function' && typeof fotoKartenKey === 'function')
        ? fotosFuerEinzelkarteLaden(fotoKartenKey('AP', AKTUELLER_ENTWURF_ID, 'bemerkungen', 1), isBlank, 'Bemerkung')
        : Promise.resolve([])
    ]).then(function (teile) { return teile[0].concat(teile[1]); });
    fotoLadenPromise.then(async function (fotos) {
      try {
        await generatePDFAnschlussInner(isBlank, fotos);
      } catch (err) {
        console.error('[PDF] Unerwarteter Fehler bei der PDF-Erzeugung:', err);
        await appAlert(
          'Beim Erzeugen des PDFs ist ein unerwarteter Fehler aufgetreten.\n\n' +
          'Das Formular wurde NICHT gespeichert oder zurückgesetzt - deine Eingaben ' +
          'bleiben erhalten (Autosave läuft weiter).\n\n' +
          'Bitte versuche es erneut. Falls der Fehler wiederholt auftritt, hilft oft ' +
          'ein Blick auf sehr lange Freitextfelder (Bemerkungen o.Ä.) - oder melde den ' +
          'Fehler mit einer Beschreibung, was gerade im Formular stand.\n\n' +
          'Technische Details: ' + (err && err.message ? err.message : String(err))
        );
      }
    });
  } catch (err) {
    console.error('[PDF] Unerwarteter Fehler bei der PDF-Erzeugung:', err);
    await appAlert(
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

async function generatePDFAnschlussInner(isBlank = false, fotos = []) {
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js.
   * .c-drehfeld bleibt bei einer 1-phasigen Einspeisung bewusst leer (kein
   * Drehfeld ohne Drehstrom) - nur bei Drehstrom wird eine Auswahl verlangt. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(['.sicht-item', '.erp-item', '#pa_angeschlossen', '#res_maengel',
       '#res_leistung_ausreichend', '#res_plakette', '#res_freigabe', '.c-pa-durchg']);
    if (offeneAuswahl) { await offeneBewertungMelden(offeneAuswahl); return; }

    if (istFeedDrehstrom() && document.getElementById('drehfeld')?.value === '') {
      await offeneBewertungMelden(document.getElementById('drehfeld'));
      return;
    }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    await appAlert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Der Übergabepunkt ohne Messwert ist keine Pruefung - siehe pdf-utils.js.
   * [9.0.0] Es gibt nur noch einen Block statt mehrerer Karten. */
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      document.querySelectorAll('.anschluss-uebergabepunkt'),
      ['.c-rpe', '.c-riso', '.c-unpe', '.c-zs', '.c-ik', '.c-zln', '.c-rcd-imess', '.c-rcd-ta', '.c-umess']);
    if (ohneMessung.length) {
      await appAlert('Am Übergabepunkt wurde kein einziger Messwert eingetragen.\n\n' +
        'Ein Protokoll ohne Messwert ist keine Prüfung. Bitte mindestens einen Messwert ' +
        '(Schutzleiterwiderstand, Isolationswiderstand, U N–PE, Z_S/I_K, Z_L-N/I_K2, ' +
        'RCD-Auslösestrom/-zeit oder U_L) eintragen.\n\nDas PDF wurde deshalb nicht erstellt.');
      return;
    }
  }

  /* 4.5.0 (B1): U N-PE ist Pflichtangabe. Hinter einem fremden Uebergabepunkt
   * ist die N-PE-Spannung der einzige Messwert, der eigenstaendig einen
   * Fehler findet (hochohmiger PEN, Fremdeinspeisung, vertauschte
   * Einspeisung am Aggregat). */
  if (!isBlank && String(document.getElementById('unpe')?.value || '').trim() === '') {
    await appAlert('Spannung U N–PE fehlt.\n\n' +
          'Sollwert 0 V. Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler ' +
          'findet (hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat) - ' +
          'genau die Fehler, die hinter einem fremden Übergabepunkt liegen.\n\n' +
          'Das PDF wurde deshalb nicht erstellt.');
    document.getElementById('unpe')?.focus();
    return;
  }

  /* [8.0.0, Teil 6.5] Netzmessung: echte Pflichtfeld-Sperre bei
   * Nicht-Festanschluss (Steckstelle/Baustromverteiler/Generator/Sonstiges). */
  if (!isBlank && document.getElementById('einspeisung_art')?.value !== 'Festanschluss / Zählerschrank') {
    if (String(document.getElementById('u_l1n')?.value || '').trim() === '') {
      await appAlert('Netzmessung (U L1–N) fehlt.\n\n' +
            'Bei jeder Einspeisungsart außer "Festanschluss / Zählerschrank" (hier: "' +
            (document.getElementById('einspeisung_art')?.value || '-') + '") ist die tatsächlich ' +
            'gemessene Netzspannung die einzige eigenständige Prüfung dieser Einspeisung ' +
            '(Baustromverteiler, Generator, sonstige provisorische Versorgung).\n\n' +
            'Das PDF wurde deshalb nicht erstellt.');
      document.getElementById('u_l1n')?.focus();
      return;
    }
  }

  /* Mindestangaben eines ausgefuellten Protokolls. */
  if (!isBlank) {
    const fehlend = erstesLeerePflichtfeld(['datum', 'pruefer', 'uebergabe_standort', 'auftraggeber']);
    if (fehlend) { await pflichtfeldMelden(fehlend); return; }
  }

  /* Doppelvergabe: wurde diese Nummer in dieser App schon einmal fuer ein
   * fertiges PDF verwendet, muss das ausdruecklich bestaetigt werden. */
  const nummerRoh = isBlank ? '' : (document.getElementById('protokollnummer')?.value || '').trim();
  if (!isBlank && !await protokollNummerFreigeben(nummerRoh)) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const textColor = PDF_TEXT;
  const redCellText = PDF_RED_TEXT;
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
  const datum = isBlank ? "" : (formatDatum(document.getElementById('datum').value) || "");
  const ort = isBlank ? "" : getVal('unterschrift_ort', "");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  const kopfPruefNr = isBlank ? "" : feldWert('anlage_bez');

  drawProtokollHeader(doc, ANSCHLUSS_KOPF);

  let y = PDF_CONTENT_TOP;
  const ZA = 4.4;

  /* --- SEKTION 1: STAMMDATEN --------------------------------------------- */
  const SEK1_H = 32;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. ALLGEMEINE ANGABEN & STAMMDATEN", kat: 'stamm' });
  doc.setFontSize(7.2);
  const spL = PDF_MARGIN_LEFT + 3, spR = 107, spB = 80;

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    let t = g;
    if (sn) t += ` (SN ${sn})`;
    return t;
  })();

  const pruegerQualiValAP = feldWert('pruefer_qualifikation');
  const pruegerQualiKurzAP = pruegerQualiValAP.startsWith('Elektrotechnisch') ? 'EuP unter Aufsicht einer EFK' : pruegerQualiValAP;
  const prueferNameAP = feldWert('pruefer');
  const prueferMitQualiAP = prueferNameAP + (prueferNameAP && pruegerQualiKurzAP ? ' (' + pruegerQualiKurzAP + ')' : '');

  const z1 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Auftraggeber:",       feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",    feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Anlage/Objekt:",      feldWert('anlage_bez'),      spL, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Protokoll-Nr.:",      kopfProtokollNr,             spL, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",         prueferMitQualiAP,           spL, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",          datum,                       spL, z1(5), spB, isBlank);

  drawFeldZeile(doc, "Prüfgerät:",          messgeraetText,              spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Netzbetreiber (VNB):", feldWert('vnb'),            spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Firma/Vermieter:",    feldWert('firma_vermieter'), spR, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Ansprechpartner/-in:", feldWert('bereitsteller_ansprechpartner'), spR, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Telefon:",            feldWert('bereitsteller_telefon'), spR, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Prüfart/Norm:",       feldWert('pruefnorm'),       spR, z1(5), spB, isBlank);

  y += SEK1_H + 4;

  /* --- SEKTION 2: NETZSYSTEM, NETZBETREIBER ------------------------------ */
  const SEK2_H = 27;
  drawKategorieBox(doc, { y, h: SEK2_H, titel: "2. NETZSYSTEM, NETZBETREIBER", kat: 'stamm' });
  const z2 = (i) => y + 10 + i * ZA;
  const einspeisungText = (() => {
    const art = feldWert('einspeisung_art');
    const sonst = feldWert('einspeisung_sonstiges');
    if (art && /sonstig/i.test(art) && sonst) return `${art}: ${sonst}`;
    return art;
  })();
  drawFeldZeile(doc, "Art der Einspeisung:",       einspeisungText,               spL, z2(0), spB, isBlank);
  drawFeldZeile(doc, "Grund der Prüfung:",         feldWert('pruefgrund'),        spL, z2(1), spB, isBlank);
  drawFeldZeile(doc, "Standort Übergabepunkt:",    feldWert('uebergabe_standort'), spL, z2(2), spB, isBlank);
  drawFeldZeile(doc, "Anschlussleistung (kVA):",   feldWert('anschlussleistung_vertrag'), spL, z2(3), spB, isBlank);

  drawFeldZeile(doc, "Netzspannung (V):",          feldWert('netzspannung') || '230 / 400', spR, z2(0), spB, isBlank);
  drawFeldZeile(doc, "Hausanschluss/Speisepunkt:", feldWert('hausanschluss'),     spR, z2(1), spB, isBlank);

  y += SEK2_H + 4;

  /* --- SEKTION 3: BESICHTIGEN --------------------------------------------- */
  const SEK3_H = 18;
  drawKategorieBox(doc, { y, h: SEK3_H, titel: "3. BESICHTIGEN (SICHTPRÜFUNG ÜBERGABEPUNKT)", kat: 'sicht' });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Verteiler/Zählerschr.", "2. Steckvorr./Kuppl.", "3. Zuleitung/Kabel",
    "4. Kennzeichnung", "5. Witterungsschutz", "6. Berührungsschutz"
  ];
  const SICHT_LABEL_X = [23, 112];
  const SICHT_CB_X    = [55, 144];
  const SICHT_LABEL_W = [30, 30];

  sichtLabels.forEach((label, i) => {
    const spalte = Math.floor(i / 3);
    const zeile = i % 3;
    const yy = y + 10 + zeile * ZA;
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', SICHT_LABEL_X[spalte], yy, SICHT_LABEL_W[spalte], 7, 5.4);
    doc.setFontSize(7);
    drawCheckbox(doc, SICHT_CB_X[spalte], yy, "i.O.", !isBlank && s[i]?.value === "i.O.");
    drawCheckbox(doc, SICHT_CB_X[spalte] + 11, yy, "n.i.O.", !isBlank && s[i]?.value === "n.i.O.", true);
    drawCheckbox(doc, SICHT_CB_X[spalte] + 24, yy, "n.a.", !isBlank && s[i]?.value === "n.a.");
  });

  y += SEK3_H + 6;

  /* --- SEKTION 4: ANSCHLUSSKABEL DER ANLAGE ------------------------------- */
  const SEK4_H = 12;
  drawKategorieBox(doc, { y, h: SEK4_H, titel: "4. ANSCHLUSSKABEL DER ANLAGE", kat: 'sicht' });
  const kabelAnschlussAP = kommaZahl([feldWert('anschluss_typ'), feldWert('anschluss_leiter'), feldWert('anschluss_qs')]
    .filter(p => p).join(' '));
  drawFeldZeile(doc, isBlank ? "Anschlusskabel Typ / Adern / Quersch.:"
                             : "Anschlusskabel (Typ / Adern / Querschnitt):",
                kabelAnschlussAP, PDF_MARGIN_LEFT + 3, y + 9, 177, isBlank);

  y += SEK4_H + 6;

  /* --- SEKTION 5: MESSTECHNISCHE FESTSTELLUNGEN --------------------------
   * Kopf (Bezeichnung/Netzsystem/Netzart) + Unterpunkte 5.1-5.4 als eigene
   * Kategorie-Boxen, GENAU im Stil der Anlagenpruefung. */
  const netzsystemVal = feldWert('netzsystem') || 'TN-S';
  const netzartVal = feldWert('netzart') || 'Drehstrom';
  const istDrehstromZeile = netzartVal !== '1-phasig';
  let freqVal = feldWert('frequenz');
  if (freqVal && !freqVal.toLowerCase().includes('hz')) freqVal += ' Hz';

  const SEK5_H = 16;
  y = pdfPlatzPruefen(doc, y, SEK5_H + 12);
  drawKategorieBox(doc, { y, h: SEK5_H, titel: "5. MESSTECHNISCHE FESTSTELLUNGEN JE ÜBERGABEPUNKT", kat: 'messen' });
  drawFeldZeile(doc, "Bezeichnung Übergabepunkt:", feldWert('bez'), spL, y + 10, spB, isBlank);
  drawFeldZeile(doc, "Netzsystem:",  netzsystemVal, spR, y + 10, 40, isBlank);
  drawFeldZeile(doc, "Netzart:",     istDrehstromZeile ? 'Drehstrom' : '1-phasig', spR + 45, y + 10, 40, isBlank);

  y += SEK5_H + 4;

  /* 5.1 NETZMESSUNG */
  const uL1n = feldWert('u_l1n'), uL2n = feldWert('u_l2n'), uL3n = feldWert('u_l3n');
  const uL12 = feldWert('u_l12'), uL23 = feldWert('u_l23'), uL13 = feldWert('u_l13');
  const unpeVal = feldWert('unpe');
  const isUnpeOut = !isBlank && (npeUeberschritten(unpeVal) || istMesswertUngueltig(unpeVal));
  const drehfeldVal = feldWert('drehfeld');
  const isDrehfeldOut = !isBlank && drehfeldVal === 'n.i.O.';

  // istDrehstromZeile: 4 Zeilen ab y+10 im Abstand ZA (4,4 mm) -> letzte
  // Zeile bei y+10+3*ZA=23,2 mm; +3 mm Rand darunter, damit die Schreiblinie
  // nicht auf dem unteren Boxrand landet.
  const SEK51_H = istDrehstromZeile ? (10 + 3 * ZA + 4) : 18;
  y = pdfPlatzPruefen(doc, y, SEK51_H + 8);
  drawKategorieBox(doc, { y, h: SEK51_H, titel: "5.1 NETZMESSUNG – SPANNUNGEN, FREQUENZ & N–PE", kat: 'messen' });
  const z51 = (i) => y + 10 + i * ZA;
  if (istDrehstromZeile) {
    const isL1nOut = !isBlank && uL1n && netzspannungAusserNorm('u_l1n', uL1n);
    const isL2nOut = !isBlank && uL2n && netzspannungAusserNorm('u_l2n', uL2n);
    const isL3nOut = !isBlank && uL3n && netzspannungAusserNorm('u_l3n', uL3n);
    const isL12Out = !isBlank && uL12 && netzspannungAusserNorm('u_l12', uL12);
    const isL23Out = !isBlank && uL23 && netzspannungAusserNorm('u_l23', uL23);
    const isL13Out = !isBlank && uL13 && netzspannungAusserNorm('u_l13', uL13);
    drawFeldZeile(doc, "U L1–N (V):", uL1n ? withUnit(uL1n, 'V') : '', spL, z51(0), 55, isBlank, { rot: isL1nOut });
    drawFeldZeile(doc, "U L2–N (V):", uL2n ? withUnit(uL2n, 'V') : '', spL + 60, z51(0), 55, isBlank, { rot: isL2nOut });
    drawFeldZeile(doc, "U L3–N (V):", uL3n ? withUnit(uL3n, 'V') : '', spL + 120, z51(0), 55, isBlank, { rot: isL3nOut });
    drawFeldZeile(doc, "U L1–L2 (V):", uL12 ? withUnit(uL12, 'V') : '', spL, z51(1), 55, isBlank, { rot: isL12Out });
    drawFeldZeile(doc, "U L2–L3 (V):", uL23 ? withUnit(uL23, 'V') : '', spL + 60, z51(1), 55, isBlank, { rot: isL23Out });
    drawFeldZeile(doc, "U L1–L3 (V):", uL13 ? withUnit(uL13, 'V') : '', spL + 120, z51(1), 55, isBlank, { rot: isL13Out });
    drawFeldZeile(doc, "U N–PE (V) [Soll 0]:", unpeVal ? withUnit(unpeVal, 'V') : '', spL, z51(2), 90, isBlank, { rot: isUnpeOut });
    drawFeldZeile(doc, "Frequenz (Hz):", freqVal, spL + 95, z51(2), 40, isBlank);
    drawFeldZeile(doc, "Drehfeldrichtung:", drehfeldVal, spL, z51(3), 90, isBlank, { rot: isDrehfeldOut });
  } else {
    drawFeldZeile(doc, "U (V):", uL1n ? withUnit(uL1n, 'V') : '', spL, z51(0), 55, isBlank);
    drawFeldZeile(doc, "U N–PE (V) [Soll 0]:", unpeVal ? withUnit(unpeVal, 'V') : '', spL + 60, z51(0), 60, isBlank, { rot: isUnpeOut });
    drawFeldZeile(doc, "Frequenz (Hz):", freqVal, spL, z51(1), 55, isBlank);
  }

  y += SEK51_H + 4;

  /* 5.2 DURCHGÄNGIGKEIT POTENZIALAUSGLEICH */
  const paVal = feldWert('pa_angeschlossen');
  const erdungReVal = feldWert('erdung_re');
  const erdungReNum = parseMesswert(erdungReVal);
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && (erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS || erdungReNum < 0);
  const paDurchgVal = feldWert('pa_durchg');
  const paWiderstandVal = feldWert('pa_widerstand');
  const isPaFehlt = !isBlank && paVal === 'Nein';
  const isPaDurchgOut = !isBlank && paDurchgVal === 'n.i.O.';

  const SEK52_H = 22;
  y = pdfPlatzPruefen(doc, y, SEK52_H + 8);
  drawKategorieBox(doc, { y, h: SEK52_H, titel: "5.2 DURCHGÄNGIGKEIT POTENZIALAUSGLEICH", kat: 'erdung' });
  const z52 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "PA grundsätzlich vorhanden (Konzept):", paVal, spL, z52(0), 90, isBlank, { rot: isPaFehlt });
  drawFeldZeile(doc, `Erdungswiderstand R_{E} (≤ ${ERDUNG_RE_GRENZWERT_ANSCHLUSS} Ω):`,
                erdungReVal ? withUnit(erdungReVal, 'Ω') : '', spR, z52(0), 90, isBlank, { rot: isErdungOut });
  drawFeldZeile(doc, "Messpunkt / Bezugspunkt:", feldWert('pa_messpunkt'), spL, z52(1), 177, isBlank);
  drawFeldZeile(doc, "Durchgängigkeit PA (Messwert):", paDurchgVal, spL, z52(2), 90, isBlank, { rot: isPaDurchgOut });
  drawFeldZeile(doc, "R_{PA} (Ω), falls gemessen:", paWiderstandVal ? withUnit(paWiderstandVal, 'Ω') : '', spR, z52(2), 90, isBlank);

  y += SEK52_H + 4;

  /* 5.3 ABSICHERUNG & SCHLEIFENIMPEDANZ */
  const sichVal = feldWert('sich');
  const zsVal = feldWert('zs');
  const ikVal = feldWert('ik');
  const zlnVal = feldWert('zln');
  const ik2Val = feldWert('ik2');
  const minIkAP = getMinIk(sichVal);
  const ikNumAP = parseMesswert(ikVal);
  const isIkOutAP = !isBlank && minIkAP !== null && !isNaN(ikNumAP) && ikNumAP < minIkAP;
  const maxZsAP = getMaxZs(sichVal);
  const zsNumAP = parseMesswert(zsVal);
  const zlnNumAP = parseMesswert(zlnVal);
  const isZlnOutAP = !isBlank && maxZsAP !== null && !isNaN(zlnNumAP) && (zlnNumAP > maxZsAP || zlnNumAP < 0);
  const isZsOutAP = !isBlank && ((maxZsAP !== null && !isNaN(zsNumAP) && (zsNumAP > maxZsAP || zsNumAP < 0)) || isZlnOutAP
    || istMesswertUngueltig(zsVal) || istMesswertUngueltig(ikVal) || istMesswertUngueltig(zlnVal) || istMesswertUngueltig(ik2Val));
  const zsIkWiderspruchAP = !isBlank && (!zIkPlausibel(zsVal, ikVal) || !zIkPlausibel(zlnVal, ik2Val));
  const absicherungUnbekanntAP = !isBlank && istAbsicherungUnbekannt(sichVal);
  let anyDokumentationsmangel = zsIkWiderspruchAP || absicherungUnbekanntAP;

  const SEK53_H = 22;
  y = pdfPlatzPruefen(doc, y, SEK53_H + 8);
  drawKategorieBox(doc, { y, h: SEK53_H, titel: "5.3 ABSICHERUNG & SCHLEIFENIMPEDANZ AM ÜBERGABEPUNKT", kat: 'messen' });
  const z53 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Absicherung (Typ/I_{n}):", sichVal, spL, z53(0), 85, isBlank);
  drawFeldZeile(doc, `Z_{S} (Ω) [max. ${maxZsAP !== null ? maxZsAP.toFixed(2).replace('.', ',') : '?'}]:`,
                zsVal ? withUnit(zsVal, 'Ω') : '', spR, z53(0), 90, isBlank, { rot: isZsOutAP });
  drawFeldZeile(doc, `I_{K} (A) [min. ${minIkAP !== null ? minIkAP : '?'}]:`,
                ikVal ? withUnit(ikVal, 'A') : '', spL, z53(1), 85, isBlank, { rot: isIkOutAP });
  drawFeldZeile(doc, "Z_{L-N} (Ω) – Netzimpedanz:", zlnVal ? withUnit(zlnVal, 'Ω') : '', spR, z53(1), 90, isBlank, { rot: isZlnOutAP });
  drawFeldZeile(doc, "I_{K2} (A) – Kurzschlussstrom L–N:", ik2Val ? withUnit(ik2Val, 'A') : '', spL, z53(2), 85, isBlank);
  if (absicherungUnbekanntAP) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...redCellText);
    doc.text('Absicherung nicht erkannt – Z_S/I_K nicht bewertet.', spR, z53(2));
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
  }
  if (zsIkWiderspruchAP) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...redCellText);
    doc.text('Z und I_{K} passen nicht zusammen (I = 230 V / Z).', spL, z53(3));
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
  }

  y += SEK53_H + 4;

  /* 5.4 FEHLERSTROM-SCHUTZEINRICHTUNG (RCD/FI) */
  const rcdTypVal = feldWert('rcd_typ');
  const rcdInVal = feldWert('rcd_in');
  const rcdIdnVal = feldWert('rcd_idn');
  const rcdImessVal = feldWert('rcd_imess');
  const rcdTaVal = feldWert('rcd_ta');
  const rcdPruefstromVal = feldWert('rcd_pruefstrom');
  const rcdZelleAP = buildRcdZelle({
    typ: rcdTypVal, in: rcdInVal, idn: rcdIdnVal, imess: rcdImessVal, ta: rcdTaVal, pruefstrom: rcdPruefstromVal
  });
  const taNumAP = parseMesswert(rcdTaVal);
  const isTaOutAP = !isBlank && rcdZelleAP.taMax !== null && !isNaN(taNumAP) && (taNumAP > rcdZelleAP.taMax || taNumAP < 0);
  const idnRangeAP = getRcdIdnRangeMa(rcdIdnVal);
  const imessNumAP = parseMesswert(rcdImessVal);
  const isImessOutAP = !isBlank && idnRangeAP !== null && !isNaN(imessNumAP) && (imessNumAP < idnRangeAP.min || imessNumAP > idnRangeAP.max);
  if (!isBlank && rcdZelleAP.isDokumentationsmangel) anyDokumentationsmangel = true;

  const gefVal = feldWert('gef') || 'normal';
  const umessVal = feldWert('umess');
  const umessNumAP = parseMesswert(umessVal);
  const limitUAP = getUlGrenzwert('AC', gefVal || 'normal');
  const isUmessOutAP = !isBlank && ((!isNaN(umessNumAP) && (umessNumAP > limitUAP || umessNumAP < 0)) || istMesswertUngueltig(umessVal));

  const SEK54_H = 27;
  y = pdfPlatzPruefen(doc, y, SEK54_H + 8);
  drawKategorieBox(doc, { y, h: SEK54_H, titel: "5.4 FEHLERSTROM-SCHUTZEINRICHTUNG (RCD/FI) AM ÜBERGABEPUNKT", kat: 'messen' });
  const z54 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "RCD Typ:", rcdTypVal, spL, z54(0), 55, isBlank);
  drawFeldZeile(doc, "I_{n} (RCD):", rcdInVal, spL + 60, z54(0), 40, isBlank);
  drawFeldZeile(doc, "I_{Δn}:", rcdIdnVal, spL + 105, z54(0), 40, isBlank);
  const rcdPruefstromSelectAP = document.getElementById('rcd_pruefstrom');
  const rcdPruefstromTextAP = (!isBlank && rcdPruefstromSelectAP && rcdPruefstromSelectAP.value)
    ? rcdPruefstromSelectAP.value + 'x I_{Δn}' : '';
  drawFeldZeile(doc, "Prüfstrom:", rcdPruefstromTextAP, spL + 145, z54(0), 32, isBlank);
  drawFeldZeile(doc, "I_{Δmess} (mA):", rcdImessVal ? withUnit(rcdImessVal, 'mA') : '', spL, z54(1), 55, isBlank, { rot: isImessOutAP });
  drawFeldZeile(doc, `t_{A} (ms) [max. ${rcdZelleAP.taMax !== null ? rcdZelleAP.taMax : '?'}]:`,
                rcdTaVal ? withUnit(rcdTaVal, 'ms') : '', spL + 60, z54(1), 55, isBlank, { rot: isTaOutAP });
  drawFeldZeile(doc, "Bereich/Gefährdung:", gefVal === 'erhoeht' ? 'Erhöhte Gefährdung (25 V AC)' : 'Normalbereich (50 V AC)', spL, z54(2), 90, isBlank);
  drawFeldZeile(doc, "Max. zul. U_{L}:", `≤ ${limitUAP} V AC`, spR, z54(2), 45, isBlank);
  drawFeldZeile(doc, "Gemessene U_{L} (V):", umessVal ? withUnit(umessVal, 'V') : '', spL, z54(3), 90, isBlank, { rot: isUmessOutAP });
  if (rcdZelleAP.isPruefungUnvollstaendig && !isBlank) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...redCellText);
    doc.text('RCD eingetragen, aber nicht vollständig geprüft (I_{Δmess}/t_{A} fehlt).', spL, z54(4));
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
  }

  y += SEK54_H + 6;

  const anyFeedMeasurementOut = !isBlank && (isDrehfeldOut ||
    (uL1n && netzspannungAusserNorm('u_l1n', uL1n)) || (uL2n && netzspannungAusserNorm('u_l2n', uL2n)) ||
    (uL3n && netzspannungAusserNorm('u_l3n', uL3n)) || (uL12 && netzspannungAusserNorm('u_l12', uL12)) ||
    (uL23 && netzspannungAusserNorm('u_l23', uL23)) || (uL13 && netzspannungAusserNorm('u_l13', uL13)) ||
    isUnpeOut || isIkOutAP || isZsOutAP || isTaOutAP || isImessOutAP || rcdZelleAP.isPruefungUnvollstaendig ||
    isUmessOutAP || isPaDurchgOut);

  /* --- SEKTION 6: ERPROBEN ------------------------------------------------ */
  const SEK6_H = 12;
  y = pdfPlatzPruefen(doc, y, SEK6_H + 8);
  drawKategorieBox(doc, { y, h: SEK6_H, titel: "6. ERPROBEN (FUNKTIONSPRÜFUNG)", kat: 'sicht' });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const erpEls = document.querySelectorAll('.erp-item:not(.c-drehfeld)');
  const erpLabelsAP = ["Schutzeinrichtungen", "RCD-Prüftaste", "Drehrichtung Motoren"];
  const ERP_LABEL_X = [23, 82, 141];
  const ERP_CB_X    = [46, 105, 164];
  erpLabelsAP.forEach((label, i) => {
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', ERP_LABEL_X[i], y + 9, 24, 7, 5.4);
    doc.setFontSize(6.4);
    drawCheckbox(doc, ERP_CB_X[i], y + 9, "i.O.", !isBlank && erpEls[i]?.value === "i.O.");
    drawCheckbox(doc, ERP_CB_X[i] + 11, y + 9, "n.i.O.", !isBlank && erpEls[i]?.value === "n.i.O.", true);
    drawCheckbox(doc, ERP_CB_X[i] + 22, y + 9, "n.a.", !isBlank && erpEls[i]?.value === "n.a.");
  });
  doc.setFontSize(7);

  y += SEK6_H + 6;

  /* --- SEKTION 7: GESAMTBEURTEILUNG & FREIGABE ---------------------------- */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  const OFF_UMFANG = 10;
  const OFF_ERGEBNIS = OFF_UMFANG + ZA + 2;
  const OFF_FREIGABE = OFF_ERGEBNIS + 5.5;
  const OFF_BEM_LABEL = OFF_FREIGABE + 5.5;
  const OFF_BEM_START = OFF_BEM_LABEL + 4.2;
  const boxHeight = OFF_BEM_START + bemZeilen * 4.2 + 2.5;

  y = pdfPlatzPruefen(doc, y, boxHeight + 5 + 32);
  drawKategorieBox(doc, { y, h: boxHeight, titel: "7. GESAMTBEURTEILUNG & FREIGABE", kat: 'ergebnis' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  drawFeldZeile(doc, "Prüfumfang:", feldWert('pruefumfang'), PDF_MARGIN_LEFT + 3, y + OFF_UMFANG, 177, isBlank);

  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  const leistungVal = document.getElementById('res_leistung_ausreichend')?.value || '';
  const plaketteVal = document.getElementById('res_plakette')?.value || 'Ja';
  const freigabeVal = document.getElementById('res_freigabe')?.value || 'Ja';
  const anySichtNiOFrueh = Array.from(s).some(el => el?.value === 'n.i.O.');
  const restBeanstandungen = !isBlank && (freigabeVal === 'Nein' || leistungVal === 'Nein' ||
                             anySichtNiOFrueh || anyFeedMeasurementOut || isErdungOut || isPaFehlt);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;
  const ampelStatus = ermittleAmpelStatus({
    isBlank, hatKeineMaengel, hatBehoben, hatMaengel, restBeanstandungen,
    einzelDefektAnzahl: 0
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", PDF_MARGIN_LEFT + 3, y + OFF_ERGEBNIS);
  drawCheckbox(doc, 44, y + OFF_ERGEBNIS, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel, hatKeineMaengel ? ampelStatus : 'neutral');
  drawCheckbox(doc, 92, y + OFF_ERGEBNIS, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, hatBehoben ? (behobenTrotzOffener ? 'rot' : ampelStatus) : 'neutral');
  drawCheckbox(doc, 156, y + OFF_ERGEBNIS, "Mängel festgestellt", !isBlank && hatMaengel, 'rot');

  doc.text("Sicherer Gebrauch gewährleistet:", PDF_MARGIN_LEFT + 3, y + OFF_FREIGABE);
  drawCheckbox(doc, 75, y + OFF_FREIGABE, "Ja", !isBlank && freigabeVal === "Ja", freigabeVal === "Ja" ? ampelStatus : 'neutral');
  drawCheckbox(doc, 86, y + OFF_FREIGABE, "Nein", !isBlank && freigabeVal === "Nein", 'rot');

  doc.text("Leistung ausr.:", 105, y + OFF_FREIGABE);
  drawCheckbox(doc, 130, y + OFF_FREIGABE, "Ja", !isBlank && leistungVal === "Ja");
  drawCheckbox(doc, 141, y + OFF_FREIGABE, "Nein", !isBlank && leistungVal === "Nein", true);
  drawCheckbox(doc, 156, y + OFF_FREIGABE, "n.a.", !isBlank && leistungVal === "n.a.");
  doc.text("Plakette:", 172, y + OFF_FREIGABE);
  drawCheckbox(doc, 186, y + OFF_FREIGABE, "Ja", !isBlank && plaketteVal === "Ja");

  const gelbCellBg = [254, 249, 195];
  const gelbCellText = [113, 63, 6];
  const hatBemerkungstext = !isBlank && splitBemerkung.length > 0;
  const bemerkungFarbe = !hatBemerkungstext ? 'neutral' : (hatMaengel ? 'rot' : 'gelb');
  if (bemerkungFarbe !== 'neutral') {
    const bemHighlightY = y + OFF_BEM_LABEL - 3.3;
    const bemHighlightH = 4.2 + bemZeilen * 4.2 + 1.8;
    doc.setFillColor(...(bemerkungFarbe === 'rot' ? redCellBg : gelbCellBg));
    doc.roundedRect(PDF_MARGIN_LEFT + 1.5, bemHighlightY, PDF_CONTENT_WIDTH - 3, bemHighlightH, 0.8, 0.8, 'F');
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...(bemerkungFarbe === 'rot' ? redCellText : bemerkungFarbe === 'gelb' ? gelbCellText : textColor));
  doc.text("Bemerkungen / Mängel:", PDF_MARGIN_LEFT + 3, y + OFF_BEM_LABEL);
  doc.setFont("helvetica", hatBemerkungstext ? "bold" : "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    doc.setTextColor(...textColor);
    drawSchreibLinien(doc, PDF_MARGIN_LEFT + 3, y + OFF_BEM_START + 1, 177, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, PDF_MARGIN_LEFT + 3, y + OFF_BEM_START);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
  }

  let finalY = y + boxHeight + 5;

  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  if (freigabeWidersprichtBefund(isBlank, hasIssues, freigabeVal)) {
    await appAlert(freigabeWiderspruchHinweis('Sicherer Gebrauch gewährleistet'));
    document.getElementById('res_freigabe')?.focus();
    return;
  }

  const complianceText = isBlank
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei der Sichtprüfung, eine nicht ausreichende Anschlussleistung oder ein Sicherheitsrisiko festgestellt. Der Übergabepunkt ist in diesem Zustand NICHT freigegeben. Eine Nutzung ist erst nach Beseitigung der genannten Mängel und erneuter Prüfung zulässig."
      : "Der Übergabepunkt wurde besichtigt, erprobt und gemessen. Er entspricht den anerkannten Regeln der Elektrotechnik. Sicherer Gebrauch ist im genannten Rahmen gewährleistet.";

  const complianceGesamt = complianceText +
    (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  doc.setFont("helvetica", ampelStatus === 'neutral' ? "italic" : "bold");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, PDF_CONTENT_WIDTH);
  finalY = pdfPlatzPruefen(doc, finalY, complianceLines.length * 3.2 + 6 + 16);

  const ampelTextFarbeAnschluss = { rot: redCellText, gelb: [133, 77, 6], gruen: [21, 101, 52], neutral: [71, 85, 105] }[ampelStatus] || [71, 85, 105];
  doc.setTextColor(...ampelTextFarbeAnschluss);
  doc.text(complianceLines, PDF_MARGIN_LEFT, finalY);
  doc.setTextColor(...textColor);

  finalY += complianceLines.length * 3.2 + 6;

  /* --- SEKTION 8: KONFORMITÄTSBESTÄTIGUNG & UNTERSCHRIFTEN ---------------- */
  const ortDatum = isBlank
    ? '________________, den ____________'
    : (unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`);

  if (!isBlank && !padPruefer.isEmpty()) {
    doc.addImage(padPruefer.toDataURL('image/png'), 'PNG', PDF_MARGIN_LEFT, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(PDF_MARGIN_LEFT, finalY + 12, PDF_MARGIN_LEFT + 80, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Unterschrift Prüfer/-in`, PDF_MARGIN_LEFT, finalY + 15);

  const SIG_R_X = 125;
  if (!isBlank && !padAuftraggeber.isEmpty()) {
    doc.addImage(padAuftraggeber.toDataURL('image/png'), 'PNG', SIG_R_X, finalY, 38, 12);
  }
  doc.line(SIG_R_X, finalY + 12, 200, finalY + 12);
  drawFittedText(doc, `${ortDatum} - Unterschrift Auftraggeber / Betreiber`,
                 SIG_R_X, finalY + 15, 200 - SIG_R_X, 6.5, 5.2);
  doc.setFontSize(6.5);

  // [7.1.0] Fotodokumentation als eigene Anhangseite.
  if (fotos && fotos.length && typeof drawFotodokumentationSeite === 'function') {
    drawFotodokumentationSeite(doc, fotos, 'FOTODOKUMENTATION', 'Übergabepunkt');
  }

  drawProtokollSeitenkoepfe(doc, {
    ...ANSCHLUSS_KOPF, protokollNr: kopfProtokollNr, pruefNr: kopfPruefNr, pruefNrLabel: "Anlage/Objekt:",
    datum, revision: ANSCHLUSS_REVISION
  });

  const filename = isBlank
    ? `Anschlusspruefung_Uebergabepunkt_Leerformular.pdf`
    : `Anschlusspruefung_${protokollNr}_${(datum || '').replace(/\./g, '-')}.pdf`;

  Promise.resolve(savePdfCompatible(doc, filename, archivMetaSammeln('AP', nummerRoh, filename, isBlank)))
    .then(async function (gespeichert) {
    if (isBlank || gespeichert === false) return;
    verbraucheProtokollNummer(nummerRoh, 'AP');
    await nachPdfNeuesFormularAnbieten('AP', nummerRoh, resetAnschlussForm, clearAnschlussAutosave, function () {
      AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('AP');
    });
  });
}

// AUTOSAVE
entwurfAusUrlUebernehmen('AP');
let AKTUELLER_ENTWURF_ID = aktivenEntwurfSicherstellen('AP', 'vde_autosave_ap');
function ANSCHLUSS_AUTOSAVE_KEY_AKTUELL() { return autosaveKeyFuerEntwurf('AP', AKTUELLER_ENTWURF_ID); }

/* [9.0.0] Alle Formularfelder, die NICHT zum einen Uebergabepunkt-Block
 * gehoeren (der wird separat in UEBERGABEPUNKT_FIELD_IDS erfasst). Neu:
 * pruefnorm, pruefumfang, res_plakette (siehe Aenderungsbericht 9.0.0). Die
 * frueher separaten globalen Erdungsfelder (pa_angeschlossen/erdung_re/
 * pa_messpunkt) sind jetzt Teil von UEBERGABEPUNKT_FIELD_IDS - hier entfernt. */
const ANSCHLUSS_FIELD_IDS = [
  'auftraggeber', 'anlage_bez', 'pruefer', 'pruefer_qualifikation', 'datum', 'messgeraet', 'seriennummer',
  'pruefintervall', 'res_termin_date', 'pruefnorm', 'pruefgrund',
  'firma_vermieter', 'vnb', 'bereitsteller_ansprechpartner', 'bereitsteller_telefon', 'einspeisung_art', 'einspeisung_sonstiges',
  'uebergabe_standort', 'anschlussleistung_vertrag', 'netzspannung', 'hausanschluss',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'pruefumfang', 'res_maengel', 'res_leistung_ausreichend', 'res_plakette',
  'res_freigabe', 'res_bemerkungen', 'unterschrift_ort', 'unterschrift_datum',
  'protokollnummer'
];

/* [9.0.0] Felder des EINEN Uebergabepunkt-Blocks (frueher: je .feed-card).
 * Neu ergaenzt: pa_angeschlossen/erdung_re/pa_messpunkt (Punkt 5.2, wieder
 * Teil des Blocks statt globaler Abschnitt), rcd_in (I_n RCD gab es zwar
 * schon als Basisdaten-Feld, jetzt zusaetzlich als eigenstaendiges Feld),
 * basis_sich/basis_rcd_typ/basis_rcd_in/basis_rcd_idn werden NICHT separat
 * gespeichert - sie sind reine Spiegelfelder der "echten" Werte und werden
 * beim Wiederherstellen ueber schutzBasisdatenAusEinzelfeldernUebernehmen()
 * beim naechsten Aufklappen neu befuellt. */
const UEBERGABEPUNKT_FIELD_IDS = [
  'bez', 'netzsystem', 'netzart', 'frequenz',
  'u_l1n', 'u_l2n', 'u_l3n', 'u_l12', 'u_l23', 'u_l13', 'unpe', 'drehfeld',
  'pa_angeschlossen', 'erdung_re', 'pa_messpunkt', 'pa_durchg', 'pa_widerstand',
  'sich', 'zs', 'ik', 'zln', 'ik2',
  'rcd_typ', 'rcd_in', 'rcd_idn', 'rcd_imess', 'rcd_ta', 'rcd_pruefstrom',
  'gef', 'umess'
];

// Zeigt das Freitextfeld nur, wenn "Sonstiges" gewaehlt ist.
function toggleEinspeisungSonstiges(wert) {
  const gruppe = document.getElementById('einspeisung_sonstiges_gruppe');
  if (!gruppe) return;
  gruppe.style.display = /sonstig/i.test(wert || '') ? 'flex' : 'none';
}

function collectAnschlussState() {
  const state = { fields: {}, uebergabepunkt: {} };
  ANSCHLUSS_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });
  UEBERGABEPUNKT_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.uebergabepunkt[id] = el.value;
  });

  state.gebaeude = document.getElementById('gebaeude_custom').value;
  state.res_termin_bestaetigt = !!document.getElementById('res_termin_bestaetigt')?.checked;
  state.sicht = Array.from(document.querySelectorAll('.sicht-item')).map(s => s.value);
  state.erproben = {};
  document.querySelectorAll('.erp-item:not(.c-drehfeld)').forEach(el => { state.erproben[el.id] = el.value; });

  return state;
}

function restoreAnschlussState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    if ((id === 'datum' || id === 'unterschrift_datum') && !String(val || '').trim()) return;
    if (MASTERDATA_FIELD_IDS.includes(id) && !String(val || '').trim()) return;
    el.value = val;
  });

  Object.entries(state.uebergabepunkt || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  ['res_bemerkungen'].forEach(id => {
    const ta = document.getElementById(id);
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  const terminCheckboxAp = document.getElementById('res_termin_bestaetigt');
  if (terminCheckboxAp) {
    terminCheckboxAp.checked = !!state.res_termin_bestaetigt;
    if (typeof pruefdatumBestaetigungAktualisieren === 'function') pruefdatumBestaetigungAktualisieren();
  }
  toggleEinspeisungSonstiges(document.getElementById('einspeisung_art').value);
  validateErdungAnschluss();

  const sichtEls = document.querySelectorAll('.sicht-item');
  (state.sicht || []).forEach((val, i) => { if (sichtEls[i]) sichtEls[i].value = val; });

  if (state.erproben) {
    Object.entries(state.erproben).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }

  // [9.0.0] Anzeige-Zustand des Uebergabepunkt-Blocks nach dem Wiederherstellen
  // neu auswerten (Drehstrom-Felder, RCD-Messwerte-Block).
  updateFeedNetzart();
  syncRcdMesswerteAnzeigeAnschluss();

  document.querySelectorAll('.sicht-item, .erp-item').forEach(el => sichtErpNiOPruefen(el));
  validateFeedNorms();

  return true;
}

function autosaveProtocol() {
  try {
    sicherSetItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectAnschlussState()));
    entwurfMerken('AP', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('AP', () => ({
        anlage: document.getElementById('uebergabe_standort')?.value,
        gebaeude: document.getElementById('gebaeude_custom')?.value
      })),
      standort: document.getElementById('uebergabe_standort')?.value || document.getElementById('auftraggeber')?.value || '',
      gebaeude: document.getElementById('gebaeude_custom')?.value || '',
      anlage: document.getElementById('anlage_bez')?.value || '',
      // [9.0.0] Es gibt jetzt immer genau einen Uebergabepunkt (keine Karten
      // mehr) - die Spalte "Anzahl" in "Offene Prüfungen" zeigt deshalb
      // konstant 1.
      anzahl: 1
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

  datumsfeldAufHeute('datum');
  datumsfeldAufHeute('unterschrift_datum');
  updateNaechsterTerminAnschluss();
  document.getElementById('res_bemerkungen').style.height = 'auto';
  toggleEinspeisungSonstiges(document.getElementById('einspeisung_art').value);

  applyMasterDataToForm();

  updateFeedNetzart();
  syncRcdMesswerteAnzeigeAnschluss();
  validateFeedNorms();

  if (typeof padPruefer !== 'undefined' && padPruefer) padPruefer.clear();
  if (typeof padAuftraggeber !== 'undefined' && padAuftraggeber) padAuftraggeber.clear();
}

async function neuesAnschlussProtokoll() {
  if (!await appConfirm('Neues Formular anlegen? Das aktuelle Formular bleibt unter "Offene Prüfungen" erhalten und kann dort später fortgesetzt werden.')) return;

  const nr = naechsteProtokollNummer('AP');
  verbraucheProtokollNummer(nr, 'AP');
  AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('AP');
  resetAnschlussForm();
  document.getElementById('protokollnummer').value = nr;
  autosaveProtocol();
  await appAlert(`Neues Protokoll angelegt: ${nr}`);
}
