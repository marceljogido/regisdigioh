const db = require('../models');
const Guest = db.Guest;

const { generateQRCode } = require('../services/generateQR.js')
const nodemailer = require('nodemailer');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Send broadcast email (customizable subject and message).
 * @param {Object} req - The request object to send the file.
 * @param {Object} res - The response object to send the file.
 */
exports.sendBroadcastEmail = async (req, res) => {
  try {
    const { subject, message, emails, guests } = req.body;

    // Validate emails
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing email list' });
    }

    // Validate subject and message
    if (typeof subject !== 'string') {
      return res.status(400).json({ error: 'Invalid subject or message format' });
    }

    if (!Array.isArray(message) || message.length !== emails.length) {
      return res.status(400).json({ error: 'Message list must be an array and match the length of emails' });
    }

    // Configure Transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Broadcast to All Provided Emails
    for (let i = 0; i < emails.length; i++) {
      const guest = await Guest.findByPk(guests[i]);
      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      const qrCodeDataUrl = await generateQRCode(guest.id.toString());

      const email = emails[i];
      const individualMessage = message[i];

      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        text: individualMessage,
        attachments: [
          {
            filename: 'qrcode.png',
            content: qrCodeDataUrl,
            contentType: 'image/png'
          }
        ]
      });
    }

    res.status(200).json('Broadcast email sent successfully');
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    res.status(500).json({ error: 'Error sending broadcast email' });
  }
};
