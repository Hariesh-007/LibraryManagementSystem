
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://jzjnabpiuedeiarrbcru.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6am5hYnBpdWVkZWlhcnJiY3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTIzNjcsImV4cCI6MjA2ODA2ODM2N30.bw1-lpji_zeXI_aJK-ZUeUwAsYBBlKHZ3YqKjrkhAXA',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Helper function to safely get user with network error handling
export const safeGetUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  } catch (networkError) {
    // Handle network errors gracefully
    console.warn('[Supabase] Network error getting user, checking local session');
    
    // Try to get session from local storage instead
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        return { data: { user: sessionData.session.user }, error: null };
      }
    } catch (sessionError) {
      console.warn('[Supabase] Could not get local session');
    }
    
    return { data: { user: null }, error: null };
  }
};

// Helper function to safely make database queries with network error handling
export const safeQuery = async (queryBuilder: any, queryName = 'database query') => {
  try {
    const result = await queryBuilder;
    return result;
  } catch (networkError) {
    console.warn(`[Supabase] Network error during ${queryName}:`, networkError);
    return { data: null, error: { message: 'Network connection error', code: 'NETWORK_ERROR' } };
  }
};
