// GEMEINSAME HILFSFUNKTIONEN FÜR ALLE PROTOKOLLTYPEN (PDF-ERZEUGUNG, FORMULAR-HELPER)

/* ---------------------------------------------------------------------------
 *  5.0.0 (BUG #4 aus der 4.7.2-Prüfung): MESSWERTE MIT KOMMA SICHER PARSEN
 * ----------------------------------------------------------------------------
 *  VORHER: An ueber 40 Stellen im Code stand parseFloat(wert.replace(',', '.')).
 *  String.prototype.replace() ohne /g-Flag ersetzt nur das ERSTE Komma. Eine
 *  Fehleingabe wie "1,2,3" wurde damit zu "1.2.3" - parseFloat() liest davon
 *  nur "1.2" und ignoriert den Rest kommentarlos, !isNaN() schlaegt NICHT an.
 *  Ein Tippfehler in einem Messwert (Isolationswiderstand, Erdungswiderstand,
 *  Fehlerstrom usw.) konnte so unbemerkt als falscher, aber gueltig wirkender
 *  Wert ins PDF gelangen.
 *
 *  JETZT: parseMesswert() ist die einzige Stelle, die Nutzereingaben in
 *  Messwerte umwandelt. Eingaben mit MEHR als einem Komma (oder einer sonst
 *  ungueltigen Zahl) liefern NaN statt eines geschnittenen Teilergebnisses -
 *  die bestehenden !isNaN()-Pruefungen an den Aufrufstellen greifen dadurch
 *  jetzt tatsaechlich. Ein einzelnes Komma als Dezimaltrennzeichen (deutsche
 *  Schreibweise) bleibt weiterhin gueltig. */
function parseMesswert(wert) {
  const s = String(wert == null ? '' : wert).trim();
  if (s === '') return NaN;
  const kommas = (s.match(/,/g) || []).length;
  if (kommas > 1) return NaN; // z.B. "1,2,3" - eindeutig eine Fehleingabe
  return parseFloat(s.replace(',', '.'));
}

/* ---------------------------------------------------------------------------
 *  ZEICHEN AUF DEN SICHER DARSTELLBAREN VORRAT ABBILDEN
 * ---------------------------------------------------------------------------
 *  FRUEHER: Das PDF benutzte die nicht eingebettete Standardschrift. Die kennt
 *  nur den WinAnsi-Vorrat, deshalb wurde hier alles auf ASCII abgebildet -
 *  aus "≤ 0,30 Ω" wurde "<= 0,30 Ohm" und aus "1,5 mm²" wurde "1,5 mm2".
 *
 *  JETZT: js/vendor/liberation-sans-font.js bettet eine Unicode-Schrift ein.
 *  Ω, Δ, ≤, ≥, ², °, µ und die deutsche Typografie werden gedruckt wie sie
 *  dastehen. Diese Funktion macht nur noch zwei Dinge:
 *
 *   1. VEREINHEITLICHEN: verschiedene Codepunkte fuer dasselbe Zeichen auf
 *      eine Schreibweise bringen (Ohm-Zeichen U+2126 -> Omega U+03A9,
 *      geschuetzte Leerzeichen -> normales Leerzeichen, Minuszeichen U+2212
 *      -> Bindestrich). Sonst haengt das Druckbild davon ab, aus welchem
 *      Programm ein Text kopiert wurde.
 *   2. ABSICHERN: Zeichen ausserhalb des eingebetteten Vorrats (Emoji,
 *      kyrillisch, CJK) durch ein sichtbares "?" ersetzen. Sie wuerden sonst
 *      als leere Kaesten oder gar nicht erscheinen - und ein still
 *      verschwundenes Zeichen ist in einem Pruefprotokoll das schlechtere
 *      von beiden Uebeln.
 *
 *  Das Formel-Markup (_{...} / ^{...}) besteht aus ASCII und bleibt
 *  unangetastet. Im FORMULAR wird weiterhin nichts veraendert - nur die
 *  PDF-Ausgabe laeuft hier durch.
 * ------------------------------------------------------------------------ */

// Eingebetteter Zeichenvorrat (Subset von Liberation Sans, siehe
// js/vendor/liberation-sans-font.js). Muss mit dem dortigen Subset zusammenpassen.
const PDF_ZEICHENVORRAT_RE =
  /[\u0020-\u007E\u00A0-\u00FF\u0391-\u03A9\u03B1-\u03C9\u0192\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u2044\u20AC\u2122\u2126\u2202\u2206\u220F\u2211\u2212\u2215\u2219\u221A\u221E\u222B\u2248\u2260\u2261\u2264\u2265\u2190-\u2193\u25A0\u25AA\u2500\u2502\n\r\t]/;

function cleanStr(text) {
  if (!text) return "";
  return String(text)
    // --- Vereinheitlichen -------------------------------------------------
    .replace(/\u2126/g, "\u03A9")          // OHM SIGN -> GREEK CAPITAL OMEGA
    .replace(/\u2206/g, "\u0394")          // INCREMENT -> GREEK CAPITAL DELTA
    .replace(/\u00B5/g, "\u03BC")          // MICRO SIGN -> GREEK SMALL MU
    .replace(/\u2212/g, "-")               // MINUS SIGN -> Bindestrich
    .replace(/[\u2010\u2011]/g, "-")       // Trenn-/geschuetzter Bindestrich
    .replace(/[\u00A0\u202F\u2009\u2007\u2008]/g, " ")   // schmale/geschuetzte Leerzeichen
    // --- Absichern --------------------------------------------------------
    .replace(/[^]/gu, function (z) { return PDF_ZEICHENVORRAT_RE.test(z) ? z : "?"; });
}

/* ===========================================================================
 *  FORMELSATZ IM PDF  -  "R_{PE}" WIRD ZU R MIT TIEFGESTELLTEM PE
 * ---------------------------------------------------------------------------
 *  WARUM:
 *  In der App-Oberflaeche stehen die Groessen als echte Formeln (HTML <sub>):
 *  R(PE), R(ISO), Z(S), I(Δn), t(A). Im PDF war davon nur eine Behelfs-
 *  schreibweise uebrig - "R_PE", "Z_S", "I_dmess", "<= 0,30 Ohm". Fuer ein
 *  Pruefprotokoll ist das mehr als ein Schoenheitsfehler: die Formelzeichen
 *  sind in DIN VDE 0100-600 / 0105-100 / 0701-0702 genormt, und ein Protokoll
 *  soll die genormte Schreibweise zeigen.
 *
 *  MARKUP:
 *    _{...}   tiefgestellt   ->  'R_{PE}'   ergibt  R mit tiefgestelltem PE
 *    ^{...}   hochgestellt   ->  'mm^{2}'   ergibt  mm mit hochgestellter 2
 *
 *  Die geschweiften Klammern sind ABSICHT: nur Text, der dieses Markup
 *  enthaelt, wird als Formel gesetzt. Freitext aus den Eingabefeldern
 *  (Bezeichnungen, Bemerkungen) bleibt dadurch garantiert unangetastet -
 *  eine Anlagenbezeichnung wie "Verteiler_2" wird NICHT zur Formel.
 *
 *  Voraussetzung ist die eingebettete Unicode-Schrift (js/vendor/
 *  liberation-sans-font.js). Ohne sie fehlten Ω, Δ, ≤ und ≥ im Ausdruck.
 * ======================================================================== */

// Groesse und Grundlinienversatz der Indizes, jeweils bezogen auf die Basisschrift.
const FORMEL_INDEX_SKALA = 0.72;   // Indexschrift = 72 % der Basisgroesse
const FORMEL_TIEF_ANTEIL = 0.24;   // Tiefstellung: 24 % der Schrifthoehe nach unten
const FORMEL_HOCH_ANTEIL = 0.34;   // Hochstellung: 34 % der Schrifthoehe nach oben

const FORMEL_MARKUP_RE = /([_^])\{([^}]*)\}/g;

