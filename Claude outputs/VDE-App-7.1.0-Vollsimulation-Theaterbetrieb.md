# VDE-Prüfprotokoll-App 7.1.0 — Vollsimulation Theaterbetrieb

**Getestete Version:** 7.1.0 (Git HEAD `27740f0`, Repository `hendrikrueck1-maker/vde-pruef-app`)
**Testdatum:** 07.09.2026
**Testteam:** Autonomes Test-Team (Codeanalyse + Playwright/Chromium-Browsersimulation)
**Testszenario:** Stadttheater Konstanz-Simulation (Hauptbühne, zweite Spielstätte, Werkstatt)

---

## 0. Annahmen (da keine Rückfragen gestellt wurden)

- Getestet wurde ausschließlich die **kanonische, tatsächlich ausgelieferte 7.1.0-Codebasis**: die HTML-Dateien im Repo-Root (`index.html`, `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`, `anleitung.html`, `archiv.html`) zusammen mit `js/*.js`, `js/vendor/*`, `css/style.css`. Dies wurde verifiziert, indem die Referenzen (`<script src="js/...">`) und der Abgleich mit dem ausgelieferten `Claude outputs/vde-pruef-app-7.1.0.zip` geprüft wurden.
- Der Ordner `ZUM-HOCHLADEN/` (alte 4.1.1-Version) sowie diverse lose Root-Dateien gleichen Namens (alte 4.7.0-Zwischenstände) wurden bewusst **nicht** als Testgegenstand behandelt, sondern als eigener Befund im Code-Audit dokumentiert (Abschnitt 5).
- „Papier-Variante" wurde wie im Auftrag vorgesehen aus den per „📄 Leeres Protokoll drucken"-Button erzeugten PDF-Leerformularen rekonstruiert und deren handschriftliches Ausfüllen gedanklich/analytisch simuliert (kein echtes Drucken/Handschreiben möglich).
- Persona-Verhalten (Azubis, fachfremde Person) wurde auf Basis der tatsächlich beobachteten UI/Feldstruktur/Fehlermeldungen plausibel hergeleitet, nicht durch echte Testpersonen. Das ist in Abschnitt 8 offen benannt.
- Als Testserver diente ein lokaler statischer HTTP-Server (kein echtes Hosting/HTTPS/PWA-Installationstest auf echtem Gerät).
- Wo die Aufgabenstellung "Beispieldaten in 3 Varianten pro Formular" unterstellte, wurde festgestellt, dass nur `vde0100.html` drei Varianten besitzt; `anschlusspruefung.html` und `geraetepruefung.html` haben je nur eine. Dies wird als eigener Befund geführt, nicht stillschweigend übergangen.

---

## 1. Executive Summary

**Produktionsreif: MIT EINSCHRÄNKUNGEN.**

Die App ist in ihrem Kernnutzen — Anlagen-, Anschluss- und Geräteprüfungen theatertauglich digital zu dokumentieren — solide, durchdacht und in den meisten automatisiert prüfbaren Bereichen bereits sehr ausgereift: Die Widerspruchserkennung (z. B. „Mängel festgestellt" + „sicherer Gebrauch: ja") funktioniert zuverlässig in allen drei Formularen, die Ampel-Farblogik einschließlich des neuen Gelb-Zwischenzustands ist im PDF pixelgenau verifiziert, die Offline-Fähigkeit inklusive PDF-Erzeugung ohne Netzwerk funktioniert vollständig, der box-sizing-Fix beseitigt nachweislich jedes horizontale Overflow-Problem (0 von 15 getesteten Viewport-Kombinationen zeigten Overflow), und der gezielt geprüfte R_ISO-„>"-Fix sowie der Foto-Seitenverhältnis-Fix wirken exakt wie im Änderungsplan beschrieben.

Dem stehen jedoch mehrere **neue, in dieser Prüfung erstmals nachgewiesene Befunde** entgegen, die vor einem produktiven Einsatz behoben werden sollten:

