# Neue Version veröffentlichen und aufs Android-Gerät holen

Gilt für: <https://hendrikrueck1-maker.github.io/vde-pruef-app/>

---

## 0. Vorher: Versionsnummer erhöhen (wichtig!)

In `js/app-config.js` steht ganz oben:

```js
var APP_VERSION = '2.2.0';
```

**Diese Zahl muss bei jeder Änderung hochgezählt werden.** Der Service Worker
benutzt sie als Namen für den Offline-Cache. Ohne Erhöhung behalten alle
installierten Geräte die alte Version — auch nach einem Neustart.

Faustregel: kleine Korrekturen → `2.1.1`, neue Felder/Funktionen → `2.2.0`.

---

## 1. Hochladen zu GitHub

### Variante A – im Browser (ohne Git, am einfachsten)

1. <https://github.com/hendrikrueck1-maker/vde-pruef-app> öffnen und anmelden.
2. Oben **„Add file“ → „Upload files“**.
3. Aus dem Ordner `ZUM-HOCHLADEN` **alle geänderten Dateien** hineinziehen.
   Bei dieser Version sind das:

   ```
   index.html
   vde0100.html
   anschlusspruefung.html
   geraetepruefung.html
   css/style.css
   js/app-config.js
   js/pdf-utils.js
   js/pdf-generator.js
   js/anschluss-generator.js
   js/geraete-generator.js
   docs/UPDATE-VEROEFFENTLICHEN.md
   ```

   Ordner mit hochziehen ist erlaubt – GitHub legt die Struktur automatisch an.
   Gleichnamige Dateien werden überschrieben, das ist gewollt.
4. Unten bei **„Commit changes“** eine kurze Beschreibung eintragen, z. B.
   `v2.2.0: Formular-Feinschliff, keine Vorbelegungen, Beispielzeile ans Tabellenende`.
5. **„Commit changes“** klicken.

### Variante B – mit Git auf dem PC

```bash
cd C:\Users\hendr\OneDrive\Desktop\vde-pruef-app\ZUM-HOCHLADEN
git add -A
git commit -m "v2.1.0: Seitenumbrueche, Messpunkt-Felder, PDF-Download statt Teilen"
git push
```

### Veröffentlichung prüfen

- Im Repository auf den Reiter **„Actions“** gehen. Dort läuft nach dem Commit
  der Job „pages build and deployment“. Grüner Haken = fertig (dauert 1–2 Minuten).
- Danach <https://hendrikrueck1-maker.github.io/vde-pruef-app/> aufrufen.
  Ganz unten rechts muss **„Version 2.2.0“** stehen.

> Falls dort noch die alte Version steht: einmal mit `Strg + F5` neu laden.

---

## 2. Update aufs Android-Gerät holen

Die App ist eine PWA. Sie prüft beim Start selbst, ob es eine neue Version gibt.

### Normalfall

1. App auf dem Handy schließen (aus der App-Übersicht wegwischen, nicht nur
   in den Hintergrund).
2. App wieder öffnen – mit Internetverbindung.
3. Es erscheint der Hinweis **„Neue Version verfügbar“** → antippen
   („Jetzt aktualisieren“). Die App lädt neu und läuft in der neuen Version.
4. Kontrolle: Auf der Startseite unten rechts muss **Version 2.2.0** stehen.

### Wenn der Hinweis nicht kommt

1. Chrome öffnen → <https://hendrikrueck1-maker.github.io/vde-pruef-app/>
2. Menü (⋮) → **Neu laden**, danach die Seite noch einmal aufrufen.
3. Hilft das nicht: Chrome-Menü (⋮) → **Einstellungen → Datenschutz und
   Sicherheit → Browserdaten löschen → „Bilder und Dateien im Cache“** für den
   letzten Tag löschen. Angemeldete Konten und Passwörter bleiben erhalten.
4. Seite erneut öffnen, danach die installierte App starten.

### Notfall (Version bleibt hartnäckig alt)

1. **Vorher: Sicherung exportieren!** Startseite → „⬇️ Sicherung exportieren“.
   Sonst gehen Stammdaten, Protokollzähler und Zwischenspeicher verloren.
2. App deinstallieren (Symbol lange drücken → Deinstallieren).
3. Seite in Chrome öffnen → Menü (⋮) → **„App installieren“ / „Zum Startbildschirm
   hinzufügen“**.
4. Sicherung wieder einspielen: Startseite → „⬆️ Sicherung einspielen“.

---

## 3. Was in Version 2.2.0 neu ist

- **Keine Vorbelegungen mehr** bei Absicherung, RCD-Typ, Bemessungsfehlerstrom
  und RCD-Prüfstrom. Diese Angaben müssen bewusst eingetragen werden; ein
  voreingestelltes „Typ A / 30 mA / B 16A“ hätte sonst ungeprüft im Protokoll
  stehen können. Der Grenzwert der Auslösezeit erscheint erst, wenn der
  Prüfstrom gewählt wurde.
- Beim Stromkreis sind **Schutzleiter und Isolationswiderstand** jetzt zwei
  optisch getrennte Gruppen – am Desktop wirkte die Prüfspannung vorher wie
  eine Angabe zu R_PE.
