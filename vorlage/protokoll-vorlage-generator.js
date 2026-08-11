/* ============================================================================
 *  VORLAGE: PDF-Generator für ein neues Protokoll
 * ----------------------------------------------------------------------------
 *  Kopiere diese Datei nach  js/<name>-generator.js  und passe sie an.
 *  Die Hilfsfunktionen (cleanStr, drawProtokollHeader, savePdfCompatible …)
 *  stammen aus js/pdf-utils.js und stehen hier automatisch zur Verfügung.
 * ========================================================================== */

/* ANPASSEN: Kopfzeile des PDF */
const VORLAGE_KOPF = {
  titel: 'Neues Prüfprotokoll',
  normzeile: 'nach DIN VDE XXXX'
};

function generiereVorlagePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const wert = (id) => cleanStr(document.getElementById(id)?.value || '');

  const protokollNr = wert('protokollnummer');
  const datum = wert('datum');

  /* --- Kopf --- */
  drawProtokollHeader(doc, VORLAGE_KOPF);

  /* --- Kopfdaten als Tabelle --- */
  doc.autoTable({
    startY: 34,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6 },
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    head: [['Feld', 'Wert']],
    body: [
      ['Protokoll-Nr.', protokollNr],
      ['Datum', datum],
      ['Auftraggeber', wert('auftraggeber')],
      ['Prüfer/-in', wert('pruefer')],
      ['Prüfgerät', wert('messgeraet') + ' (' + wert('seriennummer') + ')'],
      ['Kalibriert bis', wert('kalibriert_bis')]
    ]
  });

  /* --- Prüfgegenstand --- */
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 5,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6 },
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    head: [['Prüfgegenstand', 'Angabe']],
    body: [
      ['Bezeichnung', wert('bezeichnung')],
      ['Standort', wert('standort')],
      ['Ergebnis', wert('ergebnis')]
    ]
  });

  /* --- Bemerkungen --- */
  const bem = wert('bemerkungen');
  if (bem) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 5,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.6 },
      headStyles: { fillColor: [0, 51, 102], textColor: 255 },
      head: [['Bemerkungen']],
      body: [[bem]]
    });
  }

  /* --- Unterschrift --- */
  let y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.text(wert('unterschrift_ort') + ', ' + datum, 14, y);

  const pad = window.padPruefer;
  if (pad && !pad.isEmpty()) {
    try { doc.addImage(pad.toDataURL('image/png'), 'PNG', 14, y + 3, 55, 16); } catch (e) {}
  }
  doc.line(14, y + 21, 80, y + 21);
  doc.text('Prüfer/-in', 14, y + 25);

  /* --- Speichern (funktioniert auch auf iPad/Android) --- */
  const dateiname = 'Protokoll_' + (protokollNr || 'neu') + '.pdf';
  savePdfCompatible(doc, dateiname);
}
