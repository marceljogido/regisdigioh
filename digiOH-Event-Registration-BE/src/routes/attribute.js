const express = require('express');
const router = express.Router();
const attrsController = require('../controllers/attribute.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
