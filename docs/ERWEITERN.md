# Die App erweitern

Diese Anleitung beschreibt, wie du **ohne Hilfe** ein neues Protokoll ergänzt,
ein bestehendes Feld änderst oder ein komplettes Protokoll änderst.

Zwei Grundregeln:

> **Alles Zentrale (Protokoll-Liste, Offline-Cache) steht in `js/app-config.js`.**
> Wer dort einen Eintrag ergänzt, bekommt automatisch die Kachel auf der
> Startseite **und** den Offline-Cache – ohne `sw.js` oder `index.html` anzufassen.

> **Ein Formularfeld, das in mehreren Protokollen vorkommt, steht in
> `js/pruefschritte.js`.** Wer dort einen Baustein ändert (z. B. eine
> Dropdown-Option ergänzt), ändert ihn automatisch in JEDEM Protokoll, das
> ihn verwendet – siehe Abschnitt G.

---

## A. Neues Protokoll hinzufügen (ca. 15 Minuten)

### Schritt 1 – Dateien aus der Vorlage kopieren

| Vorlage | Kopieren nach | Bedeutung |
|---|---|---|
| `vorlage/protokoll-vorlage.html` | `meinprotokoll.html` (Hauptordner!) | das Formular |
| `vorlage/protokoll-vorlage-generator.js` | `js/meinprotokoll-generator.js` | die PDF-Ausgabe |

> Die HTML-Datei muss im **Hauptordner** liegen, nicht in einem Unterordner –
> sonst stimmen die Pfade zu `css/` und `js/` nicht mehr.

### Schritt 2 – In der HTML-Datei die drei „ANPASSEN"-Stellen bearbeiten

1. `<title>` – Titel im Browser-Tab
2. `<script src="js/protokoll-vorlage-generator.js">` → auf deinen Dateinamen ändern
3. `<h1>` und Normbezug in der Kopfzeile

Danach die eigenen Felder eintragen. Wichtig: jedes Eingabefeld braucht eine
eindeutige `id`, denn der Generator liest die Werte über diese `id` aus.

### Schritt 3 – Den Generator anpassen

In `js/meinprotokoll-generator.js`:

* Funktionsnamen `generiereVorlagePdf` in etwas Eigenes umbenennen
  (und in der HTML-Datei beim `onclick` genauso ändern)
* `VORLAGE_KOPF` mit Titel und Normzeile füllen
* Die `body:`-Zeilen der Tabellen mit deinen Feld-`id`s befüllen

### Schritt 4 – In `js/app-config.js` eintragen

```js
var PROTOKOLLE = [
  …bestehende Einträge…,
  {
    id: 'meinprotokoll',
    datei: 'meinprotokoll.html',
    titel: 'Mein neues Protokoll',
    kurz: 'Neu',
    norm: 'DIN VDE XXXX',
    beschreibung: 'Kurze Beschreibung für die Kachel auf der Startseite.',
    status: 'aktiv',                            // oder 'geplant' zum Ausgrauen
    scripts: ['js/meinprotokoll-generator.js']  // alle zusätzlichen JS-Dateien!
  }
];
```

> **Das Feld `scripts` ist wichtig.** Was dort nicht steht, landet nicht im
> Offline-Cache und fehlt später ohne Internet.

### Schritt 5 – Testen

`0-LOKAL-TESTEN.bat` doppelklicken → Browser öffnet `http://localhost:8080`.

Prüfen:

* [ ] Neue Kachel erscheint auf der Startseite
* [ ] Formular öffnet sich, Stammdaten sind vorausgefüllt
* [ ] PDF-Erstellung funktioniert
* [ ] In den Entwicklertools (F12) → Konsole: keine roten Fehler

### Schritt 6 – Veröffentlichen

`2-AKTUALISIEREN.bat` doppelklicken. Das Skript

1. prüft, ob alle eingetragenen Dateien wirklich existieren,
2. zählt die Versionsnummer hoch,
3. lädt alles zu GitHub hoch,
4. GitHub veröffentlicht die Seite automatisch (dauert 1–2 Minuten).

Auf bereits installierten Geräten erscheint beim nächsten Start der Hinweis
**„Neue Version verfügbar"**.

---

## B. Ein bestehendes Protokoll ändern

Einfach die jeweilige HTML- oder JS-Datei bearbeiten, lokal testen und
`2-AKTUALISIEREN.bat` starten. Mehr ist nicht nötig.

---

## C. Eine neue gemeinsame Datei hinzufügen

Zum Beispiel eine weitere Bibliothek oder ein zweites Stylesheet:

1. Datei ablegen (z. B. `js/vendor/neue-lib.js`)
2. In `js/app-config.js` unter `CORE_ASSETS` eintragen
3. In den HTML-Dateien einbinden, die sie brauchen

