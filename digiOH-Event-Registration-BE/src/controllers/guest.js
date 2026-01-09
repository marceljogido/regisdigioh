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
    const limit = parseInt(req.query.limit) || 10;
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
        ? `${process.env.BASE_URL || 'http://localhost:5000'}/api/guest/${guest.unique_code}`
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
    const { attributes, ...guestDataRaw } = req.body;

    const guest = await Guest.create({
      ...guestDataRaw,
      unique_code: uniqueCode
    });

    // Handle attributes if sent
    console.log(`Adding guest: ${guestDataRaw.username}, Attributes:`, attributes);
    if (attributes && typeof attributes === 'object') {
      for (const [key, value] of Object.entries(attributes)) {
        if (value) {
          console.log(`Creating attribute: ${key} = ${value} for guest ${guest.id}`);
          await Attribute.create({
            event_id: guest.event_id,
            guest_id: guest.id,
            attribute_key: key,
            attribute_value: String(value)
          });
        }
      }
    }

    // QR Code contains the link with unique code
    const qrContent = `${process.env.BASE_URL || 'http://localhost:5000'}/api/guest/${uniqueCode}`;
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
    console.log(`Searching for guest with ID/Code: ${guest_id}`);

    // Try finding by PK if it's a number, or by unique_code
    let guest;
    if (!isNaN(guest_id)) {
      guest = await Guest.findByPk(guest_id);
    }

    if (!guest) {
      guest = await Guest.findOne({ where: { unique_code: guest_id } });
    }

    if (!guest) {
      console.log(`Guest with ID/Code ${guest_id} not found.`);
      return res.status(404).json({ error: "Guest not found" });
    }

    console.log(`Guest found: ${guest.username} (ID: ${guest.id})`);

    // Ambil atribut tamu
    const attributes = await Attribute.findAll({
      where: { event_id: guest.event_id, guest_id: guest.id },
      attributes: ['attribute_key', 'attribute_value']
    });

    const qrBuffer = await generateQRCode(guest.unique_code || guest.id.toString());
    res.status(200).json({
      ...guest.toJSON(),
      qrCode: `data:image/png;base64,${qrBuffer.toString('base64')}`,
      attributes: attributes.reduce((acc, attr) => {
        acc[attr.attribute_key] = attr.attribute_value;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error in getGuestById:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3b. Get Guest by Unique Code - Returns HTML page with QR
exports.getGuestByUniqueCode = async (req, res) => {
  try {
    const { unique_code } = req.params;
    console.log(`Looking up guest by unique_code: ${unique_code}`);

    const guest = await Guest.findOne({ where: { unique_code: unique_code } });

    if (!guest) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Guest Not Found</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🚫 Guest Not Found</h1>
          <p>No guest found with code: <strong>${unique_code}</strong></p>
        </body>
        </html>
      `);
    }

    // Fetch guest attributes
    const attributeRows = await Attribute.findAll({
      where: { event_id: guest.event_id, guest_id: guest.id },
      attributes: ['attribute_key', 'attribute_value']
    });
    const attrs = attributeRows.reduce((acc, attr) => {
      acc[attr.attribute_key] = attr.attribute_value;
      return acc;
    }, {});

    // Generate QR code
    const qrContent = `${process.env.BASE_URL || 'http://localhost:5000'}/api/guest/${unique_code}`;
    const qrBuffer = await generateQRCode(qrContent, {
      color: { dark: '#000000', light: '#00000000' }, // Transparent background, Black QR
      width: 600,
      margin: 0 // No margin needed as box provides padding
    });
    const qrBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`;

    // Return HTML page with guest info, QR, and confirmation form
    const isAlreadyAttended = guest.attendance === 'attended';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Guest: ${guest.username}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          /* Adjusted styles for Image Render Mode */
          body {
            background-color: #1a1a1a;
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: auto; /* Allow scrolling if needed */
            font-family: 'Inter', sans-serif;
          }
          
          #main-layout {
            /* Keep original layout for rendering source */
            width: 1080px;
            height: 1920px;
            background: url('${process.env.BASE_URL || 'http://localhost:5000'}/api/public/${guest.registration_type === 'ots' ? 'background-qr-merah.jpg' : 'background-qr.jpg'}') no-repeat center center;
            background-size: cover;
            position: absolute;
            left: -9999px; /* Hide off-screen but keep renderable */
            top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 580px; 
            box-sizing: border-box;
          }

          /* Results Container */
          #result-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
          }

          #generated-image {
            max-height: 80vh;
            max-width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border-radius: 20px;
            margin-bottom: 20px;
          }

          /* QR Code Box - Solid White */
          .qr-box {
            background: #ffffff; /* Solid White */
            border-radius: 40px;
            padding: 30px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            margin-bottom: 60px;
            width: 580px;
            height: 580px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .qr-box img { 
            width: 520px; 
            height: 520px; 
            display: block;
          }
          
          /* Typography */
          .nama {
            font-family: 'Inter', sans-serif;
            font-size: 55px;
            font-weight: 700; /* Bold */
            color: #EAC976; 
            text-transform: uppercase;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.4);
            max-width: 900px;
            line-height: 1.2;
          }
          
          .jabatan {
            font-family: 'Inter', sans-serif;
            font-size: 32px;
            color: #EAC976; 
            margin: 5px 0;
            font-weight: 400; /* Biasa (Regular) */
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          }

          .instansi {
            font-family: 'Inter', sans-serif;
            font-size: 32px;
            color: #EAC976; 
            margin: 5px 0;
            font-weight: 700; /* Bold */
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
            margin-top: 5px;
          }  
          /* Download Button */
          #download-btn {
            background: #235b83;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
          }
          #download-btn:hover {
            background: #1a4563;
            transform: scale(1.05);
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      </head>
      <body>
        <!-- Hidden Source Layout -->
        <div id="main-layout">
          
          <!-- QR Code Section -->
          <div class="qr-box">
             <img src="${qrBase64}" alt="QR Code">
          </div>

          <!-- Text Section -->
          <div style="text-align: center;">
            <h1 class="nama">${guest.username}</h1>
          </div>

        </div>
        
        <!-- Visible Result Container -->
        <div id="result-container" style="opacity: 0; transition: opacity 0.5s;">
           <img id="generated-image" alt="E-Invitation Preview" />
           
           <button id="download-btn" onclick="downloadImage()">
             📥 Download e-Invitation
           </button>
        </div>

        <script>
          // Script to render visual image on load
          window.addEventListener('load', async () => {
             const layout = document.getElementById('main-layout');
             const container = document.getElementById('result-container');
             const img = document.getElementById('generated-image');
             const btn = document.getElementById('download-btn');
             
             // Initial status
             btn.textContent = '⏳ Generating Preview...';
             btn.disabled = true;
             
             try {
                // Generate high-res canvas
                const canvas = await html2canvas(layout, {
                  scale: 2, // 2x scale for sharpness
                  useCORS: true, 
                  allowTaint: true,
                  backgroundColor: null
                });
                
                // Set image source
                const dataUrl = canvas.toDataURL('image/png');
                img.src = dataUrl;
                
                // Show container
                container.style.opacity = '1';
                btn.textContent = '📥 Download e-Invitation';
                btn.disabled = false;
                
             } catch (e) {
                console.error("Rendering failed", e);
                alert("Gagal memuat preview kartu.");
             }
          });

          // Download Function
          function downloadImage() {
            const img = document.getElementById('generated-image');
            if (!img.src) return;
            
            const link = document.createElement('a');
            link.download = 'E-Invitation-${guest.username.replace(/[^a-z0-9]/gi, '_')}.png';
            link.href = img.src;
            link.click();
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in getGuestByUniqueCode:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>❌ Error</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `);
  }
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
    const { id } = req.params;
    const { confirmation } = req.body;
    console.log(`Attempting to update confirmation for Guest ID: ${id} to ${confirmation}`);

    const guest = await Guest.findByPk(id);
    if (!guest) {
      console.error(`Guest with ID ${id} not found for confirmation update.`);
      return res.status(404).json({ error: "Guest not found" });
    }

    // Singkronkan field attendance berdasarkan confirmation
    let attendance = guest.attendance;
    if (confirmation === 'confirmed') {
      attendance = 'attended';
    } else if (confirmation === 'represented') {
      attendance = 'represented';
    } else if (confirmation === 'to be confirmed' || confirmation === 'cancelled') {
      attendance = 'did not attend';
    }

    await guest.update({ confirmation, attendance });
    console.log(`Successfully updated confirmation to ${confirmation} and attendance to ${attendance} for ${guest.username}`);
    res.status(200).json(guest);
  } catch (error) {
    console.error('Error in updateConfirmation:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;
    console.log(`Attempting to update attendance for Guest ID: ${id} to ${attendance}`);

    const guest = await Guest.findByPk(id);
    if (!guest) {
      console.error(`Guest with ID ${id} not found for attendance update.`);
      return res.status(404).json({ error: "Guest not found" });
    }

    // Singkronkan field confirmation berdasarkan attendance
    let confirmation = guest.confirmation;
    if (attendance === 'attended') {
      confirmation = 'confirmed';
    } else if (attendance === 'represented') {
      confirmation = 'represented';
    } else if (attendance === 'did not attend') {
      confirmation = 'to be confirmed';
    }

    await guest.update({ attendance, confirmation });
    console.log(`Successfully updated attendance for ${guest.username} to ${attendance}`);
    res.status(200).json(guest);
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmailed = async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    await guest.update({ emailed: req.body.emailed });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateMerchandise = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchandise } = req.body;
    const guest = await Guest.findByPk(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });
    await guest.update({ merchandise });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateMerchandiseBy = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchandise_updated_by } = req.body;
    const guest = await Guest.findByPk(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });
    await guest.update({ merchandise_updated_by });
    res.status(200).json(guest);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Update Jumlah Orang attribute
exports.updateJumlahOrang = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah_orang } = req.body;

    const guest = await Guest.findByPk(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    // Update or create the Jumlah Orang attribute
    const [attr, created] = await Attribute.findOrCreate({
      where: {
        event_id: guest.event_id,
        guest_id: guest.id,
        attribute_key: 'Jumlah Orang'
      },
      defaults: { attribute_value: String(jumlah_orang) }
    });

    if (!created) {
      await attr.update({ attribute_value: String(jumlah_orang) });
    }

    console.log(`Updated Jumlah Orang for guest ${id} to ${jumlah_orang}`);
    res.status(200).json({ message: "Jumlah Orang updated", jumlah_orang });
  } catch (error) {
    console.error('Error updating Jumlah Orang:', error);
    res.status(500).json({ error: error.message });
  }
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

// --- FUNGSI DOWNLOAD TEMPLATE ---
exports.downloadTemplate = async (req, res) => {
  try {
    // Removed 'Konfirmasi' and 'Jumlah Orang' - they are handled via QR scan attendance
    const headers = ['Nama', 'Email', 'No HP', 'Jabatan', 'Instansi', 'Keterangan', 'CP', 'No HP CP'];
    const csvContent = headers.join(';') + '\n'; // Use semicolon for better Excel compatibility in some regions

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=guest_import_template.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- FUNGSI IMPORT EXCEL ---
exports.importGuests = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an Excel file!" });
    }

    const filePath = req.file.path;
    const eventId = req.body.event_id; // Frontend needs to send this!

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required!" });
    }

    const readXlsxFile = require('read-excel-file/node');

    // Define map for column headers to our keys
    // User requested: "disesuaikan pembacaan parameter di excelnya"
    // We will try to match dynamically or hardcode the expected index.
    // Better approach: Read first row as header and map.

    const rows = await readXlsxFile(filePath);
    // Remove header row
    const headers = rows.shift().map(h => String(h).trim().toLowerCase());

    // Define expected columns mapping
    const columnMap = {
      'nama': 'username',
      'username': 'username',
      'full name': 'username',
      'email': 'email',
      'e-mail': 'email',
      'no hp': 'phoneNum',
      'phone': 'phoneNum',
      'nomor hp': 'phoneNum',
      'instansi': 'instansi',
      'company': 'instansi',
      'jabatan': 'attr:Jabatan',
      'keterangan': 'attr:Keterangan',
      'cp': 'attr:CP',
      'contact person': 'attr:CP',
      'no hp cp': 'attr:No HP CP',
      'konfirmasi': 'confirmation',
      'status': 'confirmation',
      'jumlah orang': 'attr:Jumlah Orang',
      'pax': 'attr:Jumlah Orang'
    };

    let successCount = 0;
    let failCount = 0;

    for (const row of rows) {
      try {
        let guestData = {
          event_id: eventId,
          username: '',
          email: '',
          phoneNum: '',
          instansi: '',
          attendance: 'did not attend', // Default: Belum Hadir
          unique_code: generateUniqueCode(8)
        };

        let attributesData = {};

        // Map row data based on headers
        row.forEach((cellValue, index) => {
          const header = headers[index];
          const mapKey = columnMap[header];

          if (mapKey) {
            if (mapKey.startsWith('attr:')) {
              const attrName = mapKey.split(':')[1];
              attributesData[attrName] = cellValue !== null ? String(cellValue) : '';
            } else if (mapKey !== 'confirmation') {
              // Skip confirmation field, only use attendance
              guestData[mapKey] = cellValue !== null ? String(cellValue) : '';
            }
          }
        });

        // Validation: Username/Email/Phone is likely required. 
        // If Email is missing, we might generate a dummy or skip.
        // Let's generate dummy if missing for now to avoid hard crash, or skip.
        if (!guestData.username) guestData.username = 'Unknown Guest';
        if (!guestData.email) guestData.email = `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}@no-email.com`;
        if (!guestData.phoneNum) guestData.phoneNum = '-';

        // Create Guest
        const newGuest = await Guest.create(guestData);
        successCount++;

        // Create Attributes
        for (const [key, value] of Object.entries(attributesData)) {
          if (value) {
            await Attribute.create({
              event_id: eventId,
              guest_id: newGuest.id,
              attribute_key: key,
              attribute_value: value
            });
          }
        }

      } catch (err) {
        console.error("Error processing row:", row, err);
        failCount++;
      }
    }

    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: `Import completed. Success: ${successCount}, Failed: ${failCount}`,
      successCount,
      failCount
    });

  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ error: "Failed to import excel file: " + error.message });
  }
};

exports.exportToExcel = async (req, res) => {
  try {
    const { event_id, search, confirmation, attendance, sortBy = 'id', sortOrder = 'ASC' } = req.body;
    console.log(`Backend Export Start (v4.0): event_id=${event_id}, search=${search}, confirmation=${confirmation}, attendance=${attendance}`);

    if (!event_id) {
      return res.status(400).json({ error: "event_id is required" });
    }

    let whereClause = { event_id: event_id };

    if (confirmation && typeof confirmation === 'string') {
      whereClause.confirmation = { [Op.in]: confirmation.split(',') };
    }
    if (attendance && typeof attendance === 'string') {
      whereClause.attendance = { [Op.in]: attendance.split(',') };
    }
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Use a safer column for sorting if incoming sortBy is invalid
    const validSortColumns = ['id', 'username', 'email', 'phoneNum', 'confirmation', 'attendance', 'instansi', 'merchandise'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = (sortOrder && sortOrder.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    // Query 1: Fetch all guests
    const guests = await Guest.findAll({
      where: whereClause,
      order: [[safeSortBy, safeSortOrder]]
    });

    console.log(`Step 1: Fetched ${guests.length} guests.`);

    // Query 2: Fetch all attributes for this event
    const allAttributes = await Attribute.findAll({
      where: { event_id: event_id },
      attributes: ['guest_id', 'attribute_key', 'attribute_value']
    });

    console.log(`Step 2: Fetched ${allAttributes.length} attributes total.`);

    // Map attributes by guest_id
    const attrMap = allAttributes.reduce((acc, attr) => {
      const gid = attr.guest_id;
      if (!acc[gid]) acc[gid] = {};
      acc[gid][attr.attribute_key] = attr.attribute_value;
      return acc;
    }, {});

    // Helper functions
    const capitalizeFirstLetter = (word) => {
      if (!word || typeof word !== 'string') return '-';
      const w = word.toLowerCase();
      if (w === 'confirmed' || w === 'attended') return 'Hadir';
      if (w === 'to be confirmed') return 'Belum Konfirmasi';
      if (w === 'represented') return 'Mewakili';
      if (w === 'cancelled' || w === 'did not attend') return 'Tidak Hadir';
      return word;
    };

    const formatMerchandise = (status) => {
      if (!status || typeof status !== 'string') return 'Belum Terima';
      const s = status.toLowerCase();
      return s === 'received' ? 'Sudah Terima' : 'Belum Terima';
    };

    // CSV Header
    const headers = ['No', 'Nama', 'QR Code', 'Jabatan', 'Instansi', 'Keterangan', 'CP', 'No HP CP', 'Kehadiran', 'Merchandise', 'Jumlah Orang'];

    // Query 3: Match QR Base URL from env
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    // Build CSV rows
    const rows = guests.map((guest, index) => {
      const attrs = attrMap[guest.id] || {};
      const qrContent = guest.unique_code
        ? `${baseUrl}/api/guest/${guest.unique_code}`
        : guest.id.toString();

      return [
        index + 1,
        guest.username || '-',
        qrContent,
        attrs['Jabatan'] || attrs['jabatan'] || '-',
        guest.instansi || '-',
        attrs['Keterangan'] || attrs['keterangan'] || '-',
        attrs['CP'] || attrs['cp'] || '-',
        attrs['No HP CP'] || attrs['no hp cp'] || '-',
        capitalizeFirstLetter(guest.attendance), // Use attendance status instead of confirmation
        formatMerchandise(guest.merchandise),
        attrs['Jumlah Orang'] || attrs['jumlah orang'] || '-'
      ].map(val => {
        const str = (val === null || val === undefined) ? '-' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    console.log(`CSV generated: ${csvContent.length} bytes.`);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=guests_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export Error (v4.0):", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
exports.getGuestsByEventSimple = async (req, res) => { res.json([]); };

