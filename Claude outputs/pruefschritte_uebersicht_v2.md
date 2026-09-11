# Abgleich: Neue Anordnung (Hendrik) vs. aktueller Code (7.4.0)

Grundlage: dein hochgeladenes PDF mit der neuen Anordnung, abgeglichen Feld für Feld gegen den echten 7.4.0-Code. Ergebnis der Rückfragen ist eingearbeitet. Am Ende steht eine bereinigte Zieltabelle.

## Befunde aus dem Abgleich

### 1. Besichtigen: Anlagenprüfung und Anschlussprüfung vereinheitlicht (bestätigt, Absicht)

Du hast bestätigt: beide Protokolle bekommen künftig **dieselben 11 Punkte**:

Betriebsmittel, Kabel & Leitungen, Zugänglichkeit, Schaltgeräte, Kennzeichnung, Zusätzlicher Potenzialausgleich, Berührungsschutz, Typenschild, Steckvorrichtungen/Kupplungen, Leiterverbindungen, Witterungsschutz (falls außen).

**Das bedeutet konkret für die Umsetzung:**
- Bei der **Anlagenprüfung** (`vde0100.html`) fallen 4 der bisherigen 12 Punkte weg: *Doku/Warnung*, *Basisschutz*, *Brandabschottung*, *Gebäudesystemtechnik*. Neu dazu kommen (aus der bisherigen Anschlussprüfung übernommen): *Steckvorrichtungen/Kupplungen*, *Witterungsschutz (falls außen)*. *Berührungsschutz* gab es in der Anlagenprüfung bisher nicht als eigenen Punkt (dort hieß es u.U. anders/gar nicht) – ist jetzt neu.
- Bei der **Anschlussprüfung** (`anschlusspruefung.html`) wächst die Liste von bisher 6 auf 11 Punkte: neu dazu kommen *Zugänglichkeit*, *Schaltgeräte*, *Kennzeichnung* (vorher hieß es dort "Kennzeichnung/Beschriftung" – prüfen ob 1:1 gleich gemeint), *Zusätzlicher Potenzialausgleich*, *Typenschild*, *Leiterverbindungen*.
- Nummerierung in beiden Formularen UND in beiden PDF-Generatoren (`js/pdf-generator.js`, `js/anschluss-generator.js`) muss synchron angepasst werden.

⚠️ **Ein Punkt zur Prüfung, bevor das umgesetzt wird:** "Zugänglichkeit" und "Gebäudesystemtechnik" bei der Anlagenprüfung sind fachlich mit Blick auf Fluchtwege/Sicherheitstechnik im Theaterbetrieb nicht unwichtig – da du selbst an Rettungswegeplänen arbeitest, lohnt sich ein zweiter Blick, ob "Gebäudesystemtechnik" wirklich ersatzlos raus soll, oder ob es (wie bei Punkt 3 der 7.4.0-Anschlussprüfung) eher in einem anderen Feld/Kommentar weiterleben sollte. Reine Rückfrage, keine Blockade – deine Entscheidung steht und wird so übernommen.

### 2. Geräteprüfung "2. Erproben" – Kopierfehler (bestätigt, wird korrigiert)

In deiner Tabelle standen unter "2. Erproben" die Messwerte R_PE/R_ISO/Ableitstrom – die gehören im Code zu "3. Messen". "2. Erproben" ist im Code ausschließlich die Funktionsprüfung (i.O./n.i.O.). Du hast bestätigt: das war ein Fehler beim Tabellebauen. **In der Zieltabelle unten wieder korrekt getrennt.** Keine Code-Änderung nötig – die Geräteprüfung im Code ist bereits richtig strukturiert.

### 3. Erdung/Potenzialausgleich bei der Anschlussprüfung entfällt (bestätigt, Absicht)

