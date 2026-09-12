# VDE-Prüf-App 8.0.0 — Vollprüfung (Prüfprompt, Zielumfang ca. 60 Minuten)

Dieser Prompt ist für eine neue, eigenständige Prüf-Session gedacht. Ziel: die App Version 8.0.0 (`APP_VERSION`/`SW_VERSION` = 8.0.0) einmal vollständig auf Herz und Nieren prüfen — **ob alle geplanten Änderungen tatsächlich umgesetzt wurden**, Funktion, PDF-Grafik/Layout, Quellcode-Qualität und Rechtssicherheit der erzeugten Protokolle. Arbeite systematisch alle Abschnitte unten ab, in dieser Reihenfolge. Halte laufend eine Fehler-/Fundliste (siehe Vorlage in Abschnitt 8), damit am Ende ein vollständiger Bericht entsteht.

**Ausdrücklicher Prüfauftrag (nicht nur Funktionstest):** Diese Prüfung soll nicht nur feststellen, ob die App insgesamt funktioniert, sondern konkret nachweisen, ob **jede einzelne im Plan zugesagte Änderung** auch wirklich im Code angekommen ist — vollständig, nicht nur teilweise, und nicht nur laut Änderungsbericht, sondern durch eigene Prüfung am Quellcode und am erzeugten PDF. Ein Punkt gilt erst als erledigt, wenn du ihn selbst im Code gefunden UND funktional ausgelöst hast — das bloße Vertrauen auf die Selbstauskunft des Änderungsberichts zählt nicht als Nachweis.

**Wichtiger Hinweis zur Testtiefe:** Wo ein echter Headless-Browser-Test möglich ist (z. B. per Playwright + vorinstalliertem Chromium), führe ihn tatsächlich durch — generiere echte PDFs, öffne sie, prüfe den Konsolen-Output auf Fehler. Wo das nicht möglich ist, sag das im Bericht ausdrücklich und explizit, statt eine Prüfung zu behaupten, die nicht stattgefunden hat (siehe Ehrlichkeits-Hinweis in Abschnitt 9).

---

## 0. Ausgangslage vor Testbeginn

- Repository: `hendrikrueck1-maker/vde-pruef-app`, Branch `main`. Prüfe zuerst per `git log -1`/Versionsnummer in `js/app-config.js`, ob dort tatsächlich Version **8.0.0** vorliegt (Push nach dem letzten Änderungsbericht war zum Berichtszeitpunkt noch offen — falls der Stand noch 7.4.0 zeigt, bitte das im Bericht vermerken und mit dem lokal vorliegenden 8.0.0-Stand weiterarbeiten).
- Lies vorab `claude/VDE-App-8.0.0-Aenderungsbericht.md` und `claude/VDE-App-8.0.0-Aenderungsplan.md` aus dem Projekt, damit du weißt, was in dieser Version neu ist bzw. sich geändert hat (Liste unten in Abschnitt 2 fasst das bereits zusammen, ersetzt aber nicht das eigene Lesen der Originaldokumente).
- Prüfe, ob die im letzten Bericht als "unangetastet" gemeldeten Alt-Dateien (root-level `storage.js`, Ordner `ZUM-HOCHLADEN/`, `protokoll-vorlage.html`/`vorlage/`) weiterhin von keiner aktiven Seite referenziert werden (`grep` nach `<script src=`).

---

## 0a. Plan-Abgleich: Wurden ALLE 21 zugesagten Punkte tatsächlich umgesetzt?

Dies ist ein eigener, **verpflichtender** Prüfschritt und darf nicht mit Abschnitt 2 (Funktionstest der Neuerungen) verwechselt oder übersprungen werden: Abschnitt 2 prüft, ob eine Funktion **funktioniert**, wenn man sie ausführt. Dieser Abschnitt hier prüft davor, ob **jeder einzelne im Änderungsplan zugesagte Punkt überhaupt umgesetzt wurde** — vollständig, nicht nur teilweise, und durch eigenen Blick in Code/PDF, nicht durch Vertrauen auf den Änderungsbericht. Der Änderungsbericht (`claude/VDE-App-8.0.0-Aenderungsbericht.md`) ist eine Selbstauskunft der Session, die die Änderungen gemacht hat — er ist ein nützlicher Wegweiser (wo im Code man suchen soll), aber KEIN Ersatz für die eigene Verifikation.

