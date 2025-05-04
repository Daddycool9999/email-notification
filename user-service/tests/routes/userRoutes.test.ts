import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/userRoutes';
import { publishRegisteredUser } from '../../src/publisher/registeredUserPublisher';

jest.mock('../../src/publisher/registeredUserPublisher');

describe('User Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return Hello World', async () => {
      const response = await request(app).get('/users/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World');
    });
  });

  describe('POST /register', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    it('should successfully register a user', async () => {
      (publishRegisteredUser as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/users/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User registered successfully' });
      expect(publishRegisteredUser).toHaveBeenCalledWith(validUser);
    });

    it('should handle publisher errors', async () => {
      (publishRegisteredUser as jest.Mock).mockRejectedValueOnce(new Error('Publisher error'));

      const response = await request(app)
        .post('/users/register')
        .send(validUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to publish registered user' });
    });
  });
}); 