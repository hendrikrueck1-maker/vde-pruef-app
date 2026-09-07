# VDE-Prüfprotokoll-App — Umfassender Testprompt v7.0
**Ziel:** Vollständige Funktionsprüfung auf allen Geräten (Laptop, Tablet, Smartphone) mit mehreren Testszenarien, Benutzertypen und Fehlersuche.

---

## 🎯 TESTUMGEBUNG & GERÄTE

### Geräte & Viewport-Größen
1. **Laptop** (Desktop): 1920×1080, 1366×768, 1024×768
2. **Tablet** (iPad-Format): 768×1024 (Hochformat), 1024×768 (Querformat)
3. **Smartphone** (mobil): 390×844 (iPhone), 412×915 (Android), 375×667 (iPhone SE)

### Browser
- Chrome (neueste Version)
- Firefox (neueste Version)
- Safari (bei Verfügbarkeit)

### Netzwerk-Szenarien
- Online (normale Verbindung)
- Offline (Service Worker-Test)
- Langsames Netzwerk (3G-Simulation)
- Sporadische Verbindungsverluste

---

## 👥 TESTBENUTZER-PROFILE

Erstelle für jeden Benutzertyp separate Test-Durchläufe:

### Benutzer 1: Erfahrener Elektriker (Fachkraft)
- **Profil:** Kennt die App, VDE 0100/0105 im Schlaf, routiniert
- **Verhalten:** Schnelle Navigation, Tastaturkürzel, wenig Fehler
- **Fokus:** Workflow-Effizienz, Springen zwischen Formularen, Fehlerbehandlung bei Dateneingaben

### Benutzer 2: Auszubildender / Junior
- **Profil:** Erste Berührung mit App, VDE-Kenntnisse begrenzt, vorsichtig
- **Verhalten:** Liest Anleitungen, Finger auf Touchscreen, versucht alle Hilfetexte zu lesen
- **Fokus:** Verständlichkeit, Fehlertoleranz, Hinweistexte, Benutzerführung

### Benutzer 3: Auditor / Kontrollor
- **Profil:** Prüft Protokolle nach Konformität, detailorientiert, kritisch
- **Verhalten:** Prüft PDF-Ausgaben genau, vergleicht mit Vorlagen, sucht Mängel
- **Fokus:** PDF-Korrektheit, Datenintegrität, Compliance

### Benutzer 4: Techniker mit Zeitmangel
- **Profil:** Muss schnell fertig werden, nutzt Schnelleingabe
- **Verhalten:** Shortcuts, Autofill, Batch-Operationen, ungenaue Eingaben möglich
- **Fokus:** Automation, Fehlerkorrektur unter Druck

---

## ✅ FUNKTIONEN ZUM TESTEN

### A. STAMMDATEN-SEKTION
- [ ] Firmenname eintragen & speichern
- [ ] Auftraggeber auswählen/eingeben (Dropdown vs. freier Text)
- [ ] Anlage auswählen/neu anlegen
- [ ] Prüfart wählen (Neuanlage / Wiederholungsprüfung)
- [ ] Prüfdatum setzen (Kalender, manuell, Heute-Button)
- [ ] Prüfer eingeben (Dropdown mit Vorschlägen?)
- [ ] Alle Felder leeren & neu ausfüllen (Zurücksetzen)
- [ ] Plausibilitätsprüfung: Prüfdatum in Zukunft? (Warnung)
- [ ] Lange Namen (>100 Zeichen) korrekt darstellen

### B. STROMKREIS-MESSWERTE (VDE 0100)
**Für jeden Stromkreis:**
- [ ] Stromkreis hinzufügen / löschen
- [ ] Beschreibung eingeben (Küche, Heizung, etc.)
- [ ] Schutzart wählen (B, C, D)
- [ ] Messungen eintragen:
  - [ ] U_v (Netzspannung)
  - [ ] U_L (Schutzleiter-Spannungsfall)
  - [ ] U_F (RCD-Auslösespannung / ΔT-Messung)
  - [ ] I_Δn (RCD-Nennstrom)
  - [ ] t_Δn (RCD-Auslösezeit)
- [ ] Grenzwertprüfungen funktionieren:
  - [ ] Rote Markierung bei Überschreitung
  - [ ] Grüne Markierung bei Bestätigung
  - [ ] Gelbe Warnung bei marginal OK
