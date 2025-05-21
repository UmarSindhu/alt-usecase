import { createClient } from '@supabase/supabase-js';

// Vercel automatically exposes these through process.env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`
    Missing Supabase credentials. Please ensure you have:
    1. Created a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    2. Added the variables in Vercel project settings
    3. Restarted your dev server after changes
  `);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Recommended for serverless
    autoRefreshToken: false
  },
  global: {
    headers: {
      'x-connection-name': 'api-server' // Helps identify in logs
    }
  }
});