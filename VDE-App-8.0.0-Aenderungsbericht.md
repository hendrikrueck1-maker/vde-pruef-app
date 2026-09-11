# VDE-Prüf-App 8.0.0 — Änderungsbericht

Stand: 13.09.2026. Basis: 7.4.0. Grundlage war der vollständig abgestimmte 21-Punkte-Plan (`VDE-App-8.0.0-Aenderungsplan.md`), der über mehrere Korrekturrunden entstand — unter anderem, weil mehrere Punkte zunächst fälschlich als „bereits erledigt" eingestuft waren, obwohl Code-Existenz nicht automatisch bedeutete, dass sie das eigentlich Gemeinte umsetzten (siehe Teil 6 des Plans). Alle 21 Punkte wurden umgesetzt und gegen den tatsächlichen Code verifiziert.

## 1. Isolationswiderstand: Zusatzfeld „mit/ohne Verbraucher" (vde0100.html)

`vde0100.html`, `js/pdf-generator.js`

Neues Auswahlfeld „Verbraucher angeschlossen?" (Ja/Nein) je Stromkreis-Karte, zusätzlich zum bestehenden Prüfspannungs-Dropdown. Bei „Nein" wird automatisch die neue Option „250 V DC – ohne Verbraucher geprüft (kein Normfall)" vorgewählt (`risoVerbraucherGeaendert()`), der Nutzer kann das weiterhin manuell übersteuern. Die bereits bestehende Option „250 V DC (Praxismessung mit Verbrauchern)" bleibt unverändert als eigene, getrennte Auswahl bestehen. Betrifft ausschließlich `vde0100.html` — die Übergabepunkt-R_ISO in `anschlusspruefung.html` bleibt bewusst unverändert einfach (abgestimmt).

## 2. RCD-Schnellauswahl 100 mA ergänzt

`js/pdf-generator.js`, `js/anschluss-generator.js`

Neuer Schnellauswahl-Button „100 mA" für den Bemessungsfehlerstrom I_Δn, zwischen den bestehenden 30-mA- und 300-mA-Buttons, in beiden betroffenen Formularen.

## 3. Schutzeinrichtungs-Basisdaten-Aufklappmenü (vde0100.html)

`vde0100.html`, `js/pdf-generator.js`, `css/style.css`

Neues, standardmäßig eingeklapptes Panel „Schutzeinrichtungs-Basisdaten" je Stromkreis-Karte (Absicherung, RCD-Typ, I_n, I_Δn — jeweils mit eigener Schnellauswahl), das sich zusätzlich zu den bestehenden Einzelfeldern in die eigentlichen Formularfelder spiegelt (`schutzBasisdatenGeaendert()`/`schutzBasisdatenAusEinzelfeldernUebernehmen()`). Klappt der Nutzer das Panel auf, werden die Basisdaten-Felder automatisch mit den aktuellen Werten der „echten" Felder synchronisiert (analog zum bestehenden Muster der Seriennummer-Synchronisierung aus 7.4.0, Punkt 8). Beide Eingabewege bleiben nebeneinander bestehen — keine Ersetzung der bisherigen Felder. Da nur in die bestehenden Zielfelder gespiegelt wird, war keine separate PDF-Zeichenlogik nötig; das Panel selbst erscheint nicht im PDF.

## 4. Besichtigen/Erproben (vde0100.html): „Doku/Warnung" und „Gebäudesystemtechnik" gestrichen

`vde0100.html`, `js/pdf-generator.js`, `js/archiv.js`

Aus der Besichtigen-Liste entfernt: „Doku/Warnung" (`sicht_doku`, Punkt 6) und „Gebäudesystemtechnik" (`sicht_gst`, Punkt 12) — verbleibende Punkte neu nummeriert (10 statt 12). Aus dem Erproben-Abschnitt entfernt: „Funktion Gebäudesystemtechnik" (`erp_gst`) — verbleibende Punkte neu nummeriert (7 statt 8). Alle Referenzen bereinigt: `sichtLabels`/`erpLabels`-Arrays in `js/pdf-generator.js`, `fillExampleDataStamm()`, sowie der Eintrag `erp_gst` in `ARCHIV_ERP_STANDARDWERT` (`js/archiv.js`). Volltextsuche nach `sicht_doku`/`sicht_gst`/`erp_gst` über alle aktiven App-Dateien bestätigt: keine verwaisten Referenzen mehr vorhanden. Da Blanko-Leerformular und ausgefülltes PDF denselben Zeichencode mit einer `isBlank`-Weiche durchlaufen (keine separate Vorlagendatei), gilt die Bereinigung automatisch auch für das Leerformular.

