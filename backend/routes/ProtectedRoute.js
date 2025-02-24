const express = require("express");
const router = express.Router();

// Registration route 
router.post("/api/auth/register", async (req, res) => {
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

router.get("/api/test", async ( req, res ) => {

    const { data, error } = await supabase
    .from('Users')
    .select()
    .eq('id',1)
    .maybeSingle();

    if(error){
        console.error("Error fetching user: ", error);
        return res.status(500).json( { error: error.message })
    }

    res.json(data);

});


module.exports = router;