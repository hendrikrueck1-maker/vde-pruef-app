# Teil 4 – Leerformulare im Detail, Grafikbefunde, Maßnahmenplan

## 1 · Leerformulare – jeder Befund am gedruckten Blatt nachgewiesen

### C1 · „1 Blatt" ergibt 2 Seiten – Unterschriften auf einer Waisenseite

**Gemessen:**

| Protokoll | Auswahl „1 Blatt" | Auswahl „2 Blätter" |
|---|---|---|
| Anlagenprüfung VDE 0100 | **2 PDF-Seiten** | 3 PDF-Seiten |
| Anschlussprüfung | 1 PDF-Seite ✔ | 2 PDF-Seiten ✔ |
| Geräteprüfung | **2 PDF-Seiten** | 3 PDF-Seiten |

Seite 2 enthält ausschließlich:

```
Sicherer Gebrauch gewährleistet:  ☐ Ja  ☐ Nein
Zutreffendes nach Abschluss der Prüfung ankreuzen und mit Unterschrift bestätigen.

______________, den ________ – Unterschrift Prüfer/-in
______________, den ________ – Unterschrift Auftraggeber/Betreiber
```

Der Rest der Seite – rund 25 cm – ist leer. Auf Seite 1 sind gleichzeitig etwa 4 cm frei.

**Ursache** (`js/pdf-utils.js` `pdfPlatzPruefen`, `js/pdf-generator.js` Z. 1258–1275):
Kasten 4 und der Abschlussblock werden **getrennt** auf Platz geprüft. Der Abschlussblock
allein braucht 25,2 mm, beginnt aber erst bei y = 264,2 mm. Gemessene Summe: **289,4 mm**
gegen die Grenze `PDF_CONTENT_BOTTOM = 283`. Der Umbruch ist also formal korrekt – die
Seite ist schlicht 6,4 mm zu voll.

**Empfehlung (zwei Zeilen Code):** Beide Blöcke in **einer** Prüfung zusammenfassen:

```js
finalY = pdfPlatzPruefen(doc, finalY, boxHeight + 5 + abschlussHoehe);
```

Dann landen Bewertung **und** Unterschriften gemeinsam auf einer Seite – nie mehr eine
Seite mit nur zwei Linien darauf. Zusätzlich lässt sich Platz gewinnen, indem
`SEK1_H` (49 mm) und `SEK2_H` (51 mm) je 3 mm schrumpfen; dann passt alles auf Blatt 1.

---

### C2 · Widersprüchliche Blattzählung

Auf demselben Blatt:

* Kopfbox oben rechts: **„Seite 3 von 3"**
* Überschrift darunter: **„FORTSETZUNG DER MESSTECHNISCHEN PRÜFUNGEN (BLATT 2 VON 2)"**
* Fußzeile: **„Seite 3 / 3"**

Drei Zählungen, zwei davon in unterschiedlicher Schreibweise, eine davon mit anderen
Zahlen. Ursache ist die Waisenseite aus C1: Sie zählt als PDF-Seite, aber nicht als
Formular-Blatt. Mit der Korrektur aus C1 löst sich der Widerspruch von selbst.
Zusätzlich sollte nur **eine** Schreibweise übrig bleiben (Empfehlung: „Seite 2 von 3"
in der Kopfbox, Fußzeile ohne Zähler).

---

### C3 · Zeilenverteilung unausgewogen

| Protokoll | Blatt 1 | je Fortsetzungsblatt | Verhältnis |
|---|---|---|---|
| Anlagenprüfung | **7** | 28 | 1 : 4 |
| Anschlussprüfung | 10 | 28 | 1 : 2,8 |
| Geräteprüfung | 16 | 30 | 1 : 1,9 |

Bei der Anlagenprüfung führt jede achte Messung sofort zu einem kompletten
Fortsetzungsblatt mit 28 Zeilen. In der Open-Air-Simulation blieben dadurch
**40 von 91 Zeilen ungenutzt**. Mit den 6 mm aus C1 und einer Zeilenhöhe von 7,5 mm
statt 8,0 mm ließen sich auf Blatt 1 **11 statt 7** Zeilen unterbringen – das deckt
sieben der neun Verteilungen der Simulation ab.

