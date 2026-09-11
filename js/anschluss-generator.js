// ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT STROMVERSORGUNG
// Grundlage: DIN VDE 0100-704 (Definition Übergabepunkt: Netzbetreiber-Anlage endet, Anlage des
// Nutzers beginnt), DIN VDE 0100-711 (Ausstellungen, Shows und Stände), DIN VDE 0100-718
// (Bauliche Anlagen für Menschenansammlungen - fuer Versammlungsstaetten wie das Theater
// einschlaegig), DIN VDE 0100-740 (Fliegende Bauten),
// DIN VDE 0100-600 (allgemeine Prüfmethodik Besichtigen-Erproben-Messen), DIN VDE 0100-520
// (max. 4% Spannungsfall vom Übergabepunkt zum Verbrauchsmittel).

let cardCounter = 0;

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

/* Siehe pdf-generator.js pruefstromSel(): bei einer NEUEN Karte ist "5x In
 * (max. 40 ms)" der in der Praxis fast immer verwendete Pruefstrom und wird
 * vorbelegt; ein wiederhergestellter (auch bewusst leerer) Zwischenstand
 * behaelt seinen eigenen Wert. */
function pruefstromSel(wert, optionWert) {
  const eff = wert === undefined ? '5' : wert;
  return eff === optionWert ? ' selected' : '';
}

/* [7.4.0, Punkt 2] DREHSTROM vs. 1-PHASIG JE ÜBERGABEPUNKT-KARTE
 * ---------------------------------------------------------------------------
 * 1:1 uebernommenes Muster aus vde0100.html (istNetzmessungDrehstrom()/
 * updateNetzmessungNetzart() in js/pdf-generator.js), aber KARTENBEZOGEN: die
 * Anschlusspruefung hat mehrere Uebergabepunkt-Karten gleichzeitig im DOM,
 * ein einzelner globaler Schalter wie in vde0100.html wuerde alle Karten
 * gemeinsam umschalten. Drehstrom ist der praxisuebliche Regelfall bei einer
 * Veranstaltungs-Einspeisung (CEE) und deshalb vorausgewaehlt. */
function istFeedDrehstrom(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const sel = card && card.querySelector('.c-netzart');
  return !sel || sel.value !== '1-phasig';
}

function updateFeedNetzart(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;
  const drehstrom = istFeedDrehstrom(cardId);
  card.querySelectorAll('.netzmessung-drehstrom-feld').forEach(function (el) {
    el.style.display = drehstrom ? '' : 'none';
    if (!drehstrom) {
      // Ausgeblendete Drehstromwerte duerfen nicht unsichtbar als Messwert
      // im PDF landen bzw. eine Pflichtfeld-Warnung ausloesen (siehe
      // updateNetzmessungNetzart() in js/pdf-generator.js, gleiches Muster).
      const feld = el.querySelector('input, select');
      if (feld && feld.tagName === 'INPUT') feld.value = '';
    }
  });
  const label = card.querySelector('.c-l1n-label');
  if (label) label.textContent = drehstrom ? 'U L1–N (V):' : 'U (V):';
  const drehfeldGruppe = card.querySelector('.c-drehfeld-gruppe');
  if (drehfeldGruppe) drehfeldGruppe.style.display = drehstrom ? '' : 'none';
  if (!drehstrom) {
    const drehfeldSel = card.querySelector('.c-drehfeld');
    if (drehfeldSel) drehfeldSel.value = '';
  }
  validateFeedNorms(cardId);
}

