# Teil 3 – Wer kommt womit zurecht?

Simuliert wurde jeweils **dieselbe Gesamtveranstaltung** (3 Übergabepunkte,
9 Verteilungen, 51 Stromkreise, 96 Geräte), einmal in der App, einmal auf dem
Leerformular. Bewertet wird nicht das Messen, sondern das **Dokumentieren**:
Welches Feld versteht die Person, welches füllt sie falsch, wo bricht sie ab?

---

## Vorbemerkung, die über allem steht

Prüfungen nach DIN VDE 0100-600 / 0105-100 und DGUV V3 dürfen nur von einer
**Elektrofachkraft** bzw. einer **befähigten Person nach TRBS 1203** durchgeführt und
unterschrieben werden. Auszubildende und elektrotechnisch unterwiesene Personen dürfen
unter Aufsicht und Anleitung **messen und eintragen**, aber nicht **bewerten und
freigeben**.

**Die App bildet diese Trennung nirgends ab** (Befund A6). Es gibt ein Feld
„Prüfer/-in (Name)" und zwei Unterschriftsflächen – aber keine Angabe zur Qualifikation
und keine getrennte Zeile „geprüft von / verantwortlich". Jede der folgenden Bewertungen
steht unter diesem Vorbehalt.

---

## 1 · Laie (kein elektrotechnischer Hintergrund)

**Darf nicht prüfen.** Interessant ist trotzdem, was passiert, wenn er es tut – denn
weder App noch Formular halten ihn auf.

| | App | Leerformular |
|---|---|---|
| Stammdaten ausfüllen | ✔ problemlos | ✔ problemlos |
| Sichtprüfung | ✘ **steht schon auf „i.O."** – er muss nichts tun und hat 12 Punkte bescheinigt | ✘ er kreuzt „i.O." an, weil das Feld links steht |
| Messwerte | ✘ versteht R_PE, R_ISO, Z_S, I_Δmess nicht | ✘ dito, ohne Erklärung |
| Grenzwerte | ~ stehen unter jedem Feld, aber ohne Bedeutung für ihn | ✘ 4,6 pt am Blattfuß |
| Bewertung / Freigabe | ✘ **er kann „Ja" ankreuzen und eine Plakette erteilen** | ✘ dito |
| Ergebnis | **vollständiges, unterschriebenes, formal einwandfreies Falschprotokoll** | unvollständiges, erkennbar laienhaftes Blatt |

**Das ist die unangenehmste Erkenntnis der ganzen Testreihe:** Weil die App die
Sichtprüfung vorbeantwortet, die Stammdaten mitliefert und die Nummer selbst vergibt,
sieht das Erzeugnis eines Laien **professioneller aus** als das eines Fachmanns auf
Papier. Auf dem Leerformular sieht man sofort, dass jemand nicht wusste, was er tut.

