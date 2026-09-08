/* ---------------------------------------------------------------------------
 *  HORIZONTALES STROMKREIS-KARUSSELL (6.2.0, Feature D)
 * ---------------------------------------------------------------------------
 *  Zeigt die Karten in #circuitsContainer als horizontal durchblaetterbares
 *  Karussell statt als lange vertikale Liste - sinnvoll bei vielen
 *  Stromkreisen (Praxis: teils 30-40+ pro Protokoll). Die Karten selbst
 *  werden weiterhin unveraendert von addCircuitCard()/removeCard()/
 *  dupliziereStromkreis() in js/pdf-generator.js verwaltet (appendChild/
 *  remove()) - dieses Skript aendert NUR Darstellung und Navigation:
 *
 *   - CSS scroll-snap (siehe css/style.css .karussell-track) sorgt fuer
 *     native Wisch-/Trackpad-Navigation auf Touch- und Desktop-Geraeten,
 *     ganz ohne JS.
 *   - Die Pfeil-Buttons (onclick="karussellSchritt(...)" in vde0100.html)
 *     scrollen jeweils eine Kartenbreite per scrollBy().
 *   - Ein MutationObserver auf dem Container aktualisiert den Positions-
 *     Indikator ("Stromkreis 3 von 12") bei jeder Aenderung der Kartenzahl
 *     (Hinzufuegen/Entfernen/Duplizieren/Wiederherstellen aus Entwurf) -
 *     dafuer muss an bestehenden Funktionen NICHTS geaendert werden.
 *   - Ein 'scroll'-Listener (entprellt per requestAnimationFrame) aktualisiert
 *     den Indikator zusaetzlich beim Wischen/Scrollen selbst.
 *
 *  Auf breiten Bildschirmen (Tablet quer, Desktop) erlaubt die CSS-Grid-
 *  Basis in .karussell-track zwei Karten nebeneinander (siehe Media Query) -
 *  die Snap-Logik hier arbeitet unveraendert kartenweise weiter.
 * ------------------------------------------------------------------------ */

function karussellAktiveKarte(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const karten = container.children;
  if (!karten.length) return null;
  const mitte = container.scrollLeft + container.clientWidth / 2;
  let beste = karten[0];
  let besterAbstand = Infinity;
  for (const karte of karten) {
    const kartenMitte = karte.offsetLeft + karte.offsetWidth / 2;
    const abstand = Math.abs(kartenMitte - mitte);
    if (abstand < besterAbstand) { besterAbstand = abstand; beste = karte; }
  }
  return beste;
}

function karussellIndikatorAktualisieren(containerId, eventMelden = true) {
  const container = document.getElementById(containerId);
  const indikator = document.getElementById(containerId + '_indikator');
  const punkteLeiste = document.getElementById(containerId + '_punkte');
  if (!container || !indikator) return;
  const anzahl = container.children.length;
  if (anzahl === 0) {
    indikator.textContent = '';
    indikator.style.display = 'none';
    if (punkteLeiste) { punkteLeiste.innerHTML = ''; punkteLeiste.style.display = 'none'; }
    return;
  }
  indikator.style.display = '';
  const aktive = karussellAktiveKarte(containerId);
  const index = aktive ? Array.prototype.indexOf.call(container.children, aktive) : 0;
  const cfg = (typeof KARTEN_NUMMERIERUNG !== 'undefined') ? KARTEN_NUMMERIERUNG['#' + containerId] : null;
  const praefix = cfg ? cfg.praefix : 'Karte';
  indikator.textContent = `${praefix} ${index + 1} von ${anzahl}`;

  /* [7.2.0, Punkt 23] Punkte-Leiste: ein Punkt je Karte, aktive Karte
   * hervorgehoben. Bei sehr vielen Stromkreisen (Praxis: 30-40+) waeren
   * ebenso viele Einzelpunkte unuebersichtlich - ab 20 Karten wird deshalb
   * nur ein kompakter Zaehl-Punkt-Cluster um die aktive Karte herum gezeigt. */
  if (punkteLeiste) {
    punkteLeiste.style.display = '';
    const MAX_EINZELPUNKTE = 20;
    let html = '';
    if (anzahl <= MAX_EINZELPUNKTE) {
      for (let i = 0; i < anzahl; i++) {
        html += `<span class="karussell-punkt${i === index ? ' aktiv' : ''}"></span>`;
      }
    } else {
      // Kompakte Darstellung: Punkt fuer Anfang, aktuelle Position, Ende.
      const pos = Math.round((index / (anzahl - 1)) * (MAX_EINZELPUNKTE - 1));
      for (let i = 0; i < MAX_EINZELPUNKTE; i++) {
        html += `<span class="karussell-punkt${i === pos ? ' aktiv' : ''}"></span>`;
      }
    }
    punkteLeiste.innerHTML = html;
  }

  /* Status-Kopfleiste (js/statusleiste.js) ueber den Kartenwechsel
   * informieren, damit "aktuelle Karte" auch bei reiner Wisch-/Pfeil-
   * Navigation (ohne Feldfokus) korrekt angezeigt bleibt.
   *
   * WICHTIG (6.2.0, Feature E): beim ERSTEN Aufruf direkt nach dem Laden der
   * Seite (siehe karussellInitialisieren() unten) darf dieses Event NICHT
   * gefeuert werden - sonst wuerde die Statusleiste sofort "Stromkreis #1"
   * anzeigen, obwohl der Kartenbereich noch gar nicht sichtbar/fokussiert
   * ist und eigentlich der Abschnitt "Stammdaten" gelten muesste. Das Event
   * ist nur fuer ECHTE Navigation gedacht (Pfeil-Klick, Wisch-/Scroll-Geste). */
  if (aktive && eventMelden) {
    document.dispatchEvent(new CustomEvent('vde:karussell-wechsel', { detail: { karte: aktive } }));
  }
}

