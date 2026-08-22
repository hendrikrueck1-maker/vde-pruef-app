# SIMULATION 2: Prüfung mit verschiedenen Personentypen & Lehrjahren

---

## SZENARIO A: LEIHFACHPERSONAL (Veranstaltungstechniker von Agentur)

**Profil:** Erfahren, kennt Veranstaltungstechnik, aber nicht die VDE-Prüfapp  
**Einsatz:** 1-2 Jahre Bühnenbau, aber erste Prüfung mit dieser App  
**Zeit verfügbar:** 1 Stunde zum Lernen

### Phase 1: Onboarding in die APP

```
Techniker öffnet vde0100.html auf Tablet
→ „Okay, sieht aus wie ein normales Formular"
→ Klickt „+ Beispieldaten laden"  ✅

Sieht die Beispieldaten in den Feldern:
- Auftraggeber: Stadttheater Konstanz ✅ Klar
- Gebäude: Dropdown mit Vorlagen ✅ Gut
- Netzsystem: TN-S, TN-C-S, TT, IT ✅ Kennt er

Aber: Beim Feld „Grund der Prüfung" denkt er:
[Auswahl: Wiederholungsprüfung / Neuanlage / Änderung / Erweiterung / Instandsetzung]
→ „Welche nehme ich? Das ist eine neue Bühne auf dem Münsterplatz."
→ Klickt „Erweiterung" (könnte auch „Neuanlage" sein)
❌ App sagt nicht, warum diese Wahl später wichtig ist
```

### Phase 2: Besichtigung mit APP

```
Techniker arbeitet die 9 Punkte durch:

☑ Beschaffenheit der Schutzleiter:
   [Techniker sieht Feld, versteht sofort, was gemeint ist]
   → Tippt: „Kupferkabel 2,5 mm², keine Beschädigungen"  ✅

☑ Zustand der Isolation:
   → Tippt: „OK, sichtbar unbeschädigt"  ✅

☑ Kennzeichnung L/N/PE:
   → Tippt: „Farben korrekt (braun/blau/grün-gelb), alle Leiter gekennzeichnet"  ✅
   → [Auf Tablet ist Tippen langsamer als auf Papier]

[Nach ~30 Min]: Alle 9 Punkte erledigt
❌ ABER: „Sicherheitsbeleuchtung hier auf der Freiluftbühne? Wohin damit?"
❌ ABER: Ein leeres Feld „Sonstiges" hätte geholfen
```

### Phase 3: Messungen mit APP

```
Techniker misst mit Fluke-Gerät:
- R_PE Kreis 1: 0,08 Ω
- Tippt Wert in App: „0.08" (Deutschland: Komma vs. Punkt)

⚠️ PROBLEM: App akzeptiert „0.08" oder „0,08"?
            Manche Geräte export Werte mit Dezimalpunkt.
            Techniker ist unsicher.

→ Tippt mehrfach: „0,08", dann „0.08"
→ App nimmt beides an  ✅ (aber undokumentiert)

R_ISO: 200 MΩ
→ Techniker tippt „200" in Feld „MΩ"
→ Oder tippt „200000000" in Feld „Ω"?
❌ App zeigt nicht, welche Einheit erwartet wird
→ Techniker rät: „wahrscheinlich MΩ, da Mega-"
→ Tippt: „200"  ✅

Z_S: 0,12 Ω
→ Klare Eingabe

[ABER DANN:]
Techniker will Z_L-N eingeben (vom Messgerät gemessen):
→ Sucht Feld... Feld nicht vorhanden  ❌
→ „Okay, dann wird das eben nicht dokumentiert"
→ Schreibt den Wert auf separatem Papier (0,11 Ω)
```

### Phase 4: RCD-Prüfung mit APP

```
Techniker misst:
- I_Δn: 30 mA
- I_Δmess (1×): 29 mA
- I_Δmess (5×): 74 mA
- t_A (5×): 0,04 s

Tippt alle Werte ein.

App zeigt: ✅ BESTANDEN oder ⚠️ WARNUNG?
[Techniker ist unsicher, ob 5×-Wert passt]

→ Googelt auf dem Tablet: „RCD 5×I_Δn Grenzwert"
→ Findet: „max. 2,0 × I_Δn = 60 mA für Typ A"
→ Seine Messung: 74 mA > 60 mA  ❌

Aber App sagt möglicherweise: „OK" (wenn Prüfung nur 1× prüft)
❌ App macht zu wenig Validierung

Techniker: „Das muss ich nachfragen – ich kenne die Validierungslogik nicht."
→ Wartet bis Meister kommt, kostet Zeit
```