**Vorgehen:** Öffne `claude/VDE-App-8.0.0-Aenderungsplan.md` aus dem Projekt und arbeite die dortige Abschlussliste „Zusammenfassung: vollständiger Umfang für 8.0.0" (21 Punkte) einzeln ab. Für jeden Punkt: (1) im Quellcode die konkrete Fundstelle suchen (nicht nur grep auf einen Namen — den Code lesen und verstehen, ob er das Gewünschte tatsächlich tut), (2) wo möglich in der laufenden App/im PDF auslösen und beobachten, (3) das Ergebnis mit einem von drei Status bewerten:

- **✅ Vollständig umgesetzt** — Code UND PDF/UI bestätigen es unabhängig
- **⚠️ Teilweise umgesetzt** — es existiert etwas, aber unvollständig, an falscher Stelle, oder nur für eines von mehreren betroffenen Formularen (genau benennen, was fehlt)
- **❌ Nicht umgesetzt** — kein entsprechender Code/keine entsprechende Wirkung auffindbar

Checkliste (Nummerierung entspricht exakt der Zusammenfassung im Änderungsplan):

```
[ ] 1.  R_ISO „mit/ohne Verbraucher" (vde0100.html), automatische 250-V-Vorwahl
[ ] 2.  RCD-Schnellauswahl 100 mA ergänzt
[ ] 3.  Schutzeinrichtungs-Basisdaten-Aufklappmenü mit Zwei-Wege-Synchronisierung
[ ] 4.  Besichtigen/Erproben: „Doku/Warnung", „Gebäudesystemtechnik", „Funktion Gebäudesystemtechnik" gestrichen, neu nummeriert, PDF-Generator + Blindformular bereinigt
[ ] 5.  Fotodokumentation für Mängel (alle drei Formulare)
[ ] 6.  Prüffristen-Schnellauswahl-Buttonleiste einheitlich in vde0100.html UND geraetepruefung.html
[ ] 7.  RCD-Typ B+ als fünftes Symbol + Legende
[ ] 8.  Blanko-PDF-Leerformulare an ALLE obigen Änderungen angepasst (nicht nur die ausgefüllten PDFs)
[ ] 9.  Abschnitt „Anschlusskabel der Anlage" in vde0100.html UND anschlusspruefung.html (zusätzlich zu Pro-Stromkreis-Kabelfeldern)
[ ] 10. Abschnitt „Erproben (Funktionsprüfung)" in anschlusspruefung.html neu ergänzt
[ ] 11. Abschnittsreihenfolge/-nummerierung in vde0100.html und anschlusspruefung.html angepasst (siehe Plan Teil 5.2)
[ ] 12. Abschnittstitel „Netzsystem, Netzbetreiber & Prüfgeräte" → „Netzsystem, Netzbetreiber" gekürzt (beide Formulare)
[ ] 13. Geräteprüfung: „Prüfart" als eigener Abschnitt 2 herausgetrennt, Folgeabschnitte neu nummeriert
[ ] 14. „Grund der Prüfung" zusätzlich in anschlusspruefung.html UND geraetepruefung.html ergänzt
[ ] 15. Verwalten-Funktion (Hinzufügen/Löschen) für Gebäude/Bereich-Liste, einheitlich alle drei Formulare
[ ] 16. Vier statt zwei Stammdatenfelder für Prüfgeräte (Gerätename + Seriennummer je Installationstester/Gerätetester, alle vier frei editierbar)
[ ] 17. Grün/Gelb-Buttons direkt in jeder der drei Protokolltyp-Kacheln (nicht mehr nur global)
[ ] 18. Archiv UND Entwurfsliste um Standort, Gebäude/Bereich, Anlage, typspezifische Anzahl erweitert
[ ] 19. Echte Pflichtfeld-Sperre Netzmessung bei Nicht-Festanschluss (PDF-Erzeugung wird verweigert)
[ ] 20. RCD-Icon-Update aus Teil 6.6 — Status prüfen: war das bei Umsetzung bereits eingetroffen oder weiterhin offen? Falls offen: im Bericht klar als bewusst zurückgestellt kennzeichnen, nicht als übersehen
[ ] 21. Versionssprung APP_VERSION/SW_VERSION 7.4.0 → 8.0.0, beide Werte identisch
```

Zusätzlich, unabhängig von der 21-Punkte-Liste:

