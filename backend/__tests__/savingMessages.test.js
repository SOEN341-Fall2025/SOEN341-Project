import request from "supertest";
import express from "express";
import MessagingRoute from "../src/routes/MessagingRoute.js";
import { supabase } from "../src/server.js";

// Mock dependencies
jest.mock("../src/server.js", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe("DM Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", MessagingRoute);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });
   describe("POST /api/dm/save", () => {
      it("should save a direct message successfully", async () => {
        // Mock auth
        const mockUser = { id: "user123" };
        supabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
  
        // Mock receiver fetch
        global.fetch.mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            data: { user_id: "receiver456" },
          }),
        });
  
        // Mock insert
        supabase
          .from()
          .insert.mockResolvedValue({ data: { id: "msg123" }, error: null });
  
        const response = await request(app)
          .post("/api/dm/save")
          .set("Authorization", "Bearer token123")
          .send({ username: "receiver", message: "Hello!" });
  
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("Message was saved successfully");
        expect(supabase.from).toHaveBeenCalledWith("DMs");
        expect(supabase.insert).toHaveBeenCalledWith([
          expect.objectContaining({
            BubblerID: "user123",
            PopperID: "receiver456",
            Message: "Hello!",
          }),
        ]);
      });
  
      it("should return 401 if user is not authenticated", async () => {
        supabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: "Unauthorized" },
        });
  
        const response = await request(app)
          .post("/api/dm/save")
          .set("Authorization", "Bearer invalid")
          .send({ username: "receiver", message: "Hello!" });
  
        expect(response.status).toBe(401);
      });
  
      it("should return 500 if message could not be saved", async () => {
        // Mock auth
        supabase.auth.getUser.mockResolvedValue({
          data: { user: { id: "user123" } },
          error: null,
        });
  
        // Mock receiver fetch
        global.fetch.mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            data: { user_id: "receiver456" },
          }),
        });
  
        // Mock database error
        supabase.from().insert.mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        });
  
        const response = await request(app)
          .post("/api/dm/save")
          .set("Authorization", "Bearer token123")
          .send({ username: "receiver", message: "Hello!" });
  
        expect(response.status).toBe(500);
        expect(response.body.msg).toBe("Message could not be saved.");
      });
    });
});