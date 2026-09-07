# VDE-App Testbericht — Version 7.0.0 (echter Browser-Testlauf)

**Getestete Version:** 7.0.0
**Testdatum:** 07.09.2026
**Tester:** Claude (Cowork-Sitzung, echter Browser-Testlauf mit Playwright/Chromium)
**Grundlage:** `VDE-App-7.0.0-Aenderungsbericht.md` — dort war ausdrücklich vermerkt, dass in der Vorgänger-Sitzung **kein Live-Test im Browser möglich war** (auf dem Windows-Rechner standen weder Python noch Node.js zur Verfügung). Diese Lücke ist der Haupt-Auftrag dieser Sitzung.

---

## Testmethode

Alle 52 Projektdateien wurden vom verbundenen Rechner in eine Cloud-Umgebung mit Python/Node.js übertragen, dort per lokalem HTTP-Server ausgeliefert und mit echtem Chromium (Playwright, `headless=new`) bedient — nicht nur Code gelesen. Konkret durchgeführt:

- Syntax-Check aller 14 JavaScript-Dateien (`node --check`) — fehlerfrei
- Echte Formular-Bedienung in allen drei Protokolltypen (Klicks, Eingaben, Dropdown-Auswahl, Datei-Upload)
- Echte PDF-Erzeugung (9 PDFs) mit anschließender Text- und Bild-Extraktion zur inhaltlichen Prüfung
- Echter Offline-Test: Service Worker aktivieren lassen, Netzwerk vollständig kappen (`context.setOffline(true)`), Navigation und PDF-Erzeugung offline wiederholen
- Foto-Upload-Test mit echter Bilddatei in allen drei Formularen
- Autosave-Test: Formular befüllen, Seite neu laden, Wiederherstellung prüfen
- Konsolenfehler-Überwachung (`console.error`, `pageerror`) durchgängig aktiv

**Nicht abgedeckt** (wie schon in den Vorberichten): echte physische Geräte/Touch/Safari, insbesondere die für B6 explizit geforderte Android-Nachprüfung der Zifferntastatur — das bleibt ein reiner Geräte-Test und ist mit Browser-Automatisierung nicht seriös simulierbar.

---

## Executive Summary

Version 7.0.0 funktioniert im echten Browser-Testlauf **durchgehend stabil**. Alle drei Protokolltypen lassen sich vollständig ausfüllen, Stromkreise/Übergabepunkte/Geräte lassen sich hinzufügen, duplizieren und entfernen, alle PDF-Exporte (ausgefüllt, leer/Blanko, mit Fotoanhang) wurden real erzeugt und inhaltlich geprüft. Die im Änderungsbericht als "bitte noch prüfen" markierten Punkte B4, B5, C7 und G17 wurden nachgeprüft und funktionieren wie beschrieben. Es wurde **ein neuer, bisher nicht dokumentierter Fehler** gefunden: Das Warnsymbol ⚠ im Testdaten-Hinweistext wird im PDF-Export als literales Fragezeichen "?" dargestellt, weil der eingebettete PDF-Font das Zeichen nicht enthält.

---

## Neu gefundene Fehler

### #1 — Warnsymbol ⚠ erscheint im PDF als "?" (MEDIUM)

**Fundort:** `js/pdf-generator.js:710` — `const TESTDATEN_HINWEISTEXT = '⚠ Dies sind Beispiel-/Testdaten, kein echtes Prüfprotokoll.';`
Eine zweite, wahrscheinlich gleichartig betroffene Stelle: `js/pdf-utils.js:1529` — `return '⚠ ungültig: ' + s.trim();` (Warnhinweis bei ungültigem Messwert; nicht separat mit einem realen Fehleingabe-Fall nachgestellt, aber derselbe Rendermechanismus).

**Nachweis:** PDF mit den Beispieldaten "Mit Mängeln" erzeugt und den Text direkt aus dem PDF extrahiert (nicht nur als Bild betrachtet). Im PDF-Text steht buchstäblich:
> `? Dies sind Beispiel-/Testdaten, kein echtes Prüfprotokoll. Stromkreis 2: ...`

Im Browser (Live-Ansicht der App) tritt der Fehler **nicht** auf — dort wird das Zeichen korrekt mit dem System-/Browserfont dargestellt. Betroffen ist ausschließlich der PDF-Export, weil dort der eingebettete Liberation-Sans-Font (`js/vendor/liberation-sans-font.js`, für jsPDF) keine Glyphe für U+26A0 (⚠) enthält und jsPDF beim Fehlen einer Glyphe lautlos auf "?" ausweicht — es gibt dabei keine Fehlermeldung in der Konsole, der Fehler fällt nur beim genauen Lesen des PDFs auf.

