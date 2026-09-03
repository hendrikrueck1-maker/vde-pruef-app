# VDE-Prüfprotokoll-App 4.7.0 – Änderungsbericht

**Vorgängerversion:** 4.6.1
**Umgesetzt:** alle 14 von dir gemeldeten Punkte – Stammdaten (Hausanschluss,
Seriennummer) werden jetzt zuverlässig übernommen · Prüfstrom für
Auslösestrom/-zeit ist immer 5×I_n · Frequenz gehört jetzt zur Netzmessung ·
Formulare bleiben nach dem PDF-Export weiter bearbeitbar, mehrere Baustellen
parallel möglich (neues Entwürfe-System) · Protokollnummer zählt bei „Neues
Formular" automatisch hoch · feste Statusleiste zeigt jederzeit, an welchem
Protokoll gerade gearbeitet wird · einzelne Stromkreise können jetzt mit
Begründung als „totgelegt" markiert werden, ohne die Bewertung des restlichen
Verteilers zu verfälschen · Rahmen-/Tabellenlinien deutlich kontrastreicher ·
Stromkreisnummerierung lückenlos nach dem Löschen einer Karte · alle für den
PDF-Export tatsächlich pflichtigen Felder sind jetzt farblich markiert, bis
sie ausgefüllt sind · Z_S und Z_L-N/Netzimpedanz einheitlich mit
Pflicht/Optional-Kennzeichnung. Zusätzlich: linker Rand aller PDFs auf 20 mm
vergrößert, damit eine Lochung nicht in Text oder Rahmenlinien läuft.

Geändert wurden zwölf Dateien:
`index.html` · `vde0100.html` · `anschlusspruefung.html` ·
`geraetepruefung.html` · `js/storage.js` · `js/pdf-generator.js` ·
`js/anschluss-generator.js` · `js/geraete-generator.js` ·
`js/pdf-utils.js` · `css/style.css`
sowie neu `js/entwuerfe.js` · `js/statusleiste.js` · `js/pflichtfelder.js`
und zur Versionskennzeichnung `js/app-config.js` · `sw.js`.

---

## 1 · Hausanschluss/Speisepunkt und Seriennummer wurden nicht gespeichert

Beide Felder gehören zu den Stammdaten, die aus den hinterlegten
Auftraggeber-/Messgeräte-Daten automatisch vorbelegt werden. Der Fehler lag
im Zusammenspiel mit dem Autosave: Nach dem Setzen der Stammdaten überschrieb
`restoreProtocolState()` (Wiederherstellung eines vorherigen Zwischenstands)
diese Felder anschließend wieder mit dem alten, leeren Autosave-Wert.

**Jetzt:** Eine zentrale Liste `MASTERDATA_FIELD_IDS` (`js/storage.js`) nimmt
Hausanschluss, Seriennummer und die übrigen Stammdatenfelder beim Wieder­
herstellen ausdrücklich aus, wenn sie gerade frisch aus den Stammdaten gesetzt
wurden. Betroffen in allen drei Protokolltypen (`restoreProtocolState()` in
`js/pdf-generator.js`, `js/anschluss-generator.js`, `js/geraete-generator.js`).

---

## 2 · Prüfstrom für Auslösestrom/-zeit war nicht immer 5×I_n

Bei neu angelegten Stromkreisen war der Prüfstrom nicht durchgehend auf 5×I_n
(max. 40 ms) voreingestellt, wie es DIN VDE 0100-600 für den Standardfall
vorsieht.

**Jetzt:** Neue Hilfsfunktion `pruefstromSel()` setzt bei jeder neuen
Stromkreis-Karte 5×I_n als Vorauswahl, konsistent über alle drei Protokolle.

Betroffen: `js/pdf-generator.js`, `js/anschluss-generator.js`,
`js/geraete-generator.js` (`addCircuitCard()` bzw. entsprechende Karten-Vorlage).

---

