# Testauftrag: Vollständige Prüfung der VDE-Prüfprotokoll-App (Stand: aktueller Code)

## Kontext

Du testest die App im Ordner `ZUM-HOCHLADEN` (Live: https://hendrikrueck1-maker.github.io/vde-pruef-app/).
Es handelt sich um eine browserbasierte, offlinefähige PWA zur Erstellung von rechtlich relevanten
VDE-Prüfprotokollen (DIN VDE 0100/0105, Anschlussprüfung Übergabepunkt, Geräteprüfung nach
DIN EN 50699/50678, VDE 0701/0702). Die erzeugten PDFs werden von Elektrofachkräften unterschrieben
und als Prüfnachweis aufbewahrt – **fachliche und inhaltliche Fehler in den PDFs sind kein
kosmetisches Problem, sondern ein Haftungs- und Compliance-Risiko.**

Der Code steht aktuell auf **Version 5.0.0** (`APP_VERSION` in `js/app-config.js` – dort zur Sicherheit
gegenprüfen, falls sich das inzwischen geändert hat, und die tatsächliche Version im Bericht nennen).
Der letzte vorliegende Bug-Report (`Claude outputs/VDE-App-Bug-Report-4.7.2.md`) bezieht sich noch auf
Version 4.7.2 – zwischen 4.7.2 und 5.0.0 können also bereits Fixes oder neue Änderungen eingeflossen
sein, die dieser Testauftrag gegen den **aktuellen** Code neu bewerten soll, statt den alten Bericht
einfach zu wiederholen.

Lies außerdem vor Testbeginn die vorhandenen Analyse- und Bug-Dokumente im
Ordner (`ANALYSE_0-EXECUTIVE-SUMMARY.md` bis `ANALYSE_4-Gesamtpruefung.md`, sowie den Ordner
`Claude outputs/` mit den bisherigen Änderungs- und Bug-Reports). Diese beschreiben frühere Prüfungen
und bereits gemeldete Probleme. **Prüfe explizit, welche dieser früher gemeldeten Punkte im aktuellen
Code behoben sind und welche noch bestehen** – gib das im Bericht klar mit Status (behoben / weiterhin
vorhanden / neu aufgetreten) an, statt alte Befunde einfach zu wiederholen.

## Ziel

Eine erschöpfende, praxisnahe Prüfung der gesamten App – Code-Review UND tatsächliche Ausführung
(nicht nur Lesen des Quelltexts). Ziel ist ein Bericht, den ein Nicht-Programmierer (der App-Betreiber)
lesen und danach entscheiden kann, was vor dem nächsten produktiven Einsatz zwingend zu beheben ist.

## Testmethode (verbindlich)

1. **Code-Review** aller HTML/JS/CSS-Dateien (`index.html`, `vde0100.html`, `anschlusspruefung.html`,
   `geraetepruefung.html`, `archiv.html`, alle Dateien in `js/`, `css/style.css`, `sw.js`,
   `manifest.json`) auf Logikfehler, Grenzwertfehler, fehlende Validierung, Race Conditions,
   stillschweigend verschluckte Fehler (leere `catch`-Blöcke), Sicherheitslücken (XSS, Injection) und
   Wartbarkeitsprobleme.
2. **Tatsächliche Ausführung** der App in einem echten Browser (z.B. Chromium via Playwright/Puppeteer):
   - Alle drei Protokolltypen jeweils einmal **komplett mit Beispieldaten** und einmal **mit
     realistischen, aber ungewöhnlichen Eingaben** (Sonderzeichen, sehr lange Texte, leere Pflichtfelder,
     Kommazahlen, negative Werte, Grenzwerte) durchklicken.
   - Für jeden Protokolltyp mindestens ein **Leerformular-PDF** und ein **vollständig ausgefülltes PDF**
     erzeugen und das Ergebnis-PDF tatsächlich öffnen/rastern und visuell inspizieren (Layout, Umbrüche,
     Lesbarkeit, Vollständigkeit) – nicht nur prüfen, ob die PDF-Erzeugung ohne Absturz durchläuft.
   - Eine **Mehrfach-/Serien-Simulation** durchführen (mehrere Verteilungen/Stromkreise/Geräte in einem
     Lauf, wie in `ANALYSE_2-OpenAir-Simulation.md` beschrieben), um Probleme zu finden, die erst bei
     realistischem Umfang auftreten.
   - Das **Archiv** (`archiv.html`, IndexedDB) nach mehreren erzeugten Protokollen prüfen: Suche, Filter,
     „Erneut prüfen (Vorlage)“-Funktion, Löschen.
   - **Entwürfe/Autosave** testen: Formular teilweise ausfüllen, Seite neu laden/schließen, prüfen ob und
     was wiederhergestellt wird; mehrere parallele Entwürfe anlegen.
   - **Offlineverhalten** testen: App einmal online laden, dann Netzwerk deaktivieren und alle drei
     Protokolltypen offline durchgehen (Service Worker `sw.js`, Cache-Strategie).
   - **Responsives Verhalten** auf mindestens einer mobilen Viewport-Größe (z.B. Tablet-Breite, wie sie
     laut README für Android/iPad vorgesehen ist) prüfen.

## Zu prüfende Bereiche im Detail

### A. Fachliche Korrektheit (höchste Priorität)
- Grenzwertlogik: Z_S/I_K-Berechnung, RCD-Auslösestrom-Abhängigkeiten, U_L bei erhöhter Gefährdung,
  R_PE je Leitungslänge – stimmen die Berechnungen und Schwellenwerte mit den einschlägigen Normen
  überein?
- Alle Widerspruchsprüfungen (Freigabe/Plakette gegen Befund, RCD ohne Messwert, Z↔I_K-Plausibilität,
  Netzform vs. Einspeiseart wie „einphasig – L-L entfällt“ bei tatsächlich dreiphasigen Werten).
- Gibt es Felder, die mit einem bestimmten Ergebnis (z.B. „i.O.“) vorbelegt sind, obwohl es sich um eine
  tatsächlich durchzuführende Sicherheits- oder Sichtprüfung handelt? Das wäre eine schwere fachliche
  Fehlfunktion (nicht durchgeführte Prüfungen würden als bestanden dokumentiert).
- Werden feste Beispiel-/Test-Stammdaten (Firmenname, Prüfername, Messgerät samt Seriennummer o.ä.)
  unter irgendeiner Bedingung in ein echtes Protokoll übernommen, obwohl der Nutzer sie nicht selbst
  eingegeben hat?
- Werden Pflichtangaben (Ort der Unterzeichnung, Kalibrierdatum, Seriennummern etc.) bei fehlender
  Eingabe stillschweigend durch Platzhalter/leere Werte ersetzt, statt eine Fehlermeldung zu zeigen?

### B. Datenintegrität und Speicherung
- localStorage: Verhalten bei vollem Speicher (Quota exceeded) – wird der Fehler abgefangen und dem
  Nutzer angezeigt, oder verschwinden Daten lautlos? Prüfe alle `try { localStorage.setItem(...) }
  catch` Stellen in `storage.js`, `entwuerfe.js` u.a.
- Protokollnummern-Vergabe (`storage.js`): Kann es bei Abbruch/Crash zwischen Nummernvergabe und
  Formularabschluss zu Lücken oder Doppelvergaben kommen? Baue gezielt einen Testfall, der das
  provoziert (z.B. Nummer verbrauchen, dann Formular nicht abschließen, neues Formular starten).
- IndexedDB-Archiv: Konsistenz bei parallelen Tabs/Sessions, Verhalten bei sehr vielen Archiveinträgen.
- Migration alter Datenformate/Autosave-Schlüssel bei Versionswechsel.

### C. PDF-Generierung (`pdf-generator.js`, `pdf-utils.js`)
- Layout-Fehler: „1 Blatt“-Formulare, die tatsächlich 2 Seiten erzeugen; Waisenseiten mit nur
  Unterschriftenfeld; zu kleine Schrift (insbesondere Legenden); zu schmale Tabellenspalten für
  handschriftliche Nachbearbeitung.
- Zahlenparsing: Kommazahlen, mehrfache Kommas/Punkte, negative Werte, leere Felder, extrem
  große/kleine Werte – führt das zu `NaN`, falschen Werten oder stillem Datenverlust im PDF?
- Fehlerbehandlung bei der PDF-Erzeugung selbst (was passiert bei Exceptions – bricht die App ab, zeigt
  sie eine verständliche Meldung, oder erzeugt sie ein unvollständiges/falsches PDF ohne Warnung?).
- Bei vielen Stromkreisen/Geräten (Serien-/Open-Air-Simulation): Seitenzahl, Lesbarkeit, sinnvoller
  Umbruch, keine abgeschnittenen Inhalte.

### D. Formulare und Validierung
- Pflichtfeldprüfung (`pflichtfelder.js`) auf Vollständigkeit: Gibt es Felder, die fachlich zwingend
  sind, aber nicht als Pflichtfeld markiert sind (oder umgekehrt zu Unrecht blockieren)?
- Fehlermeldungen: Sind sie verständlich und verweisen sie auf die konkrete Fundstelle (Feld/Abschnitt),
  oder sind sie generisch und für den Nutzer nicht auffindbar?
- Eingabefelder mit Sonderzeichen, sehr langen Texten, Copy-Paste aus Excel/Word (versteckte Zeichen).
- Digitale Unterschrifteneingabe (`signature_pad`): Funktioniert sie auf Touch- und Maus-Eingabe, wird
  eine leere Unterschrift korrekt abgelehnt?

### E. Navigation, Links, Entwürfe
- Alle internen Links/Weiterleitungen zwischen den Seiten (`index.html`, den drei Protokollseiten,
  `archiv.html`), insbesondere die Entwurf-Links (`entwuerfe.js`) bei fehlendem oder ungültigem
  Protokoll-Präfix.
- „Erneut prüfen (Vorlage)“-Funktion im Archiv: Werden wirklich nur Stammdaten übernommen und alle
  Messwerte/Bewertungen/Unterschriften/Gesamtergebnis geleert (wie im README versprochen)?

### F. Sicherheit
- XSS: Prüfe die `esc()`-Hilfsfunktion(en) auf Vollständigkeit – testet mit `<script>`-Payloads,
  HTML-Attributen, Event-Handlern in allen Freitextfeldern, die später in HTML oder PDF gerendert
  werden.
- Verhalten bei manipulierten URL-Parametern (z.B. `?entwurf=...`).

### G. PWA/Offline/Service Worker
- Cache-Versionierung in `sw.js`: Wird bei einem Versionswechsel der alte Cache zuverlässig invalidiert,
  oder können Nutzer auf veralteten Assets hängen bleiben?
- Installierbarkeit (`manifest.json`), Icons, Start-URL, Verhalten der Shortcuts.
- Vollständiger Offline-Test aller drei Protokolltypen inkl. PDF-Erzeugung ohne Netzwerk.

### H. Cross-Browser/Cross-Device (soweit im Testumfeld möglich)
- Mindestens Chromium; wenn verfügbar zusätzlich WebKit/Firefox-Engine, da die App explizit für iPad
  (Safari/WebKit) beworben wird.
- Mobile Viewport-Simulation.

## Ausgabeformat des Berichts

Erstelle einen strukturierten Markdown-Bericht (analog zu den vorhandenen `ANALYSE_*`-Dokumenten im
Ordner, aber gegen den **aktuellen** Codestand, nicht wiederholend):

1. **Kurzfassung/Ampel** – pro Bereich (A–H) grün/gelb/rot mit einem Satz Begründung.
2. **Vergleich zum letzten Bug-Report** (`Claude outputs/VDE-App-Bug-Report-4.7.2.md`): Tabelle mit
   Status jedes dort gelisteten Bugs (behoben / weiterhin vorhanden / nicht mehr nachvollziehbar) –
   mit Code-Stellenangabe als Beleg.
3. **Neue Befunde**, priorisiert nach Schweregrad (kritisch/hoch/mittel/niedrig), jeweils mit:
   - Datei und Zeilenangabe bzw. konkreter Fundstelle,
   - Reproduktionsschritten,
   - tatsächlicher vs. erwarteter Wirkung,
   - Beleg (Codeausschnitt, Screenshot-Beschreibung oder erzeugtes PDF-Detail),
   - grober Aufwandsschätzung zur Behebung (leicht/mittel/schwer).
4. **Empfohlene Sofortmaßnahmen** vor dem nächsten produktiven Einsatz (Top 5–10, konkret und umsetzbar).
5. Am Ende: Liste aller tatsächlich erzeugten Test-PDFs/Testartefakte mit kurzer Beschreibung, damit die
   Befunde nachvollzogen werden können.

## Wichtige Leitplanken

- Keine Vermutungen ohne Beleg: Jeder Befund muss an tatsächlich ausgeführtem Code oder erzeugtem PDF
  nachgewiesen sein, nicht nur am Quelltext vermutet.
- Unterscheide klar zwischen fachlichen Fehlern (Normkonformität, falsche Bewertungen – höchste
  Priorität, da haftungsrelevant) und rein technischen/kosmetischen Fehlern.
- Nenne explizit, wenn ein früher gemeldetes Problem geprüft, aber **nicht reproduzierbar** war.
- Verändere im Rahmen dieses Testauftrags **keinen Code** – reiner Test- und Analyseauftrag, keine
  Fixes. Schlage Fixes nur vor.