- Prüfe stichprobenartig, ob der Änderungsbericht selbst an irgendeiner Stelle einen Punkt als „umgesetzt" beschreibt, den du bei eigener Code-Prüfung NICHT oder nur teilweise bestätigen kannst — das wäre ein eigenständiger, meldepflichtiger Befund (Diskrepanz Bericht vs. Code), unabhängig davon, ob die Funktion selbst beim Testen in Abschnitt 2 „irgendwie funktioniert".
- Prüfe, ob es Punkte im Änderungsplan gibt, die *nirgends* im Änderungsbericht erwähnt werden (weder als erledigt noch als bewusst verschoben) — das wäre ein Hinweis auf einen möglicherweise komplett vergessenen Punkt.
- Das Ergebnis dieses Abschnitts fließt als eigene Tabelle (Punkt/Status/Fundstelle/Anmerkung) direkt in den Abschlussbericht ein (siehe Abschnitt 9, neuer Unterpunkt 2a).

---

## 1. Testumgebung & Geräte

Teste, soweit im Rahmen deiner Umgebung möglich, in mindestens diesen Kombinationen (wo ein echter Browser/Gerätewechsel nicht möglich ist: per Viewport-Emulation approximieren und das im Bericht kennzeichnen):

- **Viewports:** Desktop (≥1280px), Tablet (768–1024px, Querformat UND Hochformat), Smartphone (360–430px)
- **Browser:** mindestens ein Chromium-basierter Browser real testen; Safari/iOS-Verhalten (insbesondere `showDirectoryPicker`-Fallback, Teilen-Menü, HEIC-Fotoupload) so weit wie möglich anhand des Codes nachvollziehen und explizit als "nicht real getestet" kennzeichnen, falls kein echtes Safari verfügbar ist
- **Netzwerk:** einmal online (Erststart, Service-Worker-Registrierung), einmal simuliert offline (Formular ausfüllen und PDF erzeugen ohne Netz)

---

## 2. Was in dieser Version neu ist — Pflichtprogramm

Jeder der folgenden 16 Punkte MUSS aktiv angeklickt/ausgefüllt und mit mindestens einem PDF-Export verifiziert werden (nicht nur der HTML-Code gelesen werden):