function karussellSchritt(containerId, richtung) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const aktive = karussellAktiveKarte(containerId);
  const breite = aktive ? aktive.getBoundingClientRect().width + 12 /* gap */ : container.clientWidth;
  container.scrollBy({ left: richtung * breite, behavior: 'smooth' });
  // Indikator nach Ende der Scroll-Animation aktualisieren (scroll-Event
  // deckt das i. d. R. bereits ab, dies ist ein zusaetzliches Sicherheitsnetz
  // fuer den Fall, dass der Browser waehrend 'smooth' keine Zwischenevents feuert).
  setTimeout(() => karussellIndikatorAktualisieren(containerId), 350);
}

function karussellInitialisieren(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let scrollTicking = false;
  container.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      karussellIndikatorAktualisieren(containerId);
      scrollTicking = false;
    });
  }, { passive: true });

  /* [7.2.0, Punkt 22] Normales Mausrad scrollt browserseitig nur VERTIKAL -
   * ein horizontales Karussell wie dieses laesst sich damit von Haus aus
   * nicht durchblaettern (nur per Trackpad-Wischgeste, Shift+Rad oder den
   * Pfeil-Buttons). Sobald der Mauszeiger ueber dem Kartenbereich steht,
   * wird das vertikale Rad-Delta deshalb in ein horizontales scrollBy()
   * umgeleitet - ausschliesslich innerhalb des Karussells, die Seite selbst
   * scrollt an dieser Stelle weiterhin normal, wenn die Karte bereits am
   * Anfang/Ende angekommen ist (kein preventDefault() in diesem Fall, damit
   * man von den Stromkreis-Karten aus per Rad ganz normal weiter nach unten
   * zu den restlichen Formularabschnitten gelangt). */
  container.addEventListener('wheel', (ev) => {
    // Ueberwiegend horizontale Geste (Trackpad-Wischen, Shift+Rad) unveraendert
    // dem Browser ueberlassen - nur reines vertikales Rad-Scrollen umleiten.
    if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;

    const amAnfang = container.scrollLeft <= 0;
    const amEnde = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    if ((ev.deltaY < 0 && amAnfang) || (ev.deltaY > 0 && amEnde)) return; // Seiten-Scroll zulassen

    ev.preventDefault();
    container.scrollBy({ left: ev.deltaY, behavior: 'auto' });
  }, { passive: false });

  const beobachter = new MutationObserver(() => {
    karussellIndikatorAktualisieren(containerId);
  });
  beobachter.observe(container, { childList: true });

  // Anfangszustand beim Laden der Seite: nur den Indikator ("Stromkreis 1
  // von 2") setzen, OHNE die Statusleiste zu benachrichtigen - vor jeder
  // Interaktion soll dort weiterhin der Abschnittsname (z. B. "Stammdaten")
  // stehen, siehe Kommentar in karussellIndikatorAktualisieren() oben.
  karussellIndikatorAktualisieren(containerId, false);
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('circuitsContainer')) {
    karussellInitialisieren('circuitsContainer');
  }
});
