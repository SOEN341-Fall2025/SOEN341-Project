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
    const galleryID = await fetch(`http://localhost:4000/gal/getID/${galleryName}`);
    const galleryIDres = await galleryID.json();
    const gallId = galleryIDres.data.GalleryID;
    if(gallId == null){
        return res.status(200).json({msg:"Gallery does not exist."});
    }

    //Helper call
    const verifyUser = await fetch('http://localhost:4000/gal/verifyCreator', {
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
    const addUser = await fetch('http://localhost:4000/gal/addCreator', {
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
router.post("/gal/addCreator", async (req, res) => {

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

export default router;