- [ ] Messwerte mit Dezimalzahlen (z. B. 230,5 V)
- [ ] Messwerte mit Negation (z. B. -50 mV, falls relevant)
- [ ] Messwerte mit Sonderzeichen (z. B. `∞` für Durchgang)
- [ ] Null-Werte eingeben (0 A, 0 ms)
- [ ] Feld-Fokus & Tab-Navigation korrekt
- [ ] Feldvalidierung: Nur Zahlen erlaubt (keine Buchstaben)?
- [ ] Maximale Feldlänge beachtet (z. B. 5 Stellen)?

### C. GERÄTEPRÜFUNG
**Für jedes Geräte:**
- [ ] Gerät hinzufügen / löschen
- [ ] Gerätetyp wählen (Bohrmaschine, Staubsauger, etc.)
- [ ] Serien-/Inventarnummer eintragen
- [ ] Sichtprüfung: Kabel, Stecker, Isolationen markieren
- [ ] Isolationsprüfung (kΩ) eintragen
- [ ] Berührungsprüfung durchführen (Messwert + Grenzwert)
- [ ] n.i.O. markieren & Freigabe setzen
- [ ] Foto-Dokumentation (falls geplant)

### D. ANSCHLUSSPRÜFUNG (VDE 0105)
- [ ] Anschlussart wählen (TN-S, TN-C-S, TT, IT)
- [ ] Messungen durchführen:
  - [ ] R_L (Schleifenimpedanz)
  - [ ] U_e (Berührungsspannung)
  - [ ] U_Ll (Spannungsfall)
- [ ] Grenzwerte korrekt prüfen
- [ ] Sicherheitsschalter (RCD) testen
- [ ] Auslösezeiten dokumentieren

### E. KARUSSELL / RESPONSIVE-DESIGN
**Auf jedem Gerätetyp:**
- [ ] Stromkreis-Karussell (Swipen, Pfeile, automatisches Scrollen)
- [ ] Pfeile auf Smartphone verschwinden (Media Query 767px)
- [ ] Pfeile auf Laptop sichtbar bleiben
- [ ] Karte nutzt volle Breite auf Tablet
- [ ] Keine Überlappungen von Elementen
- [ ] Schrift-Größen lesbar (nicht zu klein/groß)
- [ ] Touch-Bereiche mindestens 44×44px (mobile Standard)
- [ ] Bilder/Icons skalieren korrekt
- [ ] Orientierungswechsel (Hochformat ↔ Querformat): Layout passt sich an

### F. BEISPIELDATENSÄTZE (NEUE FEATURE)
**Testen aller 3 Szenarien:**
1. **Dropdown "Ohne Mängel"**
   - [ ] Befüllt Stammdaten korrekt (Auftraggeber + Anlage mit "TESTDATEN"-Präfix)
   - [ ] Stromkreise grün (alle Messwerte im OK-Bereich)
   - [ ] PDF-Ampel zeigt **GRÜN**
   - [ ] Wasserzeichen "BEISPIELDATEN – KEIN ECHTES PROTOKOLL" rot/diagonal auf jeder Seite
   - [ ] Bemerkungsfeld zeigt Testdaten-Warnung

2. **Dropdown "Mit Mängeln"**
   - [ ] Mindestens ein Stromkreis rot markiert (Grenzwert überschritten)
   - [ ] Mängel-Status korrekt gespeichert
   - [ ] PDF-Ampel zeigt **ROT**
   - [ ] Wasserzeichen aktiv
   - [ ] Hinweis im PDF: "Sicherer Gebrauch: NEIN"

3. **Dropdown "1 Stromkreis defekt"**
   - [ ] Genau ein Stromkreis als freigeschaltet markiert (n.i.O.)
   - [ ] Übrige Anlage grün
   - [ ] PDF-Ampel zeigt **GELB** (neue Feature!)
   - [ ] Gelber Hinweistext erklärt den Status
   - [ ] Widerspruchsprüfung (`freigabeWidersprichtBefund`) nicht ausgelöst
   - [ ] Mängel-Status: "Keine Mängel festgestellt" (weil nur einzelner Stromkreis betroffen)

