// GEMEINSAME HILFSFUNKTIONEN FÜR ALLE PROTOKOLLTYPEN (PDF-ERZEUGUNG, FORMULAR-HELPER)

/* ---------------------------------------------------------------------------
 *  ZEICHEN AUF DEN SICHER DARSTELLBAREN VORRAT ABBILDEN
 * ---------------------------------------------------------------------------
 *  Die Standardschrift des PDF (Helvetica) wird nicht eingebettet. Zeichen
 *  ausserhalb des Basisvorrats gehen je nach Anzeigeprogramm still verloren -
 *  aus "1,5 mm²" wird dann "1,5 mm". Ein Querschnitt ohne Einheit ist im
 *  Protokoll mehrdeutig, deshalb wird konsequent auf ASCII abgebildet.
 *
 *  Betroffen sind nicht nur Tabellenzellen: Bemerkungen und Anlagen-
 *  bezeichnungen werden oft aus Word oder Mail kopiert und bringen typografische
 *  Anfuehrungszeichen, Halbgeviertstriche und geschuetzte Leerzeichen mit.
 *  Im FORMULAR bleibt alles unveraendert - nur die PDF-Ausgabe wird umgesetzt.
 * ------------------------------------------------------------------------ */
function cleanStr(text) {
  if (!text) return "";
  return String(text)
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/Ω/g, "Ohm")
    .replace(/Δ/g, "d")
    .replace(/µ/g, "u")
    .replace(/°/g, " deg")
    // Hochgestellte Ziffern: Querschnitt "mm²" -> "mm2" (so steht es auch in
    // der Musterzeile des Leerformulars)
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    // Halbgeviert-/Geviertstrich und typografische Anfuehrungszeichen aus
    // kopierten Freitexten
    .replace(/[–—]/g, "-")
    .replace(/[„“”«»]/g, '"')
    .replace(/[‚‘’]/g, "'")
    .replace(/…/g, "...")
    // Rechenzeichen, die in Bemerkungen und Messnotizen vorkommen
    .replace(/≈/g, "~")
    .replace(/±/g, "+/-")
    .replace(/×/g, "x")
    // Mittelpunkt wird als Trennzeichen verwendet (z. B. "Prüfung · Nachmessung")
    .replace(/·/g, "-")
    // Geschuetzte und schmale Leerzeichen wie normale Leerzeichen behandeln
    .replace(/[\u00A0\u202F\u2009\u2007]/g, " ");
}

function drawCheckbox(doc, x, y, label, isChecked = false, isRed = false) {
  const activeRed = isRed && isChecked;
  if (activeRed) {
    doc.setDrawColor(220, 38, 38); doc.setFillColor(254, 226, 226);
  } else {
    doc.setDrawColor(100, 116, 139); doc.setFillColor(255, 255, 255);
  }
  doc.rect(x, y - 2.6, 3, 3, 'FD');
  if (isChecked) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    doc.setTextColor(activeRed ? 185 : 0, activeRed ? 28 : 51, activeRed ? 28 : 102);
    doc.text("X", x + 0.6, y - 0.3);
  }
  if (label) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.setTextColor(activeRed ? 185 : 15, activeRed ? 28 : 23, activeRed ? 28 : 42);
    doc.text(label, x + 4, y);
  }
  doc.setTextColor(15, 23, 42); doc.setFont("helvetica", "normal"); doc.setDrawColor(203, 213, 225); doc.setFillColor(255, 255, 255);
}

function formatNetzspannung(input) {
  let digits = input.value.replace(/\D/g, '');
  if (digits.length > 6) digits = digits.slice(0, 6);
  if (digits.length > 3) {
    input.value = digits.slice(0, 3) + ' / ' + digits.slice(3);
  } else {
    input.value = digits;
  }
}

function setValue(fieldId, val) {
  const elem = document.getElementById(fieldId);
  if (elem) {
    elem.value = val;
    if (typeof autosaveProtocol === 'function') autosaveProtocol();
  }
}

function removeCard(id) { const el = document.getElementById(id); if (el) el.remove(); }

// MINDEST-KURZSCHLUSSSTROM FÜR SICHERES AUSLÖSEN DER ÜBERSTROMSCHUTZEINRICHTUNG
// (oberer Auslösebereich der Charakteristik: B=5x, C=10x, D=20x In, nach DIN VDE 0100-410)
function getMinIk(sicherungText) {
  if (!sicherungText) return null;
  const match = sicherungText.trim().match(/^([BCD])\s*([\d.,]+)/i);
  if (!match) return null;
  const rating = parseFloat(match[2].replace(',', '.'));
  if (isNaN(rating)) return null;
  const multiplier = { B: 5, C: 10, D: 20 }[match[1].toUpperCase()];
  return multiplier ? multiplier * rating : null;
}

// ZULÄSSIGER AUSLÖSEBEREICH DES RCD: 0,5 x I_dn BIS 1,0 x I_dn (I_dn IN mA)
function getRcdIdnRangeMa(idnText) {
  if (!idnText) return null;
  const match = idnText.replace(',', '.').match(/([\d.]+)/);
  if (!match) return null;
  const idn = parseFloat(match[1]);
  if (isNaN(idn)) return null;
  return { min: idn * 0.5, max: idn };
}

// GRENZWERTE NACH DIN EN 50678 (VDE 0701) / DIN EN 50699 (VDE 0702) FÜR ORTSVERÄNDERLICHE GERÄTE
// (Nachfolgenormen der am 21.09.2023 zurückgezogenen DIN VDE 0701-0702:2008-06; die Grenzwerte für
// Isolationswiderstand und Ableitstrom wurden inhaltlich unverändert übernommen)

