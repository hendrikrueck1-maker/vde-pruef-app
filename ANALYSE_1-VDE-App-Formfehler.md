# VDE-Prüf-App: Umfassende Analyse & Fehlerdetektiv-Bericht

**Analysedatum:** 21.08.2026 | **Analyzer:** Elektrotechnik-/Veranstaltungstechnik-Master + Doktor der Vereinfachung

---

## TEIL A: FORMFEHLER & EIGENARTIGE ANGABEN IN DER APP

### A1 · KRITISCHER FEHLER: Netzimpedanz Z_L-N / Kurzschlussstrom I_K2 **komplett fehlend**

**Fundort:** `vde0100.html` – Messwerttabelle, `js/pdf-generator.js`

**Problem:**  
- Die App erfasst nur Z_S (Schleifenimpedanz L-PE) und berechnet I_K (dreipoliger Fehler)
- **Fehlt:** Z_L-N (Netzimpedanz L-Neutral) und I_K2 (zweipoliger Fehler L-N)
- Das Leerformular zeigt in der Kopfzeile: „Nuten Netzmessung L-L" – **das ist ein Tippfehler** (sollte Z_L-N sein)

**Auswirkung:** Im Open-Air-Konzert oder bei TT-System ist der zweipolige Fehler oft der gefährlichere! Die App dokumentiert ihn nicht.

**Status:** 🔴 MUSS BEHOBEN WERDEN (Prio 1)

---

### A2 · Berührungsspannung U_L: Grenzwert starr 50 V AC (Bühnen müssen 25 V AC nutzen!)

**Fundort:** `vde0100.html`, Zeile 170–200 (vermutlich), `js/pdf-generator.js`

**Problem:**  
- App: U_L Grenzwert hart auf 50 V AC / 120 V DC codiert  
- **Vorgabe:** Nach VDE 0100-600 und Musterprotokoll: **Bühnen/Baustellen/erhöhte Gefährdung = 25 V AC / 60 V DC**  
- Theater sitzt direkt in der 25-V-Kategorie (feuchte Bereiche, Traversen, bewegliche Geräte)

**Auswirkung:** Eine Prüfung mit der App bewertet die Bühnenwirklichkeit falsch als „bestanden", wenn die Spannung 30–45 V beträgt.

**Status:** 🔴 KRITISCH (Prio 2)

---

### A3 · Netzsystem-Feld wird nicht ausgewertet

**Fundort:** `vde0100.html`, Zeile 134–142 | `js/pdf-generator.js` (Codesuche: `netzsystem` kommt in Validierung nicht vor)

**Problem:**  
- Dropdown existiert (TN-S, TN-C-S, TN-C, TT, IT) – wird aber **nicht zur Berechnung/Bewertung herangezogen**
- **Sollte aber:**  
  - **TT:** Abschaltbedingung nicht I_K, sondern R_A × I_Δn ≤ 50 V prüfen  
  - **IT:** Erproben „Isolationsüberwachung" (IMD) vorhanden?  
  - **Abschaltzeiten** Tabelle 41.1 (TN: 0,4 s / TT: 0,2 s bei 230 V) sollten als Richtwerte abgefragt werden

**Auswirkung:** TT-Systeme (klassisch in Outdoor-Events mit Fremderdung) erhalten falsche Bewertungen. IT-Systeme (z. B. manche Notstromaggregate) werden nicht korrekt geprüft.

**Status:** 🟡 HOCH (Prio 3)

---

### A4 · Z_S-Wert wird eingegeben, aber NICHT bewertet

**Fundort:** `vde0100.html`, Input `.c-zs` hat kein `oninput="validateCardNorms()"`

**Problem:**  
- Feld da, Wert wird in PDF ausgegeben, aber **keine Plausibilitätsprüfung**  
- Z_S sollte gegen **U_0 / I_K,min** geprüft werden  
- Beispiel: Zs = 0,1 Ω, I_K = 230 V / 0,1 Ω = 2300 A – das ist unrealistisch und deutet auf Messfehler hin

**Auswirkung:** Ein Messfehler (z. B. offener Kontakt bei der Messung) bleibt unerkannt.

**Status:** 🟡 MITTEL (Prio 4)

---

### A5 · Leere Formulare: Kopfzeile der Messwerttabelle hat eigenartige Abkürzung

**Fundort:** `protokoll-vorlage.html`, Spaltenüberschrift Netzimpedanz

**Problem:** Text lautet „**Nuten Netzmessung L-L**" – das ist Kauderwelsch  
- Sollte sein: „Z_L-N (Ω)" oder „Netzimpedanz L-N"  
- „L-L" (Außenleitermessung) ist zwar auch zu dokumentieren, aber **nicht** die Netzimpedanz

**Status:** 🔴 FORMFEHLER (Tippfehler)

---

### A6 · Steckdosenbelegung wird global dokumentiert, nicht pro Stromkreis

