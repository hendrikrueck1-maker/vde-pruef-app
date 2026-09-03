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
 * ========================================================================== */
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
