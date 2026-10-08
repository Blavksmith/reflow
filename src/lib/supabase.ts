import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnvValue(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

const supabaseUrl = readEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabasePublishableKey = readEnvValue(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
const supabaseAnonKey = readEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);
const supabaseKey = supabasePublishableKey ?? supabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;
