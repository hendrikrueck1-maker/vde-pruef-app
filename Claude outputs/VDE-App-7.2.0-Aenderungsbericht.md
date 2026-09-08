# VDE-Prüf-App 7.2.0 — Änderungsbericht

Stand: 08.09.2026. Basis: 7.1.0. Grundlage war Ihre Liste mit 23 nummerierten Punkten (Code-Befunde M1–M8/N1–N7/H1–H2 aus der 7.1.0-Vollsimulation plus 14 neue Funktionswünsche). Sie hatten sich für "Alles in einem Rutsch" und "Direkt im Repo bearbeiten + git commit" entschieden. Alle 23 Punkte wurden umgesetzt, jeweils in eigenen, thematisch gruppierten Git-Commits.

## 1. Foto-Verlust nach Reload behoben (H1-nah, Abschnitt 1/5)

**Ursache gefunden:** Der Foto-Schlüssel jeder Karte (`fotoKartenKey()`) hing an `cardCounter` — einer laufenden Nummer, die bei jedem Wiederherstellen aus dem Autosave (`cardCounter = 0` gefolgt von `forEach(addXCard)`) wieder bei 0 beginnt. Solange die Kartenreihenfolge beim Neuladen exakt gleich blieb, fiel das nicht auf. Sobald aber eine Karte zwischendurch gelöscht oder die Reihenfolge anders wiederhergestellt wurde, zeigte ein Foto plötzlich an der falschen Karte oder verschwand scheinbar.

**Fix:** Jede Karte bekommt jetzt bei ihrer Erstellung eine eigene, stabile ID (`neueKartenId()`, `crypto.randomUUID()` mit Fallback für ältere Browser), die im `dataset.kartenId` der Karte UND im gespeicherten Formularzustand (`state.circuits[].kartenId` usw.) mitgeführt wird. Der Fotoschlüssel nutzt jetzt diese ID statt der Zählernummer. Betroffen: alle drei Formulare (Stromkreise, Übergabepunkte, Geräte). Beim Duplizieren einer Karte wird bewusst KEINE ID übernommen — die Kopie bekommt eine frische, damit sie keine Fotos der Originalkarte "erbt".

## 2. Wasserzeichen jetzt auch in Geräte-/Anschlussprüfung (M2)

`testdatensatzSetzen()` (setzt das "BEISPIELDATEN"-Wasserzeichen im PDF) wurde bisher nur aus den drei Beispieldatenfunktionen in `vde0100.html` aufgerufen. Jetzt rufen auch `fillExampleDataAnschluss()` und `fillExampleDataGeraete()` diese Funktion auf — ein mit Beispieldaten erzeugtes PDF ist in allen drei Formularen jetzt zweifelsfrei als Testdatensatz erkennbar.

## 3. "Auftraggeber" jetzt hartes Pflichtfeld überall (M3)

`erstesLeerePflichtfeld([...])` prüfte in `vde0100.html` und `anschlusspruefung.html` bisher nicht auf `auftraggeber` (in der Geräteprüfung war es bereits korrekt). Ein PDF ohne Auftraggeber-Angabe ließ sich also in zwei von drei Formularen erzeugen. Jetzt wird das Feld in allen drei Formularen vor dem Export geprüft.

## 4. Try/catch im asynchronen PDF-Pfad nachgerüstet (H1)

In `vde0100.html` lief die Foto-Ladephase des PDF-Exports (`fotoLadenPromise.then(...)`) bisher **ohne** eigenes try/catch — ein Fehler in diesem Codeabschnitt wäre still verschluckt worden, ohne Meldung an die Nutzerin. Jetzt ist der komplette Block abgesichert, mit derselben nutzerfreundlichen Fehlermeldung wie an den bereits abgesicherten Stellen.

## 5. Beispieldaten jetzt eigenständig exportierbar (M1)

Die Beispieldatensätze für Geräte- und Anschlussprüfung ließen sich bisher nicht direkt als PDF exportieren, weil Sicht-/Funktionsprüfungsfelder und das (jetzt per Punkt 3 pflichtige) Auftraggeber-Feld nicht mitbefüllt wurden. Beide Funktionen setzen jetzt zusätzlich alle Sicht-/Erproben-Felder auf "i.O." und befüllen Auftraggeber — ein Klick auf "Beispieldaten" erzeugt in allen drei Formularen ein sofort exportierbares Test-PDF.

