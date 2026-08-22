# SIMULATION 3: Gesamtprüfung Open-Air-Bühne mit Azubis (1., 2., 3. Lehrjahr)

**Szenario:** Stadttheater Konstanz prüft sein neues Open-Air-Bühnensystem  
**Team:** 1 Meister (Leitung) + 1 Azubi 1.LJ + 1 Azubi 2.LJ + 1 Azubi 3.LJ  
**Werkzeuge:** APP vde0100.html + Papierformular (Redundanzprüfung)  
**Dauer:** Realistisch 4–5 Stunden Vor-Ort-Zeit  

---

## 08:00 UHR: BRIEFING IM BÜRO

```
Meister zu Team:
„Wir prüfen heute die neue Bühnenschaltanlage auf dem Münsterplatz.
Jeden von euch habe ich eine Aufgabe:

- Azubi 1.LJ (Tom): Du schreibst die Papierform aus und notierst alles, was wir sagen.
- Azubi 2.LJ (Lisa): Du bedienst die App und trägst die Messwerte ein.
- Azubi 3.LJ (Max): Du checkt auf Fehler – am Ende vergleichst du APP und Papier.
- Ich: Ich messe, erkläre und unterschreibe zum Schluss.

[Jeder bekommt seine Rolle verteilt]  ✅
[Redundanzprüfung: zwei Wege, zwei Erfassungen, Vergleich am Ende]"

Vorbereitung:
- Tablet mit App (Batterie 85%, Wifi Hotspot des Meisters)
- Papierformular 3er-Satz
- Fluke 6500-2 Installationstester  
- Notepad für Azubi 1.LJ
```

---

## 09:00 UHR: VOR ORT — BESICHTIGUNG (Sichtkontrolle)

### Stammdaten erfassen (Azubi 1.LJ auf Papier + Azubi 2.LJ in APP)

```
[PARALLELER PROZESS]

Azubi 1.LJ schreibt von Hand:
```
Auftraggeber / Prüfort:  Stadttheater Konstanz, Münsterplatz
Gebäude / Bereich:       Freilichtbühne Münsterplatz
Anlage:                  Hauptverteiler + 3 Nebenverteilungen
Prüfer:                  Meinhard Strom, Meister ET
Prüfdatum:               15.07.2026
Messgerät:               Fluke 6500-2
S/N:                     FL-4782953
Kalibriert bis:          23.11.2026 ✅
```

Azubi 2.LJ tippt in APP:
```
[Dropdown: Münsterplatz wählen? Nicht vorhanden → Custom eingeben]
Auftraggeber: „Open Air Veranstaltungen GmbH, Münsterplatz, Konstanz"
              [Tippen auf Tablet dauert 40 Sekunden]
Prüfdatum:   [Datum-Picker] → Heute: 15.07.2026
Messgerät:   [Tippt] „Fluke 6500-2"
```

**Wahrnehmung:**
- ✅ Papier: schnell geschrieben (30 sec)
- ⚠️ APP: Tippen auf Tablet langsam (120 sec), aber akkurater
- ✅ Redundanz gelingt

---

### Besichtigung durchgehen (Meister führt)

```
Meister (mit Checkliste):
„Beginnen wir mit Besichtigung. Tom, du schreibst mit. Lisa, du notierst später in die App."

[BESICHTIGUNG AUF DER BÜHNE — 45 Min]

Meister prüft:
1. Beschaffenheit Schutzleiter
   → Kupferkabel 2,5 mm² durchgehend, keine Beschädigungen
   → Azubi 1.LJ schreibt: „Kupferkabel 2,5 mm² o.B." (ohne Befund = okay)  ✓
   → Azubi 2.LJ wird das später in APP eintippen

2. Zustand Isolation
   → Keine sichtbaren Risse, Kerben oder feuchtstellen
   → Azubi 1.LJ: „Isolation unversehrt"  ✓

3. Kennzeichnung L/N/PE
   → Meister mit Lupe: Braun (L), Blau (N), Grün-Gelb (PE) korrekt gefärbt
   → Alle Adern gekennzeichnet – auch in Verteilerdose
   → Azubi 1.LJ: „L/N/PE korrekt gekennzeichnet"  ✓

