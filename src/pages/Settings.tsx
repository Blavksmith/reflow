import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Coffee,
  Eye,
  Headphones,
  History,
  Info,
  Leaf,
  LockKeyhole,
  Megaphone,
  Monitor,
  Moon,
  Music2,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Sun,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ThemePreference } from "../theme/ThemeProvider";
import { useUserSettings } from "../features/settings/UserSettingsProvider";
import type { AudioSetting } from "../features/settings/settings.types";
import { cn } from "../lib/utils";

type SettingsSection = "general" | "audio" | "privacy" | "adaptive";
type Theme = ThemePreference;
type AudioOption = AudioSetting;

const settingsNavigation: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "general",
    label: "General",
    description: "App preferences and appearance",
    icon: SettingsIcon,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Sound and focus environment",
    icon: Headphones,
  },
  {
    id: "privacy",
    label: "Camera & Privacy",
    description: "Camera monitoring and data",
    icon: Camera,
  },
  {
    id: "adaptive",
    label: "Adaptive Focus Settings",
    description: "Personalized focus experience",
    icon: SlidersHorizontal,
  },
];

const themeOptions: Array<{
  value: Theme;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const audioOptions: Array<{
  value: AudioOption;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "none", label: "None", icon: VolumeX },
  { value: "ambient", label: "Ambient", icon: SlidersHorizontal },
  { value: "nature", label: "Nature", icon: Leaf },
  { value: "focus_sound", label: "Focus Sound", icon: Music2 },
];

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
        checked ? "bg-sky-500" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}