## 3 · Netzmessung ohne Frequenzfeld

Der Abschnitt „Netzmessung (optional)" erhob den Anspruch, „Spannungen &
Frequenz" abzudecken, hatte aber kein Frequenzfeld – Frequenz stand
stattdessen als eigenständiges Feld außerhalb des Blocks.

**Jetzt:** Das Frequenzfeld (`netzfrequenz`) ist in den Netzmessung-Block
verschoben, sodass alle sechs Werte (U L1-N/L2-N/L3-N, U L1-L2/L2-L3/L1-L3,
U N-PE, Frequenz) zusammen erfasst werden.

Betroffen: `vde0100.html`.

---

## 4 · Formular nach dem PDF-Export weiter bearbeitbar, mehrere Baustellen parallel

Bisher endete die Arbeit an einem Formular faktisch mit dem PDF-Export – ein
erneutes Öffnen der Seite bot keinen strukturierten Weg zurück zum
Zwischenstand, und zwei Anschlusspunkte gleichzeitig zu bearbeiten war nicht
vorgesehen.

**Jetzt:** Ein komplett neues Entwürfe-System (`js/entwuerfe.js`) verwaltet
beliebig viele parallele „Baustellen-Slots" je Formulartyp. Jedes Protokoll
bekommt eine eigene Entwurf-ID; der Autosave läuft pro Entwurf statt in einem
einzigen globalen Speicherplatz. Ein PDF-Export ersetzt dabei weiterhin
einfach das vorherige PDF desselben Entwurfs (deine bestätigte Vorgabe) – das
Formular selbst bleibt nach dem Export unverändert im aktuellen Entwurf
stehen und ist sofort weiter bearbeitbar. Ältere, vor 4.7.0 gespeicherte
Autosave-Stände werden beim ersten Laden automatisch in das neue System
übernommen (`aktivenEntwurfSicherstellen()`), es geht nichts verloren.

Betroffen: `js/entwuerfe.js` (neu), `js/storage.js`, `js/pdf-generator.js`,
`js/anschluss-generator.js`, `js/geraete-generator.js`.

---

## 5 · Protokoll bleibt bis zum „Neues Formular" editierbar – erst der Ausdruck ist final

Direkt mit Punkt 4 verknüpft: Es sollte klar sein, dass nicht das, was gerade
im Browser steht, das verbindliche Ergebnis ist, sondern das gedruckte PDF.
Ein Entwurf wird jetzt ausdrücklich erst gelöscht, wenn ein neues Formular
angefordert wird.

**Jetzt:** „Neues Formular" fragt nach Bestätigung, legt einen frischen
Entwurf an und lässt den bisherigen Stand unter „Offene Prüfungen" (siehe
Punkt 6) bestehen. Der bisherige Entwurf verschwindet nicht automatisch nach
dem PDF-Export.

Betroffen: `js/storage.js` (`neuesProtokoll()`,
`nachPdfNeuesFormularAnbieten()`).

---

## 6 · Übersicht „Offene Prüfungen"

Damit die parallelen Entwürfe aus Punkt 4/5 nicht nur technisch existieren,
sondern auch auffindbar sind, gibt es jetzt eine Übersicht auf der
Startseite.

**Jetzt:** Neuer Abschnitt „2. Offene Prüfungen" auf `index.html` listet alle
Entwürfe aller drei Formulartypen mit Protokollnummer, Bezeichnung, Ort und
Zeitpunkt der letzten Bearbeitung; von dort aus lässt sich ein Entwurf direkt
öffnen oder löschen.

Betroffen: `index.html`, `js/entwuerfe.js` (`renderOffenePruefungen()`,
`offenePruefungLoeschen()`).

---

## 7 · Protokollnummer zählte nicht automatisch hoch

Beim Anlegen eines neuen Formulars wurde die nächste Protokollnummer zwar
angezeigt, aber nicht tatsächlich verbraucht – ein zweites „Neues Formular"
konnte dieselbe Nummer erneut vorschlagen.

