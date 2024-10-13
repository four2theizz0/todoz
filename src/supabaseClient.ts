import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Please check your .env file.');
  throw new Error('Supabase configuration is incomplete.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);