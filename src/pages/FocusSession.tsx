import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  Flag,
  Headphones,
  Leaf,
  Lightbulb,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ReflowCharacter } from "../components/ReflowCharacter";
import type { SummaryState } from "./SessionSummary";
import { cn } from "../lib/utils";

const DEFAULT_FOCUS_GOAL = "Finish the design system documentation";

const audioOptions = [
  { label: "None", value: "none", icon: VolumeX },
  { label: "Ambient", value: "ambient", icon: Volume2 },
  { label: "Nature", value: "nature", icon: Leaf },
  { label: "Focus Sound", value: "focus", icon: Mic2 },
] as const;

type SessionSetupState = {
  goal: string;
  duration: number;
  audioEnabled: boolean;
  audioCategory: string;
  volume: number;
  cameraEnabled: boolean;
};

const defaultSetup: SessionSetupState = {
  goal: DEFAULT_FOCUS_GOAL,
  duration: 25,
  audioEnabled: true,
  audioCategory: "ambient",
  volume: 70,
  cameraEnabled: false,
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function FocusSession() {
  const navigate = useNavigate();
  const location = useLocation();

  const setup =
    (location.state as SessionSetupState | null) ?? defaultSetup;

  const totalSeconds = Math.max(60, setup.duration * 60);

  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(
    setup.audioEnabled,
  );
  const [audioCategory, setAudioCategory] = useState(
    setup.audioCategory,
  );
  const [volume, setVolume] = useState(setup.volume);
  const [cameraEnabled, setCameraEnabled] = useState(
    setup.cameraEnabled,
  );

  const [distractionReported, setDistractionReported] =
    useState(false);

  const [rescueStarted, setRescueStarted] = useState(false);

  useEffect(() => {
    if (isPaused || isEnding || remaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPaused, isEnding, remaining]);

  useEffect(() => {
    if (remaining !== 0 || isEnding) {
      return;
    }

    navigate("/session/summary", {
      state: {
        goal: setup.goal,
        duration: setup.duration,
        actualSeconds: totalSeconds,
        interruptionCount: distractionReported ? 3 : 0,
      } satisfies SummaryState,
    });
  }, [
    distractionReported,
    isEnding,
    navigate,
    remaining,
    setup.duration,
    setup.goal,
    totalSeconds,
  ]);

  const remainingProgress =
    (remaining / totalSeconds) * 100;

  const selectedAudio = useMemo(
    () =>
      audioOptions.find(
        (option) => option.value === audioCategory,
      ),
    [audioCategory],
  );

  function endSession() {
    setIsEnding(true);

    window.setTimeout(() => {
      navigate("/session/summary", {
        state: {
          goal: setup.goal,
          duration: setup.duration,
          actualSeconds: Math.max(
            0,
            totalSeconds - remaining,
          ),
          interruptionCount: distractionReported ? 3 : 0,
        } satisfies SummaryState,
      });
    }, 450);
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      {/* Background landscape */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/assets/mountain-duo.png"
          alt=""
          className="absolute -right-12 top-5 w-[55%] max-w-[720px] opacity-75"
        />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 pb-10 pt-8 lg:px-10 xl:px-12">
        {/* Header */}
        <header className="relative z-10 mb-8">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">
              Focus session
            </p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
            <div className="flex items-center gap-1.5" aria-label="Step 2 of 3">
              {[0, 1, 2].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    step < 2 ? "bg-sky-500" : "bg-sky-200",
                  )}
                />
              ))}
            </div>
          </div>

          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">
            Stay focused, you&apos;ve got this!
          </h1>

          <p className="mt-4 text-[18px] leading-relaxed text-ink-600">
            Take it one step at a time. A focused session can make
            a big difference.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.9fr)]">
          {/* Main column */}
          <div className="flex flex-col gap-5">
            {/* Current goal + timer */}
            <section
              className="rounded-[18px] border border-slate-200/70 bg-white/90 p-6 shadow-soft sm:p-8"
              aria-labelledby="goal-heading"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <Check size={25} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink-600">
                    Current goal
                  </p>

                  <h2
                    id="goal-heading"
                    className="mt-1 max-w-[720px] text-[22px] font-semibold leading-snug tracking-[-0.03em] text-ink-950"
                  >
                    {setup.goal}
                  </h2>
                </div>
              </div>

              {/* Timer */}
              <div className="mx-auto mt-7 flex w-full max-w-[390px] flex-col items-center">
                <div className="relative h-[218px] w-full max-w-[340px]">
                  <svg
                    className="absolute inset-x-0 top-0 h-[190px] w-full overflow-visible"
                    viewBox="0 0 330 190"
                    role="img"
                    aria-label={`${Math.round(
                      remainingProgress,
                    )} percent of the focus session remaining`}
                  >
                    <defs>
                      <linearGradient
                        id="focus-arc-gradient"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3c8ff0"
                        />
                        <stop
                          offset="100%"
                          stopColor="#72a9f4"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M35 155 A130 130 0 0 1 295 155"
                      fill="none"
                      stroke="#e4effb"
                      strokeLinecap="round"
                      strokeWidth="17"
                    />

                    <path
                      d="M35 155 A130 130 0 0 1 295 155"
                      fill="none"
                      pathLength="1"
                      stroke="url(#focus-arc-gradient)"
                      strokeDasharray={`${remainingProgress / 100} ${
                        1 - remainingProgress / 100
                      }`}
                      strokeLinecap="round"
                      strokeWidth="17"
                      className="drop-shadow-[0_5px_8px_rgba(44,127,227,0.22)] transition-all duration-700 ease-linear"
                    />
                  </svg>

                  <div className="absolute inset-x-0 top-[82px] flex flex-col items-center text-center">
                    <span className="text-[13px] text-ink-600">
                      {isPaused ? "Paused" : "Focus session"}
                    </span>

                    <strong
                      className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.07em] text-ink-950"
                      style={{
                        fontFamily:
                          "Inter, ui-sans-serif, system-ui, sans-serif",
                      }}
                    >
                      {formatTime(remaining)}
                    </strong>

                    <span className="mt-2 text-[14px] text-ink-600">
                      / {formatTime(totalSeconds)}
                    </span>
                  </div>
                </div>

                {/* Timer controls */}
                <div className="mt-6 flex w-full items-start justify-center gap-12">
                  <button
                    type="button"
                    onClick={() =>
                      setIsPaused((value) => !value)
                    }
                    disabled={
                      isEnding || remaining === 0
                    }
                    className="flex flex-col items-center gap-2 text-[14px] font-medium text-ink-950 disabled:opacity-40"
                  >
                    <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-b-4 border-sky-200 bg-sky-100 text-sky-500 shadow-[0_5px_0_#c6def8] transition-all hover:bg-sky-200 active:translate-y-1 active:shadow-[0_1px_0_#c6def8]">
                      {isPaused ? (
                        <Play
                          size={25}
                          fill="currentColor"
                        />
                      ) : (
                        <Pause
                          size={25}
                          fill="currentColor"
                        />
                      )}
                    </span>

                    {isPaused ? "Resume" : "Pause"}
                  </button>

                  <button
                    type="button"
                    onClick={endSession}
                    disabled={isEnding}
                    className="flex flex-col items-center gap-2 text-[16px] font-semibold text-ink-950 disabled:opacity-60"
                  >
                    <span className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-b-4 border-[#b83f4c] bg-danger text-white shadow-[0_5px_0_#b83f4c] transition-all hover:scale-105 active:translate-y-1 active:shadow-[0_1px_0_#b83f4c]">
                      {isEnding ? (
                        <RotateCcw
                          size={27}
                          className="animate-spin"
                        />
                      ) : (
                        <Square
                          size={27}
                          fill="currentColor"
                        />
                      )}
                    </span>

                    {isEnding
                      ? "Ending…"
                      : "End Session"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRemaining(totalSeconds);
                      setIsPaused(false);
                    }}
                    disabled={isEnding}
                    className="flex flex-col items-center gap-2 text-[14px] font-medium text-ink-950 disabled:opacity-40"
                  >
                    <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-b-4 border-sky-200 bg-sky-100 text-sky-500 shadow-[0_5px_0_#c6def8] transition-all hover:bg-sky-200 active:translate-y-1 active:shadow-[0_1px_0_#c6def8]">
                      <RotateCcw size={25} />
                    </span>

                    Restart
                  </button>
                </div>
              </div>
            </section>

            {/* Break */}
            <section
              className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:px-6"
              aria-labelledby="break-heading"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <Lightbulb size={24} />
                </span>

                <div>
                  <h2
                    id="break-heading"
                    className="text-[18px] font-semibold text-ink-950"
                  >
                    Need to take a break?
                  </h2>

                  <p className="mt-1 text-[14px] text-ink-600">
                    It&apos;s okay to rest. You can always resume
                    your session.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(true)}
                className="hidden shrink-0 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[14px] font-semibold text-sky-500 transition-colors hover:bg-sky-100 sm:block"
              >
                Take a short break
              </button>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            {/* Audio */}
            <section
              className="relative rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6"
              aria-labelledby="audio-heading"
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

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <Headphones size={23} />
                  </span>

                  <div>
                    <h2
                      id="audio-heading"
                      className="text-[18px] font-semibold text-ink-950"
                    >
                      Audio
                    </h2>

                    <p className="mt-1 text-[14px] text-ink-600">
                      Background sound to help you focus.
                    </p>
                  </div>
                </div>

                <Toggle
                  checked={audioEnabled}
                  onChange={() =>
                    setAudioEnabled(
                      (value) => !value,
                    )
                  }
                  label="Toggle audio"
                />
              </div>

              <div
                className={cn(
                  "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
                  !audioEnabled && "opacity-50",
                )}
              >
                {audioOptions.map(
                  ({
                    label,
                    value,
                    icon: Icon,
                  }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={!audioEnabled}
                      aria-pressed={
                        audioCategory === value
                      }
                      onClick={() =>
                        setAudioCategory(value)
                      }
                      className={cn(
                        "relative flex min-h-[76px] flex-col items-center justify-center rounded-xl border text-[12px] transition-colors disabled:cursor-not-allowed",
                        audioCategory === value &&
                          audioEnabled
                          ? "border-sky-500 bg-sky-50 text-sky-500"
                          : "border-slate-200 text-ink-600 hover:border-sky-200",
                      )}
                    >
                      {audioCategory === value &&
                        audioEnabled && (
                          <Check
                            size={14}
                            className="absolute right-2 top-2"
                          />
                        )}

                      <Icon size={20} />

                      <span className="mt-2">
                        {label}
                      </span>
                    </button>
                  ),
                )}
              </div>

              <label
                className={cn(
                  "mt-4 flex items-center gap-3 text-[13px] text-ink-600",
                  !audioEnabled && "opacity-50",
                )}
                htmlFor="session-volume"
              >
                <Volume2
                  size={19}
                  className="shrink-0 text-ink-800"
                />

                <span>Volume</span>

                <input
                  id="session-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  disabled={!audioEnabled}
                  onChange={(event) =>
                    setVolume(
                      Number(event.target.value),
                    )
                  }
                  className="h-1.5 min-w-0 flex-1 accent-sky-500"
                />

                <span className="w-9 text-right">
                  {volume}%
                </span>
              </label>

              <p className="mt-3 text-[11px] text-ink-400">
                {audioEnabled
                  ? `${
                      selectedAudio?.label ??
                      "Ambient"
                    } selected for this session.`
                  : "Audio is off for this session."}
              </p>
            </section>

            {/* Camera */}
            <section
              className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6"
              aria-labelledby="camera-heading"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <Camera size={23} />
                  </span>

                  <div>
                    <h2
                      id="camera-heading"
                      className="text-[18px] font-semibold text-ink-950"
                    >
                      Camera monitoring
                    </h2>

                    <p className="mt-1 text-[14px] text-ink-600">
                      Optional · Used to help detect
                      distractions.
                    </p>
                  </div>
                </div>

                <Toggle
                  checked={cameraEnabled}
                  onChange={() =>
                    setCameraEnabled(
                      (value) => !value,
                    )
                  }
                  label="Toggle camera monitoring"
                />
              </div>

              <div
                className={cn(
                  "mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-[12px] leading-relaxed",
                  cameraEnabled
                    ? "bg-success-soft text-ink-600"
                    : "bg-sky-50 text-ink-600",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-3 w-3 shrink-0 rounded-full",
                    cameraEnabled
                      ? "bg-success"
                      : "bg-ink-400",
                  )}
                />

                <span>
                  <strong className="font-semibold text-ink-950">
                    Camera is{" "}
                    {cameraEnabled
                      ? "on"
                      : "off"}
                    .
                  </strong>

                  <br />

                  {cameraEnabled
                    ? "Monitoring is optional and no raw video is stored."
                    : "You can focus without camera monitoring."}
                </span>
              </div>
            </section>

            {/* Distraction + Rescue */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {/* Report distraction */}
              <section
                className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft"
                aria-labelledby="distraction-heading"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                    <Flag size={21} />
                  </span>

                  <div>
                    <h2
                      id="distraction-heading"
                      className="text-[17px] font-semibold text-ink-950"
                    >
                      Report distraction
                    </h2>

                    <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
                      Mark when you feel distracted during
                      this session.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDistractionReported(true)
                  }
                  disabled={distractionReported}
                  className="mt-4 w-full rounded-xl bg-warning-soft py-3 text-[14px] font-semibold text-ink-950 transition-colors hover:brightness-95 disabled:cursor-default disabled:opacity-70"
                >
                  {distractionReported
                    ? "Reported"
                    : "Report now"}
                </button>
              </section>

              {/* Rescue Mode */}
              <section
                className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft"
                aria-labelledby="rescue-heading"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eeebff] text-[#5545d9]">
                    <Shield size={21} />
                  </span>

                  <div>
                    <h2
                      id="rescue-heading"
                      className="text-[17px] font-semibold text-ink-950"
                    >
                      Rescue Mode
                    </h2>

                    <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
                      Feeling off track? Get a quick reset.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRescueStarted(true);
                    setIsPaused(true);
                  }}
                  className="mt-4 w-full rounded-xl bg-[#eeebff] py-3 text-[14px] font-semibold text-[#3023a8] transition-colors hover:bg-[#e3defe]"
                >
                  {rescueStarted
                    ? "Rescue Mode active"
                    : "Start Rescue Mode"}
                </button>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}