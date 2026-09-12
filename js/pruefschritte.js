/* ============================================================================
 *  pruefschritte.js  –  ZENTRALE PRUEFSCHRITT-BIBLIOTHEK (Welle 1)
 * ----------------------------------------------------------------------------
 *  Diese Datei ist die EINZIGE Quelle fuer Formularfelder, die in mehreren
 *  der drei Protokolle (vde0100.html, anschlusspruefung.html,
 *  geraetepruefung.html) wortgleich vorkommen - z. B. das Gebaeude/Bereich-
 *  Dropdown oder das Anschlusskabel-Feld.
 *
 *  WIE ES FUNKTIONIERT:
 *  In jeder Formularseite steht an der Stelle, wo bisher das Feld-HTML direkt
 *  im Markup stand, nur noch eine leere Markierung:
 *
 *      <div data-pruefschritt="gebaeude_bereich"></div>
 *
 *  renderPruefschritte() (siehe Ende dieser Datei) sucht beim Laden der Seite
 *  alle [data-pruefschritt]-Elemente und ersetzt sie durch das HTML aus
 *  PRUEFSCHRITTE[key].html(). Optionale data-Attribute (z. B.
 *  data-onchange-extra) erlauben kleine, seitenspezifische Ergaenzungen, ohne
 *  den Baustein selbst zu verzweigen.
 *
 *  WICHTIG: Alle erzeugten IDs, Klassen und onchange/oninput-Aufrufe sind
 *  BYTE-IDENTISCH zu dem, was vorher direkt im HTML stand. Bestehender Code
 *  in storage.js/pdf-utils.js/den drei Generatoren (getElementById, .c-xyz-
 *  Selektoren, PDF-Erzeugung, Autosave) funktioniert dadurch unveraendert
 *  weiter - diese Datei aendert nur, WO das Markup herkommt, nicht WIE es
 *  aussieht oder heisst.
 *
 *  Diese Datei wird an ZWEI Stellen geladen:
 *    1. von jeder Formular-HTML-Seite (<script src="js/pruefschritte.js">),
 *       VOR dem jeweiligen *-generator.js und VOR dem <script>-Block am
 *       Ende der Seite, der renderPruefschritte() aufruft.
 *    2. vom Service Worker (importScripts ueber app-config.js) -> Offline-
 *       Cache. Deshalb: nur klassisches "var"/"function", kein import/export.
 *
 *  NEUES FELD/NEUEN PRUEFSCHRITT AENDERN -> siehe docs/ERWEITERN.md,
 *  Abschnitt "Ein bestehendes Feld aendern".
 * ========================================================================== */

var PRUEFSCHRITTE = {};

