/* ============================================================================
 *  fotos.js  –  FOTODOKUMENTATION JE STROMKREIS/PRUEFLING (G17, ab 7.0.0)
 * ----------------------------------------------------------------------------
 *  Optionale Foto-Anlage zu einem Mangel oder einer auffaelligen Stelle,
 *  direkt an der jeweiligen Karte (Stromkreis in vde0100.html, Uebergabepunkt
 *  in anschlusspruefung.html, Geraet in geraetepruefung.html).
 *
 *  SPEICHERUNG: IndexedDB (Datenbank 'vde_fotos', separat von 'vde_archiv' in
 *  archiv.js - Fotos gehoeren zum LAUFENDEN Entwurf, nicht zu einem bereits
 *  abgeschlossenen archivierten Protokoll). Binaerdaten (komprimierte JPEG-
 *  Blobs) koennen NICHT wie der uebrige Formularzustand ueber
 *  localStorage/collectProtocolState() gesichert werden (Groessenlimit von
 *  localStorage liegt bei wenigen MB) - deshalb ein eigener Speicherpfad,
 *  der nur ueber eine ID (entwurfId + Kartenkey) mit dem jeweiligen Entwurf
 *  verknuepft ist.
 *
 *  KOMPRIMIERUNG VOR DEM SPEICHERN: jedes Foto wird vor dem Speichern per
 *  <canvas> auf max. 1600 px lange Kante herunterskaliert und als JPEG
 *  (Qualitaet 0.72) neu kodiert - ein typisches 12-MP-Handyfoto (4-8 MB)
 *  wird dadurch auf ca. 150-400 KB reduziert, damit auch mehrere Dutzend
 *  Fotos in einem Entwurf nicht an Speichergrenzen des Geraets stossen.
 *
 *  EINBINDUNG INS PDF: pdf-generator.js ruft fotosFuerKarteLaden(kartenKey)
 *  auf und fuegt die Fotos als eigenen Abschnitt "Fotodokumentation" am Ende
 *  des Protokolls ein (siehe dortiger Aufruf). Nur klassisches "var"/function
 *  - die Datei wird auch vom Service Worker vorgehalten.
 * ========================================================================== */

var FOTOS_DB = 'vde_fotos';
var FOTOS_DB_VERSION = 1;
var FOTOS_STORE = 'fotos';
var FOTOS_MAX_KANTE = 1600;      // px, laengere Bildkante nach Komprimierung
var FOTOS_JPEG_QUALITAET = 0.72;
var FOTOS_MAX_PRO_KARTE = 6;     // Deckel gegen versehentliches Massen-Hochladen

function fotosDbOeffnen() {
  return new Promise(function (resolve, reject) {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB nicht verfügbar'));
    var req = indexedDB.open(FOTOS_DB, FOTOS_DB_VERSION);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains(FOTOS_STORE)) {
        var store = db.createObjectStore(FOTOS_STORE, { keyPath: 'id' });
        store.createIndex('kartenKey', 'kartenKey');
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function fotosTx(modus, arbeit) {
  return fotosDbOeffnen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(FOTOS_STORE, modus);
      var store = tx.objectStore(FOTOS_STORE);
      var ergebnis;
      try { ergebnis = arbeit(store); } catch (e) { reject(e); return; }
      tx.oncomplete = function () { db.close(); resolve(ergebnis && ergebnis.result !== undefined ? ergebnis.result : ergebnis); };
      tx.onerror = function () { db.close(); reject(tx.error); };
    });
  });
}

/* Eindeutiger Schluessel je Karte: Entwurf-ID (autosave-uebergreifend
 * eindeutig, siehe entwuerfe.js) + Kartentyp + Kartenzaehler. Bewusst NICHT
 * einfach "cardCounter" allein, weil mehrere Formulare gleichzeitig offene
 * Entwuerfe haben koennen (Registerkarten) und Zaehler dort bei 1 neu
 * beginnen - ohne Entwurf-ID wuerden Fotos zwischen unterschiedlichen
 * Protokollen verwechselt. */
function fotoKartenKey(praefix, entwurfId, kartenTyp, kartenNr) {
  return [praefix, entwurfId, kartenTyp, kartenNr].join(':');
}

