// ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG
// Grundlage: DIN VDE 0100-704 (Definition Übergabepunkt: Netzbetreiber-Anlage endet, Anlage des
// Nutzers beginnt), DIN VDE 0100-711 (Ausstellungen, Shows und Stände), DIN VDE 0100-718
// (Bauliche Anlagen für Menschenansammlungen - fuer Versammlungsstaetten wie das Theater
// einschlaegig), DIN VDE 0100-740 (Fliegende Bauten),
// DIN VDE 0100-600 (allgemeine Prüfmethodik Besichtigen-Erproben-Messen), DIN VDE 0100-520
// (max. 4% Spannungsfall vom Übergabepunkt zum Verbrauchsmittel).
//
// [Korrektur, nach 9.0.0] MEHRFACH-ÜBERGABEPUNKTE WIEDER EINGEFUEHRT
// -----------------------------------------------------------------------------
// 9.0.0 hatte den Karten-Mechanismus (mehrere Uebergabepunkte je Protokoll)
// bewusst auf GENAU EINEN Uebergabepunkt vereinfacht - der Nutzer hatte das
// damals ausdruecklich so gewuenscht. In der Praxis stellte sich das als
// Rueckschritt heraus: ein Theater/Veranstaltungsbetrieb hat regelmaessig
// MEHRERE Uebergabepunkte (z. B. Buehne + Foyer + Aussenbereich), die bisher
// nur ueber mehrere komplett separate Protokolle abgebildet werden konnten.
// Der Karten-Mechanismus ist deshalb JETZT WIEDER da - 1:1 nach dem in
// js/pdf-generator.js (addCircuitCard/dupliziereStromkreis, Anlagenpruefung)
// und js/geraete-generator.js (addDeviceCard/dupliziereGeraet, Geraetepruefung)
// etablierten Muster:
//   - #feedsContainer haelt beliebig viele .feed-card-Karten (addFeedCard()).
//   - Jede Karte bekommt per ctx.idSuffix ('_' + cardCounter) eindeutige
//     Feld-IDs/-Klassen; die Live-Validierung/Kopplung (Z_S<->I_K, RCD-
//     Messwerte-Einklappen, Schutzbasisdaten-Spiegelung) ist deshalb auf
//     eine Kartennummer (cardId) parametrisiert: validateCardNorms(cardId),
//     onZsInput(cardId), onZlnInput(cardId), onIkInput(cardId),
//     schutzBasisdatenGeaendert(cardId, feld),
//     schutzBasisdatenAusEinzelfeldernUebernehmen(cardId) - EXAKT dieselben
//     Funktionsnamen wie in js/pdf-generator.js (Stromkreis-Karte), da beide
//     Dateien NIE auf derselben Seite gemeinsam geladen werden (anschlusspruefung.html
//     laedt js/anschluss-generator.js, vde0100.html laedt js/pdf-generator.js) -
//     keine Namenskollision moeglich.
//   - PRUEFSCHRITTE.schutz_basisdaten/rpe_riso_messblock/absicherung_schleifenimpedanz/
//     rcd_typ_hauptfeld/rcd_messwerte (js/pruefschritte.js) unterstuetzten den
//     Karten-Modus (ctx.mitCardId/ctx.cardIdAusdruck) bereits vorher - nur fuer
//     die Anschlusspruefung wurde er bisher nie genutzt. netzsystem_dropdown/
//     drehfeld_auswahl/netzmessung_spannungsgrid/potenzialausgleich_messfelder/
//     netzart_auswahl/speisepunkt_art_auswahl/steckverbindung_auswahl wurden dafuer
//     jetzt zusaetzlich um ctx.idSuffix/ctx.mitCardId/ctx.klasse/ctx.onChangeArg
//     ergaenzt (rein additiv, Default-Verhalten fuer vde0100.html/geraetepruefung.html
//     unveraendert).
//   - CARD_FELD_SELEKTOREN (weiter unten) bildet jedes Uebergabepunkt-Feld auf
//     seinen (kartenweit eindeutigen) CSS-Selektor ab - zentrale Grundlage fuer
//     addFeedCard()-Vorbelegung, dupliziereUebergabepunkt(), collectAnschlussState()/
//     restoreAnschlussState() und die PDF-Erzeugung (Abschnitt 5 laeuft jetzt in
//     einer Schleife ueber alle Karten statt einmalig).
//   - Rueckwaerts-kompatibel: ein VOR dieser Aenderung gespeicherter Autosave-
//     Zwischenstand (state.uebergabepunkt, Singular, flaches Objekt) wird beim
//     Wiederherstellen weiterhin erkannt und als EINE Karte aufgebaut (siehe
//     restoreAnschlussState()).
//
// Neu hinzugekommen (9.4.0/9.6.0, unveraendert erhalten): Potenzialausgleich/
// Erdung als Unterpunkt INNERHALB der messtechnischen Feststellungen (Punkt
// 5.2), ein Schutzeinrichtungs-Basisdaten-Aufklapp-Panel, automatisches
// Einklappen der RCD-Messwerte bei "Ohne RCD", sowie mehrere Einzelfelder
// (Z_L-N/I_K2, I_n RCD, Bereich/Gefährdung, U_L-Felder, Prüfumfang,
// Prüfplakette).

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

let cardCounter = 0;

/* ---------------------------------------------------------------------------
 *  CARD_FELD_SELEKTOREN
 * ---------------------------------------------------------------------------
 *  Zentrale Zuordnung: Feldname (wie in einem gespeicherten Zwischenstand/
 *  data-Objekt) -> CSS-Selektor, mit dem das Feld INNERHALB einer .feed-card
 *  gefunden wird (card.querySelector(...)). Wird von addFeedCard()
 *  (Vorbelegung), dupliziereUebergabepunkt(), collectAnschlussState() und
 *  restoreAnschlussState() gemeinsam genutzt, damit es nur EINE Stelle gibt,
 *  die "kennt", wie ein Uebergabepunkt-Feld wiedergefunden wird. */
const CARD_FELD_SELEKTOREN = {
  bez: '.c-bez', netzsystem: '.c-netzsystem', netzart: '.c-netzart', frequenz: '.c-frequenz',
  speisepunkt_art: '.c-speisepunkt-art', steckverbindung: '.c-steckverbindung',
  rpe: '.c-rpe', riso_verbraucher: '.c-riso-verbraucher', riso_mode: '.c-riso-mode', riso: '.c-riso',
  u_l1n: '.c-u-l1n', u_l2n: '.c-u-l2n', u_l3n: '.c-u-l3n',
  u_l12: '.c-u-l12', u_l23: '.c-u-l23', u_l13: '.c-u-l13',
  unpe: '.c-unpe', drehfeld: '.c-drehfeld',
  pa_angeschlossen: '.c-pa-angeschlossen', erdung_re: '.c-erdung-re',
  pa_messpunkt: '.c-pa-messpunkt', pa_durchg: '.c-pa-durchg',
  sich: '.c-sich-typ', zs: '.c-zs', ik: '.c-ik', zln: '.c-zln', ik2: '.c-ik2',
  rcd_typ: '.c-rcd-typ', rcd_in: '.c-rcd-in', rcd_idn: '.c-rcd-idn', rcd_imess: '.c-rcd-imess',
  rcd_ta: '.c-rcd-ta', rcd_pruefstrom: '.c-rcd-pruefstrom',
  gef: '.c-gefaehrdung', art: '.c-spannung-art', umess: '.c-umess'
};

/* Felder, die dupliziereUebergabepunkt() NICHT mitkopiert (Messwerte/
 * Ergebnisse) - analog zu dupliziereGeraet()/dupliziereStromkreis(): Typ-/
 * Konfigurationsfelder werden uebernommen, Messwerte bleiben leer, damit eine
 * Kopie nicht faelschlich als bereits gemessen erscheint. */
const CARD_FELD_DUPLIZIERBAR = [
  'netzsystem', 'netzart', 'frequenz', 'speisepunkt_art', 'steckverbindung',
  'riso_mode', 'sich', 'rcd_typ', 'rcd_in', 'rcd_idn', 'rcd_pruefstrom', 'gef', 'art'
];

/* DREHSTROM vs. 1-PHASIG - jetzt kartenbezogen (cardId), 1:1 nach dem Muster
 * istNetzmessungDrehstrom() aus vde0100.html. Drehstrom ist der praxisuebliche
 * Regelfall bei einer Veranstaltungs-Einspeisung (CEE) und deshalb
 * vorausgewaehlt. */
function istFeedDrehstrom(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const sel = card && card.querySelector('.c-netzart');
  return !sel || sel.value !== '1-phasig';
}

/* [9.4.0, Gap-Analyse Masterliste] "Art des Speisepunkts" + "Steckverbindung
 * mitgeprüft" - 1:1 nach dem Muster istSpeisepunktSteckstelle()/
 * updateNetzmessungArt() aus pdf-generator.js, hier kartenbezogen. */