---

## SZENARIO B: DOZENT (Berufsschule Elektrotechnik)

**Profil:** Meister ET, kennt VDE 0100 in und aus, lehrt es  
**Einsatz:** Mit Studierenden/Azubis in der Schule prüfübungen  
**Zeit:** Unbegrenzt (Unterricht)

### Phase 1: Erstbewertung der APP

```
Dozent öffnet App, liest Code (sieht JavaScript).

[Analyse im Kopf:]
✅ „Die Formelsatz-Darstellung ist vorbildlich – Ω und ≤ richtig"
✅ „Archiv-Funktion da – Daten werden gespeichert"
✅ „PDF-Export funktioniert – gut für Dokumentation"

❌ „ABER: Z_L-N fehlt – das ist ein Schulungsdefizit!"
❌ „U_L Grenzwert ist hart 50 V codiert – für TT-Systeme falsch!"
❌ „Netzsystem-Feld wird nicht ausgewertet – warum ist es da?"
❌ „Feld Z_S wird eingegeben, aber nicht plausibilitätscheckt – Fehler-Messwerte nicht erkannt!"

[Dozent macht Notizen]
→ "Diese Lücken muss ich im Unterricht klären."
→ "Die App ist ein Werkzeug, aber keine Lehrmaschine."
```

### Phase 2: Nutzung im Unterricht (mit Azubis)

```
Dozent beschließt: App + Papierformular parallel nutzen

Unterricht Lektion 12: „Prüfprotokoll mit App und Formular"

Schritt 1: Theorie
- Dozent erklärt: „Z_S wird aus U_0 / I_K berechnet"
- „Z_L-N muss EXTRA gemessen werden – die App vergisst das!"
- „U_L: Bei uns in der Schule 50 V, aber im Theater 25 V"
- Tafel: „Netzsystem TT bedeutet: Abschaltbedingung ist R_A × I_Δn ≤ 50 V, nicht I_K!"

Schritt 2: Praktikum mit APP
- Azubis öffnen App auf Tablets (3er-Gruppen)
- Präparieren Demonstrationstafel (mit Schleifenimpedanz-Messung)
- Tragen Werte ein

[Azubi 1, 1. Lehrjahr:]
- „Dozent, welcher Wert geht wohin?"
- Dozent zeigt Screenshot an der Wand
- Azubi tippt nach  ✅

[Azubi 2, 2. Lehrjahr:]
- Kennt die Messwerte schon von früher
- Tippt schneller ein
- Fragt: „Wo ist Z_L-N?"  ← Richtig hinterfragt!  ✅

[Azubi 3, 3. Lehrjahr:]
- Vergleicht App-Werte mit Papierformular
- Sieht sofort: „Der Tippfehler ‚Nuten Netzmessung L-L' auf dem Papier"
- Notiert im Hefter: "App besser als Papier (keine Tippfehler)"  ✅

Schritt 3: PDF-Ausgabe vergleichen
- App-PDF wird gezeigt (Tablet an Beamer)
- Dozent: „Seht: Ω und ≤ sind korrekt – nicht ‚Ohm' oder '<=' wie auf altem Papier"
- Azubis sind begeistert  ✅

Schritt 4: Kritische Fragen
- Dozent: „Was würde passieren, wenn die 5×I_Δn-Prüfung bei 74 mA ungültig ist?"
- Azubis diskutieren: „Dann müsste RCD getauscht werden?"
- Dozent: „Genau. Aber die App sagt euch nicht, ob 74 mA schlecht ist oder gut."
- [SCHMERZHAFT: App zeigt keine Validierung]
```

---

## SZENARIO C: AZUBI 1. LEHRJAHR

**Profil:** 16–17 Jahre alt, gerade angefangen, kennt kaum Prüfungen  
**Einsatz:** Schattenhaft mit Meister, erste echte Prüfung überwachen  
**Zeit:** 1 Stunde Anleitung

