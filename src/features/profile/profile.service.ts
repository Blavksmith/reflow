import type { Profile } from "./profile.types";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export type ProfileResult<T> = {
  data: T | null;
  error: string | null;
};

const profileConfigurationError =
  "Profile data is unavailable until Supabase is configured.";
const profileLoadError =
  "We could not load your profile right now. Your account is still available.";
const profileUpdateError =
  "We could not save your profile changes. Please try again.";

function canUseSupabase() {
  return Boolean(supabase && isSupabaseConfigured);
}

export async function getProfile(userId: string): Promise<ProfileResult<Profile>> {
  if (!canUseSupabase()) {
    return { data: null, error: profileConfigurationError };
  }

  const { data, error } = await supabase!
    .from("profiles")
    .select("id, display_name, avatar_url, timezone, locale, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: profileLoadError };
  }

  return { data: data as Profile | null, error: null };
}

export async function updateProfile(
  userId: string,
  changes: Partial<Pick<Profile, "display_name" | "avatar_url" | "timezone" | "locale">>,
): Promise<ProfileResult<Profile>> {
  if (!canUseSupabase()) {
    return { data: null, error: profileConfigurationError };
  }

  const { data, error } = await supabase!
    .from("profiles")
    .update(changes)
    .eq("id", userId)
    .select("id, display_name, avatar_url, timezone, locale, created_at, updated_at")
    .maybeSingle();

  if (error) {
    return { data: null, error: profileUpdateError };
  }

  return { data: data as Profile | null, error: null };
}