**Jetzt:** `neuesProtokoll()` verbraucht die Nummer sofort beim Anlegen
(`verbraucheProtokollNummer()`), sodass der Zähler bei jedem „Neues Formular"
zuverlässig eins weiterzählt – bestätigt durch deine Auswahl „Zähler soll bei
jedem 'Neues Formular' hochzählen".

Betroffen: `js/storage.js`.

---

## 8 · Feste Statusleiste: immer sichtbar, an welchem Protokoll man arbeitet

**Jetzt:** Neue feste Kopfleiste (`js/statusleiste.js`, `initStatusleiste()`)
zeigt durchgehend Formulartyp, Protokollnummer und – sobald vorhanden –
Anlage/Veranstaltung bzw. Auftraggeber an, wie von dir per „Feste Kopfleiste
(Empfohlen)" bestätigt. Eingebunden in alle drei Formulare.

Betroffen: `js/statusleiste.js` (neu), `vde0100.html`,
`anschlusspruefung.html`, `geraetepruefung.html`, `css/style.css`.

---

## 9 · Einzelnen Stromkreis als defekt/totgelegt markieren

Bisher gab es keine Möglichkeit, einen einzelnen defekten Stromkreis (dein
Beispiel: eine Schuko-Steckdose auf eigener Sicherung) als bewusst
außer Betrieb zu dokumentieren, ohne dass er die Gesamtbewertung des
restlichen, VDE-konformen Verteilers negativ beeinflusst.

