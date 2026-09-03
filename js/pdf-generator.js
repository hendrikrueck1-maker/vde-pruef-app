let cardCounter = 0;

/* Pruefstrom fuer Ausloesestrom/Ausloesezeit: bei einer NEUEN Karte (data.rcd_pruefstrom
 * === undefined) ist "5x In (max. 40 ms)" der in der Praxis fast immer verwendete
 * Pruefstrom und wird jetzt vorbelegt, damit er nicht bei jedem Stromkreis erneut
 * ausgewaehlt werden muss. Ein WIEDERHERGESTELLTER Zwischenstand (auch ein bewusst
 * leerer, z. B. aus einer Archiv-Vorlage) behaelt weiterhin genau seinen Wert -
 * "attrEscOderVorgabe"-Prinzip: Vorgabewert nur, wenn im Zwischenspeicher gar nichts steht. */
function pruefstromSel(wert, optionWert) {
  const eff = wert === undefined ? '5' : wert;
  return eff === optionWert ? ' selected' : '';
}

/* ---------------------------------------------------------------------------
 *  STROMKREIS TOTLEGEN (MANGEL FESTGESTELLT)
 * ---------------------------------------------------------------------------
 *  Wird an einem einzelnen Stromkreis ein Mangel festgestellt (z. B. eine
 *  einzeln abgesicherte Schukosteckdose mit Isolationsfehler), muss dieser
 *  eine Kreis freigeschaltet/totgelegt werden koennen, OHNE dass die uebrige,
 *  einwandfreie Anlage deswegen als nicht VDE-konform gilt. Ein totgelegter
 *  Stromkreis hat DEFINITIONSGEMAESS keine Messwerte (er wird ja gerade NICHT
 *  betrieben) - er wird deshalb von der Pflicht "jeder Stromkreis braucht
 *  mindestens einen Messwert" ausgenommen (siehe prueflingeOhneMessung-Aufruf
 *  weiter unten) und im PDF eindeutig als totgelegt gekennzeichnet, statt als
 *  gemessen und i.O. zu erscheinen. */
function istTotgelegt(el) {
  // el ist entweder das Auswahlfeld selbst (.c-totgelegt, <select>) oder ein
  // Nachfahre davon (z. B. beim Auslesen einer Karte per querySelector).
  return !!el && String(el.value || '').trim() === 'n.i.O.';
}

/* Reine Anzeige-Synchronisation (Grund-Feld ein-/ausblenden, rote Markierung,
 * Messpruefungen ein-/ausklappen) - OHNE Seiteneffekte wie Fokus oder
 * Autosave. Wird sowohl beim Anlegen/Wiederherstellen einer Karte als auch
 * beim manuellen Umschalten (toggleTotlegung) verwendet. */
function syncTotlegungAnzeige(select) {
  const card = select.closest('.circuit-card, .feed-card');
  if (!card) return;
  const niO = istTotgelegt(select);
  const grundBox = card.querySelector('.totlegung-grund');
  if (grundBox) grundBox.style.display = niO ? '' : 'none';
  card.classList.toggle('circuit-totgelegt', niO);
  select.classList.toggle('circuit-niko', niO);

  /* Bei "n.i.O." sind die Messpruefungen oben nicht mehr relevant (der Kreis
   * wird ja gerade nicht betrieben) - automatisch einklappen, aber ueber die
   * Ueberschrift jederzeit wieder aufklappbar lassen (siehe
   * toggleMessSections). Bei Rueckwechsel auf "i.O." wieder aufklappen. */
  const messSections = card.querySelector('.c-mess-sections');
  if (messSections) messSections.classList.toggle('mess-sections-collapsed', niO);
  return niO;
}

function toggleTotlegung(select) {
  const niO = syncTotlegungAnzeige(select);
  if (niO) {
    const card = select.closest('.circuit-card, .feed-card');
    const ta = card && card.querySelector('.c-totlegung-grund');
    if (ta) ta.focus();
  }
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
}

function toggleMessSections(header) {
  const wrapper = header.closest('.c-mess-sections');
  if (wrapper) wrapper.classList.toggle('mess-sections-collapsed');
}

