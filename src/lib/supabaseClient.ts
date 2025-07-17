
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://lmntatefvgabphifgfac.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbnRhdGVmdmdhYnBoaWZnZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTIzMDcsImV4cCI6MjA2ODA2ODMwN30.1N8IIPv0qnsWRcrZV3h-WeE3FyDt34qkkqraRi_XKNA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
