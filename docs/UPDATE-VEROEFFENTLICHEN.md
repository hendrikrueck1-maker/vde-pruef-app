# Neue Version veröffentlichen und aufs Android-Gerät holen

Gilt für: <https://hendrikrueck1-maker.github.io/vde-pruef-app/>

---

## 0. Vorher: Versionsnummer an ZWEI Stellen erhöhen (wichtig!)

**Stelle 1 —** `js/app-config.js`, ganz oben:

```js
var APP_VERSION = '2.2.0';
```

**Stelle 2 —** `sw.js`, ganz oben:

```js
const SW_VERSION = '2.2.0';
```

Beide Zahlen müssen **gleich** sein und bei **jeder** Änderung hochgezählt werden.

Warum zwei Stellen? Ein Browser installiert einen neuen Service Worker nur dann,
wenn sich der Inhalt von `sw.js` **selbst** geändert hat. Änderungen an anderen
Dateien reichen nicht: Der alte Service Worker bleibt aktiv und liefert weiter
die alten Dateien aus seinem Offline-Cache. Genau deshalb kann die neue Version
auf GitHub liegen, während das Handy noch die alte anzeigt.

**`sw.js` deshalb immer mit hochladen**, auch wenn sonst nichts daran geändert wurde.

Faustregel: kleine Korrekturen → `2.2.1`, neue Felder/Funktionen → `2.3.0`.

---

## 1. Hochladen zu GitHub

### Variante A – im Browser (ohne Git, am einfachsten)

1. <https://github.com/hendrikrueck1-maker/vde-pruef-app> öffnen und anmelden.
2. Oben **„Add file“ → „Upload files“**.
3. Aus dem Ordner `ZUM-HOCHLADEN` **alle geänderten Dateien** hineinziehen.
   Bei dieser Version sind das:

   ```
   sw.js                  <-- IMMER mitschicken, sonst kommt kein Update an!
   index.html
   vde0100.html
   anschlusspruefung.html
   geraetepruefung.html
   manifest.json
   css/style.css
   js/app-config.js
   js/pwa.js
   js/pdf-utils.js
   js/pdf-generator.js
   js/anschluss-generator.js
   js/geraete-generator.js
   icons/                 <-- kompletter Ordner (fehlte bisher im Repository!)
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

### Neu ab 2.2.0: Update direkt in der App auslösen

Auf der Startseite gibt es unten den Abschnitt **„Version & Update“**:

- **🔄 Nach Update suchen** – fragt sofort beim Server nach. Liegt dort eine
  neuere Version, erscheint das Update-Banner.
- **🧹 Offline-Speicher zurücksetzen** – löscht alle zwischengespeicherten
  Dateien und meldet den Service Worker ab; danach lädt die App alles neu vom
  Server. **Stammdaten, Protokollzähler und Zwischenspeicher bleiben erhalten**
  (die liegen in einem anderen Speicherbereich).

Daneben steht, welche Version läuft und welche Version der Offline-Cache hat.
Weichen die beiden Zahlen voneinander ab, hilft „Offline-Speicher zurücksetzen“.

### Notfall (Version bleibt hartnäckig alt)

1. **Vorher: Sicherung exportieren!** Startseite → „⬇️ Sicherung exportieren“.
   Sonst gehen Stammdaten, Protokollzähler und Zwischenspeicher verloren.
2. App deinstallieren (Symbol lange drücken → Deinstallieren).
3. Seite in Chrome öffnen → Menü (⋮) → **„App installieren“ / „Zum Startbildschirm
   hinzufügen“**.
4. Sicherung wieder einspielen: Startseite → „⬆️ Sicherung einspielen“.

---

## 2b. „App installieren“ erscheint nicht mehr?

Chrome bietet die Installation nur an, wenn das Manifest **erreichbare Icons**
in 192 px und 512 px angibt. Im Repository fehlte der Ordner `icons/` komplett —
die Dateien liefen dadurch auf einen 404 und Chrome hat die App als nicht
installierbar eingestuft.

Abhilfe: den Ordner **`icons/` mit allen 7 Dateien** hochladen
(`icon-192.png`, `icon-512.png`, `icon-192-maskable.png`, `icon-512-maskable.png`,
`icon-1024.png`, `apple-touch-icon.png`, `favicon-32.png`).

Prüfen lässt sich das direkt im Browser: <https://hendrikrueck1-maker.github.io/vde-pruef-app/icons/icon-192.png>
muss das App-Symbol zeigen und darf keine 404-Seite liefern.

Weitere Gründe, warum kein Installations-Hinweis kommt:

- Die App ist auf dem Gerät **bereits installiert** (dann ist das Verhalten korrekt).
- Sie wurde schon einmal installiert und wieder gelöscht – Chrome fragt dann eine
  Weile nicht erneut. Über ⋮ → **„App installieren“** geht es trotzdem.
- Die Seite wurde nicht über **https** geöffnet.

## 3. Was in Version 2.2.0 neu ist

**Update-Mechanismus (der Grund, warum 2.2.0 nicht ankam)**

- `sw.js` hat jetzt eine eigene `SW_VERSION`. Dadurch ändert sich die Datei bei
  jedem Release und der Browser erkennt das Update zuverlässig.
- Der Service Worker wird mit `updateViaCache: 'none'` registriert und
  `js/app-config.js` per `?v=` geladen – vorher kam die Versionsdatei aus dem
  HTTP-Cache, sodass die neue Nummer gar nicht bemerkt wurde.
- Die App sucht beim Start, beim Wechsel in den Vordergrund und beim
  Online-Gehen aktiv nach Updates (höchstens einmal pro Minute).
- Zusätzliches Sicherheitsnetz: Die laufende Version wird direkt mit der Version
  auf dem Server verglichen. Weicht sie ab, erscheint ein Banner – auch dann,
  wenn der Service-Worker-Mechanismus klemmt.
- Neue Knöpfe „Nach Update suchen“ und „Offline-Speicher zurücksetzen“.


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