// MINDEST-ISOLATIONSWIDERSTAND (MOhm) JE SCHUTZKLASSE, BEI 500V DC PRÜFSPANNUNG
function getIsoMin(schutzklasse, hatHeizelement) {
  if (schutzklasse === 'I') return hatHeizelement ? 0.3 : 1.0;
  if (schutzklasse === 'II') return hatHeizelement ? 1.0 : 2.0;
  if (schutzklasse === 'III') return 0.25;
  return null;
}

// MAXIMAL ZULÄSSIGER ABLEITSTROM (mA) JE SCHUTZKLASSE
// SK I  -> Schutzleiterstrom, Grenzwert 3,5 mA.
//          Sonderfall DIN EN 50699: Geräte mit Heizleistung > 3,5 kW duerfen
//          1 mA je kW Heizleistung fuehren, jedoch hoechstens 10 mA.
// SK II -> Beruehrungsstrom, Grenzwert 0,5 mA.
function getAbleitstromMax(schutzklasse, heizleistungKw) {
  if (schutzklasse === 'I') {
    const kw = parseFloat(String(heizleistungKw).replace(',', '.'));
    if (!isNaN(kw) && kw > 3.5) return Math.min(kw, 10);
    return 3.5;
  }
  if (schutzklasse === 'II') return 0.5;
  if (schutzklasse === 'III') return 0.5;
  return null;
}

// BEZEICHNUNG DER GEMESSENEN GROESSE JE SCHUTZKLASSE (SK I misst den Schutzleiterstrom,
// SK II/III den Beruehrungsstrom - das sind physikalisch verschiedene Groessen)
function getAbleitstromBezeichnung(schutzklasse) {
  return schutzklasse === 'I' ? 'Schutzleiterstrom' : 'Berührungsstrom';
}

// MAX. AUSLOESEZEIT DES RCD (ms) IN ABHAENGIGKEIT VOM PRUEFSTROM.
// Nach DIN EN 61008-1 (VDE 0664-10) / DIN EN 61009-1: 300 ms bei 1x I_dn,
// 150 ms bei 2x I_dn, 40 ms bei 5x I_dn. Der oft pauschal genannte Wert von
// 40 ms gilt AUSSCHLIESSLICH fuer die Pruefung mit 5x I_dn.
// Selektive RCD (Typ S) duerfen laenger brauchen: 500 / 200 / 150 ms.
// UEBLICHER PRUEFSTROM IN DER PRAXIS: 5 x I_dn (schnellster Nachweis,
// Grenzwert 40 ms). NUR ALS ANZEIGE-/VORSCHLAGSWERT gedacht - er wird bewusst
// NICHT vorausgewaehlt und darf im PDF-Pfad niemals stillschweigend fuer einen
// fehlenden Eintrag einspringen. Welcher Pruefstrom verwendet wurde, kann nur
// die pruefende Person wissen; eine Annahme waere eine erfundene Messbedingung.
const RCD_PRUEFSTROM_STANDARD = '5';

// Ohne angegebenen Pruefstrom gibt es KEINEN definierten Grenzwert -> null.
// Frueher wurde hier still RCD_PRUEFSTROM_STANDARD eingesetzt; dadurch bewertete
// das PDF eine Ausloesezeit gegen eine Messbedingung, die der Pruefer nie
// angegeben hatte. Ein Grenzwert ohne bekannte Pruefbedingung ist wertlos.
function getRcdMaxAusloesezeitMs(pruefstrom, istSelektiv) {
  const faktor = String(pruefstrom == null ? '' : pruefstrom).replace(/[^\d]/g, '');
  if (faktor === '') return null;
  if (istSelektiv) {
    if (faktor === '5') return 150;
    if (faktor === '2') return 200;
    return 500;
  }
  if (faktor === '5') return 40;
  if (faktor === '2') return 150;
  return 300;
}

/* ---------------------------------------------------------------------------
 *  RCD-ZELLE FUER DIE PROTOKOLLTABELLEN  (Anlagen- UND Anschlusspruefung)
 * ---------------------------------------------------------------------------
 *  WARUM ZENTRAL: Die Bewertung eines RCD-Eintrags ist in beiden Protokollen
 *  fachlich identisch. Solange sie doppelt gepflegt wurde, fehlte in der
 *  Anschlusspruefung die Erkennung ungepruefter RCD komplett.
 *
 *  REGELN:
 *  1. Gemessene Werte werden IMMER gedruckt - auch wenn das Typ-Feld leer
 *     blieb. Eine durchgefuehrte Messung darf nie aus dem Beweisdokument
 *     verschwinden (DIN VDE 0100-600 Abschn. 6.4.3.7: Messergebnisse sind zu
 *     dokumentieren). Fehlt der Typ, ist das ein Dokumentationsmangel und wird
 *     als solcher markiert - kein Grund, die Messung zu unterschlagen.
 *  2. Der Pruefstrom bestimmt nach DIN EN 61008-1/61009-1 den Grenzwert der
 *     Ausloesezeit (300/150/40 ms bei 1/2/5 x I_dn). Ohne Angabe gibt es keinen
 *     Grenzwert -> keine Bewertung, stattdessen Dokumentationsmangel. Es wird
 *     NIE ein Pruefstrom angenommen, den der Pruefer nicht gewaehlt hat.
 *  3. Ein eingetragener RCD ohne Messwerte ist ein Pruefmangel und wird rot
 *     markiert, statt unauffaellig als "-" zu erscheinen.
 *  4. Es entsteht nie eine Zelle, die nur aus "()" oder "-" besteht, wenn
 *     Messwerte vorliegen.
 * ------------------------------------------------------------------------ */