/* Komprimiert eine Bilddatei per <canvas> und liefert einen JPEG-Blob
 * zurueck. HEIC/HEIF-Dateien von iPhones werden vom Browser i. d. R. bereits
 * beim <input type=file accept="image/*"> in ein anzeigbares Format
 * gewandelt; gelingt das Dekodieren nicht (Fehler beim Bildladen), wird die
 * Originaldatei unveraendert durchgereicht, damit das Foto nicht verloren
 * geht - dann eben ohne Komprimierung. */
function fotoKomprimieren(datei) {
  return new Promise(function (resolve) {
    var img = new Image();
    var url = URL.createObjectURL(datei);
    img.onload = function () {
      URL.revokeObjectURL(url);
      var w = img.naturalWidth, h = img.naturalHeight;
      var skala = Math.min(1, FOTOS_MAX_KANTE / Math.max(w, h));
      var zw = Math.max(1, Math.round(w * skala));
      var zh = Math.max(1, Math.round(h * skala));
      var canvas = document.createElement('canvas');
      canvas.width = zw; canvas.height = zh;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, zw, zh);
      canvas.toBlob(function (blob) {
        resolve(blob || datei);
      }, 'image/jpeg', FOTOS_JPEG_QUALITAET);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      resolve(datei);
    };
    img.src = url;
  });
}

function fotoSpeichern(kartenKey, blob, dateiname) {
  var eintrag = {
    id: kartenKey + ':' + Date.now() + ':' + Math.random().toString(36).slice(2, 8),
    kartenKey: kartenKey,
    blob: blob,
    dateiname: dateiname || 'foto.jpg',
    erstellt: new Date().toISOString()
  };
  return fotosTx('readwrite', function (store) { store.put(eintrag); }).then(function () { return eintrag; });
}

function fotosFuerKarteLaden(kartenKey) {
  return fotosTx('readonly', function (store) {
    return new Promise(function (resolve, reject) {
      var idx = store.index('kartenKey');
      var req = idx.getAll(IDBKeyRange.only(kartenKey));
      req.onsuccess = function () { resolve(req.result || []); };
      req.onerror = function () { reject(req.error); };
    });
  });
}

function fotoLoeschen(id) {
  return fotosTx('readwrite', function (store) { store.delete(id); });
}

/* [7.1.0, Befund "Fotos in der PDF wirken verzerrt/in die Laenge gezogen"]
 * Wandelt einen Foto-Blob in eine Data-URL UM UND liefert zusaetzlich die
 * tatsaechlichen Bildmasse (naturalWidth/naturalHeight) mit. Vorher wurde
 * beim PDF-Export jedes Foto unabhaengig von seinem echten Seitenverhaeltnis
 * stur auf eine feste Breite x Hoehe gezeichnet (doc.addImage(..., B, H)) -
 * ein Hochformat-Handyfoto (z. B. 3:4) wurde dadurch in ein festes
 * Querformat-Rechteck gequetscht und wirkte gestreckt/verzerrt. Mit den hier
 * gelieferten Massen kann der Aufrufer stattdessen "contain" rechnen (Bild
 * unverzerrt einpassen, zentriert, ueberschuessigen Platz als Rand lassen) -
 * siehe drawFotodokumentationSeite() in pdf-generator.js. */
function fotoDataUrlMitMassen(blob) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = reader.result;
      var img = new Image();
      img.onload = function () {
        resolve({ dataUrl: dataUrl, breite: img.naturalWidth || 0, hoehe: img.naturalHeight || 0 });
      };
      img.onerror = function () {
        // Bildmasse nicht ermittelbar - dataUrl trotzdem liefern, Aufrufer
        // faellt dann auf die alte feste Groesse zurueck.
        resolve({ dataUrl: dataUrl, breite: 0, hoehe: 0 });
      };
      img.src = dataUrl;
    };
    reader.onerror = function () { reject(reader.error); };
    reader.readAsDataURL(blob);
  });
}

/* Berechnet fuer ein Bild mit gegebenen Massen (breite x hoehe) die groesste
 * Darstellung, die unverzerrt in einen Rahmen (maxB x maxH) passt ("object-fit:
 * contain"), zentriert darin. Liefert { x, y, b, h } RELATIV zur Rahmen-
 * Ecke (0,0) - der Aufrufer addiert die eigene Rahmenposition dazu. Bei
 * fehlenden/ungueltigen Massen (breite/hoehe <= 0) wird der volle Rahmen
 * zurueckgegeben (bisheriges Verhalten als Fallback). */
