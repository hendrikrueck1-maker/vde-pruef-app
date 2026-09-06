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
    iconAlt: 'Drehschalter-Icon Schleifenimpedanz',
    label: 'Z<sub>S</sub>',
    was: 'Die Schleifenimpedanz Z<sub>S</sub> bestimmt, ob die vorgeschaltete Sicherung im Fehlerfall schnell genug abschaltet – Grundlage des Schutzes durch automatische Abschaltung nach DIN&nbsp;VDE&nbsp;0100-410. Aus Z<sub>S</sub> wird zusätzlich der zu erwartende Kurzschlussstrom I<sub>K</sub> berechnet.',
    warum: 'Bei zu hoher Impedanz löst die Sicherung im Fehlerfall nicht rechtzeitig aus – die Berührungsspannung bleibt gefährlich lange anliegen.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Z-LOOP</span> bzw. <span class="drehschalter">LOOP</span> stellen.',
      'Prüfspitzen/Adapter an Steckdose oder Klemme des betreffenden Stromkreises anschließen.',
      '<span class="drehschalter">TEST</span> drücken.',
      'Messwert Z<sub>S</sub> (Ω) und errechneten Kurzschlussstrom I<sub>K</sub> (A) ablesen und ins Formular übertragen.'
    ],
    fluke1663Hinweis: 'Der Fluke 1663 zeigt bei aktivierter „No-Trip"-Funktion einen strombegrenzten Messwert. Für die Dokumentation ist der angezeigte Z<sub>S</sub>-Wert zu verwenden. No-Trip nur bei RCD-geschützten Kreisen aktivieren, um ein Auslösen während der Messung zu vermeiden.'
  },
  rcd: {
    iconDual: [
      { icon: 'img/drehschalter/RCD_Ausloesezeit_deltaT.png', alt: 'Drehschalter-Icon RCD-Auslösezeit', label: 'ΔT' },
      { icon: 'img/drehschalter/RCD_Ausloesestrom_I_deltaN.png', alt: 'Drehschalter-Icon RCD-Auslösestrom', label: 'I<sub>ΔN</sub>' }
    ],
    was: 'Die RCD-Prüfung stellt sicher, dass der Fehlerstrom-Schutzschalter bei einem tatsächlichen Fehlerstrom innerhalb der normativ vorgeschriebenen Zeit auslöst (z.&nbsp;B. 300/150/40&nbsp;ms bzw. 500/200/150&nbsp;ms bei selektiven RCDs, je nach Prüfstrom-Vielfachem).',
    warum: 'Ein RCD, der nicht oder zu spät auslöst, bietet keinen wirksamen Zusatzschutz gegen gefährliche Körperströme – die zentrale Schutzfunktion des Geräts wäre praktisch wirkungslos, ohne dass das von außen erkennbar wäre.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">RCD</span> stellen.',
      'RCD-Typ (AC/A/F/B) und Nennfehlerstrom am Gerät einstellen.',
      'Prüfstrom-Vielfaches wählen (½×, 1×, 2×, 5× I<sub>Δn</sub>).',
      '<span class="drehschalter">TEST</span> drücken – das Gerät zeigt Auslösezeit t<sub>A</sub> und (bei Rampentest) den Auslösestrom I<sub>Δmess</sub> an.'
    ],
    fluke1663Hinweis: 'Der am Fluke gewählte Prüfstrom-Faktor muss exakt dem im Formular ausgewählten Wert entsprechen, da die App den zulässigen Grenzwert daraus berechnet.'
  },
  riso: {
    icon: 'img/drehschalter/R_ISO_Isolationswiderstand.png',
    iconAlt: 'Drehschalter-Icon Isolationswiderstand',
    label: 'R<sub>ISO</sub>',
    was: 'Der Isolationswiderstand prüft, ob die Isolierung zwischen aktiven Leitern und Erde/PE ausreichend hoch ist, um einen unbeabsichtigten Stromfluss (Erd- oder Körperschluss) zu verhindern.',
    warum: 'Eine zu niedrige Isolation kann zu schleichenden Fehlerströmen, Erwärmung, Brandgefahr oder – im Fehlerfall an leitfähigen Teilen – zu einer echten Berührungsgefahr führen, ohne dass eine Sicherung dabei zwangsläufig auslöst.',
    fluke1663: [
      'Anlage spannungsfrei schalten.',
      'Drehschalter auf <span class="drehschalter">Ω INSULATION</span> stellen.',
      'Prüfspannung passend zur Anlage wählen (üblich 500&nbsp;V DC, bei SELV/PELV 250&nbsp;V DC) – muss mit der Formular-Auswahl „Prüfspannung" übereinstimmen.',
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
    iconAlt: 'Drehschalter-Icon Schutzleiterwiderstand',
    label: 'R<sub>PE</sub>',
    was: 'Der Schutzleiterwiderstand stellt sicher, dass der PE-Leiter einen niederohmigen, durchgängigen Verbindungspfad zum Erdungssystem bildet.',
    warum: 'Ein zu hoher oder unterbrochener Schutzleiterwiderstand verhindert, dass im Fehlerfall der Fehlerstrom sicher abfließen und die vorgeschaltete Schutzeinrichtung zuverlässig auslösen kann – ein Körper könnte dann selbst zum Strompfad werden.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Ω LOW OHM</span> bzw. <span class="drehschalter">R LOW Ω</span> stellen.',
      'Vorher am Gerät nullen (Messleitungswiderstand kompensieren).',
      'Messung zwischen Potenzialausgleichsschiene/PE-Sammelschiene und dem zu prüfenden Punkt durchführen.',
      'Leitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke6500: [
      'Drehschalter auf die Niederohm-/Schutzleiterwiderstands-Messfunktion stellen.',
      'Messleitungen vor der Messung nullen (Leitungswiderstand kompensieren).',
      'Messung zwischen dem Schutzkontakt des Netzsteckers und den berührbaren leitfähigen Teilen des Geräts durchführen.',
      'Anschlussleitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke6500Hinweis: 'Bei langen oder dünnen Anschlussleitungen steigt der zulässige Grenzwert – siehe Grenzwert-Hinweis im Formular direkt am Messfeld.'
  },
  ul: {
    icon: 'img/drehschalter/RCD_Ausloesezeit_deltaT.png',
    iconAlt: 'Drehschalter-Icon RCD-Auslösezeit (Berührungsspannung wird hier mitgemessen)',
    label: 'U<sub>F</sub>',
    was: 'Die Berührungsspannung U<sub>L</sub> ist die höchste Spannung, die an einem leitfähigen Teil im Fehlerfall dauerhaft anstehen darf, ohne eine unzumutbare Gefährdung darzustellen. Der zulässige Grenzwert hängt von der Umgebung ab (50&nbsp;V normal, 25&nbsp;V bei erhöhter Gefährdung, z.&nbsp;B. Bühnen- oder Open-Air-Umgebung).',
    warum: 'Der strengere Grenzwert existiert genau für Umgebungen, in denen Menschen mit schlechterem Erdungswiderstand (z.&nbsp;B. barfuß, nasser Boden) in Kontakt mit Anlagenteilen kommen können – eine überschrittene Berührungsspannung ist ein unmittelbares Sicherheitsrisiko.',
    fluke1663: [
      'Keine eigene Drehschalter-Position nötig – die Berührungsspannung (U<sub>F</sub>, „Fehlerspannung") wird bei der RCD-Auslösezeitmessung (Drehschalter-Position <span class="drehschalter">ΔT</span>) automatisch mitgemessen.',
      'Nach der RCD-Auslösezeitmessung: Wert U<sub>F</sub> in der sekundären Anzeige des Fluke 1663 ablesen (Spannungsabfall am PE-Leiter im Verhältnis zum Bemessungsfehlerstrom).',
      'Diesen Wert unten als „Gemessene Berührungsspannung U<sub>mess</sub>" eintragen.'
    ],
    fluke1663Hinweis: 'Der Grenzwert (≤ 50 V AC normal / ≤ 25 V AC bei erhöhter Gefährdung) wird von der App bereits automatisch anhand der Auswahl „Gefährdung" berechnet. Eine separate Spannungsmessung („Drehschalter auf V AC") ist für die Berührungsspannung nicht nötig – das war in einer früheren Version dieser Anleitung fälschlich als eigener Messschritt beschrieben.'
  },
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
    label: 'R<sub>PA</sub>',
    was: 'Die Potenzialausgleichsmessung prüft die Durchgängigkeit und den niederohmigen Widerstand zwischen der Potenzialausgleichsschiene/Erdungspunkt und den zu verbindenden leitfähigen Teilen der Anlage.',
    warum: 'Ein unterbrochener oder zu hochohmiger Potenzialausgleich verhindert, dass im Fehlerfall gefährliche Spannungsunterschiede zwischen berührbaren leitfähigen Teilen sicher ausgeglichen werden – ein zentraler Baustein des Schutzes gegen elektrischen Schlag.',
    fluke1663: [
      'Drehschalter auf <span class="drehschalter">Ω LOW OHM</span> bzw. <span class="drehschalter">R LOW Ω</span> stellen (dieselbe Messfunktion wie bei R<sub>PE</sub>).',
      'Vorher am Gerät nullen (Messleitungswiderstand kompensieren).',
      'Messung zwischen Potenzialausgleichsschiene und dem zu prüfenden Anlagenteil durchführen.',
      'Leitung während der Messung leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).'
    ],
    fluke1663Hinweis: 'Gleiche Drehschalter-Position und Vorgehensweise wie beim Schutzleiterwiderstand R<sub>PE</sub> – nur der Messpunkt unterscheidet sich.'
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

/* Baut die ausklappbare Infokarte "Was wird hier geprüft und warum?". */
function infokarteInhaltHtml(info) {
  return (
    '<details class="infokarte">' +
      '<summary>ℹ️ Was wird hier geprüft und warum?</summary>' +
      '<div class="infokarte-inhalt">' +
        '<p><span class="label-was">Was:</span> ' + info.was + '</p>' +
        '<p><span class="label-warum">Warum wichtig:</span> ' + info.warum + '</p>' +
      '</div>' +
    '</details>'
  );
}

/* Baut die ausklappbare Geraete-Kurzanleitung. geraet: 'fluke1663' (vde0100/
 * anschlusspruefung) oder 'fluke6500' (geraetepruefung, Fluke 6500-2). */
function flukeAnleitungHtml(info, geraet) {
  const schritte = geraet === 'fluke6500' ? info.fluke6500 : info.fluke1663;
  if (!schritte) return '';
  const hinweis = geraet === 'fluke6500' ? info.fluke6500Hinweis : info.fluke1663Hinweis;
  const geraetName = geraet === 'fluke6500' ? 'Fluke 6500-2' : 'Fluke 1663';
  return (
    '<details class="fluke">' +
      '<summary>🔧 So geht\'s mit dem ' + geraetName + '</summary>' +
      '<div class="fluke-inhalt">' +
        '<ol>' + schritte.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
        (hinweis ? '<div class="fluke-wichtig"><strong>Hinweis:</strong> ' + hinweis + '</div>' : '') +
        '<p class="fluke-disclaimer">Inoffizielle, selbst erstellte Kurzanleitung – keine geprüfte Übersetzung der ' +
        'offiziellen ' + geraetName + '-Bedienungsanleitung und nicht durch Fluke autorisiert. Vor der Nutzung bitte ' +
        'gegen die aktuelle Geräte-Bedienungsanleitung sowie die jeweils gültigen Normen (DIN VDE 0100, DIN VDE 0105-100, ' +
        'DIN EN 50699/50678) gegenprüfen. Die App macht keine Aussage zur korrekten Geräteeinstellung, sie unterstützt ' +
        'nur bei der Dokumentation der Ergebnisse.</p>' +
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
    karten: infokarteInhaltHtml(info) + flukeAnleitungHtml(info, geraet)
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
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', infokartenSichtbarkeitAnwenden);
  document.addEventListener('DOMContentLoaded', zusatzIconsEinbinden);
}
