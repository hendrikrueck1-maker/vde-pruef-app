# VDE-App 7.1.0 – Änderungsplan

Stand: 2026-09-07 · Basis: APP_VERSION/SW_VERSION 7.0.0 → 7.1.0

Dieses Dokument fasst alle 18 vom Nutzer gemeldeten Punkte zusammen: was das Problem war, was geändert wurde, und wie es geprüft wurde.

---

## 1. Qualifikation der prüfenden Person – zentral in Stammdaten

**Problem:** Die Qualifikation (EFK / EuP unter Aufsicht) ließ sich nirgends zentral hinterlegen.

**Änderung:** Neues Auswahlfeld „Qualifikation der prüfenden Person" in `index.html` (Stammdaten-Bereich), inklusive Speicherung/Laden über `js/storage.js` (MASTERDATA_FIELD_IDS erweitert). Einmal gesetzt, wird der Wert wie alle anderen Stammdaten automatisch in jedes neue Formular übernommen.

**Geprüft:** Feld speichert und lädt korrekt über `saveMasterData()`/`applyMasterDataToForm()`.

---

## 2. Netzspannung – Voreinstellung & Ziffernblock

**Problem:** Keine Schnellauswahl für 230 V / 230-400 V, und das Feld öffnete nicht zuverlässig die Zifferntastatur auf Mobilgeräten.

**Änderung:** Schnellwahl-Buttons (230 V / 230-400 V) ergänzt, `inputmode="decimal"` und `pattern="[0-9 /]*"` gesetzt, damit Mobilgeräte den Ziffernblock statt der vollen Tastatur anzeigen. Gleiche Behandlung für die einzelnen Spannungsmessfelder (L-N, L-L, N-PE).

**Geprüft:** Attribute in vde0100.html und anschlusspruefung.html vorhanden und konsistent.

---

## 3. Stromkreisansicht zu breit (Overflow)

**Problem:** Die Karten im Karussell ragten minimal über den Rand hinaus.

**Ursache:** Fehlendes `box-sizing: border-box` – Padding und Rahmen wurden zur Breite addiert statt eingerechnet.

**Änderung:** Globaler Reset `*, *::before, *::after { box-sizing: border-box; }` ergänzt, zusätzlich explizit auf `.circuit-card`/`.feed-card` gesetzt.

**Geprüft:** Karten liegen jetzt exakt im Container, auch mit Rahmen/Innenabstand.

---

## 4. R_ISO fälschlich grün bei reinem „>"

**Problem:** Wurde nur das Vergleichszeichen „>" ohne Zahl eingegeben, markierte die App das Feld als vollständig ausgefüllt (grün).

**Änderung:** Neue Prüfung in `js/pflichtfelder.js` (`nurVergleichszeichenOhneZiffer()`): Werte, die nur aus `< > ≤ ≥ ~` und Leerzeichen bestehen, gelten weiterhin als „leer" (gelb), bis eine echte Zahl folgt.

**Geprüft:** Regex-Logik betrifft ausschließlich Werte ohne jede Ziffer – normale Messwerte wie „> 500" bleiben unverändert grün.

---

## 5. R_ISO- und R_PE/R_LO-Anleitungstexte korrigiert

**Änderung:**
- R_ISO: „Drehschalter auf Ω INSULATION stellen" → „Drehschalter auf Riso stellen"; Hinweis ergänzt, dass die Messung an angeschlossenen Geräten mit 250 V erfolgt (gilt auch für die Prüfspannungs-Auswahl im Formular).
- R_PE/R_LO: Label am Drehschalter-Icon „Rpe" → „Rlo"; Anleitungstext „Drehschalter auf Ω LOW OHM bzw. R LOW Ω stellen" → „Drehschalter auf Rlo stellen"; Messpunkt-Text präzisiert: „zwischen Stecker und PE-Anschluss oder Potenzialausgleichsschiene und PE-Anschluss"; Schritt ergänzt: „TEST drücken und Leitung während der Messung leicht bewegen" (Wackelkontakt-Prüfung nach DIN EN 50699).

**Datei:** `js/infokarten.js`, Einträge `riso` und `rpe`.

---

## 6. Disclaimer nur noch einmal, global

**Problem:** Der Hinweis „Inoffizielle, selbst erstellte Kurzanleitung ..." stand in jeder einzelnen Anleitung.

**Änderung:** Aus `flukeAnleitungHtml()` (`js/infokarten.js`) ersatzlos entfernt und stattdessen einmalig in `anleitung.html` als globaler Hinweis für alle Kurzanleitungen (Zi, RCD, R_ISO, R_PE/R_LO, Berührungsspannung, Netzmessung, Drehfeld) ergänzt.

---

## 7. Icon „Überstromschutzeinrichtung" korrigiert, RCD-Position präzisiert

