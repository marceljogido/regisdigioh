const QRCode = require('qrcode');

/**
 * Generates a QR code for the provided data.
 * @param {string} text - The text to encode in the QR code.
 * @returns {Promise<string>} - A promise that resolves to the QR code image data URL.
 */
exports.generateQRCode = async (text, size = 300) => {
  try {
    const qrCodeDataUrl = await QRCode.toBuffer(text, { width: size, height: size });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};
