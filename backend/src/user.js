import express from "express";
// Initialize Router element
const router = express.Router();
import { supabase } from "./server.js";

router.use(express.json());

router.put("/api/newusername", async (req, res) => {
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

export default router;