function addCircuitCard(data = {}) {
  cardCounter++;
  const container = document.getElementById('circuitsContainer');
  const card = document.createElement('div');
  card.className = 'circuit-card';
  card.id = `circuit_${cardCounter}`;
  
  card.innerHTML = `
    <div class="circuit-header">
      <span>Stromkreis #${cardCounter}</span>
      <span>
        <button type="button" class="btn btn-secondary" onclick="dupliziereStromkreis('circuit_${cardCounter}')" title="Legt eine neue Karte mit denselben Leitungs- und Schutzdaten an. Messwerte bleiben leer.">⧉ Duplizieren</button>
        <button type="button" class="btn-danger" onclick="removeCard('circuit_${cardCounter}')">Entfernen</button>
      </span>
    </div>

    <div class="grid">
      <div class="form-group">
        <label>Bezeichnung / Zweck:</label>
        <input type="text" class="c-bez" value="${attrEsc(data.bez)}" placeholder="z. B. Schukosteckdose Tonregie">
      </div>
      <div class="form-group">
        <label>Kabeltyp:</label>
        <input type="text" class="c-kabel-typ" id="kabel_typ_${cardCounter}" value="${attrEsc(data.kabel)}" placeholder="z. B. NYM-J / UP">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'NYM-J')">NYM-J</button>
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'H07RN-F')">H07RN-F</button>
          <button type="button" class="quick-btn" onclick="setValue('kabel_typ_${cardCounter}', 'TITANEX')">TITANEX</button>
        </div>
      </div>
      <div class="form-group">
        <label>Leiter-Anzahl:</label>
        <input type="text" class="c-leiter" id="leiter_${cardCounter}" value="${attrEscOderVorgabe(data.leiter, '3G')}" placeholder="z. B. 3G">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '3G')">3G</button>
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '5G')">5G</button>
          <button type="button" class="quick-btn" onclick="setValue('leiter_${cardCounter}', '4G')">4G</button>
        </div>
      </div>
      <div class="form-group">
        <label>Querschnitt:</label>
        <input type="text" inputmode="decimal" class="c-querschnitt" id="qs_${cardCounter}" value="${attrEscOderVorgabe(data.qs, '1,5 mm²')}" placeholder="z. B. 1,5 mm²">
        <div class="quick-btn-group">
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '1,5 mm²')">1,5 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '2,5 mm²')">2,5 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '4 mm²')">4 mm²</button>
          <button type="button" class="quick-btn" onclick="setValue('qs_${cardCounter}', '6 mm²')">6 mm²</button>
        </div>
      </div>
    </div>

    <!-- MESSPRUEFUNGEN (4.7.0): ein gemeinsam einklappbarer Block. Wird der
         Stromkreis weiter unten als "Mangel festgestellt / totgelegt"
         markiert, sind diese Messwerte per Definition nicht mehr relevant
         (der Kreis ist ja gerade nicht in Betrieb) - toggleTotlegung() klappt
         den Block dann automatisch ein, laesst ihn aber jederzeit per Klick
         auf die Ueberschrift wieder aufklappbar (z. B. falls doch noch
         Werte nachgetragen werden muessen). -->
    <div class="c-mess-sections">
    <div class="mess-sections-header" onclick="toggleMessSections(this)">
      <span class="mess-sections-titel">Messprüfungen</span>
      <span class="mess-sections-hinweis">Bei „n.i.O." unten eingeklappt, da nicht relevant – zum Aufklappen hier klicken</span>
      <span class="mess-sections-chevron">▾</span>
    </div>
    <!-- MESSWERTE: R_PE & R_ISO
         Zwei klar getrennte Gruppen: sonst wirkte am Desktop die Prüfspannung
         wie eine Angabe zu R_PE, obwohl sie zum Isolationswiderstand gehört. -->
    <div class="sub-section">
      <div class="sub-title">1. Schutzleiter- & Isolationswiderstand</div>
      <div class="mess-gruppen">
        <div class="mess-gruppe">
          <div class="mess-gruppe-titel">Schutzleiter R<sub>PE</sub></div>
          <div class="form-group">
            <label>R<sub>PE</sub> (&Omega;) [betriebl. Richtwert &le; 0,30 &Omega;]:</label>
            <input type="text" inputmode="decimal" class="c-rpe" value="${attrEsc(data.rpe)}" placeholder="z. B. 0,11" oninput="validateCardNorms(${cardCounter})">
            <div class="limit-hint">DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit (Prüfstrom &ge; 200 mA), keinen festen Grenzwert. Die Schutzwirkung wird über Z<sub>S</sub>/I<sub>K</sub> bewertet.</div>
          </div>
        </div>
        <div class="mess-gruppe">
          <div class="mess-gruppe-titel">Isolationswiderstand R<sub>ISO</sub></div>
          <div class="grid">
            <div class="form-group">
              <label>Prüfspannung (VDE 0100-600, Tab. 6.1):</label>
              <select class="c-riso-mode" onchange="validateCardNorms(${cardCounter})">
                <option value="500 V DC (Stromkreis bis 500 V)">500 V DC &ndash; bis 500 V (&ge; 1,0 M&Omega;)</option>
                <option value="250 V DC (SELV/PELV)">250 V DC &ndash; SELV/PELV (&ge; 0,5 M&Omega;)</option>
                <option value="1000 V DC (Stromkreis über 500 V)">1000 V DC &ndash; über 500 V (&ge; 1,0 M&Omega;)</option>
                <option value="250 V DC (Praxismessung mit Verbrauchern)">250 V DC &ndash; Praxismessung (kein Normfall)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Messwert R<sub>ISO</sub> (M&Omega;):</label>
              <input type="text" inputmode="decimal" class="c-riso" value="${attrEsc(data.riso)}" placeholder="z. B. > 500" oninput="validateCardNorms(${cardCounter})">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MESSWERTE: ABSICHERUNG -->
    <div class="sub-section">
      <div class="sub-title">2. Überstromschutzeinrichtung (Absicherung)</div>
      <div class="grid">
        <div class="form-group">
          <label>Absicherung (Typ / Nennstrom):</label>
          <input type="text" class="c-sich-typ" id="sich_${cardCounter}" value="${attrEsc(data.sich)}" placeholder="z. B. B 16A" oninput="validateCardNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 16A'); validateCardNorms(${cardCounter})">B 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'B 10A'); validateCardNorms(${cardCounter})">B 10A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 16A'); validateCardNorms(${cardCounter})">C 16A</button>
            <button type="button" class="quick-btn" onclick="setValue('sich_${cardCounter}', 'C 32A'); validateCardNorms(${cardCounter})">C 32A</button>
          </div>
        </div>
        <div class="form-group">
          <label>Z<sub>S</sub> (&Omega;) &ndash; Schleifenimpedanz L&ndash;PE <span class="feld-badge feld-badge-pflicht">Pflicht</span>:</label>
          <input type="text" inputmode="decimal" class="c-zs" value="${attrEsc(data.zs)}" placeholder="z. B. 0,38" oninput="onZsInput(${cardCounter})">
          <div class="limit-hint" id="zs_limit_${cardCounter}"></div>
        </div>
        <div class="form-group">
          <label>I<sub>K</sub> (A) [min. siehe Platzhalter]:</label>
          <input type="text" inputmode="decimal" class="c-ik" value="${attrEsc(data.ik)}" placeholder="z. B. 605" oninput="onIkInput(${cardCounter})">
          <div class="limit-hint">Wird aus Z<sub>S</sub> berechnet (I<sub>K</sub> = 230 V / Z<sub>S</sub>), solange nichts von Hand eingetragen wird.</div>
        </div>
        <div class="form-group">
          <label>Z<sub>L-N</sub> (&Omega;) &ndash; Netzimpedanz <span class="feld-badge feld-badge-optional">Optional</span>:</label>
          <input type="text" inputmode="decimal" class="c-zln" value="${attrEsc(data.zln)}" placeholder="nur wenn gemessen" oninput="onZlnInput(${cardCounter})">
          <div class="limit-hint">Fluke 1663: Zi &ndash; <b>LINE</b> (L&ndash;N). Findet einen hochohmigen N-Leiter, den die L&ndash;PE-Messung nicht sieht. Leer lassen, wenn nicht gemessen.</div>
        </div>
        <div class="form-group">
          <label>I<sub>K2</sub> (A) &ndash; Kurzschlussstrom L&ndash;N:</label>
          <input type="text" inputmode="decimal" class="c-ik2" value="${attrEsc(data.ik2)}" placeholder="rechnet sich aus Z_L-N">
        </div>
      </div>
    </div>

    <!-- MESSWERTE: RCD -->
    <div class="sub-section">
      <div class="sub-title">3. Fehlerstrom-Schutzeinrichtung (RCD / FI)</div>
      <div class="grid">
        <div class="form-group">
          <label>RCD Typ:</label>
          <input type="text" class="c-rcd-typ" id="rcd_typ_${cardCounter}" value="${attrEsc(data.rcd_typ)}" placeholder="z. B. Typ A">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ A')">Typ A</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B')">Typ B</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ B+')">Typ B+</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Typ F')">Typ F</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_typ_${cardCounter}', 'Ohne RCD')">Ohne RCD</button>
          </div>
        </div>
        <div class="form-group">
          <label>Bemessungsfehlerstrom I<sub>&Delta;n</sub>:</label>
          <input type="text" class="c-rcd-idn" id="rcd_idn_${cardCounter}" value="${attrEsc(data.rcd_idn)}" placeholder="z. B. 30 mA" oninput="validateCardNorms(${cardCounter})">
          <div class="quick-btn-group">
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '10 mA'); validateCardNorms(${cardCounter})">10 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '30 mA'); validateCardNorms(${cardCounter})">30 mA</button>
            <button type="button" class="quick-btn" onclick="setValue('rcd_idn_${cardCounter}', '300 mA'); validateCardNorms(${cardCounter})">300 mA</button>
          </div>
        </div>
        <div class="form-group">
          <label>Auslösestrom I<sub>&Delta;mess</sub> (mA) [0,5&ndash;1,0 &times; I<sub>&Delta;n</sub>]:</label>
          <input type="text" inputmode="decimal" class="c-rcd-imess" value="${attrEsc(data.rcd_imess)}" placeholder="z. B. 22" oninput="validateCardNorms(${cardCounter})">
        </div>
        <div class="form-group">
          <label>Prüfstrom für Auslösestrom / Auslösezeit:</label>
          <select class="c-rcd-pruefstrom" onchange="validateCardNorms(${cardCounter})">
            <option value=""${pruefstromSel(data.rcd_pruefstrom, '')}>&ndash; bitte wählen &ndash;</option>
            <option value="1"${pruefstromSel(data.rcd_pruefstrom, '1')}>1 &times; I<sub>&Delta;n</sub> (max. 300 ms)</option>
            <option value="2"${pruefstromSel(data.rcd_pruefstrom, '2')}>2 &times; I<sub>&Delta;n</sub> (max. 150 ms)</option>
            <option value="5"${pruefstromSel(data.rcd_pruefstrom, '5')}>5 &times; I<sub>&Delta;n</sub> (max. 40 ms)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Auslösezeit t<sub>A</sub> (ms) <span class="limit-hint" id="ta_limit_${cardCounter}"></span>:</label>
          <input type="text" inputmode="decimal" class="c-rcd-ta" value="${attrEsc(data.rcd_ta)}" placeholder="z. B. 24" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>

    <!-- MESSWERTE: BERÜHRUNGSSPANNUNG -->
    <div class="sub-section">
      <div class="sub-title">4. Berührungsspannung & Netzart</div>
      <div class="grid">
        <div class="form-group">
          <label>Spannungsart Netzeinspeisung:</label>
          <select class="c-spannung-art" id="art_${cardCounter}" onchange="validateCardNorms(${cardCounter})">
            <option value="AC">AC (Wechselstrom)</option>
            <option value="DC">DC (Gleichstrom)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Bereich / Gefährdung:</label>
          <select class="c-gefaehrdung" id="gef_${cardCounter}" onchange="validateCardNorms(${cardCounter})">
            <option value="normal">Normalbereich (50 V AC / 120 V DC)</option>
            <option value="erhoeht">Erhöhte Gefährdung (25 V AC / 60 V DC)</option>
          </select>
          <div class="limit-hint">Erhöhte Gefährdung z. B. Bühne, Open Air, feuchte/leitfähige Umgebung, Baustelle.</div>
        </div>
        <div class="form-group">
          <label>Maximal zulässige Spannung U<sub>L</sub>:</label>
          <input type="text" class="c-ul-max" id="ul_max_${cardCounter}" value="&le; 50 V AC" readonly>
        </div>
        <div class="form-group">
          <label>Gemessene Berührungsspannung U<sub>mess</sub> (V):</label>
          <input type="text" inputmode="decimal" class="c-umess" value="${attrEsc(data.umess)}" placeholder="z. B. 2,5 V" oninput="validateCardNorms(${cardCounter})">
        </div>
      </div>
    </div>
    </div>

    <!-- ERGEBNIS DIESER STROMKREISPRUEFUNG (4.7.0): steht bewusst am ENDE der
         Karte - erst werden alle Messwerte erfasst, dann das Ergebnis
         bewertet. Gleiches i.O./n.i.O.-Muster wie bei Sichtpruefung/Erprobung
         (siehe .sicht-item/.erp-item). Ein Mangel (n.i.O.) klappt automatisch
         die Messpruefungen oben ein (nicht mehr relevant, da der Kreis
         freigeschaltet/totgelegt wird) und oeffnet/fokussiert das Feld fuer
         den festgestellten Fehler. */-->
    <div class="circuit-totlegung">
      <div class="form-group">
        <label>Ergebnis Stromkreisprüfung:</label>
        <select class="c-totgelegt" onchange="toggleTotlegung(this)">
          <option value="i.O."${data.totgelegt ? '' : ' selected'}>i.O.</option>
          <option value="n.i.O."${data.totgelegt ? ' selected' : ''}>n.i.O. – Mangel festgestellt (Stromkreis freigeschaltet/totgelegt, fließt nicht in die Gesamtbewertung ein)</option>
        </select>
      </div>
      <div class="form-group grid-full totlegung-grund" style="${data.totgelegt ? '' : 'display:none;'}">
        <label>Festgestellter Fehler / Grund der Totlegung:</label>
        <textarea class="c-totlegung-grund auto-grow" rows="1" placeholder="z. B. Schukosteckdose Bühne rechts: Isolationsfehler L-PE, einzeln abgesichert über eigene Sicherung, freigeschaltet und mit Warnschild versehen." oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px'">${attrEsc(data.totlegung_grund)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(card);
  // Anzeige (collapse/rote Markierung/Grund-Feld) einmalig synchronisieren -
  // ohne Fokus/Autosave-Seiteneffekt (siehe syncTotlegungAnzeige).
  const totSelect = card.querySelector('.c-totgelegt');
  if (totSelect) syncTotlegungAnzeige(totSelect);
  nummeriereKartenNeu('#circuitsContainer', '.circuit-card', 'Stromkreis');

  if (data.riso_mode) card.querySelector('.c-riso-mode').value = data.riso_mode;
  // Pruefstrom: bei einer neuen Karte (data.rcd_pruefstrom === undefined) ist
  // "5" bereits per <option selected> vorbelegt (siehe pruefstromSel oben) -
  // das darf hier NICHT ueberschrieben werden. Ein wiederhergestellter,
  // auch bewusst leerer Wert wird weiterhin exakt uebernommen.
  if (data.rcd_pruefstrom !== undefined) card.querySelector('.c-rcd-pruefstrom').value = data.rcd_pruefstrom;
  if (data.art) card.querySelector('.c-spannung-art').value = data.art;
  if (data.gefaehrdung) card.querySelector('.c-gefaehrdung').value = data.gefaehrdung;

  validateCardNorms(cardCounter);
}

/* ---------------------------------------------------------------------------
 *  KARTE DUPLIZIEREN - OHNE MESSWERTE
 * ---------------------------------------------------------------------------
 *  Auf einer Buehne sind 15 bis 30 Stromkreise identisch aufgebaut:
 *  NYM-J 3G1,5 - B16 - RCD Typ A 30 mA - Pruefstrom 5x. Nur Bezeichnung und
 *  vier Messwerte unterscheiden sich. Bisher musste jedes dieser Felder pro
 *  Karte neu eingetippt werden.
 *
 *  Uebernommen wird alles, was die Anlage beschreibt (Leitung, Absicherung,
 *  RCD-Typ, Pruefspannung, Gefaehrdungsgrad). NICHT uebernommen werden die
 *  Messwerte - ein kopierter Messwert waere eine erfundene Messung, und genau
 *  das darf in einem Beweisdokument nie entstehen. Die Bezeichnung bekommt
 *  einen Zusatz, damit keine zwei Kreise gleich heissen.
 * ------------------------------------------------------------------------ */
function dupliziereStromkreis(cardDomId) {
  const card = document.getElementById(cardDomId);
  if (!card) return;
  const w = (sel) => card.querySelector(sel)?.value || '';
  const bezAlt = w('.c-bez').trim();
  addCircuitCard({
    // Anlagendaten - werden uebernommen
    bez: bezAlt ? bezAlt + ' (Kopie)' : '',
    kabel: w('.c-kabel-typ'),
    leiter: w('.c-leiter'),
    qs: w('.c-querschnitt'),
    sich: w('.c-sich-typ'),
    riso_mode: w('.c-riso-mode'),
    rcd_typ: w('.c-rcd-typ'),
    rcd_idn: w('.c-rcd-idn'),
    rcd_pruefstrom: w('.c-rcd-pruefstrom'),
    gefaehrdung: w('.c-gefaehrdung'),
    art: w('.c-spannung-art')
    // Messwerte (rpe, riso, zs, ik, zln, ik2, rcd_imess, rcd_ta, umess)
    // werden bewusst NICHT uebernommen.
  });
  if (typeof autosaveProtocol === 'function') autosaveProtocol();
  const neu = document.querySelector('#circuitsContainer .circuit-card:last-child .c-bez');
  if (neu) { neu.focus(); neu.select(); }
}

function validateCardNorms(cardId) {
  const card = document.getElementById(`circuit_${cardId}`);
  if (!card) return;
  const rpeElem = card.querySelector('.c-rpe');
  if (rpeElem && rpeElem.value.trim() !== '') {
    const num = parseFloat(rpeElem.value.replace(',', '.'));
    if (!isNaN(num) && num > 0.30) rpeElem.classList.add('out-of-norm'); else rpeElem.classList.remove('out-of-norm');
  } else if (rpeElem) rpeElem.classList.remove('out-of-norm');

  // R_ISO: Mindestwert haengt von der gewaehlten Pruefspannung ab
  // (SELV/PELV 0,5 MOhm, sonst 1,0 MOhm - DIN VDE 0100-600 Tabelle 6.1)
  const risoElem = card.querySelector('.c-riso');
  const risoModeElem = card.querySelector('.c-riso-mode');
  const risoMin = (risoModeElem && risoModeElem.value.includes('SELV')) ? 0.5 : 1.0;
  if (risoElem && risoElem.value.trim() !== '') {
    const txt = risoElem.value.trim();
    if (txt.startsWith('>')) risoElem.classList.remove('out-of-norm');
    else {
      const num = parseFloat(txt.replace(',', '.'));
      if (!isNaN(num) && num < risoMin) risoElem.classList.add('out-of-norm'); else risoElem.classList.remove('out-of-norm');
    }
  } else if (risoElem) risoElem.classList.remove('out-of-norm');

  // RCD-Ausloesezeit gegen den zum Pruefstrom passenden Grenzwert pruefen.
  // Zuvor wurde pauschal gegen 40 ms geprueft - dieser Wert gilt aber nur bei
  // 5x I_dn. Bei der ueblichen Messung mit 1x I_dn sind 300 ms zulaessig.
  const pruefstromElem = card.querySelector('.c-rcd-pruefstrom');
  const rcdTypElem = card.querySelector('.c-rcd-typ');
  const istSelektiv = rcdTypElem ? /(^|\s)(typ\s*)?s(\s|$)|selektiv/i.test(rcdTypElem.value) : false;
  // Ohne gewaehlten Pruefstrom gibt es keinen definierten Grenzwert -> es wird
  // weder ein Limit angezeigt noch die Ausloesezeit bewertet.
  const pruefstromGewaehlt = !!(pruefstromElem && pruefstromElem.value);
  const taMax = pruefstromGewaehlt ? getRcdMaxAusloesezeitMs(pruefstromElem.value, istSelektiv) : null;
  const taLimitLabel = document.getElementById(`ta_limit_${cardId}`);
  if (taLimitLabel) taLimitLabel.textContent = taMax !== null ? `[max. ${taMax} ms]` : '[Prüfstrom wählen]';

  const taElem = card.querySelector('.c-rcd-ta');
  if (taElem && taMax !== null && taElem.value.trim() !== '' && taElem.value.trim() !== '-') {
    const num = parseFloat(taElem.value.replace(',', '.'));
    if (!isNaN(num) && num > taMax) taElem.classList.add('out-of-norm'); else taElem.classList.remove('out-of-norm');
    /* Der haeufigste Fehler ist nicht der defekte RCD, sondern der falsch
     * angegebene Pruefstrom: 210 ms bei "5x" ist ein typischer Wert fuer eine
     * Messung mit 1x I_dn. Statt nur "zu hoch" zu melden, wird gesagt, wozu
     * der Wert besser passt. */
    const passt = passenderPruefstromFuerTa(taElem.value, pruefstromElem?.value, istSelektiv);
    if (taLimitLabel && passt) {
      taLimitLabel.textContent =
        `[max. ${taMax} ms – dieser Wert passt zu einer Messung mit ${passt}× I\u0394n: mit welchem Prüfstrom wurde gemessen?]`;
    }
  } else if (taElem) taElem.classList.remove('out-of-norm');

  // Ist ein RCD eingetragen, muss er auch geprueft worden sein (DIN VDE 0100-600).
  // Fehlende Messwerte werden markiert, statt stillschweigend als "-" zu drucken.
  const imessEl = card.querySelector('.c-rcd-imess');
  const hatRcd = rcdTypElem && rcdTypElem.value.trim() !== '' && !/ohne\s*rcd/i.test(rcdTypElem.value);
  // messwertFehlt lag hier als eigene Kopie - jetzt zentral (pdf-utils.js),
  // damit Anlagen- und Anschlusspruefung dieselbe Regel verwenden.
  const messwertFehlt = rcdWertFehlt;
  [imessEl, taElem].forEach(el => {
    if (!el) return;
    if (hatRcd && messwertFehlt(el.value)) el.classList.add('missing-value');
    else el.classList.remove('missing-value');
  });

  const umessElem = card.querySelector('.c-umess');
  const artElem = card.querySelector('.c-spannung-art');
  const gefElem = card.querySelector('.c-gefaehrdung');
  const artVal = artElem ? artElem.value : 'AC';
  const gefVal = gefElem ? gefElem.value : 'normal';
  // U_L haengt nicht nur an AC/DC, sondern auch am Bereich: bei erhoehter
  // Gefaehrdung (Buehne, Open Air, feucht) gelten 25 V AC / 60 V DC.
  const ulFeld = document.getElementById(`ul_max_${cardId}`);
  const ulLimit = getUlGrenzwert(artVal, gefVal);
  if (ulFeld) ulFeld.value = `\u2264 ${ulLimit} V ${artVal === 'DC' ? 'DC' : 'AC'}`;
  if (umessElem && umessElem.value.trim() !== '') {
    const num = parseFloat(umessElem.value.replace(',', '.'));
    if (!isNaN(num) && num > ulLimit) umessElem.classList.add('out-of-norm'); else umessElem.classList.remove('out-of-norm');
  } else if (umessElem) umessElem.classList.remove('out-of-norm');

  const sichElem = card.querySelector('.c-sich-typ');
  const ikElem = card.querySelector('.c-ik');
  const zsElem = card.querySelector('.c-zs');
  const minIk = sichElem ? getMinIk(sichElem.value) : null;

  /* Z_S GEGEN DEN ZULAESSIGEN HOECHSTWERT PRUEFEN.
   * Bisher war Z_S ein reines Textfeld ohne jede Bewertung - ein Zahlendreher
   * oder ein zu I_K widerspruechlicher Wert fiel nicht auf. */
  const maxZs = sichElem ? getMaxZs(sichElem.value) : null;
  const zsLimitLabel = document.getElementById(`zs_limit_${cardId}`);
  if (zsLimitLabel) {
    if (maxZs !== null) {
      zsLimitLabel.innerHTML = `max. ${maxZs.toFixed(2).replace('.', ',')} &Omega; &middot; Praxiswert (2/3): ${(maxZs * 2 / 3).toFixed(2).replace('.', ',')} &Omega;`;
      zsLimitLabel.classList.remove('hinweis-wichtig');
    } else if (sichElem && istSchmelzsicherung(sichElem.value)) {
      /* Schmelzsicherung: der Ausloesestrom folgt der Herstellerkennlinie,
       * nicht der 5x/10x/20x-Regel. Frueher fand hier stillschweigend keine
       * Bewertung statt und niemand erfuhr davon. */
      zsLimitLabel.innerHTML = 'Schmelzsicherung &ndash; Grenzwert nach Herstellerkennlinie (I<sub>a</sub> f&uuml;r 0,4 s). Wird nicht automatisch bewertet, bitte selbst pr&uuml;fen.';
      zsLimitLabel.classList.add('hinweis-wichtig');
    } else if (sichElem && istAbsicherungUnbekannt(sichElem.value)) {
      /* [Befund N3] Angabe vorhanden, aber weder als B/C/D-Charakteristik noch
       * als Schmelzsicherung erkannt - genauso unuebersehbar kennzeichnen wie
       * die Schmelzsicherung, statt nur einen allgemeinen Platzhalter zu
       * zeigen. Sonst wird das PDF erzeugt, ohne dass Z_S/I_K in diesem
       * Stromkreis tatsaechlich bewertet wurden UND ohne dass das im
       * Dokument selbst sichtbar wird. */
      zsLimitLabel.innerHTML = '<b>Absicherungsart nicht erkannt</b> &ndash; Z_S/I_K werden NICHT automatisch bewertet, bitte selbst pr&uuml;fen. Erwartet wird eine B/C/D-Charakteristik (z.&nbsp;B. &bdquo;B16&ldquo;) oder eine Schmelzsicherung (gG/gL/NH/Diazed/Neozed).';
      zsLimitLabel.classList.add('hinweis-wichtig');
    } else {
      zsLimitLabel.innerHTML = 'Absicherung eintragen, dann erscheint der zulässige Höchstwert.';
      zsLimitLabel.classList.remove('hinweis-wichtig');
    }
  }

  /* Z_S im oberen Drittel: zulaessig, aber ohne Reserve fuer Messunsicherheit
   * und Leitungserwaermung im Betriebszustand. Hinweis (gelb), keine
   * Beanstandung (rot) - der 2/3-Wert ist ein Praxiswert, keine Norm. */
  if (zsElem) {
    zsElem.classList.toggle('wert-hinweis',
      sichElem ? zsOhneReserve(zsElem.value, sichElem.value) : false);
  }
  if (zsElem) {
    const zsNum = parseFloat(zsElem.value.replace(',', '.'));
    if (zsElem.value.trim() !== '' && maxZs !== null && !isNaN(zsNum) && zsNum > maxZs) zsElem.classList.add('out-of-norm');
    else zsElem.classList.remove('out-of-norm');
  }

  /* Widerspruch zwischen Z_S und I_K sichtbar machen. Der Fall entsteht, wenn
   * beide Werte von Hand eingetippt wurden (dann greift die Kopplung nicht)
   * oder ein alter Zwischenstand geladen wurde. */
  const zsIkOk = zsIkPaarPruefen(card, '.c-zs', '.c-ik');
  const zlnIkOk = zsIkPaarPruefen(card, '.c-zln', '.c-ik2');
  if (zsLimitLabel && (!zsIkOk || !zlnIkOk)) {
    zsLimitLabel.innerHTML += ' &middot; <b>Z und I<sub>K</sub> passen nicht zusammen (I = 230 V / Z) &ndash; einer der Werte ist falsch.</b>';
  }

  if (ikElem) {
    ikElem.placeholder = minIk !== null ? `z. B. ${Math.round(minIk * 1.2)} (min. ${minIk} A erforderlich)` : 'z. B. 605';
    if (ikElem.value.trim() !== '' && minIk !== null) {
      const num = parseFloat(ikElem.value.replace(',', '.'));
      if (!isNaN(num) && num < minIk) ikElem.classList.add('out-of-norm'); else ikElem.classList.remove('out-of-norm');
    } else {
      ikElem.classList.remove('out-of-norm');
    }
  }

  const idnElem = card.querySelector('.c-rcd-idn');
  const imessElem = card.querySelector('.c-rcd-imess');
  if (imessElem && imessElem.value.trim() !== '') {
    const range = idnElem ? getRcdIdnRangeMa(idnElem.value) : null;
    const num = parseFloat(imessElem.value.replace(',', '.'));
    if (range && !isNaN(num) && (num < range.min || num > range.max)) imessElem.classList.add('out-of-norm'); else imessElem.classList.remove('out-of-norm');
  } else if (imessElem) imessElem.classList.remove('out-of-norm');
}

// Erdungs-Richtwert und validateErdung() liegen jetzt zentral in pdf-utils.js
// (ERDUNG_RE_RICHTWERT). Die frueheren Kopien hier waren Duplikate.
const ERDUNG_RE_GRENZWERT = ERDUNG_RE_RICHTWERT;

/* koppleImpedanzMitStrom() und zsIkPaarPruefen() liegen jetzt zentral in
 * pdf-utils.js - die Anschlusspruefung braucht dieselbe Logik. */

function onZsInput(cardId) {
  const card = document.getElementById(`circuit_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zs', '.c-ik');
  validateCardNorms(cardId);
}

