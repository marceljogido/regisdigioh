const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user.js');
const authMiddleware = require('../middlewares/authMiddleware');
const email = require('../services/broadcastEmail.js')
const excel = require('../services/exportExcel.js')
const importExcel = require('../services/importExcel.js');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes for User
router.post('/login', usersController.login);
router.post('/sign-up', usersController.signUp);
router.get('/profile', authMiddleware.verifyToken, usersController.getEmail);
router.post('/broadcast-email', authMiddleware.verifyToken, email.sendBroadcastEmail);
router.post('/export', authMiddleware.verifyToken, excel.exportGuestsToExcel);
router.post('/import', authMiddleware.verifyToken, upload.single('file'), importExcel.importExcel);
router.post('/add-guest-import', authMiddleware.verifyToken, upload.single('file'), importExcel.importExcelToExistingEvent);

module.exports = router;
