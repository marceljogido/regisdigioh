const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guest');
const upload = require('../middlewares/upload');

// Pastikan pemanggilan fungsi di bawah ini tidak ada yang 'undefined'
router.get('/guests/event/:event_id', guestController.getGuestsByEvent);
router.get('/guests/count-confirmation/:event_id', guestController.getGuestCountByConfirmationStatus);
router.get('/guests/:guest_id', guestController.getGuestById);
router.get('/guest/:unique_code', guestController.getGuestByUniqueCode);

router.post('/guests', guestController.addGuest);
router.post('/import-guests', upload.single('file'), guestController.importGuests);
router.get('/download-template', guestController.downloadTemplate);
router.post('/send-email', guestController.sendEmail);
router.post('/export-excel', guestController.exportToExcel);

router.patch('/attend/:id', guestController.updateAttendance);
router.patch('/attendance-by/:id', guestController.updateAttendanceUpdatedBy);
router.patch('/confirmation/:id', guestController.updateConfirmation);
router.patch('/confirmation-by/:id', guestController.updateConfirmationUpdatedBy);
router.patch('/emailed/:id', guestController.updateEmailed);
router.patch('/emailed-by/:id', guestController.updateEmailSentBy);
router.patch('/attributes/:id', guestController.updateGuestAttributes);
router.patch('/attributes-by/:id', guestController.updateAttributesUpdatedBy);
router.patch('/merchandise/:id', guestController.updateMerchandise);
router.patch('/merchandise-by/:id', guestController.updateMerchandiseBy);
router.patch('/update-jumlah-orang/:id', guestController.updateJumlahOrang);

router.delete('/guest/:id', guestController.deleteGuest);

module.exports = router;
