import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  CupSoda,
  Leaf,
  Move,
  RotateCcw,
  Sun,
} from "lucide-react";
import { cn } from "../lib/utils";

type RescueActivity = "choices" | "break" | "hydrate" | "stretch" | "environment";

type RescueModeProps = {
  isOpen: boolean;
  onResume: () => void;
  onSnooze: () => void;
  onEnd: () => void;
};

const suggestions = [
  {
    id: "break" as const,
    title: "Take a short break",
    description: "Step away for a few minutes and clear your mind.",
    icon: Leaf,
  },
  {
    id: "hydrate" as const,
    title: "Hydrate",
    description: "Drink some water to refresh yourself.",
    icon: CupSoda,
  },
  {
    id: "stretch" as const,
    title: "Quick stretch",
    description: "A short stretch can boost your energy.",
    icon: Move,
  },
  {
    id: "environment" as const,
    title: "Change environment",
    description: "Try a different seat or tidy your workspace.",
    icon: Sun,
  },
];

const breathingPhases = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 2 },
  { label: "Exhale", duration: 4 },
] as const;

function BreathingReset({ elapsed }: { elapsed: number }) {
  const cycleLength = breathingPhases.reduce(
    (total, phase) => total + phase.duration,
    0,
  );
  const position = elapsed % cycleLength;
  let phaseIndex = 0;
  let phaseStart = 0;

  for (let index = 0; index < breathingPhases.length; index += 1) {
    const phaseEnd = phaseStart + breathingPhases[index].duration;
    if (position < phaseEnd) {
      phaseIndex = index;
      break;
    }
    phaseStart = phaseEnd;
  }

  const phase = breathingPhases[phaseIndex];
  const seconds = phase.duration - (position - phaseStart);
  const progress = (position - phaseStart + 1) / phase.duration;

  return (
    <div className="mt-7 flex flex-col items-center text-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 120 120"
          role="img"
          aria-label={`${phase.label} for ${seconds} seconds`}
        >
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="var(--theme-sky-200)"
            strokeWidth="5"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="var(--theme-primary-hover)"
            strokeLinecap="round"
            strokeWidth="5"
            strokeDasharray={`${progress * 283} 283`}
          />
        </svg>
        <div className="rescue-breathing-circle flex h-32 w-32 flex-col items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <span className="font-inter text-[11px] font-bold uppercase tracking-[0.12em]">
            {phase.label}
          </span>
          <strong className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.05em] text-ink-950">
            {seconds}s
          </strong>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2" aria-hidden="true">
        {breathingPhases.map((item, index) => (
          <span
            key={item.label}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === phaseIndex ? "w-7 bg-sky-500" : "w-1.5 bg-sky-200",
            )}
          />
        ))}
      </div>
      <p className="mt-5 max-w-[360px] text-[14px] leading-relaxed text-ink-600">
        A short breathing exercise can help you feel calmer and refocus.
      </p>
    </div>
  );
}