### Phase 1: Briefing durch Meister

```
Meister: „Du machst heute deine erste richtige Prüfung. Ich zeige dir die App."

[Meister öffnet APP auf Tablet]

Meister: „Hier ist das Formular. Wir füllen das aus wie das Papierformular, aber am Computer."

Azubi 1.LJ: „Okay... Aber wozu denn zwei Systeme?"

Meister: „Weil die App schneller ist und die Rechnung macht. Aber die App hat Fehler – deshalb 
         machen wir auch die Papierkontrolle."

[Das ist VERWIRREND für Anfänger]
❌ Warum zwei Systeme wenn one besser ist?
❌ Was sind die Fehler?
```

### Phase 2: Praktische Prüfung mit APP (Azubi führt, Meister schaut zu)

```
Azubi 1.LJ sitzt vor Tablet. Meister gibt Messwerte vor:

Meister: „Gib das ein: Auftraggeber ist Stadttheater, Konstanz, Bühne Großes Haus."

Azubi tippt: „St-a-d-t-t-h-e-a-t-e-r... K-o-n-s-t-a-n-z..."
            [Tippfehler: „Konstannz"]

❌ KEINE VALIDATION – Azubi bemerkt Fehler nicht
Meister sieht es, korrigiert: „Schau hin, du hast Doppel-n geschrieben."
Azubi: „Ups, tut mir leid."
[Dann hält inne] „Warum prüft das Programm nicht die Rechtschreibung?"

Meister: „Weil Programm nicht alles prüfen kann. Deshalb bist du da."
[Das ist RICHTIG und WICHTIG für Lernziel]  ✅
```

### Phase 3: Messwerte eingeben (Azubi 1.LJ)

```
Meister: „Jetzt die erste Messung: Schleifenimpedanz Z_S ist 0,12 Ohm."

Azubi tippt: „0,12"  [Komma oder Punkt?]
→ System akzeptiert beide  ✅

Meister: „Nächste: R_PE ist 0,08 Ohm."

Azubi: „Was ist denn R_PE?"

[GUTE FRAGE!]
Meister erklärt: „Das ist der Widerstand vom Schutzleiter – zeigt ob die Leitung ok ist."

Azubi: [Versteht das Konzept nun] „Ok!"
→ Tippt: „0,08"  ✅

[10 Werte später]

Meister: „Jetzt die Netzimpedanz Z_L-N: 0,11 Ohm."

Azubi schaut auf Tablet, scrollt: „Ich sehe Z_S, aber kein Z_L-N Feld!"

Meister: [Seufzt] „Ja, die App hat einen Fehler. Z_L-N wird nicht erfasst."

Azubi: „Was tun wir dann?"

Meister: „Schreib es auf separates Papier. Das ist ein bekanntes Problem."

[PROBLEM: Azubi lernt, dass die App fehlerhafte Praxis ist]
❌ Lernerlebnis ist frustrierend
❌ „Warum ist der Fehler nicht behoben?"
```

### Phase 4: RCD-Prüfung erklären (Azubi 1.LJ)

```
Meister: „Jetzt die RCD-Prüfung. Das ist kompliziert – höre gut zu."

Azubi: [Augen werden groß]

Meister erklärt mit Schaubild auf Tablet:
- „I_Δn ist der Nennfehlerstrom – hier 30 mA"
- „I_Δmess (1×) ist der gemessene Fehlerstrom beim 1× Prüfstrom"
- „I_Δmess (5×) ist beim 5× Prüfstrom – das ist wichtig!"
- „t_A ist die Auslösezeit"

Azubi: „Und was sind die Sollwerte?"

Meister: „Für Typ A: 1×I_Δn sollte kleiner als 1,55×I_Δn sein, und 5×I_Δn sollte kleiner 2,0×I_Δn sein."

Azubi: [Verständnis: 0%] „Okay... das verstehe ich nicht."

Meister: „Das ist normal. Im 3. Lehrjahr wirst du das verstehen."

[Das ist pädagogisch nicht ideal]
❌ Azubi 1.LJ wird überfordert
❌ App könnte hier eine visuelle Erklärung geben
✅ ABER: Das ist kein App-Fehler, sondern Komplexität der Norm
```

