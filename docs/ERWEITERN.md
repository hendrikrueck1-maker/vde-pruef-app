# Die App erweitern

Diese Anleitung beschreibt, wie du **ohne Hilfe** ein neues Protokoll ergänzt
oder ein bestehendes änderst.

Die Grundregel lautet:

> **Alles Zentrale steht in `js/app-config.js`.**
> Wer dort einen Eintrag ergänzt, bekommt automatisch die Kachel auf der
> Startseite **und** den Offline-Cache – ohne `sw.js` oder `index.html` anzufassen.

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
