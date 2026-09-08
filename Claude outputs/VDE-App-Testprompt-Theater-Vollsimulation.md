# Testauftrag – VDE-Prüfprotokoll-App (Stand 7.1.0) – Vollsimulation Theaterbetrieb

Du bist ein autonomes Test-Team. Du bekommst KEINE Rückfragen gestellt und keine weiteren Informationen nachgeliefert – triff plausible Annahmen, dokumentiere sie kurz und beginne sofort mit dem Testen. Ziel ist ein lückenloser, ehrlicher Bericht, kein Wohlwollen. Wenn etwas nicht funktioniert, schreib das klar und konkret (Datei, Zeile, Schritt zur Reproduktion), nicht diplomatisch verklausuliert.

## Kontext

Die App ist ein digitales Prüfprotokoll-Werkzeug (PWA, offlinefähig) für Elektrofachkräfte, mit dem VDE-0100-Anlagenprüfungen, Anschlussprüfungen (VDE 0105) und ortsveränderliche Geräteprüfungen dokumentiert und als PDF ausgegeben werden. Sie wird in einem Theaterbetrieb eingesetzt, wo regelmäßig Bühnen-, Beleuchtungs- und Tontechnik sowie ortsveränderliche Geräte für Veranstaltungen geprüft werden müssen. Es gibt drei Formulare: die Anlagenprüfung (vde0100.html), die Anschlussprüfung (anschlusspruefung.html) und die Geräteprüfung (geraetepruefung.html), dazu Stammdaten (index.html) und eine Anleitung (anleitung.html).

## Simulierte Testumgebung: „Theater Konstanz-Simulation"

Baue dir gedanklich (und wo sinnvoll konkret mit Testdaten) folgendes Szenario auf, bevor du zu testen beginnst:

- Ein Stadttheater mit Hauptbühne, zweiter Spielstätte und Werkstattbereich.
- Mindestens 3 unterschiedliche Prüfobjekte pro Formulartyp, mit realistischen Theater-Bezeichnungen: z. B. Stromkreise für „Bühnenoberlicht Zug 4", „Tontechnik-Rack Regie", „Notlichtanlage Foyer", „Steckdosenleiste Werkstatt"; Geräte wie „Handbohrmaschine Werkstatt", „Nebelmaschine", „Kabeltrommel 25m", „Movinglight-Traverse"; Übergabepunkte wie „Bühnenwagen-Einspeisung", „Gastspiel-Einspeisung Lkw", „Freilicht-Bühne Sommerfest" (falls die App Open-Air-Szenarien unterstützt, dort besonders genau hinschauen).
- Mindestens einen Fall mit erkennbaren Mängeln, einen mit einem einzelnen defekten Stromkreis/Gerät (Gelb-Fall), und einen vollständig fehlerfreien Fall – zusätzlich zu den in der App bereits vorhandenen Beispieldatensätzen (falls vorhanden, diese ebenfalls vollständig durchtesten).
- Realistische Nebenbedingungen eines Theaterbetriebs: Prüfungen unter Zeitdruck vor Vorstellungsbeginn, wechselnde Aufbauten (Gastspiele, Fremdfirmen-Technik), viele ähnlich benannte Geräte (Verwechslungsgefahr), Prüfung bei schlechtem Licht/Backstage (Relevanz für Kontrast/Lesbarkeit).

## Testpersonen (jede Person prüft BEIDE Varianten – Papierprotokoll UND App – mit denselben simulierten Prüfobjekten, damit die Ergebnisse vergleichbar sind)

Für jede Person: eigener Testdurchlauf, eigener Abschnitt im Bericht.

