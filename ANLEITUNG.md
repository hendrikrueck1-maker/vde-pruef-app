# Anleitung: App online stellen und offline nutzen

Drei Schritte. Danach läuft die App auf Android und iPad ohne Internet.

**Die Adresse am Ende lautet:**
`https://hendrikrueck1-maker.github.io/vde-pruef-app/`

---

# Schritt 1 – Dateien zu GitHub hochladen

Es gibt zwei Wege. **Weg A** dauert einmalig 5 Minuten länger, dafür sind alle
späteren Änderungen ein Doppelklick. **Weg B** braucht keine Installation,
aber jede spätere Änderung muss von Hand hochgeladen werden.

---

## Weg A – mit Git (empfohlen)

### 1A. Git installieren

Rechtsklick auf das Windows-Startmenü → **Terminal** (oder **PowerShell**).
Dort eintippen und Enter:

```
winget install --id Git.Git -e
```

Warten, bis „Successfully installed" erscheint.

*Falls `winget` unbekannt ist:* https://git-scm.com/download/win herunterladen
und mit allen Standardeinstellungen durchklicken.

### 2A. Computer neu starten

Wichtig – sonst findet Windows das neue Programm noch nicht.

### 3A. `1-EINRICHTEN.bat` doppelklicken

Die Datei liegt im Ordner `vde-pruef-app` auf dem Desktop.

Was passiert:

* Windows fragt eventuell nach einer Bestätigung → **Ja**
* Es öffnet sich ein Browserfenster mit der GitHub-Anmeldung → **anmelden**
  (das passiert nur dieses eine Mal, danach merkt Windows sich das)
* Das Skript lädt alles hoch und meldet am Ende „HOCHLADEN ERLEDIGT"

Das Fenster bleibt offen. **Falls es nicht klappt:** im Ordner liegt danach
eine Datei `deploy-log.txt` – die enthält den genauen Grund.

### 4A. Weiter zu Schritt 2

---

## Weg B – ohne Installation, über die GitHub-Webseite

### 1B. Ordner `ZUM-HOCHLADEN` öffnen

Er liegt in `vde-pruef-app` und enthält bereits **genau** die Dateien, die auf
GitHub gehören – ohne `android-build`, ohne die `.bat`-Skripte.

> Nicht den Ordner `vde-pruef-app` selbst hochladen. Der enthält 18 MB
> Android-Baudateien, die dort nicht hingehören.

### 2B. GitHub-Upload-Seite öffnen

https://github.com/hendrikrueck1-maker/vde-pruef-app/upload/main

(Falls nach Anmeldung gefragt wird: bei GitHub anmelden.)

### 3B. Dateien hineinziehen

1. Im Ordner `ZUM-HOCHLADEN` **alle Elemente markieren**: `Strg` + `A`
   (es müssen 15 Einträge sein – Dateien *und* die Ordner `css`, `js`,
   `icons`, `docs`, `vorlage`)
2. Die Markierung mit gedrückter Maustaste in das Browserfenster ziehen,
   in die Fläche mit „Drag files here"
3. Warten, bis alle Dateien in der Liste erscheinen

> Der Browser fragt eventuell „Möchten Sie mehrere Dateien hochladen?" → **Ja**

### 4B. Änderung speichern

Nach unten scrollen → grüner Knopf **Commit changes**.

### 5B. Kontrolle

Zurück zu https://github.com/hendrikrueck1-maker/vde-pruef-app

Dort müssen jetzt zu sehen sein: `css`, `docs`, `icons`, `js`, `vorlage`,
`index.html`, `manifest.json`, `sw.js`, `vde0100.html`,
`anschlusspruefung.html`, `geraetepruefung.html`.

**Fehlt der Ordner `icons`, hat der Upload nicht funktioniert** – dann Schritt 3B
für diesen Ordner einzeln wiederholen. Ohne `icons` lässt sich die App später
nicht installieren.

---

# Schritt 2 – GitHub Pages einschalten (einmalig)

1. Diese Seite öffnen:
   https://github.com/hendrikrueck1-maker/vde-pruef-app/settings/pages
2. Unter **Build and deployment** → **Source**:
   `Deploy from a branch` auswählen
3. Darunter bei **Branch**: `main` und `/ (root)` auswählen
4. **Save**

Jetzt **1–2 Minuten warten**. Dann diese Adresse öffnen:

**https://hendrikrueck1-maker.github.io/vde-pruef-app/**

Es muss die Startseite mit den drei Protokoll-Kacheln erscheinen.

> Kommt „404"? Noch eine Minute warten und neu laden. Bleibt es dabei,
> prüfen ob `index.html` wirklich im Repository liegt (Schritt 5B).

---

# Schritt 3 – Auf dem Gerät installieren

## Android (Handy oder Tablet)

1. **Chrome** öffnen (nicht Samsung Internet, nicht Firefox)
2. Adresse eingeben:
   `https://hendrikrueck1-maker.github.io/vde-pruef-app/`
