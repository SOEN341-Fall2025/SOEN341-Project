import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

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

    const token = data.session?.access_token

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

    //Creating personal gallery upon creation
    const galCreation = await fetch('http://localhost:4000/gal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
        },
        body: JSON.stringify({"galleryName":`${username}'s Room`}), // Pass the gallery name in the body
      });

    const galResponse = await galCreation.json();

    if(!galCreation.ok){
        return res.status(500).json({ msg: galResponse?.msg });
    }else{
        res.status(201).json({ msg: "User registered successfully", user: data.user });
    }
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
router.get("/api/get/me", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Unauthorized" });
    // Directly call the logic of /api/auth/me
    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ msg: "Invalid token" });

    const userId = data.user.id;
    //console.log(userId);
    const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('user_id', userId);

    if (userError) return res.status(505).json({ msg: "Error fetching user data" });

    res.json({ user: userData });
});
// Get user auth 
router.get("/api/auth/me", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Unauthorized" });
    
    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ msg: "Invalid token" });
    const response = { 
        valid: true, 
        user: data.user
    };
    //console.log('Sending response:', response);  // Log the response
    res.json(response);
});
// Logout route
router.post("/api/auth/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) return res.status(400).json({ msg: error.message });

    res.json({ msg: "Logged out successfully" });
});

router.post("/api/auth/updateUser", async (req, res) => {
    const { userId, columnName, newValue } = req.body;
    const token = req.header("Authorization")?.split(" ")[1];
    console.log(req.body);
    if (!token) return res.status(401).json({ msg: "Unauthorized" });
  
    try {
  
      // Update the user's information
      const { data, error } = await supabase
        .from('Users')
        .update({ [columnName]: newValue })
        .eq('user_id', userId);
  
      if (error) throw error;
  
      res.json({ message: "User updated successfully", data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
export default router;