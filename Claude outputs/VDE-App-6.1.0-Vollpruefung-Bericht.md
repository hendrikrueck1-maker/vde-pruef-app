# VDE-Prüfprotokoll-App 6.1.0 – Vollprüfung (Code-Review + Live-Test)

**Geprüfte Version:** 6.1.0 (`js/app-config.js`: `APP_VERSION = '6.1.0'`, `sw.js`: `SW_VERSION = '6.1.0'`, konsistent)
**Prüfdatum:** 04.09.2026
**Prüfmethode:** Vollständiger Code-Review aller HTML/JS/CSS-Dateien **plus** tatsächliche Ausführung in echtem Chromium (Playwright 1.56.0) gegen einen lokalen HTTP-Server, inkl. realer PDF-Erzeugung, Rasterung der PDFs mit `pdftoppm` und visueller Inspektion der PNGs, Offline-Test mit deaktiviertem Netzwerk, Tablet-Viewport (820×1180), Stresstest mit 40 Stromkreisen, Archiv/Entwürfe/URL-Parameter/localStorage-Quota-Simulation.
**Nicht verändert:** Es wurde ausschließlich getestet und analysiert – kein Code der App wurde geändert.

---

## 1. Kurzfassung / Ampel

| Bereich | Status | Begründung |
|---|---|---|
| **A – Fachliche Korrektheit** (Normen, Grenzwerte, Widersprüche) | 🟡 Gelb | Grenzwertlogik (Z_S/I_K, RCD, U_L, R_PE, Erdung) ist normativ korrekt und live verifiziert (B/C/D-Charakteristik, 5×/10×/20× I_n, U_L 50/25 V bzw. 120/60 V, RCD-Auslösezeiten 300/150/40 ms bzw. 500/200/150 ms selektiv). Widerspruchsprüfungen (Freigabe/Plakette vs. Befund, Z↔I_K-Plausibilität, RCD ohne Messwert, kein Prüfling ohne Messung) funktionieren nachweislich. **Aber:** Geräteprüfung – Sichtprüfung/Funktionsprüfung sind technisch weiterhin auf „i.O." vorbelegt (siehe Befund #1, kritisch) und PDFs werden ohne jede Unterschrift anstandslos erzeugt (Befund #2, hoch). |
| **B – Datenintegrität / Speicherung** | 🟢 Grün | `sicherSetItem()` fängt volle Speicher zuverlässig ab und meldet es dem Nutzer (live mit simuliertem `QuotaExceededError` verifiziert). Protokollnummern-Vergabe ohne Lücken im Test. Entwurf-IDs kollisionssicher (Zähler + Zeitstempel + Zufall). |
| **C – PDF-Generierung** | 🟢 Grün | Alle 3 Protokolltypen erzeugen Leerformular + vollständiges PDF fehlerfrei; visuell geprüft (Layout, Seitenumbruch, Lesbarkeit). 40-Stromkreise-Stresstest ergibt sauberen 2-Seiten-Umbruch mit wiederholtem Tabellenkopf in < 1 Sekunde. |
| **D – Formulare / Validierung** | 🟢 Grün | Kommaparsing (`parseMesswert`), negative Werte, Pflichtfeld-Prüfungen, „3x400"-Erhalt, lange Texte mit „…"-Kürzung – alle live verifiziert und korrekt. |
| **E – Navigation / Links / Entwürfe** | 🟢 Grün | Autosave nach Reload korrekt wiederhergestellt, „Offene Prüfungen" funktionieren, Archiv-Vorlage übernimmt nachweislich nur Stammdaten (Messwerte/Bewertungen/Unterschriften/Ergebnis leer bzw. auf Formular-Standardwert). |
| **F – Sicherheit (XSS/Injection)** | 🟢 Grün | `esc()` und `attrEsc()` escapen vollständig (inkl. Anführungszeichen, seit 5.0.0/6.0.0 behoben). Alle Live-XSS-Payloads in allen Freitextfeldern aller 3 Formulare sowie in der Archiv-Suche blieben wirkungslos (kein `alert()`, kein Skript-Einschleusen), erscheinen im PDF als reiner, unausgeführter Text. |
| **G – PWA / Offline / Service Worker** | 🟢 Grün | Alle 3 Formulare laden offline (Netzwerk in Playwright deaktiviert), PDF-Erzeugung funktioniert offline. `versionsKonsistenzPruefen()` vergleicht `SW_VERSION`/`APP_VERSION` aktiv zur Laufzeit (Fix von Bug #6 aus 4.7.2 bestätigt). |
| **H – Cross-Browser / Responsive** | 🟡 Gelb | Nur Chromium getestet (kein Cross-Browser-Test aus Zeitgründen, siehe Abschnitt „Nicht geschafft"). Tablet-Viewport (iPad-Format 820×1180) sieht sauber aus, Touch-Events auf Signature-Pad funktionieren ohne Fehler. |

**Gesamtampel: Gelb.** Kein Blocker, der die App insgesamt unbenutzbar macht – aber **ein kritischer fachlicher Befund** (Geräteprüfung: unbeaufsichtigte „i.O."-Vorbelegung bei Sicht-/Funktionsprüfung) muss vor dem nächsten produktiven Einsatz behoben werden, da er exakt das Szenario ist, vor dem die App bei den anderen beiden Formulartypen bereits ausdrücklich schützt.

---

## 2. Vergleich zum Bug-Report 4.7.2

| # | Bug (4.7.2) | Status | Beleg (aktueller Code, Version 6.1.0) |
|---|---|---|---|
| 1 | localStorage-Speicher-Overflow ohne Warnung, stille `catch`-Blöcke | **Behoben** | `js/storage.js` Z. 23–45: zentrale `sicherSetItem()`-Hülle fängt `QuotaExceededError`, meldet per `showNotification()` **und** `alert()`. Live mit simuliertem Quota-Fehler getestet: `sicherSetItem` liefert `false`, Alert erscheint mit vollständigem Warntext. `autosaveProtocol()` (`js/pdf-generator.js:1888`, ebenso in den anderen zwei Generatoren) nutzt seit 6.0.0 durchgehend `sicherSetItem()` statt rohem `try/catch{}` (war zuvor der einzige verbliebene ungeschützte Pfad, siehe Änderungsbericht 6.0.0 Punkt 8). |
| 2 | Protokollnummer-Verbrauch inkonsistent bei Crash zwischen Anlegen und Verbrauchen | **Behoben** | `js/storage.js:338-356` (`neuesProtokoll()`): Reihenfolge seit 5.0.0 vertauscht – Entwurf wird zuerst angelegt, Nummer erst danach verbraucht. Live-Test: Nummer nach „Neues Formular"-Klick sowie nach Seiten-Reload konsistent, keine Lücke/Doppelvergabe beobachtet. Zusätzlich verhindert `protokollNummerFreigeben()` (Live im Test ausgelöst, Confirm-Dialog „... wurde bereits für ein fertiges PDF vergeben") eine doppelte Nummernvergabe. |
| 3 | URL-Parameter-Injection bei Entwurf-Links (`href="?entwurf=...""` bei ungültigem Präfix) | **Weiterhin vorhanden (aber sehr geringes Risiko, kosmetisch)** | `js/entwuerfe.js:189`: `const datei = ENTWURF_DATEI[e.praefix] || '#';` – der Fallback `'#'` existiert unverändert. Da `praefix` aber ausschließlich intern aus `PROTOKOLL_PRAEFIXE` (`PR`/`AP`/`GP`) gesetzt wird und nie aus Nutzereingabe stammt, ist der Fall in der Praxis nicht erreichbar. Live-Test mit `?entwurf=<script>alert(1)</script>` und mit nicht-existierender Entwurf-ID: App verhält sich beide Male unauffällig (Formular bleibt leer bzw. lädt normal), kein Skript wurde ausgeführt, keine kaputte URL beobachtet. Einstufung auf **niedrig** herabgestuft. |
| 4 | `parseFloat()` mit Komma – „1,2,3" wird stillschweigend zu `1.2` | **Behoben** | `js/pdf-utils.js:20-26`: zentrale `parseMesswert()` zählt Kommas; bei mehr als einem Komma wird `NaN` zurückgegeben statt eines abgeschnittenen Teilwerts. Node-Test bestätigt: `parseMesswert('1,2,3')` → `NaN`. Live im Browser bestätigt: Eingabe „1,2,3" in R_PE-Feld erscheint im PDF als „⚠ ungültig: 1,2,3" in Rot (siehe `vde0100_edgecases.pdf`, `anschluss_edgecases.pdf`, `geraete_edgecases.pdf`). |
| 5 | Alte Autosave-Schlüssel nach Migration nicht bereinigt | **Behoben** | `js/entwuerfe.js:121-135` (`aktivenEntwurfSicherstellen()`): `removeItem()` steht seit 5.0.0 in eigenem `try/catch` **nach** dem `setItem()`, nicht mehr in derselben Klammer – der Alt-Schlüssel wird jetzt auch bei fehlgeschlagenem `setItem()` entfernt. Code-Review bestätigt den Fix; kein Live-Repro nötig, da es sich um einen sehr seltenen Rennlauf-Fall handelt. |
| 6 | Service-Worker Cache-Versionierung unzuverlässig (SW_VERSION/APP_VERSION können auseinanderlaufen, ohne dass es auffällt) | **Behoben** | `sw.js:57-72` (`versionsKonsistenzPruefen()`): vergleicht zur Laufzeit `APP_VERSION` (aus `app-config.js`) gegen `SW_VERSION` (hartkodiert in `sw.js`), loggt bei Mismatch laut in die SW-Konsole und meldet `versionsMismatch` per `postMessage` an alle Clients (`GET_VERSION`-Antwort). Aktuell sind beide Werte konsistent auf 6.1.0. Startseite zeigt zusätzlich „App: 6.1.0 · Offline-Cache: 6.1.0" sichtbar an (`tablet_Start_screenshot.png`). |
| 7 | Entwurf-ID-Kollision (Date.now()+Random) theoretisch möglich | **Behoben** | `js/entwuerfe.js:64-69`: zusätzlicher monoton steigender Zähler (`ENTWURF_ID_ZAEHLER`) kombiniert mit Zeitstempel und Zufall – eine Kollision ist damit ausgeschlossen. |
| 8 | PDF-Export ohne Fehlerbehandlung (jsPDF-Crash blockiert UI) | **Teilweise behoben / weiterhin ein Restrisiko** | `js/pdf-utils.js:1933-1995` (`savePdfCompatible()`) enthält mehrere gestaffelte `try/catch`-Fallbacks für den Speicher-/Freigabe-Pfad (File System Access API → Web Share → Direct-Download, jeweils mit Catch). Die eigentliche **Zeichenlogik** in `generatePDFInner()` (mehrere tausend Zeilen `doc.text()`/`doc.rect()` in `pdf-generator.js`/`anschluss-generator.js`/`geraete-generator.js`) ist jedoch **nicht** in einen übergreifenden `try/catch` gehüllt. Im Test lief die Erzeugung durchgehend fehlerfrei (auch mit 40 Stromkreisen, XSS-Payloads, 500 Zeichen langen Texten) – ein harter Crash konnte nicht provoziert werden, das Restrisiko bei extremen/unvorhergesehenen Eingaben ist aber nicht durch Code ausgeschlossen. Siehe Befund #7 unten. |
| 9 | XSS: `esc()` escapt kein `"`/`'` | **Behoben** | `js/entwuerfe.js:215-222`: `esc()` escapt seit 5.0.0 zusätzlich `"` → `&quot;` und `'` → `&#39;`. Ebenso `attrEsc()` (`js/pdf-utils.js:355-362`), die für alle dynamisch per `innerHTML` aufgebauten Karten (Stromkreise/Übergabepunkte/Geräte) verwendet wird. Live mit Payload `<script>alert(1)</script>"><img src=x onerror=alert(2)>` in Auftraggeber, Anlagenbezeichnung, Prüfer, Bemerkungen, Archiv-Suche getestet – in keinem Fall wurde JavaScript ausgeführt. |
| 10 | Typo/Sprachmix in Kommentaren (trivial) | **Nicht mehr nachvollziehbar / nicht relevant** | Betraf explizit benannte Kommentare, die sich mit dem Code seither mehrfach geändert haben; kein greifbarer Bezugspunkt mehr im aktuellen Code. Kein funktionaler Bug, daher nicht weiterverfolgt. |

**Fazit zum Vergleich:** 8 von 10 gemeldeten Bugs sind nachweislich vollständig behoben, 1 (#3) ist technisch noch im Code vorhanden, aber praktisch nicht mehr ausnutzbar, und 1 (#8) ist teilweise adressiert (Speicher-/Freigabe-Pfad ja, reine Zeichenlogik nein). Das ist ein deutlich verbesserter Stand gegenüber 4.7.2.

---

## 3. Neue Befunde (priorisiert nach Schweregrad)

### 🔴 KRITISCH

#### Befund #1: Geräteprüfung – Sichtprüfung und Funktionsprüfung sind technisch weiterhin auf „i.O." vorbelegt

- **Datei/Fundstelle:** `geraetepruefung.html` wird nicht direkt ausgeliefert – die Gerätekarte wird dynamisch aus `js/geraete-generator.js` Zeilen 81–91 gebaut:
  ```html
  <select class="c-sicht-item"><option>i.O.</option><option>n.i.O.</option><option>n.a.</option></select>
  <!-- 4x identisch, sowie: -->
  <select class="c-funktion"><option>i.O.</option><option>n.i.O.</option></select>
  ```
  Es gibt **keine leere erste Option** (`value=""`) wie bei den entsprechenden Feldern in `vde0100.html`/`anschlusspruefung.html` (dort seit Befund N3, Version 6.0.0, korrigiert: `<option value="" selected>– bitte wählen –</option>`). Der Browser wählt bei einem `<select>` ohne `selected`-Attribut automatisch die erste `<option>` – hier „i.O." – aus.
- **Warum die eingebaute Schutzprüfung das nicht auffängt:** `js/geraete-generator.js:424-427` ruft `ersteLeereAuswahl(['.c-sicht-item', '.c-funktion', ...])` auf (`js/pdf-utils.js:1695-1703`). Diese Funktion erkennt eine offene Bewertung ausschließlich daran, dass `el.value === ''` ist. Da die `.c-sicht-item`/`.c-funktion`-Felder aber gar keine leere Option besitzen, kann `el.value` hier nie `''` sein – die Prüfung ist für genau diese beiden Selektoren strukturell wirkungslos.
- **Reproduktionsschritte (live verifiziert):**
  1. `geraetepruefung.html` öffnen, Stammdaten ausfüllen (Auftraggeber, Prüfer, Datum, Messgerät).
  2. Ein Gerät anlegen, **nur** R_PE, R_ISO und Ableitstrom ausfüllen. Die Felder „Sichtprüfung" und „Funktion" **nicht anklicken**.
  3. Gesamtbewertung ausfüllen (Keine Mängel, Plakette Ja, Gewährleistung Ja), Unterschriften setzen, „Ausgefülltes PDF generieren" klicken.
  4. **Tatsächliche Wirkung:** Das PDF wird anstandslos erzeugt. In der Tabelle stehen „Sichtprüfung: i.O." und „Funktion: i.O." – obwohl diese Prüfungen nie tatsächlich vom Prüfer durchgeführt/bestätigt wurden.
  5. **Erwartete Wirkung:** Wie bei den anderen beiden Protokolltypen sollte die App eine offene Bewertung erkennen und die PDF-Erzeugung mit einer Fehlermeldung verweigern.
- **Beleg:** Screenshot der Playwright-Konsole zeigt `c-sicht-item Werte (NICHT angefasst): ['i.O.', 'i.O.', 'i.O.', 'i.O.']` und `c-funktion Werte (NICHT angefasst): ['i.O.']`, gefolgt von `!!! WICHTIG: PDF WURDE ERZEUGT OBWOHL SICHTPRUEFUNG/FUNKTION NIE ANGEFASST WURDE !!!`. Das erzeugte PDF liegt unter `/home/claude/vde-test/artifacts/geraete_UNREVIEWED_sichtpruefung_TEST.pdf` (gerastert: `png_geraete_UNREVIEWED_sichtpruefung_TEST/page-1.png`) und zeigt im Abschnitt „2. GERÄTE: BESICHTIGEN, ERPROBEN, MESSEN" ein vollständig „i.O."-markiertes, unterschriftsreifes Protokoll für ein Gerät, dessen Sicht-/Funktionsprüfung nie stattgefunden hat.
- **Einordnung:** Das ist exakt das fachliche Risiko, das die App bei `vde0100.html`/`anschlusspruefung.html` seit Version 6.0.0 (Befund N3) ausdrücklich beseitigt hat, und das im 6.1.0-Bericht (Punkt 7, `sichtErpNiOPruefen()`) für die anderen beiden Formulare noch zusätzlich abgesichert wurde. Bei `geraetepruefung.html` fehlt sowohl die leere Standardoption als auch die `onchange`-Anbindung von `sichtErpNiOPruefen()` komplett – die Härtung wurde für diesen dritten Protokolltyp nachweislich nicht nachgezogen.
- **Aufwandsschätzung:** Leicht bis mittel. Analog zum bereits vorhandenen Muster: `<option value="" selected>– bitte wählen –</option>` bei beiden Selects ergänzen (2 Stellen im Template-String in `geraete-generator.js`), `sichtErpNiOPruefen()`-Anbindung per `onchange` ergänzen (dafür ggf. leichte Anpassung an `sichtErpNiOPruefen()`, da Geräteprüfung ein anderes Bemerkungsfeld-/Kartenschema nutzt als die anderen beiden Formulare – die Funktion ist aktuell an das Label-Muster „N. Punktname" gekoppelt). Migrations-/Restore-Pfad (`restoreDeviceState()` bzw. äquivalent) muss ebenfalls geprüft werden, damit ein wiederhergestellter alter Autosave-Stand keine unbeabsichtigten alten „i.O."-Werte falsch interpretiert.

---

### 🟠 HOCH

#### Befund #2: Kein Formular erzwingt eine Unterschrift vor PDF-Erzeugung

- **Datei/Fundstelle:** `js/pdf-generator.js:1621,1643`, `js/anschluss-generator.js:1024,1041`, `js/geraete-generator.js:896,913` – jeweils `if (!isBlank && !padXXX.isEmpty()) { doc.addImage(...) }`. Ist das Signature-Pad leer, wird einfach keine Unterschrift ins PDF gezeichnet; es gibt an keiner Stelle einen Abbruch oder auch nur eine Warnung.
- **Reproduktionsschritte (live verifiziert):** VDE0100-Formular vollständig ausgefüllt (alle Pflichtfelder, alle Sichtprüfungen i.O., Messwerte, Gesamtbewertung „Keine Mängel"/„Plakette Ja"/„Gewährleistung Ja"), **beide Signature-Pads unberührt gelassen**, „Ausgefülltes PDF generieren" geklickt.
- **Tatsächliche Wirkung:** PDF wird ohne jede Fehlermeldung erzeugt und heruntergeladen (`leere_unterschrift_TEST.pdf`), mit zwei leeren Linien statt Unterschriften.
- **Erwartete Wirkung:** Da das erzeugte PDF laut Aufgabenstellung „von Elektrofachkräften unterschrieben und als Prüfnachweis aufbewahrt" wird, sollte zumindest die Unterschrift der prüfenden Person (Elektrofachkraft) vor Erzeugung des **ausgefüllten** PDFs (nicht des Leerformulars) verpflichtend sein, oder es sollte zumindest ein deutlicher Warnhinweis erscheinen.
- **Einordnung:** Dies gilt konsistent für alle drei Protokolltypen (VDE0100, Anschlussprüfung, Geräteprüfung) – kein Einzelfall. Da das PDF laut App-Design nach Erzeugung weiterhin bearbeitbar bleibt und ein erneuter Export die Datei einfach ersetzt (siehe `savePdfCompatible`-Kommentar), ist ein gewisser Grad an „Zwischenstand exportieren" beabsichtigt – ein unterschriftsloses, aber inhaltlich vollständiges und mit „Plakette: Ja" versehenes PDF sieht für einen Empfänger aber wie ein fertiges Prüfdokument aus.
- **Aufwandsschätzung:** Leicht. Eine zusätzliche Prüfung analog zu den bestehenden Pflichtfeld-/Widerspruchsprüfungen (`if (!isBlank && padPruefer.isEmpty()) { alert(...); return; }`) vor der eigentlichen PDF-Erzeugung.

#### Befund #3: Statisches Branding „Stadttheater Konstanz Prüfsystem" im App-Rahmen

- **Datei/Fundstelle:** `index.html` Zeile 34: `<span ...>Stadttheater Konstanz Prüfsystem</span>`.
- **Reproduktionsschritte:** `index.html` öffnen (auch im Tablet-Viewport sichtbar, siehe `tablet_Start_screenshot.png`).
- **Tatsächliche Wirkung:** Der Untertitel der Startseite nennt fest „Stadttheater Konstanz" – unabhängig vom tatsächlichen Nutzer/Betrieb der App.
- **Erwartete Wirkung:** Da Version 6.0.0 gezielt alle Fantasie-Stammdaten inkl. „Stadttheater Konstanz" aus den PDF-relevanten Feldern entfernt hat (Befund N2), wäre zu erwarten, dass auch dieser rein kosmetische App-Titel generisch ist oder editierbar/konfigurierbar wäre – insbesondere wenn die App wie geplant von mehreren Betrieben eingesetzt werden könnte.
- **Einordnung:** **Kein Datenintegritäts- oder Haftungsrisiko** – der Text erscheint in keinem PDF und beeinflusst keine Prüfdaten (verifiziert: keiner der generierten Text-Strings taucht in den PDFs auf). Rein kosmetisch/Branding.
- **Aufwandsschätzung:** Leicht (Text in `index.html` anpassen oder aus `app-config.js` konfigurierbar machen).

---

### 🟡 MITTEL

#### Befund #4: URL-Parameter `?entwurf=` akzeptiert beliebige, auch nicht-existierende IDs ohne Rückmeldung

- **Datei/Fundstelle:** `js/entwuerfe.js:147-153` (`entwurfAusUrlUebernehmen()`) und `aktivenEntwurfSicherstellen()`.
- **Reproduktionsschritte (live verifiziert):** `vde0100.html?entwurf=nonexistent-id-12345` aufgerufen.
- **Tatsächliche Wirkung:** Das Formular öffnet sich leer, der `?entwurf=`-Parameter wird als „aktiver Entwurf" akzeptiert, ohne dass ein entsprechender Datensatz existiert oder eine Meldung erscheint. Kein Sicherheitsproblem (kein XSS, keine Dateninjektion – Payload `?entwurf=<script>alert(1)</script>` blieb ebenfalls wirkungslos), aber ein potenziell verwirrendes UX-Verhalten: ein kaputter/veralteter Link aus „Offene Prüfungen" führt stillschweigend zu einem neuen leeren Formular statt zu einer Fehlermeldung „Dieser Entwurf wurde nicht gefunden".
- **Erwartete Wirkung:** Ein Hinweis, wenn die per URL angeforderte Entwurf-ID nicht im Index existiert.
- **Aufwandsschätzung:** Leicht.

#### Befund #5: `archivStatus()` wertet fehlende Freigabeangabe optimistisch

- **Datei/Fundstelle:** `js/archiv.js:233-240`. `if (/^keine/i.test(m) && frei !== 'Nein') return { text: 'i. O.', ... }` – ein Archiveintrag mit `maengel = "Keine Mängel festgestellt"`, aber komplett leerem `ergebnis`-Feld (z. B. weil `res_gewaehrleistung`/`res_freigabe` aus irgendeinem Grund leer blieb) wird als „i. O." (grün) angezeigt, weil `'' !== 'Nein'` wahr ist.
- **Reproduktionsschritte:** Code-Review; im Live-Test trat dieser Fall nicht auf, da die Gesamtbewertungsfelder in der App als Pflichtauswahl behandelt werden und vor PDF-Erzeugung geprüft werden – die Archiv-Statusanzeige selbst hat aber keine eigene Absicherung gegen einen unvollständigen `formState`.
- **Tatsächliche vs. erwartete Wirkung:** Geringes Risiko, da die zugrunde liegende PDF-Erzeugung diesen Zustand bereits verhindert; betrifft nur die **Archiv-Übersichtsanzeige**, nicht das PDF selbst.
- **Aufwandsschätzung:** Leicht (`frei === 'Ja'` statt `frei !== 'Nein'` als Bedingung wäre strenger).

#### Befund #6: `riso_mode` (Prüfspannung Isolationswiderstand) wird bei „Erneut prüfen (Vorlage)" nicht übernommen

- **Datei/Fundstelle:** `js/archiv.js`, `ARCHIV_UEBERNEHMEN`-Liste (Zeilen 404-429) enthält `sich`, `rcd_typ`, `rcd_idn` je Stromkreis, aber nicht `riso_mode` (die gewählte Prüfspannung 500 V DC / 250 V DC SELV-PELV / 1000 V DC).
- **Live-Verifikation:** Per direktem Aufruf von `archivStateAlsVorlage()` im Browser bestätigt: `riso_mode` wird beim Anlegen einer Vorlage geleert (leerer String) statt auf ihren Ausgangswert zurückzufallen.
- **Einordnung:** Nachvollziehbare Design-Entscheidung im Sinne der strengen „nur wirklich beschreibende Angaben"-Politik (die Prüfspannung ist eng mit der tatsächlichen Messung verknüpft) – aber im Gegensatz zu den anderen Leitungsdaten (Kabeltyp, Querschnitt, Sicherung), die übernommen werden, wirkt es inkonsistent, dass ausgerechnet dieses eine Auswahlfeld beim Wiederanlegen neu gesetzt werden muss, obwohl es sich in der Praxis bei derselben Anlage praktisch nie ändert. **Keine fachliche Fehlfunktion**, da das Feld ohnehin eine echte leere Auswahl hat und vor PDF-Erzeugung neu gewählt werden muss.
- **Aufwandsschätzung:** Leicht (falls gewünscht: `riso_mode` zur Allowlist hinzufügen).

---

### 🟢 NIEDRIG

#### Befund #7: Keine übergreifende Fehlerbehandlung um die PDF-Zeichenlogik (Rest von Bug #8, 4.7.2)

Siehe Tabelle Abschnitt 2, Zeile 8. Kein Crash im Test provozierbar, aber die mehrere tausend Zeilen lange Zeichenlogik in den drei `generatePDFInner()`-Funktionen hat keinen übergreifenden `try/catch`, der dem Nutzer bei einem unerwarteten jsPDF-Fehler eine geordnete Fehlermeldung statt eines stillen Hängenbleibens zeigen würde. **Aufwand:** mittel (ein globaler try/catch um den Aufruf mit nutzerfreundlicher Fehlermeldung + Reset der UI-Sperre).

#### Befund #8: `ENTWURF_DATEI[e.praefix] || '#'`-Fallback weiterhin im Code (Rest von Bug #3, 4.7.2)

Siehe Tabelle Abschnitt 2, Zeile 3 – technisch vorhanden, praktisch nicht erreichbar, da `praefix` nur intern gesetzt wird. **Aufwand:** trivial, falls bereinigt werden soll (z. B. `datei || 'index.html'` als sichererer Fallback).

#### Befund #9: „einphasig – L-L entfällt"-Widerspruchsprüfung (Netzform vs. Einspeiseart) nicht auffindbar

Die Aufgabenstellung nannte explizit die Prüfung „Netzform vs. Einspeiseart (z. B. „einphasig – L-L entfällt" bei tatsächlich dreiphasigen Werten)" als zu testenden Punkt. Im aktuellen Code (`anschluss-generator.js`, `pdf-generator.js`) konnte **keine** Stelle gefunden werden, die einen solchen Text oder eine entsprechende Plausibilitätsprüfung zwischen Netzsystem/Einspeiseart und den L-L-Spannungsfeldern durchführt – alle sechs Netzspannungsfelder (L1-N…L1-L3) sind in beiden Formularen immer sichtbar und werden unabhängig von der gewählten Einspeiseart/Netzform nur gegen ihre DIN-EN-50160-Toleranzbänder geprüft (`netzspannungAusserNorm()`, 6.1.0-Fix Nr. 1). Es ist nicht auszuschließen, dass sich dies auf eine ältere, nicht mehr vorhandene Version bezog oder auf ein anderes Feld, das im jetzigen Code nicht mehr existiert – **dieser Punkt konnte mangels auffindbarer Implementierung nicht geprüft werden** und wird hier explizit als „nicht verifizierbar" vermerkt statt als Befund gewertet.

---

## 4. Empfohlene Sofortmaßnahmen vor dem nächsten produktiven Einsatz

1. **Kritisch, zuerst:** Geräteprüfung – `.c-sicht-item`/`.c-funktion` auf echte leere Standardauswahl (`– bitte wählen –`) umstellen und in `ersteLeereAuswahl()`-Prüfung wirksam einbinden (Befund #1). Dies ist der einzige Befund, der eine tatsächlich unterlassene Prüfung als bestanden dokumentieren lässt.
2. Unterschriftspflicht (mindestens Prüfer/-in) vor Erzeugung des **ausgefüllten** PDFs in allen drei Formularen einführen oder zumindest einen unübersehbaren Warnhinweis anzeigen (Befund #2).
3. `sichtErpNiOPruefen()`-Logik (rote Markierung + automatischer Bemerkungseintrag bei n.i.O.) auf die Geräteprüfung ausweiten – aktuell nur in den beiden anderen Formularen vorhanden.
4. Statisches Branding „Stadttheater Konstanz Prüfsystem" in `index.html` generalisieren oder konfigurierbar machen, falls die App für andere Betriebe nutzbar sein soll (Befund #3).
5. Für `?entwurf=<ungültige-ID>` eine erkennbare Rückmeldung einbauen statt eines stillschweigend leeren Formulars (Befund #4).
6. `archivStatus()` von `frei !== 'Nein'` auf ein strengeres `frei === 'Ja'` umstellen, damit ein unvollständiger Archiveintrag nicht optimistisch als „i. O." angezeigt wird (Befund #5).
7. Übergreifenden `try/catch` um die PDF-Zeichenlogik (`generatePDFInner()`) in allen drei Generatoren ergänzen, mit nutzerfreundlicher Fehlermeldung statt stillem Hängenbleiben (Befund #7, Rest von Bug #8/4.7.2).
8. Vor jedem Release weiterhin sicherstellen, dass `APP_VERSION` und `SW_VERSION` gemeinsam hochgezählt werden – der eingebaute Konsistenz-Check (`versionsKonsistenzPruefen()`) funktioniert, ersetzt aber keine Sorgfalt beim Release-Prozess selbst.
9. Cross-Browser-Test (mindestens Safari/iOS, da explizit für iPad/iPhone-Einsatz konzipiert – „iOS kann den Browserspeicher löschen") nachholen, da dieser Bericht aus Zeitgründen nur Chromium abgedeckt hat.
10. `riso_mode` in die Archiv-Vorlagen-Übernahmeliste aufnehmen, falls die Prüfspannung in der Praxis üblicherweise gleich bleibt (Befund #6, optionale Komfortverbesserung).

---

## 5. Verbesserungsvorschläge und Erweiterungsempfehlungen

### 5.1 Infokarten je Prüfabschnitt (Kurzerklärung „was wird geprüft und warum")

Empfehlung: pro Formularabschnitt (z. B. „Schleifenimpedanz Z_S", „RCD-Prüfung", „Isolationswiderstand", „Berührungsspannung U_L") eine klappbare Infokarte direkt neben der Eingabegruppe (nutzt das bereits vorhandene `<details>`-Muster, siehe `netzmessung_block` in `vde0100.html`), mit:
- **Was wird geprüft:** 1-2 Sätze, welche Schutzmaßnahme/Norm dahintersteht (z. B. „Die Schleifenimpedanz Z_S bestimmt, ob die vorgeschaltete Sicherung im Fehlerfall schnell genug abschaltet – Grundlage des Schutzes durch automatische Abschaltung nach DIN VDE 0100-410.")
- **Warum ist das wichtig:** greifbare Konsequenz bei Nichteinhaltung (z. B. „Bei zu hoher Impedanz löst die Sicherung im Fehlerfall nicht rechtzeitig aus – Berührungsspannung bleibt gefährlich lange anliegen.")
- Diese Karten könnten die bereits vorhandenen `limit-hint`-Texte (aktuell nur knappe Zahlenwerte, z. B. „≤ 0,30 Ω") sinnvoll ergänzen, ohne das Formular selbst zu überladen (ausgeklappt nur bei Bedarf).

### 5.2 Fluke-1663-Bedienungsanleitung direkt im Formular

Sehr sinnvolle praxisnahe Erweiterung, die sich gut in das bestehende `<details>`-Muster einfügt. Vorschlag je Messgröße eine kurze, konkrete Anleitung:

- **Z_S / I_K (Schleifenimpedanz):** Drehschalter auf „Z-LOOP" bzw. „LOOP", Prüfspitzen/Adapter an Steckdose oder Klemme des betreffenden Stromkreises anschließen, „TEST" drücken, Messwert Z_S (Ω) und errechneten Kurzschlussstrom I_K (A) ablesen und übertragen. Hinweis: Fluke 1663 zeigt bei aktivierter „No-Trip"-Funktion einen strombegrenzten Messwert – für die Dokumentation im Formular ist der angezeigte Z_S-Wert zu verwenden, No-Trip nur bei RCD-geschützten Kreisen aktivieren, um ein Auslösen während der Messung zu vermeiden.
- **RCD-Prüfung (I_Δn, I_Δmess, t_A):** Drehschalter auf „RCD", RCD-Typ (AC/A/F/B) und Nennfehlerstrom am Gerät einstellen, Prüfstrom-Vielfaches wählen (½×, 1×, 2×, 5× I_Δn – muss mit der Auswahl im Formular übereinstimmen!), „TEST" drücken; Gerät zeigt Auslösezeit t_A und (bei Rampentest) Auslösestrom I_Δmess an. Wichtig für die App: der am Fluke gewählte Prüfstrom-Faktor muss exakt dem im Formular ausgewählten „Prüfstrom für Auslösestrom/-zeit" entsprechen, da die App den Grenzwert daraus berechnet.
- **R_ISO (Isolationswiderstand):** Anlage spannungsfrei schalten, Drehschalter auf „Ω INSULATION", Prüfspannung passend zur Anlage wählen (üblich 500 V DC, bei SELV/PELV 250 V DC – muss mit der Formular-Auswahl „Prüfspannung" übereinstimmen), Prüfspitzen zwischen Außenleiter und PE anschließen, „TEST" gedrückt halten bis der Wert stabil ist.
- **R_PE (Schutzleiterwiderstand):** Drehschalter auf „Ω LOW OHM" bzw. „R LOW Ω", vorher am Gerät nullen (Messleitungswiderstand kompensieren), Messung zwischen Potenzialausgleichsschiene/PE-Sammelschiene und dem zu prüfenden Punkt, Leitung dabei leicht bewegen (Wackelkontakt-Prüfung nach DIN EN 50699).
- **U_L (Berührungsspannung) / Netzspannung:** Drehschalter auf „V AC", Spannungsmessung zwischen den geforderten Punkten (L-N, L-L, N-PE), bei Bühnen-/Open-Air-Umgebung mit erhöhter Gefährdung besonders auf den strengeren Grenzwert (25 V statt 50 V) achten – dieser wird von der App bereits automatisch anhand der Auswahl „Gefährdung" berechnet.

Diese Anleitungen sollten als **Empfehlung, nicht als Ersatz** der offiziellen Fluke-Bedienungsanleitung und der jeweils gültigen Normen gekennzeichnet werden (Haftungsaspekt: die App macht keine Aussage zur korrekten Geräteeinstellung, sie unterstützt nur bei der Dokumentation).

### 5.3 Weitere Ideen
- Kleine Geräteklassen-Referenztabelle (SK I/II/III) direkt in der Geräteprüfung als Tooltip, da die Wahl der Schutzklasse den Grenzwert für Ableitstrom und R_ISO direkt bestimmt.
- Ein optionaler „Foto anhängen"-Button je Stromkreis/Gerät (z. B. Typenschild, Schadstelle) würde die Dokumentationsqualität im Streitfall deutlich erhöhen – technisch mit dem bereits verwendeten IndexedDB-Blob-Muster (wie beim PDF-Archiv) umsetzbar.
- Digitale Signatur mit Zeitstempel (aktuelles Datum/Uhrzeit unsichtbar ins PNG der Signature-Pad-Daten einbetten) würde die Beweiskraft im Streitfall zusätzlich stärken.

---

## 6. Testartefakte (alle unter `/home/claude/vde-test/artifacts/`)

### Playwright-Testskripte
| Datei | Zweck |
|---|---|
| `test_vde0100.py` | VDE0100: Leerformular, vollständiges PDF, Edge-Cases (XSS, Kommazahlen, negative Werte, lange Texte) |
| `test_anschluss.py` | Anschlussprüfung: dieselben drei Szenarien |
| `test_geraete.py` | Geräteprüfung: Leerformular, **Sichtprüfung-Default-Test (Befund #1)**, vollständiges PDF, Edge-Cases |
| `test_archiv_entwuerfe.py` | Archiv (Liste/Suche/XSS/Vorlage/Löschen), Autosave-Persistenz, Offene Prüfungen, URL-Parameter-Manipulation, Protokollnummer-Lückentest |
| `test_offline_stress_tablet.py` | Offline-Modus (alle 3 Formulare + PDF-Erzeugung), 40-Stromkreise-Stresstest, Tablet-Viewport (820×1180), Touch-Signatur, leere-Unterschrift-Test |

### Erzeugte Test-PDFs (mit Rasterung als PNG geprüft, sofern nicht anders vermerkt)
| PDF | Beschreibung |
|---|---|
| `vde0100_leerformular.pdf` | VDE0100 Leerformular – visuell geprüft, sauber |
| `vde0100_vollstaendig.pdf` | VDE0100 vollständig ausgefüllt (3 Stromkreise, Netzmessung, Unterschriften) – visuell geprüft, korrekt |
| `vde0100_edgecases.pdf` | VDE0100 mit XSS-Payloads, „1,2,3"-Kommafehler, negativen Werten, „3x400" – visuell geprüft: alle Payloads sicher als Text, Warnmarkierungen korrekt |
| `anschluss_leerformular.pdf`, `anschluss_vollstaendig.pdf`, `anschluss_edgecases.pdf` | Analog für Anschlussprüfung – alle visuell geprüft, korrekt |
| `geraete_leerformular.pdf`, `geraete_vollstaendig.pdf`, `geraete_edgecases.pdf` | Analog für Geräteprüfung – alle visuell geprüft, korrekt |
| **`geraete_UNREVIEWED_sichtpruefung_TEST.pdf`** | **Beweis-PDF für Befund #1**: Sichtprüfung/Funktion nie angefasst, PDF zeigt trotzdem „i.O." |
| **`leere_unterschrift_TEST.pdf`** | **Beweis-PDF für Befund #2**: vollständiges VDE0100-PDF ohne jede Unterschrift |
| `stress_test_40_stromkreise.pdf` | 40-Stromkreise-Stresstest, 2 Seiten, sauberer Umbruch, < 1 s Erzeugungszeit – visuell geprüft |
| `offline_leerformular_test.pdf` | Im Playwright-Offline-Modus (Netzwerk deaktiviert) erzeugtes PDF – Beleg für funktionierendes Offline-Verhalten |
| `archivtest_protokoll_1/2/3.pdf` | Drei Protokolle zum Befüllen des Archivs für die Archiv-Funktionstests |

### Screenshots
`vde0100_filled_screenshot.png`, `anschluss_filled_screenshot.png`, `geraete_filled_screenshot.png`, `archiv_liste_screenshot.png`, `archiv_suche_screenshot.png`, `archiv_suche_xss_screenshot.png`, `archiv_detail_overlay_screenshot.png`, `archiv_vorlage_uebernommen_screenshot.png`, `archiv_nach_loeschen_screenshot.png`, `index_offene_pruefungen_screenshot.png`, `urlparam_xss_screenshot.png`, `urlparam_nonexistent_screenshot.png`, `offline_VDE0100_screenshot.png`, `offline_Anschluss_screenshot.png`, `offline_Geraete_screenshot.png`, `tablet_Start_screenshot.png`, `tablet_VDE0100_screenshot.png`, `tablet_Geraete_screenshot.png`.

### Konsolen-Fehlerprotokolle
`vde0100_console_errors.json`, `anschluss_console_errors.json`, `geraete_console_errors.json`, `archiv_entwuerfe_console_errors.json`, `offline_stress_console_errors.json` – **in allen fünf Dateien: keine unerwarteten JavaScript-Fehler** (die vier Einträge in `offline_stress_console_errors.json` sind erwartete `net::ERR_INTERNET_DISCONNECTED`-Meldungen während des absichtlich simulierten Offline-Tests).

---

## 7. Aus Zeit-/Kontextgründen nicht vollständig geprüft

- **Cross-Browser (Bereich H):** Nur Chromium getestet. Kein Test mit WebKit/Safari (für iPad-Einsatz laut App-Beschreibung relevant) oder Firefox. Playwright hat auch WebKit/Firefox-Engines verfügbar, das wäre eine sinnvolle Ergänzung.
- **Cache-Invalidierung bei echtem Versionswechsel:** Der Code (`versionsKonsistenzPruefen()`, `activate`-Handler mit `caches.delete()` für alte `vde-pruefprotokoll-*`-Cache-Namen) wurde geprüft und ist schlüssig, aber ein echter Versionswechsel (SW_VERSION hochzählen, alten SW im Browser durch neuen ersetzen und beobachten, ob der alte Cache tatsächlich gelöscht wird) wurde nicht live nachgestellt, da das eine Code-Änderung an der App erfordert hätte, die laut Auftrag ausgeschlossen war.
- **„Einphasig – L-L entfällt"-Widerspruchsprüfung:** Wie in Befund #9 dargestellt, konnte im aktuellen Code keine entsprechende Implementierung gefunden werden – dieser Punkt aus der Aufgabenstellung ließ sich daher nicht gegen echten Code verifizieren.
- **Signature-Pad mit echtem Touch-Drag (Multi-Point-Geste):** Es wurde ein einzelner `touchscreen.tap()` getestet (löst keinen Fehler aus); ein vollständiger, mehrpunktiger Zeichenstrich per Touch wurde aus Zeitgründen nicht simuliert (Maus-Drag wurde dagegen vollständig getestet und erzeugt sichtbare Unterschriften im PDF, siehe `vde0100_vollstaendig.pdf`).
- **Sehr lange Sitzungsdauer / IndexedDB mit sehr vielen (>100) Archiveinträgen:** Nur 3 Testprotokolle im Archiv angelegt; ein Belastungstest mit sehr großem Archiv (Performance der Such-/Filterfunktion) wurde nicht durchgeführt.
