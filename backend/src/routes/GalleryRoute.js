import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

//Deletion of a gallery
router.delete("/api/gal/delete", async (req, res) => {

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

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }
    
    const { galleryName } = req.body;

    const { data, error: databaseError } = await supabase
        .from('Galleries')
        .insert([
            {
                GalleryName: galleryName,
                Created_at: new Date().toISOString(),
                Creator_id: user.id
            }
            ])
        .select("GalleryID")
        .single();

    if (databaseError) {
        return res.status(500).json({msg:"Gallery could not be created.", databaseError});
    }

    const gallId = data.GalleryID;

    //Helper call
    const addUser = await fetch('http://localhost:4000/api/gal/addCreator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: user.id,
          GalleryID: gallId,
        }),
      });

    const addUserResult = await addUser.json();
    
    res.status(200).json({msg:"Gallery was successfully created.", data});

});

router.get("/gal/retrieve", async (req, res) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    console.log('Authorization token is missing.');
    return res.status(400).json({ msg: "Authorization token is missing." });
  }

  // Get the user based on the token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('Authentication Error:', authError); // Log error for debugging
    return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
  }

  // Fetch gallery members for the authenticated user
  const { data: galleryMembers, error: galleryMembersError } = await supabase
    .from("GalleryMembers")
    .select("GalleryID")
    .eq("UserID", user.id);

  if (galleryMembersError) {
    console.error('Gallery Members Error:', galleryMembersError); // Log error for debugging
    return res.status(500).json({ msg: "Error retrieving galleries.", error: galleryMembersError });
  }

  // Extract the gallery names
  const galleryIDs = galleryMembers.map(member => member.GalleryID);

  if (galleryIDs.length === 0) {
    return res.status(404).json({ msg: "No galleries found for this user." });
  }

  // Fetch the actual galleries from the Galleries table
  const { data, error: databaseError } = await supabase
    .from("Galleries")
    .select("GalleryName")
    .in("GalleryID", galleryIDs);

  if (databaseError) {
    console.error('Database Error:', databaseError); // Log error for debugging
    return res.status(500).json({ msg: "Error retrieving galleries.", error: databaseError });
  }

  // Successfully retrieve the galleries and send response
  res.status(200).json({ galleries: data });
});