function istFeedSpeisepunktSteckstelle(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const v = card && card.querySelector('.c-speisepunkt-art')?.value || '';
  return v === 'Steckstelle';
}

function updateFeedSpeisepunktArt(cardId) {
  const gruppe = document.getElementById('feed_steckstelle_gruppe_' + cardId);
  if (!gruppe) return;
  gruppe.style.display = istFeedSpeisepunktSteckstelle(cardId) ? '' : 'none';
}

function updateFeedNetzart(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;
  const drehstrom = istFeedDrehstrom(cardId);
  card.querySelectorAll('.netzmessung-drehstrom-feld').forEach(function (el) {
    el.style.display = drehstrom ? '' : 'none';
    if (!drehstrom) {
      // Ausgeblendete Drehstromwerte duerfen nicht unsichtbar als Messwert
      // im PDF landen bzw. eine Pflichtfeld-Warnung ausloesen.
      const feld = el.querySelector('input, select');
      if (feld && feld.tagName === 'INPUT') feld.value = '';
    }
  });
  const label = card.querySelector('.c-l1n-label');
  if (label) label.textContent = drehstrom ? 'U L1–N (V):' : 'U (V):';
  if (!drehstrom) {
    const drehfeldSel = card.querySelector('.c-drehfeld');
    if (drehfeldSel) drehfeldSel.value = '';
  }
  validateCardNorms(cardId);
}

/* Live-Validierung der sechs Aussenleiterfelder - kartenbezogen. klasse ist
 * die Bindestrich-Form OHNE Kartensuffix (z. B. "u-l1n"), feldName die
 * Unterstrich-Form OHNE Kartensuffix (z. B. "u_l1n") - beide dienen NUR dem
 * Klassen-/Grenzwert-Lookup und sind deshalb kartenunabhaengig (siehe
 * PRUEFSCHRITTE.netzmessung_spannungsgrid in js/pruefschritte.js). */
function validateFeedNetzspannungsfeld(cardId, klasse, feldName) {
  const card = document.getElementById(`feed_${cardId}`);
  const el = card && card.querySelector('.c-' + klasse);
  if (!el) return;
  el.classList.toggle('out-of-norm', netzspannungAusserNorm(feldName, el.value));
}

/* Schutzeinrichtungs-Basisdaten-Aufklappmenue: spiegelt die vier Sammel-
 * Felder (Absicherung, RCD-Typ, I_n, I_dn) 1:1 in die jeweils "echten"
 * Einzelfelder der Karte und umgekehrt. 1:1 nach dem Muster
 * schutzBasisdatenGeaendert(cardId, feld) aus js/pdf-generator.js. */
function schutzBasisdatenGeaendert(cardId, feld) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;
  const paare = {
    sich:    ['.c-basis-sich',    '.c-sich-typ'],
    rcd_typ: ['.c-basis-rcd-typ', '.c-rcd-typ'],
    rcd_in:  ['.c-basis-rcd-in',  '.c-rcd-in'],
    rcd_idn: ['.c-basis-rcd-idn', '.c-rcd-idn']
  };
  const paar = paare[feld];
  if (!paar) return;
  const basisElem = card.querySelector(paar[0]);
  const zielElem = card.querySelector(paar[1]);
  if (basisElem && zielElem) zielElem.value = basisElem.value;
  if (feld === 'rcd_typ') syncRcdMesswerteAnzeigeAnschluss(cardId);
  validateCardNorms(cardId);
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

/* Umgekehrte Richtung: die "echten" Einzelfelder in die Basisdaten-Sammel-
 * ansicht uebernehmen - aufgerufen beim Anlegen/Wiederherstellen/
 * Duplizieren einer Karte. */
function schutzBasisdatenAusEinzelfeldernUebernehmen(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;
  const paare = [
    ['.c-basis-sich',    '.c-sich-typ'],
    ['.c-basis-rcd-typ', '.c-rcd-typ'],
    ['.c-basis-rcd-in',  '.c-rcd-in'],
    ['.c-basis-rcd-idn', '.c-rcd-idn']
  ];
  paare.forEach(([basisSel, zielSel]) => {
    const basisElem = card.querySelector(basisSel);
    const zielElem = card.querySelector(zielSel);
    if (basisElem && zielElem) basisElem.value = zielElem.value;
  });
}

/* RCD-MESSWERTE EIN-/AUSKLAPPEN JE NACH "OHNE RCD" - kartenbezogen, 1:1 nach
 * dem Muster syncRcdMesswerteAnzeige(cardId) aus js/pdf-generator.js. */
function syncRcdMesswerteAnzeigeAnschluss(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const ohneRcd = !!(rcdTypElem && /ohne\s*rcd/i.test(rcdTypElem.value));
  const wrapper = card.querySelector('.c-rcd-messwerte');
  if (wrapper) wrapper.classList.toggle('mess-sections-collapsed', ohneRcd);
}

/* Erdungswiderstand R_E der Karte bewerten - kartenbezogene Variante von
 * validateErdung()/validateErdungAnschluss() (js/pdf-utils.js), die fest auf
 * #erdung_re (ohne Kartensuffix) zugreifen und deshalb bei mehreren Karten
 * nicht mehr passen. Gleiche Grenzwertlogik, nur kartenbezogen. */
function validateErdungAnschlussCard(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const elem = card && card.querySelector('.c-erdung-re');
  if (!elem) return;
  const val = elem.value.trim();
  if (val === '') { elem.classList.remove('out-of-norm'); return; }
  const num = parseMesswert(val);
  if (!isNaN(num) && num > ERDUNG_RE_GRENZWERT_ANSCHLUSS) elem.classList.add('out-of-norm');
  else elem.classList.remove('out-of-norm');
}

/* "Verbraucher angeschlossen?" setzt die Pruefspannung nicht mehr automatisch
 * (siehe PRUEFSCHRITTE.rpe_riso_messblock), loest aber weiterhin eine
 * Neubewertung + Autosave aus - 1:1 nach dem Muster
 * risoVerbraucherGeaendert(cardId) aus js/pdf-generator.js. */
function risoVerbraucherGeaendert(cardId) {
  validateCardNorms(cardId);
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

/* HAUPT-VALIDIERUNG EINER ÜBERGABEPUNKT-KARTE - kartenbezogene Variante von
 * validateFeedNorms() (vor dieser Aenderung: genau ein Block statt vieler
 * Karten). Deckt R_PE/R_ISO, U_N-PE (Sollwert 0 V), Berührungsspannung U_L,
 * Z_S/I_K (inkl. Z_S<->I_K-Widerspruch), Z_L-N/I_K2 sowie die RCD-Messwerte
 * (I_Δmess/t_A) ab. */
function validateCardNorms(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;

  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseMesswert(rpeElem.value);
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  // Mindestwert haengt von der gewaehlten Pruefspannung ab (SELV/PELV
  // 0,5 MOhm, sonst 1,0 MOhm - DIN VDE 0100-600 Tabelle 6.1).
  const risoElem = card.querySelector('.c-riso');
  const risoModeElem = card.querySelector('.c-riso-mode');
  const risoMin = (risoModeElem && risoModeElem.value.includes('SELV')) ? 0.5 : 1.0;
  if (risoElem && risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseMesswert(txt);
      if (!isNaN(num) && num < risoMin) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else if (risoElem) risoElem.classList.remove('out-of-norm');

  /* U_N-PE bewerten. Sollwert 0 V, ab 1 V Beanstandung. Fehlt der Wert ganz,
   * wird das Feld als fehlende Pflichtangabe markiert. */
  const unpeElem = card.querySelector('.c-unpe');
  if (unpeElem) {
    const leer = unpeElem.value.trim() === '';
    unpeElem.classList.toggle('out-of-norm', npeUeberschritten(unpeElem.value));
    unpeElem.classList.toggle('missing-value', leer);
  }

  /* U_L (Beruehrungsspannung) bei der RCD-Pruefung: Grenzwert haengt von
   * Spannungsart und Gefaehrdungsbereich ab. */
  const umessElem = card.querySelector('.c-umess');
  const gefElem = card.querySelector('.c-gefaehrdung');
  const gefVal = gefElem ? gefElem.value : 'normal';
  const artElem = card.querySelector('.c-spannung-art');
  const artVal = artElem ? artElem.value : 'AC';
  const ulFeld = card.querySelector('.c-ul-max');
  if (ulFeld) ulFeld.value = getUlText(artVal, gefVal);
  const ulLimit = getUlGrenzwert(artVal, gefVal);
  if (umessElem && umessElem.value.trim() !== '') {
    const num = parseMesswert(umessElem.value);
    if (!isNaN(num) && num > ulLimit) umessElem.classList.add('out-of-norm'); else umessElem.classList.remove('out-of-norm');
  } else if (umessElem) umessElem.classList.remove('out-of-norm');

  const sichElem = card.querySelector('.c-sich-typ');
  const ikElem = card.querySelector('.c-ik');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;

  /* Z_S GEGEN DEN ZULAESSIGEN HOECHSTWERT PRUEFEN (Zs_max = 230 V / I_a). */
  const maxZs = sichElem ? getMaxZs(sichElem.value) : null;
  const zsElem = card.querySelector('.c-zs');
  const zsLimitLabel = document.getElementById('zs_limit_' + cardId);
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
  const zlnElem = card.querySelector('.c-zln');
  if (zlnElem) {
    const zlnNum = parseMesswert(zlnElem.value);
    if (zlnElem.value.trim() !== '' && maxZs !== null && !isNaN(zlnNum) && (zlnNum > maxZs || zlnNum < 0)) zlnElem.classList.add('out-of-norm');
    else zlnElem.classList.remove('out-of-norm');
  }

  // Widerspruch zwischen Z_S und I_K sichtbar machen (I = 230 V / Z).
  const zlnIkOk = zsIkPaarPruefen(card, '.c-zln', '.c-ik2');
  if (zsLimitLabel && (!zsIkPaarPruefen(card, '.c-zs', '.c-ik') || !zlnIkOk)) {
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
  // (40 ms gelten nur bei 5x I_dn, bei 1x I_dn sind 300 ms zulaessig).
  const pruefstromElem = card.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById('ta_limit_' + cardId);
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '') {
    const num = parseMesswert(taElem.value);
    if (!isNaN(num) && (num > taMax || num < 0)) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein
  // (DIN VDE 0100-600 Abschn. 6.4.3.7).
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  [imessElem, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && rcdWertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });
}

/* Z_S -> I_K automatisch rechnen; eine Eingabe von Hand hebt die Kopplung auf.
 * Gleiche Logik wie in der Anlagenpruefung (koppleImpedanzMitStrom in
 * pdf-utils.js), hier kartenbezogen. */
function onZsInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zs', '.c-ik');
  validateCardNorms(cardId);
}

function onZlnInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zln', '.c-ik2');
  validateCardNorms(cardId);
}

function onIkInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const el = card && card.querySelector('.c-ik');
  if (el) delete el.dataset.auto;
  validateCardNorms(cardId);
}

// validateErdungAnschluss() liegt zentral in pdf-utils.js (Alias auf
// validateErdung) - fuer die (jetzt kartenbezogenen) Uebergabepunkt-Karten
// gilt stattdessen validateErdungAnschlussCard(cardId) oben.
const ERDUNG_RE_GRENZWERT_ANSCHLUSS = ERDUNG_RE_RICHTWERT;

function initSignaturePadsAnschluss() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    auftraggeber: setupSignatureCanvas('sigAuftraggeber')
  };
}

/* ---------------------------------------------------------------------------
 *  ÜBERGABEPUNKT-KARTE ANLEGEN
 * ---------------------------------------------------------------------------
 *  Baut eine komplette Uebergabepunkt-Karte (Abschnitt 5.0-5.4 + Fotos) und
 *  haengt sie an #feedsContainer an - 1:1 nach dem Muster addCircuitCard()
 *  (js/pdf-generator.js) / addDeviceCard() (js/geraete-generator.js). data.*
 *  wird ueber CARD_FELD_SELEKTOREN generisch auf die passenden Karten-Felder
 *  angewendet (Vorbelegung beim Wiederherstellen/Duplizieren/Beispieldaten).
 * ------------------------------------------------------------------------ */
function addFeedCard(data = {}) {
  cardCounter++;
  const c = cardCounter;
  const s = '_' + c;
  // Stabiler, vom cardCounter unabhaengiger Foto-Schluessel (siehe
  // neueKartenId() in pdf-utils.js).
  const kartenId = data.kartenId || neueKartenId();
  const container = document.getElementById('feedsContainer');
  const card = document.createElement('div');
  card.className = 'feed-card anschluss-uebergabepunkt';
  card.id = `feed_${c}`;
  card.dataset.kartenId = kartenId;

  const messpunktButtons = [
    { wert: 'HES (Haupterdungsschiene)', label: 'HES' },
    { wert: 'Potenzialausgleichsschiene (PAS)', label: 'PA-Schiene' },
    { wert: 'PE-Schiene Übergabeverteiler', label: 'PE-Schiene Übergabe' },
    { wert: 'Baustromverteiler', label: 'Baustromverteiler' },
    { wert: 'Zählerschrank / Hausanschlusskasten', label: 'Zählerschrank' },
    { wert: 'Generator-Sternpunkt', label: 'Generator-Sternpunkt' },
    { wert: 'Erdspieß / Tiefenerder', label: 'Erdspieß' },
    { wert: 'Fundamenterder', label: 'Fundamenterder' },
    { wert: 'CEE-Verteiler Bühne', label: 'CEE-Verteiler' },
    { wert: 'Traverse / Tribüne', label: 'Traverse/Tribüne' },
    { wert: 'Bauzaun / Absperrung', label: 'Bauzaun' },
    { wert: 'Bühnenpodest / Bühnenwagen', label: 'Bühnenpodest' }
  ];

  card.innerHTML = `
    <div class="feed-header">
      <span>Übergabepunkt #${c}</span>
      <span>
        <button type="button" class="btn btn-secondary" onclick="dupliziereUebergabepunkt('feed_${c}')" title="Legt eine neue Karte mit denselben Netz-/Schutzdaten an. Messwerte bleiben leer.">⧉ Duplizieren</button>
        <button type="button" class="btn-danger" onclick="removeCard('feed_${c}')">Entfernen</button>
      </span>
    </div>

    <div class="grid">
      ${PRUEFSCHRITTE.bezeichnung_feld.html({ idSuffix: s, label: 'Bezeichnung Übergabepunkt:', platzhalter: 'z. B. Bühnenversorgung Haupthaus', gridFull: true, wert: data.bez, mitWertAttribut: true })}
      ${PRUEFSCHRITTE.netzsystem_dropdown.html({ idSuffix: s, klasse: 'c-netzsystem' })}
      ${PRUEFSCHRITTE.netzart_auswahl.html({ id: 'netzart' + s, klasse: 'c-netzart', onChange: 'updateFeedNetzart', onChangeArg: c, zweiteOptionZusatz: '' })}
      ${PRUEFSCHRITTE.speisepunkt_art_auswahl.html({ id: 'speisepunkt_art' + s, klasse: 'c-speisepunkt-art', onChange: 'updateFeedSpeisepunktArt', onChangeArg: c, mitHinweistext: false })}
    </div>
    <div class="form-group" id="feed_steckstelle_gruppe${s}" style="display:none;">
      ${PRUEFSCHRITTE.steckverbindung_auswahl.html({ id: 'steckverbindung' + s, klasse: 'c-steckverbindung', hinweistext: 'Bei Versorgung über eine Steckstelle ist die Steckverbindung selbst zwingend mitzuprüfen (z. B. CEE-Kupplung am Übergabepunkt) – die Messung der Spannungen erfolgt weiterhin am Speisepunkt.' })}
    </div>

    ${PRUEFSCHRITTE.schutz_basisdaten.html({ idSuffix: s, mitCardId: true, cardIdAusdruck: c, rcdTypOptionen: ['Typ A', 'Typ B', 'Typ B+', 'Ohne RCD'] })}

    ${PRUEFSCHRITTE.rpe_riso_messblock.html({ idSuffix: s, mitCardId: true, cardIdAusdruck: c, data: data, titelNummer: '5.0', titelText: 'Schutzleiter- & Isolationswiderstand', mitMessgroessenkarten: false })}

    <div class="sub-section">
      <div class="sub-title mess-karte-titel" id="netzmessung_icon_wrap${s}"><span class="titel-text">5.1 Netzmessung &ndash; Spannungen, Frequenz &amp; N&ndash;PE</span></div>
      <p class="limit-hint" style="margin:0 0 8px;">Sollwerte: L gegen N je 230 V (&plusmn;10&nbsp;%) &middot; L gegen L je 400 V (&plusmn;10&nbsp;%) &middot; N gegen PE 0 V &middot; Frequenz 50 Hz.</p>
      <div class="grid">
        ${PRUEFSCHRITTE.netzmessung_spannungsgrid.html({ idSuffix: s, mitKlasse: true, onInputFn: 'validateFeedNetzspannungsfeld', mitBindestrichArg: true, mitCardId: true, cardIdAusdruck: c, l1nLabelSpanKlasse: 'c-l1n-label' })}
        <div class="form-group">
          <label>U<sub>N&ndash;PE</sub> (V) [Sollwert 0 V] <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>
          <input type="text" inputmode="decimal" class="c-unpe" id="unpe${s}" placeholder="z. B. 0,3" oninput="validateCardNorms(${c})">
          <div class="limit-hint">Der einzige Wert, der eigenständig einen Fehler findet: hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat.</div>
        </div>
        <div class="form-group">
          <label for="frequenz${s}">Frequenz (Hz):</label>
          <input type="text" inputmode="decimal" class="c-frequenz" id="frequenz${s}" placeholder="z. B. 50 Hz">
        </div>
        ${PRUEFSCHRITTE.drehfeld_auswahl.html({ idSuffix: s })}
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title">5.2 Durchgängigkeit Potenzialausgleich (Messwert dieses Übergabepunkts)</div>
      <div class="grid">
        ${PRUEFSCHRITTE.potenzialausgleich_messfelder.html({
          idSuffix: s, mitCardId: true, cardIdAusdruck: c,
          erdungReOnInput: 'validateErdungAnschlussCard', erdungReMitZusatz: true,
          messpunktId: 'pa_messpunkt', messpunktPlatzhalter: 'z. B. PA-Schiene im Übergabeverteiler',
          messpunktButtons: messpunktButtons
        })}
      </div>
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel"><span class="titel-text">5.3 Absicherung &amp; Schleifenimpedanz am Übergabepunkt</span></div>
      ${PRUEFSCHRITTE.absicherung_schleifenimpedanz.html({ idSuffix: s, mitCardId: true, cardIdAusdruck: c })}
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel"><span class="titel-text">5.4 Fehlerstrom-Schutzeinrichtung (RCD / FI) am Übergabepunkt</span></div>
      ${PRUEFSCHRITTE.rcd_typ_hauptfeld.html({ idSuffix: s, mitCardId: true, cardIdAusdruck: c, syncFn: 'syncRcdMesswerteAnzeigeAnschluss', rcdTypOptionen: ['Typ A', 'Typ B', 'Typ B+', 'Ohne RCD'] })}
      ${PRUEFSCHRITTE.rcd_messwerte.html({ idSuffix: s, mitCardId: true, cardIdAusdruck: c, mitBeruehrungsspannung: true, mitSpannungsart: true })}
    </div>

    <div id="uebergabepunkt_fotos_platzhalter${s}"></div>

    <div class="circuit-footer-actions">
      <button type="button" class="btn btn-secondary" onclick="dupliziereUebergabepunkt('feed_${c}')" title="Legt eine neue Karte mit denselben Netz-/Schutzdaten an. Messwerte bleiben leer.">⧉ Duplizieren</button>
      <button type="button" class="btn-danger" onclick="removeCard('feed_${c}')">Entfernen</button>
    </div>
  `;

  // Generische Vorbelegung aus data.* - deckt alle Selects/Textfelder ab, die
  // (anders als bez/rpe/riso oben) kein value-Attribut im Markup bekommen.
  Object.keys(data).forEach(key => {
    if (key === 'kartenId' || data[key] === undefined || data[key] === '') return;
    const sel = CARD_FELD_SELEKTOREN[key];
    if (!sel) return;
    const el = card.querySelector(sel);
    if (el) el.value = data[key];
  });

  container.appendChild(card);
  nummeriereKartenNeu('#feedsContainer', '.feed-card', 'Übergabepunkt');

  schutzBasisdatenAusEinzelfeldernUebernehmen(c);
  updateFeedNetzart(c);
  updateFeedSpeisepunktArt(c);
  syncRcdMesswerteAnzeigeAnschluss(c);
  validateErdungAnschlussCard(c);
  validateCardNorms(c);

  // G17: vorhandene Fotos dieser Karte laden (z. B. beim Wiederherstellen aus
  // Autosave/Archiv) - 1:1 nach dem Muster addDeviceCard()/addCircuitCard().
  const fotoPlatzhalter = card.querySelector(`#uebergabepunkt_fotos_platzhalter${s}`);
  if (fotoPlatzhalter && typeof fotosLeisteHtml === 'function') {
    const fotoKey = fotoKartenKey('AP', AKTUELLER_ENTWURF_ID, 'uebergabepunkt', kartenId);
    fotoPlatzhalter.innerHTML = fotosLeisteHtml(fotoKey);
    if (typeof fotosLeisteAktualisieren === 'function') fotosLeisteAktualisieren(fotoKey);
  }

  return card;
}

