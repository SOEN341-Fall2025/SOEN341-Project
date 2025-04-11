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
  
  if (error || !user || !newPassword ) {
    console.log("There was an error fetching the data.")
    return res.status(401).json(error);
  }
  
  const { data: updatedUser, error: authError } = await supabase.auth.updateUser({
    password: newPassword, // User's new password
  });
  
  if (authError){
    console.log("There was an error with the authentication.")
    return res.status(400).json({ msg: databaseError.message });
  }

  // Update password
  const{ data, error: databaseError} = await supabase
    .from('Users')
    .update({password: newPassword}  )
    .eq("user_id", user.id);
  
  if (databaseError) {
    console.log("There was an error with the database.")
    return res.status(400).json({ msg: databaseError.message });
  }

  return res.status(200).json({ msg: "Password updated successfully" });
});


router.post("/api/updateUser", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Unauthorized" });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.log("There was an error fetching the data.")
    return res.status(401).json(error);
  }

  const { userId, columnName, newValue } = req.body;
  //console.log(req.body);

  try {

    // Update the user's information
    const { data, error } = await supabase
      .from('Users')
      .update({ [columnName]: newValue })
      .eq('user_id', userId);

    if (error) throw error;
    // Get the user's new information
    const { data: newuser, dataerror } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', userId);
    res.json({ message: "User updated successfully", newuser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user metadata 
router.get("/api/getMe", async (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Unauthorized" });
  // Directly call the logic of /api/auth/me
  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ msg: "Invalid token" });

  const userId = data.user.id;
  console.log("Metadata ID:", userId);
  const { data: metadata, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', userId);
  
  if (userError) return res.status(505).json({ msg: "Error fetching user data" });
  console.log("API metadata", metadata);
  res.json(metadata);
});
export default router;