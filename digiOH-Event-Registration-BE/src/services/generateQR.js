const QRCode = require('qrcode');

/**
 * Generates a QR code for the provided data.
 * @param {string} text - The text to encode in the QR code.
 * @returns {Promise<string>} - A promise that resolves to the QR code image data URL.
 */
exports.generateQRCode = async (text, options = {}) => {
  try {
    const defaultOptions = {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };

    // Merge defaults with provided options
    const qrOptions = { ...defaultOptions, ...options };

    // Ensure width is set independently if passed as second arg in legacy calls, 
    // but here we assume options object. 
    // Actually, to be backward compatible with (text, size), I should handle that.
    // unique_code controller passes (text) only.

    // Let's keep it simple: if second arg is number, treat as size. If object, treat as options.
    if (typeof options === 'number') {
      qrOptions.width = options;
    } else {
      Object.assign(qrOptions, options);
    }

    const qrCodeDataUrl = await QRCode.toBuffer(text, qrOptions);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};
