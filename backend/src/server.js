import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from "@supabase/supabase-js";
//Importing routes
import ProtectedRoute from "./routes/ProtectedRoute.js";
import MessagingRoute from "./routes/MessagingRoute.js";
import User from "./user.js";
import Admin from "./admin.js";
import fs from 'fs';
dotenv.config();
const app = express();

//Retrieves information of the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("Current directory:", __dirname);
// Initialize Express app
app.use(cors());
app.use(express.json());

//app.use(express.static(path.join(__dirname, '../../frontend')));

app.use(ProtectedRoute);
app.use(MessagingRoute);
app.use(User);
app.use(Admin);

//Initializes the static pages
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/Login.html'));
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});
const logStream = fs.createWriteStream('react-dev-server.log', { flags: 'a' });
app.use((req, res, next) => {
  const logMessage = `Route not found: ${req.method} ${req.url}`;
  console.log(logMessage);
  logStream.write(logMessage);
  next();
});
// Test route
app.get("/", (req, res) => res.send("Bublii is now running."));
app.get("/test", (req, res) => res.json({ message: 'GET request successful' }));
app.use((req, res) => {
  res.status(404).send('Not Found');
});
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

//console.log("ProtectedRoute contents:", Object.keys(ProtectedRoute));
// Log all registered routes
//console.log("Routes:", app._router.stack.map(r => r.route?.path || r.name).filter(Boolean));
// Start server
const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));