import request from "supertest";
import express from "express";
import fileUploadRoute from "../src/routes/FileUploadRoute.js";

// Create express app with the router
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUploadRoute);

// Mock Supabase
jest.mock("../src/server.js", () => {
  return {
    supabase: {
      storage: {
        from: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue({ data: [], error: null }),
          upload: jest
            .fn()
            .mockResolvedValue({
              data: { path: "test-path.png" },
              error: null,
            }),
          remove: jest.fn().mockResolvedValue({ error: null }),
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({
            data: { user: { id: "test-user-id" } },
            error: null,
          }),
      },
    },
  };
});

describe("POST /api/upload/profile-picture", () => {
  it("should return 400 if file or user_id is missing", async () => {
    const res = await request(app)
      .post("/api/upload/profile-picture")
      .field("user_id", "123")
      .field("simulateFile", "none");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing file or user_id/);
  });

  it("should return 400 for invalid file type", async () => {
    const res = await request(app)
      .post("/api/upload/profile-picture")
      .field("user_id", "123")
      .field("fileType", "text/plain");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch("Missing file or user_id");
  });

  describe("GET /api/users/:id/profile-picture", () => {
    it("should return profile picture URL", async () => {
      const { supabase } = require("../src/server.js");

      const mockProfilePictureUrl = "https://example.com/test.jpg";

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { profile_picture_url: mockProfilePictureUrl },
          error: null,
        }),
      }));

      const res = await request(app).get("/api/users/user123/profile-picture");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "profile_picture_url",
        mockProfilePictureUrl
      );
    });

    it("should return 404 if user not found", async () => {
      const { supabase } = require("../src/server.js");

      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "User not found" },
        }),
      }));

      const res = await request(app).get(
        "/api/users/nonexistent/profile-picture"
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /dm/upload-file", () => {
    it("should return 401 if not authenticated", async () => {
      const { supabase } = require("../src/server.js");

      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const res = await request(app)
        .post("/dm/upload-file")
        .set("Authorization", "Bearer invalid-token")
        .field("DmID", "dm123");

      expect(res.status).toBe(401);
    });
  });
});