**Änderung:** Icon auf `Z_S_Schleifenimpedanz-Kurzschlussstrom.png` umgestellt, Label „Z_S" → „Z_i". Anleitungstext verweist jetzt korrekt auf die Drehschalter-Position „mit/ohne RCD" statt der fälschlich als Schalterstellung genannten „NO TRIP"-Anzeige.

**Datei:** `js/infokarten.js`, Eintrag `zs`.

---

## 8. RCD/Fehlerstrom- und Berührungsspannungsmessung zusammengeführt

**Problem:** Zwei getrennte Abschnitte (RCD-Auslösezeit und Berührungsspannung) beschrieben denselben Messvorgang doppelt.

**Änderung:**
- Eigener `ul`-Eintrag (Berührungsspannung) entfernt; Text und Anleitung in den `rcd`-Eintrag integriert, da die Berührungsspannung bei der RCD-Auslösezeitmessung automatisch mitgemessen wird.
- Icon am eigenständigen Berührungsspannungs-Abschnitt in vde0100.html entfernt (keine Dopplung mehr).
- Neuer Anleitungsschritt: „Prüfstrom-Wellenform passend zum RCD-Typ wählen: ~ für Typ AC/A, ⌐⌐ (Halbwelle) für pulsstromsensitive Typ A, = (glatter Gleichstrom) für Typ B – bei zeitverzögerten/selektiven RCDs zusätzlich [S] wählen."
- RCD-Typ-Symbol-Legende (`RCD_TYP_LEGENDE_HTML`) ergänzt, mit vier aus der hochgeladenen Typenschild-Tabelle zugeschnittenen Symbolen (Typ AC, A, B, F) als eigenständige, freigestellte PNGs unter `img/drehschalter/`.

**Geprüft:** Kein doppeltes Icon mehr am Berührungsspannungs-Abschnitt; Legende erscheint am Ende der RCD-Anleitung.

---

## 9. Icon „Erproben" (Drehfeldmessung) korrigiert

**Änderung:** Neues Icon `Phase_Drehfeldmessung.png` aus der hochgeladenen 8-Icon-Referenzgrafik extrahiert (freigestellt, transparenter Hintergrund). Label „L1-L2-L3" → „Phase", Anleitungstext „Drehschalter auf Drehfeld (Kreis-Pfeil-Symbol) stellen" → „Drehschalter auf Phase stellen".

**Datei:** `js/infokarten.js`, Eintrag `drehfeld`.

---

## 10. Potenzialausgleich-Anleitung an R_LO angeglichen

**Änderung:** Der `rlo`-Eintrag (Durchgängigkeit Potenzialausgleich) verwendet jetzt denselben Wortlaut wie der korrigierte `rpe`-Eintrag („Rlo" statt alter Bezeichnung, gleicher Messpunkt- und TEST-Bewegen-Text).

---

## 11. Foto-Anlage auch am Bemerkungsfeld

**Problem:** Fotos ließen sich nur an einzelnen Stromkreis-/Geräte-/Übergabepunkt-Karten anhängen, nicht am zentralen Feld „Mängel / Bemerkungen / Auflagen".

**Änderung:** Neue Fotoleiste unter dem Bemerkungsfeld in allen drei Formularen (vde0100.html, anschlusspruefung.html, geraetepruefung.html), über einen eigenen IndexedDB-Schlüssel (`fotoKartenKey(praefix, entwurfId, 'bemerkungen', 1)`).

**Geprüft:** End-to-End getestet (Foto speichern → PDF generieren): Foto erscheint korrekt beschriftet als „Bemerkung" im Fotodokumentations-Anhang, in allen drei Protokollen.

---

## 12. Fotos im PDF verzerrt (längs gestreckt)

**Problem:** Fotos wurden im PDF gestaucht/gestreckt statt im Originalseitenverhältnis dargestellt.

**Ursache:** Die Platzierung skalierte Höhe und Breite unabhängig voneinander auf ein festes Rasterfeld.

**Änderung:** Neue Funktion `fotoContainMasse()` (`js/fotos.js`) berechnet eine „object-fit: contain"-Skalierung, die das Seitenverhältnis erhält und das Foto zentriert im verfügbaren Feld platziert.

**Geprüft:** Automatisiert mit einem 1600×900-Testfoto (Verhältnis 1,778) – die im PDF platzierte Bildbox hat exakt dasselbe Verhältnis (Differenz 0,000), in allen drei Protokollen.

---

## 13. „Mängel festgestellt und behoben" & Rot/Gelb-Logik der Bemerkungen

**Änderung:**
- Die Option „Mängel festgestellt und behoben (siehe Bemerkung)" ist im Auswahlfeld „Gesamtbewertung Mängel" vorhanden.
- Bugfix: Der Bemerkungen/Mängel-Textblock im PDF war unabhängig vom tatsächlichen Zustand immer rot hinterlegt. Jetzt: rot nur bei „Mängel festgestellt", gelb bei vorhandenem Bemerkungstext ohne offene Mängel, neutral wenn leer.

**Geprüft:** Drei PDF-Varianten erzeugt und die tatsächliche Textfarbe im PDF ausgelesen: „Mängel festgestellt" → RGB(153,27,27) rot; Bemerkungstext ohne Mängel-Flag → RGB(113,63,6) gelb – beide Werte stimmen exakt mit den Farbkonstanten im Code überein.

---

## 14. Automatisch generierter Konformitätssatz bei „Mängel behoben" entfernt

**Problem:** Bei „Mängel festgestellt und behoben" fügte das PDF automatisch einen festen Satz ein („... die anschließende Nachmessung ergab zulässige Werte ..."), obwohl der Prüfer dies bereits selbst im Bemerkungsfeld dokumentiert.