function onZlnInput(cardId) {
  const card = document.getElementById(`circuit_${cardId}`);
  if (card) koppleImpedanzMitStrom(card, '.c-zln', '.c-ik2');
}

// Eine Eingabe von Hand hebt die Kopplung fuer dieses Feld auf.
function onIkInput(cardId) {
  const card = document.getElementById(`circuit_${cardId}`);
  const el = card && card.querySelector('.c-ik');
  if (el) delete el.dataset.auto;
  validateCardNorms(cardId);
}

/* EINSPEISUNGSART: nur bei NEA/Wechselrichter ist die Frequenz ein echter
 * Messwert. Am starren Netz ist sie immer 50 Hz und damit reine Formsache. */
function istErsatzstromversorgung() {
  const v = document.getElementById('einspeisung')?.value || '';
  return /NEA|Wechselrichter/i.test(v);
}

function updateEinspeisung() {
  const hint = document.getElementById('freq_hint');
  const freq = document.getElementById('netzfrequenz');
  if (!hint || !freq) return;
  if (istErsatzstromversorgung()) {
    hint.textContent = 'Pflichtangabe bei Ersatzstromversorgung – Sollwert 50 Hz.';
    freq.classList.toggle('missing-value', freq.value.trim() === '');
    /* Bei Netzersatzanlage/Wechselrichter ist die Frequenz ein echter
     * Pflicht-Messwert (siehe Abbruch weiter unten in generatePDF). Die
     * Netzmessung steht dafuer im Formular als eingeklapptes Detail-Element -
     * ohne automatisches Aufklappen faellt eine fehlende Angabe erst beim
     * PDF-Export auf, wenn das Messgeraet oft schon eingepackt ist. */
    const block = document.getElementById('netzmessung_block');
    if (block) block.open = true;
  } else {
    hint.textContent = '';
    freq.classList.remove('missing-value');
  }
}

/* U_NPE_SCHWELLE und npeUeberschritten() liegen seit 4.5.0 zentral in
 * pdf-utils.js - die Anschlusspruefung braucht dieselbe Bewertung (Befund B1). */

function validateNetzmessung() {
  const el = document.getElementById('u_npe');
  if (!el) return;
  if (npeUeberschritten(el.value)) el.classList.add('out-of-norm');
  else el.classList.remove('out-of-norm');
}

/* NETZMESSUNG - JEDER WERT MIT SEINER EIGENEN BEZEICHNUNG
 *
 * FRUEHER stand hier "L-N: 231 / 230 / 229 V  |  L-L: 400 / 399 V". Die
 * Zuordnung ergab sich ausschliesslich aus der Reihenfolge. Wurde nur eine
 * der drei Aussenleiterspannungen gemessen - bei einer unsymmetrisch
 * belasteten Buehnenverteilung der Normalfall - stand dort "L-L: 400 V" ohne
 * jeden Hinweis, ob das L1-L2, L2-L3 oder L1-L3 war. In einem Beweisdokument
 * ist das eine nicht rekonstruierbare Angabe.
 *
 * Die Frequenz gehoert mit in diese Zeile: bei Netzersatzanlage und
 * Wechselrichter ist sie ein echter Messwert und nach der eigenen
 * Formularlogik Pflichtangabe. */
const NETZMESS_FELDER = [
  { id: 'u_l1n', label: 'L1-N' }, { id: 'u_l2n', label: 'L2-N' }, { id: 'u_l3n', label: 'L3-N' },
  { id: 'u_l12', label: 'L1-L2' }, { id: 'u_l23', label: 'L2-L3' }, { id: 'u_l13', label: 'L1-L3' },
  { id: 'u_npe', label: 'N-PE' }
];

function netzmessungZeile() {
  const v = (id) => (document.getElementById(id)?.value || '').trim();
  const teile = NETZMESS_FELDER
    .filter(f => v(f.id))
    .map(f => f.label + ' ' + v(f.id) + ' V');
  const f = v('netzfrequenz');
  if (f) teile.push('f ' + (/hz/i.test(f) ? f : f + ' Hz'));
  return teile.join(' · ');
}

function fillExampleData() {
  document.getElementById('pruefungsnummer').value = "PR-2026-081";
  document.getElementById('pruefer').value = "Max Mustermann (Elektrofachkraft)";
  document.getElementById('anlage_bez').value = "Hauptverteilung Unterbühne UV-1";
  document.getElementById('netzspannung').value = "230 / 400";
  document.getElementById('netzfrequenz').value = "50 Hz";
  document.getElementById('anschluss_typ').value = "H07RN-F";
  document.getElementById('anschluss_leiter').value = "5G";
  document.getElementById('anschluss_qs').value = "10 mm²";
  document.getElementById('erdung_re').value = "0,18";
  document.getElementById('erdung_messpunkt').value = "HES (Haupterdungsschiene) Keller Gr. Haus";
  document.getElementById('hausanschluss').value = "NH 3x100 A gL (HAK Keller)";
  document.getElementById('u_l1n').value = "231";
  document.getElementById('u_l2n').value = "230";
  document.getElementById('u_l3n').value = "229";
  // 4.5.0: Aussenleiterspannungen gehoeren ins Musterprotokoll. Solange sie
  // fehlten, druckte das fertige PDF an dieser Stelle drei leere Schreiblinien.
  document.getElementById('u_l12').value = "399";
  document.getElementById('u_l23').value = "400";
  document.getElementById('u_l13').value = "401";
  document.getElementById('u_npe').value = "0,2";
  validateNetzmessung();
  updateEinspeisung();
  validateErdung();
  // Der frueher hier hinterlegte Text "Sicherung in Kreis 2 erneuert" stand im
  // Widerspruch zum angekreuzten "Keine Mängel festgestellt". Fuer den Fall einer
  // behobenen Beanstandung gibt es jetzt die eigene Option im Feld res_maengel.
  document.getElementById('res_bemerkungen').value = "Alle Messwerte innerhalb der zulässigen Grenzen. Keine Mängel festgestellt.";

  document.getElementById('circuitsContainer').innerHTML = '';
  cardCounter = 0;
  // Beide Beispielkreise haben einen RCD -> beide bekommen auch Messwerte.
  // Zuvor stand bei Kreis 1 "- mA / - ms", was einen vorhandenen, aber ungeprueften
  // RCD dokumentierte. Die Pruefung ist nach DIN VDE 0100-600 zwingend.
  // Werte ohne Einheit eintragen - die Einheit haengt der Generator an.
  // Prüfstrom 5 x I_dn ist der Standard -> Auslösezeiten entsprechend unter 40 ms
  // Typ und I_dn muessen mitgegeben werden: die Beispieldaten sind das
  // Musterprotokoll der App und duerfen keine unvollstaendige RCD-Zelle erzeugen.
  addCircuitCard({ bez: '1 - Schukosteckdose Lichtregie', kabel: 'NYM-J', leiter: '3G', qs: '1,5 mm²', rpe: '0,08', riso: '> 500', sich: 'B 10A', zs: '0,35', ik: '657', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '19', rcd_ta: '12', rcd_pruefstrom: '5', gefaehrdung: 'normal', umess: '1,2' });
  // Buehnenstromkreis: erhoehte Gefaehrdung -> U_L 25 V AC statt 50 V AC
  addCircuitCard({ bez: '2 - CEE 16A Hauptbühne', kabel: 'H07RN-F', leiter: '5G', qs: '2,5 mm²', rpe: '0,12', riso: '450', sich: 'B 16A', zs: '0,42', ik: '547', zln: '0,38', ik2: '605', rcd_typ: 'Typ A', rcd_idn: '30 mA', rcd_imess: '22', rcd_ta: '15', rcd_pruefstrom: '5', gefaehrdung: 'erhoeht', umess: '2,4' });
}

// KOPFDATEN DES PROTOKOLLS (einmal definiert, auf Seite 1 und allen Folgeseiten verwendet)
const VDE0100_KOPF = {
  titel: "PRÜFPROTOKOLL ELEKTRISCHER ANLAGEN",
  normzeile: "Erst- und Wiederholungsprüfung nach DIN VDE 0100-600 / DIN VDE 0105-100"
};
const FORMULAR_REVISION = "Formular Rev. 2026-09 · Normstand: VDE 0100-600:2017-06 · VDE 0105-100:2015-10";

