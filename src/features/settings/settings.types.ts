import type { ThemePreference } from "../../theme/ThemeProvider";

export type AudioSetting = "none" | "ambient" | "nature" | "focus_sound";

export type UserSettings = {
  id: string | null;
  user_id: string | null;
  theme: ThemePreference;
  session_reminders_enabled: boolean;
  progress_updates_enabled: boolean;
  app_announcements_enabled: boolean;
  focus_reminder_enabled: boolean;
  focus_reminder_interval_minutes: number;
  break_reminder_enabled: boolean;
  break_reminder_interval_minutes: number;
  default_sound: AudioSetting;
  default_volume: number;
  remember_audio_settings: boolean;
  auto_start_audio: boolean;
  camera_monitoring_enabled: boolean;
  camera_preview_enabled: boolean;
  camera_background_blur_enabled: boolean;
  allow_camera_signals_for_insights: boolean;
  adaptive_focus_enabled: boolean;
  smart_session_length_enabled: boolean;
  use_session_history_for_recommendations: boolean;
};

export type UserSettingsKey = Exclude<keyof UserSettings, "id" | "user_id">;
export type UserSettingsPatch = Partial<Pick<UserSettings, UserSettingsKey>>;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: null,
  user_id: null,
  theme: "system",
  session_reminders_enabled: true,
  progress_updates_enabled: true,
  app_announcements_enabled: false,
  focus_reminder_enabled: true,
  focus_reminder_interval_minutes: 10,
  break_reminder_enabled: true,
  break_reminder_interval_minutes: 25,
  default_sound: "ambient",
  default_volume: 70,
  remember_audio_settings: true,
  auto_start_audio: true,
  camera_monitoring_enabled: false,
  camera_preview_enabled: false,
  camera_background_blur_enabled: true,
  allow_camera_signals_for_insights: true,
  adaptive_focus_enabled: true,
  smart_session_length_enabled: true,
  use_session_history_for_recommendations: true,
};