## 6. Mindestlänge im Bemerkungsfeld bei "Mängel behoben" (Abschnitt 6, Beweislücke)

Bisher genügte ein einziges Zeichen im Bemerkungsfeld, um den Status "Mängel behoben" zu bestätigen — im Streitfall (Versicherung, Unfall) wäre das keine belastbare Dokumentation gewesen. Jetzt sind mindestens 20 Zeichen Pflicht (`MAENGEL_BEHOBEN_MIN_LAENGE`), der Warnhinweis benennt die Mindestlänge explizit.

## 7. Ampel-Status jetzt zusätzlich nicht-farblich gekennzeichnet (H2, WCAG 1.4.1)

Pflichtfelder waren bisher ausschließlich über Rahmenfarbe (Gelb = offen, Grün = ausgefüllt) erkennbar — für farbenblinde Nutzer:innen nicht unterscheidbar, ein klarer WCAG-1.4.1-Verstoß. Jetzt erscheint zusätzlich ein Text-/Symbolhinweis neben dem Label (⚠ "Pflichtfeld – bitte ausfüllen" bzw. ✓ "ausgefüllt", bei Werten außerhalb des zulässigen Bereichs ✗ "außerhalb des zulässigen Bereichs"), umgesetzt rein über CSS (`:has()`-Selektor, kein JS nötig). Hinweis: `:has()` wird von Chrome/Edge/Safari seit 2023 und Firefox ab Version 121 unterstützt — auf sehr alten Browsern bleibt nur die Farbkennzeichnung sichtbar, das Formular funktioniert aber unverändert.

## 8. Repository aufgeräumt (M6)

Der eigentliche, im 7.1.0-Bericht beschriebene Kern des Befunds (drei parallele Versionsstände im selben Git-Repo: 7.1.0 kanonisch, lose 4.7.0-Dateien im Root, ein komplettes 4.1.1 verschachtelt in `ZUM-HOCHLADEN/`) war zum Zeitpunkt dieser Session bereits bereinigt — das Repo enthält nur noch den kanonischen 7.1.0-Stand (48 Dateien plus Vendor-Bibliotheken). Was noch bestand und jetzt behoben wurde: der Ordner `img/drehschalter/_archiv-ungenutzt/` enthielt 4 Icon-Dateien, davon 3 (`Drehfeld_Phasendrehung.png`, `Z_S_Schleifenimpedanz-Kurzschlussstrom.png`, `Z_i_Loop.png`) **identisch doppelt** zum aktiven `img/drehschalter/`-Ordner vorhanden, sowie eine vierte (`U_L_Netzspannung.png`), die durch die Icon-Korrektur aus Version 6.3.0 (U_F statt U_L) bereits unbenutzt war. Der komplette Ordner wurde entfernt, nachdem eine Volltextsuche bestätigt hat, dass keine Datei daraus von aktivem Code referenziert wird. Die im selben Befund erwähnte defekte `protokoll-vorlage.html` liegt außerhalb des Git-Repos (im übergeordneten `vde-pruef-app`-Ordner auf Ihrem Rechner, nicht Teil der ausgelieferten App) — dort bewusst nicht angefasst, da unklar war, ob diese Entwickler-Vorlage noch aktiv genutzt wird; gerne in einer eigenen, kleinen Aufgabe klären, falls gewünscht.

## 9. Restliche mittlere/niedrige Befunde (M4, M5, M7, M8, N1–N7)

Wie von Ihnen selbst so vorgesehen ("im Rahmen der nächsten regulären Wartung") **nicht** in dieser Session umgesetzt. Kurzer Überblick zur Priorisierung beim nächsten Update: M7 (WCAG-Randkontrast der Ampelfarben) und M8 (fehlendes Label am `gebaeude_custom`-Feld) sind die einzigen mit tatsächlichem Nutzerbezug: die übrigen (M4/M5 Code-Duplikate, N1–N7) sind reine Wartungs-/Robustheitsthemen ohne sichtbare Auswirkung.

