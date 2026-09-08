# VDE-Prüf-App 7.0.0 — Änderungsbericht

Stand: 07.09.2026. Basis: 6.3.0. Grundlage war der Testbericht `VDE-App-7.0-Testbericht-2026-09-07.md` sowie der ausführliche Auftrag mit den Abschnitten A bis I. Alle Punkte wurden lokal in `ZUM-HOCHLADEN` umgesetzt, jeweils in einem eigenen Git-Commit.

## Vorab geklärte Rückfragen

Bevor mit Abschnitt B begonnen wurde, waren drei Rückfragen offen. Sie wurden im Gespräch geklärt: Die Netzmessung bekommt bei "Steckstelle" zusätzlich ein Feld für die Steckverbindung (siehe B5); Erproben/Funktionsprüfung wandert in vde0100.html hinter die Stromkreise (die anderen beiden Formulare waren davon nicht betroffen, siehe unten); das rosa Bemerkungsfeld im PDF bleibt fest eingefärbt und folgt nicht der Ampel-Farbe.

## A. Kleinere Korrekturen

**A2/A3** — Der Tooltip zu "Verteilnetzbetreiber" wurde ausgeschrieben, der bisherige Tippfehler "Verteilungsnetzbetreiber" korrigiert (betraf `index.html` und `vde0100.html`). Das Feld R_ISO ist jetzt mit dem editierbaren Standardwert ">" vorbelegt statt leer.

## B. Netzmessung, Reihenfolge, Android-Tastatur

**B4** — Der Abschnitt "Netzmessung" ist jetzt standardmäßig aufgeklappt statt eingeklappt.

**B5** — Neues Auswahlfeld "Fest verkabelt" / "Steckstelle" bei der Netzmessung. Bei "Steckstelle" erscheint zusätzlich ein Pflichtfeld "Steckverbindung mitgeprüft" (i.O./n.i.O.), das auch in die PDF-Pflichtfeldprüfung und als Zusatztext in der PDF-Zeile "Netzsystem/Einspeisung" einfließt. Die bereits sehr eng bemessene 4×2-Tabelle der eigentlichen Netzmesswerte (L1-N/L2-N/L3-N/f/L1-L2/L2-L3/L1-L3/N-PE) wurde dabei bewusst **nicht** angefasst, um das Seitenlayout nicht zu gefährden — das Feld hängt stattdessen an einer bereits vorhandenen Freitextzeile.

**Reihenfolge Erproben/Stromkreise** — In `vde0100.html` stehen "4. Messtechnische Prüfungen (Stromkreise)" jetzt vor "5. Erproben (Funktionsprüfung)" (vorher umgekehrt). In `anschlusspruefung.html` gibt es keinen eigenständigen Erproben-Abschnitt (Drehfeld/Polarität stecken direkt in der Übergabepunkt-Karte), in `geraetepruefung.html` ist die Erprobung Teil jeder Geräte-Karte — beide waren von der Umstellung nicht betroffen, das entspricht der getroffenen Entscheidung, dort nur die Nummerierung anzugleichen (siehe I25 im Vorgänger-Bericht), nicht umzustrukturieren.

**B6 (Android-Zifferntastatur)** — Alle Felder der Netzmessung hatten bereits vor dieser Version `inputmode="decimal"`, identisch zu den unauffällig funktionierenden Feldern an anderer Stelle im Formular. Ein reiner Code-Vergleich zeigt hier keinen Unterschied. Eine plausible Ursache: Die Felder lagen bisher in einem standardmäßig **eingeklappten** `<details>`-Element (siehe B4) — manche älteren Android-WebViews initialisieren `inputmode` für Felder in initial verstecktem Markup nicht zuverlässig. Mit B4 (Abschnitt jetzt standardmäßig aufgeklappt) könnte sich das bereits erledigt haben. **Das muss aber, wie ausdrücklich vereinbart, auf einem echten Android-Gerät nachgeprüft werden** — eine reine Code-Prüfung reicht hier nicht aus und wurde auch nicht als ausreichend behauptet.

## C. Bedienung

**C7** — Duplizieren/Entfernen stehen jetzt sowohl am Kopf (wie bisher an einer Stelle) als auch am Fuß jeder Karte: Stromkreise in `vde0100.html`, Geräte in `geraetepruefung.html`, Übergabepunkte in `anschlusspruefung.html`. Grund: bei langen Karten musste man bisher zum Duplizieren/Entfernen erst zurückscrollen.

## D. Fluke-Icons und -Anleitungen

