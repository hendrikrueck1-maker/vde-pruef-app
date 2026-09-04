# VDE-Prüfprotokoll-App 6.1.0 – Änderungsbericht

**Vorgängerversion:** 6.0.0
**Umgesetzt:** 8 vom Nutzer gemeldete Korrekturen – Netzspannungs-Eingaben
(L1-N/L2-N/L3-N/L1-L2/L2-L3/L1-L3) werden jetzt live und im PDF rot markiert,
wenn sie ausserhalb des Toleranzbands nach DIN EN 50160 liegen (z. B. 400 V
an L1-N) · „Erneut prüfen (Vorlage)" im Archiv lässt i.O./n.i.O.-Felder und
den RCD-Prüfstrom jetzt wieder auf ihrem echten Formular-Standardwert statt
sie komplett zu leeren · die Netzimpedanz Z_L-N wird bei einem zu hohen Wert
jetzt ebenso als Fehler markiert wie die Schleifenimpedanz Z_S · H07V-K wurde
als weiterer Kabeltyp in die Schnellauswahl aufgenommen · eingetragener Text
in „Mängel/Bemerkungen" wird im PDF nicht mehr als normaler Fliesstext,
sondern rot hervorgehoben gedruckt · das VDE-0100-Anlagenprotokoll öffnet bei
exakt 6 Stromkreisen keine unnötige zweite PDF-Seite mehr · ein als n.i.O.
bewertetes Sichtprüfungs-/Erprobungsfeld wird jetzt automatisch rot markiert
und in den Bemerkungen vermerkt – auch beim Wiederherstellen eines
gespeicherten oder aus dem Archiv übernommenen Standes · die Status-Kopfleiste
verschwindet nicht mehr, wenn auf einem Smartphone/Tablet die
Bildschirmtastatur geöffnet ist.

**Bewusst nicht umgesetzt:** eine automatische „0,"-Vorbelegung für R_PE,
Z_S und Z_L-N wurde geprüft, aber nach Abwägung des Sicherheitsrisikos (ein
technisch vorbelegter Wert von „0,00 Ω" sähe wie eine echte, plausible
Messung aus und würde die bestehende Schutzmassnahme unterlaufen, dass ein
Stromkreis ganz ohne Messung nicht durchrutscht) auf ausdrücklichen Wunsch
NICHT implementiert. Die Felder bleiben beim bisherigen Platzhaltertext.

Geändert wurden: `vde0100.html` · `anschlusspruefung.html` ·
`js/pdf-utils.js` · `js/pdf-generator.js` · `js/anschluss-generator.js` ·
`js/geraete-generator.js` · `js/archiv.js` · `js/statusleiste.js` sowie zur
Versionskennzeichnung `js/app-config.js` · `sw.js`.

---

## 1 · Netzspannungs-Eingaben wurden auf keine Plausibilität geprüft

Die sechs Netzmessungsfelder (L1-N, L2-N, L3-N sowie die Aussenleiter­
spannungen L1-L2, L2-L3, L1-L3) wurden bislang gegen keinen Sollwert
geprüft. Eine Fehleingabe wie „400" im Feld L1-N (Sollwert ~230 V) blieb
optisch völlig unauffällig, sowohl im Formular als auch im fertigen,
unterschriftsreifen PDF.

**Jetzt:** Neue Funktionen in `js/pdf-utils.js` – `NETZSPANNUNG_LN_SOLL`
(230 V) und `NETZSPANNUNG_LL_SOLL` (400 V) mit `NETZSPANNUNG_TOLERANZ` von
±10 % (DIN EN 50160), `netzspannungAusserNorm(id, wert)` und
`validateNetzspannungsfeld(id)`. Alle sechs Felder sind in `vde0100.html`
und `anschlusspruefung.html` per `oninput` daran angebunden und werden bei
Verstoss sofort mit der bereits bestehenden `.out-of-norm`-Klasse rot
markiert – demselben visuellen Muster wie jeder andere fehlerhafte Messwert.
Beim PDF-Druck berechnet `nmZelle()` (`js/pdf-generator.js` und
`js/anschluss-generator.js`) den Rot-Status jetzt ebenfalls automatisch über
`netzspannungAusserNorm()`, statt ihn wie zuvor zu ignorieren. Felder ohne
Sollwert-Eintrag (z. B. Netzfrequenz, U N-PE mit eigener Bewertung) sind von
dieser neuen Prüfung unberührt.

---

## 2 · „Erneut prüfen (Vorlage)" leerte i.O./n.i.O.-Felder und RCD-Prüfstrom komplett

