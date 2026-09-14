/* ============================================================================
 *  pdf-layout.js  –  NEUE ZEICHEN-ENGINE FUER ALLE DREI PDF-PROTOKOLLE
 * ----------------------------------------------------------------------------
 *  [Nutzeranforderung, 11.0.0] Komplettes Neuaufsetzen der Layout-Schicht
 *  ("baue alle 3 Leerformulare und Generatoren komplett neu auf, behalte
 *  lediglich das Design"). Ziel dieser Datei ist es, die in pdf-utils.js
 *  bisher HANDGERECHNETEN Boxhöhen/Zeilenoffsets (SEK1_H = 32, OFF_R =
 *  OFF_PA_KONZEPT + ZA, ...) durch ein Raster-System zu ersetzen, das die
 *  Nutzervorgaben STRUKTURELL erzwingt statt sie an jeder Stelle von Hand
 *  nachzurechnen:
 *
 *    - Innenabstand Text/Linie <-> Boxrand: mind. 3 mm oben UND unten.
 *    - Abstand zwischen zwei Boxen: mind. 3 mm.
 *    - Keine Linie/kein Text darf den rechten Boxrand beruehren oder
 *      ueberschreiten (definierter Innenabstand rechts).
 *    - Eine Box berechnet ihre Hoehe SELBST aus der Anzahl gezeichneter
 *      Zeilen - es gibt keine von Hand geschaetzte SEK*_H-Konstante mehr,
 *      die bei einer spaeteren Aenderung (ein Feld mehr/weniger) von Hand
 *      nachgezogen werden muss und dabei leicht vergessen wird (genau DAS
 *      war die Ursache der vom Nutzer gemeldeten Ueberlappungen).
 *
 *  WICHTIG - WAS DIESE DATEI NICHT ERSETZT:
 *  Die gesamte FACHLICHE Logik (Grenzwerte, Ampel-Bewertung, Pflichtfeld-
 *  Pruefungen, Rotmarkierung bei unzulaessigen Messwerten, Formelschreibweise
 *  R_E/Z_S/U_L usw.) bleibt vollstaendig in pdf-utils.js und den drei
 *  *-generator.js. Diese Datei stellt NUR die Zeichenprimitive (Box, Zeile,
 *  Checkbox-Gruppe, Tabelle) bereit, mit denen die Generatoren neu aufgebaut
 *  werden - sie kennt selbst keine einzige DIN-VDE-Grenzwertregel.
 *
 *  KOORDINATENSYSTEM: identisch zum bisherigen (mm, Ursprung oben links,
 *  siehe PDF_MARGIN_LEFT/PDF_CONTENT_WIDTH/PDF_CONTENT_TOP in pdf-utils.js).
 * ========================================================================== */

const LAYOUT_INNEN_ABSTAND = 3;      // mm, Mindestabstand Text/Linie <-> Boxrand (oben/unten/rechts)
const LAYOUT_BOX_ABSTAND = 3;        // mm, Mindestabstand zwischen zwei Boxen
const LAYOUT_TITEL_HOEHE = 5.6;      // mm, Platzbedarf der fett gedruckten Box-Ueberschrift
const LAYOUT_ZEILE = 4.4;            // mm, Standard-Zeilenraster (Baseline zu Baseline)
const LAYOUT_ZEILE_KOMPAKT = 3.8;    // mm, engeres Raster fuer reine Checkbox-Zeilen ohne Freitext

/* ---------------------------------------------------------------------------
 *  PdfBox - eine Kategorie-Box mit Titel, die ihren Inhalt selbst vermisst.
 * ---------------------------------------------------------------------------
 *  Verwendung:
 *    const box = new PdfBox(doc, { titel: "1. ...", kat: 'stamm', y: startY });
 *    box.zeile2sp("Auftraggeber:", wert, "Prüfgerät:", wert2);
 *    box.checkboxZeile("Label:", [["Ja", cond1], ["Nein", cond2]]);
 *    const naechstesY = box.schliessen();   // zeichnet Rahmen JETZT (Hoehe steht erst hier fest)
 *
 *  Der Rahmen wird ERST bei schliessen() gezeichnet (nicht beim Konstruktor),
 *  weil die Hoehe erst nach dem letzten Zeileninhalt feststeht. Alle
 *  Zeileninhalte werden deshalb zunaechst in eine interne Zeichenliste
 *  gesammelt und beim Schliessen der Box en bloc ausgefuehrt (Rahmen zuerst,
 *  Inhalt darueber - wie bei den bisherigen drawKategorieBox()-Aufrufen). */
class PdfBox {
  constructor(doc, { titel, kat, y, x = PDF_MARGIN_LEFT, w = PDF_CONTENT_WIDTH }) {
    this.doc = doc;
    this.titel = titel;
    this.kat = kat;
    this.x = x;
    this.w = w;
    this.startY = y;
    // Erste Inhaltszeile beginnt mind. LAYOUT_TITEL_HOEHE unter der Boxoberkante -
    // das entspricht "Titel oben, mind. 3mm Innenabstand" (Titel-Fontgroesse
    // 8.5pt braucht selbst schon ~3mm, siehe LAYOUT_TITEL_HOEHE).
    this.cursorY = y + LAYOUT_TITEL_HOEHE + LAYOUT_INNEN_ABSTAND;
    this._ops = [];
    this._geschlossen = false;
  }

