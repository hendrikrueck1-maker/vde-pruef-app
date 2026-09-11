# VDE-Prüf-App 7.4.0 — Änderungsbericht

Stand: 11.09.2026. Basis: 7.3.0. Grundlage war ein Auftrag mit 11 nummerierten Punkten plus zwei lettierten Punkten (A, B). Alle Punkte wurden gegen den tatsächlichen Code verifiziert (nicht nur gegen die Auftragsbeschreibung) und umgesetzt bzw. — wo bereits korrekt — als bereits erfüllt dokumentiert.

## 1. Anschlussprüfung: Stammdaten überarbeitet

`anschlusspruefung.html`, `js/anschluss-generator.js`

- **Entfernt:** „Prüflings-ID" (`pruefungsnummer`) und „Veranstaltung/Anlass" (`veranstaltung`, Freitext-Textarea).
- **Neu:** „Anlage/Objekt" (`anlage_bez`) ersetzt beide entfernten Felder inhaltlich — sowohl als Klartextangabe im Formular als auch als Ersatz für die „Prüflings-ID" im PDF-Kopf (dort steht jetzt „Anlage/Objekt:" statt „Prüflings-ID:", siehe `pruefNrLabel` in `drawProtokollSeitenkoepfe()`, `js/pdf-utils.js`).
- **Aufgeteilt:** Das bisherige Feld „Firma / Netzbetreiber / Vermieter" (`vnb`) ist jetzt zwei getrennte Felder: „Firma/Vermieter" (`firma_vermieter`, neu) und „Netzbetreiber" (`vnb`, unverändert weiterverwendet).
- Ansprechpartner/Telefon sind jetzt ausdrücklich als „(optional)" beschriftet und nicht mehr in der Pflichtfeld-Fortschrittsanzeige verpflichtend.
- **Neu:** Netzspannungs-Schnellauswahl (230/230-400/400 V) und Hausanschluss/Speisepunkt-Schnellauswahl (NH 3x100A/NH 3x63A/CEE 63A/CEE 125A/NEA) — 1:1 aus `vde0100.html` übernommenes Muster.
- Die alten Netzmessungs-Freitextfelder der Stammdaten sind ersatzlos entfernt — sie sind durch die neue, fachlich richtigere Lösung in Punkt 2 ersetzt.

## 2. Netzmessung an den Übergabepunkt verschoben (größter Einzelpunkt)

`anschlusspruefung.html`, `js/anschluss-generator.js`

Die Netzmessung ist aus den globalen Stammdaten in jede einzelne Übergabepunkt-Karte gewandert — fachlich richtig, weil an einer Veranstaltung mehrere Übergabepunkte mit unterschiedlicher Netzqualität existieren können. Jede Karte erhält jetzt:

- **Drehstrom/1-phasig-Auswahl** je Karte (`istFeedDrehstrom()`/`updateFeedNetzart()`), 1:1-Verhalten wie in `vde0100.html`, aber **bewusst kartenbezogen statt global** implementiert, da die Anschlussprüfung mehrere gleichzeitige Übergabepunkt-Karten kennt (ein einzelner globaler Schalter wie in `vde0100.html` wäre hier fachlich falsch gewesen). Bei „1-phasig" blenden sich L2-N/L3-N/L1-L2/L2-L3/L1-L3 automatisch aus.
- **±10 % Netzspannungstoleranz** nach DIN EN 50160 (Wiederverwendung von `NETZSPANNUNG_TOLERANZ`/`netzspannungAusserNorm()`/`validateFeedNetzspannungsfeld()` aus `pdf-utils.js`).
- **Netzimpedanz Z_L-N** je Karte inklusive Grenzwertbewertung (`.c-zln`, analog zu `vde0100.html`), mit automatischer I_K2-Berechnung.
- **U_L (Berührungsspannung)** bei der RCD-Prüfung — bewusst „U_L" genannt, **nicht** „Berührungsstrom"/„I_t" (Begriffskorrektur laut Auftrag), mit Gefährdungsbereich-Auswahl (Normal 50 V / erhöht 25 V) und automatischer Grenzwertanzeige.
- **Durchgängigkeit Potenzialausgleich** als eigenes, neues Feld je Karte (`.c-pa-durchg`/`.c-pa-widerstand`). **Wichtig:** Das bereits bestehende globale Feld „Potenzialausgleich … vorhanden" (Abschnitt 5) wurde **nicht ersetzt**, sondern beide Felder bleiben nebeneinander bestehen — das globale Feld beschreibt das grundsätzliche Anlagenkonzept, das neue Feld den tatsächlichen Messwert an genau diesem Übergabepunkt. Die Beschriftung des globalen Felds wurde auf „… grundsätzlich vorhanden (Konzept)" präzisiert, mit erklärendem Hinweistext, um Verwechslung auszuschließen.
- **Drehfeldrichtung** je Karte (rechts-/linksdrehend), inkl. korrekter Bewertung im PDF (ein Linksdrehfeld war bisher nur Dokumentation, jetzt echte Beanstandung).
- **Isolationswiderstand R_ISO** je Karte mit Grenzwertbewertung (≥ 1,0 MΩ, analog `vde0100.html`).

