import { createClient } from '@supabase/supabase-js';

// Estas variables van en apps/web/.env
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'implicit',  // ← agrega esto
    }
  }
);