### Phase 5: PDF sehen (Azubi 1.LJ)

```
Meister: „Jetzt exportieren wir das als PDF."

[Klick auf PDF-Export]

PDF wird erzeugt (10 Sekunden Wartezeit).

Azubi: [Sieht das PDF auf Tablet]
„Wow! Das sieht ja professionell aus! Viel besser als auf dem Papier!"

[Azubi sieht:]
✅ Formelsatz (Ω, ≤) korrekt
✅ Tabelle übersichtlich
✅ Unterschriftsplatz sauber gedruckt
✅ Protokollnummer oben automatisch

Azubi: „Das hätte ich nie so sauber per Hand geschrieben."

Meister: ✅ „Genau das ist der Sinn. Die App macht die Optik gut."

[ABER DANN sieht Azubi den Fehler:]

Azubi: „Hier unten steht: ‚Nuten Netzmessung L-L' – ist das ein Tippfehler?"

Meister: [Irritiert] „Moment... das ist mir nicht aufgefallen. Ja, das ist falsch."

[PROBLEM ERKANNT]
✅ Azubi hat die Aufmerksamkeit für Details!
❌ ABER: Das macht das PDF ungültig?

Meister: „Das werden wir mit berichtigen. Ist ein bekannter Bug in der Vorlage."
```

---

## SZENARIO D: AZUBI 2. LEHRJAHR

**Profil:** 17–18 Jahre alt, hat Grundlagen, erste Messgeräte-Erfahrung  
**Einsatz:** Mit Meister prüfen, eigenverantwortlich Daten eingeben  
**Zeit:** Selbstständig 30 Minuten

### Phase 1: APP selbst öffnen

```
Meister: „Mach du heute die App. Du kennst die Prüfung von der Schule."

Azubi 2.LJ öffnet vde0100.html.

Erste Reaktion: „Okay, ähnlich wie das Papierformular."

[VORTEIL: Wiedererkennung]  ✅

Klickt auf „+ Beispieldaten laden"

[Sieht Vorlage gefüllt]

Azubi: „Praktisch! Ich kann die Beispiele mal anschauen, wie es auszieht."
```

### Phase 2: Stammdaten selbst ändern (Azubi 2.LJ)

```
Azubi ändert:
- Auftraggeber: [Löscht Beispiel, tippt neue Adresse]  ✅
- Gebäude: [Wählt aus Dropdown oder „Sonstiges"]  ✅
- Prüfdatum: [Tippt heute]  ✅
- Messgerät: [Tippt Fluke 1654-B]  ✅

[SCHNELL ERLEDIGT: 5 Min]

Azubi hat keine Fragen – kennt die Struktur.
```

### Phase 3: Messwerte eigentätig eingeben (Azubi 2.LJ)

```
Azubi hat Messgerät (Fluke).

Misst selbstständig:
- R_PE: 0,09 Ω
- R_ISO: 190 MΩ
- Z_S: 0,13 Ω

[Problem taucht auf:]

Messgerät zeigt: Z_S = 0,129 Ω (Dezimalstelle)

Azubi tippt: „0,129"
App akzeptiert  ✅

[ABER:]

Azubi möchte auch Z_L-N eingeben:
Messgerät zeigt: 0,11 Ω

Azubi scrollt auf Tablet... scrollt... findet keine Z_L-N Spalte.

Azubi fragt Meister: „Wo ist Z_L-N?"

Meister: [Frustriert] „Guter Punkt. Das ist ein Fehler der App. Schreib es auf separates Notizblatt."

[PROBLEM-ERKENNUNG: Azubi 2.LJ ist bereits kompetent genug, um Fehler zu sehen]  ✅
```

### Phase 4: RCD-Prüfung (Azubi 2.LJ)

```
Azubi misst mit RCD-Prüfer (Option I und Δn):
- I_Δn: 30 mA
- I_Δmess 1×: 28 mA
- I_Δmess 5×: 71 mA
- t_A: 0,038 s

Azubi prüft mental:
- „28 < 30? Ja ✅"
- „71 < 60? Nein ❌"

Azubi zu Meister: „Hier stimmt die 5×-Messung nicht!"

Meister: [Nickt anerkennend] „Gute Beobachtung! Das ist knapp über der Grenze."

[LERNMOMENT: Azubi versteht Grenzwerte]  ✅

Meister: „Die App sagt dir das nicht automatisch – deshalb musst du es selbst prüfen."

[KRITIKPUNKT: App fehlt Validierung]
```

