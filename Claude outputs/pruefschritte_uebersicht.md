# Übersicht Prüfschritte je Protokolltyp (Stand: App-Version 7.4.0)

Diese Tabelle bildet den **tatsächlichen Code-Stand** ab (nicht die Änderungsberichte). Reihenfolge = Reihenfolge im Formular von oben nach unten. Gedacht als Arbeitsgrundlage, um Abschnitte/Felder zwischen oder innerhalb der Protokolle zu verschieben.

Legende Spalte "Ebene": **Abschnitt** = eigene Formular-Überschrift (H2) · **Unterblock** = Gruppe innerhalb eines Abschnitts · **Karte** = wiederholbare Einheit (Stromkreis/Übergabepunkt/Gerät), von der es beliebig viele geben kann.

---

## 1. VDE 0100 / 0105 Prüfprotokoll (Anlagenprüfung) – `vde0100.html`

| # | Abschnitt | Ebene | Was wird erfasst / geprüft |
|---|---|---|---|
| 1 | Allgemeine Angaben & Stammdaten | Abschnitt | Auftraggeber/Prüfort, Gebäude/Bereich, Anlage (Bezeichnung), Prüflings-ID, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, Hausanschluss/Speisepunkt (Vorsicherung) |
| 2 | Netzsystem, Netzbetreiber & Prüfgeräte | Abschnitt | Prüfart/Norm, Grund der Prüfung, Netzsystem (TN-S/TN-C-S/TN-C/TT/IT), Netzspannung (V), Art der Einspeisung (Netz/NEA/Wechselrichter), Verteilnetzbetreiber, verwendetes Prüfgerät + Seriennummer |
| 2a | ↳ Netzmessung (optional, aufklappbar) | Unterblock | Netzart (Drehstrom/1-phasig), Art des Speisepunkts (fest/Steckstelle), Steckverbindung mitgeprüft (Pflicht bei Steckstelle), Spannungen L1‑N/L2‑N/L3‑N/L1‑L2/L2‑L3/L1‑L3, U N‑PE (Soll 0 V), Frequenz (Pflicht bei NEA/Wechselrichter) |
| 3 | Besichtigen (Sichtprüfung) | Abschnitt | 12 Punkte: Betriebsmittel, Kabel & Leitungen, Zugänglichkeit, Schaltgeräte, Kennzeichnung, Doku/Warnung, Zusätzlicher Potenzialausgleich, Basisschutz, Typenschild, Brandabschottung, Leiterverbindungen, Gebäudesystemtechnik (je i.O./n.i.O./n.a.) |
| 3a | ↳ Anschlusskabel der Anlage | Unterblock | Kabeltyp, Leiter-Anzahl, Querschnitt |
| 4 | Messtechnische Prüfungen (Stromkreise) | Abschnitt (Karten) | Je Stromkreis eine Karte, siehe Tabelle "Stromkreis-Karte" unten |
| 5 | Erproben (Funktionsprüfung) | Abschnitt | Funktion Anlage, Schutzeinrichtungen, Drehfeld CEE (rechts), Polarität/Steckdosenbelegung, RCD-Prüftaste betätigt, Sicherheitsbeleuchtung, Drehrichtung Motoren, Funktion Gebäudesystemtechnik (je i.O./n.i.O./n.a.) |
| 6 | Durchgängigkeit Potenzialausgleich / Erdung | Abschnitt | Erdungswiderstand R_E (Richtwert ≤ 10 Ω), Messpunkt/Bezugspunkt |
| 7 | Gesamtbeurteilung, Gewährleistung & Prüftermin | Abschnitt | Prüfumfang (Voll/Stichprobe), Gesamtbewertung Mängel, Prüfplakette erteilt, nächster Prüftermin (automatisch aus Prüfdatum), sicherer Gebrauch gewährleistet, Freitext Mängel/Bemerkungen (inkl. Fotos) |
| 8 | Konformitätsbestätigung & Unterschriften | Abschnitt | Ort/Datum der Unterzeichnung, Unterschrift Prüfer/-in, Unterschrift Betreiber/Verantwortlicher |

**Stromkreis-Karte (Abschnitt 4, je Karte):**

| Unterblock | Was wird erfasst / geprüft |
|---|---|
| Kopf | Bezeichnung/Zweck, Kabeltyp, Leiter-Anzahl, Querschnitt |
| 1. Schutzleiter- & Isolationswiderstand | R_PE (Ω), Prüfspannung R_ISO (500V/250V/1000V je nach Fall), R_ISO (MΩ) |
| 2. Überstromschutzeinrichtung | Absicherung (Typ/Nennstrom), Z_S (Schleifenimpedanz L‑PE, Pflicht), I_K (Kurzschlussstrom, auto-berechnet), Z_L‑N (Netzimpedanz, optional), I_K2 (L‑N, auto-berechnet) |
| 3. RCD/FI | RCD-Typ, Bemessungsstrom I_n, Bemessungsfehlerstrom I_Δn, Auslösestrom I_Δmess, Prüfstrom (1×/2×/5× I_Δn), Auslösezeit t_A |
| 4. Berührungsspannung & Netzart | Spannungsart (AC/DC), Bereich/Gefährdung (normal/erhöht), max. zulässige U_L, gemessene U_mess |
| Ergebnis | Ergebnis Stromkreisprüfung (i.O. / n.i.O. mit Pflicht-Fehlertext bei Totlegung), Fotos |

