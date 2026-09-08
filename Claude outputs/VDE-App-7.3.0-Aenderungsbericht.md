# VDE-Prüf-App 7.3.0 — Änderungsbericht

Stand: 08.09.2026. Basis: 7.2.0. Grundlage war Ihre Nachricht mit 10 nummerierten Punkten (plus 4 Screenshots) im Anschluss an die 7.2.0-Auslieferung. Alle 10 Punkte wurden umgesetzt.

## 1. Pflichtfeld-Hinweistext auf reines Symbol gekürzt

Der in 7.2.0 (Punkt 7, WCAG 1.4.1) eingeführte Text-Hinweis neben Pflichtfeld-Labels war Ihnen zu ausführlich ("⚠ Pflichtfeld – bitte ausfüllen", "✓ ausgefüllt", "✗ außerhalb des zulässigen Bereichs"). Er zeigt jetzt nur noch das Symbol selbst (⚠ / ✓ / ✗), ohne Begleittext — die WCAG-Funktion (nicht-farbliche Kennzeichnung für farbenblinde Nutzer:innen) bleibt vollständig erhalten, nur kompakter. Reine CSS-Änderung (`style.css`).

## 2. Netzmessung: Auswahl Drehstrom/1-phasig mit Steckverbindung/fest verkabelt

Bei der Netzmessung in `vde0100.html` gibt es jetzt ein neues Auswahlfeld "Drehstrom" / "1-phasig", das VOR der bestehenden Auswahl "Fest verkabelt"/"Steckverbindung" steht. Bei "1-phasig" blenden sich die Drehstrom-spezifischen Messfelder (L2-N, L3-N, L1-L2, L2-L3, L1-L3) automatisch aus, übrig bleibt nur die für eine 1-phasige Schuko-Steckdosenprüfung relevante kompakte Zeile (U, f, N-PE) — das Feld L1-N wird dabei zu "U (V)" umbeschriftet. Beide Auswahlen sind wie gewünscht standardmäßig auf "Drehstrom" bzw. "Steckverbindung" vorbelegt (vorher war "Fest verkabelt" voreingestellt — das haben Sie ausdrücklich umgekehrt). Die Auswahl wird mitgespeichert (Autosave) und beim Wiederherstellen korrekt angewendet; im PDF erscheint bei "1-phasig" ebenfalls nur die kompakte Zeile statt der vollen Drehstrom-Tabelle.

## 3. RCD: Bemessungsstrom I_n mit Schnellauswahl

Neues Eingabefeld "Bemessungsstrom I_n (RCD)" bei der Fehlerstromschutzeinrichtung, mit Schnellauswahl-Buttons für die gängigen Baugrößen (16/25/40/63 A) — ergänzt in `vde0100.html` UND `anschlusspruefung.html` (in der Geräteprüfung gibt es keine RCD-Auslösezeitmessung, dort daher nicht relevant). Wichtig zur Abgrenzung: Dies ist ein ANDERER Wert als das bereits vorhandene Feld "Bemessungsfehlerstrom I_Δn" (10/30/300 mA) aus 7.2.0 — I_n ist der Bemessungs-Betriebsstrom des RCD-Bauteils selbst (z. B. "ein 40-A-RCD"), I_Δn ist dessen Fehlerstrom-Auslöseschwelle. Beide Werte erscheinen jetzt gemeinsam im PDF (Format "40 A / 30 mA").

## 4. Erproben-Auswahlfelder: fehlende "-bitte wählen-" nachgezogen (Bug behoben)