### Phase 5: PDF exportieren und bewerten (Azubi 2.LJ)

```
Azubi klickt: „PDF erzeugen"

PDF wird erstellt.

Azubi sieht: ✅ Formelsatz korrekt  
            ✅ Tabelle ordentlich  
            ✅ Unterschriftsplatz  
            ⚠️ Spalte „Nuten Netzmessung L-L" (Fehler)  
            ❌ Z_L-N nicht vorhanden (als Feld)  

Azubi zu Meister: „Die App ist fast perfekt, aber das Z_L-N Feld fehlt – und dieser Tippfehler bei ‚Nuten'."

Meister: ✅ „Gute Analyse. Das sind bekannte Lücken. Im 3. Jahr lernst du, was dahintersteckt."
```

---

## SZENARIO E: AZUBI 3. LEHRJAHR

**Profil:** 18–19 Jahre alt, Meisterprüfungskandidat, kann selbstständig Prüfungen leiten  
**Einsatz:** Mit/ohne Meister prüfen, Qualitätskontrolle übernehmen  
**Zeit:** Selbstständig 20 Minuten, dann Kontrolle mit Meister

### Phase 1: APP + Papier bewerten (Azubi 3.LJ)

```
Meister gibt Azubi beide Werkzeuge:
1. vde0100.html (APP)
2. Leeres PDF-Formular (Papier)

Azubi 3.LJ soll BEIDE ausfüllen und vergleichen.

Azubi arbeitet durch App schnell (20 Min).

Dann Papierformular (25 Min) – deutlich langsamer wegen Handschrift.

Vergleich:
- APP: ✅ Schnell, präzise, Formelsatz OK
- Papier: ⚠️ Langsam, Handschrift wird tiny, aber vertraut

Azubi bemerkt:
❌ Spalte „Nuten Netzmessung L-L" ist auf Papier UND in Leerformular ein Fehler
❌ Z_L-N Feld fehlt komplett (APP und Papier)
❌ U_L Grenzwert 50 V ist für Theater zu groß (sollte 25 V sein)
❌ Netzsystem-Feld wird nirgends bewertet
```

### Phase 2: Code-Review Ansätze (Azubi 3.LJ)

```
Azubi ist jetzt kompetent genug, um zu verstehen, was man hätte machen MÜSSEN:

„Wenn ich das coden würde:
- Beim Speichern prüften: Ist Z_S plausibel? (Z_S = U_0 / I_K,min)
- Wenn nicht, Warnung: ‚Z_S unrealistisch – überprüfen'
- Z_L-N Feld ergänzen
- U_L wählbar machen (25 V für Bühne / 50 V für normale Räume)
- Netzsystem auswerten:
  → Falls TT: Prüfbedingung auf R_A × I_Δn ≤ 50 V umschalten
  → Falls IT: Punkt ‚Isolationsüberwachung' hinzufügen
- RCD-Prüfung genauer validieren (1× und 5× Grenzen prüfen)
"

[EXZELLENTE ANALYSE]  ✅
Meister: „Genau so denkst du als Meister. Das ist Qualitätsbewusstsein."
```

### Phase 3: Formular-Optimierung (Azubi 3.LJ)

```
Azubi wird beauftragt: „Erkenne alle Fehler in Papierformular + App und liste sie auf."

[Nach 30 Minuten Analyse:]

Azubi schreibt Report (gekürzt):

Fehler im VDE 0100 APP v4.3.0:
1. Z_L-N Feld fehlt (I_K2 für L-N Fehler nicht dokumentiert)
2. U_L Grenzwert hart auf 50 V (Bühnen brauchen 25 V)
3. Netzsystem wird eingegeben, nicht ausgewertet (TT/IT Logik fehlt)
4. Z_S wird nicht plausibilitätsgeprüft
5. RCD Validierung: 5×-Grenzwert prüfung unklar

Fehler im Leerformular:
1. Spalte „Nuten Netzmessung L-L" ist Tippfehler (sollte Z_L-N sein)
2. PA-Messpunkte: nur 1 Freitextfeld, nicht 12 Einzelpunkte
3. Sicherheitsbeleuchtung fehlt in Besichtigungsliste

[MEISTER LIEST REPORT]

Meister: ✅ „Du hast ALLES gefunden. Das wird an den Entwickler weitergeleitet."
```