Ferner: Nur die Geräteprüfung nennt im Auswahlfeld die Kapazität
(„1 Blatt (16 Geräte)"). Bei Anlagen- und Anschlussprüfung steht dort nur „1 Blatt",
sodass niemand vorher weiß, wie viele Kreise draufpassen.

---

### C4 · Legende in 4,6 pt und nur auf Blatt 1

`js/pdf-generator.js` Z. 1317, `geraete-generator.js`, `anschluss-generator.js`

```js
drawFormelAbsatz(doc, LEER_LEGENDE_VDE, PDF_MARGIN_LEFT, 285.8,
                 PDF_CONTENT_WIDTH, 2.5, { fontSize: 4.6 });
```

**4,6 pt entsprechen etwa 1,6 mm Schrifthöhe.** Für Fußnoten gilt 6 pt als absolute
Untergrenze, für Fließtext 8 pt. Auf einem Open-Air-Gelände, bei Streiflicht,
Kopflampe oder Regen ist das nicht lesbar.

Schwerer wiegt: Die Legende erklärt I_a, Z_S, I_K, I_Δn, I_Δmess, t_A und U_mess –
also **genau die Spalten des Tabellenkopfs** – und steht **nur auf Blatt 1**. Die
Fortsetzungsblätter mit 28 bzw. 30 Zeilen tragen denselben Tabellenkopf mit denselben
Formelzeichen und **keine Erklärung**. Für das 1. Lehrjahr endet die Prüfung genau dort
(siehe Teil 3).

**Empfehlung:** Legende auf **jedes** Blatt, Schriftgröße **6 pt**, dafür gekürzt auf
die vier Zeichen, die wirklich gebraucht werden (I_a, Z_S, I_Δn/I_Δmess, t_A) – die
ausführliche Fassung passt einmal auf Blatt 1.

---

### C5 · Legende stößt an die Unterschriftenzeile (Anschlussprüfung)

Auf dem Anschluss-Leerformular liegt die Musterzeile **unmittelbar** unter
„______, den ____ – Übergebende/-r (Netzbetreiber/Bereitsteller)", ohne jeden Abstand.
Sie liest sich wie eine Fußnote zur Unterschrift. Mindestens 3 mm Abstand und eine
dünne Trennlinie.

---

### C6 · Netzmessungs-Sollwerte 20 cm von den Feldern entfernt

Die Zeile

> „Netzmessung Sollwerte: L gegen N je 230 V - L gegen L je 400 V - N gegen PE 0 V - Frequenz 50 Hz."

steht bei y = 283 mm am Blattfuß in 4,6 pt. Die zugehörigen Eintragefelder
(U L1-N … U N-PE) stehen bei y ≈ 60 mm im Kasten 1. Dazwischen liegen zwei komplette
Abschnitte und die Messtabelle.

**Empfehlung:** Die Sollwerte gehören als 6-pt-Zeile **direkt unter die
Netzmessungsfelder**, dorthin, wo sie gebraucht werden. Am Blattfuß bleibt Platz frei,
den C1 ohnehin einspart.

---

### C7 · Spaltenbreiten gegen Handschrift

Grundlage: 2,5 mm je Zeichen gut lesbarer Handschrift, abzüglich 2 mm Zellenpolsterung.
Vollständige Tabelle in `ANALYSE_2-OpenAir-Simulation.md`.

**Vorschlag für die Anlagenprüfung** (Summe bleibt 190 mm):

| Spalte | heute | Vorschlag | Begründung |
|---|---|---|---|
| Nr. | 6 | 6 | – |
| Verteiler / Kreis-Nr. | – | **12** | neu, siehe B2 |
| Bezeichnung / Zweck | 30 | **34** | 13 Zeichen statt 11 |
| Leitung Typ/Adern/Quersch. | 22 | **28** | „H07RN-F 5G2,5" passt |
| R_PE | 13 | 11 | „0,11" reicht |
| R_ISO + Prüfspannung | 17 | **20** | Prüfspannung als Ankreuzfeld 500/250/1000 |
| Sicherung | 14 | 13 | „B16A" |
| Z_S / I_K | 24 | **26** | „0,42 / 547" + 2. Zeile |
| RCD Typ / I_Δn | 18 | 14 | „A/30" |
| I_Δmess | 13 | 10 | dreistellig |
| t_A @ __× | 15 | 12 | „14 @5" |
| U_mess | 18 | **14** | dreistellig |

Alternativ – und wirksamer – **Querformat** für das Leerformular: bei 297 mm Breite
lösen sich sämtliche Spaltenprobleme auf einen Schlag, und auf ein Blatt passen bei
gleicher Zeilenhöhe rund 20 Zeilen statt 7.

---

### C8 · Fehlende Kopffelder im Leerformular

| Feld | Anlagenprüfung | Anschlussprüfung | Geräteprüfung |
|---|---|---|---|
| Prüfgerät | ✔ | ✔ | ✔ |
| Seriennummer Messgerät | **fehlt** | **fehlt** | **fehlt** |
| Prüfgerät kalibriert bis | **fehlt** | **fehlt** | ✔ |
| Qualifikation Prüfer | **fehlt** | **fehlt** | **fehlt** |
| Prüfumfang / Stichprobe | **fehlt** | – | **fehlt** |

Die Geräteprüfung macht es richtig und zeigt, dass der Platz da ist.

---

### C9 · Fortsetzungsblatt verlangt die Kopfdaten erneut

Auf den Fortsetzungsblättern steht in der Kopfbox „Protokoll-Nr.: ____",
„Prüflings-ID: ____", „Datum: ____" als leere Schreiblinien, direkt darunter aber:

> „Gehört zum Protokoll mit der oben stehenden Protokoll-Nr."

Beides zusammen ergibt keinen Sinn: entweder die Nummer steht oben (dann ist sie
vorzudrucken), oder sie muss geschrieben werden (dann ist der Satz falsch).
Da das Leerformular per Definition keine Nummer kennt, bleibt nur: **Satz umformulieren**
(„Protokoll-Nr. bitte auf jedem Blatt eintragen") oder auf allen Blättern dasselbe
Nummernfeld anbieten und im Text darauf verweisen.

---

## 2 · Grafikbefunde in der App-Oberfläche

Alle an den Vollbild-Screenshots der drei Formulare geprüft.

| Befund | Wirkung | Fundstelle |
|---|---|---|
| Auswahlfeld „Prüfart / Norm" schneidet Text ab: **„DIN VDE 0105-100 (Wied"** | Der Prüfer sieht nicht, welche Norm gewählt ist | Rasterbreite `minmax(200px, 1fr)` gegen den Optionstext |
| Platzhalterfarbe `#94a3b8` auf Weiß, **Kontrast 2,6 : 1** | WCAG verlangt 4,5 : 1. Genau dort stehen die Formatbeispiele | `style.css` Z. 88 |
| `.limit-hint` **0,68 rem ≈ 10,9 px** | Die Grenzwerthinweise sind das Kleinste auf dem Schirm – und für Azubis das Wichtigste | `style.css` Z. 137 |
| **Kein `:focus`-Stil** im gesamten Stylesheet | Tastatur- und Sprachbedienung ohne sichtbaren Fokus | `style.css` |
| `pointer: coarse` hebt nur `.quick-btn` und `.btn-danger` auf 44 px; **`.btn` und `.btn-secondary` bleiben darunter** | Betroffen: „Stromkreis hinzufügen", „Duplizieren", „PDF generieren" – die drei meistgetippten Knöpfe | `style.css` Z. 315 |
| „Netzmessung" als zugeklapptes `<details>` | Bei NEA ist die Frequenz Pflicht, das Feld liegt zugeklappt; der Abbruch kommt erst beim PDF | `vde0100.html` |
| Abschnittsnummerierung **App 1–8 ≠ PDF 1–4** | App und Papier lassen sich nicht nebeneinanderlegen | alle |
| Zwei Seitenzähler, zwei Schreibweisen: Kopfbox „Seite 1 von 3", Fußzeile „Seite 1 / 3" | wirkt wie ein Fehler, ist aber Absicht | `pdf-utils.js` |
| Dezimalpunkt in **443** gedruckten Messwerten, daneben Grenzwerte mit Komma | im deutschen Prüfprotokoll uneinheitlich, in Zahlen über 1000 sogar mehrdeutig | Schnellwahlknöpfe + fehlende Normalisierung |
| Knopf **„10 mm²"** trägt **„10.0 mm²"** ein | Beschriftung ≠ Wert | `vde0100.html` |
| **„SN SN-1663-98214"** | doppeltes Präfix | `pdf-generator.js` Z. 767 |
| `formatNetzspannung()`: **„3x400" → „340 / 0"** | stille Datenverfälschung im Kopfdatensatz | `pdf-utils.js` Z. 406 |
| Gebäude-Auswahl fest auf Konstanzer Spielstätten, Vorbelegung „Gr. Haus" | bei jedem fremden Objekt Umweg über „Sonstiges…" | alle drei HTML |
| Geräteprüfung: Kartenklasse heißt `feed-card` | Kopierfehler, kein Fehlverhalten – aber irreführend beim Weiterentwickeln | `geraete-generator.js` Z. 29 |

**Ausdrücklich in Ordnung:** Der Formelsatz im PDF (R_PE, R_ISO, Z_S, I_Δn, t_A, Ω, Δ, ≤)
sitzt sauber, Tief- und Hochstellungen überlappen nicht, Umlaute und Sonderzeichen kommen
über die eingebettete Liberation-Sans korrekt durch, Tabellenspalten summieren sich exakt
auf 190 mm, und Messzeilen werden am Seitenumbruch nicht zerschnitten.

---

## 3 · Vorschlag: der einfachste plausible Prüfablauf

Aus den drei Azubi-Durchläufen hat sich diese Reihenfolge als die schnellste und
fehlerärmste erwiesen. Sie erfordert **keine** Änderung an der App – nur eine andere
Reihenfolge der Bedienung.

**Vor dem Aufbau, am Schreibtisch**

1. Stammdaten einmalig setzen (Betrieb, Prüfer, Messgerät, Seriennummer, kalibriert bis, Ort).
2. Geräteprüfung: alle 96 Geräte **vor** dem Verladen. Erstes Gerät je Bauart vollständig
   anlegen, dann „Duplizieren" – nur Bezeichnung, Inventarnummer und drei Messwerte je Gerät.
   Ein Protokoll für alles, Blattzahl 4.

**Auf dem Gelände, in dieser Reihenfolge**

3. **Anschlussprüfung zuerst** – ein Protokoll, alle Übergabepunkte als Karten.
   Erst wenn hier „Freigabe: Ja" steht, wird angeklemmt.
4. **Anlagenprüfung von oben nach unten:** HV, dann jede UV. Je Verteilung ein Protokoll.
   Ablauf innerhalb einer Verteilung:
   a) Kopfdaten (kommen zu ⅔ aus den Stammdaten)
   b) Netzmessung aufklappen und ausfüllen – **bei NEA zwingend**
   c) Sichtprüfung: **alle 12 Punkte bewusst durchgehen**, „n.a." wo es das nicht gibt
      (Brandabschottung, Gebäudesystemtechnik bei mobiler Verteilung)
   d) Ersten Stromkreis vollständig, alle weiteren über „Duplizieren"
   e) Erdung/PA
   f) Bewertung, Unterschriften, PDF
