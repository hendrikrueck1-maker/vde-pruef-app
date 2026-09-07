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