/* ZWEI VERSCHIEDENE ARTEN VON BEANSTANDUNG - BEWUSST GETRENNT
 *   isDokumentationsmangel: eine ANGABE fehlt (Typ, Pruefstrom). Die Zelle wird
 *     rot markiert, weil das Protokoll insoweit unvollstaendig ist. Es ist aber
 *     KEINE Aussage ueber die Sicherheit der Anlage - eine vergessene
 *     Typangabe macht keinen Stromkreis gefaehrlich und darf deshalb nicht den
 *     Freigabetext umkehren.
 *   isPruefungUnvollstaendig: die MESSUNG fehlt ganz oder halb. Damit ist die
 *     Wirksamkeit der Schutzmassnahme nicht nachgewiesen (DIN VDE 0100-600
 *     Abschn. 6.4.3.7) - das ist eine echte Beanstandung und kehrt den
 *     Freigabetext um.
 * Beide faerben die Zelle rot; nur die zweite wirkt auf die Gesamtbewertung. */
function rcdWertFehlt(v) {
  const t = String(v == null ? '' : v).trim();
  return t === '' || t === '-';
}

function istRcdSelektiv(typ) {
  return /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(String(typ || ''));
}

// Liefert Text und Bewertungsflags fuer die RCD-Spalte.
function buildRcdZelle(roh) {
  const typ = String(roh.typ || '').trim();
  const idn = String(roh.idn || '').trim();
  const imess = String(roh.imess || '').trim();
  const ta = String(roh.ta || '').trim();
  const pruefstrom = String(roh.pruefstrom || '').trim();

  const ohneRcd = /ohne\s*rcd/i.test(typ);
  const typAngegeben = typ !== '' && !ohneRcd;
  const hatImess = !rcdWertFehlt(imess);
  const hatTa = !rcdWertFehlt(ta);
  const hatMesswerte = hatImess || hatTa;

  // Gar nichts eingetragen -> schlichter Strich, keine leeren Klammern.
  if (!typAngegeben && !ohneRcd && idn === '' && !hatMesswerte) {
    return { text: '-', isOut: false, isDokumentationsmangel: false, isPruefungUnvollstaendig: false, taMax: null };
  }

  let dokuMangel = false;
  const zeilen = [];

  // --- Kopfzeile: Typ (I_dn) ---
  if (ohneRcd) {
    zeilen.push('Ohne RCD');
  } else if (typAngegeben) {
    zeilen.push(idn ? `${typ} (${idn})` : typ);
  } else {
    // Messwerte oder I_dn ohne Typ: Angabe fehlt, Messung bleibt trotzdem stehen.
    zeilen.push(idn ? `Typ nicht angegeben (${idn})` : 'Typ nicht angegeben');
    dokuMangel = true;
  }

  // --- Messzeile ---
  if (ohneRcd && hatMesswerte) {
    // Widerspruch: "Ohne RCD" gewaehlt, aber es liegen Ausloesewerte vor. Die
    // Werte zu verschweigen waere derselbe Fehler wie sie zu erfinden.
    zeilen.push(`${hatImess ? imess : '-'} mA / ${hatTa ? ta : '-'} ms`);
    zeilen.push('Widerspruch: Messwerte trotz "Ohne RCD"');
    return { text: zeilen.join('\n'), isOut: true, isDokumentationsmangel: true, isPruefungUnvollstaendig: false, taMax: null };
  }

  if (ohneRcd) {
    return { text: 'Ohne RCD', isOut: false, isDokumentationsmangel: false, isPruefungUnvollstaendig: false, taMax: null };
  }

  if (!hatMesswerte) {
    // Eingetragener RCD ohne jede Messung -> Pruefmangel (Regel 3).
    // Eingetragener RCD, aber keinerlei Messung: die Wirksamkeit der
    // Schutzmassnahme ist damit NICHT nachgewiesen -> echte Beanstandung.
    zeilen.push('nicht geprüft');
    return { text: zeilen.join('\n'), isOut: true, isDokumentationsmangel: false, isPruefungUnvollstaendig: true, taMax: null };
  }

  const taMax = pruefstrom ? getRcdMaxAusloesezeitMs(pruefstrom, istRcdSelektiv(typ)) : null;
  let messzeile = `${hatImess ? imess : '-'} mA / ${hatTa ? ta : '-'} ms`;
  if (taMax !== null) {
    messzeile += ` @ ${pruefstrom}x`;
  } else {
    // Regel 2: lieber ehrlich "nicht angegeben" als ein erfundenes "@ 1x".
    messzeile += ' (Prüfstrom nicht angegeben)';
    dokuMangel = true;
  }
  zeilen.push(messzeile);

  // Unvollstaendige Messung: der vorhandene Wert bleibt sichtbar, die Luecke
  // wird benannt. Frueher verschwand in diesem Fall der gemessene Wert hinter
  // einem pauschalen "nicht geprüft".
  // Die RCD-Pruefung umfasst Ausloesestrom UND Ausloesezeit - fehlt eine der
  // beiden Groessen, ist die Schutzmassnahme nur halb nachgewiesen.
  let pruefungUnvollstaendig = false;
  if (!hatImess || !hatTa) {
    zeilen.push(`Messung unvollständig (${!hatImess ? 'I_dmess' : 't_A'} fehlt)`);
    pruefungUnvollstaendig = true;
  }

  return {
    text: zeilen.join('\n'),
    isOut: dokuMangel || pruefungUnvollstaendig,
    isDokumentationsmangel: dokuMangel,
    isPruefungUnvollstaendig: pruefungUnvollstaendig,
    taMax: taMax
  };
}

