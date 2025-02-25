import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

router.use(express.json());

// Registration route 
router.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password ) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    //Adding data to our own table
    const { id } = data.user;
    const { error: insertError } = await supabase
        .from("Users")
        .insert([{ id, email, password }]);

    if (error) {
        return res.status(400).json({ msg: error.message });
    }
    if (insertError) {
        return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({ msg: "User registered successfully", user: data.user });

});

// Login route
router.post("/api/auth/login", async (req, res) => {
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
router.get("/api/auth/me", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ msg: "Invalid token" });

    res.json({ user: data.user });
});

// Logout route
router.post("/api/auth/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) return res.status(400).json({ msg: error.message });

    res.json({ msg: "Logged out successfully" });
});


export default router;