### G. PDF-EXPORT & AMPEL-LOGIK
**Für alle 3 Beispiel-Szenarien + manuell befüllte Fälle:**
- [ ] PDF wird generiert ohne Fehler
- [ ] Ampel-Farblogik:
  - Grün: Alle Messwerte OK, keine Mängel
  - Gelb: Genau ein Stromkreis/Gerät n.i.O., Rest sicher
  - Rot: Mängel, unsicherer Gebrauch
- [ ] Farbwerte pixel-exakt (RGB-Prüfung)
- [ ] Ampel-Symbol deutlich sichtbar
- [ ] Wasserzeichen auf allen Seiten
- [ ] Seitennummern korrekt
- [ ] Tabellen vollständig (nicht abgeschnitten)
- [ ] Schriften lesbar (keine Verschmierung)

### H. FORMULAR-VERGLEICH (PDF vs. Leerformular)
**Leere PDF-Formulare mit App ausfüllen vergleichen:**
1. **Lade drei PDF-Leerformulare herunter** (z. B. von VDE-Website oder deinem Archiv)
2. **Fülle sie manuell mit Testwerten** (und fotografiere/scanne)
3. **Fülle die App mit den gleichen Werten**
4. **Generiere PDF aus App**
5. **Vergleiche beide PDFs:**
   - [ ] Gleiche Felder vorhanden?
   - [ ] Gleiche Feldpositionen?
   - [ ] Schriftgrößen vergleichbar?
   - [ ] Alle Messwerte sichtbar?
   - [ ] Grenzwert-Vergleiche korrekt?
   - [ ] Layout nicht verschoben?
   - [ ] Farbig markierte Zellen wie erwartet?

---

## 🔄 TEST-SZENARIEN

### Szenario 1: Vollständiger Workflow (Happy Path)
1. App laden (alle Browser, alle Geräte)
2. Stammdaten eingeben (vollständig, ohne Fehler)
3. Stromkreis 1 messen & eintragen
4. Stromkreis 2-4 hinzufügen & messen
5. Geräte prüfen (3-5 Geräte)
6. Anschlussprüfung durchführen
7. PDF exportieren
8. Dokument speichern/drucken

### Szenario 2: Fehlerhafte Eingaben (Error Handling)
1. Ungültige Werte eingeben (Text statt Zahl, negative Spannungen)
2. Pflichtfelder leer lassen
3. Widersprüchliche Daten (Mängel + sicherer Gebrauch)
4. Zu lange Text-Eingaben (>200 Zeichen)
5. Spezialzeichen eingeben (ä, ö, ü, €, §)
6. Copy-Paste von Werten aus Excel
7. Doppelte Geräte-IDs

### Szenario 3: Datenverwaltung
1. Neue Prüfung starten → Alle Felder leeren
2. Prüfung speichern (LocalStorage)
3. App schließen & wieder öffnen → Daten vorhanden?
4. Daten löschen & bestätigen
5. Archivierte Prüfungen auflisten
6. Alte Prüfung exportieren & neu laden

### Szenario 4: Offline-Modus
1. App online laden & alle Assets cachen lassen (Service Worker)
2. Netzwerk trennen
3. App neu laden → funktioniert ohne Netzwerk?
4. Daten eingeben (offline)
5. PDF generieren (offline)
6. Netzwerk wieder verbinden
7. Daten synchronisieren (falls Feature vorhanden)

### Szenario 5: Mehrbenutzer-Szenario
1. Verschiedene Benutzer-Profile einrichten (falls Feature)
2. Benutzer A: Prüfung starten & speichern
3. Benutzer B: Ansicht/Bearbeitung testen (Berechtigungen?)
4. Rollback-Test (Benutzer A ändert, Benutzer B sieht Update?)

### Szenario 6: Performance & Datenlast
1. 10 Stromkreise + 20 Geräte + vollständige Messwerte
2. App-Reaktion prüfen (Lag, Freezes?)
3. PDF-Generierung bei großer Datenmenge
4. LocalStorage-Limits testen (zu viele Prüfungen?)

---

## 🐛 FEHLERSUCHE (BUG-HUNTING)

### Funktionale Fehler
- [ ] Messwerte verschwinden beim Tab-Wechsel
- [ ] Grenzwert-Farben nicht aktualisiert nach Eingabe
- [ ] Stromkreis löschen bearbeitet falsche ID
- [ ] PDF enthält Daten von vorheriger Prüfung
- [ ] LocalStorage wird nicht geleert beim Reset
- [ ] Dropdown-Optionen unvollständig/falsch sortiert
- [ ] Berechnung von Grenzwerten falsch (z. B. Schleifenimpedanz)

