import express from "express";
// Initialize Router element
const router = express.Router();
import { supabase } from "./server.js";

router.use(express.json());

router.put("/api/newusername", async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);
  const { newUsername } = req.body; // Get the user ID and new username from the request body

  // Validate input
  if (error || !user) {
    return res.status(401).json(error);
}

  // Update the username in the database
  const { data, error: databaseError } = await supabase
    .from("Users")
    .update({ username: newUsername })
    .eq("user_id", user.id); // Update the user with the matching ID

  if (databaseError) {
    return res.status(400).json({ msg: databaseError.message });
  }


 
  // Return success response
 return res.status(200).json({ msg: "Username updated successfully", data });
});


router.post("/api/newaboutme", async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);
  const { newAboutMe } = req.body; // Get the user ID and new username from the request body

  if (error || !user) {
    return res.status(401).json(error);
}
  // Update user's about me
  const{data, error: databaseError} = await supabase
  .from('Users')
  .update({about_me: newAboutMe}  )
  .eq("user_id", user.id);

  if (databaseError) {
    return res.status(400).json({ msg: databaseError.message });
  }

  return res.status(200).json({ msg: "About me updated successfully" });
});

router.post("/api/newpassword", async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);
  const { newPassword } = req.body; // Get the user ID and new username from the request body

  if (error || !user) {
    return res.status(401).json(error);
}
  // Update password
  const{ data, error: databaseError} = await supabase
  .from('Users')
  .update({password: newPassword}  )
  .eq("user_id", user.id);

  if (databaseError) {
    return res.status(400).json({ msg: databaseError.message });
  }

  return res.status(200).json({ msg: "Password updated successfully" });
});
export default router;