/**
 * @OnlyCurrentDoc
 * Este script maneja las solicitudes POST para agregar datos a una hoja de cálculo.
 */

const SHEET_NAME = "Respuestas";

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);

    // Si la hoja no existe, la crea y añade los encabezados.
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      // --- NUEVAS COLUMNAS AÑADIDAS AL FINAL ---
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Code', 'SaleValue', 'ExtraEmail', 'ExtraPhone', 'PaymentStatus', 'PaymentId']);
    }

    const data = JSON.parse(e.postData.contents);

    // Se crea la nueva fila respetando el orden de los encabezados.
    const newRow = [
      data.timestamp || new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.code || '',
      data.saleValue || '', 
      // --- NUEVOS VALORES AÑADIDOS ---
      data.extraEmail || '',
      data.extraPhone || '',
      data.paymentStatus || '',
      data.paymentId || ''
    ];
    
    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error en doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
