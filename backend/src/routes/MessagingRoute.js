import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

//Retrieve private DM



//Save private DM
router.post("/dm/save", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser();

    const { email } = req.body;

    if (error || !user) {
        return res.status(401).send("Unauthorized");
      }

    const { message } = req.body;

    const { data, error: databaseError } = await supabase
        .from('DMs')
        .insert([
            {
                user_id: user.id,
                message: message,
                created_at: new Date().toISOString(),
            }
            ]);

    if (databaseError) {
        return res.status(500).send("Message could not be saved.");
    }

    res.status(200).send("Message was saved successfully");

});



export default router;