function addFeedCard(data = {}) {
  cardCounter++;
  // Stabiler, vom cardCounter unabhaengiger Foto-Schluessel (siehe
  // neueKartenId() in pdf-utils.js und Kommentar in pdf-generator.js
  // addCircuitCard()).
  const kartenId = data.kartenId || neueKartenId();
  const container = document.getElementById('feedsContainer');
  const card = document.createElement('div');
  card.className = 'feed-card';
  card.id = `feed_${cardCounter}`;
  card.dataset.kartenId = kartenId;

  card.innerHTML = `
    <div class="feed-header">
      <span>Übergabepunkt #${cardCounter}</span>
      <span>
        <button type="button" class="btn btn-secondary" onclick="dupliziereUebergabepunkt('feed_${cardCounter}')" title="Neue Karte mit denselben Netz- und Schutzdaten. Messwerte bleiben leer.">⧉ Duplizieren</button>
        <button type="button" class="btn-danger" onclick="removeCard('feed_${cardCounter}')">Entfernen</button>
      </span>
    </div>

    <div class="grid">
      <div class="form-group grid-full">
        <label for="bez_${cardCounter}">Bezeichnung Übergabepunkt:</label>
        <input type="text" class="c-bez" id="bez_${cardCounter}" value="${attrEsc(data.bez)}" placeholder="z. B. Bühnenversorgung Haupthaus">
      </div>
      <div class="form-group">
        <label for="netzsystem_${cardCounter}">Netzsystem:</label>
        <select class="c-netzsystem" id="netzsystem_${cardCounter}">
          <option${!data.netzsystem || data.netzsystem === 'TN-S' ? ' selected' : ''}>TN-S</option>
          <option${data.netzsystem === 'TN-C-S' ? ' selected' : ''}>TN-C-S</option>
          <option${data.netzsystem === 'TN-C' ? ' selected' : ''}>TN-C</option>
          <option${data.netzsystem === 'TT' ? ' selected' : ''}>TT</option>
          <option${data.netzsystem === 'IT' ? ' selected' : ''}>IT</option>
        </select>
      </div>
      <div class="form-group">
        <!-- [7.4.0, Punkt 2] Drehstrom/1-phasig-Auswahl je Karte, analog zu
             #netzmessung_netzart in vde0100.html. -->
        <label for="netzart_${cardCounter}">Netzart:</label>
        <select class="c-netzart" id="netzart_${cardCounter}" onchange="updateFeedNetzart(${cardCounter})">
          <option value="Drehstrom"${data.netzart !== '1-phasig' ? ' selected' : ''}>Drehstrom (400 V, 3 Außenleiter)</option>
          <option value="1-phasig"${data.netzart === '1-phasig' ? ' selected' : ''}>1-phasiger Wechselstrom (230 V)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="frequenz_${cardCounter}">Frequenz (Hz):</label>
        <input type="text" inputmode="decimal" class="c-frequenz" id="frequenz_${cardCounter}" value="${attrEsc(data.frequenz)}" placeholder="z. B. 50 Hz">
      </div>
    </div>

    ${typeof fotosLeisteHtml === 'function' ? fotosLeisteHtml(fotoKartenKey('AP', AKTUELLER_ENTWURF_ID, 'uebergabepunkt', kartenId)) : ''}

    <!-- [7.4.0, Punkt 2/10] Netzmessung (Spannungen, Frequenz, N-PE) direkt am
         Uebergabepunkt statt als Freitextfelder in den Stammdaten - dorthin
         gehoert die Messung fachlich, weil sie je Uebergabepunkt getrennt zu
         bewerten ist. Ersetzt die bisherige, aus den Stammdaten entfernte
         Sektion "Schutzleiter & Spannung N-PE" (siehe Aenderungsbericht 7.4.0,
         Punkt 10 - explizite eigene Entscheidung, dort dokumentiert). -->
    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('uv', 'fluke1663').icon}<span class="titel-text">1. Netzmessung &ndash; Spannungen, Frequenz &amp; N&ndash;PE</span></div>
      <p class="limit-hint" style="margin:0 0 8px;">Sollwerte: L gegen N je 230 V (&plusmn;10&nbsp;%) · L gegen L je 400 V (&plusmn;10&nbsp;%) · N gegen PE 0 V · Frequenz 50 Hz.</p>
      <div class="grid">
        <div class="form-group"><label for="u_l1n_${cardCounter}"><span class="c-l1n-label">U L1&ndash;N (V):</span></label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l1n" id="u_l1n_${cardCounter}" value="${attrEsc(data.u_l1n)}" placeholder="230" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l1n', 'u_l1n')"></div>
        <div class="form-group netzmessung-drehstrom-feld"><label for="u_l2n_${cardCounter}">U L2&ndash;N (V):</label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l2n" id="u_l2n_${cardCounter}" value="${attrEsc(data.u_l2n)}" placeholder="230" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l2n', 'u_l2n')"></div>
        <div class="form-group netzmessung-drehstrom-feld"><label for="u_l3n_${cardCounter}">U L3&ndash;N (V):</label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l3n" id="u_l3n_${cardCounter}" value="${attrEsc(data.u_l3n)}" placeholder="230" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l3n', 'u_l3n')"></div>
        <div class="form-group netzmessung-drehstrom-feld"><label for="u_l12_${cardCounter}">U L1&ndash;L2 (V):</label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l12" id="u_l12_${cardCounter}" value="${attrEsc(data.u_l12)}" placeholder="400" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l12', 'u_l12')"></div>
        <div class="form-group netzmessung-drehstrom-feld"><label for="u_l23_${cardCounter}">U L2&ndash;L3 (V):</label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l23" id="u_l23_${cardCounter}" value="${attrEsc(data.u_l23)}" placeholder="400" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l23', 'u_l23')"></div>
        <div class="form-group netzmessung-drehstrom-feld"><label for="u_l13_${cardCounter}">U L1&ndash;L3 (V):</label><input type="text" inputmode="decimal" pattern="[0-9]*" class="c-u-l13" id="u_l13_${cardCounter}" value="${attrEsc(data.u_l13)}" placeholder="400" oninput="validateFeedNetzspannungsfeld(${cardCounter}, 'u-l13', 'u_l13')"></div>
        <div class="form-group">
          <label>U<sub>N&ndash;PE</sub> (V) [Sollwert 0 V] <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>
          <input type="text" inputmode="decimal" class="c-unpe" value="${attrEsc(data.unpe)}" placeholder="z. B. 0,3" oninput="validateFeedNorms(${cardCounter})">
          <div class="limit-hint">Der einzige Wert, der eigenständig einen Fehler findet: hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat.</div>
        </div>
      </div>
      ${messgroesseBlock('uv', 'fluke1663').karten}
    </div>

    <!-- [7.4.0, Punkt 2] Drehfeldrichtung als eigenes Messfeld (nur Drehstrom) -->
    <div class="sub-section c-drehfeld-gruppe">
      <div class="grid">
        <div class="form-group">
          <!-- [7.3.0, Nutzerwunsch #4] War bisher IMMER technisch auf "i.O."
               vorbelegt - jetzt wie alle anderen Erproben-Felder mit leerer
               Startoption. -->
          <label for="drehfeld_${cardCounter}">${messgroesseBlock('drehfeld', 'fluke1663').icon}Drehfeldrichtung (bei Drehstrom):</label>
          <select class="c-drehfeld erp-item" id="drehfeld_${cardCounter}" onchange="sichtErpNiOPruefen(this)">
            <option value=""${!data.drehfeld ? ' selected' : ''}>– bitte wählen –</option>
            <option value="i.O."${data.drehfeld === 'i.O.' ? ' selected' : ''}>i.O. – rechtsdrehend</option>
            <option value="n.i.O."${data.drehfeld === 'n.i.O.' ? ' selected' : ''}>n.i.O. – linksdrehend</option>
            <option value="n.a."${data.drehfeld === 'n.a.' ? ' selected' : ''}>n.a.</option>
          </select>
        </div>
      </div>
      <div class="form-group grid-full">${messgroesseBlock('drehfeld', 'fluke1663').karten}</div>
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('rpe', 'fluke1663').icon}<span class="titel-text">2. Schutzleiter- &amp; Isolationswiderstand</span></div>
      <div class="grid">
        <div class="form-group">
          <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
          <input type="text" inputmode="decimal" class="c-rpe" value="${attrEsc(data.rpe)}" placeholder="z. B. 0,15" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <!-- [7.4.0, Punkt 2] Isolationswiderstand R_ISO je Uebergabepunkt,
               Grenzwertlogik analog zu vde0100.html (getIsoMin-Grundwert
               1,0 MΩ, SELV/PELV 0,5 MΩ - hier vereinfacht ohne eigene
               Pruefspannungsauswahl, da am Uebergabepunkt regelmaessig unter
               Betriebsbedingungen/mit angeschlossenen Verbrauchern gemessen wird). -->
          <label>R<sub>ISO</sub> (M&Omega;) [Richtwert &ge; 1,0 M&Omega;]:</label>
          <input type="text" inputmode="decimal" class="c-riso" value="${attrEsc(data.riso !== undefined && data.riso !== '' ? data.riso : '>')}" placeholder="z. B. > 500" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
      ${messgroesseBlock('rpe', 'fluke1663').karten}
      ${messgroesseBlock('riso', 'fluke1663').karten}
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('zs', 'fluke1663').icon}<span class="titel-text">3. Absicherung & Schleifenimpedanz am Übergabepunkt</span></div>
      <div class="grid">
        <div class="form-group">
          <label for="sich_${cardCounter}">Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${attrEsc(data.sich)}" placeholder="z. B. B 32A" oninput="validateFeedNorms(${cardCounter})" autocomplete="off">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 16A'); validateFeedNorms(${cardCounter})">B 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 32A'); validateFeedNorms(${cardCounter})">B 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 32A'); validateFeedNorms(${cardCounter})">C 32A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 63A'); validateFeedNorms(${cardCounter})">C 63A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Z<sub>S</sub> (&Omega;) &ndash; Schleifenimpedanz L&ndash;PE <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>
          <input type="text" inputmode="decimal" class="c-zs" value="${attrEsc(data.zs)}" placeholder="z. B. 0.28" oninput="onFeedZsInput(${cardCounter})">
          <div class="limit-hint" id="fzs_limit_${cardCounter}"></div>
        </div>
        <div class="form-group">
          <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>
          <input type="text" inputmode="decimal" class="c-ik" value="${attrEsc(data.ik)}" placeholder="z. B. 605" oninput="onFeedIkInput(${cardCounter})">
          <div class="limit-hint">Wird aus Z<sub>S</sub> berechnet (I<sub>K</sub> = 230 V / Z<sub>S</sub>), solange nichts von Hand eingetragen wird.</div>
        </div>
        <div class="form-group">
          <!-- [7.4.0, Punkt 2] Z_L-N zusaetzlich zu Z_S, 1:1 analog zur bereits
               in vde0100.html vorhandenen Logik (.c-zln, siehe validateCardNorms
               in js/pdf-generator.js) - inklusive Bewertung, nicht nur Anzeige. -->
          <label>Z<sub>L-N</sub> (&Omega;) &ndash; Netzimpedanz <span class="feld-badge feld-badge-optional">Optional</span>:</label>
          <input type="text" inputmode="decimal" class="c-zln" value="${attrEsc(data.zln)}" placeholder="nur wenn gemessen" oninput="onFeedZlnInput(${cardCounter})">
          <div class="limit-hint">Fluke 1663: Zi &ndash; <b>LINE</b> (L&ndash;N). Findet einen hochohmigen N-Leiter, den die L&ndash;PE-Messung nicht sieht. Leer lassen, wenn nicht gemessen.</div>
        </div>
        <div class="form-group">
          <label>I<sub>K2</sub> (A) &ndash; Kurzschlussstrom L&ndash;N:</label>
          <input type="text" inputmode="decimal" class="c-ik2" value="${attrEsc(data.ik2)}" placeholder="rechnet sich aus Z_L-N">
        </div>
      </div>
      ${messgroesseBlock('zs', 'fluke1663').karten}
    </div>

    <div class="sub-section">
      <div class="sub-title mess-karte-titel">${messgroesseBlock('rcd', 'fluke1663').icon}<span class="titel-text">4. Fehlerstrom-Schutzeinrichtung (RCD / FI) am Übergabepunkt</span></div>
      <div class="grid">
        <div class="form-group">
          <label for="rcd_typ_${cardCounter}">RCD Typ:</label>
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${attrEsc(data.rcd_typ)}" placeholder="z. B. Typ A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ A')">Typ A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B')">Typ B</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B+')">Typ B+</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Ohne RCD')">Ohne RCD</button>
          </div>
        </div>
        <div class="form-group">
          <!-- [7.3.0, Nutzerwunsch #3] Bemessungsstrom I_n des RCD-Geraets
               selbst, analog zu vde0100.html. -->
          <label>Bemessungsstrom I<sub>n</sub> (RCD):</label>
          <input type="text" class="c-rcd-in" id="rcd_in_${cardCounter}" value="${attrEsc(data.rcd_in)}" placeholder="z. B. 40 A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_in_${cardCounter}', '16 A')">16 A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_in_${cardCounter}', '25 A')">25 A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_in_${cardCounter}', '40 A')">40 A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_in_${cardCounter}', '63 A')">63 A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${attrEsc(data.rcd_idn)}" placeholder="z. B. 30 mA" oninput="validateFeedNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '30 mA'); validateFeedNorms(${cardCounter})">30 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '100 mA'); validateFeedNorms(${cardCounter})">100 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '300 mA'); validateFeedNorms(${cardCounter})">300 mA</button>
          </div>
        </div>
        <div class="form-group">
          <label>Auslösestrom I<sub>&Delta;mess</sub> (mA):</label>
          <input type="text" inputmode="decimal" class="c-rcd-imess" value="${attrEsc(data.rcd_imess)}" placeholder="z. B. 22" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label for="rcd_pruefstrom_${cardCounter}">Prüfstrom für Auslösestrom / Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" id="rcd_pruefstrom_${cardCounter}" onchange="validateFeedNorms(${cardCounter})">
            <option value=""${pruefstromSel(data.rcd_pruefstrom, '')}>&ndash; bitte wählen &ndash;</option>
            <option value="1"${pruefstromSel(data.rcd_pruefstrom, '1')}>1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>
            <option value="2"${pruefstromSel(data.rcd_pruefstrom, '2')}>2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>
            <option value="5"${pruefstromSel(data.rcd_pruefstrom, '5')}>5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="fta_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rcd-ta" value="${attrEsc(data.rcd_ta)}" placeholder="z. B. 24" oninput="validateFeedNorms(${cardCounter})">
        </div>
        <!-- [7.4.0, Punkt 2] U_L (Beruehrungsspannung) bei der RCD-Pruefung,
             1:1 analog zur in vde0100.html vorhandenen Logik (.c-gefaehrdung/
             .c-ul-max/.c-umess, siehe validateCardNorms in js/pdf-generator.js).
             Benennung konsistent zur Anlagenpruefung: U_L, nicht "Beruehrungsstrom"
             oder "I_t" (Begriffsfehler im urspruenglichen Auftrag). -->
        <div class="form-group">
          <label for="gef_${cardCounter}">Bereich / Gefährdung:</label>
          <select class="c-gefaehrdung" id="gef_${cardCounter}" onchange="validateFeedNorms(${cardCounter})">
            <option value="normal">Normalbereich (50 V AC)</option>
            <option value="erhoeht">Erhöhte Gefährdung (25 V AC)</option>
          </select>
          <div class="limit-hint">Erhöhte Gefährdung z. B. Bühne, Open Air, feuchte/leitfähige Umgebung, Baustelle.</div>
        </div>
        <div class="form-group">
          <label>Maximal zulässige Berührungsspannung U<sub>L</sub>:</label>
          <input type="text" class="c-ul-max" id="ul_max_${cardCounter}" value="&le; 50 V AC" readonly>
        </div>
        <div class="form-group">
          <label>Gemessene Berührungsspannung U<sub>L</sub> (V):</label>
          <input type="text" inputmode="decimal" class="c-umess" value="${attrEsc(data.umess)}" placeholder="z. B. 2,5 V" oninput="validateFeedNorms(${cardCounter})">
        </div>
      </div>
      ${messgroesseBlock('rcd', 'fluke1663').karten}
    </div>

    <!-- [7.4.0, Punkt 2] Durchgängigkeit Potenzialausgleich als eigenes
         Messfeld PRO Karte - der tatsaechliche Messwert/Zustand an diesem
         Uebergabepunkt. ERGAENZT das bestehende globale Feld "Potenzialausgleich
         angeschlossen" in Abschnitt 5 (grundsaetzliches Anlagenkonzept), ersetzt
         es NICHT (siehe Aenderungsbericht 7.4.0, Punkt 2 - beide Felder haben
         unterschiedliche Bedeutung, Beschriftung dort entsprechend angepasst). -->
    <div class="sub-section">
      <div class="sub-title">5. Durchgängigkeit Potenzialausgleich (Messwert dieses Übergabepunkts)</div>
      <div class="grid">
        <div class="form-group">
          <label for="pa_durchg_${cardCounter}">Durchgängigkeit Potenzialausgleich:</label>
          <select class="c-pa-durchg" id="pa_durchg_${cardCounter}">
            <option value="" selected>– bitte wählen –</option>
            <option>i.O.</option>
            <option>n.i.O.</option>
            <option>n.a.</option>
          </select>
        </div>
        <div class="form-group">
          <label>R<sub>PA</sub> (&Omega;), falls gemessen:</label>
          <input type="text" inputmode="decimal" class="c-pa-widerstand" value="${attrEsc(data.pa_widerstand)}" placeholder="z. B. 0,20">
        </div>
      </div>
    </div>

    <div class="circuit-footer-actions">
      <button type="button" class="btn btn-secondary" onclick="dupliziereUebergabepunkt('feed_${cardCounter}')" title="Neue Karte mit denselben Netz- und Schutzdaten. Messwerte bleiben leer.">⧉ Duplizieren</button>
      <button type="button" class="btn-danger" onclick="removeCard('feed_${cardCounter}')">Entfernen</button>
    </div>
  `;
  // Pruefstrom: bei einer neuen Karte ist "5" bereits per <option selected>
  // vorbelegt (siehe pruefstromSel oben) - das darf hier nicht ueberschrieben
  // werden. Ein wiederhergestellter, auch bewusst leerer Wert wird weiterhin
  // exakt uebernommen.
  if (data.rcd_pruefstrom !== undefined) { const pruefstromElem = card.querySelector('.c-rcd-pruefstrom'); if (pruefstromElem) pruefstromElem.value = data.rcd_pruefstrom; }
  if (data.gefaehrdung) { const gefElem = card.querySelector('.c-gefaehrdung'); if (gefElem) gefElem.value = data.gefaehrdung; }
  if (data.pa_durchg !== undefined) { const paElem = card.querySelector('.c-pa-durchg'); if (paElem) paElem.value = data.pa_durchg; }
  container.appendChild(card);
  nummeriereKartenNeu('#feedsContainer', '.feed-card', 'Übergabepunkt');
  updateFeedNetzart(cardCounter);
  validateFeedNorms(cardCounter);
  // G17: vorhandene Fotos dieser Karte laden (z. B. beim Wiederherstellen
  // aus Autosave/Archiv).
  if (typeof fotosLeisteAktualisieren === 'function') {
    fotosLeisteAktualisieren(fotoKartenKey('AP', AKTUELLER_ENTWURF_ID, 'uebergabepunkt', kartenId));
  }
}

/* Karte duplizieren - ohne Messwerte. Begruendung siehe pdf-generator.js:
 * uebernommen wird, was den Uebergabepunkt beschreibt, nicht was gemessen
 * wurde. Ein kopierter Messwert waere eine erfundene Messung. */
function dupliziereUebergabepunkt(cardDomId) {
  const card = document.getElementById(cardDomId);
  if (!card) return;
  const w = (sel) => card.querySelector(sel)?.value || '';
  const bezAlt = w('.c-bez').trim();
  addFeedCard({
    bez: bezAlt ? bezAlt + ' (Kopie)' : '',
    netzsystem: w('.c-netzsystem'),
    netzart: w('.c-netzart'),
    frequenz: w('.c-frequenz'),
    sich: w('.c-sich-typ'),
    rcd_typ: w('.c-rcd-typ'),
    rcd_in: w('.c-rcd-in'),
    rcd_idn: w('.c-rcd-idn'),
    rcd_pruefstrom: w('.c-rcd-pruefstrom'),
    gefaehrdung: w('.c-gefaehrdung')
    // drehfeld, u_l1n..u_l13, unpe, rpe, riso, zs, ik, zln, ik2, rcd_imess,
    // rcd_ta, umess, pa_durchg, pa_widerstand bleiben leer (Messwerte).
  });
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  const neu = document.querySelector('#feedsContainer .feed-card:last-child .c-bez');
  if (neu) { neu.focus(); neu.select(); }
}

/* [7.4.0, Punkt 2] Live-Validierung der sechs Aussenleiterfelder je Karte -
 * dieselbe Toleranzpruefung wie in vde0100.html (netzspannungAusserNorm() in
 * pdf-utils.js), aber kartenbezogen ueber CSS-Klasse statt globaler ID. */
