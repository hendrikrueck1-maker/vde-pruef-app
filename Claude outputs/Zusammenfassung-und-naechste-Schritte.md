# VDE-Prüf-App – Zusammenfassung: Fehlerbehebungen & Verbesserungsvorschläge

Stand: 06.09.2026 · Basis: Vollprüfungsbericht v6.1.0 + Mockup „Infokarten & Fluke-Anleitung"

Diese Zusammenfassung fasst zusammen, was tatsächlich umgesetzt werden soll. Zwei Punkte sind bewusst herausgenommen: die Erzwingung der Unterschrift vor PDF-Erstellung (Befund #2 im Prüfbericht) und die schematischen Drehschalter-Positions-Diagramme aus dem Mockup. Beides wird unten kurz benannt, aber nicht als offene Aufgabe geführt.

---

## 1. Fehlerbehebungen aus dem Vollprüfungsbericht v6.1.0

| # | Befund | Schwere | Kurzbeschreibung | Aufwand |
|---|--------|---------|-------------------|---------|
| 1 | Geräteprüfung: Sichtprüfung/Funktion technisch auf „i.O." vorbelegt | 🔴 Kritisch | Bei `geraetepruefung.html` fehlt die leere Standardoption bei „Sichtprüfung"/„Funktion" – der Browser wählt automatisch „i.O." aus, auch wenn nie geprüft wurde. Die PDF-Erzeugung lässt sich dadurch mit unbestätigten Prüfungen abschließen. | Leicht–mittel |
| 2 | ~~Kein Formular erzwingt eine Unterschrift vor PDF-Erzeugung~~ | 🟠 Hoch | **Nicht umsetzen** – Hendrik möchte die Unterschrift nicht erzwingen. | – |
| 3 | Statisches Branding „Stadttheater Konstanz Prüfsystem" im App-Rahmen | 🟠 Hoch | Der Startseiten-Untertitel ist fest codiert statt konfigurierbar. Rein kosmetisch, kein Datenrisiko (Text erscheint in keinem PDF). | Leicht |
| 4 | `?entwurf=`-URL-Parameter akzeptiert beliebige, nicht-existierende IDs ohne Rückmeldung | 🟡 Mittel | Ein kaputter/veralteter Link öffnet stillschweigend ein leeres Formular statt einer Fehlermeldung „Entwurf nicht gefunden". Kein Sicherheitsproblem, nur UX. | Leicht |
| 5 | `archivStatus()` wertet fehlende Freigabeangabe optimistisch | 🟡 Mittel | Ein unvollständiger Archiveintrag kann als „i. O." (grün) angezeigt werden, weil auf `frei !== 'Nein'` statt `frei === 'Ja'` geprüft wird. Betrifft nur die Archiv-Übersicht, nicht das PDF selbst. | Leicht |
| 6 | `riso_mode` wird bei „Erneut prüfen (Vorlage)" nicht übernommen | 🟡 Mittel | Die gewählte Prüfspannung (500 V / 250 V SELV-PELV / 1000 V) fehlt in der Übernahme-Liste beim Anlegen einer Vorlage aus dem Archiv – muss jedes Mal neu gewählt werden. Optionale Komfortverbesserung. | Leicht |
| 7 | Keine übergreifende Fehlerbehandlung um die PDF-Zeichenlogik | 🟢 Niedrig | Kein Crash im Test provozierbar, aber `generatePDFInner()` in allen drei Generatoren hat keinen globalen `try/catch` für unerwartete jsPDF-Fehler. | Mittel |
| 8 | `ENTWURF_DATEI[e.praefix] \|\| '#'`-Fallback weiterhin im Code | 🟢 Niedrig | Technisch vorhanden, praktisch nicht erreichbar. Rein optionale Bereinigung. | Trivial |
| 9 | „Netzform vs. Einspeiseart"-Widerspruchsprüfung nicht auffindbar | – | Konnte im aktuellen Code nicht verifiziert werden (kein Fund, kein bestätigter Fehler) – als offener Punkt vermerkt, nicht als Befund gewertet. | – |

Die vollständigen Details (Fundstellen, Reproduktionsschritte, Screenshots/PDF-Nachweise) stehen im Bericht `VDE-App-6.1.0-Vollpruefung-Bericht.md`. Alle Befunde außer #2 (Unterschriftspflicht) gelten als zu beheben; #2 ist explizit **kein** Umsetzungsziel.

**Empfohlene Reihenfolge:** zuerst Befund #1 (einzige echte Fehlfunktion mit Datenrisiko), danach #3–#6 (leicht, kosmetisch/UX), zuletzt #7–#8 (Robustheit, optional).

---

## 2. Neue Inhalte pro Prüfkarte (Icons, Infotexte, Fluke-Anleitung)

Für jede der 5 Prüfgrößen (RCD zählt mit zwei Icons) soll die Prüfkarte künftig enthalten:

- ein rundes Icon (40×40px, echtes Foto der Drehschalter-Position) mit kurzem Label direkt darunter (Z_S, R_ISO, R_PE, U_L, ΔT, I_ΔN)
- eine ausklappbare Infokarte „Was wird hier geprüft und warum?"
- eine ausklappbare Anleitung „So geht's mit dem Fluke 1663"

**Ausdrücklich nicht enthalten:** die schematischen Drehschalter-Kreisdiagramme mit Drehrichtungspfeil (SVG-Zeichnungen). Nur die echten Foto-Icons werden verwendet.

### 2.1 Z_S / I_K – Schleifenimpedanz / Kurzschlussstrom
- **Icon:** `Z_S_Schleifenimpedanz-Kurzschlussstrom.png`
- **Was wird geprüft:** Die Schleifenimpedanz Z_S der Fehlerschleife wird gemessen, um zu bestätigen, dass im Fehlerfall der Überstromschutz (Sicherung/LS-Schalter) schnell genug auslöst. Aus Z_S wird der zu erwartende Kurzschlussstrom I_K berechnet.
- **Warum wichtig:** Ist die Schleifenimpedanz zu hoch, löst die Sicherung im Fehlerfall nicht rechtzeitig aus – Personen- und Brandschutz sind nicht mehr sichergestellt (DIN VDE 0100-410).
- **Fluke 1663 – Kurzanleitung:**
  1. Drehschalter auf Position „Z LOOP" bzw. „LOOP" stellen
  2. Messleitungen gemäß Fluke-Anleitung an L/N/PE bzw. Steckdose anschließen
  3. Messung starten, Wert ablesen
  4. Bei Bedarf: Messung mit „No-Trip"-Funktion wiederholen, falls RCD vorgeschaltet ist

### 2.2 RCD-Prüfung (ΔT / I_ΔN)
- **Icons:** `RCD_Ausloesezeit_deltaT.png` (ΔT) + `RCD_Ausloesestrom_I_deltaN.png` (I_ΔN), nebeneinander
- **Was wird geprüft:** Auslösezeit (ΔT) und Auslösestrom (I_ΔN) des Fehlerstrom-Schutzschalters (RCD/FI) werden gemessen.
- **Warum wichtig:** Ein RCD muss innerhalb der Normvorgaben (typisch < 300 ms bei 1×I_ΔN, siehe DIN VDE 0100-410) zuverlässig auslösen, um Personen vor gefährlichem Berührungsstrom zu schützen.
- **Fluke 1663 – Kurzanleitung:**
  1. Drehschalter auf „RCD" bzw. „ΔT/I_ΔN" stellen
  2. Auslösestrom-Stufe (z. B. ×½, ×1, ×5) und Polarität einstellen
  3. Messung starten – Gerät löst den RCD testweise aus
  4. Auslösezeit und -strom ablesen und dokumentieren

### 2.3 R_ISO – Isolationswiderstand
- **Icon:** `R_ISO_Isolationswiderstand.png`
- **Was wird geprüft:** Der Isolationswiderstand zwischen aktiven Leitern und Erde/Schutzleiter wird gemessen.
- **Warum wichtig:** Ein zu niedriger Isolationswiderstand deutet auf beschädigte Isolierung hin – Risiko für Stromschlag und Kurzschluss.
- **Fluke 1663 – Kurzanleitung:**
  1. Anlage/Stromkreis spannungsfrei schalten (Voraussetzung!)
  2. Drehschalter auf „R ISO" stellen, Prüfspannung wählen (z. B. 500 V)
  3. Messleitungen anschließen, Messung starten
  4. Wert ablesen; Anlage erst nach Messende wieder unter Spannung setzen

### 2.4 R_PE – Schutzleiterwiderstand
- **Icon:** `R_PE_Schutzleiterwiderstand.png`
- **Was wird geprüft:** Der Widerstand des Schutzleiters (PE) wird gemessen.
- **Warum wichtig:** Ein zu hoher Schutzleiterwiderstand verhindert im Fehlerfall den sicheren Potentialausgleich – Berührungsspannung kann gefährlich hoch werden.
- **Fluke 1663 – Kurzanleitung:**
  1. Drehschalter auf „R LOW Ω" stellen
  2. Messleitungen an PE-Anschluss und Referenzpunkt anschließen
  3. Ggf. Nullabgleich der Messleitungen durchführen
  4. Messung starten, Wert ablesen

### 2.5 U_L / Netzspannung (Berührungsspannung)
- **Icon:** `U_L_Netzspannung.png`
- **Was wird geprüft:** Die anliegende Netzspannung bzw. die Berührungsspannung U_L wird gemessen.
- **Warum wichtig:** Bestätigt korrekte Spannungsverhältnisse und dient als Referenzwert für weitere Berechnungen (z. B. zulässige Schleifenimpedanz).
- **Fluke 1663 – Kurzanleitung:**
  1. Drehschalter auf „V" stellen
  2. Messleitungen anschließen
  3. Spannungswert ablesen und dokumentieren

---

## 3. Nicht umzusetzende Punkte (bewusst gestrichen)

- **Unterschriftspflicht vor PDF-Erstellung** (Bug-Report Befund #2): bleibt wie bisher – keine technische Sperre.
- **Schematische Drehschalter-Positions-Diagramme** (SVG-Kreisdiagramme mit Drehrichtungspfeil aus dem Mockup): entfallen vollständig. Es werden ausschließlich die Foto-Icons mit Kurzlabel verwendet.

---

## 4. Neue Funktionswünsche (noch nicht entworfen – siehe Korrektur-Prompt)

1. **Globaler Ein/Aus-Schalter auf der Hauptseite** für Infokarten UND Fluke-1663-Anleitung (statt nur lokal je Karte auf-/zuklappbar)
2. **Stromkreise als horizontales Karussell** statt untereinander gelisteter Einträge – Wischen/Blättern nach links/rechts für bessere Übersicht
3. **Statusleiste überarbeiten:** Prüfprotokollnummer entfernen (Platz schaffen); stattdessen anzeigen, in welchem Abschnitt des Prüfprotokolls man sich gerade befindet (nicht nur „Stromkreis X von Y", sondern auch die Position vor/nach den Stromkreisen im Gesamtablauf)

Alle drei Punkte sind im beiliegenden Korrektur-Prompt detailliert beschrieben.

---

## 5. Gelieferte Dateien

- `VDE-App_Drehschalter-Icons.zip` – 6 Icons (Z_S, R_ISO, R_PE, U_L, ΔT, I_ΔN) + 2 unbenutzte Reserve-Icons (Phase, R_E) + README
- `VDE-App-6.1.0-Vollpruefung-Bericht.md` – vollständiger Prüfbericht (bereits vorhanden)
- Diese Zusammenfassung
- Korrektur-Prompt für die nächste Umsetzungssession
