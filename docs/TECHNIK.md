# Technische Änderungen – Stand 11.08.2026

## 1. Ausgangslage: Vergleich lokaler Ordner ↔ GitHub-Repository

Verglichen wurden `C:\Users\hendr\OneDrive\Desktop\vde-pruef-app` und
`github.com/hendrikrueck1-maker/vde-pruef-app` (Branch `main`, 5 Commits).

| | lokal | GitHub |
|---|---|---|
| `icons/` (7 PNG) | vorhanden | **fehlte komplett** |
| `js/pwa.js`, `sw.js`, `manifest.json` | aktuell | teils vorhanden, veraltet |
| `js/*-generator.js` | aktuell (11.08.) | älter |
| Standalone-HTML, `android-build/` | vorhanden | fehlte |
| GitHub Pages | – | **nicht aktiviert** |
| `config.xml`, `PWA_SETUP.md`, `ANDROID_INSTALLATION.md` | – | nur im Repo (überholt) |

Ergebnis: Der lokale Stand ist maßgeblich. Ohne die `icons/` hätte sich die App
auf keinem Gerät installieren lassen.

## 2. Der eigentliche Blocker: absolute Pfade

GitHub Pages liefert Projektseiten unter einem **Unterpfad** aus:

```
https://hendrikrueck1-maker.github.io/vde-pruef-app/
```

Alle PWA-Pfade begannen bisher mit `/` und zeigten damit auf die Domain-Wurzel:

| war | wurde aufgelöst zu | Ergebnis |
|---|---|---|
| `href="/manifest.json"` | `…github.io/manifest.json` | 404 – keine Installation möglich |
| `register('/sw.js', {scope:'/'})` | `…github.io/sw.js` | Service Worker verweigert (Scope außerhalb) → **kein Offline** |
| `"start_url": "/index.html"` | `…github.io/index.html` | App startet ins Leere |
| Precache `'/vde0100.html'` | `…github.io/vde0100.html` | 404 |

**Behoben:** Alle Pfade sind jetzt relativ. Die App läuft dadurch unverändert
unter dem Unterpfad, im Wurzelverzeichnis einer eigenen Domain, lokal unter
`http://localhost:8080` und als Android-Asset in der Capacitor-App.

Konkret geändert:

* `manifest.json` – `id`, `start_url`, `scope`, alle `icons`, alle `shortcuts`
* `js/pwa.js` – Registrierung über `new URL('sw.js', document.baseURI)`
* `sw.js` – Precache-Liste wird zur Laufzeit gegen `registration.scope` aufgelöst
* `index.html`, `vde0100.html`, `anschlusspruefung.html`, `geraetepruefung.html` – Manifest- und Icon-Links

## 3. Neu: `js/app-config.js` als einzige Konfigurationsstelle

Bisher war die Liste der Offline-Dateien in `sw.js` fest verdrahtet und die
Kacheln der Startseite waren in `index.html` fest verdrahtet. Ein neues
Protokoll bedeutete Änderungen an drei Stellen – wurde eine vergessen, fiel es
erst im Feldeinsatz ohne Netz auf.

Jetzt gilt: ein Eintrag in `PROTOKOLLE` erzeugt

* die Kachel auf der Startseite (`renderProtokollKacheln()` in `index.html`),
* den Eintrag im Offline-Cache (`sw.js` lädt die Datei per `importScripts`),
* den Eintrag in der Dateiprüfung vor dem Hochladen.

`APP_VERSION` steuert zugleich den Cache-Namen. Erhöhen ⇒ alle Clients laden neu.

## 4. Service Worker

* Precache-Liste kommt aus `app-config.js`, keine Doppelpflege mehr
* Precache einzeln statt `addAll` – eine fehlende Datei bricht nicht mehr die
  gesamte Installation ab
* HTML: Network-First mit Cache-Fallback → immer aktuell, offline nutzbar
* Statische Dateien: Cache-First mit Aktualisierung im Hintergrund
* Nur erfolgreiche Antworten (`response.ok`) werden gespeichert –
  vorher konnten 404-Seiten in den Cache geraten
* Alte Caches werden beim Aktivieren gelöscht

## 5. PDF-Ausgabe auf iPad/iPhone

