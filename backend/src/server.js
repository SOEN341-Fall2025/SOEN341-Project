import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

//Set up for modules/packages
// const express = require("express");
// const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


// Setting up database API values
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syipugxeidvveqpbpnum.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Test route
app.get("/", (req, res) => res.send("Bubbli is now running."));

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log( `Server running on port ${PORT}`) );