function fotoContainMasse(breite, hoehe, maxB, maxH) {
  if (!breite || !hoehe || breite <= 0 || hoehe <= 0) {
    return { x: 0, y: 0, b: maxB, h: maxH };
  }
  var skala = Math.min(maxB / breite, maxH / hoehe);
  var b = breite * skala;
  var h = hoehe * skala;
  return { x: (maxB - b) / 2, y: (maxH - h) / 2, b: b, h: h };
}

/* Loescht ALLE Fotos einer Karte - wird beim Entfernen einer Stromkreis-/
 * Geraete-/Uebergabepunkt-Karte aufgerufen (siehe removeCard() in den
 * jeweiligen *-generator.js), damit keine verwaisten Fotos im IndexedDB
 * liegen bleiben, die zu keiner Karte mehr gehoeren. */
function fotosFuerKarteLoeschen(kartenKey) {
  return fotosFuerKarteLaden(kartenKey).then(function (eintraege) {
    return fotosTx('readwrite', function (store) {
      eintraege.forEach(function (e) { store.delete(e.id); });
    });
  }).catch(function () {});
}

/* ---------------------------------------------------------------------------
 *  UI: Foto-Leiste je Karte (Thumbnails + "+ Foto hinzufuegen"-Button)
 * ------------------------------------------------------------------------ */

/* Baut das HTML-Geruest der Foto-Leiste. Wird beim Erzeugen einer Karte
 * (addCircuitCard/addFeedCard/addDeviceCard) direkt ins Karten-Template
 * eingesetzt; befuellt wird sie danach asynchron per fotosLeisteAktualisieren(). */
function fotosLeisteHtml(kartenKey) {
  return (
    '<div class="fotos-leiste" data-karten-key="' + kartenKey + '">' +
      '<div class="fotos-kopf">' +
        '<span class="fotos-titel">📷 Fotodokumentation (optional)</span>' +
        '<label class="btn btn-secondary fotos-hinzufuegen-btn">' +
          '+ Foto hinzufügen' +
          '<input type="file" accept="image/*" capture="environment" class="fotos-input" style="display:none" onchange="fotosDateienAusgewaehlt(this, \'' + kartenKey + '\')">' +
        '</label>' +
      '</div>' +
      '<div class="fotos-thumbs" id="fotos_thumbs_' + kartenKey.replace(/[^a-zA-Z0-9]/g, '_') + '"></div>' +
    '</div>'
  );
}

function fotosThumbsContainerId(kartenKey) {
  return 'fotos_thumbs_' + kartenKey.replace(/[^a-zA-Z0-9]/g, '_');
}

function fotosLeisteAktualisieren(kartenKey) {
  var container = document.getElementById(fotosThumbsContainerId(kartenKey));
  if (!container) return;
  fotosFuerKarteLaden(kartenKey).then(function (eintraege) {
    container.innerHTML = '';
    eintraege.forEach(function (e) {
      var url = URL.createObjectURL(e.blob);
      var wrap = document.createElement('div');
      wrap.className = 'fotos-thumb';
      wrap.innerHTML =
        '<img src="' + url + '" alt="Foto zur Karte" loading="lazy">' +
        '<button type="button" class="fotos-thumb-loeschen" title="Foto entfernen">✕</button>';
      wrap.querySelector('.fotos-thumb-loeschen').onclick = function () {
        fotoLoeschen(e.id).then(function () { fotosLeisteAktualisieren(kartenKey); });
      };
      container.appendChild(wrap);
    });
  }).catch(function () {});
}

/* Wird vom onchange des <input type=file> aufgerufen. Mehrfachauswahl ist
 * NICHT aktiviert (kein multiple-Attribut) - ein Foto pro Aufnahme entspricht
 * dem ueblichen Ablauf mit dem Handy direkt vor Ort; FOTOS_MAX_PRO_KARTE
 * verhindert trotzdem ein versehentliches Massen-Anhaengen ueber mehrere
 * Aufrufe hinweg. */
