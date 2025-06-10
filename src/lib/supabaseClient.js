import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wyccblddborwnntxaukg.supabase.co'; // Supabase panelinden al
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Y2NibGRkYm9yd25udHhhdWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTE2MDksImV4cCI6MjA2NDk2NzYwOX0.36RCNe7Bw0_IpYWYso9yWkWd5uYS3QCEVWfRyxzY3j8'; // Supabase panelinden al

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
