"use client";

import { createClient } from "@supabase/supabase-js";

// IMPORTANT: Replace with your actual Supabase project URL and anon key
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    console.error("Supabase URL is not configured. Please add it to src/supabase/config.ts");
}
if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.error("Supabase anon key is not configured. Please add it to src/supabase/config.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
