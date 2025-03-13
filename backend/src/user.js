import express from "express";
// Initialize Router element
const router = express.Router();
import { supabase } from "./server.js";

router.use(express.json());

router.put("/user/newusername", async (req, res) => {
  const { user_id, newUsername } = req.body; // Get the user ID and new username from the request body
  
  // Validate input
  if (!user_id || !newUsername) {
    return res
      .status(400)
      .json({ msg: "User ID and new username are required" });
  }
  
  // Update the username in the database
  const { data, error: databaseError } = await supabase
    .from("Users")
    .update({ username: newUsername })
    .eq("user_id", user_id); // Update the user with the matching ID

  if (databaseError) {
    return res.status(400).json({ msg: error.message });
  }
  
  // Return success response
  res.status(200).json({ msg: "Username updated successfully", data });
});

router.get("/user/channels", async (req, res) => {
  const { gallery_id } = req.query;
  if (!gallery_id) {
    return res.status(400).json({ error: "gallery_id is required" });
  }
  try {
    const { data, error } = await supabase
      .from('Channels')
      .select('*')
      .eq('GalleryID', gallery_id); // Use the dynamic gallery_id
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data); // Send the data back to the client
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;