**Gefundene Ursache:** Das Drehfeld-Auswahlfeld (`.c-drehfeld`) in `anschlusspruefung.html` hatte bei keiner seiner drei Optionen (i.O./n.i.O./n.a.) ein `selected`-Attribut gesetzt — es stand deshalb technisch immer auf der ersten Option "i.O." (Browser-Standardverhalten bei `<select>` ohne explizite Auswahl), obwohl die Pflichtfeldprüfung (`ersteLeereAuswahl()`) dieses Feld bereits seit 7.2.0 auf "leer" prüft. Die Prüfung konnte dadurch nie greifen — ein tatsächlich nicht bearbeitetes Drehfeld-Ergebnis wurde stillschweigend als "i.O." exportiert. Jetzt korrekt mit "– bitte wählen –" als Startwert, analog zu allen anderen Erproben-Feldern. Da dadurch auch der Beispieldatensatz betroffen war (hätte sonst sein eigenes PDF blockiert), wurde `fillExampleDataAnschluss()` entsprechend ergänzt (Drehfeld wird dort jetzt explizit auf "i.O." gesetzt).

## 5. Nächster Prüftermin: Hervorhebung am bestehenden Feld statt neuer Anzeige

**Klarstellung Ihrer Rückmeldung:** Die in 7.2.0 (Punkt 10) eingeführte prominente Anzeige des nächsten Prüftermins am ANFANG des Formulars war ein Missverständnis Ihrer damaligen Anfrage. Sie meinten stattdessen das bereits vorhandene Eingabefeld "Nächste Prüfung fällig am" am ENDE der Prüfung (Abschnitt Gesamtbewertung). Die Anzeige am Anfang wurde daher wieder entfernt (die separate Infokarte "Wie wird die Prüffrist bestimmt?" bleibt dort weiterhin bestehen). Stattdessen ist jetzt das Eingabefeld selbst gelb hervorgehoben, solange es nicht bestätigt wurde, und darunter erscheint eine neue Checkbox "Nächster Prüftermin zur Kenntnis genommen". Erst mit gesetztem Haken verschwindet die gelbe Markierung — damit der Prüfer/die Prüferin den gesetzten (oder automatisch berechneten) Termin aktiv wahrnimmt und bestätigt, bevor das Formular als vollständig gilt. Wird das Datum nachträglich geändert, springt die Bestätigung automatisch zurück auf "nicht bestätigt". Umgesetzt in `vde0100.html` und `geraetepruefung.html` (in `anschlusspruefung.html` gibt es kein vergleichbares Terminfeld, siehe 7.2.0-Bericht Punkt 10).

## 6. Abgeschlossene Prüfungen auf der Startseite ausklappbar

Die in 7.2.0 (Punkt 21) eingeführte Liste der als "abgeschlossen" markierten Prüfungen stand bisher dauerhaft sichtbar unterhalb der offenen Prüfungen. Sie ist jetzt in einen ausklappbaren Bereich verschoben (`<details>`/`<summary>` mit Dreieck-Indikator), standardmäßig eingeklappt — für eine bessere Übersicht, wenn viele Prüfungen als abgeschlossen markiert sind. Der Ein-/Ausklapp-Zustand wird bewusst nicht gespeichert (startet nach jedem Laden der Seite wieder eingeklappt).

## 7. Archiv: Anlage zusätzlich zu Gebäude angezeigt

Im Archiv wurde bisher nur "Gebäude/Bereich" (z. B. "Gr. Haus") angezeigt, nicht aber die genauere Anlagenbezeichnung (z. B. "Hauptverteilung Unterbühne UV-1", Feld `anlage_bez` in `vde0100.html`). Bei mehreren Prüfungen im selben Gebäude ließen sich die Einträge dadurch in der Liste kaum unterscheiden. Jetzt wird die Anlage zusätzlich angezeigt: in der Listenübersicht (Kurzform hinter Gebäude), in der Detailansicht als eigene Zeile, und sie ist auch über das Suchfeld auffindbar. Das Feld existiert nur in `vde0100.html` (Anlagenprüfung) — bei Anschluss- und Geräteprüfungen bleibt es leer und wird automatisch ausgeblendet.

## 8. Abstand zwischen "Beispieldaten" und "Neues Formular"

