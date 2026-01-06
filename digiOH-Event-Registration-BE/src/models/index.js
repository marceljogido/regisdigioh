'use strict';

const config = require('../config/config.js');
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password, {
      host: config.development.host,
      dialect: config.development.dialect,
      logging: false,
  }
)

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

// Load Models
db.Guest = require('./Guest.js')(sequelize, DataTypes)
db.User = require('./User.js')(sequelize, DataTypes)
db.Event = require('./Event.js')(sequelize, DataTypes)
db.Attribute = require('./Attribute.js')(sequelize, DataTypes)

// --- DEFINISI RELASI (HANYA DI SINI) ---

// 1. Relasi Event ke Guest
db.Event.hasMany(db.Guest, { foreignKey: 'event_id', as: 'guests' });
db.Guest.belongsTo(db.Event, { foreignKey: 'event_id', as: 'event' });

// 2. Relasi Attribute
db.Attribute.belongsTo(db.Guest, { foreignKey: 'guest_id', onDelete: 'CASCADE' });
db.Attribute.belongsTo(db.Event, { foreignKey: 'event_id', onDelete: 'CASCADE' });
db.Guest.hasMany(db.Attribute, { foreignKey: 'guest_id' });
db.Event.hasMany(db.Attribute, { foreignKey: 'event_id' });

db.sequelize.sync({ alter: false }) // Ubah sementara ke false agar tidak error syntax
.then(() => {
    console.log('Database Connected Successfully!');
})
.catch(err => {
    console.error('Sync Error: ', err.message);
});
module.exports = db
