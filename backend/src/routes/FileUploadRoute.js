import express from "express";
import multer from "multer";
import { supabase } from "../server.js";

const router = express.Router();

// Multer setup: Store files in memory before uploading
const upload = multer({ storage: multer.memoryStorage() });

// Upload user profile picture
router.post("/api/upload/profile-picture", upload.single("file"), async (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  if (!file || !userId) {
    return res.status(400).json({ error: "Missing file or userId" });
  }

  const fileExt = file.originalname.split(".").pop();
  const fileName = `${userId}.${fileExt}`; // Unique filename per user

  const { data, error } = await supabase.storage
    .from("profile_pictures")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // Replace old file
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL
  const { publicUrl } = supabase.storage.from("profile_pictures").getPublicUrl(fileName);

  return res.json({ url: publicUrl });
});

// Upload files to a channel or DM
router.post("/api/upload/chat-file", upload.single("file"), async (req, res) => {
  const { userId, channelId } = req.body;
  const file = req.file;

  if (!file || !userId || !channelId) {
    return res.status(400).json({ error: "Missing file, userId, or channelId" });
  }

  const fileName = `${channelId}/${Date.now()}_${file.originalname}`; // Unique file name

  const { data, error } = await supabase.storage
    .from("chat_files")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL
  const { publicUrl } = supabase.storage.from("chat_files").getPublicUrl(fileName);

  return res.json({ url: publicUrl });
});

// Upload art to gallery and update the gallery record with the URL
router.post("/api/upload/gallery-file", upload.single("file"), async (req, res) => {
    const { galleryId } = req.body; // Assuming galleryId is passed in the request
    const file = req.file;
  
    if (!file || !galleryId) {
      return res.status(400).json({ error: "Missing file or galleryId" });
    }
  
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${galleryId}/${Date.now()}_${file.originalname}`; // Unique file name
  
    const { data, error } = await supabase.storage
      .from("gallery_files")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });
  
    if (error) {
      return res.status(500).json({ error: error.message });
    }
  
    // Get public URL
    const { publicUrl } = supabase.storage.from("gallery_files").getPublicUrl(fileName);
  
    // Update the Galleries table with the gallery file URL
    const { error: updateError } = await supabase
      .from("Galleries")
      .update({ gallery_file_url: publicUrl })
      .eq("GalleryID", galleryId);  // Ensure it updates the right gallery
  
    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
  
    return res.json({ url: publicUrl });
  });  

export default router;