Wie in Ihrem Screenshot zu sehen, standen die Buttons "+ Beispieldaten laden…" und "+ Neues Formular" am Kopf jeder Formularseite ohne sichtbaren Abstand direkt übereinander. Der umgebende Bereich hat jetzt einen definierten Zeilenabstand (8 px), sodass beide Elemente klar getrennt erscheinen. Betrifft alle drei Prüfformulare.

## 9. App-eigene Hinweis-/Bestätigungsdialoge statt Browser-Dialogen

Alle Meldungen und Rückfragen der App erschienen bisher als dunkle, systemeigene Browser-Dialoge ("Diese Seite sagt…", siehe Ihre Screenshots) — optisch ohne jeden Bezug zur App. Es gibt jetzt zwei neue, zentrale Funktionen `appAlert()` und `appConfirm()` (`pdf-utils.js`), die stattdessen ein eigenes, ans App-Design angepasstes Dialogfenster zeigen (gleiche Schrift, gleiche Buttons wie der Rest der Oberfläche, auf Basis des modernen `<dialog>`-Elements). Alle 50 Aufrufstellen von `alert()`/`confirm()` in der gesamten App (9 Dateien: `pdf-utils.js`, `pdf-generator.js`, `anschluss-generator.js`, `geraete-generator.js`, `storage.js`, `archiv.js`, `entwuerfe.js`, `fotos.js`, `archiv.html`, `index.html`) wurden ersetzt. Betroffen sind u. a. die von Ihnen gezeigten Meldungen "Es ist noch eine Bewertung offen" und "Neues Formular anlegen?".

Technischer Hinweis: Ein eigenes Dialogfenster kann (anders als das browsereigene `confirm()`) nicht synchron den Programmablauf anhalten. Alle Funktionen, die eine Rückfrage stellen (z. B. "Neues Formular anlegen?", die PDF-Erzeugung mit ihren zahlreichen Plausibilitätsprüfungen), mussten dafür auf die moderne `async`/`await`-Schreibweise umgestellt werden. Das ist funktional unsichtbar — Buttons und Formulare verhalten sich unverändert —, war aber ein Eingriff, der praktisch die gesamte PDF-Erzeugungslogik aller drei Formulare durchzieht und deshalb besonders sorgfältig nachgeprüft wurde (siehe Test-Zusammenfassung). Sollte ein Browser das `<dialog>`-Element ausnahmsweise nicht unterstützen (praktisch nie mehr der Fall), fällt die App automatisch auf die alten Browser-Dialoge zurück, damit nichts unbedienbar wird.

## 10. RCD-Typ-Symbole korrigiert (Typ B)

Anhand Ihrer beigefügten Referenztabelle wurden alle vier RCD-Typ-Symbole (`img/drehschalter/RCD_Typ_*.png`) mit der offiziellen IEC-Normdarstellung abgeglichen (recherchiert über Hersteller-Originalquellen, u. a. offizielle Doepke-Vektorgrafiken). Typ AC, Typ A und Typ F waren bereits korrekt. **Typ B war fehlerhaft:** Das Symbol bestand nur aus zwei Kästchen (Sinuswelle+Halbwellen, dann direkt die Gleichstrom-Linien) und ließ das mittlere Kästchen (dichte Sägezahn-Wellenform für Mischfrequenzen) aus, das laut Norm zwingend Teil der Typ-B-Kennzeichnung ist — Typ B umfasst als "allstromsensitiver" RCD-Typ nämlich ALLE Fehlerstromarten (Wechsel-, pulsierender Gleich-, Misch- und glatter Gleichfehlerstrom), das Symbol muss deshalb alle drei Wellenform-Kästchen zeigen. Das Icon wurde entsprechend um das fehlende mittlere Kästchen ergänzt (im bestehenden Linienstil der App neu zusammengesetzt, keine externe Grafikbibliothek nötig) und an der einzigen Stelle im Code ersetzt, an der es referenziert wird (`img/drehschalter/RCD_Typ_B.png`) — wirkt sich automatisch auf alle Verwendungsstellen aus (RCD-Anleitung, Symbol-Legende).

## Test-Zusammenfassung

