import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

//Retrieve private DM (When user is receiving message)

router.get("/dm/retrieve", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { email } = req.body;

    const receiverInfo = await fetch(`http://localhost:4000/api/userid/${email}`);
    const receiverData = await receiverInfo.json();
    const receiverId = receiverData.data.user_id;

    console.log(user.id);
    console.log(receiverId);

    const { data, error: databaseError } = await supabase
        .from('DMs')
        .select('*')
        .or(
            `and(BubblerID.eq.${user.id},PopperID.eq.${receiverId}),and(BubblerID.eq.${receiverId},PopperID.eq.${user.id})`
        );

    console.log("data here: " + data);

    if (databaseError) {
        return res.status(500).json({msg:"Messages could not be fetched.", databaseError});
    }

    res.json({ msg: "DMs were fetched.", data });

});


//Save private DM (When user is sending message)
router.post("/dm/save", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { email, message } = req.body;

    const receiverInfo = await fetch(`http://localhost:4000/api/userid/${email}`);
    const receiverData = await receiverInfo.json();
    const receiverId = receiverData.data.user_id;

    if (!receiverInfo) {
        return res.status(404).json({ error: "User not found"});
    }

    const { data, error: databaseError } = await supabase
        .from('DMs')
        .insert([
            {
                BubblerID: user.id,
                PopperID: receiverId,
                Message: message,
                Timestamp: new Date().toISOString(),
            }
            ]);

    if (databaseError) {
        return res.status(500).json({msg:"Message could not be saved.", databaseError});
    }

    res.status(200).json({msg:"Message was saved successfully", data});

});


//Retrieve User uuid using a user's email
router.get("/api/userid/:email", async (req, res) => {

    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: "Email was not received." });
    }
    const { data, error } = await supabase
    .from('Users')
    .select('user_id') 
    .eq('email', email)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json({ msg: "Uuid was retrieved.", data });

});



export default router;