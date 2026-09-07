# VDE-App Test Report v7.0 — FINAL

**Getestete Version:** 6.3.0
**Testdatum:** 07.09.2026
**Tester:** Claude (automatisierter Codeanalyse- und Playwright-Testlauf)
**Testzeitraum:** ca. 45 Minuten Laufzeit

---

## Wichtiger Hinweis zur Testmethode

Der Testprompt v7.0 verlangt Tests auf echten physischen Geräten (Laptop, Tablet, Smartphone), in mehreren echten Browsern (Chrome, Firefox, Safari) und mit manueller Netzwerktrennung. Ich habe dazu keinen Zugriff. Stattdessen wurde die App 6.3.0 automatisiert geprüft:

- Vollständige Codeanalyse aller 13 JavaScript-Dateien und 5 HTML-Seiten
- Browser-Simulation mit Playwright/Chromium in 7 Viewport-Größen (Laptop, Tablet Hoch-/Querformat, 3 Smartphone-Auflösungen)
- Echte PDF-Generierung für alle drei Beispieldatensätze mit anschließender Pixel-Verifikation der Ampelfarben im gerenderten PDF
- Echter Offline-Test: Service Worker registrieren lassen, Netzwerk per Request-Interception vollständig kappen, alle 5 Seiten neu laden, PDF offline generieren
- Gezielte Eingabetests (Sonderzeichen, lange Texte, negative Werte, leere Pflichtfelder)
- Statische A11y-Prüfung (Alt-Texte, Label-Verknüpfung, Kontrastberechnung nach WCAG-Formel)

**Nicht abgedeckt:** Firefox/Safari-spezifisches Verhalten, echte Touch-Gesten, Akkuverbrauch, Screenreader-Praxistest, Vergleich mit ausgedruckten Leerformularen, Mehrbenutzer-Synchronisation, Video-/GIF-Dokumentation.

---

## Executive Summary

Die App funktioniert in allen automatisiert prüfbaren Bereichen **produktionsreif**. Die drei Kernfeatures der Version 6.3.0 – responsives Karussell, dreistufige Ampel-Logik (grün/gelb/rot) und die drei Beispieldatensätze – wurden im gerenderten PDF visuell verifiziert und funktionieren exakt wie im Änderungsbericht beschrieben. Die Offline-Fähigkeit ist vollständig (alle 40 Assets werden korrekt vorgehalten, alle Seiten inkl. PDF-Export funktionieren ohne Netzwerk). Ein bereits gestern in einer separaten Analyse gemeldeter „kritischer" Absturzfehler ließ sich unter realistischen Nutzungsbedingungen nicht reproduzieren. Der einzige Befund mit echtem Nutzerimpact ist ein wiederkehrendes Barrierefreiheits-Problem bei der Formular-Beschriftung.

---

## Test-Coverage (automatisiert)

- Stammdaten-Sektion: geprüft (Eingabe, Sonderzeichen, lange Texte)
- Stromkreis-Karussell/Responsive: geprüft (7 Viewports, Pfeil-Sichtbarkeit, kein horizontales Overflow)
- Beispieldatensätze (3 Varianten) + PDF-Ampel-Logik: vollständig geprüft inkl. visueller PDF-Verifikation
- Offline-Fähigkeit (Service Worker): vollständig geprüft
- Fehler-Handling bei ungültigen Eingaben: geprüft
- A11y (statisch): Alt-Texte, Label-Kopplung, Kontrast geprüft
- Geräteprüfung/Anschlussprüfung: Codeanalyse, kein PDF-Export-Test (nur vde0100.html vollständig end-to-end getestet)
- Echte Geräte/Browser/Touch: **nicht möglich**, siehe oben

---

## Kritische Fehler (BLOCKER)

Keine gefunden.

## Wichtige Fehler (HIGH)

**#1 — Fehlende Label-Verknüpfung bei 107 Formularfeldern (Barrierefreiheit)**

In `vde0100.html` (und mutmaßlich den anderen Formularseiten) sind Feldbeschriftungen wie `<label>Auftraggeber / Prüfort:</label>` nicht über `for="auftraggeber"` mit ihrem Eingabefeld verknüpft. Für Screenreader-Nutzer sind betroffene Felder dadurch ohne erkennbare Beschriftung ansprechbar. Das ist ein WCAG-2.1-Verstoß (SC 1.3.1, 4.1.2) und war auch im Testprompt selbst als Prüfpunkt vorgesehen ("Screenreader: Alle Felder lesbar?"). Betrifft laut automatisierter Zählung 107 von rund 130 Formularfeldern.

- **Fix:** `for`-Attribut ergänzen bzw. `<label>` um das `<input>` herum verschachteln. Da alle Feld-IDs bereits vorhanden sind, ist das ein mechanischer, risikoarmer Fix ohne Verhaltensänderung.
- **Aufwand:** Niedrig bis Mittel (viele Fundstellen, aber gleichförmig automatisierbar per Skript).

## Mittlere Fehler (MEDIUM)

**#2 — Fehlender Null-Check bei `querySelector('.c-rcd-pruefstrom')` und `.c-schutzklasse`**

