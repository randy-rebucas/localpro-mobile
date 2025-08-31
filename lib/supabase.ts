import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://ktbtwpyrvngosmymkiah.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YnR3cHlydm5nb3NteW1raWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjE4MTQsImV4cCI6MjA3MjE5NzgxNH0.bumugt3A2aomWWTsW6dWY0X8Iz0Ym2rp4TRnSoVMzaI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
