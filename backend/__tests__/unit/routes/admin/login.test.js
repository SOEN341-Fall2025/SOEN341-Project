
import express from 'express';
import request from 'supertest';
import router from '../../../../src/routes/ProtectedRoute.js';
import { supabase } from '../../../../src/server.js';

// Mock supabase
jest.mock('../../../../src/server.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}));

describe('Authentication - Login', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully log in with valid credentials', async () => {
    // Mock successful login
    const mockSession = {
      access_token: 'fake-token-123',
      refresh_token: 'fake-refresh-token',
      user: { id: 'user123', email: 'test@example.com' }
    };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: mockSession,
        user: { id: 'user123', email: 'test@example.com' }
      },
      error: null
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('msg', 'Login successful');
    expect(response.body).toHaveProperty('token', 'fake-token-123');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123'
    });
  });

  it('should return 400 with invalid credentials', async () => {
    // Mock failed login
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('msg', 'Invalid login credentials');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
  });
});