//Helper call to add the creator of the gallery inside the GalleryMembers table
router.post("/api/gal/addCreator", async (req, res) => {

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
router.post("/api/gal/verifyCreator", async (req, res) => {

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
router.get("/api/gal/getID/:galleryName", async (req, res) => {
    
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

// Channel API calls ==================================================================================================

//Creation of a channel in a gallery
router.post("/gal/createChannel", async (req, res) => {    

  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try{
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
          console.error('Authentication Error:', authError); // Log error for debugging
          return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
      }  

      console.log("body ", req.body);  // Log error for debugging
      const { channelName, galleryId } = req.body;    
      console.log('User role:', user.role);
      const { data, error: databaseError } = await supabase
          .from("Channels")
          .insert(
              {
                  ChannelName: channelName,
                  Created_at: new Date().toISOString(),
                  GalleryID: galleryId
              }
          );

      if (databaseError) {
          return res.status(500).json({msg:"Channel could not be created.", databaseError, data});
      }              
      res.status(200).json({msg:"Channel was successfully created.", data});
  }
  catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
  }

});

//Renaming of a channel in a gallery if user is gallery admin
router.put("/gal/renameChannel", async (req, res) => {    
  
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  
  const { clickedName, galleryId, newTitle } = req.body;      
  
  try{
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
          console.error('Authentication Error:', authError); // Log error for debugging
          return res.status(401).json({ msg: "Invalid or expired token.", error: authError });
      }  
      
      // Verify Admin Status of current user
      const galAdmin = await supabase
        .from("GalleryMembers")
        .select("GalleryRole")
        .eq('UserID', user.id)
        .eq('GalleryID', galleryId);
      
      //console.log('User role:', user.role);
      console.log(req.body);  // Log error for debugging
      console.log(clickedName, galleryId, newTitle);  // Log error for debugging
      console.log("Admin Role: ", galAdmin.data[0].GalleryRole);  // Log error for debugging
      
      if (galAdmin.data[0].GalleryRole == false) {
        console.log("Unauthorized: Not admin of this gallery.");
        return res.status(401).json({ error: "Unauthorized: Not admin of this gallery." });
      }             
      
      const { data: row, error: Error } = await supabase
        .from("Channels")
        .select("*")
        .eq("ChannelName", clickedName)
        .eq("GalleryID", galleryId);
      
      
      console.log("DEBUG SELECT", row);
        
      const { data: updatingRow, error: databaseError } = await supabase
        .from("Channels")
        .update({ChannelName: newTitle})
        .eq("ChannelName", clickedName)
        .eq("GalleryID", galleryId);
      
      if (databaseError) {
          console.log("Database Error", databaseError);
          return res.status(500).json({msg:"Channel could not be renamed.", databaseError});
      }        
      console.log(updatingRow);
      return res.status(200).json({ msg: "Channel renamed successfully" });  
  }
  catch (err) {
      console.log("Internal Server Error", err);
      return res.status(500).json({ error: "Internal Server Error" });
  }

});


//Retrieving channel messages
router.get("/gal/msgChannel/:channelName", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { channelName } = req.params;

    const galIDresponse = await fetch(`http://localhost:4000/api/get/galleryID-channelName/${channelName}`);
    const galleryIDdata = await galIDresponse.json();
    const galleryID = galleryIDdata.data.GalleryID;

    const { data, error: databaseError } = await supabase
        .from('ChannelMessages')
        .select('*')
        .eq("Gallery_id", galleryID)
        .eq("Channel_name", channelName);

    if (databaseError) {
        return res.status(500).json({msg:"Messages could not be fetched.", databaseError});
    }

    const updatedData = [];

    for (let values of data) {
        // Fetch the sender's username
        const usernameResponse = await fetch(`http://localhost:4000/api/get/username-id/${values.User_id}`);
        const usernameData = await usernameResponse.json();
        const username = usernameData.data.username;

        // Fetch the Bubbler's username
        const msg = values.msg;

        // Add the converted usernames to the DM object
        updatedData.push({
            ...values,
            Username: username,
            Message: msg
        });
    }

    res.json({ msg: "Channel messages were fetched.", updatedData });

});

//Helper call: Retrieve gallery ID using channel's name
router.get("/api/get/galleryID-channelName/:channelName", async (req, res) => {

    const { channelName } = req.params;

    if (!channelName) {
        return res.status(400).json({ error: "Channel name was not received." });
    }
    
    const { data, error } = await supabase
    .from('Channels')
    .select('GalleryID') 
    .eq('ChannelName', channelName)
    .single();

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    res.status(200).json({ msg: "Gallery ID was retrieved.", data });

});

//Send a message in a channel
router.post("/gal/channel/sendMsg", async(req, res) => {

  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

  if (!user) {
    return res.status(401).json({ error: "Authenticated user was not provided." });
  }

  const { message, channelName } = req.body;

  const galIDresponse = await fetch(`http://localhost:4000/api/get/galleryID-channelName/${channelName}`);
  const galleryIDdata = await galIDresponse.json();
  const galleryID = await galleryIDdata.data.GalleryID;
    const { data, error: databaseError } = await supabase
        .from('ChannelMessages')
        .insert([
            {
                User_id: user.id,
                Msg: message,
                Gallery_id: galleryID,
                Channel_name: channelName
            }
            ]);

    if (databaseError) {
        return res.status(500).json({msg:"Message could not be saved.", databaseError});
    }

    res.status(200).json({msg:"Message was saved successfully", data});

});


//Retrieve all possible galleries
router.get("/api/gallery/all", async (req, res) => {
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
      // Step 2: Get full gallery details for these IDs
      const { data: galleries, error: galleryError } = await supabase
        .from('Galleries')
        .select('*')
        .in('GalleryID', galleryIds);
      
      //console.log(galleries);
      if (galleryError) throw galleryError;
      
      res.status(200).json(galleries);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

//Retrieve all channels from every galleries
router.get("/api/gallery/channels", async (req, res) => {
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
 
//Get channels from a specific gallery using its name
router.get("/api/gallery/getChannels", async (req, res) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        const { galleryName } = req.query;
        if (!galleryName) {
            return res.status(400).json({ error: "Gallery name was not received." });
        }

        const { data, error } = await supabase
        .from('Galleries')
        .select('GalleryID') 
        .eq('GalleryName', galleryName)
        .single();

        if (error) {
          console.log(error);
            return res.status(400).json({ msg: error.message, data: {"GalleryID": null} });
        }
        
        if (!data) {
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

router.post("/api/gal/saveChannelMessages", async (req, res) => {
  // Extract user information from the JWT token
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

  if (error || !user) {
      return res.status(401).json(error);
  }

  const { channelName, galleryName, message } = req.body;

  // Fetch the gallery ID based on gallery name
  const galleryIDResponse = await fetch(`/api/gal/getID/${galleryName}`);

  if (!galleryIDResponse.ok) {
      return res.status(404).json({ error: "Gallery not found" });
  }

  const galleryIDData = await galleryIDResponse.json();
  const galleryID = galleryIDData.data.GalleryID;  // Assuming the gallery ID is under data.GalleryID

  // Insert the message into the database
  const { data, error: databaseError } = await supabase
      .from('ChannelMessages')
      .insert([
          {
              User_id: user.id,
              Msg: message,
              Gallery_id: galleryID,
              Channel_name: channelName
          }
      ]);

  if (databaseError) {
      console.log("Error saving message:", databaseError);
      return res.status(500).json({ msg: "Message could not be saved.", databaseError });
  }

  // Send a success response
  res.status(200).json({ msg: "Message was saved successfully", data });
});

export default router;