# VDE-App 8.0.0 — Änderungsplan (final, abgestimmt — wartet auf Go zur Umsetzung)

Stand: 11.09.2026. Ausgangsbasis: **App-Version 7.4.0** (aktueller GitHub-Stand). Grundlage: zwei von dir hochgeladene Korrektur-Prompts plus die RCD-Typen-PDF als Referenzmaterial.

**Wichtig vorab:** Ich habe beide Prompts gegen den tatsächlichen 7.4.0-Code geprüft, nicht nur gegeneinander gelesen. Ergebnis: Ein großer Teil dessen, was in den Prompts gefordert wird, ist **bereits umgesetzt** — vermutlich wurden beide Prompts vor der 7.4.0-Session geschrieben und dann nur teilweise berücksichtigt, oder du hast sie parallel zur laufenden Entwicklung verfasst. Deshalb ist dieser Plan in drei Teile gegliedert: was schon da ist, was noch zu tun ist, und wo die Prompts sich widersprechen oder unklar sind.

---

## Teil 1: Ursprüngliche Ersteinschätzung — KORRIGIERT, siehe Teil 6

Ich hatte hier ursprünglich mehrere Punkte als "bereits erledigt, keine Aktion nötig" eingestuft, nur weil der zugehörige Code-Baustein existiert. Hendrik hat berechtigt zurückgemeldet, dass das an seinem eigentlichen Wunsch vorbeigeht — Code-Existenz heißt nicht automatisch, dass er das damit Gemeinte tut. **Die korrigierte, verbindliche Fassung steht jetzt in Teil 6.** Diese Tabelle bleibt nur als Nachweis stehen, was ursprünglich (fälschlich) als erledigt galt — bitte für die Umsetzung ausschließlich Teil 6 verwenden:

