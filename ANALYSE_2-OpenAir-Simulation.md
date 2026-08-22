# Teil 2 – Simulation Open-Air-Konzert: App gegen Leerformular

## Das simulierte Objekt

**„Seepark Open Air 2026", Hauptbühne, Aufbau 20.–22.08.2026**
Einspeisung über Netzersatzanlage 250 kVA plus Netzanschluss Kiosk.
Geprüft wurde die **gesamte Veranstaltung**, nicht ein Ausschnitt.

| Ebene | Umfang |
|---|---|
| Übergabepunkte | 3 (NEA 250 kVA → HV Bühne CEE 125 A · NEA 100 kVA → UV Licht CEE 63 A · Netz → Catering CEE 32 A) |
| Verteilungen | 9 – HV Bühne, UV Bühne links, UV Bühne rechts, UV FOH, UV Licht/Traversen, UV Ton, UV Video/LED-Wall, UV Catering, UV Backstage/Container/Sicherheitsbeleuchtung |
| Stromkreise | 51 |
| Geräte | 96 (Scheinwerfer, Movinglights, Blinder, Nebelmaschinen, Verlängerungen, Kabeltrommeln, Kettenzüge, PA, Pulte, LED-Panels, Catering-Geräte) |
| Besonderheiten | erhöhte Gefährdung durchgehend (U_L 25 V AC), Kettenzüge, Sicherheitsbeleuchtung, Catering mit Heizgeräten, RCD Typ B an Dimmern und Medienservern |

---

## Durchlauf 1 – Prüfung mit der App

Ausgeführt in Chromium gegen die echte App, mit echten PDF-Ausgaben.

### Ergebnis

| Schritt | Ergebnis |
|---|---|
| Anschlussprüfung, 3 Übergabepunkte | 1 PDF, **1 Seite**, fehlerfrei |
| Anlagenprüfung, 9 Verteilungen / 51 Kreise | 9 PDF, **10 Seiten**, je Protokoll 1,9 s Erzeugungszeit |
| Geräteprüfung, 96 Geräte | 1 PDF, **5 Seiten**; 96 Karten im DOM in 192 ms aufgebaut, PDF < 6 s |
| JavaScript-Fehler | **keine** |
| Summe | 11 Dokumente, **16 Seiten** |

### Was im ersten Anlauf schiefging – und warum das ein gutes Zeichen ist

Der erste Simulationsdurchlauf hat **alle neun Anlagenprotokolle verweigert**:

> „Widerspruch im Prüfergebnis: Das Protokoll enthält Beanstandungen …
> Das PDF wurde deshalb nicht erstellt."

Ursache: in den simulierten Daten war je Stromkreis ein RCD eingetragen, aber
I_Δmess und t_A fehlten. Die App wertet das korrekt als **Prüfung unvollständig**
(DIN VDE 0100-600 Abschn. 6.4.3.7) und verweigert die Freigabe. Fachlich exakt richtig –
und der wertvollste Treffer der ganzen Testreihe.

**Aber:** Die Meldung sagt nicht, **welcher** Stromkreis und **welcher** Wert fehlt.
Bei 8 Kreisen ist das lästig, bei 51 unbrauchbar. Bis die Ursache gefunden war, waren
neun Durchläufe verloren. Auf der Bühne heißt das: Nachtschicht, Ladung auf dem Tablet
bei 20 %, und ein Prüfer, der das PDF nicht erzeugt bekommt und nicht weiß, warum.

> **Maßnahme D10:** Die Meldung muss die Fundstellen nennen und dorthin springen –
> z. B. „Stromkreis 4 (Dimmerpack 2): Auslösestrom und Auslösezeit des RCD fehlen".
> Die Information liegt im Code bereits vor (`prueflingeOhneMessung()` liefert die
> Nummern und wird für einen anderen Abbruch schon genau so verwendet).

### Zeitbedarf in der Praxis (Hochrechnung aus der Feldzahl)

| Tätigkeit | Eingaben | Zeit |
|---|---|---|
| Stammdaten je Verteilung (großteils aus Stammdaten übernommen) | 6 | 9 × 1 min |
| Erster Stromkreis je Verteilung vollständig | 21 | 9 × 3 min |
| Weitere Kreise über „Duplizieren" (Bezeichnung + 6 Messwerte) | 7 | 42 × 1 min |
| Sicht- und Erprobungspunkte je Verteilung | 20 | 9 × 2 min |
| 96 Geräte über „Duplizieren" (Bezeichnung, Inv.-Nr., 3 Messwerte) | 5 | 96 × 40 s |
| Anschlussprüfung 3 Übergabepunkte | 30 | 12 min |
| **Summe Eingabearbeit** | **ca. 920** | **ca. 3 h 15 min** |

