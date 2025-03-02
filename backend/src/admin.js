import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = "https://syipugxeidvveqpbpnum.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aXB1Z3hlaWR2dmVxcGJwbnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTMzMTc4MSwiZXhwIjoyMDU0OTA3NzgxfQ._HzFV9tDQ-ncpLCxeS4Pjj3Q-1NyryKDJ1Mn3gU3H_I";;
const supabase = createClient(supabaseUrl, supabaseKey);

// DELETE message route
router.delete("/api/messages/:channelId/:messageIndex", async (req, res) => {
    const { channelId, messageIndex } = req.params;
    const { userId } = req.body; // The ID of the user requesting the deletion

    // Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabase
        .from("GalleryMembers")
        .select("GalleryRole")
        .eq("UserID", userId)
        .single();

    if (adminError || !adminCheck || !adminCheck.GalleryRole) {
        return res.status(403).json({ msg: "You are not an admin." });
    }

    //Fetch all messages in the channel
    const { data: messages, error: fetchError } = await supabase
        .from("Messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true }); // Order messages by creation time

    if (fetchError || !messages) {
        return res.status(500).json({ msg: "Failed to fetch messages." });
    }

    // Check if the messageIndex is valid
    if (messageIndex < 0 || messageIndex >= messages.length) {
        return res.status(404).json({ msg: "Message not found." });
    }

    //  Get the message to delete
    const messageToDelete = messages[messageIndex];

    // Delete the message from the Messages table
    const { error: deleteError } = await supabase
        .from("Messages")
        .delete()
        .eq("id", messageToDelete.id); // Delete the message by its unique ID

    if (deleteError) {
        return res.status(500).json({ msg: "Failed to delete message." });
    }

    res.json({ msg: "Message deleted successfully." });
});

export default router;
