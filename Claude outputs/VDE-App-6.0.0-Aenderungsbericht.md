# VDE-Prüfprotokoll-App 6.0.0 – Änderungsbericht

**Vorgängerversion:** 5.0.0
**Umgesetzt:** alle 12 Befunde aus dem Prüfbericht „VDE-Prüfprotokoll-App –
Vollprüfung Version 5.0.0" (Prüfdatum 03.09.2026) – ungültige Zahleneingaben
(z. B. doppeltes Komma) erscheinen jetzt sichtbar rot markiert mit
Warntext im PDF statt unmarkiert · fest eingebaute Fantasie-Stammdaten
(„Stadttheater Konstanz", „Fluke 1663" usw.) sind aus den Stammdaten-Defaults
entfernt · alle Sicht- und Erprobungsfelder haben jetzt eine echte leere
Auswahl „– bitte wählen –" statt technisch vorbelegtem „i.O." · „Erneut
prüfen (Vorlage)" im Archiv funktioniert wieder · Netzspannungs-Eingaben wie
„3x400" werden nicht mehr verstümmelt · negative (physikalisch unmögliche)
Messwerte werden jetzt als Fehler erkannt · lange Texte in einzeiligen
Kopf-Textfeldern laufen nicht mehr über den PDF-Rand · der Live-Autosave bei
jeder Formulareingabe ist jetzt ebenfalls gegen vollen Speicher abgesichert ·
ein kleines Escaping-Detail im Archiv-Code sowie zu kleine Touch-Ziele
einzelner Sekundär-Buttons wurden behoben · neu: Qualifikationsfeld für die
prüfende Person (Elektrofachkraft / unterwiesene Person unter Aufsicht) in
allen drei Formularen.

Geändert wurden: `vde0100.html` · `anschlusspruefung.html` ·
`geraetepruefung.html` · `archiv.html` · `js/storage.js` ·
`js/pdf-generator.js` · `js/anschluss-generator.js` ·
`js/geraete-generator.js` · `js/pdf-utils.js` · `js/archiv.js` ·
`js/entwuerfe.js` · `css/style.css` sowie zur Versionskennzeichnung
`js/app-config.js` · `sw.js`.

---

## 1 · N1 (kritisch) – Fehlerhafte Zahleneingaben (doppeltes Komma) wurden unmarkiert ins PDF gedruckt

Ein Tippfehler wie „1,2,3" in einem Messwertfeld (Z_S, Ableitstrom, R_PE …)
wurde von der internen Prüfung zwar korrekt als ungültig erkannt
(`parseMesswert()` liefert `NaN`), aber für die **Anzeige** im PDF lief der
Rohwert weiterhin durch die rein kosmetische Funktion `kommaZahl()`, die
keine Gültigkeit prüft – der fehlerhafte Text erschien dadurch unverändert
und unmarkiert im fertigen, unterschriftsreifen Protokoll.

**Jetzt:** Neue Funktionen `istMesswertUngueltig()` und `kommaZahlGeprueft()`
(`js/pdf-utils.js`) prüfen den Wert vor der Anzeige über dieselbe zentrale
`parseMesswert()`-Logik. Ein ungültiger Wert erscheint jetzt als
„⚠ ungültig: 1,2,3" und wird – unabhängig vom sonstigen Grenzwert-Ergebnis –
zusätzlich rot markiert. Umgestellt an allen Druckstellen echter
Nutzer-Messwerte: R_PE, R_ISO, Z_S/I_K, U_L in `js/pdf-generator.js`; R_PE,
U_N-PE, Z_S/I_K in `js/anschluss-generator.js`; R_PE, R_ISO, Ableitstrom,
Leitungslänge in `js/geraete-generator.js`; sowie zentral in der
RCD-Zellenfunktion (I∆n, I∆mess, Auslösezeit) in `js/pdf-utils.js`. Reine
Label-/Auswahlfelder (z. B. Leitertyp, Querschnitt) waren nicht betroffen und
blieben unverändert.

---

## 2 · N2 (kritisch) – Fest eingebaute Fantasie-Stammdaten wurden bei jedem ersten Formular unbemerkt übernommen