**Praktische Einordnung:** Der Hinweistext erscheint auf jedem mit Beispieldaten erzeugten PDF sowie überall dort, wo ein ungültiger Messwert eingetragen wurde. Fachlich kein Sicherheitsrisiko (der Fließtext bleibt verständlich), aber unschön und beim Vorzeigen/Ausdrucken auffällig.

- **Fix:** Entweder das ⚠-Zeichen durch ein Zeichen ersetzen, das im eingebetteten Font vorhanden ist (z. B. "⚠" durch "!" oder "ACHTUNG:" ersetzen — analog zum bereits vorhandenen Muster `"ACHTUNG:"` im Freigabetext), oder ein Warndreieck als kleine Bild-Grafik statt als Unicode-Zeichen ins PDF einbetten. Die textbasierte Lösung ("!" oder "ACHTUNG –") ist der risikoärmere, mechanische Fix.
- **Aufwand:** Sehr niedrig.
- **Priorität:** Sollte (betrifft jedes mit Beispieldaten erzeugte PDF, ist also gut sichtbar).

---

## Nachprüfung der im Änderungsbericht offen gelassenen Punkte

**B4 (Netzmessung standardmäßig aufgeklappt):** Bestätigt korrekt — der Abschnitt ist nach dem Laden ohne Interaktion bereits geöffnet (`<details open>`).

**B5 (Netzmessung "Fest verkabelt" / "Steckstelle"):** Bestätigt korrekt. Bei Auswahl "Steckstelle" erscheint das Zusatzfeld "Steckverbindung mitgeprüft" zuverlässig (computed `display: flex`); bei "Fest verkabelt" bleibt es verborgen. Hinweis für zukünftige eigene Tests: Bei automatisierten Tests muss die Auswahl über den Options-`value` ("Steckstelle"), nicht über den vollen sichtbaren Label-Text ("Steckstelle (Kupplung/Steckdose/Verlängerung)") erfolgen — ein erster Testlauf dieser Sitzung ist genau daran gescheitert und hätte beinahe einen nicht existierenden Fehler gemeldet. Nach Korrektur der Testmethode: Funktion einwandfrei.

**C7 (Duplizieren/Entfernen am Kopf und Fuß jeder Karte):** Bestätigt korrekt — pro Stromkreis-Karte wurden zwei "Duplizieren"-Buttons gefunden (Kopf und Fuß), Klick auf einen davon erhöht die Kartenzahl korrekt, "Entfernen" reduziert sie korrekt.

**G17 (Fotodokumentation):** Foto-Upload wurde mit einer echten JPEG-Testdatei in allen drei Formularen (VDE-0100, Anschlussprüfung, Geräteprüfung) erfolgreich durchgeführt — Thumbnail erscheint nach Upload, keine Konsolenfehler. Für `vde0100.html` wurde zusätzlich bestätigt, dass das Foto tatsächlich ins PDF eingebettet wird (Dateigröße wächst von ca. 129 KB auf ca. 136 KB nach Upload eines Fotos). Für Anschluss- und Geräteprüfung wurde – wie im Änderungsbericht als bewusst offener Punkt vermerkt – bestätigt, dass die Foto-Aufnahme zwar funktioniert, das PDF davon aber unverändert bleibt (Dateigröße exakt identisch vor/nach Upload): die PDF-Einbindung dort ist tatsächlich noch nicht umgesetzt, kein neuer Fehler.

**Neue Icons (Drehfeld, Zi-Loop):** Beide Icon-Dateien sind im DOM eingebunden und laden ohne 404 (`img/drehschalter/Drehfeld_Phasendrehung.png`, `img/drehschalter/Z_i_Loop.png`), keine Konsolenfehler beim Laden.

**B6 (Android-Zifferntastatur):** Konnte, wie im Auftrag selbst vermerkt, nicht in dieser Form nachgeprüft werden — das erfordert ein echtes Android-Gerät und keine Browser-Automatisierung.

---

## Vollständig neu getestete Bereiche (in Vorberichten nicht/nur per Code geprüft)