/* ---------------------------------------------------------------------------
 *  PRUEFERGEBNIS: DREI ZUSTAENDE STATT ZWEI
 * ---------------------------------------------------------------------------
 *  Das Formular kennt "Keine Mängel", "Mängel festgestellt und behoben" und
 *  "Mängel festgestellt". Die PDF-Logik kannte nur zwei Zustaende und ordnete
 *  "behoben" den offenen Maengeln zu. Ergebnis war ein Dokument, das oben
 *  "Sicherer Gebrauch: Ja" ankreuzte und darunter das Gegenteil behauptete.
 * ------------------------------------------------------------------------ */
const MAENGEL_KEINE = 'keine';
const MAENGEL_BEHOBEN = 'behoben';
const MAENGEL_OFFEN = 'offen';
const MAENGEL_UNBESTIMMT = '';

function getMaengelZustand(wert) {
  const v = String(wert || '').trim();
  if (v === '') return MAENGEL_UNBESTIMMT;
  if (/behoben/i.test(v)) return MAENGEL_BEHOBEN;
  if (/^keine/i.test(v)) return MAENGEL_KEINE;
  return MAENGEL_OFFEN;
}

// Text fuer den Zustand "behoben". Er darf nur erscheinen, wenn im Protokoll
// KEINE offenen Beanstandungen mehr stehen - das wird beim Aufruf geprueft.
const MAENGEL_BEHOBEN_TEXT_ANLAGE =
  'Während der Prüfung festgestellte Mängel wurden unmittelbar behoben; die anschließende Nachmessung ergab zulässige Werte (Einzelheiten siehe Bemerkungen / Mängel). Die elektrische Anlage entspricht im dokumentierten Endzustand den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.';
const MAENGEL_BEHOBEN_TEXT_ANSCHLUSS =
  'Während der Prüfung festgestellte Mängel wurden unmittelbar behoben; die anschließende Nachmessung ergab zulässige Werte (Einzelheiten siehe Bemerkungen / Mängel). Der Übergabepunkt entspricht im dokumentierten Endzustand den anerkannten Regeln der Elektrotechnik und ist zur Nutzung durch den Veranstalter im genannten Rahmen freigegeben.';
const MAENGEL_BEHOBEN_TEXT_GERAETE =
  'Während der Prüfung festgestellte Mängel wurden unmittelbar behoben; die anschließende Nachmessung ergab zulässige Werte (Einzelheiten siehe Bemerkungen / Mängel). Die geprüften Geräte entsprechen im dokumentierten Endzustand den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.';

// Ohne Beschreibung, WAS behoben wurde, ist die Aussage "Mängel behoben"
// wertlos und im Streitfall nicht belegbar. Gilt nur fuer ausgefuellte PDFs.
function maengelBehobenBemerkungFehlt(zustand, bemerkungWert) {
  return zustand === MAENGEL_BEHOBEN && String(bemerkungWert || '').trim() === '';
}

/* ---------------------------------------------------------------------------
 *  ZWEITER WIDERSPRUCHSPFAD: FREIGABE TROTZ BEANSTANDUNG
 * ---------------------------------------------------------------------------
 *  Auch ohne den Zustand "behoben" laesst sich ein widerspruechliches Dokument
 *  erzeugen: "Mängel festgestellt" auswaehlen und trotzdem "Sicherer Gebrauch
 *  gewährleistet: Ja" stehen lassen. Das PDF kreuzt dann "Ja" an und schreibt
 *  darunter "Ein sicherer Gebrauch ist NICHT gewährleistet".
 *
 *  Die automatische Umkehrung des Freigabetextes bleibt unangetastet - sie ist
 *  der eigentliche Schutzmechanismus. Stattdessen wird das Ankreuzfeld an ihr
 *  gemessen: passt beides nicht zusammen, entsteht kein Dokument. Der Prueferin
 *  bleibt die Wahl, die Beanstandung auszuraeumen oder das Feld auf "Nein" zu
 *  setzen - beides fuehrt zu einem in sich stimmigen Protokoll.
 * ------------------------------------------------------------------------ */
function freigabeWidersprichtBefund(isBlank, hasIssues, freigabeWert) {
  return !isBlank && hasIssues && String(freigabeWert || '') === 'Ja';
}

function freigabeWiderspruchHinweis(feldName) {
  return 'Widerspruch im Prüfergebnis:\n\n' +
    'Das Protokoll enthält Beanstandungen (Mängel, unzulässige Messwerte oder ein n.i.O.-Ergebnis), ' +
    'gleichzeitig steht "' + feldName + '" auf "Ja".\n\n' +
    'Ein Protokoll, das beides behauptet, ist als Nachweis wertlos. Bitte entweder die Beanstandungen ' +
    'ausräumen und erneut messen oder "' + feldName + '" auf "Nein" setzen.\n\n' +
    'Das PDF wurde deshalb nicht erstellt.';
}

/* Fehlende Angaben werden im Freigabetext benannt, statt nur rot in einer
 * Tabellenzelle zu stehen. Sie kehren die Aussage nicht um - sie sagen, dass
 * das Protokoll an dieser Stelle unvollstaendig ist. */
