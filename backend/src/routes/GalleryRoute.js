import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

//Deletion of a gallery
router.delete("/gal/delete", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }
    const { galleryName } = req.body;

    //Convert gallery name to gallery ID
    const galleryID = await fetch(`/api/gal/getID/${galleryName}`);
    const galleryIDres = await galleryID.json();
    const gallId = galleryIDres.data.GalleryID;
    if(gallId == null){
        return res.status(200).json({msg:"Gallery does not exist."});
    }

    //Helper call
    const verifyUser = await fetch('/api/gal/verifyCreator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: user.id,
          GalleryID: gallId,
        }),
      });
    const verifyUserResponse = await verifyUser.json();

    if(verifyUserResponse.GalleryRole){

        const { data, error: databaseError } = await supabase
        .from('Galleries')
        .delete()
        .eq('GalleryID', gallId);

        if (databaseError) {
            return res.status(500).json({msg:"Gallery could not be deleted.", databaseError});
        }

        res.status(200).json({msg:"Gallery was successfully deleted."});

    }else{
        res.status(200).json({msg:"User is not owner of the gallery."});
    }

});

//Creation of a gallery
router.post("/gal/create", async (req, res) => {    
    
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try{
        // Get the user based on the token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            console.error('Authentication Error:', authError); // Log error for debugging
            return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
        }  
        
        console.error('user ', user.id); // Log error for debugging
          
        const { galleryName } = req.body;    
        const userID = "" + user.id;    
        console.log('User role:', user.role);
        const { data, error: databaseError } = await supabase
            .from("Galleries")
            .insert(
                {
                    GalleryName: galleryName,
                    Created_at: new Date().toISOString(),
                    Creator_id: userID
                }
            )
            .select('GalleryID')
            .single();
        
        if (databaseError) {
            return res.status(500).json({msg:"Gallery could not be created.", databaseError});
        }
        
        const gallId = data.GalleryID;    
        const body = JSON.stringify({
            UserID: userID,
            GalleryID: gallId,
        });
        console.log("body ", body);
        //Helper call
        const addUser = await fetch('http://localhost:4000/gal/addCreator', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                UserID: userID,
                GalleryID: gallId,
            }),
        });
        
        await addUser.json();
        
        res.status(200).json({msg:"Gallery was successfully created.", data});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }

});

//Helper call to add the creator of the gallery inside the GalleryMembers table
router.post("/gal/addCreator", async (req, res) => {
    
    console.log("body ", req.body);
    const { UserID, GalleryID } = req.body;
    const { data, error: databaseError } = await supabase
        .from('GalleryMembers')
        .insert([
            {
                GalleryID: GalleryID,
                UserID: UserID,
                GalleryRole: true
            }
        ]);

    if (databaseError) {
        return res.status(500).json({msg:"Gallery member could not be recorded.", databaseError});
    }

    res.status(200).json({msg:"Gallery member has been recorded as creator.", data});

});

//Helper method to verify is user can delete gallery
router.post("/gal/verifyCreator", async (req, res) => {

    const { UserID, GalleryID } = req.body;

    const { data, error: databaseError } = await supabase
    .from('Galleries')
    .select('*')
    .eq('GalleryID', GalleryID)
    .eq('Creator_id', UserID);

    if (databaseError) {
        return res.status(500).json({msg:"Could not verify gallery member role.", databaseError});
    }

    if(data && data.length !== 0 ){
        res.status(200).json({msg:"Gallery member is creator of the gallery. Procceeding with deletion", "GalleryRole": true });
    }else{
        return res.status(200).json({msg:"Gallery member is not creator of the gallery. Cannot delete gallery", "GalleryRole": false});
    }

});

//Helper method to get gallery ID from gallery name
router.get("/gal/getID/:galleryName", async (req, res) => {
    
    const { galleryName } = req.params;
    
    if (!galleryName) {
        return res.status(400).json({ error: "Gallery name was not received." });
    }
    const { data, error } = await supabase
    .from('Galleries')
    .select('GalleryID') 
    .eq('GalleryName', galleryName)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message ,  data: {"GalleryID":null}});
    }

    res.status(200).json({ msg: "Gallery ID was retrieved.", data });

});