`doc.save()` von jsPDF erzeugt einen `<a download>`-Klick. In einer vom
Home-Bildschirm gestarteten iOS-App passiert dabei **nichts** – der Knopf wirkte
funktionslos.

Neu in `js/pdf-utils.js`: `savePdfCompatible(doc, dateiname)`

1. Web-Share-API mit Datei → iOS/iPadOS und Android zeigen das Teilen-Menü
   („In Dateien sichern", „Drucken", „Mail")
2. sonst klassischer Download (Desktop, Android)
3. sonst Blob-Link als Notfalllösung

Alle drei Generatoren nutzen jetzt diesen Weg.

## 6. Datensicherung

Neu auf der Startseite unter „3. Datensicherung": Export/Import aller
`vde_*`-Einträge als JSON. Hintergrund: iOS löscht Website-Daten, wenn eine App
längere Zeit nicht benutzt wird. Der Export nutzt ebenfalls das Teilen-Menü.

## 7. Deployment

* GitHub Pages veröffentlicht direkt aus dem Branch `main`, Ordner `/ (root)`.
  Ein GitHub-Actions-Workflow wurde bewusst **nicht** verwendet: er ist ein
  zusätzliches Teil, das ausfallen kann, und bringt hier keinen Vorteil.
  Jeder Push auf `main` wird von GitHub automatisch veröffentlicht.
* `.nojekyll` – verhindert, dass GitHub Dateien mit `_` am Anfang ausfiltert
* `ZUM-HOCHLADEN/` – erzeugte Kopie mit exakt dem Repo-Inhalt, für den
  Upload über die GitHub-Webseite ohne installiertes Git
  (neu erstellen mit `3-UPLOAD-ORDNER-NEU-ERSTELLEN.bat`)
* `.gitignore` – schließt `node_modules`, Gradle-Caches, `.idea`, OneDrive-Temp aus
* `1-EINRICHTEN.bat` – benötigt **nur Git**, kein GitHub CLI. Die Anmeldung
  übernimmt der Git Credential Manager (öffnet einmalig den Browser).
  Schreibt ein vollständiges Protokoll nach `deploy-log.txt`.
* `2-AKTUALISIEREN.bat` / `0-LOKAL-TESTEN.bat` / `3-UPLOAD-ORDNER-NEU-ERSTELLEN.bat`
* `tools/pruefe-dateien.ps1` – prüft vor dem Hochladen Existenz **und
  Groß-/Kleinschreibung** aller eingetragenen Dateien (GitHub Pages läuft auf
  Linux und unterscheidet `Icon.png` von `icon.png`)
* `tools/bump-version.ps1` – erhöht `APP_VERSION` automatisch

Beim ersten Hochladen wird `git merge -s ours` verwendet: die Historie des
Repositories bleibt erhalten, inhaltlich gilt der lokale Stand.

## 8. Android-Build

`android-build/copy-www.js` liest die Protokollseiten jetzt aus
`app-config.js`, statt eine feste Liste zu führen. Die eingecheckten
Capacitor-Assets wurden auf den aktuellen Stand gebracht.

## 9. Geprüft

| Prüfung | Ergebnis |
|---|---|
| 52 HTML-Referenzen unter `/vde-pruef-app/` | alle HTTP 200 |
| Manifest: Scope, Start-URL, 4 Icons, 3 Verknüpfungen | gültig, alle erreichbar |
| Service Worker simuliert (Scope, 23 Precache-URLs, 4 Events) | bestanden |
| SW-Registrierungspfad auf allen Seiten | korrekt |
| Groß-/Kleinschreibung aller Dateien | korrekt |
| PDF-Ausgabe nutzt `savePdfCompatible` | in allen 3 Generatoren |
| Startseite: Kachel-Erzeugung, Versionsanzeige | 3/3 Kacheln korrekt |
| Protokollnummern je Typ getrennt | bestanden |
| Datensicherung erfasst nur `vde_*` | bestanden |
| Erweiterungsweg (neues Protokoll aus Vorlage) | vollständig durchgespielt, bestanden |

**Nicht automatisch prüfbar** (Sandbox ohne Browser): die tatsächliche
Installation auf einem Gerät. Dafür der Test in `INSTALLATION.md`:
App installieren → Flugmodus → App starten.
