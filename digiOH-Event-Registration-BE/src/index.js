const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const guestsRoutes = require('./routes/guest.js');
const usersRoutes = require('./routes/user.js');
const eventsRoutes = require('./routes/event.js');

const db = require('./models')
const app = express();
const PORT = process.env.PORT || 5000;

// Options
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route for root
app.get('/', (req, res) => {
  res.send('Halo');
});

// Routes
app.use('/api', guestsRoutes);
app.use('/api', usersRoutes);
app.use('/api', eventsRoutes);

// Run App
db.sequelize.sync().then((req) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
});
