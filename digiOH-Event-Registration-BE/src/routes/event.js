const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/event.js');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes For Event
router.get('/events', authMiddleware.verifyToken, eventsController.getAllEvents);
router.get('/events/names', authMiddleware.verifyToken, eventsController.getAllEventNames);
router.get('/events/:id', authMiddleware.verifyToken, eventsController.getEventById);
router.post('/event', authMiddleware.verifyToken, eventsController.createEvent);
router.patch('/event-update/:id', authMiddleware.verifyToken, eventsController.updateEvent);
router.delete('/event-delete/:id', authMiddleware.verifyToken, eventsController.deleteEvent);

module.exports = router;