/* ---------------------------------------------------------------------------
 *  PDF: ANHANGSEITE "FOTODOKUMENTATION" (verschoben aus pdf-generator.js,
 *  7.1.0, damit sie auch von anschluss-generator.js/geraete-generator.js aus
 *  genutzt werden kann - pdf-generator.js wird nur in vde0100.html geladen).
 * ------------------------------------------------------------------------ */

/* Zeichnet eine oder mehrere Anhangseiten "Fotodokumentation" mit den
 * (bereits komprimierten) Fotos je Karte, 2 Spalten x 3 Zeilen pro Seite.
 * Reine Dokumentation der als Blob vorliegenden JPEGs - keine Bewertung/
 * Analyse, nur Bildnachweis mit Zuordnung zur jeweiligen Karte (Stromkreis/
 * Übergabepunkt/Gerät).
 *
 * fotos: Array von { _dataUrl, _breite, _hoehe, stromkreisNr } (stromkreisNr
 *   ist historisch benannt, wird aber generisch als "laufende Nummer der
 *   Karte" verwendet - siehe kartenLabel).
 * kapitelTitel: z. B. "5. FOTODOKUMENTATION".
 * kartenLabel: Praefix vor der Kartennummer, z. B. "Stromkreis", "Übergabepunkt",
 *   "Gerät" (Standard: "Stromkreis" fuer Rueckwaertskompatibilitaet). */
function drawFotodokumentationSeite(doc, fotos, kapitelTitel, kartenLabel) {
  kapitelTitel = kapitelTitel || '5. FOTODOKUMENTATION';
  kartenLabel = kartenLabel || 'Stromkreis';
  const SPALTEN = 2, ZEILEN = 3, PRO_SEITE = SPALTEN * ZEILEN;
  const BILD_B = 82, BILD_H = 62, GAP_X = 8, GAP_Y = 10;
  for (let i = 0; i < fotos.length; i++) {
    if (i % PRO_SEITE === 0) {
      doc.addPage();
      let yy = PDF_CONTENT_TOP;
      drawKategorieTitel(doc, kapitelTitel, yy, 'erdung');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.6);
      doc.setTextColor(...PDF_MUTED);
      doc.text('Optionale Fotos zu auffälligen Stellen/Mängeln, während der Prüfung mit der App aufgenommen.',
                PDF_MARGIN_LEFT, yy + 3.4);
      doc.setTextColor(...PDF_TEXT);
    }
    const posImSeite = i % PRO_SEITE;
    const spalte = posImSeite % SPALTEN;
    const zeile = Math.floor(posImSeite / SPALTEN);
    const x = PDF_MARGIN_LEFT + spalte * (BILD_B + GAP_X);
    const y = PDF_CONTENT_TOP + 8 + zeile * (BILD_H + GAP_Y);
    try {
      const dataUrl = fotos[i]._dataUrl;
      if (dataUrl) {
        // 7.1.0: unverzerrt einpassen ("object-fit: contain") statt stur auf
        // BILD_B x BILD_H zu strecken (vorher wirkten Fotos im PDF verzerrt/
        // in die Laenge gezogen). Der Rahmen (doc.rect unten) behaelt
        // weiterhin die volle Zellengroesse, das Foto darin wird zentriert.
        const masse = fotoContainMasse(fotos[i]._breite, fotos[i]._hoehe, BILD_B, BILD_H);
        doc.addImage(dataUrl, 'JPEG', x + masse.x, y + masse.y, masse.b, masse.h, undefined, 'FAST');
      }
    } catch (e) {
      doc.setDrawColor(...PDF_BOX_BORDER);
      doc.rect(x, y, BILD_B, BILD_H);
    }
    doc.setDrawColor(...PDF_BOX_BORDER);
    doc.rect(x, y, BILD_B, BILD_H);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...PDF_MUTED);
    // 7.1.0: ein Foto kann sein eigenes Label mitbringen (z. B. "Bemerkung"
    // fuer Fotos am zentralen Bemerkungsfeld statt einer Stromkreis-Nummer,
    // siehe fotosFuerEinzelkarteLaden()) - faellt sonst auf das gemeinsame
    // kartenLabel + laufende Nummer zurueck.
    const beschriftung = fotos[i]._label || `${kartenLabel} #${fotos[i].stromkreisNr}`;
    doc.text(beschriftung, x, y + BILD_H + 4);
    doc.setTextColor(...PDF_TEXT);
  }
}