5. Kontrolle: Archiv öffnen – es müssen 1 AP + 9 PR + 1 GP liegen.

**Faustregeln für Azubis, die die App heute nicht sagt**

* „Duplizieren" übernimmt alles außer den Messwerten. Nutze es ab dem zweiten Kreis.
* Trage nie einen RCD-Typ ein, ohne I_Δmess und t_A zu messen – das PDF entsteht sonst nicht.
* Der Prüfstrom ist keine Formsache: 5× → 40 ms, 2× → 150 ms, 1× → 300 ms.
* Auf Bühne und Open Air gilt immer „erhöhte Gefährdung" → U_L 25 V.
* I_K musst du nicht rechnen; trage Z_S ein, den Rest macht die App.

---

## 4 · Maßnahmenplan

### Stufe 1 – sofort, ca. 2 Stunden (falsche Angaben im Beweisdokument)

| Nr. | Maßnahme |
|---|---|
| A1 | Vorbelegte Stammdaten entfernen; Messgerät + Seriennummer vor dem ersten PDF erzwingen |
| A2 | `getVal('unterschrift_ort', "Konstanz")` → leerer Fallback, Schreiblinie im PDF |
| A3 | `<option value="" selected>– bitte wählen –</option>` vor jedem `i.O.` in allen drei Formularen |
| A4 | Klammerinhalt Prüfgerät aus vorhandenen Teilen zusammensetzen |
| A7/A8 | „einphasig" nicht mehr automatisch ankreuzen; leere L-L-Linien im ausgefüllten PDF weglassen |
| A9 | Beispieldaten widerspruchsfrei machen (Drehfeld i.O., Polarität i.O., L-L-Werte ergänzen) |
| D1/D2 | Dezimalkomma beim Verlassen jedes Zahlenfelds; Schnellwahlwerte auf „1,5 mm²" usw. |
| D3 | „SN "-Präfix nur setzen, wenn die Nummer nicht schon damit beginnt |