Die komplette PDF-Messtabelle (Sektion 3) wurde entsprechend neu aufgebaut: Netzsystem/-art und Einzelspannungen, R_PE/R_ISO/U_N-PE/PA-Durchgängigkeit in einer zusammengefassten Zelle, Z_S/Z_L-N/I_K in einer Zelle, RCD-Zelle wie gehabt, U_L als eigene Spalte. Aus Platzgründen (A4 hochkant, 9 Spalten bleiben lesbar) wurden mehrere neue Messgrößen mehrzeilig in bestehende Zellen statt in eigene Spalten gepackt — Legende und Spaltenköpfe wurden entsprechend erweitert. Blindformular und Fortsetzungsblätter wurden auf dieselbe 9-Spalten-Struktur umgestellt.

## 3. Besichtigen: von 9 auf 6 Prüfpunkte reduziert

`anschlusspruefung.html`, `js/anschluss-generator.js`

Entfernt wurden genau die drei benannten Punkte: „Zugänglichkeit/Fluchtwege", „Zugang Not-Aus/Hauptschalter", „Prüfplakette/Typenschild Verteiler". **Hinweis zur Auftragsformulierung:** Der Auftrag sprach von „9 → 7 Punkte", nannte aber ebenfalls genau diese drei zu entfernenden Punkte — rechnerisch ergibt das 9 − 3 = 6, nicht 7. Umgesetzt wurde die tatsächliche Subtraktion (6 verbleibende, neu nummerierte Punkte: Verteiler/Zählerschrank, Steckvorrichtungen/Kupplungen, Zuleitung/Kabel, Kennzeichnung/Beschriftung, Witterungsschutz, Berührungsschutz/Abdeckungen), nicht die im Auftrag genannte Zahl „7". Bitte kurz bestätigen, dass 6 Punkte korrekt ist.

## 4. Prüfintervall für die Anschlussprüfung + Prüfdatum-Basis-Bugfix

`anschlusspruefung.html`, `geraetepruefung.html`, `js/anschluss-generator.js`, `js/geraete-generator.js`

- Neues Prüfintervall-Dropdown in der Anschlussprüfung (1/2/3 Monate, 1/2/4 Jahre) mit automatischer Terminberechnung (`updateNaechsterTerminAnschluss()`, neu). Die Werte weichen bewusst von der Geräteprüfung ab (1/3/6 Monate, 1/2 Jahre) — beides sind fachlich unterschiedliche Regime (ortsfeste/Veranstaltungs-Einspeisung vs. ortsveränderliche Geräte), die im Auftrag jeweils explizit unterschiedlich benannt wurden. Keine Änderung nötig, aber zur Transparenz hier dokumentiert.
- **Bug gefunden und behoben:** Der Auftrag ging davon aus, der „Prüftermin berechnet sich aus Prüfdatum statt heute"-Bug sei in `vde0100.html`/`geraetepruefung.html` bereits behoben. Bei der Code-Prüfung stellte sich heraus, dass `updateNaechsterTermin()` in `js/geraete-generator.js` tatsächlich **weiterhin** `new Date()` (den Tag der Bearbeitung) statt des eingetragenen Prüfdatums als Basis verwendete — der Bug war in der Geräteprüfung noch nicht behoben. Jetzt korrigiert: Basis ist das Prüfdatum-Feld (`#datum`), mit „heute" nur als Rückfallwert, solange kein Prüfdatum gesetzt ist. Zusätzlich wurde ein `onchange`-Handler am Prüfdatum-Feld ergänzt (in beiden Formularen), damit sich der Termin bei nachträglicher Datumsänderung automatisch aktualisiert. Dieselbe korrekte Logik wurde von Anfang an in `updateNaechsterTerminAnschluss()` verwendet.
- Die Infokarte „Wie wird die Prüffrist bestimmt?" ist strukturell identisch in allen drei Formularen verankert (`#pruefdatum_infokarte_platzhalter` in Abschnitt 1) — für die Anschlussprüfung wurde der Erklärtext inhaltlich überarbeitet (siehe Punkt 9).