1. **R_ISO „Verbraucher angeschlossen?"** (nur `vde0100.html`, je Stromkreis-Karte): Feld auf „Nein" stellen → prüfen, dass automatisch „250 V DC – ohne Verbraucher geprüft (kein Normfall)" vorgewählt wird; manuell wieder überschreiben und prüfen, dass das möglich bleibt. Bestehende Option „250 V DC (Praxismessung mit Verbrauchern)" muss weiterhin separat auswählbar sein.
2. **RCD-Schnellauswahl 100 mA**: in `vde0100.html` UND `anschlusspruefung.html` je einen Stromkreis/Übergabepunkt anlegen, 100-mA-Button klicken, prüfen dass I_Δn korrekt übernommen wird (liegt zwischen den bestehenden 30-mA-/300-mA-Buttons).
3. **Schutzeinrichtungs-Basisdaten-Aufklappmenü** (`vde0100.html`): Panel aufklappen, Werte eintragen, prüfen dass sie sich in die „echten" Einzelfelder spiegeln — UND umgekehrt: Einzelfelder direkt ändern, Panel zuklappen/wieder aufklappen, prüfen dass die Basisdaten-Felder synchron nachgezogen werden (`schutzBasisdatenAusEinzelfeldernUebernehmen()`). Prüfen, dass das Panel selbst NICHT im PDF auftaucht (nur die Zielfelder).
4. **Besichtigen/Erproben-Bereinigung** (`vde0100.html`): zählen — Besichtigen muss genau 10 Punkte zeigen (nicht mehr „Doku/Warnung"/„Gebäudesystemtechnik"), Erproben genau 7 Punkte (nicht mehr „Funktion Gebäudesystemtechnik"). Im PDF nachzählen, ob die Nummerierung 1–10 bzw. die Erproben-Punkte lückenlos und ohne Karteileichen erscheinen.
5. **Fotodokumentation**: in allen drei Formularen je mindestens 2 Fotos (unterschiedliche Karten UND das zentrale Bemerkungsfeld) hochladen, PDF erzeugen, prüfen dass ein eigenes Kapitel „Fotodokumentation" mit allen Fotos unverzerrt (kein gestrecktes Seitenverhältnis) und korrekt beschriftet erscheint. Ein Foto wieder löschen und erneut exportieren — geprüft, dass es nicht mehr auftaucht.
6. **Prüffristen-Schnellauswahl** in ALLEN DREI Formularen: je einen der sechs Buttons (1/2/3 Monate, 1/2/4 Jahre) klicken, prüfen dass „Nächster Prüftermin"/Prüffrist korrekt aus dem eingetragenen Prüfdatum (nicht aus „heute") berechnet wird. In `geraetepruefung.html` insbesondere prüfen, dass die NEUEN einheitlichen Intervalle angezeigt werden (nicht mehr die alten 1/3/6 Monate-Werte).
7. **RCD-Typ B+**: in `vde0100.html` und `anschlusspruefung.html` „Typ B+" auswählen, prüfen dass das neue Icon korrekt und unverzerrt angezeigt wird, Legendentext in der Infokarte lesen und auf fachliche Plausibilität mit dem übrigen Text prüfen (kumulativer Aufbau AC+F+Gleichstrom+kHz).
8. **Abschnitt „Anschlusskabel der Anlage"**: in BEIDEN Formularen (`vde0100.html` UND `anschlusspruefung.html`) ausfüllen, im PDF prüfen dass es als eigene, einmalige Zeile/Box erscheint UND getrennt von den bestehenden Pro-Stromkreis-Kabelfeldern bleibt (beide Ebenen müssen im PDF unterscheidbar nebeneinander existieren, nicht überschreiben).
9. **Abschnitt „Erproben (Funktionsprüfung)" in `anschlusspruefung.html`**: komplett neu — alle drei Felder (Schutzeinrichtungen, RCD-Prüftaste, Drehrichtung Motoren) mit allen drei Zuständen (i.O./n.i.O./n.a.) durchspielen, prüfen dass n.i.O. korrekt eine Beanstandung im Gesamtergebnis auslöst. Prüfen, dass „Funktion Anlage"/„Drehfeld CEE"/„Polarität" hier bewusst NICHT vorkommen (die gehören nur zu `vde0100.html`).
10. **Abschnittsreihenfolge/Nummerierung**: in allen drei Formularen die Sprungnavigation (Statusleiste oben) durchklicken und mit der sichtbaren `<h2>`-Nummerierung im Formular abgleichen — keine Lücken, keine doppelten Nummern, Titel „Netzsystem, Netzbetreiber" (ohne „& Prüfgeräte") in `vde0100.html`/`anschlusspruefung.html`, eigener sichtbarer Abschnitt „Prüfart" in `geraetepruefung.html`.
11. **„Grund der Prüfung"**: in allen drei Formularen ausfüllen, im PDF-Kopf wiederfinden.
12. **Gebäude/Bereich-Verwaltung**: „Verwalten"-Dialog in allen drei Formularen öffnen, einen Testeintrag hinzufügen, Dialog schließen, prüfen dass der Eintrag im Dropdown erscheint; denselben Eintrag über den Dialog wieder löschen und prüfen dass er verschwindet. Prüfen, dass ein in `vde0100.html` hinzugefügter Eintrag auch in `anschlusspruefung.html`/`geraetepruefung.html` erscheint (gemeinsame Liste), aber NICHT in der Gebäude-Auswahl auf `index.html` (die hat eine eigene, getrennte Liste).
13. **Vier Stammdatenfelder für Prüfgeräte** (`index.html`): alle vier Felder (Name+Seriennummer je Installationstester/Gerätetester) mit frei erfundenen Werten befüllen, speichern, dann `vde0100.html` UND `geraetepruefung.html` öffnen und prüfen, dass jeweils der korrekte Gerätename+Seriennummer automatisch im PDF-relevanten Feld „Verwendetes Prüfgerät"/„Seriennummer Messgerät" landet (nicht vertauscht zwischen Installationstester/Gerätetester).
14. **Grün/Gelb-Kachel-Buttons** (`index.html`): frischen Browser-Zustand simulieren (kein offener Entwurf) → prüfen, dass NUR der grüne „+ Neues Protokoll"-Button erscheint. Dann über diesen Button einen Entwurf anlegen, zur Startseite zurück, prüfen dass jetzt zusätzlich der gelbe „▶ Protokoll fortsetzen"-Button mit korrekter Anlagenbezeichnung erscheint — UND NUR bei der betroffenen Protokollkachel, nicht bei den anderen beiden. Zwei Entwürfe desselben Typs anlegen, prüfen dass die Zähleranzeige „[2]" korrekt erscheint.
15. **Archiv/Entwurfsliste neue Spalten**: mindestens ein Protokoll je Typ fertigstellen (PDF erzeugen) und prüfen, dass im Archiv UND in „Offene Prüfungen" jetzt Standort, Gebäude/Bereich, Anlage sowie die typspezifische Anzahl (Stromkreise/Geräte/Übergabepunkte) sichtbar sind.
16. **Netzmessung-Pflichtfeld-Sperre** (`anschlusspruefung.html`): Einspeisungsart auf irgendetwas außer „Festanschluss / Zählerschrank" stellen, Netzmessung (U L1-N) an einem Übergabepunkt leer lassen, PDF-Erzeugung versuchen → muss mit klarer Fehlermeldung samt betroffener Übergabepunkt-Nummer verweigert werden, UND der Fokus muss automatisch auf das fehlende Feld springen. Gegenprobe: bei „Festanschluss / Zählerschrank" darf dieselbe Lücke NICHT blockieren.