**Jetzt:** Jede Stromkreis-Karte hat eine Checkbox „Stromkreis totgelegt /
außer Betrieb" mit Pflicht-Textfeld für die Begründung. Ein totgelegter
Stromkreis wird von der Messwertpflicht ausgenommen (automatisch
ausgeklammert – deine bestätigte Vorgabe „Ja, automatisch ausklammern") und
im PDF als eigene, farblich hervorgehobene Zeile mit Begründungstext
ausgedruckt, statt mit leeren Messwerten in der normalen Tabelle zu
erscheinen. Die Gesamtbewertung des restlichen Verteilers bleibt davon
unberührt.

Betroffen: `js/pdf-generator.js` (`toggleTotlegung()`, Kartenvorlage,
`generatePDF()`), `js/pdf-utils.js` (`prueflingeOhneMessung()` mit
Totlegung-Ausnahme), `css/style.css`.

---

## 10 · Rahmen- und Tabellenlinien zu blass

**Jetzt:** Die Rahmenfarbe (`--border`) wurde von `#cbd5e1` auf `#94a3b8`
verdunkelt; die entsprechenden PDF-Linienfarben (`PDF_BOX_BORDER`,
`PDF_LINE`) sowie die neue zentrale Konstante `PDF_TABLE_LINE` wurden
ebenfalls dunkler gesetzt, damit Kästchen und Tabellenraster auch am
Bildschirm und auf einfachen Kopien gut lesbar bleiben.

Betroffen: `css/style.css`, `js/pdf-utils.js`.

---

## 11 · Messpunkt-Beispiel im ausgefüllten Formular

Die Beispielzeile ist in der App bereits ausschließlich für das *leere*
Formular vorgesehen (`isBlank`-Prüfung); im ausgefüllten PDF konnte in dieser
Prüfung keine „Beispiel"-Zeile nachgewiesen werden. Da keine genauere Angabe
vorlag, an welcher Stelle sie noch auftaucht, wurde die bestehende Logik als
korrekt bestätigt. Sollte sie an einer bestimmten Stelle doch noch auftreten,
bitte mit Formulartyp und Stelle im PDF melden.

---

## 12 · Stromkreisnummerierung ließ Lücken nach dem Löschen

Wurde z. B. Stromkreis Nr. 2 gelöscht, blieben die verbleibenden Karten bei
1, 3, 4 … stehen, statt lückenlos neu durchnummeriert zu werden.

**Jetzt:** Neue zentrale Funktion `nummeriereKartenNeu()` (`js/pdf-utils.js`)
nummeriert nach jedem Hinzufügen oder Entfernen einer Karte alle sichtbaren
Kartenüberschriften lückenlos neu (1, 2, 3, …), ohne die internen
DOM-IDs/Event-Handler zu verändern. Dabei wurde außerdem ein bestehender
Fehler behoben: Das Löschen einer Karte löste bisher keinen Autosave aus.

Betroffen: `js/pdf-utils.js` (`nummeriereKartenNeu()`, `removeCard()`),
`js/pdf-generator.js`, `js/anschluss-generator.js`, `js/geraete-generator.js`.

---

## 13 · Pflichtfelder farblich kennzeichnen, bis sie ausgefüllt sind

Bisher fiel eine fehlende Pflichtangabe erst beim Klick auf „PDF generieren"
auf (Alert-Dialog mit Fokussprung).

**Jetzt:** Neues Modul `js/pflichtfelder.js` (`initPflichtfelder()`) markiert
alle für den PDF-Export tatsächlich verpflichtenden Text-/Datumsfelder
gelblich, solange sie leer sind, und schaltet automatisch auf einen dezenten
Grünton, sobald sie ausgefüllt wurden – reine Anzeige-Hilfe, die eigentliche
verbindliche Prüfung beim Export bleibt unverändert bestehen. Eingebunden in
alle drei Formulare mit ihren jeweils tatsächlich pflichtigen Feldern
(inklusive der bedingten Pflicht von „Frequenz" bei Netzersatzanlage).

Zusätzlich: Z_S und Z_L-N/Netzimpedanz sind jetzt einheitlich mit einer
kleinen Badge „Pflicht" bzw. „Optional" direkt im Label gekennzeichnet
(vorher: Z_S ganz ohne Kennzeichnung, Z_L-N mit unauffälligem
Fließtext-Hinweis „optional") – siehe Punkt 14.

Betroffen: `js/pflichtfelder.js` (neu), `css/style.css`, `vde0100.html`,
`anschlusspruefung.html`, `geraetepruefung.html`.

---

## 14 · Z_S und Z_L-N/Netzimpedanz optisch uneinheitlich

**Jetzt:** Beide Felder tragen dieselbe kleine Badge-Kennzeichnung direkt im
Label (`.feld-badge-pflicht` / `.feld-badge-optional`), sodass auf einen
Blick erkennbar ist, welches der beiden Felder Pflicht und welches optional
ist – in Anlagenprüfung und Anschlussprüfung.

Betroffen: `js/pdf-generator.js`, `js/anschluss-generator.js`,
`css/style.css`.

---

## Zusatz · Linker Rand aller PDFs auf 20 mm vergrößert (Lochung)

Auf deinen Hinweis, dass die Protokolle gelocht und abgeheftet werden: Der
linke Seitenrand aller drei Protokolltypen wurde von 10 mm auf **20 mm**
vergrößert (`PDF_MARGIN_LEFT` in `js/pdf-utils.js`), der rechte Rand bleibt
bei 10 mm. Das reicht deutlich über den Bereich hinaus, den ein
Standard-Locher beansprucht (Lochmittelpunkt üblicherweise bei ca. 12–15 mm
vom Rand).

Diese Änderung betraf sehr viele Einzelpositionen in allen drei
PDF-Generatoren (Kopfzeile/Titel, alle Tabellen, Beschriftungszeilen,
Ankreuzfelder, Fußbereich) – nicht nur die zentrale Randkonstante, sondern
auch etliche bislang fest verdrahtete x-Koordinaten, die sich nicht
automatisch mitverschoben hätten. Im Zuge dessen wurden zwei bestehende,
vom Rand unabhängige Layout-Fehler mitbehoben, die beim Verschieben des
Rands sichtbar geworden wären: die Beschriftung „Netzmessung:" kollidierte
mit der ersten Werte-Spalte, und mehrere Ankreuzfeld-Zeilen
(„Prüfergebnis", „Potenzialausgleich angeschlossen", „Freigabe zur
Nutzung", „Prüfplakette erteilt", „Sicherer Gebrauch gewährleistet") sowie
das 3-spaltige Sichtprüfungs-Raster überlappten teils mit sich selbst bzw.
der jeweils nächsten Spalte.

Betroffen: `js/pdf-utils.js` (`PDF_MARGIN_LEFT`, `PDF_CONTENT_WIDTH`,
`PDF_TITLE_MAX_WIDTH`, `drawProtokollHeader()`), `js/pdf-generator.js`,
`js/anschluss-generator.js`, `js/geraete-generator.js`.

---

## Prüfung dieser Version

Ausgeführt in Chromium (Playwright):

* Alle drei Formulare sowie `index.html` laden fehlerfrei – **keine
  JavaScript- oder Konsolenfehler**, auch nach Hinzufügen/Löschen von
  Stromkreisen, Aktivieren der Totlegung und Wechsel zwischen Entwürfen.
* Für jedes der drei Protokolle je ein Leerformular und ein mit
  Beispieldaten ausgefülltes Protokoll erzeugt:
  * `pdfinfo`: alle sechs PDFs **1 Seite**, DIN A4, keine Seitenzahl-
    Überraschungen durch den größeren Rand.
  * `pdftotext -bbox`-Auswertung: **kein** Textelement beginnt in allen
    sechs PDFs mehr links von 20 mm (vorher u. a. Feldbeschriftungen,
    Sichtprüfungs-Raster und die Kopfzeile bei 10–16 mm).
  * Zusätzlich ein Mehrseiten-Test mit 17 Stromkreisen (erzwingt einen
    Seitenumbruch, 2 Seiten): auch auf der Folgeseite hält der 20-mm-Rand,
    Kopfzeile und Tabellenraster wiederholen sich korrekt.
  * Gerastert (150 dpi) und visuell verglichen: keine Überlappungen mehr in
    Stammdaten-Zeile „Netzmessung", 3-spaltigem Sichtprüfungs-Raster,
    Ergebnis-/Freigabe-/Plaketten-Ankreuzfeldern.
* Gezielte Funktionsprüfung:
  * Hausanschluss/Speisepunkt und Seriennummer werden nach Übernahme der
    Stammdaten zuverlässig im Formular gehalten und im PDF gedruckt.
  * Neuer Stromkreis: Prüfstrom-Vorauswahl ist 5×I_n.
  * „Neues Formular" erhöht die Protokollnummer und legt einen neuen,
    parallelen Entwurf an; das vorherige Protokoll bleibt unter „Offene
    Prüfungen" erreichbar und editierbar.
  * Pflichtfeld-Kennzeichnung: Feld wird beim Leeren gelb
    (`pflichtfeld-leer`), beim Ausfüllen grün (`pflichtfeld-ok`).
  * Totlegung: Checkbox blendet Begründungsfeld ein; totgelegter Stromkreis
    erscheint im PDF als eigene rote Zeile statt mit leeren Messwerten.
  * Stromkreis-Löschung: verbleibende Karten werden lückenlos neu
    nummeriert (z. B. 1/2/3/4 → nach Löschen von #2 → 1/2/3).
  * „Offene Prüfungen" auf der Startseite listet den zuletzt angelegten
    Entwurf mit Protokollnummer, Bezeichnung und Zeitstempel korrekt auf.

**Nach dem Hochladen:** `APP_VERSION` und `SW_VERSION` stehen beide auf
4.7.0, der Offline-Cache lädt also alles neu und die Nutzer bekommen den
Hinweis „Neue Version verfügbar".
