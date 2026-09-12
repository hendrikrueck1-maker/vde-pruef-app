/* ============================================================================
 *  INFOKARTEN & GERAETE-KURZANLEITUNG JE PRUEFGROESSE (ab 6.2.0)
 * ----------------------------------------------------------------------------
 *  Baut fuer eine Messgroesse (Z_S, RCD, R_ISO, R_PE, U_L) das HTML fuer:
 *    - ein rundes Icon-Badge mit Kurzlabel (immer sichtbar)
 *    - eine ausklappbare Infokarte "Was wird hier geprueft und warum?"
 *    - eine ausklappbare, ausdruecklich als inoffiziell/selbst erstellt
 *      gekennzeichnete Kurzanleitung fuer das jeweils genutzte Pruefgeraet
 *      (Fluke 1663 in vde0100.html/anschlusspruefung.html, Fluke 6500-2 in
 *      geraetepruefung.html)
 *
 *  Icons liegen als eigene Dateien unter img/drehschalter/ (kein Base64
 *  inline wie im Mockup, um die HTML-Dateigroesse klein zu halten).
 *
 *  Herkunft der Texte: Abschnitt 5.1/5.2 des Vollpruefungsberichts 6.1.0 und
 *  die daraus abgeleitete Zusammenfassung. Alle Anleitungstexte sind selbst
 *  formuliert, keine Uebernahme aus Fluke-Originalmaterial (kein Fluke-
 *  Branding, keine Fluke-Grafiken) - siehe Disclaimer in jedem Fluke-Block.
 * ========================================================================== */

