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
 *
 * [9.6.0, Welle 4] Die Stromkreis-Karte hatte diesen Berührungsspannungs-/
 * Gefährdungs-Block bisher als eigene, komplett duplizierte Kopie in
 * pdf-generator.js addCircuitCard() stehen (siehe damaliger Kommentar "hier
 * bewusst NICHT aktiviert, um ein doppeltes Feld zu vermeiden"). Jetzt
 * per ctx.nurBeruehrungsspannung:true (liefert NUR das Spannungsart/
 * Gefährdung/UL-max/Umess-Grid, OHNE den RCD-Aufklapp-Rahmen mit In/IΔn/
 * IΔmess/Prüfstrom/tA) auch dort wiederverwendet - die dort abweichenden
 * Texte ("... / 120 V DC" bei den Gefährdungs-Optionen, "Maximal zulässige
 * Spannung U_L:" ohne "Berührungsspannung", "Gemessene Berührungsspannung
 * U_mess (V):" statt "U_L (V):", sowie eine eigene id am Umess-Feld statt nur
 * einer Klasse) werden über ctx.gefOptionen/ctx.ulMaxLabel/ctx.umessLabel/
 * ctx.umessId/ctx.umessWert/ctx.umessOnInput abgebildet, OHNE den
 * Übergabepunkt-Aufruf (ohne diese ctx-Werte) zu verändern.
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

    // [9.6.0, Welle 4] ctx.gefOptionen/ctx.ulMaxLabel/ctx.umessLabel/
    // ctx.umessId/ctx.umessWert/ctx.umessOnInput erlauben die Wiederverwendung
    // dieses Blocks fuer die Stromkreis-Karte (dort "Abschnitt 4.
    // Berührungsspannung & Netzart", bisher in pdf-generator.js hartcodiert
    // dupliziert): dort lauten die Gefaehrdungs-Optionen "... / 120 V DC" bzw.
    // "... / 60 V DC" (DC-Zusatz, da Stromkreise auch DC-Spannungsart kennen
    // koennen), das UL-Max-Label heisst "Maximal zulässige Spannung U_L:"
    // (ohne "Berührungsspannung") und das Messwertfeld traegt eine eigene id
    // (umess_${cardCounter}) statt der Klasse ohne id. OHNE diese ctx-Werte
    // bleibt die Ausgabe fuer den Uebergabepunkt (mitBeruehrungsspannung ohne
    // weitere Angaben) BYTE-IDENTISCH zu vorher.
    var gefOptionen = ctx.gefOptionen || ['Normalbereich (50 V AC)', 'Erhöhte Gefährdung (25 V AC)'];
    var ulMaxLabel = ctx.ulMaxLabel || 'Maximal zulässige Berührungsspannung U<sub>L</sub>:';
    var umessLabel = ctx.umessLabel || 'Gemessene Berührungsspannung U<sub>L</sub> (V):';
    var umessIdAttr = ctx.umessId !== undefined ? (' id="' + ctx.umessId + '"') : (' id="umess' + s + '"');
    // [Korrektur Welle 4] IMMER ein value-Attribut ausgeben (auch bei
    // undefined -> value=""), nicht nur wenn ctx.umessWert gesetzt ist -
    // das entspricht 1:1 dem alten, hartcodierten addCircuitCard()-Verhalten
    // (attrEsc(undefined) ergab dort schon immer '', also value=""). Ohne
    // diese Korrektur fehlte bei einer neuen/leeren Stromkreis-Karte das
    // value-Attribut komplett statt leer zu sein - funktional folgenlos
    // (jeder Aufrufer liest .value, nie hasAttribute('value')), aber keine
    // echte Byte-Identitaet zum Vorher-Zustand.
    var umessWertAttr = ' value="' + attrEsc(ctx.umessWert) + '"';
    var umessOnInput = ctx.umessOnInput || validateAufruf;

    var beruehrungsspannungHtml = '';
    if (mitBeruehrungsspannung) {
      beruehrungsspannungHtml =
        spannungsartHtml +
        '        <div class="form-group">\n' +
        '          <label for="gef' + s + '">Bereich / Gefährdung:</label>\n' +
        '          <select class="c-gefaehrdung" id="gef' + s + '" onchange="' + validateAufruf + '">\n' +
        '            <option value="normal">' + gefOptionen[0] + '</option>\n' +
        '            <option value="erhoeht">' + gefOptionen[1] + '</option>\n' +
        '          </select>\n' +
        '          <div class="limit-hint">Erhöhte Gefährdung z. B. Bühne, Open Air, feuchte/leitfähige Umgebung, Baustelle.</div>\n' +
        '        </div>\n' +
        '        <div class="form-group">\n' +
        '          <label>' + ulMaxLabel + '</label>\n' +
        '          <input type="text" class="c-ul-max" id="ul_max' + s + '" value="&le; 50 V AC" readonly>\n' +
        '        </div>\n' +
        '        <div class="form-group">\n' +
        '          <label>' + umessLabel + '</label>\n' +
        '          <input type="text" inputmode="decimal" class="c-umess"' + umessIdAttr + umessWertAttr + ' placeholder="z. B. 2,5 V" oninput="' + umessOnInput + '">\n' +
        '        </div>\n';
    }

    // [9.6.0, Welle 4] ctx.nurBeruehrungsspannung:true liefert NUR das
    // Spannungsart/Gefährdung/UL-max/Umess-Grid (OHNE den umgebenden
    // RCD-Messwerte-Aufklapp-Rahmen mit In/IΔn/IΔmess/Prüfstrom/tA) - damit
    // laesst sich der Block wiederverwenden, wo er (wie in der Stromkreis-
    // Karte, "Abschnitt 4. Berührungsspannung & Netzart") als EIGENER,
    // separater Abschnitt neben statt IN der RCD-Messwerte-Sektion steht
    // (siehe pdf-generator.js addCircuitCard() - der aeussere .sub-section/
    // .sub-title-Rahmen bleibt dort bestehen, nur das innere .grid kommt von
    // hier). ctx.mitBeruehrungsspannung muss dafuer ebenfalls true sein.
    if (ctx.nurBeruehrungsspannung) {
      return '<div class="grid">\n' + beruehrungsspannungHtml + '</div>';
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

/* ---------------------------------------------------------------------------
 * 17. STAMMDATEN-KOPF (Auftraggeber, Anlage-Bezeichnung, Protokoll-Nr., Prüfer,
 *     Prüfdatum, Prüfgerät, Seriennummer)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Bisher in allen drei Formularen fast wortgleich hartcodiert
 * (siehe Aenderungsbericht 9.5.0/9.6.0). Genuine Abweichung, die dabei
 * vereinheitlicht wird: "Anlage (Bezeichnung)" war in vde0100.html bereits ein
 * mitwachsendes <textarea class="auto-grow">, in anschlusspruefung.html/
 * geraetepruefung.html dagegen ein einfaches <input type="text"> - beide
 * Varianten teilen sich dieselbe id="anlage_bez" und werden per .value
 * gelesen (Autosave/PDF/Statusleiste), ein Wechsel auf <textarea> aendert
 * daran nichts. Hier wird deshalb EINHEITLICH die faehigere Variante
 * (Textarea) fuer alle drei Formulare verwendet - Platzhaltertext bleibt je
 * Formular unterschiedlich (ctx.anlageBezPlatzhalter).
 *
 * ctx.auftraggeberLabel: "Auftraggeber / Prüfort:" (vde0100/geraete) vs.
 *   "Auftraggeber / Veranstaltungsort:" (anschluss).
 * ctx.anlageBezLabel/ctx.anlageBezPlatzhalter: je Formular unterschiedlicher
 *   Text ("Anlage (Bezeichnung)" vde0100 vs. "Anlage / Objekt" anschluss/
 *   geraete).
 * ctx.protokollnummerPlatzhalter: je Formular anderes Praefix-Beispiel
 *   (PR-/AP-/GP-...).
 * ctx.datumOnChange (Pflicht): eigene Terminberechnung je Formular, siehe
 *   gleiches Muster bei PRUEFSCHRITTE.pruefintervall_schnellwahl.
 * ctx.mitMessgeraetSeriennummer (Default true): vde0100.html/
 *   anschlusspruefung.html/geraetepruefung.html haben alle drei "Verwendetes
 *   Prüfgerät" + "Seriennummer Messgerät" an dieser Stelle - Parameter nur
 *   fuer den unwahrscheinlichen Fall vorgesehen, dass ein Formular das einmal
 *   nicht mehr braucht, aendert am heutigen Verhalten nichts.
 *
 * WICHTIG: "Prüflings-ID" (id="pruefungsnummer", NUR in vde0100.html) ist
 * BEWUSST NICHT Teil dieses Bausteins - sie steht weiterhin als eigenes
 * Markup in vde0100.html zwischen den hier erzeugten Feldern (siehe
 * Kommentar dort). PRUEFSCHRITTE.pruefer_qualifikation IST Teil dieses
 * Bausteins, wird aber per DIREKTEM html()-Aufruf eingebettet (NICHT als
 * data-pruefschritt-Marker) - renderPruefschritte() scannt das Dokument nur
 * einmal, ein Marker, der erst durch das Einfuegen dieses Bausteins
 * entsteht, wuerde nie ersetzt (siehe Kommentar im html()-Code unten). Der
 * Baustein liefert deshalb zwei getrennte HTML-Fragmente ueber zwei Aufrufe
 * (auftraggeber+gebaeude+anlage werden vom Formular selbst ueber
 * gebaeude_bereich eingebunden) - siehe html()-Aufbau unten: dieser Baustein
 * deckt NUR "Anlage (Bezeichnung)" bis "Seriennummer Messgerät" ab, NICHT
 * "Auftraggeber" (das bleibt eigenes Feld je Formular, da vde0100.html es in
 * "grid-full" braucht und die Labels variieren) und NICHT Gebäude/Bereich
 * (das ist bereits PRUEFSCHRITTE.gebaeude_bereich).
 *
 * ctx.nurAnlageBez (nur vde0100.html): liefert AUSSCHLIESSLICH das Anlage-
 *   Bezeichnungs-Feld, ctx.ohneAnlageBez liefert alles ANDERE (Protokoll-Nr.
 *   bis Seriennummer) - vde0100.html braucht dazwischen Platz für das eigene
 *   Feld "Prüflings-ID" (id="pruefungsnummer"), das es nur dort gibt (siehe
 *   Kommentar oben) und deshalb nicht in einem einzigen zusammenhängenden
 *   Baustein-Aufruf stehen kann, ohne die urspruengliche Feldreihenfolge zu
 *   verschieben. Ohne diese beiden Flags (anschluss/geraete) liefert der
 *   Baustein wie bisher alles in einem Aufruf.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.stammdaten_kopf = {
  gruppe: 'Stammdaten',
  titel: 'Stammdaten-Kopf (Anlage-Bezeichnung, Protokoll-Nr., Prüfer, Prüfdatum, Prüfgerät)',
  beschreibung: 'Kernblock der allgemeinen Angaben: Anlage/Objekt-Bezeichnung (mitwachsendes Textfeld, seit 9.6.0 einheitlich in allen drei Formularen), Protokollnummer, Name der prüfenden Person, Prüfdatum (mit formularabhängiger Terminberechnung) sowie das verwendete Prüfgerät samt Seriennummer. Vollständige, korrekte Stammdaten sind Voraussetzung für ein rechtssicher zuordenbares Prüfprotokoll.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var anlageBezLabel = ctx.anlageBezLabel || 'Anlage (Bezeichnung):';
    var anlageBezPlatzhalter = ctx.anlageBezPlatzhalter || 'z. B. Hauptverteilung Unterbühne UV-1';
    var protokollnummerPlatzhalter = ctx.protokollnummerPlatzhalter || 'z. B. PR-2026-08-11-001';
    // WICHTIG: die drei Formulare hatten hier historisch leicht
    // unterschiedlichen Wortlaut (vde0100.html mit "kann ABER
    // ueberschrieben werden", anschluss/geraete ohne "aber") - kein
    // inhaltlicher Unterschied, aber fuer Byte-Identitaet ueber ctx steuerbar.
    var protokollnummerHinweis = ctx.protokollnummerHinweis || 'Wird automatisch vergeben, kann aber überschrieben werden. Erscheint im Kopf jeder PDF-Seite.';
    var datumOnChange = ctx.datumOnChange || 'updateNaechsterTermin';
    var mitMessgeraetSeriennummer = ctx.mitMessgeraetSeriennummer !== false;

    var anlageBezHtml =
      '<div class="form-group grid-full">\n' +
      '  <label for="anlage_bez">' + anlageBezLabel + '</label>\n' +
      '  <textarea id="anlage_bez" class="auto-grow" rows="1" placeholder="' + anlageBezPlatzhalter + '" oninput="this.style.height=\'auto\'; this.style.height=this.scrollHeight+\'px\'"></textarea>\n' +
      '</div>';
    if (ctx.nurAnlageBez) return anlageBezHtml;

    var messgeraetHtml = mitMessgeraetSeriennummer
      ? (
        '<div class="form-group"><label for="messgeraet">Verwendetes Prüfgerät:</label><input type="text" id="messgeraet"></div>\n' +
        '<div class="form-group"><label for="seriennummer">Seriennummer Messgerät:</label><input type="text" id="seriennummer"></div>'
      )
      : '';

    var restHtml =
      '<div class="form-group">\n' +
      '  <label for="protokollnummer">Protokoll-Nr.:</label>\n' +
      '  <input type="text" id="protokollnummer" placeholder="' + protokollnummerPlatzhalter + '">\n' +
      '  <div class="limit-hint">' + protokollnummerHinweis + '</div>\n' +
      '</div>\n' +
      '<div class="form-group"><label for="pruefer">Prüfer/-in (Name):</label><input type="text" id="pruefer" placeholder="z. B. Max Mustermann"></div>\n' +
      // WICHTIG: direkter Funktionsaufruf statt eines verschachtelten
      // data-pruefschritt-Markers - renderPruefschritte() scannt das
      // Dokument nur EINMAL (siehe Loader unten); ein Marker, der erst durch
      // das Einfuegen DIESES Bausteins entsteht, wuerde nie mehr ersetzt.
      PRUEFSCHRITTE.pruefer_qualifikation.html() + '\n' +
      '<div class="form-group"><label for="datum">Prüfdatum:</label><input type="date" id="datum" onchange="' + datumOnChange + '()"></div>\n' +
      messgeraetHtml;
    if (ctx.ohneAnlageBez) return restHtml;

    return anlageBezHtml + '\n' + restHtml;
  }
};

/* ---------------------------------------------------------------------------
 * 18. PRUEFART / NORM (VDE 0100-600 / 0105-100 bzw. -704)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Nur in vde0100.html und anschlusspruefung.html vorhanden
 * (id="pruefnorm", 2 Optionen, 2. Option vorbelegt). geraetepruefung.html hat
 * ein andersartiges, eigenständiges Feld "Prüfart" (id="pruefart", DIN EN
 * 50699/50678) - das ist KEIN Bestandteil dieses Bausteins und bleibt
 * unveraendert dort stehen (siehe Aufgabenbeschreibung).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefnorm_dropdown = {
  gruppe: 'Stammdaten',
  titel: 'Prüfart / Norm (DIN VDE 0100-600/-704 / 0105-100)',
  beschreibung: 'Legt fest, ob nach Erst- oder Wiederholungsprüfungsnorm geprüft wird - bestimmt u. a. den anzuwendenden Grenzwertesatz. Wiederholungsprüfung (DIN VDE 0105-100) ist der praxisübliche Regelfall und deshalb vorbelegt.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var optionen = ctx.optionen || ['DIN VDE 0100-600 (Erstprüfung)', 'DIN VDE 0105-100 (Wiederholungsprüfung)'];
    var optsHtml = optionen.map(function (o, i) {
      return '<option' + (i === 1 ? ' selected' : '') + '>' + o + '</option>';
    }).join('\n          ');
    return (
      '<div class="form-group">\n' +
      '  <label for="pruefnorm">Prüfart / Norm:</label>\n' +
      '  <select id="pruefnorm">\n' +
      '          ' + optsHtml + '\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 19. GRUND DER PRUEFUNG
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] In allen drei Formularen vorhanden, gleiche id
 * (pruefgrund), gleiches Muster ("Wiederholungsprüfung" vorbelegt als erste
 * Option), aber unterschiedliche nachfolgende Optionen je Formular (siehe
 * ctx.optionen).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefgrund_dropdown = {
  gruppe: 'Stammdaten',
  titel: 'Grund der Prüfung',
  beschreibung: 'Dokumentiert den Anlass der Prüfung (Wiederholung, Neuanlage/-anschaffung, Änderung, Reparatur, ...) - wichtig für die Nachvollziehbarkeit im Prüfarchiv.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var optionen = ctx.optionen || ['Neuanlage', 'Änderung', 'Erweiterung', 'Instandsetzung'];
    var opts = optionen.map(function (o) { return '<option>' + o + '</option>'; }).join('\n          ');
    return (
      '<div class="form-group">\n' +
      '  <label for="pruefgrund">Grund der Prüfung:</label>\n' +
      '  <select id="pruefgrund">\n' +
      '          <option selected>Wiederholungsprüfung</option>\n' +
      '          ' + opts + '\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 20. NETZBETREIBER-KONTAKT (VNB + anschluss-spezifische Bereitsteller-Felder)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] "Verteilnetzbetreiber (VNB)" (id="vnb") ist byte-identisch
 * in vde0100.html und anschlusspruefung.html (gleiches title-Attribut) - EIN
 * gemeinsamer Baustein. Die anschluss-spezifischen Felder (Firma/Vermieter,
 * Ansprechpartner, Telefon) gibt es nur dort - sie werden ueber
 * ctx.mitBereitstellerFelder zusaetzlich eingeblendet, damit fuer diese vier
 * inhaltlich zusammengehoerenden Felder nicht extra ein zweiter, praktisch
 * immer gemeinsam benutzter Baustein gepflegt werden muss.
 * ctx.vnbPlatzhalter: anschlusspruefung.html hat einen Platzhaltertext
 *   ("z. B. Stadtwerke Konstanz"), vde0100.html keinen - siehe Original-HTML.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.netzbetreiber_kontakt = {
  gruppe: 'Netzsystem',
  titel: 'Verteilnetzbetreiber (VNB) + Bereitsteller-Kontakt (Anschlussprüfung)',
  beschreibung: 'Verteilnetzbetreiber = der öffentliche Netzbetreiber am Anschlusspunkt. Bei der Anschlussprüfung zusätzlich Firma/Vermieter und Ansprechpartner des Stromlieferanten am Übergabepunkt (z. B. Vermieter der Veranstaltungstechnik, Baustromverteiler-Betreiber) - wichtig, falls im Prüfzeitraum Rückfragen zur Einspeisung entstehen.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var vnbPlatzhalterAttr = ctx.vnbPlatzhalter ? (' placeholder="' + ctx.vnbPlatzhalter + '"') : '';
    // WICHTIG: die urspruengliche Feldreihenfolge in anschlusspruefung.html
    // war firma_vermieter, VNB, bereitsteller_ansprechpartner,
    // bereitsteller_telefon - "vnb" steht also NICHT vor oder nach dem
    // gesamten Bereitsteller-Block, sondern mittendrin. Deshalb hier explizit
    // in zwei Teile aufgeteilt (vor/nach vnb), statt den ganzen
    // Bereitsteller-Block vor vnb zu haengen.
    var firmaVermieterHtml = ctx.mitBereitstellerFelder
      ? '<div class="form-group"><label for="firma_vermieter">Firma / Vermieter:</label><input type="text" id="firma_vermieter" placeholder="z. B. Veranstaltungstechnik Mustermann GmbH"></div>\n'
      : '';
    var ansprechpartnerTelefonHtml = ctx.mitBereitstellerFelder
      ? ('\n<div class="form-group"><label for="bereitsteller_ansprechpartner">Ansprechpartner/-in (optional):</label><input type="text" id="bereitsteller_ansprechpartner"></div>\n' +
         '<div class="form-group"><label for="bereitsteller_telefon">Telefon (optional):</label><input type="text" id="bereitsteller_telefon"></div>')
      : '';
    return (
      firmaVermieterHtml +
      '<div class="form-group"><label for="vnb">Verteilnetzbetreiber (VNB):</label><input type="text" id="vnb"' + vnbPlatzhalterAttr + ' title="Verteilnetzbetreiber – der öffentliche Netzbetreiber am Anschlusspunkt"></div>' +
      ansprechpartnerTelefonHtml
    );
  }
};

/* ---------------------------------------------------------------------------
 * 21. ART DER EINSPEISUNG (vde0100: einspeisung / anschluss: einspeisung_art)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] ZWEI unterschiedliche, bewusst NICHT zusammengelegte
 * Felder (unterschiedliche id, unterschiedliche Optionen, unterschiedlicher
 * onchange-Handler) - vde0100.html fragt nach der Energiequelle der
 * BESTEHENDEN Anlage (Netz/NEA/Wechselrichter), anschlusspruefung.html nach
 * der Art des temporaeren Veranstaltungs-Anschlusses (Festanschluss/
 * Baustrom/Generator/Sonstiges). Der gemeinsame HTML-Rahmen (form-group +
 * select + optionaler Hinweistext) wird trotzdem hier zentral gepflegt, um
 * Copy-Paste zu vermeiden - ctx.id/ctx.onChange/ctx.optionen/ctx.hinweistext
 * geben die komplette Formular-spezifische Auspraegung vor.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.einspeisung_auswahl = {
  gruppe: 'Netzsystem',
  titel: 'Art der Einspeisung (Energiequelle bzw. Anschlussart)',
  beschreibung: 'Bestimmt u. a., ob die Frequenzmessung Pflichtangabe ist (Netzersatzanlage/Wechselrichter: Sollwert 50 Hz ist dort ein echter Prüfwert, nicht nur eine Zusatzinfo). id, Optionen und onchange-Ziel unterscheiden sich zwischen Anlagenprüfung (Energiequelle der bestehenden Anlage) und Anschlussprüfung (Art des temporären Veranstaltungsanschlusses) bewusst.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var id = ctx.id || 'einspeisung';
    var onChange = ctx.onChange || 'updateEinspeisung';
    var optionen = ctx.optionen || ['Netz (VNB)', 'Netzersatzanlage (NEA / Aggregat)', 'Wechselrichter / Batteriespeicher'];
    // WICHTIG: vde0100.html markiert die erste Option historisch explizit mit
    // "selected" (Default hier unveraendert true), anschlusspruefung.html
    // dagegen NIE - dort waehlt der Browser implizit die erste Option, ohne
    // das Attribut im Markup zu setzen. ctx.mitSelectedErsteOption steuert das.
    var mitSelectedErsteOption = ctx.mitSelectedErsteOption !== false;
    var opts = optionen.map(function (o, i) {
      return '<option' + (i === 0 && mitSelectedErsteOption ? ' selected' : '') + '>' + o + '</option>';
    }).join('\n          ');
    var hinweisHtml = ctx.hinweistext ? ('\n        <div class="limit-hint">' + ctx.hinweistext + '</div>') : '';
    return (
      '<div class="form-group">\n' +
      '  <label for="' + id + '">Art der Einspeisung:</label>\n' +
      '  <select id="' + id + '" onchange="' + onChange + '(' + (ctx.onChangeArg !== undefined ? ctx.onChangeArg : '') + ')">\n' +
      '          ' + opts + '\n' +
      '  </select>' + hinweisHtml + '\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 22. NETZART-AUSWAHL (Drehstrom / 1-phasig)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Bisher ZWEI unabhaengig gepflegte, inhaltlich fast
 * identische Dropdowns: vde0100.html "netzmessung_netzart"
 * (onchange="updateNetzmessungNetzart()", 2. Option zusaetzlich mit ", z. B.
 * Schukosteckdose") und anschlusspruefung.html "netzart" (class="c-netzart",
 * onchange="updateFeedNetzart()"). IDs/Klassen bleiben unveraendert (werden
 * von den jeweiligen update*()-Funktionen per getElementById/Klasse gelesen),
 * nur das HTML-Skelett wird hier zentral gepflegt.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.netzart_auswahl = {
  gruppe: 'Netzsystem',
  titel: 'Netzart (Drehstrom / 1-phasiger Wechselstrom)',
  beschreibung: 'Steuert, ob die drehstromspezifischen Messfelder (L2, L3, Außenleiterspannungen) überhaupt eingeblendet werden. id/Klasse bleiben je Formular unterschiedlich (netzmessung_netzart in der Anlagenprüfung, netzart/c-netzart am Übergabepunkt), da beide von eigenen onchange-Funktionen ausgewertet werden.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var id = ctx.id || 'netzmessung_netzart';
    var klasseAttr = ctx.klasse ? (' class="' + ctx.klasse + '"') : '';
    var onChange = ctx.onChange || 'updateNetzmessungNetzart';
    // WICHTIG: mit !== undefined statt || pruefen, da ein leerer String
    // ('') ein bewusst uebergebener, gueltiger Wert ist (kein "nicht gesetzt")
    // - anschlusspruefung.html uebergibt hier bewusst '', um exakt den
    // bisherigen Text "230 V" ohne Zusatz zu erhalten.
    var zweiteOptionZusatz = ctx.zweiteOptionZusatz !== undefined ? ctx.zweiteOptionZusatz : ', z. B. Schukosteckdose';
    return (
      '<div class="form-group"' + (ctx.mitMarginBottom ? ' style="margin-bottom:10px;"' : '') + '>\n' +
      '  <label for="' + id + '">Netzart:</label>\n' +
      '  <select' + klasseAttr + ' id="' + id + '" onchange="' + onChange + '()">\n' +
      '    <option value="Drehstrom" selected>Drehstrom (400 V, 3 Außenleiter)</option>\n' +
      '    <option value="1-phasig">1-phasiger Wechselstrom (230 V' + zweiteOptionZusatz + ')</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 23. ART DES SPEISEPUNKTS
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] vde0100.html "netzmessung_speisepunkt_art"
 * (onchange="updateNetzmessungArt()", zusaetzlich id="netzmessung_art_hint"
 * am Hinweistext) vs. anschlusspruefung.html "speisepunkt_art"
 * (onchange="updateFeedSpeisepunktArt()", KEIN Hinweistext mit eigener id).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.speisepunkt_art_auswahl = {
  gruppe: 'Netzsystem',
  titel: 'Art des Speisepunkts (fest verkabelt / Steckstelle)',
  beschreibung: 'Bei Versorgung über eine Steckstelle (Kupplung/Steckdose/Verlängerung) wird die Steckverbindung selbst zur Pflichtangabe (siehe PRUEFSCHRITTE.steckverbindung_auswahl) - die Messung der Spannungen selbst erfolgt unabhängig davon am Speisepunkt.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var id = ctx.id || 'netzmessung_speisepunkt_art';
    var onChange = ctx.onChange || 'updateNetzmessungArt';
    var hintId = ctx.hintId; // nur vde0100: "netzmessung_art_hint"
    var hinweistext = ctx.hinweistext || 'Messung wie gehabt am Speisepunkt – die einfache Messung nur der 230-V-Werte bleibt jederzeit möglich, eine volle 400-V-Drehstrommessung ist nicht zwingend.';
    var hintAttr = hintId ? (' id="' + hintId + '"') : '';
    // WICHTIG: vde0100.html hatte historisch einen erklaerenden Hinweistext
    // unter diesem Feld, anschlusspruefung.html dagegen NIE - ctx.mitHinweistext
    // steuert das (Default true = bisheriges vde0100-Verhalten unveraendert),
    // anschlusspruefung.html uebergibt explizit false.
    var mitHinweistext = ctx.mitHinweistext !== false;
    var hinweisHtml = mitHinweistext
      ? ('\n  <div class="limit-hint"' + hintAttr + '>' + hinweistext + '</div>')
      : '';
    return (
      '<div class="form-group"' + (ctx.mitMarginBottom ? ' style="margin-bottom:10px;"' : '') + '>\n' +
      '  <label for="' + id + '">Art des Speisepunkts:</label>\n' +
      '  <select id="' + id + '" onchange="' + onChange + '()">\n' +
      '    <option value="Fest verkabelt">Fest verkabelt (Klemme/Verteiler)</option>\n' +
      '    <option value="Steckstelle" selected>Steckstelle (Kupplung/Steckdose/Verlängerung)</option>\n' +
      '  </select>' + hinweisHtml + '\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 24. STECKVERBINDUNG MITGEPRUEFT
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Nur sichtbar, wenn Speisepunkt = Steckstelle (siehe
 * #netzmessung_steckstelle_gruppe/#feed_steckstelle_gruppe - die WRAPPER-Divs
 * mit ihren ids bleiben in den Formularen selbst stehen, siehe Aufgabe; nur
 * das innere <select> kommt aus diesem Baustein). vde0100.html
 * "netzmessung_steckverbindung" ohne onchange, anschlusspruefung.html
 * "steckverbindung" ebenfalls ohne onchange - IDENTISCHES Skelett, nur der
 * Hinweistext unterscheidet sich geringfügig ("z. B. CEE-Kupplung am
 * Übergabepunkt" nur bei anschluss).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.steckverbindung_auswahl = {
  gruppe: 'Netzsystem',
  titel: 'Steckverbindung mitgeprüft (Zustand, Verriegelung, Kontakt)',
  beschreibung: 'Bei Versorgung über eine Steckstelle ist die Steckverbindung selbst (Zustand, Verriegelung, Kontaktgabe) zwingend mitzuprüfen, unabhängig von der Spannungsmessung am Speisepunkt.',
  verwendetIn: ['vde0100', 'anschluss'],
  html: function (ctx) {
    ctx = ctx || {};
    var id = ctx.id || 'netzmessung_steckverbindung';
    var hinweistext = ctx.hinweistext || 'Bei Versorgung über eine Steckstelle ist die Steckverbindung selbst zwingend mitzuprüfen (Pflichtangabe) – die Messung der Spannungen erfolgt weiterhin am Speisepunkt, nicht zusätzlich an jeder einzelnen Steckdose.';
    return (
      '<label for="' + id + '">Steckverbindung mitgeprüft (Zustand, Verriegelung, Kontakt):</label>\n' +
      '<select id="' + id + '">\n' +
      '  <option value="" selected>– bitte wählen –</option>\n' +
      '  <option>i.O.</option>\n' +
      '  <option>n.i.O.</option>\n' +
      '</select>\n' +
      '<div class="limit-hint">' + hinweistext + '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 24b. DREHFELDRICHTUNG (Übergabepunkt, Anschlussprüfung)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] anschlusspruefung.html-eigenes Feld (id="drehfeld",
 * class="c-drehfeld erp-item", onchange="sichtErpNiOPruefen(this)") - nutzt
 * dasselbe i.O./n.i.O./n.a.-Klassenmuster wie PRUEFSCHRITTE.sicht_erp_item,
 * ist aber bewusst NICHT über diesen Baustein abgebildet: sicht_erp_item
 * rendert Options-TEXT und -WERT immer identisch ("i.O." als Text UND als
 * Wert), waehrend das Drehfeld-Feld unterschiedlichen Text ("i.O. –
 * rechtsdrehend") bei gleichem Wert ("i.O.") braucht, damit
 * sichtErpNiOPruefen()/die PDF-Ausgabe weiterhin exakt "i.O."/"n.i.O." als
 * .value lesen. Ein Erzwingen in sicht_erp_item haette dort eine neue
 * Verzweigung nur fuer diesen einen Aufrufer noetig gemacht - deshalb ein
 * eigener, kleiner Baustein.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.drehfeld_auswahl = {
  gruppe: 'Sichtprüfung / Erproben',
  titel: 'Drehfeldrichtung (bei Drehstrom, Übergabepunkt)',
  beschreibung: 'Prüft, ob das Drehfeld am Übergabepunkt rechtsdrehend ist (Voraussetzung für korrekte Drehrichtung angeschlossener Drehstrommotoren, z. B. Bühnenzüge/Hebebühnen) - ein linksdrehendes Feld ist ein klassischer Fehler nach Reparatur/Neuverkabelung des Anschlusses.',
  verwendetIn: ['anschluss'],
  html: function () {
    return (
      '<div class="form-group">\n' +
      '  <label for="drehfeld">Drehfeldrichtung (bei Drehstrom):</label>\n' +
      '  <select class="c-drehfeld erp-item" id="drehfeld" onchange="sichtErpNiOPruefen(this)">\n' +
      '    <option value="" selected>– bitte wählen –</option>\n' +
      '    <option value="i.O.">i.O. – rechtsdrehend</option>\n' +
      '    <option value="n.i.O.">n.i.O. – linksdrehend</option>\n' +
      '    <option value="n.a.">n.a.</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 25. NETZMESSUNGS-FELDGRUPPE (Netzart, Frequenz, U_N-PE) - GEMEINSAMER RAHMEN
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Bewusst KEIN Baustein fuer frequenz/netzfrequenz und
 * u_npe/unpe selbst (siehe ausfuehrlicher Kommentar bei
 * PRUEFSCHRITTE.netzmessung_spannungsgrid weiter oben, Punkt 14 - per
 * Nutzerentscheid unveraendert getrennt gehalten). Dieser Eintrag existiert
 * NICHT als html()-Baustein, sondern rein als Dokumentations-/Verweiseintrag
 * fuer die Master-Uebersicht, damit auch die bewusst NICHT zusammengelegten
 * Felder dort auffindbar sind. -->  ENTFERNT: siehe Begruendung oben, kein
 * eigener Eintrag noetig (Doku steht bereits bei netzmessung_spannungsgrid).
 * ------------------------------------------------------------------------ */

/* ---------------------------------------------------------------------------
 * 26. PRUEFUMFANG (Auswahl-Variante: vde0100 + geraete)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] vde0100.html/geraetepruefung.html nutzen ein <select> mit
 * unterschiedlichem Optionstext ("100 % der Anlage" vs. "alle Geräte"),
 * anschlusspruefung.html dagegen ein einfaches Freitextfeld (siehe
 * PRUEFSCHRITTE.pruefumfang_freitext) - eine Umstellung dort auf <select>
 * wuerde den Inhalt bestehender Autosave-/Archiv-Datensaetze/PDF-Ausgaben
 * inhaltlich veraendern und bleibt deshalb bewusst unangetastet.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefumfang_auswahl = {
  gruppe: 'Bewertung',
  titel: 'Prüfumfang (Auswahl: Vollprüfung / Stichprobe)',
  beschreibung: 'Nach DIN VDE 0105-100 bei Wiederholungsprüfungen anzugeben, ob die gesamte Anlage/alle Geräte oder nur eine Stichprobe geprüft wurden. Bei „Stichprobe" muss der geprüfte Umfang in den Bemerkungen benannt werden, da sonst unklar bliebe, wofür die Prüfplakette tatsächlich gilt.',
  verwendetIn: ['vde0100', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var optionen = ctx.optionen || ['Vollprüfung (100 % der Anlage)', 'Stichprobe – siehe Bemerkung für Umfang'];
    var opts = optionen.map(function (o) { return '<option>' + o + '</option>'; }).join('\n          ');
    return (
      '<div class="form-group grid-full">\n' +
      '  <label for="pruefumfang">Prüfumfang:</label>\n' +
      '  <select id="pruefumfang">\n' +
      '          ' + opts + '\n' +
      '  </select>\n' +
      '  <div class="limit-hint">Nach DIN VDE 0105-100 bei Wiederholungsprüfungen anzugeben. Bei „Stichprobe" bitte den geprüften Umfang (z. B. Anteil, Auswahlkriterium) unten in den Bemerkungen benennen.</div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 27. PRUEFUMFANG (Freitext-Variante: nur anschluss)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Einzelfeld ohne Formular-uebergreifende Duplikation, aus
 * Konsistenzgruenden trotzdem als eigener, dokumentierter/live-testbarer
 * Baustein gefuehrt statt als loses Inline-HTML. NICHT auf die Select-
 * Variante umgestellt (siehe Kommentar bei pruefumfang_auswahl).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefumfang_freitext = {
  gruppe: 'Bewertung',
  titel: 'Prüfumfang (Freitext, Anschlussprüfung)',
  beschreibung: 'Kurzbeschreibung, was am Übergabepunkt geprüft wurde (Besichtigen/Erproben/Messen). Bleibt bewusst Freitext statt Auswahl, damit bestehende Datensätze/PDF-Ausgaben unverändert lesbar bleiben.',
  verwendetIn: ['anschluss'],
  html: function () {
    return (
      '<div class="form-group grid-full">\n' +
      '  <label for="pruefumfang">Prüfumfang:</label>\n' +
      '  <input type="text" id="pruefumfang" placeholder="z. B. Übergabepunkt vollständig geprüft (Besichtigen, Erproben, Messen)">\n' +
      '  <div class="limit-hint">Kurz benennen, was geprüft wurde - insbesondere bei einer Stichprobe oder Teilprüfung.</div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 28. GESAMTBEWERTUNG MÄNGEL
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Byte-identisch in allen drei Formularen.
 * [9.8.0, Welle 5] ctx.idSuffix/ctx.klasse ergaenzt: die Geraetepruefung
 * bewertet Maengel seit 9.8.0 PRO GERAET (id="res_maengel_<Kartennummer>"
 * statt einer einzigen globalen id="res_maengel") - siehe addDeviceCard() in
 * js/geraete-generator.js. Ohne ctx (vde0100/anschluss) unveraendertes
 * Verhalten: id bleibt "res_maengel", keine zusaetzliche Klasse. */
PRUEFSCHRITTE.res_maengel_dropdown = {
  gruppe: 'Bewertung',
  titel: 'Gesamtbewertung Mängel',
  beschreibung: 'Zusammenfassende Mängelbewertung des gesamten Prüfobjekts - Grundlage für Prüfplakette und Freigabeentscheidung. In der Geräteprüfung seit 9.8.0 pro Gerät (eigene id je Karte, siehe ctx.idSuffix).',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var idSuffix = ctx.idSuffix || '';
    var id = 'res_maengel' + idSuffix;
    var klasseAttr = ctx.klasse ? (' ' + ctx.klasse) : '';
    return (
      '<div class="form-group">\n' +
      '  <label for="' + id + '">Gesamtbewertung Mängel:</label>\n' +
      '  <select id="' + id + '" class="c-res-maengel' + klasseAttr + '">\n' +
      '    <option>Keine Mängel festgestellt</option>\n' +
      '    <option>Mängel festgestellt und behoben (siehe Bemerkung)</option>\n' +
      '    <option>Mängel festgestellt (siehe Bemerkung)</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 29. PRUEFPLAKETTE ERTEILT
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Byte-identisch in allen drei Formularen.
 * [9.8.0, Welle 5] ctx.idSuffix/ctx.klasse ergaenzt (siehe Kommentar bei
 * res_maengel_dropdown - dieselbe Begruendung fuer die Geraetepruefung).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.res_plakette_dropdown = {
  gruppe: 'Bewertung',
  titel: 'Prüfplakette erteilt',
  beschreibung: 'Dokumentiert, ob nach der Prüfung eine Prüfplakette angebracht wurde - sichtbarer Nachweis für Betreiber/Behörde, wann die nächste Prüfung fällig ist. In der Geräteprüfung seit 9.8.0 pro Gerät (eigene id je Karte, siehe ctx.idSuffix).',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var idSuffix = ctx.idSuffix || '';
    var id = 'res_plakette' + idSuffix;
    var klasseAttr = ctx.klasse ? (' ' + ctx.klasse) : '';
    return '<div class="form-group"><label for="' + id + '">Prüfplakette erteilt:</label><select id="' + id + '" class="c-res-plakette' + klasseAttr + '"><option>Ja</option><option>Nein</option></select></div>';
  }
};

/* ---------------------------------------------------------------------------
 * 30. ANSCHLUSSLEISTUNG AUSREICHEND (nur Anschlussprüfung)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Einzelfeld ohne Formular-uebergreifende Duplikation, aus
 * Konsistenzgruenden zentralisiert (Dokumentation/Live-Test).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.res_leistung_ausreichend_dropdown = {
  gruppe: 'Bewertung',
  titel: 'Anschlussleistung ausreichend für geplante Last',
  beschreibung: 'Bewertet, ob die vertraglich vereinbarte/tatsächlich verfügbare Anschlussleistung für die angeschlossene Veranstaltungstechnik ausreicht - eine unterdimensionierte Einspeisung ist ein häufiger, aber rein elektrisch (Spannungen/Isolationswerte) nicht messbarer Mangel.',
  verwendetIn: ['anschluss'],
  html: function () {
    return '<div class="form-group"><label for="res_leistung_ausreichend">Anschlussleistung ausreichend für geplante Last:</label><select id="res_leistung_ausreichend"><option>Ja</option><option>Nein</option><option>n.a.</option></select></div>';
  }
};

/* ---------------------------------------------------------------------------
 * 31. NÄCHSTER PRÜFTERMIN (Monat/Jahr) + Bestätigungs-Checkbox-Platzhalter
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Byte-/wortidentisch in vde0100.html und
 * anschlusspruefung.html ("Ergibt sich aus dem Prüfintervall..."),
 * geraetepruefung.html weicht im Label ("...automatisch)") und Hinweistext
 * ("...aus der Prüffrist...") geringfuegig ab - beides ueber ctx steuerbar.
 * Der #pruefdatum_bestaetigung_platzhalter-Div bleibt als leeres Element
 * bestehen: pruefterminBestaetigungHtml() (js/infokarten.js) befuellt ihn zur
 * Laufzeit selbststaendig (siehe PRUEFSCHRITTE.pruefdatum_bestaetigung_checkbox
 * weiter unten) - dieser Baustein erzeugt nur den leeren Platzhalter mit.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.res_termin_date_feld = {
  gruppe: 'Bewertung',
  titel: 'Nächster Prüftermin (Monat/Jahr)',
  beschreibung: 'Ergibt sich automatisch aus dem gewählten Prüfintervall (siehe PRUEFSCHRITTE.pruefintervall_schnellwahl), kann aber überschrieben werden. Die Bestätigungs-Checkbox direkt darunter (pruefterminBestaetigungHtml) verlangt eine bewusste Kenntnisnahme, bevor das Formular als vollständig gilt.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var label = ctx.label || 'Nächster Prüftermin (Monat/Jahr):';
    var hinweistext = ctx.hinweistext || 'Ergibt sich aus dem Prüfintervall, kann überschrieben werden.';
    return (
      '<div class="form-group">\n' +
      '  <label for="res_termin_date">' + label + '</label>\n' +
      '  <input type="month" id="res_termin_date">\n' +
      '  <div class="limit-hint">' + hinweistext + '</div>\n' +
      '  <div id="pruefdatum_bestaetigung_platzhalter"></div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 32. SICHERER GEBRAUCH GEWÄHRLEISTET (res_gewaehrleistung / res_freigabe)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] PER NUTZERENTSCHEID bewusst unterschiedliche ids
 * beibehalten (vde0100/geraete: res_gewaehrleistung, anschluss: res_freigabe)
 * - keine Umbenennung, nur die HTML-Struktur wird ueber ctx.id parametrisiert
 * zentral gepflegt. Das sichtbare Label ist in allen drei Formularen
 * identisch ("Sicherer Gebrauch gewährleistet:"), nur der Options-Text der
 * ersten Option ("Ja (...)") unterscheidet sich je Formular.
 * ------------------------------------------------------------------------ */
/* [9.8.0, Welle 5] ctx.idSuffix ergaenzt: Geraetepruefung bewertet "Sicherer
 * Gebrauch gewaehrleistet" seit 9.8.0 PRO GERAET (id="res_gewaehrleistung_<N>").
 * idSuffix wird HINTER ein evtl. gesetztes ctx.id gehaengt (ctx.id bleibt der
 * volle Override-Mechanismus fuer den anschluss-Sonderfall "res_freigabe",
 * idSuffix kommt zusaetzlich fuer die Pro-Geraet-Zaehlung dazu - beide
 * Formulare brauchen das nie gleichzeitig, schliessen sich aber auch nicht
 * gegenseitig aus). */
PRUEFSCHRITTE.res_gewaehrleistung_dropdown = {
  gruppe: 'Bewertung',
  titel: 'Sicherer Gebrauch gewährleistet',
  beschreibung: 'Abschließende Freigabeentscheidung: bestätigt, dass die Anlage/die Geräte/der Übergabepunkt sicher weiterbetrieben bzw. genutzt werden können. "Nein" markiert ein Sicherheitsrisiko und muss durch die Bemerkungen begründet sein. In der Geräteprüfung seit 9.8.0 pro Gerät (eigene id je Karte, siehe ctx.idSuffix).',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var idSuffix = ctx.idSuffix || '';
    var id = (ctx.id || 'res_gewaehrleistung') + idSuffix;
    var jaLabel = ctx.jaLabel || 'Ja (Anlage entspricht VDE-Regeln)';
    var klasseAttr = ctx.klasse ? (' ' + ctx.klasse) : '';
    return (
      '<div class="form-group">\n' +
      '  <label for="' + id + '">Sicherer Gebrauch gewährleistet:</label>\n' +
      '  <select id="' + id + '" class="c-res-gewaehrleistung' + klasseAttr + '">\n' +
      '    <option value="Ja">' + jaLabel + '</option>\n' +
      '    <option value="Nein">Nein (Sicherheitsrisiko)</option>\n' +
      '  </select>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 33. MÄNGEL / BEMERKUNGEN / AUFLAGEN (Textarea + Foto-Platzhalter)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Byte-identisch in allen drei Formularen. Der
 * #bemerkungen_fotos_platzhalter-Div bleibt leer bestehen - wird von jedem
 * Formular selbst per fotosLeisteHtml(...) befuellt (siehe Aufruf am Ende
 * jeder Formularseite), NICHT Teil dieses Bausteins.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.res_bemerkungen_feld = {
  gruppe: 'Bewertung',
  titel: 'Mängel / Bemerkungen / Auflagen',
  beschreibung: 'Freitextfeld für alle Mängel, Einschränkungen und Auflagen, die sich aus der Prüfung ergeben - Pflichtangabe, sobald "Gesamtbewertung Mängel" nicht "Keine Mängel festgestellt" lautet.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function () {
    return (
      '<div class="form-group" style="margin-top: 8px;">\n' +
      '  <label for="res_bemerkungen">Mängel / Bemerkungen / Auflagen:</label>\n' +
      '  <textarea id="res_bemerkungen" class="auto-grow" rows="3" placeholder="Hier Mängel oder sonstige Bemerkungen eintragen..." oninput="this.style.height=\'auto\'; this.style.height=this.scrollHeight+\'px\'"></textarea>\n' +
      '  <div id="bemerkungen_fotos_platzhalter"></div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 34. LEERFORMULAR: ANZAHL BLÄTTER
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] vde0100.html + geraetepruefung.html, NICHT in
 * anschlusspruefung.html (dort gibt es kein mehrseitiges Leerformular, da
 * immer nur ein Übergabepunkt existiert). Optionstext und Hinweistext
 * unterscheiden sich (Geräte-Anzahl je Blatt vs. reine Blattzahl).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.leer_blaetter_auswahl = {
  gruppe: 'Bewertung',
  titel: 'Leerformular: Anzahl Blätter',
  beschreibung: 'Steuert beim Ausdrucken eines leeren Formulars (Hand-Ausfüllung vor Ort ohne Tablet/Laptop) die Anzahl vorbereiteter Fortsetzungsblätter für die Mess-/Gerätetabelle.',
  verwendetIn: ['vde0100', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var optionen = ctx.optionen || ['1 Blatt', '2 Blätter', '3 Blätter', '4 Blätter'];
    var hinweistext = ctx.hinweistext || 'Blatt 2 und folgende sind Fortsetzungsblätter: nur die Messtabelle, mit fortlaufender Nummerierung. Kopf, Bewertung und Unterschriften stehen einmal auf Blatt 1.';
    var opts = optionen.map(function (o, i) {
      return '<option value="' + (i + 1) + '"' + (i === 0 ? ' selected' : '') + '>' + o + '</option>';
    }).join('\n          ');
    return (
      '<div class="form-group" style="max-width:230px; margin:0 12px 0 0;">\n' +
      '  <label for="leer_blaetter" style="font-size:0.78rem;">Leerformular: Anzahl Blätter</label>\n' +
      '  <select id="leer_blaetter">\n' +
      '          ' + opts + '\n' +
      '  </select>\n' +
      '  <div class="limit-hint">' + hinweistext + '</div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 35. UNTERSCHRIFTEN: ORT + DATUM DER UNTERZEICHNUNG
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] "Ort" byte-identisch, "Datum" bis auf den Hinweistext
 * identisch (vde0100.html hat einen laengeren Zusatz "(bisher stand dort eine
 * leere Linie)").
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.unterschrift_ort_datum = {
  gruppe: 'Unterschriften',
  titel: 'Ort und Datum der Unterzeichnung',
  beschreibung: 'Ort und Datum, an dem das Protokoll unterzeichnet wurde - wird im PDF unter beide Unterschriftsfelder gedruckt.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var hinweistext = ctx.hinweistext || 'Wird unter beide Unterschriften gedruckt.';
    return (
      '<div class="form-group"><label for="unterschrift_ort">Ort der Unterzeichnung:</label><input type="text" id="unterschrift_ort"></div>\n' +
      '<div class="form-group">\n' +
      '  <label for="unterschrift_datum">Datum der Unterzeichnung:</label>\n' +
      '  <input type="date" id="unterschrift_datum">\n' +
      '  <div class="limit-hint">' + hinweistext + '</div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 36. UNTERSCHRIFTEN-BLOCK (Signaturpads Prüfer + zweite Partei)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Erster Signer ist in allen drei Formularen
 * byte-identisch (sigPruefer/sigPruefer_label/padPruefer.clear()). Zweiter
 * Signer PER NUTZERENTSCHEID bewusst unterschiedlich benannt: sigKunde
 * (vde0100/geraete) vs. sigAuftraggeber (anschluss) - ueber ctx.zweiterSignerId
 * + ctx.zweiterSignerLabel gesteuert, KEINE Vereinheitlichung der ids. Die
 * Canvas-Initialisierung (initSignaturePads()/initSignaturePadsAnschluss(),
 * jeweils im eigenen <script>-Block am Seitenende) liest weiterhin per
 * getElementById genau diese ids - bleibt unveraendert funktionsfaehig,
 * solange die ids hier exakt gleich bleiben.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.unterschriften_block = {
  gruppe: 'Unterschriften',
  titel: 'Unterschriften-Block (Prüfer/-in + zweite Partei)',
  beschreibung: 'Zwei Signaturfelder (HTML-Canvas mit signature_pad-Bibliothek): Prüfer/-in ist in allen drei Formularen gleich benannt, die zweite unterzeichnende Partei heißt je nach Formular unterschiedlich (Kunde/Betreiber bzw. Auftraggeber) - beides ist Teil der Konformitätsbestätigung und macht das Protokoll rechtlich zuordenbar.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var zweiterSignerId = ctx.zweiterSignerId || 'sigKunde';
    var zweiterSignerLabel = ctx.zweiterSignerLabel || 'Unterschrift Auftraggeber / Betreiber:';
    var zweiterClearFn = ctx.zweiterClearFn || ('pad' + zweiterSignerId.replace(/^sig/, '') + '.clear()');
    return (
      '<div class="sig-block">\n' +
      '  <div class="sig-card">\n' +
      '    <label id="sigPruefer_label">Unterschrift Prüfer/-in:</label>\n' +
      '    <canvas id="sigPruefer" role="img" aria-labelledby="sigPruefer_label"></canvas>\n' +
      '    <button type="button" class="btn btn-secondary" onclick="padPruefer.clear()">Löschen</button>\n' +
      '  </div>\n' +
      '  <div class="sig-card">\n' +
      '    <label id="' + zweiterSignerId + '_label">' + zweiterSignerLabel + '</label>\n' +
      '    <canvas id="' + zweiterSignerId + '" role="img" aria-labelledby="' + zweiterSignerId + '_label"></canvas>\n' +
      '    <button type="button" class="btn btn-secondary" onclick="' + zweiterClearFn + '">Löschen</button>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 37. FOTO-UPLOAD-LEISTE (Dokumentations-Wrapper um fotosLeisteHtml())
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Die eigentliche Logik bleibt unveraendert in
 * fotosLeisteHtml() (js/fotos.js) - dieser Baustein ruft sie nur auf, damit
 * die Foto-Leiste in der Master-Uebersicht/im Live-Test auffindbar und
 * ausprobierbar ist. Echte Aufrufstellen (addCircuitCard()/addDeviceCard()/
 * die drei Formularseiten) bleiben bewusst UNVERAENDERT bei der direkten
 * fotosLeisteHtml(kartenKey)-Verwendung - eine Umleitung ueber
 * PRUEFSCHRITTE.foto_upload_leiste.html(...) würde am erzeugten HTML nichts
 * ändern (reiner Passthrough), aber ein zusätzliches Risiko für Tippfehler
 * beim kartenKey-Parameter einführen, ohne einen Vorteil zu bieten.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.foto_upload_leiste = {
  gruppe: 'Sonstige UI-Bausteine',
  titel: 'Foto-Upload-Leiste (Fotodokumentation je Karte/Abschnitt)',
  beschreibung: 'Optionale Fotodokumentation (Kamera/Dateiauswahl) je Stromkreis-/Geräte-/Übergabepunkt-Karte sowie am zentralen Bemerkungsfeld - hilft, festgestellte Mängel (z. B. eine beschädigte Isolierung) bildlich zu belegen. Reiner Dokumentations-Wrapper um die tatsächliche Implementierung fotosLeisteHtml() (js/fotos.js), die an den echten Einsatzstellen unverändert direkt aufgerufen wird.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var kartenKey = ctx.kartenKey || 'lt-test-foto';
    return typeof fotosLeisteHtml === 'function' ? fotosLeisteHtml(kartenKey) : '<p class="ps-keine-treffer">fotosLeisteHtml() nicht geladen.</p>';
  }
};

/* ---------------------------------------------------------------------------
 * 38. PRÜFTERMIN-BESTÄTIGUNGS-CHECKBOX (Dokumentations-Wrapper)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Analog zu foto_upload_leiste: die echte Implementierung
 * bleibt in pruefterminBestaetigungHtml() (js/infokarten.js), die von
 * zusatzIconsEinbinden() automatisch in #pruefdatum_bestaetigung_platzhalter
 * eingesetzt wird, sobald dieser Div im Formular vorkommt (siehe
 * PRUEFSCHRITTE.res_termin_date_feld weiter oben). Dieser Baustein dient nur
 * der Auffindbarkeit/dem Live-Test in der Master-Uebersicht.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.pruefdatum_bestaetigung_checkbox = {
  gruppe: 'Sonstige UI-Bausteine',
  titel: 'Prüftermin-Bestätigungs-Checkbox',
  beschreibung: 'Verlangt die explizite Bestätigung, dass die prüfende Person den errechneten nächsten Prüftermin zur Kenntnis genommen hat (nicht nur eine automatische Vorbelegung ungesehen übernommen hat). Reiner Dokumentations-Wrapper um pruefterminBestaetigungHtml() (js/infokarten.js), die am echten Einsatzort automatisch eingesetzt wird.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function () {
    return typeof pruefterminBestaetigungHtml === 'function' ? pruefterminBestaetigungHtml() : '<p class="ps-keine-treffer">pruefterminBestaetigungHtml() nicht geladen.</p>';
  }
};

/* ---------------------------------------------------------------------------
 * 39. "BEISPIELDATEN LADEN"-AUSWAHL (Entwickler-/Demo-Werkzeug)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Kein echtes Pruefdatenfeld, sondern Formular-Werkzeug zum
 * schnellen Befuellen mit Testdaten. Die tatsaechlichen Befuell-Funktionen
 * (fillExampleDataOhneMaengel() usw.) bleiben formularspezifisch und werden
 * NICHT vereinheitlicht - nur die Steuerelement-Form (Dropdown mit mehreren
 * Varianten in vde0100.html, einzelner Button in anschluss/geraete) wird hier
 * dokumentiert/zentral gepflegt. ctx.optionen: Liste von {label, fn}-Paaren;
 * bei genau einem Eintrag wird ein einzelner Button gerendert (anschluss/
 * geraete), bei mehreren ein Dropdown (vde0100).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.beispieldaten_auswahl = {
  gruppe: 'Sonstige UI-Bausteine',
  titel: '"Beispieldaten laden" – Entwickler-/Demo-Auswahl',
  beschreibung: 'Füllt das Formular mit realistischen Testdaten (mit/ohne Mängel), um Formularverhalten und PDF-Ausgabe schnell zu prüfen, ohne alle Felder von Hand auszufüllen. Reines Test-/Demo-Werkzeug, keine echte Prüfdateneingabe - die eigentlichen Befüll-Funktionen bleiben je Formular eigenständig.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var optionen = ctx.optionen || [{ label: '+ Beispieldaten laden', fn: 'fillExampleData' }];
    if (optionen.length === 1) {
      return '<button type="button" class="btn btn-secondary" onclick="' + optionen[0].fn + '()">' + optionen[0].label + '</button>';
    }
    var opts = optionen.map(function (o) {
      return '<option value="' + o.fn + '">' + o.label + '</option>';
    }).join('\n        ');
    return (
      '<select class="btn btn-secondary beispieldaten-auswahl" onchange="if(this.value){window[this.value](); this.value=\'\';}" title="Beispieldaten laden (' + optionen.length + ' Varianten zum Testen)">\n' +
      '        <option value="">+ Beispieldaten laden…</option>\n' +
      '        ' + opts + '\n' +
      '      </select>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 40. GEBÄUDE/BEREICH "VERWALTEN"-DIALOG - EINGABEFELD (nur Dokumentation)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Der Verwalten-Dialog (gebaeudeVerwaltenOeffnen(),
 * js/storage.js) wird komplett per DOM-API (document.createElement(...))
 * aufgebaut, nicht per Template-String - eine echte Live-Instanz dieses
 * Eingabefelds liesse sich hier nicht sinnvoll ausserhalb des tatsaechlichen
 * <dialog>-Elements darstellen (die Buttons/Events haengen am umgebenden
 * Dialog-Objekt). Dieser Eintrag liefert deshalb NUR eine illustrative,
 * NICHT interaktiv verdrahtete Nachbildung des Eingabefelds - die echte,
 * funktionsfaehige Version erscheint ausschliesslich im "Verwalten"-Dialog
 * selbst (Button neben PRUEFSCHRITTE.gebaeude_bereich, ctx.mitVerwalten:true).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.gebaeude_verwalten_eingabe = {
  gruppe: 'Sonstige UI-Bausteine',
  titel: 'Gebäude/Bereich "Verwalten"-Dialog – Eingabefeld (nur Dokumentation)',
  beschreibung: 'Eingabefeld zum Hinzufügen eigener Gebäude-/Bereichsnamen im "Verwalten"-Dialog (gebaeudeVerwaltenOeffnen(), js/storage.js). WICHTIG: Diese Darstellung ist eine rein illustrative Nachbildung - die echte, funktionsfähige Version existiert nur innerhalb des per DOM-API aufgebauten <dialog>-Elements und lässt sich hier nicht interaktiv testen.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function () {
    return (
      '<div class="gebaeude-verwalten-hinzufuegen">\n' +
      '  <input type="text" placeholder="z. B. Foyer, Werkstattbühne …" disabled>\n' +
      '  <button type="button" class="btn btn-secondary" disabled>+ Hinzufügen</button>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 41. BEZEICHNUNG (Kartenfeld: Stromkreis / Gerät / Übergabepunkt)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Drei bisher unabhaengig gepflegte "Bezeichnung"-Felder mit
 * derselben Klasse ".c-bez", aber unterschiedlichem Label, Platzhalter, id-
 * Schema (mit/ohne Kartennummer-Suffix) und Grid-Breite:
 *   - Stromkreis-Karte (pdf-generator.js, addCircuitCard()): "Bezeichnung /
 *     Zweck:", id="bez_${cardCounter}", value=data.bez vorbelegt, normale
 *     Grid-Zelle.
 *   - Geräte-Karte (geraete-generator.js, addDeviceCard()): "Bezeichnung /
 *     Verwendungszweck:", id="bez_${cardCounter}", value=data.bez vorbelegt,
 *     grid-full (volle Zeilenbreite).
 *   - Übergabepunkt (anschlusspruefung.html): "Bezeichnung Übergabepunkt:",
 *     id="bez" (KEIN Kartennummer-Suffix, da es nur einen Übergabepunkt pro
 *     Formular gibt), KEINE Werte-Vorbelegung (Übergabepunkt wird nicht
 *     dupliziert), grid-full.
 * ctx.idSuffix ('' oder '_'+cardCounter), ctx.label, ctx.platzhalter,
 * ctx.gridFull decken alle drei Faelle ab, ohne die jeweilige id/Klasse zu
 * aendern. ctx.mitWertAttribut (true bei Stromkreis-/Geräte-Karte, die beide
 * IMMER ein value="..."-Attribut rendern, und sei es leer, weil eine
 * wiederhergestellte ODER neue Karte ihren Wert schon beim ersten Rendern
 * braucht; false/weggelassen beim Übergabepunkt, der GAR KEIN value-Attribut
 * hatte) steuert zusammen mit ctx.wert, ob/wie das Attribut erscheint - NICHT
 * allein ctx.wert !== undefined, da data.bez bei einer NEUEN Karte ebenfalls
 * undefined ist, das Original-HTML dort aber trotzdem value="" rendert.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.bezeichnung_feld = {
  gruppe: 'Kartenfelder',
  titel: 'Bezeichnung / Zweck (Stromkreis, Gerät, Übergabepunkt)',
  beschreibung: 'Freitextbezeichnung des jeweiligen Prüfobjekts (Stromkreis, Gerät oder Übergabepunkt) - erscheint in der Kartenüberschrift/im PDF und ist die wichtigste Orientierung beim späteren Nachschlagen eines Prüfergebnisses.',
  verwendetIn: ['vde0100', 'anschluss', 'geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var label = ctx.label || 'Bezeichnung / Zweck:';
    var platzhalter = ctx.platzhalter || 'z. B. Schukosteckdose Tonregie';
    var klasseAttr = ctx.gridFull ? ' class="form-group grid-full"' : ' class="form-group"';
    var wertAttr = ctx.mitWertAttribut ? (' value="' + attrEsc(ctx.wert) + '"') : '';
    return (
      '<div' + klasseAttr + '>\n' +
      '  <label for="bez' + s + '">' + label + '</label>\n' +
      '  <input type="text" class="c-bez" id="bez' + s + '"' + wertAttr + ' placeholder="' + platzhalter + '">\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 42. KABELTYP + SCHNELLWAHL (Stromkreis-Karte)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Gleiches Schnellwahl-Muster wie
 * PRUEFSCHRITTE.anschlusskabel_anlage (Klick auf Button setzt per setValue()
 * den Wert des Textfelds), hier aber auf Kartenebene (id mit
 * Kartennummer-Suffix, value-Vorbelegung aus data.*). Eigener Baustein statt
 * Erweiterung von anschlusskabel_anlage, da dort drei Felder zu einem Grid
 * zusammengefasst sind, waehrend die Stromkreis-Karte Kabeltyp/Leiter-Anzahl/
 * Querschnitt als drei EINZELNE form-group-Zellen im umgebenden Karten-Grid
 * rendert (kein eigenes inneres .grid).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.kabeltyp_feld = {
  gruppe: 'Kartenfelder',
  titel: 'Kabeltyp + Schnellwahl (Stromkreis-Karte)',
  beschreibung: 'Leitungstyp des Stromkreises (z. B. NYM-J, H07RN-F) - bestimmt u. a. zulässige Verlegeart und Strombelastbarkeit. Schnellwahl deckt die auf Theater-/Veranstaltungsbühnen gebräuchlichsten Typen ab.',
  verwendetIn: ['vde0100'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    // Einziger Aufrufer ist addCircuitCard() (immer mit value="..."-Attribut,
    // auch leer bei einer neuen Karte) - anders als bei bezeichnung_feld gibt
    // es hier keinen zweiten Aufrufer ohne value-Attribut, das Attribut wird
    // deshalb bewusst immer gerendert.
    var wertAttr = ' value="' + attrEsc(ctx.wert) + '"';
    var optionen = ctx.optionen || ['NYM-J', 'H07RN-F', 'TITANEX', 'H07V-K'];
    var schnellwahl = optionen.map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'kabel_typ' + s + '\', \'' + w + '\')">' + w + '</button>';
    }).join('\n          ');
    return (
      '<div class="form-group">\n' +
      '  <label for="kabel_typ' + s + '">Kabeltyp:</label>\n' +
      '  <input type="text" class="c-kabel-typ" id="kabel_typ' + s + '"' + wertAttr + ' placeholder="z. B. NYM-J / UP">\n' +
      '  <div class="quick-btn-group">\n' +
      '          ' + schnellwahl + '\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 43. LEITER-ANZAHL + SCHNELLWAHL (Stromkreis-Karte)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Siehe Kommentar bei PRUEFSCHRITTE.kabeltyp_feld.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.leiter_anzahl_feld = {
  gruppe: 'Kartenfelder',
  titel: 'Leiter-Anzahl + Schnellwahl (Stromkreis-Karte)',
  beschreibung: 'Anzahl/Aufbau der Adern des Stromkreiskabels (z. B. 3G = 3 Adern inkl. Schutzleiter) - wichtig zur Einordnung, ob ein Schutzleiter überhaupt vorhanden ist.',
  verwendetIn: ['vde0100'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var vorgabe = ctx.vorgabe !== undefined ? ctx.vorgabe : '3G';
    var wertAttr = ' value="' + attrEscOderVorgabe(ctx.wert, vorgabe) + '"';
    var optionen = ctx.optionen || ['3G', '5G', '4G'];
    var schnellwahl = optionen.map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'leiter' + s + '\', \'' + w + '\')">' + w + '</button>';
    }).join('\n          ');
    return (
      '<div class="form-group">\n' +
      '  <label for="leiter' + s + '">Leiter-Anzahl:</label>\n' +
      '  <input type="text" class="c-leiter" id="leiter' + s + '"' + wertAttr + ' placeholder="z. B. 3G">\n' +
      '  <div class="quick-btn-group">\n' +
      '          ' + schnellwahl + '\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 44. QUERSCHNITT + SCHNELLWAHL (Stromkreis-Karte)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Siehe Kommentar bei PRUEFSCHRITTE.kabeltyp_feld. Eigene,
 * kuerzere Optionsliste (bis 6 mm²) im Vergleich zur Anlagen-weiten
 * PRUEFSCHRITTE.anschlusskabel_anlage (bis 16 mm²) - ein einzelner
 * Stromkreis hat typischerweise einen deutlich kleineren Querschnitt als die
 * Hauptzuleitung der gesamten Anlage.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.querschnitt_feld = {
  gruppe: 'Kartenfelder',
  titel: 'Querschnitt + Schnellwahl (Stromkreis-Karte)',
  beschreibung: 'Leiterquerschnitt des Stromkreiskabels - zusammen mit Absicherung und Leitungslänge maßgeblich für zulässige Strombelastbarkeit und Spannungsfall.',
  verwendetIn: ['vde0100'],
  html: function (ctx) {
    ctx = ctx || {};
    var s = ctx.idSuffix || '';
    var vorgabe = ctx.vorgabe !== undefined ? ctx.vorgabe : '1,5 mm²';
    var wertAttr = ' value="' + attrEscOderVorgabe(ctx.wert, vorgabe) + '"';
    var optionen = ctx.optionen || ['1,5 mm²', '2,5 mm²', '4 mm²', '6 mm²'];
    var schnellwahl = optionen.map(function (w) {
      return '<button type="button" class="quick-btn" onclick="setValue(\'qs' + s + '\', \'' + w + '\')">' + w + '</button>';
    }).join('\n          ');
    return (
      '<div class="form-group">\n' +
      '  <label for="qs' + s + '">Querschnitt:</label>\n' +
      '  <input type="text" inputmode="decimal" class="c-querschnitt" id="qs' + s + '"' + wertAttr + ' placeholder="z. B. 1,5 mm²">\n' +
      '  <div class="quick-btn-group">\n' +
      '          ' + schnellwahl + '\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 45. ERGEBNIS STROMKREISPRÜFUNG (totgelegt) + GRUND DER TOTLEGUNG
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Stromkreis-Karte-spezifisch, keine Formular-uebergreifende
 * Duplikation - trotzdem zentralisiert (Konsistenz/Dokumentation/Live-Test).
 * data.totgelegt steuert sowohl die vorbelegte Auswahl als auch, ob das
 * Grund-Textfeld initial sichtbar ist (display:none sonst) - 1:1 wie bisher
 * in addCircuitCard() hartcodiert.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.totlegung_block = {
  gruppe: 'Kartenfelder',
  titel: 'Ergebnis Stromkreisprüfung (i.O. / totgelegt) + Grund',
  beschreibung: 'Abschließendes Ergebnis je Stromkreis: bei "n.i.O." gilt der Kreis als Mangel-behaftet und wird freigeschaltet/totgelegt (fließt dann nicht mehr in die Gesamtbewertung der übrigen Anlage ein) - der Grund der Totlegung muss dokumentiert werden, damit der Mangel eindeutig nachvollziehbar bleibt.',
  verwendetIn: ['vde0100'],
  html: function (ctx) {
    ctx = ctx || {};
    var c = ctx.cardIdAusdruck;
    var data = ctx.data || {};
    return (
      '<div class="circuit-totlegung">\n' +
      '  <div class="form-group">\n' +
      '    <label for="totgelegt_' + c + '">Ergebnis Stromkreisprüfung:</label>\n' +
      '    <select class="c-totgelegt" id="totgelegt_' + c + '" onchange="toggleTotlegung(this)">\n' +
      '      <option value="i.O."' + (data.totgelegt ? '' : ' selected') + '>i.O.</option>\n' +
      '      <option value="n.i.O."' + (data.totgelegt ? ' selected' : '') + '>n.i.O. – Mangel festgestellt (Stromkreis freigeschaltet/totgelegt, fließt nicht in die Gesamtbewertung ein)</option>\n' +
      '    </select>\n' +
      '  </div>\n' +
      '  <div class="form-group grid-full totlegung-grund" style="' + (data.totgelegt ? '' : 'display:none;') + '">\n' +
      '    <label for="totlegung_grund_' + c + '">Festgestellter Fehler / Grund der Totlegung:</label>\n' +
      '    <textarea class="c-totlegung-grund auto-grow" id="totlegung_grund_' + c + '" rows="1" placeholder="z. B. Schukosteckdose Bühne rechts: Isolationsfehler L-PE, einzeln abgesichert über eigene Sicherung, freigeschaltet und mit Warnschild versehen." oninput="this.style.height=\'auto\'; this.style.height=this.scrollHeight+\'px\'">' + attrEsc(data.totlegung_grund) + '</textarea>\n' +
      '  </div>\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 46. GERÄTE-STAMMDATEN (Typ, Inventarnummer, Schutzklasse, Leitungslänge)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Geräte-Karte-spezifisch (geraete-generator.js,
 * addDeviceCard()), keine Formular-uebergreifende Duplikation - trotzdem
 * zentralisiert (Konsistenz/Dokumentation/Live-Test). Vier Einzelfelder als
 * ein Baustein, da sie im Original als zusammenhaengender Block ohne
 * eigenstaendige Zwischenueberschrift auftreten.
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.geraete_stammdaten = {
  gruppe: 'Kartenfelder',
  titel: 'Geräte-Stammdaten (Typ, Inventarnummer, Schutzklasse, Leitungslänge)',
  beschreibung: 'Eindeutige Identifikation des geprüften Geräts (Hersteller/Typ, Inventar-/Seriennummer) sowie die für die Grenzwertermittlung nötige Schutzklasse (I/II/III) und Anschlussleitungslänge (R_PE-Grenzwert hängt von der Leitungslänge ab, siehe DIN EN 50678/50699).',
  verwendetIn: ['geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var c = ctx.cardIdAusdruck;
    var data = ctx.data || {};
    return (
      '<div class="form-group">\n' +
      '  <label for="typ_' + c + '">Hersteller / Typ:</label>\n' +
      '  <input type="text" class="c-typ" id="typ_' + c + '" value="' + attrEsc(data.typ) + '" placeholder="z. B. ADB, PAR64">\n' +
      '</div>\n' +
      '<div class="form-group">\n' +
      '  <label for="invnr_' + c + '">Inventar- / Seriennummer:</label>\n' +
      '  <input type="text" class="c-invnr" id="invnr_' + c + '" value="' + attrEsc(data.invnr) + '" placeholder="z. B. INV-0231">\n' +
      '</div>\n' +
      '<div class="form-group">\n' +
      '  <label for="sk_' + c + '">Schutzklasse:</label>\n' +
      '  <select class="c-schutzklasse" id="sk_' + c + '" onchange="validateDeviceNorms(' + c + ')">\n' +
      '    <option value="I"' + (!data.schutzklasse || data.schutzklasse === 'I' ? ' selected' : '') + '>I (Schutzleiter)</option>\n' +
      '    <option value="II"' + (data.schutzklasse === 'II' ? ' selected' : '') + '>II (Schutzisoliert)</option>\n' +
      '    <option value="III"' + (data.schutzklasse === 'III' ? ' selected' : '') + '>III (Schutzkleinspannung)</option>\n' +
      '  </select>\n' +
      '</div>\n' +
      '<div class="form-group">\n' +
      '  <label for="laenge_' + c + '">Anschlussleitung Länge (m):</label>\n' +
      '  <input type="text" inputmode="decimal" class="c-laenge" id="laenge_' + c + '" value="' + attrEsc(data.laenge) + '" placeholder="z. B. 10" oninput="validateDeviceNorms(' + c + ')">\n' +
      '</div>'
    );
  }
};

/* ---------------------------------------------------------------------------
 * 47. HEIZELEMENT-CHECKBOX + HEIZLEISTUNG (Geräte-Karte)
 * ---------------------------------------------------------------------------
 * [9.6.0, Welle 4] Einziges echtes Checkbox-Feld neben der Prüftermin-
 * Bestaetigung (siehe pruefdatum_bestaetigung_checkbox) - eigener Baustein,
 * da Checkbox + bedingtes Textfeld eng zusammengehoeren (Ankreuzen setzt bei
 * vorhandener Heizleistung automatisch mit, siehe heizelementGeaendert()/
 * heizleistungGeaendert() in js/geraete-generator.js).
 * ------------------------------------------------------------------------ */
PRUEFSCHRITTE.heizelement_block = {
  gruppe: 'Kartenfelder',
  titel: 'Heizelement-Checkbox + Heizleistung (Geräte-Karte)',
  beschreibung: 'Geräte mit Heizelement (z. B. Bügeleisen, Heizlüfter, Wärmekabel) dürfen nach DIN EN 50699 einen höheren Schutzleiterstrom aufweisen (1 mA je kW Heizleistung, höchstens 10 mA) - ohne diese Angabe würde ein normkonformes Gerät fälschlich als Mangel erscheinen.',
  verwendetIn: ['geraete'],
  html: function (ctx) {
    ctx = ctx || {};
    var c = ctx.cardIdAusdruck;
    var data = ctx.data || {};
    var checked = (data.heizelement || String(data.heizleistung || '').trim() !== '') ? 'checked' : '';
    return (
      '<div class="form-group">\n' +
      '  <label class="checkbox-item" style="margin-top: 20px;">\n' +
      '    <input type="checkbox" class="c-heizelement" ' + checked + ' onchange="heizelementGeaendert(' + c + ')"> Gerät mit Heizelement\n' +
      '  </label>\n' +
      '</div>\n' +
      '<div class="form-group">\n' +
      '  <label for="heizleistung_' + c + '">Heizleistung (kW), falls Heizelement:</label>\n' +
      '  <input type="text" inputmode="decimal" class="c-heizleistung" id="heizleistung_' + c + '" value="' + attrEsc(data.heizleistung) + '" placeholder="z. B. 2,0" oninput="heizleistungGeaendert(' + c + ')">\n' +
      '  <div class="limit-hint">Nach DIN EN 50699 darf der Schutzleiterstrom bei Heizleistung &gt; 3,5 kW auf 1 mA je kW steigen, höchstens 10 mA.</div>\n' +
      '</div>'
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
