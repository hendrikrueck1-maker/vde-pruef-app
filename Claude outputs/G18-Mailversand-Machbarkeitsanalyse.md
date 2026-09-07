# G18: Machbarkeitsanalyse Mail-Versand des Prüfprotokolls

Stand: 7.0.0. Diese Analyse bewertet, ob und wie die App ein fertiges PDF direkt per E-Mail versenden könnte – **es wurde bewusst kein Code umgesetzt**, wie im Auftrag festgelegt.

## Ausgangslage: was die App heute schon kann

Seit `savePdfCompatible()`/`pdfDateiAusgeben()` (js/pdf-utils.js) nutzt die App bereits die native **Web-Share-API** (`navigator.share`) auf allen Geräten, die sie unterstützen (praktisch alle aktuellen iOS/iPadOS- und Android-Browser). Auf iOS greift das automatisch (`isIosLike()`), auf anderen Geräten, wenn in den Einstellungen „Teilen“ als Speichermodus gewählt ist.

Konkret bedeutet das: Ein Fingertipp öffnet bereits heute das systemeigene Teilen-Menü, und der Anwender kann dort **Mail, Outlook, WhatsApp** oder jede andere installierte App auswählen – das PDF hängt dabei fertig an. Für den Praxisfall "Protokoll dem Kunden per Mail schicken" ist das schon jetzt möglich, nur eben mit einem manuellen Zwischenschritt (App auswählen) statt eines automatischen Versands.

## Option A: `mailto:`-Link

**Funktionsweise:** Ein Link/Button öffnet das Standard-Mailprogramm mit vorausgefülltem Betreff/Text.

**Kernproblem:** `mailto:` kann laut Spezifikation **keine Dateianhänge** übergeben. Es gibt keinen Browser, der das zuverlässig unterstützt (frühere nicht standardisierte Parameter wie `attachment=` funktionieren nur in einzelnen älteren Windows-Mail-Clients, nicht im Web). Das fertige PDF müsste also weiterhin separat heruntergeladen und vom Anwender von Hand angehängt werden.

**Bewertung:** Bietet gegenüber dem bereits vorhandenen Teilen-Menü keinen echten Mehrwert – eher einen Rückschritt, da der Anwender zusätzlich zum Herunterladen noch manuell anhängen müsste. **Nicht empfohlen.**

**Aufwand:** ca. 0,5 Stunden (nur zur Vollständigkeit genannt, da praktisch nutzlos).

## Option B: Server-/API-Versand (automatischer Mailversand ohne Zutun des Anwenders)

**Funktionsweise:** Die App lädt das fertige PDF zu einem Server-Backend hoch (z. B. eine kleine Cloud-Function bei einem Mailversand-Dienst wie SendGrid, Mailgun, Amazon SES oder einem eigenen SMTP-Relay), der Server verschickt die Mail mit Anhang.

**Voraussetzungen und Konsequenzen:**

Erstens wird zwingend eine Internetverbindung zum Zeitpunkt des Versands benötigt. Das widerspricht dem heutigen Kernprinzip der App (vollständig offline-fähige PWA, siehe Service-Worker/CORE_ASSETS) – ausgerechnet auf Baustellen oder in Bühnenkellern ohne Netzempfang, wo die App besonders oft eingesetzt wird, würde diese Funktion ausfallen.

Zweitens verlässt das PDF damit erstmals das Gerät des Prüfers und läuft über einen dritten Server. Das Protokoll enthält personenbezogene Daten (Name/Unterschrift von Prüfer und Auftraggeber, Adressdaten der Anlage). Das bedeutet einen AV-Vertrag (Auftragsverarbeitung nach DSGVO) mit dem gewählten Mail-Dienstleister, ein Hosting/Backend, das gewartet und abgesichert werden muss, sowie laufende Kosten (Serverbetrieb + Versandgebühren, üblich ab ca. 10–20 € im Monat für ein kleines Kontingent, je nach Anbieter und Volumen).

Drittens bräuchte die App ein Adressbuch bzw. ein Empfänger-Eingabefeld, eine Bestätigungslogik (Versand erfolgreich/fehlgeschlagen), Fehlerbehandlung bei Netzwerkausfall und eine Warteschlange für „später erneut versuchen“, wenn gerade kein Netz da ist.

**Bewertung:** Technisch machbar, aber ein grundlegend anderer Charakter der App (von „lokal, offline, datensparsam“ zu „braucht Internet, Server, Wartung, laufende Kosten“). Für eine App, die bewusst ohne jede Datenübertragung ins Internet auskommt (siehe Kommentar in archiv.js: „nichts wird ins Internet übertragen“), ist das ein erheblicher konzeptioneller Bruch.

**Aufwand:** grob geschätzt 3–5 Arbeitstage für eine einfache, robuste Umsetzung (Backend-Function, Empfänger-UI, Fehlerbehandlung, Test), zzgl. laufender Betriebskosten und DSGVO-Prüfung/AV-Vertrag.

## Empfehlung

Der bereits vorhandene Weg über `navigator.share()` deckt den eigentlichen Bedarf – „das fertige Protokoll bequem verschicken“ – schon weitgehend ab, ohne Internetpflicht, ohne Server, ohne zusätzliche Kosten oder Datenschutz-Folgen. Der einzige Unterschied zu einem vollautomatischen Versand ist der eine zusätzliche Fingertipp, um im Teilen-Menü „Mail“ auszuwählen.

Falls ein direkter, automatischer Versand aus der App heraus dennoch gewünscht ist (etwa weil regelmäßig an eine feste Adresse verschickt wird), wäre Option B der einzig sinnvolle Weg – dann aber mit Bewusstsein für den Wechsel von „rein lokal“ zu „braucht Internet + Server“. Aus heutiger Sicht wird empfohlen, es zunächst bei der vorhandenen Teilen-Funktion zu belassen und erst bei konkretem, wiederkehrendem Bedarf (z. B. „ich schicke jedes Protokoll an dieselbe feste Adresse“) über Option B nachzudenken – dann ließe sich der Aufwand ggf. durch eine feste Empfängeradresse in den Einstellungen reduzieren.
