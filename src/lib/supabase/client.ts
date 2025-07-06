import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Optional: Debug logs to help during development
console.log("🔧 SUPABASE_URL:", supabaseUrl);
console.log("🔧 SUPABASE_ANON_KEY:", supabaseAnonKey?.slice(0, 10) + "...");

// Validate env variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase credentials. Make sure your .env file is correctly loaded.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
