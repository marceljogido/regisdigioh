const request = require('supertest');
const express = require('express');
const db = require('../src/models');
const eventController = require('../src/controllers/event');
const Event = db.Event;

const app = express();
app.use(express.json());

app.post('/api/event', eventController.createEvent);
app.delete('/api/event-delete/:id', eventController.deleteEvent);
app.patch('/api/event-update/:id', eventController.updateEvent);
app.get('/api/events', eventController.getAllEvents);
app.get('/api/events/names', eventController.getAllEventNames);
app.get('/api/events/:id', eventController.getEventById);

describe('Event Controller', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should create a new event', async () => {
        const response = await request(app)
            .post('/api/event')
            .send({
                name: 'Sample Event',
                start_date: '2024-07-30',
                end_date: '2024-08-01',
                sales: 'Sales Rep',
                account_manager: 'Account Manager',
                company: 'Example Inc.',
                event_time: '10:00 AM',
                loading_date: '2024-07-29',
                discord_channel: 'example.com',
                drive_folder: 'example.com',
                location: 'Sample Location'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Sample Event');
    });

    it('should delete an event', async () => {
        const event = await Event.create({
            name: 'Delete Event',
            start_date: '2024-07-30',
            end_date: '2024-08-01',
            sales: 'Sales Rep',
            account_manager: 'Account Manager',
            company: 'Example Inc.',
            event_time: '10:00 AM',
            loading_date: '2024-07-29',
            discord_channel: 'example.com',
            drive_folder: 'example.com',
            location: 'Sample Location'
        });

        const response = await request(app).delete(`/api/event-delete/${event.id}`);
        expect(response.status).toBe(204);
    });

    it('should update an event', async () => {
        const event = await Event.create({
            name: 'Update Event',
            start_date: '2024-07-30',
            end_date: '2024-08-01',
            sales: 'Sales Rep',
            account_manager: 'Account Manager',
            company: 'Example Inc.',
            event_time: '10:00 AM',
            loading_date: '2024-07-29',
            discord_channel: 'example.com',
            drive_folder: 'example.com',
            location: 'Sample Location'
        });

        const response = await request(app)
            .patch(`/api/event-update/${event.id}`)
            .send({
                name: 'Updated Event',
                start_date: '2024-08-01',
                end_date: '2024-08-05',
                sales: 'New Sales Rep',
                account_manager: 'New Account Manager',
                company: 'New Example Inc.',
                event_time: '11:00 AM',
                loading_date: '2024-07-30',
                discord_channel: 'example2.com',
                drive_folder: 'example2.com',
                location: 'Updated Location',
                last_updated_by: 'admin',
                last_updated_at: '2024-07-30T10:00:00Z'
            });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Event');
    });

    it('should get all events', async () => {
        const response = await request(app).get('/api/events');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should get all event names', async () => {
        const response = await request(app).get('/api/events/names');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should get an event by ID', async () => {
        const event = await Event.create({
            name: 'Get Event',
            start_date: '2024-07-30',
            end_date: '2024-08-01',
            sales: 'Sales Rep',
            account_manager: 'Account Manager',
            company: 'Example Inc.',
            event_time: '10:00 AM',
            loading_date: '2024-07-29',
            discord_channel: 'example.com',
            drive_folder: 'example.com',
            location: 'Sample Location'
        });

        const response = await request(app).get(`/api/events/${event.id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Get Event');
    });
});