function SelectControl({
  id,
  value,
  onChange,
  options,
  label,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="relative block min-w-[132px]" htmlFor={id}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-[13px] font-medium text-ink-950 outline-none transition-colors hover:border-sky-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-800"
      />
    </label>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 py-5 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-800">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-semibold leading-snug text-ink-950">
          {title}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
          {description}
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Subsection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-slate-100 pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div>
        <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.025em] text-ink-950">
          {title}
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
          {description}
        </p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ThemePreview({ theme }: { theme: Theme }) {
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <span
      className={cn(
        "relative block h-14 w-full overflow-hidden rounded-lg border",
        theme === "dark"
          ? "theme-preview-frame-dark"
          : "theme-preview-frame-light",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "absolute inset-x-0 top-0 flex h-3 items-center gap-1 px-2",
          theme === "dark"
            ? "theme-preview-top-dark"
            : "theme-preview-top-light",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-sky-200" />
      </span>
      <span
        className={cn(
          "absolute left-3 top-6 h-2 w-12 rounded-full",
          theme === "dark"
            ? "theme-preview-line-dark"
            : "theme-preview-line-light",
        )}
      />
      <span
        className={cn(
          "absolute left-3 top-10 h-1.5 w-20 rounded-full",
          theme === "dark"
            ? "theme-preview-line-secondary-dark"
            : "theme-preview-line-secondary-light",
        )}
      />
      <span
        className={cn(
          "absolute right-3 top-5 flex h-7 w-7 items-center justify-center rounded-md",
          theme === "dark"
            ? "theme-preview-icon-dark"
            : "theme-preview-icon-light",
        )}
      >
        <Icon size={15} />
      </span>
    </span>
  );
}

function ThemePicker({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (value: Theme) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {themeOptions.map(({ value: option, label }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex min-h-[124px] flex-col justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
              selected
                ? "border-sky-500 bg-sky-50 text-ink-950"
                : "border-slate-200 bg-white text-ink-800 hover:border-sky-200 hover:bg-sky-50/50",
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <ThemePreview theme={option} />
            <span className="text-center text-[14px] font-semibold">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AudioPicker({
  value,
  onChange,
}: {
  value: AudioOption;
  onChange: (value: AudioOption) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {audioOptions.map(({ value: option, label, icon: Icon }) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex min-h-[70px] flex-col items-center justify-center rounded-xl border px-3 py-3 text-[12px] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
              selected
                ? "border-sky-500 bg-sky-50 text-sky-500"
                : "border-slate-200 text-ink-600 hover:border-sky-200 hover:bg-sky-50/50",
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
            <Icon size={19} />
            <span className="mt-2">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function GeneralSettings() {
  const { settings, updateSetting } = useUserSettings();

  return (
    <div className="space-y-6">
      <Subsection title="Appearance" description="Choose how Reflow looks and feels.">
        <ThemePicker
          value={settings.theme}
          onChange={(value) => void updateSetting("theme", value)}
        />
      </Subsection>

      <Subsection
        title="Notifications"
        description="Get reminders and important updates without losing your flow."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Bell}
            title="Session reminders"
            description="Get notified before your focus session starts."
          >
            <Toggle
              checked={settings.session_reminders_enabled}
              onChange={(value) => void updateSetting("session_reminders_enabled", value)}
              label="Session reminders"
            />
          </SettingRow>
          <SettingRow
            icon={Monitor}
            title="Progress updates"
            description="Receive updates about your focus progress."
          >
            <Toggle
              checked={settings.progress_updates_enabled}
              onChange={(value) => void updateSetting("progress_updates_enabled", value)}
              label="Progress updates"
            />
          </SettingRow>
          <SettingRow
            icon={Megaphone}
            title="App announcements"
            description="Get the latest features and news from Reflow."
          >
            <Toggle
              checked={settings.app_announcements_enabled}
              onChange={(value) => void updateSetting("app_announcements_enabled", value)}
              label="App announcements"
            />
          </SettingRow>
        </div>
      </Subsection>

      <Subsection
        title="Focus reminders"
        description="Gentle reminders to help you stay on track."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Clock3}
            title="Focus reminder"
            description="Show a gentle reminder if you’re off focus."
          >
            <Toggle
              checked={settings.focus_reminder_enabled}
              onChange={(value) => void updateSetting("focus_reminder_enabled", value)}
              label="Focus reminder"
            />
          </SettingRow>
          <div className="flex flex-col gap-3 border-t border-slate-100 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-0 sm:pl-[52px]">
              <h3 className="text-[14px] font-semibold leading-snug text-ink-950">
                Reminder interval
              </h3>
              <p className="mt-1 text-[12px] text-ink-600">
                Set how often you want to be reminded.
              </p>
            </div>
            <SelectControl
              id="focus-interval"
              label="Focus reminder interval"
              value={`${settings.focus_reminder_interval_minutes} minutes`}
              onChange={(value) =>
                void updateSetting("focus_reminder_interval_minutes", Number.parseInt(value, 10))
              }
              options={["5 minutes", "10 minutes", "15 minutes", "20 minutes"]}
            />
          </div>
        </div>
      </Subsection>

      <Subsection
        title="Break reminders"
        description="Get a nudge to step away and recharge between sessions."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Coffee}
            title="Break reminder"
            description="Receive a reminder to take a break."
          >
            <Toggle
              checked={settings.break_reminder_enabled}
              onChange={(value) => void updateSetting("break_reminder_enabled", value)}
              label="Break reminder"
            />
          </SettingRow>
          <div className="flex flex-col gap-3 border-t border-slate-100 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-0 sm:pl-[52px]">
              <h3 className="text-[14px] font-semibold leading-snug text-ink-950">
                Break interval
              </h3>
              <p className="mt-1 text-[12px] text-ink-600">
                Set how often you want to be reminded.
              </p>
            </div>
            <SelectControl
              id="break-interval"
              label="Break reminder interval"
              value={`${settings.break_reminder_interval_minutes} minutes`}
              onChange={(value) =>
                void updateSetting("break_reminder_interval_minutes", Number.parseInt(value, 10))
              }
              options={["15 minutes", "25 minutes", "30 minutes", "45 minutes"]}
            />
          </div>
        </div>
      </Subsection>
    </div>
  );
}

function AudioSettings() {
  const { settings, updateSetting } = useUserSettings();

  return (
    <div className="space-y-6">
      <Subsection
        title="Default sound"
        description="Choose the sound that plays automatically during a session."
      >
        <AudioPicker
          value={settings.default_sound}
          onChange={(value) => void updateSetting("default_sound", value)}
        />
      </Subsection>

      <Subsection
        title="Default volume"
        description="Set the starting volume for your focus environment."
      >
        <label
          className="flex items-center gap-3 text-[13px] text-ink-600"
          htmlFor="default-volume"
        >
          <Volume2 size={18} className="shrink-0 text-ink-800" />
          <span>Volume</span>
          <input
            id="default-volume"
            aria-label="Default volume"
            type="range"
            min={0}
            max={100}
            value={settings.default_volume}
            onChange={(event) =>
              void updateSetting("default_volume", Number(event.target.value))
            }
            className="h-1.5 min-w-0 flex-1 accent-sky-500"
          />
          <span className="w-9 text-right">{settings.default_volume}%</span>
        </label>
      </Subsection>

      <Subsection
        title="Audio behavior"
        description="Choose what happens when a focus session begins."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Headphones}
            title="Remember audio settings"
            description="Keep your latest sound and volume choices."
          >
            <Toggle
              checked={settings.remember_audio_settings}
              onChange={(value) => void updateSetting("remember_audio_settings", value)}
              label="Remember audio settings"
            />
          </SettingRow>
          <SettingRow
            icon={Music2}
            title="Automatically start audio"
            description="Start your selected sound when a session begins."
          >
            <Toggle
              checked={settings.auto_start_audio}
              onChange={(value) => void updateSetting("auto_start_audio", value)}
              label="Automatically start audio when a session begins"
            />
          </SettingRow>
        </div>
      </Subsection>
    </div>
  );
}

function PrivacySettings() {
  const { settings, updateSetting } = useUserSettings();

  return (
    <div className="space-y-6">
      <Subsection
        title="Camera"
        description="Control how your camera is used during focus sessions."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Camera}
            title="Camera monitoring"
            description="Use optional camera signals to understand your focus patterns."
          >
            <Toggle
              checked={settings.camera_monitoring_enabled}
              onChange={(value) => void updateSetting("camera_monitoring_enabled", value)}
              label="Camera monitoring"
            />
          </SettingRow>
          <SettingRow
            icon={Video}
            title="Camera preview"
            description="Show a small preview while camera monitoring is enabled."
          >
            <Toggle
              checked={settings.camera_preview_enabled}
              onChange={(value) => void updateSetting("camera_preview_enabled", value)}
              label="Camera preview"
            />
          </SettingRow>
          <SettingRow
            icon={LockKeyhole}
            title="Background blur"
            description="Keep your surroundings soft and private in the preview."
          >
            <Toggle
              checked={settings.camera_background_blur_enabled}
              onChange={(value) =>
                void updateSetting("camera_background_blur_enabled", value)
              }
              label="Background blur"
            />
          </SettingRow>
        </div>
      </Subsection>

      <Subsection
        title="Privacy"
        description="You are in control of what Reflow can access and use."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Eye}
            title="Use camera signals for focus insights"
            description="Allow previous camera signals to improve focus insights."
          >
            <Toggle
              checked={settings.allow_camera_signals_for_insights}
              onChange={(value) =>
                void updateSetting("allow_camera_signals_for_insights", value)
              }
              label="Use camera signals for focus insights"
            />
          </SettingRow>
          <div className="flex items-start gap-4 border-t border-slate-100 py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-sky-500">
              <Info size={20} />
            </span>
            <div>
              <h3 className="text-[14px] font-semibold text-ink-950">
                Data &amp; Privacy
              </h3>
              <p className="mt-1 max-w-[600px] text-[12px] leading-relaxed text-ink-600">
                Reflow uses focus-related signals to personalize your experience.
                Raw camera video is not stored or uploaded.
              </p>
              <button
                type="button"
                className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] font-semibold text-sky-500 transition-colors hover:bg-sky-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                View Privacy Details
              </button>
            </div>
          </div>
        </div>
      </Subsection>
    </div>
  );
}

function AdaptiveSettings() {
  const { settings, updateSetting } = useUserSettings();

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-sky-50 px-5 py-4 text-[14px] leading-relaxed text-ink-600">
        Reflow uses your previous focus patterns to suggest session lengths that
        may work better for you.
      </div>
      <Subsection
        title="Adaptive focus"
        description="Personalize your focus-session recommendations."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={SlidersHorizontal}
            title="Adaptive focus"
            description="Enable personalized focus recommendations."
          >
            <Toggle
              checked={settings.adaptive_focus_enabled}
              onChange={(value) => void updateSetting("adaptive_focus_enabled", value)}
              label="Adaptive focus"
            />
          </SettingRow>
        </div>
      </Subsection>

      <Subsection
        title="Smart session length"
        description="Let Reflow recommend a duration that fits your patterns."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={Clock3}
            title="Smart session length"
            description="Recommend a session duration based on previous focus patterns."
          >
            <Toggle
              checked={settings.smart_session_length_enabled}
              onChange={(value) =>
                void updateSetting("smart_session_length_enabled", value)
              }
              label="Smart session length"
            />
          </SettingRow>
        </div>
      </Subsection>

      <Subsection
        title="Use session history"
        description="Choose whether past sessions can improve future recommendations."
      >
        <div className="rounded-xl border border-slate-200/80 px-5">
          <SettingRow
            icon={History}
            title="Use session history"
            description="Allow previous session data to improve future recommendations."
          >
            <Toggle
              checked={settings.use_session_history_for_recommendations}
              onChange={(value) =>
                void updateSetting("use_session_history_for_recommendations", value)
              }
              label="Use session history"
            />
          </SettingRow>
        </div>
      </Subsection>
    </div>
  );
}

function SettingsContent({ section }: { section: SettingsSection }) {
  switch (section) {
    case "audio":
      return <AudioSettings />;
    case "privacy":
      return <PrivacySettings />;
    case "adaptive":
      return <AdaptiveSettings />;
    case "general":
    default:
      return <GeneralSettings />;
  }
}

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const {
    loading: settingsLoading,
    error: settingsError,
    updatingKey,
    savedKey,
  } = useUserSettings();
  const activeNavigation = settingsNavigation.find(
    (item) => item.id === activeSection,
  );
  const ActiveIcon = activeNavigation?.icon ?? SettingsIcon;

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-12 pt-8 lg:px-10 xl:px-12">
        <header className="mb-8 max-w-[950px]">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">
              Settings
            </p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
            <div className="flex items-center gap-1.5" aria-label="Settings">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-sky-200" />
              <span className="h-1.5 w-1.5 rounded-full bg-sky-200" />
              <span className="h-1.5 w-1.5 rounded-full bg-sky-200" />
            </div>
          </div>
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">
            Customize your experience
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-600">
            Adjust your preferences to make Reflow work best for you.
          </p>
          {(settingsLoading || updatingKey || savedKey || settingsError) && (
            <p
              className={cn(
                "mt-3 text-[12px] font-medium",
                settingsError ? "text-danger" : "text-ink-600",
              )}
              role={settingsError ? "status" : undefined}
              aria-live="polite"
            >
              {settingsError ??
                (updatingKey
                  ? "Saving your preference…"
                  : savedKey
                    ? "Preference saved."
                    : "Loading your preferences…")}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-[18px] border border-slate-200/70 bg-white/90 p-4 shadow-soft lg:sticky lg:top-5">
            <p className="px-3 pb-3 pt-1 text-[12px] font-medium text-ink-600">
              Settings
            </p>
            <nav aria-label="Settings sections" className="space-y-1">
              {settingsNavigation.map(({ id, label, description, icon: Icon }) => {
                const selected = id === activeSection;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={selected ? "page" : undefined}
                    onClick={() => setActiveSection(id)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                      selected
                        ? "bg-sky-100 text-ink-950 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-sky-500"
                        : "text-ink-800 hover:bg-sky-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        selected
                          ? "bg-white text-sky-500"
                          : "bg-sky-50 text-ink-800",
                      )}
                    >
                      <Icon size={19} strokeWidth={selected ? 2.2 : 1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold leading-snug">
                        {label}
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-ink-600">
                        {description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section
            className="rounded-[18px] border border-slate-200/70 bg-white/90 p-6 shadow-soft sm:p-7"
            aria-labelledby="settings-content-heading"
          >
            <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                <ActiveIcon size={23} strokeWidth={2} />
              </span>
              <div>
                <h2
                  id="settings-content-heading"
                  className="text-[18px] font-semibold tracking-[-0.025em] text-ink-950"
                >
                  {activeNavigation?.label}
                </h2>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
                  {activeNavigation?.id === "general"
                    ? "Manage your preferences and app experience."
                    : activeNavigation?.description}
                </p>
              </div>
            </div>
            <div className="pt-6">
              <SettingsContent section={activeSection} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
