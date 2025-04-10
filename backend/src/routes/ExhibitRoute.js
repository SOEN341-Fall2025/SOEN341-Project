import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

// Helper function for authentication
const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "Unauthorized: No token provided." });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ msg: "Unauthorized: Invalid token.", error });
    }

    req.user = user; // Attach user data to the request for further use
    next();
};

// Retrieve all exhibits (requires authentication)
router.get("/api/exhibits", authenticateUser, async (_req, res) => {
    const { data, error } = await supabase
        .from('Exhibits')
        .select('*')
        .order('post_id', { ascending: false }); // Ordering from newest to oldest

    if (error) {
        return res.status(500).json({ msg: "Exhibits could not be fetched.", error });
    }

    res.json({ msg: "Exhibits fetched successfully.", data });
});

// Retrieve all Exhibit Comments (requires authentication)
router.get("/api/exhibit/comments", authenticateUser, async (req, res) => {
    const { post_id } = req.query;

    if (!post_id) {
        return res.status(400).json({ msg: "post_id is required." });
    }

    const { data, error } = await supabase
        .from('ExhibitComments')
        .select('*')
        .eq('post_id', post_id)
        .order('created_at', { ascending: true }); // Oldest comments first

    if (error) {
        return res.status(500).json({ msg: "Comments could not be fetched.", error });
    }

    res.json({ msg: "Comments fetched successfully.", data });
});

// Add a comment on an ehibit
router.post('/api/exhibit/comments', authenticateUser, async (req, res) => {
    const { post_id, msg } = req.body

    if (!post_id || !msg) {
        return res.status(400).json({ error: 'post_id and msg required' })
    }

    const { data, error } = await supabase
      .from('ExhibitComments')
      .insert([{ post_id, commenter_id: req.user.id, msg, created_at: new Date().toISOString() }])

    if (error) {
        return res.status(500).json({ error: 'Could not save comment' })
    }

    res.status(201).json({ message: 'Comment added', comment: data[0] })
})

// POST /api/exhibits/like
router.post('/api/exhibits/like', authenticateUser, async (req,res)=>{
    const { post_id } = req.body;
    if(!post_id) {
        return res.status(400).json({error:'post_id required'});
    }
    const { data, error } = await supabase
      .from('ExhibitLikes')
      .upsert([{ post_id, user_id:req.user.id }], { onConflict:['post_id','user_id'] });

    if(error) {
        return res.status(500).json({error:'Could not like exhibit'});
    }

    res.json({ message:'Exhibit liked', like:data[0] });
});

export default router;