### Grafische Fehler
- [ ] Buttons/Input-Felder überlagern sich
- [ ] Text-Overflow in Tabellen
- [ ] Icons nicht sichtbar (fehlende Dateien, Offline-Cache)
- [ ] Farbkontrast zu niedrig (A11y-Problem)
- [ ] Font-Größen inkonsistent
- [ ] Ausrichtung von Elementen verschoben (Querformat)
- [ ] Margin/Padding fehlerhaft
- [ ] Scrollbars verbergen Inhalte

### UX-Fehler
- [ ] Keine Bestätigungsmeldung beim Löschen
- [ ] Zu lang ladende Seiten
- [ ] Fehlermeldungen unklar oder fehlend
- [ ] Tastatur-Navigation springt über Felder
- [ ] Enter-Taste funktioniert nicht in Formular
- [ ] Undo/Redo nicht vorhanden
- [ ] Hilfetexte zu klein/unleserlich

### Performance-Fehler
- [ ] PDF-Generierung dauert >3 Sekunden
- [ ] Seitenladung >2 Sekunden
- [ ] Memory-Leak (App wird immer langsamer)
- [ ] Battery-Drain bei längerer Nutzung

### Browser-Kompatibilität
- [ ] Safari: PDF-Download funktioniert nicht
- [ ] Firefox: Keyboard-Layout vertauscht
- [ ] Chrome: Service Worker wird nicht registriert
- [ ] IE11: App startet nicht (falls unterstützen)

---

## 📋 TEST-CHECKLISTE: LEERFORMULAR vs. APP-PDF

Für jede der **3 Prüfarten** (VDE 0100, Anschlussprüfung, Geräteprüfung):

| Punkt | Leerformular | App-PDF | Match? | Notizen |
|-------|--------------|---------|--------|---------|
| Firmenname-Feld | Position oben links | | ☐ | |
| Auftraggeber-Feld | Position oben rechts | | ☐ | |
| Anlage-ID | Mittig oben | | ☐ | |
| Prüfdatum-Feld | Unten links | | ☐ | |
| Stromkreis-Tabelle | Format 5 Spalten | | ☐ | |
| Messwert U_v | Spalte 2, Zeile N | | ☐ | |
| Grenzwert (rot) | RGB(255,0,0) | | ☐ | |
| Grenzwert (grün) | RGB(0,128,0) | | ☐ | |
| Ampel (oben/unten) | Größe, Farbe | | ☐ | |
| Unterschrift-Feld | Am Ende, 3cm | | ☐ | |
| Wasserzeichen | Position, Opazität | | ☐ | |
| Seitenzahl | Format "Seite X von Y" | | ☐ | |

---

## 🔍 AUDIO-VISUELLER TEST (A11y)

- [ ] Farbblindheit: Alle Informationen auch ohne Farbe erkennbar?
- [ ] Kontrast-Verhältnis ≥ 4.5:1 (WCAG AA)
- [ ] Font-Größe mindestens 12px
- [ ] Hover/Focus-States deutlich erkennbar
- [ ] Screenreader: Alle Felder lesbar?
- [ ] Keyboard-Navigation vollständig möglich
- [ ] Keine Blinkeleffekte >3Hz
- [ ] Alt-Texte für Bilder vorhanden

---

## 📊 ERGEBNIS-PROTOKOLL

Nach jedem Test-Durchlauf ausfüllen:

**Test-Session:**
- Datum: ____________
- Tester: ____________ (Benutzer-Profil)
- Gerät: ____________ (Laptop/Tablet/Smartphone)
- Browser: ____________ (Chrome/Firefox/Safari)
- Viewport: ____________ (z. B. 390×844)
- Netzwerk: ____________ (Online/Offline/3G)

**Ergebnisse:**
- ☐ Alle Funktionen erfolgreich
- ☐ Wenige Fehler (< 5)
- ☐ Mittlere Fehler (5–15)
- ☐ Kritische Fehler (> 15)

**Bugs gefunden:**
1. [Priorität HIGH/MEDIUM/LOW] - Beschreibung
2. [Priorität] - Beschreibung

**Grafische Probleme:**
1. [Ort: Smartphone/Tablet/Laptop] - Beschreibung
2. [Ort] - Beschreibung