---

## 2. Anschlussprüfung Übergabepunkt – `anschlusspruefung.html`

| # | Abschnitt | Ebene | Was wird erfasst / geprüft |
|---|---|---|---|
| 1 | Allgemeine Angaben & Stammdaten | Abschnitt | Auftraggeber/Veranstaltungsort, Gebäude/Bereich, Anlage/Objekt, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, Prüfintervall (1/2/3 Monate, 1/2/4 Jahre), nächster Prüftermin (automatisch), verwendetes Prüfgerät + Seriennummer |
| 2 | Netzsystem, Netzbetreiber & Bereitsteller der Einspeisung | Abschnitt | Firma/Vermieter, Netzbetreiber (getrennte Felder), Ansprechpartner/-in (optional), Telefon (optional), Art der Einspeisung (Festanschluss/Baustromverteiler/Generator/Sonstiges), Standort/Bezeichnung Übergabepunkt, vertragliche Anschlussleistung (kVA), Netzspannung (V), Hausanschluss/Speisepunkt (Vorsicherung) |
| 3 | Besichtigen (Sichtprüfung Übergabepunkt) | Abschnitt | 6 Punkte: Verteiler/Zählerschrank, Steckvorrichtungen/Kupplungen, Zuleitung/Kabel unbeschädigt, Kennzeichnung/Beschriftung, Witterungsschutz (falls außen), Berührungsschutz/Abdeckungen (je i.O./n.i.O./n.a.) |
| 4 | Messtechnische Feststellungen je Übergabepunkt | Abschnitt (Karten) | Je Übergabepunkt eine Karte, siehe Tabelle "Übergabepunkt-Karte" unten |
| 5 | Durchgängigkeit Potenzialausgleich / Erdung | Abschnitt | Potenzialausgleich grundsätzlich vorhanden (Konzept, global für die Anlage), Erdungswiderstand R_E falls gemessen, Messpunkt/Bezugspunkt |
| 6 | Gesamtbeurteilung & Freigabe | Abschnitt | Gesamtbewertung Mängel, Anschlussleistung ausreichend für geplante Last, Freigabe zur Nutzung, Freitext Mängel/Bemerkungen (inkl. Fotos) |
| 7 | Übergabebestätigung & Unterschriften | Abschnitt | Ort/Datum, Unterschrift Übergebende/-r (Netzbetreiber/Bereitsteller), Unterschrift Übernehmende/-r (Veranstalter/Elektrofachkraft) |

**Übergabepunkt-Karte (Abschnitt 4, je Karte):**

| Unterblock | Was wird erfasst / geprüft |
|---|---|
| Kopf | Bezeichnung Übergabepunkt, Netzsystem, Netzart (Drehstrom/1-phasig), Frequenz |
| 1. Netzmessung – Spannungen, Frequenz & N‑PE | Spannungen L1‑N/L2‑N/L3‑N/L1‑L2/L2‑L3/L1‑L3 (±10 %), U N‑PE (Soll 0 V, Pflicht) |
| Drehfeldrichtung | Drehfeldrichtung bei Drehstrom (i.O. rechtsdrehend / n.i.O. linksdrehend / n.a.) |
| 2. Schutzleiter- & Isolationswiderstand | R_PE (Ω), R_ISO (MΩ) |
| 3. Absicherung & Schleifenimpedanz | Absicherung (Typ/Nennstrom), Z_S (Pflicht), I_K (auto), Z_L‑N (optional), I_K2 (auto) |
| 4. RCD/FI am Übergabepunkt | RCD-Typ, Bemessungsstrom I_n, I_Δn, Auslösestrom I_Δmess, Prüfstrom, Auslösezeit t_A, Bereich/Gefährdung, max. zulässige U_L, gemessene U_L |
| 5. Durchgängigkeit Potenzialausgleich (Messwert dieses Übergabepunkts) | Durchgängigkeit PA (i.O./n.i.O./n.a.), R_PA (Ω) falls gemessen |

---

## 3. Prüfung elektrischer Geräte (Geräteprüfung) – `geraetepruefung.html`