const MESSGROESSEN_INFO = {
  zs: {
    icon: 'img/drehschalter/Z_S_Schleifenimpedanz-Kurzschlussstrom.png',
    iconAlt: 'Drehschalter-Icon Schleifenimpedanz (Position Zi)',
    label: 'Z<sub>i</sub>',
    was: 'Die Schleifenimpedanz Z<sub>S</sub> bestimmt, ob die vorgeschaltete Sicherung im Fehlerfall schnell genug abschaltet – Grundlage des Schutzes durch automatische Abschaltung nach DIN&nbsp;VDE&nbsp;0100-410. Aus Z<sub>S</sub> wird zusätzlich der zu erwartende Kurzschlussstrom I<sub>K</sub> berechnet.',
    warum: 'Bei zu hoher Impedanz löst die Sicherung im Fehlerfall nicht rechtzeitig aus – die Berührungsspannung bleibt gefährlich lange anliegen.',
    fluke1663: [
      'Drehschalter auf die Position <span class="drehschalter">Z<sub>i</sub></span> (Schleifenimpedanz, Symbol Z<sub>i</sub> mit Schleifen-Pfeil) stellen – bei RCD-geschützten Stromkreisen zusätzlich mit/ohne RCD passend zur Absicherung wählen, damit der RCD während der Messung nicht unbeabsichtigt auslöst.',
      'Prüfspitzen/Adapter an Steckdose oder Klemme des betreffenden Stromkreises anschließen (mindestens L und PE).',
      '<span class="drehschalter">TEST</span> drücken und loslassen.',
      'Messwert Z<sub>S</sub> (Ω, Hauptanzeige) und errechneten Kurzschlussstrom I<sub>K</sub> (A bzw. kA, Sekundäranzeige) ablesen und ins Formular übertragen.'
    ],
    fluke1663Hinweis: 'Bei RCD-geschützten Stromkreisen die strombegrenzte Einstellung ("mit RCD") wählen, damit der RCD während der Messung nicht unbeabsichtigt auslöst – das Gerät zeigt dabei einen strombegrenzten Messwert. Für die Dokumentation ist der angezeigte Z<sub>S</sub>-Wert zu verwenden.'
  },
  rcd: {
    iconDual: [
      { icon: 'img/drehschalter/RCD_Ausloesezeit_deltaT.png', alt: 'Drehschalter-Icon RCD-Auslösezeit', label: 'ΔT' },
      { icon: 'img/drehschalter/RCD_Ausloesestrom_I_deltaN.png', alt: 'Drehschalter-Icon RCD-Auslösestrom', label: 'I<sub>ΔN</sub>' }
    ],
    // [7.1.0] Die Berührungsspannungsmessung (vormals eigener Block "ul" mit
    // eigenem Icon) wird bei der RCD-Auslösezeitmessung automatisch
    // mitgemessen - ist also KEINE eigenstaendige Pruefung mit eigenem
    // Geraete-Schritt, sondern Teil dieser Messung. Auf Nutzerwunsch deshalb
    // hier mit hinein genommen (kein eigenes Icon/keine eigene Anleitung
    // mehr fuer "ul" - siehe zusammengefuehrter Text unten und
    // Kommentar bei MESSGROESSEN_INFO.ul).
    was: 'Die RCD-Prüfung stellt sicher, dass der Fehlerstrom-Schutzschalter bei einem tatsächlichen Fehlerstrom innerhalb der normativ vorgeschriebenen Zeit auslöst (z.&nbsp;B. 300/150/40&nbsp;ms bzw. 500/200/150&nbsp;ms bei selektiven RCDs, je nach Prüfstrom-Vielfachem). Der RCD-Typ steht als Symbol auf dem Gerät/Typenschild: <span class="rcd-typ-symbol" title="Typ AC – nur Wechselfehlerströme">AC ∿</span> <span class="rcd-typ-symbol" title="Typ A – Wechsel- und pulsierende Gleichfehlerströme">A ∿⌐</span> <span class="rcd-typ-symbol" title="Typ F – zusätzlich Mischfrequenzen (z. B. Frequenzumrichter)">F ⌇</span> <span class="rcd-typ-symbol" title="Typ B – zusätzlich glatte Gleichfehlerströme (allstromsensitiv)">B ≈</span> <span class="rcd-typ-symbol" title="Typ B+ – zusätzlich sinusförmige Wechselfehlerströme bis 20 kHz, gehobener Brandschutz">B+ ≈kHz</span> – der am Fluke eingestellte Typ muss dem Typenschild entsprechen, sonst ist das Prüfergebnis nicht aussagekräftig. Bei der Auslösezeitmessung wird zugleich die Berührungsspannung U<sub>F</sub> (Fehlerspannung am PE-Leiter) mitgemessen – eine eigene, separate Messung dafür ist nicht nötig.',
    warum: 'Ein RCD, der nicht oder zu spät auslöst, bietet keinen wirksamen Zusatzschutz gegen gefährliche Körperströme – die zentrale Schutzfunktion des Geräts wäre praktisch wirkungslos, ohne dass das von außen erkennbar wäre. Die mitgemessene Berührungsspannung zeigt zusätzlich, ob im Fehlerfall die zulässige Grenze (50 V AC normal / 25 V AC bei erhöhter Gefährdung, z. B. Bühne/Open Air) eingehalten wird.',
    fluke1663: [
      '<u>Auslösezeit t<sub>A</sub> und Berührungsspannung (Drehschalter-Position <span class="drehschalter">ΔT</span>):</u>',
      'Drehschalter auf <span class="drehschalter">ΔT</span> stellen, Nennfehlerstrom (10/30/100/300/500/1000 mA) einstellen.',
      'Prüfstrom-Wellenform passend zum RCD-Typ wählen (Symbole siehe unten): <img class="rcd-typ-icon" src="img/drehschalter/RCD_Typ_AC.png" alt="Symbol Typ AC" title="Typ AC"> für Typ AC/A, <img class="rcd-typ-icon" src="img/drehschalter/RCD_Typ_A.png" alt="Symbol Typ A (Halbwelle)" title="pulsstromsensitiv Typ A"> (Halbwelle) für pulsstromsensitive Typ A, <img class="rcd-typ-icon" src="img/drehschalter/RCD_Typ_B.png" alt="Symbol Typ B" title="Typ B"> (glatter Gleichstrom) für Typ B – bei zeitverzögerten/selektiven RCDs zusätzlich [S] wählen. Für Typ B+ <img class="rcd-typ-icon" src="img/drehschalter/RCD_Typ_Bplus.png" alt="Symbol Typ B+" title="Typ B+"> wird am Fluke ebenfalls die Wellenform „glatter Gleichstrom" (Typ B) eingestellt – das Gerät unterscheidet B/B+ nicht separat, die höhere Frequenzerfassung ist eine Eigenschaft des RCD selbst.',
      'Phasenwinkel 0° <em>und</em> 180° jeweils einzeln prüfen (Ansprechzeit kann abweichen) – bei Typ B/S-Typ B sind beide Winkel zwingend zu prüfen.',
      'Prüfstrom-Vielfaches wählen (typisch ½×, 1× I<sub>Δn</sub>; bei Bedarf auch 2×, 5×).',
      'Mindestens L und PE anschließen (bzw. Steckdosen-Prüfleitung einstecken) – bei Typ B/S-Typ B werden alle drei Messleitungen benötigt.',
      '<span class="drehschalter">TEST</span> drücken und loslassen: Hauptanzeige zeigt Auslösezeit t<sub>A</sub>, Sekundäranzeige die Fehlerspannung U<sub>F</sub> (Spannungsabfall am PE-Leiter bezogen auf den Bemessungsfehlerstrom) – diesen Wert zusätzlich als „Gemessene Berührungsspannung U<sub>mess</sub>" ins Formular übertragen.',
      '<u>Auslösestrom I<sub>ΔN</sub> (Drehschalter-Position <span class="drehschalter">I<sub>ΔN</sub></span>):</u>',
      'Drehschalter auf <span class="drehschalter">I<sub>ΔN</sub></span> stellen, Nennfehlerstrom und Prüfstromform wie oben einstellen.',
      '<span class="drehschalter">TEST</span> drücken: Das Gerät erhöht den Prüfstrom stufenweise, bis der RCD auslöst – Hauptanzeige zeigt den Auslösestrom, Sekundäranzeige wieder die Fehlerspannung U<sub>F</sub>.'
    ],
    fluke1663Hinweis: 'Der am Fluke gewählte Prüfstrom-Faktor und Nennfehlerstrom müssen exakt dem im Formular ausgewählten Wert entsprechen, da die App den zulässigen Grenzwert daraus berechnet. Vor der Messung die Verbindung zwischen Neutralleiter und Schutzleiter prüfen (eine Spannung dazwischen verfälscht die Messung) – siehe Warnhinweis im Handbuch. Für RCD Typ B/B+ wird glatter Gleichstrom verwendet; die kurze 10-ms-Verzögerung bei Typ G/K/R wird vom RCD-✓-Symbol des Geräts nicht berücksichtigt. Der Grenzwert der Berührungsspannung (≤ 50 V AC normal / ≤ 25 V AC bei erhöhter Gefährdung) wird von der App bereits automatisch anhand der Auswahl „Gefährdung" berechnet.'
  },
  riso: {
    icon: 'img/drehschalter/R_ISO_Isolationswiderstand.png',
    iconAlt: 'Drehschalter-Icon Isolationswiderstand',
    label: 'R<sub>ISO</sub>',
    was: 'Der Isolationswiderstand prüft, ob die Isolierung zwischen aktiven Leitern und Erde/PE ausreichend hoch ist, um einen unbeabsichtigten Stromfluss (Erd- oder Körperschluss) zu verhindern.',
    warum: 'Eine zu niedrige Isolation kann zu schleichenden Fehlerströmen, Erwärmung, Brandgefahr oder – im Fehlerfall an leitfähigen Teilen – zu einer echten Berührungsgefahr führen, ohne dass eine Sicherung dabei zwangsläufig auslöst.',
    fluke1663: [
      'Anlage spannungsfrei schalten.',
      'Drehschalter auf <span class="drehschalter">Riso</span> stellen.',
      'Prüfspannung passend zur Anlage wählen (üblich 500&nbsp;V DC, bei SELV/PELV 250&nbsp;V DC) – muss mit der Formular-Auswahl „Prüfspannung" übereinstimmen. Sind Geräte/Verbraucher angeschlossen, wird stattdessen mit 250&nbsp;V DC gemessen (Praxismessung) – dieselbe Prüfspannung dann auch im Formular unter „Prüfspannung" auswählen.',
      'Prüfspitzen zwischen Außenleiter und PE anschließen, <span class="drehschalter">TEST</span> gedrückt halten, bis der Wert stabil ist.'
    ],
    fluke6500: [
      'Prüfling allpolig vom Netz trennen (Netzstecker ziehen).',
      'Drehschalter auf die Isolationswiderstands-Messfunktion stellen, Prüfspannung passend zum Gerät wählen (üblich 500&nbsp;V DC).',
      'Messleitungen gemäß Geräteanleitung anschließen (z.&nbsp;B. Adapter/Prüfstecker für Schutzklasse&nbsp;I-Geräte, Antastspitzen für SK&nbsp;II/III oder Metallteile).',
      'Messung starten und gedrückt halten, bis der Wert stabil ist, dann ablesen.'
    ],
    fluke6500Hinweis: 'Bei Geräten mit Elektronik (Schaltnetzteil, Dimmer, elektronisches Vorschaltgerät) kann die Isolationsmessung mit Gleichspannung durch eingebaute Überspannungsschutzelemente verfälscht werden – im Zweifel Angaben des Geräteherstellers beachten.'
  },
  rpe: {
    icon: 'img/drehschalter/R_PE_Schutzleiterwiderstand.png',
    iconAlt: 'Drehschalter-Icon Niederohmmessung (Position Rlo)',
    label: 'R<sub>LO</sub>',
    was: 'Der Schutzleiterwiderstand stellt sicher, dass der PE-Leiter einen niederohmigen, durchgängigen Verbindungspfad zum Erdungssystem bildet.',
    warum: 'Ein zu hoher oder unterbrochener Schutzleiterwiderstand verhindert, dass im Fehlerfall der Fehlerstrom sicher abfließen und die vorgeschaltete Schutzeinrichtung zuverlässig auslösen kann – ein Körper könnte dann selbst zum Strompfad werden.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Rlo</span> stellen.',
      'Vorher am Gerät nullen (Messleitungswiderstand kompensieren).',
      'Messung zwischen Stecker und PE-Anschluss oder zwischen Potenzialausgleichsschiene und PE-Anschluss durchführen.',
      '<span class="drehschalter">TEST</span> drücken und Leitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke6500: [
      'Drehschalter auf die Niederohm-/Schutzleiterwiderstands-Messfunktion stellen.',
      'Messleitungen vor der Messung nullen (Leitungswiderstand kompensieren).',
      'Messung zwischen dem Schutzkontakt des Netzsteckers und den berührbaren leitfähigen Teilen des Geräts durchführen.',
      'Anschlussleitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke6500Hinweis: 'Bei langen oder dünnen Anschlussleitungen steigt der zulässige Grenzwert – siehe Grenzwert-Hinweis im Formular direkt am Messfeld.'
  },
  /* [7.1.0] Eintrag "ul" (Berührungsspannung) entfernt: die Prüfung ist keine
   * eigenstaendige Messung mit eigenem Geraete-Schritt, sondern wird bei der
   * RCD-Auslösezeitmessung automatisch mitgemessen (siehe MESSGROESSEN_INFO.rcd
   * oben, wo Text und Anleitung jetzt zusammengefuehrt sind). Der Abschnitt
   * "Berührungsspannung & Netzart" in der Stromkreis-Karte zeigt deshalb kein
   * eigenes Icon und keine eigene Anleitung mehr - siehe js/pdf-generator.js. */
  uv: {
    icon: 'img/drehschalter/V_Hz_Netzspannung.png',
    iconAlt: 'Drehschalter-Icon Netzspannung/Frequenz (V, Hz)',
    label: 'U<sub>V</sub>',
    was: 'Die Netzmessung erfasst die tatsächlichen Spannungen am Speisepunkt (L-N, L-L, N-PE) sowie die Frequenz – eine eigenständige, optionale Messung, unabhängig von der Berührungsspannung.',
    warum: 'Abweichende Netzspannungen oder eine erhöhte N-PE-Spannung können auf einen hochohmigen PEN-Leiter oder eine Fremdeinspeisung hindeuten. Bei Netzersatzanlagen/Wechselrichtern ist die Frequenz zusätzlich ein echter Pflicht-Messwert (Sollwert 50 Hz).',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">V, Hz</span> stellen.',
      'Spannung an den geforderten Punkten messen (L-N, L-L, N-PE je nach Prüfpunkt) sowie die Frequenz ablesen.',
      'Werte in die Felder im Abschnitt „Netzmessung (optional)" übertragen.'
    ],
    fluke1663Hinweis: 'Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler findet (hochohmiger PEN, Fremdeinspeisung) – Sollwert 0 V.'
  },
  rlo: {
    icon: 'img/drehschalter/R_LO_Potenzialausgleich.png',
    iconAlt: 'Drehschalter-Icon Potenzialausgleich (R LOW Ω)',
    label: 'R<sub>LO</sub>',
    was: 'Die Potenzialausgleichsmessung prüft die Durchgängigkeit und den niederohmigen Widerstand zwischen der Potenzialausgleichsschiene/Erdungspunkt und den zu verbindenden leitfähigen Teilen der Anlage.',
    warum: 'Ein unterbrochener oder zu hochohmiger Potenzialausgleich verhindert, dass im Fehlerfall gefährliche Spannungsunterschiede zwischen berührbaren leitfähigen Teilen sicher ausgeglichen werden – ein zentraler Baustein des Schutzes gegen elektrischen Schlag.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Rlo</span> stellen (dieselbe Messfunktion wie beim Schutzleiterwiderstand).',
      'Vorher am Gerät nullen (Messleitungswiderstand kompensieren).',
      'Messung zwischen Stecker und PE-Anschluss oder zwischen Potenzialausgleichsschiene und PE-Anschluss durchführen.',
      '<span class="drehschalter">TEST</span> drücken und Leitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke1663Hinweis: 'Gleiche Drehschalter-Position und Vorgehensweise wie beim Schutzleiterwiderstand – nur der Messpunkt unterscheidet sich.'
  },
  /* [7.1.0 Befund "Anleitungen teilweise fehlend"] Der Ableitstrom-Messblock
   * in der Geraetepruefung (js/geraete-generator.js) bot bisher drei
   * waehlbare Messmethoden (Ersatzableitstrom / Differenzstrommessung /
   * Direktmessung Beruehrungsstrom) OHNE jede Anleitung dazu, im
   * Unterschied zu R_PE und R_ISO direkt daneben, die beide eine
   * vollstaendige Fluke-6500-Kurzanleitung haben. Kein Drehschalter-Icon
   * (anders als beim Fluke 1663 gibt es am Fluke 6500-2 keine dem
   * Ableitstrom entsprechende einzelne Schalterstellung, siehe Kommentar
   * "I26" in geraete-generator.js) - deshalb ohne icon/iconAlt, die Karte
   * wird ueber infokarteInhaltHtml()+flukeAnleitungHtml() direkt statt ueber
   * messgroesseBlock() eingebunden (kein Icon-Badge noetig/sinnvoll). */
  ableitstrom: {
    label: 'Ableitstrom',
    was: 'Der Ableitstrom (Schutzleiter-, Berührungs- oder Ersatzableitstrom, je nach gewählter Messmethode) erfasst den Strom, der im Betrieb über die Isolierung bzw. den Schutzleiter zu berührbaren leitfähigen Teilen fließen kann.',
    warum: 'Ein zu hoher Ableitstrom weist auf eine verschlechterte oder überlastete Isolation hin und kann bei Berührung leitfähiger Gehäuseteile zu einem spürbaren bis gefährlichen Stromfluss durch den Körper führen – unabhängig davon, ob der Schutzleiter selbst noch niederohmig durchgängig ist (siehe R_LO).',
    fluke6500: [
      'Passende Messmethode am Gerät sowie im Formular auswählen (Ersatzableitstrom, Differenzstrommessung oder Direktmessung Berührungsstrom) – die Auswahl richtet sich nach Schutzklasse und Prüfsituation des Prüflings.',
      '<strong>Ersatzableitstrom</strong> (Schutzklasse&nbsp;I, Prüfling spannungsfrei): Messleitungen gemäß Geräteanleitung zwischen Netzstecker-Kontakten (L+N gebrückt) und berührbaren leitfähigen Teilen/PE anschließen, Prüfspannung anlegen und Wert ablesen.',
      '<strong>Differenzstrommessung</strong> (Prüfling im Betrieb, Funktionsprüfung gleichzeitig möglich): Prüfling über den Messadapter am Netz betreiben, Differenz aus Hin- und Rückstrom wird direkt angezeigt.',
      '<strong>Direktmessung Berührungsstrom</strong> (v.&nbsp;a. Schutzklasse&nbsp;II, Prüfling im Betrieb): Antastspitze auf die berührbaren leitfähigen Teile aufsetzen, Prüfling einschalten/im Betrieb belassen und Wert ablesen.',
      'Ergebnis in mA im Formularfeld „Ableitstrom" eintragen; die verwendete Methode ist im Feld „Messmethode Ableitstrom" bereits hinterlegt.'
    ],
    fluke6500Hinweis: 'Bei Geräten mit Heizelement (siehe Feld „Heizleistung" an der Karte) gilt nach DIN EN 50699 ein angehobener Grenzwert – siehe Grenzwert-Hinweis direkt am Messfeld.'
  },
  drehfeld: {
    icon: 'img/drehschalter/Phase_Drehfeldmessung.png',
    iconAlt: 'Drehschalter-Icon Drehfeldprüfung (Position Phase)',
    label: 'Phase',
    was: 'Die Drehfeldprüfung stellt fest, ob die drei Außenleiter in der Reihenfolge L1-L2-L3 (Rechtsdrehfeld) oder vertauscht (L3-L2-L1, Linksdrehfeld) angeschlossen sind.',
    warum: 'Ein falsches Drehfeld lässt Drehstrommotoren rückwärts laufen (z.&nbsp;B. Bühnenzug, Lüfter, Pumpen) – bei CEE-Steckvorrichtungen 16–125&nbsp;A nach DIN VDE 0100-600 zwingend zu prüfen, bevor Verbraucher angeschlossen werden.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Phase</span> stellen.',
      'Alle drei Außenleiter (L1/L2/L3) an den zugehörigen Prüfspitzen/Adapter der CEE-Steckvorrichtung anschließen.',
      'Anzeige ablesen: <strong>1-2-3</strong> = korrektes (rechtsdrehendes) Drehfeld, <strong>3-2-1</strong> = umgekehrtes (linksdrehendes) Drehfeld, Striche (---) = keine ausreichende Spannung erkannt.',
      'Ergebnis als i.O. (1-2-3) bzw. n.i.O. (3-2-1, vertauscht) im Formular eintragen.'
    ],
    fluke1663Hinweis: 'Bei vertauschtem Drehfeld zwei der drei Außenleiter am Adapter/Prüfling tauschen und erneut prüfen, bis 1-2-3 angezeigt wird – nicht einfach als Mangel dokumentieren, wenn eine Korrektur vor Ort möglich und vorgesehen ist.'
  }
};

