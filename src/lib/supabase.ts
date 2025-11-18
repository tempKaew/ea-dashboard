import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log environment variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔍 Supabase Environment Variables Check:");
  console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceRoleKey ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Set" : "❌ Missing"
  );
}

// Validate required variables
if (!supabaseUrl || supabaseUrl.trim() === "") {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please set it in your .env.local file."
  );
}

if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please set it in your .env.local file. " +
      "Make sure the variable name starts with NEXT_PUBLIC_ to be available in the browser."
  );
}

// Server-side Supabase client (for API routes)
// Validate service role key only on server-side
const isServer = typeof window === "undefined";
if (
  isServer &&
  (!supabaseServiceRoleKey || supabaseServiceRoleKey.trim() === "")
) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Please set it in your .env.local file. " +
      "Note: This variable is only available on the server-side and should NOT have NEXT_PUBLIC_ prefix."
  );
}

// Create server client only if we have the service role key
export const supabaseServer: SupabaseClient = isServer
  ? createClient(supabaseUrl, supabaseServiceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : (null as unknown as SupabaseClient); // Type cast for client-side (won't be used)

// Client-side Supabase client (for React components)
// This will be used in browser, so it needs NEXT_PUBLIC_ prefixed variables
export const supabaseClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