const DOKU_MANGEL_ZUSATZ =
  ' Hinweis: In der Tabelle sind Angaben rot markiert, die zur vollständigen Dokumentation fehlen (z. B. RCD-Typ oder verwendeter Prüfstrom). Das Protokoll ist insoweit unvollständig und sollte ergänzt werden.';

const MAENGEL_BEHOBEN_HINWEIS =
  'Bitte im Feld "Bemerkungen / Mängel" beschreiben, WELCHE Mängel festgestellt und wie sie behoben wurden.\n\n' +
  'Die Auswahl "Mängel festgestellt und behoben" ist ohne diese Beschreibung nicht nachvollziehbar. ' +
  'Das PDF wurde deshalb nicht erstellt.';

// MAX. SCHUTZLEITERWIDERSTAND (Ohm): 0,3 Ohm BIS 5m LEITUNGSLÄNGE,
// DANACH +0,1 Ohm JE ANGEFANGENE 7,5m (Prüfstrom mind. 200mA)
function getRpeMaxDevice(lengthM) {
  const len = parseFloat(String(lengthM).replace(',', '.'));
  if (isNaN(len) || len <= 5) return 0.3;
  return 0.3 + Math.ceil((len - 5) / 7.5) * 0.1;
}

// ---------------------------------------------------------------------------
// GEMEINSAMER PDF-KOPF UND -FUSS FUER ALLE DREI PROTOKOLLTYPEN
// ---------------------------------------------------------------------------
// Die Infobox oben rechts beginnt bei x = 125 mm, ihr Text bei x = 128 mm.
// Der Titel startet bei x = 10 mm -> nutzbar sind 112 mm. Frueher waren Titel
// und Normzeile mit fester Schriftgroesse gesetzt; bei den laengeren Titeln der
// Anschluss- und Geraetepruefung lief der Text in die Box und ueberdruckte sie
// zeichenweise. drawFittedText verkleinert stattdessen so weit noetig.

const PDF_HEADER_BOX_X = 125;      // linke Kante der Infobox
const PDF_TITLE_MAX_WIDTH = 112;   // 10 mm Rand bis 3 mm vor der Box
const PDF_PRIMARY = [0, 51, 102];
const PDF_TEXT = [15, 23, 42];
const PDF_MUTED = [71, 85, 105];
const PDF_BOX_BORDER = [203, 213, 225];
const PDF_RED_TEXT = [153, 27, 27];
const PDF_LINE = [148, 163, 184];  // Farbe der Eintragelinien im Leerformular

/* ---------------------------------------------------------------------------
 *  SEITENGEOMETRIE - EINE ZENTRALE STELLE FUER ALLE PROTOKOLLE
 * ---------------------------------------------------------------------------
 *  Der Kopf (Titel + Normzeile + Trennlinie) belegt auf JEDER Seite den
 *  Bereich bis y = 20 mm. Inhalte duerfen deshalb nie oberhalb von
 *  PDF_CONTENT_TOP beginnen - fruehere Umbrueche setzten y = 15 und liefen
 *  dadurch in Titel und Trennlinie hinein.
 * ------------------------------------------------------------------------ */
const PDF_MARGIN_LEFT = 10;
const PDF_MARGIN_RIGHT = 10;
const PDF_CONTENT_WIDTH = 190;     // 210 mm - 2 x 10 mm
const PDF_CONTENT_TOP = 25;        // erste Zeile unter der Kopf-Trennlinie
const PDF_CONTENT_BOTTOM = 283;    // letzte nutzbare Zeile ueber der Fusszeile
const PDF_FOOTER_Y = 291;

// Legt bei Bedarf eine neue Seite an und liefert die y-Position zurueck, an der
// weitergezeichnet werden darf. IMMER statt "if (y > x) { addPage(); y = 15; }"
// verwenden - so ist der obere Seitenrand auf allen Folgeseiten identisch.
function pdfPlatzPruefen(doc, y, benoetigteHoehe) {
  if (y + benoetigteHoehe > PDF_CONTENT_BOTTOM) {
    doc.addPage();
    return PDF_CONTENT_TOP;
  }
  return y;
}

/* ---------------------------------------------------------------------------
 *  DEZENTE ABGRENZUNG DER PRUEFABLAUF-KATEGORIEN (GRAUSTUFEN)
 * ---------------------------------------------------------------------------
 *  Bewusst KEINE Buntfarben: aufeinanderfolgende Abschnitte wechseln nur
 *  zwischen zwei sehr hellen Grautoenen. Das gliedert das Blatt, bleibt aber
 *  ein sachliches Pruefprotokoll und druckt auch auf S/W-Geraeten sauber.
 *  Titel und Tabellenkopf bleiben im Hausblau (PDF_PRIMARY).
 * ------------------------------------------------------------------------ */
const PDF_TON_A = [252, 253, 254];   // nahezu weiss
const PDF_TON_B = [242, 245, 248];   // ein Hauch dunkler

// Zuordnung Abschnitt -> Ton. Benachbarte Abschnitte bekommen den jeweils
// anderen Ton, dadurch entsteht die abwechselnde Gliederung.
const PDF_KAT = {
  stamm:    { bg: PDF_TON_A, rand: PDF_BOX_BORDER, akzent: PDF_PRIMARY, kopf: [226, 232, 240] },
  sicht:    { bg: PDF_TON_B, rand: PDF_BOX_BORDER, akzent: PDF_PRIMARY, kopf: [226, 232, 240] },
  messen:   { bg: PDF_TON_A, rand: PDF_BOX_BORDER, akzent: PDF_PRIMARY, kopf: [226, 232, 240] },
  erdung:   { bg: PDF_TON_B, rand: PDF_BOX_BORDER, akzent: PDF_PRIMARY, kopf: [226, 232, 240] },
  ergebnis: { bg: PDF_TON_A, rand: PDF_BOX_BORDER, akzent: PDF_PRIMARY, kopf: [226, 232, 240] }
};

