# VDE-Prüfprotokoll-App 4.4.0 – Gesamtprüfung

**Prüfgegenstand:** Ordner `ZUM-HOCHLADEN`, `APP_VERSION 4.4.0`, Stand 22.08.2026
**Prüfmethode:** Statische Durchsicht aller HTML/JS/CSS-Dateien **plus** Ausführung der App in
Chromium mit Erzeugung und Rasterung aller sechs PDF-Ausgaben (leer + ausgefüllt, je Protokolltyp)
sowie einer vollständigen Open-Air-Simulation (9 Verteilungen, 51 Stromkreise, 96 Geräte,
3 Übergabepunkte). Alle Befunde sind an den erzeugten PDFs nachgewiesen, nicht nur am Quelltext.

---

## Ampel

| Bereich | Bewertung | Kernaussage |
|---|---|---|
| Fachliche Grenzwertlogik | **grün** | Z_S/I_K, RCD-Prüfstrom-Abhängigkeit, U_L bei erhöhter Gefährdung, R_PE je Leitungslänge: sauber und besser als in den meisten Kaufprogrammen |
| Widerspruchsprüfungen | **grün** | Freigabe/Plakette gegen Befund, RCD ohne Messwert, Z↔I_K-Plausibilität – greifen im Test zuverlässig |
| Vorbelegungen | **rot** | Die App beantwortet Sicherheitsfragen selbst mit „i.O." und trägt fremde Stammdaten ein |
| Netzmessung | **rot** | „einphasige Einspeisung – L-L entfällt" wird bei Drehstrom angekreuzt (dein Befund, bestätigt) |
| Leerformular Layout | **rot** | „1 Blatt" ergibt 2 Seiten, Unterschriften stehen allein auf einer fast leeren Seite |
| Leerformular Beschriftung | **rot** | Legende in 4,6 pt, nur auf Blatt 1; drei Spalten zu schmal für Handschrift |
| Papier-Tauglichkeit gesamt | **gelb–rot** | Für 51 Stromkreise 19 Druckseiten, davon 9 fast leer |
| App-Tauglichkeit gesamt | **grün–gelb** | Gesamte Veranstaltung in ca. 40 Min. dokumentierbar, aber Fehlermeldungen ohne Fundstelle |

---

## Die zehn wichtigsten Befunde

| Nr. | Befund | Wirkung | Aufwand |
|---|---|---|---|
| **A3** | Alle Sicht- und Erprobungsfelder sind mit **„i.O." vorbelegt** (14 in der Anlagenprüfung, 9 in der Anschlussprüfung, 5 je Gerät). Wer nichts anfasst, unterschreibt 14 nie durchgeführte Prüfungen als „in Ordnung". | schwer | 1 h |
| **A1** | Fest eingebaute Stammdaten „Stadttheater Konstanz / Stadtwerke Konstanz / **Fluke 1663, SN-1663-98214**". Jedes Protokoll eines neuen Nutzers nennt ein Messgerät samt Seriennummer, das nie benutzt wurde. | schwer | 20 min |
| **A7** | **„einphasige Einspeisung – L-L entfällt" wird angekreuzt**, sobald keine L-L-Werte eingetragen sind – auch bei drei L-N-Spannungen und „230/400 V" im selben Protokoll. Die mitgelieferten Beispieldaten erzeugen genau diesen Widerspruch. | schwer | 30 min |
| **A2** | Bleibt „Ort der Unterzeichnung" leer, druckt das fertige PDF **„Konstanz"**. | schwer | 5 min |
| **A4** | Das **Kalibrierdatum wird nur gedruckt, wenn auch eine Seriennummer** eingetragen ist (`if (sn && kal)`). Ohne Seriennummer verschwindet der Kalibriernachweis lautlos. | schwer | 5 min |
| **C1** | Leerformular „**1 Blatt" erzeugt 2 PDF-Seiten**: Freigabe und Unterschriften stehen allein auf Seite 2, obwohl auf Seite 1 rund 4 cm frei sind (Anlagen- und Geräteprüfung). | mittel | 45 min |
| **C4** | **Legende und Musterzeile in 4,6 pt** (≈ 1,6 mm) und **nur auf Blatt 1** – die Fortsetzungsblätter mit 28 bzw. 30 Zeilen haben keinerlei Erklärung der Formelzeichen. | mittel | 30 min |
| **C7** | Drei Tabellenspalten des Leerformulars **nehmen den nötigen Text handschriftlich nicht auf** (Leitung 22 mm für 14 Zeichen, R_ISO 17 mm für 15 Zeichen, Z_S/I_K 24 mm für 10 Zeichen + zweite Zeile). | mittel | 1 h |
| **B1** | Die **Anschlussprüfung enthält keine einzige Spannungsmessung** (L-N, L-L, N-PE) – ausgerechnet U_N-PE nennt die App selbst „der einzige Wert, der eigenständig einen Fehler findet". Am fremden Übergabepunkt (hochohmiger PEN) ist das der wichtigste Messwert überhaupt. | schwer | 2 h |
| **D1** | **443 gedruckte Messwerte mit Dezimalpunkt** statt Komma – die App liefert die Punkte über ihre eigenen Schnellwahlknöpfe („1.5 mm²", „4.0 mm²") mit. Direkt daneben steht der Grenzwert als „≤ 0,30". | mittel | 30 min |

