import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

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
  
export default router;