## 10. Neue Infokarte "Prüffristen" für alle drei Prüfungen

Jede der drei Formularseiten zeigt jetzt direkt unter der Überschrift "Stammdaten" eine ausklappbare Infokarte mit den gesetzlich/normativ vorgesehenen Prüfintervallen (DIN VDE 0100-600/0105-100 für Anlagen, DIN VDE 0100-704 für Anschlussprüfungen bei Veranstaltungen, DIN EN 50699 für ortsveränderliche Geräte je nach Nutzungsklasse). In `vde0100.html` und `geraetepruefung.html` wird zusätzlich das nächste fällige Prüfdatum (aus dem bereits vorhandenen Feld "Nächste Prüfung fällig am") prominent farbig hervorgehoben und live aktualisiert, sobald das Feld ausgefüllt wird. In `anschlusspruefung.html` existiert kein vergleichbares Termin-Feld (Anschlussprüfungen sind veranstaltungsbezogen, nicht turnusmäßig) — dort erscheint nur der Infotext ohne Termin-Anzeige.

## 11. Adresse bei Auftraggeber/Betrieb in den Stammdaten

Neues Textfeld "Adresse" direkt unter "Auftraggeber/Betrieb" auf der Startseite. Da die drei Prüfformulare technisch nur ein einziges Auftraggeber-Feld besitzen (kein separates Adressfeld), wird die Adresse beim Übertragen der Stammdaten in dieses eine Feld mit angehängt (Format "Auftraggeber, Adresse") — so bleibt sie im PDF sichtbar, ohne die drei Formulare um ein weiteres Pflichtfeld zu erweitern.

## 12. Standard-NEOZ-Sicherungen bei Hausanschluss/Speisepunkt (Vorsicherung)

Die Schnellauswahl-Buttons bei "Hausanschluss/Vorsicherung" kannten bisher nur NH-Sicherungen. Ergänzt: drei NEOZ-Schnellwahlbuttons (D01 3×20 A gL, D02 3×35 A gL, D02 3×63 A gL) — die in der Theaterpraxis (ältere Bestandsanlagen, kleinere Nebengebäude) verbreitetsten NEOZ-Kombinationen, vor den bestehenden NH-Buttons platziert.

## 13. Gebäude/Bereich in den Stammdaten ausklappbar mit Voreinstellungen

Das bisherige Freitextfeld "Gebäude/Bereich" auf der Startseite ist jetzt eine Dropdown-Auswahl mit den für ein Stadttheater typischen Voreinstellungen (Großes Haus, Kleines Haus, Werkstattbühne, Foyer, Probebühne, Außenspielstätte) plus "Sonstiges..." für freien Text — analog zum bereits in den drei Prüfformularen vorhandenen Muster. Die Auswahl wird beim Übertragen der Stammdaten in die Formulare korrekt vorbelegt.

## 14. + 19. Felder werden bei Schnellauswahl-Befüllung jetzt grün (Bug behoben)

**Gefundene Ursache:** `setValue()` (die Funktion hinter allen Schnellauswahl-Buttons) setzte den Feldwert bisher direkt über `element.value = ...`, **ohne** ein `input`-Event auszulösen. Die Pflichtfeld-Ampel (`initPflichtfelder()`) reagiert aber ausschließlich auf `input`/`change`-Events — per Schnellauswahl befüllte Felder blieben deshalb technisch korrekt befüllt, wurden aber optisch nie als "ausgefüllt" (grün) erkannt, was in der Praxis den Eindruck erweckte, das Feld sei noch offen. `setValue()` löst jetzt zusätzlich ein `input`-Event aus. Betrifft alle Schnellauswahl-Felder in allen drei Formularen (u. a. Sicherungstypen, Kabelquerschnitte, Messgeräte-Voreinstellungen).

Stichprobenartig und systematisch nachgeprüft (Punkt 19): alle über `setValue()` erreichbaren Felder wurden durchsucht — die Korrektur an zentraler Stelle (`pdf-utils.js`) wirkt für alle drei Formulare gleichermaßen, ein einzelnes Nachziehen je Formular war nicht nötig.

