
import express from 'express';
import request from 'supertest';
import router from '../../../../src/admin.js';
import { supabase } from '../../../../src/server.js';

// Mock supabase
jest.mock('../../../../src/server.js', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('Admin Check Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/gallery/:galleryId/members/checkadmin', () => {
    it('should return 403 when user is not an admin', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { GalleryRole: false },
        error: null
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      });

      const response = await request(app)
        .put('/api/gallery/123/members/checkadmin')
        .send({ adminUserId: 'user123' });

      expect(response.status).toBe(403);
      expect(response.body.msg).toBe('Not authorized');
    });

    it('should return 403 when database error occurs', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      });

      const response = await request(app)
        .put('/api/gallery/123/members/checkadmin')
        .send({ adminUserId: 'user123' });

      expect(response.status).toBe(403);
      expect(response.body.msg).toBe('Not authorized');
    });
  });

  describe('DELETE /api/messages/:MsgId', () => {
  

    it('should return 403 when user is not an admin', async () => {
      // Mock message check
      const mockMsgSelect = jest.fn().mockReturnThis();
      const mockMsgEq = jest.fn().mockReturnThis();
      const mockMsgSingle = jest.fn().mockResolvedValue({
        data: { Gallery_id: 'gallery123' },
        error: null
      });

      // Mock admin check - user is not admin
      const mockAdminSelect = jest.fn().mockReturnThis();
      const mockAdminEq = jest.fn().mockReturnThis();
      const mockAdminSingle = jest.fn().mockResolvedValue({
        data: { GalleryRole: false },
        error: null
      });

      // Setup the chain of mocks
      supabase.from.mockImplementation((table) => {
        if (table === 'ChannelMessages') {
          return {
            select: mockMsgSelect,
            eq: mockMsgEq,
            single: mockMsgSingle
          };
        } else if (table === 'GalleryMembers') {
          return {
            select: mockAdminSelect,
            eq: mockAdminEq,
            single: mockAdminSingle
          };
        }
      });

      const response = await request(app)
        .delete('/api/messages/msg123')
        .send({ userId: 'user123' });

      expect(response.status).toBe(403);
      expect(response.body.msg).toBe('You are not an admin or not part of this gallery.');
    });

    it('should return 404 when message is not found', async () => {
      // Mock message check - message not found
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      });

      const response = await request(app)
        .delete('/api/messages/nonexistent')
        .send({ userId: 'user123' });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('Message not found.');
    });
  });

});