## 5. Fotodokumentation für Mängel — bereits vollständig vorhanden

`js/fotos.js`, alle drei Formulare

Bei der Umsetzung stellte sich heraus, dass diese Funktion in einer früheren Session (erkennbar an den Code-Kommentaren „G17, ab 7.0.0"/„7.1.0") bereits vollständig gebaut und verdrahtet wurde: optionale Foto-Anlage je Stromkreis-/Übergabepunkt-/Geräte-Karte sowie am zentralen Bemerkungsfeld, mit Komprimierung vor dem Speichern (max. 1600 px, JPEG 0.72), IndexedDB-Speicherung (`vde_fotos`, getrennt vom Archiv), Vorschau-Thumbnails mit Löschfunktion, und eigenem PDF-Anhangkapitel „Fotodokumentation" (`drawFotodokumentationSeite()`) in allen drei Generatoren. Verifiziert: `fotosLeisteHtml()`/`fotoKartenKey()` sind in allen drei HTML-Formularen eingebunden, die zugehörigen CSS-Klassen (`.fotos-leiste`, `.fotos-thumb` usw.) sind in `css/style.css` vorhanden. Es waren keine Codeänderungen nötig — der im Plan als offen markierte Punkt war tatsächlich bereits erledigt.

## 6. Prüffristen-Schnellauswahl einheitlich in allen drei Formularen

`vde0100.html`, `geraetepruefung.html`, `js/pdf-generator.js`, `js/geraete-generator.js`

