# SIMULATION 1: Open-Air-Konzertbühne „Summer Nights Festival 2026"

**Veranstaltung:** Rockkonzert auf Münsterplatz Konstanz  
**Bühnengröße:** 12 m × 8 m, 3 m Höhe  
**Stromversorgung:** CEE 63 A Einspeisungspunkt (Aggregat 32 kVA)  
**Prüfumfang:** Vollständige Bühnenschaltanlage + Hauptverteiler + Nebenverteilungen  

---

## SZENARIO A: PRÜFUNG MIT DER APP (Version 4.3.0)

### Phase 1: Stammdaten eingeben

```
Auftraggeber:        Open-Air Veranstaltungen GmbH, Münsterplatz 50, Konstanz
Gebäude/Bereich:     Münsterplatz (Custom)
Anlage:              Open-Air Bühnenschaltanlage - Hauptverteiler + 3 Nebenverteilungen
Prüfungs-ID:         OA-2026-07-15-001
Protokoll-Nr.:       PA-2026-07-15-001
Prüfer:              Meinhard Strom (Meister ET)
Prüfdatum:           15.07.2026
Messgerät:           Fluke 6500-2 Installationstester
S/N:                 FL-4782953
Kalibriert bis:      23.11.2026 ✅ OK
Hausanschluss:       CEE 63 A Einspeisung (32 kVA Aggregat)
```

**Wahrnehmung des Prüfers (APP):**  
✅ Formular lädt flüssig  
⚠️ Auftraggeber/Gebäude kommt aus Vorlage – gut vorausgefüllt

---

### Phase 2: Netzsystem, Netzspannung, Geräte

```
Prüfart:             DIN VDE 0100-600 (Erstprüfung) → aber: Änderung/Erweiterung 🤔
Grund:               Änderung (neue Bühnenschaltanlage installiert)
Netzsystem:          TN-S (aber wollen wir TT wählen? ← Aggregat ist hier wie ein privater Erdung)
→ [APPFEHLER] Netzsystem wird nicht bewertet! Egal ob TN-S oder TT gewählt wird.

Netzspannung:        230 / 400 V
Frequenz:            50 Hz
Einspeisung:         Netzersatzanlage (NEA / Aggregat)
Prüfart Anschluss:   Direkt vom Aggregat-Ausgang
```

**Wahrnehmung des Prüfers:**  
⚠️ Muss manuell TN-S oder TT wählen – was ist es aber wirklich bei einem Aggregat?  
❌ App sagt nirgends, dass Netzsystem zu Grenzwertberechnung führt  
❌ Prüfgrund „Änderung" ist gespeichert, aber wird nicht verwendet

---

### Phase 3: Besichtigung (Sichtkontrolle) – mit APP

**9 Punkte abgearbeitet:**

```
☑ Beschaffenheit der Schutzleiter          → Augenschein: Kupferkabel 2,5 mm² durchgehend
☑ Zustand der Isolation                    → OK, keine Beschädigungen
☑ Kennzeichnung L/N/PE                     → OK, Farben korrekt (braun/blau/grün-gelb)
☑ Schutz gegen direktes Berühren           → BESTANDEN (Schutzkontakte)
☑ Betätigungsvorrichtungen                 → Sicherungsschalter, Imax-Schalter funktioniert
☑ Erdungsleiter vorhanden & durchgehend    → OK
☑ Installation normgemäß                   → OK
☑ Kontrolle der Schutzeinrichtungen        → RCD-Test: Prüftaste quittiert
☐ Brandabschottung ← FEHLT! (in App nicht vorhanden)
☐ Sicherheitsbeleuchtung ← FEHLT! (in App nicht vorhanden)
☐ Leiterverbindungen kritisch überprüfen ← FEHLT!
```

**Wahrnehmung des Prüfers:**  
❌ „Brandabschottung? Das ist ja eine Freiluftbühne – aber der Punkt fehlt trotzdem"  
❌ „Sicherheitsbeleuchtung ist wichtig – gehört aber nicht in die App?"  
✅ Übrige 9 Punkte passen gut

---

### Phase 4: Messungen – Stromkreise 1–3 (mit APP)

#### Stromkreis 1: Hauptbeleuchtung (LED-Array)