**Änderung:** Die drei Textbausteine `MAENGEL_BEHOBEN_TEXT_ANLAGE/_ANSCHLUSS/_GERAETE` (`js/pdf-utils.js`) sowie ihre Verwendung in allen drei PDF-Generatoren wurden ersatzlos entfernt. Der Zustand „Mängel behoben" fällt jetzt auf denselben neutralen Konformitätssatz zurück wie „keine Mängel" – die eigentliche Aussage, was behoben wurde, steht wie gewünscht ausschließlich im Bemerkungsfeld des Prüfers.

Eine gesonderte, im Quelltext fest hinterlegte Passage zu „6 Stromkreise pro DIN-A4-Seite" wurde geprüft und **nicht gefunden** – die im Auftrag zitierte Passage existierte nur als interne Beschreibung des Seitenumbruch-Verhaltens in früheren Chatverläufen, nicht als sichtbarer App-Text. Es gab daher nichts zu entfernen.

**Geprüft:** PDF mit „Mängel behoben" erzeugt und Text extrahiert – enthält nur noch den neutralen Standardsatz, keine automatische Nachmessungs-Behauptung mehr.

---

## 15. Anschlussprüfung an vde0100.html angeglichen

**Geprüft:**
- Alle Drehschalter-Icons/Anleitungen (Z_i, RCD, R_ISO, R_LO, Phase) werden über dieselbe zentrale `MESSGROESSEN_INFO`/`messgroesseBlock()`-Logik gerendert wie in vde0100.html – Korrekturen aus Punkt 5–10 gelten automatisch auch hier.
- Karussellansicht: bewusst nicht vorhanden in anschlusspruefung.html (Übergabepunkte werden als einfache Kartenliste dargestellt, nicht als Karussell) – das ist unverändertes, korrektes Design, kein Fehler.
- Fotofunktion inkl. Verzerrungs-Fix (Punkt 12) funktioniert identisch – End-to-End getestet.
- **Zusätzlich gefunden:** Der Abschnitt „Netzmessung am Übergabepunkt" hatte – anders als das gleichartige Netzmessung-Feld in vde0100.html – gar kein Icon und keine Anleitung. Ergänzt (siehe Punkt 17).

---

## 16. Statusleiste funktionierte nicht richtig

