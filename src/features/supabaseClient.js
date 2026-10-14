import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function createSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) return null;

  try {
    return createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    });
  } catch (error) {
    console.error('Kunne ikke sette opp Supabase-klienten:', error);
    return null;
  }
}

export const supabase = createSupabaseClient();