/* ============================================================================
 *  PFLICHTFELD-KENNZEICHNUNG
 * ----------------------------------------------------------------------------
 *  Markiert alle fuer den PDF-Export tatsaechlich verpflichtenden Felder
 *  gelblich, solange sie leer sind - und schaltet sie automatisch auf einen
 *  dezenten Gruenton, sobald sie ausgefuellt wurden (siehe .pflichtfeld-leer
 *  / .pflichtfeld-ok in style.css). VORHER fiel eine fehlende Pflichtangabe
 *  erst beim Klick auf "PDF generieren" auf (Alert-Dialog mit Fokussprung) -
 *  jetzt ist auf einen Blick erkennbar, was noch offen ist, waehrend man das
 *  Formular ausfuellt.
 *
 *  WICHTIG: das ist eine reine Anzeige-Hilfe. Die eigentliche, verbindliche
 *  Pruefung bleibt weiterhin die bestehende Abbruchlogik beim PDF-Export
 *  (erstesLeerePflichtfeld / ersteLeereAuswahl in pdf-utils.js) - diese
 *  Datei aendert daran nichts, sie zeigt nur denselben Sachverhalt frueher an.
 *
 *  initPflichtfelder(cfg) wird von jeder Formularseite mit ihrer eigenen
 *  Feldliste aufgerufen:
 *    cfg.ids       Array einfacher Pflichtfeld-IDs (Text-/Datumsfelder)
 *    cfg.auswahl   Array von CSS-Selektoren fuer Pflicht-Auswahlfelder
 *                  (z. B. '.sicht-item') - werden als leer gewertet, wenn sie
 *                  auf ihrem allerersten <option>-Wert stehen UND dieser
 *                  Wert nicht sinnvoll vorbelegt ist (siehe markiereAuswahl).
 *    cfg.bedingt   optional: Funktion, die weitere, nur UNTER BESTIMMTEN
 *                  BEDINGUNGEN pflichtige Feld-IDs liefert (z. B. Frequenz
 *                  nur bei Netzersatzanlage) - wird bei jeder Aktualisierung
 *                  neu ausgewertet.
 *    cfg.karten    optional (4.7.0): Array von { selektor, felder } fuer
 *                  Pflichtfelder INNERHALB dynamisch angelegter Karten (z. B.
 *                  ein Stromkreis) - selektor waehlt die Karte (z. B.
 *                  '.circuit-card'), felder ist ein Array von CSS-Selektoren
 *                  fuer die darin liegenden Pflichtfelder (z. B. '.c-zs').
 *                  Wird bei jeder Aktualisierung UND bei jeder Kartenaenderung
 *                  neu ausgewertet (derselbe MutationObserver wie unten).
 *    cfg.alleFelder  optional (4.7.1): true markiert NICHT nur die oben
 *                  einzeln gelisteten echten Pflichtfelder, sondern JEDES
 *                  ausfuellbare Feld im gesamten Formular gelb/gruen - auch
 *                  optionale. Zweck ist reine Fortschrittsanzeige ("wo habe
 *                  ich schon etwas eingetragen, wo noch nicht"), nicht mehr
 *                  nur die Kennzeichnung export-kritischer Felder. Aus der
 *                  automatischen Erfassung ausgenommen: readonly-Felder
 *                  (berechnete Werte, z. B. U_L max.), Suchfelder und
 *                  Datei-Uploads. Ein Feld, das schon eine eigene rote
 *                  "falscher Wert"-Kennzeichnung hat (z. B. .out-of-norm),
 *                  bleibt trotzdem gelb/gruen UNTER der roten Markierung -
 *                  die CSS-Vorrangregel (Rot vor Gruen) sorgt weiterhin
 *                  dafuer, dass ein falscher Wert nie gruen erscheint. */
function initPflichtfelder(cfg) {
  function markiereFeld(el) {
    if (!el) return;
    const leer = String(el.value || '').trim() === '';
    el.classList.toggle('pflichtfeld-leer', leer);
    el.classList.toggle('pflichtfeld-ok', !leer);
  }

  function aktualisiereAlle() {
    (cfg.ids || []).forEach(id => markiereFeld(document.getElementById(id)));
    if (typeof cfg.bedingt === 'function') {
      (cfg.bedingt() || []).forEach(id => markiereFeld(document.getElementById(id)));
    }
    (cfg.auswahl || []).forEach(sel => {
      document.querySelectorAll(sel).forEach(el => markiereFeld(el));
    });
    (cfg.karten || []).forEach(({ selektor, felder }) => {
      document.querySelectorAll(selektor).forEach(karte => {
        (felder || []).forEach(feldSel => {
          karte.querySelectorAll(feldSel).forEach(el => markiereFeld(el));
        });
      });
    });
    if (cfg.alleFelder) {
      const form = document.querySelector('form') || document;
      form.querySelectorAll(
        'input[type="text"]:not([readonly]), input[type="date"]:not([readonly]), ' +
        'input[inputmode="decimal"]:not([readonly]), input:not([type]):not([readonly]), ' +
        'select, textarea'
      ).forEach(el => {
        if (el.type === 'search' || el.type === 'file' || el.type === 'hidden') return;
        markiereFeld(el);
      });
    }
  }

  aktualisiereAlle();
  document.addEventListener('input', aktualisiereAlle);
  document.addEventListener('change', aktualisiereAlle);

  // Neue Karten (Stromkreis/Übergabepunkt/Gerät hinzugefügt, oder ein
  // Zwischenstand wiederhergestellt) können neue Pflicht-Auswahlfelder
  // mitbringen (z. B. .sicht-item in einer neuen Karte gibt es hier nicht,
  // aber .c-riso-mode o.ä. in Zukunft) - ein MutationObserver haelt das
  // unabhaengig vom naechsten Tastendruck aktuell.
  const beobachtete = ['circuitsContainer', 'feedsContainer', 'devicesContainer'];
  beobachtete.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(aktualisiereAlle).observe(el, { childList: true, subtree: true });
  });
}