router.get("/api/gal/all", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        
        // Get the user based on the token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            console.error('Authentication Error:', authError); // Log error for debugging
            return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
        }
      
      // Step 1: Get all gallery IDs from GalleryMembers for this user
      const { data: memberships, error: membershipError } = await supabase
      .from("GalleryMembers")
      .select('*')
      .eq("UserID", user.id);
      
      //console.log("user id ", user);
      //console.log(memberships);
      if (membershipError) throw membershipError;
      // Extract gallery IDs into an array
      const galleryIds = memberships.map(m => m.GalleryID);
      
      //console.log(galleryIds);
      if (galleryIds.length === 0) {
        return res.status(200).json([]);
      }
      // Step 2: Get full gallery details for these IDs
      const { data: galleries, error: galleryError } = await supabase
        .from('Galleries')
        .select('*')
        .in('GalleryID', galleryIds);
      
      //console.log(galleries);
      if (galleryError) throw galleryError;
      
      res.status(200).json(galleries);
    } catch (err) {
        console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
router.get("/api/gal/channels", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
      // Step 1: Get all gallery IDs from GalleryMembers for this user
      const { data: memberships, error: membershipError } = await supabase
      .from('GalleryMembers')
      .select('*');
      //console.log(memberships);
      if (membershipError) throw membershipError;
      // Extract gallery IDs into an array
      const galleryIds = memberships.map(m => m.GalleryID);
      
      //console.log(galleryIds);
      if (galleryIds.length === 0) {
        return res.status(200).json([]);
      }
      // Step 2: Get channels in each gallery details for these IDs
      const { data: channels } = await supabase
      .from('Channels')
      .select('*')
      .in('GalleryID', galleryIds);
    
      if (channels.length === 0) {
        return res.status(200).json([]);
      }
    // 3. Structure response, respecting the composite key
    const response = galleryIds.map(gid => ({
      id: gid,
      channels: channels
        .filter(c => c.GalleryID === gid)
        .map(c => ({
            GalleryID: c.GalleryID,
            ChannelName: c.ChannelName, // Assuming 'name' is the channel name
          // Include other channel properties as needed
        }))
    }));
      
    console.log("All Channels" + channels);
    res.json(response);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/api/gal/getChannels", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        const { galleryName } = req.query;
        console.log("DEBUG: " + galleryName);
        if (!galleryName) {
            return res.status(400).json({ error: "Gallery name was not received." });
        }
        const { data, error } = await supabase
        .from('Galleries')
        .select('GalleryID') 
        .eq('GalleryName', galleryName).single();
        if (error) {
            return res.status(400).json({ msg: error.message, data: {"GalleryID": null} });
        }
        
        if (!data) {
            console.log("DEBUG: " + data);
            return res.status(404).json({ msg: "Gallery not found", data: {"GalleryID": null} });
        }
        
        const galleryId = data.GalleryID;
        console.log("DEBUG: " + galleryId);
        // Step 2: Get channels in each gallery details for these IDs
        const { data: channels, error: channelsError } = await supabase
        .from('Channels')
        .select('ChannelName')
        .eq('GalleryID', galleryId);
    
        if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        return res.status(500).json({ error: channelsError.message });
        }
        
        if (!channels || channels.length === 0) {
            console.log('No channels found for galleryId:', galleryId);// Format the response
            const formattedResponse = {
                [galleryName]: []
            };
            return res.status(200).json(formattedResponse);
        }
        
        // Format the response
        const formattedResponse = {
            [galleryName]: channels.map((channel, index) => ({
                  ChannelName: channel.ChannelName,
                  Icon: channel.icon || null
              }))
        };
    
        console.log('DEBUG RES:', formattedResponse);
        res.status(200).json(formattedResponse);
        
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
});


//Creation of a gallery
router.post("/gal/createChannel", async (req, res) => {    
    
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try{
        // Get the user based on the token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            console.error('Authentication Error:', authError); // Log error for debugging
            return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
        }  
                  
        console.log("body ", req.body);  // Log error for debugging
        const { channelName, galleryID } = req.body;    
        console.log('User role:', user.role);
        const { data, error: databaseError } = await supabase
            .from("Channels")
            .insert(
                {
                    ChannelName: channelName,
                    Created_at: new Date().toISOString(),
                    GalleryID: galleryID
                }
            );
        
        if (databaseError) {
            return res.status(500).json({msg:"Gallery could not be created.", databaseError});
        }              
        res.status(200).json({msg:"Gallery was successfully created.", data});
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }

});
export default router;