// Enthaelt der Text ueberhaupt Formel-Markup? (Schnelltest vor jedem Aufwand)
function hatFormel(text) {
  return /[_^]\{/.test(text === undefined || text === null ? '' : String(text));
}

/* Markup in Textabschnitte zerlegen.
 * Rueckgabe: [{ t: 'R', lage: 0 }, { t: 'PE', lage: -1 }]
 *   lage  0 = normal, -1 = tiefgestellt, +1 = hochgestellt */
function formelTeile(text) {
  const roh = text === undefined || text === null ? '' : String(text);
  const teile = [];
  let pos = 0;
  FORMEL_MARKUP_RE.lastIndex = 0;
  let m;
  while ((m = FORMEL_MARKUP_RE.exec(roh)) !== null) {
    if (m.index > pos) teile.push({ t: roh.slice(pos, m.index), lage: 0 });
    if (m[2] !== '') teile.push({ t: m[2], lage: m[1] === '_' ? -1 : 1 });
    pos = m.index + m[0].length;
  }
  if (pos < roh.length) teile.push({ t: roh.slice(pos), lage: 0 });
  return teile.length ? teile : [{ t: '', lage: 0 }];
}

/* Markup entfernen, ohne zu setzen. Wird gebraucht, wo eine Zeichenkette
 * NICHT gezeichnet, sondern nur gemessen oder weitergereicht wird
 * (Dateinamen, Archiveintraege, Umbruchberechnung von autoTable). */
function formelKlartext(text) {
  return String(text === undefined || text === null ? '' : text).replace(FORMEL_MARKUP_RE, '$2');
}

// Breite eines Formeltextes in Dokumenteinheiten (mm) bei der aktuellen Schrift.
function formelBreite(doc, text, basisPt) {
  const basis = basisPt || doc.getFontSize();
  const k = doc.internal.scaleFactor;
  let breite = 0;
  formelTeile(text).forEach(function (teil) {
    const groesse = teil.lage ? basis * FORMEL_INDEX_SKALA : basis;
    breite += doc.getStringUnitWidth(teil.t) * groesse / k;
  });
  return breite;
}

/* Formeltext EINZEILIG setzen.
 * opts: { align: 'left'|'center'|'right', fontSize: pt }
 * Rueckgabe: gesetzte Breite in mm. */
function drawFormel(doc, text, x, y, opts) {
  const o = opts || {};
  const basis = o.fontSize || doc.getFontSize();
  const k = doc.internal.scaleFactor;
  const hoehe = basis / k;                     // Schrifthoehe in mm
  const breite = formelBreite(doc, text, basis);

  let cx = x;
  if (o.align === 'center') cx = x - breite / 2;
  else if (o.align === 'right') cx = x - breite;

  formelTeile(text).forEach(function (teil) {
    if (teil.t === '') return;
    const groesse = teil.lage ? basis * FORMEL_INDEX_SKALA : basis;
    const dy = teil.lage === -1 ? hoehe * FORMEL_TIEF_ANTEIL
             : teil.lage === 1 ? -hoehe * FORMEL_HOCH_ANTEIL : 0;
    doc.setFontSize(groesse);
    doc.text(teil.t, cx, y + dy);
    cx += doc.getStringUnitWidth(teil.t) * groesse / k;
  });

  doc.setFontSize(basis);
  return breite;
}

/* Formeltext ODER gewoehnlicher Text - je nachdem, ob Markup enthalten ist.
 * Damit koennen Aufrufstellen bedenkenlos umgestellt werden, auch wenn dort
 * mal Freitext und mal eine Formel ankommt. */
function drawTextF(doc, text, x, y, opts) {
  if (hatFormel(text)) return drawFormel(doc, text, x, y, opts);
  const o = opts || {};
  doc.text(String(text === undefined || text === null ? '' : text), x, y, o.align ? { align: o.align } : undefined);
  return doc.getStringUnitWidth(String(text || '')) * (o.fontSize || doc.getFontSize()) / doc.internal.scaleFactor;
}

/* Formeltext mit automatischem Zeilenumbruch (fuer Beispiel- und Hinweiszeilen).
 * Umgebrochen wird an Leerzeichen, gemessen wird formelgerecht - sonst waere
 * die Zeile in der Rechnung breiter als im Druck und braeche zu frueh um.
 * Rueckgabe: Anzahl gesetzter Zeilen. */
function drawFormelAbsatz(doc, text, x, y, maxBreite, zeilenAbstand, opts) {
  const o = opts || {};
  const basis = o.fontSize || doc.getFontSize();
  const abstand = zeilenAbstand || basis / doc.internal.scaleFactor * 1.15;
  const woerter = String(text === undefined || text === null ? '' : text).split(/\s+/).filter(Boolean);
  let zeile = '';
  let zeilen = 0;
  let cy = y;

  const setze = function (z) {
    drawFormel(doc, z, x, cy, { fontSize: basis, align: o.align });
    cy += abstand;
    zeilen++;
  };

  woerter.forEach(function (wort) {
    const test = zeile ? zeile + ' ' + wort : wort;
    if (zeile && formelBreite(doc, test, basis) > maxBreite) {
      setze(zeile);
      zeile = wort;
    } else {
      zeile = test;
    }
  });
  if (zeile) setze(zeile);
  return zeilen;
}

/* ---------------------------------------------------------------------------
 *  FORMELSATZ IN autoTable-ZELLEN
 * ---------------------------------------------------------------------------
 *  autoTable zeichnet Zellentexte selbst und kennt kein Markup. Deshalb wird
 *  der Text der betroffenen Zellen kurz vor dem Zeichnen stillgelegt und
 *  danach von Hand gesetzt - mit exakt derselben Grundlinien- und
 *  Ausrichtungslogik, die autoTable intern verwendet. Der Umbruch stammt
 *  weiterhin von autoTable; gemessen wird dort das Markup, das minimal
 *  breiter rechnet als der spaetere Druck - Zellen werden dadurch nie zu
 *  schmal, hoechstens einen Hauch grosszuegig.
 *
 *  Benutzung an der Aufrufstelle:
 *      doc.autoTable(mitFormelHooks(doc, { head: ..., body: ..., ... }));
 *  Vorhandene eigene Hooks bleiben erhalten und werden zuerst ausgefuehrt.
 * ------------------------------------------------------------------------ */

// Textposition einer Zelle - autoTable ab 3.5 liefert sie selbst.
function formelZellenTextPos(zelle) {
  if (typeof zelle.getTextPos === 'function') return zelle.getTextPos();
  // Rueckfallebene, falls die autoTable-Version die Methode nicht kennt.
  const p = zelle.padding ? zelle.padding.bind(zelle) : function () { return 0; };
  const st = zelle.styles || {};
  let y;
  if (st.valign === 'top') y = zelle.y + p('top');
  else if (st.valign === 'bottom') y = zelle.y + zelle.height - p('bottom');
  else y = zelle.y + (zelle.height - p('vertical')) / 2 + p('top');
  let x;
  if (st.halign === 'right') x = zelle.x + zelle.width - p('right');
  else if (st.halign === 'center') x = zelle.x + zelle.width / 2;
  else x = zelle.x + p('left');
  return { x: x, y: y };
}

function zeichneFormelZelle(doc, zelle) {
  const zeilen = zelle.__formelZeilen;
  if (!zeilen) return;
  delete zelle.__formelZeilen;

  const st = zelle.styles || {};
  const groesse = st.fontSize || doc.getFontSize();
  doc.setFont(st.font || 'helvetica', st.fontStyle || 'normal');
  doc.setFontSize(groesse);
  const farbe = st.textColor;
  if (Array.isArray(farbe)) doc.setTextColor(farbe[0], farbe[1], farbe[2]);
  else if (farbe !== undefined && farbe !== null) doc.setTextColor(farbe);

  const k = doc.internal.scaleFactor;
  const zh = groesse / k;                    // autoTable setzt Zeilen im Abstand der Schriftgroesse
  const pos = formelZellenTextPos(zelle);
  const anzahl = zeilen.length || 1;

  // Grundlinie exakt wie in autoTableText(): y + fontSize * (2 - 1.15)
  let y = pos.y + zh * 0.85;
  if (st.valign === 'middle') y -= (anzahl / 2) * zh;
  else if (st.valign === 'bottom') y -= anzahl * zh;

  zeilen.forEach(function (z) {
    drawFormel(doc, z, pos.x, y, { fontSize: groesse, align: st.halign });
    y += zh;
  });
}

function mitFormelHooks(doc, optionen) {
  const opt = Object.assign({}, optionen || {});
  const eigenesParse = opt.didParseCell;
  const eigenesWill = opt.willDrawCell;
  const eigenesDid = opt.didDrawCell;

  /* SCHRITT 1 (didParseCell, vor der Breitenberechnung):
   * Das Markup wird aus dem Zellentext herausgenommen und in einer kleinen
   * Karte "Klartext -> Markup" gemerkt. autoTable rechnet und bricht dadurch
   * mit dem KLARTEXT um ("RPE" statt "R_{PE}"). Das ist entscheidend: die
   * geschweiften Klammern haetten die Spaltenkoepfe kuenstlich verbreitert
   * und zusaetzliche Umbrueche erzwungen. Der Klartext ist minimal breiter
   * als der spaetere Formelsatz (der Index ist kleiner) - Zellen werden also
   * nie zu schmal. */
  opt.didParseCell = function (data) {
    if (eigenesParse) eigenesParse(data);
    const zelle = data.cell;
    if (!zelle || !Array.isArray(zelle.text) || !zelle.text.some(hatFormel)) return;
    const karte = {};
    zelle.text = zelle.text.map(function (zeile) {
      return zeile.split(/(\s+)/).map(function (wort) {
        if (!hatFormel(wort)) return wort;
        const klar = formelKlartext(wort);
        if (karte[klar] === undefined) karte[klar] = wort;
        return klar;
      }).join('');
    });
    zelle.__formelKarte = karte;
  };

  /* SCHRITT 2 (willDrawCell, nach dem Umbruch):
   * Die umbrochenen Klartextzeilen bekommen ihr Markup zurueck, und die
   * Standardausgabe wird stillgelegt. */
  opt.willDrawCell = function (data) {
    let r;
    if (eigenesWill) r = eigenesWill(data);
    if (r === false) return false;
    const zelle = data.cell;
    if (zelle && zelle.__formelKarte && Array.isArray(zelle.text)) {
      const karte = zelle.__formelKarte;
      /* Die umbrochenen Klartextzeilen einmal sichern. Ein Tabellenkopf wird
       * auf JEDER Folgeseite erneut gezeichnet - ohne diese Sicherung waere er
       * ab Seite 2 leer, weil zelle.text unten stillgelegt wird. */
      if (zelle.__formelKlarZeilen === undefined) zelle.__formelKlarZeilen = zelle.text.slice();
      zelle.__formelZeilen = zelle.__formelKlarZeilen.map(function (zeile) {
        return zeile.split(/(\s+)/).map(function (wort) {
          return karte[wort] !== undefined ? karte[wort] : wort;
        }).join('');
      });
      // Leerzeile statt [] - autoTable zeichnet dann nichts, stolpert aber
      // auch nicht ueber einen leeren Array.
      zelle.text = [''];
    }
    return r;
  };

  // SCHRITT 3 (didDrawCell): Formelsatz von Hand, in Rahmen und Fuellung hinein.
  opt.didDrawCell = function (data) {
    if (data.cell && data.cell.__formelZeilen) zeichneFormelZelle(doc, data.cell);
    if (eigenesDid) return eigenesDid(data);
  };

  return opt;
}

/* ---------------------------------------------------------------------------
 *  WERTE SICHER IN HTML-ATTRIBUTE SCHREIBEN
 * ---------------------------------------------------------------------------
 *  Die Stromkreis-, Uebergabepunkt- und Geraetekarten werden ueber innerHTML
 *  aufgebaut. Ein Anfuehrungszeichen im Wert beendet dort das Attribut - aus
 *  'Steckdose "Regie" 3/4' wurde beim Wiederherstellen 'Steckdose ', der Rest
 *  landete als HTML-Attribute im Dokument. Anfuehrungszeichen sind in
 *  Buehnenbezeichnungen alltaeglich ('Traverse "Portal links"', '2" Rohr').
 *  Ausserdem waere eine Bezeichnung mit <img onerror=...> beim Wiederherstellen
 *  ausgefuehrt worden.
 * ------------------------------------------------------------------------ */
function attrEsc(wert) {
  return String(wert === undefined || wert === null ? '' : wert)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Vorgabewert nur setzen, wenn im Zwischenspeicher GAR NICHTS steht.
 * Mit "data.qs || '1.5 mm2'" bekam ein bewusst geleertes Feld beim
 * Wiederherstellen den Vorgabewert zurueck. */
function attrEscOderVorgabe(wert, vorgabe) {
  return attrEsc(wert === undefined ? vorgabe : wert);
}

/* ---------------------------------------------------------------------------
 *  DATUM IMMER AUS DER LOKALEN ZEIT
 * ---------------------------------------------------------------------------
 *  input.valueAsDate = new Date() und new Date().toISOString() rechnen beide
 *  in UTC. In Mitteleuropa liegen die ersten ein bis zwei Stunden des Tages
 *  damit noch im Vortag: eine Pruefung nach der Vorstellung um 00:30 Uhr bekam
 *  das Datum und die Protokollnummer des Vortags. Im Theater ist das der
 *  Normalfall, nicht der Sonderfall.
 * ------------------------------------------------------------------------ */
function heuteIso(datum) {
  var d = datum || new Date();
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

// Monatswert (YYYY-MM) fuer ein Datum, das um n Jahre in der Zukunft liegt.
function monatIsoInJahren(n) {
  var d = new Date();
  d.setFullYear(d.getFullYear() + (n || 0));
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

/* "JJJJ-MM" (Wert eines <input type="month">) -> "MM / JJJJ".
 * Ein leerer oder unerwarteter Wert bleibt unveraendert. */
function formatMonat(isoMonat) {
  var m = String(isoMonat === undefined || isoMonat === null ? '' : isoMonat).trim();
  if (!m) return '';
  var teile = m.split('-');
  if (teile.length !== 2) return m;
  return teile[1] + ' / ' + teile[0];
}

// Setzt ein <input type="date"> auf das heutige LOKALE Datum.
function datumsfeldAufHeute(id) {
  var el = document.getElementById(id);
  if (el) el.value = heuteIso();
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
    drawTextF(doc, label, x + 4, y);
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

/* ---------------------------------------------------------------------------
 *  KARTEN NACH LOESCHEN LUECKENLOS NEU DURCHNUMMERIEREN
 * ---------------------------------------------------------------------------
 *  FRUEHER zeigte jede Karte im Header "Stromkreis #N" mit N = cardCounter
 *  ZUM ZEITPUNKT DER ERSTELLUNG. cardCounter wird beim Loeschen nie wieder
 *  heruntergezaehlt (das darf er auch nicht - er liefert die eindeutige DOM-
 *  ID 'circuit_N' fuer onclick-Handler). Wurde z. B. Stromkreis 2 geloescht,
 *  blieben die sichtbaren Nummern 1, 3, 4, ... stehen - keine fortlaufende
 *  Reihenfolge mehr, obwohl im Protokoll (PDF-Spalte "Nr.") ohnehin lueckenlos
 *  1, 2, 3 gezaehlt wird.
 *
 *  JETZT: nummeriereKartenNeu() aendert NUR den sichtbaren Text im Header
 *  (z. B. "Stromkreis #2"), NICHT die interne DOM-ID/den cardCounter - die
 *  bleiben fuer onclick="removeCard('circuit_7')" etc. unveraendert gueltig.
 *  Wird nach jedem Hinzufuegen/Entfernen/Wiederherstellen aufgerufen. */
/* Konfiguration je Formulartyp - Container-ID -> {kartenSelector, praefix}.
 * removeCard() schlaegt hier nach, WELCHE Nummerierung fuer den Container
 * gilt, aus dem gerade eine Karte entfernt wurde. */
const KARTEN_NUMMERIERUNG = {
  '#circuitsContainer': { kartenSelector: '.circuit-card', praefix: 'Stromkreis' },
  '#feedsContainer': { kartenSelector: '.feed-card', praefix: 'Übergabepunkt' },
  '#devicesContainer': { kartenSelector: '.feed-card', praefix: 'Gerät' }
};

function nummeriereKartenNeu(containerSelector, kartenSelector, praefix) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const karten = container.querySelectorAll(kartenSelector);
  karten.forEach((karte, i) => {
    const label = karte.querySelector('.circuit-header span, .feed-header span');
    if (label) label.textContent = praefix + ' #' + (i + 1);
  });
}

function removeCard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const container = el.parentElement;
  el.remove();
  if (container && typeof KARTEN_NUMMERIERUNG !== 'undefined') {
    const cfg = KARTEN_NUMMERIERUNG['#' + container.id];
    if (cfg) nummeriereKartenNeu('#' + container.id, cfg.kartenSelector, cfg.praefix);
  }
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

/* ---------------------------------------------------------------------------
 *  AUTOSAVE ENTPRELLEN
 * ---------------------------------------------------------------------------
 *  Die Formulare haengen autosaveProtocol an das 'input'-Ereignis. Bisher las
 *  damit JEDER EINZELNE TASTENDRUCK das komplette Formular aus, baute ein JSON
 *  und schrieb es synchron in den localStorage. Bei zwei Stromkreiskarten
 *  faellt das nicht auf. Bei 40 Karten sind das rund 500 Felder pro Anschlag -
 *  auf einem Baustellen-Tablet wird die Eingabe spuerbar zaeh, auf aelteren
 *  Geraeten unbenutzbar. Genau die grossen Anlagen, fuer die sich die App
 *  lohnt, waren am langsamsten.
 *
 *  400 ms Verzoegerung: fuer den Datenverlust-Schutz voellig ausreichend
 *  (gespeichert wird, sobald die Person kurz innehaelt), fuer die Tippgefuehl
 *  ist der Unterschied vollstaendig. Vor dem Erzeugen eines PDF und beim
 *  Verlassen der Seite wird zusaetzlich sofort geschrieben.
 * ------------------------------------------------------------------------ */
function entprellt(fn, ms) {
  var timer = null;
  var wrapped = function () {
    var args = arguments, self = this;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { timer = null; fn.apply(self, args); }, ms || 400);
  };
  // Sofort schreiben, ohne auf die Verzoegerung zu warten.
  wrapped.sofort = function () {
    if (timer) { clearTimeout(timer); timer = null; }
    fn();
  };
  return wrapped;
}

/* Haengt Autosave entprellt an ein Formular und sorgt dafuer, dass beim
 * Verlassen der Seite nichts verlorengeht. */
function autosaveAnhaengen(formId, speichern) {
  var form = document.getElementById(formId);
  if (!form) return speichern;
  var e = entprellt(speichern, 400);
  form.addEventListener('input', e);
  form.addEventListener('change', e);

  /* 4.5.0 (D1): Dezimalkomma auch auf dem Bildschirm.
   * Wer "0.11" tippt, sieht nach dem Verlassen des Feldes "0,11" - genau das,
   * was spaeter im PDF steht. Umgestellt wird nur ein Punkt ZWISCHEN Ziffern
   * und nur in Zahlenfeldern (inputmode="decimal"); Freitextfelder,
   * Typbezeichnungen und Datumsangaben bleiben unangetastet. Alle
   * Auswertungsfunktionen rechnen ohnehin bereits mit Komma. */
  form.addEventListener('focusout', function (ev) {
    var el = ev.target;
    if (!el || el.tagName !== 'INPUT') return;
    if (el.getAttribute('inputmode') !== 'decimal') return;
    var neu = kommaZahl(el.value);
    if (neu !== el.value) { el.value = neu; e(); }
  });

  window.addEventListener('pagehide', function () { e.sofort(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') e.sofort();
  });
  return e;
}

// MINDEST-KURZSCHLUSSSTROM FÜR SICHERES AUSLÖSEN DER ÜBERSTROMSCHUTZEINRICHTUNG
// (oberer Auslösebereich der Charakteristik: B=5x, C=10x, D=20x In, nach DIN VDE 0100-410)
/* SCHMELZSICHERUNGEN (gG/gL, NH, Diazed/Neozed) HABEN KEINE FESTE KENNLINIE
 * IM SINNE VON 5x/10x/20x I_n. Ihr Ausloesestrom fuer 0,4 s ergibt sich aus der
 * Herstellerkennlinie und liegt je nach Nennstrom etwa beim 4- bis 10-fachen.
 * Frueher lieferte getMinIk() hier stillschweigend null: es fand KEINE
 * Bewertung von I_K und Z_S statt, und das Protokoll sagte nicht, dass keine
 * stattfand - die Zelle blieb unauffaellig schwarz. Auf einer Open-Air-
 * Einspeisung mit NH-Vorsicherung war das der Regelfall. */
function istSchmelzsicherung(sicherungText) {
  return /\b(gG|gL|gl|NH|Diazed|Neozed|D0|DII|DIII|Schmelz)\b/i.test(String(sicherungText || ''));
}

/* [Befund N3] Fruehere Fassung erkannte die B/C/D-Charakteristik nur, wenn
 * Buchstabe+Zahl am ANFANG der Zeichenkette standen (^([BCD])\s*([\d.,]+)).
 * Schreibweisen mit Zusatztext davor - "LS B16", "B16A, 3-polig" - oder mit
 * vertauschter Reihenfolge - "16 A Typ B" - wurden dadurch nicht erkannt, und
 * die App bewertete Z_S/I_K in diesem Fall stillschweigend gar nicht, ohne das
 * im Protokoll kenntlich zu machen. Jetzt wird an BELIEBIGER Stelle im Text
 * gesucht, in beiden ueblichen Reihenfolgen:
 *   - Buchstabe vor der Zahl:  "B16", "LS B 16", "Typ B16A"
 *   - Zahl vor dem Buchstaben: "16 A Typ B", "16A Typ B, 3-polig"
 * Wortgrenzen (\b) verhindern, dass B/C/D aus anderen Woertern (z. B. "Bau",
 * "CEE") faelschlich als Charakteristik gelesen wird. */
function getMinIk(sicherungText) {
  const info = sicherungCharakteristik(sicherungText);
  if (!info) return null;
  const multiplier = { B: 5, C: 10, D: 20 }[info.buchstabe];
  return multiplier ? multiplier * info.rating : null;
}

/* Sagt, ob die Absicherung ANGEGEBEN, aber WEDER als Schmelzsicherung NOCH
 * als B/C/D-Charakteristik erkannt wurde. Genau dieser Fall durfte bisher
 * unbemerkt bleiben: die App zeigte nur einen unauffaelligen Platzhaltertext
 * und erzeugte das PDF trotzdem, ohne dass Z_S/I_K in diesem Stromkreis
 * tatsaechlich bewertet wurden. */
function istAbsicherungUnbekannt(sicherungText) {
  const text = String(sicherungText || '').trim();
  if (!text) return false;
  if (istSchmelzsicherung(text)) return false;
  return sicherungCharakteristik(text) === null;
}

/* Liefert { buchstabe, rating } wenn eine B/C/D-Charakteristik mit Nennstrom
 * gefunden wird, sonst null. Zentral, damit Bewertung (getMinIk/getMaxZs) und
 * die "nicht erkannt"-Kennzeichnung im PDF exakt dieselbe Erkennung nutzen.
 * Schmelzsicherungen (Diazed/Neozed/NH/gG/gL) haben Vorrang: "Diazed D2 20A"
 * enthaelt zwar ein "D2", ist aber keine D-Charakteristik - istSchmelzsicherung()
 * wird deshalb zuerst geprueft. */
function sicherungCharakteristik(sicherungText) {
  const text = String(sicherungText || '').trim();
  if (!text || istSchmelzsicherung(text)) return null;
  // Reihenfolge 1: Buchstabe direkt vor der Zahl, ggf. mit Zusatztext davor
  // ("B16", "Typ B16A", "LS B16", "B16A, 3-polig", "LS-B16").
  let match = text.match(/\b([BCD])\s*([\d]+(?:[.,]\d+)?)\s*A?\b/i);
  if (!match) {
    // Reihenfolge 2: Zahl vor dem Buchstaben ("16 A Typ B", "16A Typ B, 3-polig").
    const m2 = text.match(/\b([\d]+(?:[.,]\d+)?)\s*A\b.{0,20}?\b([BCD])\b/i);
    if (m2) match = [m2[0], m2[2], m2[1]];
  }
  if (!match) {
    // Reihenfolge 1b: Buchstabe und Zahl getrennt durch Komma/Doppelpunkt,
    // Zahl mit Einheit "A" ("Typ B, 16 A"). Enger gefasst als 1/2, damit z. B.
    // "16A Typ B, 3-polig" nicht ueber diesen Zweig die "3" aus "3-polig" als
    // Nennstrom nimmt.
    match = text.match(/\b([BCD])\b\s*[,:]\s*([\d]+(?:[.,]\d+)?)\s*A\b/i);
  }
  if (!match) return null;
  const rating = parseMesswert(match[2]);
  if (isNaN(rating) || rating <= 0) return null;
  return { buchstabe: match[1].toUpperCase(), rating: rating };
}

// NENNSPANNUNG AUSSENLEITER GEGEN ERDE (Grundlage aller Ik-Berechnungen)
const U_NULL = 230;

/* ZULAESSIGE SCHLEIFENIMPEDANZ AUS DER ABSICHERUNG
 * Zs_max = U_0 / I_a  -  I_a ist der Strom der magnetischen Schnellausloesung
 * (5x I_n bei B, 10x bei C, 20x bei D). Das ist dieselbe Grundlage wie getMinIk(),
 * nur nach Zs statt nach Ik aufgeloest.
 * Der 2/3-Wert ist der in der Praxis uebliche Sicherheitsabschlag fuer
 * Messunsicherheit und Leitungserwaermung - er ist ein HINWEIS, keine Grenze. */
function getMaxZs(sicherungText) {
  const minIk = getMinIk(sicherungText);
  if (minIk === null || minIk <= 0) return null;
  return U_NULL / minIk;
}

/* Der 2/3-Wert war bisher nur ein Kommentar. Jetzt gibt es ihn wirklich:
 * liegt Z_S zwischen 2/3 x Z_S,max und Z_S,max, ist der Wert zwar zulaessig,
 * aber ohne Reserve fuer Messunsicherheit und Leitungserwaermung im
 * Betriebszustand. Das ist ein HINWEIS (gelb), keine Beanstandung (rot). */
function getZsHinweisgrenze(sicherungText) {
  const maxZs = getMaxZs(sicherungText);
  return maxZs === null ? null : maxZs * (2 / 3);
}

function zsOhneReserve(zsText, sicherungText) {
  const grenze = getZsHinweisgrenze(sicherungText);
  const maxZs = getMaxZs(sicherungText);
  if (grenze === null || maxZs === null) return false;
  const z = parseMesswert(String(zsText || ''));
  return !isNaN(z) && z > grenze && z <= maxZs;
}

/* RUECKWAERTSPLAUSIBILITAET DER AUSLOESEZEIT
 * Eine Ausloesezeit von 210 ms bei angegebenem Pruefstrom 5x I_dn ist zwar
 * unzulaessig, aber vor allem ist sie unwahrscheinlich: 210 ms ist ein
 * typischer Wert fuer eine Messung mit 1x I_dn. Der haeufigste Fehler ist
 * nicht der defekte RCD, sondern der falsch angegebene Pruefstrom. Statt nur
 * "zu hoch" zu melden, wird darauf hingewiesen.
 * Rueckgabe: der Pruefstrom, zu dem der Wert besser passt - oder null. */
function passenderPruefstromFuerTa(taText, pruefstrom, istSelektiv) {
  const ta = parseMesswert(String(taText || ''));
  if (isNaN(ta) || ta <= 0) return null;
  const gemeldet = String(pruefstrom || '').replace(/[^\d]/g, '');
  if (!gemeldet) return null;
  const grenzen = istSelektiv ? { '5': 150, '2': 200, '1': 500 } : { '5': 40, '2': 150, '1': 300 };
  // Der Wert ueberschreitet die Grenze des gemeldeten Pruefstroms nicht -> alles gut.
  if (ta <= grenzen[gemeldet]) return null;
  // Kleinster Pruefstrom, dessen Grenzwert der Messwert einhalten wuerde.
  const passend = ['5', '2', '1'].filter(f => ta <= grenzen[f]);
  return passend.length ? passend[passend.length - 1] : null;
}

/* KURZSCHLUSSSTROM AUS DER IMPEDANZ - identisch zur Anzeige "PFC" am Fluke 1663:
 * das Geraet misst Z aus dem Spannungseinbruch unter Prueflast und rechnet I = U/Z. */
function ikAusImpedanz(impedanzText, uNenn = U_NULL) {
  if (impedanzText === undefined || impedanzText === null) return null;
  const z = parseMesswert(String(impedanzText));
  if (isNaN(z) || z <= 0) return null;
  return Math.round(uNenn / z);
}

/* PLAUSIBILITAET VON Z UND I_K
 * Beide Werte beschreiben dieselbe Messung (I = U/Z). Stehen sie im Protokoll
 * nebeneinander und passen nicht zusammen, ist einer von beiden falsch
 * abgetippt - das faellt sonst niemandem auf. Toleranz 25 %: das Messgeraet
 * rechnet mit der tatsaechlich gemessenen Spannung und rundet die Anzeige.
 * Rueckgabe: true = plausibel oder nicht pruefbar (ein Wert fehlt). */
const Z_IK_TOLERANZ = 0.25;

function zIkPlausibel(impedanzText, stromText, uNenn = U_NULL) {
  const erwartet = ikAusImpedanz(impedanzText, uNenn);
  if (erwartet === null) return true;
  const ist = parseMesswert(String(stromText || ''));
  if (isNaN(ist) || ist <= 0) return true;
  return Math.abs(ist - erwartet) / erwartet <= Z_IK_TOLERANZ;
}

/* Z -> I_K AUTOMATISCH RECHNEN (Anlagen- UND Anschlusspruefung)
 * Der berechnete Wert wird mit data-auto markiert. Sobald die pruefende Person
 * selbst etwas eintraegt, faellt die Markierung weg und der Wert wird nicht
 * mehr ueberschrieben - ein am Messgeraet abgelesener Wert hat immer Vorrang
 * vor der Rechnung. Lag frueher nur in pdf-generator.js und stand der
 * Anschlusspruefung deshalb nicht zur Verfuegung. */
function koppleImpedanzMitStrom(card, zSelektor, iSelektor) {
  const zEl = card.querySelector(zSelektor);
  const iEl = card.querySelector(iSelektor);
  if (!zEl || !iEl) return;
  if (iEl.value.trim() !== '' && iEl.dataset.auto !== '1') return;
  const ik = ikAusImpedanz(zEl.value);
  if (ik === null) {
    if (iEl.dataset.auto === '1') { iEl.value = ''; delete iEl.dataset.auto; }
    return;
  }
  iEl.value = String(ik);
  iEl.dataset.auto = '1';
}

/* Markiert Impedanz und Strom, wenn sie rechnerisch nicht zueinander passen.
 * Rueckgabe: false = Widerspruch. */
function zsIkPaarPruefen(card, zSelektor, iSelektor) {
  const zEl = card.querySelector(zSelektor);
  const iEl = card.querySelector(iSelektor);
  if (!zEl || !iEl) return true;
  const ok = zIkPlausibel(zEl.value, iEl.value);
  [zEl, iEl].forEach(el => el.classList.toggle('wert-widerspruch', !ok));
  return ok;
}

/* GRENZWERT DER BERUEHRUNGSSPANNUNG U_L
 * Normalbereich 50 V AC / 120 V DC, bei erhoehter Gefaehrdung 25 V AC / 60 V DC
 * (Buehne, Open Air, feuchte oder leitfaehige Umgebung, Baustelle). */
function getUlGrenzwert(art, gefaehrdung) {
  const erhoeht = gefaehrdung === 'erhoeht';
  if (art === 'DC') return erhoeht ? 60 : 120;
  return erhoeht ? 25 : 50;
}

function getUlText(art, gefaehrdung) {
  return `≤ ${getUlGrenzwert(art, gefaehrdung)} V ${art === 'DC' ? 'DC' : 'AC'}`;
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
    const kw = parseMesswert(String(heizleistungKw));
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
  // 4.5.0 (D1): Zahlenwerte der RCD-Zelle mit Dezimalkomma.
  const idn = kommaZahl(String(roh.idn || '').trim());
  const imess = kommaZahl(String(roh.imess || '').trim());
  const ta = kommaZahl(String(roh.ta || '').trim());
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
    zeilen.push(`Messung unvollständig (${!hatImess ? 'I_{Δmess}' : 't_{A}'} fehlt)`);
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

/* ---------------------------------------------------------------------------
 *  VIERTER WIDERSPRUCHSPFAD: PRUEFLING OHNE JEDE MESSUNG
 * ---------------------------------------------------------------------------
 *  Die App fing bisher ab, dass ein Protokoll GAR KEINEN Pruefling enthaelt
 *  ("Ein Protokoll ohne einen einzigen Stromkreis ist keine Pruefung"). Ein
 *  Stromkreis ohne einen einzigen Messwert ist es aber genauso wenig - und
 *  beide Formulare legen beim Start automatisch leere Karten an.
 *
 *  Wer nur die Stammdaten ausfuellt und auf "PDF erzeugen" tippt, bekam
 *  deshalb ein vollstaendiges Protokoll: "Keine Mängel festgestellt",
 *  "Prüfplakette erteilt: Ja", "Sicherer Gebrauch gewährleistet" - ueber eine
 *  Anlage, an der nachweislich nichts gemessen wurde. Das ist genau der Fall,
 *  vor dem alle anderen Widerspruchspruefungen schuetzen sollen.
 *
 *  Dieselbe Regel wie beim RCD (siehe buildRcdZelle, Regel 3): eine Messung,
 *  die nicht stattgefunden hat, darf nicht als bestanden erscheinen.
 * ------------------------------------------------------------------------ */
function istLeerWert(v) {
  const t = String(v === undefined || v === null ? '' : v).trim();
  return t === '' || t === '-';
}

/* Liefert die 1-basierten Nummern aller Karten, in denen KEIN einziges der
 * angegebenen Messfelder gefuellt ist.
 *
 * totgelegtSelektor (optional): eine Karte, die als "totgelegt/Mangel
 * festgestellt" markiert ist (siehe toggleTotlegung() in pdf-generator.js),
 * wird von dieser Pruefung ausgenommen. Ein freigeschalteter, nicht in
 * Betrieb befindlicher Stromkreis hat DEFINITIONSGEMAESS keine Messwerte -
 * das darf den PDF-Export nicht blockieren, sonst waere eine dokumentierte
 * Totlegung technisch gar nicht moeglich. */
function prueflingeOhneMessung(karten, messSelektoren, totgelegtSelektor) {
  const leer = [];
  Array.from(karten).forEach((card, i) => {
    const totEl = totgelegtSelektor ? card.querySelector(totgelegtSelektor) : null;
    // Unterstuetzt sowohl die alte Checkbox (.checked) als auch das aktuelle
    // i.O./n.i.O.-Auswahlfeld (siehe istTotgelegt() in pdf-generator.js) -
    // ohne harte Abhaengigkeit von pdf-generator.js an dieser Stelle.
    const istTot = totEl && (totEl.type === 'checkbox' ? totEl.checked : String(totEl.value || '').trim() === 'n.i.O.');
    if (istTot) return;
    const hatEinen = messSelektoren.some(sel => !istLeerWert(card.querySelector(sel)?.value));
    if (!hatEinen) leer.push(i + 1);
  });
  return leer;
}

function ohneMessungMelden(nummern, bezeichnung) {
  alert('Ohne Messwerte ist das kein Prüfprotokoll:\n\n' +
    (nummern.length === 1 ? `${bezeichnung} ${nummern[0]} enthält` : `${bezeichnung} ${nummern.join(', ')} enthalten`) +
    ' keinen einzigen Messwert.\n\n' +
    'Ein Protokoll, das "keine Mängel" und eine Prüfplakette bescheinigt, obwohl an dieser Stelle nichts ' +
    'gemessen wurde, ist als Nachweis wertlos und im Streitfall angreifbar.\n\n' +
    'Bitte die Messwerte eintragen – oder die leere Karte entfernen, wenn es diesen Prüfling nicht gibt.\n\n' +
    'Das PDF wurde deshalb nicht erstellt.');
}

/* DRITTER WIDERSPRUCHSPFAD: PLAKETTE TROTZ BEANSTANDUNG
 * Die Pruefplakette bescheinigt nach aussen die bestandene Pruefung - sie ist
 * das Einzige, was am Geraet oder an der Verteilung sichtbar bleibt, wenn das
 * Protokoll im Ordner liegt. Ein Protokoll, das Maengel feststellt und
 * gleichzeitig "Plakette erteilt: Ja" ankreuzt, stellt eine Plakette aus, die
 * an der Anlage das Gegenteil dessen behauptet, was im Dokument steht.
 * Beim Feld "Sicherer Gebrauch" wurde dieser Widerspruch bereits abgefangen,
 * bei der Plakette nicht. */
function plaketteWidersprichtBefund(isBlank, hasIssues, plaketteWert) {
  return !isBlank && hasIssues && String(plaketteWert || '') === 'Ja';
}

function plaketteWiderspruchHinweis() {
  return 'Widerspruch im Prüfergebnis:\n\n' +
    'Das Protokoll enthält Beanstandungen (Mängel, unzulässige Messwerte oder ein n.i.O.-Ergebnis), ' +
    'gleichzeitig steht "Prüfplakette erteilt" auf "Ja".\n\n' +
    'Die Plakette bescheinigt an der Anlage die bestandene Prüfung. Sie darf erst erteilt werden, ' +
    'wenn die Beanstandungen ausgeräumt und nachgemessen sind.\n\n' +
    'Das PDF wurde deshalb nicht erstellt.';
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
// DANACH +0,1 Ohm JE ANGEFANGENE 7,5m (Prüfstrom mind. 200mA).
// DIN EN 50699 begrenzt den zulässigen Wert unabhängig von der Leitungslänge
// grundsätzlich auf 1,0 Ohm - bei langen Kabelwegen (Kabeltrommeln,
// Verlängerungen über 50-100 m auf Open-Air-Flächen) würde die Formel ohne
// diesen Deckel sonst Werte weit über der Norm freigeben.
const RPE_DEVICE_DECKEL = 1.0;
function getRpeMaxDevice(lengthM) {
  const len = parseMesswert(String(lengthM));
  if (isNaN(len) || len <= 5) return 0.3;
  return Math.min(RPE_DEVICE_DECKEL, 0.3 + Math.ceil((len - 5) / 7.5) * 0.1);
}

// ---------------------------------------------------------------------------
// GEMEINSAMER PDF-KOPF UND -FUSS FUER ALLE DREI PROTOKOLLTYPEN
// ---------------------------------------------------------------------------
// Die Infobox oben rechts beginnt bei x = 125 mm, ihr Text bei x = 128 mm.
// Der Titel startet bei x = PDF_MARGIN_LEFT (20 mm, 4.7.0) -> nutzbar sind 102 mm. Frueher waren Titel
// und Normzeile mit fester Schriftgroesse gesetzt; bei den laengeren Titeln der
// Anschluss- und Geraetepruefung lief der Text in die Box und ueberdruckte sie
// zeichenweise. drawFittedText verkleinert stattdessen so weit noetig.

const PDF_HEADER_BOX_X = 125;      // linke Kante der Infobox
const PDF_TITLE_MAX_WIDTH = 102;   // 4.7.0: linker Rand jetzt 20 mm (vorher 10) bis 3 mm vor der Box - Breite entsprechend um 10 mm reduziert
const PDF_PRIMARY = [0, 51, 102];
const PDF_TEXT = [15, 23, 42];
const PDF_MUTED = [71, 85, 105];
/* 4.7.0: Kontrast von Umrandungen, Tabellenlinien und Eintragelinien erhöht -
 * die vorherigen hellen Grautöne ([203,213,225] / [148,163,184]) waren auf
 * Papier (v. a. bei einfachen Laserdruckern/Kopien) zu blass ablesbar.
 * PDF_TABLE_LINE ersetzt die frueher an mehreren Stellen wiederholte
 * Literalfarbe [203, 213, 225] in den lineColor-Angaben der Tabellen. */
const PDF_BOX_BORDER = [100, 116, 139];
const PDF_RED_TEXT = [153, 27, 27];
const PDF_LINE = [71, 85, 105];    // Farbe der Eintragelinien im Leerformular
const PDF_TABLE_LINE = [100, 116, 139];

/* ---------------------------------------------------------------------------
 *  SEITENGEOMETRIE - EINE ZENTRALE STELLE FUER ALLE PROTOKOLLE
 * ---------------------------------------------------------------------------
 *  Der Kopf (Titel + Normzeile + Trennlinie) belegt auf JEDER Seite den
 *  Bereich bis y = 20 mm. Inhalte duerfen deshalb nie oberhalb von
 *  PDF_CONTENT_TOP beginnen - fruehere Umbrueche setzten y = 15 und liefen
 *  dadurch in Titel und Trennlinie hinein.
 * ------------------------------------------------------------------------ */
/* 4.7.0: linker Rand auf 20 mm vergroessert (vorher 10 mm) - die Protokolle
 * werden von Hendrik gelocht und abgeheftet; ein Standard-Locher setzt seine
 * Loecher mit Mittelpunkt bei ca. 12-15 mm vom Blattrand (Lochdurchmesser
 * ca. 8 mm), sodass bei 10 mm Rand Text/Rahmenlinien angeschnitten worden
 * waeren. Der rechte Rand bleibt bei 10 mm (dort wird nicht gelocht). */
const PDF_MARGIN_LEFT = 20;
const PDF_MARGIN_RIGHT = 10;
const PDF_CONTENT_WIDTH = 180;     // 210 mm - 20 mm (links) - 10 mm (rechts)
const PDF_CONTENT_TOP = 25;        // erste Zeile unter der Kopf-Trennlinie
const PDF_CONTENT_BOTTOM = 283;    // letzte nutzbare Zeile ueber der Fusszeile
const PDF_FOOTER_Y = 291;

/* ---------------------------------------------------------------------------
 *  FUSSBEREICH DES LEERFORMULARS - LEGENDE AUF JEDEM BLATT  (4.5.0, Befund C4)
 * ---------------------------------------------------------------------------
 *  VORHER: Legende, Musterzeile und Sollwerte standen in 4,6 pt (rund 1,6 mm
 *  Schrifthoehe) und AUSSCHLIESSLICH auf Blatt 1. Die Fortsetzungsblaetter
 *  trugen denselben Tabellenkopf mit denselben Formelzeichen (I_a, Z_S, I_Δn,
 *  t_A, U_mess) und keinerlei Erklaerung - fuer Auszubildende im ersten
 *  Lehrjahr endete das Ausfuellen genau dort.
 *
 *  JETZT: 6 pt (absolute Untergrenze fuer Fussnoten) und auf JEDEM Blatt.
 *  Der Block waechst von unten nach oben, damit er nie in die Fusszeile
 *  laeuft, egal wie viele Zeilen er braucht.
 * ------------------------------------------------------------------------ */
const LEER_FUSS_PT      = 6;      // Schriftgroesse der Fussnoten
const LEER_FUSS_ZEILE   = 2.9;    // mm Zeilenabstand
const LEER_FUSS_UNTEN   = 287;    // Grundlinie der letzten Fussnotenzeile (Fusszeile 291)

/* Zeilenumbruch eines Formeltextes, ohne zu zeichnen. Gleiche Logik wie
 * drawFormelAbsatz - nur so stimmt die vorab berechnete Zeilenzahl mit dem
 * spaeteren Satz ueberein. */
function formelZeilenUmbrechen(doc, text, maxBreite, basis) {
  const woerter = String(text === undefined || text === null ? '' : text).split(/\s+/).filter(Boolean);
  const zeilen = [];
  let zeile = '';
  woerter.forEach(function (wort) {
    const test = zeile ? zeile + ' ' + wort : wort;
    if (zeile && formelBreite(doc, test, basis) > maxBreite) {
      zeilen.push(zeile);
      zeile = wort;
    } else {
      zeile = test;
    }
  });
  if (zeile) zeilen.push(zeile);
  return zeilen;
}

/* Bricht die Fussnoten-Textbloecke in Zeilen um (gemeinsam von drawLeerFuss()
 * und leerFussOben() genutzt, damit beide IMMER dieselbe Zeilenzahl sehen). */
function leerFussZeilen(doc, bloecke) {
  const texte = (bloecke || []).filter(function (t) { return t && String(t).trim(); });
  const zeilen = [];
  texte.forEach(function (t) {
    formelZeilenUmbrechen(doc, t, PDF_CONTENT_WIDTH, LEER_FUSS_PT)
      .forEach(function (z) { zeilen.push(z); });
  });
  return zeilen;
}

/* Liefert die y-Position der OBERSTEN Fussnotenzeile, OHNE zu zeichnen -
 * damit die Aufrufstelle VOR dem Zeichnen des darueberliegenden Inhalts
 * (Freigabe, Unterschriften) weiss, wie viel Platz die Fussnoten brauchen
 * werden, und nicht erst hinterher durch Ueberlappung davon erfaehrt. */
function leerFussOben(doc, bloecke) {
  const texte = (bloecke || []).filter(function (t) { return t && String(t).trim(); });
  if (!texte.length) return LEER_FUSS_UNTEN;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(LEER_FUSS_PT);
  const zeilen = leerFussZeilen(doc, bloecke);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  return LEER_FUSS_UNTEN - (zeilen.length - 1) * LEER_FUSS_ZEILE;
}

/* Setzt die uebergebenen Textbloecke als Fussnoten der AKTUELLEN Seite.
 * Rueckgabe: y der obersten Grundlinie - damit die Aufrufstelle pruefen kann,
 * ob der darueberliegende Inhalt noch Platz hat. */
function drawLeerFuss(doc, bloecke) {
  const texte = (bloecke || []).filter(function (t) { return t && String(t).trim(); });
  if (!texte.length) return LEER_FUSS_UNTEN;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(LEER_FUSS_PT);
  doc.setTextColor.apply(doc, PDF_MUTED);

  const zeilen = leerFussZeilen(doc, bloecke);

  const yOben = LEER_FUSS_UNTEN - (zeilen.length - 1) * LEER_FUSS_ZEILE;
  zeilen.forEach(function (z, i) {
    drawFormel(doc, z, PDF_MARGIN_LEFT, yOben + i * LEER_FUSS_ZEILE, { fontSize: LEER_FUSS_PT });
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor.apply(doc, PDF_TEXT);
  return yOben;
}

/* N-PE-SPANNUNG: SOLLWERT 0 V   (4.5.0 aus pdf-generator.js hierher verschoben)
 * Ein nennenswerter Wert deutet auf einen hochohmigen PEN, eine Fremdeinspeisung
 * oder eine Vertauschung hin. 1 V als Schwelle, damit Messrauschen nicht sofort
 * rot wird. Liegt jetzt zentral, weil die Anschlusspruefung dieselbe Bewertung
 * braucht (Befund B1) - am fremden Uebergabepunkt ist das der wichtigste
 * Messwert ueberhaupt. */
const U_NPE_SCHWELLE = 1.0;

function npeUeberschritten(wert) {
  const num = parseMesswert(String(wert === undefined || wert === null ? '' : wert));
  return String(wert || '').trim() !== '' && !isNaN(num) && num > U_NPE_SCHWELLE;
}

/* KOMMA STATT PUNKT IN MESSWERTEN  (4.5.0, Befund D1)
 * Im deutschen Pruefprotokoll ist das Komma das Dezimaltrennzeichen. Vorher
 * standen im PDF Werte wie "0.08 Ω" direkt neben dem gedruckten Grenzwert
 * "≤ 0,30 Ω" - uneinheitlich und bei Zahlen ueber 1000 sogar mehrdeutig.
 *
 * Ersetzt wird NUR ein Punkt zwischen zwei Ziffern. Bewusst nicht global auf
 * jeden Zellentext angewandt: ein Datum ("22.08.2026") oder eine Aufzaehlung
 * im Bemerkungsfeld darf davon nicht getroffen werden. Deshalb wird diese
 * Funktion ausschliesslich auf Messwerte angewendet. */
function kommaZahl(wert) {
  return String(wert === undefined || wert === null ? '' : wert).replace(/(\d)\.(?=\d)/g, '$1,');
}

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
    drawTextF(doc, titel, x + 3, y + 5);
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
  drawTextF(doc, titel, x, y);
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
/* opts.rot = true  ->  Beschriftung UND Wert werden rot und fett gesetzt.
 *
 * FRUEHER: Die Funktion begann mit setFont('normal') + setTextColor(PDF_TEXT).
 * Aufrufer, die vorher auf Rot/Fett geschaltet hatten (U_N-PE ueber Schwelle,
 * R_E ueber Grenzwert), bekamen ihre Markierung genau hier zurueckgesetzt.
 * Die Gesamtbewertung kippte
 * korrekt, aber der Wert, der sie gekippt hatte, stand schwarz im Dokument -
 * wer das Protokoll las, sah die Warnung und fand die Ursache nicht.
 * Deshalb wird die Hervorhebung jetzt ueber diesen Parameter gesteuert und
 * innerhalb der Funktion angewendet, statt sie ausserhalb zu setzen. */
function drawFeldZeile(doc, label, wert, x, y, breite, isBlank, opts) {
  const o = opts || {};
  const rot = o.rot === true;
  doc.setFont('helvetica', rot ? 'bold' : 'normal');
  doc.setTextColor(...(rot ? PDF_RED_TEXT : PDF_TEXT));
  const labelBreite = drawTextF(doc, label, x, y);
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
  // Zustand hinterlassen wie vorgefunden, damit die naechste Zeile nicht
  // versehentlich rot weiterschreibt.
  if (rot) { doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_TEXT); }
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
  const istFormel = hatFormel(text);
  let size = startSize;
  while (size > minSize) {
    doc.setFontSize(size);
    const breite = istFormel
      ? formelBreite(doc, text, size)
      : doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    if (breite <= maxWidth) break;
    size -= 0.25;
  }
  doc.setFontSize(size);
  drawTextF(doc, text, x, y, { fontSize: size });
  return size;
}

// Titel + Normzeile + Trennlinie. Wird auf Seite 1 und auf jeder Folgeseite
// mit denselben Werten aufgerufen, damit der Kopf identisch aussieht.
function drawProtokollHeader(doc, { titel, normzeile }) {
  doc.setTextColor(...PDF_PRIMARY);
  doc.setFont("helvetica", "bold");
  drawFittedText(doc, titel, PDF_MARGIN_LEFT, 11, PDF_TITLE_MAX_WIDTH, 13, 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_MUTED);
  // Die Normzeile darf ebenfalls nicht unter die Box laufen (dort steht "Seite x von y").
  drawFittedText(doc, normzeile, PDF_MARGIN_LEFT, 16, PDF_TITLE_MAX_WIDTH, 7.5, 5.5);

  doc.setDrawColor(...PDF_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(PDF_MARGIN_LEFT, 20, 200, 20);
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
  // 4.5.0 (D1): Messwerte werden mit Dezimalkomma gesetzt.
  const v = kommaZahl(String(value ?? '').trim());
  if (!v) return '';
  /* "Ohm" und "Ω" sind dieselbe Einheit. Wer im Formular noch "0,3 Ohm"
   * eintippt, soll im PDF nicht "0,3 Ohm Ω" lesen. */
  const alternativen = unit === 'Ω' ? ['Ω', 'Ohm'] : [unit];
  const passt = alternativen.some(function (u) {
    return new RegExp(u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'i').test(v);
  });
  return passt ? v : `${v} ${unit}`;
}

/* ---------------------------------------------------------------------------
 *  OFFENE BEWERTUNGEN VOR DEM PDF ABFANGEN
 * ---------------------------------------------------------------------------
 *  Ein aus einer Archiv-Vorlage angelegtes Formular startet mit bewusst
 *  GELEERTEN Auswahlfeldern (Sichtpruefung, Erproben, Gesamtbewertung) - die
 *  Bewertung der Vorpruefung darf nicht stehen bleiben. Ohne diese Pruefung
 *  entstuende daraus ein PDF, in dem beim Pruefergebnis kein einziges
 *  Kaestchen angekreuzt ist, darunter aber die Konformitaetsaussage steht.
 *  Ein <select> ohne passende Option hat selectedIndex -1 und den Wert "" -
 *  genau daran wird eine offene Bewertung erkannt.
 * ------------------------------------------------------------------------ */
function ersteLeereAuswahl(selektoren) {
  for (var i = 0; i < selektoren.length; i++) {
    var els = document.querySelectorAll(selektoren[i]);
    for (var j = 0; j < els.length; j++) {
      if (String(els[j].value || '').trim() === '') return els[j];
    }
  }
  return null;
}

/* ---------------------------------------------------------------------------
 *  MINDESTANGABEN EINES AUSGEFUELLTEN PROTOKOLLS
 * ---------------------------------------------------------------------------
 *  Ohne Pruefdatum, ohne Namen der pruefenden Person und ohne Bezeichnung des
 *  Pruefgegenstands ist ein Protokoll keinem Vorgang zuzuordnen. Bisher
 *  entstand es trotzdem - mit leeren Zeilen an diesen Stellen.
 * ------------------------------------------------------------------------ */
function erstesLeerePflichtfeld(ids) {
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el && String(el.value || '').trim() === '') return { el: el, id: ids[i] };
  }
  return null;
}

const PFLICHTFELD_NAMEN = {
  datum: 'Prüfdatum',
  pruefer: 'Prüfer/-in',
  anlage_bez: 'Anlage (Bezeichnung)',
  veranstaltung: 'Veranstaltung / Anlass',
  uebergabe_standort: 'Standort / Bezeichnung Übergabepunkt',
  auftraggeber: 'Auftraggeber',
  netzfrequenz: 'Frequenz (Hz)'
};

function pflichtfeldMelden(treffer) {
  var name = PFLICHTFELD_NAMEN[treffer.id] || treffer.id;
  alert('Pflichtangabe fehlt: ' + name + '\n\n' +
        'Ohne diese Angabe ist das Protokoll keinem Prüfvorgang zuzuordnen.\n\n' +
        'Das PDF wurde deshalb nicht erstellt.');
  if (treffer.el) {
    if (treffer.el.scrollIntoView) treffer.el.scrollIntoView({ block: 'center' });
    if (treffer.el.focus) treffer.el.focus();
  }
}

/* Ein Protokoll ohne einen einzigen Pruefling ist keine Pruefung: die
 * Messtabelle bliebe leer, die Gesamtbewertung stuende trotzdem auf
 * "keine Maengel". */
function keinePrueflingeMelden(was) {
  alert('Es ist kein ' + was + ' erfasst.\n\n' +
        'Ein ausgefülltes Protokoll ohne eine einzige Messung ist keine Prüfung - die Messtabelle ' +
        'bliebe leer, die Gesamtbewertung stünde trotzdem auf "keine Mängel".\n\n' +
        'Für ein Formular zum Ausfüllen von Hand bitte "Leeres Protokoll drucken" verwenden.\n\n' +
        'Das PDF wurde deshalb nicht erstellt.');
}

function offeneBewertungMelden(el) {
  alert('Es ist noch eine Bewertung offen.\n\n' +
        'Mindestens ein Auswahlfeld (Sichtprüfung, Erproben, Drehfeld oder Gesamtbewertung) ist ' +
        'nicht ausgefüllt. Das passiert vor allem bei einem Formular, das aus einer Archiv-Vorlage ' +
        'angelegt wurde: dort sind alle Bewertungen bewusst leer und müssen neu erfasst werden.\n\n' +
        'Ein Protokoll, in dem beim Prüfergebnis kein Kästchen angekreuzt ist, darunter aber die ' +
        'Konformitätsaussage steht, ist als Nachweis wertlos.\n\n' +
        'Das PDF wurde deshalb nicht erstellt.');
  if (el) {
    if (el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    if (el.focus) el.focus();
  }
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
  const num = parseMesswert(val);
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