/* Baut das Icon-Badge (Einzel-Icon oder RCD-Doppel-Icon). */
function infokarteIconHtml(info) {
  if (info.iconDual) {
    return '<span class="mess-icon-dual" title="Drehschalter-Icons Auslösezeit &amp; Auslösestrom">' +
      info.iconDual.map(function (ic) {
        return '<span class="mess-icon-stack"><span class="mess-icon"><img src="' + ic.icon + '" alt="' + ic.alt + '" loading="lazy"></span><span class="mess-icon-label">' + ic.label + '</span></span>';
      }).join('') +
      '</span>';
  }
  return '<span class="mess-icon-stack" title="Drehschalter-Icon">' +
    '<span class="mess-icon"><img src="' + info.icon + '" alt="' + info.iconAlt + '" loading="lazy"></span>' +
    '<span class="mess-icon-label">' + info.label + '</span>' +
    '</span>';
}

/* Baut die ausklappbare Infokarte "Was wird hier geprüft und warum?".
 * schluessel (z.B. 'rpe','riso','zs','rcd','uv','rlo') wird als
 * data-mg-key ins <details> geschrieben - Grundlage fuer F15: der
 * Aufklapp-Zustand wird je Messgroesse fuer die laufende Sitzung
 * geteilt, damit z.B. eine beim Stromkreis #1 aufgeklappte R_PE-Infokarte
 * beim Wechsel zu Stromkreis #2 dort ebenfalls aufgeklappt erscheint. */