### Stufe 2 – kurzfristig, ca. 4 Stunden (Papier druckbar, Fehler auffindbar)

| Nr. | Maßnahme |
|---|---|
| C1 | Kasten 4 und Abschlussblock in **einer** `pdfPlatzPruefen`-Prüfung; `SEK1_H`/`SEK2_H` je 3 mm kürzen |
| C2 | Nur noch eine Blattzählung, einheitliche Schreibweise |
| C4 | Legende auf jedes Blatt, 6 pt, gekürzte Fassung auf den Fortsetzungsblättern |
| C5 | 3 mm Abstand + Trennlinie über Legende/Musterzeile |
| C6 | Netzmessungs-Sollwerte direkt unter die Netzmessungsfelder |
| C9 | Text des Fortsetzungsblatts umformulieren |
| C10 | Kapazität im Auswahlfeld nennen („1 Blatt (7 Stromkreise)") |
| D10 | Abbruchmeldungen mit Fundstelle und Sprung zum Feld |
| D9 | Netzmessung bei NEA/Wechselrichter automatisch aufklappen |
| A5 | Fehlendes Kalibrierdatum im Freigabetext vermerken |

### Stufe 3 – mittelfristig, ca. 8 Stunden (Inhalt)

| Nr. | Maßnahme |
|---|---|
| B1 | Netzmessung (U L-N, U L-L, **U N-PE**) in die Anschlussprüfung, U N-PE als Pflichtfeld |
| B2 | Spalte „Verteiler / Kreis-Nr." in Formular und beiden Tabellen |
| B3 | Feld „Prüfumfang / Stichprobe" |
| A6 | Feld „Qualifikation der prüfenden Person" + Zeile im PDF |
| C7 | Spaltenbreiten neu, oder Leerformular auf Querformat |
| C8 | Seriennummer und Kalibrierdatum in alle Leerformular-Köpfe |

### Stufe 4 – danach

| Nr. | Maßnahme |
|---|---|
| B4 | NEA-Angaben (Sternpunkterdung, Erder, Betriebsart) |
| B5 | Vorsicherung Bereitsteller, Zählernummer/-stand, Selektivität |
| B6 | R_PE der Geräteprüfung auf 1 Ω deckeln |
| B7 | Heizelement-Schwelle vereinheitlichen (> 3,5 kW); SK II auf 2,0 MΩ |
| B8 | Spaltenkopf „t_A" ohne festen 5×-Grenzwert |
| B9 | Absicherung robuster erkennen, Nichterkennung sichtbar machen |
| B10 | Normbezug in `app-config.js` und PDF-Kopf angleichen |
| B11 | RCD Typ B: Auslösebereich bis 2 × I_Δn zulassen |
| D4–D8, D11–D17 | Grafik, Kontrast, Touch-Ziele, Fokus, Nummerierung, Locale, Aufräumen |

---

## 5 · Prüfnachweis

Erzeugt und ausgewertet wurden:

* `VDE_0100_Pruefprotokoll_Leerformular.pdf` (1 Blatt → 2 Seiten; 2 Blätter → 3 Seiten)
* `Anschlusspruefung_Uebergabepunkt_Leerformular.pdf` (1 Blatt → 1 Seite)
* `Geraetepruefung_50678_50699_Leerformular.pdf` (1 Blatt → 2 Seiten; 2 Blätter → 3 Seiten)
* je ein ausgefülltes PDF aus den Beispieldaten aller drei Protokolle
* 9 Anlagenprotokolle der Open-Air-Simulation (51 Stromkreise)
* 1 Geräteprotokoll mit 96 Geräten (5 Seiten)
* 1 Anschlussprotokoll mit 3 Übergabepunkten
* Vollbild-Screenshots aller drei Formulare, leer und mit Beispieldaten

Keine JavaScript-Fehler, keine Ausnahmen, keine abgebrochene PDF-Erzeugung
außer den fachlich beabsichtigten Abbrüchen.
