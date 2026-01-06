const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('../src/models');
const usersController = require('../src/controllers/user');
const authMiddleware = require('../src/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Express app and routes
app.use(bodyParser.json());
app.post('/login', usersController.login);
app.post('/sign-up', usersController.signUp);
app.get('/profile', authMiddleware.verifyToken, usersController.getEmail);

process.env.JWT_SECRET = 'testsecret';

// Mock User model
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const User = db.User;

describe('User Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /login', () => {
    it('should login user and return token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 if email is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('POST /sign-up', () => {
    it('should sign up user and return token', async () => {
      User.findOne.mockResolvedValue(null);
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/sign-up')
        .send({ email: 'newuser@example.com', password: 'password123' });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if user already exists', async () => {
      const mockUser = {
        id: 1,
        email: 'existinguser@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/sign-up')
        .send({ email: 'existinguser@example.com', password: 'password123' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('GET /profile', () => {
    it('should return user email', async () => {
      const mockUser = { email: 'test@example.com' };
      User.findByPk.mockResolvedValue(mockUser);

      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 500 if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('User not found');
    });
  });
});
