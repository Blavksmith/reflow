import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CircleCheck,
  Clock3,
  Coffee,
  Edit3,
  Flag,
  Heart,
  Lightbulb,
  Play,
  RotateCcw,
  Target,
  Waves,
} from "lucide-react";
import { ReflowCharacter } from "../components/ReflowCharacter";
import { useAuth } from "../features/auth/AuthProvider";
import {
  getFocusSessionDetails,
  saveSessionFeedback,
  type RecoveryActionRow,
  type SessionFeedbackRow,
} from "../features/focus-session/focus-session.service";

export type SummaryState = {
  sessionId: string;
  status: string;
  goal: string;
  duration: number;
  actualSeconds: number;
  interruptionCount: number;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatActionTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function recoveryTitle(action: RecoveryActionRow) {
  return action.action_type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SessionSummary() {
  const location = useLocation();
  const { user } = useAuth();
  const routeState = location.state as Partial<SummaryState> | null;
  const [summary, setSummary] = useState<SummaryState | null>(
    routeState?.sessionId && routeState.goal
      ? (routeState as SummaryState)
      : null,
  );
  const [recoveryActions, setRecoveryActions] = useState<RecoveryActionRow[]>([]);
  const [feedback, setFeedback] = useState<SessionFeedbackRow | null>(null);
  const [reflection, setReflection] = useState("");
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(routeState?.sessionId && user?.id));
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = routeState?.sessionId;

  useEffect(() => {
    if (!user?.id || !sessionId) {
      return;
    }

    let active = true;
    void (async () => {
      const result = await getFocusSessionDetails(user.id, sessionId);
      if (!active) return;
      if (result.data) {
        const row = result.data.session;
        setSummary({
          sessionId: row.id,
          status: row.status,
          goal: row.goal,
          duration: row.planned_duration_minutes,
          actualSeconds: Math.max(0, row.actual_duration_seconds ?? 0),
          interruptionCount: Math.max(0, row.interruption_count ?? 0),
        });
        setRecoveryActions(result.data.recoveryActions);
        setFeedback(result.data.feedback);
        setReflection(result.data.feedback?.reflection ?? "");
      }
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [sessionId, user?.id]);

  async function saveReflection() {
    if (!user?.id || !summary?.sessionId || !reflection.trim()) return;
    setSavingFeedback(true);
    const result = await saveSessionFeedback(
      user.id,
      summary.sessionId,
      reflection.trim(),
    );
    setFeedback(result.data);
    setError(result.error);
    setSavingFeedback(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-92px)] items-center justify-center text-sm text-ink-600" role="status">
        Loading your session summary…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[calc(100vh-92px)] items-center justify-center px-6 text-sm text-danger" role="alert">
        {error ?? "This session summary is unavailable."}
      </div>
    );
  }

  const plannedSeconds = summary.duration * 60;
  const completion = Math.min(
    100,
    Math.round((summary.actualSeconds / plannedSeconds) * 100),
  );

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/assets/mountain-duo.png"
          alt=""
          className="absolute -right-10 top-8 w-[70%] max-w-[900px] opacity-70"
        />
        <div className="absolute right-[13%] top-0 hidden md:block">
          <img
            src="/assets/character2.png"
            alt=""
            className="h-[260px] w-[330px] object-contain object-bottom xl:h-[315px] xl:w-[400px]"
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 pb-10 pt-8 lg:px-10 xl:px-12">
        <header className="relative z-10 min-h-[250px] max-w-[700px] pt-2">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">
              Session summary
            </p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
            <div className="flex items-center gap-1.5" aria-label="Step 3 of 3">
              {[0, 1, 2].map((step) => (
                <span
                  key={step}
                  className="h-1.5 w-1.5 rounded-full bg-sky-500"
                />
              ))}
            </div>
          </div>
          <h1 className="max-w-[650px] text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">
            Great job, you stayed focused!
          </h1>
          <p className="mt-4 max-w-[520px] text-[18px] leading-relaxed text-ink-600">
            {summary.status === "completed"
              ? "You completed your focus session. Every small step counts."
              : "Your session ended early. Every intentional step still counts."}
          </p>
        </header>

        <section
          className="relative z-10 -mt-1 rounded-[24px] border border-white/80 bg-white/90 px-5 py-5 shadow-soft sm:px-7"
          aria-label="Session results"
        >
          <div className="grid grid-cols-1 divide-y divide-slate-200/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-[.9fr_1.45fr_1fr_.8fr]">
            <SummaryMetric
              icon={Clock3}
              label="Focus duration"
              value={`${summary.duration}:00`}
              detail="minutes"
            />
            <SummaryMetric
              icon={Target}
              label="Goal"
              value={summary.goal}
              detail=""
              className="sm:pl-6"
            />
            <SummaryMetric
              icon={CircleCheck}
              label="Completion"
              value={`${completion}%`}
              detail={`${formatDuration(summary.actualSeconds)} / ${formatDuration(plannedSeconds)}`}
              className="xl:pl-6"
              accent="purple"
            />
            <SummaryMetric
              icon={Waves}
              label="Interruptions"
              value={`${summary.interruptionCount}`}
              detail="times"
              className="sm:pl-6"
              accent="red"
            />
          </div>
        </section>

        <section
          className="mt-5 grid grid-cols-1 gap-8 rounded-[20px] border border-white/80 bg-white/85 p-6 shadow-soft lg:grid-cols-[1fr_1fr] lg:p-8"
          aria-label="Recovery actions and feedback"
        >
          <div className="lg:border-r lg:border-slate-200/80 lg:pr-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                <Heart size={23} />
              </span>
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-ink-950">
                  Recovery actions
                </h2>
                <p className="mt-1 text-[14px] text-ink-600">
                  Here&apos;s how you got back on track.
                </p>
              </div>
            </div>
            <div className="relative mt-6 space-y-5 pl-1">
              {recoveryActions.length > 0 ? (
                recoveryActions.map((action) => (
                  <RecoveryItem
                    key={action.id}
                    time={formatActionTime(action.started_at)}
                    title={recoveryTitle(action)}
                    detail={`Status: ${action.status}`}
                    icon={action.action_type === "short_break" ? Coffee : RotateCcw}
                    color={action.action_type === "short_break" ? "warning" : "purple"}
                  />
                ))
              ) : (
                <p className="rounded-xl bg-sky-50 px-4 py-4 text-[13px] text-ink-600">
                  No recovery actions recorded for this session.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:pl-1">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                <Edit3 size={22} />
              </span>
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-ink-950">
                  Session feedback
                </h2>
                <p className="mt-1 text-[14px] text-ink-600">
                  Here&apos;s a quick reflection based on your session.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-focus-card-blue p-5">
              <ReflowCharacter
                size="small"
                variant="card"
                className="h-16 w-16 shrink-0"
              />
              <p className="text-[14px] leading-relaxed text-ink-600">
                You made good progress on{" "}
                <strong className="font-semibold text-ink-950">
                  {summary.goal.toLowerCase()}
                </strong>{" "}
                and managed to get back on track after a few interruptions. Keep
                it up!
              </p>
            </div>
            {reflectionOpen || feedback ? (
              <>
                <textarea
                  autoFocus={reflectionOpen}
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  onBlur={() => void saveReflection()}
                  placeholder="What helped you focus today?"
                  className="mt-4 min-h-20 w-full resize-none rounded-xl border border-sky-200 bg-white px-4 py-3 text-[14px] text-ink-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  aria-label="Your reflection"
                />
                {(savingFeedback || error) && (
                  <p className={error ? "mt-2 text-[12px] text-danger" : "mt-2 text-[12px] text-ink-600"} role={error ? "alert" : "status"}>
                    {error ?? "Saving your reflection…"}
                  </p>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setReflectionOpen(true)}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-sky-200 bg-white px-4 py-3 text-left text-[14px] font-medium text-ink-800 transition-colors hover:bg-sky-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                <span className="flex items-center gap-3">
                  <Edit3 size={17} className="text-sky-500" />
                  Add your own reflection (optional)
                </span>
                <ArrowRight size={18} className="text-ink-600" />
              </button>
            )}
          </div>
        </section>

        <section
          className="relative mt-5 overflow-hidden rounded-[20px] border border-success-soft bg-success-soft/80 p-6 shadow-soft sm:p-7"
          aria-labelledby="next-suggestion-heading"
        >
          <div
            className="pointer-events-none absolute -bottom-10 right-0 h-36 w-48 rounded-full bg-white/30"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d2f3e2] text-success">
                <Lightbulb size={23} />
              </span>
              <div>
                <h2
                  id="next-suggestion-heading"
                  className="text-[20px] font-semibold tracking-[-0.03em] text-ink-950"
                >
                  Next suggestion
                </h2>
                <p className="mt-1 max-w-[250px] text-[14px] leading-relaxed text-ink-600">
                  Based on your session, here&apos;s what we suggest.
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:ml-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Target size={20} />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink-950">
                    Keep going with the same goal
                  </h3>
                  <p className="mt-1 text-[13px] text-ink-600">
                    You&apos;re making great progress. Continue in the next
                    session to finish it!
                  </p>
                </div>
              </div>
              <Link
                to="/session/setup"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-primary-cta-gradient px-5 py-3 text-[14px] font-semibold text-white shadow-control transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
              >
                {" "}
                <Play size={17} fill="currentColor" />
                Start new session
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  detail,
  className = "",
  accent = "blue",
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  detail: string;
  className?: string;
  accent?: "blue" | "purple" | "red";
}) {
  const accents = {
    blue: "bg-sky-100 text-sky-500",
    purple: "bg-[#eeebff] text-[#7658e8]",
    red: "bg-danger-soft text-danger",
  };
  return (
    <div className={`flex min-w-0 items-center gap-4 py-3 ${className}`}>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${accents[accent]}`}
      >
        <Icon size={23} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-ink-600">{label}</p>
        <p className="mt-1 whitespace-normal break-words text-[24px] font-semibold leading-tight tracking-[-0.04em] text-ink-950">
          {value}
        </p>
        {detail && <p className="mt-1 text-[13px] text-ink-600">{detail}</p>}
      </div>
    </div>
  );
}

function RecoveryItem({
  time,
  title,
  detail,
  icon: Icon,
  color,
}: {
  time: string;
  title: string;
  detail: string;
  icon: typeof Flag;
  color: "warning" | "purple";
}) {
  return (
    <div className="relative z-10 grid grid-cols-[58px_42px_1fr] items-center gap-3">
      <time className="text-[13px] font-medium text-ink-600">{time}</time>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${color === "warning" ? "bg-warning-soft text-warning" : "bg-[#eeebff] text-[#7658e8]"}`}
      >
        <Icon size={20} />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-ink-950">{title}</p>
        <p className="mt-0.5 text-[13px] text-ink-600">{detail}</p>
      </div>
    </div>
  );
}
