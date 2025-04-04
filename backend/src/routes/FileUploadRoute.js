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

// Retrieve file URL for a specific DM
router.get("/dm/file/:DmID", async (req, res) => {
    const { DmID } = req.params;

    // Validate DmID
    if (!DmID) {
        return res.status(400).json({ msg: "Missing DmID" });
    }

    // Fetch DM record by DmID
    const { data, error } = await supabase
        .from("DMs")
        .select("file_url")
        .eq("DmID", DmID)
        .single();

    if (error || !data) {
        return res.status(404).json({ msg: "DM not found or no file attached", error });
    }

    // Return the file URL (or any other relevant info)
    res.status(200).json({ fileUrl: data.file_url });
});

// Attach file to Channel Message using Msg_id
router.post("/channel/upload-file", upload.single("file"), async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

  if (error || !user) {
      return res.status(401).json({ msg: "Unauthorized", error });
  }

  const { Msg_id } = req.body; // Message ID to attach the file to
  const file = req.file;

  if (!Msg_id) {
      return res.status(400).json({ msg: "Missing Msg_id" });
  }
  if (!file) {
      return res.status(400).json({ msg: "No file uploaded" });
  }

  // Verify Msg_id exists in the database
  const { data: messageData, error: messageError } = await supabase
      .from("ChannelMessages")
      .select("Msg_id")
      .eq("Msg_id", Msg_id)
      .single();

  if (messageError || !messageData) {
      return res.status(404).json({ msg: "Channel message not found" });
  }

  // Upload file to Supabase Storage
  const filePath = `channel_files/${uuidv4()}-${file.originalname}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat_files")
      .upload(filePath, file.buffer, {
          contentType: file.mimetype,
      });

  if (uploadError) {
      return res.status(500).json({ msg: "File upload failed", error: uploadError });
  }

  const fileUrl = `https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/chat_files/${filePath}`;

  // Update the existing ChannelMessage record with the file URL
  const { data: updateData, error: dbError } = await supabase
      .from("ChannelMessages")
      .update({ file_url: fileUrl })
      .eq("Msg_id", Msg_id);

  if (dbError) {
      return res.status(500).json({ msg: "Failed to attach file to channel message", error: dbError });
  }

  res.status(200).json({ msg: "File attached to channel message successfully", fileUrl });
});

// Retrieve file URL for a specific Msg_id
router.get("/channel/file/:Msg_id", async (req, res) => {
  const { Msg_id } = req.params;

  // Validate Msg_id
  if (!Msg_id) {
      return res.status(400).json({ msg: "Missing Msg_id" });
  }

  // Fetch DM record by Msg_id
  const { data, error } = await supabase
      .from("ChannelMessages")
      .select("file_url")
      .eq("Msg_id", Msg_id)
      .single();

  if (error || !data) {
      return res.status(404).json({ msg: "DM not found or no file attached", error });
  }

  // Return the file URL (or any other relevant info)
  res.status(200).json({ fileUrl: data.file_url });
});

// Attach file to an Exhibit using post_id
router.post("/exhibits/upload-file", upload.single("file"), async (req, res) => {
  const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);

  if (error || !user) {
    return res.status(401).json({ msg: "Unauthorized", error });
  }

  const { post_id } = req.body; // The post to attach the file to
  const file = req.file;

  if (!post_id) {
    return res.status(400).json({ msg: "Missing post_id" });
  }
  if (!file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  // Check if file type is allowed
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ msg: "Invalid file type" });
  }

  // Verify post_id exists in the database
  const { data: exhibitData, error: exhibitError } = await supabase
    .from("Exhibits")
    .select("post_id")
    .eq("post_id", post_id)
    .single();

  if (exhibitError || !exhibitData) {
    return res.status(404).json({ msg: "Exhibit not found" });
  }

  // Generate unique file path and upload file to Supabase Storage
  const filePath = `exhibit_files/${uuidv4()}-${file.originalname}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("exhibit_files")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) {
    return res.status(500).json({ msg: "File upload failed", error: uploadError });
  }

  // Construct public file URL
  const fileUrl = `https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/exhibit_files/${filePath}`;

  // Update the existing Exhibit record with the file URL
  const { data: updateData, error: dbError } = await supabase
    .from("Exhibits")
    .update({ file_url: fileUrl })
    .eq("post_id", post_id);

  if (dbError) {
    return res.status(500).json({ msg: "Failed to attach file to exhibit", error: dbError });
  }

  res.status(200).json({ msg: "File attached to exhibit successfully", fileUrl });
});

// Retrieve file URL for a specific post_id
router.get("/exhibits/file/:post_id", async (req, res) => {
  const { post_id } = req.params;

  if (!post_id) {
    return res.status(400).json({ msg: "Missing post_id" });
  }

  const { data, error } = await supabase
    .from("Exhibits")
    .select("file_url")
    .eq("post_id", post_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ msg: "Exhibit not found or no file attached", error });
  }

  res.status(200).json({ fileUrl: data.file_url });
});

export default router;