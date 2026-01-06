const request = require('supertest');
const express = require('express');
const db = require('../src/models');
const guestController = require('../src/controllers/guest');
const Guest = db.Guest;
const Attribute = db.Attribute;
const sequelize = db.sequelize;

const app = express();
app.use(express.json());

app.post('/api/guests', guestController.addGuest);
app.delete('/api/guests/:id', guestController.deleteGuest);
app.patch('/api/guests/:id', guestController.updateGuest);
app.get('/api/guests/:guest_id', guestController.getGuestById);
app.get('/api/events/:event_id/guests', guestController.getGuestsByEvent);
app.get('/api/events/:event_id/guests/simple', guestController.getGuestsByEventSimple);
app.get('/api/events/:event_id/guest-count', guestController.getGuestCountByConfirmationStatus);
app.patch('/api/guests/:id/confirmation', guestController.updateConfirmation);
app.patch('/api/guests/:id/attendance', guestController.updateAttendance);
app.patch('/api/guests/:id/emailed', guestController.updateEmailed);
app.patch('/api/guests/:id/confirmation-updated-by', guestController.updateConfirmationUpdatedBy);
app.patch('/api/guests/:id/attendance-updated-by', guestController.updateAttendanceUpdatedBy);
app.patch('/api/guests/:id/attributes-updated-by', guestController.updateAttributesUpdatedBy);
app.patch('/api/guests/:id/email-sent-by', guestController.updateEmailSentBy);

describe('Guest Controller', () => {
    beforeEach(() => {
        jest.resetAllMocks();
      });

    it('should add a new guest', async () => {
      const response = await request(app)
        .post('/api/guests')
        .send({
          username: 'John Doe',
          email: 'john.doe@example.com',
          phoneNum: '1234567890',
          confirmation: 'confirmed',
          attendance: 'attended',
          instansi: 'Example Inc.',
          event_id: 3,
          "key_1": "value 1",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should delete a guest', async () => {
      const guest = await Guest.create({
        username: 'Jane Doe',
        email: 'jane.doe@example.com',
        phoneNum: '1234567890',
        confirmation: 'confirmed',
        attendance: 'attended',
        instansi: 'Example Inc.',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app).delete(`/api/guests/${guest.id}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Guest deleted successfully');
    });

    it('should update a guest', async () => {
      const guest = await Guest.create({
        username: 'Jack Doe',
        email: 'jack.doe@example.com',
        phoneNum: '1122334455',
        confirmation: 'cancelled',
        attendance: 'attended',
        instansi: 'Example LLC',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}`)
        .send({
          username: 'Jack Smith',
          email: 'jack.smith@example.com',
          phoneNum: '9988776655',
          confirmation: 'confirmed',
          attendance: 'did not attend',
          instansi: 'New Example Inc.',
          event_id: 3,
          attributes: {
            customAttr: 'newCustomValue'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.username).toBe('Jack Smith');
    });

    it('should get a single guest by ID', async () => {
      const guest = await Guest.create({
        username: 'Jim Doe',
        email: 'jim.doe@example.com',
        phoneNum: '6677889900',
        confirmation: 'represented',
        attendance: 'attended',
        instansi: 'Example Ltd.'
      });

      const response = await request(app).get(`/api/guests/${guest.id}`);
      expect(response.status).toBe(200);
      expect(response.body.username).toBe('Jim Doe');
    });

    it('should get guests by event ID', async () => {
      const response = await request(app).get('/api/events/1/guests');
      expect(response.status).toBe(200);
      expect(response.body.guests).toBeInstanceOf(Array);
    });

    it('should get simple guest list by event ID', async () => {
      const response = await request(app).get('/api/events/1/guests/simple');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should get guest count by confirmation status', async () => {
      const response = await request(app).get('/api/events/1/guest-count');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('confirmed');
    });

    it('should update guest confirmation status', async () => {
      const guest = await Guest.create({
        username: 'Joe Doe',
        email: 'joe.doe@example.com',
        phoneNum: '2233445566',
        confirmation: 'cancelled',
        attendance: 'attended',
        instansi: 'Example Partners',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/confirmation`)
        .send({ confirmation: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.confirmation).toBe('confirmed');
    });

    it('should update guest attendance status', async () => {
      const guest = await Guest.create({
        username: 'Jake Doe',
        email: 'jake.doe@example.com',
        phoneNum: '5566778899',
        confirmation: 'to be confirmed',
        attendance: 'did not attend',
        instansi: 'Example Enterprises',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/attendance`)
        .send({ attendance: 'attended' });

      expect(response.status).toBe(200);
      expect(response.body.attendance).toBe('attended');
    });

    it('should update guest emailed status', async () => {
      const guest = await Guest.create({
        username: 'Jeff Doe',
        email: 'jeff.doe@example.com',
        phoneNum: '3344556677',
        confirmation: 'represented',
        attendance: 'did not attend',
        instansi: 'Example Industries',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/emailed`)
        .send({ emailed: true });

      expect(response.status).toBe(200);
      expect(response.body.emailed).toBe(true);
    });

    it('should update confirmation updated by status', async () => {
      const guest = await Guest.create({
        username: 'Jerry Doe',
        email: 'jerry.doe@example.com',
        phoneNum: '8899776655',
        confirmation: 'to be confirmed',
        attendance: 'did not attend',
        instansi: 'Example Consulting',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/confirmation-updated-by`)
        .send({ confirmation_updated_by: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.confirmation_updated_by).toBe('admin');
    });

    it('should update attendance updated by status', async () => {
      const guest = await Guest.create({
        username: 'James Doe',
        email: 'james.doe@example.com',
        phoneNum: '1100998877',
        confirmation: 'cancelled',
        attendance: 'attended',
        instansi: 'Example Holdings',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/attendance-updated-by`)
        .send({ attendance_updated_by: 'manager' });

      expect(response.status).toBe(200);
      expect(response.body.attendance_updated_by).toBe('manager');
    });

    it('should update attributes updated by status', async () => {
      const guest = await Guest.create({
        username: 'Jason Doe',
        email: 'jason.doe@example.com',
        phoneNum: '2255778899',
        confirmation: 'confirmed',
        attendance: 'attended',
        instansi: 'Example International',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/attributes-updated-by`)
        .send({ attributes_updated_by: 'editor' });

      expect(response.status).toBe(200);
      expect(response.body.attributes_updated_by).toBe('editor');
    });

    it('should update email sent by status', async () => {
      const guest = await Guest.create({
        username: 'Jen Doe',
        email: 'jen.doe@example.com',
        phoneNum: '6677004455',
        confirmation: 'represented',
        attendance: 'attended',
        instansi: 'Example Global',
        event_id: 3,
        "key_1": "value 1",
      });

      const response = await request(app)
        .patch(`/api/guests/${guest.id}/email-sent-by`)
        .send({ email_sent_by: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.email_sent_by).toBe('user123');
    });
})
