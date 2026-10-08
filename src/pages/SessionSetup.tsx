import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Leaf,
  Clock3,
  LockKeyhole,
  Mic2,
  Music2,
  Play,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ReflowCharacter } from "../components/ReflowCharacter";
import { useAuth } from "../features/auth/AuthProvider";
import { getAdaptiveRecommendation } from "../features/dashboard/dashboard.service";
import { useFocusSession } from "../features/focus-session/FocusSessionProvider";
import { useUserSettings } from "../features/settings/UserSettingsProvider";
import { cn } from "../lib/utils";

const durationOptions = [15, 25, 45, 60] as const;
const audioOptions = [
  { label: "None", value: "none", icon: VolumeX },
  { label: "Ambient", value: "ambient", icon: SlidersHorizontal },
  { label: "Nature", value: "nature", icon: Leaf },
  { label: "Focus Sound", value: "focus", icon: Music2 },
] as const;

function SetupCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <Icon size={25} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink-950">
            {title}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
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

export function SessionSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSession, creating: sessionCreating, error: sessionError } = useFocusSession();
  const { settings, loading: settingsLoading } = useUserSettings();
  const preferenceEditedRef = useRef(false);
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState("30");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioCategory, setAudioCategory] = useState("ambient");
  const [volume, setVolume] = useState(70);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [recommendationMinutes, setRecommendationMinutes] = useState<number | null>(null);

  useEffect(() => {
    const enabled =
      settings.adaptive_focus_enabled &&
      settings.smart_session_length_enabled &&
      settings.use_session_history_for_recommendations;
    if (!user?.id || settingsLoading || !enabled) {
      queueMicrotask(() => setRecommendationMinutes(null));
      return;
    }
    let active = true;
    void getAdaptiveRecommendation(user.id).then((recommendation) => {
      if (active) setRecommendationMinutes(recommendation?.recommendedDurationMinutes ?? null);
    });
    return () => {
      active = false;
    };
  }, [settings, settingsLoading, user?.id]);

  useEffect(() => {
    if (settingsLoading || preferenceEditedRef.current) {
      return;
    }

    setAudioEnabled(settings.auto_start_audio && settings.default_sound !== "none");
    setAudioCategory(settings.default_sound === "focus_sound" ? "focus" : settings.default_sound);
    setVolume(settings.default_volume);
    setCameraEnabled(settings.camera_monitoring_enabled);
  }, [settings, settingsLoading]);

  const selectedDuration =
    duration === 0 ? Number(customDuration) || 0 : duration;
  const durationLabel =
    selectedDuration > 0 ? `${selectedDuration} minutes` : "Choose a duration";

  const selectedAudio = useMemo(
    () => audioOptions.find((option) => option.value === audioCategory),
    [audioCategory],
  );

  function setAudioPreference(nextValue: boolean) {
    preferenceEditedRef.current = true;
    setAudioEnabled(nextValue);
  }

  function setAudioCategoryPreference(nextValue: string) {
    preferenceEditedRef.current = true;
    setAudioCategory(nextValue);
  }

  function setVolumePreference(nextValue: number) {
    preferenceEditedRef.current = true;
    setVolume(nextValue);
  }

  function setCameraPreference(nextValue: boolean) {
    preferenceEditedRef.current = true;
    setCameraEnabled(nextValue);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!goal.trim() || selectedDuration < 1) {
      setShowValidation(true);
      return;
    }

    const session = await createSession({
      goal: goal.trim(),
      durationMinutes: selectedDuration,
      audioEnabled,
      audioCategory,
      audioVolume: volume,
      cameraEnabled,
    });

    if (!session) {
      return;
    }

    navigate("/session", {
      state: { sessionId: session.id },
    });
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-56 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/assets/mountain-duo.png"
          alt=""
          className="absolute -right-12 top-5 w-[55%] max-w-[720px] opacity-75"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-12 pt-8 lg:px-10 xl:px-12">
        <header className="relative z-10 mb-8 max-w-[950px]">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">
              Session setup
            </p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
            <div className="flex items-center gap-1.5" aria-label="Step 1 of 3">
              {[0, 1, 2].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    step === 0 ? "bg-sky-500" : "bg-sky-200",
                  )}
                />
              ))}
            </div>
          </div>
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">
            Let&apos;s set up your focus session
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-600">
            Choose a goal, set your preferences, and create the right
            environment for deep work.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.85fr)]"
        >
          <div className="flex flex-col gap-5">
            <SetupCard
              icon={FileText}
              title="What are you focusing on?"
              description="Set a clear goal to help you stay on track."
            >
              <label className="sr-only" htmlFor="focus-goal">
                Focus goal
              </label>
              <div className="relative">
                <Sparkles
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-500"
                />
                <input
                  id="focus-goal"
                  type="text"
                  value={goal}
                  maxLength={100}
                  onChange={(event) => {
                    setGoal(event.target.value);
                    setShowValidation(false);
                  }}
                  placeholder="e.g. Finish the design system documentation"
                  className={cn(
                    "h-14 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-ink-950 outline-none transition-colors placeholder:text-ink-600/75 focus:border-sky-500 focus:ring-4 focus:ring-sky-100",
                    showValidation && !goal.trim()
                      ? "border-danger"
                      : "border-slate-200",
                  )}
                />
              </div>
              <div className="mt-1 flex justify-between text-[12px] text-ink-600">
                <span>
                  {showValidation && !goal.trim()
                    ? "Add a focus goal to continue."
                    : " "}
                </span>
                <span>{goal.length}/100</span>
              </div>
            </SetupCard>

            <SetupCard
              icon={SlidersHorizontal}
              title="Focus duration"
              description="Choose how long you want to focus."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {durationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={duration === option}
                    onClick={() => setDuration(option)}
                    className={cn(
                      "relative flex min-h-[76px] flex-col items-center justify-center rounded-xl border px-2 py-3 transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                      duration === option
                        ? "border-sky-500 bg-sky-50 text-sky-500"
                        : "border-slate-200 text-ink-950 hover:border-sky-200 hover:bg-sky-50/50",
                    )}
                  >
                    {duration === option && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    <strong className="text-[19px] leading-none">
                      {option}
                    </strong>
                    <span className="mt-2 text-[12px]">minutes</span>
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={duration === 0}
                  onClick={() => setDuration(0)}
                  className={cn(
                    "relative flex min-h-[76px] flex-col items-center justify-center rounded-xl border px-2 py-3 transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                    duration === 0
                      ? "border-sky-500 bg-sky-50 text-sky-500"
                      : "border-slate-200 text-ink-950 hover:border-sky-200 hover:bg-sky-50/50",
                  )}
                >
                  {duration === 0 && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                  <SlidersHorizontal size={19} />
                  <span className="mt-2 text-[12px]">Custom</span>
                </button>
              </div>
              {duration === 0 && (
                <label
                  className="mt-3 block text-[12px] font-semibold text-ink-600"
                  htmlFor="custom-duration"
                >
                  Custom duration in minutes
                  <input
                    id="custom-duration"
                    type="number"
                    min={1}
                    max={180}
                    value={customDuration}
                    onChange={(event) => setCustomDuration(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-ink-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </label>
              )}
            </SetupCard>

            <SetupCard
              icon={Music2}
              title="Audio preferences"
              description="Play background sounds to help you focus."
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-800">
                  Background audio
                </span>
                <Toggle
                  checked={audioEnabled}
                  onChange={setAudioPreference}
                  label="Enable background audio"
                />
              </div>
              <div
                className={cn(
                  "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
                  !audioEnabled && "opacity-50",
                )}
              >
                {audioOptions.map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={!audioEnabled}
                    aria-pressed={audioCategory === value}
                    onClick={() => setAudioCategoryPreference(value)}
                    className={cn(
                      "relative flex min-h-[70px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-[12px] transition-colors disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                      audioCategory === value && audioEnabled
                        ? "border-sky-500 bg-sky-50 text-sky-500"
                        : "border-slate-200 text-ink-600 hover:border-sky-200 hover:bg-sky-50/50",
                    )}
                  >
                    {audioCategory === value && audioEnabled && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    <Icon size={19} />
                    <span className="mt-2">{label}</span>
                  </button>
                ))}
              </div>
              <label
                className={cn(
                  "mt-4 flex items-center gap-3 text-[13px] text-ink-600",
                  !audioEnabled && "opacity-50",
                )}
                htmlFor="volume"
              >
                <Volume2 size={18} className="shrink-0 text-ink-800" />
                <span>Volume</span>
                <input
                  id="volume"
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  disabled={!audioEnabled}
                  onChange={(event) => setVolumePreference(Number(event.target.value))}
                  className="h-1.5 min-w-0 flex-1 accent-sky-500 disabled:cursor-not-allowed"
                />
                <span className="w-9 text-right">{volume}%</span>
              </label>
              <p className="mt-3 text-[11px] text-ink-400">
                Static preference preview — audio playback will be added in a
                future increment.
              </p>
            </SetupCard>

            <SetupCard
              icon={Camera}
              title="Camera monitoring"
              description="Get insights about your focus patterns."
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-sky-500">
                    Optional
                  </span>
                  <p className="mt-2 text-[13px] text-ink-600">
                    You can continue without camera monitoring.
                  </p>
                </div>
                <Toggle
                  checked={cameraEnabled}
                  onChange={setCameraPreference}
                  label="Enable camera monitoring"
                  id="camera-monitoring-toggle"
                />
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-sky-50 px-4 py-3 text-[12px] leading-relaxed text-ink-600">
                <LockKeyhole
                  size={18}
                  className="mt-0.5 shrink-0 text-sky-500"
                />
                <span>
                  <strong className="font-semibold text-ink-950">
                    Your privacy is our priority.
                  </strong>{" "}
                  Reflow processes focus-related signals without storing or
                  uploading raw video.
                </span>
              </div>
              <p className="mt-3 text-[11px] text-ink-400">
                Camera access is not requested in this frontend-only increment.
              </p>
            </SetupCard>
          </div>

          <aside className="flex flex-col gap-5 xl:sticky xl:top-5 xl:self-start">
            <section
              className="relative rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6"
              aria-labelledby="recommendation-heading"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-36 z-10 hidden md:block xl:-right-12 xl:-top-44"
                aria-hidden="true"
              >
                <ReflowCharacter
                  size="large"
                  variant="session"
                  className="h-40 w-60 object-contain object-bottom xl:h-52 xl:w-72"
                />
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <Sparkles size={23} />
                </span>
                <div>
                  <h2
                    id="recommendation-heading"
                    className="text-[18px] font-semibold text-ink-950"
                  >
                    Recommended for you
                  </h2>
                  <p className="mt-1 text-[14px] text-ink-600">
                    Based on your recent session patterns.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (recommendationMinutes) setDuration(recommendationMinutes);
                }}
                disabled={!recommendationMinutes}
                className="group theme-recommendation-card relative isolate mt-4 min-h-[158px] w-full overflow-hidden rounded-2xl border border-sky-200/80 p-5 text-left transition-all hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                <span className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/35 transition-transform duration-300 group-hover:scale-110" />
                <span className="pointer-events-none absolute -bottom-16 -right-8 h-40 w-64 rounded-[50%] border-[18px] border-white/25" />
                <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-500">
                  <Sparkles size={12} /> Suggested focus
                </span>
                <span className="relative z-10 mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-sky-500 shadow-sm">
                    <Clock3 size={21} />
                  </span>
                  <span className="text-[30px] font-semibold tracking-[-0.045em] text-ink-950">
                    {recommendationMinutes ? `${recommendationMinutes} minutes` : "No recommendation yet"}
                  </span>
                </span>
                <span className="relative z-10 mt-2 block max-w-[245px] text-[14px] leading-relaxed text-ink-600">
                  A balanced session to help you stay focused and productive.
                </span>
                <span className="absolute bottom-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-white shadow-control transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </button>
            </section>

            <section
              className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6"
              aria-labelledby="summary-heading"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="summary-heading"
                  className="text-[18px] font-semibold text-ink-950"
                >
                  Session summary
                </h2>
              </div>
              <p className="mt-1 text-[14px] text-ink-600">
                Review your setup before starting.
              </p>
              <dl className="mt-4 divide-y divide-slate-100">
                <div className="flex gap-3 py-3 first:pt-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[13px] font-semibold text-ink-950">
                      Goal
                    </dt>
                    <dd className="mt-0.5 truncate text-[13px] text-ink-600">
                      {goal.trim() || "Add a focus goal"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <SlidersHorizontal size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[13px] font-semibold text-ink-950">
                      Duration
                    </dt>
                    <dd className="mt-0.5 text-[13px] text-ink-600">
                      {durationLabel}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <Mic2 size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[13px] font-semibold text-ink-950">
                      Audio
                    </dt>
                    <dd className="mt-0.5 text-[13px] text-ink-600">
                      {audioEnabled
                        ? `${selectedAudio?.label ?? "Ambient"} · Volume ${volume}%`
                        : "Off"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 py-3 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <Camera size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-[13px] font-semibold text-ink-950">
                      Camera monitoring
                    </dt>
                    <dd className="mt-0.5 text-[13px] text-ink-600">
                      {cameraEnabled ? "On · Optional" : "Off"}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={sessionCreating || !goal.trim() || selectedDuration < 1}
                className="inline-flex min-h-14 items-center justify-center gap-4 rounded-xl bg-primary-cta-gradient px-5 text-[16px] font-semibold text-white shadow-control transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:bg-none disabled:text-ink-400 disabled:shadow-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                <Play size={20} fill="currentColor" />
                {sessionCreating ? "Starting…" : "Start Session"}
                <ChevronRight size={20} />
              </button>
              <Link
                to="/dashboard"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-slate-100 px-5 text-[16px] font-semibold text-ink-950 transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                Cancel
              </Link>
            </div>
            <p className={cn("text-center text-[11px]", sessionError ? "text-danger" : "text-ink-400")} role={sessionError ? "alert" : undefined}>
              {sessionError ?? "Your session starts as soon as you continue."}
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