- **Eingabefelder stehen auf gleicher Höhe** und haben die gleiche Größe
  (feste Label-Höhe, einheitliche Feldhöhe; auf dem Handy wie gehabt untereinander).
- Potenzialausgleich/Erdung: nur noch **ein Messpunkt-Feld** mit deutlich mehr
  Schnellauswahl-Vorschlägen (HES, PA-Schiene, HV, UV, Fundamenterder,
  Blitzschutz, Hauptschutzleiter, Wasser, Heizung, Gas, Klima, Stahlbau,
  Traverse, Bühnenwagen, Kabeltrasse). Häkchenliste und Freitextfeld entfallen.
- Anschlussprüfung: bei „Art der Einspeisung – Sonstiges“ erscheint ein Feld
  für die tatsächliche Herkunft des Stroms. „Geplante Last (kVA)“ je
  Übergabepunkt und „Befristet bis / Rückgabe am“ sind entfallen.
- Die **Beispielzeile steht jetzt am Ende** der Messtabelle, damit die
  Eintragezeilen direkt unter dem Tabellenkopf beginnen.

## Was in Version 2.1.0 neu war

**PDF-Ausgabe**

- PDFs werden jetzt **direkt heruntergeladen**; das Teilen-Fenster erscheint
  nicht mehr. Einstellbar auf der Startseite unter „PDF-Speicherort“:
  Download-Ordner (Standard), fester Ordner (Chrome/Edge am PC) oder
  Teilen-Menü. Auf iPhone/iPad wird automatisch das Teilen-Menü benutzt,
  weil dort ein echter Download technisch nicht funktioniert.
- Seitenumbrüche: Auf Folgeseiten wird jetzt überall derselbe obere Seitenrand
  (25 mm) eingehalten. Inhalte laufen nicht mehr in Kopfzeile oder Fußzeile.
  Auch lange Tabellen brechen sauber um.
- Kopfzeile: Protokoll-Nr., Prüflings-ID, Datum und Seitenzahl auf jeder Seite.
  Der Titel der Anschlussprüfung wurde gekürzt, damit die Kopfzeile in allen
  drei Protokollen gleich aussieht.

**Formulare**

- Alle Protokolle passen wieder auf **eine A4-Seite** – Leerformulare immer,
  ausgefüllte bis 8 Stromkreise bzw. Übergabepunkte. Erst danach entsteht
  eine zweite Seite, und die bricht dann sauber um.
- Platz je Leerformular: 7 Stromkreise (VDE 0100), 10 Übergabepunkte
  (Anschlussprüfung), 16 Geräte (Geräteprüfung) – jeweils zusätzlich zur
  Beispielzeile.
- Die Abschnitte sind nur dezent abgesetzt: zwei abwechselnde, sehr helle
  Grautöne, keine Buntfarben. Druckt auch auf S/W-Geräten sauber.
- Sichtprüfung bleibt dreispaltig (kompakt); die Bezeichnungen sind gekürzt und
  werden bei Bedarf automatisch verkleinert, damit sie nicht mehr unter die
  Kästchen „i.O.” / „n.i.O.” laufen.
- Leerformulare: durchgehende Schreiblinien über die volle Spaltenbreite statt
  kurzer Unterstriche – auch für Protokoll-Nr., Prüflings-ID und Datum im Kopf.
- Beispielzeile mit Grenzwerten und realistischen Werten in jeder Messtabelle
  der Leerformulare (grau/kursiv, gekennzeichnet mit „Bsp”).
- Tabellenköpfe zeigen Größe, Einheit und Grenzwert untereinander
  (z. B. `R_PE (Ohm) / Richtwert <= 0,30`).
- Im ausgefüllten Protokoll werden die angehakten Erdungspunkte als Fließtext
  gedruckt statt als Kästchenraster – das spart zwei Zeilen Bauhöhe.

**Fachliches**

- RCD-Prüfstrom ist überall auf **5 × I∆n** vorausgewählt (Grenzwert 40 ms).
- Neu bei Potenzialausgleich/Erdung: Widerstand R_PA, **Messpunkt/Bezugspunkt**
  (HES, UV, PA-Schiene …), zweiter Messpunkt und ein **Freitextfeld für eigene
  Messstellen** – im ausgefüllten wie im leeren Protokoll.
- Neues Feld **Datum der Unterzeichnung**; es wird unter beide Unterschriften
  gedruckt (vorher stand dort immer eine leere Linie).
- Die Protokoll-Nummer ist jetzt ein normales, überschreibbares Feld.

---

## 4. Kurzfassung zum Abhaken

- [ ] `APP_VERSION` in `js/app-config.js` erhöht
- [ ] Dateien zu GitHub hochgeladen / gepusht
- [ ] „Actions“ zeigt grünen Haken
- [ ] Website zeigt die neue Versionsnummer
- [ ] Handy: App geschlossen, neu geöffnet, Update-Hinweis bestätigt
- [ ] Handy: neue Versionsnummer auf der Startseite kontrolliert