  // Reserviert die naechste Zeilenposition und rueckt den Cursor weiter.
  // hoehe: vertikaler Platzbedarf dieser Zeile (Standard: LAYOUT_ZEILE).
  _naechsteZeileY(hoehe = LAYOUT_ZEILE) {
    const yy = this.cursorY;
    this.cursorY += hoehe;
    return yy;
  }

  // Zwei Spalten (links/rechts) EINER Zeile, Label + Wert je Spalte.
  // spX: [xLinks, xRechts]. breite: nutzbare Feldbreite je Spalte (mm) -
  // wird IMMER so berechnet, dass die Linie/der Wert den rechten Boxrand
  // um mind. LAYOUT_INNEN_ABSTAND nicht erreicht (siehe box() unten).
  zeile2sp(labelL, wertL, labelR, wertR, opts = {}) {
    const yy = this._naechsteZeileY(opts.hoehe);
    const mitteX = this.x + this.w / 2;
    const breiteL = mitteX - this._spaltAbstand() - this.x - 3;
    const breiteR = (this.x + this.w) - LAYOUT_INNEN_ABSTAND - (mitteX + this._spaltAbstand() / 2);
    this._ops.push(doc => {
      drawFeldZeile(doc, labelL, wertL, this.x + 3, yy, breiteL, opts.isBlank, opts.optsL);
      if (labelR !== null && labelR !== undefined) {
        drawFeldZeile(doc, labelR, wertR, mitteX + this._spaltAbstand() / 2, yy, breiteR, opts.isBlank, opts.optsR);
      }
    });
    return this;
  }

  _spaltAbstand() { return 4; }

  // Eine einzelne, volle Zeile (Label + Wert ueber die volle Boxbreite).
  zeile1sp(label, wert, opts = {}) {
    const yy = this._naechsteZeileY(opts.hoehe);
    const maxBreite = this.w - 3 - LAYOUT_INNEN_ABSTAND;
    this._ops.push(doc => {
      drawFeldZeile(doc, label, wert, this.x + 3, yy, maxBreite, opts.isBlank, opts.opts);
    });
    return this;
  }

  // Freier Zeilenzugriff fuer Sonderfaelle (Tabellen, Checkbox-Gruppen,
  // Fliesstext) - cb(doc, y, innenRechts) wird beim Schliessen ausgefuehrt.
  // innenRechts ist die rechte Grenze (x-Koordinate), die Inhalt in dieser
  // Zeile nicht ueberschreiten darf (Box-Innenkante minus LAYOUT_INNEN_ABSTAND).
  frei(cb, hoehe = LAYOUT_ZEILE) {
    const yy = this._naechsteZeileY(hoehe);
    const innenRechts = this.x + this.w - LAYOUT_INNEN_ABSTAND;
    this._ops.push(doc => cb(doc, yy, innenRechts));
    return this;
  }

  // Reserviert zusaetzlichen Platz OHNE etwas zu zeichnen (z. B. vor einer
  // eingebetteten Tabelle, deren Hoehe erst nach dem autoTable()-Aufruf
  // bekannt ist - siehe tabelleAbschliessen()).
  platz(hoehe) {
    this.cursorY += hoehe;
    return this;
  }

  // Aktuelle Cursor-Position (fuer Inhalte, die die Box selbst per autoTable
  // zeichnet und deren Endposition erst danach bekannt ist).
  get y() { return this.cursorY; }
  set y(v) { this.cursorY = v; }

  // Schliesst die Box: Hoehe = letzter Cursor + Innenabstand unten, zeichnet
  // Rahmen + Titel + alle gesammelten Inhalte, gibt die naechste freie
  // Y-Position (naechsteY = Boxunterkante + LAYOUT_BOX_ABSTAND) zurueck.
  schliessen() {
    if (this._geschlossen) throw new Error('PdfBox bereits geschlossen');
    this._geschlossen = true;
    const hoehe = (this.cursorY - this.startY) + LAYOUT_INNEN_ABSTAND;
    drawKategorieBox(this.doc, { y: this.startY, h: hoehe, titel: this.titel, kat: this.kat, x: this.x, w: this.w });
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(7.2);
    this._ops.forEach(op => op(this.doc));
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...PDF_TEXT);
    return this.startY + hoehe + LAYOUT_BOX_ABSTAND;
  }
}

