import express from "express";
import { supabase } from "./server.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


// DELETE message route
router.delete("/api/messages/:channelId", async (req, res) => {
    const { channelId } = req.params;
    const { userId, createdAt } = req.body; // The ID of the user and the timestamp of the message

    //  Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabase
        .from("GalleryMembers")
        .select("GalleryRole")
        .eq("UserID", userId)
        .single();

    if (adminError || !adminCheck || !adminCheck.GalleryRole) {
        return res.status(403).json({ msg: "You are not an admin." });
    }

    // Fetch the channel from the Channels table
    const { data: channel, error: channelError } = await supabase
        .from("Channels")
        .select("Messages")
        .eq("ChannelID", channelId)
        .single();

    if (channelError || !channel) {
        return res.status(404).json({ msg: "Channel not found." });
    }

    //  Handle the Messages field as an array (since it's text[])
    let messages = channel.Messages;

    // Find the index of the message to delete
    const messageIndex = messages.findIndex(
        (msg) => msg.trim() === createdAt // Use createdAt to identify the message
    );

    if (messageIndex === -1) {
        return res.status(404).json({ msg: "Message not found." });
    }

    //  Remove the message at the specified index
    messages.splice(messageIndex, 1);

    // Update the Messages field in the database
    const { error: updateError } = await supabase
        .from("Channels")
        .update({ Messages: messages }) // Update the array directly
        .eq("ChannelID", channelId);

    if (updateError) {
        return res.status(500).json({ msg: "Failed to delete message." });
    }

    res.json({ msg: "Message deleted successfully." });
});

export default router;