`archivVorlageBereinigen()` leerte bislang jedes Ergebnisfeld gleich –
inklusive der Sicht-/Erprobungs-Arrays und des RCD-Prüfstroms. Beide besitzen
aber eine eingebaute Standardvorbelegung (echte leere Auswahl bzw. 5×), die
nach dem bestehenden `attrEscOderVorgabe()`-Muster nur beim **Fehlen**
(`undefined`) des Wertes greift – nicht bei einem explizit auf `''`
gesetzten. Eine aus einer Vorlage neu angelegte Prüfung stand dadurch mit
lauter leeren Ergebnisfeldern da, obwohl ein druckfrisches Formular an
derselben Stelle einen sinnvollen Startwert zeigt.

**Jetzt:** Auf ausdrücklichen Nutzerwunsch verhält sich die Vorlage wie ein
druckfrisches Formular: `ARCHIV_KEY_ENTFERNEN = ['rcd_pruefstrom']` entfernt
diesen Schlüssel jetzt komplett statt ihn zu leeren, wodurch die eingebaute
5×-Vorbelegung wieder greift. `ARCHIV_ERP_STANDARDWERT` liefert je
Erprobungspunkt seinen jeweiligen Formular-Standardwert (i.O. für
„Funktion Anlage"/„Schutzeinrichtungen", n.a. für die übrigen). Die
Sichtprüfungs-Ergebnisse (`state.sicht`) werden auf „i.O." vorbelegt statt
geleert. `archivVorlageBereinigen()` wurde dafür um einen
`elternSchluessel`-Parameter erweitert, damit `state.sicht`/`state.erproben`
gezielt anders behandelt werden können als jeder andere Wert. Echte
Messwerte, ein bereits gesetztes n.i.O.-Ergebnis, Freigabe, Unterschriften
und Datumsfelder bleiben davon unberührt und weiterhin ausnahmslos leer.

---

## 3 · Netzimpedanz (Z_L-N) zeigte auch bei zu hohem Wert keinen Fehler

`validateCardNorms()` prüfte je Stromkreis ausschliesslich die
Schleifenimpedanz Z_S (`.c-zs`) gegen den zulässigen Grenzwert. Das analoge
Feld Netzimpedanz Z_L-N (`.c-zln`) wurde nirgends bewertet – weder live im
Formular noch beim PDF-Druck.

**Jetzt:** `validateCardNorms()` markiert `.c-zln` jetzt nach demselben
Grenzwert (`maxZs`) wie `.c-zs`. `onZlnInput(cardId)` löst zusätzlich
`validateCardNorms(cardId)` aus (vorher nur `koppleImpedanzMitStrom()`).
Beim PDF-Druck wird `isZlnOut` analog zu `isZsOut` berechnet und fliesst in
dieselbe Rot-Markierung ein (`js/pdf-generator.js`). Betrifft ausschliesslich
das Anlagenprotokoll – die Anschlussprüfung besitzt kein Z_L-N-Feld.

---

## 4 · H07V-K fehlte in der Kabeltyp-Schnellauswahl

Die Quick-Buttons für Leitungstypen (NYM-J, H07RN-F, NHXH FE180, TITANEX …)
enthielten keinen H07V-K – einen im Verteilerbau (feste Verlegung im
Schaltschrank) sehr gebräuchlichen Leitertyp.

