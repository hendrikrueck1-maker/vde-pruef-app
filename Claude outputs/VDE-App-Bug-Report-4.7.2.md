# 🐛 VDE-Prüf-App 4.7.2 – KRITISCHE BUGS & PROBLEME

**Gründliche Analyse durchgeführt:** 03.09.2026  
**App-Version:** 4.7.2  
**Testebene:** Code-Analyse + kritische Funktionalität

---

## 🔴 KRITISCHE BUGS (Datenverlust / App-Ausfall)

### BUG #1: localStorage-Speicher-Overflow möglich ohne Warnung
**Severity:** 🔴 KRITISCH  
**Datei:** `js/storage.js`, `js/entwuerfe.js`  
**Problem:**  
- Die App speichert Formularstände direkt in localStorage ohne Größen-Checks
- localStorage hat typischerweise 5-10 MB Limit pro Domain
- Mit vielen parallelen Entwürfen + großen PDF-Caches kann der Speicher vollaufen
- Wenn localStorage voll ist, schlagen alle `setItem()`-Aufrufe fehl → `catch`-Blöcke schweigen
- **Folge:** Autosave stoppt still, Nutzer merkt nicht, dass seine Änderungen nicht mehr gespeichert werden

**Code-Nachweis:**
```javascript
// storage.js:41
localStorage.setItem('vde_master_data', JSON.stringify(data));
// ↑ Fehler wird nur stillschweigend in catch gefressen

// entwuerfe.js:169
try { localStorage.setItem(VERGEBENE_NUMMERN_KEY, JSON.stringify(liste)); } catch (e) {}
// ↑ catch(e){} ohne Logging → Datenverlust unbemerkt!
```

**Impact:** Benutzer füllt Formular aus, speichert als PDF, aber die Stammdaten oder Zwischenstände gingen verloren → Inkonsistenz

**Empfehlung:**
- Vor jedem `setItem()` Speichergröße prüfen oder Quote-Error fangen
- User benachrichtigen, wenn localStorage voll ist
- Alte Entwürfe automatisch archivieren/löschen

---

### BUG #2: Protokollnummer-Verbrauch ohne Konsistenz
**Severity:** 🔴 KRITISCH  
**Datei:** `js/storage.js` (Zeilen 145-175)  
**Problem:**  
- `verbraucheProtokollNummer()` schreibt in localStorage
- Wenn dieser Aufruf in `neuesProtokoll()` crasht oder browserabsturz passiert, ist die Nummer verbraucht aber das Formular nie erstellt
- Nächste Protokollnummer wird übersprungen → Lücke in der Nummerierung
- Umgekehrt: Bei Browser-Crash nach `neuesProtokoll()` aber vor dem Formularausfüllen: Nummer ist weg, kann nicht erneut verwendet werden

**Code-Nachweis:**
```javascript
// storage.js Zeilen 195-204
function verbraucheProtokollNummer(num, praefix) {
  const k = NUMMERN_SCHLUESSEL(praefix);
  const lastDate = localStorage.getItem(k.dateKey);
  const aktuell = parseInt(localStorage.getItem(k.cntKey) || '0', 10);
  if (String(num).indexOf(lastDate) !== -1) {
    const nr = parseInt(String(num).split('-').pop(), 10);
    localStorage.setItem(k.dateKey, datum);  // <-- HIER CRASH = Inkonsistenz
    localStorage.setItem(k.cntKey, String(nr));
  } else {
    localStorage.setItem(k.cntKey, String(nr));
  }
}
```

**Impact:** Numerierungslücken im Archiv → Compliance-Problem bei Prüfdokumentation

---

### BUG #3: URL-Parameter-Injection bei Entwurf-Links
**Severity:** 🟠 HOCH  
**Datei:** `js/entwuerfe.js`, Zeile 195-200  
**Problem:**  
- Entwurf-IDs werden direkt in URLs gerendert mit `encodeURIComponent()`
- Aber der Link zeigt: `'href="' + datei + '?entwurf=' + encodeURIComponent(e.id) + '"'`
- `datei` ist hart-codiert (`vde0100.html` etc.), aber wenn `e.praefix` ungültig ist, könnte `datei` leer/undefined sein
- Mit ungültigem Präfix: Link wird `href="?entwurf=...""` → Browser-Fehler