function infokarteInhaltHtml(info, schluessel) {
  return (
    '<details class="infokarte" data-mg-key="' + (schluessel || '') + '">' +
      '<summary>ℹ️ Was wird hier geprüft und warum?</summary>' +
      '<div class="infokarte-inhalt">' +
        '<p><span class="label-was">Was:</span> ' + info.was + '</p>' +
        '<p><span class="label-warum">Warum wichtig:</span> ' + info.warum + '</p>' +
      '</div>' +
    '</details>'
  );
}

/* [7.1.0] RCD-Typ-Symbol-Legende: wird am Ende der RCD-Fluke-Anleitung
 * ergaenzt (aus dem Typenschild-Tabellenbild extrahierte, selbst
 * zugeschnittene Symbole - kein Fluke-Original). Nur fuer schluessel 'rcd'. */
const RCD_TYP_LEGENDE_HTML =
  '<div class="rcd-typ-legende">' +
    '<span class="rcd-typ-legende-item"><img src="img/drehschalter/RCD_Typ_AC.png" alt="Symbol Typ AC (Wechselstrom)"> Typ AC/A (Wechselstrom)</span>' +
    '<span class="rcd-typ-legende-item"><img src="img/drehschalter/RCD_Typ_A.png" alt="Symbol Typ A (Halbwelle, pulsstromsensitiv)"> Typ A, pulsstromsensitiv (Halbwelle)</span>' +
    '<span class="rcd-typ-legende-item"><img src="img/drehschalter/RCD_Typ_B.png" alt="Symbol Typ B (glatter Gleichstrom)"> Typ B (glatter Gleichstrom)</span>' +
    '<span class="rcd-typ-legende-item"><img src="img/drehschalter/RCD_Typ_Bplus.png" alt="Symbol Typ B+ (zusaetzlich sinusfoermige Fehlerstroeme bis 20 kHz)"> Typ B+ (zusätzlich sinusförmige Wechselfehlerströme bis 20 kHz, gehobener Brandschutz)</span>' +
    '<span class="rcd-typ-legende-item"><img src="img/drehschalter/RCD_Typ_F.png" alt="Symbol Typ F (Mischfrequenzen)"> Typ F (zusätzlich Mischfrequenzen)</span>' +
  '</div>';

