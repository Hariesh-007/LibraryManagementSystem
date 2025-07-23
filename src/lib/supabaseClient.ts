
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lmntatefvgabphifgfac.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbnRhdGVmdmdhYnBoaWZnZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTIzMDcsImV4cCI6MjA2ODA2ODMwN30.1N8IIPv0qnsWRcrZV3h-WeE3FyDt34qkkqraRi_XKNA";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
