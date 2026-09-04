# VDE-Prüfprotokoll-App – Vollprüfung Version 5.0.0

**Geprüfter Stand:** `APP_VERSION` in `js/app-config.js` = **5.0.0** (`SW_VERSION` in `sw.js` stimmt überein) · Ordner `ZUM-HOCHLADEN` · Prüfdatum 03.09.2026
**Prüfmethode:** Code-Review aller HTML/JS/CSS-Dateien **plus** tatsächliche Ausführung in Chromium (Playwright) – Formulare ausgefüllt, PDFs erzeugt, gerastert und visuell inspiziert, Archiv/Autosave/Offline/Mobile-Viewport live getestet. Jeder Befund unten ist entweder an erzeugtem PDF/Screenshot **oder** an tatsächlich ausgeführtem Code (nicht nur vermutet) nachgewiesen; die Fundstelle ist jeweils angegeben.
**Letzter Vorbericht:** `Claude outputs/VDE-App-Bug-Report-4.7.2.md` (Version 4.7.2) sowie `ANALYSE_0` bis `ANALYSE_4` (Version 4.4.0).

---

## 1. Kurzfassung / Ampel

| Bereich | Ampel | Begründung |
|---|---|---|
| **A – Fachliche Korrektheit** | 🔴 **Rot** | Zwei schwere, neu bestätigte Befunde: (1) fest eingebaute Fantasie-Stammdaten (Firma, Netzbetreiber, Messgerät, Seriennummer, Ort) landen bei jedem ersten Formular unbemerkt im PDF; (2) Sicht-/Erprobungsfelder sind technisch weiterhin auf „i.O." vorbelegt (Default-Auswahl des ersten `<option>`), obwohl frühere Berichte das als behoben notierten. Grenzwertlogik (Z_S, RCD-Zeiten, U_L) selbst ist dagegen nachweislich korrekt und sauber implementiert. |
| **B – Datenintegrität/Speicherung** | 🟡 **Gelb** | localStorage-Voll-Fall ist jetzt zentral abgesichert (`sicherSetItem`) und meldet sich beim Nutzer – aber der am häufigsten durchlaufene Pfad (Live-Autosave bei jeder Eingabe) umgeht diese Absicherung noch. Protokollnummern-Vergabe ist gegen Abbruch/Crash deutlich robuster geworden. |
| **C – PDF-Generierung** | 🟢 **Grün** (mit einer wichtigen Ausnahme) | Layout, Seitenumbruch, Tabellenspalten, Legende, Serienverarbeitung (28 Geräte / 14 Stromkreise getestet) – alles sauber, keine Waisenseiten, keine abgeschnittenen Inhalte. **Aber:** eine Zahleneingabe mit doppeltem Komma (z. B. „1,2,3") wird in allen drei Protokolltypen unverändert und **unmarkiert** in die Ergebnis-Tabelle gedruckt, obwohl die Prüf-Logik sie korrekt als ungültig erkennt – ein Stiller-Fehler-Befund mit Haftungsrelevanz. |
| **D – Formulare/Validierung** | 🟡 **Gelb** | Pflichtfeldprüfung und Abbruchlogik greifen für echte Textfelder und für aus Archiv-Vorlagen neu angelegte Formulare zuverlässig. Für frisch geöffnete Formulare greift sie bei den Sicht-/Erprobungs-Auswahlfeldern nicht (siehe A). `formatNetzspannung()` verstümmelt weiterhin ungewöhnliche Eingaben wie „3x400" zu „340 / 0". |
| **E – Navigation/Entwürfe/Vorlage** | 🟠 **Orange** | Mehrere parallele Entwürfe, Autosave nach Reload und ungültige `?entwurf=`-Parameter funktionieren einwandfrei. **Aber:** „Erneut prüfen (Vorlage)" im Archiv ist seit Version 4.7.0 für **jeden** Archiveintrag dauerhaft deaktiviert (falscher/veralteter localStorage-Schlüssel) – eine im README beworbene Kernfunktion, die real nie mehr ausgelöst werden kann. |
| **F – Sicherheit (XSS/Injection)** | 🟢 **Grün** | Alle getesteten Payloads (`<script>`, Anführungszeichen, Sonderzeichen) wurden in PDF und HTML korrekt als Text escaped, kein Ausbruch. Nur ein theoretisches, in der Praxis nicht auslösbares Attribut-Escaping-Detail verbleibt (Design-Schwäche, kein aktiver Exploit). |
| **G – PWA/Offline/Service Worker** | 🟢 **Grün** | Cache-Versionierung mit Laufzeit-Konsistenzprüfung (SW_VERSION ↔ APP_VERSION), alte Caches werden beim Aktivieren zuverlässig gelöscht, vollständiger Offline-Betrieb inkl. Offline-PDF-Erzeugung für alle drei Protokolltypen live bestätigt. `manifest.json` vollständig und korrekt. |
| **H – Cross-Browser/Mobile** | 🟢 **Grün** (Chromium/iPad-Simulation) | Kein horizontaler Overflow auf iPad-Breiten (Portrait/Landscape), Layout bleibt lesbar und einspaltig. Einzelne Sekundär-Buttons unter dem 44-px-Touch-Ziel – kosmetisch, kein Blocker. WebKit/Firefox konnten in dieser Testumgebung nicht zusätzlich geprüft werden (nur Chromium verfügbar). |

**Gesamtbild:** Die App hat sich seit der 4.4.0/4.7.2-Prüfung in Robustheit, PDF-Layout, Offline-Fähigkeit und XSS-Schutz deutlich und nachweisbar verbessert – die meisten früheren „technischen" Bugs sind sauber behoben. Fachlich-inhaltlich bestehen aber weiterhin die zwei schwersten Befunde aus der allerersten Prüfung nahezu unverändert (erfundene Stammdaten, vorbelegte Sicherheitsfragen), dazu kommt ein neu entdeckter, alle drei Protokolltypen betreffender „stiller Fehler" bei fehlerhaften Zahleneingaben. Vor dem nächsten produktiven Einsatz sollten mindestens die in Abschnitt 4 genannten Punkte behoben werden.

---

## 2. Vergleich zum Bug-Report 4.7.2

| # | Bug (4.7.2) | Status in 5.0.0 | Beleg |
|---|---|---|---|
| 1 | localStorage-Overflow ohne Warnung | 🟡 **Teilweise behoben** | Zentrale `sicherSetItem()`-Hülle existiert (`js/storage.js:23-45`) und wird für Stammdaten, Entwürfe-Index und Protokollzähler genutzt und meldet sich per `alert()`+Statusleiste. **Aber:** der am häufigsten durchlaufene Pfad – der Live-Autosave bei jeder Formulareingabe in allen drei Generatoren – ruft weiterhin rohes `localStorage.setItem()` in einem stillen `catch (e) {}` auf (`js/pdf-generator.js:1793`, analog `geraete-generator.js`, `anschluss-generator.js`). Bei vollem Speicher schlägt der Autosave dort weiterhin lautlos fehl. |
| 2 | Protokollnummer-Verbrauch ohne Konsistenz | ✅ **Behoben** | `js/entwuerfe.js:333-351`: Der Entwurf wird jetzt **zuerst** angelegt, die Nummer erst danach verbraucht (`js/storage.js` `verbraucheProtokollNummer()`). Bei einem Absturz dazwischen bleibt höchstens ein leerer, löschbarer Entwurf zurück statt einer Nummernlücke. |
| 3 | URL-Parameter-Injection bei Entwurf-Links | 🟡 **Teilweise behoben / in der Praxis nicht auslösbar** | Der `'#'`-Fallback bei ungültigem Präfix (`js/entwuerfe.js:189`) besteht unverändert, ist aber nicht mehr erreichbar, da `e.praefix` ausschließlich aus intern erzeugten PR/AP/GP-Entwürfen stammt. Live getestet: `vde0100.html?entwurf=doesnotexist123` führt zu keinem Crash, kein Konsolenfehler, sauberer Rückfall auf leeres Formular. |
| 4 | `parseFloat()` mit Komma – Edge-Case zu falschem Wert statt NaN | ⚠️ **Kernursache behoben, aber neuer/verwandter Folgefehler live bestätigt** | Die zentrale `parseMesswert()` (`js/pdf-utils.js:20-26`) erkennt „1,2,3" jetzt korrekt als `NaN`, und alle Bewertungs-Flags (`isZsOut` u. Ä.) nutzen sie korrekt. **Aber:** die **Anzeige**-Funktion `kommaZahl()` (`js/pdf-utils.js:1269-1271`) ist von dieser Prüfung komplett unabhängig und formatiert/druckt den fehlerhaften Rohwert trotzdem unverändert und unmarkiert – siehe neuer Befund N1 unten. Im Ergebnis ist die Situation aus Nutzersicht kaum besser als vorher: die Falscheingabe erscheint weiterhin unauffällig im fertigen PDF. |
| 5 | Alte Autosave-Schlüssel nach Migration nicht bereinigt | ✅ **Behoben** | `js/entwuerfe.js:111-137`: `removeItem()` des alten Schlüssels steht jetzt in einem eigenen `try/catch`, unabhängig vom Erfolg des vorausgehenden `setItem()`. |
| 6 | Service-Worker Cache-Versionierung unzuverlässig | ✅ **Behoben** | `sw.js:44-72`: echte Laufzeit-Konsistenzprüfung `APP_VERSION !== SW_VERSION`, protokolliert und per `postMessage` an alle Tabs gemeldet. Aktuell sind beide Werte identisch (5.0.0). Live bestätigt: Offline-Cache funktioniert vollständig, alte Caches werden beim Wechsel zuverlässig gelöscht. |
| 7 | Entwurf-ID-Kollisionen theoretisch möglich | ✅ **Behoben** | `js/entwuerfe.js:64-69`: zusätzlicher, session-weit monoton steigender Zähler macht eine Kollision unabhängig von Zeitstempel/Zufall ausgeschlossen. |
| 8 | PDF-Export ohne Fehlerbehandlung | ✅ **Behoben** | `js/pdf-generator.js:783-798`: kompletter PDF-Aufbau läuft jetzt in `try/catch` mit verständlicher Nutzermeldung statt unbehandelter Exception. |
| 9 | XSS-Sicherheit bei `esc()` unvollständig (kein Escaping von `"`/`'`) | 🟡 **Teilweise behoben** | `esc()` selbst escaped jetzt auch `"` und `'` (`js/entwuerfe.js:215-222`). **Aber:** ausgerechnet die im Originalbericht genannte kritische Stelle – das `onclick`-Attribut in `renderOffenePruefungen()` (`js/entwuerfe.js:201`) – verwendet für `e.id`/`e.praefix` weiterhin die rohen, ungeescapten Werte statt `esc()`. In der Praxis ungefährlich, da beide Werte intern generiert werden (Base36-IDs, feste Präfixe), aber der Fix schützt die eigentliche Stelle nicht. Live mit `<script>`/Anführungszeichen-Payloads in Freitextfeldern getestet: durchgehend sicher escaped, kein Ausbruch. |
| 10 | Typo/Text-Inkonsistenz (`updateViaCache`) | ✅ **Behoben** | `js/pwa.js`: Service-Worker-Registrierung setzt jetzt explizit `updateViaCache: 'none'`, mit Begründung im Kommentar. |

**Zwischenfazit:** 5 von 10 Bugs vollständig behoben, 4 nur teilweise (#1, #3, #4, #9), 1 vollständig behoben mit spätem Seiteneffekt. Am schwersten wiegt #4: Die eigentliche Ursache (fehlende NaN-Erkennung) ist zwar behoben, aber der praktische Effekt – eine Falscheingabe erscheint unauffällig im Beweisdokument – besteht durch einen bislang nicht gemeldeten Folgefehler unverändert fort (siehe N1).

---

## 3. Neue Befunde (priorisiert nach Schweregrad)

### 🔴 KRITISCH

#### N1 · Fehlerhafte Zahleneingaben (doppeltes Komma) werden unmarkiert ins PDF gedruckt – betrifft alle drei Protokolltypen
**Datei/Zeile:** `js/pdf-utils.js:1269-1271` (`kommaZahl()`), zusammenwirkend mit `js/anschluss-generator.js:755-759`, `js/geraete-generator.js` (Ableitstrom-Zeile ~675-680), `js/pdf-generator.js:1227-1229`

**Reproduktion:** In einem beliebigen Z_S-Feld (Anlagen- oder Anschlussprüfung) oder Ableitstrom-Feld (Geräteprüfung) den Wert `1,2,3` eintragen (z. B. Tippfehler: zweites Komma statt Punkt) und PDF erzeugen.

**Tatsächliche Wirkung:** Die Tabellenzelle zeigt **„1,2,3 Ω / - A"**, unmarkiert (nicht rot), ohne jede Warnung. Live erzeugt und gerastert nachgewiesen in `t1_zs_check.pdf` / `t1_zs_check-1.png` (Anschlussprüfung) und `t3_vde0100_edge.pdf` / `t3_vde0100_edge-1.png` (Anlagenprüfung).

**Erwartete Wirkung:** Die zentrale Hilfsfunktion `parseMesswert()` wurde in 5.0.0 gerade zu dem Zweck eingeführt, mehrere Kommas als `NaN` zu erkennen (Fix zu Bug #4 aus 4.7.2) – und tut das auch korrekt: `isZsOut` wird in diesem Fall `false`, weil `!isNaN(zsNumPdf)` `false` ist. Das Problem liegt einen Schritt weiter: Für die **Anzeige** im PDF wird nicht der validierte Wert verwendet, sondern der Rohwert erneut durch die rein kosmetische Funktion `kommaZahl()` geschickt (`String(wert).replace(/(\d)\.(?=\d)/g, '$1,')`), die keinerlei Gültigkeitsprüfung vornimmt und den fehlerhaften Text unverändert zurückgibt. Da `isZsOut` zusätzlich denselben (negativen) Wert liefert wie „kein Messwert vorhanden", wird eine erkennbar unsinnige Eingabe genauso behandelt wie ein leeres Feld – nur dass sie eben NICHT leer im PDF erscheint, sondern mit dem fehlerhaften Text.

**Warum kritisch:** Ein Tippfehler in einem sicherheitsrelevanten Messwert (Schleifenimpedanz, Ableitstrom) gelangt unbemerkt in ein unterschriftsreifes Prüfprotokoll. Da die Zelle nicht rot markiert wird, kann das Gesamtergebnis „Keine Mängel festgestellt" lauten, obwohl ein offensichtlich unsinniger Wert im Dokument steht – die Elektrofachkraft hat keinen Hinweis, noch einmal hinzusehen.

**Aufwand zur Behebung:** *Leicht.* An allen betroffenen Druckstellen `kommaZahl(wert)` durch eine Variante ersetzen, die bei `isNaN(parseMesswert(wert))` einen auffälligen Text ausgibt (z. B. „⚠ ungültiger Wert: 1,2,3") und die Zelle zusätzlich rot markiert, unabhängig davon, ob eine Sicherungscharakteristik erkannt wurde.

---

#### N2 · Fest eingebaute Fantasie-Stammdaten werden bei jedem ersten Formular unbemerkt übernommen (identisch mit Befund A1 aus der 4.4.0-Prüfung, weiterhin ungelöst)
**Datei/Zeile:** `js/storage.js:57-72` (`getMasterData()` Default-Objekt), angewendet über `applyMasterDataToForm()` (`js/storage.js:109-120`), aufgerufen aus `vde0100.html:396`, `anschlusspruefung.html:285`, `geraetepruefung.html:211`

**Reproduktion (live mit Playwright verifiziert, Skript `scripts/test_masterdata.js`):** Komplett frischer Browser-Kontext (kein localStorage) → `vde0100.html` öffnen → Formularfelder auslesen, BEVOR irgendetwas eingegeben wurde:
```
auftraggeber: "Stadttheater Konstanz, Inselgasse 2-6, 78462 Konstanz"
vnb: "Stadtwerke Konstanz"
messgeraet: "Fluke 1663"
seriennummer: "SN-1663-98214"
unterschrift_ort: "Konstanz"
gebaeude_select: "Gr. Haus"
```

**Tatsächliche vs. erwartete Wirkung:** Beim allerersten Öffnen eines Formulars (keine Stammdaten zuvor gepflegt) werden Auftraggeber, Netzbetreiber, Prüfgerät samt Seriennummer und Unterzeichnungsort automatisch mit fiktiven Werten belegt – Daten, die die prüfende Person nie eingegeben hat. Wer nicht bewusst zur Stammdaten-Seite geht und diese Felder überschreibt, erzeugt ein Protokoll, das ein Messgerät mit einer Seriennummer benennt, das nie benutzt wurde – die schwerste Art von Falschangabe, die ein Prüfprotokoll enthalten kann (erfundene Messmittelrückführung).

**Zusatzbefund:** Da `pflichtfelder.js` Felder nur nach „leer/nicht leer" bewertet (`el.value.trim() === ''`), erscheinen `messgeraet` und `seriennummer` sofort grün („ausgefüllt"), obwohl der Nutzer nichts eingegeben hat – die optische Fortschrittsanzeige erzeugt hier eine trügerische Sicherheit.

**Direkter Folgeeffekt (= Befund A2, `js/pdf-generator.js:933`):** Wird `unterschrift_ort` vom Nutzer explizit geleert (z. B. weil an einem anderen Ort geprüft wird und das Feld versehentlich gelöscht statt überschrieben wird), fällt `getVal('unterschrift_ort', "Konstanz")` beim PDF-Export lautlos auf „Konstanz" zurück, statt eine Leerzeile zu drucken oder zu warnen. Live reproduziert: Feld gezielt geleert, Wert bleibt bestätigt leer im DOM (`scripts` unter `test-artifacts/`), Fallback-Codepfad eindeutig nachvollzogen.

**Aufwand zur Behebung:** *Mittel.* `getMasterData()`-Fallback auf leere Strings umstellen; beim allerersten Start optional auf die Stammdaten-Seite hinweisen; Prüfgerät/Seriennummer vor dem ersten PDF als echte Pflichtfelder behandeln (nicht nur „nicht leer", sondern „vom Nutzer bestätigt").

---

### 🟠 HOCH

#### N3 · Sicht- und Erprobungsfelder sind technisch weiterhin auf „i.O." vorbelegt (Default-Selektion des Browsers)
**Datei/Zeile:** `vde0100.html:189-200` (12 `sicht-item`-Felder), `vde0100.html:249-250` (`erp_anlage`, `erp_schutz`)

**Reproduktion (live mit Playwright verifiziert):** Frisches Formular öffnen, ohne jede Eingabe die `<select>`-Werte auslesen:
```
sicht_betriebsmittel = i.O.
sicht_kabel = i.O.
sicht_basisschutz = i.O.
erp_anlage = i.O.
erp_schutz = i.O.
```

**Tatsächliche vs. erwartete Wirkung:** Alle 12 Sichtprüfpunkte („Betriebsmittel", „Kabel/Leitungen" … „Gebäudesystemtechnik") sowie 2 der Erprobungspunkte („Funktion Anlage", „Schutzeinrichtungen") sind als `<option>i.O.</option>` das jeweils erste, nicht mit `selected` markierte Element im `<select>` – HTML-Standardverhalten wählt in diesem Fall automatisch die erste Option. Der Code-Kommentar in `vde0100.html:420-424` erkennt dieses Problem sogar ausdrücklich an („technisch also nie 'leer' und daher für eine Pflichtfeld-Markierung ungeeignet") – behebt aber nur die **Anzeige** (schließt die Felder aus der Gelb/Grün-Markierung aus), nicht die eigentliche Vorbelegung. Wer die Sichtprüfung nicht bewusst durchgeht, unterschreibt am Ende ein Protokoll, das 12 nie durchgeführte Sichtprüfungen als „in Ordnung" bescheinigt. Die App selbst kennt die richtige Lösung bereits: 6 der Erprobungspunkte (`erp_drehfeld`, `erp_polaritaet`, `erp_prueftaste`, `erp_sicherheitsbel`, `erp_motoren`, `erp_gst`) sind korrekt mit `<option selected>n.a.</option>` vorbelegt – ein sichererer, aber ebenfalls nicht „bewusst gewählter" Default. Bei den restlichen 14 Feldern (12 Sicht + 2 Erproben) fehlt dieses Muster vollständig.

**Vergleich zum Ursprungsbefund (A3, 4.4.0):** Fachlich identisch mit dem damaligen Befund; nur die Symptomatik hat sich verschoben (früher direkt sichtbar als vorbelegtes Ankreuzfeld, jetzt „unsichtbar" als Default-Selektion, die weder in der Pflichtfeld-Anzeige noch in der PDF-Abbruchprüfung (`ersteLeereAuswahl()`, siehe unten) erkannt wird).

**Warum die PDF-Abbruchprüfung das nicht abfängt:** `ersteLeereAuswahl()` (`js/pdf-utils.js:1512-1520`) erkennt eine offene Bewertung nur, wenn `value === ''` ist (d. h. `selectedIndex === -1`, keine passende Option). Das ist bei einem frisch aus einer Archiv-Vorlage angelegten Formular der Fall (dort werden die Felder bewusst geleert, siehe `archivVorlageBereinigen()` in `js/archiv.js` – dieser Teil funktioniert korrekt und wurde live bestätigt), nicht aber bei einem völlig neuen Formular, wo „i.O." ein technisch gültiger, nicht-leerer Wert ist.

**Aufwand zur Behebung:** *Leicht bis mittel.* Vor jedem `<option>i.O.</option>` ein `<option value="" selected>– bitte wählen –</option>` einfügen (wie es das Formular an anderer Stelle, z. B. beim RCD-Prüfstrom, bereits vorbildlich tut) und denselben Ansatz auch für `erp_anlage`/`erp_schutz` verwenden. Die vorhandene Abbruchlogik (`ersteLeereAuswahl`) würde diese Fälle danach automatisch abfangen, ohne weitere Codeänderung.

---

#### N4 · „Erneut prüfen (Vorlage)" im Archiv seit Version 4.7.0 dauerhaft funktionslos
**Datei/Zeile:** `js/archiv.js:24-27` (`ARCHIV_TYPEN`, Feld `autosave`), verglichen mit `js/entwuerfe.js:34-35` (`autosaveKeyFuerEntwurf()`) und `js/pdf-generator.js:1671-1672` (`AUTOSAVE_KEY_AKTUELL()`)

**Reproduktion:** Beliebiges Protokoll fertigstellen (PDF erzeugen, isBlank=false) → Archiv öffnen → Eintrag anklicken → Detailansicht. Live in `t4_archiv_detail.png` bestätigt: Button „Erneut prüfen (Vorlage)" ist ausgegraut/deaktiviert.

**Root Cause:** `ARCHIV_TYPEN.PR.autosave` (ebenso `.AP`, `.GP`) verweist auf den statischen, alten Schlüsselnamen `'vde_autosave_pr'`. Seit Einführung der parallelen Mehrfach-Entwürfe (Kommentar „4.7.0" in `js/entwuerfe.js:1-24`) wird jedoch für jeden Entwurf ein eigener, ID-abhängiger Schlüssel verwendet (`vde_autosave_pr_<entwurfId>`, erzeugt über `autosaveKeyFuerEntwurf()`). Der von `archivMetaSammeln()` (`js/archiv.js:153-164`) gesuchte alte Schlüssel wird nirgends mehr geschrieben → `localStorage.getItem(typ.autosave)` liefert immer `null` → `formState` ist bei jedem seit 4.7.0 archivierten Protokoll `null` → `archivVorlageUebernehmen()` (`js/archiv.js:455-467`) bricht in Zeile 457 sofort mit `return null` ab → der Button bleibt für jeden Archiveintrag ausnahmslos deaktiviert.

**Tatsächliche vs. erwartete Wirkung:** README und der Hinweistext im Code (`js/archiv.js:488-491`) beschreiben ausführlich, dass beim erneuten Prüfen „nur die beschreibenden Angaben" übernommen werden sollen und alle Messwerte/Bewertungen/Unterschriften geleert werden – eine fachlich korrekt konzipierte und (laut Code) auch korrekt implementierte Funktion (`ARCHIV_UEBERNEHMEN`-Allowlist in `js/archiv.js:378-401` schließt Sicht-/Erprobungs-/Messfelder sauber aus). Sie kann seit 4.7.0 real aber nie ausgelöst werden. Die Nutzerin erhält dafür auch keinerlei Fehlermeldung – der Button ist einfach dauerhaft grau, ohne erklärenden Hinweis.

**Aufwand zur Behebung:** *Leicht.* `archivMetaSammeln()` muss den zum jeweils AKTIVEN Entwurf gehörenden Autosave-Schlüssel verwenden (z. B. über eine neue, zum Zeitpunkt der PDF-Erzeugung ohnehin bekannte Variable `AUTOSAVE_KEY_AKTUELL()`), statt über den in `ARCHIV_TYPEN` fest hinterlegten alten Namen zu suchen.

---

### 🟡 MITTEL

#### N5 · `formatNetzspannung()` verstümmelt ungewöhnliche, aber plausible Eingaben
**Datei/Zeile:** `js/pdf-utils.js:431-439`

**Reproduktion (live mit Playwright bestätigt, `scripts/test_netzspannung.js`):** Im Feld „Netzspannung (V)" den Text `3x400` eingeben (übliche Kurzschreibweise für Drehstrom 400 V, wie sie z. B. auf Typenschildern zu finden ist).

**Tatsächliche Wirkung:** Feldwert wird automatisch zu **„340 / 0"**. Die Funktion entfernt zunächst alle Nicht-Ziffern (`replace(/\D/g,'')` → „3400") und setzt dann stur nach dem dritten Zeichen einen Trenner („340" / „0"). Das ist Bug D12 aus der 4.4.0-Prüfung (`formatNetzspannung()`: „3x400" → „340 / 0") – **weiterhin unverändert vorhanden**, nur nicht in den zwischenzeitlichen Berichten erneut erwähnt.

**Erwartete Wirkung:** Entweder die Eingabe unverändert lassen, wenn sie nicht dem erwarteten Format entspricht, oder zumindest nicht ziffernweise neu zusammensetzen. Ein falscher Spannungswert im Kopf des Prüfprotokolls ist zwar kein Sicherheitsrisiko wie N1–N3, aber eine sachlich falsche Angabe in einem Beweisdokument.

**Aufwand zur Behebung:** *Leicht.* Nur formatieren, wenn die Eingabe bereits ausschließlich aus 3-stelligen Zahlengruppen besteht (z. B. Regex `^\d{3}\s*\/?\s*\d{0,3}$` vorab prüfen), sonst Rohtext unverändert übernehmen.

---

#### N6 · Negative Zahlenwerte in Messfeldern werden nicht als unplausibel erkannt
**Datei/Zeile:** z. B. `js/pdf-generator.js` (R_PE-Grenzwertprüfung `rpeNum > 0.30`), `js/anschluss-generator.js` (U_N-PE-Prüfung `npeUeberschritten()`)

**Reproduktion (live bestätigt):** In ein R_PE- oder U_N-PE-Feld den Wert `-5` eintragen und PDF erzeugen.

**Tatsächliche Wirkung:** Der Wert erscheint unmarkiert als „-5 Ω" bzw. „-5 V" im PDF. Da die Grenzwertprüfungen ausschließlich als „> oberer Grenzwert" formuliert sind, ist ein negativer (physikalisch unmöglicher) Widerstands- oder Spannungswert per Definition „nicht überschritten" und wird als unauffällig gewertet.

**Aufwand zur Behebung:** *Leicht.* Zusätzliche Prüfung `wert < 0` überall dort ergänzen, wo physikalisch nur nicht-negative Werte sinnvoll sind (praktisch alle Messwertfelder außer ggf. Toleranzangaben).

---

#### N7 · Sehr langer Text in einzeiligen Kopf-Textfeldern läuft im PDF über den Rand statt umzubrechen
**Datei/Zeile:** Anschlussprüfung, Feld „Standort Übergabepunkt" (und vermutlich weitere einzeilige `drawFeldZeile()`-Aufrufe in den Kopfabschnitten aller drei Protokolle)

**Reproduktion (live bestätigt):** > 200 Zeichen langen Text in „Standort Übergabepunkt" eingeben, PDF erzeugen.

**Tatsächliche Wirkung:** Der Text läuft über den rechten Seitenrand hinaus und wird abgeschnitten, statt umzubrechen (Beleg: `t1c_anschluss_edge_case_retry-1.png`). Zum Vergleich: mehrzeilige Tabellenzellen (z. B. „Bezeichnung/Typ" in der Geräteprüfung) brechen bei gleich langem Text korrekt um und vergrößern die Zeilenhöhe – nur die einzeiligen `drawFeldZeile()`-Kopffelder haben dieses Problem nicht gelöst.

**Aufwand zur Behebung:** *Mittel.* Entweder Zeichenlimit im `<input>` setzen (z. B. `maxlength`) oder `drawFeldZeile()` für lange Werte auf mehrzeiligen Textumbruch umstellen (Vorbild: Tabellenzellen-Rendering).

---

### 🟢 NIEDRIG

#### N8 · `esc()` schützt sich selbst, aber nicht die eigentlich kritische Attributstelle
**Datei/Zeile:** `js/entwuerfe.js:201`

Wie unter Bug #9 im Vergleichsabschnitt beschrieben: `onclick="offenePruefungLoeschen('` + `e.id` + `', '` + `e.praefix` + `')"` nutzt die rohen Werte, nicht `esc()`/`attrEsc()`. Praktisch ungefährlich (beide Werte sind intern erzeugte Base36-IDs bzw. feste Präfixe PR/AP/GP), aber inkonsistent zur eigenen Absicht des Codes. *Aufwand: leicht* (an dieser Stelle `attrEsc()` verwenden, die andernorts im Projekt bereits existiert, z. B. `js/pdf-utils.js:355`).

#### N9 · Touch-Ziele einzelner Sekundär-Buttons unter 44 px auf Tablet
Mehrere Komfort-Buttons („Duplizieren", „Entfernen"/„Löschen", Schnellwahl-Chips wie „B 16A") liegen bei 18–26 px Höhe im iPad-Viewport-Test. Kein funktionaler Blocker (alle Felder auch per Tastatur bedienbar), aber auf einem echten Touchscreen mit Handschuhen (Baustelle/Open Air, wie in `ANALYSE_2` beschrieben) potenziell fummelig. Deckt sich mit dem alten Befund D8. *Aufwand: leicht* (`@media (pointer: coarse)`-Regel auf `.btn`/`.btn-secondary` ausweiten, wie es für `.quick-btn`/`.btn-danger` bereits geschieht).

---

## 4. Empfohlene Sofortmaßnahmen vor dem nächsten produktiven Einsatz

1. **N1 beheben (kritisch, leicht):** Anzeige-Funktion für Messwerte an die bereits vorhandene `parseMesswert()`-Validierung koppeln, damit ein doppeltes Komma sichtbar (rot) im PDF auffällt statt unmarkiert durchzurutschen.
2. **N2 beheben (kritisch, mittel):** Fiktive Standard-Stammdaten („Stadttheater Konstanz", „Fluke 1663" usw.) aus `getMasterData()` entfernen; leere Felder bleiben leer, bis der Betreiber sie einmal bewusst einträgt.
3. **N3 beheben (hoch, leicht):** Bei allen 14 verbleibenden Sicht-/Erprobungsfeldern (`vde0100.html` sowie die entsprechenden Stellen in `anschlusspruefung.html`/`geraetepruefung.html`, sofern dort ebenfalls vorhanden) eine echte leere erste Option `– bitte wählen –` einbauen, analog zum bereits vorhandenen, korrekten Muster beim RCD-Prüfstrom.
4. **N4 beheben (hoch, leicht):** Autosave-Schlüssel in `archivMetaSammeln()` auf das aktuelle, entwurfsbasierte Schema umstellen, damit „Erneut prüfen (Vorlage)" wieder funktioniert.
5. **N5 beheben (mittel, leicht):** `formatNetzspannung()` robuster gegen Eingaben wie „3x400" machen (nicht blind neu zusammensetzen).
6. **N6 beheben (mittel, leicht):** Negativwert-Prüfung (`< 0`) für alle Messfelder ergänzen.
7. **Bug #1 aus 4.7.2 vollständig schließen (hoch, mittel):** Die drei `autosaveProtocol()`-Funktionen in `pdf-generator.js`/`geraete-generator.js`/`anschluss-generator.js` ebenfalls über `sicherSetItem()` statt rohem `localStorage.setItem()` laufen lassen – aktuell ist genau der am häufigsten ausgeführte Schreibpfad noch ungeschützt.
8. **N7 (mittel, mittel):** Zeichenbegrenzung oder Umbruch für einzeilige Kopf-Textfelder in der PDF-Ausgabe ergänzen.
9. **A6 aus der Ursprungsprüfung erneut prüfen (mittel, mittel):** Ein Qualifikationsfeld für die prüfende Person (Elektrofachkraft / unterwiesene Person unter Aufsicht) fehlt weiterhin in allen drei Formularen und PDFs – im Zusammenspiel mit N2/N3 verstärkt das Risiko, dass ein fachlich nicht qualifizierter Nutzer ein vollständig „sauber" aussehendes, unterschriftsreifes Protokoll erzeugen kann.
10. **N8/N9 (niedrig, leicht):** Bei Gelegenheit mitnehmen – kein Blocker für den produktiven Einsatz, aber schnell erledigt.

---

## 5. Erzeugte Test-PDFs und Testartefakte

Alle Dateien liegen in `test-artifacts/` (Playwright-Testskripte in `scripts/`).

| Datei | Beschreibung |
|---|---|
| `vde0100_leerformular_1blatt.pdf` / `leer-1.png` | VDE-0100-Leerformular, „1 Blatt" – **1 Seite**, keine Waisenseite (Vergleich zu C1 aus 4.4.0: dort noch 2 Seiten). |
| `vde0100_beispieldaten.pdf` / `beispiel-1.png` | VDE-0100 mit „Beispieldaten laden" – 1 Seite, vollständig, Dezimalkomma korrekt, keine „einphasig"-Widerspruchsmarkierung mehr (A7 bestätigt behoben). |
| `t1a_anschluss_blank.pdf`, `t1b_anschluss_example.pdf` | Anschlussprüfung leer/Beispiel – je 1 Seite, sauber. |
| `t1c_anschluss_edge_case_retry.pdf` + zugehörige PNGs | Anschlussprüfung mit Sonderzeichen/XSS-Payload/langem Text – XSS sicher escaped, langer Text läuft über Feldrand (N7). |
| `t1_zs_check.pdf` / `t1_zs_check-1.png` | Beleg für N1 (Z_S = „1,2,3 Ω / - A", unmarkiert) in der Anschlussprüfung. |
| `t2a_geraete_blank.pdf`, `t2b_geraete_example.pdf` | Geräteprüfung leer/Beispiel – je 1 Seite, sauber. |
| `t2c_geraete_edge.pdf` | Geräteprüfung mit Edge-Case-Eingaben; negativer R_ISO-Wert korrekt rot markiert, doppeltes Komma im Ableitstrom erneut unmarkiert (N1, zweiter Beleg). |
| `t2d_geraete_series28.pdf` + PNGs | Serientest mit 28 Geräten, 2 Seiten, keine Fehler, Tabellenkopf auf Folgeseite korrekt wiederholt. |
| `t3_vde0100_series14.pdf` + PNGs | Serientest mit 14 Stromkreisen, 2 Seiten; RCD „nicht geprüft" bei allen Duplikaten korrekt rot markiert (Musterbeispiel für gut funktionierende Widerspruchsprüfung). |
| `t3_vde0100_edge.pdf` / `t3_vde0100_edge-1.png` | Beleg für N1 im Hauptprotokolltyp: „1,2,3 Ω / 657 A" unmarkiert bei gleichzeitig „Keine Mängel festgestellt". |
| `t4_archiv_list.png`, `t4_archiv_detail.png`, `t4_archiv_search_*.png`, `t4_archiv_after_delete.png` | Archiv-Test: Liste, Suche (Treffer und Kein-Treffer-Fall korrekt), Löschen funktioniert; Detailansicht zeigt den dauerhaft deaktivierten „Erneut prüfen"-Button (N4). |
| `t5a_after_reload.png`, `t5b_index_offene_pruefungen.png`, `t5c_bogus_entwurf.png` | Autosave nach Reload, zwei parallele Entwürfe, ungültiger `?entwurf=`-Parameter – alle drei ohne Befund. |
| `t6_offline_*.png`, `t6_offline_blank.pdf`, `t6_offline_filled.pdf` | Vollständiger Offline-Test aller Seiten inkl. Offline-PDF-Erzeugung – ohne Befund. |
| `t7_ipad_*.png` | iPad Portrait/Landscape für alle drei Formulare + Startseite – kein horizontaler Overflow, Touch-Ziele teils < 44 px (N9). |
| `scripts/test_masterdata.js` | Playwright-Beleg für N2 (fiktive Stammdaten in frischem Browser-Kontext). |
| `scripts/test_netzspannung.js` | Playwright-Beleg für N5 („3x400" → „340 / 0"). |

**Nicht reproduzierbar / entfällt:** Keiner der in Abschnitt 2 als „behoben" markierten Punkte konnte in dieser Prüfung erneut ausgelöst werden – dort wurde jeweils sowohl der Fix im Quelltext als auch (soweit sinnvoll testbar) das erwartete Verhalten live bestätigt.

---

## 6. Zusätzlich bestätigt behobene Punkte aus der 4.4.0-Ursprungsprüfung (nicht Teil des 4.7.2-Berichts)

Diese Punkte stammen aus den älteren `ANALYSE_*`-Dokumenten (Version 4.4.0) und wurden im Rahmen dieser Prüfung zusätzlich verifiziert, obwohl sie nicht im 4.7.2-Bug-Report standen:

| # | Befund (4.4.0) | Status | Beleg |
|---|---|---|---|
| A7/A8 | „Einphasige Einspeisung – L-L entfällt" wurde bei Drehstrom automatisch angekreuzt | ✅ **Behoben** | Das Ankreuzfeld wurde in Version 4.5.0 ersatzlos entfernt (`js/pdf-generator.js:953,1013,1040`, Kommentar bestätigt „zu speziell, sorgte für Verwirrung"). Im live erzeugten Beispiel-PDF (`beispiel-1.png`) mit drei L-N- und drei L-L-Spannungswerten erscheint korrekt keine solche Markierung mehr. |
| B1 | Anschlussprüfung ohne jede Spannungsmessung (insbesondere fehlendes U N-PE) | ✅ **Behoben** | Seit 4.5.0 ist U N-PE je Übergabepunkt ein echtes Pflichtfeld (`js/anschluss-generator.js:464-483`, PDF-Export bricht bei fehlendem Wert ab) mit eigener Grenzwertprüfung `npeUeberschritten()` (Schwelle 1,0 V, zentral in `js/pdf-utils.js:1253-1258`, von beiden Protokolltypen genutzt). |
| B6 | R_PE-Grenzwert der Geräteprüfung ohne 1-Ω-Deckel (100 m Leitung → 1,60 Ω zulässig) | ✅ **Behoben** | `js/pdf-utils.js:1108`: `const RPE_DEVICE_DECKEL = 1.0;` – `getRpeMaxDevice()` deckelt den Grenzwert jetzt ausdrücklich per `Math.min(RPE_DEVICE_DECKEL, ...)`. |
| C1 | „1 Blatt" erzeugte bei Anlagen- und Geräteprüfung tatsächlich 2 PDF-Seiten (Waisenseite mit nur Unterschriftenfeld) | ✅ **Behoben** | Live erzeugtes VDE-0100-Leerformular „1 Blatt" ergibt jetzt genau **1 Seite** (`vde0100_leerformular_1blatt.pdf`, `leer-1.png`) mit allen vier Abschnitten, Legende und Unterschriftenzeile auf einem Blatt. |
| D1/D2 | Messwerte mit Dezimalpunkt statt Komma, Schnellwahlknopf „10 mm²" trug „10.0 mm²" ein | ✅ **Behoben** | Im Beispiel-PDF durchgehend Dezimalkomma („H07RN-F 5G 2,5 mm²", „0,35 Ω"). |
| D3 | Doppeltes Präfix „SN SN-1663-98214" | ✅ **Behoben** | Aktuelle Zusammensetzung (`js/pdf-generator.js:979-986`) fügt „SN " nur einmal voran; im Beispiel-PDF erscheint korrekt „Fluke 1663 (SN SN-1663-98214)" – **Hinweis:** das doppelte „SN" kommt jetzt daher, dass die Seriennummer selbst bereits mit „SN-" beginnt (Altlast aus den in N2 kritisierten Default-Stammdaten), nicht mehr aus einem Code-Fehler. Mit einer echten, vom Nutzer eingegebenen Seriennummer ohne „SN-"-Präfix tritt der alte Effekt nicht mehr auf. |

Diese fünf Punkte zeigen, dass an der PDF-Generierung und den Grenzwertprüfungen seit der 4.4.0-Prüfung erheblich und wirksam nachgebessert wurde.