| # | Abschnitt | Ebene | Was wird erfasst / geprüft |
|---|---|---|---|
| 1 | Allgemeine Angaben & Stammdaten | Abschnitt | Auftraggeber/Prüfort, Gebäude/Bereich, Prüfart (Wiederholung/nach Reparatur), Prüffrist (1/3/6 Monate, 1/2 Jahre), Anlage/Objekt, Protokoll-Nr., Prüfer/-in + Qualifikation, Prüfdatum, verwendetes Prüfgerät + Seriennummer |
| 2 | Geräte (Besichtigen, Erproben, Messen je Gerät) | Abschnitt (Karten) | Je Gerät eine Karte, siehe Tabelle "Geräte-Karte" unten |
| 3 | Gesamtbeurteilung & Prüfplakette | Abschnitt | Prüfumfang (Voll/Stichprobe), Gesamtbewertung Mängel, Prüfplakette erteilt, sicherer Gebrauch gewährleistet, nächster Prüftermin (automatisch aus Prüffrist), Freitext Mängel/Bemerkungen (inkl. Fotos) |
| 4 | Konformitätsbestätigung & Unterschriften | Abschnitt | Ort/Datum der Unterzeichnung, Unterschrift Prüfer/-in, Unterschrift Verantwortlicher |

**Geräte-Karte (Abschnitt 2, je Karte):**

| Unterblock | Was wird erfasst / geprüft |
|---|---|
| Kopf | Bezeichnung/Verwendungszweck, Hersteller/Typ, Inventar-/Seriennummer, Schutzklasse (I/II/III), Anschlussleitung Länge (m), Heizelement-Kennzeichnung + Heizleistung (kW) |
| 1. Besichtigen | Gehäuse/Isolierung/Lüftungsschlitze, Anschlussleitung/Stecker/Zugentlastung, Kennzeichnung/Typenschild lesbar, keine unsachgemäßen Reparaturen/Überhitzung (je i.O./n.i.O./n.a.) |
| 2. Erproben | Funktionsprüfung (i.O./n.i.O.) |
| 3. Messen | R_PE (Ω), R_ISO (MΩ), Ableitstrom (mA), Messmethode Ableitstrom (Ersatzableitstrom / Differenzstrommessung / Direktmessung Berührungsstrom) |

---

## Globale Stammdaten (`index.html`, gelten für alle drei Protokolltypen)

| Bereich | Was wird erfasst |
|---|---|
| 1. Zentrale Stammdaten | Auftraggeber/Betrieb, Adresse, Standard-Gebäude/Bereich (+ eigene dauerhaft ergänzbar), Verteilnetzbetreiber (VNB), Hausanschluss/Speisepunkt (Vorsicherung), Prüfer/-in, Qualifikation, verwendetes Prüfgerät, Seriennummer Installationstester (Fluke 1663) – für Anlagen-/Anschlussprüfung, Seriennummer Gerätetester (Fluke 6500-2) – für Geräteprüfung, Ort der Unterzeichnung |
| 2. Protokoll starten | Buttons „Neues Protokoll" / „Letztes weitermachen", Kachelauswahl der drei Protokolltypen |
| 3. Archiv | Liste aller erstellten (ausgefüllten) PDFs, zeigt u.a. Anlage/Objekt je Eintrag |
| 4. Offene Prüfungen | Liste der nicht abgeschlossenen Entwürfe je Protokolltyp |

---

## Auffällige Gemeinsamkeiten & Unterschiede (als Orientierung fürs Verschieben)

- **Reihenfolge "Besichtigen → Messen → Erproben/Bewertung"** ist nicht ganz einheitlich: Anlagenprüfung hat Besichtigen (3) → Messen (4) → Erproben (5) → Erdung (6) als getrennte Abschnitte; Anschlussprüfung und Geräteprüfung haben Besichtigen/Erproben/Messen teils zusammengefasst (Geräteprüfung: alles in einer Karte je Gerät) oder in einer Karte gebündelt (Anschlussprüfung: Erproben-Anteil "Drehfeld" sitzt in der Messkarte, nicht in einem eigenen Besichtigen/Erproben-Abschnitt).
- **Erdung/Potenzialausgleich** ist bei Anlagen- und Anschlussprüfung ein eigener globaler Abschnitt (5 bzw. 6); bei der Anschlussprüfung gibt es zusätzlich ein Messfeld PRO Übergabepunkt-Karte – zwei Stellen für ein verwandtes Thema.
- **RCD/FI-Prüfung** liegt bei Anlagenprüfung und Anschlussprüfung als eigener Messblock in der jeweiligen Karte (Stromkreis/Übergabepunkt); bei der Geräteprüfung gibt es keine RCD-Prüfung (fachlich korrekt, da Einzelgeräte nicht auf RCD-Auslösezeit geprüft werden).
- **Prüfintervall/Prüftermin** sitzt bei der Anschlussprüfung in Abschnitt 1 (Stammdaten), bei Geräteprüfung erst in Abschnitt 3 (Gesamtbeurteilung, bewusst ans Ende verschoben in 7.3.0) – bei der Anlagenprüfung ebenfalls in Abschnitt 7 (Gesamtbeurteilung).
- **Berührungsspannung U_L** liegt bei Anlagenprüfung und Anschlussprüfung jeweils am Ende des RCD-Messblocks der Karte; kein Pendant bei der Geräteprüfung.
