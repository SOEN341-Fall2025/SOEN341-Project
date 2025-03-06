import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize Express app
const app = express();

//Importing routes
import ProtectedRoute from "./routes/ProtectedRoute.js";
import User from "./user.js";
import Admin from "./admin.js";
app.use(ProtectedRoute);
app.use(User);
app.use(Admin);

//Retrieves information of the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
//Gives access to the JS and CSS
app.use(express.static(path.join(__dirname, '../../frontend')));

// Initialize Supabase client
const supabaseUrl = "https://syipugxeidvveqpbpnum.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aXB1Z3hlaWR2dmVxcGJwbnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTMzMTc4MSwiZXhwIjoyMDU0OTA3NzgxfQ._HzFV9tDQ-ncpLCxeS4Pjj3Q-1NyryKDJ1Mn3gU3H_I";

//Initializes the cover page (Login page)
app.get('/login', (req, res) => {
   
    res.sendFile(path.join(__dirname, '../../frontend/Login.html'));
});

// Test route
app.get("/", (req, res) => res.send("Bublii is now running."));

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export const supabase = createClient(supabaseUrl, supabaseKey);
