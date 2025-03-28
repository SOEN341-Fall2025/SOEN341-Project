import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

router.get("/dm/fetch-user", async (req, res) => {

    const { username } = req.query;  // Use req.query for GET parameters

    if (!username) {
        return res.status(400).json({ msg: "Username is required" });
    }

    // Fetch user data from Supabase
    const { data, error: databaseError } = await supabase
        .from("Users")
        .select("username")
        .eq("username", username).single();

    if (databaseError) {
        return res.status(500).json({ msg: "Users could not be fetched.", error: databaseError });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ msg: "User not found." });
    }

    res.status(200).json({ msg: "Username is fetched", user: data });
});


//Retrieve private DM (When user is receiving message)
router.get("/dm/retrieve", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { username } = req.query;

    const receiverInfo = await fetch(`http://localhost:4000/api/get/userid-username/${username}`);
    const receiverData = await receiverInfo.json();
    const receiverId = receiverData.data.user_id;

    const { data, error: databaseError } = await supabase
        .from('DMs')
        .select('*')
        .or(
            `and(BubblerID.eq.${user.id},PopperID.eq.${receiverId}),and(BubblerID.eq.${receiverId},PopperID.eq.${user.id})`
        );

    if (databaseError) {
        return res.status(500).json({msg:"Messages could not be fetched.", databaseError});
    }

    const updatedData = [];

    for (let msg of data) {
        // Fetch the Popper's username
        const popperResponse = await fetch(`http://localhost:4000/api/get/username-id/${msg.PopperID}`);
        const popperData = await popperResponse.json();
        const popperUsername = popperData.data.username;

        // Fetch the Bubbler's username
        const bubblerResponse = await fetch(`http://localhost:4000/api/get/username-id/${msg.BubblerID}`);
        const bubblerData = await bubblerResponse.json();
        const bubblerUsername = bubblerData.data.username;

        // Add the converted usernames to the DM object
        updatedData.push({
            ...msg,
            PopperUsername: popperUsername,
            BubblerUsername: bubblerUsername
        });
    }

    console.log(updatedData);


    res.json({ msg: "DMs were fetched.", updatedData });

});


//Save private DM (When user is sending message)
router.post("/api/dm/save", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { username, message } = req.body;

    const receiverInfo = await fetch(`http://localhost:4000/api/get/userid-username/${username}`);
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
        console.log("MADE IT HEREEE")
        return res.status(500).json({msg:"Message could not be saved.", databaseError});
    }

    res.status(200).json({msg:"Message was saved successfully", data});

});


//List of previously DM'd people (all the people you have previously DM-ed)
router.get("/dm/contacts", async (req, res) => {

        const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

        if (error || !user) {
            return res.status(401).json({ msg: "Unauthorized", error });
        }

        // Fetch messages involving the user
        const { data, error: databaseError } = await supabase
            .from("DMs")
            .select("*")
            .or(`BubblerID.eq.${user.id},PopperID.eq.${user.id}`);

        const contacts = await processDMs(data, user.id);

        if (databaseError) {
            return res.status(500).json({ msg: "Contacts could not be fetched.", error: databaseError });
        }

        res.json({ msg: "Contacts were fetched.", data: contacts });

});

async function processDMs(messages, userid) {

    messages.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    let uniqueContacts = new Set();

    for (let msg of messages) {
        if (msg.BubblerID !== userid) {
            uniqueContacts.add(msg.BubblerID);
        }
        if (msg.PopperID !== userid) {
            uniqueContacts.add(msg.PopperID);
        }
    }

    let contactsArray = await Promise.all(
        Array.from(uniqueContacts).map(async (uuid) => {
            const username = await processContacts(uuid);
            return { username };
        })
    );

    return contactsArray;
}

async function processContacts(uuid){
    try {
        const response = await fetch(`http://localhost:4000/api/get/username-id/${uuid}`);
        const result = await response.json();
        return result.data?.username;
    } catch (error) {
        console.error("Username could not be retrieved.", error);
        return "Unknown User";
    } 
}


//Retrieve User uuid using a user's email
router.get("/api/get/userid/:email", async (req, res) => {

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


//Retrieve User uuid using a user's username
router.get("/api/get/userid-username/:username", async (req, res) => {

    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: "Username was not received." });
    }
    
    const { data, error } = await supabase
    .from('Users')
    .select('user_id') 
    .eq('username', username)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json({ msg: "Uuid was retrieved.", data });

});

//Retrieve username using a user's email
router.get("/api/get/username-email/:email", async (req, res) => {

    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: "Email was not received." });
    }
    const { data, error } = await supabase
    .from('Users')
    .select('username') 
    .eq('email', email)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json({ msg: "Username was retrieved.", data });

});

//Retrieve username using a user's uuid
router.get("/api/get/username-id/:uuid", async (req, res) => {

    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ error: "Uuid was not received." });
    }
    const { data, error } = await supabase
    .from('Users')
    .select('username') 
    .eq('user_id', uuid)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json({ msg: "Username was retrieved.", data });

});

export default router;