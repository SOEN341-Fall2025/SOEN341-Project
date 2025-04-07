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

describe('Admin Promotion Endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/gallery/:galleryId/members/admin', () => {
    it('should return 403 when requester is not an admin', async () => {
      // Mock admin check - not an admin
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
        .put('/api/gallery/123/members/admin')
        .send({ 
          username: 'testuser', 
          adminUserId: 'notadmin123' 
        });

      expect(response.status).toBe(403);
      expect(response.body.msg).toBe('Not authorized');
    });

    it('should return 404 when target user is not found', async () => {
      // Mock admin check - is admin
      const mockAdminSelect = jest.fn().mockReturnThis();
      const mockAdminEq = jest.fn().mockReturnThis();
      const mockAdminSingle = jest.fn().mockResolvedValue({
        data: { GalleryRole: true },
        error: null
      });

      // Mock user lookup - user not found
      const mockUserSelect = jest.fn().mockReturnThis();
      const mockUserEq = jest.fn().mockReturnThis();
      const mockUserSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });

      // Setup the chain of mocks
      supabase.from.mockImplementation((table) => {
        if (table === 'GalleryMembers') {
          return {
            select: mockAdminSelect,
            eq: mockAdminEq,
            single: mockAdminSingle
          };
        } else if (table === 'Users') {
          return {
            select: mockUserSelect,
            eq: mockUserEq,
            single: mockUserSingle
          };
        }
      });

      const response = await request(app)
        .put('/api/gallery/123/members/admin')
        .send({ 
          username: 'nonexistentuser', 
          adminUserId: 'admin123' 
        });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('User not found');
    });


  describe('PUT /api/gallery/:galleryId/members/owner', () => {
    it('should demote admin successfully when requester is owner', async () => {
      // Mock owner check
      const mockOwnerSelect = jest.fn().mockReturnThis();
      const mockOwnerEq = jest.fn().mockReturnThis();
      const mockOwnerSingle = jest.fn().mockResolvedValue({
        data: { Creator_id: 'owner123' },
        error: null
      });

      // Mock user lookup
      const mockUserSelect = jest.fn().mockReturnThis();
      const mockUserEq = jest.fn().mockReturnThis();
      const mockUserSingle = jest.fn().mockResolvedValue({
        data: { user_id: 'admin123' },
        error: null
      });

      // Mock update operation
      const mockUpdate = jest.fn().mockReturnThis();
      const mockUpdateEq1 = jest.fn().mockReturnThis();
      const mockUpdateEq2 = jest.fn().mockResolvedValue({
        data: { count: 1 },
        error: null
      });

      // Setup the chain of mocks
      supabase.from.mockImplementation((table) => {
        if (table === 'Galleries') {
          return {
            select: mockOwnerSelect,
            eq: mockOwnerEq,
            single: mockOwnerSingle
          };
        } else if (table === 'Users') {
          return {
            select: mockUserSelect,
            eq: mockUserEq,
            single: mockUserSingle
          };
        } else if (table === 'GalleryMembers') {
          return {
            update: mockUpdate,
            eq: jest.fn().mockImplementation((field, value) => {
              if (field === 'UserID') return { eq: mockUpdateEq2 };
              if (field === 'GalleryID') return mockUpdateEq1;
              return mockUpdateEq2;
            })
          };
        }
      });

      const response = await request(app)
        .put('/api/gallery/123/members/owner')
        .send({ 
          username: 'adminuser', 
          OwnerUserId: 'owner123' 
        });

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('User demoted successfully');
    });
    });
  });
});