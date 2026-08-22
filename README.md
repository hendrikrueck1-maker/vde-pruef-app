# VDE Prüfprotokoll Manager

Browserbasierte App zur Erstellung von VDE-Prüfprotokollen – **online nutzbar,
installierbar auf Android und iPad, vollständig offline lauffähig.**

**Live:** https://hendrikrueck1-maker.github.io/vde-pruef-app/

---

## Fang hier an

**➜ [`ANLEITUNG.md`](ANLEITUNG.md)** – hochladen, veröffentlichen, auf
Android/iPad installieren und offline nutzen. Schritt für Schritt.

## Schnellstart für Eilige

| Ich möchte … | Datei doppelklicken |
|---|---|
| die App **einmalig** ins Internet bringen | `1-EINRICHTEN.bat` |
| Änderungen **veröffentlichen** | `2-AKTUALISIEREN.bat` |
| lokal **testen**, bevor ich veröffentliche | `0-LOKAL-TESTEN.bat` |
| ohne Git über die Webseite hochladen | `3-UPLOAD-ORDNER-NEU-ERSTELLEN.bat` |

Voraussetzung für 1 und 2: nur [Git für Windows](https://git-scm.com/download/win)
(`winget install --id Git.Git -e`). Die GitHub-Anmeldung erledigt Windows selbst
beim ersten Hochladen.

## Weiterführende Anleitungen

| Thema | Datei |
|---|---|
| Kompletter Ablauf von null bis offline | [`ANLEITUNG.md`](ANLEITUNG.md) |
| Nur die Geräteinstallation im Detail | [`INSTALLATION.md`](INSTALLATION.md) |
| Neues Protokoll hinzufügen | [`docs/ERWEITERN.md`](docs/ERWEITERN.md) |
| Was wo geändert wurde und warum | [`docs/TECHNIK.md`](docs/TECHNIK.md) |

## Der wichtigste Satz

> **Neue Protokolle werden in `js/app-config.js` eingetragen.**
> Von dort erzeugen sich Startseiten-Kachel und Offline-Cache automatisch.
> `sw.js` und `index.html` müssen dafür nicht angefasst werden.

---

## Details zur Anwendung


## 🎯 Features

✅ **Drei Protokolltypen:**
- DIN VDE 0100 / 0105 (Erst- und Wiederholungsprüfung von Anlagen)
- Anschlussprüfung Übergabepunkt (Stromversorgung)
- Prüfung elektrischer Geräte (DIN EN 50699 / VDE 0702 – Wiederholungsprüfung; DIN EN 50678 / VDE 0701 – Prüfung nach Reparatur)

✅ **Kernfunktionalität:**
- 📝 Umfangreiche Formulare mit Validierung
- 💾 Automatische Speicherung (localStorage)
- 📥 PDF-Export und Download
- ✍️ Digitale Unterschrifteneingabe
- 📱 Responsive Design für Desktop und Mobile
- 🔄 Beispieldaten zum schnellen Einstieg

## 🗄️ Archiv (neu in 4.0.0)

Jedes **ausgefüllte** PDF wird beim Erzeugen zusätzlich im Gerät abgelegt
(`archiv.html`, Speicher: IndexedDB). Der Download bzw. das Teilen bleibt
unverändert – das Archiv kommt oben drauf.

- Suche über Nummer, Gebäude, Prüfer und Dateiname, Filter je Protokolltyp
- Zeile antippen → Detailansicht mit PDF öffnen, Teilen/Sichern, Löschen
- **Erneut prüfen (Vorlage):** legt ein neues Formular mit den beschreibenden
  Angaben an. Alle Messwerte, Sicht- und Funktionsbewertungen, Unterschriften
  und das Gesamtergebnis bleiben leer – ein übernommener Messwert wäre eine
  Messung, die nie stattgefunden hat.
- Leerformulare werden nicht archiviert.
- Die Daten liegen ausschließlich auf dem Gerät. Vor einem Gerätewechsel die
  PDFs teilen oder sichern; die JSON-Sicherung enthält das Archiv **nicht**.

## 📂 Dateistruktur

```
vde-pruef-app/
├── index.html                          # Startseite / Protokoll-Auswahl
├── vde0100.html                        # VDE 0100/0105 Protokoll
├── anschlusspruefung.html             # Anschlussprüfung
├── geraetepruefung.html               # Geräteprüfung
├── css/
│   └── style.css                       # Haupt-Stylesheet
├── js/
│   ├── vendor/                         # Externe Bibliotheken
│   │   ├── jspdf.umd.min.js           # PDF-Generierung
│   │   ├── jspdf.plugin.autotable.min.js
│   │   └── signature_pad.umd.min.js   # Unterschriften
│   ├── storage.js                      # Stammdaten + Protokollnummern-Zähler
│   ├── pdf-utils.js                    # Gemeinsame Grenzwerte, PDF-Kopf/-Fuss, Helfer
│   ├── pdf-generator.js                # VDE 0100/0105: Formular, Validierung, PDF
│   ├── anschluss-generator.js          # Anschlussprüfung: Formular, Validierung, PDF
│   └── geraete-generator.js            # Geräteprüfung: Formular, Validierung, PDF
└── README.md                            # Diese Datei
```

Jeder Protokolltyp bringt seinen kompletten Ablauf in genau einer Generator-Datei
mit; `pdf-utils.js` und `storage.js` enthalten, was sich alle drei teilen.
Pro Funktionsname existiert genau eine Definition – zusätzliche Dateien mit
gleichnamigen Funktionen würden sich beim Laden gegenseitig überschreiben.

## ⚖️ Normstand und Geltungsbereich

Die hinterlegten Grenzwerte beziehen sich auf:

| Norm | Ausgabe | Verwendung |
|------|---------|-----------|
| DIN VDE 0100-600 | 2017-06 | Erstprüfung Anlagen, Prüfspannungen/Grenzwerte R_ISO |
| DIN VDE 0105-100 | 2015-10 | Wiederholungsprüfung Anlagen |
| DIN VDE 0100-410 | 2018-10 | Abschaltbedingungen, Mindest-Kurzschlussstrom |
| DIN VDE 0100-718 | 2019-06 | Bauliche Anlagen für Menschenansammlungen |
| DIN EN 61008-1 (VDE 0664-10) | 2015-11 | RCD-Auslösezeiten je Prüfstrom |
| DIN EN 50678 (VDE 0701) | 2021-02 | Prüfung elektrischer Geräte nach Reparatur |
| DIN EN 50699 (VDE 0702) | 2021-06 | Wiederholungsprüfung elektrischer Geräte |

**Hinweise zur Bewertung:**

- Der Wert **R_PE ≤ 0,30 Ω** ist bei den *Anlagen*-Protokollen ein betrieblicher
  Richtwert. DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit
  (Prüfstrom ≥ 200 mA), nicht das Einhalten eines festen Widerstands; die
  Schutzwirkung wird über Z_S / I_K bewertet. Bei der *Geräte*prüfung ist der
  Wert dagegen normativ (gestaffelt nach Leitungslänge).
- Die **RCD-Auslösezeit** wird gegen den Grenzwert des tatsächlich verwendeten
  Prüfstroms geprüft: 300 ms bei 1×I∆n, 150 ms bei 2×I∆n, 40 ms bei 5×I∆n.
  Der Prüfstrom ist im Formular anzugeben und wird mit ins PDF übernommen.
- Die **Prüffristen** sind frei wählbar und aus der Gefährdungsbeurteilung
  abzuleiten (DGUV Vorschrift 3 §5; für Versammlungsstätten zusätzlich die
  Vorgaben der jeweiligen Landes-Versammlungsstättenverordnung).

> ⚠️ Dieses Werkzeug **dokumentiert** eine Prüfung, es ersetzt sie nicht.
> Prüfung und Bewertung obliegen der verantwortlichen Elektrofachkraft. Die
> automatischen Grenzwertprüfungen sind eine Hilfestellung und entbinden nicht
> von der fachlichen Beurteilung im Einzelfall. Vor dem Einsatz ist zu prüfen,
> ob die oben genannten Normfassungen noch aktuell sind.

## 🚀 Schnelleinstieg

### Installation
1. Ordner `vde-pruef-app` kopieren
2. `index.html` im Browser öffnen
3. **Fertig!** – Keine Installation notwendig

### Verwendung

**Lokal:**
- Datei einfach öffnen: `Datei > Öffnen` → `index.html` auswählen

**Auf Server hosten:**
```bash
# Mit Python 3:
python -m http.server 8000

# Mit Node.js / http-server:
npx http-server
```
Dann im Browser öffnen: `http://localhost:8000`

**Auf USB-Stick kopieren:**
- Gesamten `vde-pruef-app` Ordner kopieren
- `index.html` öffnen
- Funktioniert auch ohne Internet!

## 📋 Anleitung

### 1. Stammdaten eingeben
- **Auf der Startseite** zentrale Stammdaten (Auftraggeber, Prüfer, Messgerat) eingeben
- Diese werden automatisch in allen Protokollen wiederverwendet
- Klick auf "Stammdaten Speichern"

### 2. Protokoll auswählen
- Gewünschten Protokolltyp auswählen
- "Protokoll starten" klicken

### 3. Formular ausfüllen
- Alle erforderlichen Felder ausfüllen
- Beispieldaten laden: "Beispieldaten laden" Button
- Daten werden **automatisch gespeichert**

### 4. Unterschriften eintragen
- Mit der Maus in die Unterschriftsfelder zeichnen
- "Löschen" Button zum Neustart

### 5. PDF generieren
- Button "Ausgefülltes PDF generieren & herunterladen"
- PDF wird automatisch heruntergeladen
- Dateiname: `VDE-0100_[Protokollnummer].pdf`

## 💾 Datensicherung

### Automatische Speicherung (Autosave)
- Alle Daten werden während der Eingabe automatisch gespeichert
- Beim Neuladen der Seite werden Daten automatisch wiederhergestellt
- Speicherung erfolgt im **Browser-LocalStorage** (ca. 5-10 MB)

### Manuelle Sicherung
- Exportieren Sie regelmäßig PDFs
- Kopieren Sie den Ordner zur Sicherung

### Browser-Unterstützung
| Browser | Status | Speicher |
|---------|--------|----------|
| Chrome / Edge | ✅ OK | 10 MB |
| Firefox | ✅ OK | 10 MB |
| Safari | ✅ OK | 5 MB |
| Mobile Safari | ⚠️ Begrenzt | 5 MB |
| Android Chrome | ✅ OK | 10 MB |

## 🔧 Fehler & Beseitigung

### "PDF wird nicht heruntergeladen"
- Browser-Downloads prüfen
- Pop-up-Blocker deaktivieren
- Andere Browser testen (Chrome empfohlen)

### "Daten sind weg nach Neuladen"
- Browser-LocalStorage leeren: `Strg+Shift+Entf` → "Cookies & Seiten-Daten"
- Vorher Daten als PDF exportieren!

### "Unterschrift sieht verzerrt aus"
- Browser aktualisieren
- Canvas-Zoom (Safari): Seite entsperren/neu laden

### "App lädt nicht"
- Alle Dateien sind vorhanden? (Ordnerstruktur prüfen)
- Browser-Konsole öffnen: `F12` → "Console" Tab
- Fehlermeldungen notieren und melden

## 📱 Mobilgeräte

**iOS (iPad/iPhone):**
- App in Safari öffnen
- Zum Home-Bildschirm hinzufügen (Share > Zum Home-Bildschirm)
- Wie eine App verwenden

**Android:**
- App in Chrome öffnen
- "Zum Home-Bildschirm hinzufügen" oder "Im Play Store anzeigen"

**Tablet-Modus:**
- Responsive Design passt sich automatisch an
- Unterschriften sind auf größeren Displays leichter zu zeichnen

## 🖥️ Offline-Betrieb

Die App funktioniert **vollständig offline**:
- ✅ Formulare ausfüllen
- ✅ Daten speichern
- ✅ PDFs generieren
- ✅ Keine Internetverbindung nötig

**Hinweis:** PDFs werden im Browser generiert (nicht auf dem Server).

## 📊 Daten exportieren

### PDF-Export
- Button "Ausgefülltes PDF generieren & herunterladen"
- Ausgefülltes oder leeres Formular wählbar

### LocalStorage-Backup
Browser-Konsole (`F12`):
```javascript
// Alle Daten exportieren
const backup = {
  master: localStorage.getItem('vde_master_data'),
  vde: localStorage.getItem('vde_autosave'),
  anschluss: localStorage.getItem('anschluss_autosave'),
  geraete: localStorage.getItem('geraete_autosave')
};
console.log(JSON.stringify(backup, null, 2));
// Copy & speichern als .json
```

## 🔐 Datenschutz & Sicherheit

- ✅ **Keine Cloud-Speicherung** – Daten bleiben lokal
- ✅ **Keine Tracking** – Keine externe Verbindung
- ✅ **Keine Authentifizierung** – Für lokale Anwendung
- ⚠️ **Browser-LocalStorage** – Bei Browserdaten-Löschung verloren
- 📥 **Regelmäßig PDFs exportieren** zur Sicherung

## 🐛 Bekannte Probleme & Lösungen

| Problem | Ursache | Lösung |
|---------|--------|--------|
| "Formular wird sehr lang" | Viele Stromkreise/Geräte | Normal, scrollbar nutzen |
| "Unterschrift verwackelt" | Touchpad-Probleme | Mouse/Stylus nutzen |
| "PDF hat falsches Format" | Skalierungsfehler | Zoom auf 100% setzen |
| "LocalStorage voll" | Zu viele Autosaves | Alte Daten löschen, PDFs exportieren |

## 📞 Support

### Troubleshooting
1. Browser-Konsole öffnen (`F12`)
2. Fehler notieren
3. Browser-Cache leeren (`Strg+Shift+Entf`)
4. Seite neu laden

### Falls Fehler bleiben
- App in anderem Browser testen
- Alle Dateien sind vorhanden?
- Antivirus-Software prüfen

## 📝 Technische Details

**Technologie-Stack:**
- HTML5 / CSS3 / JavaScript (Vanilla, keine Framework)
- jsPDF 2.x (PDF-Generierung)
- Signature Pad (Unterschriften)
- LocalStorage API (Datenspeicherung)

**Browser-Kompatibilität:**
- Chrome/Edge: ✅ Vollständig
- Firefox: ✅ Vollständig
- Safari: ✅ Vollständig (neuere Versionen)
- IE11: ❌ Nicht unterstützt

**Dateigröße:**
- HTML: ~50 KB
- CSS: ~5 KB
- JavaScript: ~150 KB
- Vendor-Libraries: ~200 KB
- **Gesamt: ~400 KB** (komprimiert ~150 KB)

## 🎓 Verbesserungen (Optional)

Mögliche zukünftige Features:
- [ ] Cloud-Sync (Google Drive, OneDrive)
- [ ] Digitale Signaturen (Zertifikate)
- [ ] Batch-Export (mehrere PDFs)
- [ ] Titelseite anpassbar
- [ ] Mehrsprachige Oberfläche
- [ ] Zeitstempel & Audit-Log

## 📄 Lizenz

Diese App ist für den internen Gebrauch bestimmt.  
Anpassungen und Modifikationen sind erlaubt.

---

**Version:** 4.4.0  
**Letztes Update:** 2026-08-11  
**Status:** ✅ Produktiv

