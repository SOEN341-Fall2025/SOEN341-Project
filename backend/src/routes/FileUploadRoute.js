import express from "express";
import multer from "multer";
import { supabase } from "../server.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Multer setup: Store files in memory before uploading
const upload = multer({ storage: multer.memoryStorage() });

// Allowed image mime types and their corresponding extensions
const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif"
};

// Upload profile picture
router.post("/api/upload/profile-picture", upload.single("file"), async (req, res) => {
  const { user_id } = req.body;
  const file = req.file;

  if (!file || !user_id) {
    return res.status(400).json({ error: "Missing file or user_id" });
  }

  // Validate file type
  if (!allowedMimeTypes[file.mimetype]) {
    return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, and GIF images are allowed." });
  }

  // Normalize the file extension to lowercase
  const fileExt = allowedMimeTypes[file.mimetype];
  const fileName = `${user_id}${fileExt}`; // Unique filename per user

  // Check if a profile picture already exists for this user with a different extension
  const { data: existingFiles, error: listError } = await supabase.storage
    .from("profile_pictures")
    .list("", { search: user_id });

  if (listError) {
    return res.status(500).json({ error: listError.message });
  }

  // If an existing file exists with a different extension, delete it
  if (existingFiles && existingFiles.length > 0) {
    const existingFile = existingFiles.find(file => file.name !== fileName);

    if (existingFile) {
      const { error: deleteError } = await supabase.storage
        .from("profile_pictures")
        .remove([existingFile.name]);

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }
    }
  }

  // Upload profile picture
  const { data, error: uploadError } = await supabase.storage
    .from("profile_pictures")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // Replace old file
    });

  if (uploadError) {
    return res.status(500).json({ error: uploadError.message });
  }

  // Manually generate the public URL
  const publicUrl = `https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/profile_pictures//${fileName}`;

  // Update the Users table with the profile picture URL
  const { error: updateError } = await supabase
    .from("Users")
    .update({ profile_picture_url: publicUrl })
    .eq("user_id", user_id);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  return res.json({ url: publicUrl });
});

// Get user's profile picture from uuid
router.get("/api/users/:id/profile-picture", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("Users")
        .select("profile_picture_url")
        .eq("user_id", id)
        .single();

    if (error || !data) {
        return res.status(404).json({ msg: "User not found" });
    }

    res.json({ profile_picture_url: data.profile_picture_url });
});

// Attach file to DM using DmID
router.post("/dm/upload-file", upload.single("file"), async (req, res) => {
    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

    if (error || !user) {
        return res.status(401).json({ msg: "Unauthorized", error });
    }

    const { DmID } = req.body; // The message ID to attach the file to
    const file = req.file;

    if (!DmID) {
        return res.status(400).json({ msg: "Missing DmID" });
    }
    if (!file) {
        return res.status(400).json({ msg: "No file uploaded" });
    }

    // Verify DmID exists in the database
    const { data: dmData, error: dmError } = await supabase
        .from("DMs")
        .select("DmID")
        .eq("DmID", DmID)
        .single();

    if (dmError || !dmData) {
        return res.status(404).json({ msg: "DM not found" });
    }

    // Upload file to Supabase Storage
    const filePath = `dm_files/${uuidv4()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat_files")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
        });

    if (uploadError) {
        return res.status(500).json({ msg: "File upload failed", error: uploadError });
    }

    const fileUrl = `https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/chat_files/${filePath}`;

    // Update the existing DM record with the file URL
    const { data, error: dbError } = await supabase
        .from("DMs")
        .update({ file_url: fileUrl })
        .eq("DmID", DmID);

    if (dbError) {
        return res.status(500).json({ msg: "Failed to attach file to message", error: dbError });
    }

    res.status(200).json({ msg: "File attached successfully", fileUrl });
});

// Upload art to gallery and update the gallery record with the URL
router.post("/api/upload/gallery-file", upload.single("file"), async (req, res) => {
  
});  

export default router;