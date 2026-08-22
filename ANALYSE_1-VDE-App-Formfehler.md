# Teil 1 – Formfehler, eigenartige Angaben, fehlende Angaben (App 4.4.0)

Jeder Befund ist an der laufenden App bzw. am erzeugten PDF nachgewiesen.
Fundstellen als Datei + Zeile, damit sie direkt abgearbeitet werden können.

Schweregrade: **A** = schreibt Falsches in ein Beweisdokument · **B** = inhaltliche Lücke ·
**C** = Leerformular · **D** = Grafik/Bedienung.

---

## A – Falsche oder erfundene Angaben im fertigen Protokoll

### A1 · Fest eingebaute fremde Stammdaten
`js/storage.js` Z. 7–17

```js
return {
  auftraggeber: "Stadttheater Konstanz, Inselgasse 2-6, 78462 Konstanz",
  gebaeude: "Gr. Haus",
  vnb: "Stadtwerke Konstanz",
  messgeraet: "Fluke 1663",
  seriennummer: "SN-1663-98214",
  ort: "Konstanz"
};
```

Diese Werte werden von `applyMasterDataToForm()` in **jedes** neu geöffnete Formular geschrieben.
Wer die App installiert und sofort prüft, erzeugt ein Protokoll, das ein Messgerät
**mit Seriennummer** nennt, das er nie in der Hand hatte. Das ist die schwerste Art von
Falschangabe, die ein Prüfprotokoll enthalten kann: eine erfundene Messmittelrückführung.

**Nachweis:** Screenshot `vde_form_leer.png` – das leere Formular zeigt bereits
„Stadttheater Konstanz", „Stadtwerke Konstanz", „Fluke 1663", „SN-1663-98214".