4. Schutz gegen direktes Berühren
   → Meister prüft: „Lassen sich die Stromschienenschuhe mit der Hand abnehmen?"
   → Nein – sind richtig gesichert
   → Schutzkontakte alle da
   → Azubi 1.LJ: „Schutz gegen Berühren gegeben, Kontakte gesichert"  ✓

5. Betätigungsvorrichtungen / Hauptschalter
   → Meister prüft Sicherungsschalter (Imax) für Hauptspeisung
   → Prüftaste geht rein, Schalter fällt aus
   → Azubi 1.LJ: „Imax 63 A – Prüftaste OK – Schalter fällt aus"  ✓

6. Erdungsleiter vorhanden & durchgehend
   → Meister folgt dem PE-Leiter von der Speisung bis zur Erdbuchse
   → PE in jedem Stromkreis durchgehend
   → Azubi 1.LJ: „PE-Ader durchgehend von Speisung bis Buchsen"  ✓

7. Installation normgemäß
   → Kabel nicht geknittert, Biegeradius OK
   → Verlegesicherung vorhanden
   → Keine scharfkantigen Übergänge
   → Azubi 1.LJ: „Verlegung normgemäß, kein Verschleiß sichtbar"  ✓

8. Kontrolle Schutzeinrichtungen
   → Meister prüft RCD-Schalter oben
   → Drückt Prüftaste → Schalter fällt sofort aus  ✅
   → Prüftaste wieder gedrückt → Schalter zieht wieder rein  ✅
   → Azubi 1.LJ: „RCD-Prüftaste funktioniert"  ✓

9. [Keine Sicherheitsbeleuchtung auf Freiluftbühne]
   → Azubi 3.LJ flüstert: „Sicherheitsbeleuchtung fehlt in der Liste – aber ist auch nicht nötig auf Freiluft"  ⚠️

[Nach Besichtigung]

Meister zu Azubi 1.LJ: „Gut dokumentiert. Du hast alles aufgeschrieben."

Azubi 1.LJ: „Gerne! Aber meine Handschrift wird immer kleiner, je mehr wir prüfen."  😅

[Problem der Papiervorlage wird sichtbar]
```

---

## 10:00 UHR: STROMKREIS 1 — MESSUNGEN

### Stromkreis 1: LED-Hauptbeleuchtung (16 A)

```
[MEISTER MISST MIT FLUKE]

Meister: „Tom, pass auf – ich zeige dir, wie man R_PE misst."
         [Hält die beiden Messspitzen an PE und Leiter]
         „Messwert: 0,08 Ω – das ist gut."

Azubi 1.LJ schreibt auf Papierformular:
```
Kreis:    1 - LED Hauptbeleuchtung
I_n:      16 A
R_PE:     0,08 Ω     [Azubi schreibt sauber]
R_ISO:    [Meister misst] 205 MΩ
          [Azubi schreibt] 205
```

Azubi 2.LJ (Lisa) tippt in APP zeitverzögert:
```
Kreis:    [Tipp oder Drop-down? Wahrscheinlich manuell] „1"
I_n:      [Tippt] „16"
R_PE:     [Tippt] „0,08"
R_ISO:    [Tippt] „205"
```

**Wahrnehmung:**
- ✅ Meister erklärt Tom die Messung → LERNEFFEKT
- ⚠️ Azubi 2.LJ ist schneller, aber passiver
- ⚠️ Papier ist noch lesbar, App puffert die Werte

---

### R_ISO (Isolationswiderstand) — Besonderheit

```
Meister: „Jetzt Isolationsprüfung. Das macht ein RCD-Prüfgerät. Lisa, pass auf die Messwerte auf."

Messgerät zeigt: 205 MΩ (Megaohm)

Meister: „Das ist gut – über 1 MΩ, wie es sein soll."

Azubi 2.LJ tippt in APP:
[Feld für R_ISO: Einheit wählbar (Ω / kΩ / MΩ)?]

⚠️ FRAGE: Tippt Azubi „205" in Feld MΩ oder „205000" in Feld Ω?
   [APP sollte Einheit-Dropdown haben – ist unklar]

Azubi 2.LJ: „Meister, welche Einheit soll ich eingeben?"

Meister: „Schau in die App – es sollte MΩ sein."

Azubi 2.LJ: [Sucht... sucht...] „Ich sehe nur ein Textfeld, keine Einheiten-Auswahl."

Meister: „Dann tippt du ‚205' mit der Einheit dahinter: ‚205 MΩ' oder nur ‚205' und wir geben die Einheit an."

❌ APP-USABILITY-PROBLEM: Einheiten unklar
```

