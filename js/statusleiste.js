/* ============================================================================
 *  STATUS-KOPFLEISTE
 * ----------------------------------------------------------------------------
 *  Zeigt jederzeit sichtbar: Anlage/Gebäude/Bezeichnung sowie eine
 *  Orientierung, in welchem ABSCHNITT des Gesamtprotokolls man sich gerade
 *  befindet - z. B. "Stammdaten" ganz am Anfang, "Stromkreis 3 von 12"
 *  waehrend man Kreise/Geraete/Zuleitungen bearbeitet, oder
 *  "Gesamtbewertung" gegen Ende. Ohne diese Leiste war bei einem langen
 *  Formular mit vielen Karten nach dem Scrollen nicht mehr auf den ersten
 *  Blick zu sehen, wo man sich gerade befindet.
 *
 *  6.2.0 (Feature E): Die Prüfprotokollnummer wurde aus der Leiste entfernt -
 *  sie bleibt ein ganz normales Formularfeld, ist aber nicht mehr staendig
 *  sichtbar. Stattdessen zeigt die Leiste jetzt zusaetzlich die grobe
 *  Abschnitts-Position im GESAMTEN Formular, nicht nur "Stromkreis X von Y"
 *  waehrend man in den Karten ist: davor z. B. "Stammdaten", danach z. B.
 *  "Gesamtbewertung" - ueber cfg.abschnitte (siehe initStatusleiste-Aufruf
 *  in vde0100.html/anschlusspruefung.html/geraetepruefung.html), da die drei
 *  Formulare unterschiedliche Abschnittsfolgen haben.
 *
 *  4.7.1: Die Karten-Anzeige folgt jetzt nicht mehr nur dem Tastaturfokus
 *  (Klick/Tab in ein Feld), sondern zusaetzlich einem IntersectionObserver,
 *  der beim reinen Scrollen erkennt, welche Karte bzw. welcher Abschnitt
 *  gerade oben im sichtbaren Bereich steht - man sieht also jederzeit, "wo
 *  man ist", auch ohne irgendein Feld anzuklicken.
 *
 *  initStatusleiste(cfg) wird von jeder Formularseite mit ihren eigenen
 *  Feld-IDs und ihrem Karten-/Abschnitts-Selektor aufgerufen - siehe Aufruf
 *  am Ende von vde0100.html / anschlusspruefung.html / geraetepruefung.html.
 * ========================================================================== */