**Verbesserungen beobachtet:**
- Feature XYZ benötigt mehr Anleitung
- Button YZ ist zu klein zum Tippen
- PDF-Layout auf Tablet verschoben

---

## 🎯 10 VERBESSERUNGSVORSCHLÄGE (zur Erweiterung)

Nach Abschluss aller Tests einen Bericht mit **10 konkreten Verbesserungsvorschlägen** erstellen:

### Vorlage für jeden Vorschlag:
**#N: [Titel]**
- **Problem:** Was ist das aktuelle Verhalten?
- **Lösung:** Was könnte verbessert werden?
- **Nutzen:** Welcher Vorteil für Benutzer?
- **Aufwand:** Niedrig / Mittel / Hoch
- **Priorität:** Muss / Sollte / Könnte
- **Beispiel:** Kurzes Szenario

### Beispiel-Kategorien für Vorschläge:
1. **Automatisierung** - Intelligente Vorausfüllung, Auto-Speicherung
2. **Datenimport** - Excel-Import, CSV-Vorlage
3. **Zusammenarbeit** - Mehrbenutzer-Sync, Cloud-Speicher
4. **Mobile-First** - Responsive-Verbesserungen, Touch-Optimierung
5. **Offline** - Bessere Offline-Features, Sync-Status
6. **Archivierung** - Volltext-Suche, Filter, Export-Formate
7. **Integrationen** - Outlook/Google Calendar-Sync, Email-Versand
8. **Dokumentation** - Video-Tutorials, Inline-Hilfe, Glossar
9. **Performance** - Caching, Lazy Loading, Kompression
10. **Sicherheit** - Verschlüsselung, Authentifizierung, Audit-Log

---

## 📝 FINAL-REPORT TEMPLATE

```markdown
# VDE-App Test Report v7.0 — FINAL

**Testdauer:** 
**Tester:** 
**Testzeitraum:** 

## Executive Summary
[Kurze Zusammenfassung: Funktioniert die App produktionsreif? Ja/Nein/Mit Einschränkungen]

## Test-Coverage
- [x] Stammdaten-Sektion: 95%
- [x] Stromkreis-Messwerte: 90%
- [x] Geräteprüfung: 85%
- ...

## Kritische Fehler (BLOCKER)
[Bugs, die App unstabil machen]

## Wichtige Fehler (HIGH)
[Bugs, die Funktionalität beeinträchtigen]

## Mittlere Fehler (MEDIUM)
[Bugs, die UX verschlechtern]

## Kleine Fehler (LOW)
[Kosmetische Probleme]

## 10 Verbesserungsvorschläge
1. ...
2. ...
(s. Detailbericht unten)

## Grafische Erkenntnisse
[Responsive Design, Farbkontrast, Icons, etc.]

## Empfehlungen
- [ ] Version 7.0.0 produktionsreif
- [ ] Weitere Tests notwendig
- [ ] Fixes erforderlich vor Release
```

---

## 🚀 DURCHFÜHRUNGS-TIPPS

1. **Parallel testen:** Mehrere Geräte gleichzeitig, nicht sequenziell
2. **Video-Aufzeichnung:** Spielen Sie Testläufe auf, um Fehler zu reproduzieren
3. **Screenshots/GIFs:** Dokumentieren Sie grafische Fehler visuell
4. **Bug-Tracking:** Nutzen Sie ein System (GitHub Issues, Jira, Notion), um Fehler nachzuverfolgen
5. **Regression-Tests:** Nach jeder Fehlerbehebung neu testen
6. **Exploratory Testing:** Nicht nur der Plan — auch Intuition & Kreativität einsetzen
7. **Benutzer-Feedback:** Falls möglich, echte Elektriker testen lassen
8. **Automatisierung:** Playwright-Tests für wiederholbare Szenarien (z. B. PDF-Export)
9. **Checklisten-Häkchen:** Jeden Punkt abhaken, um Tracking zu vereinfachen
10. **Iterative Verbesserungen:** Nach jedem Bug-Fix Version erhöhen & Re-Testen

---

**Version:** 7.0 (2026-09-07)  
**Autor:** Claude (auf Basis deiner Anforderungen)  
**Lizenz:** Intern — Stadttheater Konstanz / VDE-Prüf-App-Projekt