Beim allerersten Öffnen eines Formulars (bevor eigene Stammdaten gepflegt
wurden) belegte `getMasterData()` (`js/storage.js`) Auftraggeber,
Netzbetreiber, Prüfgerät samt Seriennummer und Unterschriftsort automatisch
mit erfundenen Werten – u. a. Messgerät „Fluke 1663" mit Seriennummer
„SN-1663-98214", die nie benutzt wurden. Wer diese Felder nicht bewusst
überschrieb, erzeugte ein Protokoll mit einer erfundenen
Messmittelrückführung.

**Jetzt:** Alle acht Default-Werte in `getMasterData()` sind leere Strings.
Zusätzlich wurde der stille Fallback beim PDF-Export behoben: Wurde
`unterschrift_ort` vom Nutzer bewusst geleert, fiel `getVal()` bisher
lautlos auf „Konstanz" zurück (`js/pdf-generator.js`,
`js/anschluss-generator.js`) statt eine Leerzeile zu drucken – dieser
Fallback ist jetzt ebenfalls leer.

---

## 3 · N3 (hoch) – Sicht- und Erprobungsfelder waren technisch weiterhin auf „i.O." vorbelegt

12 Sichtprüfpunkte sowie die Erprobungspunkte „Funktion Anlage" und
„Schutzeinrichtungen" hatten „i.O." als erste `<option>` ohne `selected` auf
einer anderen Option – der Browser wählt in diesem Fall automatisch die
erste Option aus. Wer die Sichtprüfung nicht bewusst durchging, unterschrieb
am Ende ein Protokoll, das nie durchgeführte Prüfungen als „in Ordnung"
bescheinigte.

**Jetzt:** Alle 14 betroffenen Felder in `vde0100.html` sowie die
entsprechenden 9 Felder in `anschlusspruefung.html` haben jetzt eine echte,
bewusst zu wählende erste Option `– bitte wählen –` (`value=""`), nach dem
bereits vorhandenen, korrekten Muster beim RCD-Prüfstrom. Die bestehende
Abbruchprüfung `ersteLeereAuswahl()` erkennt ein unbearbeitetes Feld dadurch
jetzt zuverlässig, ohne dass an der Prüflogik selbst etwas geändert werden
musste. `geraetepruefung.html` arbeitet mit einem anderen (kartenbasierten)
Ankreuz-Muster und war von diesem Befund nicht betroffen.

---

## 4 · N4 (hoch) – „Erneut prüfen (Vorlage)" im Archiv war seit 4.7.0 dauerhaft funktionslos

Seit Einführung der parallelen Entwürfe (Version 4.7.0) wird pro Entwurf ein
eigener, ID-abhängiger Autosave-Schlüssel verwendet. `archivMetaSammeln()`
suchte aber weiterhin nach dem alten, statischen Schlüsselnamen aus
`ARCHIV_TYPEN` – der wird seitdem nirgends mehr geschrieben. Der Button
„Erneut prüfen (Vorlage)" blieb dadurch für jeden seit 4.7.0 archivierten
Eintrag ausnahmslos deaktiviert, ohne erklärenden Hinweis.

**Jetzt:** `archivMetaSammeln()` verwendet den zum jeweiligen Entwurf
gehörenden, aktuellen Autosave-Schlüssel (über `autosaveKeyFuerEntwurf()`);
der alte statische Schlüssel bleibt nur als harmloser Fallback bestehen.
`archivVorlageUebernehmen()` legt beim „Erneut prüfen" jetzt einen neuen,
eigenen Entwurf an und übernimmt die beschreibenden Angaben dorthin, statt
in einen toten, nicht mehr existierenden Speicherplatz zu schreiben – dabei
wird kein gerade offen bearbeitetes Formular überschrieben. `archiv.html`
band dafür zusätzlich `js/entwuerfe.js` ein, das dort bisher fehlte.

---

## 5 · N5 (mittel) – formatNetzspannung() verstümmelte Eingaben wie „3x400"

Die übliche Kurzschreibweise für Drehstrom „3x400" (z. B. von einem
Typenschild übernommen) wurde durch stures Zerlegen nach dem dritten Zeichen
zu „340 / 0" verfälscht.