**Jetzt:** H07V-K wurde als weiterer Quick-Button ergänzt – sowohl im
Kopfbereich (Feld „Anschluss", `vde0100.html`) als auch je Stromkreis
(`addCircuitCard()`-Vorlage in `js/pdf-generator.js`), jeweils direkt nach
TITANEX. Auf ausdrücklichen Nutzerwunsch wurde bewusst nur dieser eine
Kabeltyp ergänzt, keine weiteren.

---

## 5 · Text in „Mängel/Bemerkungen" ging im PDF optisch unter

Ein eingetragener Bemerkungstext wurde im PDF wie gewöhnlicher Fliesstext in
normaler Schriftfarbe gedruckt. Bei einem längeren, unauffällig wirkenden
Protokoll war ein festgestellter Mangel dadurch nicht auf den ersten Blick
erkennbar.

**Jetzt:** Ist „Mängel/Bemerkungen" nicht leer, zeichnet der PDF-Export
zunächst ein rotes Hervorhebungsfeld hinter dem Text (Hintergrundfarbe
`redCellBg` = `[254, 226, 226]`) und druckt den Text anschliessend fett in
Rot (`redCellText` = `[153, 27, 27]`) statt in der normalen Textfarbe.
Umgesetzt in allen drei PDF-Generatoren (`js/pdf-generator.js`,
`js/anschluss-generator.js`, `js/geraete-generator.js`).

---

## 6 · VDE-0100-Anlagenprotokoll: unnötige 2. PDF-Seite bei exakt 6 Stromkreisen

Die Platzberechnung für Abschnitt 4 (Erdung/Gesamtbewertung) verwendete eine
fest angenommene Höhe für den abschliessenden Freitextblock
(`ABSCHLUSS_H_SCHAETZUNG = 32`) statt der tatsächlich benötigten Höhe. Bei
genau 6 Stromkreisen führte diese zu grobe Schätzung dazu, dass eine neue,
fast leere zweite Seite angelegt wurde, obwohl der tatsächliche Inhalt noch
auf die erste Seite gepasst hätte.

**Jetzt:** Die komplette Berechnung des Freitextblocks (`complianceText`,
`complianceLines`, `abschlussHoehe` u. a.) wurde in `generatePDFInner()` vor
die Platzprüfung (`pdfPlatzPruefen()`) für Abschnitt 4 vorgezogen; die feste
Schätzung entfällt zugunsten der exakt berechneten Höhe.

Verifiziert mit einem eigenen, headless laufenden Node/jsdom-Testharness,
der die echten Dateien der App (nicht nachgebaut) ausführt: 5 und 6
Stromkreise ergeben jetzt beide korrekt **1 Seite** (vorher bei 6:
fälschlich 2 Seiten), 7 Stromkreise weiterhin korrekt **2 Seiten**.
Zusätzlich mit Kontrollszenarien geprüft (6 Stromkreise mit Mangel und
langem Bemerkungstext, 2 Stromkreise, Leerformular) sowie ohne Regression
gegen die bestehende Widerspruchsprüfung (Mangel vorhanden + „Gewährleistung:
Ja" angekreuzt → Abbruch mit Warnhinweis, kein PDF).

---

## 7 · Sichtprüfung/Erproben: n.i.O. wurde nicht automatisch markiert oder in den Bemerkungen vermerkt

Ein als n.i.O. bewertetes Sicht- oder Erprobungsfeld war bisher nur an der
Auswahl selbst erkennbar. Stand der entsprechende Punkt nicht mehr im
sichtbar gescrollten Bereich, oder wurde die Bewertung nur kurz gesetzt,
konnte ein festgestellter Mangel beim späteren Ausfüllen von
„Mängel/Bemerkungen" leicht vergessen werden.

**Jetzt:** Neue Funktion `sichtErpNiOPruefen(el)` (`js/pdf-utils.js`): Bei
„n.i.O." wird das Auswahlfeld selbst rot markiert (dieselbe
`.out-of-norm`-Klasse wie bei jedem anderen fehlerhaften Wert, inklusive der
bereits bestehenden Vorrangregel gegenüber der grünen
Pflichtfeld-Markierung) **und** automatisch eine Zeile in
„Mängel/Bemerkungen" eingetragen, die den betroffenen Prüfpunkt benennt.
Wird die Bewertung wieder zurückgesetzt, verschwindet exakt diese eine Zeile
wieder – von Hand ergänzter Text bleibt davon unberührt. Angebunden per
`onchange` an alle 12 Sichtprüfungs- und 8 Erprobungsfelder in
`vde0100.html` sowie alle 9 Sichtprüfungsfelder in `anschlusspruefung.html`
(Nutzerentscheid: rote Markierung UND automatischer Text-Eintrag).

Zusätzlich in `restoreProtocolState()` (`js/pdf-generator.js`) und
`restoreAnschlussState()` (`js/anschluss-generator.js`) nachgezogen, damit
auch ein bereits gespeicherter n.i.O.-Stand – ein Autosave beim Neuladen der
Seite ebenso wie eine aus dem Archiv übernommene Vorlage – beim
Wiederherstellen korrekt markiert wird, statt erst nach erneutem manuellen
Anfassen des Feldes. Der Aufruf erfolgt bewusst **nach** dem Wiederherstellen
der Stromkreis- bzw. Einspeisepunkt-Karten, da `sichtErpNiOPruefen()` einen
Autosave auslöst – ein zu früher Aufruf hätte diesen Autosave mit noch leerem
Kartenbereich gespeichert und dabei die gerade wiederhergestellten
Stromkreise/Einspeisepunkte augenblicklich wieder gelöscht. Dieser
Reihenfolge-Punkt wurde mit einem eigenen Testfall gezielt abgesichert.

`geraetepruefung.html` verwendet ein anderes, kartenbasiertes Ankreuz-Muster
je Gerät (`.c-sicht-item`) mit einer bereits eingebauten automatischen
Zusammenfassung im gedruckten Text und war von diesem Befund nicht
betroffen.

---

## 8 · Status-Kopfleiste verschwand bei geöffneter Bildschirmtastatur

Die Status-Kopfleiste (`position: sticky`) blieb beim normalen Scrollen
zuverlässig sichtbar. Öffnete sich auf einem Smartphone/Tablet die
Bildschirmtastatur, verschieben iOS Safari und mobile Chrome-Varianten den
tatsächlich sichtbaren Ausschnitt (den sogenannten „visuellen Viewport")
unabhängig vom Scroll-Stand des Layout-Viewports, an dem sich
`sticky`/`fixed` orientieren, um das fokussierte Feld oberhalb der Tastatur
einzublenden. Die Leiste blieb dadurch an ihrer Position im Layout-Viewport
stehen, während genau dieser Bereich durch die Tastatur nicht mehr im
sichtbaren Ausschnitt lag – sie wirkte wie verschwunden, obwohl sie
technisch weiterhin vorhanden war.

**Jetzt:** `js/statusleiste.js` gleicht diesen Versatz über die
`window.visualViewport`-API aus (breit unterstützt: iOS Safari seit Version
13, Chrome/Android seit Jahren). Bei `resize`- und `scroll`-Ereignissen des
visuellen Viewports wird die Leiste per `translateY()` exakt um
`visualViewport.offsetTop` verschoben, gebündelt über
`requestAnimationFrame()`, um bei der Tastatur-Ein-/Ausblendanimation nicht
bei jedem einzelnen Ereignis neu zu rechnen. Beim normalen Scrollen
(Tastatur geschlossen, `offsetTop` bleibt 0) verhält sich die Leiste
unverändert wie zuvor; auf Browsern ohne `visualViewport`-Unterstützung
bleibt ebenfalls das bisherige Verhalten unverändert erhalten (reine
Erweiterung, kein Ersatz der bestehenden `sticky`-Positionierung).

---

## Version 6.0.0 → 6.1.0

`APP_VERSION` (`js/app-config.js`) und `SW_VERSION` (`sw.js`) wurden
gemeinsam auf **6.1.0** hochgezählt, damit der bereits im Browser
installierte Service Worker die neue Version erkennt und den Offline-Cache
zuverlässig erneuert. `CACHE_NAME` in `sw.js` leitet sich dynamisch aus
`SW_VERSION` ab und aktualisiert sich damit automatisch mit.

---

## Prüfung dieser Version

* Alle geänderten JavaScript-Dateien wurden per Syntaxprüfung (`node -c`)
  einzeln validiert – keine Syntaxfehler.
* Die Fixes zu Punkt 1 (Netzspannungs-Plausibilität), 3 (Z_L-N) und 4
  (H07V-K) wurden per headless jsdom-Test gegen die echten, im hochgeladenen
  Ordner liegenden Dateien direkt verifiziert (400 V an L1-N → rot, 231 V an
  L1-N → nicht rot; Z_L-N = 99 Ω → rot; H07V-K-Button sowohl im Kopfbereich
  als auch je Stromkreis vorhanden).
* Punkt 6 (Seitenumbruch) wurde mit sieben unterschiedlichen Testszenarien
  gegen die reale PDF-Erzeugungslogik der App verifiziert, siehe Abschnitt 6
  oben.
* Punkt 7 (Sichtprüfung/Erproben n.i.O.) wurde mit gezielten Tests für alle
  vier Fälle verifiziert: manuelles Umschalten auf n.i.O. und zurück auf
  i.O. (Markierung und Bemerkungs-Zeile erscheinen bzw. verschwinden exakt),
  sowie das Wiederherstellen eines bereits n.i.O.-markierten Standes für
  beide Formulare – inklusive der gezielten Prüfung, dass dabei keine
  Stromkreise bzw. Einspeisepunkte durch einen zu früh ausgelösten Autosave
  verloren gehen.
* Punkt 8 (Statusleiste) wurde mit einem simulierten `visualViewport`
  (Tastatur „geöffnet"/„geschlossen") verifiziert: die Leiste erhält beim
  simulierten Öffnen den korrekten Korrektur-Versatz und wird beim
  Schliessen wieder exakt zurückgesetzt; ohne `visualViewport` (älterer
  Browser) tritt kein Fehler auf.
* `APP_VERSION` und `SW_VERSION` wurden direkt im hochgeladenen Ordner
  ausgelesen und auf 6.1.0 bestätigt.
* Alle acht Korrekturen wurden abschliessend gemeinsam gegen den kompletten,
  bereits für 6.0.0 verwendeten Testszenarien-Satz erneut durchlaufen –
  keine Regression.

**Hinweis:** Diese Prüfung wurde headless per Node/jsdom gegen die echte
App-Logik durchgeführt (kein Live-Test mit sichtbarem Rendering in einem
echten Browser auf einem Smartphone). Insbesondere Punkt 8
(Statusleiste/Bildschirmtastatur) lässt sich durch die Natur des Problems
nur begrenzt headless nachbilden – der `visualViewport`-Ausgleich selbst
wurde funktional isoliert getestet, das tatsächliche Verhalten auf einem
realen Gerät mit echter Bildschirmtastatur sollte vor produktivem Einsatz
noch einmal kurz gegengeprüft werden.