Vollständige Listen: `ANALYSE_1-VDE-App-Formfehler.md` (36 Befunde),
`ANALYSE_2-OpenAir-Simulation.md`, `ANALYSE_3-Personentypen-Azubis.md`,
`ANALYSE_4-Gesamtpruefung.md`.

---

## Was die Simulation ergeben hat

**Open-Air-Konzert „Seepark 2026", Hauptbühne** – vollständige Veranstaltung:
3 Übergabepunkte, 9 Verteilungen (HV, Bühne links/rechts, FOH, Licht, Ton, Video,
Catering, Backstage), 51 Stromkreise, 96 Geräte.

| | App | Leerformular (Hand) |
|---|---|---|
| Dokumente | 13 PDF (1 AP + 9 PR + 1 GP + 2 Reserve) | 10 Blätter Anlage + 1 AP + 4 GP |
| Druckseiten | 16 | **24**, davon **11 fast leere Unterschriftenseiten** |
| Einzeleinträge von Hand | ca. **920** | ca. **1.540** |
| Ungenutzte Tabellenzeilen | 0 | **40 von 91** |
| Reine Erzeugungszeit | 1,9 s je Protokoll, 96 Geräte < 6 s | – |
| Spalten, die den Inhalt nicht fassen | 0 | **3 von 10** (Anlage), 2 (Anschluss), 3 (Gerät) |
| Reproduzierbarkeit | vollständig (Archiv, Autosave) | keine |

**Die Papierstrecke ist bei einer Gesamtveranstaltung nicht wirtschaftlich durchführbar** –
nicht wegen der Technik, sondern wegen Zeilenzahl, Spaltenbreite und der Waisenseiten.

## Was die Personensimulation ergeben hat

| Rolle | App | Leerformular |
|---|---|---|
| Laie | **darf nicht prüfen** – die App verhindert es aber nicht und fragt keine Qualifikation ab | ebenso |
| Elektrofachkraft | zügig, blockiert nur an den vorbelegten „i.O."-Feldern und an Fehlermeldungen ohne Fundstelle | machbar, aber Spaltenbreite zwingt zu Kürzeln |
| Dozent | sehr gut geeignet (Grenzwerte live sichtbar), stört sich an Vorbelegung und Nummerierung | nur Blatt 1 lehrtauglich, Fortsetzungsblätter ohne Legende |
| Azubi 1. Lj. | **mit App möglich** dank Grenzwerthinweisen unter jedem Feld | **nicht möglich** (Formelzeichen unerklärt ab Blatt 2) |
| Azubi 2. Lj. | gut, scheitert an der Prüfstromwahl ohne Erklärung | mit Legende auf Blatt 1 machbar, ab Blatt 2 nicht |
| Azubi 3. Lj. | sehr gut | machbar mit Abkürzungsdisziplin |

## Empfohlene Reihenfolge der Umsetzung

1. **Sofort (ca. 2 h):** A1, A2, A3, A4, A7, A8, D1, D2, D3 – alles, was falsche Angaben in ein Beweisdokument schreibt.
2. **Kurzfristig (ca. 4 h):** C1, C2, C4, C5, C6, C9, D10 – Leerformular druckbar und Fehlermeldungen auffindbar machen.
3. **Mittelfristig (ca. 8 h):** B1, B2, B3, C7 – Spannungsmessung in der Anschlussprüfung, Verteiler-Spalte, Prüfumfang, Spaltenbreiten.
4. **Danach:** restliche Grafik- und Normbefunde.
