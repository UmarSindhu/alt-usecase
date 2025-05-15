
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = "https://tweyhcyeuvwzfqyqtczs.supabase.co"
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZXloY3lldXZ3emZxeXF0Y3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTQxMDUsImV4cCI6MjA2MjY3MDEwNX0.VNNkIvupqBzTjuG5OOCMMmTjf7gYLRTylTBdm9VYdq0"

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  