# VDE-Prüfprotokoll-App 4.5.0 – Änderungsbericht

**Vorgängerversion:** 4.4.0
**Umgesetzt:** die fünf von dir freigegebenen Punkte aus der Gesamtprüfung
(einphasige Einspeisung entfernen · C1 · C4 · B1 · D1). Alle übrigen Befunde
sind unverändert geblieben.

Geändert wurden zehn Dateien:
`js/app-config.js` · `sw.js` · `README.md` · `js/pdf-utils.js` ·
`js/pdf-generator.js` · `js/anschluss-generator.js` · `js/geraete-generator.js` ·
`vde0100.html` · `anschlusspruefung.html` · `geraetepruefung.html`

---

## 1 · „Einphasige Einspeisung" ersatzlos entfernt

**Weg ist:** das Ankreuzfeld „einphasige Einspeisung – L-L entfällt" im Kopfkasten
der Anlagenprüfung, samt der Automatik, die es gesetzt hat.

Die Automatik schloss aus „keine Außenleiterspannung eingetragen" auf „einphasig".
Bei einer Drehstromverteilung ist es aber der Normalfall, dass nur L-N gemessen
wird. Das Musterprotokoll der App zeigte deshalb drei Außenleiterspannungen,
„230/400 V", „TN-S", einen 5G-CEE-Stromkreis – und darunter „einphasig".

**Zusätzlich, weil es unmittelbar dazugehört:**

* Im **ausgefüllten** Protokoll steht bei einem nicht gemessenen Netzmessungswert
  jetzt **„n. gem."** statt einer leeren Schreiblinie. Leere Linien in einem
  abgeschlossenen Dokument sehen aus wie vergessene Felder.
  Im Leerformular bleiben die Schreiblinien natürlich.
* Die **Beispieldaten** tragen jetzt auch die Außenleiterspannungen
  (399 / 400 / 401 V), damit das Musterprotokoll vollständig ist.

Der Kopfkasten der Anlagenprüfung ist dadurch von 49 auf 42 mm geschrumpft –
diese 7 mm werden für Punkt 2 gebraucht.

---

## 2 · C1: Blatt 1 des Leerformulars ist wieder ein Blatt

**Vorher:** „1 Blatt" ergab bei Anlagen- und Geräteprüfung **zwei PDF-Seiten**.
Seite 2 enthielt nichts als die Zeile „Sicherer Gebrauch gewährleistet" und zwei
Unterschriftslinien, obwohl auf Seite 1 rund 4 cm frei waren. Ursache: Kasten 4
und der Abschlussblock wurden **getrennt** auf Platz geprüft.

**Jetzt:** beide werden in **einer** Prüfung zusammengefasst –
`pdfPlatzPruefen(doc, finalY, boxHeight + 5 + 32)`. Damit kann nie mehr eine Seite
entstehen, auf der nur die Unterschriften stehen; wandert etwas auf die nächste
Seite, wandert Bewertung **und** Unterschriftenblock gemeinsam.

Um Blatt 1 wirklich auf ein Blatt zu bekommen, wurde zusätzlich Platz gespart
(gemessen, nicht geschätzt – mit 7 Zeilen braucht die Anlagenprüfung genau
289,4 mm bei 283 mm nutzbarer Höhe):

| Stellschraube | 4.4.0 | 4.5.0 |
|---|---|---|
| Kopfkasten Anlagenprüfung | 49 mm | **42 mm** |
| Kasten „Besichtigen & Erproben" | 51 mm | **47 mm** |
| Zeilenabstand in den Kästen | 4,6 mm | **4,4 mm** |
| Schreiblinien „Bemerkungen" (Anlage) | 3 | **2** |
| Schreiblinien „Bemerkungen" (Gerät) | 4 | **3** |
| **Eintragezeilen Blatt 1 – Anlagenprüfung** | 7 | **6** |
| **Eintragezeilen Blatt 1 – Anschlussprüfung** | 10 | **7** |
| **Eintragezeilen Blatt 1 – Geräteprüfung** | 16 | **14** |

Bei der Anschlussprüfung kosten drei Zeilen, weil dort zusätzlich die neue
Netzmessung in den Kopf gekommen ist (Punkt 4).

**Ergebnis, an den erzeugten PDFs nachgemessen:**

