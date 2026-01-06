const ExcelJS = require('exceljs');
const db = require('../models');
const Guest = db.Guest;

/**
 * Converts all guests to an Excel file and sends it as a download response.
 * @param {Object} req - The request object containing allGuests in the body.
 * @param {Object} res - The response object to send the file.
 */
exports.exportGuestsToExcel = async (req, res) => {
  try {
    const allGuests = req.body.allGuests;

    if (!allGuests || allGuests.length === 0) {
      return res.status(400).json({ error: 'No guests provided for export.' });
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Guests');

    // Initialize columns with the base guest columns
    const baseColumns = ['id', 'email', 'username', 'phoneNum', 'confirmation', 'attendance', 'instansi', 'createdAt', 'updatedAt'];
    let attributeColumns = new Set();

    // Extract attributes keys and merge with base columns
    allGuests.forEach(guest => {
      if (guest.attributes) {
        const attributesKeys = Object.keys(guest.attributes);
        attributesKeys.forEach(key => attributeColumns.add(key));
      }
    });

    // Define the columns in the worksheet
    const allColumns = [...baseColumns, ...Array.from(attributeColumns)];
    worksheet.columns = allColumns.map(column => ({
      header: column.charAt(0).toUpperCase() + column.slice(1),
      key: column,
      width: 20
    }));

    // Add rows
    allGuests.forEach(guest => {
      const row = {};
      baseColumns.forEach(column => {
        row[column] = guest[column];
      });

      if (guest.attributes) {
        Object.keys(guest.attributes).forEach(attrKey => {
          row[attrKey] = guest.attributes[attrKey];
        });
      }

      worksheet.addRow(row);
    });

    // Set the content type and disposition for the response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=guests.xlsx');

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end(); // End the response after writing the workbook
  } catch (error) {
    console.error('Error exporting guests to Excel:', error);
    res.status(500).json({ error: error.message });
  }
};
