import express from "express";
import { supabase } from "./server.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


// DELETE message route
router.delete("/api/messages/:MsgId", async (req, res) => {
    
    const { MsgId } = req.params;
    const { userId } = req.body; 

    const { data: message, error: messageError } = await supabase
        .from("ChannelMessages")
        .select("Gallery_id") 
        .eq("Msg_id", MsgId)
        .single();
         console.log("MSG:", MsgId)       
         console.log("Message:", message)
    if (messageError || !message) {
        return res.status(404).json({ msg: "Message not found." });
    }

    const messageGalleryId = message.Gallery_id;

    const { data: adminCheck, error: adminError } = await supabase
        .from("GalleryMembers")
        .select("GalleryRole") 
        .eq("UserID", userId)
        .eq("GalleryID", messageGalleryId) 
        .single();

        if (adminError) {
            console.error("Supabase error:", adminError);
            return res.status(500).json({ msg: "Database error." });
        }
    
        if (!adminCheck || adminCheck.GalleryRole !== true) {
            return res.status(403).json({ msg: "You are not an admin or not part of this gallery." });
        }

    const { error: deleteError } = await supabase
        .from("ChannelMessages")
        .delete()
        .eq("Msg_id", MsgId);

    if (deleteError) {
        return res.status(500).json({ msg: "Failed to delete message." });
    }

    return res.status(200).json({ msg: "Message deleted successfully." });
});

router.put("/api/gallery/:galleryId/members/admin", async (req, res) => {
    const { galleryId } = req.params; // Extract galleryId from the URL
    const { username } = req.body; // Username of the user to promote
    const { adminUserId } = req.body; // ID of the admin making the request

    console.log("Request received:", { galleryId, username, adminUserId });

    const { data: adminCheck, error: adminError } = await supabase
        .from("GalleryMembers")
        .select("GalleryRole")
        .eq("UserID", adminUserId)
        .eq("GalleryID", galleryId)
        .single();

    if (adminError || !adminCheck || !adminCheck.GalleryRole) {
        return res.status(403).json({ msg: "You are not authorized to perform this action in this gallery." });
    }

    const { data: userData, error: userError } = await supabase
        .from("Users") 
        .select("UserID")
        .eq("username", username) 
        .single();

    if (userError || !userData) {
        return res.status(404).json({ msg: "User not found." });
    }

    const userId = userData.UserID; 

    const { data: updateData, error: updateError } = await supabase
        .from("GalleryMembers")
        .update({ GalleryRole: true })
        .eq("UserID", userId)
        .eq("GalleryID", galleryId);

    if (updateError) {
        console.log("Update Error:", updateError);
        return res.status(500).json({ msg: "Failed to update user role." });
    }

    // Check if any rows were updated
    if (!updateData || updateData.length === 0) {
        return res.status(404).json({ msg: "No matching user found in the specified gallery." });
    }

    res.json({ msg: "User role updated to admin successfully in the specified gallery." });
});
export default router;