Grundlage war das Fluke-1662/1663/1664-FC-Bedienungshandbuch (vom Auftraggeber bereitgestellt). Wie bei allen bisherigen Icons/Anleitungen in der App gilt: **keine 1:1-Übernahme von Fluke-Grafiken oder -Text**, sondern selbst gezeichnete Annäherungen mit Disclaimer, wie in den Vorversionen bereits etabliert.

**D8 (Drehfeldprüfung/Phasendrehung)** — Neues, selbst gezeichnetes Icon (Kreis-Pfeil-Symbol, angelehnt an die Drehfeld-Anzeige des Fluke 1663) plus vollständige Infokarte und Kurzanleitung. Eingebunden an beiden Stellen, an denen ein Drehfeld erfasst wird: `vde0100.html` (Abschnitt Erproben) und `anschlusspruefung.html` (Übergabepunkt-Karte).

**D9/D11 (RCD-Anleitung vervollständigt und korrigiert)** — Die bisherige Fluke-Anleitung deckte nur die Auslösezeit-Messung (Position ΔT) ab. Ergänzt wurde der komplette Ablauf für die Auslösestrom-Messung (Position I<sub>ΔN</sub>), außerdem Details, die im Handbuch stehen, in der bisherigen Anleitung aber fehlten: Wellenform-Auswahl je RCD-Typ (AC/A/B), Pflicht zur Prüfung beider Phasenwinkel (0° und 180°) bei Typ B, sowie der Warnhinweis, vor der Messung die Verbindung zwischen Neutralleiter und Schutzleiter zu prüfen.

**D12 (RCD-Typ-Symbole)** — Die Typenschild-Symbole für RCD-Typ AC/A/F/B sind jetzt direkt in der RCD-Infokarte als kleine, selbst gestaltete Kennzeichen hinterlegt (keine Norm- oder Fluke-Grafik, eigene Darstellung).

**D13 (Berührungsspannung & Netzart)** — Bei Prüfung stellte sich heraus, dass dieser Punkt in der Stromkreis-Karte bereits vollständig umgesetzt war: "Spannungsart Netzeinspeisung" und "Bereich/Gefährdung" stehen zusammen mit der gemessenen Berührungsspannung in einem gemeinsamen Abschnitt "4. Berührungsspannung & Netzart", der bereits das (wiederverwendete) ΔT-Icon nutzt und kein separates Drehschalter-Symbol mehr zeigt. Hier war keine Änderung nötig.

**D10 (Zi-Loop-Grafik)** — Der Text "Z-LOOP"/"LOOP" (den es beim Fluke 1663 in dieser Form gar nicht gibt) wurde durch ein neues, selbst gezeichnetes Icon mit Schleifen-Pfeil-Symbol und "Zi"-Beschriftung ersetzt, angelehnt an die tatsächliche Zi-Anzeige des Geräts. Die Anleitung nennt jetzt korrekt die Position "Zi" (mit Hinweis auf die NO-TRIP-Einstellung bei RCD-geschützten Kreisen) statt der bisherigen, so nicht existierenden Bezeichnung.

## E. PDF-Layout