/* ===========================================================================
 *  LEERFORMULAR ZUM AUSFUELLEN VON HAND
 * ---------------------------------------------------------------------------
 *  Das gedruckte Blatt hat andere Anforderungen als das ausgefuellte PDF:
 *
 *  1. SPALTEN: Im ausgefuellten Protokoll steht die komplette RCD-Angabe in
 *     EINER Zelle, weil der Generator sie auf zwei Zeilen setzen kann. Von
 *     Hand ist das unmoeglich - fuer "Typ A (30 mA) 21 mA / 18 ms @ 5x"
 *     braeuchte man in 24 mm Spaltenbreite rund 4,4 pt Schrift (etwa 1,5 mm
 *     Zeichenhoehe). Im Leerformular wird die RCD-Spalte deshalb in drei
 *     schmale Spalten geteilt (Typ/I_dn, I_dmess, t_A).
 *  2. ZEILENHOEHE: 6,5 mm reichen zum Drucken, nicht zum Schreiben. 8,5 mm
 *     ist die uebliche Hoehe fuer handschriftliche Formulare.
 *  3. FOLGEBLAETTER: Frueher musste man das Blatt mehrfach ausdrucken. Dann
 *     stand auf jedem Blatt "Seite 1 von 1", die Nr.-Spalte begann jedes Mal
 *     wieder bei 1 und der Unterschriftenblock wiederholte sich - formal
 *     mehrere Protokolle fuer eine Anlage. Jetzt entsteht EIN PDF mit echten
 *     Fortsetzungsblaettern und fortlaufender Nummerierung.
 * ======================================================================== */
const LEER_ZEILEN_BLATT1 = 5;    // 4.6.0: 6 -> 5. Sektion 1 (Stammdaten) ist im
                                 // Leerformular jetzt grosszuegiger fuer die
                                 // Handschrift (ZA1 4,4 -> 6,2 mm) - die dafuer
                                 // noetigen 13 mm werden hier eingespart, damit
                                 // Blatt 1 weiterhin eine einzelne Seite bleibt.
const LEER_ZEILEN_FOLGE  = 28;   // Zeilen je Fortsetzungsblatt
const LEER_ZEILENHOEHE   = 8.0;  // mm, Handschrift (6,5 mm reichten nur zum Drucken)

const LEER_HEAD_VDE = [[
  'Nr.',
  'Bezeichnung / Zweck\ndes Stromkreises',
  'Leitung\nTyp / Adern / Quersch.',
  'R_{PE}\n(Ω)\n≤ 0,30',
  'R_{ISO} (MΩ)\nPrüfspannung\n≥ 1,0 (SELV 0,5)',
  'Sicherung\nTyp / I_{n}',
  'Z_{S} (Ω) / I_{K} (A)\n2. Zeile L-N:\nZ_{L-N} / I_{K2}',
  'RCD\nTyp / I_{Δn}',
  'I_{Δmess}\n(mA)',
  't_{A} (ms)\n@ ____ x I_{Δn}',
  'U_{mess} (V)\nU_{L} 50/25 AC\n120/60 DC'
]];

// 4.7.0: Summe = 180 mm (210 - 20 mm linker Rand - 10 mm rechter Rand).
// Vorher 190 mm (bei 10 mm Rand beidseitig) - seit PDF_MARGIN_LEFT auf
// 20 mm vergroessert wurde (Locherrand), quetschte die Tabelle 10 mm
// ueber den neuen Satzspiegel hinaus in den rechten Rand. Alle Spalten
// proportional verkleinert (Faktor 180/190).
const LEER_SPALTEN_VDE = {
  0: { cellWidth: 6 }, 1: { cellWidth: 29, halign: 'left' }, 2: { cellWidth: 21 },
  3: { cellWidth: 12 }, 4: { cellWidth: 16 }, 5: { cellWidth: 13 },
  6: { cellWidth: 23 }, 7: { cellWidth: 17 }, 8: { cellWidth: 12 },
  9: { cellWidth: 14 }, 10: { cellWidth: 17 }
};

/* Die Musterangabe stand frueher als eigene Tabellenzeile und verbrauchte auf
 * JEDEM Blatt eine der ohnehin knappen Eintragezeilen. Jetzt steht sie als
 * eine graue Zeile unter der Tabelle. */
const LEER_BEISPIEL_TEXT_VDE =
  'Beispiel: Schukosteckdose Lichtregie | NYM-J 3G 1,5 mm² | R_{PE} 0,08 Ω | R_{ISO} > 500 MΩ (500 V DC) | ' +
  'B 13A | Z_{S} 0,35 Ω / I_{K} 657 A | RCD Typ A 30 mA | I_{Δmess} 19 mA | t_{A} 12 ms @ 5x | U_{mess} 1,2 V ' +
  '(1,5 mm² bei Häufung nur B10/B13 - Verlegeart beachten)';

/* LEGENDE FUER DAS HANDSCHRIFTLICH AUSGEFUELLTE BLATT
 * In der App steht unter jedem Feld eine Hinweiszeile mit dem Grenzwert. Auf
 * dem Papier stand nichts davon: der Tabellenkopf nennt "Z_S ≤ 230 V / I_a",
 * ohne dass irgendwo auf dem Blatt steht, was I_a ist. Fuer Auszubildende im
 * ersten Lehrjahr war das Blatt damit nicht ausfuellbar - nicht wegen der
 * Technik, sondern wegen der fehlenden Legende. */
const LEER_LEGENDE_VDE =
  'Legende: I_{a} = Strom der magnetischen Schnellauslösung (B 5× · C 10× · D 20× I_{n}) · ' +
  'Z_{S} = Schleifenimpedanz, zulässig ≤ 230 V / I_{a} · I_{K} = Kurzschlussstrom · ' +
  'I_{Δn} = Nennfehlerstrom RCD · I_{Δmess} = gemessener Auslösestrom (0,5–1,0 × I_{Δn}) · ' +
  't_{A} = Auslösezeit ≤ 40 ms bei 5× · 150 ms bei 2× · 300 ms bei 1× (Typ S 150/200/500) · ' +
  'U_{mess} = Berührungsspannung ≤ 50 V AC / 120 V DC, bei erhöhter Gefährdung (Bühne, Open Air, feucht) ≤ 25 V AC / 60 V DC.';

const LEER_SOLLWERTE_VDE =
  'Netzmessung Sollwerte: L gegen N je 230 V - L gegen L je 400 V - N gegen PE 0 V - Frequenz 50 Hz.';

// Gewaehlte Blattzahl des Leerformulars (1-4), aus dem Formular gelesen.
function leerBlattzahl() {
  const roh = parseInt(document.getElementById('leer_blaetter')?.value || '1', 10);
  if (isNaN(roh)) return 1;
  return Math.min(Math.max(roh, 1), 4);
}

