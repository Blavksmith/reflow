import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../../theme/ThemeProvider";
import { getUserSettings, updateUserSettings } from "./settings.service";
import {
  DEFAULT_USER_SETTINGS,
  type AudioSetting,
  type UserSettings,
  type UserSettingsKey,
  type UserSettingsPatch,
} from "./settings.types";

const themeValues = new Set(["light", "dark", "system"]);
const audioValues = new Set(["none", "ambient", "nature", "focus_sound"]);

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSettings(
  value: Partial<UserSettings> | null,
  userId: string,
): UserSettings {
  const source = value ?? {};
  return {
    ...DEFAULT_USER_SETTINGS,
    ...source,
    id: source.id ?? null,
    user_id: source.user_id ?? userId,
    theme: themeValues.has(source.theme ?? "")
      ? (source.theme as UserSettings["theme"])
      : DEFAULT_USER_SETTINGS.theme,
    session_reminders_enabled: asBoolean(
      source.session_reminders_enabled,
      DEFAULT_USER_SETTINGS.session_reminders_enabled,
    ),
    progress_updates_enabled: asBoolean(
      source.progress_updates_enabled,
      DEFAULT_USER_SETTINGS.progress_updates_enabled,
    ),
    app_announcements_enabled: asBoolean(
      source.app_announcements_enabled,
      DEFAULT_USER_SETTINGS.app_announcements_enabled,
    ),
    focus_reminder_enabled: asBoolean(
      source.focus_reminder_enabled,
      DEFAULT_USER_SETTINGS.focus_reminder_enabled,
    ),
    focus_reminder_interval_minutes: asNumber(
      source.focus_reminder_interval_minutes,
      DEFAULT_USER_SETTINGS.focus_reminder_interval_minutes,
    ),
    break_reminder_enabled: asBoolean(
      source.break_reminder_enabled,
      DEFAULT_USER_SETTINGS.break_reminder_enabled,
    ),
    break_reminder_interval_minutes: asNumber(
      source.break_reminder_interval_minutes,
      DEFAULT_USER_SETTINGS.break_reminder_interval_minutes,
    ),
    default_sound: audioValues.has(source.default_sound ?? "")
      ? (source.default_sound as AudioSetting)
      : DEFAULT_USER_SETTINGS.default_sound,
    default_volume: Math.min(
      100,
      Math.max(
        0,
        asNumber(source.default_volume, DEFAULT_USER_SETTINGS.default_volume),
      ),
    ),
    remember_audio_settings: asBoolean(
      source.remember_audio_settings,
      DEFAULT_USER_SETTINGS.remember_audio_settings,
    ),
    auto_start_audio: asBoolean(
      source.auto_start_audio,
      DEFAULT_USER_SETTINGS.auto_start_audio,
    ),
    camera_monitoring_enabled: asBoolean(
      source.camera_monitoring_enabled,
      DEFAULT_USER_SETTINGS.camera_monitoring_enabled,
    ),
    camera_preview_enabled: asBoolean(
      source.camera_preview_enabled,
      DEFAULT_USER_SETTINGS.camera_preview_enabled,
    ),
    camera_background_blur_enabled: asBoolean(
      source.camera_background_blur_enabled,
      DEFAULT_USER_SETTINGS.camera_background_blur_enabled,
    ),
    allow_camera_signals_for_insights: asBoolean(
      source.allow_camera_signals_for_insights,
      DEFAULT_USER_SETTINGS.allow_camera_signals_for_insights,
    ),
    adaptive_focus_enabled: asBoolean(
      source.adaptive_focus_enabled,
      DEFAULT_USER_SETTINGS.adaptive_focus_enabled,
    ),
    smart_session_length_enabled: asBoolean(
      source.smart_session_length_enabled,
      DEFAULT_USER_SETTINGS.smart_session_length_enabled,
    ),
    use_session_history_for_recommendations: asBoolean(
      source.use_session_history_for_recommendations,
      DEFAULT_USER_SETTINGS.use_session_history_for_recommendations,
    ),
  };
}

type UserSettingsContextValue = {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  updatingKey: UserSettingsKey | null;
  savedKey: UserSettingsKey | null;
  refreshSettings: () => Promise<void>;
  updateSetting: <K extends UserSettingsKey>(
    key: K,
    value: UserSettings[K],
  ) => Promise<{ error: string | null }>;
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<UserSettingsKey | null>(null);
  const [savedKey, setSavedKey] = useState<UserSettingsKey | null>(null);
  const [settingsUserId, setSettingsUserId] = useState<string | null>(null);
  const userId = user?.id ?? null;

  const refreshSettings = useCallback(async () => {
    if (!userId) {
      setSettings(DEFAULT_USER_SETTINGS);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getUserSettings(userId);
    if (result.data) {
      const nextSettings = normalizeSettings(result.data, userId);
      setSettings(nextSettings);
      setTheme(nextSettings.theme);
    }
    setError(result.error);
    setLoading(false);
  }, [setTheme, userId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      setSettingsUserId(userId);
      setSettings(DEFAULT_USER_SETTINGS);
      setError(null);
      setSavedKey(null);
      setUpdatingKey(null);
      setLoading(Boolean(userId));
      if (!userId) {
        setTheme("system");
      }
    });

    if (!userId) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const result = await getUserSettings(userId);
      if (!active) {
        return;
      }
      if (result.data) {
        const nextSettings = normalizeSettings(result.data, userId);
        setSettings(nextSettings);
        setTheme(nextSettings.theme);
      }
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [setTheme, userId]);

  const updateSetting = useCallback(
    async <K extends UserSettingsKey,>(key: K, value: UserSettings[K]) => {
      const previousValue = settings[key];
      setSettings((current) => ({ ...current, [key]: value }));
      setError(null);

      if (key === "theme") {
        setTheme(value as UserSettings["theme"]);
      }

      if (!userId) {
        return { error: "Sign in to save your preferences." };
      }

      setUpdatingKey(key);
      setSavedKey(null);
      const result = await updateUserSettings(userId, {
        [key]: value,
      } as UserSettingsPatch);
      setUpdatingKey(null);

      if (result.error) {
        setSettings((current) => ({ ...current, [key]: previousValue }));
        if (key === "theme") {
          setTheme(previousValue as UserSettings["theme"]);
        }
        setError(result.error);
      } else {
        const persistedSettings = result.data
          ? normalizeSettings(result.data, userId)
          : null;
        if (persistedSettings) {
          setSettings(persistedSettings);
          setTheme(persistedSettings.theme);
        }
        setSavedKey(key);
      }

      return { error: result.error };
    },
    [setTheme, settings, userId],
  );

  const settingsReady = Boolean(userId && settingsUserId === userId);
  const value = useMemo(
    () => ({
      settings: settingsReady ? settings : DEFAULT_USER_SETTINGS,
      loading: userId ? loading || !settingsReady : false,
      error: settingsReady ? error : null,
      updatingKey: settingsReady ? updatingKey : null,
      savedKey: settingsReady ? savedKey : null,
      refreshSettings,
      updateSetting,
    }),
    [error, loading, refreshSettings, savedKey, settings, settingsReady, updateSetting, updatingKey, userId],
  );

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserSettings() {
  const context = useContext(UserSettingsContext);

  if (!context) {
    throw new Error("useUserSettings must be used inside a UserSettingsProvider");
  }

  return context;
}
