# VDE-App Test Kurzliste v7.0 — Quick Check

**Schnelle Checkliste zum Mitnehmen** (zum Ausdrucken oder auf Tablet)

---

## 🎯 Geräte & Browser testen

- [ ] **Laptop** (1920×1080, 1366×768)
  - [ ] Chrome
  - [ ] Firefox
- [ ] **Tablet** (768×1024, 1024×768)
  - [ ] Chrome
  - [ ] Safari
- [ ] **Smartphone** (390×844)
  - [ ] Chrome
  - [ ] Firefox

---

## 👥 4 Benutzer-Profile testen

1. **Erfahrener Elektriker** ☐
2. **Azubi / Junior** ☐
3. **Auditor / Kontrollor** ☐
4. **Techniker unter Zeitdruck** ☐

---

## ✅ KRITISCHE FUNKTIONEN

### A. Stammdaten
- [ ] Firmenname speichern
- [ ] Auftraggeber auswählen
- [ ] Anlage auswählen
- [ ] Prüfdatum (Kalender, manuell, Heute)
- [ ] Prüfer eingeben
- [ ] Alle Felder leeren (Reset)

### B. Stromkreis-Messwerte
- [ ] 4 Stromkreise hinzufügen
- [ ] Messwerte eingeben (U_v, U_L, U_F, I_Δn, t_Δn)
- [ ] Grenzwertprüfungen (rot/grün/gelb)
- [ ] Dezimalzahlen, negative Werte, Null
- [ ] Stromkreis löschen

### C. Geräteprüfung
- [ ] 5 Geräte hinzufügen
- [ ] Isolationsprüfung, Berührungsprüfung
- [ ] n.i.O. markieren & Freigabe
- [ ] Geräte löschen

### D. Anschlussprüfung
- [ ] Anschlussart wählen (TN-S, TN-C-S, TT, IT)
- [ ] Messungen (R_L, U_e, U_Ll)
- [ ] Grenzwerte prüfen

### E. Responsive Design
- [ ] Karussell auf Smartphone (Pfeile unsichtbar)
- [ ] Karussell auf Laptop (Pfeile sichtbar)
- [ ] Touch-Bereiche > 44×44px
- [ ] Hochformat ↔ Querformat (Orientierungswechsel)
- [ ] Keine Überlappungen, Text lesbar

### F. Beispieldatensätze (NEU!)
- [ ] **"Ohne Mängel"** → PDF-Ampel GRÜN ✓
- [ ] **"Mit Mängeln"** → PDF-Ampel ROT ✓
- [ ] **"1 Stromkreis defekt"** → PDF-Ampel GELB ✓ (neu!)
- [ ] Alle haben Testdaten-Wasserzeichen ✓
- [ ] Alle haben Präfix "TESTDATEN" ✓

### G. PDF-Export & Farben
- [ ] PDF ohne Fehler generiert
- [ ] Ampel-Farben korrekt (Grün/Gelb/Rot)
- [ ] Wasserzeichen auf allen Seiten
- [ ] Seitennummern korrekt
- [ ] Tabellen nicht abgeschnitten
- [ ] Schriften lesbar

### H. PDF vs. Leerformular
- [ ] Felder gleiche Position?
- [ ] Schriftgröße vergleichbar?
- [ ] Alle Messwerte sichtbar?
- [ ] Farben korrekt (rot/grün)?
- [ ] Layout nicht verschoben?

---

## 🔄 SCHNELL-SZENARIEN

### Szenario 1: Happy Path
1. Stammdaten → Stromkreise → Geräte → Anschluss → PDF ✓

### Szenario 2: Fehler-Handling
- [ ] Text statt Zahl eingeben → Fehler?
- [ ] Pflichtfelder leer → Warnung?
- [ ] Zu lange Text (>200 Zeichen) → Abgekürzt?
- [ ] Sonderzeichen (ä, ö, ü) → Korrekt?

### Szenario 3: Offline
- [ ] Online laden, Assets cachen
- [ ] Netzwerk trennen
- [ ] App laden → Funktioniert?
- [ ] Daten eingeben & PDF generieren (offline) → OK?

---

## 🐛 BUG-HUNTING QUICK-CHECKLIST

### Funktional
- [ ] Messwerte beim Tab-Wechsel weg?
- [ ] Grenzwert-Farben nicht aktualisiert?
- [ ] Stromkreis löschen → falsche ID?
- [ ] PDF enthält alte Daten?
- [ ] LocalStorage wird nicht geleert?

### Grafik
- [ ] Buttons überlagern sich?
- [ ] Text überläuft Tabellen?
- [ ] Icons fehlend?
- [ ] Kontrast zu niedrig?
- [ ] Schriften inkonsistent?
- [ ] Elemente in Querformat verschoben?

### UX
- [ ] Keine Bestätigungsmeldung beim Löschen?
- [ ] Seite zu lang zum Laden?
- [ ] Fehlermeldungen unklar?
- [ ] Tastatur-Navigation springt über Felder?
- [ ] Enter-Taste in Formular funktioniert nicht?

### Performance
- [ ] PDF-Generierung >3 Sekunden?
- [ ] Seitenladung >2 Sekunden?
- [ ] App wird immer langsamer (Memory-Leak)?

---

## 📊 ERGEBNIS PRO TEST-SESSION

**Datum:** ____________  
**Tester / Profil:** ____________  
**Gerät:** ____________  
**Browser:** ____________  
**Viewport:** ____________  

**Bugs gefunden:**
1. _________________ (Priorität: HIGH / MEDIUM / LOW)
2. _________________ (Priorität: ___)
3. _________________ (Priorität: ___)

**Grafische Fehler:**
1. _________________ (Ort: ___)
2. _________________ (Ort: ___)

**UX-Beobachtungen:**
- ___________________________
- ___________________________

**Insgesamt:**
- ☐ Alles OK
- ☐ < 5 Fehler (leicht)
- ☐ 5-15 Fehler (mittel)
- ☐ > 15 Fehler (kritisch)

---

## 🎯 10 VERBESSERUNGSVORSCHLÄGE (Vorlage)

Nach allen Tests: 10 konkrete Verbesserungen sammeln

**#1: [Titel]**
- Problem: ___________
- Lösung: ___________
- Aufwand: Niedrig / Mittel / Hoch
- Priorität: Muss / Sollte / Könnte

**#2–#10:** (gleich ausfüllen)

---

**Tipp:** PDF-Version dieser Liste zum Ausdrucken oder auf Tablet als Notiz-App verwenden!