// GENERATOR FÜR DAS PDF-DOKUMENT
function generatePDF(isBlank = false) {
  /* --- PRUEFERGEBNIS: ZUSTAND VORAB BESTIMMEN --------------------------------
   * "Mängel festgestellt und behoben" ohne Beschreibung im Bemerkungsfeld ist
   * eine nicht belegbare Behauptung. Deshalb Abbruch VOR dem Aufbau des PDF.
   * Das Leerformular ist davon nie betroffen - dort wird nichts behauptet. */
  const maengelVal = isBlank ? '' : (document.getElementById('res_maengel')?.value || '');
  const maengelZustand = getMaengelZustand(maengelVal);

  /* Offene Bewertungen (leere Auswahlfelder) abfangen - siehe pdf-utils.js.
   * Muss VOR allen anderen Pruefungen stehen: ein leeres res_maengel wuerde
   * sonst als "kein Zustand" durchlaufen und ein Protokoll ohne angekreuztes
   * Pruefergebnis erzeugen. */
  if (!isBlank) {
    const offeneAuswahl = ersteLeereAuswahl(
      ['.sicht-item', '.erp-item', '#res_maengel', '#res_plakette', '#res_gewaehrleistung']);
    if (offeneAuswahl) { offeneBewertungMelden(offeneAuswahl); return; }
  }

  if (!isBlank && maengelBehobenBemerkungFehlt(maengelZustand, document.getElementById('res_bemerkungen')?.value)) {
    alert(MAENGEL_BEHOBEN_HINWEIS);
    document.getElementById('res_bemerkungen')?.focus();
    return;
  }

  /* Ein Protokoll ohne einen einzigen Stromkreis ist keine Pruefung: die
   * Messtabelle bliebe leer, die Gesamtbewertung stuende trotzdem auf
   * "keine Maengel" und die Plakette waere erteilt. */
  if (!isBlank && document.querySelectorAll('.circuit-card').length === 0) {
    keinePrueflingeMelden('Stromkreis');
    return;
  }

  /* Ein Stromkreis ohne einen einzigen Messwert ist ebenso wenig eine Pruefung
   * wie ein Protokoll ohne Stromkreis - und beim Start legt das Formular
   * automatisch zwei leere Karten an. Siehe prueflingeOhneMessung(). */
  if (!isBlank) {
    const ohneMessung = prueflingeOhneMessung(
      document.querySelectorAll('.circuit-card'),
      ['.c-rpe', '.c-riso', '.c-zs', '.c-ik', '.c-rcd-imess', '.c-rcd-ta', '.c-umess'],
      '.c-totgelegt');
    if (ohneMessung.length) { ohneMessungMelden(ohneMessung, 'Stromkreis'); return; }

    // Ein totgelegter Stromkreis MUSS einen Fehlertext haben - sonst
    // dokumentiert das Protokoll eine Freischaltung ohne erkennbaren Grund.
    const totOhneGrund = [];
    document.querySelectorAll('.circuit-card').forEach((card, i) => {
      if (istTotgelegt(card.querySelector('.c-totgelegt')) && istLeerWert(card.querySelector('.c-totlegung-grund')?.value)) {
        totOhneGrund.push(i + 1);
      }
    });
    if (totOhneGrund.length) {
      alert('Stromkreis ' + totOhneGrund.join(', ') + ' ist als totgelegt markiert, aber es fehlt die Angabe des festgestellten Fehlers.\n\n' +
        'Bitte im Feld "Festgestellter Fehler / Grund der Totlegung" eintragen.\n\nDas PDF wurde deshalb nicht erstellt.');
      return;
    }
  }

  /* Mindestangaben: ohne sie ist das Protokoll keinem Vorgang zuzuordnen. */
  if (!isBlank) {
    const fehlend = erstesLeerePflichtfeld(['datum', 'pruefer', 'anlage_bez']);
    if (fehlend) { pflichtfeldMelden(fehlend); return; }
  }

  /* Bei Netzersatzanlage und Wechselrichter ist die Frequenz ein echter
   * Messwert (Sollwert 50 Hz) - das Formular weist sie ausdruecklich als
   * Pflichtangabe aus. Bisher wurde das Feld nur rot markiert und das PDF
   * trotzdem ohne Frequenzangabe erzeugt. */
  if (!isBlank && istErsatzstromversorgung() &&
      String(document.getElementById('netzfrequenz')?.value || '').trim() === '') {
    pflichtfeldMelden({ el: document.getElementById('netzfrequenz'), id: 'netzfrequenz' });
    return;
  }

  /* Folgetermin in der Vergangenheit: meist ein Tippfehler im Jahr. Kein
   * harter Abbruch - es gibt Nachpruefungen mit rueckdatiertem Termin. */
  const terminRoh = String(document.getElementById('res_termin_date')?.value || '');
  if (!isBlank && terminRoh && terminRoh < heuteIso().slice(0, 7)) {
    if (!confirm('Der nächste Prüftermin (' + terminRoh.replace('-', ' / ') +
                 ') liegt in der Vergangenheit.\n\nTrotzdem fortfahren?')) return;
  }

  /* Doppelvergabe: wurde diese Nummer in dieser App schon einmal fuer ein
   * fertiges PDF verwendet, muss das ausdruecklich bestaetigt werden. */
  const nummerRoh = isBlank ? '' : (document.getElementById('protokollnummer')?.value || '').trim();
  if (!isBlank && !protokollNummerFreigeben(nummerRoh)) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  
  const primaryColor = [0, 51, 102];
  const textColor = [15, 23, 42];
  const boxBorder = [203, 213, 225];
  const tableHeaderBg = [226, 232, 240];

  const redCellBg = [254, 226, 226];  
  const redCellText = [153, 27, 27];   

  const makeCell = (text, isOut = false) => {
    if (!isBlank && isOut) {
      return { content: text, styles: { fillColor: redCellBg, textColor: redCellText, fontStyle: 'bold' } };
    }
    return text;
  };

  const getVal = (id, defaultBlank = "____________________") => {
    if (isBlank) return defaultBlank;
    const elem = document.getElementById(id);
    if (!elem) return defaultBlank;
    const val = elem.value ? elem.value.trim() : "";
    return val ? cleanStr(val) : defaultBlank;
  };

  // Wert eines Feldes ODER leerer String -> drawFeldZeile zeichnet dann eine
  // durchgehende Schreiblinie statt einer kurzen Unterstrich-Kette.
  const feldWert = (id) => {
    if (isBlank) return '';
    const el = document.getElementById(id);
    return el && el.value.trim() ? cleanStr(el.value.trim()) : '';
  };

  const protokollNr = getVal('protokollnummer', "PR-JJJJ-MM-TT-XXX");
  const pruefNr = getVal('pruefungsnummer', "__________");

  const formatDatum = (isoDate) => {
    if (!isoDate) return "";
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [jahr, monat, tag] = parts;
    return `${tag}.${monat}.${jahr}`;
  };
  const datum = isBlank ? "" : (formatDatum(document.getElementById('datum').value) || "");
  // Im Leerformular ist der Ort noch offen: frueher stand dort fest "Konstanz",
  // auch wenn in den Stammdaten etwas anderes hinterlegt war.
  const ort = isBlank ? "" : getVal('unterschrift_ort', "Konstanz");
  const unterschriftDatum = isBlank ? "" : formatDatum(document.getElementById('unterschrift_datum')?.value);
  // Im Leerformular bleiben Kopf-Felder leer -> die Kopfbox zeichnet dort
  // Schreiblinien, auf die von Hand eingetragen werden kann.
  const kopfProtokollNr = isBlank ? "" : protokollNr;
  // Auch im AUSGEFUELLTEN Protokoll darf kein Ausfuell-Platzhalter stehen: ist
  // die Prueflings-ID leer, zeichnet kopfFeld() dort eine Schreiblinie. Ein
  // "__________" in einem fertigen Dokument sieht aus wie ein vergessenes Feld.
  const kopfPruefNr = isBlank ? "" : feldWert('pruefungsnummer');

  // HEADER: zentrale Funktion aus pdf-utils.js, passt die Schriftgroesse
  // automatisch an die verfuegbare Breite an (verhindert Ueberdrucken der Infobox)
  drawProtokollHeader(doc, VDE0100_KOPF);

  let y = PDF_CONTENT_TOP;

  /* --- SEKTION 1: STAMMDATEN ---------------------------------------------
   * Kompakt gehalten: 5 Zeilen je Spalte, Zeilenabstand 4,6 mm.
   * Protokoll-Nr. und Prueflings-ID stehen bereits in der Kopfbox oben rechts
   * und werden hier nicht wiederholt - das spart eine ganze Zeile. */
  /* 4.5.0: 49 mm -> 44 mm. Das Ankreuzfeld "einphasig" ist entfallen, die
   * Netzmessung belegt nur noch zwei Zeilen Kurzfelder. Die gewonnenen 5 mm
   * werden gebraucht, damit Bewertung UND Unterschriften auf Blatt 1 passen. */
  const ZA = 4.4;                        // Zeilenabstand ab Sektion 4 (unveraendert)
  /* 4.6.0: Im Leerformular sind die Stammdaten-Zeilen (Sektion 1) jetzt
   * grosszuegiger, damit von Hand lesbar eingetragen werden kann - 5,7 mm statt
   * 4,4 mm Zeilenabstand (+30 %). Im ausgefuellten Protokoll bleibt es beim
   * kompakten Abstand, da dort ohnehin am Rechner getippt wird. Damit Blatt 1
   * trotzdem eine Seite bleibt, wurde dafuer eine Eintragezeile aus der
   * Messtabelle herausgenommen (LEER_ZEILEN_BLATT1 6 -> 5, siehe unten). */
  const ZA1 = isBlank ? 5.7 : ZA;
  const SEK1_H = isBlank ? 51 : 42;
  drawKategorieBox(doc, { y, h: SEK1_H, titel: "1. STAMMDATEN, NETZSYSTEM & MESSGERÄTE", kat: 'stamm' });

  doc.setFontSize(7.2);
  // 4.7.0: spL von 13 auf PDF_MARGIN_LEFT + 3 (23) verschoben (Locherrand),
  // spB entsprechend von 90 auf 80 verkleinert, damit die Zeile weiterhin
  // vor spR (107) endet.
  const spL = PDF_MARGIN_LEFT + 3, spR = 107, spB = 80;   // linke/rechte Spalte, Spaltenbreite

  let volt = feldWert('netzspannung');
  if (volt && !volt.toLowerCase().includes('v')) volt += ' V';
  let freq = feldWert('netzfrequenz');
  if (freq && !freq.toLowerCase().includes('hz')) freq += ' Hz';
  const spannungFreq = [volt, freq].filter(Boolean).join(' / ');

  const messgeraetText = (() => {
    const g = feldWert('messgeraet');
    if (!g) return '';
    const sn = feldWert('seriennummer');
    let t = g;
    if (sn) t += ` (SN ${sn})`;
    return t;
  })();

  const z1 = (i) => y + 10 + i * ZA1;
  drawFeldZeile(doc, "Auftraggeber:",     feldWert('auftraggeber'),    spL, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Gebäude/Bereich:",  feldWert('gebaeude_custom'), spL, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Anlage:",           feldWert('anlage_bez'),      spL, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Prüfer/-in:",       feldWert('pruefer'),         spL, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Prüfdatum:",        datum,                       spL, z1(4), spB, isBlank);
  // Hausanschluss/Speisepunkt: oberste Schutzebene, Grundlage fuer Selektivitaet
  // und maximalen Kurzschlussstrom. Bei Open Air steht hier der Speisepunkt.
  drawFeldZeile(doc, "Hausanschluss/Speisepunkt:", feldWert('hausanschluss'), spL, z1(5), spB, isBlank);

  drawFeldZeile(doc, "Prüfnorm:",            feldWert('pruefnorm'),  spR, z1(0), spB, isBlank);
  drawFeldZeile(doc, "Grund der Prüfung:",   feldWert('pruefgrund'), spR, z1(1), spB, isBlank);
  drawFeldZeile(doc, "Netzsystem / Einspeisung:", [feldWert('netzsystem'), feldWert('einspeisung')].filter(Boolean).join(' - '), spR, z1(2), spB, isBlank);
  drawFeldZeile(doc, "Spannung / Frequenz:", spannungFreq,           spR, z1(3), spB, isBlank);
  drawFeldZeile(doc, "Netzbetreiber:",       feldWert('vnb'),        spR, z1(4), spB, isBlank);
  drawFeldZeile(doc, "Prüfgerät:",           messgeraetText,         spR, z1(5), spB, isBlank);

  /* --- NETZMESSUNG ------------------------------------------------------
   * FRUEHER war das im Leerformular EINE beschriftete Linie ueber 184 mm
   * ("Netzmessung L-N / L-L / N-PE:") fuer sieben Einzelwerte. Wer von Hand
   * eintrug, musste sich Reihenfolge und Format selbst ausdenken, und ein
   * Feld fuer die Frequenz gab es nicht.
   *
   * JETZT: acht einzeln beschriftete Kurzfelder in zwei Zeilen. Nicht
   * gemessene Werte bleiben leer - das frueher hier stehende Ankreuzfeld
   * "einphasige Einspeisung" wurde in 4.5.0 ersatzlos entfernt (zu speziell,
   * wurde automatisch gesetzt und widersprach dreiphasigen Messwerten). */
  const isNpeOut = !isBlank && npeUeberschritten(document.getElementById('u_npe')?.value);
  const netzWert = (id) => isBlank ? '' : (document.getElementById(id)?.value || '').trim();
  const hatNetzmessung = isBlank || NETZMESS_FELDER.some(f => netzWert(f.id)) || netzWert('netzfrequenz');

  if (hatNetzmessung) {
    doc.setFont('helvetica', 'bold');
    // 4.7.0: seit spL auf 23 mm verschoben wurde (Locherrand), passte die fett
    // gesetzte Beschriftung "Netzmessung:" bei 7 pt nicht mehr vor die bei
    // x = 36 beginnende erste Kurzfeld-Spalte und ueberdeckte "U L1-N".
    // drawFittedText verkleinert die Schrift so weit wie noetig (ca. 13 mm
    // verfuegbar) - bei Bedarf bis auf 5.5 pt, was hier immer noch gut lesbar
    // ist, weil es sich um ein kurzes, einzeiliges Label handelt.
    drawFittedText(doc, 'Netzmessung:', spL, z1(6), 36 - spL - 1, 7, 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    // Vier Kurzfelder je Zeile, 45 mm Raster ab x = 36 mm
    const NM_X0 = 36, NM_DX = 41, NM_FELD_B = 38;
    const nmZelle = (label, id, spalte, zeile, rot) => {
      const wert = netzWert(id);
      const einheit = id === 'netzfrequenz' ? 'Hz' : 'V';
      /* 4.5.0: Im AUSGEFUELLTEN Protokoll steht bei einem nicht gemessenen Wert
       * "n. gem." statt einer leeren Schreiblinie. Eine leere Linie in einem
       * abgeschlossenen Dokument sieht aus wie ein vergessenes Feld - genau das
       * war der Punkt, an dem frueher zusaetzlich das Ankreuzfeld
       * "einphasige Einspeisung" fuer Verwirrung sorgte. Im Leerformular
       * bleibt die Schreiblinie natuerlich stehen. */
      const text = wert ? withUnit(wert, einheit) : (isBlank ? '' : 'n. gem.');
      drawFeldZeile(doc, label + ':', text,
                    NM_X0 + spalte * NM_DX, z1(6) + zeile * ZA1, NM_FELD_B, isBlank, { rot: !!rot });
    };
    doc.setFontSize(6.6);
    nmZelle('U L1-N',  'u_l1n', 0, 0);
    nmZelle('U L2-N',  'u_l2n', 1, 0);
    nmZelle('U L3-N',  'u_l3n', 2, 0);
    nmZelle('f',       'netzfrequenz', 3, 0);
    nmZelle('U L1-L2', 'u_l12', 0, 1);
    nmZelle('U L2-L3', 'u_l23', 1, 1);
    nmZelle('U L1-L3', 'u_l13', 2, 1);
    // N-PE ist der einzige Wert der Netzmessung, der eigenstaendig einen
    // Fehler findet (hochohmiger PEN, Fremdeinspeisung) -> bei Ueberschreitung
    // rot, damit er nicht als unauffaellige Zahl untergeht.
    nmZelle('U N-PE',  'u_npe', 3, 1, isNpeOut);

    doc.setFontSize(7.2);
  }

  y += SEK1_H + 4;

  /* --- SEKTION 2: BESICHTIGEN & ERPROBEN ---------------------------------
   * Wieder 3 Spalten (spart gegenueber 2 Spalten zwei Zeilen Hoehe).
   * Damit der Beschreibungstext nicht mehr unter die Kaestchen laeuft, sind
   * die Bezeichnungen gekuerzt UND die Kaestchen stehen weiter rechts;
   * zusaetzlich verkleinert drawFittedText zu lange Texte automatisch. */
  /* Besichtigen: 12 Punkte in 3 Spalten x 4 Zeilen, Erproben: 8 Punkte in
   * 3 Spalten x 3 Zeilen. Jeder Punkt hat jetzt drei Zustaende - "n.a." ist
   * noetig, weil es Brandabschottungen, Gebaeudesystemtechnik oder Motoren
   * nicht an jeder Anlage gibt und ein erzwungenes i.O./n.i.O. dort falsch waere. */
  const SICHT_ZA = 4.3;
  const SEK2_H = 47;   // 4.5.0: 51 -> 47 mm, Inhalt endet bei y+45,5 (siehe C1)
  drawKategorieBox(doc, { y, h: SEK2_H, titel: "2. BESICHTIGEN & ERPROBEN (SICHT- UND FUNKTIONSPRÜFUNG)", kat: 'sicht' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const s = document.querySelectorAll('.sicht-item');
  const sichtLabels = [
    "1. Betriebsmittel", "2. Kabel/Leitungen", "3. Zugänglichkeit", "4. Schaltgeräte",
    "5. Kennzeichnung", "6. Doku/Warnung", "7. Zus. Potenzialausgl.", "8. Basisschutz",
    "9. Typenschild", "10. Brandabschottung", "11. Leiterverbindungen", "12. Gebäudesystemt."
  ];
  // 4.7.0: Spalten neu berechnet (Locherrand, PDF_MARGIN_LEFT jetzt 20 mm).
  // Zwei Zwischenstaende hatten noch Ueberlappungen: zuerst ueberdeckte das
  // "n.a." einer Spalte das Label der naechsten, danach stiess bei 9/18 mm
  // Kaestchenabstand der Text von "n.i.O." an das "n.a."-Kaestchen. Jetzt:
  // schmaleres Label (22 mm) UND etwas weiterer Kaestchenabstand (11/22 mm),
  // beides zusammen passt wieder in die Spaltenbreite von 58 mm.
  const SICHT_LABEL_X = [23, 81, 139];   // Textbeginn je Spalte
  const SICHT_CB_X    = [48, 106, 164];  // "i.O."-Kaestchen
  const SICHT_LABEL_W = 22;

  // Ein Pruefpunkt mit den drei Zustaenden i.O. / n.i.O. / n.a.
  const drawPruefpunkt = (label, xLabel, xBox, yy, wert) => {
    doc.setFontSize(7);
    drawFittedText(doc, label + ':', xLabel, yy, SICHT_LABEL_W, 7, 5.2);
    doc.setFontSize(6.4);
    drawCheckbox(doc, xBox, yy, "i.O.", !isBlank && wert === "i.O.");
    drawCheckbox(doc, xBox + 11, yy, "n.i.O.", !isBlank && wert === "n.i.O.", true);
    drawCheckbox(doc, xBox + 22, yy, "n.a.", !isBlank && wert === "n.a.");
    doc.setFontSize(7);
  };

  sichtLabels.forEach((label, i) => {
    const spalte = Math.floor(i / 4);
    const zeile = i % 4;
    drawPruefpunkt(label, SICHT_LABEL_X[spalte], SICHT_CB_X[spalte], y + 9 + zeile * SICHT_ZA, s[i]?.value);
  });

  // Anschlusskabel: im Leerformular als durchgehende Linie ueber die volle Breite
  const kabelAnschluss = kommaZahl([feldWert('anschluss_typ'), feldWert('anschluss_leiter'), feldWert('anschluss_qs')]
    .filter(p => p).join(' '));
  doc.setFontSize(7);
  const yKabel = y + 9 + 4 * SICHT_ZA + 0.6;
  drawFeldZeile(doc, isBlank ? "Anschlusskabel Typ / Adern / Quersch.:"
                             : "Anschlusskabel (Typ / Adern / Querschnitt):",
                kabelAnschluss, PDF_MARGIN_LEFT + 3, yKabel, 177, isBlank);

  const yErp = yKabel + SICHT_ZA + 1.4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Erproben:", PDF_MARGIN_LEFT + 3, yErp);
  doc.setFont("helvetica", "normal");

  const erpEls = document.querySelectorAll('.erp-item');
  const erpLabels = [
    "Funktion Anlage", "Schutzeinrichtungen", "Drehfeld CEE (rechts)",
    "Polarität/Belegung", "RCD-Prüftaste", "Sicherheitsbeleuchtung",
    "Drehrichtung Motoren", "Gebäudesystemtechnik"
  ];
  erpLabels.forEach((label, i) => {
    const spalte = Math.floor(i / 3);
    const zeile = i % 3;
    drawPruefpunkt(label, SICHT_LABEL_X[spalte], SICHT_CB_X[spalte], yErp + 4.4 + zeile * SICHT_ZA, erpEls[i]?.value);
  });

  y += SEK2_H + 6;

  // SEKTION 3: TABELLE
  const katMessen = drawKategorieTitel(doc, "3. MESSTECHNISCHE PRÜFUNGEN DER STROMKREISE", y, 'messen');
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...PDF_MUTED);
  // Der Hinweis auf rot hinterlegte Werte ergibt im Leerformular keinen Sinn -
  // dort wird nichts ausgefuellt und es kann nichts rot markiert sein.
  doc.text(isBlank ? "Grenzwerte je Spalte im Tabellenkopf."
                   : "Grenzwerte je Spalte im Tabellenkopf. Werte außerhalb des zulässigen Bereichs werden rot hinterlegt.",
           PDF_MARGIN_LEFT, y + 3.4);
  doc.setTextColor(...textColor);

  const tableRows = [];
  let anyMeasurementOut = false;
  // Fehlende ANGABEN werden getrennt gefuehrt: sie machen das Protokoll
  // unvollstaendig, kehren aber den Freigabetext nicht um.
  let anyDokumentationsmangel = false;

  // BEISPIELZEILE IM LEERFORMULAR: zeigt Format, Einheiten und plausible Werte.
  // Sie wird grau/kursiv gesetzt und als "Bsp." gekennzeichnet, damit sie nicht
  // mit einer echten Messung verwechselt werden kann.
  const blaetter = isBlank ? leerBlattzahl() : 1;

  if (isBlank) {
    // Leere Eintragezeilen; die Musterangabe steht als graue Zeile UNTER der
    // Tabelle und verbraucht keine Schreibzeile mehr.
    for (let i = 1; i <= LEER_ZEILEN_BLATT1; i++) {
      tableRows.push([i, "", "", "", "", "", "", "", "", "", ""]);
    }
  } else {
    const cards = document.querySelectorAll('.circuit-card');
    cards.forEach((card, idx) => {
      /* TOTGELEGTER STROMKREIS: keine Messwerte vorhanden (er wird nicht
       * betrieben) - statt der normalen Messwertspalten erscheint eine
       * durchgaengige, rot hinterlegte Kennzeichnung mit dem dokumentierten
       * Fehlergrund. Fliesst NICHT in anyMeasurementOut ein: eine bewusste
       * Freischaltung ist kein ausserhalb der Norm liegender Messwert - die
       * uebrige Anlage bleibt dadurch als "keine Maengel" bewertbar. */
      if (istTotgelegt(card.querySelector('.c-totgelegt'))) {
        const grund = cleanStr(card.querySelector('.c-totlegung-grund')?.value || '');
        tableRows.push([
          idx + 1,
          cleanStr(card.querySelector('.c-bez').value || '-'),
          { content: 'TOTGELEGT / FREIGESCHALTET – Mangel festgestellt, nicht in Betrieb\n' + grund,
            colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', textColor: [153, 27, 27], fillColor: [254, 226, 226] } }
        ]);
        return;
      }

      const kTyp = card.querySelector('.c-kabel-typ').value;
      const kLei = card.querySelector('.c-leiter').value;
      const kQs = card.querySelector('.c-querschnitt').value;
      let kabel = kommaZahl([kTyp, kLei, kQs].filter(p => p && p.trim()).join(' '));
      if (!kabel) kabel = '-';

      const rpeVal = card.querySelector('.c-rpe').value;
      const rpeNum = parseFloat(rpeVal.replace(',', '.'));
      const isRpeOut = !isNaN(rpeNum) && rpeNum > 0.30;
      const rpeText = rpeVal ? `${kommaZahl(rpeVal)} Ω` : '-';

      const risoVal = card.querySelector('.c-riso').value;
      const risoModeVal = card.querySelector('.c-riso-mode')?.value || '';
      // Mindestwert je Pruefspannung (SELV/PELV 0,5 MOhm, sonst 1,0 MOhm)
      const risoMinPdf = risoModeVal.includes('SELV') ? 0.5 : 1.0;
      const risoNum = parseFloat(risoVal.replace(',', '.'));
      const isRisoOut = !risoVal.trim().startsWith('>') && !isNaN(risoNum) && risoNum < risoMinPdf;
      // Die Pruefspannung gehoert nach DIN VDE 0100-600 mit ins Protokoll,
      // weil der Grenzwert von ihr abhaengt.
      const risoText = risoVal ? `${kommaZahl(risoVal)} MΩ\n(${risoModeVal.replace(/\s*\(.*\)/, '')})` : '-';

      const sich = card.querySelector('.c-sich-typ').value || '-';

      const zs = card.querySelector('.c-zs').value;
      const ik = card.querySelector('.c-ik').value;
      const zln = card.querySelector('.c-zln')?.value || '';
      const ik2 = card.querySelector('.c-ik2')?.value || '';
      const minIk = getMinIk(sich);
      const ikNum = parseFloat(ik.replace(',', '.'));
      const isIkOut = minIk !== null && !isNaN(ikNum) && ikNum < minIk;
      // Z_S wird jetzt ebenfalls bewertet (Zs_max = 230 V / I_a) - bisher war das
      // Feld reine Dokumentation und ein Widerspruch zu I_K fiel nicht auf.
      const zsIkWiderspruch = !zIkPlausibel(zs, ik) || !zIkPlausibel(zln, ik2);
      if (zsIkWiderspruch) anyDokumentationsmangel = true;
      const maxZsPdf = getMaxZs(sich);
      const zsNumPdf = parseFloat(zs.replace(',', '.'));
      const isZsOut = maxZsPdf !== null && !isNaN(zsNumPdf) && zsNumPdf > maxZsPdf;
      let zsik = '-';
      if (zs || ik) zsik = `${kommaZahl(zs) || '-'} Ω / ${kommaZahl(ik) || '-'} A`;
      // Netzimpedanz nur drucken, wenn sie tatsaechlich gemessen wurde.
      if (zln || ik2) zsik += `\nL-N: ${kommaZahl(zln) || '-'} Ω / ${kommaZahl(ik2) || '-'} A`;
      // [Befund N3] Absicherung angegeben, aber weder als B/C/D-Charakteristik
      // noch als Schmelzsicherung erkannt: Z_S/I_K wurden in diesem
      // Stromkreis NICHT bewertet. Das muss im gedruckten Protokoll selbst
      // stehen, nicht nur als Hinweis auf dem Bildschirm - sonst gibt das PDF
      // die Anlage frei, ohne die Schutzabschaltung geprueft zu haben, ohne
      // dass ein Leser des Dokuments das erkennen kann.
      const absicherungUnbekannt = istAbsicherungUnbekannt(sich);
      if (absicherungUnbekannt) {
        zsik += '\nAbsicherung nicht erkannt – Z_S/I_K nicht bewertet';
        anyDokumentationsmangel = true;
      }

      const rcdTyp = card.querySelector('.c-rcd-typ').value;
      const rcdIdn = card.querySelector('.c-rcd-idn').value;
      const rcdImess = card.querySelector('.c-rcd-imess').value;
      const rcdTa = card.querySelector('.c-rcd-ta').value;
      // KEIN Fallback auf '1': ein nicht gewaehlter Pruefstrom darf im
      // Beweisdokument nicht als gewaehlte Messbedingung erscheinen.
      const rcdPruefstrom = card.querySelector('.c-rcd-pruefstrom')?.value || '';

      // Zelltext und Dokumentationsmaengel zentral aufbauen (siehe pdf-utils.js).
      // Messwerte erscheinen dadurch auch dann, wenn das Typ-Feld leer blieb.
      const rcdZelle = buildRcdZelle({
        typ: rcdTyp, idn: rcdIdn, imess: rcdImess, ta: rcdTa, pruefstrom: rcdPruefstrom
      });

      // Ausloesezeit nur bewerten, wenn der Pruefstrom bekannt ist - sonst gibt
      // es keinen definierten Grenzwert (DIN EN 61008-1/61009-1).
      const taNum = parseFloat(rcdTa.replace(',', '.'));
      const isTaOut = rcdZelle.taMax !== null && !isNaN(taNum) && taNum > rcdZelle.taMax;
      const idnRange = getRcdIdnRangeMa(rcdIdn);
      const imessNum = parseFloat(rcdImess.replace(',', '.'));
      const isImessOut = idnRange !== null && !isNaN(imessNum) && (imessNum < idnRange.min || imessNum > idnRange.max);

      // Zelle rot: sowohl bei fehlender Angabe als auch bei echter Beanstandung.
      const isRcdOut = isTaOut || isImessOut || rcdZelle.isOut;
      // In die GESAMTBEWERTUNG geht nur ein, was die Sicherheit betrifft.
      // Eine fehlende Typ- oder Prüfstromangabe macht das Protokoll
      // unvollstaendig, aber nicht die Anlage unsicher.
      const isRcdBeanstandung = isTaOut || isImessOut || rcdZelle.isPruefungUnvollstaendig;
      if (rcdZelle.isDokumentationsmangel) anyDokumentationsmangel = true;
      const rcdText = rcdZelle.text;

      const uMessVal = card.querySelector('.c-umess').value;
      const uNum = parseFloat(uMessVal.replace(',', '.'));
      const artPdf = card.querySelector('.c-spannung-art')?.value || 'AC';
      const gefPdf = card.querySelector('.c-gefaehrdung')?.value || 'normal';
      const limitU = getUlGrenzwert(artPdf, gefPdf);
      const isUOut = !isNaN(uNum) && uNum > limitU;

      // withUnit haengt "V" nur an, wenn die Einheit nicht schon eingetippt wurde
      // (fruehere Ausgabe: "1.2 V V")
      // Der Grenzwert steht bereits im Tabellenkopf -> hier nur der Messwert
      const uText = uMessVal ? `${withUnit(uMessVal, 'V')}\n(U_{L} ${getUlText(artPdf, gefPdf)})` : '-';

      if (isRpeOut || isRisoOut || isIkOut || isZsOut || isRcdBeanstandung || isUOut) anyMeasurementOut = true;

      tableRows.push([
        idx + 1,
        cleanStr(card.querySelector('.c-bez').value || '-'),
        cleanStr(kabel),
        makeCell(cleanStr(rpeText), isRpeOut),
        makeCell(cleanStr(risoText), isRisoOut),
        cleanStr(sich),
        makeCell(cleanStr(zsik), isIkOut || isZsOut || zsIkWiderspruch || absicherungUnbekannt),
        makeCell(cleanStr(rcdText), isRcdOut),
        makeCell(cleanStr(uText), isUOut)
      ]);
    });
  }

  const HEAD_AUSGEFUELLT = [[
    'Nr.',
    'Bezeichnung / Zweck\ndes Stromkreises',
    'Leitung\nTyp / Adern / Querschnitt',
    'R_{PE}\n(Ω)\nRichtwert ≤ 0,30',
    'R_{ISO}\n(MΩ)\n≥ 1,0 (SELV 0,5)',
    'Sicherung\nTyp / I_{n}',
    'Z_{S} (Ω) / I_{K} (A)\nZ_{S} ≤ 230 V / I_{a}\nI_{K} ≥ 5x/10x/20x I_{n}',
    'RCD: Typ (I_{Δn})\nI_{Δmess} 0,5-1,0x I_{Δn}\nt_{A} ≤ 40 ms bei 5x',
    'U_{mess} (V)\nU_{L} 50/25 V AC\n120/60 V DC'
  ]];

  // 4.7.0: Summe = 180 mm statt vorher 190 mm (siehe LEER_SPALTEN_VDE oben).
  const SPALTEN_AUSGEFUELLT = {
    0: { cellWidth: 6 }, 1: { cellWidth: 32, halign: 'left' }, 2: { cellWidth: 25 },
    3: { cellWidth: 15 }, 4: { cellWidth: 19 }, 5: { cellWidth: 17 },
    6: { cellWidth: 24 }, 7: { cellWidth: 25 }, 8: { cellWidth: 17 }
  };

  // Gemeinsame Optionen, damit Blatt 1 und die Fortsetzungsblaetter identisch
  // aussehen.
  const tabellenStil = {
    theme: 'grid',
    rowPageBreak: 'avoid',
    headStyles: {
      fillColor: katMessen.kopf, textColor: katMessen.akzent,
      fontSize: 5.6, fontStyle: 'bold', halign: 'center', valign: 'middle',
      lineColor: katMessen.rand, lineWidth: 0.15, cellPadding: { top: 1.4, bottom: 1.4, left: 0.8, right: 0.8 }
    },
    bodyStyles: { fontSize: 6.5, textColor: textColor, halign: 'center', valign: 'middle' },
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN_LEFT, right: PDF_MARGIN_RIGHT, bottom: 16 },
    styles: { lineColor: PDF_TABLE_LINE, lineWidth: 0.18,
              minCellHeight: isBlank ? LEER_ZEILENHOEHE : 5, overflow: 'linebreak',
              cellPadding: { top: 1, bottom: 1, left: 1, right: 1 } }
  };

  doc.autoTable(mitFormelHooks(doc, {
    startY: y + 5,
    // Tabellenkopf mit ZEILENUMBRUECHEN: Bezeichnung / Einheit / Grenzwert
    // stehen sauber untereinander statt in einer ueberlangen Zeile.
    head: isBlank ? LEER_HEAD_VDE : HEAD_AUSGEFUELLT,
    body: tableRows,
    // Eine Messzeile darf nie am Seitenumbruch zerschnitten werden: das Fragment
    // auf der Folgeseite haette keine Zeilennummer mehr und waere keiner Messung
    // zuzuordnen. Passt die Zeile nicht mehr, wandert sie komplett auf die
    // naechste Seite (der Tabellenkopf wird dort automatisch wiederholt).
    columnStyles: isBlank ? LEER_SPALTEN_VDE : SPALTEN_AUSGEFUELLT,
    ...tabellenStil
  }));

  let finalY = doc.lastAutoTable.finalY;

  finalY += isBlank ? 4 : 6;

  /* --- SEKTION 4: ERDUNG / POTENZIALAUSGLEICH (Kategorie "erdung" = violett)
   * Neu: Messpunkt + Bezugspunkt sowie ein Freitextblock fuer eigene
   * Messstellen, die die Haekchenliste nicht abdeckt. */
  const bemerkungRoh = isBlank ? '' : getVal('res_bemerkungen', '');
  /* WICHTIG: splitTextToSize misst mit der Schrift, die GERADE aktiv ist.
   * Nach doc.autoTable() ist das nicht die Schrift, mit der der Text unten
   * gedruckt wird (6,8 pt). Die Zeilen wurden dadurch zu breit umbrochen und
   * liefen ueber die rechte Papierkante hinaus - die letzten Zeichen jeder
   * Zeile fehlten im fertigen PDF. Deshalb erst Schrift setzen, dann messen. */
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const splitBemerkung = bemerkungRoh ? doc.splitTextToSize(bemerkungRoh, PDF_CONTENT_WIDTH - 12) : [];
  const bemZeilen = isBlank ? 2 : Math.max(splitBemerkung.length, 1);

  // Relative Abstaende innerhalb der Box (mm ab Boxoberkante)
  const OFF_R = 9;
  const OFF_PUNKT = OFF_R + ZA;
  // [Befund N5] DIN VDE 0105-100 verlangt bei Wiederholungspruefungen die
  // Angabe, was tatsaechlich geprueft wurde (Vollpruefung oder Stichprobe,
  // und in welchem Umfang) - ohne dieses Feld dokumentiert das Protokoll nur,
  // was gemessen wurde, nicht, was bewusst ungeprueft blieb.
  const OFF_UMFANG = OFF_PUNKT + ZA;
  const offErgebnis   = OFF_UMFANG + ZA;
  const offTermin     = offErgebnis + 5.5;
  const offBemLabel   = offTermin + 5.5;
  const offBemStart   = offBemLabel + 4.2;
  const boxHeight     = offBemStart + bemZeilen * 4.2 + 1.5;

  /* 4.5.0 (C1): Kasten 4 und der Abschlussblock (Freigabe, Konformitaetstext,
   * Unterschriften) werden GEMEINSAM auf Platz geprueft. Vorher wurden beide
   * getrennt geprueft; dadurch passte der Kasten noch auf die Seite, der
   * Unterschriftenblock aber nicht mehr - und ein "1 Blatt"-Leerformular
   * ergab zwei PDF-Seiten, die zweite mit nichts als zwei Linien darauf. */
  const ABSCHLUSS_H_SCHAETZUNG = 32;   // Freigabezeile + Hinweistext + Unterschriften
  finalY = pdfPlatzPruefen(doc, finalY, boxHeight + 5 + ABSCHLUSS_H_SCHAETZUNG);

  drawKategorieBox(doc, { y: finalY, h: boxHeight, titel: "4. ERDUNG, POTENZIALAUSGLEICH & GESAMTBEWERTUNG", kat: 'erdung' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const erdungReNum = parseFloat((document.getElementById('erdung_re')?.value || '').replace(',', '.'));
  const isErdungOut = !isBlank && !isNaN(erdungReNum) && erdungReNum > ERDUNG_RE_GRENZWERT;
  // Rot ueber opts (siehe drawFeldZeile in pdf-utils.js).
  drawFeldZeile(doc, `Erdungswiderstand R_{E} (≤ ${ERDUNG_RE_GRENZWERT} Ω):`,
                feldWert('erdung_re') ? withUnit(feldWert('erdung_re'), 'Ω') : '', PDF_MARGIN_LEFT + 3, finalY + OFF_R, 177, isBlank, { rot: isErdungOut });

  // MESSPUNKT / BEZUGSPUNKT - damit nachvollziehbar ist, WO gemessen wurde
  drawFeldZeile(doc, "Messpunkt / Bezugspunkt:",
                feldWert('erdung_messpunkt'), PDF_MARGIN_LEFT + 3, finalY + OFF_PUNKT, 177, isBlank);

  // [Befund N5] Pruefumfang: Vollpruefung oder Stichprobe (DIN VDE 0105-100).
  drawFeldZeile(doc, "Prüfumfang:", feldWert('pruefumfang'), PDF_MARGIN_LEFT + 3, finalY + OFF_UMFANG, 177, isBlank);

  /* --- DREI ZUSTAENDE STATT ZWEI -----------------------------------------
   * "behoben" ist ein eigener Zustand mit eigenem Ankreuzfeld und nicht mehr
   * ein Sonderfall von "Mängel festgestellt". */
  const hatKeineMaengel = maengelZustand === MAENGEL_KEINE;
  const hatBehoben      = maengelZustand === MAENGEL_BEHOBEN;
  const hatMaengel      = maengelZustand === MAENGEL_OFFEN;

  /* Beanstandungen, die UNABHAENGIG von dieser Auswahl im Protokoll stehen.
   * Nur wenn keine davon uebrig ist, darf "behoben" positiv ausgehen - sonst
   * liesse sich der Widerspruch durch die Auswahl einfach umdrehen. */
  const gewaehrleistungVal = document.getElementById('res_gewaehrleistung')?.value || 'Ja';
  const anySichtNiO = Array.from(s).some(el => el?.value === 'n.i.O.');
  // "n.a." ist kein Befund und darf die Gesamtbewertung nicht kippen -
  // gezaehlt wird nur ein ausdrueckliches n.i.O.
  const anyErpNiO = Array.from(document.querySelectorAll('.erp-item')).some(el => el?.value === 'n.i.O.');
  /* Die N-PE-Spannung geht ebenfalls in die Gesamtbewertung ein - sie ist der
   * einzige Wert der Netzmessung, der eigenstaendig einen Fehler findet
   * (hochohmiger PEN, Fremdeinspeisung) - am Buehnenverteiler ist das
   * lebensgefaehrlich. */
  const restBeanstandungen = !isBlank && (gewaehrleistungVal === 'Nein' || anySichtNiO || anyErpNiO ||
                             anyMeasurementOut || isErdungOut || isNpeOut);
  const behobenTrotzOffener = hatBehoben && restBeanstandungen;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Prüfergebnis:", PDF_MARGIN_LEFT + 3, finalY + offErgebnis);
  drawCheckbox(doc, 44, finalY + offErgebnis, "Keine Mängel festgestellt", !isBlank && hatKeineMaengel);
  drawCheckbox(doc, 92, finalY + offErgebnis, "Mängel behoben, Nachprüfung i.O.", !isBlank && hatBehoben, behobenTrotzOffener);
  drawCheckbox(doc, 156, finalY + offErgebnis, "Mängel festgestellt", !isBlank && hatMaengel, true);

  const terminVal = document.getElementById('res_termin_date')?.value || "";
  let terminText = "";
  if (!isBlank && terminVal) {
    const parts = terminVal.split('-');
    terminText = parts.length === 2 ? `${parts[1]} / ${parts[0]}` : terminVal;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  drawFeldZeile(doc, "Nächster Prüftermin (Monat / Jahr):", terminText, PDF_MARGIN_LEFT + 3, finalY + offTermin, 90, isBlank);

  // Die Prüfplakette steht jetzt in dieser Zeile: die Ergebniszeile darueber
  // braucht die volle Breite fuer das dritte Ankreuzfeld ("Mängel behoben").
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Prüfplakette erteilt:", 120, finalY + offTermin);
  drawCheckbox(doc, 150, finalY + offTermin, "Ja", !isBlank && document.getElementById('res_plakette')?.value === "Ja");
  drawCheckbox(doc, 162, finalY + offTermin, "Nein", !isBlank && document.getElementById('res_plakette')?.value === "Nein", true);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("Bemerkungen / Mängel:", PDF_MARGIN_LEFT + 3, finalY + offBemLabel);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  if (isBlank || splitBemerkung.length === 0) {
    drawSchreibLinien(doc, PDF_MARGIN_LEFT + 3, finalY + offBemStart + 1, 177, bemZeilen, 4.2);
  } else {
    doc.text(splitBemerkung, PDF_MARGIN_LEFT + 3, finalY + offBemStart);
  }

  // DER FREIGABETEXT DARF NUR ERSCHEINEN, WENN TATSÄCHLICH ALLES I.O. IST –
  // BEI MÄNGELN, SICHERHEITSRISIKO ODER N.I.O.-ERGEBNISSEN MUSS EINE WARNUNG STEHEN
  /* Ein "behoben" mit noch offenen roten Werten bleibt ein Mangelprotokoll -
   * sonst koennte man den Widerspruch einfach in die andere Richtung erzeugen. */
  const hasIssues = !isBlank && (hatMaengel || restBeanstandungen);
  const behobenOk = !isBlank && hatBehoben && !restBeanstandungen;

  // Kein Dokument, das gleichzeitig "Ja" ankreuzt und "NICHT gewährleistet" schreibt.
  if (freigabeWidersprichtBefund(isBlank, hasIssues, gewaehrleistungVal)) {
    alert(freigabeWiderspruchHinweis('Sicherer Gebrauch gewährleistet'));
    document.getElementById('res_gewaehrleistung')?.focus();
    return;
  }

  // Dieselbe Logik fuer die Pruefplakette: sie ist das Einzige, was an der
  // Anlage sichtbar bleibt, wenn das Protokoll im Ordner liegt.
  if (plaketteWidersprichtBefund(isBlank, hasIssues, document.getElementById('res_plakette')?.value)) {
    alert(plaketteWiderspruchHinweis());
    document.getElementById('res_plakette')?.focus();
    return;
  }

  const complianceText = isBlank
    // Im Leerformular waere die Konformitaetsaussage eine unbelegte Behauptung -
    // dort steht nur der Hinweis, dass sie nach der Pruefung anzukreuzen ist.
    ? "Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen."
    : hasIssues
      ? "ACHTUNG: Es wurden Mängel, unzulässige Messwerte, ein n.i.O.-Ergebnis bei Sicht-/Funktionsprüfung oder ein Sicherheitsrisiko festgestellt. Die elektrische Anlage entspricht in diesem Zustand NICHT den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch ist NICHT gewährleistet, bis die genannten Mängel behoben und erneut geprüft wurden."
      : behobenOk
        ? MAENGEL_BEHOBEN_TEXT_ANLAGE
        : "Die elektrische Anlage entspricht den anerkannten Regeln der Elektrotechnik. Ein sicherer Gebrauch bei bestimmungsgemäßer Anwendung ist gewährleistet.";

  // Fehlende Angaben anhaengen, statt sie nur rot in der Tabelle zu zeigen.
  const complianceGesamt = complianceText +
    (!isBlank && anyDokumentationsmangel ? DOKU_MANGEL_ZUSATZ : '');

  /* Derselbe Grund wie oben, hier aber mit groesserer Wirkung: der Warntext
   * bei Maengeln wird FETT gesetzt und ist damit rund 7 % breiter als in
   * normaler Schrift. Gemessen in normaler Schrift ergaben sich Zeilen von
   * 202 mm - bei 10 mm linkem Rand 2 mm ueber die Papierkante hinaus. Im PDF
   * fehlten dadurch die letzten Zeichen ausgerechnet in dem Satz, der die
   * Nichtfreigabe ausspricht. Schrift deshalb VOR splitTextToSize setzen. */
  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  const complianceLines = doc.splitTextToSize(complianceGesamt, PDF_CONTENT_WIDTH);

  // Bedarf fuer Bestaetigungszeile + Hinweistext + Unterschriftenblock exakt
  // ausrechnen, damit nur dann umgebrochen wird, wenn es wirklich nicht passt.
  const abschlussHoehe = 4 + complianceLines.length * 3.2 + 2 + 16;
  finalY += boxHeight + 5;
  /* 4.6.0: Im Leerformular darf der Abschlussblock nicht nur bis
   * PDF_CONTENT_BOTTOM reichen, sondern muss VOR der Fussnotenzeile enden -
   * sonst ueberschreiben sich Unterschriftenzeile und Fussnoten (siehe
   * leerFussOben() in pdf-utils.js). Ohne diese Pruefung passte der Block
   * nach dem Vergroessern der Stammdaten-Zeilen (Sektion 1) rechnerisch noch
   * auf Blatt 1, kollidierte dort aber mit der Legende. */
  if (isBlank) {
    const fussGrenze = leerFussOben(doc, [LEER_BEISPIEL_TEXT_VDE, LEER_SOLLWERTE_VDE, LEER_LEGENDE_VDE]) - 2;
    if (finalY + abschlussHoehe > fussGrenze) {
      doc.addPage();
      finalY = PDF_CONTENT_TOP;
    }
  } else {
    finalY = pdfPlatzPruefen(doc, finalY, abschlussHoehe);
  }

  // GEWÄHRLEISTUNG & UNTERSCHRIFTEN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Sicherer Gebrauch gewährleistet:", PDF_MARGIN_LEFT, finalY);
  // 4.7.0: um 10 mm nach rechts verschoben (Locherrand, PDF_MARGIN_LEFT jetzt 20 mm).
  drawCheckbox(doc, 68, finalY, "Ja (Anlage entspricht VDE-Regeln)", !isBlank && gewaehrleistungVal === "Ja");
  drawCheckbox(doc, 125, finalY, "Nein (Sicherheitsrisiko)", !isBlank && gewaehrleistungVal === "Nein", true);

  doc.setFont("helvetica", hasIssues ? "bold" : "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...(hasIssues ? redCellText : [71, 85, 105]));
  doc.text(complianceLines, PDF_MARGIN_LEFT, finalY + 4);
  doc.setTextColor(...textColor);

  finalY += 4 + complianceLines.length * 3.2 + 2;

  // ORT UND DATUM DER UNTERZEICHNUNG (Datum kommt jetzt aus dem Formularfeld
  // 'unterschrift_datum'; frueher stand dort immer eine leere Linie)
  const ortDatum = isBlank
    ? '________________, den ____________'
    : (unterschriftDatum ? `${ort}, den ${unterschriftDatum}` : `${ort}, den ____________`);

  if (!isBlank && !padPruefer.isEmpty()) {
    // 4.7.0: x=10 -> PDF_MARGIN_LEFT (20 mm, Locherrand).
    doc.addImage(padPruefer.toDataURL('image/png'), 'PNG', PDF_MARGIN_LEFT, finalY, 38, 12);
  }
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(PDF_MARGIN_LEFT, finalY + 12, PDF_MARGIN_LEFT + 80, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textColor);
  doc.text(`${ortDatum} - Unterschrift Prüfer/-in`, PDF_MARGIN_LEFT, finalY + 15);

  if (!isBlank && !padKunde.isEmpty()) {
    doc.addImage(padKunde.toDataURL('image/png'), 'PNG', 115, finalY, 38, 12);
  }
  doc.line(115, finalY + 12, 200, finalY + 12);
  doc.text(`${ortDatum} - Unterschrift Auftraggeber/Betreiber`, 115, finalY + 15);

  /* Fussbereich von Blatt 1: Musterangabe, Sollwerte der Netzmessung und
   * Legende. 4.5.0 (C4): 6 pt statt 4,6 pt, von unten nach oben gesetzt.
   * Die Legende steht jetzt zusaetzlich auf jedem Fortsetzungsblatt. */
  if (isBlank) {
    doc.setPage(1);
    drawLeerFuss(doc, [LEER_BEISPIEL_TEXT_VDE, LEER_SOLLWERTE_VDE, LEER_LEGENDE_VDE]);
  }

  /* --- FORTSETZUNGSBLAETTER DES LEERFORMULARS ----------------------------
   * Nur die Messtabelle, mit fortlaufender Nummerierung. Kopfdaten,
   * Besichtigung, Erproben, Gesamtbewertung und Unterschriften stehen genau
   * einmal auf Blatt 1 - sonst waeren es formal mehrere Protokolle fuer
   * dieselbe Anlage. Die Seitenzahl in der Kopfbox ("Seite 2 von 3") stimmt
   * dadurch automatisch; eine Blattzaehlung von Hand entfaellt. */
  if (isBlank && blaetter > 1) {
    let laufendeNr = LEER_ZEILEN_BLATT1 + 1;
    for (let blatt = 2; blatt <= blaetter; blatt++) {
      doc.addPage();
      // Titel und Trennlinie setzt drawProtokollSeitenkoepfe() weiter unten.
      let yy = PDF_CONTENT_TOP;
      drawKategorieTitel(doc, `FORTSETZUNG DER MESSTECHNISCHEN PRÜFUNGEN (BLATT ${blatt} VON ${blaetter})`, yy, 'messen');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...PDF_MUTED);
      doc.text('Gehört zum Protokoll mit der oben stehenden Protokoll-Nr. Kopfdaten, Besichtigen, Erproben, ' +
               'Gesamtbewertung und Unterschriften stehen auf Blatt 1.', PDF_MARGIN_LEFT, yy + 3.4);
      doc.setTextColor(...PDF_TEXT);

      const folgeZeilen = [];
      for (let i = 0; i < LEER_ZEILEN_FOLGE; i++) {
        folgeZeilen.push([laufendeNr++, "", "", "", "", "", "", "", "", "", ""]);
      }
      doc.autoTable(mitFormelHooks(doc, {
        startY: yy + 5,
        head: LEER_HEAD_VDE,
        body: folgeZeilen,
        columnStyles: LEER_SPALTEN_VDE,
        ...tabellenStil
      }));

      /* 4.5.0 (C4): Legende auch auf dem Fortsetzungsblatt. Es traegt denselben
       * Tabellenkopf mit denselben Formelzeichen - ohne Erklaerung war es fuer
       * Auszubildende im ersten Lehrjahr nicht ausfuellbar. */
      drawLeerFuss(doc, [LEER_LEGENDE_VDE]);
    }
  }

  // KOPF DER FOLGESEITEN + INFOBOX MIT SEITENZAHL + REVISIONSVERMERK
  drawProtokollSeitenkoepfe(doc, {
    ...VDE0100_KOPF, protokollNr: kopfProtokollNr, pruefNr: kopfPruefNr, datum, revision: FORMULAR_REVISION
  });

  const filename = isBlank
    ? `VDE_0100_Pruefprotokoll_Leerformular.pdf`
    : `Pruefprotokoll_${protokollNr}_${(datum || '').replace(/\./g, '-')}.pdf`;

  /* Die Nummer wird ERST JETZT verbraucht - und nur, wenn wirklich eine Datei
   * entstanden ist. Ein abgebrochener Teilen-Dialog kostet keine Nummer,
   * ein Leerformular ebenfalls nicht. */
  Promise.resolve(savePdfCompatible(doc, filename, archivMetaSammeln('PR', nummerRoh, filename, isBlank)))
    .then(function (gespeichert) {
    if (isBlank || gespeichert === false) return;
    // Verbraucht/markiert NUR die soeben erstellte Nummer als vergeben
    // (wichtig fuer die Doppelvergabe-Pruefung). Der Protokollzaehler selbst
    // wird erst hochgezaehlt, wenn tatsaechlich ein neues Formular angelegt
    // wird (siehe nachPdfNeuesFormularAnbieten in storage.js) - das Formular
    // bleibt nach dem PDF weiterhin bearbeitbar, ein erneuter Export ersetzt
    // einfach die gerade heruntergeladene Datei (gleicher Dateiname).
    verbraucheProtokollNummer(nummerRoh, 'PR');
    nachPdfNeuesFormularAnbieten('PR', nummerRoh, resetVdeForm, clearAutosave, function () {
      AKTUELLER_ENTWURF_ID = neuenEntwurfAnlegen('PR');
    });
  });
}

function initSignaturePads() {
  return {
    pruefer: setupSignatureCanvas('sigPruefer'),
    kunde: setupSignatureCanvas('sigKunde')
  };
}

// AUTOSAVE DES AKTUELLEN FORMULARS (localStorage), DAMIT EIN VERSEHENTLICHER
// RELOAD NICHT ALLE BEREITS EINGETRAGENEN MESSWERTE VERWIRFT
// Einheitliches Praefix 'vde_' fuer ALLE Autosave-Schluessel, damit die
// Datensicherung sie zuverlaessig erfasst (migriereAutosaveSchluessel in
// storage.js benennt vorhandene Staende beim Start um).
//
// 4.7.0: Statt EINES festen Schluessels ('vde_autosave_pr') fuehrt jeder
// EntwurF (siehe entwuerfe.js) seinen eigenen Autosave-Stand. AUTOSAVE_KEY
// ist damit keine Konstante mehr, sondern zeigt immer auf den Autosave-Key
// des gerade AKTIVEN Entwurfs - dadurch koennen mehrere Pruefungen parallel
// offen sein (z. B. zwei Anschlussstellen), ohne sich gegenseitig zu
// ueberschreiben.
entwurfAusUrlUebernehmen('PR');
let AKTUELLER_ENTWURF_ID = aktivenEntwurfSicherstellen('PR', 'vde_autosave_pr');
function AUTOSAVE_KEY_AKTUELL() { return autosaveKeyFuerEntwurf('PR', AKTUELLER_ENTWURF_ID); }

const AUTOSAVE_FIELD_IDS = [
  'auftraggeber', 'pruefungsnummer', 'pruefer', 'datum', 'pruefnorm', 'pruefgrund', 'netzsystem',
  'netzspannung', 'netzfrequenz', 'einspeisung', 'hausanschluss', 'vnb', 'messgeraet', 'seriennummer',
  'u_l1n', 'u_l2n', 'u_l3n', 'u_l12', 'u_l23', 'u_l13', 'u_npe',
  'anschluss_typ', 'anschluss_leiter', 'anschluss_qs',
  'erdung_re', 'erdung_messpunkt',
  'pruefumfang',
  'res_maengel', 'res_plakette', 'res_termin_date', 'res_gewaehrleistung',
  'res_bemerkungen', 'unterschrift_ort', 'unterschrift_datum', 'protokollnummer'
];

function collectProtocolState() {
  const state = { fields: {} };
  AUTOSAVE_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) state.fields[id] = el.value;
  });

  state.anlage_bez = document.getElementById('anlage_bez').value;
  state.gebaeude = document.getElementById('gebaeude_custom').value;
  state.sicht = Array.from(document.querySelectorAll('.sicht-item')).map(s => s.value);
  // Erproben laeuft jetzt ueber .erp-item statt ueber feste IDs - so wachsen
  // neue Pruefpunkte automatisch in Autosave und Sicherung mit.
  state.erproben = {};
  document.querySelectorAll('.erp-item').forEach(el => { state.erproben[el.id] = el.value; });

  state.circuits = Array.from(document.querySelectorAll('.circuit-card')).map(card => ({
    bez: card.querySelector('.c-bez').value,
    kabel: card.querySelector('.c-kabel-typ').value,
    leiter: card.querySelector('.c-leiter').value,
    qs: card.querySelector('.c-querschnitt').value,
    rpe: card.querySelector('.c-rpe').value,
    riso_mode: card.querySelector('.c-riso-mode').value,
    riso: card.querySelector('.c-riso').value,
    sich: card.querySelector('.c-sich-typ').value,
    zs: card.querySelector('.c-zs').value,
    ik: card.querySelector('.c-ik').value,
    zln: card.querySelector('.c-zln').value,
    ik2: card.querySelector('.c-ik2').value,
    rcd_typ: card.querySelector('.c-rcd-typ').value,
    rcd_idn: card.querySelector('.c-rcd-idn').value,
    rcd_imess: card.querySelector('.c-rcd-imess').value,
    rcd_ta: card.querySelector('.c-rcd-ta').value,
    rcd_pruefstrom: card.querySelector('.c-rcd-pruefstrom').value,
    art: card.querySelector('.c-spannung-art').value,
    gefaehrdung: card.querySelector('.c-gefaehrdung').value,
    umess: card.querySelector('.c-umess').value,
    totgelegt: istTotgelegt(card.querySelector('.c-totgelegt')),
    totlegung_grund: card.querySelector('.c-totlegung-grund')?.value || ''
  }));

  return state;
}

function restoreProtocolState(state) {
  if (!state) return false;

  Object.entries(state.fields || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Ein wiederhergestelltes Formular behaelt SEINE Protokollnummer. Nur wenn
    // im Zwischenstand keine steht, bleibt der Vorschlag von
    // initProtokollNummer() erhalten - sonst stuende dort ploetzlich nichts.
    if (id === 'protokollnummer' && !String(val || '').trim()) return;
    /* Eine aus dem Archiv uebernommene Vorlage enthaelt bewusst KEIN Datum
     * (das gehoert zur neuen Pruefung). Der leere Wert darf die Vorbelegung
     * mit dem heutigen Datum bzw. dem Folgetermin nicht ueberschreiben -
     * sonst entstuende ein fertiges Protokoll ohne Pruefdatum. */
    if ((id === 'datum' || id === 'unterschrift_datum' || id === 'res_termin_date') &&
        !String(val || '').trim()) return;
    /* BUGFIX: Ein leerer Wert in einem Stammdatenfeld (Hausanschluss,
     * Seriennummer, ...) darf nicht den Wert ueberschreiben, den
     * applyMasterDataToForm() gerade eben aus den zentralen Stammdaten
     * gesetzt hat - sonst verschwindet z. B. der Hausanschluss wieder,
     * sobald ein aelterer Autosave-Stand restauriert wird, der dieses Feld
     * noch leer hatte. Ein tatsaechlich GEFUELLTER Autosave-Wert setzt sich
     * weiterhin durch (das aktuelle Formular hat Vorrang vor den
     * Stammdaten). */
    if (MASTERDATA_FIELD_IDS.includes(id) && !String(val || '').trim()) return;
    el.value = val;
  });

  if (state.anlage_bez !== undefined) {
    const ta = document.getElementById('anlage_bez');
    ta.value = state.anlage_bez;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  // Mitwachsende Textfelder nach dem Wiederherstellen auf Inhaltshoehe bringen
  ['res_bemerkungen'].forEach(id => {
    const ta = document.getElementById(id);
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  });

  if (state.gebaeude) syncGebaeudeSelect(state.gebaeude);
  validateErdung();

  const sichtEls = document.querySelectorAll('.sicht-item');
  (state.sicht || []).forEach((val, i) => { if (sichtEls[i]) sichtEls[i].value = val; });

  Object.entries(state.erproben || {}).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && el.classList.contains('erp-item')) el.value = val;
  });
  updateEinspeisung();
  validateNetzmessung();

  if (state.circuits && state.circuits.length) {
    document.getElementById('circuitsContainer').innerHTML = '';
    cardCounter = 0;
    state.circuits.forEach(c => addCircuitCard(c));
  }

  return true;
}