**Fundort:** `vde0100.html`, Abschnitt „Erproben" → globale Auswahl „Drehfeld i.O."

**Problem:**  
- Nur ein Punkt: „Drehfeld i.O. / n.i.O."  
- **Vorgabe:** Pro Stromkreis einzeln prüfen: Belegung (L/N/PE korrekt?), Polarität, Drehrichtung  
- Theater mit 30+ Stromkreisen: alle haben das gleiche Drehfeld-Ergebnis, aber unterschiedliche Belegungsfehler sind dann nicht sichtbar

**Status:** 🟡 MEDIUM (Prio 5)

---

### A7 · Potenzialausgleich (PA): nur 1 Messpunkt, nicht Checkliste der 12 PA-Elemente

**Fundort:** `vde0100.html`, Abschnitt PA/Erdung → Feld mit Freitextfeld + Quick-Buttons

**Problem:**  
- Papiervorlage fordert 12 einzelne PA-Messpunkte anzukreuzen:  
  ✓ Fundamenterder, ✓ Blitzschutz, ✓ Wasserleitung, ✓ Heizung, ✓ PA-Schiene, ✓ Gebäudekonstruktion, ✓ Klimaanlage, ✓ Hauptschutzleiter, **✓ Traverse**, **✓ Tribüne**, ✓ Gasleitung  
- App: ein Freitextfeld + Schnellwahlknöpfe „Potentialausgleich oben", „Erdungsanlage", etc. – aber keine einzelnen Messpunkte je Punkt mit Messwert R_PA

**Auswirkung:** Theaterprüfung: Sind die Traverse und die Tribüne im PA? Unklar. Man sieht nur „Potentialausgleich oben".

**Status:** 🟡 MEDIUM (Prio 6)

---

## TEIL B: ANALYSE DER LEEREN PDF-FORMULARE

### B1 · Strukturelle Konsistenz

✅ **GUT:**
- Kopfzeile, Auftraggeber, Prüfer, Datum konsistent über alle 3 Seiten  
- Messwerttabelle räumig gelayoutet  
- Unterschriftsplatz vorhanden

⚠️ **EIGENARTIG:**
- Kopfzeile Messwerttabelle erwähnt „Nuten Netzmessung L-L" – sollte präzise sein  
- Sicherheitsbeleuchtung, Brandabschottung fehlen in der Besichtigungsliste

---

### B2 · Grenzwertangaben im Leerformular

**In der App-PDF richtig:**
- R_PE mit „max. 0,4 Ω / 0,2 Ω" (nach Leitungslänge)  
- R_PA mit „max. 1,0 Ω"  
- I_Δn mit Prüfstromfaktor  
- Isolationswiderstand mit Prüfspannungswahl (250/500/1000 V)

**Aber fehlend:**
- Z_L-N (weil Feld nicht existiert)  
- Auswahl U_L = 25 V oder 50 V (hart 50 V codiert)

---

## TEIL C: MÄNGEL-SUMMARY FÜR QUICK-FIXES

| Lfd. | Fehler | Typ | Schwere | Fix-Aufwand |
|---|---|---|---|---|
| C1 | Z_L-N + I_K2 fehlt ganz | Fachlich | 🔴 KRITISCH | 30 Min |
| C2 | U_L nur 50 V, kein 25 V | Fachlich | 🔴 KRITISCH | 20 Min |
| C3 | Netzsystem wird nicht ausgewertet | Fachlich | 🟡 HOCH | 45 Min |
| C4 | Z_S wird nicht bewertet | Fachlich | 🟡 MITTEL | 25 Min |
| C5 | „Nuten Netzmessung L-L" Tippfehler | Form | 🟢 MINOR | 2 Min |
| C6 | Steckdose nur global, nicht pro Kreis | Fachlich | 🟡 MITTEL | 40 Min |
| C7 | PA nur 1 Punkt, nicht 12 | Fachlich | 🟡 MITTEL | 60 Min |
| C8 | Sicherheitsbeleuchtung fehlt | Fachlich | 🟡 MITTEL | 15 Min |
| C9 | Brandabschottung fehlt in Besichtigung | Fachlich | 🟡 MITTEL | 10 Min |

---

## TEIL D: FAZIT ZU DEN FORMULAREN

**App-Version 4.3.0:**
- ✅ Formelsatz (Ω, Δ, ≤) korrekt  
- ✅ PDF-Export funktioniert  
- ❌ Aber: Messgrößen unvollständig (Z_L-N, I_K2)  
- ❌ Grenzwerte für Bühne falsch (50 V statt wählbar 25/50)  
- ⚠️ Netzsystem-Logik fehlt

**Leere Formulare (Vorlage):**
- ✅ Layout sauber  
- ❌ Tippfehler in Spaltenüberschrift  
- ⚠️ Nicht alle PA-Messpunkte vorhanden

---

