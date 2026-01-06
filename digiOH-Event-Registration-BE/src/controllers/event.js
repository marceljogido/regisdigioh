const db = require('../models');
const Event = db.Event;
const Guest = db.Guest;
const { Op } = require('sequelize');

// 1. Get Event By Id (Fungsi untuk Halaman Information)
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ambil jumlah tamu berdasarkan status konfirmasi dari tabel Guest
        const guestCounts = await Guest.findAll({
            where: { event_id: id },
            attributes: [
                'confirmation',
                [db.sequelize.fn('COUNT', db.sequelize.col('confirmation')), 'count']
            ],
            group: ['confirmation']
        });

        // Inisialisasi data stats
        const statsData = {
            confirmed: 0,
            represented: 0,
            'to be confirmed': 0,
            cancelled: 0
        };

        // Isi stats berdasarkan data database
        guestCounts.forEach(g => {
            if (g.confirmation in statsData) {
                statsData[g.confirmation] = Number(g.dataValues.count);
            }
        });

        const totalInvitation = Object.values(statsData).reduce((a, b) => a + b, 0);

        // Gabungkan data event dengan statistik dalam berbagai format penamaan
        const responseData = {
            ...event.toJSON(),
            // Format 1: Langsung di root (untuk komponen yang baca data.invitation)
            invitation: totalInvitation,
            confirmed: statsData.confirmed,
            toBeConfirmed: statsData['to be confirmed'], // camelCase
            to_be_confirmed: statsData['to be confirmed'], // snake_case
            cancelled: statsData.cancelled,
            represented: statsData.represented,

            // Format 2: Di dalam objek stats (seperti yang terlihat di network preview Anda)
            stats: {
                invitation: totalInvitation,
                confirmed: statsData.confirmed,
                toBeConfirmed: statsData['to be confirmed'],
                to_be_confirmed: statsData['to be confirmed'],
                cancelled: statsData.cancelled,
                represented: statsData.represented
            }
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- FUNGSI LAINNYA (Sesuai Struktur Standar Anda) ---

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const {
            name, start_date, end_date, sales, account_manager, company,
            event_time, location, discord_channel, drive_folder, loading_date
        } = req.body;
        const newEvent = await Event.create({
            name, start_date, end_date, sales, account_manager, company,
            event_time, location, discord_channel, drive_folder, loading_date
        });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.update(req.body);
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByPk(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.destroy();
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllEventNames = async (req, res) => {
    try {
        const events = await Event.findAll({ attributes: ['name'] });
        res.json(events.map(event => event.name));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