function autosaveProtocol() {
  try {
    localStorage.setItem(AUTOSAVE_KEY_AKTUELL(), JSON.stringify(collectProtocolState()));
    entwurfMerken('PR', AKTUELLER_ENTWURF_ID, {
      protokollnummer: document.getElementById('protokollnummer')?.value || '',
      bezeichnung: entwurfBezeichnung('PR', () => ({
        anlage: document.getElementById('anlage_bez')?.value,
        gebaeude: document.getElementById('gebaeude_custom')?.value
      }))
    });
  } catch (e) {}
}

function loadAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY_AKTUELL());
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY_AKTUELL());
  entwurfEntfernen(AKTUELLER_ENTWURF_ID);
}

// SETZT DAS GESAMTE FORMULAR AUF DEN AUSGANGSZUSTAND ZURÜCK (FÜR "NEUES FORMULAR")
function resetVdeForm() {
  document.getElementById('vdeForm').reset();

  // Lokales Datum, siehe heuteIso() in pdf-utils.js
  datumsfeldAufHeute('datum');
  datumsfeldAufHeute('unterschrift_datum');
  document.getElementById('res_termin_date').value = monatIsoInJahren(1);

  document.getElementById('anlage_bez').style.height = 'auto';
  document.getElementById('res_bemerkungen').style.height = 'auto';

  applyMasterDataToForm();

  document.getElementById('circuitsContainer').innerHTML = '';
  cardCounter = 0;
  addCircuitCard();
  addCircuitCard();

  if (typeof padPruefer !== 'undefined' && padPruefer) padPruefer.clear();
  if (typeof padKunde !== 'undefined' && padKunde) padKunde.clear();
}