function ActivityView({
  activity,
  breakSeconds,
  stretchSeconds,
  checklist,
  onChecklistChange,
  onBack,
  onComplete,
}: {
  activity: Exclude<RescueActivity, "choices">;
  breakSeconds: number;
  stretchSeconds: number;
  checklist: Record<string, boolean>;
  onChecklistChange: (item: string) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const activityConfig = {
    break: {
      icon: Leaf,
      title: "Take a short break",
      description: "Step away for a few minutes and give your mind some space.",
    },
    hydrate: {
      icon: CupSoda,
      title: "Take a moment to hydrate",
      description: "A little water can help you feel refreshed before you return.",
    },
    stretch: {
      icon: Move,
      title: "Try a quick stretch",
      description: "Move gently and let your shoulders relax.",
    },
    environment: {
      icon: Sun,
      title: "Reset your environment",
      description: "Make one small change that helps your next few minutes feel easier.",
    },
  } as const;
  const config = activityConfig[activity];
  const Icon = config.icon;

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[12px] font-semibold text-ink-600 transition-colors hover:bg-sky-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
      >
        <ArrowLeft size={15} />
        Back to suggestions
      </button>
      <div className="mt-5 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <Icon size={23} />
        </span>
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-ink-950">
            {config.title}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
            {config.description}
          </p>
        </div>
      </div>

      {activity === "break" && (
        <div className="mt-8 rounded-[18px] bg-sky-50 p-6 text-center">
          <Clock3 size={25} className="mx-auto text-sky-500" />
          <strong className="mt-3 block text-[42px] font-semibold tracking-[-0.05em] text-ink-950">
            {Math.floor(breakSeconds / 60).toString().padStart(2, "0")}:
            {(breakSeconds % 60).toString().padStart(2, "0")}
          </strong>
          <p className="mt-2 text-[13px] text-ink-600">
            You can return whenever you feel ready.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 rounded-xl border border-sky-200 bg-white px-4 py-3 text-[13px] font-semibold text-sky-500 transition-colors hover:bg-sky-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            Resume early
          </button>
        </div>
      )}

      {activity === "hydrate" && (
        <div className="mt-8 rounded-[18px] bg-sky-50 p-6 text-center">
          <CupSoda size={30} className="mx-auto text-sky-500" />
          <p className="mx-auto mt-4 max-w-[320px] text-[16px] leading-relaxed text-ink-950">
            Take a sip of water, then give yourself a moment before returning to your session.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 rounded-xl bg-navy-900 px-5 py-3 text-[14px] font-semibold text-white shadow-control transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            Done
          </button>
        </div>
      )}

      {activity === "stretch" && (
        <div className="mt-8 rounded-[18px] bg-sky-50 p-6 text-center">
          <Move size={30} className="mx-auto text-sky-500" />
          <p className="mt-4 text-[16px] text-ink-950">
            Roll your shoulders gently and take a slow breath.
          </p>
          <strong className="mt-4 block text-[30px] font-semibold tracking-[-0.04em] text-ink-950">
            {stretchSeconds}s
          </strong>
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 rounded-xl bg-navy-900 px-5 py-3 text-[14px] font-semibold text-white shadow-control transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            Done
          </button>
        </div>
      )}

      {activity === "environment" && (
        <div className="mt-8 rounded-[18px] bg-sky-50 p-5">
          <p className="text-[14px] leading-relaxed text-ink-600">
            A small reset can make it easier to return with a clear mind.
          </p>
          <div className="mt-4 space-y-2">
            {[
              "Adjust your seating",
              "Remove unnecessary distractions",
              "Put your phone away",
              "Get comfortable",
            ].map((item) => (
              <button
                key={item}
                type="button"
                role="checkbox"
                aria-checked={Boolean(checklist[item])}
                onClick={() => onChecklistChange(item)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-3 text-left text-[13px] text-ink-800 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    checklist[item]
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-200 text-transparent",
                  )}
                >
                  <Check size={14} />
                </span>
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 w-full rounded-xl bg-navy-900 px-5 py-3 text-[14px] font-semibold text-white shadow-control transition-colors hover:bg-sky-500 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
          >
            I&apos;m ready
          </button>
        </div>
      )}
    </div>
  );
}

function RescueMode({ isOpen, onResume, onSnooze, onEnd }: RescueModeProps) {
  const [activity, setActivity] = useState<RescueActivity>("choices");
  const [breathElapsed, setBreathElapsed] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(300);
  const [stretchSeconds, setStretchSeconds] = useState(30);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const resumeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resumeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activity !== "choices") {
      return;
    }

    const timer = window.setInterval(() => {
      setBreathElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activity, isOpen]);

  useEffect(() => {
    if (!isOpen || activity !== "break" || breakSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setBreakSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activity, breakSeconds, isOpen]);

  useEffect(() => {
    if (!isOpen || activity !== "stretch" || stretchSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setStretchSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activity, isOpen, stretchSeconds]);

  if (!isOpen) {
    return null;
  }

  function selectActivity(nextActivity: Exclude<RescueActivity, "choices">) {
    setActivity(nextActivity);
    if (nextActivity === "break") {
      setBreakSeconds(300);
    }
    if (nextActivity === "stretch") {
      setStretchSeconds(30);
    }
  }

  function completeActivity() {
    setActivity("choices");
    setBreathElapsed(0);
  }

  function toggleChecklistItem(item: string) {
    setChecklist((current) => ({ ...current, [item]: !current[item] }));
  }

  return (
    <div className="rescue-backdrop fixed inset-x-0 bottom-0 top-[92px] z-40 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="rescue-panel relative my-auto flex max-h-[calc(100vh-124px)] w-full max-w-[1080px] flex-col overflow-y-auto rounded-[24px] border border-slate-200/70 bg-white/90 shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rescue-mode-title"
      >
        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[1.1fr_.9fr]">
          <main className="p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
              <p className="font-inter text-[11px] font-bold uppercase tracking-[0.14em] text-sky-500">
                Rescue mode
              </p>
            </div>

            {activity === "choices" ? (
              <>
                <h1
                  id="rescue-mode-title"
                  className="mt-4 max-w-[520px] text-[32px] font-semibold leading-tight tracking-[-0.04em] text-ink-950 sm:text-[38px]"
                >
                  Looks like your focus just slipped.
                </h1>
                <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-ink-600">
                  It&apos;s okay. Distractions happen. Let&apos;s take a moment to reset and get back on track.
                </p>
                <BreathingReset elapsed={breathElapsed} />
              </>
            ) : (
              <>
                <h1
                  id="rescue-mode-title"
                  className="mt-4 max-w-[520px] text-[32px] font-semibold leading-tight tracking-[-0.04em] text-ink-950 sm:text-[38px]"
                >
                  A small reset is enough.
                </h1>
                <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-ink-600">
                  Take the time you need. You can return to your session when you&apos;re ready.
                </p>
                <ActivityView
                  activity={activity}
                  breakSeconds={breakSeconds}
                  stretchSeconds={stretchSeconds}
                  checklist={checklist}
                  onChecklistChange={toggleChecklistItem}
                  onBack={() => setActivity("choices")}
                  onComplete={completeActivity}
                />
              </>
            )}
          </main>

          <aside className="border-t border-slate-200/70 bg-sky-50/70 p-6 sm:p-8 md:border-l md:border-t-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink-950">
                  Recovery suggestions
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
                  Try one of these to get back on track.
                </p>
              </div>
              <RotateCcw size={19} className="shrink-0 text-sky-500" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-3">
              {suggestions.map(({ id, title, description, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectActivity(id)}
                  aria-pressed={activity === id}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-[18px] border bg-white/80 p-3 text-left transition-colors hover:border-sky-200 hover:bg-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                    activity === id ? "border-sky-500 bg-white" : "border-slate-200/70",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[13px] font-semibold text-ink-950">{title}</strong>
                    <span className="mt-1 block text-[11px] leading-relaxed text-ink-600">{description}</span>
                  </span>
                  <ChevronRight size={17} className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200/70 bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            ref={resumeButtonRef}
            type="button"
            onClick={onResume}
            className="order-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary-cta-gradient px-5 py-3 text-[14px] font-semibold text-white shadow-control transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200 sm:order-3"
          >
            I&apos;m ready to focus again
          </button>
          <div className="order-2 flex flex-col gap-2 sm:order-1 sm:flex-row">
            <button
              type="button"
              onClick={onSnooze}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-[13px] font-semibold text-ink-800 transition-colors hover:bg-sky-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              Remind me in 5 minutes
            </button>
            <button
              type="button"
              onClick={onEnd}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[13px] font-semibold text-danger transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              I&apos;ll stop this session
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export { RescueMode };