/* Baut die ausklappbare Geraete-Kurzanleitung. geraet: 'fluke1663' (vde0100/
 * anschlusspruefung) oder 'fluke6500' (geraetepruefung, Fluke 6500-2).
 * schluessel: siehe infokarteInhaltHtml (F15, gleicher Mechanismus). */
function flukeAnleitungHtml(info, geraet, schluessel) {
  const schritte = geraet === 'fluke6500' ? info.fluke6500 : info.fluke1663;
  if (!schritte) return '';
  const hinweis = geraet === 'fluke6500' ? info.fluke6500Hinweis : info.fluke1663Hinweis;
  const geraetName = geraet === 'fluke6500' ? 'Fluke 6500-2' : 'Fluke 1663';
  const legende = schluessel === 'rcd' ? RCD_TYP_LEGENDE_HTML : '';
  // [7.1.0] Der Disclaimer stand bisher in JEDER einzelnen Anleitung (hier
  // erzeugt). Auf Nutzerwunsch steht er jetzt nur noch EINMAL, global, in
  // anleitung.html (siehe dort Abschnitt "Wichtiger Hinweis zu den
  // Kurzanleitungen") - hier deshalb ersatzlos entfernt.
  return (
    '<details class="fluke" data-mg-key="' + (schluessel || '') + '">' +
      '<summary>🔧 So geht\'s mit dem ' + geraetName + '</summary>' +
      '<div class="fluke-inhalt">' +
        '<ol>' + schritte.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
        (hinweis ? '<div class="fluke-wichtig"><strong>Hinweis:</strong> ' + hinweis + '</div>' : '') +
        legende +
      '</div>' +
    '</details>'
  );
}

/* Gesamtblock: Icon-Badge (fuer die Kartenueberschrift) + Infokarte + Fluke-
 * Anleitung (fuer den Kartenkoerper). schluessel: 'zs' | 'rcd' | 'riso' |
 * 'rpe' | 'ul'. geraet: 'fluke1663' | 'fluke6500'. */
function messgroesseBlock(schluessel, geraet) {
  const info = MESSGROESSEN_INFO[schluessel];
  if (!info) return { icon: '', karten: '' };
  return {
    icon: infokarteIconHtml(info),
    karten: infokarteInhaltHtml(info, schluessel) + flukeAnleitungHtml(info, geraet, schluessel)
  };
}

/* ---------------------------------------------------------------------------
 *  GLOBALER EIN/AUS-SCHALTER (Befund C, 6.2.0)
 * ---------------------------------------------------------------------------
 *  Zustand liegt in localStorage (Key VDE_INFOKARTEN_KEY). Persistiert ueber
 *  Formularwechsel und Neuladen hinweg. Betrifft nur die ausklappbaren
 *  Infokarten/Fluke-Anleitungen - die Icons mit Kurzlabel bleiben immer
 *  sichtbar (siehe .infokarten-versteckt in style.css).
 * ------------------------------------------------------------------------ */
const VDE_INFOKARTEN_KEY = 'vde_infokarten_sichtbar';

function infokartenSichtbarkeitLesen() {
  try {
    const wert = localStorage.getItem(VDE_INFOKARTEN_KEY);
    return wert === null ? true : wert === '1'; // Standard: sichtbar
  } catch (e) { return true; }
}

function infokartenSichtbarkeitSetzen(sichtbar) {
  try { localStorage.setItem(VDE_INFOKARTEN_KEY, sichtbar ? '1' : '0'); } catch (e) {}
  infokartenSichtbarkeitAnwenden();
}

/* Wendet den gespeicherten Zustand auf die aktuelle Seite an - auf
 * document.body, damit ein einziger Selektor (.infokarten-versteckt) alle
 * Formulare abdeckt, unabhaengig vom jeweiligen Karten-Container. */
function infokartenSichtbarkeitAnwenden() {
  const sichtbar = infokartenSichtbarkeitLesen();
  document.body.classList.toggle('infokarten-versteckt', !sichtbar);
  document.querySelectorAll('.infokarten-schalter-checkbox').forEach(function (cb) {
    cb.checked = sichtbar;
  });
  return sichtbar;
}

/* Von index.html (und optional den Formularseiten) aus dem Schalter-Element
 * heraus aufgerufen. */
function infokartenSchalterGeaendert(checkbox) {
  infokartenSichtbarkeitSetzen(!!checkbox.checked);
}

