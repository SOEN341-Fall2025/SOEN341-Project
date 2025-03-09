
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://syipugxeidvveqpbpnum.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aXB1Z3hlaWR2dmVxcGJwbnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMzE3ODEsImV4cCI6MjA1NDkwNzc4MX0.Q0CrVBEHvVUjsJXisMEkawV7I21rhAFVG0oQAejZLZk";
export const supabase = createClient(supabaseUrl, supabaseKey);