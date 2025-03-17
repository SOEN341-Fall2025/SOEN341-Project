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

router.put("/api/gallery/:galleryId/members/:userId/admin", async (req, res) => {
    const { galleryId, userId } = req.params; // Gallery ID and User ID to grant admin role
    const { adminUserId } = req.body; // ID of the admin user making the request

    console.log("Request received:", { galleryId, userId, adminUserId });

    // Check if the requester is a member of the specified gallery
    const { data: adminCheck, error: adminError } = await supabase
        .from("GalleryMembers")
        .select("GalleryRole")
        .eq("UserID", adminUserId)
        .eq("GalleryID", galleryId) // Ensure the admin is part of the specified gallery
        .single();

    console.log("Admin Check Result:", adminCheck);
    console.log("Admin Check Error:", adminError);
    console.log("userID:", adminUserId)       
    console.log("GalleryID:", galleryId)

    if (adminError || !adminCheck) {
        return res.status(403).json({ msg: "You are not a member of this gallery." });
    }
    if (!adminCheck.GalleryRole) {
        return res.status(403).json({ msg: "You are not authorized to perform this action in this gallery." });
    }

    // Update the GalleryRole to true (admin) for the specified user in the specified gallery
    const {data: updateData, error: updateError } = await supabase
        .from("GalleryMembers")
        .update({ GalleryRole: true }) // Set GalleryRole to true for admin
        .eq("UserID", userId)
        .eq("GalleryID", galleryId); // Ensure the update is scoped to the correct gallery
        console.log("Update Data:", updateData);
        console.log("userID:", userId)       
        console.log("GalleryID:", galleryId)
    if (updateError) {
        console.log("Update Error:", updateError);
        return res.status(500).json({ msg: "Failed to update user role." });
    }

    res.json({ msg: "User role updated to admin successfully in the specified gallery." });
});

export default router;