Die eigentliche Messarbeit kommt hinzu und ist in beiden Varianten gleich.

### Was in der App auf der Baustelle stört

1. **Die vorbelegten „i.O."-Felder** (Befund A3) verführen dazu, die Sichtprüfung zu
   überspringen. Bei 9 Verteilungen sind das 126 Felder, die man durchsehen müsste,
   ohne dass irgendetwas erzwingt, dass man es tut.
2. **„Netzmessung" liegt zugeklappt** (D9). Bei NEA ist die Frequenz Pflichtangabe,
   und der Abbruch dafür kommt erst beim Erzeugen des PDF – zu einem Zeitpunkt, an dem
   das Messgerät schon eingepackt ist.
3. **Kein Feld „Verteiler"** in der Tabelle (B2). Deshalb waren 9 getrennte Protokolle
   nötig, mit 9 Nummern und 9 Unterschriftenpaaren für eine Anlage.
4. **Gebäude-Auswahl** bietet nur Konstanzer Spielstätten; für Open Air muss man jedes
   Mal über „Sonstiges…" gehen (D15).
5. **Hausanschluss/Speisepunkt** hat einen Schnellknopf „NEA" – gut. Aber die
   Anlagen­daten der Netzersatzanlage selbst (Sternpunkterdung, Erder, Betriebsart)
   lassen sich nirgends dokumentieren (B4).

---

## Durchlauf 2 – dieselbe Veranstaltung auf dem Leerformular

### Blattbedarf

| Verteilung | Kreise | Blätter | Druckseiten |
|---|---|---|---|
| HV Hauptverteilung | 8 | 2 | 3 |
| UV Bühne links | 6 | 1 | 2 |
| UV Bühne rechts | 6 | 1 | 2 |
| UV FOH | 5 | 1 | 2 |
| UV Licht/Traversen | 7 | 1 | 2 |
| UV Ton | 5 | 1 | 2 |
| UV Video/LED-Wall | 4 | 1 | 2 |
| UV Catering | 4 | 1 | 2 |
| UV Backstage | 6 | 1 | 2 |
| **Anlagenprüfung gesamt** | **51** | **10** | **19** |
| Anschlussprüfung | 3 ÜP | 1 | 1 |
| Geräteprüfung | 96 | 4 | 5 |
| **Gesamt** | | **15** | **25** |

**Von den 25 Druckseiten sind 11 fast leer** – sie enthalten nur die Zeile
„Sicherer Gebrauch gewährleistet" und zwei Unterschriftslinien (Befund C1).
**40 der 91 verfügbaren Tabellenzeilen bleiben ungenutzt**, weil Blatt 1 nur 7 Zeilen hat
und das erste Fortsetzungsblatt gleich 28 nachschiebt.

### Spaltenbreiten gegen Handschrift

Angesetzt: 2,5 mm je Zeichen (gut lesbare Kugelschreiberschrift im Formularfeld),
abzüglich 2 mm Zellenpolsterung.

**Anlagenprüfung – 3 von 10 Spalten zu schmal:**

| Spalte | Breite | Platz | benötigt | Beispiel |
|---|---|---|---|---|
| Bezeichnung / Zweck | 30 mm | 11 Z. | **29 Z.** | „Steckdosenkreis Bühne links 1" |
| Leitung Typ / Adern / Quersch. | 22 mm | 8 Z. | **14 Z.** | „H07RN-F 5G 2,5" |
| R_ISO + Prüfspannung | 17 mm | 6 Z. | **15 Z.** | „>500 / 500 V DC" |
| Z_S / I_K (+ 2. Zeile L-N) | 24 mm | 8 Z. | **10 Z.** + 2. Zeile | „0,42 / 547" |
| Sicherung | 14 mm | 4 Z. | 5 Z. | „B 16A" |
| t_A @ __ × | 15 mm | 5 Z. | 6 Z. | „14 @5x" |

**Anschlussprüfung:** „Bezeichnung Übergabepunkt" 34 mm für 23 Zeichen,
„Netzsystem Spannung/Frequenz" 28 mm für 17 Zeichen („TN-S 230/400 50 Hz"),
„Z_S / I_K" 24 mm für „0,16 / 1438".

