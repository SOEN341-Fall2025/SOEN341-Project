import express from "express";
import { supabase } from "../server.js";

const router = express.Router();
router.use(express.json());

// Registration route 
router.post("/api/auth/register", async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password ) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp(
        {
            email,
            password,
        },
        {
            data: {
                username
            }
        });

    //Adding data to our own table
    const { error: databaseError } = await supabase
        .from("Users")
        .insert([{
                user_id: data.user?.id,
                Created_at: new Date().toISOString(),
                email: email, 
                username : username,
                password: password 
            }]);

    if (error) {
        return res.status(400).json({ msg: error.message });
    }
    if (databaseError) {
        return res.status(500).json({ error: databaseError.message });
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
        console.error("Supabase authentication error:", error.message);
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