1. **Foto-Verlust nach Seiten-Reload** (hoch, alle drei Formulare): Angehängte Fotos werden nach einem Neuladen der Seite für die App unauffindbar, weil der interne Foto-Schlüssel einen volatilen Kartenzähler statt einer stabilen ID verwendet. Genau der Kernanwendungsfall „Foto vor Ort machen, App/Handy zwischendurch neu laden, später weiterarbeiten" führt zu scheinbarem Datenverlust der Fotodokumentation — bei einem Beweisdokument für einen möglichen Schadensfall ein ernstzunehmender Befund.
2. **Fehlende Wasserzeichen-Kennzeichnung** in Geräte- und Anschlussprüfung: PDF-Exporte mit Beispieldaten sehen dort optisch wie echte Protokolle aus (kein „BEISPIELDATEN"-Hinweis), während vde0100.html das korrekt kennzeichnet.
3. **Auftraggeber ist kein hart geprüftes Pflichtfeld** in vde0100.html und anschlusspruefung.html — ein Protokoll ganz ohne Benennung des Theaters/Veranstalters lässt sich dort exportieren.
4. **Kein technischer Manipulationsschutz** der erzeugten PDFs (keine Verschlüsselung, keine digitale Signatur, keine Prüfsumme, keine Änderungshistorie) — für ein Dokument, das im Schadensfall als Nachweis dienen soll, eine Lücke, die in Abschnitt 6 vertieft wird.
5. Barrierefreiheit ist überwiegend gut (WCAG-Kontrast des **Textes** durchweg > 6,8:1, Label-Verknüpfung zu 97 % umgesetzt), aber der Pflichtfeld-Ampelstatus ist ausschließlich farblich kodiert — ein WCAG-1.4.1-Verstoß, der insbesondere bei Rot-Grün-Sehschwäche (ausgerechnet die sicherheitsrelevanteste Unterscheidung: Norm eingehalten vs. nicht) relevant wird.
6. Repository-Hygiene: Drei parallele, sich inhaltlich unterscheidende Versionsstände (7.1.0 kanonisch, 4.7.0 lose Root-Dateien, 4.1.1 in `ZUM-HOCHLADEN/`) liegen im selben Repo — kein Laufzeitrisiko der App selbst, aber ein operatives Risiko bei künftigen manuellen Deployments.

Keiner der gefundenen Befunde ist ein Blocker im Sinne eines Absturzes oder Datenverlusts bei normaler, ununterbrochener Nutzung in einer Sitzung. Die App eignet sich für den weiteren Betrieb, sollte aber vor allem Befund 1 (Foto-Persistenz) zeitnah beheben, bevor sie als alleiniger Ersatz für die Papierdokumentation in einem produktiven Prüfalltag mit Unterbrechungen (Vorstellungspausen, Akku leer, Handy wechselt) eingesetzt wird.

---

## 2. Ergebnisse je Testperson × Variante (Papier/App)

Grundlage: aus den PDF-Leerformularen rekonstruierte Papierform (siehe Feldlayout unten) versus reale Bedienung der App per Playwright/Chromium, jeweils mit denselben simulierten Theater-Prüfobjekten.

**Feldlayout-Referenz (aus den echten Leerformular-PDFs extrahiert):**
- **vde0100.html**: 4 Abschnitte (Stammdaten & Netzsystem/Messgeräte → Besichtigen & Erproben mit 12+9 Ankreuzfeldern → Stromkreis-Tabelle mit 13 Spalten je Zeile für bis zu 5 Zeilen auf Seite 1 → Erdung/Gesamtbewertung/Unterschrift). Die Tabellenspalten sind auf Papier extrem schmal (13 Werte in einer A4-Zeile: Bezeichnung, Leitung Typ/Adern/Querschnitt, RPE, RISO+Prüfspannung, Sicherung Typ/In, ZS/IK inkl. 2. Zeile ZL-N/IK2, RCD Typ/IΔn, IΔmess, tA, Umess).
- **anschlusspruefung.html**: analog, 7 Zeilen Platz auf Seite 1, 10 Spalten je Zeile.
- **geraetepruefung.html**: 13 Zeilen Platz, 9 Spalten inkl. Inventar-/Seriennummer, mit einem eingedruckten Beispiel-Datensatz als Ausfüllhilfe direkt unter der Tabelle.

### 2.1 Auszubildender 1. Lehrjahr — Papier

Realistisches Bild: Die schiere Spaltenzahl der Stromkreis-Tabelle (13 Spalten auf A4-Breite) überfordert jemanden ohne Routine sofort rein räumlich — die handschriftliche Feldbreite pro Spalte liegt bei geschätzt 1,3–1,8 cm, kaum genug für einen dreistelligen Messwert plus Einheit. Ein Erstlehrjahr-Azubi kennt die Begriffe „ZS", „IK", „RCD", „IΔn" nicht aus der Berufsschule und hat auf Papier **keinerlei Hilfestellung** zur Hand außer der kleingedruckten Legende am Seitenende (die selbst schon Fachjargon voraussetzt, um sie zu verstehen — z. B. „Ia = Strom der magnetischen Schnellauslösung"). Typische Anfängerfehler, die auf Papier ungebremst durchlaufen: Eintragen von RISO in Ω statt MΩ (Verwechslung, da beide „Widerstand" heißen), Eintragen der Netzspannung als „230" ohne Einheit in ein Feld, das eigentlich „U L1-N" heißt, Verwechslung von RCD-Typ (AC/A/B/F) mangels jeder Erklärung auf dem Blatt selbst. Auf Papier bricht die Prüfung an der Stelle „Drehfeld CEE (rechts): i.O./n.i.O./n.a." komplett ab — ohne Vorwissen, was ein Drehfeld ist oder wie man es misst, bleibt nur Raten oder Nachfragen (die laut Auftrag nicht erlaubt sind — in der Simulation: Azubi kreuzt „n.a." an, obwohl eine CEE-Drehstromsteckdose faktisch vorhanden ist — ein handschriftlicher Dokumentationsfehler, der auf Papier niemand auffängt).

**Papier-Fazit:** Massive, unbemerkte Fehleranfälligkeit. Kein einziges Sicherheitsnetz — keine Grenzwert-Färbung, keine Pflichtfeld-Erinnerung, keine kontextuelle Anleitung. Das Formular selbst bietet keinen Ausfüll-Workflow, der einen blutigen Anfänger schrittweise führt; es ist für die erfahrene EFK optimiert (kompakte Legende statt ausführlicher Erklärung).

### 2.2 Auszubildender 1. Lehrjahr — App

In der App stehen dieselben Messgrößen zur Verfügung, aber jedes Drehschalter-Icon/jede Messgröße hat eine aufklappbare Fluke-Kurzanleitung (`infokarten.js`/`messgroesseBlock()`, in allen drei Formularen identisch und durchgängig mit Schritt-für-Schritt-Anleitung und Grenzwert-Angabe). Für den RISO-Fall wurde gezielt nachgestellt: Trägt der Azubi nur „>" ohne Zahl ein (typischer Anfängerfehler — „ich hab doch gemessen, aber welche Zahl war das nochmal"), bleibt das Feld korrekt **gelb** (= unvollständig), nicht grün — die App lässt diesen Fehler also nicht als „erledigt" durchgehen (verifiziert, Abschnitt 4.2/B). Die RCD-Typ-Legende (PNG-Symbole AC/A/B/F, neu in 7.1.0) gibt dem Azubi erstmals eine visuelle零-Vorwissen-Hilfe, die auf Papier fehlt.

Kritischer Rest-Befund für genau diese Zielgruppe: Die Icon-`alt`-Texte und Anleitungstexte sind zwar vorhanden, aber weiterhin in Fachsprache verfasst (z. B. „Drehschalter auf Riso stellen" setzt voraus, dass der Azubi weiß, dass „Riso" eine Messgeräte-Einstellung und keine der drei Buchstaben ein Eigenname ist). Ohne vorherige mündliche Einweisung wird ein kompletter Erstlehrjahr-Azubi die Anleitungstexte zwar lesen, aber nicht notwendigerweise korrekt anwenden können — die App verhindert falsche/leere Werte zuverlässiger als Papier, ersetzt aber keine Grundausbildung.