**Geräteprüfung:** „Bezeichnung / Typ" 34 mm für 30 Zeichen,
„Inv.-Nr. / Seriennr." **16 mm für 8 Zeichen**, „Ableitstrom + Messverfahren"
38 mm für Wert **und** Verfahren.

Die Folge ist keine Unbequemlichkeit, sondern ein **Dokumentationsverlust**: Wer
„H07RN-F 5G 2,5" in 8 Zeichen quetscht, schreibt „H07 5G2,5" oder gar „RN-F". Ein Jahr
später ist im Streitfall nicht mehr rekonstruierbar, welche Leitung gemessen wurde.

### Handschriftlicher Aufwand

| | Einzeleinträge |
|---|---|
| Anlagenprüfung (51 × 10 Spalten + 9 × 14 Kopffelder) | 636 |
| Geräteprüfung (96 × 9 Spalten) | 864 |
| Anschlussprüfung (3 × 9 + Kopf) | 41 |
| **Summe Papier** | **ca. 1.540** |
| **Summe App (mit Duplizieren)** | **ca. 920** |

Die App spart rund **40 % der Einträge**, im Wesentlichen durch drei Dinge:
„Duplizieren" der Anlagendaten, automatische I_K-Berechnung aus Z_S und die
Übernahme der Stammdaten. **Alle drei Vorteile setzen voraus, dass der Prüfer sie
kennt** – „Duplizieren" ist ein grauer Sekundärknopf im Kartenkopf.

### Was auf dem Papier zusätzlich fehlt

* Kein Feld **„Seriennummer Messgerät"** und (außer bei der Geräteprüfung) kein Feld
  **„Prüfgerät kalibriert bis"** – beide sind im PDF-Kopf schlicht nicht vorgesehen (C8).
* Die **Sollwertzeile der Netzmessung** („L gegen N je 230 V · L gegen L je 400 V ·
  N gegen PE 0 V") steht am **Blattfuß in 4,6 pt**, rund 20 cm unter den Feldern,
  auf die sie sich bezieht (C6).
* Die **Legende steht nur auf Blatt 1**. Wer die Kreise 8–35 auf dem Fortsetzungsblatt
  einträgt, hat keinerlei Erklärung von I_a, Z_S, I_Δn, t_A, U_mess vor sich (C4).
* Die **Kopfbox der Fortsetzungsblätter** verlangt Protokoll-Nr., Prüflings-ID und Datum
  erneut von Hand, obwohl darunter steht „Gehört zum Protokoll mit der oben stehenden
  Protokoll-Nr." (C9).

---

## Direktvergleich

| Kriterium | App | Leerformular |
|---|---|---|
| Druckseiten für die Gesamtveranstaltung | 16 | **25** (11 davon fast leer) |
| Einträge von Hand | ca. 920 | ca. 1.540 |
| Spalten, die den Inhalt nicht fassen | 0 | **3 / 2 / 3** (Anlage / Anschluss / Gerät) |
| Grenzwert am Feld sichtbar | ja, unter jedem Feld | nur Blatt 1, 4,6 pt |
| Rechenfehler I_K = 230 V / Z_S | ausgeschlossen | möglich |
| Widerspruch Freigabe ↔ Befund | wird abgefangen | nicht erkennbar |
| Vergessener RCD-Messwert | blockiert das PDF | fällt niemandem auf |
| Nummernvergabe, Doppelvergabe | automatisch, mit Warnung | von Hand |
| Archiv / Wiederauffinden | im Gerät, durchsuchbar | Ordner |
| Bei Regen, Kälte, Handschuhen | Tablet unter Folie, Touch mit Handschuh problematisch | funktioniert immer |
| Bei leerem Akku | Totalausfall | funktioniert immer |
| Bei 51 Kreisen und Zeitdruck | klar überlegen | grenzwertig |

**Fazit:** Das Leerformular ist als **Rückfallebene** unverzichtbar und muss dafür
druckbar bleiben – aber in seiner heutigen Form ist es für eine Gesamtveranstaltung
nicht wirtschaftlich einsetzbar. Die drei Änderungen, die den größten Unterschied machen,
sind C1 (Waisenseite), C4 (Legende auf jedem Blatt, ≥ 6 pt) und C7 (Spaltenbreiten).