Alle geänderten JS-Dateien: Syntax-Check fehlerfrei (`node --check`). Alle geänderten HTML-Dateien inkl. ihrer eingebetteten `<script>`-Blöcke: Syntax-Check fehlerfrei, `<div>`-Tags ausgezählt und auf Gleichstand von Öffnen/Schließen geprüft (vde0100.html, anschlusspruefung.html, geraetepruefung.html, index.html, archiv.html — überall Übereinstimmung).

Punkt 9 (Dialogumstellung) wurde zusätzlich systematisch statt nur stichprobenartig geprüft: alle 50 ursprünglichen `alert()`/`confirm()`-Aufrufstellen wurden einzeln aufgesucht und bestätigt, dass an jeder Stelle, an der ein Ergebnis den weiteren Ablauf steuert (insbesondere alle `confirm()`-Rückfragen sowie die PDF-Plausibilitätsprüfungen), ein `await` gesetzt ist — eine vergessene `await` hätte an diesen Stellen den nachfolgenden Code sofort weiterlaufen lassen, noch bevor die Nutzerin überhaupt geantwortet hat. Eine abschließende Volltextsuche über die gesamte App bestätigt: keine native `alert()`/`confirm()`-Aufrufstelle mehr vorhanden (außer der bewusst eingebauten Rückfallebene in `appAlert()`/`appConfirm()` selbst, falls `<dialog>` einmal nicht unterstützt wird).

Punkt 10 (RCD-Symbol) wurde anhand von Herstellerquellen (u. a. eines offiziellen Vektorgrafik-Originals für Typ B) gegengeprüft, nicht nur nach Augenschein.

**Nicht möglich in dieser Session:** ein Live-Test im Browser (Formular ausfüllen, PDF erzeugen, Dialoge tatsächlich anklicken). Alle Änderungen wurden ausschließlich durch Code-Prüfung und Syntax-Checks abgesichert. **Bitte vor dem produktiven Einsatz insbesondere folgende Punkte im Browser nachprüfen:**

1. Punkt 2 (Netzmessung 1-phasig/Drehstrom): zwischen beiden Optionen umschalten und prüfen, dass sich die Messfelder korrekt ein-/ausblenden und im erzeugten PDF die richtige Tabelle erscheint.
2. Punkt 5 (Prüftermin-Bestätigung): ein Datum eintragen, prüfen dass das Feld gelb wird, Checkbox setzen, prüfen dass Gelb verschwindet — und dass eine spätere Datumsänderung die Bestätigung zurücksetzt.
3. Punkt 9 (neue Dialoge): mehrere der umgestellten Aktionen durchklicken (insbesondere "Neues Formular", PDF ohne Pflichtangaben erzeugen, Backup einspielen) und prüfen, dass die neuen Dialogfenster wie erwartet erscheinen, per Button UND per ESC-Taste bedienbar sind, und der jeweilige Ablauf (z. B. tatsächlich ein neuer Entwurf) korrekt ausgeführt wird.
4. Punkt 10 (RCD-Typ-B-Symbol): in der RCD-Anleitung/Legende ansehen und mit einem echten Typ-B-RCD-Typenschild vergleichen.

## Version

`APP_VERSION` / `SW_VERSION`: **7.2.0 → 7.3.0**

## Offene Punkte für Sie

1. Die vier oben genannten Punkte bitte im Browser nachprüfen, bevor produktiv damit gearbeitet wird — Punkt 9 (neue Dialoge) betrifft praktisch jede Interaktion in der App und verdient die gründlichste Prüfung dieser Runde.
2. Alle Änderungen wurden wie gewohnt in einzelnen, thematisch gruppierten Commits im lokalen Git-Repository (`ZUM-HOCHLADEN/`) abgelegt. Der Push nach GitHub schlägt weiterhin fehl (keine hinterlegten Zugangsdaten in dieser Cloud-Sitzung) — bitte wie bisher lokal pushen bzw. mitteilen, wie Schreibzugriff aus dieser Session eingerichtet werden kann.