/* Laedt alle Fotos aller Karten eines Containers und bereitet sie fuer
 * drawFotodokumentationSeite() auf (Data-URL + Bildmasse je Foto). Generischer
 * Ersatz fuer den bisher nur in pdf-generator.js vorhandenen, dort fest auf
 * '.circuit-card' zugeschnittenen Ladecode (7.1.0) - wird jetzt von allen drei
 * Formularen (Stromkreis/Übergabepunkt/Gerät) gleich genutzt.
 *
 * kartenSelektor: z. B. '.circuit-card', '.feed-card', '.device-card'.
 * isBlank: true beim Leerformular - liefert dann sofort eine leere Liste. */
function fotosFuerPdfLaden(kartenSelektor, isBlank) {
  if (isBlank || typeof fotosFuerKarteLaden !== 'function') return Promise.resolve([]);
  return Promise.all(
    Array.from(document.querySelectorAll(kartenSelektor)).map(function (card, idx) {
      const leiste = card.querySelector('.fotos-leiste[data-karten-key]');
      if (!leiste) return Promise.resolve([]);
      return fotosFuerKarteLaden(leiste.getAttribute('data-karten-key'))
        .then(function (eintraege) {
          return Promise.all(eintraege.map(function (e) {
            return fotoDataUrlMitMassen(e.blob)
              .then(function (masse) {
                return Object.assign({ stromkreisNr: idx + 1, _dataUrl: masse.dataUrl, _breite: masse.breite, _hoehe: masse.hoehe }, e);
              })
              .catch(function () { return null; });
          }));
        })
        .then(function (liste) { return liste.filter(Boolean); })
        .catch(function () { return []; });
    })
  ).then(function (gruppen) { return gruppen.reduce(function (a, b) { return a.concat(b); }, []); })
    .catch(function () { return []; });
}

/* [7.1.0] Wie fotosFuerPdfLaden(), aber fuer EINEN einzelnen, fest bekannten
 * Kartenschluessel statt eines Container-Selektors - fuer Fotos, die nicht an
 * einer dynamisch erzeugten Karte haengen, sondern an einem festen Formular-
 * feld (z. B. "Mängel / Bemerkungen / Auflagen"). labelNr wird als
 * "stromkreisNr" mitgegeben, damit drawFotodokumentationSeite() dieselbe
 * Beschriftungslogik verwenden kann. */
function fotosFuerEinzelkarteLaden(kartenKey, isBlank, label) {
  if (isBlank || typeof fotosFuerKarteLaden !== 'function') return Promise.resolve([]);
  return fotosFuerKarteLaden(kartenKey).then(function (eintraege) {
    return Promise.all(eintraege.map(function (e) {
      return fotoDataUrlMitMassen(e.blob)
        .then(function (masse) {
          return Object.assign({ _label: label || '', _dataUrl: masse.dataUrl, _breite: masse.breite, _hoehe: masse.hoehe }, e);
        })
        .catch(function () { return null; });
    }));
  }).then(function (liste) { return liste.filter(Boolean); })
    .catch(function () { return []; });
}

function fotosDateienAusgewaehlt(input, kartenKey) {
  var dateien = Array.from(input.files || []);
  input.value = ''; // erlaubt erneute Auswahl derselben Datei
  if (!dateien.length) return;
  fotosFuerKarteLaden(kartenKey).then(function (vorhandene) {
    var frei = FOTOS_MAX_PRO_KARTE - vorhandene.length;
    if (frei <= 0) {
      alert('Maximal ' + FOTOS_MAX_PRO_KARTE + ' Fotos je Karte. Bitte zuerst ein vorhandenes Foto entfernen.');
      return;
    }
    var zuVerarbeiten = dateien.slice(0, frei);
    Promise.all(zuVerarbeiten.map(function (datei) {
      return fotoKomprimieren(datei).then(function (blob) {
        return fotoSpeichern(kartenKey, blob, datei.name);
      });
    })).then(function () {
      fotosLeisteAktualisieren(kartenKey);
    }).catch(function () {
      alert('Foto konnte nicht gespeichert werden (Speicherplatz auf dem Gerät prüfen).');
    });
  });
}