```
TABELLE (App)
Kreis:             1 - LED Hauptbeleuchtung
Nennen. Strom I_n: 16 A
R_PE:              0,08 Ω       ← passt: max 0,4 Ω für 2,5 mm²
R_ISO:             200 MΩ        ← OK: > 1 MΩ (250 V Prüfspannung)
Z_S:               0,12 Ω        ← Messung eingegeben
I_K:               1917 A        ← App berechnet: 230 V / 0,12 Ω = 1917 A
Prüfwert 5×I_n:    80 A          ← OK: I_K (1917 A) >> 5×16 A
Prüfwert 10×I_n:   160 A         ← OK: I_K (1917 A) >> 10×16 A

❌ ABER: Z_L-N wird nicht abgefragt!
   Der zweite Fehlerfall (L zu N über Aggregat-Fehler) nicht dokumentiert

⚠️ Z_S wird eingegeben, aber nicht bewertet gegen U_0/I_K,min
   (Im Normfall: 0,12 Ω ist plausibel, aber App sagt nicht „passt")
```

**RCD-Prüfung für diesen Kreis:**

```
RCD-Typ:           A (allgemein)
I_Δn Sollwert:     30 mA
I_Δmess 1×:        29 mA      ← App prüft: 1× I_Δn sollte < 1,55 × I_Δn sein → 29 < 46,5 ✅
I_Δmess 5×:        74 mA      ← App prüft: 5× I_Δn sollte < 2,0 × I_Δn sein → 74 < 60 mA ❌ FEHLER?
                              Oder: 74 > 60 → Auslösezeit prüfen?
t_A gemessen:      0,04 s     ← OK für 5×I_Δn bei Typ A (max 0,2 s)

[Wahrnehmung des Prüfers:]
App zeigt: „RCD unvollständig – I_Δmess fehlt"  
Prüfer hat aber 3 Werte eingegeben!
❌ APP-BUG ODER UNKLARHEIT?
```

#### Stromkreis 2: Bühnen-Spotlights (analog 2 kW)

```
Kreis:             2 - Spotlights analog
Nennen. Strom:     10 A
R_PE:              0,09 Ω       ← OK
R_ISO:             180 MΩ       ← OK
Z_S:               0,14 Ω
I_K:               1643 A
Messung OK.

RCD:               I_Δn 30 mA, gemessen 28/73/0,04 s  ← wieder: I_Δmess 5× > Sollwert
```

#### Stromkreis 3: Sound-Equipment (5 kW, separate Speisung)

```
Kreis:             3 - Sound 5 kW
Nennen. Strom:     22 A
R_PE:              0,11 Ω       ← OK
R_ISO:             210 MΩ       ← OK
Z_S:               0,13 Ω
I_K:               1769 A
RCD:               OK, 30/28/72/0,038 s
```

---

### Phase 5: Zusatzprüfungen (APP)

#### Erdungswiderstand R_E

```
Messung beim Aggregat-Erdungsstab: 22 Ω
Sollwert (Orientierung):            max. 16 Ω für Außenbereich
Bewertung:                          ⚠️ GRENZWERT ÜBERSCHRITTEN!
                                    (22 Ω > 16 Ω)

App zeigt: „Erdungswiderstand zu hoch – Erdungsanlage überprüfen"
Prüfer nimmt Stab aus, verlängert parallel → 11 Ω  ✅
```

#### Berührungsspannung U_touch (wenn L-PE Fehler simuliert)

```
[Szenario: Ein Stromkreis fehlerhafte Isolation]
App: U_L Grenzwert = 50 V AC / 120 V DC
Prüfer misst: 45 V AC
App-Bewertung: ✅ OK (45 < 50)

❌ ABER: Theater / Open-Air-Bühne sollte 25 V AC Grenzwert haben!
         App müsste warnen: „Für Bühnenbetrieb empfohlen: max 25 V AC"
```

#### Durchgängigkeit Potenzialausgleich

```
App fragt: „Potenzialausgleich gemessen?"
Prüfer antwortet: Ja, an Traverse + Tribüne + Blitzschutzanlage
                  Messungen: 0,08 Ω / 0,12 Ω / 0,06 Ω jeweils
                  
Aber: App hat nur ein Textfeld.
Prüfer muss schreiben: „Traverse 0,08Ω, Tribüne 0,12Ω, Blitzschutz 0,06Ω"
❌ Nicht tabellarisch erfassbar → PDF sieht unübersichtlich aus
```

---

### Phase 6: Bewertung & PDF-Export (mit APP)