function validateFeedNetzspannungsfeld(cardId, klasse, feldName) {
  const card = document.getElementById(`feed_${cardId}`);
  const el = card && card.querySelector('.c-' + klasse);
  if (!el) return;
  el.classList.toggle('out-of-norm', netzspannungAusserNorm(feldName, el.value));
}

function validateFeedNorms(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (!card) return;

  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseMesswert(rpeElem.value);
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  /* [7.4.0, Punkt 2] R_ISO gegen den Mindestwert nach DIN VDE 0100-600
   * Tabelle 6.1 (1,0 MΩ) - analog zur Bewertung in vde0100.html/
   * geraetepruefung.html. Ein mit ">" vorbelegter, unveraenderter Wert gilt
   * (wie ueberall in der App) nicht als eingetragener Messwert. */
  const risoElem = card.querySelector('.c-riso');
  if (risoElem && risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseMesswert(txt);
      if (!isNaN(num) && num < 1.0) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else if (risoElem) risoElem.classList.remove('out-of-norm');

  /* 4.5.0 (B1): U N-PE bewerten. Sollwert 0 V, ab 1 V Beanstandung.
   * Fehlt der Wert ganz, wird das Feld als fehlende Pflichtangabe markiert -
   * dieselbe Farbe wie bei einem eingetragenen, aber ungeprueften RCD. */
  const unpeElem = card.querySelector('.c-unpe');
  if (unpeElem) {
    const leer = unpeElem.value.trim() === '';
    unpeElem.classList.toggle('out-of-norm', npeUeberschritten(unpeElem.value));
    unpeElem.classList.toggle('missing-value', leer);
  }

  /* [7.4.0, Punkt 2] U_L (Beruehrungsspannung) bei der RCD-Pruefung, analog
   * zu validateCardNorms() in js/pdf-generator.js: Grenzwert haengt von
   * Spannungsart (hier immer AC, Netzmessung) und Gefaehrdungsbereich ab. */
  const umessElem = card.querySelector('.c-umess');
  const gefElem = card.querySelector('.c-gefaehrdung');
  const gefVal = gefElem ? gefElem.value : 'normal';
  const ulFeld = card.querySelector('.c-ul-max');
  const ulLimit = getUlGrenzwert('AC', gefVal);
  if (ulFeld) ulFeld.value = `≤ ${ulLimit} V AC`;
  if (umessElem && umessElem.value.trim() !== '') {
    const num = parseMesswert(umessElem.value);
    if (!isNaN(num) && num > ulLimit) umessElem.classList.add('out-of-norm'); else umessElem.classList.remove('out-of-norm');
  } else if (umessElem) umessElem.classList.remove('out-of-norm');

  const sichElem = card.querySelector('.c-sich-typ');
  const ikElem = card.querySelector('.c-ik');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;

  /* Z_S GEGEN DEN ZULAESSIGEN HOECHSTWERT PRUEFEN (Zs_max = 230 V / I_a).
   * In der Anlagenpruefung gab es das laengst, in der Anschlusspruefung war
   * Z_S ein reines Textfeld: ein Uebergabepunkt mit Z_S = 5 Ohm an C 63 A
   * wurde freigegeben, solange nur das I_K-Feld leer blieb. */
  const maxZs = sichElem ? getMaxZs(sichElem.value) : null;
  const zsElem = card.querySelector('.c-zs');
  const zsLimitLabel = document.getElementById(`fzs_limit_${cardId}`);
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
  /* [7.4.0, Punkt 2] Z_L-N gegen denselben Hoechstwert wie Z_S bewerten -
   * analog zur Logik in js/pdf-generator.js (validateCardNorms). */
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
  // (40 ms gelten nur bei 5x I_dn, bei 1x I_dn sind 300 ms zulaessig)
  const pruefstromElem = card.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  // Ohne gewaehlten Pruefstrom gibt es keinen definierten Grenzwert.
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById(`fta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '') {
    const num = parseMesswert(taElem.value);
    if (!isNaN(num) && (num > taMax || num < 0)) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein
  // (DIN VDE 0100-600 Abschn. 6.4.3.7). Fehlende Messwerte werden markiert,
  // statt stillschweigend als "-" gedruckt zu werden. Diese Pruefung fehlte in
  // der Anschlusspruefung bisher komplett - ein nie ausgeloester RCD fiel
  // dadurch niemandem auf.
  const imessMarkElem = card.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  [imessMarkElem, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && rcdWertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });
}

/* Z_S -> I_K automatisch rechnen; eine Eingabe von Hand hebt die Kopplung auf.
 * Gleiche Logik wie in der Anlagenpruefung (koppleImpedanzMitStrom in
 * pdf-utils.js). */
function onFeedZsInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zs', '.c-ik');
  validateFeedNorms(cardId);
}

/* [7.4.0, Punkt 2] Z_L-N -> I_K2 automatisch rechnen, analog zu Z_S -> I_K
 * (onZlnInput() in js/pdf-generator.js). */
function onFeedZlnInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zln', '.c-ik2');
  validateFeedNorms(cardId);
}

function onFeedIkInput(cardId) {
  const card = document.getElementById(`feed_${cardId}`);
  const el = card && card.querySelector('.c-ik');
  if (el) delete el.dataset.auto;
  validateFeedNorms(cardId);
}

function feedHasOutOfNorm(card) {
  return Array.from(card.querySelectorAll('.c-rpe, .c-zs, .c-ik, .c-rcd-imess, .c-rcd-ta')).some(el => el.classList.contains('out-of-norm'));
}

// validateErdungAnschluss() liegt zentral in pdf-utils.js (Alias auf validateErdung).
// Die frueher hier stehende Kopie ueberschrieb sie beim Laden.
const ERDUNG_RE_GRENZWERT_ANSCHLUSS = ERDUNG_RE_RICHTWERT;

function initSignaturePadsAnschluss() {
  return {
    uebergeber: setupSignatureCanvas('sigUebergeber'),
    uebernehmer: setupSignatureCanvas('sigUebernehmer')
  };
}

function fillExampleDataAnschluss() {
  document.getElementById('protokollnummer').value = 'AP-2026-014';
  document.getElementById('pruefer').value = 'Max Mustermann (Elektrofachkraft)';
  // [M1/M2/M3] Auftraggeber gehoert zu den Mindestangaben (erstesLeerePflichtfeld,
  // siehe generatePDFAnschlussInner) und muss deshalb auch im Beispieldatensatz
  // gesetzt sein, sonst blockiert der eigene Testdatensatz seinen PDF-Export.
  document.getElementById('auftraggeber').value = 'TESTDATEN – Stadttheater Konstanz, Inselgasse 2-6, 78462 Konstanz';
  // [7.4.0, Punkt 1] "Veranstaltung/Anlass" entfernt, ersetzt durch
  // "Anlage / Objekt" (anlage_bez) - siehe Aenderungsbericht 7.4.0, Punkt 1.
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
  document.getElementById('erdung_re').value = '3,2';
  document.getElementById('pa_messpunkt').value = 'PA-Schiene im Übergabeverteiler Bühnenzugang Ost';
  updateNaechsterTerminAnschluss();
  validateErdungAnschluss();
  document.getElementById('res_bemerkungen').value =
    TESTDATEN_HINWEISTEXT + ' Übergabepunkt in einwandfreiem Zustand. Keine Mängel festgestellt.';

  // [M1] Sichtpruefungsfelder muessen mit ausgefuellt werden - sonst
  // blockiert ersteLeereAuswahl() ("Es ist noch eine Bewertung offen") den
  // PDF-Export des eigenen Beispieldatensatzes.
  document.querySelectorAll('.sicht-item').forEach(el => { el.value = 'i.O.'; });
  document.querySelectorAll('.sicht-item').forEach(el => sichtErpNiOPruefen(el));

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard({
    bez: 'Bühnenversorgung Haupt', netzsystem: 'TN-S', netzart: 'Drehstrom', frequenz: '50',
    u_l1n: '231', u_l2n: '230', u_l3n: '229', u_l12: '399', u_l23: '400', u_l13: '401', unpe: '0,3',
    drehfeld: 'i.O.', rpe: '0,12', riso: '> 500',
    sich: 'C 32A', zs: '0,31', ik: '740', zln: '0,29', ik2: '793',
    rcd_typ: 'Typ A', rcd_in: '40 A', rcd_idn: '30 mA', rcd_imess: '21', rcd_ta: '17', rcd_pruefstrom: '5',
    gefaehrdung: 'normal', umess: '2,5',
    pa_durchg: 'i.O.', pa_widerstand: '0,20'
  });
  // .c-drehfeld ist jetzt ebenfalls .erp-item (Punkt 4) - Ampel-Status nach
  // dem Setzen von value/"selected" per addFeedCard() nachziehen, analog zu
  // .sicht-item oben (das "selected"-Attribut allein loest noch keine
  // gruene Markierung aus, das macht erst sichtErpNiOPruefen()).
  document.querySelectorAll('.erp-item').forEach(el => sichtErpNiOPruefen(el));

  testdatensatzSetzen();
}

// KOPFDATEN (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet).
// Der Titel wurde gekuerzt: mit dem Zusatz "STROMVERSORGUNG" war er so lang,
// dass drawFittedText ihn deutlich staerker verkleinern musste als bei den
// anderen beiden Protokollen - die Kopfzeile sah dadurch anders aus.
// Der Zusatz steht jetzt in der Normzeile.
// DIN VDE 0100-718 ergaenzt: Das Stadttheater ist eine Versammlungsstaette,
// fuer die diese Norm (Bauliche Anlagen fuer Menschenansammlungen) einschlaegig ist.
const ANSCHLUSS_KOPF = {
  titel: "ANSCHLUSSPRÜFUNG ÜBERGABEPUNKT",
  normzeile: "Übergabe der Stromversorgung nach DIN VDE 0100-704 / -711 / -718 / -740 i.V.m. DIN VDE 0100-600"
};
const ANSCHLUSS_REVISION = "Formular Rev. 2026-09 · Normstand: VDE 0100-600:2017-06 · VDE 0100-718:2019-06";

/* ===========================================================================
 *  LEERFORMULAR ZUM AUSFUELLEN VON HAND  (siehe Kommentar in pdf-generator.js)
 *  RCD in drei schmale Spalten, groessere Zeilenhoehe, echte
 *  Fortsetzungsblaetter statt mehrfachem Ausdruck desselben Blattes.
 * ======================================================================== */
// 4.5.0: 10 -> 9 Zeilen. Der Kopfkasten traegt jetzt zwei Zeilen Netzmessung
// (Befund B1); die Zeile wird dort gebraucht, damit Blatt 1 ein Blatt bleibt.
const LEER_ZEILEN_BLATT1_AP = 7;
const LEER_ZEILEN_FOLGE_AP  = 28;
const LEER_ZEILENHOEHE_AP   = 8.0;

// [7.4.0, Punkt 2] Von 11 auf 9 Spalten reduziert (analog zur ausgefuellten
// Tabelle, siehe HEAD_AUSGEFUELLT_AP): Netzmessung, R_ISO und PA-Durchgängigkeit
// wurden bestehenden Zellen zugeordnet statt eigener Spalten, damit auf A4
// hochkant Platz fuer die neuen Pruefgroessen aus Punkt 2 entsteht.
const LEER_HEAD_AP = [[
  'Nr.',
  'Bezeichnung\nÜbergabepunkt',
  'Netzsystem/-art\nSpannungen L-N/L-L (±10%)',
  'Dreh-\nfeld',
  'R_{PE}(Ω)≤0,30 / R_{ISO}(MΩ)≥1,0\nU_{N-PE}(V) Soll 0 / PA-Durchgängigk.',
  'Absicherung\nTyp / I_{n}',
  'Z_{S}/Z_{L-N} (Ω) / I_{K} (A)\nZ ≤ 230 V / I_{a}',
  'RCD: Typ (I_{Δn})\nI_{Δmess} / t_{A}',
  'U_{L} (V)\n≤ 50 (25) V AC'
]];

// 4.7.0: Summe = 180 mm statt vorher 190 mm - seit PDF_MARGIN_LEFT auf
// 20 mm vergroessert wurde (Locherrand), quetschte die Tabelle sonst 10 mm
// ueber den neuen Satzspiegel hinaus. Alle Spalten proportional verkleinert.
const LEER_SPALTEN_AP = {
  0: { cellWidth: 6 }, 1: { cellWidth: 24, halign: 'left' }, 2: { cellWidth: 27 },
  3: { cellWidth: 11 }, 4: { cellWidth: 30 }, 5: { cellWidth: 14 },
  6: { cellWidth: 26 }, 7: { cellWidth: 25 }, 8: { cellWidth: 17 }
};

const LEER_LEGENDE_AP =
  'Legende: I_{a} = Strom der magnetischen Schnellauslösung (B: 5×I_{n} · C: 10×I_{n} · D: 20×I_{n}) · ' +
  'Z_{S}/Z_{L-N} = Schleifen-/Netzimpedanz, zulässig ≤ 230 V / I_{a} · I_{K} = Kurzschlussstrom · ' +
  'I_{Δn} = Nennfehlerstrom des RCD · I_{Δmess} = gemessener Auslösestrom (zulässig 0,5–1,0 × I_{Δn}) · ' +
  't_{A} = Auslösezeit: ≤ 40 ms bei 5×I_{Δn}, ≤ 150 ms bei 2×, ≤ 300 ms bei 1× (Typ S: 150 / 200 / 500 ms) · ' +
  'U_{L} = Berührungsspannung bei der RCD-Prüfung, zulässig ≤ 50 V AC (Normalbereich) bzw. ≤ 25 V AC (erhöhte Gefährdung) · ' +
  'Drehfeld: rechts drehend bei CEE 16–125 A, nur bei Drehstrom relevant · R_{PE}/R_{ISO} = Schutzleiterwiderstand/Isolationswiderstand · ' +
  'PA-Durchgängigkeit = Messwert des Potenzialausgleichs an diesem Übergabepunkt · ' +
  'U_{N-PE} = Spannung Neutralleiter gegen Schutzleiter, Sollwert 0 V. Ein Wert über 1 V weist auf einen ' +
  'hochohmigen PEN, eine Fremdeinspeisung oder eine vertauschte Einspeisung am Aggregat hin.';

/* Sollwerte der Netzmessung - stehen im Fussbereich jedes Leerformulars (4.5.0). */
const LEER_SOLLWERTE_AP =
  'Netzmessung Sollwerte: L gegen N je 230 V (±10%) - L gegen L je 400 V (±10%) - N gegen PE 0 V - Frequenz 50 Hz.';

const LEER_BEISPIEL_TEXT_AP =
  'Beispiel: Bühnenversorgung Haupt | TN-S Drehstrom, 50 Hz, 231/230/229 V | Drehfeld i.O. | ' +
  'R_{PE} 0,12 Ω / R_{ISO} > 500 MΩ | U_{N-PE} 0,3 V | C 32A | Z_{S} 0,31 Ω / I_{K} 740 A | ' +
  'RCD Typ A 30 mA | I_{Δmess} 21 mA | t_{A} 17 ms @ 5x | U_{L} 2,5 V';

function leerBlattzahlAnschluss() {
  const roh = parseInt(document.getElementById('leer_blaetter')?.value || '1', 10);
  if (isNaN(roh)) return 1;
  return Math.min(Math.max(roh, 1), 4);
}

/* 5.0.0 (BUG #8 aus der 4.7.2-Prüfung): try/catch-Wrapper um den PDF-Aufbau,
 * analog zu generatePDF()/generatePDFInner() in pdf-generator.js - siehe dort
 * für die ausführliche Begründung. */
async function generatePDFAnschluss(isBlank = false) {
  try {
    // [7.1.0] Fotos liegen im IndexedDB und muessen asynchron geladen werden
    // (siehe js/fotos.js) - deshalb hier vor dem eigentlichen (synchronen)
    // PDF-Aufbau geladen und als zusaetzliches Argument durchgereicht, analog
    // zur Fotodokumentation in vde0100.html/pdf-generator.js.
    // 7.1.0: zusaetzlich die Fotos am zentralen Bemerkungsfeld laden und mit
    // Label "Bemerkung" anhaengen (siehe pdf-generator.js, gleiches Muster).
    const fotoLadenPromise = Promise.all([
      (typeof fotosFuerPdfLaden === 'function') ? fotosFuerPdfLaden('#feedsContainer .feed-card', isBlank) : Promise.resolve([]),
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
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung -> Abbruch vor dem Aufbau des PDF.
   * Gilt nie fuer das Leerformular. */
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js.
   * [7.4.0, Punkt 2] .c-drehfeld bleibt bei einer 1-phasigen Karte bewusst
   * leer (kein Drehfeld ohne Drehstrom) - nur bei Drehstrom-Karten wird eine
   * Auswahl verlangt. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(['.sicht-item', '.erp-item', '#pa_angeschlossen', '#res_maengel',
       '#res_leistung_ausreichend', '#res_freigabe']);
    if (offeneAuswahl) { await offeneBewertungMelden(offeneAuswahl); return; }

    const drehfeldOffen = Array.from(document.querySelectorAll('.feed-card')).find(function (card) {
      const netzartSel = card.querySelector('.c-netzart');
      const istDrehstrom = !netzartSel || netzartSel.value !== '1-phasig';
      const drehfeldSel = card.querySelector('.c-drehfeld');
      return istDrehstrom && drehfeldSel && drehfeldSel.value === '';
    });
    if (drehfeldOffen) { await offeneBewertungMelden(drehfeldOffen.querySelector('.c-drehfeld')); return; }

    // [7.4.0, Punkt 2] PA-Durchgängigkeit je Karte ist eine eigene Bewertung
    // (analog zum Drehfeld) und muss deshalb ebenfalls ausgewaehlt sein.
    const paDurchgOffen = Array.from(document.querySelectorAll('.feed-card')).find(function (card) {
      const sel = card.querySelector('.c-pa-durchg');
      return sel && sel.value === '';
    });
    if (paDurchgOffen) { await offeneBewertungMelden(paDurchgOffen.querySelector('.c-pa-durchg')); return; }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    await appAlert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Ohne einen einzigen Uebergabepunkt gibt es nichts zu uebergeben. */
  if (!isBlank && document.querySelectorAll('.feed-card').length === 0) {
    await keinePrueflingeMelden('Übergabepunkt');
    return;
  }

  // Ein Uebergabepunkt ohne Messwert ist keine Pruefung - siehe pdf-utils.js.
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      document.querySelectorAll('#feedsContainer .feed-card'),
      ['.c-rpe', '.c-riso', '.c-unpe', '.c-zs', '.c-ik', '.c-zln', '.c-rcd-imess', '.c-rcd-ta', '.c-umess']);
    if (ohneMessung.length) { await ohneMessungMelden(ohneMessung, 'Übergabepunkt'); return; }
  }

  /* 4.5.0 (B1): U N-PE ist Pflichtangabe je Uebergabepunkt.
   * Hinter einem fremden Uebergabepunkt ist die N-PE-Spannung der einzige
   * Messwert, der eigenstaendig einen Fehler findet (hochohmiger PEN,
   * Fremdeinspeisung, vertauschte Einspeisung am Aggregat). Ein Uebergabe-
   * protokoll ohne diesen Wert gibt eine Anlage frei, deren gefaehrlichsten
   * Fehler niemand gesucht hat.
   * (Soll der Wert einmal wirklich nicht messbar sein: diesen Block
   *  auskommentieren - die Bewertung selbst bleibt davon unberuehrt.) */
  if (!isBlank) {
    const feeds = Array.from(document.querySelectorAll('#feedsContainer .feed-card'));
    const ohneNpe = feeds
      .map((k, i) => (String(k.querySelector('.c-unpe')?.value || '').trim() === '' ? i + 1 : null))
      .filter(n => n !== null);
    if (ohneNpe.length) {
      await appAlert('Spannung U N–PE fehlt bei Übergabepunkt ' + ohneNpe.join(', ') + '.\n\n' +
            'Sollwert 0 V. Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler ' +
            'findet (hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat) - ' +
            'genau die Fehler, die hinter einem fremden Übergabepunkt liegen.\n\n' +
            'Das PDF wurde deshalb nicht erstellt.');
      feeds[ohneNpe[0] - 1]?.querySelector('.c-unpe')?.focus();
      return;
    }
  }

  /* [8.0.0, Teil 6.5] Netzmessung: echte Pflichtfeld-Sperre bei
   * Nicht-Festanschluss (Steckstelle/Baustromverteiler/Generator/Sonstiges).
   * Bisher war U L1-N & Co. an jedem Uebergabepunkt rein optional - bei einem
   * "Festanschluss / Zaehlerschrank" ist das vertretbar (die Netzqualitaet
   * ist Sache des Netzbetreibers), aber bei jeder anderen Einspeisungsart
   * (insbesondere einer Steckstelle an einem Baustromverteiler oder Generator)
   * ist die tatsaechlich gemessene Netzspannung/-frequenz die einzige
   * eigenstaendige Pruefung dieser Einspeisung - ein Protokoll ohne diesen
   * Wert wuerde eine ungeprüfte Einspeisung freigeben. */
  if (!isBlank && document.getElementById('einspeisung_art')?.value !== 'Festanschluss / Zählerschrank') {
    const feedsNetz = Array.from(document.querySelectorAll('#feedsContainer .feed-card'));
    const ohneNetzmessung = feedsNetz
      .map((karte, i) => (String(karte.querySelector('.c-u-l1n')?.value || '').trim() === '' ? i + 1 : null))
      .filter(n => n !== null);
    if (ohneNetzmessung.length) {
      await appAlert('Netzmessung (U L1–N) fehlt bei Übergabepunkt ' + ohneNetzmessung.join(', ') + '.\n\n' +
            'Bei jeder Einspeisungsart außer "Festanschluss / Zählerschrank" (hier: "' +
            (document.getElementById('einspeisung_art')?.value || '-') + '") ist die tatsächlich ' +
            'gemessene Netzspannung die einzige eigenständige Prüfung dieser Einspeisung ' +
            '(Baustromverteiler, Generator, sonstige provisorische Versorgung).\n\n' +
            'Das PDF wurde deshalb nicht erstellt.');
      feedsNetz[ohneNetzmessung[0] - 1]?.querySelector('.c-u-l1n')?.focus();
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

  const primaryColor = [0, 51, 102];
  const textColor = [15, 23, 42];
  const boxBorder = [203, 213, 225];
  const tableHeaderBg = [226, 232, 240];
  const redCellText = [153, 27, 27];
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
  // Im Leerformular bleibt der Ort offen (Gastspiel, Freilicht, Fremdhaus).
  const ort = isBlank ? "" : getVal('unterschrift_ort', "");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // Im Leerformular bleiben die Kopf-Felder leer -> dort erscheinen Schreiblinien
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  // [7.4.0, Punkt 1] Es gibt kein "Prüflings-ID"-Feld mehr in der
  // Anschlussprüfung (pruefungsnummer entfernt) - die Kopfbox zeigt an dieser
  // Stelle stattdessen "Anlage/Objekt" (siehe drawProtokollSeitenkoepfe()
  // pruefNrLabel in js/pdf-utils.js und Änderungsbericht 7.4.0, Punkt 1).
  const kopfPruefNr = isBlank ? "" : feldWert('anlage_bez');

  // HEADER: zentrale Funktion aus pdf-utils.js. Sie skaliert Titel und Normzeile
  // automatisch auf die verfuegbaren 112 mm, damit sie die Infobox oben rechts
  // nicht mehr ueberdrucken (fruehere Ausgabe: "STROMVEPRroStoOkolRl-NGr:").
  drawProtokollHeader(doc, ANSCHLUSS_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN + BEREITSTELLER ------------------------------
   * Kompakt: 6 Zeilen je Spalte, Zeilenabstand 4,6 mm. Protokoll-Nr. und
   * Prueflings-ID stehen in der Kopfbox und werden hier nicht wiederholt.
   * [7.4.0] Die frueher hier gedruckte Netzmessung am Speisepunkt (zwei
   * Zeilen Kurzfelder) ist auf Formularseite in die Uebergabepunkt-Karten
   * gewandert (Punkt 2/10) - der Kopfkasten ist deshalb wieder auf die
   * urspruengliche Hoehe (6 Zeilen) geschrumpft. */
  const ZA = 4.6;
  const SEK1_H = 32;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN & BEREITSTELLER DER EINSPEISUNG", kat: 'stamm' });

  doc.setFontSize(7.2);
  // 4.7.0: spL von 13 auf PDF_MARGIN_LEFT + 3 (23) verschoben (Locherrand),
  // spB entsprechend von 90 auf 80 verkleinert, damit die Zeile weiterhin
  // vor spR (107) endet.
  const spL = PDF_MARGIN_LEFT + 3, spR = 107, spB = 80;

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    let t = g;
    if (sn) t += ` (SN ${sn})`;
    return t;
  })();

  const z1 = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Auftraggeber:",         feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",      feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  // [7.4.0, Punkt 1] "Veranstaltung/Anlass" entfernt, ersetzt durch das neue
  // Stammdatenfeld "Anlage/Objekt" (anlage_bez) - siehe Aenderungsbericht.
  drawFeldZeile(doc, "Anlage/Objekt:",        feldWert('anlage_bez'),      spL, z1(2), spB, isBlank);
  // [Befund A6, 6.0.0] Qualifikation der pruefenden Person (EFK / EuP unter
  // Aufsicht einer EFK) wird als Kurzform an den Namen angehaengt - eine
  // eigene Zeile wuerde das voll belegte 6-Zeilen-Raster dieser Spalte sprengen.
  const pruegerQualiValAP = feldWert('pruefer_qualifikation');
  const pruegerQualiKurzAP = pruegerQualiValAP.startsWith('Elektrotechnisch') ? 'EuP unter Aufsicht einer EFK' : pruegerQualiValAP;
  const prueferNameAP = feldWert('pruefer');
  const prueferMitQualiAP = prueferNameAP + (prueferNameAP && pruegerQualiKurzAP ? ' (' + pruegerQualiKurzAP + ')' : '');
  drawFeldZeile(doc, "Prüfer/-in:",           prueferMitQualiAP,            spL, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",            datum,                       spL, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Prüfgerät:",            messgeraetText,              spL, z1(5), spB, isBlank);

  // [7.4.0, Punkt 1] "Firma / Netzbetreiber / Vermieter" in zwei Felder
  // getrennt: Firma/Vermieter und Netzbetreiber, nebeneinander.
  drawFeldZeile(doc, "Firma/Vermieter:",         feldWert('firma_vermieter'),                spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Netzbetreiber:",           feldWert('vnb'),                             spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Ansprechpartner/-in:",     feldWert('bereitsteller_ansprechpartner'),   spR, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Telefon:",                 feldWert('bereitsteller_telefon'),           spR, z1(3), spB, isBlank);
  // Bei "Sonstiges" wird die eingetragene Herkunft mit ausgegeben
  const einspeisungText = (() => {
    const art = feldWert('einspeisung_art');
    const sonst = feldWert('einspeisung_sonstiges');
    if (art && /sonstig/i.test(art) && sonst) return `${art}: ${sonst}`;
    return art;
  })();
  drawFeldZeile(doc, "Art der Einspeisung:",     einspeisungText,                            spR, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Standort Übergabepunkt:",  feldWert('uebergabe_standort'),             spR, z1(5), spB, isBlank);

  y += SEK1_H + 4;

  /* --- SEKTION 1B: NETZSYSTEM, PRÜFINTERVALL & ANSCHLUSSLEISTUNG ---------
   * [7.4.0, Punkt 1/4] Netzspannung/Hausanschluss-Schnellauswahl (analog
   * vde0100.html) sowie das neue Pruefintervall-Feld. */
  // [8.0.0] Hoehe +ZA fuer die neue dritte Zeile ("Grund der Pruefung").
  const SEK1B_H = 18 + ZA;
  drawKategorieBox(doc, { y, h: SEK1B_H, titel: "NETZSPANNUNG, HAUSANSCHLUSS & PRÜFINTERVALL", kat: 'stamm' });
  const z1b = (i) => y + 10 + i * ZA;
  drawFeldZeile(doc, "Netzspannung (V):",        feldWert('netzspannung') || '230 / 400',    spL, z1b(0), 60, isBlank);
  drawFeldZeile(doc, "Anschlussleistung (kVA):", feldWert('anschlussleistung_vertrag'),      spL, z1b(1), 60, isBlank);
  drawFeldZeile(doc, "Grund der Prüfung:",       feldWert('pruefgrund'),                     spL, z1b(2), 60, isBlank);
  drawFeldZeile(doc, "Hausanschluss/Speisepunkt:", feldWert('hausanschluss'),                spL + 65, z1b(0), 110, isBlank);
  const pruefintervallSelectAP = document.getElementById('pruefintervall');
  const pruefintervallTextAP = isBlank ? '' : (pruefintervallSelectAP ? cleanStr(pruefintervallSelectAP.options[pruefintervallSelectAP.selectedIndex].text) : '');
  drawFeldZeile(doc, "Prüfintervall:",           pruefintervallTextAP,                       spL + 65, z1b(1), 55, isBlank);
  const naechsterTerminAP = isBlank ? '' : formatMonat(document.getElementById('res_termin_date')?.value);
  drawFeldZeile(doc, "Nächster Prüftermin:",     naechsterTerminAP,                          spL + 122, z1b(1), 53, isBlank);

  y += SEK1B_H + 4;

  /* --- SEKTION 2: BESICHTIGEN ---------------------------------------------
   * [7.4.0, Punkt 3] 9 -> 7 Punkte (Zugänglichkeit/Fluchtwege, Zugang Not-Aus/
   * Hauptschalter und Prüfplakette/Typenschild Verteiler entfernt) - jetzt
   * 6 verbleibende Punkte in 2 Spalten je 3 Zeilen. */
  const SEK2_H = 18;
  drawKategorieBox(doc, { y, h: SEK2_H, titel: "2. BESICHTIGEN (SICHTPRÜFUNG ÜBERGABEPUNKT)", kat: 'sicht' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Verteiler/Zählerschr.", "2. Steckvorr./Kuppl.", "3. Zuleitung/Kabel",
    "4. Kennzeichnung", "5. Witterungsschutz", "6. Berührungsschutz"
  ];
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, PDF_MARGIN_LEFT jetzt 20 mm).
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
    /* Dritte Checkbox "n.a." fuer JEDEN Punkt.
     * FRUEHER hatte nur Punkt 7 (Witterungsschutz) diesen Zustand. Ein
     * Uebergabepunkt am Notstromaggregat hat aber keinen Zaehlerschrank
     * (Punkt 1) und oft keine Pruefplakette eines Verteilers (Punkt 9) - der
     * Pruefer musste trotzdem i.O. oder n.i.O. ankreuzen und bestaetigte oder
     * beanstandete damit etwas, das gar nicht existiert. Im Anlagenprotokoll
     * war dieser Zustand von Anfang an vorgesehen. */
    drawCheckbox(doc, SICHT_CB_X[spalte] + 24, yy, "n.a.", !isBlank && s[i]?.value === "n.a.");
  });

  y += SEK2_H + 6;

  /* --- SEKTION 2B: ANSCHLUSSKABEL DER ANLAGE ------------------------------
   * [8.0.0] NEU: analog zu vde0100.html - einmaliges Kabel zum
   * Uebergabepunkt, als durchgehende Zeile (wie im Leerformular dort). */
  const SEK2B_H = 12;
  drawKategorieBox(doc, { y, h: SEK2B_H, titel: "ANSCHLUSSKABEL DER ANLAGE", kat: 'sicht' });
  const kabelAnschlussAP = kommaZahl([feldWert('anschluss_typ'), feldWert('anschluss_leiter'), feldWert('anschluss_qs')]
    .filter(p => p).join(' '));
  drawFeldZeile(doc, isBlank ? "Anschlusskabel Typ / Adern / Quersch.:"
                             : "Anschlusskabel (Typ / Adern / Querschnitt):",
                kabelAnschlussAP, PDF_MARGIN_LEFT + 3, y + 9, 177, isBlank);

  y += SEK2B_H + 6;

  // SEKTION 3: ÜBERGABEPUNKTE TABELLE (Kategorie "messen" = gruen)
  const katMessen = drawKategorieTitel(doc, "3. MESSTECHNISCHE PRÜFUNGEN JE ÜBERGABEPUNKT", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  doc.text("Schutzleiter, Schleifenimpedanz, RCD. Grenzwerte je Spalte im Tabellenkopf; unzulässige Werte werden rot hinterlegt.", PDF_MARGIN_LEFT, y + 3.4);
  doc.setTextColor(...textColor);

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: [254, 226, 226], textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const tableRows = [];
  let anyFeedMeasurementOut = false;
  // Fehlende ANGABEN werden getrennt gefuehrt: sie machen das Protokoll
  // unvollstaendig, kehren aber den Freigabetext nicht um.
  let anyDokumentationsmangel = false;
  // BEISPIELZEILE IM LEERFORMULAR (grau/kursiv, als "Bsp" gekennzeichnet)
  const blaetter = isBlank ? leerBlattzahlAnschluss() : 1;

  if (isBlank) {
    // Die Musterangabe steht jetzt als graue Zeile im Fussbereich und
    // verbraucht keine Schreibzeile mehr.
    for (let i = 1; i <= LEER_ZEILEN_BLATT1_AP; i++) {
      tableRows.push([i, "", "", "", "", "", "", "", "", ""]);
    }
  } else {
    const cards = document.querySelectorAll('.feed-card');
    cards.forEach((card, idx) => {
      const netzsystem = card.querySelector('.c-netzsystem').value;
      const netzart = card.querySelector('.c-netzart')?.value || 'Drehstrom';
      const istDrehstromZeile = netzart !== '1-phasig';
      let freq = card.querySelector('.c-frequenz').value;
      if (freq && !freq.toLowerCase().includes('hz')) freq += ' Hz';
      // [7.4.0, Punkt 2] Einzelne Aussenleiterspannungen statt eines
      // Freitextfelds - im Kopf der Zelle steht nur eine Kurzzusammenfassung,
      // die einzelnen Werte stehen als Messwerte in der Zelle darunter.
      const uL1n = card.querySelector('.c-u-l1n')?.value || '';
      const uL2n = card.querySelector('.c-u-l2n')?.value || '';
      const uL3n = card.querySelector('.c-u-l3n')?.value || '';
      const uL12 = card.querySelector('.c-u-l12')?.value || '';
      const uL23 = card.querySelector('.c-u-l23')?.value || '';
      const uL13 = card.querySelector('.c-u-l13')?.value || '';
      const spannungsFelder = istDrehstromZeile
        ? [['u_l1n', uL1n], ['u_l2n', uL2n], ['u_l3n', uL3n], ['u_l12', uL12], ['u_l23', uL23], ['u_l13', uL13]]
        : [['u_l1n', uL1n]];
      const isSpannungOut = spannungsFelder.some(([feldName, wert]) => wert.trim() !== '' && netzspannungAusserNorm(feldName, wert));
      const spannungsText = istDrehstromZeile
        ? `L-N: ${kommaZahlGeprueft(uL1n) || '-'}/${kommaZahlGeprueft(uL2n) || '-'}/${kommaZahlGeprueft(uL3n) || '-'} V`
          + `\nL-L: ${kommaZahlGeprueft(uL12) || '-'}/${kommaZahlGeprueft(uL23) || '-'}/${kommaZahlGeprueft(uL13) || '-'} V`
        : `U: ${kommaZahlGeprueft(uL1n) || '-'} V`;
      const netzSpannungFreq = `${netzsystem} - ${istDrehstromZeile ? 'Drehstrom' : '1-phasig'}${freq ? ', ' + freq : ''}\n${spannungsText}`;

      const drehfeld = card.querySelector('.c-drehfeld').value;
      /* Ein Linksdrehfeld am Uebergabepunkt ist in der Veranstaltungstechnik
       * eine echte Beanstandung: Kettenzuege, Winden und Motoren laufen damit
       * verkehrt herum. Der Wert wurde bisher nur gedruckt und ging in keine
       * Bewertung ein - der Uebergabepunkt wurde trotz "n.i.O." freigegeben. */
      const isDrehfeldOut = drehfeld === 'n.i.O.';
      const drehfeldText = istDrehstromZeile ? (drehfeld || '-') : 'n.a. (1-phasig)';

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeNum = parseMesswert(rpeVal);
      const isRpeOut = (!isNaN(rpeNum) && (rpeNum > 0.30 || rpeNum < 0)) || istMesswertUngueltig(rpeVal);
      const rpeText = rpeVal ? `${kommaZahlGeprueft(rpeVal)} Ω` : '-';

      /* [7.4.0, Punkt 2] R_ISO je Uebergabepunkt, Richtwert 1,0 MΩ analog zu
       * vde0100.html. */
      const risoVal = card.querySelector('.c-riso')?.value || '';
      const isRisoOut = !risoVal.trim().startsWith('>') && ((!isNaN(parseMesswert(risoVal)) && parseMesswert(risoVal) < 1.0) || istMesswertUngueltig(risoVal));
      const risoText = risoVal ? (risoVal.trim().startsWith('>') ? kommaZahl(risoVal) : kommaZahlGeprueft(risoVal)) + ' MΩ' : '-';

      /* 4.5.0 (B1): Spannung N-PE je Uebergabepunkt. Sollwert 0 V. */
      const unpeVal = card.querySelector('.c-unpe')?.value || '';
      const isUnpeOut = npeUeberschritten(unpeVal) || istMesswertUngueltig(unpeVal);
      const unpeText = unpeVal ? (istMesswertUngueltig(unpeVal) ? kommaZahlGeprueft(unpeVal) : withUnit(unpeVal, 'V')) : '-';
      // Schutzleiter/Isolation UND N-PE in einer Zelle zusammengefasst -
      // ansonsten waeren es fuenf statt vier Spalten mit Messwerten allein
      // fuer den Schutzleiterkreis, was auf A4 hochkant nicht mehr passt.
      const rpeRisoText = `${rpeText}\nR_ISO: ${risoText}\nU_N-PE: ${unpeText}`;

      const sich = card.querySelector('.c-sich-typ').value || '-';
      const zs = card.querySelector('.c-zs').value;
      const ik = card.querySelector('.c-ik').value;
      const zln = card.querySelector('.c-zln')?.value || '';
      const ik2 = card.querySelector('.c-ik2')?.value || '';
      const minIk = getMinIk(sich);
      const ikNum = parseMesswert(ik);
      const isIkOut = minIk !== null && !isNaN(ikNum) && ikNum < minIk;
      // Z_S wird jetzt auch hier bewertet (Zs_max = 230 V / I_a), inklusive
      // Plausibilitaet gegen I_K - bisher war das Feld reine Dokumentation.
      const maxZsPdf = getMaxZs(sich);
      const zsNumPdf = parseMesswert(zs);
      const zlnNumPdf = parseMesswert(zln);
      const isZlnOut = maxZsPdf !== null && !isNaN(zlnNumPdf) && (zlnNumPdf > maxZsPdf || zlnNumPdf < 0);
      const isZsOut = (maxZsPdf !== null && !isNaN(zsNumPdf) && (zsNumPdf > maxZsPdf || zsNumPdf < 0)) || isZlnOut
        || istMesswertUngueltig(zs) || istMesswertUngueltig(ik) || istMesswertUngueltig(zln) || istMesswertUngueltig(ik2);
      const zsIkWiderspruch = !zIkPlausibel(zs, ik) || !zIkPlausibel(zln, ik2);
      if (zsIkWiderspruch) anyDokumentationsmangel = true;
      let zsik = '-';
      if (zs || ik) zsik = `${kommaZahlGeprueft(zs) || '-'} Ω / ${kommaZahlGeprueft(ik) || '-'} A`;
      // [7.4.0, Punkt 2] Netzimpedanz Z_L-N nur drucken, wenn tatsaechlich
      // gemessen - analog zur Darstellung in vde0100.html.
      if (zln || ik2) zsik += `\nL-N: ${kommaZahlGeprueft(zln) || '-'} Ω / ${kommaZahlGeprueft(ik2) || '-'} A`;
      const absicherungUnbekannt = istAbsicherungUnbekannt(sich);
      if (absicherungUnbekannt) {
        zsik += '\nAbsicherung nicht erkannt – Z_S/I_K nicht bewertet';
        anyDokumentationsmangel = true;
      }

      // Die frueheren "|| '-'"-Vorgaben erzeugten Zellen wie "- (-)". Die
      // Rohwerte gehen jetzt unveraendert in die gemeinsame Auswertung.
      const rcdTyp = card.querySelector('.c-rcd-typ').value;
      const rcdIn = card.querySelector('.c-rcd-in')?.value || '';
      const rcdIdn = card.querySelector('.c-rcd-idn').value;
      const rcdImess = card.querySelector('.c-rcd-imess').value;
      const rcdTa = card.querySelector('.c-rcd-ta').value;
      // KEIN Fallback auf '1': ein nicht gewaehlter Pruefstrom darf im
      // Beweisdokument nicht als gewaehlte Messbedingung erscheinen.
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '';

      // Identische Auswertung wie im Anlagenprotokoll (pdf-utils.js): damit
      // erkennt auch die Anschlusspruefung eingetragene, aber ungepruefte RCD.
      const rcdZelle = buildRcdZelle({
        typ: rcdTyp, in: rcdIn, idn: rcdIdn, imess: rcdImess, ta: rcdTa, pruefstrom: rcdPruefstrom
      });

      const taNum = parseMesswert(rcdTa);
      const isTaOut = rcdZelle.taMax !== null && !isNaN(taNum) && (taNum > rcdZelle.taMax || taNum < 0);
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseMesswert(rcdImess);
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);
      // Zelle rot: sowohl bei fehlender Angabe als auch bei echter Beanstandung.
      const isRcdOut = isTaOut || isImessOut || rcdZelle.isOut;
      // In die GESAMTBEWERTUNG geht nur ein, was die Sicherheit betrifft.
      const isRcdBeanstandung = isTaOut || isImessOut || rcdZelle.isPruefungUnvollstaendig;
      if (rcdZelle.isDokumentationsmangel) anyDokumentationsmangel = true;

      const rcdText = rcdZelle.text;

      /* [7.4.0, Punkt 2] U_L (Beruehrungsspannung) bei der RCD-Pruefung -
       * eigene Spalte, 1:1 analog zu vde0100.html (dort "U_mess"). */
      const umessVal = card.querySelector('.c-umess')?.value || '';
      const umessNum = parseMesswert(umessVal);
      const gefPdfAp = card.querySelector('.c-gefaehrdung')?.value || 'normal';
      const limitUAp = getUlGrenzwert('AC', gefPdfAp);
      const isUmessOut = (!isNaN(umessNum) && (umessNum > limitUAp || umessNum < 0)) || istMesswertUngueltig(umessVal);
      const umessText = umessVal ? `${istMesswertUngueltig(umessVal) ? kommaZahlGeprueft(umessVal) : withUnit(umessVal, 'V')}\n(U_{L} ${getUlText('AC', gefPdfAp)})` : '-';

      /* [7.4.0, Punkt 2] Durchgängigkeit Potenzialausgleich je Karte -
       * angehaengt an die Schutzleiter/Isolation-Zelle statt einer eigenen
       * Spalte (Platzgrund, siehe Kommentar oben bei rpeRisoText). */
      const paDurchgVal = card.querySelector('.c-pa-durchg')?.value || '';
      const paWiderstandVal = card.querySelector('.c-pa-widerstand')?.value || '';
      const isPaOut = paDurchgVal === 'n.i.O.';
      let rpeRisoPaText = rpeRisoText;
      if (paDurchgVal || paWiderstandVal) {
        rpeRisoPaText += `\nPA: ${paDurchgVal || '-'}${paWiderstandVal ? ' (' + kommaZahlGeprueft(paWiderstandVal) + ' Ω)' : ''}`;
      }

      if (isRpeOut || isRisoOut || isIkOut || isZsOut || isRcdBeanstandung || isDrehfeldOut || isUnpeOut || isUmessOut || isPaOut) anyFeedMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(kommaZahl(netzSpannungFreq)),
        makeCell(cleanStr(drehfeldText), isDrehfeldOut),
        makeCell(cleanStr(rpeRisoPaText), isRpeOut || isRisoOut || isUnpeOut || isPaOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut || isZsOut || zsIkWiderspruch || absicherungUnbekannt),
        makeCell(cleanStr(rcdText), isRcdOut),
        makeCell(cleanStr(umessText), isUmessOut)
      ]);
      // Netzspannungstoleranz separat markieren: die Zelle enthaelt mehrere
      // Werte, ein einzelner ausserhalb der Norm darf die ganze Zelle nicht
      // unmarkiert lassen.
      if (isSpannungOut) {
        tableRows[tableRows.length - 1][2] = makeCell(cleanStr(kommaZahl(netzSpannungFreq)), true);
        anyFeedMeasurementOut = true;
      }
    });
  }

  const HEAD_AUSGEFUELLT_AP = [[
    'Nr.',
    'Bezeichnung\nÜbergabepunkt',
    'Netzsystem/-art\nSpannungen ±10% (DIN EN 50160)',
    'Dreh-\nfeld',
    'R_{PE}(Ω)≤0,30 / R_{ISO}(MΩ)≥1,0\nU_{N-PE}(V) Soll 0 / PA-Durchgängigk.',
    'Absicherung\nTyp / I_{n}',
    'Z_{S}/Z_{L-N} (Ω) / I_{K} (A)\nZ ≤ 230 V/I_{a} · I_{K} ≥ 5x/10x/20x I_{n}',
    'RCD: Typ (I_{Δn})\nI_{Δmess} 0,5-1,0x I_{Δn}\nt_{A} ≤ 40 ms bei 5x',
    'U_{L} (V)\n50/25 V AC\n(Normal/erhöht)'
  ]];

  doc.autoTable(mitFormelHooks(doc, {
    startY: y + 5,
    // Kopfzeilen mit Umbruch: Groesse / Einheit / Grenzwert stehen untereinander
    head: isBlank ? LEER_HEAD_AP : HEAD_AUSGEFUELLT_AP,
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
    bodyStyles: { fontSize: 6.2, textColor: textColor, halign: 'center', valign: 'middle' },
    // 4.7.0: Summe = 180 mm (210 - 20 mm linker Rand - 10 mm rechter Rand).
    // [7.4.0, Punkt 2] Spalten neu verteilt: aus urspruenglich 9 schmalen
    // Spalten wurden Netzmessung/R_ISO/PA-Durchgaengigkeit in bestehende
    // Zellen (mehrzeilig) integriert statt eigene Spalten zu erhalten - auf
    // A4 hochkant war fuer zusaetzliche Spalten kein Platz mehr, ohne die
    // Schriftgroesse unter die Lesbarkeitsgrenze zu druecken.
    columnStyles: isBlank ? LEER_SPALTEN_AP : {
      0: { cellWidth: 6 }, 1: { cellWidth: 24, halign: 'left' }, 2: { cellWidth: 27 },
      3: { cellWidth: 11 }, 4: { cellWidth: 30 }, 5: { cellWidth: 14 },
      6: { cellWidth: 26 }, 7: { cellWidth: 25 }, 8: { cellWidth: 17 }
    },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
              minCellHeight: isBlank ? LEER_ZEILENHOEHE_AP : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
  }));

  let finalY = doc.lastAutoTable.finalY + 6;

  /* --- SEKTION 3B: ERPROBEN (FUNKTIONSPRÜFUNG) ----------------------------
   * [8.0.0] NEU: fehlte bisher komplett in diesem Formular. Analog zum
   * Erproben-Abschnitt in vde0100.html, aber nur mit den drei Punkten, die
   * laut Zieltabelle am Übergabepunkt vorkommen (Schutzeinrichtungen,
   * RCD-Prüftaste, Drehrichtung Motoren). */
  const SEK3B_H = 12;
  finalY = pdfPlatzPruefen(doc, finalY, SEK3B_H + 8);
  drawKategorieBox(doc, { y: finalY, h: SEK3B_H, titel: "ERPROBEN (FUNKTIONSPRÜFUNG)", kat: 'sicht' });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const erpEls = document.querySelectorAll('.erp-item');
  const erpLabelsAP = ["Schutzeinrichtungen", "RCD-Prüftaste", "Drehrichtung Motoren"];
  const ERP_LABEL_X = [23, 82, 141];
  const ERP_CB_X    = [46, 105, 164];
  erpLabelsAP.forEach((label, i) => {
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', ERP_LABEL_X[i], finalY + 9, 24, 7, 5.4);
    doc.setFontSize(6.4);
    drawCheckbox(doc, ERP_CB_X[i], finalY + 9, "i.O.", !isBlank && erpEls[i]?.value === "i.O.");
    drawCheckbox(doc, ERP_CB_X[i] + 11, finalY + 9, "n.i.O.", !isBlank && erpEls[i]?.value === "n.i.O.", true);
    drawCheckbox(doc, ERP_CB_X[i] + 22, finalY + 9, "n.a.", !isBlank && erpEls[i]?.value === "n.a.");
  });
  doc.setFontSize(7);

  finalY += SEK3B_H + 6;

  /* --- SEKTION 4: ERDUNG / POTENZIALAUSGLEICH & FREIGABE ------------------
   * Neu: Messpunkt/Bezugspunkt sowie Freitextzeilen fuer eigene Messstellen. */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  /* Schrift VOR dem Umbruch setzen: splitTextToSize misst mit der gerade
   * aktiven Schrift. Nach doc.autoTable() ist das nicht die Schrift, mit der
   * unten gedruckt wird - die Zeilen liefen dadurch ueber die Papierkante und
   * die letzten Zeichen fehlten im PDF. */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  const bemZeilen = isBlank ? 3 : Math.max(splitBemerkung.length, 1);

  const OFF_PA = 10;
  const OFF_PUNKT = OFF_PA + ZA;
  const offErgebnis   = OFF_PUNKT + ZA + 2;
  const offFreigabe   = offErgebnis + 5.5;
  const offBemLabel   = offFreigabe + 5.5;
  const offBemStart   = offBemLabel + 4.2;
  const boxHeight     = offBemStart + bemZeilen * 4.2 + 2.5;

  /* 4.5.0 (C1): Kasten 4 und der Abschlussblock werden GEMEINSAM auf Platz
   * geprueft - sonst passt der Kasten noch, der Unterschriftenblock aber nicht
   * mehr, und es entsteht eine zweite Seite mit nichts als zwei Linien darauf. */
  finalY = pdfPlatzPruefen(doc, finalY, boxHeight + 5 + 32);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "4. ERDUNG, POTENZIALAUSGLEICH & GESAMTBEWERTUNG", kat: 'erdung' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const paVal = document.getElementById('pa_angeschlossen')?.value || '';
  doc.text("Potenzialausgleich angeschlossen:", PDF_MARGIN_LEFT + 3, finalY + OFF_PA);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, Label startet jetzt
  // bei PDF_MARGIN_LEFT + 3 = 23 statt vorher 13).
  drawCheckbox(doc, 68, finalY + OFF_PA, "Ja", !isBlank && paVal === "Ja");
  drawCheckbox(doc, 80, finalY + OFF_PA, "Nein", !isBlank && paVal === "Nein", true);
  drawCheckbox(doc, 95, finalY + OFF_PA, "n.a.", !isBlank && paVal === "n.a.");

  const erdungReNum = parseMesswert((document.getElementById('erdung_re')?.value || ''));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && (erdungReNum > ERDUNG_RE_GRENZWERT_ANSCHLUSS || erdungReNum < 0);

  drawFeldZeile(doc, `Erdungswiderstand R_{E} (≤ ${ERDUNG_RE_GRENZWERT_ANSCHLUSS} Ω):`,
                feldWert('erdung_re') ? withUnit(feldWert('erdung_re'), 'Ω') : '', 107, finalY + OFF_PA, 90, isBlank, { rot: isErdungOut });

  drawFeldZeile(doc, "Messpunkt / Bezugspunkt (z. B. HES, PA-Schiene, Erdspieß, Fundamenterder):",
                feldWert('pa_messpunkt'), PDF_MARGIN_LEFT + 3, finalY + OFF_PUNKT, 177, isBlank);

  /* --- DREI ZUSTAENDE STATT ZWEI (identisch zum Anlagenprotokoll) --------- */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  const leistungVal = document.getElementById('res_leistung_ausreichend')?.value || '';
  const freigabeVal = document.getElementById('res_freigabe')?.value || 'Ja';
  const anySichtNiOFrueh = Array.from(s).some(el => el?.value === 'n.i.O.');
  // Beanstandungen unabhaengig von der Auswahl - nur ohne sie darf "behoben"
  // positiv ausgehen.
  /* "Potenzialausgleich angeschlossen: Nein" wurde bisher nur gedruckt und
   * ging in keine Bewertung ein - der Uebergabepunkt wurde trotzdem
   * freigegeben. "n.a." bleibt bewusst ohne Wirkung (es gibt Uebergabepunkte
   * ohne eigenen Potenzialausgleich, z. B. reine Schutztrennung). */
  const isPaFehlt = paVal === 'Nein';
  const restBeanstandungen = !isBlank && (freigabeVal === 'Nein' || leistungVal === 'Nein' ||
                             anySichtNiOFrueh || anyFeedMeasurementOut || isErdungOut || isPaFehlt);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;
  // anschlusspruefung.html kennt kein Totlegen einzelner Uebergabepunkte
  // (typischerweise nur 1-3 Karten) - Ampel bleibt hier zweistufig gruen/rot,
  // ueber ermittleAmpelStatus() aber technisch dieselbe Funktion wie in den
  // anderen beiden Formularen (Befund #2).
  const ampelStatus = ermittleAmpelStatus({
    isBlank, hatKeineMaengel, hatBehoben, hatMaengel, restBeanstandungen,
    einzelDefektAnzahl: 0
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", PDF_MARGIN_LEFT + 3, finalY + offErgebnis);
  drawCheckbox(doc, 44, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel, hatKeineMaengel ? ampelStatus : 'neutral');
  drawCheckbox(doc, 92, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, hatBehoben ? (behobenTrotzOffener ? 'rot' : ampelStatus) : 'neutral');
  drawCheckbox(doc, 156, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, 'rot');

  doc.text("Freigabe zur Nutzung:", PDF_MARGIN_LEFT + 3, finalY + offFreigabe);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand).
  drawCheckbox(doc, 55, finalY + offFreigabe, "Ja", !isBlank && freigabeVal === "Ja", freigabeVal === "Ja" ? ampelStatus : 'neutral');
  drawCheckbox(doc, 66, finalY + offFreigabe, "Nein", !isBlank && freigabeVal === "Nein", 'rot');

  // "Leistung ausreichend" steht jetzt in dieser Zeile: die Ergebniszeile
  // darueber braucht die volle Breite fuer das dritte Ankreuzfeld.
  doc.text("Leistung ausreichend:", 100, finalY + offFreigabe);
  drawCheckbox(doc, 132, finalY + offFreigabe, "Ja", !isBlank && leistungVal === "Ja");
  drawCheckbox(doc, 143, finalY + offFreigabe, "Nein", !isBlank && leistungVal === "Nein", true);
  // "n.a." war im Formular waehlbar, im PDF aber nicht darstellbar
  drawCheckbox(doc, 158, finalY + offFreigabe, "n.a.", !isBlank && leistungVal === "n.a.");

  /* [7.1.0, Befund "Mängel/Bewertung immer rot hinterlegt"] Rot nur, wenn
   * tatsaechlich "Mängel festgestellt" angekreuzt ist (hatMaengel) - vorher
   * wurde JEDER eingetragene Text automatisch rot hinterlegt, auch ohne
   * angekreuzten Mangel. Ist Text eingetragen, aber kein Mangel angekreuzt,
   * wird stattdessen gelb hervorgehoben (siehe pdf-generator.js, gleiches
   * Muster). */
  const gelbCellBg = [254, 249, 195];
  const gelbCellText = [113, 63, 6];
  const hatBemerkungstext = !isBlank && splitBemerkung.length > 0;
  const bemerkungFarbe = !hatBemerkungstext ? 'neutral' : (hatMaengel ? 'rot' : 'gelb');
  if (bemerkungFarbe !== 'neutral') {
    const bemHighlightY = finalY + offBemLabel - 3.3;
    const bemHighlightH = 4.2 + bemZeilen * 4.2 + 1.8;
    doc.setFillColor(...(bemerkungFarbe === 'rot' ? redCellBg : gelbCellBg));
    doc.roundedRect(PDF_MARGIN_LEFT + 1.5, bemHighlightY, PDF_CONTENT_WIDTH - 3, bemHighlightH, 0.8, 0.8, 'F');
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...(bemerkungFarbe === 'rot' ? redCellText : bemerkungFarbe === 'gelb' ? gelbCellText : textColor));
  doc.text("Bemerkungen / Mängel:", PDF_MARGIN_LEFT + 3, finalY + offBemLabel);
  doc.setFont("helvetica", hatBemerkungstext ? "bold" : "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    doc.setTextColor(...textColor);
    drawSchreibLinien(doc, PDF_MARGIN_LEFT + 3, finalY + offBemStart + 1, 177, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, PDF_MARGIN_LEFT + 3, finalY + offBemStart);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");
  }

  finalY += boxHeight + 5;

  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  // Kein Dokument, das gleichzeitig "Ja" ankreuzt und "NICHT freigegeben" schreibt.
  if (freigabeWidersprichtBefund(isBlank, hasIssues, freigabeVal)) {
    await appAlert(freigabeWiderspruchHinweis('Freigabe zur Nutzung'));
    document.getElementById('res_freigabe')?.focus();
    return;
  }

  const complianceText = isBlank
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei der Sichtprüfung, eine nicht ausreichende Anschlussleistung oder ein Sicherheitsrisiko festgestellt. Der Übergabepunkt ist in diesem Zustand NICHT freigegeben. Eine Nutzung ist erst nach Beseitigung der genannten Mängel und erneuter Prüfung zulässig."
      : "Der Übergabepunkt wurde besichtigt, erprobt und gemessen. Er entspricht den anerkannten Regeln der Elektrotechnik und ist zur Nutzung durch den Veranstalter im genannten Rahmen freigegeben.";

  // Fehlende Angaben anhaengen, statt sie nur rot in der Tabelle zu zeigen.
  const complianceGesamt = complianceText +
    (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  /* Der Warntext bei Maengeln wird FETT gesetzt und ist damit rund 7 %
   * breiter als in normaler Schrift. Wurde er normal gemessen und fett
   * gedruckt, lief er ueber die rechte Papierkante hinaus und die letzten
   * Zeichen fehlten im PDF. Schrift deshalb VOR splitTextToSize setzen. */
  doc.setFont("helvetica", ampelStatus === 'neutral' ? "italic" : "bold");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, PDF_CONTENT_WIDTH);
  // Umbruch nur, wenn Hinweistext + Unterschriftenblock wirklich nicht mehr passen
  finalY = pdfPlatzPruefen(doc, finalY, complianceLines.length * 3.2 + 6 + 16);

  const ampelTextFarbeAnschluss = { rot: redCellText, gelb: [133, 77, 6], gruen: [21, 101, 52], neutral: [71, 85, 105] }[ampelStatus] || [71, 85, 105];
  doc.setTextColor(...ampelTextFarbeAnschluss);
  doc.text(complianceLines, PDF_MARGIN_LEFT, finalY);
  doc.setTextColor(...textColor);

  finalY += complianceLines.length * 3.2 + 6;

  const ortDatum = isBlank
    ? '________________, den ____________'
    : (unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`);

  if (!isBlank && !padUebergeber.isEmpty()) {
    // 4.7.0: x=10 -> PDF_MARGIN_LEFT (20 mm, Locherrand).
    doc.addImage(padUebergeber.toDataURL('image/png'), 'PNG', PDF_MARGIN_LEFT, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(PDF_MARGIN_LEFT, finalY + 12, PDF_MARGIN_LEFT + 80, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Übergebende/-r (Netzbetreiber/Bereitsteller)`, PDF_MARGIN_LEFT, finalY + 15);

  // 4.7.0: rechte Unterschriftsspalte beginnt jetzt bei 125 statt 115, damit
  // die laengere Beschriftung "- Übernehmende/-r (Veranstalter/Elektrofachkraft)"
  // vor dem rechten Rand (200 mm Satzspiegel-Ende) endet, statt darueber
  // hinauszulaufen.
  const SIG_R_X = 125;
  if (!isBlank && !padUebernehmer.isEmpty()) {
    doc.addImage(padUebernehmer.toDataURL('image/png'), 'PNG', SIG_R_X, finalY, 38, 12);
  }
  doc.line(SIG_R_X, finalY + 12, 200, finalY + 12);
  drawFittedText(doc, `${ortDatum} - Übernehmende/-r (Veranstalter/Elektrofachkraft)`,
                 SIG_R_X, finalY + 15, 200 - SIG_R_X, 6.5, 5.2);
  doc.setFontSize(6.5);

  /* Fussbereich von Blatt 1: Musterangabe und Legende.
   * 4.5.0 (C4): 6 pt statt 4,6 pt, von unten nach oben gesetzt, mit Abstand
   * zur Unterschriftenzeile. Die Legende steht jetzt auf jedem Blatt. */
  if (isBlank) {
    doc.setPage(1);
    drawLeerFuss(doc, [LEER_BEISPIEL_TEXT_AP, LEER_SOLLWERTE_AP, LEER_LEGENDE_AP]);
  }

  /* --- FORTSETZUNGSBLAETTER DES LEERFORMULARS ---------------------------- */
  if (isBlank && blaetter > 1) {
    let laufendeNr = LEER_ZEILEN_BLATT1_AP + 1;
    for (let blatt = 2; blatt <= blaetter; blatt++) {
      doc.addPage();
      let yy = PDF_CONTENT_TOP;
      drawKategorieTitel(doc, `FORTSETZUNG DER MESSTECHNISCHEN FESTSTELLUNGEN (BLATT ${blatt} VON ${blaetter})`, yy, 'messen');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...PDF_MUTED);
      doc.text('Gehört zum Protokoll mit der oben stehenden Protokoll-Nr. Stammdaten, Besichtigung, ' +
               'Gesamtbewertung und Unterschriften stehen auf Blatt 1.', PDF_MARGIN_LEFT, yy + 3.4);
      doc.setTextColor(...PDF_TEXT);

      const folgeZeilen = [];
      for (let i = 0; i < LEER_ZEILEN_FOLGE_AP; i++) {
        folgeZeilen.push([laufendeNr++, "", "", "", "", "", "", "", ""]);
      }
      doc.autoTable(mitFormelHooks(doc, {
        startY: yy + 5,
        head: LEER_HEAD_AP,
        body: folgeZeilen,
        theme: 'grid',
        rowPageBreak: 'avoid',
        headStyles: {
          fillColor: katMessen.kopf, textColor: katMessen.akzent,
          fontSize: 5.6, fontStyle: 'bold', halign: 'center', valign: 'middle',
          lineColor: katMessen.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
        },
        bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center', valign: 'middle' },
        columnStyles: LEER_SPALTEN_AP,
        margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
        styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18, minCellHeight: LEER_ZEILENHOEHE_AP,
                  overflow: 'linebreak', cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
      }));

      // 4.5.0 (C4): Legende auch auf dem Fortsetzungsblatt.
      drawLeerFuss(doc, [LEER_LEGENDE_AP]);
    }
  }

  // [7.1.0] G17-Nachtrag: Fotodokumentation auch in der Anschlussprüfung als
  // eigene Anhangseite (Fotoaufnahme selbst gab es hier schon seit 7.0.0,
  // die PDF-Einbindung stand noch aus - siehe Änderungsbericht 7.0.0).
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

  /* Die Nummer wird ERST JETZT verbraucht - und nur, wenn wirklich eine Datei
   * entstanden ist. Ein abgebrochener Teilen-Dialog kostet keine Nummer,
   * ein Leerformular ebenfalls nicht. */
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
// Einheitliches Praefix 'vde_': der alte Schluessel 'anschluss_protocol_autosave'
// wurde von der Datensicherung nicht erfasst (siehe storage.js).
// 4.7.0: siehe pdf-generator.js AUTOSAVE_KEY_AKTUELL() - mehrere parallele
// Entwuerfe statt eines einzigen festen Schluessels.
entwurfAusUrlUebernehmen('AP');
let AKTUELLER_ENTWURF_ID = aktivenEntwurfSicherstellen('AP', 'vde_autosave_ap');
function ANSCHLUSS_AUTOSAVE_KEY_AKTUELL() { return autosaveKeyFuerEntwurf('AP', AKTUELLER_ENTWURF_ID); }

// [7.4.0, Punkt 1] 'pruefungsnummer'/'veranstaltung' entfernt (siehe
// Aenderungsbericht 7.4.0, Punkt 1), 'anlage_bez'/'firma_vermieter'/
// 'pruefintervall'/'res_termin_date'/'netzspannung'/'hausanschluss' neu.
// Die Netzmessungsfelder (u_l1n usw.) sind mit Punkt 2 aus den Stammdaten in
// die Uebergabepunkt-Karte gewandert (jetzt Teil von state.feeds, nicht mehr
// hier) - 'netzfrequenz' entfaellt ersatzlos (je Karte 'frequenz').
const ANSCHLUSS_FIELD_IDS = [
  'auftraggeber', 'anlage_bez', 'pruefer', 'pruefer_qualifikation', 'datum', 'messgeraet', 'seriennummer',
  'pruefintervall', 'res_termin_date', 'pruefgrund',
  'firma_vermieter', 'vnb', 'bereitsteller_ansprechpartner', 'bereitsteller_telefon', 'einspeisung_art', 'einspeisung_sonstiges',
  'uebergabe_standort', 'anschlussleistung_vertrag', 'netzspannung', 'hausanschluss',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'pa_angeschlossen', 'erdung_re', 'pa_messpunkt',
  'res_maengel', 'res_leistung_ausreichend',
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
  const state = { fields: {} };
  ANSCHLUSS_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.gebaeude = document.getElementById('gebaeude_custom').value;
  state.res_termin_bestaetigt = !!document.getElementById('res_termin_bestaetigt')?.checked;
  state.sicht = Array.from(document.querySelectorAll('.sicht-item')).map(s => s.value);
  // [8.0.0] NEU: Erproben-Abschnitt (fehlte bisher komplett in diesem
  // Formular) - analog zu js/pdf-generator.js (vde0100.html): ueber .erp-item
  // statt feste IDs, damit neue Pruefpunkte automatisch mitwachsen.
  state.erproben = {};
  document.querySelectorAll('.erp-item').forEach(el => { state.erproben[el.id] = el.value; });

  // [7.4.0, Punkt 2] Alle neuen Karten-Messfelder ergaenzt (netzart,
  // u_l1n..u_l13, riso, zln, ik2, gefaehrdung, umess, pa_durchg,
  // pa_widerstand). 'spannung'/'art' entfallen (ersetzt durch 'netzart' +
  // Einzelspannungen).
  const w = (card, sel) => card.querySelector(sel)?.value || '';
  state.feeds = Array.from(document.querySelectorAll('.feed-card')).map(card => ({
    kartenId: card.dataset.kartenId || '',
    bez: w(card, '.c-bez'),
    netzsystem: w(card, '.c-netzsystem'),
    netzart: w(card, '.c-netzart'),
    frequenz: w(card, '.c-frequenz'),
    u_l1n: w(card, '.c-u-l1n'),
    u_l2n: w(card, '.c-u-l2n'),
    u_l3n: w(card, '.c-u-l3n'),
    u_l12: w(card, '.c-u-l12'),
    u_l23: w(card, '.c-u-l23'),
    u_l13: w(card, '.c-u-l13'),
    unpe: w(card, '.c-unpe'),
    drehfeld: w(card, '.c-drehfeld'),
    rpe: w(card, '.c-rpe'),
    riso: w(card, '.c-riso'),
    sich: w(card, '.c-sich-typ'),
    zs: w(card, '.c-zs'),
    ik: w(card, '.c-ik'),
    zln: w(card, '.c-zln'),
    ik2: w(card, '.c-ik2'),
    rcd_typ: w(card, '.c-rcd-typ'),
    rcd_in: w(card, '.c-rcd-in'),
    rcd_idn: w(card, '.c-rcd-idn'),
    rcd_imess: w(card, '.c-rcd-imess'),
    rcd_ta: w(card, '.c-rcd-ta'),
    rcd_pruefstrom: w(card, '.c-rcd-pruefstrom'),
    gefaehrdung: w(card, '.c-gefaehrdung'),
    umess: w(card, '.c-umess'),
    pa_durchg: w(card, '.c-pa-durchg'),
    pa_widerstand: w(card, '.c-pa-widerstand')
  }));

  return state;
}

function restoreAnschlussState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Ein wiederhergestelltes Formular behaelt SEINE Protokollnummer.
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    /* Leere Datumsangaben aus einer Archiv-Vorlage duerfen die Vorbelegung
     * (heutiges Datum) nicht ueberschreiben. */
    if ((id === 'datum' || id === 'unterschrift_datum') && !String(val || '').trim()) return;
    /* BUGFIX: siehe pdf-generator.js restoreProtocolState() - ein leerer
     * Wert in einem Stammdatenfeld darf den frisch aus den zentralen
     * Stammdaten uebernommenen Wert nicht ueberschreiben. */
    if (MASTERDATA_FIELD_IDS.includes(id) && !String(val || '').trim()) return;
    el.value = val;
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

  // [8.0.0] NEU: Erproben-Abschnitt restaurieren (ueber ID, nicht Index -
  // robuster gegenueber spaeter hinzugefuegten Punkten, analog vde0100.html).
  if (state.erproben) {
    Object.entries(state.erproben).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }

  if (state.feeds && state.feeds.length) {
    document.getElementById('feedsContainer').innerHTML = '';
    cardCounter = 0;
    state.feeds.forEach(f => addFeedCard(f));
    document.querySelectorAll('.feed-card').forEach((card, i) => {
      const f = state.feeds[i];
      /* Auch ein LEERER Wert muss gesetzt werden: eine aus dem Archiv
       * uebernommene Vorlage liefert das Drehfeld bewusst leer. Mit der
       * frueheren Kurzpruefung "if (f.drehfeld)" blieb stattdessen der
       * Vorgabewert "i.O." stehen - ein Ergebnis, das nie gemessen wurde. */
      if (f.drehfeld !== undefined) card.querySelector('.c-drehfeld').value = f.drehfeld;
    });
    // [7.4.0, Punkt 2] Sichtbarkeit der Drehstrom-Felder je Karte NACH dem
    // Setzen von netzart neu auswerten (addFeedCard() ruft updateFeedNetzart()
    // zwar selbst auf, aber VOR dem obigen Nachziehen von .c-drehfeld - hier
    // zusaetzlich fuer alle Karten, damit eine wiederhergestellte
    // 1-phasige Karte die Drehstromfelder korrekt ausblendet).
    document.querySelectorAll('.feed-card').forEach(card => {
      const id = parseInt((card.id || '').replace('feed_', ''), 10);
      if (!isNaN(id)) updateFeedNetzart(id);
    });
  }

  /* [Nutzerwunsch] siehe gleichlautender Kommentar in pdf-generator.js/
   * restoreProtocolState(): sichtErpNiOPruefen() (pdf-utils.js) muss auch
   * beim Wiederherstellen eines gespeicherten Standes angestossen werden,
   * nicht nur bei manueller Auswahl im Formular - sonst bleibt ein bereits
   * gespeichertes n.i.O. unmarkiert. Erst NACH dem Wiederherstellen der
   * Einspeisepunkte, damit der darin ausgeloeste autosaveProtocol()-Aufruf
   * nicht mit noch leerem feedsContainer speichert. Seit Punkt 4 (7.3.0)
   * gilt das auch fuer .c-drehfeld (jetzt zusaetzlich .erp-item). */
  document.querySelectorAll('.sicht-item, .erp-item').forEach(el => sichtErpNiOPruefen(el));

  return true;
}

// [Bug #1 aus 4.7.2-Pruefung, 6.0.0] sicherSetItem() statt direktem
// localStorage.setItem() - siehe Erlaeuterung in pdf-generator.js
// autosaveProtocol(). Ein voller Speicher wird jetzt sichtbar gemeldet statt
// still zu scheitern.
function autosaveProtocol() {
  try {
    sicherSetItem(ANSCHLUSS_AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectAnschlussState()));
    entwurfMerken('AP', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('AP', () => ({
        anlage: document.getElementById('uebergabe_standort')?.value,
        gebaeude: document.getElementById('gebaeude_custom')?.value
      })),
      // [8.0.0, Teil 6.4] Einzelteile zusaetzlich zur zusammengesetzten
      // "bezeichnung" fuer die Spalten in "Offene Prüfungen" (index.html).
      standort: document.getElementById('uebergabe_standort')?.value || document.getElementById('auftraggeber')?.value || '',
      gebaeude: document.getElementById('gebaeude_custom')?.value || '',
      anlage: document.getElementById('anlage_bez')?.value || '',
      anzahl: document.querySelectorAll('.feed-card').length
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

  // Lokales Datum, siehe heuteIso() in pdf-utils.js
  datumsfeldAufHeute('datum');
  datumsfeldAufHeute('unterschrift_datum');
  updateNaechsterTerminAnschluss();
  document.getElementById('res_bemerkungen').style.height = 'auto';
  toggleEinspeisungSonstiges(document.getElementById('einspeisung_art').value);

  applyMasterDataToForm();

  document.getElementById('feedsContainer').innerHTML = '';
  cardCounter = 0;
  addFeedCard();

  if (typeof padUebergeber !== 'undefined' && padUebergeber) padUebergeber.clear();
  if (typeof padUebernehmer !== 'undefined' && padUebernehmer) padUebernehmer.clear();
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