In `js/anschluss-generator.js` (Zeilen 156, 1185) und `js/geraete-generator.js` (Zeile 219) wird direkt `.value` auf das Ergebnis von `querySelector()` zugegriffen, ohne auf `null` zu prüfen – während unmittelbar benachbarte Zeilen (z. B. `anschluss-generator.js:786`, `geraete-generator.js:143/175`) bereits das sicherere Optional-Chaining-Muster (`?.value`) verwenden. Das ist eine erkennbare Inkonsistenz im Code.

*Praktische Einordnung:* Ich habe versucht, diesen Absturz gezielt über den realistischen Pfad auszulösen (korrupter Autosave-/Archiv-Zustand in `localStorage`, anschließendes Neuladen der Seite) – der Crash trat **nicht** auf, weil das betroffene Karten-Template die fraglichen Elemente immer unconditional mit erzeugt. Der von einer gestrigen Codeanalyse als "kritisch/Crash-Risiko" eingestufte Befund ist unter normaler Nutzung also nicht scharf, bleibt aber ein berechtigter Robustheits- und Konsistenz-Hinweis für den Fall künftiger Template-Änderungen.

- **Fix:** Optional Chaining an den drei Stellen ergänzen, analog zu den bereits vorhandenen sicheren Varianten.
- **Aufwand:** Sehr niedrig (~5 Minuten).

## Kleine Fehler (LOW)

**#3 — `manifest.json`: `id` ist relativ (`"./"`) statt eine absolute URL**

Funktioniert in aktuellen Chromium-Browsern, eine URL-basierte ID gilt aber als robuster gegen PWA-Neuinstallationen bei künftigem Domain-/Pfadwechsel. Kein akutes Problem.

**#4 — Bemerkungsfeld im PDF ist immer rosa/rot hinterlegt, unabhängig vom Ampelstatus**

Im PDF ist das Feld "Bemerkungen / Mängel" in allen drei Beispieldatensätzen (auch bei "Ohne Mängel") mit demselben rosa Hintergrund formatiert. Das ist vermutlich bewusstes Design (Hinweisfeld-Optik), könnte aber bei einem Auditor, der nur auf Feldfarben statt auf den Text achtet, kurz zur Verwechslung mit einem Mängel-Hinweis führen. Zur Bestätigung/Klärung, ob das beabsichtigt ist.

---

## Positiv verifizierte Punkte (im Detail geprüft)

- **Ampel-Logik grün/gelb/rot:** Alle drei PDF-Exporte visuell im gerenderten PDF geprüft. "Ohne Mängel" → grüne Markierung bei "Keine Mängel festgestellt" und "Ja" (sicherer Gebrauch). "Mit Mängeln" → rote Markierung bei "Mängel festgestellt", "Nein", zusätzlich R_ISO-Messwert korrekt rot in der Tabelle hinterlegt. "1 Stromkreis defekt" → die neue **gelbe** Zwischenstufe erscheint korrekt bei "Keine Mängel festgestellt" und "Ja", der totgelegte Stromkreis wird mit Begründungstext klar gekennzeichnet.
- **Wasserzeichen:** "BEISPIELDATEN – KEIN ECHTES PROTOKOLL" erscheint groß diagonal und klein in der Kopfzeile auf allen PDF-Seiten aller drei Varianten.
- **Auftraggeber-Feld bei Beispieldaten:** korrekt gefüllt (der in der 6.3.0-Session behobene frühere Bug ist bestätigt behoben).
- **Karussell/Responsive:** Pfeile ab <767px korrekt unsichtbar (390×844, 412×915, 375×667 geprüft), auf Laptop/Tablet sichtbar; kein horizontales Overflow in allen 7 getesteten Viewports; Layout bricht sauber um (1-spaltig Smartphone, 2-/3-spaltig Tablet/Laptop).
- **Offline-Fähigkeit:** Alle 40 in `ALL_ASSETS` gelisteten Dateien existieren auf der Festplatte (keine fehlenden Precache-Einträge). Nach Service-Worker-Aktivierung und vollständiger Netzwerktrennung laden alle 5 Seiten korrekt aus dem Cache, inklusive erfolgreicher PDF-Generierung offline (identische Dateigröße wie online). Die einzigen fehlgeschlagenen Requests im Offline-Modus sind bewusst vom Cache ausgenommene Versions-Check-Anfragen (`?nocache=`) – erwartetes Verhalten.
- **Fehlerbehandlung bei leeren Pflichtfeldern:** Kein Crash; stattdessen klare, verständliche Nutzerwarnung per Dialog ("Es ist noch eine Bewertung offen... Das PDF wurde deshalb nicht erstellt.").
- **Sonderzeichen (ä, ö, ü, €, §):** korrekt verarbeitet und im PDF dargestellt.
- **localStorage-Fehlerbehandlung:** `sicherSetItem()` gibt bei Fehlern korrekt `false` zurück, protokolliert in der Konsole und zeigt zusätzlich einen Alert – der in einer separaten Analyse vom Vortag als offen gemeldete Fehler ist bereits behoben.
- **Kontrast der Ampelfarben:** rechnerisch alle drei ≥ 5,3:1 (WCAG AA erfüllt, Zielwert 4,5:1).
- **Konsolenfehler:** Keine JavaScript-Fehler oder unbehandelten Exceptions auf allen 5 Seiten in keinem der getesteten Viewports.