**Empfehlung:** Standard leer lassen. Beim ersten Start einmalig auf die Stammdaten-Seite
führen („Bitte zuerst Betrieb, Prüfer und Messgerät hinterlegen"). Messgerät und
Seriennummer als Pflichtfelder vor dem ersten PDF.

---

### A2 · Leerer Unterzeichnungsort wird zu „Konstanz"
`js/pdf-generator.js` Z. 719, `js/anschluss-generator.js`, `js/geraete-generator.js` analog

```js
const ort = isBlank ? "" : getVal('unterschrift_ort', "Konstanz");
```

Für das Leerformular wurde der feste Ort bereits entfernt (Kommentar im Code sagt das
ausdrücklich) – **im ausgefüllten Protokoll steht er noch drin**. Ein in Freiburg
geprüfter Open-Air-Aufbau bekommt „Freiburg, den …" nur, wenn das Feld gefüllt ist;
sonst „Konstanz, den 22.08.2026".

**Empfehlung:** Fallback auf leeren String; bei leerem Ort im PDF eine Schreiblinie
zeichnen (die Funktion `drawFeldZeile` kann das bereits).

---

### A3 · Sicherheitsfragen sind mit „i.O." vorbeantwortet
`vde0100.html` Abschn. 3 + 4, `anschlusspruefung.html` Abschn. 3,
`js/geraete-generator.js` Z. 81–91

| Protokoll | Felder mit Vorbelegung „i.O." |
|---|---|
| Anlagenprüfung | 12 Sichtprüfpunkte + 2 Erprobungspunkte (Funktion Anlage, Schutzeinrichtungen) |
| Anschlussprüfung | 9 Sichtprüfpunkte + Drehfeld |
| Geräteprüfung | 4 Sichtpunkte + Funktionsprüfung **je Gerät** – bei 96 Geräten 480 vorbeantwortete Felder |

Die App besitzt bereits die richtige Lösung, wendet sie aber nur an einer Stelle an:
`.c-rcd-pruefstrom` hat als erste Option `<option value="" selected>– bitte wählen –</option>`,
und `ersteLeereAuswahl()` bricht die PDF-Erzeugung ab, solange dort nichts gewählt ist.
Genau dieses Muster fehlt bei allen Sicht- und Erprobungsfeldern.

**Wirkung im Ernstfall:** Ein Azubi im 1. Lehrjahr, der die Karten durchscrollt und nur
Messwerte einträgt, erzeugt ein unterschriebenes Protokoll, das „Brandabschottung i.O." und
„Basisschutz i.O." bescheinigt, ohne dass jemand hingesehen hat.

**Empfehlung (1 h):** In allen drei Dateien vor `<option>i.O.` ein
`<option value="" selected>– bitte wählen –</option>` einfügen. Die Abbruchprüfung greift
dann automatisch, weil `.sicht-item`, `.erp-item`, `.c-sicht-item`, `.c-funktion` und
`.c-drehfeld` bereits in den Selektorlisten stehen.

---

### A4 · Kalibrierdatum verschwindet ohne Seriennummer
`js/pdf-generator.js` Z. 763–770, `js/anschluss-generator.js` Z. 470–477

```js
let t = g;
if (sn) t += ` (SN ${sn}`;
if (sn && kal) t += `, kal. bis ${kal}`;
if (sn) t += ')';
```

Ist die Seriennummer leer, aber „kalibriert bis" gefüllt, erscheint der Kalibriernachweis
**gar nicht** im PDF. Der Prüfer sieht das Datum im Formular, im Beweisdokument fehlt es.

**Empfehlung:** Klammerinhalt aus vorhandenen Teilen zusammensetzen:
`['SN ' + sn, 'kal. bis ' + kal].filter(Boolean).join(', ')`.

---

### A5 · Fehlendes Kalibrierdatum wird nicht beanstandet
`js/pdf-utils.js` Z. 1376 `kalibrierungAbgelaufen()` gibt bei leerem Datum `false` zurück.

Ein **abgelaufenes** Kalibrierdatum färbt die Zeile rot und ergänzt den Freigabetext.
Ein **fehlendes** Kalibrierdatum läuft völlig kommentarlos durch. Fachlich ist „kein
Nachweis" mindestens so angreifbar wie „abgelaufener Nachweis".

**Empfehlung:** Eigener Hinweis „Kalibriernachweis des Prüfgeräts nicht dokumentiert"
im Freigabetext, analog `KALIBRIERUNG_HINWEIS_PDF`.

---

### A6 · Keine Qualifikation der prüfenden Person
Alle drei Protokolle erfassen nur „Prüfer/-in (Name)".

Nach § 14 BetrSichV / TRBS 1203 und DGUV V3 muss aus dem Protokoll hervorgehen, dass eine
**befähigte Person / Elektrofachkraft** geprüft hat. Das Feld fehlt in Formular und PDF.
Die App hindert damit niemanden daran, als Laie ein vollständiges, unterschriebenes
Protokoll mit erteilter Prüfplakette zu erzeugen.

**Empfehlung:** Ein Auswahlfeld „Qualifikation: Elektrofachkraft · elektrotechnisch
unterwiesene Person unter Aufsicht · befähigte Person nach TRBS 1203" und im PDF eine
Zeile unter dem Namen. Bei „unterwiesene Person" zusätzlich Pflichtfeld „Aufsicht führende
Elektrofachkraft".

---

### A7 · „einphasige Einspeisung – L-L entfällt" bei Drehstrom angekreuzt
`js/pdf-generator.js` Z. 838–842 — **das ist der von dir gemeldete Netzmessungs-Unsinn.**

```js
const einphasig = !isBlank && !NETZMESS_FELDER.slice(3, 6).some(f => netzWert(f.id))
                  && NETZMESS_FELDER.slice(0, 3).some(f => netzWert(f.id));
```

Die Bedingung lautet sinngemäß: „keine L-L-Werte eingetragen, aber mindestens ein
L-N-Wert → einphasig". Tatsächlich ist die Nichtmessung der Außenleiterspannungen bei
einer Drehstromverteilung der Normalfall, nicht der Sonderfall.

**Nachweis:** `vde_1_Pruefprotokoll_…pdf`, Seite 1. Das Protokoll zeigt gleichzeitig:

* „Spannung / Frequenz: **230 / 400 V** / 50 Hz"
* „Netzsystem: **TN-S**"
* U L1-N 231 V, U L2-N 230 V, U L3-N 229 V – **drei** Außenleiter
* Stromkreis 2 „CEE 16A Hauptbühne", **5G**, Erprobung „Drehfeld CEE"
* und darunter das angekreuzte Kästchen **„einphasige Einspeisung – L-L entfällt"**

Ein Dokument, das drei Außenleiterspannungen misst und danach „einphasig" ankreuzt,
widerlegt sich selbst. Es entsteht bereits mit den **mitgelieferten Beispieldaten** –
also im Musterprotokoll der App.

**Empfehlung:** Das Kästchen darf nie automatisch gesetzt werden. Es gehört als echtes
Ankreuzfeld ins Formular („Einspeisung: ☐ dreiphasig ☐ einphasig"), abgeleitet aus der
Netzspannung (ein Wert = einphasig, „230 / 400" = dreiphasig), und nur aus einer
ausdrücklichen Angabe. Ersatzweise: Kästchen im ausgefüllten PDF gar nicht drucken,
sondern nur im Leerformular als Ankreuzhilfe.

---

### A8 · Leere L-L-Schreiblinien im fertigen Protokoll
Gleiche Stelle. Ist „L-L entfällt" angekreuzt, druckt das PDF darüber trotzdem
drei leere Schreiblinien für U L1-L2, U L2-L3, U L1-L3. In einem abgeschlossenen
Dokument sehen leere Linien aus wie vergessene Felder – und stehen im direkten
Widerspruch zum Kästchen darunter.

**Empfehlung:** Im ausgefüllten PDF nur Felder mit Wert drucken; für nicht gemessene
Größen „n. gem." statt einer Linie.

---

### A9 · Beispieldaten widersprechen sich
`js/pdf-generator.js` Z. 483–520 `fillExampleData()`

Das Musterprotokoll enthält einen Stromkreis „CEE 16A Hauptbühne / 5G", setzt aber
„Drehfeld CEE (rechts)" auf **n.a.**, ebenso „Polarität/Steckdosenbelegung" trotz eines
Schuko-Stromkreises. Zusätzlich der unter A7 beschriebene Einphasig-Widerspruch.
Die Beispieldaten sind das, was Azubis und neue Nutzer als Vorbild ansehen.

---

## B – Inhaltliche Lücken

### B1 · Anschlussprüfung ohne Spannungsmessung
`anschlusspruefung.html` – kein Feld für U L1-N/L2-N/L3-N, U L-L, **U N-PE**.

Die Anlagenprüfung schreibt in ihrem eigenen Hinweistext:

> „Die N–PE-Spannung ist der einzige Wert, der eigenständig einen Fehler findet
> (hochohmiger PEN, Fremdeinspeisung)."

Genau dieser Fehler entsteht typischerweise **jenseits** des Übergabepunkts, also in der
Anlage, die man gerade übernimmt und nicht kennt: hochohmiger PEN im Baustromverteiler,
vertauschte Einspeisung am Aggregat, Fremdeinspeisung aus dem Nachbarzelt. Der
Übergabepunkt ist der einzige Ort, an dem man das noch messen kann, bevor die
Veranstaltung dranhängt.

**Empfehlung:** Denselben Netzmessungsblock wie in der Anlagenprüfung ergänzen, dort
aber **nicht optional**, sondern mit U N-PE als Pflichtfeld.

### B2 · Keine Spalte „Verteilung"
Die Messtabelle kennt nur „Bezeichnung / Zweck des Stromkreises". Für eine Veranstaltung
mit 9 Verteilungen bleiben zwei Wege, beide schlecht:
* neun getrennte Protokolle (neun Nummern, neun Unterschriftenpaare, neunfache Kopfdaten), oder
* ein Protokoll, in dem nicht steht, an welchem Verteiler ein Stromkreis hängt.

**Empfehlung:** Schmale Spalte „Verteiler / Kreis-Nr." (12 mm) vor der Bezeichnung,
gespeist aus einem Feld je Karte mit Übernahme aus der vorigen Karte.

### B3 · Kein Prüfumfang / Stichprobenumfang
DIN VDE 0105-100 verlangt die Angabe, **was** geprüft wurde (Vollprüfung, Stichprobe,
Umfang der Stichprobe). Das Feld fehlt; ohne es sagt das Protokoll nur, was gemessen
wurde, nicht, was ungeprüft blieb.

### B4 · Netzersatzanlage nur als Auswahlwert
„Netzersatzanlage (NEA / Aggregat)" schaltet lediglich die Frequenz auf Pflicht. Es fehlen:
Sternpunktbehandlung/Erdung des Generators, Erdungsart und Erderwiderstand des Aggregats,
Betriebsart (Inselbetrieb/Netzparallel), Zahl der Generatoren. Bei Open Air ist genau das
der sicherheitsrelevante Teil (DIN VDE 0100-551 i.V.m. -711/-740).

### B5 · Anschlussprüfung ohne Vertragsdaten
Es fehlen: Vorsicherung des Bereitstellers, Selektivitätsnachweis, Zählernummer und
Zählerstand bei Übergabe. Die Anschlussleistung ist erfasst, die Absicherung dahinter
nur je Übergabepunkt in der Tabelle.

### B6 · R_PE-Grenzwert der Geräteprüfung ohne 1-Ω-Deckel
`js/pdf-utils.js` Z. 955

```js
return 0.3 + Math.ceil((len - 5) / 7.5) * 0.1;
```

50-m-Trommel → 0,90 Ω (korrekt). 100-m-Leitung → 1,60 Ω. DIN EN 50699 begrenzt den
Schutzleiterwiderstand aber auf **maximal 1 Ω**. Bei langen Kabelwegen auf großen
Open-Air-Flächen ist das keine Theorie.

**Empfehlung:** `return Math.min(1.0, 0.3 + …);` und im PDF „max. 1,00 (Deckel)" ausweisen.

### B7 · Zwei Schwellen für dasselbe Heizelement
`getIsoMin()` senkt R_ISO bei SK I **mit jedem** Heizelement auf 0,3 MΩ,
`getAbleitstromMax()` lockert korrekt erst **über 3,5 kW**. Der Wasserkocher mit 2 kW
bekommt im Test „min. 0.3" – bei einem Gerät ohne nennenswerte Heizleistung.
Zusätzlich liefert `getIsoMin('II', heiz)` den Wert 1,0 MΩ, den es in DIN EN 50699 für
Schutzklasse II nicht gibt (dort gilt 2,0 MΩ).

### B8 · Fester Grenzwert „t_A ≤ 40 ms bei 5x" in der Kopfzeile
`js/pdf-generator.js` HEAD_AUSGEFUELLT, Spalte 7. In der Zelle steht der tatsächliche
Prüfstrom („@ 1x"), im Spaltenkopf aber unverändert „t_A ≤ 40 ms bei 5x". Eine korrekte
Messung mit 1×I_Δn und 250 ms sieht damit für jeden Leser wie ein Mangel aus.
Die Bewertungslogik selbst rechnet richtig – nur die gedruckte Überschrift nicht.

### B9 · Absicherung wird nur bei B/C/D am Wortanfang bewertet
`js/pdf-utils.js` Z. 487 `/^([BCD])\s*([\d.,]+)/i`

„B 16A" ✔ · „LS B16" ✘ · „16 A Typ B" ✘ · „B16A, 3-polig" ✔ · „NH 63 gG" → als
Schmelzsicherung erkannt, mit Hinweis. Bei allen anderen Schreibweisen erscheint nur
„Absicherung eintragen, dann erscheint der zulässige Höchstwert" – das Protokoll wird
aber ohne Grenzwertprüfung erzeugt und gibt die Anlage frei.

**Empfehlung:** Zeichenkette nach `[BCD]\s*\d+` **irgendwo** im Text durchsuchen und bei
Nichterkennung dieselbe Deutlichkeit wie bei Schmelzsicherungen zeigen
(„Absicherung nicht auswertbar – Z_S/I_K werden in diesem Kreis nicht bewertet").

### B10 · Normbezug uneinheitlich
`js/app-config.js`: „DIN VDE 0100-704 / -711 / -740" ·
PDF-Kopf der Anschlussprüfung: „DIN VDE 0100-704 / -711 / **-718** / -740".
Der Kommentarkopf von `anschluss-generator.js` nennt zusätzlich DIN VDE 0100-520
(4 % Spannungsfall) als Grundlage, obwohl das Feld dafür bewusst entfernt wurde.

### B11 · RCD Typ B: Auslösebereich
`getRcdIdnRangeMa()` prüft immer 0,5–1,0 × I_Δn. Für allstromsensitive RCD Typ B gilt
das nur für den Wechselstromanteil; bei glattem Gleichfehlerstrom ist bis 2 × I_Δn
zulässig. Bei LED-Dimmern, Medienservern und Frequenzumrichtern auf der Bühne ist
Typ B die Regel, nicht die Ausnahme.

---

## D – Grafik und Bedienung (App-Oberfläche und PDF)

| Nr. | Befund | Fundstelle |
|---|---|---|
| D1 | **443 Messwerte mit Dezimalpunkt** statt Komma im PDF; direkt daneben der Grenzwert „≤ 0,30". Die App liefert die Punkte selbst: Schnellwahl „1.5 mm²", „2.5 mm²", „4.0 mm²", „6.0 mm²", „10.0 mm²" | `vde0100.html`, `pdf-generator.js` Karten |
| D2 | Knopf beschriftet **„10 mm²"**, trägt aber **„10.0 mm²"** ein | `vde0100.html` Anschlusskabel |
| D3 | **„SN SN-1663-98214"** – der Generator setzt „SN " davor, die Standardseriennummer beginnt schon mit „SN-" | `pdf-generator.js` Z. 767 |
| D4 | Auswahlfeld „Prüfart / Norm" schneidet ab: **„DIN VDE 0105-100 (Wied"** | `css/style.css` Rasterbreite 200 px |
| D5 | Platzhalterfarbe `#94a3b8` auf Weiß = **Kontrast 2,6:1** (WCAG-Minimum 4,5:1). Genau dort stehen die Formatbeispiele („z. B. NH 3x100 A gL") – im Freien unlesbar | `css/style.css` Z. 88 |
| D6 | `.limit-hint` **0,68 rem ≈ 10,9 px** – die Grenzwerthinweise, die den Azubi durchs Formular führen, sind das Kleinste auf dem Bildschirm | `css/style.css` Z. 137 |
| D7 | **Kein einziger `:focus`-Stil** im Stylesheet – Tastaturbedienung und Sprachsteuerung ohne sichtbaren Fokus | `css/style.css` |
| D8 | `@media (pointer: coarse)` hebt nur `.quick-btn` und `.btn-danger` auf 44 px. **`.btn` und `.btn-secondary` bleiben darunter** – betroffen sind „Stromkreis hinzufügen", „Duplizieren", „PDF generieren" | `css/style.css` Z. 315 |
| D9 | „Netzmessung" ist ein **zugeklapptes `<details>`**. Bei NEA/Wechselrichter ist die Frequenz Pflichtangabe – das Feld dafür liegt zugeklappt | `vde0100.html` |
| D10 | Abbruchmeldung „Das Protokoll enthält Beanstandungen …" nennt **weder Stromkreis noch Wert**. Bei 51 Kreisen unbrauchbar. In der Simulation sind daran 9 Protokolle gescheitert, bis die Ursache von Hand gesucht war | `pdf-utils.js` `freigabeWiderspruchHinweis()` |
| D11 | Abschnittsnummerierung **App 1–8 ≠ PDF 1–4 ≠ Leerformular**. Wer App und Papier nebeneinanderlegt, findet nichts wieder | alle |
| D12 | `formatNetzspannung()` zerlegt jede Eingabe nach Ziffern: **„3x400" wird zu „340 / 0"** | `pdf-utils.js` Z. 406 |
| D13 | Geräteprüfung: Kartenklasse heißt **`feed-card`** (Kopie aus der Anschlussprüfung) | `geraete-generator.js` Z. 29 |
| D14 | **Zwei Seitenzähler in zwei Schreibweisen** auf jeder Seite: Kopfbox „Seite 1 von 3", Fußzeile „Seite 1 / 3" | `pdf-utils.js` |
| D15 | Gebäude-Auswahl fest auf Konstanzer Spielstätten (Gr. Haus, Werkstatt, Spiegelhalle, Münsterplatz, Probebühne), Vorbelegung „Gr. Haus" – bei Open Air ohne Bezug | alle drei HTML |
| D16 | Datumsfelder folgen der Geräte-Locale. Auf einem englisch eingestellten Tablet erscheint **MM/DD/YYYY**; `lang="de"` ändert daran nichts | alle |
| D17 | „EB: Errichterbescheinigung" ist in `PROTOKOLL_PRAEFIXE` angelegt, es gibt aber kein solches Protokoll | `storage.js` Z. 99 |

---

## Was ausdrücklich gut ist

Damit die Liste nicht das falsche Bild gibt – im Test **positiv bestätigt**:

* **Z_S-Bewertung gegen 230 V / I_a** mit korrekten Faktoren 5/10/20 und zusätzlich dem
  2/3-Praxishinweis (gelb statt rot). Das machen kaufbare Programme meist nicht.
* **RCD-Auslösezeit gegen den tatsächlich gewählten Prüfstrom** (40/150/300 ms, Typ S
  150/200/500 ms) statt pauschal 40 ms – und die Rückwärtsplausibilität
  („dieser Wert passt zu 1× I_Δn – mit welchem Prüfstrom wurde gemessen?").
* **Kein stillschweigender Standard-Prüfstrom.** Ohne Angabe wird nicht bewertet, statt
  eine Messbedingung zu erfinden. Fachlich exakt richtig.
* **U_L 25 V bei erhöhter Gefährdung** wird je Stromkreis geführt, nicht global.
* **Z ↔ I_K-Plausibilität** (I = 230 V / Z, 25 % Toleranz) findet Zahlendreher.
* **RCD eingetragen, aber nicht gemessen** wird als echte Beanstandung geführt und
  verhindert die Freigabe. In der Simulation hat genau das 9 Protokolle blockiert – das
  war fachlich korrekt und der wertvollste Treffer der ganzen Testreihe.
* **Freigabe- und Plakettenwiderspruch** werden hart abgefangen. Ein Protokoll, das
  gleichzeitig Mängel und „sicherer Gebrauch gewährleistet" behauptet, entsteht nicht.
* **Fortlaufende Protokollnummern je Typ**, verbraucht erst nach erzeugtem PDF,
  mit Doppelvergabe-Warnung.
* **Autosave mit Entprellung** und Archiv im Gerät.
