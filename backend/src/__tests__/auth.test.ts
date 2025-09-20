import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });
});