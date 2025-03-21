import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

// Mock user routes
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'test-token') {
    res.json({ id: 'test-id', email: 'test@example.com' });
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
});

app.put('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'test-token') {
    res.json(req.body);
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
});

describe('User Routes', () => {
  describe('GET /api/user/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/user/profile');
      
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile when authenticated', async () => {
      const updateData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', 'Bearer test-token')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
    });
  });
}); 