**Jetzt:** Vor dem Formatieren prüft eine Regel, ob die Eingabe überhaupt dem
erwarteten Muster (Ziffernblöcke, optional durch „/" getrennt) entspricht.
Nur dann wird zusammengesetzt; alles andere – etwa „3x400" – bleibt
unverändert als Rohtext stehen.

---

## 6 · N6 (mittel) – Negative Zahlenwerte in Messfeldern wurden nicht als unplausibel erkannt

Ein negativer, physikalisch unmöglicher Wert (z. B. „-5 Ω" bei R_PE oder
„-5 V" bei U_N-PE) galt bisher als „nicht überschritten", weil die
Grenzwertprüfungen ausschließlich nach oben (`> Grenzwert`) prüften, und
erschien dadurch unauffällig im PDF.

**Jetzt:** Alle oberen Grenzwertprüfungen für Messwerte, bei denen ein
negativer Wert physikalisch unmöglich ist (R_PE, Z_S, Auslösezeit,
U_L/U_N-PE, Erdungswiderstand, Ableitstrom – in `js/pdf-generator.js`,
`js/anschluss-generator.js`, `js/geraete-generator.js`, `js/pdf-utils.js`),
markieren einen negativen Wert jetzt zusätzlich als Fehler, sowohl beim
PDF-Druck als auch bei der Live-Anzeige im Formular.

---

## 7 · N7 (mittel) – Sehr langer Text in einzeiligen Kopf-Textfeldern lief im PDF über den Rand

Ein sehr langer Eintrag (z. B. bei „Standort Übergabepunkt") wurde bisher
über den rechten Seitenrand hinaus abgeschnitten, statt umzubrechen –
anders als mehrzeilige Tabellenzellen, die bereits korrekt umbrechen.

**Jetzt:** Die zentrale Textzeichenfunktion `drawFittedText()`
(`js/pdf-utils.js`), die auch von `drawFeldZeile()` für alle einzeiligen
Kopffelder genutzt wird, kürzt zu langen Text nach dem bestehenden
Schriftverkleinerungs-Versuch jetzt zusätzlich sichtbar mit „…" ab, statt ihn
über den Rand laufen zu lassen. Kurze, feste Beschriftungen/Titel sind davon
nicht betroffen, da die Kürzung nur bei tatsächlicher Überschreitung greift.

---

## 8 · Bug #1 aus 4.7.2 (hoch) – Live-Autosave umging weiterhin die zentrale Speicher-Absicherung

Die zentrale, robuste `sicherSetItem()`-Hülle (meldet dem Nutzer einen
vollen Speicher statt lautlos zu scheitern) war bereits für Stammdaten,
Entwürfe-Index und Protokollzähler im Einsatz – aber ausgerechnet der am
häufigsten durchlaufene Pfad, der Autosave bei jeder Formulareingabe, rief
weiterhin rohes `localStorage.setItem()` in einem stillen `catch (e) {}`
auf.

**Jetzt:** `autosaveProtocol()` in allen drei Generatoren
(`js/pdf-generator.js`, `js/anschluss-generator.js`,
`js/geraete-generator.js`) nutzt jetzt durchgehend `sicherSetItem()`. Bei
vollem Speicher wird der Nutzer damit auch beim laufenden Autosave
zuverlässig informiert statt einen unbemerkten Datenverlust zu riskieren.

---

## 9 · N8 (niedrig) – onclick-Attribut im Archiv-Code nicht konsequent escaped

`renderOffenePruefungen()` (`js/entwuerfe.js`) baute das `onclick`-Attribut
zum Löschen eines offenen Entwurfs aus den rohen, nicht über `esc()`/
`attrEsc()` laufenden Werten von `e.id`/`e.praefix` zusammen – in der Praxis
ungefährlich, da beide intern erzeugt werden, aber inkonsistent zur eigenen
Schutzabsicht des Codes.

**Jetzt:** Beide Werte laufen jetzt durch `attrEsc()`, dieselbe Funktion, die
an anderer Stelle im Projekt bereits für Attribut-Escaping verwendet wird.

---

## 10 · N9 (niedrig) – Touch-Ziele einzelner Sekundär-Buttons unter 44 px auf Tablet

Mehrere Komfort-Buttons lagen im iPad-Viewport-Test noch unter der
empfohlenen Mindest-Touchfläche von 44 px – kein funktionaler Blocker, aber
auf einem Touchscreen mit Handschuhen (Baustelle/Open Air) potenziell
fummelig.

**Jetzt:** Die bereits vorhandene `@media (pointer: coarse)`-Regel, die
`.quick-btn`/`.btn-danger` bereits korrekt auf 44 px brachte, wurde um
`.btn`/`.btn-secondary` erweitert.

---

## 11 · A6 (mittel) – Qualifikationsfeld für die prüfende Person fehlte

Aus dem allerersten Prüfbericht weiterhin offen: Es gab kein Feld, um die
Qualifikation der prüfenden Person (Elektrofachkraft oder elektrotechnisch
unterwiesene Person unter Aufsicht) zu erfassen – im Zusammenspiel mit N2/N3
verstärkte das Risiko, dass ein fachlich nicht qualifizierter Nutzer ein
vollständig „sauber" aussehendes, unterschriftsreifes Protokoll erzeugen
konnte.

**Jetzt:** Neues Auswahlfeld „Qualifikation der prüfenden Person" (leer /
Elektrofachkraft (EFK) / Elektrotechnisch unterwiesene Person (EuP) unter
Aufsicht einer EFK) neben dem Namensfeld der prüfenden Person in allen drei
Formularen. Wird im PDF beim Unterschriftsbereich mit ausgedruckt und ist
Teil des Autosave.

---

## Version → 6.0.0

`APP_VERSION` (`js/app-config.js`) und `SW_VERSION` (`sw.js`) wurden
gemeinsam auf **6.0.0** hochgezählt, damit der bereits im Browser
installierte Service Worker die neue Version erkennt und den Offline-Cache
zuverlässig erneuert (siehe 4.7.0-Bericht, 3. Nachtrag, zur Ursache, falls
das übersprungen würde). `CACHE_NAME` in `sw.js` leitet sich dynamisch aus
`SW_VERSION` ab und aktualisiert sich damit automatisch mit.

---

## Prüfung dieser Version

* Alle geänderten JavaScript-Dateien wurden per Syntaxprüfung (`node -c`)
  einzeln validiert – keine Syntaxfehler.
* Alle geänderten HTML-Dateien wurden auf Tag-Balance/Wohlgeformtheit
  geprüft.
* `APP_VERSION` und `SW_VERSION` wurden direkt im hochgeladenen Ordner
  ausgelesen und auf 6.0.0 bestätigt.
* `getMasterData()`-Defaults sowie die betroffenen Fallback-Werte wurden per
  Direktabgleich auf leere Strings bestätigt – keine der bisherigen
  Fantasiedaten („Konstanz", „Fluke", „Stadttheater" usw.) verbleibt als
  stiller Default.
* `kommaZahlGeprueft()`/`istMesswertUngueltig()` wurden im Quelltext
  verifiziert; die Anzeige-Logik ist jetzt an dieselbe zentrale
  `parseMesswert()`-Validierung gekoppelt wie die Grenzwertprüfung.
* Die neuen `– bitte wählen –`-Optionen wurden für beide betroffenen
  Formulare per Direktzählung im Quelltext bestätigt.

**Hinweis:** Diese Prüfung dieser Version wurde als Code-Review mit
gezielter Verifikation der einzelnen Fundstellen durchgeführt (kein erneuter
vollständiger Playwright-Live-Testlauf mit PDF-Rasterung wie im
zugrundeliegenden Prüfbericht). Für eine förmliche Freigabe wird empfohlen,
insbesondere N1 (Warnmarkierung bei ungültigem Messwert im PDF), N3 (leere
Sicht-/Erprobungsauswahl) und N4 (Archiv-Vorlage) noch einmal mit echten
PDF-Exporten im Browser gegenzuprüfen, bevor die Version produktiv
eingesetzt wird.