1. **Auszubildender 1. Lehrjahr** – kaum Vorwissen zu VDE-Normen und Messtechnik, kennt Grundbegriffe (Spannung, Strom) nur aus der Berufsschule, hat noch nie ein Prüfprotokoll ausgefüllt. Simuliere typische Anfängerfehler: falsche Einheiten, vertauschte Felder, Unsicherheit bei Fachbegriffen, Abbruch/Nachfragen an Stellen ohne Hilfetext.
2. **Auszubildender 2. Lehrjahr** – kennt Grundschaltungen und einfache Messungen, hat schon bei ein paar Prüfungen zugesehen, aber noch nicht selbstständig protokolliert. Macht noch Fehler bei komplexeren Messgrößen (RCD-Typen, Isolationswiderstand-Interpretation), ist aber sicherer in der Bedienung.
3. **Auszubildender 3. Lehrjahr** – kurz vor der Gesellenprüfung, beherrscht die Messtechnik weitgehend, Fehler entstehen eher durch Routine/Flüchtigkeit (Zahlendreher, übersehene Pflichtfelder) als durch Unwissen.
4. **Komplett unwissende Person** – hat keinerlei elektrotechnischen Hintergrund (z. B. Verwaltungsmitarbeiter:in oder Regieassistenz), soll rein testen, ob die App ohne Fachwissen navigierbar/verständlich ist und wo sie komplett scheitert. Bei dieser Person zählt vor allem: Wo bricht die Verständlichkeit zusammen, welche Begriffe/Icons sind ohne Vorwissen nicht zu entschlüsseln, missbraucht sie Felder auf unerwartete Weise (Freitext-Unsinn, falsche Dateitypen bei Fotos, etc.).
5. **Erfahrene Elektrofachkraft (EFK)** – nutzt die App routiniert, Referenzperson für „wie soll es eigentlich laufen". Prüft zusätzlich gezielt Grenzfälle und Edge Cases (siehe unten), nicht nur den Happy Path.

Für jede Person UND jede Variante (Papier/App) gilt: mindestens einmal absichtlich Fehler/falsche Eingaben provozieren (falsche Werte, Pflichtfelder leer, widersprüchliche Angaben wie „Mängel festgestellt" + „sicherer Gebrauch: ja", Sonderzeichen, zu lange Texte, Zahlendreher, falsche Maßeinheiten, Kommazahlen mit Punkt statt Komma).

### Papier-Variante

Da kein reales Ausdrucken möglich ist: Rekonstruiere aus den PDF-Exporten der App (leere Formulare je Typ erzeugen) das Papier-Äquivalent und simuliere das manuelle Ausfüllen dieser Person (handschriftlich gedacht: Lesbarkeit, Feldgröße, ob alle nötigen Angaben überhaupt Platz haben, ob die Reihenfolge der Felder einem sinnvollen Ausfüll-Workflow ohne digitale Hilfen entspricht, ob Grenzwerte/Hilfestellungen fehlen, die die App als Icons/Anleitungen bietet). Ziel dieses Vergleichs: Herausfinden, welche Fehler auf Papier passieren, die die App durch Validierung/Vorbelegung/Grenzwert-Färbung verhindert – und umgekehrt, ob die App an Stellen mehr verlangt oder komplizierter ist als das Papier je war.

### App-Variante

Echte Bedienung der App simulieren (Codeanalyse +, wenn ein Browser/Playwright zur Verfügung steht, tatsächliche Interaktion): Formular öffnen, Stammdaten übernehmen, Stromkreise/Geräte/Übergabepunkte anlegen und duplizieren, alle Pflichtfelder und optionalen Felder ausfüllen (inkl. Foto-Anlage an Karten UND am zentralen Bemerkungsfeld), Anleitungen/Infokarten pro Messgröße aufklappen und auf Verständlichkeit für die jeweilige Testperson bewerten, PDF exportieren.

## Technischer Testumfang (unabhängig von den Personas, zusätzlich verpflichtend)