| | 4.4.0 | 4.5.0 |
|---|---|---|
| Anlagenprüfung, 1 Blatt | 2 Seiten | **1 Seite** |
| Anlagenprüfung, 2 Blätter | 3 Seiten | **2 Seiten** |
| Anschlussprüfung, 1 Blatt | 1 Seite | 1 Seite |
| Anschlussprüfung, 2 Blätter | 2 Seiten | 2 Seiten |
| Geräteprüfung, 1 Blatt | 2 Seiten | **1 Seite** |
| Geräteprüfung, 2 Blätter | 3 Seiten | **2 Seiten** |

Damit löst sich auch der Zählwiderspruch von selbst: Kopfbox und
Fortsetzungstitel sagen jetzt beide „Blatt 2 von 2".

Die Auswahl der Geräteprüfung nennt die neuen Kapazitäten:
1 Blatt (14 Geräte) · 2 Blätter (44) · 3 Blätter (74) · 4 Blätter (104).

---

## 3 · C4: Legende auf jedem Blatt, 6 pt statt 4,6 pt

**Vorher:** Legende und Musterzeile in 4,6 pt (≈ 1,6 mm Schrifthöhe) und nur auf
Blatt 1. Die Fortsetzungsblätter trugen denselben Tabellenkopf mit denselben
Formelzeichen – und keine Erklärung.

**Jetzt:** neue zentrale Funktion `drawLeerFuss()` in `js/pdf-utils.js`:

* **6 pt** – die untere Grenze für Fußnoten in gedruckten Formularen.
* Der Block wächst **von unten nach oben** (letzte Grundlinie bei 287 mm), er
  kann also nie in die Fußzeile laufen, egal wie viele Zeilen er braucht.
* Er steht auf **Blatt 1 und auf jedem Fortsetzungsblatt** – in allen drei
  Protokollen.

Auf Blatt 1 stehen Musterzeile, Netzmessungs-Sollwerte und Legende, auf den
Fortsetzungsblättern die Legende. Die Legende der Anlagenprüfung wurde dafür
gestrafft (gleicher Inhalt, kürzer formuliert), damit der Abstand zur
Unterschriftenzeile bleibt.

Gemessener Abstand Unterschrift ↔ Fußnoten: Anlagenprüfung 3,4 mm,
Anschlussprüfung 5,2 mm, Geräteprüfung 3,4 mm – vorher lief die Anschlussprüfung
in die Unterschriftenzeile hinein.

---

## 4 · B1: Netzmessung in der Anschlussprüfung

Die Anschlussprüfung enthielt keine einzige Spannungsmessung. Hinter einem
fremden Übergabepunkt liegen aber genau die Fehler, die man nur an der Spannung
sieht: hochohmiger PEN, Fremdeinspeisung, vertauschte Einspeisung am Aggregat.

**Neu, zweistufig:**

**a) Im Kopf des Protokolls** – die Spannungen des Speisepunkts:
U L1-N, U L2-N, U L3-N, U L1-L2, U L2-L3, U L1-L3 und Frequenz.
Im Formular als eigener Block direkt unter den Bereitstellerdaten, im PDF als
zwei Zeilen Kurzfelder im Kopfkasten (analog zur Anlagenprüfung).

**b) Je Übergabepunkt** – **U N-PE**, weil jeder Übergabepunkt seinen eigenen
Wert hat und ein Protokoll mehrere enthalten kann:

* neues Feld **U N-PE (V)** in jeder Übergabepunkt-Karte, mit Grenzwerthinweis
* neue Spalte **U N-PE (V), Sollwert 0** in der Messtabelle – im ausgefüllten
  PDF und im Leerformular (Spaltenbreiten neu aufgeteilt, Summe bleibt 190 mm)
* Bewertung: über 1 V wird die Zelle rot und geht in die Gesamtbewertung ein
  (dieselbe Schwelle wie in der Anlagenprüfung; `U_NPE_SCHWELLE` und
  `npeUeberschritten()` liegen dafür jetzt zentral in `pdf-utils.js`)
* **Pflichtangabe:** fehlt der Wert, wird das PDF nicht erzeugt und die Meldung
  nennt den betroffenen Übergabepunkt.
* Die Legende erklärt den Wert und was ein Wert über 1 V bedeutet.