Der globale Abschnitt "Durchgängigkeit Potenzialausgleich / Erdung" (Erdungswiderstand R_E, Messpunkt/Bezugspunkt – bisher Abschnitt 5 in `anschlusspruefung.html`) soll komplett gestrichen werden. Das separate Feld "Durchgängigkeit Potenzialausgleich" **je Übergabepunkt-Karte** (R_PA, aus 7.4.0 Punkt 2) bleibt davon unberührt bestehen – das ist ja gerade der Grund, warum der globale Abschnitt jetzt entbehrlich wird: der tatsächliche Messwert sitzt schon an jeder Karte.

⚠️ Zu prüfen bei der Umsetzung: das globale Feld "Potenzialausgleich grundsätzlich vorhanden (Konzept)" (`pa_angeschlossen`) steht im selben Abschnitt wie `erdung_re`/`pa_messpunkt`. Deine Tabelle sagt nichts dazu, ob dieses Konzept-Feld auch wegfällt oder bestehen bleibt (nur eben ohne den Erdungswiderstand daneben). Bitte kurz bestätigen, sonst wird es beim Umsetzen einfach mit entfernt, weil der ganze Abschnitt sonst leer wäre.

---

## Zieltabelle (nach deiner neuen Anordnung, Fehler korrigiert)

### 1. VDE 0100/0105 Prüfprotokoll (Anlagenprüfung) – `vde0100.html`

| Abschnitt | Was wird erfasst / geprüft |
|---|---|
| Allgemeine Angaben & Stammdaten | Auftraggeber/Prüfort, Gebäude/Bereich, Anlage/Objekt (Bezeichnung), Prüflings-ID, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, Hausanschluss/Speisepunkt, Prüfgerät + Seriennummer |
| Netzsystem, Netzbetreiber & Prüfgeräte | Prüfart/Norm, Grund der Prüfung, Netzsystem, Netzspannung, Art der Einspeisung, Verteilnetzbetreiber, Hausanschluss/Speisepunkt |
| ↳ Netzmessung (optional) | Netzart, Art des Speisepunkts, Steckverbindung mitgeprüft (Pflicht bei Steckstelle), Spannungen L1‑N…L1‑L3, U N‑PE, Frequenz (Pflicht bei NEA/WR) |
| **Besichtigen (Sichtprüfung) – NEU, 11 Punkte** | Betriebsmittel, Kabel & Leitungen, Zugänglichkeit, Schaltgeräte, Kennzeichnung, Zusätzlicher Potenzialausgleich, Berührungsschutz, Typenschild, Steckvorrichtungen/Kupplungen, Leiterverbindungen, Witterungsschutz (falls außen) |
| ↳ Anschlusskabel der Anlage | Kabeltyp, Leiter-Anzahl, Querschnitt |
| Messtechnische Prüfungen (Stromkreise) | je Stromkreis-Karte: Kopf, 1. Schutzleiter-/Isolationswiderstand, 2. Absicherung & Schleifenimpedanz, 3. RCD/FI, 4. Berührungsspannung & Netzart, Ergebnis + Fotos |
| Erproben (Funktionsprüfung) | Funktion Anlage, Schutzeinrichtungen, Drehfeld CEE, Polarität/Steckdosenbelegung, RCD-Prüftaste, Sicherheitsbeleuchtung, Drehrichtung Motoren, Funktion Gebäudesystemtechnik |
| Durchgängigkeit Potenzialausgleich / Erdung | Erdungswiderstand R_E, Messpunkt/Bezugspunkt |
| Gesamtbeurteilung, Gewährleistung & Prüftermin | Prüfumfang, Gesamtbewertung Mängel, Prüfplakette, nächster Prüftermin, sicherer Gebrauch, Bemerkungen + Fotos |
| Konformitätsbestätigung & Unterschriften | Ort/Datum, Unterschrift Prüfer/-in, Unterschrift Betreiber/Verantwortlicher |

### 2. Anschlussprüfung Übergabepunkt – `anschlusspruefung.html`