---

### Schleifenimpedanz Z_S & Kurzschlussstrom I_K

```
Meister misst Z_S (mit Loop-Test-Funktion des Fluke):
Anzeige: 0,12 Ω

Azubi 1.LJ schreibt auf Papier: „0,12"

Azubi 2.LJ tippt in APP: „0,12"

Meister berechnet I_K mental: I_K ≈ 230 V / 0,12 Ω ≈ 1917 A

Azubi 3.LJ prüft die Berechnung:
- Prüfwert 5×I_n = 5×16 A = 80 A
- I_K = 1917 A >> 80 A ✅ OK

[ABER DANN:]

Meister: „Jetzt die zweite Schleife – nämlich L zu N."

Azubi 2.LJ: „Äh, wie? Es gibt zwei Schleifen?"

Meister: „Ja! Z_S ist die Schleife L–PE. Aber auch L–N kann fehlern."

Azubi 2.LJ: [Sucht in APP] „Ich sehe kein Feld für Z_L-N!"

Meister: [Seufzt] „Ja, das ist der Fehler der App. Z_L-N wird nicht erfasst."

Azubi 3.LJ notiert: ❌ APP-BUG: Z_L-N Feld fehlt

Meister misst trotzdem: Z_L-N = 0,11 Ω

Azubi 1.LJ schreibt auf Papier neben die Tabelle: „Z_L-N: 0,11 Ω (wurde in App nicht erfasst)"

[REDUNDANZ RETTET DIE SITUATION]  ✅
Aber: Das ist unbefriedigend. Der Fehler hätte behoben sein sollen.
```

---

### RCD-Prüfung — Das Komplexe Manöver

```
[MOMENT DER WAHRHEIT: RCD wird getestet]

Meister: „Jetzt kommt die RCD-Prüfung. Das ist die wichtigste Messung."

Er verbindet RCD-Prüfer mit Stromkreis 1.

[RCD-Prüfer: mobil, mit eingebauten Auslöse-Testfunktionen]

Meister: „Die RCD bewertet eine spezifische Fehlerrate. Ich teste sie mit 1×I_Δn, dann 5×I_Δn."

Azubi 1.LJ: „Was bedeutet I_Δn?"

Meister: [Kurze Erklärung] „Das ist der Nennfehlerstrom – hier 30 mA."

[Test startet: 1×I_Δn]

Messgerät zeigt:
- I_Δn = 30 mA (Sollwert)
- I_Δmess (1×) = 29 mA (gemessen)
- t_A (1×) = 0,04 s

Meister: „Gut – die 29 mA bei 30 mA Sollwert ist im Toleranzbereich."

Azubi 1.LJ schreibt: „1×: 29 mA / 0,04 s"  ✓

Azubi 2.LJ tippt in APP: „29" [Meister, wo soll Auslösezeit hin?]

Meister: „Die Auslösezeit auch – 0,04 Sekunden."

[Test startet: 5×I_Δn]

Messgerät zeigt:
- I_Δmess (5×) = 74 mA
- t_A (5×) = 0,038 s

Meister: [Prüft mental] „74 mA – das ist über der 2×I_Δn Grenze (60 mA)..."

Azubi 3.LJ: „Meister, ist das noch okay?"

Meister: „Grenzwertig. Für Typ A sollte 5×I_Δn < 2×I_Δn sein, also < 60 mA."

Azubi 2.LJ: [Tippt in APP] „74"

APP antwortet: [Was sagt die App? Warnung? OK?]
❌ UNKLAR – die Validierung ist nicht explizit sichtbar

Meister: „Wir dokumentieren das. Das ist noch nicht schlecht, aber grenzwertig."

Azubi 3.LJ notiert: ⚠️ RCD 5×-Wert = 74 mA (Grenzwert 60 mA) – grenzwertig, muss nach Norm checken

[Nach 30 Minuten für einen Stromkreis sind alle müde]

Azubi 1.LJ: „Meine Hand tut weh vom Schreiben."

Meister: [Nickt verständnisvoll] „Deshalb nutzen wir die App normalerweise."

[REALITÄT: 4 Stromkreise × 30 Min = 2 Stunden reine Messung]
```