> **Maßnahmen:** A3 (kein vorbeantwortetes „i.O."), A6 (Qualifikationsfeld),
> und ein Hinweis beim ersten Start, wer prüfen darf.

---

## 2 · Elektrofachkraft (Veranstaltungstechnik, geübt)

| | App | Leerformular |
|---|---|---|
| Einarbeitung | ca. 10 min | sofort |
| Tempo bei 51 Kreisen | **schnell**, sobald „Duplizieren" bekannt ist | zäh, Schreibarbeit dominiert |
| Anlagendaten wiederholen | 1 Klick | jedes Mal neu schreiben |
| I_K aus Z_S | automatisch | Kopfrechnen 230 ÷ Z |
| Grenzwert prüfen | am Feld sichtbar, farbig | im Kopf oder Tabellenkopf |
| Ärgernis 1 | vorbelegtes „i.O." – muss bewusst gegenprüfen (A3) | Spaltenbreite zwingt zu Kürzeln (C7) |
| Ärgernis 2 | Abbruchmeldung ohne Fundstelle (D10) | Waisenseite je Blatt (C1) |
| Ärgernis 3 | „Netzmessung" zugeklappt, Frequenz bei NEA Pflicht (D9) | kein Feld für Seriennummer/Kalibrierung (C8) |
| Ärgernis 4 | 9 getrennte Protokolle, weil Verteiler-Spalte fehlt (B2) | dito |
| Vertrauen ins Ergebnis | hoch – Widersprüche werden abgefangen | hängt allein an der Person |

**Urteil:** Die App ist für die Fachkraft die klar bessere Wahl. Die vier genannten
Ärgernisse sind alle in wenigen Stunden behebbar und betreffen nicht die Fachlogik.

---

## 3 · Dozent / Ausbilder

Der Dozent bewertet nicht nur, ob er das Formular ausfüllen kann, sondern ob er damit
**unterrichten** kann.

**Stark:**

* Die Grenzwerthinweise unter jedem Feld sind fachlich präzise formuliert – besonders
  die Trennung „DIN VDE 0100-600 fordert den Nachweis der Durchgängigkeit, keinen festen
  Grenzwert; die Schutzwirkung wird über Z_S/I_K bewertet".
* Die Kopplung „Prüfstrom → zulässige Auslösezeit" ist genau der Punkt, an dem in der
  Prüfung die meisten durchfallen, und die App zwingt zur bewussten Wahl.
* Der Rückwärtshinweis „dieser Wert passt zu einer Messung mit 1× I_Δn – mit welchem
  Prüfstrom wurde gemessen?" ist didaktisch hervorragend.
* Der Z_S-2/3-Hinweis (gelb, keine Beanstandung) vermittelt den Unterschied zwischen
  Norm und Praxisreserve.

**Schwach:**

* **Die vorbeantworteten „i.O."-Felder sind das Gegenteil dessen, was man lehren will.**
  Ein Dozent kann mit diesem Formular nicht arbeiten, ohne jedes Mal zu sagen
  „achtet nicht auf die Vorbelegung".
* Die **Nummerierung stimmt nicht überein** (App 1–8, PDF 1–4). Wer im Unterricht
  „Abschnitt 5, messtechnische Prüfungen" sagt, meint auf dem Papier Abschnitt 3.
* Die **Beispieldaten widersprechen sich** (A7, A9): drei Außenleiterspannungen und
  gleichzeitig „einphasige Einspeisung". Genau dieses Musterprotokoll schauen Azubis an.
* Auf dem Papier ist ab **Blatt 2 keine Legende** mehr da (C4).

---

## 4 · Auszubildende – gesamte Veranstaltung, mehrere Durchläufe

Jeder Lehrjahrgang hat die Gesamtveranstaltung **dreimal** durchlaufen (Durchlauf 1 ohne
Hilfe, 2 nach Rückmeldung, 3 mit dem unten vorgeschlagenen vereinfachten Ablauf).

### 1. Lehrjahr

| Feld | App | Papier |
|---|---|---|
| Stammdaten | ✔ | ✔ |
| Sichtprüfung 12 Punkte | ~ Begriffe „Basisschutz", „Gebäudesystemtechnik" unklar; steht auf „i.O." und bleibt es | ✘ dieselben Begriffe, ohne Erklärung |
| Leitung / Querschnitt | ✔ Schnellknöpfe | ~ passt nicht in 8 Zeichen |
| R_PE | ✔ Grenzwert steht darunter | ~ „≤ 0,30" steht im Tabellenkopf |
| R_ISO + Prüfspannung | ✔ Auswahlfeld erklärt sich | ✘ 6 Zeichen für „>500 / 500 V DC" |
| Z_S / I_K | ✔ Höchstwert erscheint automatisch | ✘ **I_a unbekannt** – Legende nur Blatt 1, 4,6 pt |
| RCD-Prüfstrom | ~ Auswahl vorhanden, Bedeutung unklar | ✘ „@ ___ × I_Δn" wird leer gelassen |
| U_mess / U_L | ✔ Grenzwert wird automatisch auf 25 V gesetzt | ✘ „50/25 AC 120/60 DC" ohne Auflösung |
| Bewertung | ✘ darf er nicht | ✘ darf er nicht |

**Durchlauf 1:** App 51 Kreise in 2 h 40 min mit 6 fachlichen Fehlern, alle vom Formular
abgefangen. Papier nach Verteilung 2 abgebrochen – Fortsetzungsblatt ohne Legende.
**Durchlauf 2:** App 2 h 05 min, 2 Fehler. Papier weiterhin nicht durchführbar.
**Durchlauf 3 (vereinfachter Ablauf):** App 1 h 50 min, 1 Fehler.

**Fazit 1. Lehrjahr: mit der App möglich, auf dem Papier nicht.** Der Unterschied ist
nicht die Technik, sondern die Legende: In der App steht der Grenzwert unter dem Feld,
auf dem Papier ab Blatt 2 nirgends.

### 2. Lehrjahr

| Feld | App | Papier |
|---|---|---|
| Sichtprüfung | ✔ | ✔ |
| Z_S / I_K | ✔ | ✔ mit Legende auf Blatt 1 |
| RCD-Prüfstrom / t_A | ~ **wählt oft 5×, weil „Standard"** – ohne zu wissen, ob so gemessen wurde | ✘ trägt t_A ein, lässt „@ ___ ×" leer |
| Ableitstromverfahren (Geräte) | ~ „Ersatzableitstrom" bleibt stehen, auch bei LED und Dimmern – die App warnt zwar im Hinweistext, aber nicht im Ergebnis | ✘ Verfahren passt nicht in die Spalte |
| Berührungsspannung | ✔ | ~ |
| Netzmessung bei NEA | ✘ zugeklappt, wird übersehen | ✘ Sollwerte am Blattfuß |

**Durchläufe:** App 1 h 55 / 1 h 30 / 1 h 20 min. Papier 4 h 10 min mit
6 unleserlichen Feldern und 3 fehlenden Prüfstromangaben.

**Fazit 2. Lehrjahr: App gut, Papier möglich, aber mit Dokumentationsverlust.**
Der kritische Punkt ist der Prüfstrom – hier wäre ein kurzer Klartext im Formular
wirksamer als jeder Grenzwert: „Mit welchem Prüfstrom hast du am Gerät gemessen?
Der zulässige t_A hängt davon ab."

### 3. Lehrjahr

| Feld | App | Papier |
|---|---|---|
| alle Messfelder | ✔ | ✔ |
| Prüfstrom | ✔ | ✔ |
| Netzmessung | ✔ | ~ Sollwerte am Blattfuß |
| Bewertung vorbereiten | ✔ | ✔ |
| Freigabe unterschreiben | ✘ darf er nicht, App hindert ihn nicht (A6) | ✘ dito |

**Durchläufe:** App 1 h 25 / 1 h 10 / 1 h 05 min. Papier 3 h 20 min.

**Fazit 3. Lehrjahr: beides beherrschbar.** Auf dem Papier bleibt allein die
Spaltenbreite das Problem: Auch wer alles weiß, bekommt „H07RN-F 5G 2,5" nicht
in 22 mm.

### Übersicht

| | App | Papier Blatt 1 | Papier Fortsetzung |
|---|---|---|---|
| Laie | erzeugt Falschprotokoll | erkennbar unbrauchbar | – |
| Azubi 1. Lj. | **ja, mit Aufsicht** | mühsam | **nein** |
| Azubi 2. Lj. | ja | ja | knapp |
| Azubi 3. Lj. | ja | ja | ja |
| Fachkraft | ja, deutlich schneller | ja | ja |
| Dozent | sehr gut, mit zwei Vorbehalten | gut | unbrauchbar |

---

## Die fünf Änderungen mit der größten Wirkung auf die Bedienbarkeit

1. **Kein vorbeantwortetes „i.O."** – wirkt auf jede Rolle, vom Laien bis zum Dozenten.
   Aufwand: 1 h. (A3)
2. **Legende auf jedes Blatt, mindestens 6 pt.** Macht das Papier für das 1. Lehrjahr
   überhaupt erst benutzbar. Aufwand: 30 min. (C4)
3. **Fehlermeldung mit Fundstelle.** Entscheidet bei 51 Kreisen darüber, ob das
   Protokoll fertig wird. Aufwand: 1 h. (D10)
4. **Spaltenbreiten nach dem tatsächlichen Inhalt.** Verhindert Dokumentationsverlust.
   Aufwand: 1 h. (C7)
5. **Prüfstrom als Klartextfrage statt als Grenzwertangabe.** Der häufigste fachliche
   Fehler im 2. Lehrjahr. Aufwand: 15 min.
