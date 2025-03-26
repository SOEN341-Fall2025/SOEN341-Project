import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

// Mock admin routes
app.get('/api/admin/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'admin-token') {
    res.json([]);
  } else {
    res.status(403).json({ msg: 'Not authorized' });
  }
});

app.put('/api/admin/users/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === 'admin-token') {
    res.json({ role: req.body.role });
  } else {
    res.status(403).json({ msg: 'Not authorized' });
  }
});

describe('Admin Routes', () => {
  describe('GET /api/admin/users', () => {
    it('should return all users when admin is authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer admin-token');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 403 when non-admin user is authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer user-token');
      
      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/admin/users/:userId', () => {
    it('should update user role when admin is authenticated', async () => {
      const userId = 'test-user-id';
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', 'Bearer admin-token')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.role).toBe(updateData.role);
    });
  });
}); 