> **Falls dir die Pflichtangabe zu streng ist:** in `js/anschluss-generator.js`
> den mit „4.5.0 (B1): U N-PE ist Pflichtangabe" gekennzeichneten Block
> auskommentieren. Die Bewertung und die rote Markierung bleiben davon unberührt.

---

## 5 · D1: Dezimalkomma statt Punkt

Im deutschen Prüfprotokoll ist das Komma das Dezimaltrennzeichen. Vorher standen
im PDF Werte wie „0.08 Ω" direkt neben dem gedruckten Grenzwert „≤ 0,30 Ω".

**Drei Stellen wurden geändert:**

1. **Im PDF** – neue Funktion `kommaZahl()` in `pdf-utils.js`. Sie ersetzt einen
   Punkt **nur zwischen zwei Ziffern** und wird ausschließlich auf Messwerte
   angewandt: R_PE, R_ISO, Z_S, I_K, Z_L-N, I_K2, U_mess, U N-PE, Erdung, PA,
   Netzmessung, Querschnitte, RCD-Werte, Leitungslänge, Ableitstrom.
   Datumsangaben und Freitexte (Bemerkungen!) bleiben unangetastet – dort wäre
   aus „Sicherung am 12.08.2026 getauscht" sonst „12,08,2026" geworden.
2. **Auf dem Bildschirm** – wer „0.11" tippt, sieht nach dem Verlassen des
   Feldes „0,11". Umgestellt wird nur in Zahlenfeldern (`inputmode="decimal"`).
   Alle Auswertungsfunktionen rechnen ohnehin schon mit Komma.
3. **In den Vorgaben der App selbst** – die Schnellwahlknöpfe lieferten die
   Punkte mit: aus „1.5 mm²" wurde „1,5 mm²", aus „2.5 mm²" „2,5 mm²",
   aus „4.0 / 6.0 / 10.0 mm²" „4 / 6 / 10 mm²". Der Knopf **„10 mm²" trägt jetzt
   auch „10 mm²" ein** (vorher „10.0 mm²"). Ein Knopf **16 mm²** ist dazugekommen –
   bei Open-Air-Einspeisungen der Regelquerschnitt.
   Ebenso umgestellt: alle Platzhalter und sämtliche Beispieldaten.

Kontrollmessung am erzeugten PDF: **kein einziger Messwert mit Dezimalpunkt**
(vorher 443).

---

## Nicht geändert (bewusst)

Alle übrigen Befunde der Gesamtprüfung bleiben offen, wie besprochen – darunter
die vorbelegten „i.O."-Felder (A3), die fest eingebauten Stammdaten
„Fluke 1663 / SN-1663-98214" (A1), der Ortsfallback „Konstanz" (A2), das
verschwindende Kalibrierdatum ohne Seriennummer (A4), „SN SN-…" (D3) und die
Fehlermeldung ohne Fundstelle (D10). Sie sind in
`ANALYSE_1-VDE-App-Formfehler.md` und `ANALYSE_4-Gesamtpruefung.md` beschrieben.

---

## Prüfung dieser Version

Ausgeführt in Chromium gegen die neue App:

* Alle fünf Seiten laden fehlerfrei (index, archiv, vde0100, anschluss, geräte) –
  **keine JavaScript-Fehler, keine Konsolenfehler**.
* Sechs Leerformulare (je 1 und 2 Blätter) und drei ausgefüllte PDFs erzeugt und
  gerastert; Seitenzahlen wie in der Tabelle oben.
* Komma-Normalisierung an Kopf- und Kartenfeldern geprüft
  (Eingabe „0.25" → „0,25", „0.09" → „0,09").
* Open-Air-Gesamtsimulation wiederholt: 9 Verteilungen mit 51 Stromkreisen,
  96 Geräte, 3 Übergabepunkte – alle Protokolle erzeugt, keine Fehler.
  Die Hauptverteilung mit 8 Stromkreisen belegt zwei Seiten; Seite 2 trägt
  jetzt Kasten 4 **und** die Unterschriften, nicht mehr nur zwei Linien.

**Nach dem Hochladen:** APP_VERSION und SW_VERSION stehen beide auf 4.5.0,
der Offline-Cache lädt also alles neu und die Nutzer bekommen den Hinweis
„Neue Version verfügbar".
