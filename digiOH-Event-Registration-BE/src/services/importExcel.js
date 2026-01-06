const db = require('../models');
const Guest = db.Guest;
const Event = db.Event;
const sequelize = db.sequelize;

const xlsx = require('xlsx');
const eventAttrCtrl = require('../controllers/attribute.js')

const excelDateToJSDate = (excelDate) => {
    if (excelDate instanceof Date) {
        return excelDate;
    }
    const baseDate = new Date(1899, 11, 30);
    return new Date(baseDate.getTime() + excelDate * 86400000);
};;

exports.importExcel = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Retrieving data from excel
        const eventName = sheet['B2'].v;
        const company = sheet['B3'].v;
        const sales = sheet['B4'].v;
        const accountManager = sheet['B5'].v;
        const startDate = excelDateToJSDate(sheet['B6'].v);
        const endDate = excelDateToJSDate(sheet['B7'].v);
        const eventTime = sheet['D2'].v;
        const location = sheet['D3'].v;
        const discordChannel = sheet['D4'].v;
        const driveFolder = sheet['D5'].v;
        const loadingDate = excelDateToJSDate(sheet['D6'].v);

        const newEvent = await Event.create({
            name: eventName,
            company,
            sales,
            account_manager: accountManager,
            start_date: startDate,
            end_date: endDate,
            event_time: eventTime,
            location,
            discord_channel: discordChannel,
            drive_folder: driveFolder,
            loading_date: loadingDate
        }, { transaction });

        let row = 13;

        // Retrieving data
        while (sheet[`B${row}`] && sheet[`C${row}`] && sheet[`D${row}`] && sheet[`E${row}`]) {
            const username = sheet[`B${row}`].v;
            const email = sheet[`C${row}`].v;
            const phoneNum = sheet[`D${row}`].v;
            const instansi = sheet[`E${row}`].v;

            const eventAttrs = {};
            let col = 5;
            while (sheet[`${String.fromCharCode(65 + col)}${row}`]) {
                const attrKey = sheet[`${String.fromCharCode(65 + col)}12`].v;
                const attrValue = sheet[`${String.fromCharCode(65 + col)}${row}`].v;
                eventAttrs[attrKey] = attrValue;
                col++;
            }

            // Create Guest
            const guest = await Guest.create({
                username,
                email,
                phoneNum,
                instansi,
                event_id: newEvent.id
            }, { transaction });

            // Save Event Attributes
            const eventAttrKeys = Object.keys(eventAttrs);
            const eventAttrPromises = eventAttrKeys.map(key => eventAttrCtrl.createEventAttributeInternal({
                event_id: newEvent.id,
                guest_id: guest.id,
                attribute_key: key,
                attribute_value: eventAttrs[key]
            }, { transaction }));

            await Promise.all(eventAttrPromises);

            row++;
        }

        await transaction.commit();
        res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
}


exports.importExcelToExistingEvent = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Retrieving data from excel
        const eventName = sheet['B2'].v;
        const company = sheet['B3'].v;
        const sales = sheet['B4'].v;

        // Find existing event by name and sales
        const existingEvent = await Event.findOne({
            where: {
                name: eventName,
                sales: sales
            },
            transaction
        });

        if (!existingEvent) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Event not found' });
        }

        let row = 13;

        // Retrieving data
        while (sheet[`B${row}`] && sheet[`C${row}`] && sheet[`D${row}`] && sheet[`E${row}`]) {
            const username = sheet[`B${row}`].v;
            const email = sheet[`C${row}`].v;
            const phoneNum = sheet[`D${row}`].v;
            const instansi = sheet[`E${row}`].v;

            const eventAttrs = {};
            let col = 5;
            while (sheet[`${String.fromCharCode(65 + col)}${row}`]) {
                const attrKey = sheet[`${String.fromCharCode(65 + col)}12`].v;
                const attrValue = sheet[`${String.fromCharCode(65 + col)}${row}`].v;
                eventAttrs[attrKey] = attrValue;
                col++;
            }

            // Create Guest
            const guest = await Guest.create({
                username,
                email,
                phoneNum,
                instansi,
                event_id: existingEvent.id
            }, { transaction });

            // Save Event Attributes
            const eventAttrKeys = Object.keys(eventAttrs);
            const eventAttrPromises = eventAttrKeys.map(key => eventAttrCtrl.createEventAttributeInternal({
                event_id: existingEvent.id,
                guest_id: guest.id,
                attribute_key: key,
                attribute_value: eventAttrs[key]
            }, { transaction }));

            await Promise.all(eventAttrPromises);

            row++;
        }

        await transaction.commit();
        res.status(200).json({ message: 'Data imported successfully to existing event' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
}
