import express from 'express';
import request from 'supertest';
import router from '../src/routes/ProtectedRoute.js';
import { supabase } from '../src/server.js';

// Mock supabase
jest.mock('../src/server.js', () => ({
  supabase: {
    auth: {
      signOut: jest.fn()
    }
  }
}));

describe('Authentication - Logout', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully log out a user', async () => {
    // Mock successful logout
    supabase.auth.signOut.mockResolvedValue({
      error: null
    });

    const response = await request(app)
      .post('/api/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('msg', 'Logged out successfully');
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle errors during logout', async () => {
    // Mock error during logout
    supabase.auth.signOut.mockResolvedValue({
      error: { message: 'Session not found' }
    });

    const response = await request(app)
      .post('/api/auth/logout');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Session not found');
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});