| Abschnitt | Was wird erfasst / geprüft |
|---|---|
| Allgemeine Angaben & Stammdaten | Auftraggeber/Veranstaltungsort, Gebäude/Bereich, Anlage/Objekt, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, Prüfintervall + nächster Prüftermin, Prüfgerät + Seriennummer |
| Netzsystem, Netzbetreiber & Bereitsteller | Firma/Vermieter, Netzbetreiber, Ansprechpartner (optional), Telefon (optional), Art der Einspeisung, Standort Übergabepunkt, vertragliche Anschlussleistung, Netzspannung, Hausanschluss/Speisepunkt |
| **Besichtigen (Sichtprüfung) – NEU, 11 Punkte (identisch zur Anlagenprüfung)** | Betriebsmittel, Kabel & Leitungen, Zugänglichkeit, Schaltgeräte, Kennzeichnung, Zusätzlicher Potenzialausgleich, Berührungsschutz, Typenschild, Steckvorrichtungen/Kupplungen, Leiterverbindungen, Witterungsschutz (falls außen) |
| Messtechnische Feststellungen je Übergabepunkt | je Übergabepunkt-Karte: Kopf, 1. Netzmessung (Spannungen/N‑PE), Drehfeldrichtung, 2. Schutzleiter-/Isolationswiderstand, 3. Absicherung & Schleifenimpedanz, 4. RCD/FI + U_L, 5. Durchgängigkeit PA (Messwert dieser Karte), Ergebnis + Fotos |
| ~~Durchgängigkeit Potenzialausgleich / Erdung~~ | **entfällt** (bewusst gestrichen – Messwert sitzt jetzt je Übergabepunkt-Karte) |
| Gesamtbeurteilung & Freigabe | Gesamtbewertung Mängel, Anschlussleistung ausreichend, Freigabe zur Nutzung, Bemerkungen + Fotos |
| Übergabebestätigung & Unterschriften | Ort/Datum, Unterschrift Übergebende/-r, Unterschrift Übernehmende/-r |

### 3. Prüfung elektrischer Geräte (Geräteprüfung) – `geraetepruefung.html`

| Abschnitt | Was wird erfasst / geprüft |
|---|---|
| Allgemeine Angaben & Stammdaten | Auftraggeber/Prüfort, Gebäude/Bereich, Prüfart, Prüffrist, Anlage/Objekt, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, Prüfgerät + Seriennummer |
| Geräte (je Karte) | Kopf (Bezeichnung, Hersteller/Typ, Inventarnr., Schutzklasse, Leitungslänge, Heizelement) |
| ↳ 1. Besichtigen | Gehäuse/Isolierung/Lüftungsschlitze, Anschlussleitung/Stecker/Zugentlastung, Kennzeichnung/Typenschild lesbar, keine unsachgemäßen Reparaturen |
| ↳ 2. Erproben | **nur** Funktionsprüfung (i.O./n.i.O.) |
| ↳ 3. Messen | R_PE, R_ISO, Ableitstrom, Messmethode Ableitstrom |
| Gesamtbeurteilung & Prüfplakette | Prüfumfang, Gesamtbewertung Mängel, Prüfplakette, sicherer Gebrauch, nächster Prüftermin, Bemerkungen + Fotos |
| Konformitätsbestätigung & Unterschriften | Ort/Datum, Unterschrift Prüfer/-in, Unterschrift Verantwortlicher |

---

## Offene Rückfragen vor der Umsetzung

1. **Gebäudesystemtechnik** raus aus der Anlagenprüfung – bewusst, oder soll das (mit Blick auf Fluchtwege/Sicherheitstechnik) doch irgendwo erhalten bleiben?
2. Bleibt bei der Anschlussprüfung das Feld **"Potenzialausgleich grundsätzlich vorhanden (Konzept)"** bestehen, wenn der Erdungswiderstand daneben wegfällt – oder fällt der ganze Abschnitt weg?
3. Heißt der Punkt "Kennzeichnung" bei beiden Protokollen jetzt identisch, oder soll die Anschlussprüfung ihre bisherige genauere Bezeichnung "Kennzeichnung/Beschriftung" behalten?

Sag Bescheid, dann setze ich das im Code um (Formulare + beide PDF-Generatoren + Nummerierung).