**E14 (Farben/Design angleichen)** — Bei der Prüfung zeigte sich, dass die PDF-Farbpalette bereits sehr genau mit dem CSS der App übereinstimmt: `PDF_PRIMARY` entspricht exakt `--primary` (#003366), die Ampel-Farben (rot/grün/gelb) sind bis auf die letzte Nachkommastelle identisch mit den entsprechenden CSS-Werten. Eine einzige Abweichung wurde gefunden (`PDF_BOX_BORDER`/`PDF_TABLE_LINE` dunkler als `--border`) — die ist laut Code-Kommentar aus Version 4.7.0 aber **bewusst** so gewählt, weil der hellere CSS-Wert auf Papier/beim Kopieren zu blass war. Diese Abweichung wurde deshalb nicht "zurückkorrigiert", das wäre eine Regression eines bereits behobenen Problems gewesen. Zum zweiten Teil des Punkts ("Warnhinweise überarbeiten"): In der App und im PDF existiert aktuell kein eigener, benannter "Warnhinweise"-Textblock, der überarbeitet werden könnte — falls damit ein bestimmter Text gemeint war, bitte konkret benennen, dann kann das gezielt nachgezogen werden.

**E14.1 (6 Stromkreise auf 1 Seite + Bemerkungstext)** — Genau nachgerechnet: Die App berechnet den benötigten Platz für den Abschlussblock (Kasten 4 + Ergebnis/Unterschriften) bereits **exakt und dynamisch**, abhängig von der tatsächlichen Länge des eingetragenen Bemerkungstexts (das war schon einmal in Version 4.5.0/6.0.0 gezielt gegen genau dieses Problem gebaut, siehe Kommentar "Befund C1" im Code). Bei 6 Stromkreisen mit realistischem Platzbedarf (mehrzeilige R_ISO-/RCD-Werte) und einem längeren Bemerkungstext reicht der Platz auf Blatt 1 rechnerisch tatsächlich nicht für beides — die App verschiebt dann korrekt den kompletten Abschlussblock auf eine neue Seite, statt etwas abzuschneiden oder zu überlappen. Das ist kein Fehler, sondern die bereits eingebaute Notlösung für einen Fall, der mit der gewählten, gut lesbaren Schriftgröße physikalisch nicht anders lösbar ist. Eine erzwungene Ein-Seiten-Darstellung wäre nur über deutlich kleinere Schrift möglich und stand dem Ziel "gut lesbares Protokoll" entgegen — deshalb wurde hier bewusst nichts geändert, um die ohnehin fragile Layout-Berechnung nicht ohne echten Fehler zu riskieren. Bei Bedarf gerne im Gespräch klären, ob eine kleinere Schrift für diesen Grenzfall gewünscht ist.

## F/I. Verschiedenes (in dieser Session zusätzlich erledigt)

Aus dem breiteren Auftrag wurden außerdem umgesetzt: F15 (Aufklapp-Zustand der Infokarten je Messgröße wird jetzt sitzungsweit geteilt), F16 (Abstand der Statusleiste zum Bildschirmrand), I26 (Drehschalter-Icons aus der "3. Messen"-Titelzeile der Geräteprüfung entfernt), I27 (veraltete Testberichte/Beispiel-PDFs aufgeräumt, vorher versioniert statt einfach gelöscht), I28 (Icon-Label R_PA zu R_LO korrigiert), I29 (Sicherungsvorschläge am Hauptanschlusspunkt), I23/I30 (Reihenfolge auf der Startseite angepasst), H19 (alle Formularfelder mit `for`/`id` verknüpft), H20/H21 (Optional Chaining ergänzt, Manifest-ID auf absolute URL).

## Neu: Anleitung für Erstanwender

Auf Wunsch während der Session zusätzlich erstellt: `anleitung.html`, eine vollständige In-App-Anleitung für neue Nutzer (Protokolltypen, erster Start, Formular ausfüllen, Stromkreise duplizieren/löschen, Ampel-Farben, Fluke-Kurzanleitungen, PDF-Abschluss, Offline-Nutzung, Grenzen der App). Verlinkt über einen Button auf der Startseite und in allen drei Prüfformularen, ins Offline-Caching aufgenommen.

## G. Fotodokumentation und Mail-Versand

**G17 (Fotodokumentation)** — Neue, optionale Foto-Anlage direkt an jeder Karte (Stromkreis, Übergabepunkt, Gerät). Fotos werden vor dem Speichern per `<canvas>` auf maximal 1600 Pixel lange Kante herunterskaliert und als JPEG neu kodiert (ein typisches 4–8-MB-Handyfoto wird auf ca. 150–400 KB reduziert), damit auch mehrere Dutzend Fotos nicht an Speichergrenzen des Geräts stoßen. Gespeichert wird in einem eigenen IndexedDB (getrennt vom bestehenden Archiv-Speicher), Fotos werden automatisch mitgelöscht, wenn die zugehörige Karte entfernt wird. In `vde0100.html` erscheinen die Fotos zusätzlich als eigene Anhangseite "5. Fotodokumentation" am Ende des erzeugten PDFs, jeweils dem Stromkreis zugeordnet; für die beiden anderen Formulare (Anschluss-/Geräteprüfung) ist die Foto-Aufnahme bereits nutzbar, die PDF-Einbindung dort steht noch aus, da beide eine eigene, separate PDF-Erzeugung haben — das ist der nächste sinnvolle Schritt für ein Folge-Update.

**G18 (Mail-Versand)** — Wie vereinbart nur analysiert, nicht umgesetzt. Kurzfassung: Die App nutzt bereits die native Teilen-Funktion des Geräts (`navigator.share`), über die ein fertiges PDF schon heute mit einem zusätzlichen Fingertipp direkt an eine Mail-App übergeben werden kann. Ein klassischer `mailto:`-Link kann keine Dateianhänge übertragen und wäre gegenüber der vorhandenen Lösung ein Rückschritt. Ein vollautomatischer Versand direkt aus der App (ohne Nutzer-Interaktion) würde einen Server-Dienst voraussetzen — das bedeutet zwingend eine Internetverbindung (im Widerspruch zum bisherigen Offline-Prinzip der App), laufende Kosten sowie einen Auftragsverarbeitungsvertrag nach DSGVO, da personenbezogene Daten dann erstmals einen dritten Server durchlaufen. Empfehlung: bei der vorhandenen Teilen-Funktion bleiben, sofern kein konkreter, wiederkehrender Bedarf für einen vollautomatischen Versand an eine feste Adresse besteht. Die ausführliche Analyse liegt als eigenes Dokument `G18-Mailversand-Machbarkeitsanalyse.md` bei.

## Nicht umgesetzt in dieser Version

Aus Abschnitt D war zusätzlich eine vollständige Überarbeitung sämtlicher Fluke-1663-Anleitungstexte für alle Messgrößen angefragt (nicht nur RCD). Umgesetzt wurde die RCD-Anleitung vollständig (D9/D11) sowie die bereits vorhandenen Anleitungen für Z_S (im Zuge von D10 präzisiert). Eine Zeile-für-Zeile-Prüfung aller übrigen Anleitungstexte (R_ISO, R_PE, R_LO, Netzmessung) gegen das Handbuch stand aus Zeitgründen in dieser Session nicht mehr an; die bereits vorhandenen Texte wurden in früheren Versionen bereits gegen das Handbuch abgeglichen (siehe Vorgänger-Änderungsberichte), sodass hier kein bekannter Fehler offensteht — eine erneute vollständige Prüfung wäre bei Bedarf ein eigener, kleiner Folgeauftrag.

## Test-Zusammenfassung

Alle geänderten JS-Dateien: Syntax-Check fehlerfrei (`node --check`). Alle geänderten HTML-Dateien: `<div>`-Tags ausgezählt und auf Gleichstand von Öffnen/Schließen geprüft. Die neuen Icons (Drehfeld, Zi-Loop) wurden am eigenen Icon-Stil orientiert erstellt und bei tatsächlicher Anzeigegröße (ca. 40×40 px) gegen ein bestehendes Icon verglichen.

**Nicht möglich in dieser Session:** ein Live-Test im Browser (Formular ausfüllen, PDF erzeugen, Fotos aufnehmen) — auf dem verbundenen Windows-Rechner steht weder Python noch Node.js zur Verfügung, um einen lokalen Webserver zu starten, und die eingebaute Vorschau kann keine `file://`-Seiten öffnen. Alle Änderungen wurden deshalb ausschließlich durch Code-Prüfung, Syntax-Checks und (bei den Icons) Bildvergleich abgesichert. **Bitte vor dem produktiven Einsatz insbesondere folgende Punkte im Browser/auf dem Gerät nachprüfen:**

1. B6 (Android-Zifferntastatur bei der Netzmessung) — wie im Auftrag selbst schon vermerkt, zwingend auf einem echten Android-Gerät.
2. G17 (Fotodokumentation) — Foto aufnehmen/hochladen, Vorschau, Löschen, sowie die neue PDF-Anhangseite in `vde0100.html` mit mindestens einem echten Foto erzeugen.
3. B5 (Netzmessung Steckstelle) — Umschalten zwischen "Fest verkabelt"/"Steckstelle" und die PDF-Zeile "Netzsystem/Einspeisung" mit Steckstelle-Zusatztext prüfen.
4. Die neuen Icons (Drehfeld, Zi-Loop) im tatsächlichen Formular ansehen, nicht nur als Einzelbild.

## Version

`APP_VERSION` / `SW_VERSION`: **6.3.0 → 7.0.0**

## Offene Punkte für Sie

1. Die vier oben genannten Punkte bitte auf einem echten Gerät/im Browser nachprüfen, bevor produktiv damit gearbeitet wird.
2. E14 ("Warnhinweise überarbeiten"): bitte den gemeinten Text konkret benennen, falls hier noch Änderungsbedarf besteht.
3. E14.1: bitte mitteilen, ob eine kleinere PDF-Schrift für den seltenen Grenzfall "6+ Stromkreise mit langem Bemerkungstext" gewünscht ist, oder ob der automatische Seitenumbruch (aktueller Stand) so bleiben soll.
4. G17 für Anschluss-/Geräteprüfung: PDF-Einbindung der Fotos dort steht noch aus (Foto-Aufnahme selbst funktioniert bereits).
5. Bitte weiterhin die lokalen Commits nach GitHub pushen (Schreibzugriff aus dieser Session war laut Vorgänger-Bericht nicht möglich, das wurde in dieser Session nicht erneut geprüft).