### 1. Vollständige Funktionsprüfung
- Alle Eingabefelder aller drei Formulare plus Stammdaten: jeden Feldtyp mindestens einmal mit gültigem, einmal mit ungültigem Wert befüllen.
- Alle Dropdowns/Radiobuttons/Checkboxen: jede Option mindestens einmal auswählen.
- Karten-Funktionen: Hinzufügen, Duplizieren, Löschen (Kopf- und Fuß-Button seit 7.0.0 prüfen), bei mindestens 8–10 Karten pro Formular (Lasttest fürs Karussell/die Kartenliste).
- Foto-Dokumentation: Foto an einzelnen Karten UND am zentralen Bemerkungsfeld anhängen, wieder löschen, mehrere Fotos an einer Karte, sehr großes Foto (>8 MB simulieren) zur Kompressionsprüfung, ungewöhnliches Seitenverhältnis (Hochformat/Panorama) zur Prüfung der unverzerrten PDF-Platzierung (Fix aus 7.1.0 gezielt verifizieren).
- Alle drei vorhandenen Beispieldatensätze („ohne Mängel", „mit Mängeln", „1 Stromkreis/Gerät defekt") in allen drei Formularen, sofern dort verfügbar: Ampel-Logik grün/gelb/rot im PDF pixel-/textbasiert verifizieren, Wasserzeichen prüfen.
- Pflichtfeldprüfung: gezielt einzelne Pflichtfelder leer lassen und prüfen, ob die App korrekt warnt und den PDF-Export verhindert (nicht nur bei einem Formulartyp, bei allen dreien).
- Grenzwert-/Farblogik: für jede Messgröße (U_v, Netzmessung, Z_i, R_ISO, R_PE/R_LO, RCD-Auslösezeit/-strom, Berührungsspannung, Ableitstrom) je einen Wert im grünen, einen im roten und – wo fachlich zutreffend – einen im Grenzbereich eintragen.
- Reine-Vergleichszeichen-Erkennung bei R_ISO („>" ohne Zahl bleibt „leer/gelb", Fix aus 7.1.0) gezielt nachstellen.
- Speicherverhalten: Formular ausfüllen, Seite neu laden/App schließen und wieder öffnen, prüfen ob Daten (inkl. Fotos) erhalten bleiben; mehrere parallele Entwürfe anlegen und verifizieren, dass keine Vermischung zwischen Formularen/Entwürfen stattfindet.
- Offline-Test: Service Worker aktivieren lassen, Netzwerk vollständig kappen, alle Seiten neu laden, alle drei Formulare offline ausfüllen und als PDF exportieren.
- Statusleisten-Verhalten (Bugfix 7.1.0): Karte fokussieren, per Sprung-Scroll (nicht nur sanftes Wischen) an eine Stelle ohne Karte scrollen, prüfen ob die Anzeige korrekt auf den Abschnittsnamen zurückspringt.

### 2. Grafische und Bedienungs-Konsistenzprüfung – SEHR WICHTIG laut Auftrag
Prüfe explizit, ob **alle drei Formulare demselben Schema folgen** (das ist ein eigener, benannter Prüfpunkt, keine Nebensache):
- Gleiche Reihenfolge vergleichbarer Abschnitte (Stammdaten/Kopf → Prüfobjekte → Messungen → Erproben/Funktionsprüfung → Bemerkungen/Mängel → Gesamtbewertung → Unterschrift).
- Gleiche visuelle Gestaltung von Karten (Kopf-/Fußleiste mit Duplizieren/Löschen, Abstände, Rahmen, Farben, Icon-Stil) über alle drei Formulare hinweg.
- Gleiche Bedienlogik: Aufklappverhalten von Anleitungen/Infokarten, Verhalten der Foto-Buttons, Verhalten der Pflichtfeld-Markierung (Farbe/Symbol), Terminologie (z. B. wird „Mängel" überall gleich benannt, nicht mal „Mangel", mal „Defekt", mal „Fehler").
- Layout-Konsistenz auf mind. 3 Viewport-Klassen (Laptop ~1920×1080, Tablet ~768×1024 Hoch- und Querformat, Smartphone ~390×844 und ~375×667): keine Überlappungen, kein horizontales Scrollen, Touch-Ziele ausreichend groß, Pfeile/Steuerelemente des Karussells verschwinden/erscheinen konsistent je nach Formular.
- Icon-Konsistenz: alle Drehschalter-/Messgrößen-Icons (Zi, RCD, R_ISO, R_LO, Phase/Drehfeld, Ableitstrom) auf einheitlichen Stil, Größe, Beschriftung prüfen – gerade weil in den letzten Versionen mehrfach einzelne Icons/Labels korrigiert wurden (Verifizieren, dass die Korrekturen aus dem 7.1.0-Änderungsplan tatsächlich überall angekommen sind, nicht nur an der zuerst gemeldeten Stelle).
- Explizit gegenprüfen: Gibt es Formulierungen/Anleitungstexte, die in einem Formular korrigiert wurden (z. B. „Riso" statt „INSULATION", „Rlo" statt „R LOW Ω"), aber in einem anderen Formular noch in alter Fassung stehen?

### 3. Code-Audit durch simulierten Profi-Programmierer
Unabhängig von den Personas: Prüfe den Quellcode (alle HTML-, JS-, CSS-Dateien) wie ein erfahrener Reviewer:
- Bugs, tote/unerreichbare Codepfade, inkonsistente Null-Checks (z. B. `?.value` vs. ungeschütztes `.value` – bereits mehrfach in früheren Testberichten als Muster aufgefallen, gezielt nach verbliebenen Stellen suchen), Race Conditions bei asynchronen Abläufen (Foto-Laden, PDF-Generierung).
- Unnötige/verwaiste Dateien (alte Versionsstände, ungenutzte Assets, doppelte Icons, Reste vorheriger Refactorings) im Repository.
- Zusammenspiel der drei separaten PDF-Generatoren (pdf-generator.js, anschluss-generator.js, geraete-generator.js): Code-Duplikation, Inkonsistenzen zwischen den dreien, die zur oben beschriebenen Schema-Abweichung führen könnten.
- Speicher-/Performance-Aspekte: IndexedDB-Nutzung für Fotos, Verhalten bei sehr vielen Karten/Fotos, Cache-Liste des Service Workers vs. tatsächlich vorhandene Assets (auf Vollständigkeit prüfen).
- Barrierefreiheit im Code: Label-Verknüpfung (`for`/`id`), Alt-Texte, Kontrastwerte gemäß WCAG AA – Status aus dem letzten bekannten Bericht (H19 in 7.0.0 als behoben vermerkt) stichprobenartig nachverifizieren, nicht blind übernehmen.
- `node --check` bzw. äquivalente Syntaxprüfung für alle JS-Dateien, HTML-Grundvalidierung (Tag-Balance, doppelte IDs).
- Versionsstand (`APP_VERSION`/`SW_VERSION`) und Cache-Liste auf Konsistenz mit tatsächlichem Dateibestand prüfen.

### 4. Abschließende Simulation: Versicherungsprüfung im Schadensfall
Nachdem alle obigen Tests abgeschlossen sind, simuliere abschließend eine **Versicherungssachbearbeitung**, die im Schadensfall (z. B. Brand, Stromunfall bei einer Veranstaltung) die von der App erzeugten PDF-Abschlussberichte als Beleg für ordnungsgemäße Prüfung heranzieht. Prüfe aus dieser Perspektive, kritisch und auf Lücken bedacht, ob die Dokumente „wasserdicht" sind:
- Sind Prüfer, Datum, Anlage/Objekt, verwendetes Messgerät und Prüfnorm eindeutig und rechtssicher identifizierbar?
- Ist die Qualifikation der prüfenden Person (neues Feld aus 7.1.0) im PDF sichtbar dokumentiert?
- Ist die Unterschrift/Bestätigung eindeutig der genannten Person zuordenbar, gibt es Anhaltspunkte für nachträgliche Manipulierbarkeit (z. B. lässt sich ein Wert nach Erzeugung des PDFs noch unbemerkt ändern, ohne dass das PDF ungültig wird oder ein Änderungsdatum sichtbar ist)?
- Sind alle Messwerte inklusive verwendeter Grenzwerte nachvollziehbar dokumentiert (nicht nur „i.O.", sondern der tatsächliche Wert und wonach er bewertet wurde)?
- Ist bei „Mängel festgestellt und behoben" nachvollziehbar, WAS konkret behoben wurde (seit 7.1.0 liegt das komplett im freien Bemerkungsfeld – prüfen, ob das für einen Versicherungsfall ausreichend beweiskräftig ist, oder ob ein leeres/kurzes Bemerkungsfeld hier ein Beweislücken-Risiko darstellt)?
- Sind Fotos eindeutig der richtigen Karte/dem richtigen Mangel zugeordnet und im PDF nachvollziehbar beschriftet?
- Ist erkennbar, ob ein Formular mit Testdaten/Beispieldaten verwechselt werden könnte (Wasserzeichen-Prüfung aus Versicherungssicht: ist es unübersehbar genug, dass niemand ein Beispieldokument versehentlich als echten Beleg einreicht)?
- Fazit dieses Abschnitts: Eine klare Einschätzung, ob die Dokumente in der aktuellen Form einer Versicherungsprüfung standhalten würden, mit konkret benannten Lücken statt allgemeiner Aussagen.

## Format des Abschlussberichts

Erstelle am Ende einen einzigen zusammenfassenden Bericht (als Datei) mit mindestens folgenden Abschnitten:

1. Executive Summary (produktionsreif ja/nein/mit Einschränkungen)
2. Ergebnisse je Testperson × Variante (Papier/App) – 10 Abschnitte
3. Schema-/Konsistenzprüfung über alle drei Formulare
4. Grafische Prüfung je Gerätegröße
5. Code-Audit-Befunde (nach Schweregrad: kritisch/hoch/mittel/niedrig)
6. Versicherungs-Schadensfall-Simulation mit klarer Bewertung
7. Priorisierte Mängelliste (was zuerst behoben werden sollte)
8. Was aus technischen/Umgebungsgründen nicht real, sondern nur simuliert/codeanalytisch geprüft werden konnte – ehrlich benennen, nicht verschweigen

Beginne jetzt sofort mit der Durchführung, ohne weitere Rückfragen zu stellen.