**Problem:** Die Statusleiste blieb nach einmaligem Anzeigen einer Stromkreis-/Geräte-/Übergabepunkt-Karte dauerhaft auf dieser Karte stehen, auch wenn man längst in einen anderen Abschnitt (z. B. „Gesamtbewertung") gescrollt hatte – reproduzierbar vor allem bei einem einzelnen groben Bildlauf (Sprung-Scroll) statt vieler kleiner Wisch-/Mausrad-Bewegungen.

**Ursache:** Der IntersectionObserver, der zwischen „Karte sichtbar" und „kein Karte sichtbar" umschaltet, feuert nur bei echten Sichtbarkeits-Übergängen. Landete ein Sprung-Scroll direkt auf einer Position, an der (wie zuvor) keine Karte im schmalen Beobachtungsstreifen lag, gab es dort keinen neuen Übergang – der Observer feuerte schlicht nicht erneut, und die App zeigte weiterhin die zuletzt gesehene Karte an.

**Änderung:** `js/statusleiste.js` prüft jetzt bei jeder Scroll-Neuberechnung zusätzlich aktiv (`karteNochImBlick()`), ob die aktuell angezeigte Karte überhaupt noch in der Nähe des sichtbaren Bereichs liegt, und setzt die Anzeige andernfalls zurück auf den Abschnittsnamen.

**Geprüft:** Mit einem automatisierten Browsertest reproduziert (Karte fokussieren → Sprung-Scroll ans Seitenende → Anzeige blieb fälschlich auf „Stromkreis #1" stehen) und nach dem Fix verifiziert (Anzeige wechselt korrekt zu „Gesamtbewertung"; Rückkehr nach oben zeigt wieder „Stammdaten"). Bestehende Anzeigepfade (Fokus auf Karte, Fokus außerhalb, normales Wischen) funktionieren unverändert weiter.

---

## 17. Fehlende Anleitungen ergänzt

**Gefunden und behoben:**
- **Geräteprüfung – Ableitstrom:** Das Messfeld „Ableitstrom" mit drei wählbaren Methoden (Ersatzableitstrom, Differenzstrommessung, Direktmessung Berührungsstrom) hatte überhaupt keine Anleitung, obwohl R_PE und R_ISO direkt daneben vollständige Fluke-6500-Kurzanleitungen haben. Neuer `MESSGROESSEN_INFO.ableitstrom`-Eintrag mit „Was/Warum"-Erklärung und einer 5-Schritte-Anleitung für alle drei Messmethoden ergänzt.
- **Anschlussprüfung – Netzmessung am Übergabepunkt:** Hatte kein Icon und keine Anleitung (siehe Punkt 15). Jetzt über dieselbe `uv`-Messgröße wie in vde0100.html eingebunden.

**Geprüft:** Systematischer Scan aller drei Formulare nach Messblöcken mit Zahlenfeld ohne zugehörige Fluke-Anleitung – vor der Korrektur 3 Treffer in geraetepruefung.html/anschlusspruefung.html (die verbliebenen 2 Treffer in vde0100.html sind der bewusst zusammengeführte Berührungsspannungs-Abschnitt, siehe Punkt 8, kein Fehler), nach der Korrektur 0 Treffer in beiden.

---

## 18. Versionsstand & Auslieferung

- `APP_VERSION` (js/app-config.js) und `SW_VERSION` (sw.js) von 7.0.0 auf **7.1.0** angehoben.
- Alle geänderten JavaScript-Dateien mit `node --check` auf Syntaxfehler geprüft (fehlerfrei).
- Alle drei Formulare (vde0100.html, anschlusspruefung.html, geraetepruefung.html) in einem Kopfloch-Browser geladen und auf Ladefehler geprüft (keine).
- PDF-Erzeugung für alle drei Formulare in je zwei Varianten (leer/ausgefüllt) automatisiert getestet – keine Fehler.
- Fehlende Vendor-Bibliotheken (jsPDF, jsPDF-AutoTable, jsZip, SignaturePad, Liberation-Sans-Schriftart) aus dem Live-Ordner nachgezogen und in die Auslieferung aufgenommen.
- Vollständige App als ZIP-Datei bereitgestellt.

---

## Geänderte/neue Dateien im Überblick

| Datei | Art der Änderung |
|---|---|
| `index.html` | Qualifikationsfeld ergänzt |
| `js/storage.js` | Qualifikationsfeld in Stammdaten-Speicherung aufgenommen |
| `vde0100.html` | Netzspannungs-Voreinstellung, Ziffernblock, Bemerkungs-Fotoleiste, Berührungsspannungs-Icon entfernt |
| `anschlusspruefung.html` | Ziffernblock, Bemerkungs-Fotoleiste, Netzmessungs-Icon/Anleitung ergänzt |
| `geraetepruefung.html` | Bemerkungs-Fotoleiste, Ableitstrom-Anleitung ergänzt |
| `css/style.css` | box-sizing-Reset, RCD-Typ-Legende-Styles |
| `js/pflichtfelder.js` | Vergleichszeichen-ohne-Ziffer-Erkennung |
| `js/infokarten.js` | Icon-/Text-Korrekturen (Zi, RCD, R_ISO, R_LO, Phase), RCD-Typ-Legende, Ableitstrom-Eintrag, Disclaimer entfernt |
| `anleitung.html` | Globaler Disclaimer ergänzt |
| `js/fotos.js` | Foto-PDF-Logik verallgemeinert (unverzerrte Platzierung, Einzelkarten-Fotos) |
| `js/pdf-generator.js`, `js/anschluss-generator.js`, `js/geraete-generator.js` | Async-Foto-Ladepfad, Bemerkungen-Farblogik, Mängel-behoben-Text entfernt |
| `js/pdf-utils.js` | MAENGEL_BEHOBEN_TEXT_*-Konstanten entfernt |
| `js/statusleiste.js` | Bugfix hängengebliebene Kartenanzeige |
| `js/app-config.js`, `sw.js` | Versionsstand 7.1.0, Cache-Liste aktualisiert |
| `img/drehschalter/*.png` | Neue Icons: Z_S_Schleifenimpedanz-Kurzschlussstrom, Phase_Drehfeldmessung, RCD_Typ_AC/A/B/F |
