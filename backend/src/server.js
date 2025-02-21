import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

//Set up for modules/packages
dotenv.config({ path: '../.env' });
const app = express();
app.use(cors());
app.use(express.json());


// Setting up database API values
const supabaseUrl = 'https://syipugxeidvveqpbpnum.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Test route & Test Database
app.get("/", (req, res) => res.send("Bublii is now running."));

app.get("/api/test", async ( req, res ) => {

    const { data, error } = await supabase
    .from('Users')
    .select()
    .eq('id',1)
    .maybeSingle();

    if(error){
        console.error("Error fetching user: ", error);
        return res.status(500).json( { error: error.message })
    }

    res.json(data);

});


// Start server
const PORT = 4000;
app.listen(PORT, () => console.log( `Server running on port ${PORT}`) );