3. Oben rechts erscheint der Knopf **„App installieren"** → antippen
   *Falls nicht sichtbar:* Menü **⋮** → **App installieren**
   bzw. **Zum Startbildschirm hinzufügen**
4. Bestätigen

Die App liegt jetzt im App-Menü und startet im Vollbild ohne Browserleiste.

## iPad / iPhone

> Zwingend **Safari** verwenden. Chrome auf iOS kann keine Apps installieren.

1. **Safari** öffnen
2. Adresse eingeben:
   `https://hendrikrueck1-maker.github.io/vde-pruef-app/`
3. Auf **Teilen** ⬆️ tippen (iPad: oben rechts, iPhone: unten Mitte)
4. In der Liste nach unten wischen → **„Zum Home-Bildschirm"**
5. **Hinzufügen**

---

# Schritt 4 – Offline scharf schalten

Damit wirklich alles ohne Internet läuft, muss die App die Seiten einmal
gespeichert haben.

**Mit Internetverbindung**, in der frisch installierten App:

1. App vom Startbildschirm öffnen
2. **10 Sekunden warten** (im Hintergrund wird gespeichert)
3. Nacheinander **jede der drei Kacheln antippen** und wieder zurück:
   * Prüfprotokoll elektrischer Anlagen
   * Anschlussprüfung Übergabepunkt
   * Prüfung elektrischer Geräte
4. App schließen

## Test

1. **Flugmodus einschalten**
2. App starten

Richtig ist:

* Die App startet normal
* Oben erscheint ein oranger Balken
  „⚠️ Offline – Eingaben und PDF-Erstellung funktionieren weiterhin"
* Alle drei Protokolle lassen sich öffnen und ausfüllen
* Die PDF-Erstellung funktioniert

Wenn das klappt, bist du fertig.

---

# Was du danach noch wissen solltest

## Datensicherung (besonders auf dem iPad)

iOS löscht gespeicherte Daten, wenn eine App wochenlang nicht benutzt wird.
Vor längerem Feldeinsatz auf der Startseite unter **„3. Datensicherung"**
auf **„Sicherung exportieren"** tippen und die Datei ablegen.
Zurückholen geht über **„Sicherung einspielen"**.

## PDF speichern

* **Android:** landet in *Downloads*, oder es öffnet sich das Teilen-Menü
* **iPad/iPhone:** es öffnet sich das Teilen-Menü →
  **„In Dateien sichern"**, **„Drucken"** oder **„Mail"**

## Änderungen veröffentlichen

* **Weg A (Git):** `2-AKTUALISIEREN.bat` doppelklicken. Fertig.
* **Weg B (Web):** `3-UPLOAD-ORDNER-NEU-ERSTELLEN.bat` doppelklicken,
  dann Schritt 1B/3B/4B wiederholen.

Auf installierten Geräten erscheint beim nächsten Start mit Internet der
Hinweis **„Neue Version verfügbar"** → antippen.

## Neues Protokoll hinzufügen

Siehe [`docs/ERWEITERN.md`](docs/ERWEITERN.md).
Kurzfassung: Vorlage aus `vorlage/` kopieren, in `js/app-config.js` eintragen,
veröffentlichen. Startseiten-Kachel und Offline-Speicherung entstehen von selbst.

## Vor dem Veröffentlichen lokal testen

`0-LOKAL-TESTEN.bat` doppelklicken → Browser öffnet `http://localhost:8080`.

---

# Wenn etwas nicht klappt

| Problem | Ursache | Lösung |
|---|---|---|
| `1-EINRICHTEN.bat` bricht ab | steht in `deploy-log.txt` | Datei öffnen, Meldung anschauen |
| „Authentication failed" | altes GitHub-Login gespeichert | Systemsteuerung → Anmeldeinformationsverwaltung → Windows-Anmeldeinformationen → Einträge mit „github" löschen → Skript erneut starten |
| Seite zeigt 404 | Pages noch nicht aktiv oder `index.html` fehlt | Schritt 2 prüfen, 2 Minuten warten |
| Seite ohne Layout, nur Text | Ordner `css` und `js` fehlen im Repository | Schritt 3B für diese Ordner wiederholen |
| „App installieren" fehlt (Android) | Ordner `icons` fehlt, oder nicht über `https://` geöffnet | `icons` hochladen, Adresse prüfen |
| Auf iOS kein „Zum Home-Bildschirm" | Chrome statt Safari benutzt | Safari verwenden |
| Offline nur weiße Seite | Schritt 4 übersprungen | Mit Internet öffnen, alle drei Kacheln antippen |
| PDF-Knopf tut nichts (iPad) | veraltete Version im Speicher | App schließen, mit Internet neu starten, Update bestätigen |
| Alte Version wird angezeigt | Offline-Speicher noch aktiv | Mit Internet starten → „Neue Version verfügbar" antippen |