---

## 11:30 UHR: STROMKREISE 2 & 3 — SCHNELLER DURCHZIEHEN

```
[Mit Erfahrung geht es schneller]

Azubi 2.LJ wird flinker – kennt jetzt die Felder

Azubi 1.LJ schreibt weiterhin mit: Handschrift wird mini

Azubi 3.LJ prüft nach jedem Stromkreis:
- Ist Z_S plausibel?
- Ist I_K plausibel (230 V / Z_S)?
- RCD-Grenzen plausibel?

Meister misst professionell durch.

Ergebnisse Kreis 2 (Spotlights):
- R_PE: 0,09 Ω ✅
- R_ISO: 200 MΩ ✅
- Z_S: 0,14 Ω, I_K: 1643 A ✅
- RCD: 30/29/0,04 s (1×) und 30/72/0,038 s (5×) ⚠️ knapp

Ergebnisse Kreis 3 (Sound):
- R_PE: 0,11 Ω ✅
- R_ISO: 210 MΩ ✅
- Z_S: 0,13 Ω, I_K: 1769 A ✅
- RCD: 30/28/0,04 s (1×) und 30/71/0,037 s (5×) ✅ OK

[Nach insgesamt 2,5 Stunden: Stromkreise 1–3 fertig]

Meister: „Gut gemacht. Wir haben noch Erdung und Potenzialausgleich."
```

---

## 13:00 UHR: MITTAGSPAUSE & VERGLEICH

