import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { UserSettings, UserSettingsPatch } from "./settings.types";

export type UserSettingsResult<T> = {
  data: T | null;
  error: string | null;
};

const settingsConfigurationError =
  "Your preferences are unavailable until Supabase is configured.";
const settingsLoadError =
  "We could not load your preferences right now. Showing local defaults.";
const settingsUpdateError =
  "We could not save that preference. Please try again.";

function canUseSupabase() {
  return Boolean(supabase && isSupabaseConfigured);
}

export async function getUserSettings(
  userId: string,
): Promise<UserSettingsResult<UserSettings>> {
  if (!canUseSupabase()) {
    return { data: null, error: settingsConfigurationError };
  }

  const { data, error } = await supabase!
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error: settingsLoadError };
  }

  return { data: data as UserSettings | null, error: null };
}

export async function updateUserSettings(
  userId: string,
  changes: UserSettingsPatch,
): Promise<UserSettingsResult<UserSettings>> {
  if (!canUseSupabase()) {
    return { data: null, error: settingsConfigurationError };
  }

  const existing = await supabase!
    .from("user_settings")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error) {
    return { data: null, error: settingsUpdateError };
  }

  if (existing.data?.id) {
    const { data, error } = await supabase!
      .from("user_settings")
      .update(changes)
      .eq("id", existing.data.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      return { data: null, error: settingsUpdateError };
    }

    return { data: data as UserSettings, error: null };
  }

  const { data, error } = await supabase!
    .from("user_settings")
    .insert({ user_id: userId, ...changes })
    .select("*")
    .single();

  if (error || !data) {
    return { data: null, error: settingsUpdateError };
  }

  return { data: data as UserSettings, error: null };
}