## 5. Fluke 6500-2 Kurzanleitung geprüft

`js/infokarten.js`, `js/geraete-generator.js`

Geprüft, ob die Fluke-6500-2-Anleitungstexte in `js/infokarten.js` (`MESSGROESSEN_INFO.*.fluke6500`) von der Fluke-1663-Anleitung kopiert wurden. **Ergebnis: nein.** Alle `fluke6500`-Textblöcke beschreiben durchgängig generische Messfunktionen („Drehschalter auf die Isolationswiderstands-Messfunktion stellen") statt der gerätespezifischen Drehschalter-Positionsnamen des Fluke 1663 (`Riso`, `Rlo`, `V,Hz`, `Phase`, Taste `TEST`) — diese gerätespezifischen Bezeichnungen kommen ausschließlich in den `fluke1663`-Blöcken vor. Für den Ableitstrom-Block gibt es sogar eine eigene, nur für den Fluke 6500-2 geschriebene Anleitung mit drei Messmethoden (Ersatzableitstrom/Differenzstrom/Direktmessung), die im Fluke-1663-Block gar nicht existiert (dort gibt es keine Ableitstrommessung). Der RCD-Block hat konsequenterweise **kein** `fluke6500`-Feld, weil einzelne Geräte nach DIN EN 50699 nicht auf RCD-Auslösezeit geprüft werden (das ist eine Prüfung der festen Installation). Die Drehschalter-Icons (`img/drehschalter/*.png`) werden für die Geräteprüfung ausdrücklich **nicht** angezeigt (bereits vorhandener Code-Kommentar „kein Drehschalter-Icon … am Fluke 6500-2 gibt es keine entsprechende einzelne Schalterstellung") — auch das ist korrekt und keine Bildkopie vom 1663.