## 15. Fehlerstromschutzeinrichtung: Anleitung ans Ende verschoben

In `vde0100.html` stand die Fluke-Kurzanleitung zur RCD-Prüfung bisher **vor** dem Eingabefeld für den gemessenen Auslösestrom — man musste beim Ausfüllen erst daran vorbeiscrollen. Jetzt steht sie wie in den beiden anderen Formularen (dort bereits korrekt) am Ende des RCD-Abschnitts, nach allen Eingabefeldern.

## 16. Bemessungsstrom des RCD als eigenes Feld mit Schnellauswahl

Neues Eingabefeld "Bemessungsstrom I_ΔN" bei der Fehlerstromschutzeinrichtung, mit Schnellauswahl-Buttons für die gängigen Normwerte (10/30/100/300 mA) — bisher gab es dafür keine eigene Erfassungsmöglichkeit, obwohl der Wert für die Bewertung des gemessenen Auslösestroms sicherheitsrelevant ist.

## 17. Statusleiste zeigt jetzt auch Bezeichnung/Zweck des Stromkreises

Die oben fixierte Statusleiste zeigte bisher nur die laufende Nummer der aktuell bearbeiteten Karte ("Stromkreis #3"). Jetzt wird zusätzlich der Inhalt des Bezeichnungsfelds der Karte angezeigt (z. B. "Stromkreis #3 – Schukosteckdose Tonregie"), live aktualisiert, sobald das Bezeichnungsfeld bearbeitet wird — auch ohne die Karte zu verlassen.

## 18. + 20. "-bitte wählen-" jetzt lückenlos bei Erproben und Besichtigen

Bei der Prüfung fielen in `vde0100.html` sechs Erproben-Felder auf (Drehfeld CEE, Polarität/Steckdosenbelegung, RCD-Prüftaste, Sicherheitsbeleuchtung, Drehrichtung Motoren, Gebäudesystemtechnik), die technisch nie leer waren — sie waren fest auf "n.a." vorbelegt statt auf "– bitte wählen –". Ein tatsächlich nicht geprüftes Feld ließ sich damit nicht von einem bewusst als "nicht anwendbar" bewerteten unterscheiden, und die Pflichtfeldprüfung konnte ein übersehenes Feld nicht erkennen. Alle sechs Felder sind jetzt korrekt mit leerer Startoption vorbelegt. Systematisch nachgeprüft (Punkt 20): alle 20 Sicht-/Erproben-Auswahlfelder in `vde0100.html` sowie alle entsprechenden Felder in den beiden anderen Formularen wurden per Skript gegenkontrolliert — außer den genannten sechs war überall bereits korrekt "– bitte wählen –" voreingestellt.

## 21. Neues Feld "IST ABGESCHLOSSEN" bei offenen Prüfungen

Die Liste "Offene Prüfungen" auf der Startseite zeigte bisher jeden angefangenen, noch nicht als PDF exportierten Entwurf gleichrangig an — bei mehreren parallel laufenden Prüfungen wurde unübersichtlich, welche davon inhaltlich fertig sind und nur noch nicht exportiert wurden. Jede Zeile hat jetzt eine Checkbox "IST ABGESCHLOSSEN". Ein angehakter Entwurf bleibt vollständig erhalten und weiterhin über "Öffnen" erreichbar — er wandert nur unter eine eigene Zwischenüberschrift unterhalb der wirklich offenen Prüfungen und wird optisch dezenter dargestellt. Nichts wird dabei gelöscht; das Flag dient ausschließlich der Übersicht.

## 22. Mausrad-Scrollen im Stromkreis-Karussell

Das Stromkreis-Karussell ließ sich bisher nur per Pfeil-Buttons oder Trackpad-Wischgeste durchblättern — ein normales Mausrad scrollt browserseitig nur vertikal und hatte im horizontalen Karussell keine Wirkung. Jetzt wird ein reines vertikales Mausrad-Scrollen, sobald der Mauszeiger über den Stromkreis-Karten steht, in horizontales Blättern umgeleitet. Ist die erste bzw. letzte Karte bereits erreicht, wird das Rad-Event bewusst nicht abgefangen — von dort aus scrollt die Seite ganz normal weiter zu den nächsten Formularabschnitten, das Karussell "fängt" das Mausrad also nicht dauerhaft ein.