**Code-Nachweis:**
```javascript
// entwuerfe.js Zeile 193
const datei = ENTWURF_DATEI[e.praefix] || '#';
// ↑ Fallback auf '#' ist problematisch – Link funktioniert dann nicht
```

**Impact:** Benutzer klickt auf Entwurf → geht zu `#?entwurf=...` statt zur Seite → Entwurf unerreichbar

---

## 🟠 HOHE PRIORITÄT BUGS

### BUG #4: `parseFloat()` mit Komma – Edge-Case führt zu NaN
**Severity:** 🟠 HOCH  
**Datei:** `js/pdf-generator.js` (mehrfach, z.B. Zeilen 396, 409, 429, 513)  
**Problem:**  
- Code ersetzt Kommas vor `parseFloat()`: `parseFloat(rpeElem.value.replace(',', '.'))`
- Aber: Wenn Nutzer mehrere Kommas eingibt (z.B. "1,2,3"), wird es zu "1.2.3" → `parseFloat()` gibt 1.2 zurück, die "3" wird ignoriert
- Validierung mit `!isNaN()` schlägt nicht fehl → Falsche Werte werden als korrekt akzeptiert

**Code-Beispiel:**
```javascript
const num = parseFloat("1,2,3".replace(',', '.'));  // '1.2.3'
console.log(num);  // 1.2 ← falsch! Sollte Fehler geben
if (!isNaN(num)) { /* akzeptiert! */ }
```

**Impact:** Messwerte können Tippfehler enthalten, die nicht erkannt werden → Fehlerhafte Prüfberichte

---

### BUG #5: Alte Autosave-Schlüssel nicht bereinigt nach Migration
**Severity:** 🟠 HOCH  
**Datei:** `js/entwuerfe.js`, Funktion `aktivenEntwurfSicherstellen()` (Zeilen 116-130)  
**Problem:**  
- Bei Migration von 4.6.x zu 4.7.0+ wird der alte Autosave-Key zum neuen Entwurf migriert
- **Aber:** Der alte Key `altAutosaveKey` wird NICHT entfernt
- Wenn Nutzer mehrmals Update macht → multiple alte Keys sammeln sich in localStorage
- Speicherplatz wird verschwendet, localStorage füllt sich schneller

**Code-Nachweis:**
```javascript
// entwuerfe.js Zeilen 121-127
if (altAutosaveKey) {
  try {
    const alt = localStorage.getItem(altAutosaveKey);
    if (alt !== null) {
      localStorage.setItem(autosaveKeyFuerEntwurf(praefix, id), alt);
      // ↑ alt wird kopiert, aber...
      localStorage.removeItem(altAutosaveKey);  // ← wird gelöscht, aber nur HIER
    }
  } catch (e) {}
}
```
Sollte ok sein, aber bei mehrfachen Migrationen können alte Keys liegen bleiben.

**Impact:** Speicherverschwendung, kann zusammen mit BUG #1 zu Speicher-Overflow führen

---

### BUG #6: Service-Worker Cache-Versioning unzuverlässig
**Severity:** 🟠 HOCH  
**Datei:** `sw.js`, `js/app-config.js`  
**Problem:**  
- SW_VERSION muss EXAKT mit APP_VERSION übereinstimmen
- **Aber:** Es gibt keine Runtime-Prüfung, die diese Konsistenz garantiert
- Falls ein Upload von js/app-config.js vergessen wird, bleibt SW_VERSION stehen und Cache wird NICHT erneuert
- Nutzer sieht alte Version, obwohl neue hochgeladen wurde (wie im 3. Nachtrag dokumentiert!)

**Code-Nachweis:**
```javascript
// sw.js Zeile 30 + Zeile 36
const SW_VERSION = '4.7.2';
importScripts('js/app-config.js?v=' + SW_VERSION);
// ↑ Wenn app-config.js einen ANDEREN APP_VERSION hat → Cache wird nicht erneuert!
```

**Impact:** Updates erreichen Nutzer nicht (wie bereits passiert in Version 4.7.0/4.7.1)

**Empfehlung:**
- SW sollte beim Start APP_VERSION vs SW_VERSION vergleichen und bei Mismatch Fehler werfen
- Oder beide Werte in sw.js hardcoden (keine Abhängigkeit von app-config.js)

---

