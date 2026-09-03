/* ============================================================================
 *  STATUS-KOPFLEISTE
 * ----------------------------------------------------------------------------
 *  Zeigt jederzeit sichtbar: Protokollnummer, Anlage/Gebäude/Bezeichnung und -
 *  welche Stromkreis-/Geräte-/Zuleitungskarte gerade aktuell ist. Ohne diese
 *  Leiste war bei einem langen Formular mit vielen Karten nach dem Scrollen
 *  nicht mehr auf den ersten Blick zu sehen, in welchem Protokoll und in
 *  welchem Stromkreis man sich gerade befindet.
 *
 *  4.7.1: Die Karten-Anzeige folgt jetzt nicht mehr nur dem Tastaturfokus
 *  (Klick/Tab in ein Feld), sondern zusaetzlich einem IntersectionObserver,
 *  der beim reinen Scrollen erkennt, welche Karte gerade oben im sichtbaren
 *  Bereich steht - man sieht also jederzeit, "wo man ist", auch ohne
 *  irgendein Feld anzuklicken.
 *
 *  initStatusleiste(cfg) wird von jeder Formularseite mit ihren eigenen
 *  Feld-IDs und ihrem Karten-Selektor aufgerufen - siehe Aufruf am Ende von
 *  vde0100.html / anschlusspruefung.html / geraetepruefung.html.
 * ========================================================================== */
function initStatusleiste(cfg) {
  const leiste = document.createElement('div');
  leiste.className = 'status-leiste';
  leiste.innerHTML =
    '<span class="sl-typ">' + (cfg.typLabel || '') + '</span>' +
    '<span class="sl-trenner">·</span>' +
    '<span class="sl-nummer" id="sl_nummer">–</span>' +
    '<span class="sl-trenner" id="sl_trenner_bez">·</span>' +
    '<span class="sl-bez" id="sl_bez"></span>' +
    '<span class="sl-kreis" id="sl_kreis"></span>';

  const form = document.querySelector('form') || document.body;
  form.parentNode.insertBefore(leiste, form);

  const nummerEl = leiste.querySelector('#sl_nummer');
  const bezEl = leiste.querySelector('#sl_bez');
  const trennerBezEl = leiste.querySelector('#sl_trenner_bez');
  const kreisEl = leiste.querySelector('#sl_kreis');

  function aktualisiereKopf() {
    const nr = (document.getElementById(cfg.nummerFeldId)?.value || '').trim();
    nummerEl.textContent = nr || 'Neues Protokoll';

    const teile = (cfg.bezFeldIds || []).map(id => (document.getElementById(id)?.value || '').trim()).filter(Boolean);
    const bez = teile.join(' – ');
    bezEl.textContent = bez;
    trennerBezEl.style.display = bez ? '' : 'none';
  }

  function aktualisiereKreis(ziel) {
    if (!cfg.kartenSelector) return;
    const karte = ziel && ziel.closest ? ziel.closest(cfg.kartenSelector) : null;
    if (!karte) return; // Fokus ausserhalb einer Karte -> letzten Stand stehen lassen
    const label = karte.querySelector(cfg.kartenLabelSelector || '.circuit-header span, .feed-header span, .card-header span');
    kreisEl.textContent = label ? label.textContent.trim() : '';
  }

  aktualisiereKopf();
  document.addEventListener('input', aktualisiereKopf);
  document.addEventListener('change', aktualisiereKopf);
  document.addEventListener('focusin', function (ev) { aktualisiereKreis(ev.target); });

  /* Beim reinen Scrollen (ohne Klick/Fokus in ein Feld) soll die Anzeige
   * ebenfalls folgen: ein IntersectionObserver beobachtet alle Karten und
   * merkt sich, welche davon gerade den sichtbaren Bereich unmittelbar unter
   * der Statusleiste kreuzt. rootMargin schneidet den Beobachtungsstreifen
   * auf einen schmalen Bereich knapp unterhalb der (fixen) Leiste zusammen -
   * dadurch zaehlt die Karte, die man gerade tatsaechlich vor Augen hat,
   * nicht irgendeine, die nur teilweise unten ins Bild ragt. */
  let sichtbarkeitsObserver = null;
  function kartenBeobachten() {
    if (!cfg.kartenSelector) return;
    if (!('IntersectionObserver' in window)) return;
    if (sichtbarkeitsObserver) sichtbarkeitsObserver.disconnect();
    sichtbarkeitsObserver = new IntersectionObserver(function (entries) {
      // Von allen gerade im Beobachtungsstreifen sichtbaren Karten die oberste
      // (kleinster Abstand von oben) als "aktuelle" Karte uebernehmen.
      let beste = null;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!beste || entry.boundingClientRect.top < beste.boundingClientRect.top) beste = entry;
      });
      if (beste) aktualisiereKreis(beste.target);
    }, { root: null, rootMargin: '-56px 0px -70% 0px', threshold: 0 });
    document.querySelectorAll(cfg.kartenSelector).forEach(function (karte) {
      sichtbarkeitsObserver.observe(karte);
    });
  }
  kartenBeobachten();

  // Nach jedem Hinzufuegen/Entfernen/Wiederherstellen von Karten kann sich die
  // Zuordnung geaendert haben - MutationObserver haelt die Anzeige aktuell,
  // auch wenn kein Fokuswechsel stattfindet (z. B. nach addCircuitCard()), und
  // sorgt dafuer, dass neue/entfernte Karten auch vom Scroll-Beobachter oben
  // wieder korrekt erfasst werden.
  if (cfg.kartenContainerSelector) {
    const container = document.querySelector(cfg.kartenContainerSelector);
    if (container) {
      const obs = new MutationObserver(function () {
        if (document.activeElement) aktualisiereKreis(document.activeElement);
        kartenBeobachten();
      });
      obs.observe(container, { childList: true });
    }
  }
}