```
Besichtigung:      ✅ BESTANDEN
Messungen:         🟡 TEILWEISE (RCD 5×-Wert fraglich, R_E musste nachbesserung)
Isolationswiderstand: ✅ BESTANDEN
Erdung:            ✅ BESTANDEN (nach Verbesserung)
Potenzialausgleich: ✅ BESTANDEN

GESAMTBEWERTUNG: ✅ ANLAGE BESTANDEN (mit Nachbesserung dokumentiert)

PDF Export:        ✅ Funktioniert, Formelzeichen (Ω, ≤) werden korrekt dargestellt
PDF Größe:         ~180 kB (mit 3 Stromkreisen)

[Wahrnehmung des Prüfers:]
✅ „Die App macht das Ausfüllen schnell"
❌ „Aber die Netzimpedanz fehlt mir – ich weiß nicht, wie kritisch der zweipolige Fehler ist"
❌ „U_L für Bühne sollte 25 V sein – die App zwingt mich zu 50 V"
⚠️ „Die RCD-Prüfung bei 5× fühlt sich nicht ganz korrekt an – ich verstehe die Validierung nicht"
```

---

## SZENARIO B: PRÜFUNG MIT LEERFORMULAR ZUM HÄNDISCHEN AUSFÜLLEN

**Ausgabe:** Ausdrucken 3er-Satz (Leerformular mit Vorlage)

### Phase 1: Stammdaten von Hand eintragen

```
Auftraggeber:         [Prüfer schreibt groß, sauber mit Kugelschreiber]
                      Open-Air Veranstaltungen GmbH
                      Münsterplatz 50, Konstanz
                      
Gebäude:              [Markiert „Sonstiges" und schreibt] Open-Air Bühnenfläche

Anlage:               [2-zeilig] 
                      Hauptverteiler + 3 Nebenverteilungen
                      Bühnenschaltanlage LED/Spots/Sound

Prüfer:               Meinhard Strom
Prüfdatum:            15.07.2026
Messgerät:            Fluke 6500-2
S/N:                  FL-4782953
Kalibriert bis:       23.11.2026
```

**Wahrnehmung:**  
✅ Formular ist klar strukturiert  
⚠️ Handschrift wird schnell unleserlich bei mehreren Seiten  
⚠️ Spalten sind eng – Name passt gerade noch

---

### Phase 2: Besichtigung ausfüllen (von Hand)

**Vorlage zeigt 9 Punkte + 1 Leerfeld:**

```
☑ Beschaffenheit der Schutzleiter        [Prüfer: Haken]
☑ Zustand der Isolation                  [Haken]
☑ Kennzeichnung L/N/PE                   [Haken]
☑ Schutz gegen direktes Berühren         [Haken]
☑ Betätigungsvorrichtungen               [Haken]
☑ Erdungsleiter vorhanden                [Haken]
☑ Installation normgemäß                 [Haken]
☑ Kontrolle Schutzeinrichtungen          [Haken]
[ ] _________________ ← Leerfeld: Prüfer schreibt "Brandabschottung N/A (Freiluft)"
```

**Wahrnehmung:**  
✅ Papierform gibt Struktur vor  
⚠️ Leerfeld ist hilfreich, aber uneinheitlich  
❌ Sicherheitsbeleuchtung fehlt auch auf Papier

---

### Phase 3: Messwerttabelle ausfüllen (Stromkreise 1–3)

**Vorlage zeigt Tabelle mit Spalten:**  
`Kreis | I_n | R_PE | R_ISO | Z_S | I_K | Nuten Netzmessung L-L | Bemerkungen`

```
[TABELLE HANDSCHRIFTLICH AUSGEFÜLLT]

Kreis 1: LED Hauptbeleuchtung
16 A | 0,08 | 200 | 0,12 | 1917 A | [Spalte „Nuten...": Prüfer fragt sich] "Was soll hier hin?"
                                    [Schreibt unsicher] „0,15 Ω (?)?"
                                    [Später durchgestrichen]
Bemerkungen: OK

Kreis 2: Spotlights
10 A | 0,09 | 180 | 0,14 | 1643 A | [Spalte: Freigelassen, weil unklar]
Bemerkungen: OK

Kreis 3: Sound 5 kW
22 A | 0,11 | 210 | 0,13 | 1769 A | [Spalte: Freigelassen]
Bemerkungen: RCD 30/28/0,04s OK
```

**Kritische Beobachtung:**  
❌ „Nuten Netzmessung L-L" ist unverständlich!  
❌ Prüfer weiß nicht, ob Z_L-N = Z_S oder etwas anderes ist  
❌ Ohne Erklärung gibt Prüfer auf und lässt Spalte leer  
❌ Die Spalte wurde gedruckt, wird aber nicht ausgefüllt

