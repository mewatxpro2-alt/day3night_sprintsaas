import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create an untyped client for flexibility - in production you would use generated types
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