// Abschnittsbox mit Titelzeile.
function drawKategorieBox(doc, { y, h, titel, kat, x = PDF_MARGIN_LEFT, w = PDF_CONTENT_WIDTH }) {
  const c = PDF_KAT[kat] || PDF_KAT.ergebnis;
  doc.setDrawColor(...c.rand);
  doc.setFillColor(...c.bg);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 1, 1, 'FD');

  if (titel) {
    doc.setTextColor(...c.akzent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(titel, x + 3, y + 5);
  }

  doc.setTextColor(...PDF_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_BOX_BORDER);
  return c;
}

// Ueberschrift ueber einer Tabelle.
function drawKategorieTitel(doc, titel, y, kat, x = PDF_MARGIN_LEFT) {
  const c = PDF_KAT[kat] || PDF_KAT.ergebnis;
  doc.setTextColor(...c.akzent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(titel, x, y);
  doc.setTextColor(...PDF_TEXT);
  doc.setFont('helvetica', 'normal');
  return c;
}

/* ---------------------------------------------------------------------------
 *  BESCHRIFTETE EINTRAGEZEILE
 * ---------------------------------------------------------------------------
 *  Im Leerformular standen bisher feste Unterstrich-Ketten ("____________").
 *  Die waren unabhaengig von der Spaltenbreite immer gleich kurz. Jetzt wird
 *  eine echte Linie bis zum Spaltenende gezeichnet - dadurch ist ueberall die
 *  volle Breite zum handschriftlichen Ausfuellen nutzbar.
 * ------------------------------------------------------------------------ */
function drawFeldZeile(doc, label, wert, x, y, breite, isBlank) {
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_TEXT);
  doc.text(label, x, y);
  const labelBreite = doc.getStringUnitWidth(label) * doc.getFontSize() / doc.internal.scaleFactor;
  const startX = x + labelBreite + 1.5;
  const wertText = wert === undefined || wert === null ? '' : String(wert).trim();

  if (isBlank || wertText === '') {
    doc.setDrawColor(...PDF_LINE);
    doc.setLineWidth(0.15);
    doc.line(startX, y + 1, x + breite, y + 1);
  } else {
    // Zu langer Wert wird verkleinert, damit er nicht in die Nachbarspalte laeuft
    const alteGroesse = doc.getFontSize();
    drawFittedText(doc, wertText, startX, y, Math.max(breite - (startX - x), 10), alteGroesse, 5.5);
    doc.setFontSize(alteGroesse);
  }
}

// Mehrere leere Schreiblinien untereinander (z. B. fuer Bemerkungen im Leerformular)
function drawSchreibLinien(doc, x, y, breite, anzahl, abstand = 5) {
  doc.setDrawColor(...PDF_LINE);
  doc.setLineWidth(0.15);
  for (let i = 0; i < anzahl; i++) {
    doc.line(x, y + i * abstand, x + breite, y + i * abstand);
  }
}

// Setzt Text und verkleinert die Schrift so weit, dass maxWidth eingehalten wird.
// Gibt die tatsaechlich verwendete Schriftgroesse zurueck.
function drawFittedText(doc, text, x, y, maxWidth, startSize, minSize = 6) {
  let size = startSize;
  while (size > minSize) {
    doc.setFontSize(size);
    if (doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor <= maxWidth) break;
    size -= 0.25;
  }
  doc.setFontSize(size);
  doc.text(text, x, y);
  return size;
}