- **Anschlussprüfung (`anschlusspruefung.html`):** Vollständiger End-to-End-Test erstmals durchgeführt. Pflichtfeldprüfung zeigt bei leerem Formular korrekt eine Warnung, kein Absturz. Leeres Protokoll-PDF wird korrekt erzeugt (134 KB, formelbasierte Größen wie R_PE, U_N-PE, Z_S/I_K korrekt gesetzt, siehe Sichtprüfung des PDFs). Übergabepunkt-Karte lässt sich hinzufügen.
- **Geräteprüfung (`geraetepruefung.html`):** Ebenfalls erstmals im Browser getestet. Gerät hinzufügen funktioniert, Pflichtfeldprüfung reagiert korrekt, leeres Protokoll-PDF wird erzeugt (121 KB) und enthält die vollständige Tabelle mit R_PE/R_ISO/Ableitstrom-Spalten inkl. Beispielzeile.
- **Archiv (`archiv.html`):** Lädt fehlerfrei, keine Konsolenfehler.
- **Anleitung (`anleitung.html`):** Lädt fehlerfrei.
- **Autosave/Entwürfe:** Formular befüllt, Seite neu geladen — Inhalt wurde korrekt aus dem lokalen Speicher wiederhergestellt.
- **Echter Offline-Modus (nicht nur Code-Analyse):** Service Worker aktiviert, Netzwerk vollständig gekappt, Navigation zu `vde0100.html` und komplette PDF-Erzeugung funktionieren weiterhin offline. Der einzige fehlgeschlagene Request im Offline-Modus ist der bewusst vom Cache ausgenommene Versions-Check (`js/app-config.js?nocache=...`) — erwartetes, unkritisches Verhalten, deckt sich mit der Beobachtung aus dem Vorbericht zu Version 6.3.0.
- **PWA-Registrierung:** Service Worker registriert und aktiviert sich korrekt, Manifest-Link vorhanden.
- **Sonderzeichen/lange Texte:** Umlaute, €, §, Anführungszeichen sowie ein testweise eingegebener `<script>`-Tag im Auftraggeber-Feld führten zu keinem Absturz und keiner Codeausführung (Feldwert bleibt reiner Text).
- **Robustheit bei ungültigen Pflichtangaben:** Warnender Dialog statt Absturz in allen drei Formularen bestätigt.

---

## Positiv bestätigt (Konsistenz mit Vorbericht)

- Keine Konsolenfehler in irgendeinem der 11 durchgeführten Testabläufe.
- Formel-Formatierung in allen drei PDF-Typen korrekt: R mit tiefgestelltem PE/ISO/LO, Ω, Z_S, I_K, I_Δn, I_Δmess, t_A, U_L/U_mess — visuell identisch zur App-Ansicht, wie vom Auftraggeber gewünscht.
- Ampel-Rotmarkierung bei Grenzwertüberschreitung (R_ISO) im PDF korrekt sichtbar.
- Wasserzeichen "BEISPIELDATEN – KEIN ECHTES PROTOKOLL" erscheint korrekt auf allen mit Beispieldaten erzeugten PDFs.
- Alle drei Leerformulare (VDE-0100, Anschluss, Geräte) enthalten die vollständige Legende der Formelzeichen unten auf der Seite — für Laien/Auszubildende beim Von-Hand-Ausfüllen hilfreich, deckt sich mit dem vom Auftraggeber vorgegebenen Testszenario "Bühne links über das leere Protokoll zum Ausdrucken".

---

## Offene Punkte, unverändert aus dem Änderungsbericht 7.0.0

Diese waren bereits bekannt und wurden durch diesen Testlauf nicht neu untersucht, da sie explizit auf Rückmeldung des Auftraggebers warten:

1. E14 ("Warnhinweise überarbeiten") — welcher Text genau gemeint ist, ist weiterhin offen.
2. E14.1 — ob bei 6+ Stromkreisen mit langem Bemerkungstext eine kleinere Schrift statt des automatischen Seitenumbruchs gewünscht ist.
3. G17 für Anschluss-/Geräteprüfung — PDF-Einbindung der Fotos dort steht weiterhin aus (in diesem Testlauf erneut bestätigt, siehe oben).
4. Lokale Commits nach GitHub pushen — von dieser Sitzung nicht geprüft (kein GitHub-Zugriff aus der Cloud-Umgebung angefragt).

## Empfehlung

Version 7.0.0 ist aus Sicht aller jetzt real im Browser durchgeführten Tests produktionsreif. Vor dem nächsten Release: den ⚠→?-Fehler beheben (Fund #1, sehr geringer Aufwand) und bei Gelegenheit die B6-Nachprüfung auf einem echten Android-Gerät nachholen — das bleibt der einzige Punkt, der grundsätzlich kein Browser-Test leisten kann.
