import express from 'express';
import request from 'supertest';
import router from '../src/routes/GalleryRoute.js';
import { supabase } from '../src/server.js';

// Mock supabase
jest.mock('../src/server.js', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Channel Creation Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /gal/createChannel', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/gal/createChannel')
        .send({ channelName: 'test-channel', galleryId: '123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized: No token provided');
    });

    it('should return 401 when authentication fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const response = await request(app)
        .post('/gal/createChannel')
        .set('Authorization', 'Bearer fake-token')
        .send({ channelName: 'test-channel', galleryId: '123' });

      expect(response.status).toBe(401);
      expect(response.body.msg).toBe('Invalid or expired token.');
    });

    it('should create a channel successfully', async () => {
      // Mock auth success
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123', role: 'user' } },
        error: null
      });

      // Mock channel creation success
      const mockInsert = jest.fn().mockReturnThis();
      supabase.from.mockReturnValue({
        insert: mockInsert
      });

      const response = await request(app)
        .post('/gal/createChannel')
        .set('Authorization', 'Bearer valid-token')
        .send({ channelName: 'test-channel', galleryId: '123' });

      expect(supabase.from).toHaveBeenCalledWith('Channels');
      expect(mockInsert).toHaveBeenCalledWith({
        ChannelName: 'test-channel',
        Created_at: expect.any(String),
        GalleryID: '123'
      });
      
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('Channel was successfully created.');
    });

    it('should return 500 when database error occurs', async () => {
      // Mock auth success
      supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123', role: 'user' } },
        error: null
      });

      // Mock database error
      const mockInsert = jest.fn().mockReturnThis();
      supabase.from.mockReturnValue({
        insert: mockInsert
      });
      
      // Simulate database error
      mockInsert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const response = await request(app)
        .post('/gal/createChannel')
        .set('Authorization', 'Bearer valid-token')
        .send({ channelName: 'test-channel', galleryId: '123' });

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Channel could not be created.');
    });
  });
});