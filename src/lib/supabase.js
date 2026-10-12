import { createClient } from '@supabase/supabase-js';

// Public anon key (safe for the browser). Override with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://crgkvqsdqkgktnrxojrj.supabase.co';
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZ2t2cXNkcWtna3RucnhvanJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTU3NjYsImV4cCI6MjA4OTg3MTc2Nn0.dehIP_3QELXpLQYt218vl7ntjsVdoSC2D6SYQqUjsXQ';

export const supabase = createClient(url, key);
