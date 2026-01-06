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

      const qrBuffer = await generateQRCode(guest.id.toString());
      const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;

      return {
        ...guest.toJSON(),
        qrCode: qrBase64,
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

// 2. Tambah Tamu Baru
exports.addGuest = async (req, res) => {
  try {
    const guest = await Guest.create(req.body);
    const qrBuffer = await generateQRCode(guest.id.toString());
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
exports.updateConfirmationUpdatedBy = async (req, res) => { res.json({ok: true}); };
exports.updateAttendanceUpdatedBy = async (req, res) => { res.json({ok: true}); };
exports.updateAttributesUpdatedBy = async (req, res) => { res.json({ok: true}); };
exports.updateEmailSentBy = async (req, res) => { res.json({ok: true}); };

// --- PLACEHOLDER FITUR LANJUTAN ---
exports.sendEmail = async (req, res) => { res.json({ok: true}); };
exports.importGuests = async (req, res) => { res.json({ok: true}); };
exports.exportToExcel = async (req, res) => { res.json({ok: true}); };
exports.getGuestsByEventSimple = async (req, res) => { res.json([]); };