Neue, sichtbare Schnellauswahl-Buttonleiste (1/2/3 Monate, 1/2/4 Jahre) mit automatischer Terminberechnung, jetzt identisch in allen drei Formularen (`anschlusspruefung.html` hatte sie bereits seit 7.4.0). In `geraetepruefung.html` wurden dabei die bisherigen, abweichenden Intervalle (1/3/6 Monate, 1/2 Jahre) durch die einheitlichen Werte ersetzt (abgestimmte Entscheidung: „Alle 3 Formulare: gleiche Intervalle"). Neue Funktion `updateNaechsterTerminVde0100()` in `js/pdf-generator.js`, analog zu den bereits bestehenden Pendants der anderen beiden Formulare.

## 7. RCD-Typ B+ als fünftes Symbol ergänzt

`img/drehschalter/RCD_Typ_Bplus.png` (neu), `js/infokarten.js`, `js/app-config.js`, `vde0100.html`, `anschlusspruefung.html`

Neues Icon `RCD_Typ_Bplus.png`, kumulativ aus den vorhandenen Symbolen (AC-Sinus + Pulsstrom, hochfrequente Zackenkurve, gestrichelte Gleichstromlinien) plus neuem kHz-Symbol zusammengesetzt — Aufbau anhand der beiden offiziellen Fluke-Referenzhandbücher (1662/1663/1664 FC sowie 6500-2, per `pdftotext -layout` ausgewertet) verifiziert: Der Fluke 1663 testet Typ B+ mit derselben „glatter Gleichstrom"-Wellenform wie Typ B (das Gerät unterscheidet elektrisch nicht zwischen beiden). RCD-Typ-Auswahl in beiden betroffenen Formularen um „Typ B+" erweitert, Legendentext in `js/infokarten.js` ergänzt („zusätzlich sinusförmige Wechselfehlerströme bis 20 kHz, gehobener Brandschutz"), neues Icon in `CORE_ASSETS` (`js/app-config.js`) für den Offline-Cache aufgenommen.

## 8. Blanko-PDF-Leerformulare — verifiziert, keine Änderung nötig

`js/pdf-generator.js`, `js/anschluss-generator.js`, `js/geraete-generator.js`

Geprüft: Das „Leerformular" ist keine separate Vorlagendatei, sondern derselbe Zeichencode wie das ausgefüllte PDF, gesteuert über einen `isBlank`-Parameter (`generatePDF(true)` usw.). Jede neue Sektion, jedes entfernte Feld und jede Neunummerierung dieser Version verwendet durchgängig `isBlank`-bewusste Hilfsfunktionen (`drawFeldZeile(..., isBlank)`, `drawCheckbox(..., !isBlank && …)`) und wurde einzeln nachvollzogen — unter anderem der neue Anschlusskabel-Abschnitt, der neue Erproben-Abschnitt in `anschlusspruefung.html`, sowie die neue Netzmessungs-Pflichtfeld-Sperre (die korrekt nur bei `!isBlank` greift). Damit gelten alle Struktur-Änderungen dieser Version automatisch auch für das Leerformular, ohne dass eine zusätzliche Vorlagendatei gepflegt werden müsste. (Die separat im Repository vorhandene Datei `protokoll-vorlage.html`/`protokoll-vorlage-generator.js` ist kein Blanko-Formular, sondern ein Entwickler-Gerüst zum Anlegen eines vierten, künftigen Protokolltyps — siehe Hinweis am Ende dieses Berichts.)

## 9. Neuer Abschnitt „Anschlusskabel der Anlage" (vde0100.html und anschlusspruefung.html)

`vde0100.html`, `anschlusspruefung.html`, `js/pdf-generator.js`, `js/anschluss-generator.js`

Neuer, einmaliger Abschnitt für das Hauptzuleitungskabel der Anlage bzw. des Übergabepunkts (Kabeltyp, Leiteranzahl, Querschnitt) — eingefügt nach „Besichtigen", vor den messtechnischen Prüfungen. In `vde0100.html` waren die zugehörigen Felder bereits vor dieser Session vorhanden (nur unnummeriert); sie wurden jetzt zu einem eigenen, nummerierten Abschnitt „4. Anschlusskabel der Anlage" zusammengefasst. In `anschlusspruefung.html` wurde der komplette Abschnitt neu gebaut, inklusive einer neuen PDF-Box (SEK2B). Die bereits bestehenden Kabelfelder je einzelner Stromkreis-Karte in `vde0100.html` bleiben davon unberührt — das ist bewusst eine zweite, separate Ebene.

## 10. Neuer Abschnitt „Erproben (Funktionsprüfung)" in anschlusspruefung.html

`anschlusspruefung.html`, `js/anschluss-generator.js`

`anschlusspruefung.html` hatte bisher keinen Erproben-Abschnitt. Neu ergänzt: „Schutzeinrichtungen", „RCD-Prüftaste betätigt", „Drehrichtung Motoren" (je i.O./n.i.O./n.a.), analog zum bestehenden Erproben-Abschnitt in `vde0100.html`, aber bewusst ohne „Funktion Anlage", „Drehfeld CEE" und „Polarität/Steckdosenbelegung" (die laut Zuordnungstabelle nur am Anlagen-, nicht am Übergabepunkt-Protokoll vorkommen). Neue PDF-Box (SEK3B) mit 3-Spalten-Layout, inklusive Seitenumbruch-Absicherung (`pdfPlatzPruefen`). Die neuen `.erp-item`-Felder wurden zusätzlich vollständig ins bestehende Speicher-/Wiederherstellungs- und Pflichtfeld-System eingebunden (`collectAnschlussState()`, `ersteLeereAuswahl()`) — das fehlte in `js/anschluss-generator.js` bisher komplett, weil dieses Formular vorher gar keine Erproben-Felder hatte.

## 11. Abschnittsreihenfolge, Titel und Nummerierung vereinheitlicht

`vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`

Neue, verbindliche Reihenfolge in `vde0100.html` (9 Abschnitte, Anschlusskabel neu an Position 4) und `anschlusspruefung.html` (9 Abschnitte, Anschlusskabel an Position 4, Erproben neu an Position 6) umgesetzt, jeweils mit korrekter Neunummerierung aller nachfolgenden Abschnitte (inklusive `initStatusleiste()`-Sprungnavigation). Abschnittstitel „Netzsystem, Netzbetreiber & Prüfgeräte" in beiden Formularen zu „Netzsystem, Netzbetreiber" gekürzt (Prüfgerät + Seriennummer stehen bereits in den Stammdaten). In `geraetepruefung.html` wurde „Prüfart" (bisher Teil der Stammdaten) als eigener, sichtbarer Abschnitt „2. Prüfart" herausgelöst, alle Folgeabschnitte entsprechend neu nummeriert.

## 12. „Grund der Prüfung" in allen drei Formularen

`anschlusspruefung.html`, `geraetepruefung.html`, `js/anschluss-generator.js`, `js/geraete-generator.js`

Das bisher nur in `vde0100.html` vorhandene Feld `pruefgrund` wurde in `anschlusspruefung.html` (Abschnitt „Netzsystem, Netzbetreiber") und `geraetepruefung.html` (neuer Abschnitt „Prüfart") ergänzt, inklusive PDF-Ausgabe und Autosave-Wiring in beiden Generatoren.

## 13. Gebäude/Bereich-Verwaltung (Hinzufügen/Entfernen eigener Einträge)

`js/storage.js`, `css/style.css`, `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`

Die bisher fest im HTML einprogrammierte Gebäude/Bereich-Liste kann jetzt über einen neuen „Verwalten"-Button direkt neben dem Dropdown erweitert werden. Neuer, selbstgebauter `<dialog>`-basierter Verwaltungsdialog (`gebaeudeVerwaltenOeffnen()`) mit Liste der eigenen Einträge (je mit „Entfernen"-Button), Eingabefeld + „+ Hinzufügen"-Button (auch per Enter-Taste), und „Fertig"-Button. Gespeichert wird eine gemeinsame Zusatzliste in `localStorage` (`vde_gebaeude_zusatz`), die einheitlich für alle drei Prüfformulare gilt (`gebaeudeOptionenAktualisieren()` fügt die Einträge dynamisch vor „Sonstiges..." ein) — die Startseite (`index.html`) behält bewusst ihre eigene, unabhängige Liste. Neue CSS-Klassen für Dialog, Liste und Buttons ergänzt (`.gebaeude-verwalten-*`, `.btn-klein`). Per echtem Browser-Test verifiziert: neuer Eintrag hinzufügen, Dialog schließen, Eintrag erscheint im Dropdown — funktioniert wie vorgesehen.

## 14. Vier statt zwei Stammdatenfelder für die Prüfgeräte

`index.html`, `js/storage.js`

Der Gerätename war bisher fest im Label-Text einprogrammiert („Fluke 1663"/„Fluke 6500-2") und nicht editierbar — nur die Seriennummer war ein freies Feld. Jetzt vier vollständig freie Felder: Installationstester (Name/Typ) + Seriennummer, Gerätetester (Name/Typ) + Seriennummer — mit den bisherigen Fluke-Bezeichnungen nur noch als Vorbelegung, nicht als fester Text. `applyMasterDataToForm()` übernimmt beim Öffnen eines der drei Prüfformulare automatisch sowohl den passenden Gerätenamen als auch die passende Seriennummer in die dortigen gemeinsamen Felder „Verwendetes Prüfgerät"/„Seriennummer Messgerät" (gleiche Formulartyp-Erkennung wie bereits seit 7.4.0 für die Seriennummer). Rückwärtskompatibel: das alte gemeinsame Feld bleibt als verstecktes Reservefeld bestehen.

## 15. Grün/Gelb-Buttons direkt in jeder Protokolltyp-Kachel

`index.html`, `js/entwuerfe.js`, `css/style.css`

Jede der drei Protokolltyp-Kacheln auf der Startseite hat jetzt zwei eigene Buttons statt nur die bisherigen zwei globalen: ein grüner „+ Neues Protokoll" (immer sichtbar, legt über einen neuen `?neu=1`-URL-Parameter beim Formularaufruf sofort und ohne Rückfrage einen frischen Entwurf an) und ein gelber „▶ Protokoll fortsetzen" (nur sichtbar, wenn für genau diesen Protokolltyp mindestens ein offener, nicht abgeschlossener Entwurf existiert — führt direkt zum zuletzt bearbeiteten davon, mit Anzeige der Anzahl bei mehreren offenen Entwürfen desselben Typs). Die bisherigen globalen, typübergreifenden Buttons „+ Neues Protokoll"/„▶ Letztes weitermachen" (seit 7.4.0) bleiben zusätzlich bestehen. Neue Handhabung von `?neu=1` in `entwurfAusUrlUebernehmen()` (`js/entwuerfe.js`), neue CSS-Klasse `.btn-warning` für den gelben Button.

**Bug gefunden und behoben (noch vor Auslieferung):** Die Hilfszuordnung `KACHEL_PRAEFIX` war ursprünglich als `var`-Deklaration unterhalb von `renderProtokollKacheln()` im selben Skript platziert. Da `renderProtokollKacheln()` aber bereits am Anfang des Skripts aufgerufen wird (noch bevor die spätere Zuweisung zur Laufzeit erreicht ist), war `KACHEL_PRAEFIX` beim ersten Rendern der Kacheln `undefined` — ein per echtem Headless-Browser-Test entdeckter `TypeError` beim Laden von `index.html`, der sämtliche „Protokoll fortsetzen"-Buttons verhindert hätte. Behoben durch Verschieben der Deklaration an den Anfang des Skripts, vor den ersten Aufruf von `renderProtokollKacheln()`. Nach dem Fix lädt `index.html` fehlerfrei, und die gelben Buttons erscheinen korrekt, sobald ein offener Entwurf existiert (per Test verifiziert).

## 16. Archiv und Entwurfsliste: zusätzliche Spalten

`js/archiv.js`, `archiv.html`, `js/entwuerfe.js`, `js/pdf-generator.js`, `js/anschluss-generator.js`, `js/geraete-generator.js`, `css/style.css`

Sowohl das Archiv als auch die Liste „Offene Prüfungen" auf der Startseite zeigen jetzt zusätzlich zur bisherigen Anlagenbezeichnung: Standort (aus „Auftraggeber/Prüfort" bzw. dem spezifischeren „Standort Übergabepunkt", falls vorhanden), Gebäude/Bereich, Anlage, sowie die typspezifische Anzahl (Stromkreise/Geräte/Übergabepunkte). Im Archiv wurde dazu `archivMetaSammeln()` um ein neues Feld `standort` ergänzt und die bestehende Sub-Zeile in `archiv.html` erweitert. Bei der Entwurfsliste wurde `entwurfMerken()` (`js/entwuerfe.js`) um vier neue, einzeln gespeicherte Felder (`standort`, `gebaeude`, `anlage`, `anzahl`) ergänzt, statt wie bisher nur eine zusammengesetzte Anzeige-Bezeichnung zu führen — alle drei Generatoren übergeben diese Werte jetzt beim Autosave. Neue CSS-Klasse `.offene-pruefung-zusatz` für die zusätzliche Zeile. Per echtem Browser-Test verifiziert: ein neu angelegter Entwurf mit Anlagenbezeichnung erscheint korrekt mit der neuen Zusatzzeile in der Liste „Offene Prüfungen".

## 17. Netzmessung: echte Pflichtfeld-Sperre bei Nicht-Festanschluss

`js/anschluss-generator.js`

Bei jeder Einspeisungsart außer „Festanschluss / Zählerschrank" (also insbesondere Steckstelle/Baustromverteiler/Generator) wird die PDF-Erstellung jetzt verweigert, solange die Netzmessung (U L1-N) an einem oder mehreren Übergabepunkten fehlt — mit klarer Fehlermeldung inklusive betroffener Übergabepunkt-Nummer(n) und automatischem Fokus auf das erste fehlende Feld. Analog zur bereits bestehenden Sperre für die U-N-PE-Messung. Greift korrekt nur bei `!isBlank` (Leerformular bleibt unberührt).

## 18. Vorgemerkt, nicht umgesetzt: RCD-Icon-Update (Teil 6.6 des Plans)

Der Plan sah vor, dass Hendrik verbesserte RCD-Typ-Icons mit neuem Begleittext in einer der nächsten Nachrichten nachliefert. Diese Dateien wurden bis zum Abschluss dieser Version nicht übermittelt — Punkt 7 (Typ B+) wurde daher mit einem selbst erstellten, an den offiziellen Fluke-Referenzunterlagen verifizierten Icon umgesetzt. Sollten die angekündigten Dateien nachträglich eintreffen, ist ein Abgleich/Austausch in einer Folgeversion nötig.

## Cross-Check: verwaiste Feldreferenzen

Nach Abschluss aller Änderungen wurde systematisch nach verwaisten Referenzen gesucht:

- `sicht_doku`/`sicht_gst`/`erp_gst`: keine Treffer mehr in aktiven App-Dateien.
- `AUTOSAVE_FIELD_IDS`/`ANSCHLUSS_FIELD_IDS`/`GERAETE_FIELD_IDS` (40/33/19 Einträge): jede referenzierte ID wurde gegen die tatsächlichen `id`-Attribute der jeweiligen HTML-Datei geprüft — keine fehlenden Felder.
- `sichtLabels`/`erpLabels`-Arrays in `js/pdf-generator.js` (10/7 Einträge) und `js/anschluss-generator.js` (6/3 Einträge): Anzahl stimmt exakt mit der Anzahl der `.sicht-item`/`.erp-item`-Felder im jeweiligen HTML überein.
- `ARCHIV_UEBERNEHMEN`-Liste (`js/archiv.js`): referenziert Schlüssel im gespeicherten Formularzustand (nicht direkt HTML-IDs) — Stichprobe bestätigt korrekte Zuordnung, `veranstaltung` bleibt bewusst als Altlast-Kompatibilitätsfeld dokumentiert.

## Verifikation

- `node --check` auf allen Dateien in `js/*.js`: fehlerfrei.
- `tidy -e` auf allen fünf aktiven HTML-Seiten (`index.html`, `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`, `archiv.html`): fehlerfrei.
- **Echter Headless-Browser-Test durchgeführt** (Playwright + vorinstalliertes Chromium, lokaler HTTP-Server): Alle fünf Seiten laden ohne JavaScript-Fehler. Die Gebäude-Verwalten-Dialoge wurden interaktiv geöffnet, ein Eintrag hinzugefügt und wieder im Dropdown wiedergefunden. Die neuen Grün/Gelb-Kachel-Buttons wurden nach Anlegen eines Entwurfs korrekt mit „▶ Protokoll fortsetzen" samt Anlagenbezeichnung verifiziert. Alle drei Formulare wurden mit den eingebauten Beispieldaten befüllt und sowohl das Leerformular als auch (nach Ergänzung der von der Beispieldaten-Funktion nicht abgedeckten Pflichtauswahlfelder — eine bereits im 7.4.0-Bericht dokumentierte, von dieser Version unabhängige Lücke) das ausgefüllte PDF erfolgreich erzeugt.
- **Ein echter Bug wurde durch den Browser-Test gefunden und noch vor Fertigstellung behoben** (siehe Punkt 15): eine `var`-Hoisting-Falle bei `KACHEL_PRAEFIX` in `index.html`, die beim ersten Laden zu einem `TypeError` und fehlenden „Protokoll fortsetzen"-Buttons geführt hätte.
- Volltextsuche nach verwaisten Feldreferenzen (siehe eigener Abschnitt oben): keine Treffer.

## Sonstiger Befund (informativ, keine Änderung vorgenommen)

Im Projektstamm liegen weiterhin veraltete, nicht mehr referenzierte Dateien: ein root-level `storage.js` sowie ein kompletter Ordner `ZUM-HOCHLADEN/` mit einer alten Kopie der gesamten App (Version 4.7.0, erkennbar an `app-config.js` im Wurzelverzeichnis). Beide werden von keiner aktiven HTML-Seite eingebunden (Volltextsuche nach `<script src="..."` bestätigt: ausschließlich `js/*.js`-Pfade werden referenziert) und sind für den Betrieb irrelevant. Zusätzlich existiert `protokoll-vorlage.html`/`protokoll-vorlage-generator.js` (Wurzelverzeichnis) sowie eine ältere Zwischenkopie davon im Ordner `vorlage/` — das ist, wie in Punkt 8 erwähnt, ein bewusst mitgeliefertes Entwickler-Gerüst für einen künftigen vierten Protokolltyp (siehe `docs/ERWEITERN.md`), kein Blanko-Leerformular der bestehenden drei Protokolltypen. Alle vier genannten Fundstellen wurden bewusst nicht angefasst, da weder Löschen noch Ändern beauftragt war — zur Aufräumung ggf. bei Gelegenheit prüfen.

## Version

`APP_VERSION` / `SW_VERSION`: **7.4.0 → 8.0.0**

## Offene Punkte für Sie

1. **Punkt 18**: Die angekündigten, verbesserten RCD-Icons wurden noch nicht übermittelt — Typ B+ wurde stattdessen selbst erstellt und anhand der offiziellen Fluke-Referenzunterlagen verifiziert. Bitte bei Erhalt der eigenen Dateien einen Abgleich in einer Folgeversion einplanen.
2. Bitte vor Produktiveinsatz mindestens einmal je Formulartyp ein vollständiges Beispiel-PDF erzeugen und insbesondere die neuen Abschnitte (Anschlusskabel, Erproben in der Anschlussprüfung, Schutzeinrichtungs-Basisdaten-Panel) mit den bisherigen Referenz-PDFs vergleichen.
3. Die im „Sonstiger Befund" genannten veralteten Dateien (`storage.js` im Wurzelverzeichnis, `ZUM-HOCHLADEN/`) können bei Gelegenheit gelöscht werden — sie wurden bewusst nicht ohne Rückfrage entfernt.
4. Alle Änderungen wurden lokal im Arbeitsverzeichnis vorgenommen; die Übertragung ins GitHub-Repository (`hendrikrueck1-maker/vde-pruef-app`, Branch `main`) erfolgt im Anschluss an diesen Bericht.
