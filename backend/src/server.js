import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = "https://syipugxeidvveqpbpnum.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test route
app.get("/", (req, res) => res.send("Bublii is now running."));

// Registration route 
app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(201).json({ msg: "User registered successfully", user: data.user });
});

// Login route
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.json({ msg: "Login successful", token: data.session.access_token });
});

// Get user info 
app.get("/api/auth/me", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ msg: "Invalid token" });

    res.json({ user: data.user });
});

// Logout route
app.post("/api/auth/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) return res.status(400).json({ msg: error.message });

    res.json({ msg: "Logged out successfully" });
});

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