// Titel + Normzeile + Trennlinie. Wird auf Seite 1 und auf jeder Folgeseite
// mit denselben Werten aufgerufen, damit der Kopf identisch aussieht.
function drawProtokollHeader(doc, { titel, normzeile }) {
  doc.setTextColor(...PDF_PRIMARY);
  doc.setFont("helvetica", "bold");
  drawFittedText(doc, titel, 10, 11, PDF_TITLE_MAX_WIDTH, 13, 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_MUTED);
  // Die Normzeile darf ebenfalls nicht unter die Box laufen (dort steht "Seite x von y").
  drawFittedText(doc, normzeile, 10, 16, PDF_TITLE_MAX_WIDTH, 7.5, 5.5);

  doc.setDrawColor(...PDF_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(10, 20, 200, 20);
  doc.setTextColor(...PDF_TEXT);
}

// Infobox oben rechts inkl. Protokoll-Nr., Prueflings-ID, Datum und Seitenzahl,
// plus Revisionsvermerk in der Fusszeile.
// Muss nach dem Erzeugen aller Seiten aufgerufen werden.
function drawProtokollSeitenkoepfe(doc, { titel, normzeile, protokollNr, pruefNr, datum, revision }) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Der Kopf muss auf JEDER Folgeseite identisch stehen, sonst rutschen die
    // Inhalte optisch gegeneinander. Seite 1 hat ihn bereits vom Generator.
    if (i > 1) drawProtokollHeader(doc, { titel, normzeile });

    doc.setDrawColor(...PDF_BOX_BORDER);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.roundedRect(PDF_HEADER_BOX_X, 4.5, 75, 15, 1, 1, 'FD');

    // Leere Werte (Leerformular) werden als Schreiblinie ausgegeben - vorher
    // stand dort ein Platzhaltertext wie "PR-JJJJ-MM-TT-XXX", auf den man
    // nichts eintragen konnte.
    const kopfFeld = (label, wert, yy) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(...PDF_PRIMARY);
      doc.text(label, 127.5, yy);
      const lw = doc.getStringUnitWidth(label) * 6.8 / doc.internal.scaleFactor;
      const wertText = wert === undefined || wert === null ? '' : String(wert).trim();
      if (wertText) {
        doc.setFont("helvetica", "normal");
        doc.text(wertText, 127.5 + lw + 1.5, yy);
      } else {
        doc.setDrawColor(...PDF_LINE);
        doc.setLineWidth(0.15);
        doc.line(127.5 + lw + 1.5, yy + 0.9, 197.5, yy + 0.9);
        doc.setDrawColor(...PDF_BOX_BORDER);
      }
    };

    kopfFeld("Protokoll-Nr.:", protokollNr, 8);
    kopfFeld("Prüflings-ID:", pruefNr, 11.5);
    kopfFeld("Datum:", datum, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...PDF_PRIMARY);
    doc.text(`Seite ${i} von ${totalPages}`, 127.5, 18.5);

    // Revisionsstand: macht spaeter nachvollziehbar, mit welcher Formularversion
    // ein archiviertes Protokoll erstellt wurde.
    if (revision) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...PDF_MUTED);
      // auch der Revisionsvermerk laeuft ueber cleanStr (er enthaelt "·")
      doc.text(cleanStr(revision), PDF_MARGIN_LEFT, PDF_FOOTER_Y);
      doc.text(`Seite ${i} / ${totalPages}`, 200, PDF_FOOTER_Y, { align: 'right' });
    }
    doc.setTextColor(...PDF_TEXT);
  }
}

// Einheit nur anhaengen, wenn sie nicht bereits eingetippt wurde.
// (Verhinderte Ausgaben wie "1.2 V V".)
function withUnit(value, unit) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  const re = new RegExp(unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i');
  return re.test(v) ? v : `${v} ${unit}`;
}

// BENACHRICHTIGUNG (zuvor in der geloeschten pdf-export.js definiert)
function showNotification(message, type = 'info') {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:4px;font-size:14px;z-index:9999;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);';
  div.style.backgroundColor = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb';
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// SIGNATUR-CANVAS MIT KORREKTER AUFLÖSUNG INITIALISIEREN
// (ohne dies weicht die interne Zeichenfläche vom CSS-Seitenverhältnis ab
// und die Unterschrift wird verzerrt/unscharf dargestellt)
function setupSignatureCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext('2d').scale(ratio, ratio);
  if (typeof SignaturePad !== 'undefined') {
    return new SignaturePad(canvas);
  } else {
    console.warn('SignaturePad library not loaded');
    return null;
  }
}

// VALIDIERUNG ERDUNGSWIDERSTAND
// 10 Ohm ist ein betrieblicher Richtwert (Praxisreferenz fuer Fundament-/
// Blitzschutzerder), kein normativ fixer Grenzwert der DIN VDE 0100-600.
const ERDUNG_RE_RICHTWERT = 10;

function validateErdung() {
  const elem = document.getElementById('erdung_re');
  if (!elem) return;
  const val = elem.value.trim();
  // Leeres Feld muss die Markierung wieder entfernen - fehlte zuvor,
  // dadurch blieb eine einmal gesetzte Warnung nach dem Loeschen stehen.
  if (val === '') { elem.classList.remove('out-of-norm'); return; }
  const num = parseFloat(val.replace(',', '.'));
  if (!isNaN(num) && num > ERDUNG_RE_RICHTWERT) elem.classList.add('out-of-norm');
  else elem.classList.remove('out-of-norm');
}

// Gleiche Logik, eigener Name fuer die Anschlusspruefung (Aufrufe im HTML).
const validateErdungAnschluss = validateErdung;

/* ============================================================================
 *  PDF-AUSGABE FUER ALLE PLATTFORMEN
 * ----------------------------------------------------------------------------
 *  Frueher wurde IMMER zuerst das Teilen-Menue geoeffnet. Das war auf iOS
 *  noetig, auf Windows und Android aber laestig: Man wollte die Datei einfach
 *  im Download-Ordner haben.
 *
 *  Jetzt gilt (einstellbar auf der Startseite unter "PDF-Speicherort"):
 *    'download' (Standard) -> direkt in den Download-Ordner, ohne Rueckfrage
 *    'ordner'              -> in einen einmal ausgewaehlten Ziel-Ordner
 *                             (Chrome/Edge am PC; Ordner wird gemerkt)
 *    'teilen'              -> altes Verhalten mit Teilen-Menue
 *
 *  Auf iOS/iPadOS funktioniert ein echter Download in der installierten App
 *  nicht - dort wird automatisch auf das Teilen-Menue zurueckgefallen.
 *
 *  Aufruf statt doc.save(name):   savePdfCompatible(doc, name);
 * ========================================================================== */
const PDF_SPEICHERN_KEY = 'vde_pdf_speichern_modus';

function isIosLike() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function getPdfSpeichernModus() {
  try { return localStorage.getItem(PDF_SPEICHERN_KEY) || 'download'; }
  catch (e) { return 'download'; }
}

function setPdfSpeichernModus(modus) {
  try { localStorage.setItem(PDF_SPEICHERN_KEY, modus); } catch (e) {}
}