---

## D. Startseite umbauen

Die Kacheln werden aus `PROTOKOLLE` erzeugt (Funktion `renderProtokollKacheln`
unten in `index.html`). Reihenfolge der Kacheln = Reihenfolge in `app-config.js`.
Ein Protokoll mit `status: 'geplant'` wird ausgegraut und nicht verlinkt.

---

## E. Häufige Fehler

| Symptom | Ursache | Lösung |
|---|---|---|
| Seite lädt, aber ohne Styling | Pfad mit `/` begonnen | Pfade relativ schreiben: `css/style.css`, nicht `/css/style.css` |
| Neue Seite offline nicht erreichbar | nicht in `app-config.js` eingetragen | Eintrag ergänzen, Version hochzählen |
| Änderung erscheint nicht | alter Offline-Cache | `APP_VERSION` erhöhen (macht `2-AKTUALISIEREN.bat` automatisch) |
| „App installieren" fehlt | über `file://` geöffnet | Über `http://localhost` oder die GitHub-Pages-Adresse öffnen |
| PDF-Knopf tut auf dem iPad nichts | alte Version ohne `savePdfCompatible` | Generator muss `savePdfCompatible(doc, name)` statt `doc.save(name)` verwenden |
| `2-AKTUALISIEREN.bat` meldet fehlende Datei | Tippfehler in `app-config.js` | Dateinamen und Groß-/Kleinschreibung prüfen |

> **Groß-/Kleinschreibung:** Windows ist tolerant, GitHub Pages (Linux) nicht.
> `Icons/Icon-192.png` und `icons/icon-192.png` sind dort zwei verschiedene Dateien.

---

## F. Wenn etwas kaputt geht

Der letzte funktionierende Stand liegt immer auf GitHub. Zurücksetzen:

```
git log --oneline          # Liste der letzten Änderungen
git revert <kennung>       # letzte Änderung rückgängig machen
git push origin main
```

Oder auf github.com im Reiter **Commits** die gewünschte Version ansehen
und einzelne Dateien wiederherstellen.

---

## G. Ein bestehendes Feld ändern (das in mehreren Protokollen vorkommt)

Seit Version 9.1.0 gibt es `js/pruefschritte.js` – die zentrale Bibliothek
für Formularfelder, die wortgleich in mehreren der drei Protokolle
vorkommen (z. B. „Gebäude / Bereich“, „Anschlusskabel der Anlage“,
„Prüfintervall“). Auf **pruefschritte-uebersicht.html** (Link auf der
Startseite: „🧩 Prüfschritt-Übersicht“) siehst du auf einen Blick, welche
Bausteine es gibt, wie sie heißen und in welchen Protokollen sie erscheinen.

Seit Version 9.2.0 (Welle 2) gehören auch die RCD-/Absicherungs-Bausteine
der Stromkreis-Karte (vde0100.html) und des Übergabepunkts
(anschlusspruefung.html) dazu: `schutz_basisdaten`,
`absicherung_schleifenimpedanz`, `rcd_typ_hauptfeld` und `rcd_messwerte`.
Bei der Stromkreis-Karte werden diese Bausteine NICHT über
`data-pruefschritt`-Marker eingebunden (die Karte entsteht per JavaScript-
Template-String in `addCircuitCard()`, `js/pdf-generator.js`), sondern
direkt per Funktionsaufruf, z. B.
`PRUEFSCHRITTE.schutz_basisdaten.html({ idSuffix: '_' + cardCounter,
mitCardId: true, cardIdAusdruck: cardCounter, ... })`. Wer an diesen vier
Bausteinen etwas ändert, ändert es automatisch in BEIDEN Stellen (Karte und
Übergabepunkt) – Geräte-Karten (geraetepruefung.html) haben keinen RCD-Block
und sind davon nicht betroffen.

### Schritt 1 – Den Baustein finden

Öffne `pruefschritte-uebersicht.html` (lokal oder online) und suche den
betroffenen Baustein. Der Name in der grauen Box (z. B. `gebaeude_bereich`)
ist der Schlüssel, den du in `js/pruefschritte.js` findest.

### Schritt 2 – In `js/pruefschritte.js` ändern

Jeder Baustein ist ein Eintrag in `PRUEFSCHRITTE`, z. B.:

```js
PRUEFSCHRITTE.gebaeude_bereich = {
  ...
  optionen: ['Gr. Haus', 'Werkstatt', 'Spiegelhalle', 'Münsterplatz', 'Probebühne'],
  html: function (ctx) { ... }
};
```

Passe die Optionen-Liste, den Text oder das erzeugte HTML an. Die Änderung
gilt automatisch in JEDEM Formular, das `<div data-pruefschritt="…">` mit
diesem Schlüssel enthält – ohne dass du die einzelnen HTML-Dateien anfassen
musst.

