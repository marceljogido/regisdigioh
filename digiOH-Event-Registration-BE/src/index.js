const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const guestsRoutes = require('./routes/guest.js');
const usersRoutes = require('./routes/user.js');
const eventsRoutes = require('./routes/event.js');

const db = require('./models')
const app = express();
const PORT = process.env.PORT || 5000;

// Options
app.use(cors());

// Logger at top
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/api/public', express.static(path.join(__dirname, '../public')));

// Route for root
app.get('/', (req, res) => {
  res.send('Halo');
});

// Routes
app.use('/api', guestsRoutes);
app.use('/api', usersRoutes);
app.use('/api', eventsRoutes);

// Run App
db.sequelize.sync({ alter: true }).then((req) => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