```
Meister schlägt vor: „Wir vergleichen jetzt APP und Papierformular."

Azubi 3.LJ (Max) legt nebeneinander:

PAPIERFORMULAR (Azubi 1.LJ, 3 Stunden Handschrift):
```
Auftraggeber: [unleserlich, zu klein]
Prüfer: [klein, aber noch lesbar]
Tabelle:
Kreis 1: 16 | 0,08 | 205 | 0,12 | 1917 | [Spalte „Nuten..." ist LEER]
Kreis 2: 10 | 0,09 | 200 | 0,14 | 1643 | [LEER]
Kreis 3: 22 | 0,11 | 210 | 0,13 | 1769 | [LEER]
Bemerkungen: [Alles handschriftlich quergekritzel]
```

APP-PDF (Azubi 2.LJ, 3 Stunden Eingabe):
```
Auftraggeber: [PERFEKT GEDRUCKT]
Prüfer: [PERFEKT GEDRUCKT]
Tabelle:
Kreis 1: 16 | 0,08 | 205 MΩ | 0,12 | 1917 A | [Spalte „Nuten Netzmessung L-L" → LEER weil Feld nicht in App]
Kreis 2: 10 | 0,09 | 200 MΩ | 0,14 | 1643 A | [LEER]
Kreis 3: 22 | 0,11 | 210 MΩ | 0,13 | 1769 A | [LEER]
Bemerkungen: [PDF sauber strukturiert]
```

**Vergleich:**

| Aspekt | Papier | APP |
|---|---|---|
| Lesbarkeit | ⚠️ Klein, Handschrift | ✅ Perfekt gedruckt |
| Vollständigkeit | ❌ Z_L-N auf Papier notiert, aber nicht strukturiert | ❌ Z_L-N gar nicht erfasst |
| Tabelle „Nuten..." | ⚠️ Nicht ausgefüllt (unverständlich) | ⚠️ Nicht in APP erfassbar |
| Rechengenauigkeit | ❌ I_K hätte prüfer rechnen müssen | ✅ Auto-berechnet |
| Archiv | ❌ Nur Papier, braucht Scan | ✅ Digital gespeichert |
| Zeitaufwand | 🐌 180 Min (3 Stunden) | ⏱️ 120 Min (2 Stunden) – 33% schneller! |

Azubi 3.LJ schreibt Vergleichs-Bericht:
```
FAZIT nach Vergleich:
1. APP ist SCHNELLER (33% zeitersparnis)
2. APP-PDF LESBAR (Papier unleserlich nach Hand)
3. ABER APP hat Fehler:
   - Z_L-N Feld fehlend (nicht dokumentiert)
   - Spalte „Nuten Netzmessung" (auch im Leerformular falsch)
   - U_L Grenzwert nur 50 V (sollte für Bühne 25 V sein)

4. PAPIER hat auch Fehler:
   - Spalte „Nuten Netzmessung" ist Tippfehler
   - Handschrift nach 3 Stunden unleserlich
   - Keine Rechenunterstützung

EMPFEHLUNG: APP nutzen, aber Fehler beheben (Z_L-N vor allem!)
```
```

---

## 14:00 UHR: ERDUNG & POTENZIALAUSGLEICH

```
Meister: „Letzter Teil: Erdungswiderstand und Potenzialausgleich."

[ERDUNGSWIDERSTAND]

Meister misst mit Erdungsrahmen beim Aggregat-Erdungsstab:
Messung: R_E = 22 Ω

Meister: „Das ist zu hoch. Sollte max. 16 Ω sein für einen Außenbereich."

Azubi 1.LJ schreibt: „R_E = 22 Ω – ZU HOCH!"

Azubi 2.LJ tippt in APP: „22"

APP antwortet: ⚠️ „Erdungswiderstand zu hoch – überprüfen Sie die Erdungsanlage"

✅ APP erkennt die Abweichung!

Meister: „Okay, wir müssen die Erdungsanlage verbessern. Stab raus, zwei Stäbe parallel."

[Zweite Messung: R_E = 11 Ω → OK]

Azubi 1.LJ notiert: „R_E: 22 Ω (FEHLER) → nach Verbesserung: 11 Ω ✅"

Azubi 2.LJ: [Überschreibt Wert in APP] → 11 Ω

[POTENZIALAUSGLEICH]

Meister: „Jetzt PA – das ist wichtig. Wir messen an mehreren Stellen."

Messorte:
1. Traverse (Stahlkonstruktion): R_PA = 0,08 Ω
2. Tribüne (Stahlrahmen): R_PA = 0,12 Ω
3. Blitzschutzanlage (Metalldach): R_PA = 0,06 Ω
4. Außenwasserleitungsleitung: R_PA = 0,05 Ω (zusätzlich) [nicht in Vorlage vorgesehen]

Azubi 1.LJ schreibt alles auf Papierformular im Freitextfeld [kaum noch lesbar]:
```
PA Messungen:
- Traverse: 0,08Ω
- Tribüne: 0,12Ω
- Blitzsch.: 0,06Ω
- Wasser: 0,05Ω
```

Azubi 2.LJ öffnet Freitextfeld in APP:
[Tippt manuell mit Tablet-Tastatur]
```
Potenzialausgleich geprüft an:
Traverse (0,08 Ω), Tribüne (0,12 Ω), Blitzschutzanlage (0,06 Ω), Wasserleitung (0,05 Ω)
```

⚠️ Problem: Keine strukturierte Erfassung
❌ Sollte sein: Tabelle mit Spalten [Messpunkt | R_PA | i.O./n.i.O.]

Azubi 3.LJ: [Notiert kritisch] „PA-Dokumentation sollte tabelle sein, nicht Freitext!"
```

---

## 15:00 UHR: BERÜHRUNGSSPANNUNG & ABSCHLUSSBEWERTUNG

```
[BERÜHRUNGSSPANNUNG U_L]

Meister: „Noch eine Zusatzprüfung – Berührungsspannung bei R_E-Fehler."

Szenario: Es gibt eine isolationsfehler in Stromkreis 2.
Meister simuliert: Fehler L zu PE mit bekanntem Widerstand.

Gemessene Spannung: U_L = 32 V AC

Meister: „Okay. Grenzwert ist 50 V AC – also OK."

Azubi 2.LJ tippt in APP: U_L = 32 V

APP sagt: ✅ OK (32 V < 50 V)

ABER DANN:

Azubi 3.LJ: „Meister, aber das ist eine BÜHNENSCHALTANLAGE! Für Bühnen gilt 25 V AC, nicht 50 V!"

Meister: [Nickt] „Richtig! Die App sollte das wissen – aber tut es nicht."

Azubi 3.LJ: [Notiert] ❌ APP-FEHLER: U_L Grenzwert sollte für Bühnenbetrieb 25 V sein, nicht 50 V

[GRENZWERTPROBLEM ERKANNT]

Azubi 1.LJ: „Also ist die Anlage bestanden oder nicht?"

Meister: „Technisch bestanden, aber für Bühnenbetrieb knapp. Bei der nächsten Wartung prüfen."

[Wird in Bemerkungen notiert, aber APP zeigt das nicht als Risiko]

---

[ABSCHLUSSBEWERTUNG]

Meister: „Okay, letzter Schritt: Gesamtbewertung."

Punkte:
- ✅ Besichtigung: Bestanden
- ✅ Stromkreis 1: Bestanden (RCD 5× grenzwertig dokumentiert)
- ✅ Stromkreis 2: Bestanden
- ✅ Stromkreis 3: Bestanden
- ✅ R_ISO: Bestanden
- ⚠️ R_E: Bestanden (nach Verbesserung)
- ✅ PA: Bestanden
- ⚠️ U_L: Bestanden formal, aber grenzwertig für Bühnenbetrieb

[In APP]

Azubi 2.LJ: [Sucht Gesamtbewertungs-Feld]

⚠️ Frage: Gibt es ein Dropdown oder Auswahlfeld für Gesamtbewertung „BESTANDEN / BESTANDEN MIT AUFLAGEN / NICHT BESTANDEN"?

Meister: „Das sollte in der App sein – schau mal."

Azubi 2.LJ: [Sucht... sucht...]

Je nach APP-Design:
- Entweder: Automatische Gesamtbewertung (APP errechnet: wenn alle Teile OK → BESTANDEN)
- Oder: Manuelles Dropdown

[Im idealen Fall sollte APP sagen:]
GESAMTBEWERTUNG: ✅ BESTANDEN

[ABER MIT HINWEIS:]
- Erdungswiderstand R_E nach Verbesserung OK (war 22 Ω → 11 Ω)
- RCD 5×-Werte grenzwertig dokumentiert
- Z_L-N nicht erfasst (Lücke in Dokumentation)
- Berührungsspannung 32 V unter 25 V Bühnenlimit – nachkontrollieren

Azubi 2.LJ tippt: [Manuelle Auswahl] „BESTANDEN"

PDF wird erzeugt.

Meister: „Unterschriftsplatz noch leer – jetzt unterschreibe ich."

[Unterschrift wird gesammelt – digital oder ausgedruckt?]
```

---

## 15:45 UHR: VERGLEICH & ABSCHLUSS

```
Azubi 3.LJ (Max) präsentiert Fehler-Analyse vor Ort:

KRITISCHE FEHLER (mussten workarounded werden):
1. ❌ Z_L-N Feld fehlend – wurde auf Papier notiert, nicht in APP
2. ⚠️ U_L Grenzwert = 50 V statt wählbar 25/50 V – Bühne falsch bewertet
3. ❌ PA-Dokumentation unstrukturiert – sollte Tabelle mit 12 Messpunkten sein
4. ❌ Tippfehler „Nuten Netzmessung L-L" in Leerformular

POSITIVES:
✅ APP ist 33% schneller als Papier
✅ PDF-Qualität perfekt (Formelzeichen OK)
✅ Rechenlogik für I_K funktioniert
✅ Erdungswiderstand wird validiert
✅ Archiv funktioniert

ÜBERRASCHUNG:
🎯 Redundanz (APP + Papier parallel) rettete das System!
   → Fehlendes Z_L-N wurde auf Papier dokumentiert
   → Zwei unterschiedliche Arbeitsweisen fanden das Problem
   → In nur einer APP hätte niemand gemerkt, dass Z_L-N fehlt

Azubi 1.LJ (Tom): „Meine Hand ist hin – aber ich hab gelernt, dass Papier antiquiert ist!"

Azubi 2.LJ (Lisa): „Die APP ist schneller, aber es fehlen Felder. Und was bedeutet ‚Nuten'?"

Azubi 3.LJ (Max): „Das sind alle bekannte Bugs in v4.3.0. Für die nächste Prüfung sollten
                   wir erst hier beheben: Z_L-N, U_L wählbar, PA tabelle."

Meister: „Genau. Diese Prüfung wird zur Beispielvorlage. Alle Fehler dokumentieren wir."

[TERMIN WIRD GESPEICHERT]

PDF wird gezeigt:
- ✅ Titel sauber
- ✅ Tabellen gefüllt  
- ✅ Unterschrift eingescannt (oder digital)
- ❌ Z_L-N fehlt (weil Feld nicht existiert)
- ⚠️ Spalte „Nuten..." ist leer (zu recht, weil unverständlich)

Meister unterschreibt PDF, notiert:
„Anlage geprüft und bestanden. Folgeprüfung: 15.07.2027.
Hinweis: Z_L-N zusätzlich dokumentiert (siehe Anhang).
Prüfbereich Bühnenbetrieb: U_L 32 V < 25 V Grenzwert – OK aber eng."
```

---

## GESAMTFAZIT DER SIMULATION

### Zeitrechnung

```
Stammdaten:        15 Min (APP) vs. 10 Min (Papier)
Besichtigung:      45 Min (parallel beide)
Messungen (3 Kreis): 90 Min (parallel beide)
Erdung/PA:         30 Min (parallel beide)
Vergleich/Audit:   15 Min (nur 3.LJ)

SUMME APP:    ~150 Min = 2,5 Stunden Prüfzeit
SUMME Papier: ~200 Min = 3,3 Stunden Prüfzeit
---
GEWINN durch APP: ~50 Min = 25% Zeitersparnis (nicht 33% wie vorher, weil Redundanzprüfung Zeit kostet)
```

### Fehler pro Werkzeug

**APP (v4.3.0) Fehler erkannt:**
- ❌ Z_L-N Feld fehlend (KRITISCH)
- ⚠️ U_L = 50 V starr (KRITISCH für Bühnen)
- ❌ Netzsystem nicht ausgewertet (HOCH)
- ⚠️ Z_S nicht plausibilitätsgeprüft (MITTEL)
- ⚠️ RCD-Validierung unklar (MITTEL)
- ⚠️ PA-Feld unstrukturiert (MITTEL)

**Papier-Formulare Fehler erkannt:**
- ⚠️ Spalte „Nuten Netzmessung L-L" (Tippfehler – FORM)
- ❌ Handschrift wird unleserlich nach 3 Stunden
- ❌ Keine automatischen Berechnungen
- ❌ PA-Dokumentation unstrukturiert (wie APP)
- ❌ Z_L-N auch auf Papier nicht strukturiert erfasst (weil Spalte da, aber unklar)

### Lerneffekt pro Lehrjahr

**Azubi 1.LJ (Tom):**
- ✅ Lernt die Besichtigung von Grund auf
- ✅ Versteht, dass Handschrift bei langer Prüfung problematisch ist
- ❌ Versteht die Messwerte noch nicht vollständig
- 📊 Lernnote: ANFÄNGER – braucht Anleitung

**Azubi 2.LJ (Lisa):**
- ✅ Kann APP selbstständig bedienen
- ✅ Erkennt Fehler (Z_L-N, U_L)
- ✅ Versteht Messwert-Eingabe
- ❌ Versteht noch nicht die tiefere Validierungslogik
- 📊 Lernnote: FORTGESCHRITTEN – kann mit APP arbeiten

**Azubi 3.LJ (Max):**
- ✅ Kennt beide Systeme meistern
- ✅ Erkennt ALLE Fehler (9 identifiziert)
- ✅ Schreibt Report für Entwickler
- ✅ Kann Qualitätskontrolle durchführen
- 📊 Lernnote: MEISTER – bereit für Prüfleitung

### Gesamturteil

**APP ist gut für:** ⏱️ Schnelligkeit, 📄 Dokumentation, 🔢 Rechenlogik, 📱 Moderne Technik

**APP ist schlecht für:** ❌ Vollständigkeit (Z_L-N), 🎯 Grenzwertprüfung (U_L), 📋 Struktur (PA)

**Empfehlung:**  
✅ **APP verwenden, aber ERST die 3 kritischen Fehler (C1, C2, C7) beheben**, dann Azubis aller Jahrgänge damit prüfen lassen.

**Redundanz (APP + Papier) hat Sinn:** Sie finden Fehler, die nur eine Methode nicht erkennt.  
Für Großprüfungen (Open Air mit 10+ Stromkreisen) ist das 33% schneller und zuverlässiger.

---
