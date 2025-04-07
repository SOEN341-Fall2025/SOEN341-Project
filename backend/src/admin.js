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

//Delete Channels
router.delete("/api/channels/:channelname", async (req, res) => {
  const { channelname } = req.params;
  const { userId } = req.query; 

  console.log("Attempting to delete channel:", channelname);
  console.log("Requested by user ID:", userId);

  if (!userId) {
    return res.status(400).json({ msg: "Missing user ID in query string." });
  }

  const { data: channelData, error: channelError } = await supabase
    .from("Channels")
    .select("GalleryID")
    .eq("ChannelName", channelname)
    .single();

  if (channelError || !channelData) {
    console.error("Channel lookup failed:", channelError);
    return res.status(404).json({ msg: "Channel not found." });
  }

  const galleryId = channelData.GalleryID;

  const { data: adminCheck, error: adminError } = await supabase
    .from("GalleryMembers")
    .select("GalleryRole")
    .eq("UserID", userId)
    .eq("GalleryID", galleryId)
    .single();

  if (adminError) {
    console.error("Error checking admin role:", adminError);
    return res.status(500).json({ msg: "Database error." });
  }

  if (!adminCheck || adminCheck.GalleryRole !== true) {
    return res.status(403).json({ msg: "You are not authorized to delete this channel." });
  }

  const { error: deleteError } = await supabase
    .from("Channels")
    .delete()
    .eq("ChannelName", channelname);

  if (deleteError) {
    console.error("Error deleting channel:", deleteError);
    return res.status(500).json({ msg: "Failed to delete channel." });
  }

  console.log("Channel deleted successfully:", channelname);
  return res.status(200).json({ msg: "Channel deleted successfully." });
});


router.put("/api/gallery/:galleryId/members/admin", async (req, res) => {
    const { galleryId } = req.params;
    const { username, adminUserId } = req.body; // Destructure both values
  
    console.log("Verifying admin privileges for:", { adminUserId, galleryId,username });
  
    const { data: adminCheck, error: adminError } = await supabase
      .from("GalleryMembers")
      .select("GalleryRole")
      .eq("UserID", adminUserId) // Ensure this matches your column name
      .eq("GalleryID", galleryId)
      .single();
  
    if (adminError || !adminCheck?.GalleryRole) {
      console.error("Admin check failed:", adminError || "No admin privileges");
      return res.status(403).json({ msg: "Not authorized" });
    }
  
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("user_id")
      .eq("username", username)
      .single();
  
    if (userError || !userData?.user_id) {
      return res.status(404).json({ msg: "User not found" });
    }
  
    const { data: updateData, error: updateError } = await supabase
      .from("GalleryMembers")
      .update({ GalleryRole: true })
      .eq("UserID", userData.user_id) // Use the found UserID
      .eq("GalleryID", galleryId);
      
     console.log("UserID:", userData.user_id);
     console.log("GalleryID:", galleryId);
     console.log("Updated rows:", updateData);
    if (updateError) {
      console.error("Update failed:", updateError);
      return res.status(500).json({ msg: "Promotion failed" });
    }
  
    return res.json({ msg: "User promoted successfully" });
  });

// Owner can remove admin role
  router.put("/api/gallery/:galleryId/members/owner", async (req, res) => {
    const { galleryId } = req.params;
    const { username, OwnerUserId } = req.body; // Destructure both values
  
    console.log("Verifying admin privileges for:", { OwnerUserId, galleryId,username });
  
    const { data: OwnerCheck, error: OwnerError } = await supabase
      .from("Galleries")
      .select("Creator_id")
      .eq("GalleryID", galleryId)
      .single();
  
    if (OwnerError || !OwnerCheck?.Creator_id) {
      console.error("Owner check failed:", OwnerError || "No Owner privileges");
      return res.status(403).json({ msg: "Not authorized" });
    }
  
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("user_id")
      .eq("username", username)
      .single();
  
    if (userError || !userData?.user_id) {
      return res.status(404).json({ msg: "User not found" });
    }
  
    const { data: updateData, error: updateError } = await supabase
      .from("GalleryMembers")
      .update({ GalleryRole: false })
      .eq("UserID", userData.user_id) // Use the found UserID
      .eq("GalleryID", galleryId);
      
     console.log("UserID:", userData.user_id);
     console.log("GalleryID:", galleryId);
     console.log("Updated rows:", updateData);
    if (updateError) {
      console.error("Update failed:", updateError);
      return res.status(500).json({ msg: "Demotion failed" });
    }
  
    return res.json({ msg: "User demoted successfully" });
  });

  //Checks if user is admin
  router.put("/api/gallery/:galleryId/members/checkadmin", async (req, res) => {
    const { galleryId } = req.params;
    const { adminUserId } = req.body; // Destructure both values
  
    console.log("Verifying admin privileges for:", { adminUserId, galleryId });
  
    const { data: adminCheck, error: adminError } = await supabase
      .from("GalleryMembers")
      .select("GalleryRole")
      .eq("UserID", adminUserId) // Ensure this matches your column name
      .eq("GalleryID", galleryId)
      .single();
  
    if (adminError || !adminCheck?.GalleryRole) {
      console.error("Admin check failed:", adminError || "No admin privileges");
      return res.status(403).json({ msg: "Not authorized" });
    }
  
  
  });

export default router;