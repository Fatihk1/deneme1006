import { createClient } from '@supabase/supabase-js';

// Allow configuration through environment variables for deployment flexibility
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wyccblddborwnntxaukg.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Y2NibGRkYm9yd25udHhhdWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTE2MDksImV4cCI6MjA2NDk2NzYwOX0.36RCNe7Bw0_IpYWYso9yWkWd5uYS3QCEVWfRyxzY3j8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
