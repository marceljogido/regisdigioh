const db = require('../models');
const Guest = db.Guest;
const Attribute = db.Attribute;
const sequelize = db.sequelize;
const { Op } = require('sequelize');
const { generateQRCode } = require('../services/generateQR');

// 1. Ambil Semua Tamu (Dashboard)
exports.getGuestsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { confirmation, attendance, search, page = 1, sortBy = 'id', sortOrder = 'ASC' } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereClause = { event_id: event_id };

    if (confirmation) {
      whereClause.confirmation = { [Op.in]: confirmation.split(',') };
    }
    if (attendance) {
      whereClause.attendance = { [Op.in]: attendance.split(',') };
    }
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const totalGuests = await Guest.count({ where: whereClause });
    const totalPages = Math.ceil(totalGuests / limit);

    const guests = await Guest.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset
    });

    const guestsWithAttributes = await Promise.all(guests.map(async (guest) => {
      const attributes = await Attribute.findAll({
        where: { event_id: event_id, guest_id: guest.id },
        attributes: ['attribute_key', 'attribute_value']
      });

      // Use unique_code for QR if available, otherwise fallback to ID
      const qrContent = guest.unique_code
        ? `${process.env.BASE_URL || 'http://localhost:5000'}/guest/${guest.unique_code}`
        : guest.id.toString();
      const qrBuffer = await generateQRCode(qrContent);
      const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;

      return {
        ...guest.toJSON(),
        qrCode: qrBase64,
        qrContent: qrContent, // Include the actual QR content for export
        attributes: attributes.reduce((acc, attr) => {
          acc[attr.attribute_key] = attr.attribute_value;
          return acc;
        }, {})
      };
    }));

    res.status(200).json({
      guests: guestsWithAttributes,
      pagination: { page: parseInt(page), totalPages }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate random alphanumeric code
const generateUniqueCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 2. Tambah Tamu Baru
exports.addGuest = async (req, res) => {
  try {
    // Generate unique 8-character code
    const uniqueCode = generateUniqueCode(8);

    const guest = await Guest.create({
      ...req.body,
      unique_code: uniqueCode
    });

    // QR Code contains the link with unique code
    const qrContent = `${process.env.BASE_URL || 'http://localhost:5000'}/guest/${uniqueCode}`;
    const qrBuffer = await generateQRCode(qrContent);
    const qrCode = `data:image/png;base64,${qrBuffer.toString('base64')}`;

    res.status(201).json({
      ...guest.toJSON(),
      qrCode: qrCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Detail Tamu (Untuk Scan)
exports.getGuestById = async (req, res) => {
  try {
    const { guest_id } = req.params;
    const guest = await Guest.findByPk(guest_id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    const qrBuffer = await generateQRCode(guest.id.toString());
    res.status(200).json({
      ...guest.toJSON(),
      qrCode: `data:image/png;base64,${qrBuffer.toString('base64')}`
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 4. Statistik Konfirmasi
exports.getGuestCountByConfirmationStatus = async (req, res) => {
  try {
    const { event_id } = req.params;
    const guestCounts = await Guest.findAll({
      where: { event_id: event_id },
      attributes: ['confirmation', [sequelize.fn('COUNT', sequelize.col('confirmation')), 'count']],
      group: ['confirmation']
    });

    const counts = { confirmed: 0, represented: 0, 'to be confirmed': 0, cancelled: 0 };
    guestCounts.forEach(g => { counts[g.confirmation] = Number(g.dataValues.count); });
    counts.invitation = Object.values(counts).reduce((a, b) => a + b, 0);

    res.status(200).json(counts);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 5. Update Atribut Tamu (Fungsi EDIT)
exports.updateGuestAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findByPk(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });
    await guest.update(req.body);
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- FUNGSI UPDATE STATUS ---
exports.updateConfirmation = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    await guest.update({ confirmation: req.body.confirmation });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateAttendance = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    await guest.update({ attendance: req.body.attendance });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateEmailed = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    await guest.update({ emailed: req.body.emailed });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteGuest = async (req, res) => {
  try {
    await Guest.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- FUNGSI "UPDATED BY" (Mencegah Undefined) ---
exports.updateConfirmationUpdatedBy = async (req, res) => { res.json({ ok: true }); };
exports.updateAttendanceUpdatedBy = async (req, res) => { res.json({ ok: true }); };
exports.updateAttributesUpdatedBy = async (req, res) => { res.json({ ok: true }); };
exports.updateEmailSentBy = async (req, res) => { res.json({ ok: true }); };

// --- PLACEHOLDER FITUR LANJUTAN ---
exports.sendEmail = async (req, res) => { res.json({ ok: true }); };
exports.importGuests = async (req, res) => { res.json({ ok: true }); };

exports.exportToExcel = async (req, res) => {
  try {
    const guests = req.body;

    // CSV Header - matching table columns
    const headers = ['No', 'Nama', 'QR Code', 'Jabatan', 'Instansi', 'Keterangan', 'CP', 'No HP CP', 'Konfirmasi', 'Jumlah Orang'];

    // Build CSV rows (using semicolon as delimiter for Excel compatibility)
    const rows = guests.map((guest, index) => {
      const attrs = guest.attributes || {};
      return [
        index + 1,
        guest.username || '-',
        guest.qrContent || guest.id, // QR Code content is the URL with unique code
        attrs['Jabatan'] || attrs['jabatan'] || '-',
        guest.instansi || '-',
        attrs['Keterangan'] || attrs['keterangan'] || '-',
        attrs['CP'] || attrs['cp'] || '-',
        attrs['No HP CP'] || attrs['no hp cp'] || '-',
        guest.confirmation || '-',
        attrs['Jumlah Orang'] || attrs['jumlah orang'] || '-'
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=guests_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getGuestsByEventSimple = async (req, res) => { res.json([]); };
