const express = require("express");

// Initialize Router element
const router = express.Router();

router.put("/api/update-username", async (req, res) => {
    const { id, newUsername } = req.body; // Get the user ID and new username from the request body

    // Validate input
    if (!id || !newUsername) {
        return res.status(400).json({ msg: "User ID and new username are required" });
    }

    // Update the username in the database
    const { data, error } = await supabase
        .from('Users')
        .update({ username: newUsername })
        .eq('id', id); // Update the user with the matching ID

    if (error) {
        return res.status(400).json({ msg: error.message });
    }

    // Return success response
    res.json({ msg: "Username updated successfully", data });
});

module.exports = router;