---

## 10 Verbesserungsvorschläge

**#1: Formular-Labels programmatisch verknüpfen**
- Problem: 107 Formularfelder haben nur visuell benachbarte, nicht technisch verknüpfte Labels.
- Lösung: `for`/`id`-Kopplung systematisch ergänzen (Skript-gestützt möglich, da IDs bereits konsistent vergeben sind).
- Aufwand: Niedrig
- Priorität: Sollte (Barrierefreiheit für Auditor:innen/Kolleg:innen mit Screenreader)

**#2: Optional Chaining konsequent durchziehen**
- Problem: Drei Stellen mit ungeschütztem `querySelector(...).value`.
- Lösung: `?.value` ergänzen, analog zu bestehenden sicheren Aufrufen im selben File.
- Aufwand: Niedrig
- Priorität: Könnte

**#3: Automatisierte Regressionstests (Playwright) fest einrichten**
- Problem: Aktuell wird nach jedem Release manuell/durch Claude-Sessions getestet.
- Lösung: Das in dieser Session verwendete Playwright-Skript (Beispieldaten laden → PDF exportieren → Ampelfarbe pixelgenau prüfen) als Datei im Repo ablegen und bei jedem Release erneut laufen lassen.
- Nutzen: Regressionen wie die drei Ampelfarben werden in Sekunden statt manuell erkannt.
- Aufwand: Niedrig (Skript existiert bereits als Vorlage aus diesem Testlauf)
- Priorität: Sollte

**#4: PDF-Bemerkungsfeld farblich an Ampelstatus koppeln**
- Problem: Rosa Hintergrund im Bemerkungsfeld unabhängig vom tatsächlichen Status.
- Lösung: Nur bei "rot"/"gelb" farblich hervorheben, bei "grün" neutral/weiß lassen – oder bewusst so lassen, falls Designentscheidung.
- Nutzen: Vermeidet Fehlinterpretation durch Auditor:innen, die nur auf Farbe schauen.
- Aufwand: Niedrig
- Priorität: Könnte

**#5: `manifest.json` id auf absolute URL umstellen**
- Problem: Relative id (`"./"`) ist weniger robust bei künftigem Hosting-Wechsel.
- Lösung: Vollständige URL eintragen (z. B. `https://hendrikrueck1-maker.github.io/vde-pruef-app/`).
- Aufwand: Sehr niedrig
- Priorität: Könnte

**#6: Foto-Dokumentation für Mängel** *(bereits in 6.3.0-Bericht als "künftiges Update" vermerkt)*
- Weiterhin sinnvoll, insbesondere für Benutzer 3 (Auditor) aus dem Testprompt.
- Priorität: Sollte

**#7: GitHub-Repo-Root aufräumen** *(bereits im 6.3.0-Bericht als offener Punkt vermerkt)*
- Alte 4.x-Dateien und verschachtelte Ordnerkopie im Repo-Root sind weiterhin nicht bereinigt.
- Priorität: Könnte

**#8: Explizite `maxlength` auf Textfeldern setzen, wo fachlich sinnvoll**
- Beobachtung: `anlage_bez` und vermutlich weitere Freitextfelder haben kein `maxlength`-Attribut (getestet: 250 Zeichen wurden anstandslos akzeptiert). Das ist für Freitext meist unproblematisch, sollte aber bei Feldern mit fester Position im PDF-Layout (z. B. Kopfzeile) geprüft werden, damit lange Eingaben nicht abgeschnitten oder das Layout gesprengt wird.
- Aufwand: Niedrig
- Priorität: Könnte

**#9: Video-/Screenshot-Dokumentation der echten Geräte-Tests**
- Da automatisierte Tests keine echten Safari-/Touch-/Akku-Szenarien abdecken können, empfiehlt sich weiterhin mindestens ein manueller Durchlauf auf echtem iPad/iPhone, wie im Testprompt unter "Durchführungs-Tipps" vorgesehen.
- Priorität: Sollte

**#10: Testdaten-Kennzeichnung auch in `res_bemerkungen` bei zukünftigen neuen Prüfarten übernehmen**
- Das aktuelle Muster (Präfix "TESTDATEN", Hinweistext, Wasserzeichen) ist gut durchdacht und sollte als Vorlage für künftige Formulartypen übernommen werden, falls die App um weitere Prüfarten erweitert wird.
- Priorität: Könnte

---

## Empfehlungen

Version 6.3.0 ist aus Sicht der automatisiert prüfbaren Funktionen produktionsreif. Vor einem finalen Release-Sign-off empfiehlt sich noch ein kurzer manueller Durchlauf auf einem echten Tablet/Smartphone (insbesondere Safari/iOS, das hier nicht getestet werden konnte) sowie die Behebung des Label-Verknüpfungs-Befunds (#1), da Barrierefreiheit explizit im Testprompt als Prüfkriterium genannt ist.