### Phase 4: Prüfung leiten (Azubi 3.LJ als Prüfer)

```
Azubi 3.LJ leitet nun selbstständig eine Prüfung:

[Mit APP]
→ Schnelle Eingabe, PDF ist fehlerfrei
→ ABER: Azubi weiß um Lücken, dokumentiert Z_L-N separarat auf Papier
→ ABER: U_L Grenzwert – Azubi notiert: „Für Bühnenbetrieb sollte 25 V sein; gemessen 35 V → OK aber grenzwertig"
→ Netzsystem TT dokumentiert, aber App wertet es nicht aus → Azubi rechnet mental: R_A × I_Δn = 40 Ω × 0,030 A = 1,2 V ✅ OK

[Mit Papier]
→ Deutlich langsamer
→ Handschrift unleserlich
→ Azubi denkt: „Wenn ich Meister werde, nutze ich die App und verbessere sie, nicht die Papiervorlage"

[PROFESSIONELLE HALTUNG]  ✅
```

---

## ZUSAMMENFASSUNG: NUTZERTYPEN & LERNEFFEKTE

| Typ | APP-Erfahrung | Fehler erkannt? | Lerneffekt | Empfehlung |
|---|---|---|---|---|
| **Leihfachpersonal** | Neu | Z_L-N, U_L | Moderate Frustration | Kurz-Training nötig |
| **Dozent** | Kenner | Z_L-N, U_L, Z_S, Netzsystem | Hohes Bewusstsein | Tool für Unterricht gut, aber mit Vorbehalten nutzen |
| **Azubi 1. LJ** | Neue Welt | Nur PDF-Fehler | Überfordert bei Details, aber begeistert vom PDF | Braucht viel Anleitung |
| **Azubi 2. LJ** | Komme zu | Z_L-N, U_L, RCD-Grenzen | Gute kritische Distanz | Self-Service möglich, aber mit Check |
| **Azubi 3. LJ** | Profi | ALLE (Z_L-N, U_L, Netzsystem, Z_S, PA) | Hervorragende Qualitätskontrolle | Kann Fehler-Report schreiben & leiten |

---

## KRITISCHE ERKENNTNISSE

### Was die APP gut macht:
✅ Schnelle Eingabe → Zeitersparnis ≈ 50%  
✅ Formelzeichen korrekt (Ω, ≤, ², µ)  
✅ PDF-Export sauberer als Handschrift  
✅ Automat. Berechnung I_K aus Z_S  
✅ Archiv + Versionskontrolle  

### Was die APP katastrophal vergisst:
❌ Z_L-N – Zweipoliger Fehler nicht dokumentiert (= unvollständige Prüfung!)  
❌ U_L nur 50 V – Bühnen/Theater falsch bewertet  
❌ Netzsystem nicht ausgewertet – TT/IT Logik fehlt  
❌ Z_S wird nicht plausibilitätsgeprüft  
❌ RCD-Grenzen unklar validiert  

### Was beide schlecht machen:
⚠️ Keine Schulung eingebaut (Anfänger sind verloren)  
⚠️ Fehlerhafte Spaltenüberschrift „Nuten..." auf Papier  
⚠️ PA-Dokumentation unstrukturiert  
⚠️ Sicherheitsbeleuchtung/Brandabschottung fehlen überall  

---

## EMPFEHLUNG FÜR PRAXISEINSATZ

**Azubis 1. Lehrjahr:** NUR mit Dozent/Meister + APP zusammen, Papierformular zur Sicherung  
**Azubis 2. Lehrjahr:** APP selbstständig, dann Meister-Check  
**Azubis 3. Lehrjahr:** Beide Werkzeuge meistern, Qualitätskontrolle durchführen  
**Leihpersonal:** Kurz-Einweisung (15 Min) + Checkliste ausgeben (Z_L-N, U_L, PA-Punkte)  
**Dozenten:** APP mit kritischen Anmerkungen nutzen – „Lücken sind absichtlich für euer Verständnis"  

---
