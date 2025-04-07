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

  describe("GET /dm/fetch-user", () => {
    it("should return user data when valid username is provided", async () => {
      // Mock Supabase response
      const mockUserData = { username: "testuser" };
      supabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({ data: mockUserData, error: null });

      // Make request
      const response = await request(app)
        .get("/dm/fetch-user")
        .query({ username: "testuser" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        msg: "Username is fetched",
        user: mockUserData,
      });
      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(supabase.select).toHaveBeenCalledWith("username");
      expect(supabase.eq).toHaveBeenCalledWith("username", "testuser");
    });

    it("should return 400 if username is not provided", async () => {
      const response = await request(app).get("/dm/fetch-user");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ msg: "Username is required" });
    });

    it("should return 404 if user is not found", async () => {
      supabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({ data: null, error: null });

      const response = await request(app)
        .get("/dm/fetch-user")
        .query({ username: "nonexistent" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ msg: "User not found." });
    });

    it("should return 500 if database error occurs", async () => {
      supabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        });

      const response = await request(app)
        .get("/dm/fetch-user")
        .query({ username: "testuser" });

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe("Users could not be fetched.");
    });
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

  describe("GET /dm/retrieve", () => {
    it("should retrieve direct messages between users", async () => {
      // Mock auth
      const mockUser = { id: "user123" };
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock receiver ID fetch
      global.fetch.mockImplementation((url) => {
        if (url.includes("/api/get/userid-username/")) {
          return Promise.resolve({
            json: () => Promise.resolve({ data: { user_id: "receiver456" } }),
          });
        } else if (url.includes("/api/get/username-id/")) {
          return Promise.resolve({
            json: () => Promise.resolve({ data: { username: "testuser" } }),
          });
        }
      });

      // Mock DM fetch
      const mockDMs = [
        {
          id: "dm1",
          BubblerID: "user123",
          PopperID: "receiver456",
          Message: "Hello",
        },
        {
          id: "dm2",
          BubblerID: "receiver456",
          PopperID: "user123",
          Message: "Hi there",
        },
      ];
      supabase
        .from()
        .select()
        .or.mockResolvedValue({ data: mockDMs, error: null });

      const response = await request(app)
        .get("/dm/retrieve")
        .set("Authorization", "Bearer token123")
        .query({ username: "receiver" });

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("DMs were fetched.");
      expect(response.body.updatedData).toHaveLength(2);
      expect(response.body.updatedData[0]).toHaveProperty("PopperUsername");
      expect(response.body.updatedData[0]).toHaveProperty("BubblerUsername");
    });

    it("should return 401 if user is not authenticated", async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Unauthorized" },
      });

      const response = await request(app)
        .get("/dm/retrieve")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /dm/contacts", () => {
    it("should fetch user contacts", async () => {
      // Mock auth
      const mockUser = { id: "user123" };
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock DMs fetch
      const mockDMs = [
        {
          BubblerID: "user123",
          PopperID: "contact1",
          Timestamp: "2023-01-01T00:00:00Z",
        },
        {
          BubblerID: "contact2",
          PopperID: "user123",
          Timestamp: "2023-01-02T00:00:00Z",
        },
      ];
      supabase
        .from()
        .select()
        .or.mockResolvedValue({ data: mockDMs, error: null });

      // Mock username fetches
      global.fetch.mockImplementation((url) => {
        if (url.includes("contact1")) {
          return Promise.resolve({
            json: () => Promise.resolve({ data: { username: "contact1user" } }),
          });
        } else if (url.includes("contact2")) {
          return Promise.resolve({
            json: () => Promise.resolve({ data: { username: "contact2user" } }),
          });
        }
      });

      const response = await request(app)
        .get("/dm/contacts")
        .set("Authorization", "Bearer token123");

      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("Contacts were fetched.");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          { username: "contact1user" },
          { username: "contact2user" },
        ])
      );
    });
  });

  describe("GET /api/get/username-id/:uuid", () => {
    it("should return username for a given user ID", async () => {
      const mockData = { username: "testuser" };
      supabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({ data: mockData, error: null });

      const response = await request(app).get("/api/get/username-id/user123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        msg: "Username was retrieved.",
        data: mockData,
      });
      expect(supabase.from).toHaveBeenCalledWith("Users");
      expect(supabase.select).toHaveBeenCalledWith("username");
      expect(supabase.eq).toHaveBeenCalledWith("user_id", "user123");
    });
  });
});