| Punkt (aus Prompt) | Ursprüngliche (falsche) Einschätzung | Korrektur siehe |
|---|---|---|
| "Standrd-Gebäude/Bereich" umbenennen, Auswahlmöglichkeiten ergänzbar | Als erledigt gewertet, weil Dropdown+Freitext existiert | Teil 6.1 — Verwaltung der Liste fehlt komplett |
| Prüfgeräte in Installationstester/Gerätetester trennen inkl. Seriennummer | Als erledigt gewertet, weil zwei Seriennummer-Felder existieren | Teil 6.2 — Gerätename selbst ist nicht editierbar, nur Seriennummer |
| "Protokoll starten" mit 2 Buttons | Als erledigt gewertet (Buttons auf Startseite) | Teil 6.3 — gemeint waren Buttons direkt in den 3 Protokolltyp-Kacheln |
| Archiv: Bereich/Anlage/Objekt sichtbar | Als erledigt gewertet (anlage_bez wird angezeigt) | Teil 6.4 — fehlende Spalten: Standort, Stromkreisanzahl/Geräte/Übergabepunkte |
| Netzmessung optional → Pflicht | Als erledigt gewertet (Feld existiert je Karte) | Teil 6.5 — echte Pflichtfeld-Sperre bei Nicht-Festanschluss fehlt |
| RCD-Typ-Symbole (AC/A/F/B) | Als erledigt gewertet (Icons + Legende vorhanden) | Teil 6.6 — Hendrik liefert verbesserte Icons + neuen Text nach |
| Anlage/Objekt statt Prüflings-ID (Übergabepunkt) | Als erledigt gewertet | **Bestätigt, wirklich korrekt** — verifiziert in `anschlusspruefung.html`, `js/anschluss-generator.js` (PDF-Kopf-Label „Anlage/Objekt:") und `js/archiv.js` (Anzeige- und Fallback-Feld) |
| Besichtigen-Tabelle i.O./n.i.O./n.a. | Als erledigt gewertet | Bestätigt, keine Korrektur nötig |
| Doku/Warnung & Gebäudesystemtechnik streichen | Bereits korrekt als "noch nicht umgesetzt" erkannt | Siehe Teil 2.4 |

---

## Teil 2: Noch offen für 8.0.0 — konkrete Änderungen

### 2.1 Isolationswiderstand: Zusatzfeld "mit/ohne Verbraucher" — ENTSCHIEDEN
Neues Zusatzfeld (Ja/Nein bzw. Dropdown) "Verbraucher angeschlossen?", das **zusätzlich** zum bestehenden `riso_mode`-Dropdown (500V/250V SELV-PELV/1000V) existiert. Bei "ohne Verbraucher" wird die Prüfspannung automatisch auf 250 V vorgewählt (der Nutzer kann das weiterhin manuell übersteuern, falls ein Sonderfall wie SELV/PELV vorliegt). Betrifft in erster Linie `vde0100.html` (Stromkreis-Karten); zu prüfen, ob die Übergabepunkt-R_ISO-Werte in `anschlusspruefung.html` dieselbe Logik ebenfalls bekommen sollen (dort aktuell nur ein einfaches R_ISO-Feld ohne Verbraucher-Unterscheidung) — **Empfehlung: ja, für Konsistenz zwischen den Formularen**, aber bitte kurz bestätigen.

### 2.2 RCD-Schnellauswahl 100 mA ergänzen
Aktuell nur 30 mA als gängiger Wert im Formular hinterlegt (laut Prompt). 100 mA als Schnellauswahl-Option für den Bemessungsfehlerstrom I_Δn soll ergänzt werden.

### 2.3 Schutzeinrichtungs-Basisdaten als aufklappbares Menü VOR der Messprüfung
Wunsch: Ein Aufklappmenü mit Absicherung (Typ/Nennstrom), RCD-Typ, Bemessungsstrom I_n, Bemessungsfehlerstrom I_Δn — inkl. Schnellauswahl, standardmäßig eingeklappt, das sich in die eigentlichen Formularfelder "spiegelt". Das ist aktuell nicht als separates vorgeschaltetes Menü vorhanden, sondern die Felder liegen direkt in der Stromkreis-Karte.
→ **Zu klären:** Ist das eine reine UI-Verbesserung (Eingabe an einer Stelle, Anzeige an mehreren), oder soll das Aufklappmenü die einzige Eingabemaske sein und die bisherigen Einzelfelder ersetzen?

### 2.9 RCD-Typ-Symbole: Typ B+ ergänzen — ENTSCHIEDEN
Abgleich mit der mitgeschickten RCD-Typen-Referenz ergab: Die App-Icons (`RCD_Typ_AC.png`, `_A.png`, `_F.png`, `_B.png`) sind korrekt kumulativ aufgebaut (Typ F = AC+F-Symbol nebeneinander, Typ B = AC+F+Gleichstrom-Symbol nebeneinander) — das ist kein Fehler, sondern entspricht der Fachnorm-Darstellung. **Es fehlt aber Typ B+** (kumulativ: AC+F+Gleichstrom+kHz-Symbol), der laut Referenz zusätzlich sinusförmige Fehlerströme bis 20 kHz erfasst und für gehobenen Brandschutz verwendet wird.
- Neues Icon `RCD_Typ_Bplus.png` (oder ähnlich benannt) als fünfte Option ergänzen, kumulativ aus den vorhandenen Symbolen + neuem kHz-Symbol zusammengesetzt.
- RCD-Typ-Auswahl im Formular (`vde0100.html`, `anschlusspruefung.html`) um "Typ B+" erweitern.
- Legendentext in `js/infokarten.js` um Typ B+ ergänzen (Text bereits oben aus der Referenz-PDF verfügbar: "zusätzlich sinusförmige Wechselfehlerströme bis 20 kHz, gehobener Brandschutz").

### 2.4 Besichtigen-Tabelle in `vde0100.html`: "Doku/Warnung" (Punkt 6) und "Gebäudesystemtechnik" (Punkt 12) ersatzlos streichen — ENTSCHIEDEN
**Bestätigt:** Betrifft auch `vde0100.html` (Anlagenprüfung, 12-Punkte-Liste), nicht nur die Anschlussprüfung. Umzusetzen:
- `sicht_doku` (Punkt 6) und `sicht_gst` (Punkt 12) aus der Besichtigen-Liste in `vde0100.html` entfernen, verbleibende Punkte neu nummerieren (9 statt 11 verbleibende Punkte).
- Analog dazu auch **"Funktion Gebäudesystemtechnik"** (`erp_gst`) im Erproben-Abschnitt prüfen — laut Prompt-Tabelle (Seite 4 des 22-Seiters) war das dort ebenfalls als "ersatzlos streichen" markiert.
- Alle Referenzen in `js/pdf-generator.js` (PDF-Tabellenaufbau, Legende, Blindformular/Fortsetzungsblätter) entsprechend bereinigen, damit keine verwaisten Feldreferenzen bleiben (gleiches Vorgehen wie bei der 7.4.0-Bereinigung von `pruefungsnummer`/`veranstaltung`).

### 2.5 Fotodokumentation für Mängel
Bereits mehrfach als Wunsch vermerkt (auch im 7.0-Testbericht als Vorschlag #6, dort schon als "künftiges Update" notiert). Aus der Bildvorlage (Wellenform-Symbole) und den Prompts wird nicht ganz klar, ob das jetzt für 8.0.0 verbindlich mit rein soll oder weiterhin zurückgestellt ist.
→ **Zu klären:** Soll Fotodokumentation jetzt in 8.0.0 rein?

### 2.6 Prüffristen-Schnellauswahl (1/2/3 Monate, 1/2/4 Jahre) mit Infokarte
Für die Gesamtbeurteilung wird laut beiden Prompts eine Schnellauswahl mit automatischer Terminberechnung gewünscht, plus Infokarte zu den Fristen. Für die Anschlussprüfung bereits in 7.4.0 umgesetzt (Punkt 4, mit 1/2/3 Monate, 1/2/4 Jahre). Für `vde0100.html` (Anlagenprüfung) und `geraetepruefung.html` habe ich noch keine identische Schnellauswahl-Leiste gefunden — nur die automatische Berechnung.
→ **Zu klären:** Soll die sichtbare Schnellauswahl-Buttonleiste (nicht nur ein Dropdown) auch in `vde0100.html` und `geraetepruefung.html` ergänzt werden, damit alle drei Formulare identisch aussehen?

### 2.7 Widerspruch: "9 → 7 Punkte" vs. tatsächlich genannte 3 Streichungen
Bereits im 7.4.0-Bericht als offener Punkt vermerkt und unbeantwortet: Der Auftrag sprach von 9→7 Punkten bei Besichtigen (Anschlussprüfung), nannte aber 3 zu streichende Punkte (macht 9→6). Umgesetzt wurden 6 Punkte. **Bitte bestätigen, dass 6 richtig ist — oder sagen, welcher vierte Punkt eigentlich hätte bleiben sollen.**

### 2.8 PDF-Formulare (Leerformulare) auf neue Struktur prüfen
Beide Prompts fordern, dass die **leeren PDF-Formulare** (Blanko-Ausdrucke) ebenfalls an die neuen Messungen/Besichtigungen und an eine logische, nicht zu eng gedrängte Feldanordnung angepasst werden. Das ist ein eigener Prüfschritt, unabhängig von den Formular-Feldern in der Web-App, und laut 7.4.0-Bericht nicht explizit verifiziert worden (nur die HTML-Formulare wurden getestet, nicht die Blanko-PDF-Layouts separat).

---

## Teil 3: Klärungsstand (mit Hendrik abgestimmt am 11.09.2026)

1. **Besichtigen 9→6 Punkte (Anschlussprüfung):** ✅ Bestätigt — 6 Punkte sind korrekt, war nur ein Zahlendreher im ursprünglichen Prompt.
2. **"Doku/Warnung" & "Gebäudesystemtechnik" streichen:** ✅ Bestätigt — gilt auch für `vde0100.html` (Anlagenprüfung), siehe 2.4 oben.
3. **R_ISO "mit/ohne Verbraucher":** ✅ Bestätigt — neues Zusatzfeld, bestehendes Prüfspannungs-Dropdown bleibt erhalten, siehe 2.1 oben.
4. **RCD-Typen-PDF:** ✅ Bestätigt — löst eine konkrete Änderung aus: Typ B+ als fünftes Symbol ergänzen, siehe 2.9 oben.

Keine offenen Ungereimtheiten mehr — alle Unklarheiten sind geklärt.

---

## Alle Detailfragen final geklärt (11.09.2026)

- **2.1:** "Mit/ohne Verbraucher" gilt **nur** für `vde0100.html`. Die Übergabepunkt-R_ISO in `anschlusspruefung.html` bleibt unverändert einfach.
- **2.3:** Das Schutzeinrichtungs-Aufklappmenü ist **zusätzlich** zu den bestehenden Einzelfeldern — beide Eingabewege bleiben nebeneinander bestehen und synchronisieren sich (analog zum bereits bestehenden Muster der Seriennummer-Synchronisierung aus 7.4.0 Punkt 8).
- **2.5:** Fotodokumentation für Mängel wird **jetzt in 8.0.0 umgesetzt** (bisher mehrfach zurückgestellt, jetzt verbindlich Teil dieser Version).
- **2.6:** Die Prüffristen-Schnellauswahl-Buttonleiste (1/2/3 Monate, 1/2/4 Jahre) wird **einheitlich in allen drei Formularen** ergänzt (`vde0100.html`, `geraetepruefung.html`, zusätzlich zur bereits bestehenden Anschlussprüfung).
- **2.8:** Die Blanko-PDF-Leerformulare werden **mit geprüft und angepasst**, nicht nur die interaktiven Web-Formulare.

Damit sind alle offenen Punkte geklärt. Der Plan ist vollständig und bereit zur Freigabe.

## Teil 4: Sortierung/Struktur der Prüfabläufe (neu, aus "prüfabläufe und daten"-Dokument, 12.09.2026)

Hendrik hat eine dritte Referenz nachgereicht: eine dreispaltige Zieltabelle, die die verbindliche Abschnittsreihenfolge für alle drei Formulare festlegt. Ich habe sie gegen den aktuellen Code (Version 7.4.0) abgeglichen. Ergebnis, gemeinsam geklärt:

### 4.1 Neuer Abschnitt "Anschlusskabel der Anlage" (vde0100.html UND anschlusspruefung.html)
**Bestätigt, zwei getrennte Ebenen:**
- **Neu:** Ein eigener, einmaliger Abschnitt "Anschlusskabel der Anlage" (Kabeltyp, Leiter-Anzahl, Querschnitt) für die Hauptzuleitung der gesamten Anlage bzw. des Übergabepunkts — eingefügt nach "Besichtigen", vor "Messtechnische Prüfungen (Stromkreise)".
- **Bleibt unverändert:** Die bereits bestehenden Kabeltyp/Leiter/Querschnitt-Felder im Kopf jeder einzelnen Stromkreis-Karte (`.c-kabel-typ`, `.c-leiter`, `.c-querschnitt` in `js/pdf-generator.js`) — das ist eine zweite, separate Ebene pro Stromkreis und bleibt bestehen.
- Neue Abschnittsreihenfolge `vde0100.html`: 1. Stammdaten, 2. Netzsystem/Netzbetreiber/Prüfgeräte, 3. Besichtigen, **4. Anschlusskabel der Anlage (NEU)**, 5. Messtechnische Prüfungen (Stromkreise), 6. Erproben, 7. Durchgängigkeit PA/Erdung, 8. Gesamtbeurteilung, 9. Konformitätsbestätigung.
- Neue Abschnittsreihenfolge `anschlusspruefung.html`: 1. Stammdaten, 2. Netzsystem/Bereitsteller, 3. Besichtigen, **4. Anschlusskabel der Anlage (NEU)**, 5. Messtechnische Feststellungen je Übergabepunkt, **6. Erproben (NEU, siehe 4.2)**, 7. Durchgängigkeit PA/Erdung, 8. Gesamtbeurteilung & Freigabe, 9. Übergabebestätigung & Unterschriften.

### 4.2 Neuer Abschnitt "Erproben (Funktionsprüfung)" in anschlusspruefung.html — fehlt komplett
Verifiziert im Code: `anschlusspruefung.html` hat aktuell **keinen** Erproben-Abschnitt (keine Treffer für `erp_`/„Erproben" im Formular). Laut Zieltabelle (Spalte 2) soll er zwischen "Messtechnische Feststellungen" und "Durchgängigkeit PA/Erdung" ergänzt werden, mit den Feldern: Schutzeinrichtungen, RCD-Prüftaste betätigt, Drehrichtung Motoren (je i.O./n.i.O./n.a.) — analog zum bereits bestehenden Erproben-Abschnitt in `vde0100.html`, aber ohne "Funktion Anlage", "Drehfeld CEE" und "Polarität/Steckdosenbelegung" (die laut Tabelle nur in `vde0100.html` vorkommen, nicht am Übergabepunkt).

### 4.3 Bestätigt: kein Fehler bei "Erproben" in vde0100.html
Ursprünglich vermutete Ungereimtheit (Erproben fehlt in der Zieltabelle) hat sich als Nummerierungs-Tippfehler in der Quelltabelle herausgestellt (zwei Zeilen fälschlich mit "6." beschriftet). Erproben bleibt an der bisherigen Stelle in `vde0100.html` (nach Stromkreisen, vor Erdung), keine Änderung an Position oder Feldern nötig — nur an die neue Gesamtreihenfolge (siehe 4.1) anzupassen, weil davor jetzt der neue Anschlusskabel-Abschnitt eingeschoben wird.

### 4.4 Machbarkeit
Beide Ergänzungen sind rein additiv (neuer HTML-Abschnitt + zugehörige Generator-/Speicherlogik nach bestehendem Muster, z. B. analog zum bereits vorhandenen `abschnitt-erdung`-Aufbau) und ohne Konflikt mit den in Teil 1–3 geplanten Änderungen umsetzbar. Betrifft zusätzlich zu den HTML-Formularen: `js/pdf-generator.js` (Kopfstruktur/PDF-Layout `vde0100.html`), `js/anschluss-generator.js` (neuer Abschnitt + PDF-Tabellen für `anschlusspruefung.html`), sowie die Blanko-Leerformulare (ohnehin schon in Punkt 2.8 vorgesehen).

---

## Teil 5: Korrekturen aus der überarbeiteten Tabelle (12.09.2026, zweite Version)

Hendrik hat eine überarbeitete, klarere Version der Zuordnungstabelle nachgereicht. Abgleich gegen Teil 4 und den Code ergab folgende Präzisierungen (alle mit Hendrik abgestimmt):

### 5.1 Potenzialausgleich/Erdung bei der Anschlussprüfung: bleibt pro Übergabepunkt — KEINE Änderung
Die neue Tabelle formuliert den Punkt als "Erdungswiderstand R_PA, Messpunkt/Bezugspunkt" — das klang zunächst nach einem einmaligen globalen Feld wie in `vde0100.html`. **Bestätigt: bleibt wie in 7.4.0 umgesetzt** — Hendrik muss bei der Anschlussprüfung jeden einzelnen Anschluss/Übergabepunkt auf Potenzialausgleich prüfen, daher bleibt das Feld je Übergabepunkt-Karte (`.c-pa-durchg`/`.c-pa-widerstand`), nur die Tabellen-Bezeichnung war verkürzt. Keine Code-Änderung nötig.

### 5.2 Abschnittsreihenfolge `vde0100.html` final bestätigt
9 Abschnitte in dieser Reihenfolge: 1. Stammdaten, 2. Netzsystem/Netzbetreiber (Titel gekürzt, siehe 5.3), 3. Besichtigen, 4. Anschlusskabel der Anlage (NEU, siehe 4.1), 5. Messtechnische Prüfungen (Stromkreise), 6. Erproben, 7. Durchgängigkeit Potenzialausgleich/Erdung, 8. Gesamtbeurteilung/Gewährleistung/Prüftermin, 9. Konformitätsbestätigung/Unterschriften. Das entspricht der bisherigen Code-Reihenfolge, ergänzt nur um den neuen Anschlusskabel-Abschnitt an Position 4.

### 5.3 Abschnittstitel kürzen: "Netzsystem, Netzbetreiber & Prüfgeräte" → "Netzsystem, Netzbetreiber"
**Bestätigt.** Betrifft `vde0100.html` und `anschlusspruefung.html`. Grund: Prüfgerät + Seriennummer stehen ohnehin bereits in Abschnitt 1 (Stammdaten), der Zusatz "& Prüfgeräte" im Abschnittstitel 2 ist daher irreführend. Reine Titel-Änderung, keine Feldverschiebung.

### 5.4 Geräteprüfung: "Prüfart" als eigener Abschnitt 2 heraustrennen
**Bestätigt.** Das bereits bestehende Feld `#pruefart` (Wiederholungsprüfung/Prüfung nach Reparatur) wird aus dem Stammdaten-Abschnitt 1 herausgelöst und bildet einen eigenen, sichtbaren Abschnitt "2. Prüfart" in `geraetepruefung.html`. Alle nachfolgenden Abschnitte rücken eine Nummer weiter (aus "2. Geräte" wird "3. Geräte", aus "3. Gesamtbeurteilung" wird "4. Gesamtbeurteilung", usw. — passt zur Nummerierung in der neuen Tabelle, Spalte 3).

### 5.5 "Grund der Prüfung" in allen drei Formularen ergänzen
Aktuell existiert das Feld `#pruefgrund` nur in `vde0100.html`. **Bestätigt:** Wird zusätzlich in `anschlusspruefung.html` und `geraetepruefung.html` ergänzt (jeweils im Netzsystem- bzw. Prüfart-Abschnitt), damit alle drei Formulare einheitlich Prüfart/Norm + Grund der Prüfung erfassen.

---

## Teil 6: Korrektur "bereits erledigt" (13.09.2026) — neue, verbindliche Punkte

Hendrik hat zu Recht zurückgemeldet, dass mehrere als "erledigt" markierte Punkte an seinem eigentlichen Ziel vorbeigingen. Diese sechs Punkte sind neu bzw. präzisiert und Teil des 8.0.0-Umfangs:

### 6.1 Gebäude/Bereich-Dropdown: Verwaltung im Formular ergänzen (NEU)
Aktuell ist die Liste der Gebäude/Bereiche (Werkstatt, Spiegelhalle, Münsterplatz, Probebühne, Sonstiges...) fest im HTML einprogrammiert (`gebaeude_select`). **Neu, bestätigt:** Ein kleiner "Verwalten"-Button/Icon direkt neben dem Dropdown öffnet einen Dialog, in dem Hendrik eigene Einträge hinzufügen oder entfernen kann. Speicherung im Browser (`localStorage`), gilt einheitlich für alle drei Formulare (gemeinsame Liste). Betrifft `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html`, neue Logik vermutlich in `js/storage.js` oder einem neuen kleinen Modul.

### 6.2 Vier statt zwei Stammdatenfelder für die Prüfgeräte (KORREKTUR)
Bisher: zwei Felder, aber der Gerätename ("Fluke 1663" / "Fluke 6500-2") ist fest im Label-Text einprogrammiert, nicht editierbar (verifiziert in `index.html`). **Neu, bestätigt:** Es werden vier separate Felder:
1. Installationstester (Gerätename/-typ, frei editierbar, Vorbelegung z. B. "Fluke 1663")
2. Seriennummer Installationstester
3. Gerätetester (Gerätename/-typ, frei editierbar, Vorbelegung z. B. "Fluke 6500-2")
4. Seriennummer Gerätetester

Grund: Falls Hendrik künftig ein anderes Messgerät nutzt, muss das nicht mehr im Code geändert werden. Betrifft `index.html`, `js/storage.js` (`applyMasterDataToForm`), sowie die PDF-Kopfzeilen aller drei Formulare, die aktuell vermutlich ebenfalls den festen Gerätenamen referenzieren.

### 6.3 Grün/Gelb-Buttons direkt in jeder Protokolltyp-Kachel (KORREKTUR)
Bisher: "+ Neues Protokoll" und "▶ Letztes weitermachen" existieren nur als zwei globale Buttons oberhalb der Kachelauswahl, unabhängig vom Protokolltyp. **Neu, bestätigt:** Jede der drei Protokolltyp-Kacheln (VDE 0100/Anschlussprüfung/Geräteprüfung) bekommt zwei eigene, farbige Buttons direkt in der Kachel: grün "Neues Protokoll" (immer sichtbar) und gelb "Protokoll fortsetzen" (nur sichtbar, wenn für genau diesen Protokolltyp ein offener Entwurf existiert). Ersetzt/ergänzt die bisherige globale Lösung in `index.html`/`js/entwuerfe.js`.

### 6.4 Archiv UND Entwurfsliste: zusätzliche Spalten (KORREKTUR)
Bisher wird nur `anlage_bez` angezeigt. **Neu, bestätigt:** Sowohl das Archiv (abgeschlossene Prüfungen) als auch die Liste offener Entwürfe auf der Startseite sollen pro Eintrag zusätzlich zeigen: Standort, Gebäude/Bereich, Anlage, sowie eine typspezifische Anzahl — Stromkreisanzahl (bei `vde0100.html`), Geräteanzahl (bei `geraetepruefung.html`) oder Übergabepunkt-Anzahl (bei `anschlusspruefung.html`). Betrifft `js/archiv.js`, `archiv.html`, `js/entwuerfe.js`, `index.html`.

### 6.5 Netzmessung: echte Pflichtfeld-Sperre bei Nicht-Festanschluss (KORREKTUR)
Bisher ist die Netzmessung je Übergabepunkt-Karte vorhanden, aber ohne technische Sperre. **Neu, bestätigt:** Bei Steckstellen-Einspeisung (bzw. generell wenn kein Festanschluss vorliegt) soll die PDF-Erstellung verweigert werden, solange die Netzmessungs-Pflichtfelder nicht ausgefüllt sind — analog zu bestehenden Pflichtfeld-Sperren in der App (z. B. offene Bewertungs-Dropdowns). Betrifft `js/anschluss-generator.js` (Validierungslogik vor PDF-Erzeugung).

### 6.6 RCD-Icons: Update folgt in separater Nachricht (VORGEMERKT)
Hendrik hat verbesserte RCD-Typ-Icons mit neuem Begleittext, die er in einer der nächsten Nachrichten hochlädt. **Vorgemerkt für 8.0.0**, konkrete Umsetzung erst nach Erhalt der Dateien. Ergänzt/ersetzt ggf. den unter Teil 2.9 geplanten Typ-B+-Icon-Zusatz — bei Erhalt neu abgleichen.

### 6.7 Bestätigt ohne Änderung: Anlage/Objekt bei der Übergabepunkt-Prüfung
Verifiziert: `anschlusspruefung.html` hat kein "Prüflings-ID"-Feld mehr, stattdessen "Anlage / Objekt" (`anlage_bez`); der PDF-Kopf zeigt "Anlage/Objekt:" statt "Prüflings-ID:" (`js/anschluss-generator.js`, Zeile mit `pruefNrLabel: "Anlage/Objekt:"`); das Archiv verwendet `anlage_bez` sowohl als eigenes Anzeigefeld als auch als Fallback für die Gebäude-Spalte (`js/archiv.js`). Kein Handlungsbedarf.

---

## Zusammenfassung: vollständiger Umfang für 8.0.0

1. Isolationswiderstand `vde0100.html`: neues Zusatzfeld "mit/ohne Verbraucher" (→ 250 V automatisch bei "ohne")
2. RCD-Schnellauswahl: 100 mA als Option ergänzen
3. Schutzeinrichtungs-Basisdaten-Aufklappmenü (Absicherung, RCD-Typ, I_n, I_Δn) zusätzlich zu bestehenden Feldern, mit Synchronisierung
4. Besichtigen `vde0100.html`: "Doku/Warnung" (Punkt 6) und "Gebäudesystemtechnik" (Punkt 12) streichen, ebenso "Funktion Gebäudesystemtechnik" im Erproben-Abschnitt — Neunummerierung, PDF-Generator und Blindformular/Fortsetzungsblätter bereinigen
5. Fotodokumentation für Mängel (neu, alle drei Formulare)
6. Prüffristen-Schnellauswahl-Buttonleiste einheitlich in `vde0100.html` und `geraetepruefung.html` ergänzen
7. RCD-Typ B+ als fünftes Symbol/Legende-Eintrag ergänzen (neues Icon, kumulativ aus vorhandenen Symbolen + kHz-Symbol)
8. Blanko-PDF-Leerformulare an alle obigen Änderungen anpassen
9. **Neu:** Abschnitt "Anschlusskabel der Anlage" in `vde0100.html` UND `anschlusspruefung.html` ergänzen (einmalig für die Hauptzuleitung, zusätzlich zu den bestehenden Pro-Stromkreis-Kabelfeldern)
10. **Neu:** Abschnitt "Erproben (Funktionsprüfung)" in `anschlusspruefung.html` ergänzen (fehlt dort komplett)
11. Abschnittsreihenfolge in `vde0100.html` und `anschlusspruefung.html` entsprechend anpassen und neu nummerieren (siehe Teil 5.2)
12. Abschnittstitel "Netzsystem, Netzbetreiber & Prüfgeräte" → "Netzsystem, Netzbetreiber" kürzen (`vde0100.html`, `anschlusspruefung.html`)
13. Geräteprüfung: "Prüfart" als eigenen Abschnitt 2 heraustrennen, Folgeabschnitte neu nummerieren
14. "Grund der Prüfung" zusätzlich in `anschlusspruefung.html` und `geraetepruefung.html` ergänzen
15. **Neu (Teil 6.1):** Verwalten-Funktion (Hinzufügen/Löschen) für die Gebäude/Bereich-Dropdown-Liste, einheitlich in allen drei Formularen
16. **Neu (Teil 6.2):** Vier statt zwei Stammdatenfelder für Prüfgeräte — Gerätename UND Seriennummer je Installationstester/Gerätetester, alle vier frei editierbar
17. **Neu (Teil 6.3):** Grün/Gelb-Buttons ("Neues Protokoll"/"Fortsetzen") direkt in jeder der drei Protokolltyp-Kacheln statt nur global auf der Startseite
18. **Neu (Teil 6.4):** Archiv UND Entwurfsliste um die Spalten Standort, Gebäude/Bereich, Anlage sowie typspezifische Anzahl (Stromkreise/Geräte/Übergabepunkte) erweitern
19. **Neu (Teil 6.5):** Echte Pflichtfeld-Sperre für die Netzmessung bei Nicht-Festanschluss/Steckstelle (PDF-Erstellung wird verweigert, wenn Pflichtfelder fehlen)
20. **Vorgemerkt (Teil 6.6):** RCD-Icon-Update — wartet auf Dateien von Hendrik, danach mit Teil 2.9 (Typ B+) abgleichen
21. Versionssprung `APP_VERSION`/`SW_VERSION`: 7.4.0 → 8.0.0

## Nächster Schritt

Ich beginne mit der Umsetzung erst nach deinem ausdrücklichen Go. Nach Fertigstellung liefere ich wie gewohnt einen Änderungsbericht (`VDE-App-8.0.0-Aenderungsbericht.md`) nach demselben Muster wie die bisherigen Versionen.