/* Netzmessung-Icon (U_v) und Potenzialausgleich-Icon (R_LO) einbinden -
 * nur vorhanden in vde0100.html (dort existieren #netzmessung_icon /
 * #erdung_icon). Infokarte + Fluke-Kurzanleitung werden direkt nach dem
 * jeweiligen Abschnitt eingefuegt, analog zu den Stromkreis-Karten. */
function zusatzIconsEinbinden() {
  const netzIcon = document.getElementById('netzmessung_icon');
  if (netzIcon) {
    const block = messgroesseBlock('uv', 'fluke1663');
    netzIcon.innerHTML = block.icon;
    const netzDetails = document.getElementById('netzmessung_block');
    if (netzDetails && !document.getElementById('netzmessung_infokarten')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'netzmessung_infokarten';
      wrapper.innerHTML = block.karten;
      netzDetails.appendChild(wrapper);
    }
  }

  const erdungIcon = document.getElementById('erdung_icon');
  if (erdungIcon) {
    const block = messgroesseBlock('rlo', 'fluke1663');
    erdungIcon.innerHTML = block.icon;
    const erdungBlock = document.querySelector('.kat-block.kat-erdung');
    if (erdungBlock && !document.getElementById('erdung_infokarten')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'erdung_infokarten';
      wrapper.innerHTML = block.karten;
      erdungBlock.insertBefore(wrapper, erdungBlock.firstChild.nextSibling ? erdungBlock.children[1] : null);
      if (!wrapper.parentNode) erdungBlock.appendChild(wrapper);
    }
  }

  // Drehfeld-Icon + Infokarte/Fluke-Anleitung (D8, 7.0): nur vorhanden in
  // vde0100.html (dort existieren #drehfeld_icon / #drehfeld_infokarten
  // im Abschnitt "5. Erproben").
  const drehfeldIcon = document.getElementById('drehfeld_icon');
  if (drehfeldIcon) {
    const block = messgroesseBlock('drehfeld', 'fluke1663');
    drehfeldIcon.innerHTML = block.icon;
    const drehfeldWrapper = document.getElementById('drehfeld_infokarten');
    if (drehfeldWrapper && !drehfeldWrapper.innerHTML) {
      drehfeldWrapper.innerHTML = block.karten;
    }
  }

  // [7.2.0, Nutzerwunsch #10] Pruefdatum-Infokarte in Abschnitt 1 (Stammdaten)
  // - der Platzhalter-Praefix ergibt sich aus der ID des #...Container-
  // Elements der jeweiligen Seite (eindeutig pro Formulartyp vorhanden).
  const pruefdatumPlatzhalter = document.getElementById('pruefdatum_infokarte_platzhalter');
  if (pruefdatumPlatzhalter && !pruefdatumPlatzhalter.innerHTML) {
    // [9.0.0] anschlusspruefung.html hat seit dem Strukturumbau (genau EIN
    // Übergabepunkt statt eines #feedsContainer mit .feed-card-Karten) kein
    // #feedsContainer-Element mehr - #uebergabepunktBlock ist der neue,
    // eindeutige Marker fuer diese Seite.
    const praefix = document.getElementById('circuitsContainer') ? 'PR'
      : document.getElementById('devicesContainer') ? 'GP'
      : document.getElementById('uebergabepunktBlock') ? 'AP'
      : 'PR';
    pruefdatumPlatzhalter.innerHTML = pruefterminInfokarteHtml(praefix);
  }

  // [7.3.0, Nutzerwunsch #5] Bestaetigungs-Checkbox unter #res_termin_date
  // einfuegen. [7.4.0, Punkt 4] Seit anschlusspruefung.html ebenfalls ein
  // #res_termin_date-Feld hat, greift dieser generische Code jetzt auch
  // dort, sobald der Platzhalter-Div im Formular vorhanden ist (siehe oben).
  const terminBestaetigungPlatzhalter = document.getElementById('pruefdatum_bestaetigung_platzhalter');
  if (terminBestaetigungPlatzhalter && !terminBestaetigungPlatzhalter.innerHTML) {
    terminBestaetigungPlatzhalter.innerHTML = pruefterminBestaetigungHtml();
    pruefdatumBestaetigungAktualisieren();
    const checkbox = document.getElementById('res_termin_bestaetigt');
    if (checkbox) checkbox.addEventListener('change', pruefdatumBestaetigungAktualisieren);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', infokartenSichtbarkeitAnwenden);
  document.addEventListener('DOMContentLoaded', zusatzIconsEinbinden);
}

/* ============================================================================
 *  F15: AUFKLAPP-ZUSTAND DER INFOKARTEN/FLUKE-ANLEITUNGEN JE MESSGROESSE
 *       FUER DIE LAUFENDE SITZUNG TEILEN
 * ----------------------------------------------------------------------------
 *  Bisher hatte jede <details class="infokarte"|"fluke"> ihren eigenen,
 *  rein lokalen Aufklapp-Zustand im DOM. Wurde z.B. bei Stromkreis #1 die
 *  R_PE-Infokarte aufgeklappt, blieb sie bei Stromkreis #2 (eigene, separate
 *  <details>-Instanz) trotzdem zu. Ab hier wird der Zustand je Messgroesse
 *  (data-mg-key, siehe infokarteInhaltHtml/flukeAnleitungHtml) gemeinsam
 *  ueber sessionStorage gehalten:
 *    - beim Aufklappen/Zuklappen EINER Karte werden alle anderen bereits im
 *      DOM vorhandenen Karten mit demselben Schluessel + Typ sofort
 *      mitgezogen,
 *    - neu erzeugte Karten (addCircuitCard/addDeviceCard/addFeedCard, auch
 *      beim Wiederherstellen aus Autosave/Archiv) uebernehmen beim Einfuegen
 *      ins DOM automatisch den zuletzt gesetzten Zustand.
 *  Ausdruecklich NUR fuer die laufende Sitzung (sessionStorage, kein
 *  localStorage) - kein Bezug zum permanenten, globalen Infokarten-Ein/Aus-
 *  Schalter (VDE_INFOKARTEN_KEY) aus fruaheren Versionen, der die Sichtbarkeit
 *  als Ganzes steuert, nicht den Aufklapp-Zustand einzelner Karten.
 * ========================================================================== */
const VDE_MG_ZUSTAND_KEY = 'vde_mg_details_zustand';

function mgZustandLesen() {
  try {
    const raw = sessionStorage.getItem(VDE_MG_ZUSTAND_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function mgZustandSchreiben(zustand) {
  try { sessionStorage.setItem(VDE_MG_ZUSTAND_KEY, JSON.stringify(zustand)); } catch (e) {}
}

function mgDetailsSchluessel(details) {
  const key = details.getAttribute('data-mg-key');
  if (!key) return null;
  const typ = details.classList.contains('fluke') ? 'fluke' : 'infokarte';
  return typ + ':' + key;
}

/* Wendet den gespeicherten Zustand auf ein einzelnes <details>-Element an -
 * genutzt sowohl beim initialen Einbinden neuer Karten als auch beim
 * Live-Abgleich aller anderen Karten nach einem Toggle. */
function mgZustandAufElementAnwenden(details, zustand) {
  const combKey = mgDetailsSchluessel(details);
  if (!combKey) return;
  if (Object.prototype.hasOwnProperty.call(zustand, combKey)) {
    const soll = !!zustand[combKey];
    if (details.open !== soll) details.open = soll;
  }
}

/* Durchsucht ein Wurzelelement (Default: ganzes Dokument) nach allen
 * data-mg-key-Details und gleicht sie mit dem gespeicherten Zustand ab. */
function mgZustandAufBereichAnwenden(root) {
  const zustand = mgZustandLesen();
  const scope = root || document;
  scope.querySelectorAll('details.infokarte[data-mg-key], details.fluke[data-mg-key]')
    .forEach(function (d) { mgZustandAufElementAnwenden(d, zustand); });
}

/* Toggle-Event: 'toggle' bubbelt nicht, daher Listener in der Capturing-
 * Phase auf document - dort kommt das Event trotzdem an, weil Capturing
 * unabhaengig vom Bubbling beim Weg zum Ziel ausgeloest wird. */
if (typeof document !== 'undefined') {
  document.addEventListener('toggle', function (ev) {
    const details = ev.target;
    if (!details || !details.matches || !details.matches('details.infokarte[data-mg-key], details.fluke[data-mg-key]')) return;
    const combKey = mgDetailsSchluessel(details);
    if (!combKey) return;
    const zustand = mgZustandLesen();
    zustand[combKey] = details.open;
    mgZustandSchreiben(zustand);
    // alle anderen bereits vorhandenen Karten mit demselben Schluessel sofort mitziehen
    mgZustandAufBereichAnwenden(document);
  }, true);

  // Neu eingefuegte Karten (Stromkreis/Geraet/Uebergabepunkt, auch beim
  // Wiederherstellen aus Autosave/Archiv) automatisch auf den aktuellen
  // Zustand bringen - MutationObserver statt Aenderung an jeder einzelnen
  // addXCard()-Funktion, damit auch kuenftige Kartentypen automatisch
  // erfasst werden.
  document.addEventListener('DOMContentLoaded', function () {
    mgZustandAufBereichAnwenden(document);
    const beobachtbareContainer = [
      document.getElementById('circuitsContainer'),
      document.getElementById('devicesContainer'),
      document.getElementById('feedsContainer')
    ].filter(Boolean);
    if (!beobachtbareContainer.length || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          mgZustandAufBereichAnwenden(node);
          if (node.matches && node.matches('details.infokarte[data-mg-key], details.fluke[data-mg-key]')) {
            mgZustandAufElementAnwenden(node, mgZustandLesen());
          }
        });
      });
    });
    beobachtbareContainer.forEach(function (c) { observer.observe(c, { childList: true, subtree: true }); });
  });
}

