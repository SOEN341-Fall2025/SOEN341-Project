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
    try {
      // Fetch exhibits data
      const { data: exhibits, error: exhibitsError } = await supabase
        .from('Exhibits')
        .select('post_id, poster_id, file_url, timestamp, msg')
        .order('post_id', { ascending: false });
    
      if (exhibitsError) {
        console.error("Error fetching exhibits:", exhibitsError.message);
        return res.status(500).json({ msg: "Exhibits could not be fetched.", error: exhibitsError.message });
      }

      
    
      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('Users')
        .select('user_id, username');

    
    
      if (usersError) {
        console.error("Error fetching users:", usersError.message);
        return res.status(500).json({ msg: "Users could not be fetched.", error: usersError.message });
      }
    
      // Create a Map for fast lookup of user_id -> username
      const userMap = new Map(users.map(user => [user.user_id, user.username]));
    
      // Merge exhibits data with corresponding usernames from the userMap
      const exhibitsWithUsernames = exhibits.map((exhibit) => ({
        ...exhibit,
        username: userMap.get(exhibit.poster_id) || 'Unknown User' // Fallback to 'Unknown User' if no match
      }));
    
      // Send the response with the merged data
      res.json({ msg: "Exhibits fetched successfully.", data: exhibitsWithUsernames });
    } catch (error) {
      console.error("Error in /api/exhibits route:", error.message);
      res.status(500).json({ msg: "Exhibits could not be fetched.", error: error.message });
    }
  });

// Retrieve all Exhibit Comments (requires authentication)
router.get("/api/exhibit/comments", authenticateUser, async (req, res) => {
  
    try {
      // Fetch comments data for the given post_id
      const { data: comments, error: commentsError } = await supabase
        .from('ExhibitComments')
        .select('comment_id, post_id, commenter_id, msg, created_at')
        .order('created_at', { ascending: true });
  
      if (commentsError) {
        console.error("Error fetching comments:", commentsError.message);
        return res.status(500).json({ msg: "Comments could not be fetched.", error: commentsError.message });
      }
  
      // Fetch user data (usernames) for all commenters
      const { data: users, error: usersError } = await supabase
        .from('Users')
        .select('user_id, username');
  
      if (usersError) {
        console.error("Error fetching users:", usersError.message);
        return res.status(500).json({ msg: "Users could not be fetched.", error: usersError.message });
      }
  
      // Create a Map for fast lookup of user_id -> username
      const userMap = new Map(users.map(user => [user.user_id, user.username]));
  
      // Merge comments data with corresponding usernames from the userMap
      const commentsWithUsernames = comments.map((comment) => ({
        ...comment,
        username: userMap.get(comment.commenter_id) || 'Unknown User', // Fallback to 'Unknown User' if no match
      }));
  
      // Send the response with the merged data
      res.json({ msg: "Comments fetched successfully.", data: commentsWithUsernames });
  
    } catch (error) {
      console.error("Error in /api/exhibit/comments route:", error.message);
      res.status(500).json({ msg: "Comments could not be fetched.", error: error.message });
    }
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

  res.status(201).json({ message: 'Comment added', comment: data })
});

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

  res.json({ message:'Exhibit liked', like:data });
});

export default router;