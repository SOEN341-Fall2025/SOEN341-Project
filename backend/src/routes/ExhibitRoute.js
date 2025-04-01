import express from "express";
const router = express.Router();
import { supabase } from "../server.js";

// Retrieve all exhibits
router.get("/api/exhibits", async (_req, res) => {
    const { data, error } = await supabase
        .from('Exhibits')
        .select('*')
        .order('post_id', { ascending: false }); // Ordering from newest to oldest

    if (error) {
        return res.status(500).json({ msg: "Exhibits could not be fetched.", error });
    }

    res.json({ msg: "Exhibits fetched successfully.", data });
});

// Retrieve all Exhibit Comments
router.get("/api/exhibit/comments", async (req, res) => {
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