/* ---------------------------------------------------------------------------
 *  checkboxGruppe() - zeichnet N Checkboxen (Label+Kaestchen) mit
 *  automatischer, textbreiten-basierter Positionierung IN EINE ZEILE.
 * ---------------------------------------------------------------------------
 *  vorLabel: optionales Label vor der ersten Checkbox (z. B. "Ergebnis:").
 *  optionen: [{ label, checked, farbe? }] - werden nacheinander gezeichnet,
 *    jede Checkbox erhaelt automatisch genug Abstand zur vorherigen (misst
 *    die tatsaechliche Textbreite, statt einen festen 11mm-Schritt zu
 *    unterstellen - GENAU DAS war die Ursache von "Felder überlappen sich"
 *    bzw. der unsymmetrischen Abstaende im Nutzer-Feedback). Gibt die
 *    X-Position NACH der letzten Checkbox zurueck (fuer weitere Elemente in
 *    derselben Zeile).
 *  opts.labelFeldBreite: OPTIONAL - feste Breite (mm) fuer das vorLabel-Feld.
 *    Ist sie gesetzt, beginnt die ERSTE Checkbox immer bei x + labelFeldBreite,
 *    UNABHAENGIG von der tatsaechlichen Textlaenge des Labels. Ohne diese
 *    Option (Default) haengt die Checkbox-Startposition weiter von der
 *    Labelbreite ab - siehe drawPruefpunkt3sp()/drawPruefpunkt2sp() unten,
 *    die IMMER labelFeldBreite setzen, damit die Kaestchen mehrerer
 *    untereinanderstehender Pruefpunkt-Zeilen exakt fluchten (Nutzer-
 *    Feedback: "kästchen [...] sehr durcheinander [...] schiebe die
 *    untereinander"). Ist das gemessene Label breiter als labelFeldBreite,
 *    wird die Breite automatisch nachgegeben (keine Ueberlappung). */
function checkboxGruppe(doc, x, y, vorLabel, optionen, opts = {}) {
  let cx = x;
  const luecke = opts.luecke ?? 5;      // mm zwischen Ende Vorlabel/Checkbox-Text und naechster Checkbox
  const fontSize = opts.fontSize ?? 7;
  if (vorLabel) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize);
    const b = drawTextF(doc, vorLabel, cx, y);
    const naturalNext = cx + b + 2.5;
    cx = opts.labelFeldBreite ? Math.max(x + opts.labelFeldBreite, naturalNext) : naturalNext;
  }
  optionen.forEach((o, i) => {
    doc.setFontSize(fontSize);
    drawCheckbox(doc, cx, y, o.label, !!o.checked, o.farbe ?? 'neutral');
    doc.setFontSize(fontSize);
    const cbBreite = 4 + doc.getStringUnitWidth(o.label) * fontSize / doc.internal.scaleFactor;
    cx += cbBreite + luecke;
  });
  return cx;
}

/* Wie checkboxGruppe(), aber liefert vorab die Gesamtbreite, OHNE zu zeichnen -
 * fuer Rechts-Ausrichtung oder Kollisionspruefung mit dem rechten Boxrand. */
function checkboxGruppeBreite(doc, vorLabel, optionen, opts = {}) {
  const luecke = opts.luecke ?? 5;
  const fontSize = opts.fontSize ?? 7;
  let breite = 0;
  doc.setFontSize(fontSize);
  if (vorLabel) {
    doc.setFont('helvetica', 'bold');
    breite += doc.getStringUnitWidth(vorLabel) * fontSize / doc.internal.scaleFactor + 2.5;
  }
  doc.setFont('helvetica', 'normal');
  optionen.forEach((o, i) => {
    const cbBreite = 4 + doc.getStringUnitWidth(o.label) * fontSize / doc.internal.scaleFactor;
    breite += cbBreite + (i < optionen.length - 1 ? luecke : 0);
  });
  return breite;
}

/* ---------------------------------------------------------------------------
 *  seitenumbruchPruefen() - wie pdfPlatzPruefen() (pdf-utils.js), aber fuer
 *  das neue Boxenraster: prueft, ob eine Box der geschaetzten Hoehe noch VOR
 *  PDF_CONTENT_BOTTOM auf die aktuelle Seite passt; wenn nicht, wird eine
 *  neue Seite begonnen und PDF_CONTENT_TOP zurueckgegeben.
 * ------------------------------------------------------------------------ */
function layoutSeitenumbruchPruefen(doc, y, geschaetzteHoehe) {
  if (y + geschaetzteHoehe > PDF_CONTENT_BOTTOM) {
    doc.addPage();
    return PDF_CONTENT_TOP;
  }
  return y;
}

/* ---------------------------------------------------------------------------
 *  tabelleMitAbstand() - Wrapper um doc.autoTable(), der VOR dem Zeichnen
 *  garantiert, dass die Tabelle mit mind. LAYOUT_BOX_ABSTAND Abstand zur
 *  vorherigen Box beginnt, und NACH dem Zeichnen die Endposition
 *  (doc.lastAutoTable.finalY) inkl. desselben Mindestabstands zurueckgibt.
 * ------------------------------------------------------------------------ */
function tabelleMitAbstand(doc, y, autoTableOptions) {
  const startY = y;
  doc.autoTable({ ...autoTableOptions, startY });
  return doc.lastAutoTable.finalY + LAYOUT_BOX_ABSTAND;
}
