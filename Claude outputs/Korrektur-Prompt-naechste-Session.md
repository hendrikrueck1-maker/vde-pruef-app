# Prompt für die nächste Umsetzungssession – VDE-Prüf-App

Kopiere den folgenden Block als Auftrag in die nächste Claude-Session (mit Zugriff auf den Projekt-Kontext „vde" bzw. das GitHub-Repo `hendrikrueck1-maker/vde-pruef-app`):

---

## AUFTRAG

Setze in der VDE-Prüf-App (Repo `hendrikrueck1-maker/vde-pruef-app`, aktuell v6.1.0) folgende Änderungen um. Lies vorher den Bericht `VDE-App-6.1.0-Vollpruefung-Bericht.md` aus dem Projekt „vde" für die genauen Fundstellen. Ändere ausschließlich das hier Aufgeführte – keine zusätzlichen „Verbesserungen" ohne Rückfrage.

### A. Bugfixes (Vollprüfungsbericht v6.1.0)

Bitte in dieser Reihenfolge umsetzen, jeweils mit kurzem Test danach:

1. **Befund #1 (kritisch):** In `js/geraete-generator.js` bei den `.c-sicht-item`- und `.c-funktion`-`<select>`-Feldern (Zeilen ~81–91) eine leere Standardoption ergänzen: `<option value="" selected>– bitte wählen –</option>`, analog zum bestehenden Muster in `vde0100.html`/`anschlusspruefung.html`. Zusätzlich `sichtErpNiOPruefen()` (aus `js/pdf-utils.js`) per `onchange` an diese Felder anbinden bzw. Geräteprüfung dort einbinden, damit eine offene Bewertung die PDF-Erzeugung blockiert. Prüfe auch den Restore-/Autosave-Pfad (`restoreDeviceState()` o. ä.), damit alte gespeicherte Entwürfe nicht fälschlich als „i.O." interpretiert werden.
2. **Befund #3:** Branding-Text „Stadttheater Konstanz Prüfsystem" in `index.html` (Zeile ~34) generisch machen oder über `app-config.js` konfigurierbar auslagern.
3. **Befund #4:** In `js/entwuerfe.js` (`entwurfAusUrlUebernehmen()`, Zeilen ~147–153) eine Rückmeldung ergänzen, wenn die per `?entwurf=`-Parameter angeforderte ID nicht im Index existiert (z. B. Hinweis „Dieser Entwurf wurde nicht gefunden" statt stillschweigend leerem Formular).
4. **Befund #5:** In `js/archiv.js` (`archivStatus()`, Zeilen ~233–240) die Bedingung von `frei !== 'Nein'` auf `frei === 'Ja'` verschärfen, damit ein unvollständiger Archiveintrag nicht optimistisch als „i. O." angezeigt wird.
5. **Befund #6:** In `js/archiv.js`, `ARCHIV_UEBERNEHMEN`-Liste (Zeilen ~404–429), `riso_mode` ergänzen, damit die Prüfspannung beim „Erneut prüfen (Vorlage)" übernommen wird.
6. **Befund #7:** Übergreifenden `try/catch` um die PDF-Zeichenlogik (`generatePDFInner()`) in `pdf-generator.js`, `anschluss-generator.js` und `geraete-generator.js` ergänzen, mit nutzerfreundlicher Fehlermeldung statt stillem Hängenbleiben.
7. **Befund #8 (optional, trivial):** `ENTWURF_DATEI[e.praefix] || '#'`-Fallback bereinigen, z. B. auf `datei || 'index.html'`.

**Nicht umsetzen:** Befund #2 (Unterschriftspflicht vor PDF-Erzeugung) – ausdrücklich nicht gewünscht, keine technische Sperre einbauen. Befund #9 gilt als nicht verifizierbar und erfordert keine Aktion.

### B. Infokarten + Fluke-1663-Anleitung + Icons in die echten Formulare integrieren

Referenz: Mockup `VDE-App-Vorschau-Infokarten-Fluke.html` (im Projekt „vde" bzw. als Anhang verfügbar) zeigt Struktur, Optik und Wortlaut. **Wichtig: Die im Mockup enthaltenen schematischen Drehschalter-Positions-Diagramme (SVG-Kreisdiagramme mit Drehrichtungspfeil) werden NICHT übernommen** – nur die Foto-Icons mit Kurzlabel.

Für jede der 5 Prüfgrößen (Z_S/I_K, RCD mit ΔT+I_ΔN, R_ISO, R_PE, U_L) in `vde0100.html`, `anschlusspruefung.html` und ggf. `geraetepruefung.html` (dort, wo die jeweilige Messgröße vorkommt):

1. Rundes Icon-Badge (40×40px, `border-radius: 50%`, `object-fit: cover`) mit Kurzlabel darunter (`Z_S`, `R_ISO`, `R_PE`, `U_L`, `ΔT`, `I_ΔN`) in der Kartenüberschrift ergänzen. Die passenden Icon-Dateien liegen im mitgelieferten Ordner `VDE-App_Drehschalter-Icons.zip` (bereits sinnvoll benannt: `Z_S_Schleifenimpedanz-Kurzschlussstrom.png`, `RCD_Ausloesezeit_deltaT.png`, `RCD_Ausloesestrom_I_deltaN.png`, `R_ISO_Isolationswiderstand.png`, `R_PE_Schutzleiterwiderstand.png`, `U_L_Netzspannung.png`). Icons ins Repo unter z. B. `img/drehschalter/` ablegen, nicht als Base64 inline (anders als im Mockup), um die Dateigröße der HTML-Dateien klein zu halten.
2. Ausklappbare Infokarte „Was wird hier geprüft und warum?" pro Messgröße ergänzen (Texte siehe Abschnitt 2 der Zusammenfassung `Zusammenfassung-und-naechste-Schritte.md`, dort für alle 5 Messgrößen ausformuliert).
3. Ausklappbare Anleitung „So geht's mit dem Fluke 1663" pro Messgröße ergänzen (Texte ebenfalls in der Zusammenfassung enthalten). Deutlich als inoffizielle, selbst erstellte Kurzanleitung kennzeichnen (Disclaimer wie im Mockup), da nicht durch Fluke autorisiert.
4. CSS-Klassen und Farbpalette aus `css/style.css` übernehmen (`--primary`, `--secondary`, `--border` etc.), damit es sich nahtlos einfügt – siehe Mockup als Vorlage für `.mess-icon`, `.mess-icon-stack`, `.infokarte`, `.fluke`.

### C. Neu: Globaler Ein/Aus-Schalter für Infokarten + Fluke-Anleitung

Auf der Hauptseite (`index.html`) einen global wirksamen Schalter (z. B. Toggle/Switch in den Einstellungen oder im Kopfbereich) ergänzen, der steuert, ob die unter B. eingefügten Infokarten UND die Fluke-1663-Anleitungen in allen drei Formularen ein- oder ausgeblendet sind.

- Zustand persistent speichern (z. B. `localStorage`, Key z. B. `vde_infokarten_sichtbar`), damit die Einstellung über Formularwechsel und Neuladen hinweg erhalten bleibt.
- Beim Laden von `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html` den gespeicherten Zustand auslesen und die entsprechenden `<details class="infokarte">`/`<details class="fluke">`-Elemente serienweise ein-/ausblenden (per CSS-Klasse auf einem übergeordneten Container, ähnlich `.infokarten-versteckt` im Mockup – dort aber bisher nur lokal/nicht persistent, das muss für die echte App nachgerüstet werden).
- Icons mit Kurzlabel bleiben davon unberührt und immer sichtbar – der Schalter betrifft nur die ausklappbaren Erklär-/Anleitungstexte, nicht die Icons selbst.

### D. Neu: Stromkreise als horizontales Karussell

Aktuell werden die Stromkreise in `vde0100.html` (und ggf. `anschlusspruefung.html`) untereinander als Liste dargestellt. Umbauen auf ein horizontal durchblätterbares Karussell:

- Ein Stromkreis pro „Seite/Ansicht", Navigation durch Wischen (Touch/Trackpad, `scroll-snap-type: x mandatory` + `scroll-snap-align: start` ist ein einfacher CSS-Ansatz) sowie durch sichtbare Pfeil-Buttons (vor/zurück) für Maus-/Tastaturnutzung.
- Aktuelle Position anzeigen (z. B. „Stromkreis 3 von 12" oder Punkte-Indikator), damit die Übersicht bei vielen Stromkreisen nicht verloren geht.
- Bestehende Funktionalität (Hinzufügen/Löschen von Stromkreisen, Autosave/Entwürfe, Pflichtfeldprüfung, PDF-Export) muss unverändert funktionieren – nur die Darstellung/Navigation ändert sich.
- Auf große Bildschirme/Tablet-Querformat Rücksicht nehmen (die App wird laut vorherigem Bericht auch auf Tablets genutzt) – ggf. auf breiten Viewports zwei Karten nebeneinander erlauben, falls sinnvoll (Rückfrage an Hendrik, falls unklar).

### E. Neu: Statusleiste überarbeiten

Betrifft `js/statusleiste.js` (`initStatusleiste(cfg)`), aktuell zeigt die Statusleiste laut Kommentar im Code: Protokollnummer, Anlage/Gebäude/Bezeichnung und die aktuelle Stromkreis-/Geräte-/Zuleitungskarte.

1. **Prüfprotokollnummer aus der Statusleiste entfernen**, um Platz zu schaffen (bleibt selbstverständlich weiterhin ein normales Feld im Formular/PDF – nur aus der always-visible Statusleiste raus).
2. **Zusätzlich zur aktuellen Stromkreis-Position auch anzeigen, in welchem Abschnitt des gesamten Prüfprotokolls man sich gerade befindet** – nicht nur „Stromkreis X von Y" während man in den Stromkreisen ist, sondern auch eine Orientierung, wenn man sich VOR den Stromkreisen (z. B. Stammdaten/Allgemeine Angaben) oder NACH den Stromkreisen (z. B. Gesamtbewertung/Unterschriften) befindet. Konkret z. B. ein kurzer Abschnittsname wie „Stammdaten" / „Stromkreis 3 von 12" / „Gesamtbewertung" statt nur der Stromkreis-Zählung.
3. Rückfrage an Hendrik vor Umsetzung, falls die genaue Abschnittsgliederung pro Formulartyp (VDE0100 / Anschlussprüfung / Geräteprüfung) nicht eindeutig aus dem Code hervorgeht – die drei Formulare können unterschiedliche Abschnittsfolgen haben.

### Vorgehen

- Änderungen einzeln committen (ein Befund/Feature pro Commit), mit kurzer, nachvollziehbarer Commit-Message.
- Nach jeder Änderung kurz mit Playwright oder manuell live testen (analog zum Vorgehen im Vollprüfungsbericht).
- Kein Code aus urheberrechtlich geschütztem Fluke-Material übernehmen (keine Fluke-Grafiken/-Branding) – nur die im Icon-Ordner mitgelieferten, aus Hendriks eigenem Foto zugeschnittenen Icons sowie selbst formulierte Anleitungstexte verwenden.
- Am Ende: kurze Zusammenfassung, was umgesetzt wurde, plus Hinweis auf offene/verschobene Punkte (falls welche zurückgestellt werden mussten).

---