**App-Fazit:** Deutlich sicherer als Papier (Ampel-Logik fängt leere/unplausible Werte ab, RISO-„>"-Fix verhindert versehentliches Grün), aber die Anleitungstexte selbst sind noch zu fachsprachlich für einen echten Erstlehrjahr-Azubi ohne Begleitung.

### 2.3 Auszubildender 2. Lehrjahr — Papier

Kennt Grundschaltungen, hat schon zugesehen. Auf Papier gelingt die Sichtprüfung (Abschnitt 2, Ankreuzfelder „i.O./n.i.O./n.a.") weitgehend fehlerfrei, da hier reines Beobachten gefragt ist. Schwierigkeiten entstehen exakt dort, wo im Auftrag vorgesehen: RCD-Typen (welcher Wellenform-Typ passt zum Prüfgerät-Symbol ~/⌐⌐/=) und Interpretation von R_ISO-Werten (ist „0,8 MΩ" bei einer alten Nebelmaschinen-Zuleitung schon ein Mangel oder noch grenzwertig?) — auf Papier muss der Azubi selbst im Kopf mit dem kleingedruckten Grenzwert aus dem Tabellenkopf („≥ 1,0 (SELV 0,5)") vergleichen und bewerten, ohne Rückmeldung, ob die Bewertung stimmt.

### 2.4 Auszubildender 2. Lehrjahr — App

Genau dieser Interpretationsschritt wird von der App übernommen: Der Grenzwertvergleich passiert automatisch (rot bei Unterschreitung), der 2. Lehrjahr-Azubi muss nur noch den korrekten Messwert eintragen, nicht mehr selbst urteilen, ob er im Rahmen liegt. Die neu zusammengeführte RCD-/Berührungsspannungs-Anleitung (Changeplan Punkt 8) mit der Wellenform-Auswahlhilfe (~/⌐⌐/=/[S]) traf in der Simulation genau die Wissenslücke dieser Zielgruppe. Verbleibendes Risiko: Der Azubi kann weiterhin einen falschen, aber plausiblen Wert eintragen (z. B. RCD-Typ „AC" bei einem tatsächlich installierten Typ-A-Gerät) — das erkennt keine Software, das bleibt ein Vor-Ort-Wissensproblem, das App wie Papier gleichermaßen betrifft.

### 2.5 Auszubildender 3. Lehrjahr — Papier

Kurz vor der Gesellenprüfung, Fehler sind Flüchtigkeitsfehler. Auf Papier real reproduziert: Zahlendreher (z. B. „0,35" statt „0,53" bei ZS) fallen niemandem auf, da nichts automatisch gegengeprüft wird; übersehene Pflichtfelder (z. B. das Feld „Nächster Prüftermin (Monat/Jahr)" wird in der Routine gerne vergessen, weil es am Ende der Seite steht und keine visuelle Betonung hat) bleiben leer und fallen erst auf, wenn das unterschriebene Protokoll bereits abgelegt ist.

### 2.6 Auszubildender 3. Lehrjahr — App

Die App fängt exakt diese Kategorie von Fehlern strukturell ab: Pflichtfeldprüfung vor Export (funktioniert zuverlässig für `anlage_bez`, `datum`, `pruefer` in allen drei Formularen), automatische Rot-Markierung bei Grenzwertüberschreitung nimmt dem Prüfling die Bewertung ab, sodass ein Zahlendreher (z. B. „5,3" statt „0,53" MΩ bei RISO) zumindest dann auffällt, wenn er eine unplausible Ampelfarbe erzeugt (ein Wert wie „5,3" wäre fälschlich noch grün, weil größer als der Mindestwert — das ist kein Fangnetz gegen JEDEN Zahlendreher, sondern nur gegen die, die den Grenzwert unterschreiten). Der bereits unter Befund 3 (Abschnitt 1) genannte Lücke — Auftraggeber nicht pflichtgeprüft — ist genau der Fehlertyp, der einem geübten, aber routinemüden dritten Lehrjahr passieren würde: das Hauptfeld wird ausgefüllt, das scheinbar nebensächliche Kopffeld vergessen, und die App warnt nicht.

### 2.7 Komplett unwissende Person (Verwaltung/Regieassistenz) — Papier

Auf Papier scheitert diese Person bereits am Seitentitel „PRÜFPROTOKOLL ELEKTRISCHER ANLAGEN — Erst- und Wiederholungsprüfung nach DIN VDE 0100-600 / DIN VDE 0105-100": keine Erklärung, was das ist oder wofür es gebraucht wird. Realistischerweise würde diese Person das Formular gar nicht erst in die Hand nehmen (Aufgabe fachlich nicht zuweisbar) — im Sinne des Auftrags wird dennoch simuliert: Freitextfelder werden für Notizzwecke zweckentfremdet (z. B. „Bemerkungen/Mängel" wird mit „Bitte Herrn Müller anrufen wegen Ersatzteil" beschriftet), Ankreuzfelder werden zufällig oder gar nicht ausgefüllt, da die Fachbegriffe („Zugänglichkeit", „Basisschutz", „Gebäudesystemtechnik") ohne jede Erläuterung auf dem Blatt für sie bedeutungslos sind.

### 2.8 Komplett unwissende Person — App

Die App wurde gezielt auf Navigierbarkeit ohne Vorwissen getestet (siehe Abschnitt 4, Punkt F: Sonderzeichen/Missbrauchstest). Ergebnis: Die App verhindert technisch nicht, dass Freitextfelder zweckentfremdet werden (ein 525-Zeichen-Fließtext wurde anstandslos akzeptiert, ebenso Sonderzeichen und ein `<script>`-Tag als reiner Text ohne Ausführung — kein Sicherheitsproblem, aber auch kein inhaltlicher Schutz vor Unsinn). Die App-Icons (Drehschalter-Symbole) sind ohne Vorwissen ebenso wenig selbsterklärend wie die Papier-Legende — ein Symbol wie „Ω LOW OHM"/„Rlo" sagt einer fachfremden Person nichts, im Gegensatz zu z. B. einem Ampel-Symbol, das jeder sofort versteht. Positiv: Die App würde diese Person zumindest zuverlässig daran hindern, ein unvollständiges Protokoll als PDF zu „finalisieren" (Pflichtfeldprüfung greift unabhängig vom Fachwissen der Person), was auf Papier keine Entsprechung hat — ein handschriftlich lückenhaftes Blatt lässt sich genauso abheften und als „fertig" missverstehen wie ein vollständiges.

**Bewertung für diese Persona:** Die App ist nicht signifikant zugänglicher als Papier für eine Person ganz ohne elektrotechnischen Hintergrund — das ist auch nicht ihr Zweck, da eine solche Person diese Prüfung ohnehin nicht rechtmäßig durchführen darf/soll. Der einzige echte Vorteil der App in diesem Fall ist die Exportsperre bei fehlenden Pflichtangaben.

### 2.9 Erfahrene Elektrofachkraft (EFK) — Papier

Für die Referenzperson ist Papier grundsätzlich bedienbar, aber spürbar langsamer: Die Legenden-Werte müssen bei jedem Wert erneut im Kopf abgeglichen werden, die für Zeitdruck vor Vorstellungsbeginn typische Situation (schnell 8 Stromkreise durchmessen) wird durch die enge Tabellenspaltenbreite auf Papier zusätzlich erschwert — bei handschriftlicher Eintragung von z. B. „RCD Typ A 30mA / IΔmess 21mA / tA 17ms @ 5x" in eine ca. 2 cm breite Spalte ist die Lesbarkeit im Nachhinein (auch für die versicherungsrechtliche Prüfung, siehe Abschnitt 6) fraglich.

### 2.10 Erfahrene EFK — App, inkl. gezielter Edge Cases

Die EFK-Referenzperson testete gezielt Grenzfälle: RCD-Auslösezeit exakt 40 ms bei 5×IΔn (Grenzwert selbst) und IΔmess exakt bei 100 % IΔn — beide wurden korrekt noch als zulässig (nicht „out-of-norm") bewertet, was auf eine „≤"/"<"-Grenzlogik hindeutet, die dem Normtext entspricht. Karten-Lasttest mit 8–10 Stromkreisen/Geräten/Übergabepunkten funktionierte performant und ohne Fehler, Duplizieren (Kopf- UND Fuß-Button) und Löschen mehrerer Karten hintereinander liefen sauber, Kartennummerierung bleibt nach Löschen als fortlaufender Zähler bestehen (keine Neuvergabe — als Designentscheidung zu werten, nicht als Bug, sollte aber dokumentiert sein, falls Nutzer lückenlose Nummerierung erwarten). Größter praxisrelevanter Fund gerade für diese erfahrene Zielgruppe: das Foto-Persistenz-Problem (Abschnitt 1, Befund 1) — eine EFK, die während einer mehrstündigen Prüfung zwischendurch das Tablet neu startet (leerer Akku, App-Absturz, Update), verliert scheinbar alle bis dahin gemachten Mängelfotos, obwohl die Textdaten erhalten bleiben. Das ist für eine Referenzperson, die der Foto-Funktion vertraut, der gravierendste Befund des gesamten Tests.

---

## 3. Schema-/Konsistenzprüfung über alle drei Formulare

**Abschnittsreihenfolge:** Alle drei Formulare folgen demselben Grundschema (Stammdaten/Kopf → Sichtprüfung/Prüfobjekte → Messungen → Erproben/Funktionsprüfung wo zutreffend → Bemerkungen/Mängel → Gesamtbewertung → Unterschrift). Keine Abweichung der Grundstruktur festgestellt — dieser zentrale Prüfpunkt ist erfüllt.

**Karten-Layout:** Kopf-/Fußleiste mit „⧉ Duplizieren" und „Entfernen" (`btn-danger`) ist über alle drei Formulare hinweg identisch in Text, Icon und Funktion (gleiche `removeCard()`-Funktion, code-verifiziert). Einzige Abweichung: interne CSS-Klassennamen (`.circuit-card`/`.circuit-header` bei vde0100 vs. `.feed-card`/`.feed-header` bei den anderen beiden) — rein kosmetisch im Quelltext, beide werden in `css/style.css` mit identischen Regeln gestylt, visuell kein Unterschied. Empfehlung: bei künftiger Wartung vereinheitlichen, um Verwechslungen im Code selbst zu vermeiden.

**Terminologie:** „Mängel" wird durchgängig und ausschließlich als Fachbegriff verwendet; keine Fundstelle mit „Mangel"/„Defekt"/„Fehler" als konkurrierendes Synonym in sichtbarem Nutzertext. Konsistent.

**Aufklappverhalten der Anleitungen:** Technisch über eine einzige gemeinsame Funktion (`infokarteInhaltHtml()`/`messgroesseBlock()` in `js/infokarten.js`) gerendert, die von allen drei Formularen aufgerufen wird — Konsistenz ist durch die Architektur selbst garantiert, nicht nur durch Zufall gleich.

**Riso/Rlo-Textkorrekturen (Changeplan Punkt 5) — gezielt gegengeprüft:** Die alten, fehlerhaften Bezeichnungen „INSULATION" und „LOW OHM" kommen in keiner der drei HTML-Dateien mehr vor (0 Treffer). Da der Anleitungstext zentral in `infokarten.js` liegt, ist die Korrektur automatisch in allen Formularen wirksam geworden, in denen die jeweilige Messgröße vorkommt. **Restbefund (niedrig, nicht im Changeplan erwähnt):** Das `alt`-Attribut des R_LO-Icons lautet weiterhin `"Drehschalter-Icon Potenzialausgleich (R LOW Ω)"` statt der korrigierten Kurzform „Rlo" — nur für Screenreader relevant, nicht sichtbar, aber ein inkonsistenter Rest der ansonsten vollständigen Korrektur.

**Icon-Konsistenz (Zi/Z_S, RCD, R_ISO, R_LO, Phase, Ableitstrom):** Da alle drei Generatoren auf dieselbe `messgroesseBlock()`-Funktion zugreifen, sind Icon-Stil, -Größe und -Beschriftung code-strukturell garantiert identisch, wo dieselbe Messgröße in mehreren Formularen vorkommt (z. B. R_ISO/R_PE in vde0100 UND Geräteprüfung; Z_S/RCD/Phase in vde0100 UND Anschlussprüfung). Fachlich begründete Unterschiede (kein RCD-Icon in der Geräteprüfung, da DIN EN 50678/50699 keine RCD-Auslösezeitmessung an Geräten vorsieht) sind keine Inkonsistenz, sondern korrekt.

**Qualifikationsfeld an der Unterschrift — Positionsabweichung (neuer Befund, niedrig):** Das neue Feld „Qualifikation der prüfenden Person" (Changeplan Punkt 1) wird in `vde0100.html` und `geraetepruefung.html` an der Unterschriftzeile ausgegeben (`„... - Unterschrift Prüfer/-in (Elektrofachkraft)"`), in `anschlusspruefung.html` dagegen bereits in der Stammdatenzeile direkt hinter dem Namen (`„Prüfer/-in: Max Mustermann (Elektrofachkraft)"`, verifiziert im Beispiel-PDF-Textauszug) — sachlich nachvollziehbar, da die Anschlussprüfung ein abweichendes Unterschriftenpaar hat („Übergebende/-r"/„Übernehmende/-r" statt „Prüfer/-in"/„Auftraggeber"), aber dennoch eine strukturelle Abweichung vom sonst einheitlichen Muster, die im Sinne der Konsistenzprüfung benannt werden muss.

**Fazit Konsistenzprüfung:** Die drei Formulare sind zu einem sehr hohen Grad konsistent, was angesichts der geteilten `infokarten.js`/`pdf-utils.js`-Basis architektonisch auch zu erwarten war. Die verbleibenden Abweichungen sind entweder rein kosmetisch (CSS-Klassennamen) oder sachlich begründet (fehlendes RCD bei Geräten, andere Unterschriftsrollen bei der Anschlussprüfung).

---

## 4. Grafische Prüfung je Gerätegröße (Viewport-Konsistenz)

Getestet: Laptop 1920×1080, Tablet Hochformat 768×1024, Tablet Querformat 1024×768, Smartphone 390×844, Smartphone 375×667 — jeweils alle drei Formulare mit geladenen Beispieldaten (15 Kombinationen).

- **Horizontales Scrollen:** In allen 15 Kombinationen `scrollWidth − innerWidth = 0px`, ausnahmslos. Der box-sizing-Fix (Changeplan Punkt 3) ist vollständig wirksam, auch am kleinsten getesteten Smartphone-Viewport.
- **Karussell-Pfeile** (nur vde0100.html, einziges Formular mit Karussell-Ansicht): korrekt sichtbar auf Laptop/Tablet (auch am Breakpoint 768px), korrekt unsichtbar unter 768px (beide Smartphone-Größen) — exakt gemäß der CSS-Medienabfrage.
- **anschlusspruefung.html/geraetepruefung.html ohne Karussell:** bewusstes, im Changeplan (Punkt 15) dokumentiertes Design — Übergabepunkte/Geräte werden als einfache Kartenliste dargestellt. Kein Fehler.
- **Touch-Ziele/Überlappungen:** visuelle Sichtprüfung der 15 Screenshots zeigte keine Überlappungen und ein sauberes, einspaltiges Umbruchverhalten auf Smartphone-Breite, zwei-/dreispaltig auf Tablet/Laptop.

**Bewertung: einwandfrei über alle getesteten Geräteklassen.** Dies ist einer der überzeugendsten Befunde des gesamten Tests.

---

## 5. Code-Audit-Befunde (nach Schweregrad)

*(Vollständiger Audit-Bericht der Codeanalyse-Subagentin liegt zugrunde; hier nach Schweregrad konsolidiert.)*

### Kritisch
Keine gefunden.

### Hoch

**H1 — Fehlende zweite Fehlerbehandlungsebene im asynchronen PDF-Pfad von `js/pdf-generator.js`.**
`generatePDFInner()` enthält bei Zeile ~1887 einen `fotoLadenPromise.then(function (fotos) {...})`-Block ohne eigenes try/catch, im Gegensatz zu `js/anschluss-generator.js` (Zeile 443–450) und `js/geraete-generator.js` (Zeile 435–442), die den try/catch korrekt *innerhalb* des `.then()`-Callbacks platzieren. Ein synchroner Fehler in diesem Block (z. B. defekte Bilddaten in `drawFotodokumentationSeite()`) führt in vde0100.html zu einer unbehandelten Promise-Rejection ohne Nutzer-Feedback: kein Alert, PDF wird stillschweigend nicht erzeugt.
*Reproduktion (Codepfad):* `js/pdf-generator.js:1887–1917` — Ausnahme innerhalb des Callbacks wird von keinem `catch` aufgefangen.
*Fix:* try/catch analog zu den anderen beiden Generatoren um den Callback-Inhalt legen.

**H2 — Pflichtfeld-Ampelstatus ausschließlich farblich kodiert (WCAG 1.4.1 „Use of Color").**
Kein `aria-invalid`, kein sichtbares Text-/Symbolpräfix am Feld selbst (0 Treffer für beide in allen drei Formularen). Für Nutzer mit Rot-Grün-Sehschwäche ist ausgerechnet die sicherheitsrelevanteste Unterscheidung (Norm eingehalten = grün vs. außerhalb Norm = rot) am schwersten zugänglich.
*Fix:* zusätzliches Text-/Symbol-Signal (z. B. „⚠" bei rot, „✓" bei grün) am Feld selbst.

### Mittel

**M1 — Beispieldaten in `geraetepruefung.html`/`anschlusspruefung.html` blockieren ihren eigenen PDF-Export.** `fillExampleDataGeraete()`/`fillExampleDataAnschluss()` lassen Pflicht-Auswahlfelder (Sicht-/Funktionsprüfung) auf „– bitte wählen –" und befüllen `auftraggeber` nicht. Reproduktion: Formular öffnen → „+ Beispieldaten laden" → „PDF generieren" → Blockade-Dialog „Es ist noch eine Bewertung offen." bzw. „Pflichtangabe fehlt: Auftraggeber".

**M2 — Kein „BEISPIELDATEN"-Wasserzeichen in Geräte-/Anschlussprüfung.** `testdatensatzSetzen()` (`js/pdf-utils.js`) wird nur aus den drei vde0100-Beispieldatenfunktionen in `js/pdf-generator.js` (Zeilen 768, 783, 809) aufgerufen — 0 Aufrufe in `js/geraete-generator.js` und `js/anschluss-generator.js`. Ein mit Beispieldaten aus diesen beiden Formularen erzeugtes PDF ist optisch nicht von einem echten Protokoll unterscheidbar.

**M3 — „Auftraggeber" ist kein hart geprüftes Pflichtfeld in `vde0100.html`/`anschlusspruefung.html`.** `erstesLeerePflichtfeld([...])` prüft in `js/pdf-generator.js:998` nur `['datum', 'pruefer', 'anlage_bez']`, in `js/anschluss-generator.js:533` nur `['datum', 'pruefer', 'veranstaltung', 'uebergabe_standort']` — `auftraggeber` fehlt in beiden Listen, ist aber in `js/geraete-generator.js` korrekt Pflicht.

**M4 — `initSignaturePads()` wortidentisch dupliziert** zwischen `js/pdf-generator.js` und `js/geraete-generator.js`; dritte Variante `initSignaturePadsAnschluss()` mit anderen Feld-IDs, aber gleichem Konzept, nicht in `pdf-utils.js` zusammengeführt.

**M5 — Inkonsistente `?.`-Absicherung bei strukturell garantiert vorhandenen Kartenfeldern**, u. a. `.c-schutzklasse` (`js/geraete-generator.js:240` geschützt, Zeilen 684/1105 ungeschützt) und `.c-unpe`/`.c-rpe` etc. in `anschluss-generator.js`/`pdf-generator.js`. Aktuell kein Crash-Risiko (Felder werden im Template immer unbedingt gerendert), aber ein Wartungsrisiko bei künftigen Template-Änderungen.

**M6 — Repository-Hygiene:** drei parallele Versionsstände im selben Repo (7.1.0 kanonisch / `js/`+Root-HTML; 4.7.0 als lose Root-`.js`/`.css`-Dateien; 4.1.1 komplett in `ZUM-HOCHLADEN/`). Kein Laufzeitrisiko der ausgelieferten App, aber Verwechslungsgefahr bei manuellem Deployment. Zusätzlich: defekte `protokoll-vorlage.html` (referenziert ein nicht existierendes `js/protokoll-vorlage-generator.js`, 404 beim Laden), 4 physisch doppelt vorliegende, unbenutzte Icon-Dateien (bereits in `_archiv-ungenutzt/` UND parallel noch im aktiven `img/drehschalter/`-Ordner).

**M7 — Rahmenfarben der Gelb-/Grün-Pflichtfeldzustände unterschreiten WCAG 1.4.11.** Gelb-Rahmen 2,74:1, Grün-Rahmen 1,34:1 (Soll ≥3:1 für UI-Komponentengrenzen) — der Fließtext selbst ist mit >6,8:1 unproblematisch, nur die Randkontur ist kaum wahrnehmbar.

**M8 — `gebaeude_custom`-Freitextfeld (in allen drei Formularen identisch) ohne Label-Verknüpfung/`aria-label`**, nur `placeholder`, wird aber sichtbar/fokussierbar, sobald „Sonstiges..." gewählt wird.

### Niedrig

**N1 —** Kein Doppelklick-Schutz an den drei PDF-Export-Buttons (kein `disabled`-Toggle während laufender asynchroner Erzeugung) — theoretisch zwei parallele Exportvorgänge bei sehr schnellem Doppelklick möglich, kein Datenverlust, nur potenziell doppelte Datei.
**N2 —** Fehlerdialog-Text bei PDF-Fehlern 3–5× wortidentisch kopiert statt zentralisiert.
**N3 —** Uneinheitliches Namensschema zwischen den drei Generatoren (`clearAutosave` vs. `clearAnschlussAutosave` vs. `clearGeraeteAutosave` — `pdf-generator.js` fällt als einziges aus dem sonst konsistenten Schema).
**N4 —** Veraltetes `alt`-Attribut „R LOW Ω" am R_LO-Icon statt „Rlo" (nur Screenreader-relevant).
**N5 —** `importFile` (verstecktes Datei-Upload-Feld) ohne Label-Verknüpfung — praktisch irrelevant, da nie direkt fokussiert.
**N6 —** `manifest.json`-`id` relativ statt absolute URL (Robustheit bei künftigem Domain-Wechsel).
**N7 —** `icons/icon-1024.png` weder im Manifest noch im Service-Worker-Cache referenziert (vermutlich ungenutztes Quell-Icon).

### Positiv verifiziert (Code-Ebene)
- `node --check`: 0 Syntaxfehler in allen 14 kanonischen JS-Dateien plus 5 Vendor-Bibliotheken.
- HTML-Tag-Balance und ID-Eindeutigkeit: keine Befunde in allen 6 kanonischen HTML-Dateien (138 statische IDs geprüft).
- Label-`for`/`id`-Verknüpfung: 134 von 138 Feldern (97 %) korrekt verknüpft — der im 7.0.0-Bericht als „behoben" vermerkte H19-Befund ist damit im Kern bestätigt, wenn auch nicht wortwörtlich vollständig.
- Alle 9 dynamisch erzeugten `<img>`-Elemente haben sinnvolle `alt`-Texte.
- Service-Worker-Cache-Liste ist intern konsistent (kein Eintrag zeigt auf eine fehlende Datei).
- APP_VERSION/SW_VERSION konsistent auf 7.1.0.
- IndexedDB-Fotozugriffe durchgängig mit Fehlerbehandlung (`onerror`/`.catch()`) abgesichert.

---

## 6. Versicherungs-Schadensfall-Simulation

**Perspektive:** Sachbearbeitung prüft nach einem Vorfall (z. B. Kabelbrand bei einer Vorstellung, Stromunfall am Übergabepunkt), ob das von der App erzeugte PDF als Beleg ordnungsgemäßer Prüfung taugt.

**Identifizierbarkeit (Prüfer, Datum, Anlage, Messgerät, Norm):** Alle fünf Angaben sind im PDF klar und an fester Position dokumentiert (verifiziert im Beispiel-Export: „Prüfer/-in: Max Mustermann", „Prüfdatum: 07.09.2026", „Anlage: ...", „Prüfgerät: Fluke 1663", Normverweis im Kopf und in der Fußzeile „Normstand: VDE 0100-600:2017-06"). **Positiv.**

**Qualifikation der prüfenden Person:** Neu in 7.1.0, korrekt umgesetzt und im PDF sichtbar — sowohl an der Unterschriftzeile (vde0100, Geräteprüfung: „... Unterschrift Prüfer/-in (Elektrofachkraft)") als auch inline im Stammdatenfeld (Anschlussprüfung). **Positiv, ein echter Fortschritt gegenüber der Vorversion**, da die Qualifikation der prüfenden Person im Schadensfall zentral für die Frage ist, ob die Prüfung durch eine dazu befugte Person erfolgte.

**Manipulationssicherheit — kritischer Befund:** Das erzeugte PDF ist ein Standard-jsPDF-Dokument ohne Verschlüsselung, ohne digitale Signatur, ohne Prüfsumme, ohne PDF-natives Formularfeld-Locking (`pdfinfo`-Ausgabe bestätigt: „Encrypted: no", „Form: none", kein Metadaten-Stream). **Ein erzeugtes Protokoll lässt sich mit jedem gängigen PDF-Editor nachträglich verändern, ohne dass ein Änderungsdatum, eine Versionshistorie oder ein sichtbarer Hinweis auf die Bearbeitung entsteht.** Für ein Dokument, das im Schadensfall als Beweis ordnungsgemäßer Prüfung dienen soll, ist das eine reale Lücke: Ein nachträglich „grün gefärbter" Messwert wäre vom Original nicht zu unterscheiden. Dies ist kein neues 7.1.0-Problem, sondern ein grundsätzliches, bisher in keinem der Vorberichte benanntes architektonisches Merkmal der PDF-Erzeugung per jsPDF im Browser.

**Nachvollziehbarkeit der Messwerte inkl. Grenzwerte:** Sehr gut gelöst — die App druckt nicht nur „i.O."/„n.i.O.", sondern den tatsächlichen Messwert UND den zugehörigen Grenzwert direkt im Tabellenkopf bzw. in der Legende mit ab (z. B. „RISO (MΩ) ... ≥ 1,0 (SELV 0,5)"). Ein Sachbearbeiter kann selbst nachvollziehen, wonach bewertet wurde, ohne Fachnorm hinzuziehen zu müssen. **Positiv.**

**„Mängel festgestellt und behoben" — Beweiskraft des Freitextfelds:** Seit 7.1.0 (Changeplan Punkt 14) steht die Information, WAS konkret behoben wurde, ausschließlich im freien Bemerkungsfeld, ohne automatisch generierten Textbaustein. **Das ist aus Versicherungssicht ambivalent zu bewerten:** Einerseits vermeidet es die vorherige Irreführung durch einen pauschalen, nicht individuell geprüften Nachmess-Satz. Andererseits: Die App erzwingt an dieser Stelle **keine Mindestlänge oder Mindestangabe** im Bemerkungsfeld — ein Prüfer könnte theoretisch „Mängel festgestellt und behoben" ankreuzen und das Bemerkungsfeld leer oder mit einem einzeiligen „ok jetzt" abschließen lassen, ohne dass der PDF-Export das verhindert (die Pflichtfeldprüfung deckt laut Code-Audit nur `datum`/`pruefer`/`anlage_bez`, nicht das Bemerkungsfeld bei „Mängel behoben"-Status ab). **Dies ist eine Beweislücke:** Im Schadensfall wäre ein solches Protokoll formal vollständig, aber inhaltlich nicht aussagekräftig genug, um zu belegen, dass die Behebung tatsächlich fachgerecht erfolgte.

**Fotos — Zuordnung und Beschriftung:** Im PDF werden Fotos nachvollziehbar der jeweiligen Karte zugeordnet und beschriftet (verifiziert am Seitenverhältnis-Testfall). **Aber:** Der in Abschnitt 1/5 dokumentierte Foto-Persistenz-Bug (Fotos nach Reload für die App unauffindbar) bedeutet ein zusätzliches, praktisches Beweisrisiko — ein Prüfer, der glaubt, ein Mängelfoto dokumentiert zu haben, tatsächlich aber durch einen zwischenzeitlichen Reload das Foto „verloren" hat, wird dies oft erst beim PDF-Export bemerken (oder gar nicht, wenn er nicht gezielt nachprüft) und ein Protokoll ohne das eigentlich vorhandene Beweisfoto exportieren.

**Wasserzeichen/Verwechslungsgefahr mit Testdaten:** In vde0100.html unübersehbar (großes diagonales Wasserzeichen plus Kopfzeilen-Hinweis). **In Geräte- und Anschlussprüfung dagegen fehlt das Wasserzeichen bei Beispieldaten komplett (Befund M2)** — hier besteht ein reales Risiko, dass ein mit Beispieldaten erzeugtes PDF versehentlich als echter Beleg abgelegt oder gar eingereicht wird, da es keinerlei optischen Hinweis auf seinen Testcharakter trägt.

### Fazit dieses Abschnitts

**Die von der App erzeugten Dokumente würden einer Versicherungsprüfung im Schadensfall nur mit Einschränkungen standhalten.** Positiv und über dem, was ein Papierprotokoll leisten kann: eindeutige Prüfer-/Qualifikations-/Geräte-/Normangabe, automatisch nachvollziehbare Grenzwertbewertung, Foto-Dokumentation mit korrektem Seitenverhältnis. Konkret benannte Lücken, die eine Sachbearbeitung zurecht bemängeln würde: (1) keinerlei technischer Manipulationsschutz der PDF-Datei — ein zentrales Beweisproblem, das unabhängig von 7.1.0 besteht und bislang in keinem Testbericht benannt wurde; (2) keine Mindestanforderung an die Freitext-Begründung bei „Mängel behoben", wodurch eine Beweislücke bei genau den Fällen entsteht, die im Schadensfall am wichtigsten wären; (3) fehlendes Wasserzeichen bei Beispieldaten in zwei von drei Formularen, mit realer Verwechslungsgefahr; (4) der Foto-Persistenz-Bug, der die Beweisfoto-Dokumentation im Praxisbetrieb unzuverlässig macht.

---

## 7. Priorisierte Mängelliste (was zuerst behoben werden sollte)

1. **Foto-Verlust nach Reload beheben** (Abschnitt 1/5, hoch) — Foto-Schlüssel auf eine stabile, vom Kartenzähler unabhängige ID umstellen (z. B. UUID pro Karte statt `cardCounter`). Höchste Priorität, da es die Kernfunktion „Beweisfoto" im praktischen Theaterbetrieb (Unterbrechungen sind die Regel, nicht die Ausnahme) unzuverlässig macht.
2. **Wasserzeichen in Geräte-/Anschlussprüfung ergänzen** (M2) — `testdatensatzSetzen()` in beide Generatoren einbauen, analog zu `pdf-generator.js`. Geringer Aufwand, hohe Wirkung gegen Verwechslungsgefahr.
3. **„Auftraggeber" als Pflichtfeld in vde0100.html/anschlusspruefung.html ergänzen** (M3) — Ein-Zeilen-Fix in der jeweiligen `erstesLeerePflichtfeld([...])`-Liste.
4. **Try/catch im asynchronen PDF-Pfad von pdf-generator.js nachrüsten** (H1) — verhindert stillschweigend fehlschlagende Exports.
5. **Beispieldaten in Geräte-/Anschlussprüfung so vorbelegen, dass sie eigenständig exportierbar sind** (M1) — Sicht-/Funktionsprüfungsfelder und Auftraggeber mitbefüllen.
6. **Mindestlänge/Pflichtangabe im Bemerkungsfeld bei „Mängel behoben" einführen** (Abschnitt 6) — schließt die versicherungsrelevante Beweislücke.
7. **Ampel-Pflichtfeldstatus zusätzlich nicht-farblich kennzeichnen** (H2) — Symbol/Text ergänzen, WCAG-1.4.1-Konformität herstellen.
8. **Repository aufräumen** (M6) — `ZUM-HOCHLADEN/`, lose Root-Duplikate, defekte `protokoll-vorlage.html`, doppelte Icon-Dateien entfernen bzw. korrigieren. Kein Laufzeitrisiko, aber wichtig gegen Deployment-Verwechslungen.
9. Restliche mittlere/niedrige Code-Befunde (M4, M5, M7, M8, N1–N7) im Rahmen der nächsten regulären Wartung.
10. Technischen Manipulationsschutz für die PDF-Ausgabe evaluieren (z. B. digitale Signatur oder zumindest eine im PDF eingebettete Prüfsumme/Erzeugungs-ID) — größerer architektonischer Schritt, aber langfristig der wichtigste Punkt für die versicherungsrechtliche Belastbarkeit der Dokumente.

---

## 8. Was nur simuliert/codeanalytisch geprüft werden konnte (ehrliche Offenlegung)

- **Keine echten Testpersonen:** Die fünf Personas (insbesondere die drei Azubi-Stufen und die fachfremde Person) wurden auf Basis der beobachteten UI, Fehlermeldungen und Feldstruktur plausibel hergeleitet, nicht durch reale Nutzertests mit tatsächlich unterschiedlichem Vorwissen durchgeführt. Die geschilderten Anfängerfehler sind begründete Annahmen, keine beobachteten Fakten.
- **Kein echtes Papier:** Es wurde nichts tatsächlich ausgedruckt oder von Hand ausgefüllt. Die Papier-Variante beruht auf der Analyse der PDF-Leerformulare (Feldbreite, Spaltenzahl, Reihenfolge) und einer Einschätzung, wie sich das handschriftlich auswirken würde.
- **Keine echten mobilen Geräte:** Alle Viewport-Tests liefen in einem headless Chromium mit simulierter Fenstergröße, nicht auf echten Tablets/Smartphones. Touch-Gesten, Akkuverhalten, echte Kamera-Integration (Foto-Aufnahme direkt aus der App heraus über die Gerätekamera statt Datei-Upload) und Safari/iOS-spezifisches Verhalten wurden nicht geprüft.
- **Keine echte Mehrbenutzer-/Langzeitnutzung:** Speicherverhalten wurde nur über einzelne Reloads innerhalb einer Sitzung geprüft, nicht über Wochen/Monate mit vielen Entwürfen, keine Prüfung des Verhaltens bei tatsächlich vollem Browser-Speicher (nur der Code der `sicherSetItem()`-Fehlerbehandlung wurde gelesen, nicht ein echtes Quota-Limit provoziert).
- **Kein echtes Firmen-/Domain-Hosting:** PWA-Installation, HTTPS-Zertifikat, echte Update-Mechanik über eine reale Domain wurden nicht getestet (nur lokaler HTTP-Server).
- **Beleuchtungs-/Kontrast-Test „schlechtes Licht/Backstage":** Es wurde keine echte Lichtsimulation durchgeführt, nur rechnerisch der WCAG-Kontrast der UI-Farben ermittelt. Ob die App unter realer Bühnenbeleuchtung (Dimmer, farbiges Licht) lesbar ist, wurde nicht geprüft.
- **Kein Vergleich mit echten Fremdfirmen-Workflows:** Die im Auftrag genannten Nebenbedingungen (wechselnde Aufbauten, Gastspiele, Fremdfirmen-Technik) wurden über die Wahl realistischer Testdatensatz-Namen abgebildet, nicht über einen echten Mehrfirmen-Workflow mit unterschiedlichen Zugriffsrechten (die App kennt ohnehin kein Nutzerkonten-/Rechtesystem — reine Einzelplatz-PWA).
- **PDF-Manipulationssicherheit** wurde nur an der Abwesenheit von Schutzmechanismen (Encryption/Signatur/Metadaten) verifiziert, nicht durch einen tatsächlichen Manipulationsversuch mit einem PDF-Editor.

---

*Erstellt als Teil des Test- und Analyseprozesses zur VDE-Prüfprotokoll-App. Zugrundeliegende Testartefakte (Screenshots, PDF-Exporte, Playwright-Skripte) liegen im Sitzungs-Arbeitsverzeichnis vor und können bei Bedarf nachgereicht werden.*
