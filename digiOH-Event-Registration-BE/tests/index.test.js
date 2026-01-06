// tests/index.test.js
const SequelizeMock = require('sequelize-mock');
const db = require('../src/models');

describe('Database Models', () => {
  let sequelizeMock;

  beforeAll(async () => {
    sequelizeMock = new SequelizeMock();
    db.sequelize = sequelizeMock;

    // Membuat mock models
    db.Guest = sequelizeMock.define('Guest', {});
    db.User = sequelizeMock.define('User', {});
    db.Event = sequelizeMock.define('Event', {});
    db.Attribute = sequelizeMock.define('Attribute', {});

    // Mensimulasikan asosiasi
    db.Attribute.belongsTo(db.Guest, { foreignKey: 'guest_id', onDelete: 'CASCADE' });
    db.Attribute.belongsTo(db.Event, { foreignKey: 'event_id', onDelete: 'CASCADE' });
    db.Guest.hasMany(db.Attribute, { foreignKey: 'guest_id' });
    db.Event.hasMany(db.Attribute, { foreignKey: 'event_id' });
  });

  afterAll(async () => {
    //
  });

  it('should authenticate successfully', async () => {
    db.sequelize.authenticate = jest.fn().mockResolvedValue(true);
    await expect(db.sequelize.authenticate()).resolves.toBeTruthy();
  });

  it('should define the Guest model', () => {
    expect(db.Guest).toBeDefined();
  });

  it('should define the User model', () => {
    expect(db.User).toBeDefined();
  });

  it('should define the Event model', () => {
    expect(db.Event).toBeDefined();
  });

  it('should define the Attribute model', () => {
    expect(db.Attribute).toBeDefined();
  });

  //  it('should create associations between models', () => {

  //  });
});