/* ---------------------------------------------------------------------------
 * 1. GEBAEUDE / BEREICH
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in vde0100.html, anschlusspruefung.html und
 * geraetepruefung.html hartcodiert (5 feste Optionen + "Sonstiges...").
 * Benutzerdefinierte Zusatzeintraege werden weiterhin ueber
 * gebaeudeOptionenAktualisieren() (storage.js) zur Laufzeit ergaenzt - das
 * bleibt unveraendert, diese Bibliothek liefert nur das Grundgerüst.
 *
 * ctx.mitVerwalten: true fuegt den "Verwalten"-Button ein (anschluss/geraete),
 *                   false laesst ihn weg (vde0100 - siehe dortiger Kommentar
 *                   "Verwalten-Button entfernt, zentral auf Hauptseite").
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.gebaeude_bereich = {
  gruppe: 'Stammdaten',
  titel: 'Gebäude / Bereich',
  beschreibung: 'Dropdown mit 5 festen Standard-Bereichen + "Sonstiges" (Freitext). Eigene Zusatzeinträge werden über den Verwalten-Dialog ergänzt und bleiben geräteübergreifend erhalten.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  optionen: ['Gr. Haus', 'Werkstatt', 'Spiegelhalle', 'Münsterplatz', 'Probebühne'],
  html: function (ctx) {
    ctx = ctx || {};
    var mitVerwalten = ctx.mitVerwalten !== false; // Default: mit Button
    var opts = PRUEFSCHRITTE.gebaeude_bereich.optionen
      .map(function (o) { return '<option value="' + o + '">' + o + '</option>'; })
      .join('\n          ');
    var selectHtml =
      '<select id="gebaeude_select" onchange="toggleGebaeudeCustom(this.value)"' +
      (mitVerwalten ? ' style="flex:1 1 auto;"' : '') + '>\n' +
      '          ' + opts + '\n' +
      '          <option value="custom">Sonstiges...</option>\n' +
      '        </select>';

    if (!mitVerwalten) {
      return (
        '<div class="form-group">\n' +
        '  <label for="gebaeude_select">Gebäude / Bereich:</label>\n' +
        '  ' + selectHtml + '\n' +
        '  <input type="text" id="gebaeude_custom" value="Gr. Haus" placeholder="Gebäude/Raum eingeben" style="display:none; margin-top:4px;">\n' +
        '</div>'
      );
    }
    return (
      '<div class="form-group">\n' +
      '  <label for="gebaeude_select">Gebäude / Bereich:</label>\n' +
      '  <div style="display:flex; gap:8px; align-items:center;">\n' +
      '    ' + selectHtml + '\n' +
      '    <button type="button" class="btn-secondary btn-klein" style="flex:0 0 auto; white-space:nowrap;" onclick="gebaeudeVerwaltenOeffnen(\'gebaeude_select\')" title="Eigene Gebäude/Bereiche hinzufügen oder entfernen">Verwalten</button>\n' +
      '  </div>\n' +
      '  <input type="text" id="gebaeude_custom" value="Gr. Haus" placeholder="Gebäude/Raum eingeben" style="display:none; margin-top:4px;">\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 2. ANSCHLUSSKABEL DER ANLAGE
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in vde0100.html (Abschnitt 4) und anschlusspruefung.html
 * (Abschnitt 4) inkl. aller Schnellwahl-Buttons. In geraetepruefung.html
 * kommt dieser Block nicht vor.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.anschlusskabel_anlage = {
  gruppe: 'Anschlusskabel',
  titel: 'Anschlusskabel der Anlage (Kabeltyp, Leiter-Anzahl, Querschnitt)',
  beschreibung: 'Kompletter Feldblock mit Schnellwahl-Buttons für Kabeltyp (NYM-J/H07RN-F/TITANEX/H07V-K), Leiter-Anzahl (5G/3G/4G) und Querschnitt (1,5–16 mm²).',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function () {
    return (
      '<div class="grid">\n' +
      '  <div class="form-group">\n' +
      '    <label for="anschluss_typ">Kabeltyp:</label>\n' +
      '    <input type="text" id="anschluss_typ" placeholder="z. B. H07RN-F">\n' +
      '    <div class="quick-btn-group">\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_typ\', \'NYM-J\')">NYM-J</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_typ\', \'H07RN-F\')">H07RN-F</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_typ\', \'TITANEX\')">TITANEX</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_typ\', \'H07V-K\')">H07V-K</button>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label for="anschluss_leiter">Leiter-Anzahl:</label>\n' +
      '    <input type="text" id="anschluss_leiter" placeholder="z. B. 5G">\n' +
      '    <div class="quick-btn-group">\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_leiter\', \'5G\')">5G</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_leiter\', \'3G\')">3G</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_leiter\', \'4G\')">4G</button>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label for="anschluss_qs">Querschnitt:</label>\n' +
      '    <input type="text" inputmode="decimal" id="anschluss_qs" placeholder="z. B. 6 mm²">\n' +
      '    <div class="quick-btn-group">\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'1,5 mm²\')">1,5 mm²</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'2,5 mm²\')">2,5 mm²</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'4 mm²\')">4 mm²</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'6 mm²\')">6 mm²</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'10 mm²\')">10 mm²</button>\n' +
      '      <button type="button" class="quick-btn" onclick="setValue(\'anschluss_qs\', \'16 mm²\')">16 mm²</button>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 3. NETZSPANNUNG + SCHNELLWAHL
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in vde0100.html (Abschnitt 2) und anschlusspruefung.html
 * (Abschnitt 2). ctx.gridFull: anschlusspruefung.html setzt zusaetzlich die
 * Klasse "grid-full" (volle Zeilenbreite), vde0100.html nicht.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.netzspannung_schnellwahl = {
  gruppe: 'Netzsystem',
  titel: 'Netzspannung (V) + Schnellwahl',
  beschreibung: 'Freitextfeld mit Format-Hilfe (formatNetzspannung) und Schnellwahl 230 V / 230-400 V / 400 V.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var klasse = ctx.gridFull ? ' class="form-group grid-full"' : ' class="form-group"';
    return (
      '<div' + klasse + '>\n' +
      '  <label for="netzspannung">Netzspannung (V):</label>\n' +
      '  <input type="text" inputmode="decimal" pattern="[0-9 /]*" id="netzspannung" placeholder="z. B. 230 / 400" oninput="formatNetzspannung(this)">\n' +
      '  <div class="quick-btn-group">\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'netzspannung\', \'230\')">230 V</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'netzspannung\', \'230 / 400\')">230 / 400 V</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'netzspannung\', \'400\')">400 V</button>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 4. HAUSANSCHLUSS / SPEISEPUNKT (VORSICHERUNG) + SCHNELLWAHL
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in vde0100.html (Abschnitt 1) und anschlusspruefung.html
 * (Abschnitt 2), dort jeweils in voller Zeilenbreite (grid-full).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.hausanschluss_schnellwahl = {
  gruppe: 'Netzsystem',
  titel: 'Hausanschluss / Speisepunkt (Vorsicherung) + Schnellwahl',
  beschreibung: 'Freitextfeld mit Schnellwahl NH 3x100A / NH 3x63A / CEE 63A / CEE 125A / Netzersatzanlage.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function () {
    return (
      '<div class="form-group grid-full">\n' +
      '  <label for="hausanschluss">Hausanschluss / Speisepunkt (Vorsicherung):</label>\n' +
      '  <input type="text" id="hausanschluss" placeholder="z. B. NH 3x100 A gL – HAK Keller / CEE 63 A Einspeisung Open Air">\n' +
      '  <div class="quick-btn-group">\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'hausanschluss\', \'NH 3x100 A gL (HAK)\')">NH 3x100 A</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'hausanschluss\', \'NH 3x63 A gL (HAK)\')">NH 3x63 A</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'hausanschluss\', \'CEE 63 A Einspeisung\')">CEE 63 A</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'hausanschluss\', \'CEE 125 A Einspeisung\')">CEE 125 A</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'hausanschluss\', \'Netzersatzanlage (NEA)\')">NEA</button>\n' +
      '  </div>\n' +
      '  <div class="limit-hint">Oberste Schutzebene: bestimmt Selektivität und maximalen Kurzschlussstrom. Bei Open Air der Speisepunkt statt des Hausanschlusses.</div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 5. PRUEFINTERVALL + SCHNELLWAHL
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in allen drei Formularen, jeweils mit eigenem
 * onchange-Handler (updateNaechsterTerminVde0100/-Anschluss/-Termin), da
 * jedes Formular seine eigene Terminberechnung hat. ctx.onChange (Pflicht)
 * legt fest, welche Funktion aufgerufen wird - der Baustein selbst bleibt
 * dadurch formularunabhaengig.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefintervall_schnellwahl = {
  gruppe: 'Ergebnis',
  titel: 'Prüfintervall + Schnellwahl',
  beschreibung: 'Dropdown 1/2/3 Monate, 1/2/4 Jahre + gleichlautende Schnellwahl-Buttons. Der onchange-Handler unterscheidet sich je Formular (eigene Terminberechnung) und wird über ctx.onChange übergeben.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var onChange = ctx.onChange || 'updateNaechsterTermin';
    var label = ctx.label || 'Prüfintervall:';
    return (
      '<div class="form-group">\n' +
      '  <label for="pruefintervall">' + label + '</label>\n' +
      '  <select id="pruefintervall" onchange="' + onChange + '()">\n' +
      '    <option value="1">1 Monat</option>\n' +
      '    <option value="2">2 Monate</option>\n' +
      '    <option value="3">3 Monate</option>\n' +
      '    <option value="12" selected>1 Jahr</option>\n' +
      '    <option value="24">2 Jahre</option>\n' +
      '    <option value="48">4 Jahre</option>\n' +
      '  </select>\n' +
      '  <div class="quick-btn-group">\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'1\'); ' + onChange + '()">1 Monat</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'2\'); ' + onChange + '()">2 Monate</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'3\'); ' + onChange + '()">3 Monate</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'12\'); ' + onChange + '()">1 Jahr</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'24\'); ' + onChange + '()">2 Jahre</button>\n' +
      '    <button type="button" class="quick-btn" onclick="setValue(\'pruefintervall\', \'48\'); ' + onChange + '()">4 Jahre</button>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 6. NETZSYSTEM (TN-S / TN-C-S / TN-C / TT / IT)
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in vde0100.html (Abschnitt 2, id="netzsystem") und im
 * Uebergabepunkt-Block von anschlusspruefung.html (dort zusaetzlich Klasse
 * "c-netzsystem", da Teil einer perspektivisch mehrfachen Karte).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.netzsystem_dropdown = {
  gruppe: 'Netzsystem',
  titel: 'Netzsystem (TN-S / TN-C-S / TN-C / TT / IT)',
  beschreibung: 'Einfaches Dropdown, Standardwert TN-S. In der Anschlussprüfung zusätzlich mit Klasse c-netzsystem (Kartenkontext).',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var klasseAttr = ctx.klasse ? ' class="' + ctx.klasse + '"' : '';
    return (
      '<div class="form-group">\n' +
      '  <label for="netzsystem">Netzsystem:</label>\n' +
      '  <select' + klasseAttr + ' id="netzsystem">\n' +
      '    <option selected>TN-S</option>\n' +
      '    <option>TN-C-S</option>\n' +
      '    <option>TN-C</option>\n' +
      '    <option>TT</option>\n' +
      '    <option>IT</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 7. PRUEFER-QUALIFIKATION
 * ---------------------------------------------------------------------------
 * Bisher wortgleich in allen drei Formularen.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefer_qualifikation = {
  gruppe: 'Stammdaten',
  titel: 'Qualifikation der prüfenden Person',
  beschreibung: 'Dropdown Elektrofachkraft (EFK) / EuP unter Aufsicht einer EFK.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function () {
    return (
      '<div class="form-group">\n' +
      '  <label for="pruefer_qualifikation">Qualifikation der prüfenden Person:</label>\n' +
      '  <select id="pruefer_qualifikation">\n' +
      '    <option value="">– bitte wählen –</option>\n' +
      '    <option value="Elektrofachkraft (EFK)">Elektrofachkraft (EFK)</option>\n' +
      '    <option value="Elektrotechnisch unterwiesene Person (EuP) unter Aufsicht einer EFK">Elektrotechnisch unterwiesene Person (EuP) unter Aufsicht einer EFK</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 8. SICHTPRUEFUNGS-ITEM (i.O. / n.i.O. / n.a.)
 * ---------------------------------------------------------------------------
 * Das immer gleiche <select>-Grundgerüst für einen einzelnen Sicht-/Erproben-
 * Prüfpunkt. Text und ID unterscheiden sich je Prüfpunkt UND je Formular -
 * deshalb kein reiner Textbaustein wie oben, sondern eine kleine Funktion,
 * die id/Label/Klasse als Parameter bekommt. Dadurch bleibt jeder einzelne
 * Prüfpunkt weiterhin frei benennbar (siehe Master-Übersicht), nur das
 * <select>-Skelett ist zentral.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.sicht_erp_item = {
  gruppe: 'Sichtprüfung / Erproben',
  titel: 'Einzelner Sicht-/Erproben-Prüfpunkt (i.O. / n.i.O. / n.a.)',
  beschreibung: 'Wiederverwendetes <select>-Grundgerüst für jeden einzelnen Prüfpunkt der Sichtprüfung/Erprobung. id, Label und Klasse (sicht-item/erp-item) werden pro Aufruf übergeben. [9.5.0, Welle 3] ctx.wert erlaubt eine Werte-Vorbelegung (Geräte-Karte, aus einem wiederhergestellten data-Objekt), ctx.ohneNa lässt die "n.a."-Option weg (Funktionsprüfung der Geräte-Karte kennt kein n.a.).',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var id = ctx.id;
    var label = ctx.label || '';
    var klasse = ctx.klasse || 'sicht-item';
    var nummer = ctx.nummer ? ctx.nummer + '. ' : '';
    var iconSpan = ctx.iconId ? '<span id="' + ctx.iconId + '"></span>' : '';
    // [9.5.0, Welle 3] Werte-Vorbelegung fuer die Geräte-Karte (dupliziereGeraet()/
    // Wiederherstellen aus Autosave/Archiv setzen data.sicht_*/data.funktion, siehe
    // js/geraete-generator.js addDeviceCard()). Ohne ctx.wert (Standardfall in
    // vde0100.html/anschlusspruefung.html) bleibt das Verhalten unveraendert: die
    // leere erste Option ist selected.
    function sel(wert) { return ctx.wert === wert ? ' selected' : ''; }
    var leerSelected = ctx.wert ? '' : ' selected';
    var naOption = ctx.ohneNa ? '' : ('<option' + sel('n.a.') + '>n.a.</option>');
    return (
      '<div class="form-group"><label for="' + id + '">' + iconSpan + nummer + label + ':</label>' +
      '<select class="' + klasse + '" id="' + id + '" onchange="sichtErpNiOPruefen(this)">' +
      '<option value=""' + leerSelected + '>– bitte wählen –</option>' +
      '<option' + sel('i.O.') + '>i.O.</option><option' + sel('n.i.O.') + '>n.i.O.</option>' + naOption +
      '</select></div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 9. SCHUTZEINRICHTUNGS-BASISDATEN (Absicherung, RCD-Typ, In, IΔn)
 * ---------------------------------------------------------------------------
 * [Welle 2] Bisher als Template-String in drei Varianten hartcodiert:
 *   - pdf-generator.js addCircuitCard(): mit cardCounter-Suffix, RCD-Typ-
 *     Schnellwahl MIT "Typ F", schutzBasisdatenGeaendert(cardCounter, feld)
 *   - anschluss-generator.js (Übergabepunkt-Block): ohne Suffix, RCD-Typ-
 *     Schnellwahl OHNE "Typ F", schutzBasisdatenGeaendert(feld) ohne cardId
 * Der Baustein deckt beide Fälle über ctx.idSuffix (Kartennummer oder leer)
 * und ctx.mitCardId (true = Aufruf mit Kartennummer) ab. ctx.rcdTypOptionen
 * erlaubt die Variante mit/ohne "Typ F" - Vorgabe ist MIT "Typ F" (Stromkreis-
 * Variante), der Übergabepunkt übergibt explizit die kürzere Liste.
 *
 * WICHTIG: alle IDs/Klassen sind exakt wie vorher (c-basis-sich, c-basis-
 * rcd-typ, c-basis-rcd-in, c-basis-rcd-idn) - schutzBasisdatenGeaendert()/
 * schutzBasisdatenAusEinzelfeldernUebernehmen() (pdf-generator.js/
 * anschluss-generator.js) greifen unverändert darauf zu.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.schutz_basisdaten = {
  gruppe: 'Absicherung & RCD',
  titel: 'Schutzeinrichtungs-Basisdaten (Absicherung, RCD-Typ, Iₙ, IΔₙ) — Aufklapp-Panel',
  beschreibung: 'Sammelansicht, die beim Aufklappen die "echten" Einzelfelder (Absicherung, RCD-Typ/In/IΔn) spiegelt. Bei Eingabe hier werden die Einzelfelder sofort mitgesetzt (schutzBasisdatenGeaendert).',
  verwendetIn: ['vde0100', 'anschluss'],
  rcdTypOptionenStandard: ['Typ A', 'Typ B', 'Typ B+', 'Typ F', 'Ohne RCD'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || ''; // '' beim Übergabepunkt, '_' + cardCounter im Stromkreis
    var geaendertAufruf = ctx.mitCardId
      ? function (feld) { return "schutzBasisdatenGeaendert(" + ctx.cardIdAusdruck + ", '" + feld + "')"; }
      : function (feld) { return "schutzBasisdatenGeaendert('" + feld + "')"; };
    var rcdOptionen = ctx.rcdTypOptionen || PRUEFSCHRITTE.schutz_basisdaten.rcdTypOptionenStandard;
    var titelZusatz = ctx.mitCardId ? ' (Absicherung, RCD-Typ, I<sub>n</sub>, I<sub>&Delta;n</sub>)' : ' (Absicherung, RCD-Typ)';

    function schnellwahl(feld, id, werte) {
      return werte.map(function (w) {
        return '<button type="button" class="quick-btn" onclick="setValue(\'' + id + '\', \'' + w + '\'); ' + geaendertAufruf(feld) + '">' + w + '</button>';
      }).join('\n            ');
    }

    return (
      '<div class="c-schutz-basisdaten mess-sections-collapsed">\n' +
      '  <div class="mess-sections-header" onclick="toggleMessSections(this)">\n' +
      '    <span class="mess-sections-titel">Schutzeinrichtungs-Basisdaten' + titelZusatz + '</span>\n' +
      '    <span class="mess-sections-chevron">▾</span>\n' +
      '  </div>\n' +
      '  <div class="grid">\n' +
      '    <div class="form-group">\n' +
      '      <label for="basis_sich' + s + '">Absicherung (Typ / Nennstrom):</label>\n' +
      '      <input type="text" class="c-basis-sich" id="basis_sich' + s + '" placeholder="z. B. B 16A" oninput="' + geaendertAufruf('sich') + '">\n' +
      '      <div class="quick-btn-group">\n' +
      '            ' + schnellwahl('sich', 'basis_sich' + s, ctx.sichOptionen || ['B 16A', 'B 32A', 'C 32A', 'C 63A']) + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label for="basis_rcd_typ' + s + '">RCD Typ:</label>\n' +
      '      <input type="text" class="c-basis-rcd-typ" id="basis_rcd_typ' + s + '" placeholder="z. B. Typ A" oninput="' + geaendertAufruf('rcd_typ') + '">\n' +
      '      <div class="quick-btn-group">\n' +
      '            ' + schnellwahl('rcd_typ', 'basis_rcd_typ' + s, rcdOptionen) + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label for="basis_rcd_in' + s + '">Bemessungsstrom I<sub>n</sub> (RCD):</label>\n' +
      '      <input type="text" class="c-basis-rcd-in" id="basis_rcd_in' + s + '" placeholder="z. B. 40 A" oninput="' + geaendertAufruf('rcd_in') + '">\n' +
      '      <div class="quick-btn-group">\n' +
      '            ' + schnellwahl('rcd_in', 'basis_rcd_in' + s, ['16 A', '25 A', '40 A', '63 A']) + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label for="basis_rcd_idn' + s + '">Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>\n' +
      '      <input type="text" class="c-basis-rcd-idn" id="basis_rcd_idn' + s + '" placeholder="z. B. 30 mA" oninput="' + geaendertAufruf('rcd_idn') + '">\n' +
      '      <div class="quick-btn-group">\n' +
      '            ' + schnellwahl('rcd_idn', 'basis_rcd_idn' + s, ctx.rcdIdnOptionen || ['30 mA', '100 mA', '300 mA']) + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 10. ABSICHERUNG & SCHLEIFENIMPEDANZ (Z_S, I_K, Z_L-N, I_K2)
 * ---------------------------------------------------------------------------
 * [Welle 2] Bisher wortgleich in der Stromkreis-Karte (vde0100.html /
 * pdf-generator.js, Klasse c-sich-typ/c-zs/c-ik/c-zln/c-ik2, oninput ruft
 * onZsInput(cardId)/onZlnInput(cardId)/onIkInput(cardId) auf) und im
 * Übergabepunkt-Block (anschlusspruefung.html / anschluss-generator.js,
 * gleiche Klassen, oninput ruft onFeedZsInput()/onFeedZlnInput()/
 * onFeedIkInput() ohne cardId auf). ctx.onInputPraefix wählt zwischen
 * beiden Aufrufmustern.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.absicherung_schleifenimpedanz = {
  gruppe: 'Absicherung & RCD',
  titel: 'Absicherung & Schleifenimpedanz (Z_S, I_K, Z_L-N, I_K2)',
  beschreibung: 'Absicherungstyp + Schleifenimpedanz-Messwerte. I_K wird aus Z_S berechnet, solange nicht von Hand überschrieben (Kopplung in onZsInput/onFeedZsInput).',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var mitCardId = !!ctx.mitCardId;
    var cardArg = mitCardId ? ctx.cardIdAusdruck : '';
    var sichOnInput = mitCardId ? ("validateCardNorms(" + cardArg + ")") : 'validateFeedNorms()';
    var zsOnInput = mitCardId ? ("onZsInput(" + cardArg + ")") : 'onFeedZsInput()';
    var zlnOnInput = mitCardId ? ("onZlnInput(" + cardArg + ")") : 'onFeedZlnInput()';
    var ikOnInput = mitCardId ? ("onIkInput(" + cardArg + ")") : 'onFeedIkInput()';
    var zsLimitId = mitCardId ? ('zs_limit' + s) : 'fzs_limit';
    // ctx.sichOptionen: Stromkreis-Karte nutzt B 16A/B 10A/C 16A/C 32A,
    // Uebergabepunkt B 16A/B 32A/C 32A/C 63A (Default) - siehe addCircuitCard()
    // in pdf-generator.js vs. Original-HTML in anschlusspruefung.html.
    var sichSchnellwahl = (ctx.sichOptionen || ['B 16A', 'B 32A', 'C 32A', 'C 63A']).map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'sich' + s + '\', \'' + w + '\'); ' + sichOnInput + '">' + w + '</button>';
    }).join('\n            ');

    return (
      '<div class="grid">\n' +
      '  <div class="form-group">\n' +
      '    <label for="sich' + s + '">Absicherung (Typ / Nennstrom):</label>\n' +
      '    <input type="text" class="c-sich-typ" id="sich' + s + '" placeholder="z. B. B 16A" oninput="' + sichOnInput + '" autocomplete="off">\n' +
      '    <div class="quick-btn-group">\n' +
      '            ' + sichSchnellwahl + '\n' +
      '    </div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label>Z<sub>S</sub> (&Omega;) &ndash; Schleifenimpedanz L&ndash;PE <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>\n' +
      '    <input type="text" inputmode="decimal" class="c-zs" id="zs' + s + '" placeholder="z. B. 0,38" oninput="' + zsOnInput + '">\n' +
      '    <div class="limit-hint" id="' + zsLimitId + '"></div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>\n' +
      '    <input type="text" inputmode="decimal" class="c-ik" id="ik' + s + '" placeholder="z. B. 605" oninput="' + ikOnInput + '">\n' +
      '    <div class="limit-hint">Wird aus Z<sub>S</sub> berechnet (I<sub>K</sub> = 230 V / Z<sub>S</sub>), solange nichts von Hand eingetragen wird.</div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label>Z<sub>L-N</sub> (&Omega;) &ndash; Netzimpedanz <span class="feld-badge feld-badge-optional">Optional</span>:</label>\n' +
      '    <input type="text" inputmode="decimal" class="c-zln" id="zln' + s + '" placeholder="nur wenn gemessen" oninput="' + zlnOnInput + '">\n' +
      '    <div class="limit-hint">Fluke 1663: Zi &ndash; <b>LINE</b> (L&ndash;N). Findet einen hochohmigen N-Leiter, den die L&ndash;PE-Messung nicht sieht. Leer lassen, wenn nicht gemessen.</div>\n' +
      '  </div>\n' +
      '  <div class="form-group">\n' +
      '    <label>I<sub>K2</sub> (A) &ndash; Kurzschlussstrom L&ndash;N:</label>\n' +
      '    <input type="text" inputmode="decimal" class="c-ik2" id="ik2' + s + '" placeholder="rechnet sich aus Z_L-N">\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 11. RCD-TYP (Hauptfeld, steuert Ein-/Ausklappen der RCD-Messwerte)
 * ---------------------------------------------------------------------------
 * [Welle 2] Das "echte" RCD-Typ-Feld direkt über dem RCD-Messwerte-Block
 * (nicht zu verwechseln mit dem RCD-Typ in den Schutzbasisdaten weiter oben
 * - beide spiegeln sich über schutzBasisdatenGeaendert()). Bisher wortgleich
 * in Stromkreis-Karte (mit "Typ F", oninput ruft syncRcdMesswerteAnzeige(
 * cardCounter) auf) und Übergabepunkt-Block (ohne "Typ F", oninput ruft
 * syncRcdMesswerteAnzeigeAnschluss() ohne cardId auf).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.rcd_typ_hauptfeld = {
  gruppe: 'Absicherung & RCD',
  titel: 'RCD Typ (Hauptfeld über den RCD-Messwerten)',
  beschreibung: 'Bei "Ohne RCD" klappt der RCD-Messwerte-Block automatisch ein (syncRcdMesswerteAnzeige/-Anschluss).',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var syncFn = ctx.syncFn || 'syncRcdMesswerteAnzeige';
    var syncAufruf = ctx.mitCardId ? (syncFn + '(' + ctx.cardIdAusdruck + ')') : (syncFn + '()');
    var rcdOptionen = ctx.rcdTypOptionen || ['Typ A', 'Typ B', 'Typ B+', 'Typ F', 'Ohne RCD'];
    var schnellwahl = rcdOptionen.map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'rcd_typ' + s + '\', \'' + w + '\'); ' + syncAufruf + '">' + w + '</button>';
    }).join('\n            ');
    return (
      '<div class="grid">\n' +
      '  <div class="form-group">\n' +
      '    <label for="rcd_typ' + s + '">RCD Typ:</label>\n' +
      '    <input type="text" class="c-rcd-typ" id="rcd_typ' + s + '" placeholder="z. B. Typ A" oninput="' + syncAufruf + '">\n' +
      '    <div class="quick-btn-group">\n' +
      '            ' + schnellwahl + '\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 12. RCD-MESSWERTE-BLOCK (In, IΔn, IΔmess, Prüfstrom, tA, Gefährdung, U_L)
 * ---------------------------------------------------------------------------
 * [Welle 2] Bisher wortgleich in der Stromkreis-Karte (pdf-generator.js,
 * validateCardNorms/syncRcdMesswerteAnzeige) und im Übergabepunkt-Block
 * (anschluss-generator.js, validateFeedNorms/syncRcdMesswerteAnzeigeAnschluss),
 * dort mit zusätzlichem U_L-Feld (Berührungsspannung + Gefährdungs-Auswahl
 * sind dort TEIL dieses Blocks, in der Stromkreis-Karte ein separater,
 * eigener Abschnitt "4. Berührungsspannung & Netzart" - deshalb hier über
 * ctx.mitBeruehrungsspannung steuerbar).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.rcd_messwerte = {
  gruppe: 'Absicherung & RCD',
  titel: 'RCD-Messwerte (Iₙ, IΔₙ, IΔmess, Prüfstrom, tA)',
  beschreibung: 'Klappt bei "Ohne RCD" automatisch ein (syncRcdMesswerteAnzeige/-Anschluss). tA-Grenzwert hängt vom gewählten Prüfstrom ab.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var mitCardId = !!ctx.mitCardId;
    var cardArg = mitCardId ? ctx.cardIdAusdruck : '';
    var validateAufruf = mitCardId ? ("validateCardNorms(" + cardArg + ")") : 'validateFeedNorms()';
    var taLimitId = mitCardId ? ('ta_limit' + s) : 'fta_limit';
    var mitBeruehrungsspannung = !!ctx.mitBeruehrungsspannung;
    // [9.4.0, Gap-Analyse Masterliste] Spannungsart (AC/DC) fehlte am
    // Übergabepunkt komplett - dort war 'AC' fest in validateFeedNorms()
    // verdrahtet (getUlGrenzwert('AC', gefVal)). In der Stromkreis-Karte
    // existiert das Feld bereits, dort aber als eigener Abschnitt "4.
    // Berührungsspannung & Netzart" AUSSERHALB dieses Bausteins (siehe
    // pdf-generator.js) - deshalb hier per ctx.mitSpannungsart bewusst NICHT
    // für die Stromkreis-Karte aktiviert (sonst doppeltes Feld), sondern nur
    // für den Übergabepunkt, wo es bislang fehlte.
    var mitSpannungsart = !!ctx.mitSpannungsart;
    var spannungsartSelected = ctx.spannungsartSelected || 'AC';
    // ctx.pruefstromSelected: welche Option beim ERSTEN Rendern der Karte als
    // "selected" markiert ist (Default "5", wie bisher hart codiert). Beim
    // Uebergabepunkt wird der Wert ohnehin per JS gesetzt
    // (document.getElementById('rcd_pruefstrom').value = '5'), der Default
    // hier aendert dort also nichts sichtbar.
    var pruefstromSelected = ctx.pruefstromSelected !== undefined ? ctx.pruefstromSelected : '5';
    function pruefstromSelVal(wert) { return pruefstromSelected === wert; }

    var inSchnellwahl = ['16 A', '25 A', '40 A', '63 A'].map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'rcd_in' + s + '\', \'' + w + '\')">' + w + '</button>';
    }).join('\n              ');
    // ctx.rcdIdnOptionen: Stromkreis-Karte hat zusaetzlich "10 mA" (Default hier
    // ohne 10 mA, wie bisher im Uebergabepunkt) - siehe addCircuitCard() in
    // pdf-generator.js vs. Original-HTML in anschlusspruefung.html.
    var idnSchnellwahl = (ctx.rcdIdnOptionen || ['30 mA', '100 mA', '300 mA']).map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'rcd_idn' + s + '\', \'' + w + '\'); ' + validateAufruf + '">' + w + '</button>';
    }).join('\n              ');

    var spannungsartHtml = '';
    if (mitSpannungsart) {
      spannungsartHtml =
        '        <div class="form-group">\n' +
        '          <label for="art' + s + '">Spannungsart Netzeinspeisung:</label>\n' +
        '          <select class="c-spannung-art" id="art' + s + '" onchange="' + validateAufruf + '">\n' +
        '            <option value="AC"' + (spannungsartSelected === 'AC' ? ' selected' : '') + '>AC (Wechselstrom)</option>\n' +
        '            <option value="DC"' + (spannungsartSelected === 'DC' ? ' selected' : '') + '>DC (Gleichstrom)</option>\n' +
        '          </select>\n' +
        '        </div>\n';
    }

    var beruehrungsspannungHtml = '';
    if (mitBeruehrungsspannung) {
      beruehrungsspannungHtml =
        spannungsartHtml +
        '        <div class="form-group">\n' +
        '          <label for="gef' + s + '">Bereich / Gefährdung:</label>\n' +
        '          <select class="c-gefaehrdung" id="gef' + s + '" onchange="' + validateAufruf + '">\n' +
        '            <option value="normal">Normalbereich (50 V AC)</option>\n' +
        '            <option value="erhoeht">Erhöhte Gefährdung (25 V AC)</option>\n' +
        '          </select>\n' +
        '          <div class="limit-hint">Erhöhte Gefährdung z. B. Bühne, Open Air, feuchte/leitfähige Umgebung, Baustelle.</div>\n' +
        '        </div>\n' +
        '        <div class="form-group">\n' +
        '          <label>Maximal zulässige Berührungsspannung U<sub>L</sub>:</label>\n' +
        '          <input type="text" class="c-ul-max" id="ul_max' + s + '" value="&le; 50 V AC" readonly>\n' +
        '        </div>\n' +
        '        <div class="form-group">\n' +
        '          <label>Gemessene Berührungsspannung U<sub>L</sub> (V):</label>\n' +
        '          <input type="text" inputmode="decimal" class="c-umess" id="umess' + s + '" placeholder="z. B. 2,5 V" oninput="' + validateAufruf + '">\n' +
        '        </div>\n';
    }

    return (
      '<div class="c-rcd-messwerte">\n' +
      '  <div class="mess-sections-header" onclick="toggleMessSections(this)">\n' +
      '    <span class="mess-sections-titel">RCD-Messwerte</span>\n' +
      '    <span class="mess-sections-hinweis">Bei „Ohne RCD" eingeklappt, da nicht relevant – zum Aufklappen hier klicken</span>\n' +
      '    <span class="mess-sections-chevron">▾</span>\n' +
      '  </div>\n' +
      '  <div class="grid">\n' +
      '    <div class="form-group">\n' +
      '      <label>Bemessungsstrom I<sub>n</sub> (RCD):</label>\n' +
      '      <input type="text" class="c-rcd-in" id="rcd_in' + s + '" placeholder="z. B. 40 A">\n' +
      '      <div class="quick-btn-group">\n' +
      '              ' + inSchnellwahl + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>\n' +
      '      <input type="text" class="c-rcd-idn" id="rcd_idn' + s + '" placeholder="z. B. 30 mA" oninput="' + validateAufruf + '">\n' +
      '      <div class="quick-btn-group">\n' +
      '              ' + idnSchnellwahl + '\n' +
      '      </div>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label>Auslösestrom I<sub>&Delta;mess</sub> (mA):</label>\n' +
      '      <input type="text" inputmode="decimal" class="c-rcd-imess" id="rcd_imess' + s + '" placeholder="z. B. 22" oninput="' + validateAufruf + '">\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label for="rcd_pruefstrom' + s + '">Prüfstrom für Auslösestrom / Auslösezeit:</label>\n' +
      '      <select class="c-rcd-pruefstrom" id="rcd_pruefstrom' + s + '" onchange="' + validateAufruf + '">\n' +
      '        <option value=""' + (pruefstromSelVal('') ? ' selected' : '') + '>&ndash; bitte wählen &ndash;</option>\n' +
      '        <option value="1"' + (pruefstromSelVal('1') ? ' selected' : '') + '>1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>\n' +
      '        <option value="2"' + (pruefstromSelVal('2') ? ' selected' : '') + '>2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>\n' +
      '        <option value="5"' + (pruefstromSelVal('5') ? ' selected' : '') + '>5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>\n' +
      '      </select>\n' +
      '    </div>\n' +
      '    <div class="form-group">\n' +
      '      <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="' + taLimitId + '"></span>:</label>\n' +
      '      <input type="text" inputmode="decimal" class="c-rcd-ta" id="rcd_ta' + s + '" placeholder="z. B. 24" oninput="' + validateAufruf + '">\n' +
      '    </div>\n' +
      '' + beruehrungsspannungHtml +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 13. SCHUTZLEITER- & ISOLATIONSWIDERSTAND (RPE/RISO-MESSBLOCK)
 * ---------------------------------------------------------------------------
 * [9.5.0, Welle 3] Bisher in ZWEI Varianten hartcodiert:
 *   - pdf-generator.js addCircuitCard(): Titel "1. Schutzleiter- &
 *     Isolationswiderstand" (nur .sub-title, ohne mess-karte-titel), RPE-/
 *     RISO-Eingabefelder OHNE id (nur Klasse), dafuer MIT value="${attrEsc(
 *     data.*)}"-Vorbelegung, oninput ruft validateCardNorms(cardCounter) auf,
 *     riso_verbraucher/riso_mode HABEN eine id mit "_"+cardCounter-Suffix,
 *     riso_verbraucher hat zusaetzlich onchange="risoVerbraucherGeaendert(
 *     cardCounter)" sowie die Klasse c-riso-verbraucher, UND je Messgroesse
 *     (rpe/riso) haengt eine Fluke-1663-Icon/Anleitungs-Karte dran
 *     (messgroesseBlock('rpe'|'riso', 'fluke1663')).
 *   - anschlusspruefung.html (Übergabepunkt, Abschnitt 5.0): Titel "5.0
 *     Schutzleiterwiderstand & Isolationswiderstand" (mit mess-karte-titel +
 *     titel-text-Span, KEIN Icon), RPE-/RISO-Felder HABEN eine feste id ohne
 *     Suffix (rpe/riso_verbraucher/riso_mode/riso), OHNE value-Vorbelegung,
 *     oninput ruft validateFeedNorms() auf, riso_verbraucher hat WEDER Klasse
 *     noch onchange-Handler, KEINE Fluke-Anleitungskarten.
 * ctx-Parameter bilden beide Faelle 1:1 ab (siehe Kommentare je Feld unten).
 * WICHTIG: ctx.mitCardId steuert nur die Feld-IDs/Werte/Handler - ob Icon und
 * Fluke-Anleitungskarten erscheinen, entscheidet ctx.mitMessgroessenkarten
 * (Default: gleich ctx.mitCardId, da bislang beides zusammen auftrat; explizit
 * trennbar fuer den Fall, dass sich das einmal aendert).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.rpe_riso_messblock = {
  gruppe: 'Messwerte',
  titel: 'Schutzleiter- & Isolationswiderstand (R_PE / R_ISO)',
  beschreibung: 'RPE-Messfeld + RISO-Messgruppe (Verbraucher angeschlossen?, Prüfspannung, Messwert). In der Stromkreis-Karte mit Fluke-1663-Anleitungskarten und Werte-Vorbelegung (data.*), am Übergabepunkt ohne Vorbelegung und mit festen IDs ohne Kartennummer-Suffix.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var mitCardId = !!ctx.mitCardId;
    var s = ctx.idSuffix || ''; // '' am Übergabepunkt, '_'+cardCounter im Stromkreis
    var data = ctx.data || {};
    var validateAufruf = mitCardId ? ('validateCardNorms(' + ctx.cardIdAusdruck + ')') : 'validateFeedNorms()';
    var mitKarten = ctx.mitMessgroessenkarten !== undefined ? !!ctx.mitMessgroessenkarten : mitCardId;
    var rpeInfo = mitKarten && typeof messgroesseBlock === 'function' ? messgroesseBlock('rpe', 'fluke1663') : { icon: '', karten: '' };
    var risoInfo = mitKarten && typeof messgroesseBlock === 'function' ? messgroesseBlock('riso', 'fluke1663') : { icon: '', karten: '' };

    // Titel: Stromkreis-Karte "1. ..." (schlicht), Übergabepunkt "5.0 ..."
    // (mit mess-karte-titel + titel-text-Span). ctx.titelNummer/ctx.titelText
    // erlauben beides ohne Verzweigung im Baustein selbst.
    var titelText = ctx.titelText || 'Schutzleiter- & Isolationswiderstand';
    var titelHtml = mitCardId
      ? '<div class="sub-title">' + (ctx.titelNummer || '1.') + ' ' + titelText + '</div>'
      : '<div class="sub-title mess-karte-titel"><span class="titel-text">' + (ctx.titelNummer || '5.0') + ' ' + titelText + '</span></div>';

    // RPE-Feld: Stromkreis-Karte hat kein <label for>/keine id am Input (nur
    // Klasse) + value-Vorbelegung; Übergabepunkt hat feste id "rpe" + <label
    // for="rpe">, keine Vorbelegung.
    var rpeLabelHtml = mitCardId
      ? '<label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>'
      : '<label for="rpe' + s + '">R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>';
    var rpeInputIdAttr = mitCardId ? '' : (' id="rpe' + s + '"');
    var rpeValueAttr = mitCardId ? (' value="' + attrEsc(data.rpe) + '"') : '';

    var risoVerbraucherIdAttr = ' id="riso_verbraucher' + s + '"';
    var risoVerbraucherKlasseAttr = mitCardId ? ' class="c-riso-verbraucher"' : '';
    var risoVerbraucherOnchangeAttr = mitCardId ? (' onchange="risoVerbraucherGeaendert(' + ctx.cardIdAusdruck + ')"') : '';
    var risoVerbraucherLabelHtml = mitCardId
      ? '<label for="riso_verbraucher' + s + '">Verbraucher angeschlossen?</label>'
      : '<label for="riso_verbraucher' + s + '">Verbraucher angeschlossen?</label>';
    // [Nutzerwunsch] Kommentar nur in der Stromkreis-Karte-Variante relevant
    // (siehe Original in pdf-generator.js) - hier als HTML-Kommentar erhalten,
    // damit ein Blick in den erzeugten Quelltext denselben Hintergrund liefert.
    var risoVerbraucherKommentar = mitCardId
      ? '<!-- [Nutzerwunsch] "Verbraucher angeschlossen?" ist weiterhin eine reine Angabe/Dokumentation, setzt aber die Prüfspannung unten NICHT mehr automatisch - beide Felder sind jetzt unabhaengig voneinander frei waehlbar (siehe risoVerbraucherGeaendert() in js/pdf-generator.js). -->\n              '
      : '';

    var risoModeIdAttr = ' id="riso_mode' + s + '"';
    var risoModeOnchangeAttr = ' onchange="' + validateAufruf + '"';
    var risoInputIdAttr = mitCardId ? '' : (' id="riso' + s + '"');
    var risoValueAttr = mitCardId
      ? (' value="' + attrEsc(data.riso !== undefined && data.riso !== '' ? data.riso : '>') + '"')
      : '';

    return (
      '<div class="sub-section">\n' +
      (mitCardId
        ? '    <!-- MESSWERTE: R_PE & R_ISO\n' +
          '         Zwei klar getrennte Gruppen: sonst wirkte am Desktop die Prüfspannung\n' +
          '         wie eine Angabe zu R_PE, obwohl sie zum Isolationswiderstand gehört. -->\n'
        : '') +
      '      ' + titelHtml + '\n' +
      '      <div class="mess-gruppen">\n' +
      '        <div class="mess-gruppe">\n' +
      '          <div class="mess-gruppe-titel' + (mitCardId ? ' mess-karte-titel' : '') + '">' + (mitCardId ? (rpeInfo.icon + '<span class="titel-text">Schutzleiter R<sub>PE</sub></span>') : 'Schutzleiter R<sub>PE</sub>') + '</div>\n' +
      '          <div class="form-group">\n' +
      '            ' + rpeLabelHtml + '\n' +
      '            <input type="text" inputmode="decimal" class="c-rpe"' + rpeInputIdAttr + rpeValueAttr + ' placeholder="z. B. 0,11" oninput="' + validateAufruf + '">\n' +
      '            <div class="limit-hint">DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit (Prüfstrom &ge; 200 mA), keinen festen Grenzwert. Die Schutzwirkung wird über Z<sub>S</sub>/I<sub>K</sub> bewertet.</div>\n' +
      '          </div>\n' +
      '          ' + rpeInfo.karten + '\n' +
      '        </div>\n' +
      '        <div class="mess-gruppe">\n' +
      '          <div class="mess-gruppe-titel' + (mitCardId ? ' mess-karte-titel' : '') + '">' + (mitCardId ? (risoInfo.icon + '<span class="titel-text">Isolationswiderstand R<sub>ISO</sub></span>') : 'Isolationswiderstand R<sub>ISO</sub>') + '</div>\n' +
      '          <div class="grid">\n' +
      '            <div class="form-group">\n' +
      '              ' + risoVerbraucherKommentar +
      '              ' + risoVerbraucherLabelHtml + '\n' +
      '              <select' + risoVerbraucherKlasseAttr + risoVerbraucherIdAttr + risoVerbraucherOnchangeAttr + '>\n' +
      '                <option value="" selected>&ndash; bitte wählen &ndash;</option>\n' +
      '                <option value="ja">Ja, Verbraucher angeschlossen</option>\n' +
      '                <option value="nein">Nein, ohne Verbraucher geprüft</option>\n' +
      '              </select>\n' +
      '            </div>\n' +
      '            <div class="form-group">\n' +
      '              <label for="riso_mode' + s + '">Prüfspannung (VDE 0100-600, Tab. 6.1):</label>\n' +
      '              <select class="c-riso-mode"' + risoModeIdAttr + risoModeOnchangeAttr + '>\n' +
      '                <option value="500 V DC (Stromkreis bis 500 V)">500 V DC &ndash; bis 500 V (&ge; 1,0 M&Omega;)</option>\n' +
      '                <option value="250 V DC (SELV/PELV)">250 V DC &ndash; SELV/PELV (&ge; 0,5 M&Omega;)</option>\n' +
      '                <option value="1000 V DC (Stromkreis über 500 V)">1000 V DC &ndash; über 500 V (&ge; 1,0 M&Omega;)</option>\n' +
      '                <option value="250 V DC (Praxismessung mit Verbrauchern)">250 V DC &ndash; Praxismessung mit Verbrauchern (kein Normfall)</option>\n' +
      (mitCardId
        ? '                <!-- [8.0.0] NEU: eigene Option fuer "ohne Verbraucher" (siehe\n' +
          '                     riso_verbraucher-Auswahl oben) - bewusst getrennt von der\n' +
          '                     bestehenden "Praxismessung MIT Verbrauchern"-Option, da\n' +
          '                     beides technisch 250 V aber unterschiedliche Gruende sind. -->\n'
        : '') +
      '                <option value="250 V DC (ohne Verbraucher geprüft)">250 V DC &ndash; ohne Verbraucher geprüft (kein Normfall)</option>\n' +
      '              </select>\n' +
      '            </div>\n' +
      '            <div class="form-group">\n' +
      '              <label' + (mitCardId ? '' : ' for="riso' + s + '"') + '>Messwert R<sub>ISO</sub> (M&Omega;):</label>\n' +
      '              <input type="text" inputmode="decimal" class="c-riso"' + risoInputIdAttr + risoValueAttr + ' placeholder="z. B. > 500" oninput="' + validateAufruf + '">\n' +
      '            </div>\n' +
      '          </div>\n' +
      '          ' + risoInfo.karten + '\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 14. NETZMESSUNG - SPANNUNGSGRID (U L1-N ... U L1-L3)
 * ---------------------------------------------------------------------------
 * [9.5.0, Welle 3] Die sechs Spannungsmess-Felder (U L1-N, L2-N, L3-N, L1-L2,
 * L2-L3, L1-L3) sind in vde0100.html (Abschnitt "Netzmessung", innerhalb
 * <details id="netzmessung_block">) und im Übergabepunkt-Block von
 * anschlusspruefung.html (Abschnitt 5.1) inhaltlich identisch (Label-Texte,
 * Platzhalter, die Klasse netzmessung-drehstrom-feld an L2-N bis L1-L3), aber
 * mit unterschiedlichen IDs/Klassen an den Gruppen-<div>s und unterschiedlichem
 * oninput-Handler:
 *   - vde0100.html: Gruppen-<div>s haben eigene IDs (netzmessung_gruppe_l1n
 *     usw.), Inputs OHNE Klasse, oninput="validateNetzspannungsfeld('u_l1n')"
 *     (Handler bekommt nur die Feld-ID), das L1-N-Label steckt in einem
 *     <span id="netzmessung_l1n_label"> (wird bei 1-phasig umbenannt, siehe
 *     updateNetzmessungNetzart()).
 *   - anschlusspruefung.html: Gruppen-<div>s OHNE eigene ID, Inputs MIT Klasse
 *     (c-u-l1n usw.), oninput="validateFeedNetzspannungsfeld('u-l1n','u_l1n')"
 *     (Handler bekommt zusaetzlich einen Bindestrich-Namen fuer die PDF-
 *     Ausgabe), das L1-N-Label steckt in <span class="c-l1n-label"> (wird von
 *     updateFeedNetzart() umbenannt).
 * WICHTIG: Das direkt daneben stehende U-N-PE-Feld ist trotz aehnlichem Zweck
 * NICHT Teil dieses Bausteins - Label, Platzhalter, Pflicht-Badge und
 * oninput-Ziel unterscheiden sich zwischen beiden Formularen so grundlegend
 * (siehe docs/Aenderungsbericht 9.5.0), dass eine Zusammenfassung dort mehr
 * Verzweigungen als Ersparnis gebracht haette - es bleibt bewusst in den
 * jeweiligen Formularen/Karten stehen. Ebenso bleiben Netzart-Dropdown,
 * Frequenz, Art des Speisepunkts/Steckverbindung (nur vde0100) und Drehfeld
 * (nur Übergabepunkt) unveraendert an ihrer bisherigen Stelle, da sie NICHT
 * an derselben Position/Struktur in beiden Formularen vorkommen (siehe
 * Analyse in docs/ERWEITERN.md).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.netzmessung_spannungsgrid = {
  gruppe: 'Netzsystem',
  titel: 'Netzmessung – Spannungsgrid (U L1-N … U L1-L3)',
  beschreibung: 'Die sechs Spannungsmessfelder der Netzmessung (L-N/L-L). In vde0100.html mit eigenen Gruppen-IDs und validateNetzspannungsfeld(id), am Übergabepunkt mit c-u-*-Klassen und validateFeedNetzspannungsfeld(bindestrich-id, id). Das U-N-PE-Feld selbst ist wegen zu großer Unterschiede bewusst NICHT Teil dieses Bausteins.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var mitGruppenId = !!ctx.mitGruppenId; // vde0100: true: netzmessung_gruppe_lXX
    var mitKlasse = !!ctx.mitKlasse;       // anschluss: true: c-u-lXX an den Inputs
    var l1nLabelHtml = ctx.l1nLabelSpanKlasse
      ? '<span class="' + ctx.l1nLabelSpanKlasse + '">U L1&ndash;N (V):</span>'
      : '<span id="' + (ctx.l1nLabelSpanId || 'netzmessung_l1n_label') + '">U L1&ndash;N (V):</span>';

    // onInput(fieldId, bindestrichId) liefert das exakte oninput-Attribut je
    // Formular - ctx.onInputFn bestimmt NUR den Funktionsnamen und ob der
    // Bindestrich-Zweitparameter mitgegeben wird (Übergabepunkt) oder nicht
    // (vde0100), siehe Kommentar oben.
    function onInput(feldId, bindestrichId) {
      if (ctx.mitBindestrichArg) {
        return ctx.onInputFn + "('" + bindestrichId + "', '" + feldId + "')";
      }
      return ctx.onInputFn + "('" + feldId + "')";
    }

    var felder = [
      { id: 'u_l1n', bindestrich: 'u-l1n', label: 'U L1&ndash;N (V):', platzhalter: '230', drehstromFeld: false, gruppenId: 'netzmessung_gruppe_l1n', erstesLabel: true },
      { id: 'u_l2n', bindestrich: 'u-l2n', label: 'U L2&ndash;N (V):', platzhalter: '230', drehstromFeld: true, gruppenId: 'netzmessung_gruppe_l2n' },
      { id: 'u_l3n', bindestrich: 'u-l3n', label: 'U L3&ndash;N (V):', platzhalter: '230', drehstromFeld: true, gruppenId: 'netzmessung_gruppe_l3n' },
      { id: 'u_l12', bindestrich: 'u-l12', label: 'U L1&ndash;L2 (V):', platzhalter: '400', drehstromFeld: true, gruppenId: 'netzmessung_gruppe_l12' },
      { id: 'u_l23', bindestrich: 'u-l23', label: 'U L2&ndash;L3 (V):', platzhalter: '400', drehstromFeld: true, gruppenId: 'netzmessung_gruppe_l23' },
      { id: 'u_l13', bindestrich: 'u-l13', label: 'U L1&ndash;L3 (V):', platzhalter: '400', drehstromFeld: true, gruppenId: 'netzmessung_gruppe_l13' }
    ];

    return felder.map(function (f) {
      var klasseAttr = 'form-group' + (f.drehstromFeld ? ' netzmessung-drehstrom-feld' : '');
      var gruppenIdAttr = mitGruppenId ? (' id="' + f.gruppenId + '"') : '';
      var inputKlasseAttr = mitKlasse ? (' class="c-' + f.id.replace('_', '-') + '"') : '';
      var labelInner = f.erstesLabel ? l1nLabelHtml : f.label;
      return (
        '<div class="' + klasseAttr + '"' + gruppenIdAttr + '>' +
        '<label for="' + f.id + '">' + labelInner + '</label>' +
        '<input type="text" inputmode="decimal" pattern="[0-9]*"' + inputKlasseAttr + ' id="' + f.id + '" placeholder="' + f.platzhalter + '" oninput="' + onInput(f.id, f.bindestrich) + '">' +
        '</div>'
      );
    }).join('\n        ');
  }
};

/* ---------------------------------------------------------------------------
 * 15. POTENZIALAUSGLEICH (KONZEPT, ERDUNGSWIDERSTAND, MESSPUNKT, DURCHGÄNGIGKEIT)
 * ---------------------------------------------------------------------------
 * [9.5.0, Welle 3] Der Feld-Innenteil (die fuenf/sechs Formularfelder
 * innerhalb des jeweils umgebenden .grid) ist bis auf wenige Details 1:1
 * identisch zwischen vde0100.html (Abschnitt 7, "Durchgängigkeit
 * Potenzialausgleich / Erdung") und anschluss-generator.js/anschlusspruefung.html
 * (Abschnitt 5.2, "Durchgängigkeit Potenzialausgleich"):
 *   - pa_angeschlossen: BYTE-IDENTISCH in beiden.
 *   - erdung_re: Label am Übergabepunkt mit Zusatz ", falls gemessen", dort
 *     ruft oninput validateErdungAnschluss() statt validateErdung() auf
 *     (ctx.erdungReOnInput, ctx.erdungReMitZusatz).
 *   - Messpunkt-Freitextfeld: eigene ID (erdung_messpunkt/pa_messpunkt),
 *     eigener Platzhalter UND eigene Schnellwahl-Buttons-Liste je Formular
 *     (ctx.messpunktId, ctx.messpunktPlatzhalter, ctx.messpunktButtons).
 *   - pa_durchg: BYTE-IDENTISCH in beiden.
 *   - R_PA (Übergabepunkt-Widerstand): NUR am Übergabepunkt vorhanden, in
 *     vde0100.html gibt es dieses Feld nicht (ctx.mitRpa).
 * Der AEUSSERE Rahmen (h2 + .kat-block.kat-erdung in vde0100.html vs.
 * .sub-section + .sub-title am Übergabepunkt) ist NICHT Teil dieses
 * Bausteins - beide Rahmen sind zu verschieden (unterschiedliche
 * Ueberschriften-Ebene, unterschiedliche Icons/Titel-Nummerierung), eine
 * Zusammenfassung dort haette nur Verzweigungen ohne echten Nutzen erzeugt.
 * Der Baustein liefert deshalb NUR den Inhalt des <div class="grid">...</div>.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.potenzialausgleich_messfelder = {
  gruppe: 'Erdung & Potenzialausgleich',
  titel: 'Potenzialausgleich – Konzept, Erdungswiderstand, Messpunkt, Durchgängigkeit',
  beschreibung: 'Grid-Inhalt (ohne äußeren Rahmen): Konzept-Dropdown, Erdungswiderstand R_E, Messpunkt-Freitext mit formularabhängiger Schnellwahl, Durchgängigkeit i.O./n.i.O./n.a. Am Übergabepunkt zusätzlich R_PA (dort per ctx.mitRpa aktiviert).',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var erdungReOnInput = ctx.erdungReOnInput || 'validateErdung';
    var erdungReLabel = 'Erdungswiderstand R<sub>E</sub> (&Omega;) [Richtwert &le; 10 &Omega;]' + (ctx.erdungReMitZusatz ? ', falls gemessen' : '') + ':';
    var messpunktId = ctx.messpunktId || 'erdung_messpunkt';
    var messpunktPlatzhalter = ctx.messpunktPlatzhalter || 'z. B. HES im Keller / PA-Schiene UV-1';
    var messpunktButtons = ctx.messpunktButtons || [
      { wert: 'HES (Haupterdungsschiene)', label: 'HES' },
      { wert: 'Potenzialausgleichsschiene (PAS)', label: 'PA-Schiene' },
      { wert: 'Hauptverteilung HV', label: 'HV' },
      { wert: 'Unterverteilung UV', label: 'UV' },
      { wert: 'Fundamenterder', label: 'Fundamenterder' },
      { wert: 'Blitzschutzanlage / Erdungsfestpunkt', label: 'Blitzschutz' },
      { wert: 'Hauptschutzleiter PE', label: 'Hauptschutzleiter' },
      { wert: 'Hauptwasserleitung', label: 'Hauptwasserleitung' },
      { wert: 'Heizungsanlage', label: 'Heizung' },
      { wert: 'Gasleitung (Isolierstück beachten)', label: 'Gasleitung' },
      { wert: 'Klima-/Lüftungsanlage', label: 'Klima/Lüftung' },
      { wert: 'Gebäudekonstruktion / Stahlbau', label: 'Gebäudekonstr.' },
      { wert: 'Traverse / Tribüne', label: 'Traverse/Tribüne' },
      { wert: 'Bühnenwagen / Drehbühne', label: 'Bühnenwagen' },
      { wert: 'Kabelpritsche / Kabeltrasse', label: 'Kabeltrasse' }
    ];
    var buttonsHtml = messpunktButtons.map(function (b) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'' + messpunktId + '\', \'' + b.wert + '\')">' + b.label + '</button>';
    }).join('\n          ');

    var rpaHtml = '';
    if (ctx.mitRpa) {
      rpaHtml =
        '\n      <div class="form-group">\n' +
        '        <label for="pa_widerstand">R<sub>PA</sub> (&Omega;), falls gemessen:</label>\n' +
        '        <input type="text" inputmode="decimal" id="pa_widerstand" placeholder="z. B. 0,20">\n' +
        '      </div>';
    }

    return (
      '<div class="form-group">\n' +
      '        <label for="pa_angeschlossen">Potenzialausgleich grundsätzlich vorhanden (Konzept):</label>\n' +
      '        <select id="pa_angeschlossen"><option>Ja</option><option>Nein</option><option>n.a.</option></select>\n' +
      '      </div>\n' +
      '      <div class="form-group">\n' +
      '        <label for="erdung_re">' + erdungReLabel + '</label>\n' +
      '        <input type="text" inputmode="decimal" id="erdung_re" placeholder="z. B. 0,25" oninput="' + erdungReOnInput + '()">\n' +
      '      </div>\n' +
      '      <div class="form-group grid-full">\n' +
      '        <label for="' + messpunktId + '">Messpunkt / Bezugspunkt der Messung:</label>\n' +
      '        <input type="text" id="' + messpunktId + '" placeholder="' + messpunktPlatzhalter + '">\n' +
      '        <div class="quick-btn-group">\n' +
      '          ' + buttonsHtml + '\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="form-group">\n' +
      '        <label for="pa_durchg">Durchgängigkeit Potenzialausgleich:</label>\n' +
      '        <select class="c-pa-durchg" id="pa_durchg">\n' +
      '          <option value="" selected>– bitte wählen –</option>\n' +
      '          <option>i.O.</option>\n' +
      '          <option>n.i.O.</option>\n' +
      '          <option>n.a.</option>\n' +
      '        </select>\n' +
      '      </div>' + rpaHtml
    );
  }
};

/* ---------------------------------------------------------------------------
 * 16. GERÄTE-MESSBLOCK (R_PE, R_ISO, ABLEITSTROM, MESSMETHODE)
 * ---------------------------------------------------------------------------
 * [9.5.0, Welle 3] Bisher als Template-String in addDeviceCard()
 * (js/geraete-generator.js) hartcodiert. Diese Feldgruppe ist strukturell
 * eigenstaendig (einfache form-group-Felder statt der mess-gruppen/
 * riso_verbraucher-Struktur der Stromkreis-/Übergabepunkt-Variante, dafür mit
 * Ableitstrom + Messmethode, die es dort nicht gibt) - deshalb ein eigener
 * Baustein statt einer Erweiterung von PRUEFSCHRITTE.rpe_riso_messblock, der
 * sonst mit einer weiteren Sonderform ueberladen wuerde, ohne dass echte
 * Duplikation zwischen Geräte- und Stromkreis-/Übergabepunkt-Variante besteht.
 * Der Baustein bekommt cardCounter als ctx.cardIdAusdruck (Pflicht) fuer alle
 * id-Suffixe/Handler-Aufrufe sowie ctx.data fuer die Werte-Vorbelegung einer
 * wiederhergestellten/duplizierten Karte (wie bisher per attrEsc(data.*)).
 * Die drei Fluke-6500-Anleitungskarten (rpe/riso/ableitstrom) bleiben
 * AUSSERHALB dieses Bausteins in geraete-generator.js (dort ohnehin schon per
 * messgroesseBlock()/infokarteInhaltHtml()/MESSGROESSEN_INFO aufgerufen -
 * keine Verdopplung noetig, siehe Kommentar dort).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.geraete_messblock = {
  gruppe: 'Messwerte',
  titel: 'Geräte-Messblock (R_PE, R_ISO, Ableitstrom, Messmethode)',
  beschreibung: 'Vier Messfelder der Geräteprüfung (Schutzleiterwiderstand, Isolationswiderstand, Ableitstrom, Messmethode). Werte-Vorbelegung über ctx.data (wie bisher attrEsc(data.*)). Die Fluke-6500-Anleitungskarten bleiben außerhalb des Bausteins in geraete-generator.js.',
  verwendetIn: ['geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var c = ctx.cardIdAusdruck;
    var data = ctx.data || {};
    var validateAufruf = 'validateDeviceNorms(' + c + ')';
    var risoWert = data.riso !== undefined && data.riso !== '' ? data.riso : '>';
    return (
      '<div class="grid">\n' +
      '        <div class="form-group">\n' +
      '          <label>R<sub>PE</sub> (&Omega;) <span class="limit-hint" id="rpe_limit_' + c + '"></span>:</label>\n' +
      '          <input type="text" inputmode="decimal" class="c-rpe" value="' + attrEsc(data.rpe) + '" placeholder="z. B. 0,20" oninput="' + validateAufruf + '">\n' +
      '        </div>\n' +
      '        <div class="form-group">\n' +
      '          <label>R<sub>ISO</sub> (M&Omega;) <span class="limit-hint" id="riso_limit_' + c + '"></span>:</label>\n' +
      '          <input type="text" inputmode="decimal" class="c-riso" value="' + attrEsc(risoWert) + '" placeholder="z. B. > 100" oninput="' + validateAufruf + '">\n' +
      '        </div>\n' +
      '        <div class="form-group">\n' +
      '          <label>Ableitstrom (mA) <span class="limit-hint" id="ableit_limit_' + c + '"></span>:</label>\n' +
      '          <input type="text" inputmode="decimal" class="c-ableitstrom" value="' + attrEsc(data.ableitstrom) + '" placeholder="z. B. 0,3" oninput="' + validateAufruf + '">\n' +
      '        </div>\n' +
      '        <div class="form-group">\n' +
      '          <label for="ableit_methode_' + c + '">Messmethode Ableitstrom:</label>\n' +
      '          <select class="c-ableit-methode" id="ableit_methode_' + c + '" onchange="ableitMethodeGeaendert(' + c + ')">\n' +
      '            <option>Ersatzableitstrom</option>\n' +
      '            <option>Differenzstrommessung</option>\n' +
      '            <option>Direktmessung Berührungsstrom</option>\n' +
      '          </select>\n' +
      '          <div class="limit-hint" id="ableit_methode_hint_' + c + '"></div>\n' +
      '        </div>\n' +
      '      </div>'
    );
  }
};

/* ============================================================================
 *  LOADER: renderPruefschritte()
 * ----------------------------------------------------------------------------
 *  Wird von jeder Formularseite EINMALIG beim Laden aufgerufen, BEVOR
 *  applyMasterDataToForm()/initStatusleiste()/initPflichtfelder() usw.
 *  laufen (diese greifen per getElementById auf Felder zu, die es vorher
 *  geben muss).
 *
 *  Markup in der Formularseite:
 *    <div data-pruefschritt="gebaeude_bereich" data-ctx='{"mitVerwalten":false}'></div>
 *
 *  data-ctx ist optional und wird als JSON geparst und an html(ctx)
 *  weitergereicht. Fehlt data-ctx, wird html() ohne Parameter aufgerufen
 *  (nutzt dann die Vorgabewerte des jeweiligen Bausteins).
 *
 *  Ersetzt das Marker-<div> durch das erzeugte HTML - dabei werden etwaige
 *  Attribute des Marker-<div> selbst (z.B. eine Grid-Klasse) NICHT auf das
 *  neue Element uebertragen; ein Baustein, der sich in unterschiedlichen
 *  Kontexten unterschiedlich einfuegen soll (z.B. grid-full), bekommt das
 *  ueber ctx gesteuert (siehe netzspannung_schnellwahl).
 * ========================================================================== */
function renderPruefschritte(root) {
  var scope = root || document;
  var marker = scope.querySelectorAll('[data-pruefschritt]');
  marker.forEach(function (el) {
    var key = el.getAttribute('data-pruefschritt');
    var eintrag = PRUEFSCHRITTE[key];
    if (!eintrag) {
      console.warn('renderPruefschritte: unbekannter Prüfschritt "' + key + '" (Marker ignoriert)');
      return;
    }
    var ctx = {};
    var ctxRoh = el.getAttribute('data-ctx');
    if (ctxRoh) {
      try { ctx = JSON.parse(ctxRoh); }
      catch (e) { console.warn('renderPruefschritte: data-ctx von "' + key + '" ist kein gültiges JSON', e); }
    }
    var html = eintrag.html(ctx);
    var platzhalter = document.createElement('div');
    platzhalter.innerHTML = html.trim();
    // Mehrere Wurzel-Elemente moeglich (aktuell nicht genutzt, aber robust) -
    // alle Kind-Elemente an Stelle des Markers einfuegen.
    while (platzhalter.firstChild) {
      el.parentNode.insertBefore(platzhalter.firstChild, el);
    }
    el.parentNode.removeChild(el);
  });
}