---

## 3. Vollständige Funktionsprüfung (Bestandsfunktionen, Regressionstest)

Auch wenn diese Funktionen nicht neu in 8.0.0 sind: einmal komplett durchspielen, weil neue Feldarrays/Nummerierungen leicht bestehende Logik verschieben können.

- **A. Stammdaten**: alle Pflichtfelder je Formular einzeln leer lassen und prüfen, dass die PDF-Erzeugung mit korrekter, verständlicher Fehlermeldung blockiert (nicht nur „geht nicht", sondern welches Feld fehlt).
- **B. Stromkreis-Messwerte** (`vde0100.html`): mindestens 3 Stromkreise anlegen (i.O., n.i.O. wegen Grenzwertüberschreitung, „totgelegt/freigeschaltet"), Duplizieren-Funktion einer Karte testen, Karte löschen und prüfen dass zugehörige Fotos mitgelöscht werden.
- **C. Geräteprüfung**: mehrere Geräte anlegen, mindestens ein Gerät mit Ableitstrom-Grenzwertüberschreitung.
- **D. Anschlussprüfung**: mehrere Übergabepunkte, mindestens einer mit U N-PE-Verstoß.
- **E. Karussell/Responsive/Sprungnavigation**: auf allen drei Viewport-Größen aus Abschnitt 1 durchklicken.
- **F. Beispieldatensätze**: alle eingebauten „Beispieldaten laden"-Varianten je Formular durchspielen (in `vde0100.html`: Ohne Mängel / Mit Mängeln / 1 Stromkreis defekt), PDF erzeugen, Ampel-Farbe (grün/gelb/rot) mit der fachlichen Erwartung abgleichen. **Bekannte Vorlücke aus 7.4.0** (laut letztem Bericht weiterhin ungelöst, keine 8.0.0-Regression, aber bitte gegenprüfen): die Beispieldaten-Funktionen befüllen nicht alle Pflicht-Auswahlfelder (z. B. Drehfeld, Steckverbindung bei simulierter Steckstelle) — prüfen, ob das in 8.0.0 immer noch so ist, und falls ja, im Bericht erneut vermerken statt es stillschweigend zu übergehen.
- **G. PDF-Export & Ampel-Logik**: für jedes Formular je ein „sauberes" und ein „mit Mängeln"-PDF erzeugen, Wasserzeichen bei Testdaten prüfen, Seitenzahlen und Fortsetzungsblätter bei vielen Karten prüfen (mind. 10 Stromkreise/Geräte/Übergabepunkte anlegen, um einen Seitenumbruch zu erzwingen).
- **H. Formular-Vergleich (PDF vs. Leerformular)**: für alle drei Formulare je ein Leerformular-PDF erzeugen (Button „Leeres Protokoll drucken") und mit dem ausgefüllten PDF vergleichen — gleiche Feldpositionen, gleiche Schriftgrößen, gleiche neue Abschnitte (Anschlusskabel, Erproben in Anschlussprüfung) auch im Leerformular vorhanden und nicht versehentlich nur im ausgefüllten PDF ergänzt.

---

## 4. PDF-Grafik- und Layoutprüfung (alle drei Formulare, ausgefüllt UND leer)

Für jedes der insgesamt mindestens 6 erzeugten PDFs (3 Formulare × ausgefüllt/leer) einzeln prüfen und im Bericht mit Seitenangabe dokumentieren:

- Kein Text läuft über den rechten/unteren Seitenrand hinaus (besonders bei langen Freitexten wie „Anlage/Objekt" oder „Grund der Prüfung")
- Kein Textüberlapp zwischen benachbarten Feldern/Spalten, insbesondere in den NEUEN Boxen (Anschlusskabel, Erproben-Box in `anschlusspruefung.html`, 3-Spalten-Layout bei den Checkboxen)
- Kategorie-Farbboxen (Kopfbereich je Abschnitt) sind konsistent farblich zugeordnet wie in den bisherigen Formularen
- Ampel-Farben (rot/gelb hinterlegte Zellen bei Grenzwertüberschreitung) sind exakt und nicht zufällig auf falsche Zeilen angewendet
- Checkboxen (i.O./n.i.O./n.a.) sind eindeutig genau einem Zustand zugeordnet, nie zwei gleichzeitig angekreuzt
- Seitenumbruch-Logik: bei vielen Karten bricht die Seite sauber um, keine halb abgeschnittenen Tabellenzeilen
- Fotodokumentations-Seite: Bilder unverzerrt, Beschriftung lesbar, Rahmen korrekt
- Schriftart/Sonderzeichen (Ω, Δ, ≤, ≥, ², hochgestellte Ziffern) werden korrekt dargestellt, nicht als Kästchen/Fragezeichen
- Wasserzeichen bei Testdaten eindeutig lesbar, aber nicht störend
- Alle im Bericht 8.0.0 genannten neuen/verschobenen Abschnitte tauchen an der beschriebenen Position auf, nichts „verschwindet" im PDF, obwohl es im HTML-Formular sichtbar war

---

## 5. Quellcode-Qualität & technische Prüfung

- `node --check` auf jeder Datei in `js/*.js` sowie `sw.js` ausführen — muss fehlerfrei sein.
- HTML-Validierung (`tidy -e` oder gleichwertig) auf allen fünf aktiven Seiten (`index.html`, `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`, `archiv.html`).
- Grep-Suche nach den in 8.0.0 entfernten Feldnamen (`sicht_doku`, `sicht_gst`, `erp_gst`) über das gesamte Projekt — es dürfen NULL Treffer in aktiven Dateien übrig sein.
- Abgleich der Feld-ID-Arrays (`AUTOSAVE_FIELD_IDS`, `ANSCHLUSS_FIELD_IDS`, `GERAETE_FIELD_IDS`) gegen die tatsächlich vorhandenen `id`-Attribute je HTML-Datei — jede referenzierte ID muss existieren.
- Konsistenzprüfung `sichtLabels`/`erpLabels`-Arrays gegen die tatsächliche Anzahl `.sicht-item`/`.erp-item`-Felder je Formular.
- `APP_VERSION` (`js/app-config.js`) und `SW_VERSION` (`sw.js`) müssen exakt übereinstimmen.
- Prüfen, ob alle neuen Assets (`img/drehschalter/RCD_Typ_Bplus.png`) im Service-Worker-Cache (`CORE_ASSETS`) gelistet sind, damit Offline-Betrieb nicht bricht.
- Konsistenz der `?.value`-Null-Checks vs. ungeschützter `.value`-Zugriffe in den drei Generator-Dateien — insbesondere in allen NEU hinzugefügten Codeblöcken dieser Version.
- Race-Condition-Check bei asynchronen Abläufen (Foto-Laden vor PDF-Erzeugung, Gebäude-Verwaltung-Dialog-Schließen vor Dropdown-Refresh).
- Prüfen, ob die drei PDF-Generator-Dateien (`pdf-generator.js`, `anschluss-generator.js`, `geraete-generator.js`) an vergleichbaren Stellen (z. B. Grund-der-Prüfung-Zeile, Prüfintervall-Text) unnötig auseinandergelaufen sind, wo eine gemeinsame Hilfsfunktion sinnvoller wäre — als Verbesserungsvorschlag vermerken, nicht zwingend als Fehler werten.
- Ein bereits in dieser Version selbst gefundener und behobener Bug (Hoisting-Fehler bei `KACHEL_PRAEFIX` in `index.html`, siehe Änderungsbericht Punkt 15) noch einmal gezielt gegenprüfen: Startseite in einem WIRKLICH frischen Browserprofil (keine vorherige Session, kein Cache) laden und Konsole auf Fehler beim ersten Laden prüfen.
- Stichprobe: enthält irgendeine der drei Generator-Dateien nach den vielen Versionssprüngen mittlerweile deutlich mehr toten/auskommentierten Code als die anderen? Falls ja, als Aufräum-Vorschlag vermerken.

---

## 6. Rechtssicherheit der erzeugten Protokolle

Das PDF ist im Ernstfall ein Beweisdokument (z. B. bei einem Unfall/Schadensfall). Prüfen:

- Ist jederzeit nachvollziehbar, WER geprüft hat (Name + Unterschrift, keine leere Signatur exportierbar für ein „ausgefülltes" Protokoll)?
- Ist das Prüfdatum eindeutig und wird es NICHT nachträglich unbemerkt durch das Systemdatum überschrieben (insbesondere bei der neuen Prüffristen-Schnellauswahl in allen drei Formularen — Basis muss das eingetragene Prüfdatum sein, nicht „heute")?
- Sind Mess- und Bewertungsfelder eindeutig einem konkreten Stromkreis/Gerät/Übergabepunkt zugeordnet, auch bei vielen Karten und Seitenumbrüchen (keine Verwechslungsgefahr durch abgeschnittene Kopfzeilen auf Folgeseiten)?
- Ist ein „totgelegter"/freigeschalteter Stromkreis eindeutig als bewusste Ausnahme gekennzeichnet und nicht mit einem echten Prüfergebnis verwechselbar?
- Wird bei der neuen Netzmessungs-Pflichtfeld-Sperre wirklich JEDE unvollständige Einspeisung abgefangen, oder gibt es einen Umgehungsweg (z. B. Übergabepunkt nachträglich nach der Prüfung hinzufügen, ohne dass die Sperre erneut greift)?
- Fotodokumentation: ist die Zuordnung Foto → Karte/Mangel eindeutig und manipulationsresistent genug (keine Möglichkeit, ein Foto versehentlich einem falschen Stromkreis zuzuordnen)?
- Wasserzeichen bei Testdaten: ist zweifelsfrei ausgeschlossen, dass ein mit „Beispieldaten laden" erzeugtes PDF ohne erkennbares Wasserzeichen als echtes Prüfprotokoll durchgehen könnte?
- Blanko-Leerformular: trägt es unmissverständlich einen Hinweis, dass es sich um ein Leerformular handelt, und keine PDF-Wasserzeichen-Verwechslung mit einem echten Protokoll?
- Werden alle in dieser Version entfernten Prüfpunkte (Doku/Warnung, Gebäudesystemtechnik) tatsächlich ersatzlos gestrichen, oder besteht die Gefahr, dass dadurch fälschlich der Eindruck entsteht, diese Punkte seien „automatisch i.O.", obwohl sie schlicht nicht mehr geprüft werden? (Rein informativ zu bewerten — das war eine bewusste, abgestimmte Entscheidung, aber die Formulierung im PDF sollte das nicht verschleiern.)

---

## 7. Bug-Hunting (gezielte Fehlersuche über alle Kategorien)

Wie in den bisherigen Vollprüfungen: versuche aktiv, die App zum Versagen zu bringen, nicht nur den Normalfall zu bestätigen.

- **Funktionale Fehler**: extrem lange Freitexte (>500 Zeichen) in jedes Textfeld, Sonderzeichen/Emojis in Namensfeldern, negative/unrealistische Messwerte (z. B. R_ISO = -5), sehr viele Karten (20+) gleichzeitig anlegen.
- **Grafische Fehler**: sehr lange Gebäude/Bereich-Einträge über den Verwalten-Dialog anlegen und prüfen, ob sie im Dropdown/PDF sauber abgeschnitten statt überlaufend dargestellt werden.
- **UX-Fehler**: Verwalten-Dialog per ESC schließen (muss wie „Fertig" funktionieren), zwei Browser-Tabs mit demselben Formular gleichzeitig offen (Datenverlust-Risiko durch localStorage-Überschreiben?).
- **Performance**: Ladezeit der Startseite mit sehr vielen offenen Entwürfen (20+) und großem Archiv (50+ Einträge) messen.
- **Browser-Kompatibilität**: wo möglich, echten Cross-Browser-Test; sonst Code-basierte Einschätzung mit klarer Kennzeichnung als „nicht real getestet".
- **Offline-Fehler**: Service-Worker-Cache-Vollständigkeit nach dem Update auf 8.0.0 — ein Nutzer, der offline geht, bevor der neue Service Worker vollständig aktiv ist, darf keine kaputte/halb aktualisierte App bekommen.

---

## 8. Ergebnisprotokoll-Vorlage (pro Testdurchlauf auszufüllen)

```
Datum: ...
Tester: ...
Geräte/Browser/Viewport getestet: ...
Netzwerk-Szenarien getestet: ...

Gefundene Fehler (mit Schweregrad Kritisch/Wichtig/Mittel/Klein):
1. ...

Grafische Auffälligkeiten (mit PDF + Seite):
1. ...

Rechtssicherheits-relevante Feststellungen:
1. ...

Bestätigt funktionierend (Liste der 16 Neuerungen aus Abschnitt 2):
[ ] 1. R_ISO mit/ohne Verbraucher
[ ] 2. RCD 100 mA
... (alle 16 einzeln abhaken)
```

---

## 9. Abschlussbericht — Pflichtstruktur

Liefere am Ende einen zusammenhängenden Bericht mit exakt diesen Abschnitten:

1. **Executive Summary** (3–5 Sätze: ist die App produktionsreif, ja/nein/mit Einschränkungen — UND: wurden alle 21 Planpunkte umgesetzt, ja/nein/mit wie vielen Ausnahmen)
2. **Plan-Abgleich-Tabelle** (Pflicht, aus Abschnitt 0a: alle 21 Punkte einzeln mit Status ✅/⚠️/❌, Fundstelle im Code und ggf. Anmerkung was fehlt — das ist die zentrale Antwort auf die Frage „wurden alle Änderungen umgesetzt?" und muss vollständig sein, nicht nur eine Zusammenfassung)
3. **Test-Coverage** (wie viele der 16 Neuerungen + wie viele Bestandsfunktionen real getestet vs. nur code-analysiert, in Prozent/Anzahl)
4. **Kritische Fehler** (verhindern Produktiveinsatz)
5. **Wichtige Fehler** (sollten vor nächstem Einsatz behoben werden)
6. **Mittlere/kleine Fehler** (können gesammelt in einer Folgeversion behoben werden)
7. **Grafische/PDF-Erkenntnisse** (mit Seitenangaben)
8. **Rechtssicherheits-Einschätzung** (basierend auf Abschnitt 6)
9. **Code-Qualitäts-Einschätzung** (basierend auf Abschnitt 5)
10. **Verbesserungsvorschläge** (mindestens 5, gerne mehr — je mit Problem/Lösung/Nutzen/Aufwand)
11. **Ehrlichkeits-Abschnitt** — was konnte NICHT real getestet werden (z. B. echtes Safari/iOS, echter Fluke-1663/6500-2-Hardwareabgleich, Mehrbenutzer-Gleichzeitigkeit über echte Geräte), und was wurde stattdessen nur anhand des Codes plausibilisiert. Dieser Abschnitt ist Pflicht, keine Option — eine Prüfung, die ihre eigenen Grenzen verschweigt, ist für den Praxiseinsatz wertlos.

---

**Zeitrahmen:** Wenn die volle Tiefe aller Abschnitte innerhalb von ca. 60 Minuten nicht zu schaffen ist, priorisiere in dieser Reihenfolge: Abschnitt 0a (Plan-Abgleich, alle 21 Punkte) → Abschnitt 2 (alle 16 Neuerungen) → Abschnitt 6 (Rechtssicherheit) → Abschnitt 4 (PDF-Grafik) → Abschnitt 5 (Code) → Abschnitt 3 (Regression) → Abschnitt 7 (Bug-Hunting) — und vermerke im Bericht transparent, was aus Zeitgründen gekürzt wurde. Abschnitt 0a darf NICHT gekürzt werden, da genau das der ausdrückliche Kernauftrag dieser Prüfung ist (Nachweis, ob alle zugesagten Änderungen tatsächlich umgesetzt wurden) — im Zweifel hier Zeit von Abschnitt 7 (Bug-Hunting) oder Abschnitt 3 (Regression) abziehen.