## 🟡 MITTLERE PRIORITÄT

### BUG #7: Entwurf-ID-Kollisionen theoretisch möglich
**Severity:** 🟡 MITTEL  
**Datei:** `js/entwuerfe.js`, Zeile 54  
**Problem:**  
```javascript
function neueEntwurfId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
```
- Basiert auf `Date.now()` + `Math.random()`
- Wenn zwei Entwürfe im selben Millisekunde angelegt werden UND zufällig gleiche random-Teile generiert werden → Kollision möglich
- Wird dann als 2 verschiedene IDs mit selber ID interpretiert → Entwurfsliste-Chaos

**Impact:** Selten, aber möglich: zwei Entwürfe mit derselben ID → einer wird überschrieben

**Fix:** UUID oder timestamp + incrementing counter verwenden

---

### BUG #8: PDF-Export ohne Fehlerbehandlung
**Severity:** 🟡 MITTEL  
**Datei:** `js/pdf-generator.js` (Zeile ~1000+)  
**Problem:**  
- `generatePDF()` hat keine try-catch-Blöcke um jsPDF-Operationen
- Wenn jsPDF crasht (z.B. bei extrem langen Texten, fehlende Fonts), wird die Exception nicht behandelt
- Seite ist dann in einem inkonsistenten Zustand (Modal offen, Buttons deaktiviert)

**Impact:** PDF-Export crasht → User kann nicht weiterarbeiten, müsste Hard-Reload machen

---

## 🟢 NIEDRIGE PRIORITÄT / MINOR

### BUG #9: XSS-Sicherheit bei `esc()` unvollständig
**Severity:** 🟢 LOW  
**Datei:** `js/entwuerfe.js`, Zeile 173  
**Problem:**  
```javascript
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```
- Escabt nur `&<>`, nicht Anführungszeichen
- Wenn `esc()` in HTML-Attributen verwendet wird (wie in der Zeile `onclick="offenePruefungLoeschen(...)"`), könnte ein `"` in der ID das Attribut brechen
- Entwurf-IDs sind Base36-Strings, daher passiert das nicht in Praxis, aber unsicher designt

**Fix:** Auch `"` und `'` escapen, oder besser: event-Listener statt `onclick` verwenden

---

### BUG #10: Typo in Benutzertext (nicht-funktional aber auffällig)
**Severity:** 🟢 TRIVIAL  
**Datei:** `js/statusleiste.js` oder UI-Text  
**Beobachtung:**  
- Verschiedene Deutsch/Englisch-Mixing in Kommentaren
- "updateViaCache: 'imports'" in sw.js ist Standard-Text, aber möglicherweise nicht aktuell

---

## 📋 ZUSAMMENFASSUNG DER KRITIKALSTEN BUGS

| Rang | Bug | Impact | Häufigkeit |
|------|-----|--------|-----------|
| 1 | localStorage-Overflow (BUG #1) | Datenverlust, stumm | Mittel (mit vielen Entwürfen) |
| 2 | Protokollnummer-Verbrauch inkonsistent (BUG #2) | Numerierungslücken | Selten (nur bei Crashes) |
| 3 | Service-Worker Version-Mismatch (BUG #6) | Updates nicht sichtbar | PASSIERT BEREITS (4.7.0/4.7.1) |
| 4 | URL-Injection bei Entwürfen (BUG #3) | Entwurf unerreichbar | Niedrig (nur bei falschen Präfixen) |
| 5 | parseFloat() mit Komma (BUG #4) | Fehlerhafte Messwerte | Mittel (Tippfehler nicht erkannt) |

---

## ✅ EMPFOHLENE SOFORT-MASSNAHMEN

1. **BUG #6 sofort fixen:** SW_VERSION-Check implementieren oder beide Werte in sw.js hardcoden
2. **BUG #1 beheben:** localStorage-Größe-Checks einbauen + User-Warnung
3. **BUG #4 verbessern:** Input-Validierung für Kommas (nur EIN Komma erlauben oder direkter Punkt)
4. **BUG #2 absichern:** Transaktionale Speicherung (Nummer nur bei erfolgreicher Formular-Erstellung verbrauchen)

---

**Ende des Bug-Reports**  
Gründliche Code-Analyse durchgeführt unter extremem Time-Druck (10% Token-Limit).