function initStatusleiste(cfg) {
  const leiste = document.createElement('div');
  leiste.className = 'status-leiste';
  leiste.innerHTML =
    '<span class="sl-typ">' + (cfg.typLabel || '') + '</span>' +
    '<span class="sl-trenner" id="sl_trenner_bez">·</span>' +
    '<span class="sl-bez" id="sl_bez"></span>' +
    '<span class="sl-kreis" id="sl_kreis"></span>';

  const form = document.querySelector('form') || document.body;
  form.parentNode.insertBefore(leiste, form);

  const bezEl = leiste.querySelector('#sl_bez');
  const trennerBezEl = leiste.querySelector('#sl_trenner_bez');
  const kreisEl = leiste.querySelector('#sl_kreis');

  function aktualisiereKopf() {
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
    kreisEl.dataset.quelle = 'karte';
  }

  /* ABSCHNITTS-ORIENTIERUNG (6.2.0, Feature E)
   * ---------------------------------------------------------------------
   * cfg.abschnitte: Liste von { selector, label }, in Reihenfolge des
   * jeweiligen Formulars (die drei Formulare haben unterschiedliche
   * Abschnittsfolgen, siehe initStatusleiste-Aufruf pro Formularseite).
   * "selector" zeigt auf die <h2>-Ueberschrift jedes Abschnitts. Bei jedem
   * Scroll-Ereignis wird neu bestimmt, welche Ueberschrift den oberen Rand
   * des sichtbaren Bereichs zuletzt ueberschritten hat - das ist der
   * "aktuelle Abschnitt" (Details siehe abschnittNeuBerechnen() unten).
   * Zeigt die Leiste gerade eine konkrete Karte (Stromkreis/Geraet/
   * Zuleitung) an, hat diese Anzeige Vorrang - der Abschnittsname erscheint
   * nur ausserhalb von Karten. */
  let aktuellerAbschnitt = '';
  function abschnittAnzeigenFallsKeineKarte() {
    if (kreisEl.dataset.quelle === 'karte' && kreisEl.textContent) return;
    kreisEl.textContent = aktuellerAbschnitt;
    kreisEl.dataset.quelle = 'abschnitt';
  }

  if (Array.isArray(cfg.abschnitte) && cfg.abschnitte.length) {
    const eintraege = cfg.abschnitte
      .map(a => ({ el: document.querySelector(a.selector), label: a.label }))
      .filter(a => a.el);

    if (eintraege.length) {
      /* Von allen Abschnitts-Ueberschriften diejenige bestimmen, die den
       * oberen Rand (knapp unter der fixen Leiste) zuletzt ueberschritten
       * hat - das ist der "aktuelle" Abschnitt. Bewusst als einfache
       * Neuberechnung ueber ALLE Ueberschriften bei jedem Scroll-Ereignis
       * statt per IntersectionObserver-Delta: bei kurzen Formularen (wenige
       * Karten, z. B. Anschlusspruefung/Geraetepruefung mit nur 1-2 Karten)
       * liegen mehrere Ueberschriften nah beieinander und ein einzelner
       * grosser Scroll-Sprung (scrollIntoView(), schnelles Wischen) kann
       * mehrere davon in einem Schritt "uebergehen", ohne dass der
       * IntersectionObserver fuer jede einzelne ein eigenes
       * Sichtbarkeits-Wechsel-Ereignis liefert. Die Neuberechnung ist
       * bewusst billig (ein paar getBoundingClientRect()-Aufrufe) und wird
       * per requestAnimationFrame entprellt. */
      function abschnittNeuBerechnen() {
        // Ganz nach unten gescrollt (Ende des Formulars erreicht): der
        // letzte Abschnitt gilt immer, auch wenn dessen Ueberschrift wegen
        // wenig Restinhalt darunter (kurzes Formular, z. B. Anschluss-/
        // Geraeteprüfung mit nur 1-2 Karten) rechnerisch nie ueber die
        // Schwelle hinausscrollt.
        const amEnde = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2);
        if (amEnde) {
          aktuellerAbschnitt = eintraege[eintraege.length - 1].label;
          abschnittAnzeigenFallsKeineKarte();
          return;
        }
        let aktuelle = eintraege[0];
        eintraege.forEach(function (eintrag) {
          if (eintrag.el.getBoundingClientRect().top <= 56) aktuelle = eintrag;
        });
        aktuellerAbschnitt = aktuelle.label;
        abschnittAnzeigenFallsKeineKarte();
      }

      let abschnittTicking = false;
      function abschnittTaktPlanen() {
        if (abschnittTicking) return;
        abschnittTicking = true;
        requestAnimationFrame(function () {
          abschnittNeuBerechnen();
          abschnittTicking = false;
        });
      }
      window.addEventListener('scroll', abschnittTaktPlanen, { passive: true });
      window.addEventListener('resize', abschnittTaktPlanen);

      // Anfangszustand direkt berechnen, bevor ueberhaupt gescrollt wurde.
      abschnittNeuBerechnen();
    }
  }

  // Sobald der Fokus eine Karte verlaesst (z. B. Klick in ein Stammdaten-Feld
  // nach vorherigem Kartenfokus), soll wieder der Abschnittsname greifen
  // statt der zuletzt angezeigten Karte.
  function aktualisiereKreisOderAbschnitt(ziel) {
    if (cfg.kartenSelector) {
      const karte = ziel && ziel.closest ? ziel.closest(cfg.kartenSelector) : null;
      if (karte) { aktualisiereKreis(ziel); return; }
    }
    kreisEl.dataset.quelle = '';
    abschnittAnzeigenFallsKeineKarte();
  }

  aktualisiereKopf();
  document.addEventListener('input', aktualisiereKopf);
  document.addEventListener('change', aktualisiereKopf);
  document.addEventListener('focusin', function (ev) { aktualisiereKreisOderAbschnitt(ev.target); });

  /* 6.2.0: Im Stromkreis-Karussell (vde0100.html) findet Navigation oft per
   * Wisch-/Pfeil-Geste statt, OHNE dass dabei ein Feld fokussiert wird - der
   * obige IntersectionObserver greift hier nicht zuverlaessig (er geht von
   * vertikalem Seitenscroll aus, das Karussell scrollt aber horizontal
   * innerhalb eines eigenen, schmalen Containers). js/karussell.js feuert
   * deshalb bei jedem Kartenwechsel ein 'vde:karussell-wechsel'-Event mit der
   * neu aktiven Karte im 'detail' - hier einfach denselben Kreis-Anzeige-Pfad
   * wie beim Fokuswechsel nutzen. */
  document.addEventListener('vde:karussell-wechsel', function (ev) {
    if (ev.detail && ev.detail.karte) aktualisiereKreis(ev.detail.karte);
  });

  /* [Nutzerwunsch] STATUSLEISTE VERSCHWINDET BEI GEOEFFNETER BILDSCHIRMTASTATUR
   * --------------------------------------------------------------------------
   *  "position: sticky" (siehe style.css) haelt die Leiste zuverlaessig oben,
   *  SOLANGE Layout- und sichtbarer (visueller) Bereich beim Scrollen
   *  gemeinsam wandern. Oeffnet sich auf einem Smartphone/Tablet die
   *  Bildschirmtastatur, verschieben iOS Safari und (je nach Geraet/Version)
   *  auch mobile Chrome-Varianten den TATSAECHLICH SICHTBAREN Ausschnitt
   *  (visualViewport) unabhaengig vom Scroll-Stand des Layout-Viewports nach
   *  oben, um das fokussierte Feld oberhalb der Tastatur einzublenden - der
   *  Scroll-Stand, auf den sich "sticky"/"fixed" beziehen, aendert sich dabei
   *  NICHT mit. Die Leiste bleibt also an ihrer Position im Layout-Viewport
   *  stehen, waehrend genau dieser Bereich durch die Tastatur-Verschiebung
   *  nicht mehr im sichtbaren Ausschnitt liegt - sie wirkt dadurch wie
   *  verschwunden, obwohl sie technisch weiterhin vorhanden ist.
   *
   *  Die window.visualViewport-API (breit unterstuetzt: iOS Safari ab 13,
   *  Chrome/Android seit Jahren) liefert genau diesen Versatz als
   *  "offsetTop". Ein einfaches translateY() um diesen Betrag gleicht ihn
   *  aus und haelt die Leiste exakt am oberen Rand des tatsaechlich
   *  sichtbaren Bereichs - beim normalen Scrollen (Tastatur geschlossen)
   *  bleibt offsetTop 0 und die Leiste verhaelt sich unveraendert wie zuvor. */
  if (window.visualViewport) {
    const vv = window.visualViewport;
    let taktGeplant = false;
    function statusleisteAnSichtbarenBereichAnpassen() {
      taktGeplant = false;
      leiste.style.transform = vv.offsetTop ? 'translateY(' + vv.offsetTop + 'px)' : '';
    }
    function taktPlanen() {
      // rAF buendelt mehrere schnell aufeinanderfolgende resize/scroll-
      // Ereignisse (z. B. waehrend der Tastatur-Einblendanimation) zu einem
      // Layout-Update statt bei jedem einzelnen Ereignis neu zu rechnen.
      if (taktGeplant) return;
      taktGeplant = true;
      requestAnimationFrame(statusleisteAnSichtbarenBereichAnpassen);
    }
    vv.addEventListener('resize', taktPlanen);
    vv.addEventListener('scroll', taktPlanen);
  }

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
      if (beste) {
        aktualisiereKreis(beste.target);
      } else {
        // Keine Karte mehr im Beobachtungsstreifen sichtbar (6.2.0, Feature E):
        // man hat den Kartenbereich beim Scrollen bereits verlassen (nach oben
        // in die Stammdaten oder nach unten in die Gesamtbewertung) - dann soll
        // wieder der Abschnittsname greifen statt der zuletzt gezeigten Karte.
        kreisEl.dataset.quelle = '';
        abschnittAnzeigenFallsKeineKarte();
      }
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
