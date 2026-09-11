# VDE-App 8.0.0 — Änderungsplan (final, abgestimmt — wartet auf Go zur Umsetzung)

Stand: 11.09.2026. Ausgangsbasis: **App-Version 7.4.0** (aktueller GitHub-Stand). Grundlage: zwei von dir hochgeladene Korrektur-Prompts plus die RCD-Typen-PDF als Referenzmaterial.

**Wichtig vorab:** Ich habe beide Prompts gegen den tatsächlichen 7.4.0-Code geprüft, nicht nur gegeneinander gelesen. Ergebnis: Ein großer Teil dessen, was in den Prompts gefordert wird, ist **bereits umgesetzt** — vermutlich wurden beide Prompts vor der 7.4.0-Session geschrieben und dann nur teilweise berücksichtigt, oder du hast sie parallel zur laufenden Entwicklung verfasst. Deshalb ist dieser Plan in drei Teile gegliedert: was schon da ist, was noch zu tun ist, und wo die Prompts sich widersprechen oder unklar sind.

---

## Teil 1: Bereits erledigt (Stand 7.4.0) — keine Aktion nötig

Diese Punkte aus den Prompts sind im Code bereits umgesetzt, teils unter 7.4.0, teils früher:

| Punkt (aus Prompt) | Status im Code |
|---|---|
| "Standrd-Gebäude/Bereich" → "Standort-/Gebäude-Bereich" umbenennen, Auswahlmöglichkeiten ergänzbar | `vde0100.html`/`anschlusspruefung.html`: Feld heißt bereits „Gebäude / Bereich" mit Dropdown + Freitext-Fallback (`gebaeude_select` / `gebaeude_custom`) |
| Prüfgeräte in Installationstester/Gerätetester trennen inkl. Seriennummer | Bereits in 7.4.0 Punkt 8 umgesetzt: zwei getrennte Felder `m_seriennummer_installationstester` (Fluke 1663) und `m_seriennummer_geraetetester` (Fluke 6500-2) in `index.html`, inkl. automatischem Rückwärtskompatibilitäts-Sync in `storage.js` |
| "Protokoll starten" mit 2 Buttons: letztes Protokoll weiterführen / neues Protokoll starten | Bereits in 7.4.0 Punkt 6 umgesetzt: „+ Neues Protokoll" und „▶ Letztes weitermachen: …" auf der Startseite |
| Archiv: sehen, welcher Bereich zuletzt geprüft wurde / offene Prüfungen je Anlage/Objekt sichtbar | Vorhanden über bestehende Archiv-/Entwurfsliste (`entwuerfe.js`, `archiv.js`) inkl. `anlage_bez`-Anzeige seit 7.3.0/7.4.0 |
| Netzsystem/Netzbetreiber-Sektion: Art der Einspeisung ergänzen, Netzmessung optional → Pflicht (außer bei Festanschluss) | 7.4.0 Punkt 2: Netzmessung ist jetzt Teil jeder Übergabepunkt-Karte, inkl. Netzart-Auswahl (Drehstrom/1-phasig) |
| Besichtigen-Tabelle: Auswahlmöglichkeiten als i.O./n.i.O./n.a. statt Freitext | In `vde0100.html` bereits als `<select>` mit genau diesen drei Optionen umgesetzt (nicht als Tabelle mit Kästchen wie im 22-seitigen Prompt skizziert, sondern als Dropdown pro Zeile — funktional äquivalent) |
| RCD-Typ-Symbole (AC/A/F/B) mit Bilddatei ergänzen | Bereits umgesetzt in `js/infokarten.js` (`img/drehschalter/RCD_Typ_*.png`), inkl. Legende und Hinweis „am Fluke eingestellter Typ muss dem Typenschild entsprechen" |
| Prüftermin automatisch aus Prüfdatum statt "heute" berechnen | 7.4.0 Punkt 4: Bug behoben, gilt jetzt für alle drei Formulare inkl. `onchange`-Handler |
| Anlage/Objekt statt Prüflings-ID, auch im Archiv sichtbar | 7.4.0 Punkte 1, 7, 11 |
| Doku/Warnung- und Gebäudesystemtechnik-Punkte in Besichtigen "ersatzlos streichen" | **Noch NICHT umgesetzt** — siehe Teil 2, Punkt 2.3 (dieser eine Punkt aus der Tabellen-Liste ist bei der Migration zu Select-Feldern nicht gestrichen worden, siehe unten) |

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

## Noch zu bestätigen, bevor die Umsetzung beginnt

- **2.1 Zusatzfrage:** Soll "mit/ohne Verbraucher" auch in `anschlusspruefung.html` (Übergabepunkt-R_ISO) ergänzt werden, oder nur in `vde0100.html`? (Empfehlung: auch dort, für Konsistenz.)
- **2.3:** Soll das Schutzeinrichtungs-Aufklappmenü die bestehenden Einzelfelder ersetzen, oder nur eine gespiegelte Zusammenfassung obendrüber sein?
- **2.5:** Soll Fotodokumentation für Mängel jetzt in 8.0.0 mit rein, oder weiterhin zurückgestellt bleiben?
- **2.6:** Soll die sichtbare Prüffristen-Schnellauswahl-Buttonleiste auch in `vde0100.html` und `geraetepruefung.html` ergänzt werden (aktuell nur Anschlussprüfung)?
- **2.8:** Sollen die Blanko-PDF-Leerformulare in diesem Zug ebenfalls überprüft/angepasst werden?

Sobald diese letzten fünf Punkte geklärt sind, beginne ich mit der Umsetzung von Version 8.0.0 (Versionssprung `APP_VERSION`/`SW_VERSION`: 7.4.0 → 8.0.0) und liefere danach einen Änderungsbericht nach demselben Muster wie bei den bisherigen Versionen.