/* Karte duplizieren - ohne Messwerte, mit denselben Netz-/Schutzdaten (Typ-/
 * Konfigurationsfelder, siehe CARD_FELD_DUPLIZIERBAR). Analog zu
 * dupliziereGeraet()/dupliziereStromkreis(): ein Übergabepunkt mit
 * mehreren baugleichen Speisepunkten muss nicht jedes Mal komplett neu
 * konfiguriert werden. */
function dupliziereUebergabepunkt(cardDomId) {
  const card = document.getElementById(cardDomId);
  if (!card) return;
  const w = (key) => card.querySelector(CARD_FELD_SELEKTOREN[key])?.value || '';
  const bezAlt = w('bez').trim();
  const data = { bez: bezAlt ? bezAlt + ' (Kopie)' : '' };
  CARD_FELD_DUPLIZIERBAR.forEach(key => { data[key] = w(key); });
  addFeedCard(data);
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  const neu = document.querySelector('#feedsContainer .feed-card:last-child .c-bez');
  if (neu) neu.focus();
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

  // Genau EINE Beispiel-Uebergabepunkt-Karte (bestehende Karten werden ersetzt).
  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard({
    bez: 'Bühnenversorgung Haupt',
    netzsystem: 'TN-S',
    speisepunkt_art: 'Steckstelle',
    steckverbindung: 'i.O.',
    rpe: '0,09',
    riso_mode: '500 V DC (Stromkreis bis 500 V)',
    riso_verbraucher: 'nein',
    riso: '> 500',
    netzart: 'Drehstrom',
    frequenz: '50',
    u_l1n: '231', u_l2n: '230', u_l3n: '229',
    u_l12: '399', u_l23: '400', u_l13: '401',
    unpe: '0,0',
    drehfeld: 'i.O.',
    pa_angeschlossen: 'Ja',
    erdung_re: '3,2',
    pa_messpunkt: 'PA-Schiene im Übergabeverteiler Bühnenzugang Ost',
    pa_durchg: 'i.O.',
    sich: 'C 32A',
    zs: '0,31', ik: '740', zln: '0,29', ik2: '793',
    rcd_typ: 'Typ A', rcd_in: '40 A', rcd_idn: '30 mA',
    rcd_imess: '21', rcd_ta: '17', rcd_pruefstrom: '5',
    gef: 'normal', umess: '2,5'
  });

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
 *  PDF-AUFBAU NACH DEM KATEGORIE-BOXEN-STIL DER ANLAGENPRUEFUNG
 * ---------------------------------------------------------------------------
 *  Kategorie-Boxen mit drawKategorieBox/drawFeldZeile/drawCheckbox aus
 *  pdf-utils.js. Sowohl das ausgefuellte PDF als auch das Leerformular
 *  durchlaufen denselben Code mit isBlank-Parameter - bei isBlank=true
 *  zeichnet drawFeldZeile automatisch eine Schreiblinie statt eines Werts.
 *  Abschnitt 5 ("Messtechnische Feststellungen") laeuft in einer Schleife
 *  ueber alle Uebergabepunkt-Karten (#feedsContainer .feed-card); im
 *  Leerformular wird unabhaengig von der tatsaechlichen Kartenzahl GENAU
 *  EIN leeres Template gezeichnet (siehe Schleifenbeginn unten).
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

  const feedCardsGuard = Array.from(document.querySelectorAll('#feedsContainer .feed-card'));

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js.
   * .c-pa-durchg/.c-pa-angeschlossen sind jetzt kartenbezogene Klassen statt
   * fester IDs (mehrere Karten moeglich) - ersteLeereAuswahl() prueft ALLE
   * Treffer eines Selektors, deckt also automatisch alle Karten ab. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(['.sicht-item', '.erp-item', '.c-pa-angeschlossen', '#res_maengel',
       '#res_leistung_ausreichend', '#res_plakette', '#res_freigabe', '.c-pa-durchg']);
    if (offeneAuswahl) { await offeneBewertungMelden(offeneAuswahl); return; }

    // .c-drehfeld bleibt bei einer 1-phasigen Einspeisung bewusst leer (kein
    // Drehfeld ohne Drehstrom) - nur bei Drehstrom wird eine Auswahl verlangt,
    // und das je Karte einzeln (jede Karte kann eine andere Netzart haben).
    for (const card of feedCardsGuard) {
      const cId = parseInt(card.id.replace('feed_', ''), 10);
      if (istFeedDrehstrom(cId)) {
        const drehEl = card.querySelector('.c-drehfeld');
        if (drehEl && drehEl.value === '') { await offeneBewertungMelden(drehEl); return; }
      }
    }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    await appAlert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Ein Übergabepunkt ohne Messwert ist keine Pruefung - siehe pdf-utils.js.
   * prueflingeOhneMessung() deckt beliebig viele Karten automatisch ab. */
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      feedCardsGuard,
      ['.c-rpe', '.c-riso', '.c-unpe', '.c-zs', '.c-ik', '.c-zln', '.c-rcd-imess', '.c-rcd-ta', '.c-umess']);
    if (ohneMessung.length) { await ohneMessungMelden(ohneMessung, 'Übergabepunkt'); return; }
  }

  /* 4.5.0 (B1): U N-PE ist Pflichtangabe. Hinter einem fremden Uebergabepunkt
   * ist die N-PE-Spannung der einzige Messwert, der eigenstaendig einen
   * Fehler findet (hochohmiger PEN, Fremdeinspeisung, vertauschte
   * Einspeisung am Aggregat) - jetzt je Karte geprueft. */
  if (!isBlank) {
    for (let i = 0; i < feedCardsGuard.length; i++) {
      const unpeEl = feedCardsGuard[i].querySelector('.c-unpe');
      if (unpeEl && String(unpeEl.value || '').trim() === '') {
        await appAlert('Spannung U N–PE fehlt' + (feedCardsGuard.length > 1 ? ` (Übergabepunkt #${i + 1})` : '') + '.\n\n' +
              'Sollwert 0 V. Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler ' +
              'findet (hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat) - ' +
              'genau die Fehler, die hinter einem fremden Übergabepunkt liegen.\n\n' +
              'Das PDF wurde deshalb nicht erstellt.');
        unpeEl.focus();
        return;
      }
    }
  }

  /* [8.0.0, Teil 6.5] Netzmessung: echte Pflichtfeld-Sperre bei
   * Nicht-Festanschluss (Steckstelle/Baustromverteiler/Generator/Sonstiges),
   * jetzt je Karte geprueft. */
  if (!isBlank && document.getElementById('einspeisung_art')?.value !== 'Festanschluss / Zählerschrank') {
    for (let i = 0; i < feedCardsGuard.length; i++) {
      const ul1nEl = feedCardsGuard[i].querySelector('.c-u-l1n');
      if (ul1nEl && String(ul1nEl.value || '').trim() === '') {
        await appAlert('Netzmessung (U L1–N) fehlt' + (feedCardsGuard.length > 1 ? ` (Übergabepunkt #${i + 1})` : '') + '.\n\n' +
              'Bei jeder Einspeisungsart außer "Festanschluss / Zählerschrank" (hier: "' +
              (document.getElementById('einspeisung_art')?.value || '-') + '") ist die tatsächlich ' +
              'gemessene Netzspannung die einzige eigenständige Prüfung dieser Einspeisung ' +
              '(Baustromverteiler, Generator, sonstige provisorische Versorgung).\n\n' +
              'Das PDF wurde deshalb nicht erstellt.');
        ul1nEl.focus();
        return;
      }
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

  return generatePDFAnschlussZeichnen(doc, { isBlank, fotos, maengelZustand, textColor, redCellText, redCellBg, nummerRoh });
}

/* ============================================================================
 *  [11.0.0] NEU AUFGEBAUTE ZEICHENSCHICHT (Nutzeranforderung: komplette
 *  Neuerstellung des PDF-Layouts, Design beibehalten). Verwendet PdfBox/
 *  checkboxGruppe aus js/pdf-layout.js: jede Box misst ihre Hoehe SELBST aus
 *  der Anzahl gezeichneter Zeilen, mit programmatisch erzwungenem
 *  Mindestabstand von 3mm (Text/Linie <-> Boxrand oben/unten/rechts) und
 *  3mm zwischen zwei Boxen. Die FACHLICHE Berechnung (Grenzwerte, Ampel-
 *  Status, Rotmarkierung, Pflichtfelder) ist 1:1 unveraendert aus der
 *  bisherigen Funktion uebernommen - nur die Zeichenaufrufe sind neu.
 * ========================================================================== */
async function generatePDFAnschlussZeichnen(doc, { isBlank, fotos, maengelZustand, textColor, redCellText, redCellBg, nummerRoh }) {
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

  /* Kartenbezogene Variante von feldWert() - liest ein Uebergabepunkt-Feld
   * ueber CARD_FELD_SELEKTOREN aus der jeweiligen Karte statt ueber eine
   * (nicht mehr eindeutige) globale ID. card ist null im Leerformular. */
  const feldWertCard = (card, key) => {
    if (isBlank || !card) return '';
    const sel = CARD_FELD_SELEKTOREN[key];
    const el = sel && card.querySelector(sel);
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

  /* --- SEKTION 1: STAMMDATEN --------------------------------------------- */
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

  const box1 = new PdfBox(doc, { titel: "1. ALLGEMEINE ANGABEN & STAMMDATEN", kat: 'stamm', y });
  box1.zeile2sp("Auftraggeber:", feldWert('auftraggeber'), "Prüfgerät:", messgeraetText, { isBlank });
  box1.zeile2sp("Gebäude/Bereich:", feldWert('gebaeude_custom'), "Netzbetreiber (VNB):", feldWert('vnb'), { isBlank });
  box1.zeile2sp("Anlage/Objekt:", feldWert('anlage_bez'), "Firma/Vermieter:", feldWert('firma_vermieter'), { isBlank });
  box1.zeile2sp("Protokoll-Nr.:", kopfProtokollNr, "Ansprechpartner/-in:", feldWert('bereitsteller_ansprechpartner'), { isBlank });
  box1.zeile2sp("Prüfer/-in:", prueferMitQualiAP, "Telefon:", feldWert('bereitsteller_telefon'), { isBlank });
  box1.zeile2sp("Prüfdatum:", datum, "Prüfart/Norm:", feldWert('pruefnorm'), { isBlank });
  y = box1.schliessen();

  /* --- SEKTION 2: NETZSYSTEM, NETZBETREIBER ------------------------------ */
  const einspeisungText = (() => {
    const art = feldWert('einspeisung_art');
    const sonst = feldWert('einspeisung_sonstiges');
    if (art && /sonstig/i.test(art) && sonst) return `${art}: ${sonst}`;
    return art;
  })();
  const box2 = new PdfBox(doc, { titel: "2. NETZSYSTEM, NETZBETREIBER", kat: 'stamm', y });
  box2.zeile2sp("Art der Einspeisung:", einspeisungText, "Netzspannung (V):", feldWert('netzspannung') || '230 / 400', { isBlank });
  box2.zeile2sp("Grund der Prüfung:", feldWert('pruefgrund'), "Hausanschluss/Speisepunkt:", feldWert('hausanschluss'), { isBlank });
  box2.zeile2sp("Standort Übergabepunkt:", feldWert('uebergabe_standort'), null, null, { isBlank });
  box2.zeile2sp("Anschlussleistung (kVA):", feldWert('anschlussleistung_vertrag'), null, null, { isBlank });
  y = box2.schliessen();

  /* --- SEKTION 3: BESICHTIGEN --------------------------------------------- */
  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Verteiler/Zählerschr.", "2. Steckvorr./Kuppl.", "3. Zuleitung/Kabel",
    "4. Kennzeichnung", "5. Witterungsschutz", "6. Berührungsschutz"
  ];
  const box3 = new PdfBox(doc, { titel: "3. BESICHTIGEN (SICHTPRÜFUNG ÜBERGABEPUNKT)", kat: 'sicht', y });
  for (let zeile = 0; zeile < 3; zeile++) {
    box3.frei((doc, yy) => {
      const iL = zeile, iR = zeile + 3;
      // [Nutzerfeedback] Kaestchen sollen je Spalte fluchten statt an der
      // (je Zeile wechselnden) Labelbreite zu haengen - siehe Kommentar bei
      // drawPruefpunkt3sp() in pdf-generator.js, gleiches Prinzip hier.
      checkboxGruppe(doc, box3.x + 3, yy, sichtLabels[iL] + ':', [
        { label: 'i.O.', checked: !isBlank && s[iL]?.value === 'i.O.' },
        { label: 'n.i.O.', checked: !isBlank && s[iL]?.value === 'n.i.O.', farbe: 'rot' },
        { label: 'n.a.', checked: !isBlank && s[iL]?.value === 'n.a.' },
      ], { luecke: 3, labelFeldBreite: 30 });
      checkboxGruppe(doc, box3.x + 92, yy, sichtLabels[iR] + ':', [
        { label: 'i.O.', checked: !isBlank && s[iR]?.value === 'i.O.' },
        { label: 'n.i.O.', checked: !isBlank && s[iR]?.value === 'n.i.O.', farbe: 'rot' },
        { label: 'n.a.', checked: !isBlank && s[iR]?.value === 'n.a.' },
      ], { luecke: 3, labelFeldBreite: 30 });
    });
  }
  y = box3.schliessen();

  /* --- SEKTION 4: ANSCHLUSSKABEL DER ANLAGE ------------------------------- */
  const kabelAnschlussAP = kommaZahl([feldWert('anschluss_typ'), feldWert('anschluss_leiter'), feldWert('anschluss_qs')]
    .filter(p => p).join(' '));
  const box4 = new PdfBox(doc, { titel: "4. ANSCHLUSSKABEL DER ANLAGE", kat: 'sicht', y });
  box4.zeile1sp(isBlank ? "Anschlusskabel Typ / Adern / Quersch.:" : "Anschlusskabel (Typ / Adern / Querschnitt):",
                kabelAnschlussAP, { isBlank });
  y = box4.schliessen();

  /* --- SEKTION 5: MESSTECHNISCHE FESTSTELLUNGEN JE ÜBERGABEPUNKT ----------
   * [10.0.0] Wieder im kompakten Tabellen-Stil des urspruenglichen Formulars
   * (eine Zeile pro Übergabepunkt, analog zur Stromkreis-Tabelle in
   * vde0100.html) statt der 5 Einzel-Kategorieboxen (5.0-5.4) aus 9.0.0-
   * 9.10.0. Alle seit 9.0.0/9.4.0 hinzugekommenen Felder (RPE/RISO, Art des
   * Speisepunkts/Steckverbindung, PA-Konzept/Durchgängigkeit als eigener
   * Messwert) bleiben inhaltlich vollständig erhalten, stehen jetzt aber als
   * zusätzliche Zeile(n) innerhalb der jeweiligen Tabellenzelle statt in
   * eigenen Boxen - das spart bei 1 Übergabepunkt eine ganze Seite und
   * bringt auch mehrere Übergabepunkte in der Regel auf 1 Seite (bei 4-5
   * Karten: automatischer Zeilenumbruch/Fortsetzung wie bei den anderen
   * Protokollen, siehe pdfPlatzPruefen/rowPageBreak:'avoid'). Die gesamte
   * Validierungs-/Grenzwertlogik ist unveraendert aus 9.10.0 uebernommen. */
  const feedCards = Array.from(document.querySelectorAll('#feedsContainer .feed-card'));
  const kartenAnzahlSchleife = isBlank ? 1 : Math.max(feedCards.length, 1);

  const katMessenAP = drawKategorieTitel(doc, "5. MESSTECHNISCHE FESTSTELLUNGEN JE ÜBERGABEPUNKT", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text(isBlank ? "Schutzleiter, Schleifenimpedanz, RCD. Grenzwerte je Spalte im Tabellenkopf."
                   : "Schutzleiter, Schleifenimpedanz, RCD. Grenzwerte je Spalte im Tabellenkopf; unzulässige Werte werden rot hinterlegt.",
           PDF_MARGIN_LEFT, y + 3.4);
  doc.setTextColor(...textColor);
  y += 6;

  const HEAD_AP_AUSGEFUELLT = [[
    'Nr.', 'Bezeichnung\nÜbergabepunkt', 'Netzsystem\nSpannung / Frequenz', 'Drehfeld',
    'R_{PE}\n(Ω)\nRichtw. ≤ 0,30', 'U_{N-PE}\n(V)\nSollwert 0', 'Absicherung\nTyp / I_{n}',
    'Z_{S} (Ω) / I_{K} (A)\nZ_{S} ≤ 230 V / I_{a}\nI_{K} ≥ 5x/10x/20x I_{n}',
    'RCD: Typ (I_{Δn})\nI_{Δmess} 0,5-1,0x I_{Δn}\nt_{A} ≤ 40 ms bei 5x'
  ]];
  const HEAD_AP_LEER = [[
    'Nr.', 'Bezeichnung\nÜbergabepunkt', 'Netzsystem\nSpannung / Frequenz', 'Drehfeld',
    'R_{PE} (Ω)\n≤ 0,30', 'U_{N-PE} (V)\nSoll 0', 'Absicherung\nTyp / I_{n}',
    'Z_{S} (Ω) / I_{K} (A)', 'RCD Typ (I_{Δn})\nI_{Δmess} / t_{A}'
  ]];
  const SPALTEN_AP = {
    0: { cellWidth: 6 }, 1: { cellWidth: 26, halign: 'left' }, 2: { cellWidth: 26 },
    3: { cellWidth: 12 }, 4: { cellWidth: 15 }, 5: { cellWidth: 14 },
    6: { cellWidth: 18 }, 7: { cellWidth: 24 }, 8: { cellWidth: 39 }
  };

  const makeCellAP = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: redCellBg, textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const tableRowsAP = [];
  let anyFeedMeasurementOutGesamt = false;
  let anyDokumentationsmangelGesamt = false;
  let isErdungOutGesamt = false;
  let isPaFehltGesamt = false;

  for (let kIdx = 0; kIdx < kartenAnzahlSchleife; kIdx++) {
    const card = isBlank ? null : feedCards[kIdx];
    const kartenNr = kIdx + 1;
    const fw = (key) => feldWertCard(card, key);

    if (isBlank) {
      tableRowsAP.push([kartenNr, "", "", "", "", "", "", "", ""]);
      continue;
    }

    const netzsystemVal = fw('netzsystem') || 'TN-S';
    const netzartVal = fw('netzart') || 'Drehstrom';
    const istDrehstromZeile = netzartVal !== '1-phasig';
    let freqVal = fw('frequenz');
    if (freqVal && !freqVal.toLowerCase().includes('hz')) freqVal += ' Hz';

    /* RPE/RISO + Art des Speisepunkts/Steckverbindung */
    const rpeValAP = fw('rpe');
    const risoValAP = fw('riso');
    const risoModeValAP = fw('riso_mode') || '';
    const risoMinAP = risoModeValAP.includes('SELV') ? 0.5 : 1.0;
    const rpeNumAP = parseMesswert(rpeValAP);
    const isRpeOutAP = !isNaN(rpeNumAP) && (rpeNumAP > 0.30 || rpeNumAP < 0);
    const risoTxtAP = (risoValAP || '').trim();
    const isRisoOutAP = risoTxtAP !== '' && !risoTxtAP.startsWith('>') &&
      !isNaN(parseMesswert(risoTxtAP)) && parseMesswert(risoTxtAP) < risoMinAP;
    const speisepunktArtValAP = fw('speisepunkt_art') || 'Steckstelle';
    const istSteckstelleAP = speisepunktArtValAP === 'Steckstelle';
    const steckverbindungValAP = istSteckstelleAP ? fw('steckverbindung') : 'n. a. (fest verkabelt)';
    const rpeText = rpeValAP ? `${kommaZahlGeprueft(rpeValAP)} Ω` : '-';
    const risoText = risoValAP ? `${risoTxtAP.startsWith('>') ? kommaZahl(risoValAP) : kommaZahlGeprueft(risoValAP)} MΩ (min. ${risoMinAP})` : '-';

    /* Netzmessung */
    const uL1n = fw('u_l1n'), uL2n = fw('u_l2n'), uL3n = fw('u_l3n');
    const uL12 = fw('u_l12'), uL23 = fw('u_l23'), uL13 = fw('u_l13');
    const unpeVal = fw('unpe');
    const isUnpeOut = npeUeberschritten(unpeVal) || istMesswertUngueltig(unpeVal);
    const drehfeldVal = fw('drehfeld');
    const isDrehfeldOut = drehfeldVal === 'n.i.O.';
    const isL1nOut = uL1n && netzspannungAusserNorm('u_l1n', uL1n);
    const isL2nOut = uL2n && netzspannungAusserNorm('u_l2n', uL2n);
    const isL3nOut = uL3n && netzspannungAusserNorm('u_l3n', uL3n);
    const isL12Out = uL12 && netzspannungAusserNorm('u_l12', uL12);
    const isL23Out = uL23 && netzspannungAusserNorm('u_l23', uL23);
    const isL13Out = uL13 && netzspannungAusserNorm('u_l13', uL13);
    const anySpannungOut = isL1nOut || isL2nOut || isL3nOut || isL12Out || isL23Out || isL13Out;
    let spannungText;
    if (istDrehstromZeile) {
      spannungText = `${netzsystemVal} - 230 / 400 V, ${freqVal || '50 Hz'}`;
    } else {
      spannungText = `${netzsystemVal} - ${uL1n ? kommaZahlGeprueft(uL1n) + ' V' : '230 V'}, ${freqVal || '50 Hz'}`;
    }

    /* Potenzialausgleich/Erdung */
    const paVal = fw('pa_angeschlossen');
    const erdungReVal = fw('erdung_re');
    const erdungReNum = parseMesswert(erdungReVal);
    const isErdungOut = !isNaN(erdungReNum) && (erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS || erdungReNum < 0);
    const paDurchgVal = fw('pa_durchg');
    const isPaFehlt = paVal === 'Nein';
    const isPaDurchgOut = paDurchgVal === 'n.i.O.';
    isErdungOutGesamt = isErdungOutGesamt || isErdungOut;
    isPaFehltGesamt = isPaFehltGesamt || isPaFehlt;

    /* Absicherung & Schleifenimpedanz */
    const sichVal = fw('sich');
    const zsVal = fw('zs');
    const ikVal = fw('ik');
    const zlnVal = fw('zln');
    const ik2Val = fw('ik2');
    const minIkAP = getMinIk(sichVal);
    const ikNumAP = parseMesswert(ikVal);
    const isIkOutAP = minIkAP !== null && !isNaN(ikNumAP) && ikNumAP < minIkAP;
    const maxZsAP = getMaxZs(sichVal);
    const zsNumAP = parseMesswert(zsVal);
    const zlnNumAP = parseMesswert(zlnVal);
    const isZlnOutAP = maxZsAP !== null && !isNaN(zlnNumAP) && (zlnNumAP > maxZsAP || zlnNumAP < 0);
    const isZsOutAP = (maxZsAP !== null && !isNaN(zsNumAP) && (zsNumAP > maxZsAP || zsNumAP < 0)) || isZlnOutAP
      || istMesswertUngueltig(zsVal) || istMesswertUngueltig(ikVal) || istMesswertUngueltig(zlnVal) || istMesswertUngueltig(ik2Val);
    const zsIkWiderspruchAP = !zIkPlausibel(zsVal, ikVal) || !zIkPlausibel(zlnVal, ik2Val);
    const absicherungUnbekanntAP = istAbsicherungUnbekannt(sichVal);
    if (zsIkWiderspruchAP || absicherungUnbekanntAP) anyDokumentationsmangelGesamt = true;
    let zsikTextAP = '-';
    if (zsVal || ikVal) zsikTextAP = `${kommaZahlGeprueft(zsVal) || '-'} Ω / ${kommaZahlGeprueft(ikVal) || '-'} A`;
    if (zlnVal || ik2Val) zsikTextAP += `\nL-N: ${kommaZahlGeprueft(zlnVal) || '-'} Ω / ${kommaZahlGeprueft(ik2Val) || '-'} A`;
    if (absicherungUnbekanntAP) zsikTextAP += '\nAbsicherung nicht erkannt – nicht bewertet';

    /* RCD */
    const rcdTypVal = fw('rcd_typ');
    const rcdInVal = fw('rcd_in');
    const rcdIdnVal = fw('rcd_idn');
    const rcdImessVal = fw('rcd_imess');
    const rcdTaVal = fw('rcd_ta');
    const rcdPruefstromSelectAP = card && card.querySelector('.c-rcd-pruefstrom');
    const rcdPruefstromVal = rcdPruefstromSelectAP ? rcdPruefstromSelectAP.value : '';
    const rcdZelleAP = buildRcdZelle({
      typ: rcdTypVal, in: rcdInVal, idn: rcdIdnVal, imess: rcdImessVal, ta: rcdTaVal, pruefstrom: rcdPruefstromVal
    });
    const taNumAP = parseMesswert(rcdTaVal);
    const isTaOutAP = rcdZelleAP.taMax !== null && !isNaN(taNumAP) && (taNumAP > rcdZelleAP.taMax || taNumAP < 0);
    const idnRangeAP = getRcdIdnRangeMa(rcdIdnVal);
    const imessNumAP = parseMesswert(rcdImessVal);
    const isImessOutAP = idnRangeAP !== null && !isNaN(imessNumAP) && (imessNumAP < idnRangeAP.min || imessNumAP > idnRangeAP.max);
    if (rcdZelleAP.isDokumentationsmangel) anyDokumentationsmangelGesamt = true;
    const isRcdOutAP = isTaOutAP || isImessOutAP || rcdZelleAP.isOut;
    const isRcdBeanstandungAP = isTaOutAP || isImessOutAP || rcdZelleAP.isPruefungUnvollstaendig;

    /* Berührungsspannung (Erproben-Feld, gehört inhaltlich zur RCD-Prüfung -
     * als eigene Zeile in der RCD-Zelle statt eigener Box). */
    const gefVal = fw('gef') || 'normal';
    const artValAP = fw('art') || 'AC';
    const umessVal = fw('umess');
    const umessNumAP = parseMesswert(umessVal);
    const limitUAP = getUlGrenzwert(artValAP, gefVal || 'normal');
    const isUmessOutAP = (!isNaN(umessNumAP) && (umessNumAP > limitUAP || umessNumAP < 0)) || istMesswertUngueltig(umessVal);
    let rcdTextAP = rcdZelleAP.text;
    if (umessVal) rcdTextAP += `\nU_{L}: ${withUnit(umessVal, 'V')} (max. ${getUlText(artValAP, gefVal)})`;

    /* Zusatzzeile in der Bezeichnungs-Zelle: Art des Speisepunkts +
     * Steckverbindung + PA-Konzept/Durchgängigkeit + RISO - alles Felder,
     * die im urspruenglichen Formular noch nicht existierten (9.0.0/9.4.0),
     * aber inhaltlich erhalten bleiben muessen. */
    const erdungReText = erdungReVal ? `${kommaZahlGeprueft(erdungReVal)} Ω` : '-';
    const bezZusatzAP = `${speisepunktArtValAP}${istSteckstelleAP ? ' (Steckverb. ' + (steckverbindungValAP || '-') + ')' : ''}` +
      `\nPA: ${paVal || '-'}${paDurchgVal ? ', Durchg. ' + paDurchgVal : ''} · R_{ISO} ${risoText} · R_{E} ${erdungReText}`;

    if (isRpeOutAP || isRisoOutAP || isUnpeOut || isDrehfeldOut || anySpannungOut || isIkOutAP || isZsOutAP ||
        isRcdBeanstandungAP || isUmessOutAP || isPaDurchgOut || isErdungOut || isPaFehlt) {
      anyFeedMeasurementOutGesamt = true;
    }

    tableRowsAP.push([
      kartenNr,
      makeCellAP(cleanStr(`${fw('bez') || '-'}\n${bezZusatzAP}`), isPaFehlt || isPaDurchgOut || isRisoOutAP || isErdungOut),
      makeCellAP(cleanStr(spannungText), anySpannungOut),
      makeCellAP(cleanStr(drehfeldVal || (istDrehstromZeile ? '-' : 'n. a.')), isDrehfeldOut),
      makeCellAP(cleanStr(rpeText), isRpeOutAP),
      makeCellAP(unpeVal ? `${kommaZahlGeprueft(unpeVal)} V` : '-', isUnpeOut),
      cleanStr(sichVal || '-'),
      makeCellAP(cleanStr(zsikTextAP), isIkOutAP || isZsOutAP || zsIkWiderspruchAP || absicherungUnbekanntAP),
      makeCellAP(cleanStr(rcdTextAP), isRcdOutAP || isUmessOutAP)
    ]);
  }

  const tabellenStilAP = {
    theme: 'grid',
    rowPageBreak: 'avoid',
    headStyles: {
      fillColor: katMessenAP.kopf, textColor: katMessenAP.akzent,
      fontSize: 5.6, fontStyle: 'bold', halign: 'center', valign: 'middle',
      lineColor: katMessenAP.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
    },
    bodyStyles: { fontSize: 6.3, textColor: textColor, halign: 'center', valign: 'middle' },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
              minCellHeight: isBlank ? 10 : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
  };

  doc.autoTable(mitFormelHooks(doc, {
    startY: y,
    head: isBlank ? HEAD_AP_LEER : HEAD_AP_AUSGEFUELLT,
    body: tableRowsAP,
    columnStyles: SPALTEN_AP,
    ...tabellenStilAP
  }));

  y = doc.lastAutoTable.finalY + LAYOUT_BOX_ABSTAND;

  const anyFeedMeasurementOut = anyFeedMeasurementOutGesamt;
  const isErdungOut = isErdungOutGesamt;
  const isPaFehlt = isPaFehltGesamt;

  /* --- SEKTION 6: ERPROBEN ------------------------------------------------
   * [9.4.0, Gap-Analyse Masterliste] "Polarität / Steckdosenbelegung" neu
   * ergänzt (#erp_polaritaet) - dadurch 4 statt 3 Punkte, deshalb auf zwei
   * Zeilen à 2 Spalten umgestellt statt einer Zeile mit 3 Spalten. Es wird
   * gezielt per ID statt per NodeList-Reihenfolge gelesen, damit die
   * Zuordnung unabhängig von der HTML-Reihenfolge der .erp-item-Elemente ist. */
  y = layoutSeitenumbruchPruefen(doc, y, 26);
  const erpIdsAP = ["erp_schutz", "erp_polaritaet", "erp_prueftaste", "erp_motoren"];
  const erpLabelsAP = ["Schutzeinrichtungen", "Polarität/Steckdosen", "RCD-Prüftaste", "Drehrichtung Motoren"];
  const box6 = new PdfBox(doc, { titel: "6. ERPROBEN (FUNKTIONSPRÜFUNG)", kat: 'sicht', y });
  for (let zeile = 0; zeile < 2; zeile++) {
    box6.frei((doc, yy) => {
      const iL = zeile * 2, iR = zeile * 2 + 1;
      const elValL = document.getElementById(erpIdsAP[iL])?.value;
      const elValR = document.getElementById(erpIdsAP[iR])?.value;
      // [Nutzerfeedback] siehe Kommentar bei Sektion 3 oben.
      checkboxGruppe(doc, box6.x + 3, yy, erpLabelsAP[iL] + ':', [
        { label: 'i.O.', checked: !isBlank && elValL === 'i.O.' },
        { label: 'n.i.O.', checked: !isBlank && elValL === 'n.i.O.', farbe: 'rot' },
        { label: 'n.a.', checked: !isBlank && elValL === 'n.a.' },
      ], { luecke: 3, labelFeldBreite: 30 });
      checkboxGruppe(doc, box6.x + 92, yy, erpLabelsAP[iR] + ':', [
        { label: 'i.O.', checked: !isBlank && elValR === 'i.O.' },
        { label: 'n.i.O.', checked: !isBlank && elValR === 'n.i.O.', farbe: 'rot' },
        { label: 'n.a.', checked: !isBlank && elValR === 'n.a.' },
      ], { luecke: 3, labelFeldBreite: 30 });
    });
  }
  y = box6.schliessen();

  /* --- SEKTION 7: GESAMTBEURTEILUNG & FREIGABE ---------------------------- */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

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

  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  // Freigabe-Widerspruch wird VOR dem Zeichnen von Box 7 geprueft (wie
  // bisher) - ein Abbruch mitten im Zeichnen wuerde ein halbfertiges PDF
  // hinterlassen.
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
    (!isBlank && anyDokumentationsmangelGesamt ? DOKU_MANGEL_ZUSATZ : '');
  doc.setFont("helvetica", ampelStatus === 'neutral' ? "italic" : "bold");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, PDF_CONTENT_WIDTH);
  // Geschaetzter Platzbedarf von Box 7 (Kopfzeilen + Bemerkungsbereich) plus
  // Abschlusstext plus Unterschriftenblock - fuer den Seitenumbruch VOR dem
  // Zeichnen. Die Box selbst misst ihre tatsaechliche Hoehe danach ueber
  // PdfBox/schliessen() exakt aus - dieser Wert ist nur die Vorabschaetzung,
  // damit Box 7 nicht allein auf Seite 1 und der Rest auf Seite 2 landet.
  const box7HoeheSchaetzung = 10 + 4.4 + 2 + 5.5 + 5.5 + 4.2 + bemZeilen * 4.2 + 6;
  const complianceHoehe = complianceLines.length * 3.2 + 6 + 16;
  y = layoutSeitenumbruchPruefen(doc, y, box7HoeheSchaetzung + LAYOUT_BOX_ABSTAND + complianceHoehe);

  const box7 = new PdfBox(doc, { titel: "7. GESAMTBEURTEILUNG & FREIGABE", kat: 'ergebnis', y });
  box7.zeile1sp("Prüfumfang:", feldWert('pruefumfang'), { isBlank });
  box7.frei((doc, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const nachLabel = checkboxGruppe(doc, box7.x + 3, yy, "Prüfergebnis:", [
      { label: "Keine Mängel festgestellt", checked: !isBlank && hatKeineMaengel, farbe: hatKeineMaengel ? ampelStatus : 'neutral' },
    ], { luecke: 6, fontSize: 7.5 });
    checkboxGruppe(doc, 92, yy, null, [
      { label: "Mängel behoben, Nachprüfung i.O.", checked: !isBlank && hatBehoben, farbe: hatBehoben ? (behobenTrotzOffener ? 'rot' : ampelStatus) : 'neutral' },
    ], { luecke: 6, fontSize: 7.5 });
    checkboxGruppe(doc, 156, yy, null, [
      { label: "Mängel festgestellt", checked: !isBlank && hatMaengel, farbe: 'rot' },
    ], { luecke: 6, fontSize: 7.5 });
  }, 5.5);
  box7.frei((doc, yy) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    checkboxGruppe(doc, box7.x + 3, yy, "Sicherer Gebrauch gewährleistet:", [
      { label: "Ja", checked: !isBlank && freigabeVal === "Ja", farbe: freigabeVal === "Ja" ? ampelStatus : 'neutral' },
      { label: "Nein", checked: !isBlank && freigabeVal === "Nein", farbe: 'rot' },
    ], { luecke: 4 });
    checkboxGruppe(doc, 105, yy, "Leistung ausr.:", [
      { label: "Ja", checked: !isBlank && leistungVal === "Ja" },
      { label: "Nein", checked: !isBlank && leistungVal === "Nein", farbe: 'rot' },
      { label: "n.a.", checked: !isBlank && leistungVal === "n.a." },
    ], { luecke: 4 });
    checkboxGruppe(doc, 172, yy, "Plakette:", [
      { label: "Ja", checked: !isBlank && plaketteVal === "Ja" },
    ], { luecke: 4 });
  }, 5.5);

  const gelbCellBg = [254, 249, 195];
  const gelbCellText = [113, 63, 6];
  const hatBemerkungstext = !isBlank && splitBemerkung.length > 0;
  const bemerkungFarbe = !hatBemerkungstext ? 'neutral' : (hatMaengel ? 'rot' : 'gelb');
  box7.frei((doc, yy) => {
    if (bemerkungFarbe !== 'neutral') {
      const bemHighlightH = 4.2 + bemZeilen * 4.2 + 1.8;
      doc.setFillColor(...(bemerkungFarbe === 'rot' ? redCellBg : gelbCellBg));
      doc.roundedRect(box7.x + 1.5, yy - 3.3, box7.w - 3, bemHighlightH, 0.8, 0.8, 'F');
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...(bemerkungFarbe === 'rot' ? redCellText : bemerkungFarbe === 'gelb' ? gelbCellText : textColor));
    doc.text("Bemerkungen / Mängel:", box7.x + 3, yy);
    doc.setFont("helvetica", hatBemerkungstext ? "bold" : "normal");
    doc.setFontSize(6.8);
    if (isBlank || splitBemerkung.length === 0) {
      doc.setTextColor(...textColor);
      drawSchreibLinien(doc, box7.x + 3, yy + 4.2, box7.w - 6, bemZeilen, 4.2);
    } else {
      doc.text(splitBemerkung, box7.x + 3, yy + 4.2);
      doc.setTextColor(...textColor);
      doc.setFont("helvetica", "normal");
    }
  }, 4.2 + bemZeilen * 4.2 + 1.5);
  y = box7.schliessen();

  let finalY = y;
  const ampelTextFarbeAnschluss = { rot: redCellText, gelb: [133, 77, 6], gruen: [21, 101, 52], neutral: [71, 85, 105] }[ampelStatus] || [71, 85, 105];
  doc.setFont("helvetica", ampelStatus === 'neutral' ? "italic" : "bold");
  doc.setFontSize(6.5);
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

/* Alle Formularfelder, die NICHT zu den Uebergabepunkt-Karten gehoeren
 * (die werden ueber CARD_FELD_SELEKTOREN je Karte erfasst, siehe
 * collectAnschlussState()/restoreAnschlussState()). */
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

// Zeigt das Freitextfeld nur, wenn "Sonstiges" gewaehlt ist.
function toggleEinspeisungSonstiges(wert) {
  const gruppe = document.getElementById('einspeisung_sonstiges_gruppe');
  if (!gruppe) return;
  gruppe.style.display = /sonstig/i.test(wert || '') ? 'flex' : 'none';
}

function collectAnschlussState() {
  const state = { fields: {}, uebergabepunkte: [] };
  ANSCHLUSS_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.uebergabepunkte = Array.from(document.querySelectorAll('#feedsContainer .feed-card')).map(card => {
    const obj = { kartenId: card.dataset.kartenId || '' };
    Object.keys(CARD_FELD_SELEKTOREN).forEach(key => {
      const el = card.querySelector(CARD_FELD_SELEKTOREN[key]);
      if (el) obj[key] = el.value;
    });
    return obj;
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

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  if (state.uebergabepunkte && state.uebergabepunkte.length) {
    state.uebergabepunkte.forEach(u => addFeedCard(u));
  } else {
    // Abwaertskompatibel: ein VOR der Mehrfach-Uebergabepunkte-Aenderung
    // gespeicherter Zwischenstand (state.uebergabepunkt, Singular, flaches
    // Objekt mit denselben Feldnamen wie CARD_FELD_SELEKTOREN) wird als EINE
    // Karte wiederhergestellt; ganz ohne gespeicherte Uebergabepunkt-Daten
    // entsteht eine leere Karte.
    addFeedCard(state.uebergabepunkt || {});
  }

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

  document.querySelectorAll('.sicht-item, .erp-item').forEach(el => sichtErpNiOPruefen(el));

  return true;
}

function autosaveProtocol() {
  if (typeof WERKBANK_MODUS !== 'undefined' && WERKBANK_MODUS) return; // [9.2.0]
  try {
    sicherSetItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectAnschlussState()));
    const anzahl = document.querySelectorAll('#feedsContainer .feed-card').length;
    entwurfMerken('AP', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('AP', () => ({
        anlage: document.getElementById('uebergabe_standort')?.value,
        gebaeude: document.getElementById('gebaeude_custom')?.value
      })),
      standort: document.getElementById('uebergabe_standort')?.value || document.getElementById('auftraggeber')?.value || '',
      gebaeude: document.getElementById('gebaeude_custom')?.value || '',
      anlage: document.getElementById('anlage_bez')?.value || '',
      anzahl: anzahl
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

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard();

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