/* --- Ziel-Ordner dauerhaft merken (File System Access API, nur Chrome/Edge) --- */
const PDF_ORDNER_DB = 'vde_pdf_ordner';

function pdfOrdnerHandleSpeichern(handle) {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) return resolve(false);
    const req = indexedDB.open(PDF_ORDNER_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('handles');
    req.onsuccess = () => {
      try {
        const tx = req.result.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(handle, 'ziel');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    };
    req.onerror = () => resolve(false);
  });
}

function pdfOrdnerHandleLaden() {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) return resolve(null);
    const req = indexedDB.open(PDF_ORDNER_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('handles');
    req.onsuccess = () => {
      try {
        const get = req.result.transaction('handles', 'readonly').objectStore('handles').get('ziel');
        get.onsuccess = () => resolve(get.result || null);
        get.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    };
    req.onerror = () => resolve(null);
  });
}

// Ordnerauswahl (muss aus einem Klick heraus aufgerufen werden)
async function pdfZielordnerWaehlen() {
  if (!window.showDirectoryPicker) {
    alert('Das Auswählen eines festen Ordners unterstützt nur Chrome oder Edge am Computer.\n' +
          'Auf Android/iPad bitte "Download-Ordner" oder "Teilen-Menü" verwenden.');
    return null;
  }
  try {
    const handle = await window.showDirectoryPicker({ id: 'vde-pdf-ziel', mode: 'readwrite' });
    await pdfOrdnerHandleSpeichern(handle);
    setPdfSpeichernModus('ordner');
    return handle;
  } catch (e) {
    return null; // Nutzer hat abgebrochen
  }
}

async function pdfOrdnerFreigabePruefen(handle) {
  if (!handle || !handle.queryPermission) return false;
  const opt = { mode: 'readwrite' };
  if (await handle.queryPermission(opt) === 'granted') return true;
  try { return await handle.requestPermission(opt) === 'granted'; }
  catch (e) { return false; }
}

function pdfDirektDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    if (a.parentNode) a.parentNode.removeChild(a);
    URL.revokeObjectURL(url);
  }, 60000);
}

/* Rueckgabe: true  = Datei wurde ausgegeben (Download/Ordner/Teilen)
 *            false = Nutzer hat abgebrochen oder es ging schief
 * Der Aufrufer entscheidet daran, ob die Protokollnummer verbraucht wird -
 * ein abgebrochener Teilen-Dialog darf keine Nummer kosten. */
/* Ab 4.0.0 nimmt savePdfCompatible einen dritten Parameter "meta" entgegen
 * (aus archivMetaSammeln). Ist er gesetzt und handelt es sich nicht um ein
 * Leerformular, wandert das erzeugte PDF zusaetzlich ins App-Archiv. Der
 * Archiveintrag ist eine Zugabe - schlaegt er fehl, bleibt die Datei selbst
 * unberuehrt und der Rueckgabewert unveraendert. */
async function savePdfCompatible(doc, filename, meta) {
  const gespeichert = await pdfDateiAusgeben(doc, filename);
  if (gespeichert !== false && meta && !meta.isBlank && typeof archivPdfAblegen === 'function') {
    try {
      const blob = doc.output('blob');
      const eintrag = await archivPdfAblegen(blob, Object.assign({ dateiname: filename }, meta));
      if (eintrag) showNotification('Im Archiv abgelegt: ' + (meta.nummer || filename), 'success');
    } catch (e) { console.warn('[Archiv] nicht abgelegt:', e); }
  }
  return gespeichert;
}

async function pdfDateiAusgeben(doc, filename) {
  let blob;
  try {
    blob = doc.output('blob');
  } catch (e) {
    try { doc.save(filename); return true; } catch (e2) { alert('PDF konnte nicht erzeugt werden.'); }
    return false;
  }

  const modus = getPdfSpeichernModus();

  /* --- 1. Fester Ziel-Ordner (nur wenn ausdruecklich eingestellt) --- */
  if (modus === 'ordner' && window.showDirectoryPicker) {
    try {
      let handle = await pdfOrdnerHandleLaden();
      if (!handle) handle = await pdfZielordnerWaehlen();
      if (handle && await pdfOrdnerFreigabePruefen(handle)) {
        const datei = await handle.getFileHandle(filename, { create: true });
        const writer = await datei.createWritable();
        await writer.write(blob);
        await writer.close();
        showNotification('PDF gespeichert: ' + filename, 'success');
        return true;
      }
    } catch (e) { /* faellt unten auf den normalen Download zurueck */ }
  }

  /* --- 2. Teilen-Menue: nur auf ausdruecklichen Wunsch oder auf iOS --- */
  const brauchtTeilen = modus === 'teilen' || isIosLike();
  if (brauchtTeilen && typeof File !== 'undefined') {
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], title: filename });
        return true;
      } catch (err) {
        // Abbruch im Teilen-Menue: keine Datei entstanden -> keine Nummer verbrauchen
        if (err && err.name === 'AbortError') return false;
        // sonst: normaler Download als Rueckfallebene
      }
    }
  }

  /* --- 3. Standard: direkter Download in den Download-Ordner --- */
  try {
    pdfDirektDownload(blob, filename);
    return true;
  } catch (e) { /* weiter */ }

  /* --- 4. Notfall --- */
  try { doc.save(filename); return true; }
  catch (e) {
    alert('PDF konnte nicht gespeichert werden. Bitte die Seite im Browser (statt als App) öffnen.');
  }
  return false;
}