---

### Phase 4: RCD-Prüfung von Hand dokumentieren

```
Feld: „RCD-Messwerte (I_Δn, I_Δmess, t_A)"

Prüfer trägt ein (Platz ist begrenzt):
Kreis 1: 30|29/73|0,04
Kreis 2: 30|28/72|0,038
Kreis 3: 30|28/71|0,039

⚠️ Darstellung sehr kompakt, schwer lesbar. Aber Platz ist knapp.
❌ Es ist nicht klar, ob alle drei Werte (1×, 5×, t_A) Platz haben oder nicht.
```

---

### Phase 5: Erdungswiderstand & Potenzialausgleich von Hand

```
R_E (Aggregate): 22 Ω (erste Messung), dann 11 Ω (nach Verbesserung)
                [Prüfer macht zwei Einträge, erste durchgestrichen]

Potenzialausgleich: 
[Freitextfeld, ungefähr 3 Zeilen verfügbar]
Gemessen an:
- Traverse: 0,08 Ω
- Tribüne: 0,12 Ω
- Blitzschutzanlage: 0,06 Ω
[Alles handschriftlich, sehr klein geschrieben, kaum lesbar]

❌ Handschrift ist tiny, unleserlich wenn später kopiert
❌ Keine Struktur – sieht nach Chaos aus
```

---

### Phase 6: Unterschrift & Archivierung (von Hand)

```
Gesamtbewertung: [Dropdown nicht vorhanden, Prüfer schreibt]
                 „BESTANDEN"
                 
Unterschrift:    [Prüfer unterschreibt – sieht lesbar aus]
Nächste Prüfung: [Prüfer schreibt] „15.07.2027"

[Vorlage zeigt keine Versionsnummer – Prüfer weiß nicht, welche Vorlage-Version er nutzt]

Kopien: 1× an Auftraggeber, 1× Archiv Prüfer, 1× Anlage
[Alle 3 Sätze werden kopiert – Qualität wird schlechter mit jeder Kopie]
```

**Wahrnehmung des Prüfers:**  
✅ Papierformular ist vertraut, keine Techniksorgen  
❌ Schrift wird unleserlich  
❌ Spalte „Nuten Netzmessung" war verwirrend  
❌ Keine automatische Berechnung (I_K aus Z_S) – Prüfer muss von Hand rechnen oder Wert übernehmen  
⚠️ PDF-Scan später wird schlecht lesbar  

---

## VERGLEICH APP vs. PAPIER: OPEN-AIR-KONZERT

| Kriterium | APP | PAPIER |
|---|---|---|
| **Eingabetempo** | ⚡ 45 Min | 🐌 90 Min |
| **Rechengenauigkeit** | ✅ Formeln richtig (I_K auto) | ❌ Prüfer rechnet von Hand/Fehler |
| **Lesbarkeit Endergebnis** | ✅ PDF perfekt | ❌ Handschrift unleserlich |
| **Vollständigkeit** | ⚠️ Fehlende Messgrößen (Z_L-N) | ❌ Unklare Spalte „Nuten..." |
| **Grenzwertprüfung** | ⚠️ 50 V statt 25 V für Bühne | ❌ Prüfer muss selbst vergleichen |
| **Netzsystem-Logik** | ❌ Wird nicht ausgewertet | ❌ Papier hat keine Logik |
| **PA-Dokumentation** | ❌ Freitextfeld unübersichtlich | ❌ Nur ein Leerfeld |
| **Fehlertoleranz** | 🟡 Falsche Werte möglich (U_L) | 🟡 Rechenfehler möglich |
| **Archivierung** | ✅ Digitales Backup | ❌ Nur Papier/Kopie |

---

## FAZIT ZUR OPEN-AIR-SIMULATION

**APP-Einsatz:**
- Schneller, präziser, bessere PDF  
- ❌ ABER: Fehlende Z_L-N macht Prüfung unvollständig  
- ❌ ABER: U_L = 50 V ist für Bühnenevent FALSCH  
- ⚠️ RCD-Validierung unklar  

**PAPIERFORMULAR:**
- Vertraut, offline sicher  
- ❌ ABER: Spalte „Nuten Netzmessung L-L" ist Fehler  
- ❌ ABER: Keine automatischen Berechnungen  
- ❌ ABER: Nachher unleserlich & schwer zu archivieren  

**Empfehlung:** APP verwenden, aber Fehler C1, C2 vorher beheben!

---
