import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

//Creation of a gallery
router.post("/gal/create", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    console.log(user);

    console.log( req.body);

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
        .select("GalleryID");

    console.log(data);    

    if (databaseError) {
        return res.status(500).json({msg:"Gallery could not be created.", databaseError});
    }

    const addUser = await fetch(`http://localhost:4000/gal/addCreator/${data.GalleryID}`);

    res.status(200).json({msg:"Gallery was successfully created.", data});

});

router.post("/gal/addCreator/:galleryID", async (req, res) => {

    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json(error);
    }

    const { galleryID } = req.body;

    const { data, error: databaseError } = await supabase
        .from('GalleryMembers')
        .insert([
            {
                GalleryID: galleryID,
                UserID: user.id,
                Created_at: new Date().toISOString(),
                GalleryRole: true
            }
            ]);

    if (databaseError) {
        return res.status(500).json({msg:"Gallery member could not be recorded.", databaseError});
    }

    res.status(200).json({msg:"Gallery member has been recorded as creator.", data});

});

export default router;