## 23. Visuelle Kennzeichnung des Karussell-Charakters

Damit auf den ersten Blick erkennbar ist, dass mehrere Stromkreis-Karten existieren und nur eine davon sichtbar ist, wurden zwei Elemente ergänzt: eine Punkte-Leiste oberhalb des Karussells (ein Punkt je Karte, aktive Karte hervorgehoben; bei mehr als 20 Stromkreisen kompakte Darstellung um die aktuelle Position herum, damit die Leiste bei sehr vielen Kreisen nicht selbst unübersichtlich wird) sowie sanfte Rand-Farbverläufe links/rechts am Kartenbereich ("hier geht es weiter"-Effekt). Beide Elemente sind rein dekorativ und beeinflussen die Bedienung nicht.

## Test-Zusammenfassung

Alle geänderten JS-Dateien: Syntax-Check fehlerfrei (`node --check`, sowohl in der Cloud-Umgebung als auch direkt auf Ihrem Rechner mit Node v22 verifiziert). Alle geänderten HTML-Dateien: `<div>`-Tags ausgezählt und auf Gleichstand von Öffnen/Schließen geprüft (vde0100.html, anschlusspruefung.html, geraetepruefung.html, index.html, archiv.html — überall Übereinstimmung). Die Punkte 18/20 wurden zusätzlich per Skript systematisch statt nur stichprobenartig gegen alle 20 relevanten Auswahlfelder in `vde0100.html` geprüft.

**Nicht möglich in dieser Session:** ein Live-Test im Browser (Formular ausfüllen, PDF erzeugen, Karussell tatsächlich mit dem Mausrad bedienen). Alle Änderungen wurden ausschließlich durch Code-Prüfung und Syntax-Checks abgesichert. **Bitte vor dem produktiven Einsatz insbesondere folgende Punkte im Browser nachprüfen:**

1. Punkt 1 (Foto-Verlust): mehrere Stromkreise mit Fotos anlegen, eine mittlere Karte löschen, neu laden — Fotos müssen weiterhin an der richtigen Karte hängen.
2. Punkt 14/19 (Grün-Färbung bei Schnellauswahl): einen Sicherungstyp/Kabelquerschnitt per Schnellauswahl-Button setzen und prüfen, ob das Feld sofort grün wird.
3. Punkt 21 (IST ABGESCHLOSSEN): Checkbox in der Liste "Offene Prüfungen" setzen und prüfen, dass der Entwurf weiterhin über "Öffnen" erreichbar bleibt.
4. Punkt 22 (Mausrad im Karussell): mit mehreren Stromkreisen tatsächlich mit dem Mausrad über den Karten scrollen, insbesondere den Übergang zur Seite davor/danach an erster/letzter Karte.
5. Punkt 7 (WCAG-Textkennzeichnung): in einem Browser mit `:has()`-Unterstützung (Chrome/Edge/Safari, Firefox ≥121) den Text-Hinweis neben den Pflichtfeld-Labels ansehen.

## Version

`APP_VERSION` / `SW_VERSION`: **7.1.0 → 7.2.0**

## Offene Punkte für Sie

1. Die fünf oben genannten Punkte bitte im Browser nachprüfen, bevor produktiv damit gearbeitet wird.
2. Punkt 9 (M4, M5, M7, M8, N1–N7): bitte bei Gelegenheit bestätigen, ob diese wie vorgesehen in die nächste reguläre Wartung sollen, oder ob einzelne davon (insbesondere M7/M8 mit Nutzerbezug) vorgezogen werden sollen.
3. Punkt 8: die außerhalb des Git-Repos liegende `protokoll-vorlage.html` wurde bewusst nicht angefasst — bitte mitteilen, ob diese Entwickler-Vorlage noch gebraucht wird (dann Pfadfehler beheben) oder gelöscht werden kann.
4. Bitte weiterhin die lokalen Commits nach GitHub pushen bzw. mitteilen, wie Schreibzugriff aus dieser Session eingerichtet werden kann.
