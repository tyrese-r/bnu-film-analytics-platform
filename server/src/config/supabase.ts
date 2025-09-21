import { createClient } from "@supabase/supabase-js";

// Lazy initialization to ensure env vars are loaded
let _supabase: any = null;

function getSupabase() {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL) {
      throw new Error("Missing env.SUPABASE_URL");
    }

    if (!process.env.SUPABASE_ANON_KEY) {
      throw new Error("Missing env.SUPABASE_ANON_KEY");
    }

    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

// Export as getter function
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return getSupabase()[prop];
  },
});

export default supabase;