**Wichtig:** IDs, Klassennamen und `onchange`/`oninput`-Aufrufe innerhalb
eines Bausteins sollten unverändert bleiben, außer du passt auch den
zugehörigen Code in `storage.js`/`pdf-utils.js`/den drei `*-generator.js`
an, der über genau diese IDs/Klassen auf das Feld zugreift (PDF-Ausgabe,
Autosave, Pflichtfeld-Kennzeichnung).

### Schritt 3 – Einem Formular einen bestehenden Baustein neu zuordnen

Um einen Baustein in einem WEITEREN Protokoll erscheinen zu lassen, genügt
in der jeweiligen HTML-Datei:

```html
<div data-pruefschritt="pruefer_qualifikation"></div>
```

Voraussetzung: `<script src="js/pruefschritte.js">` ist im `<head>`
eingebunden (vor dem jeweiligen `*-generator.js`) und `renderPruefschritte()`
wird im `<script>`-Block am Seitenende als ALLERERSTES aufgerufen (vor
`applyMasterDataToForm()` und allen anderen Initialisierungen).

### Schritt 4 – Ein komplett neues, wiederverwendbares Feld anlegen

Neuen Eintrag in `PRUEFSCHRITTE` ergänzen (Vorbild: einer der bestehenden
Bausteine), dann wie in Schritt 3 per `data-pruefschritt="…"` einbinden.
Trage den neuen Baustein danach in `pruefschritte-uebersicht.html` unter der
passenden `gruppe` ein (geschieht automatisch, sobald `gruppe` im Eintrag
gesetzt ist – die Übersichtsseite liest direkt aus `PRUEFSCHRITTE`).

### Wann NICHT über pruefschritte.js gehen

Ein Feld, das nur in EINEM einzigen Protokoll vorkommt und dort auch bleiben
soll, gehört weiterhin direkt ins jeweilige HTML (wie vor Version 9.1.0) –
die Bibliothek ist nur für wirklich geteilte Bausteine gedacht.

### Testen nach einer Änderung

Wie immer: `0-LOKAL-TESTEN.bat`, alle betroffenen Formulare öffnen, Browser-
Konsole (F12) auf Fehler prüfen, dann `2-AKTUALISIEREN.bat`.

### Testwerkbank (seit 9.2.0): einzelne Felder isoliert ausprobieren

Auf **pruefschritte-uebersicht.html** gibt es unterhalb der Bausteinliste
einen Bereich „Testwerkbank" mit drei Reitern (Anlage/Anschluss/Gerät). Jeder
Reiter lädt das ECHTE Formular in einem eingebetteten Fenster (iframe) – kein
zweiter, separat gepflegter Nachbau der Formulare, sondern buchstäblich
dieselbe Seite. Dadurch funktionieren alle Felder, Schnellwahl-Buttons und
Live-Validierungen exakt wie im echten Formular, und die Werkbank veraltet
nie, egal was an den Formularen geändert wird.

Eingaben auf der Werkbank werden **nicht gespeichert** – weder als Autosave
noch als Eintrag unter „Offene Prüfungen". Das steuert der URL-Parameter
`?werkbank=1`, den die Werkbank beim Laden des jeweiligen Formulars anhängt:
`js/entwuerfe.js` prüft `WERKBANK_MODUS` (gesetzt, wenn die Seite in einem
iframe UND mit `?werkbank=1` geöffnet wird) und überspringt dann jegliches
Schreiben in `localStorage`. Wer ein Formular testet, das noch nicht über
diesen Mechanismus abgesichert ist (z. B. ein komplett neues Protokoll nach
Abschnitt A), sollte in dessen Autosave-Funktion denselben Guard ergänzen:

```js
function autosaveProtocol() {
  if (typeof WERKBANK_MODUS !== 'undefined' && WERKBANK_MODUS) return;
  // ... bestehender Code ...
}
```

**Wichtig bei einer neuen APP_VERSION:** `js/pwa.js` lädt bei jedem
Formular-iframe einen eigenen Service-Worker-Kontext; ohne Sonderregel würde
ein SW-Update (ausgelöst z. B. durch das Öffnen eines Werkbank-Tabs) sowohl
das iframe als auch die ÜBERGEORDNETE Werkbank-Seite automatisch neu laden
und damit alle offenen Test-Tabs verwerfen. Deshalb: `pwa.js` überspringt den
Auto-Reload in jedem iframe UND auf jeder Seite, die vorher
`window.PWA_KEIN_AUTO_RELOAD = true` setzt (siehe Kopf von
pruefschritte-uebersicht.html). Diese Regel muss bei neuen, lange offen
gehaltenen Seiten (z. B. einer künftigen zweiten Werkbank-Variante)
entsprechend übernommen werden.