/* ============================================================================
 *  PRUEFFRISTEN-INFOKARTE (7.2.0, Nutzerwunsch #10; 7.3.0, Nutzerwunsch #5)
 * ----------------------------------------------------------------------------
 *  Zeigt am Anfang jedes Formulars (Abschnitt 1, Stammdaten) eine kompakte,
 *  ausklappbare Kurzuebersicht der normativen Wiederholungsfristen.
 *
 *  [7.3.0] Die urspruenglich hier zusaetzlich gezeigte GROSSE Live-Anzeige
 *  des im Formular eingetragenen naechsten Pruefdatums wurde auf Wunsch
 *  wieder entfernt - das Datum wird stattdessen NUR noch dort hervorgehoben,
 *  wo es tatsaechlich eingetragen wird: am ENDE der Pruefung, direkt am
 *  Eingabefeld #res_termin_date (gelb markiert, mit Bestaetigungs-Checkbox),
 *  siehe pruefterminBestaetigungHtml() weiter unten. Am Anfang stehend hatte
 *  der Termin faelschlich den Eindruck erweckt, er gehoere zu den
 *  Stammdaten, die vor der eigentlichen Pruefung feststehen.
 *
 *  [7.4.0, Punkt 4] anschlusspruefung.html hatte bisher bewusst KEIN
 *  #res_termin_date-Feld (Begruendung: ein Uebergabepunkt fuer eine einzelne
 *  Veranstaltung hat keinen eigenen wiederkehrenden Pruefzyklus). Das hat sich
 *  geaendert: die Anschlusspruefung hat jetzt ein eigenes Pruefintervall-Feld
 *  mit automatischer Terminberechnung, analog zu den anderen beiden
 *  Formularen (siehe Aenderungsbericht 7.4.0, Punkt 4) - der Text unten wurde
 *  entsprechend angepasst und erklaert nicht mehr "es gibt keinen Zyklus",
 *  sondern was das neue Intervall-Feld bedeutet. */
const PRUEFFRISTEN_TEXT_VDE0100 =
  'Ortsfeste elektrische Anlagen nach DIN VDE 0105-100: die Wiederholungsprüfungsfrist richtet sich nach ' +
  'Betriebsart, Umgebungsbedingungen und einer betrieblichen Gefährdungsbeurteilung (häufig 1–4 Jahre je nach ' +
  'Anlage/Einsatzbereich). Für Veranstaltungs-/Bühnentechnik empfiehlt sich wegen häufiger Auf-/Abbauten und ' +
  'mechanischer Beanspruchung in der Praxis meist eine jährliche Prüfung. Maßgeblich ist immer die individuelle ' +
  'Gefährdungsbeurteilung des Betreibers/der Elektrofachkraft.';