**Unsicherheit, die offenbleibt:** Ich habe kein offizielles Fluke-6500-2-Datenblatt zur Verfügung und konnte die inhaltliche Richtigkeit der Bedienschritte (z. B. exakte Bezeichnung der Messfunktion am Drehschalter) nicht gegen die Originalanleitung verifizieren, sondern nur gegen internes Fachwissen und die Abgrenzung zum 1663. Der bestehende, zentrale Disclaimer in `anleitung.html` („Inoffizielle, selbst erstellte Kurzanleitung … keine geprüfte Übersetzung der offiziellen Fluke-Bedienungsanleitung") deckt dieses Risiko bereits ab und wurde nicht verändert. **Bitte insbesondere die Fluke-6500-2-Schritte stichprobenartig gegen das reale Gerät prüfen.**

## 6. „Neues Protokoll" / „Letztes weitermachen" auf der Startseite

`index.html`, `js/entwuerfe.js`

Zwei neue, prominente Buttons oberhalb der Protokolltyp-Kacheln:

- **„+ Neues Protokoll"** springt zur bestehenden Kachelauswahl (Anker-Link, kein neuer Mechanismus).
- **„▶ Letztes weitermachen: …"** führt direkt zum zuletzt bearbeiteten, noch nicht abgeschlossenen Entwurf — unabhängig vom Protokolltyp. Erscheint nur, wenn ein solcher Entwurf existiert.

Beide Buttons nutzen ausschließlich die bestehende Autosave-/Entwurfsinfrastruktur aus `js/entwuerfe.js`: neu ist lediglich die kleine Hilfsfunktion `letzterOffenerEntwurf()`, die dieselbe Datenquelle wie die bereits vorhandene Liste „Offene Prüfungen" verwendet (`entwuerfeFuerTyp()`), damit beide Stellen immer denselben Entwurf als „zuletzt" ausweisen. Kein paralleler Speichermechanismus.

## 7. Geräteprüfung: Prüflings-ID entfernt, Fluke-6500-2-Konsistenz bestätigt

`geraetepruefung.html`, `js/geraete-generator.js`

„Prüflings-ID" (`pruefungsnummer`) entfernt — bei mehreren Geräten je Protokoll gab es ohnehin keine sinnvolle 1:1-Zuordnung zu einer einzelnen Prüflings-ID. Ersetzt durch „Anlage/Objekt" (`anlage_bez`, siehe auch Punkt 11), inklusive Anpassung des PDF-Kopfs (gleiches `pruefNrLabel`-Muster wie in Punkt 1) und einer zusätzlichen Stammdaten-Zeile im PDF-Textkasten. Verifiziert: Der Fluke 6500-2 (nicht 1663) wird in der Geräteprüfung bereits durchgängig korrekt referenziert (`messgroesseBlock(..., 'fluke6500')`); der Fluke 1663 bleibt zu Recht ausschließlich in Anlagen- und Anschlussprüfung im Einsatz.

## 8. Getrennte Seriennummern für Installationstester und Gerätetester

`index.html`, `js/storage.js`

Die zentralen Stammdaten hatten bisher ein einziges Feld „Seriennummer Messgerät" für beide Prüfgeräte — dieselbe Nummer landete dadurch fälschlich sowohl in der Anlagen-/Anschlussprüfung (Installationstester) als auch in der Geräteprüfung (Gerätetester), sobald beide Geräte parallel im Einsatz waren. Jetzt gibt es zwei getrennte Felder: „Seriennummer Installationstester (Fluke 1663)" und „Seriennummer Gerätetester (Fluke 6500-2)". `applyMasterDataToForm()` (js/storage.js) erkennt beim Öffnen eines Formulars automatisch den Formulartyp (dieselbe Container-ID-Erkennung wie in `js/infokarten.js`) und trägt die passende Nummer in das dortige, unverändert sichtbare Feld „Seriennummer Messgerät" ein — das Feld bleibt überschreibbar, wird aber nie unsynchronisiert doppelt geführt. Das alte gemeinsame Feld bleibt als verstecktes, rückwärtskompatibles Reservefeld bestehen (ältere gespeicherte Stammdaten verlieren dadurch keine Angabe).

## 9. Prüffristen-Infokarte konsistent verankert und inhaltlich aktualisiert

`js/infokarten.js`

Verifiziert: Die Infokarte hängt strukturell identisch (`#pruefdatum_infokarte_platzhalter` in Abschnitt 1) in allen drei Formularen. Da die Anschlussprüfung jetzt (Punkt 4) ein echtes Prüfintervall-Feld mit automatischer Terminberechnung hat, war der bisherige Erklärtext („kein fester Wiederholungszyklus vorgesehen") nicht mehr zutreffend — er wurde überarbeitet und erklärt jetzt die neue Doppelbedeutung des Intervall-Felds (planmäßige Wiederprüfung einer wiederkehrend genutzten Einspeisestelle **oder** kürzeste Option bei einem einmaligen Übergabepunkt), ohne die bisherige fachliche Kernaussage zur Anlage hinter dem Übergabepunkt zu verändern.

## 10. „Schutzleiter & Spannung N-PE" aus den Stammdaten entfernt — eigene Entscheidung, bitte prüfen

`anschlusspruefung.html`

**Dies war im Auftrag ausdrücklich als offene Entscheidung markiert — bitte besonders sorgfältig gegenprüfen.** Wörtlich verlangt war die Entfernung der alten Sektion „Schutzleiter & Spannung N-PE" aus den Stammdaten. Eine rein wörtliche Umsetzung hätte die N-PE-Messung und -Bewertung komplett aus der App entfernt — fachlich wäre das ein Rückschritt, da die N-PE-Spannung laut bestehendem Code-Kommentar „der einzige Wert [ist], der eigenständig einen Fehler findet (hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat)".

**Getroffene Entscheidung:** Ich habe „entfernen" so ausgelegt, dass die **alte Position/Anzeige** in den globalen Stammdaten entfernt wird, die N-PE-Messung fachlich aber **nicht ersatzlos gestrichen**, sondern in die neue, ohnehin für Punkt 2 gebaute Übergabepunkt-Tabelle integriert wird (dort korrekt je Übergabepunkt statt global für die ganze Anlage). Das entspricht auch der bereits im Formular vorhandenen Argumentation, warum die Netzmessung überhaupt aus den Stammdaten wandert. **Falls das nicht der gewünschten Interpretation entspricht** (z. B. falls tatsächlich eine komplette Streichung ohne Ersatz gewünscht war), bitte kurz Rückmeldung geben — die Änderung ist leicht rückgängig zu machen, da die N-PE-Logik zentral in `pdf-utils.js` liegt (`U_NPE_SCHWELLE`, `npeUeberschritten()`) und unverändert blieb.

## 11. Anlage/Objekt im Archiv für alle Protokolltypen

`geraetepruefung.html`, `js/geraete-generator.js`

Verifiziert: Ein Feld „Anlage/Objekt" (`anlage_bez`) existierte bereits in `vde0100.html`, und die Archiv-Anzeige (`archiv.js`/`archiv.html`) zeigte es dort bereits an (Listenübersicht und Detailansicht, siehe 7.3.0-Bericht Punkt 7). Für die Anschlussprüfung wurde das Feld bereits im Zuge von Punkt 1 ergänzt. **Fehlend war es nur in der Geräteprüfung** — dort wurde es jetzt ergänzt (siehe auch Punkt 7, wo es die entfernte Prüflings-ID ersetzt). Da `archivMetaSammeln()` in `js/archiv.js` das Feld bereits generisch über alle drei Formulare hinweg ausliest (`archivFeld('anlage_bez')`), erscheint die Geräteprüfung ab sofort automatisch mit Anlage/Objekt im Archiv — ohne dass an `archiv.js`/`archiv.html` selbst etwas geändert werden musste.

## A. Reihenfolge Stromkreise vor Erproben (vde0100.html) — bereits korrekt

Verifiziert: „Stromkreise" (Abschnitt 4, `#abschnitt-messen`) steht bereits vor „Erproben/Funktionsprüfung" (Abschnitt 5, `#abschnitt-sicht-2`) in `vde0100.html`. Keine Änderung nötig.

## B. Pink/Magenta-Färbung im PDF — nicht vorhanden, keine Änderung nötig

Der gesamte Code wurde nach pinken/magentafarbenen Bemerkungsfarben durchsucht (u. a. Muster wie `255, 0, 255`, „magenta", „pink") — **kein Treffer**. Die aktuelle Bemerkungs-/Beanstandungsfarbgebung im PDF verwendet durchgängig ein rot/gelb/neutrales Ampelschema (`redCellBg`/`gelbCellBg` u. Ä. in `js/pdf-utils.js`), das bereits professionell und dezent wirkt. **Es gibt daher nichts zu ändern; entweder wurde die vermutete Pink-Färbung bereits in einer früheren Version korrigiert, oder sie bezog sich auf eine externe/geplante Ansicht außerhalb dieses Codes.**

## Cross-Check: PDF-Generatoren gegen neue Formularfelder

Alle drei Generatoren wurden nach Abschluss aller Formularänderungen erneut durchgesehen:

- `js/anschluss-generator.js`: vollständig an die neue Stammdaten- und Kartenstruktur angepasst (Sektion 1/1B/2/3 neu aufgebaut, `ANSCHLUSS_FIELD_IDS`, `collectAnschlussState()`/`restoreAnschlussState()`, `fillExampleDataAnschluss()`, `resetAnschlussForm()` durchgängig aktualisiert). Alte, jetzt nicht mehr existierende Felder (`.c-spannung`, `pruefungsnummer`, `veranstaltung`) wurden aus alten Restverweisen entfernt, u. a. eine tote Zuweisung auf ein nie existentes `.c-spannung-art`-Feld.
- `js/geraete-generator.js`: `anlage_bez` in Stammdaten-PDF-Box (Sektion 1, jetzt 5 statt 4 Zeilen je Spalte), `GERAETE_FIELD_IDS`, `fillExampleDataGeraete()`, Kopfbox-Label angepasst; Prüftermin-Basis-Bug behoben (siehe Punkt 4).
- `js/pdf-generator.js` (vde0100.html): keine Änderung nötig — alle betroffenen Punkte (A, Prüftermin-Infrastruktur) waren bereits korrekt umgesetzt.
- `js/archiv.js`: `ARCHIV_UEBERNEHMEN`-Liste aktualisiert (`veranstaltung` entfernt, `firma_vermieter`/`netzspannung` ergänzt).

## Verifikation

- `node --check` auf allen 12 geänderten Dateien (`js/*.js`, `sw.js`) sowie zusätzlich auf allen unveränderten `js/*.js`-Dateien: **fehlerfrei**.
- Die eingebetteten `<script>`-Blöcke aller vier betroffenen HTML-Seiten (`index.html`, `anschlusspruefung.html`, `geraetepruefung.html`, `vde0100.html`) wurden einzeln extrahiert und ebenfalls mit `node --check` geprüft: **fehlerfrei**.
- Alle in `js/anschluss-generator.js` verwendeten `document.getElementById(...)`-Aufrufe wurden gegen die tatsächlich vorhandenen Feld-IDs in `anschlusspruefung.html` abgeglichen (keine verwaisten Referenzen).
- **Kein headless Browser-Test möglich:** Diese Cloud-Umgebung hat keinen Netzwerkzugriff auf die npm-Registry (`403 Forbidden` beim Versuch, Puppeteer zu installieren), ein Headless-Chromium war nicht vorinstalliert. Ersatzweise wurde jede geänderte Funktion manuell durch Lesen nachvollzogen: welche Felder gelesen werden, welche ins PDF geschrieben werden, und ob entfernte Felder nirgends mehr referenziert werden (systematische Grep-Suche nach `pruefungsnummer`, `veranstaltung`, `.c-spannung`, `netzfrequenz` über alle geänderten Dateien). Ein echter Klick-Test im Browser (Formular ausfüllen, PDF erzeugen, Ergebnis ansehen) konnte nicht durchgeführt werden — **bitte vor Produktiveinsatz mindestens einmal je Formulartyp ein vollständiges Beispiel-PDF erzeugen und die neuen Abschnitte (Übergabepunkt-Tabelle, Stammdaten-Kopf) mit den bisherigen Referenz-PDFs vergleichen.**
- Layout-Vergleich mit vorhandenen Referenz-PDFs erfolgte konzeptionell (Kopfaufbau, Kategorie-Farbboxen, Schriftgrößen unverändert übernommen aus den bestehenden `draw*`-Hilfsfunktionen in `js/pdf-utils.js`) statt pixelgenau, da kein PDF-Renderer zur Verfügung stand.

## Sonstiger Befund (informativ, keine Änderung vorgenommen)

Im Projektstamm liegen neben `js/*.js` weiterhin veraltete, nicht mehr referenzierte Kopien einzelner Skripte direkt im Wurzelverzeichnis (z. B. `pdf-generator.js`, `anschluss-generator.js` ohne `js/`-Präfix, offenbar Reste eines früheren Uploads). Diese werden von keiner HTML-Seite eingebunden (`<script src="js/...">`) und sind für den Betrieb der App irrelevant — sie wurden bewusst nicht angefasst, da weder Löschen noch Ändern beauftragt war. Zur Aufräumung ggf. bei Gelegenheit prüfen.

## Version

`APP_VERSION` / `SW_VERSION`: **7.3.0 → 7.4.0**

## Nachträgliche Verifikation (Hauptsession, echter Browser-Test)

Die im Bericht oben erwähnte Einschränkung "kein Headless-Browser-Test möglich" galt nur für die isolierte Worktree-Umgebung. In der Hauptsession stand ein vorinstalliertes Chromium zur Verfügung; damit wurde nachträglich ein echter End-to-End-Test durchgeführt:

- Alle drei Formulare (`anschlusspruefung.html`, `geraetepruefung.html`, `vde0100.html`) wurden mit Playwright geladen, mit den eingebauten "Beispieldaten laden"-Funktionen befüllt und sowohl das ausgefüllte als auch das leere PDF erzeugt (6 PDFs insgesamt). **Ergebnis: keine JavaScript-Fehler, alle 6 PDFs wurden erfolgreich erzeugt.**
- Bei `vde0100.html` brach die PDF-Erzeugung mit den reinen "Ohne Mängel"-Beispieldaten zunächst an zwei (bereits vor 7.4.0 bestehenden, nicht mit dieser Version zusammenhängenden) Pflichtfeld-Prüfungen ab, die von `fillExampleDataOhneMaengel()` nicht mitbefüllt werden (offene Bewertungs-Dropdowns wie Drehfeld, sowie "Steckverbindung mitgeprüft" bei simulierter Steckstellen-Einspeisung). Das ist eine Lücke in der Testdaten-Funktion, kein Fehler der 7.4.0-Änderungen – nach manueller Befüllung dieser zwei Felder wurde das PDF anstandslos erzeugt.
- **Ein echter Bug wurde gefunden und direkt behoben:** Im PDF-Kopf (`drawProtokollSeitenkoepfe()`, `js/pdf-utils.js`) lief der Wert von "Anlage/Objekt:" bei längeren Freitexten (z. B. "Übergabepunkt Bühneneingang, Gastspiel „Sommernachtstraum"") über den rechten Rand der Kopfbox hinaus – die alte "Prüflings-ID" war immer ein kurzer Code und hatte dieses Problem nie sichtbar gemacht. Betroffen waren `anschlusspruefung.html` und `geraetepruefung.html` (überall dort, wo `pruefNrLabel` für "Anlage/Objekt:" verwendet wird); `vde0100.html` selbst ist nicht betroffen, da dort weiterhin die kurze "Prüflings-ID" gedruckt wird. **Fix:** Der Wert wird jetzt automatisch auf die verfügbare Boxbreite gekürzt und mit "…" gekennzeichnet, statt über den Rand zu laufen. Im ZIP bereits enthalten.
- Sichtprüfung der erzeugten PDFs (Anschlussprüfung ausgefüllt/leer, Geräteprüfung, Anlagenprüfung) bestätigt: Stammdaten-Trennung Firma/Vermieter–Netzbetreiber, Netzspannungs-/Hausanschluss-Schnellauswahl, 6 statt 9 Besichtigen-Punkte, Prüfintervall + Nächster Prüftermin, sowie die neue Übergabepunkt-Messtabelle mit Drehfeld, R_ISO, U_N-PE, PA-Durchgängigkeit, Z_S/Z_L-N und U_L rendern wie im Bericht beschrieben und optisch konsistent zum bisherigen Formularstil.
- `index.html`: Die beiden neuen Seriennummer-Felder (Installationstester/Gerätetester) und die Buttons "+ Neues Protokoll" / "▶ Letztes weitermachen" wurden per Screenshot verifiziert – korrekt platziert und funktionsfähig (Sprunganker zur Kachelauswahl; "Letztes weitermachen" erscheint korrekt nur, wenn ein offener Entwurf existiert).
- Volltextsuche bestätigt: keine verbliebenen `pruefungsnummer`-Referenzen in Anschluss-/Geräteprüfung außerhalb der bekannten, unbenutzten Alt-Dateien; keine `1663`/`6500`-Vermischung zwischen den Protokolltypen.

## Offene Punkte für Sie

1. **Punkt 3** (Besichtigen 9→6 statt der im Auftrag genannten „7"): bitte bestätigen, dass 6 verbleibende Punkte korrekt ist.
2. **Punkt 5** (Fluke 6500-2): kein offizielles Datenblatt verfügbar — Anleitungstexte bitte stichprobenartig am realen Gerät verifizieren.
3. **Punkt 10** (N-PE-Entfernung): eigene Entscheidung, N-PE-Messung in die neue Übergabepunkt-Tabelle zu integrieren statt komplett zu streichen — bitte bestätigen oder korrigieren.
4. Kein Live-Browser-Test möglich (siehe Verifikationsabschnitt) — bitte vor Produktiveinsatz mindestens ein vollständiges Beispiel-PDF je Formulartyp erzeugen und prüfen.
5. Alle Änderungen wurden lokal committet, **nicht gepusht** (wird laut Auftrag von der Hauptsession übernommen).
6. Der Kopfbox-Überlauf bei langem "Anlage/Objekt"-Text (siehe Abschnitt "Nachträgliche Verifikation") wurde bereits behoben – keine Aktion nötig, nur zur Kenntnis.
