import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Only initialize on server side
const isServer = typeof window === "undefined";

// Lazy initialization to avoid errors on client-side imports
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

function initializeAdmin() {
  if (!isServer) {
    throw new Error(
      "Supabase Admin client can only be used on the server side. This is a client-side code path.",
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return _supabaseAdmin;
}

// Admin client for server-side operations with elevated privileges
// WARNING: Only use this in API routes, never in client-side code
// This getter will throw an error if accessed on client side
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const admin = initializeAdmin();
    return (admin as any)[prop];
  },
});

// Helper function for backward compatibility
export function getSupabaseAdmin() {
  return initializeAdmin();
}