const PRUEFFRISTEN_TEXT_GERAETE =
  'Ortsveränderliche elektrische Geräte nach DIN EN 50699 (VDE 0702): die Prüffrist richtet sich nach Geräteart, ' +
  'Einsatzbedingungen und Fehlerquote der letzten Prüfungen. Für Geräte der Veranstaltungs-/Bühnentechnik (häufiger ' +
  'Auf-/Abbau, Transport, raue Umgebung) ist eine Frist von 12 Monaten üblich – bei besonders beanspruchten Geräten ' +
  '(z. B. häufig bewegte Anschlussleitungen) kann eine kürzere Frist angezeigt sein.';
const PRUEFFRISTEN_TEXT_ANSCHLUSS =
  'Ein Übergabepunkt der Stromversorgung wird grundsätzlich vor jeder Inbetriebnahme neu geprüft (DIN VDE ' +
  '0100-704/-711/-740). Das Prüfintervall-Feld unten dient dabei zwei Zwecken: bei einer wiederkehrend genutzten ' +
  'Einspeisestelle (z. B. ein fest vorgehaltener Baustromverteiler oder Speisepunkt) markiert es, bis wann diese ' +
  'Einspeisestelle selbst planmäßig erneut zu prüfen ist – unabhängig von der jeweils nächsten Veranstaltung. Bei ' +
  'einem einmaligen Übergabepunkt einer einzelnen Veranstaltung kann als Intervall die kürzeste verfügbare Option ' +
  'gewählt werden; maßgeblich bleibt in jedem Fall die erneute Prüfung vor der nächsten Inbetriebnahme. Die fest ' +
  'installierte Anlage HINTER dem Übergabepunkt unterliegt unverändert der regulären Wiederholungsprüfungsfrist ' +
  'nach DIN VDE 0105-100 (siehe Prüfprotokoll elektrischer Anlagen).';

/* praefix: 'PR' (vde0100), 'GP' (geraetepruefung), 'AP' (anschlusspruefung) -
 * bestimmt Text und ob eine Termin-Anzeige eingeblendet wird.
 * [Nutzerwunsch] Bei 'PR' (Prüfprotokoll elektrische Anlagen, vde0100.html)
 * wird die Infokarte "Wie wird die Prüffrist bestimmt?" auf ausdruecklichen
 * Wunsch NICHT mehr angezeigt - in den beiden anderen Formularen
 * (Geräteprüfung/Anschlussprüfung) bleibt sie unveraendert bestehen. */
function pruefterminInfokarteHtml(praefix) {
  if (praefix === 'PR') return '';
  const text = praefix === 'GP' ? PRUEFFRISTEN_TEXT_GERAETE
    : praefix === 'AP' ? PRUEFFRISTEN_TEXT_ANSCHLUSS
    : PRUEFFRISTEN_TEXT_VDE0100;
  return (
    '<div class="pruefdatum-box">' +
      '<details class="infokarte pruefdatum-infokarte">' +
        '<summary>ℹ️ Wie wird die Prüffrist bestimmt?</summary>' +
        '<div class="infokarte-inhalt"><p>' + text + '</p></div>' +
      '</details>' +
    '</div>'
  );
}

/* ============================================================================
 *  PRUEFTERMIN-BESTAETIGUNG AM ENDE DER PRUEFUNG (7.3.0, Nutzerwunsch #5)
 * ----------------------------------------------------------------------------
 *  Direkt unter dem Eingabefeld #res_termin_date eingeblendet: das Feld wird
 *  gelb markiert (auffaellige Warnfarbe, nicht die normale Pflichtfeld-
 *  Ampel), und eine Checkbox verlangt die explizite Bestaetigung, dass der
 *  Pruefer den naechsten Termin zur Kenntnis genommen hat. Anders als ein
 *  einfaches Pflichtfeld dokumentiert die Bestaetigung eine bewusste
 *  Wahrnehmung, nicht nur eine Eingabe - das Feld kann ja technisch auch
 *  automatisch vorbelegt sein (geraetepruefung.html), ohne dass der Pruefer
 *  es tatsaechlich angesehen hat. */
function pruefterminBestaetigungHtml() {
  return (
    '<div class="form-group pruefdatum-bestaetigung-gruppe">' +
      '<label class="pruefdatum-bestaetigung-label">' +
        '<input type="checkbox" id="res_termin_bestaetigt">' +
        ' Nächster Prüftermin zur Kenntnis genommen' +
      '</label>' +
    '</div>'
  );
}

/* Gelbe Warnmarkierung am Feld #res_termin_date, solange die Bestaetigung
 * (Checkbox) nicht gesetzt ist - unabhaengig davon, ob ueberhaupt schon ein
 * Datum eingetragen wurde (das Feld ist z.T. automatisch vorbelegt, siehe
 * geraetepruefung.html, ohne dass das schon eine bewusste Wahrnehmung waere). */
function pruefdatumBestaetigungAktualisieren() {
  const feld = document.getElementById('res_termin_date');
  const checkbox = document.getElementById('res_termin_bestaetigt');
  if (!feld || !checkbox) return;
  feld.classList.toggle('pruefdatum-unbestaetigt', !checkbox.checked);
}

if (typeof document !== 'undefined') {
  // (Initiales pruefdatumBestaetigungAktualisieren() + change-Listener auf
  // der Checkbox passieren bereits direkt beim Einfuegen des Platzhalter-
  // HTML in zusatzIconsEinbinden() weiter oben - kein zusaetzlicher
  // DOMContentLoaded-Handler noetig, das wuerde den change-Listener doppelt
  // registrieren.)
  // Wird der Termin NACH dem Bestaetigen noch geaendert (z. B. Korrektur),
  // soll die Bestaetigung nicht stillschweigend fuer den neuen Wert
  // weitergelten - die Checkbox wird zurueckgesetzt, die gelbe Markierung
  // erscheint wieder, bis erneut bestaetigt wird. Deckt auch den Fall ab,
  // dass res_termin_date programmatisch neu gesetzt wird (Autosave-
  // Wiederherstellung, Archiv-Vorlage, automatische Berechnung in
  // geraetepruefung.html).
  document.addEventListener('input', function (ev) {
    if (!ev.target || ev.target.id !== 'res_termin_date') return;
    const checkbox = document.getElementById('res_termin_bestaetigt');
    if (checkbox && checkbox.checked) checkbox.checked = false;
    pruefdatumBestaetigungAktualisieren();
  });
}
