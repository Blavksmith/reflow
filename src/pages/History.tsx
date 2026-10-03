import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Coffee,
  Flag,
  FileText,
  LayoutList,
  Lightbulb,
  MessageSquare,
  Monitor,
  RotateCcw,
  Target,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import {
  groupSessionsByDate,
  historySessions,
  type HistoryIcon,
  type HistorySession,
  type HistoryStatus,
  type RecoveryAction,
  type TimelineSegment,
} from "../data/history";
import { cn } from "../lib/utils";

type StatusFilter = "ALL" | HistoryStatus;

const filters: { label: string; value: StatusFilter }[] = [
  { label: "All sessions", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Interrupted", value: "INTERRUPTED" },
  { label: "Abandoned", value: "ABANDONED" },
];

const sessionIcons: Record<HistoryIcon, typeof Target> = {
  target: Target,
  file: FileText,
  lightbulb: Lightbulb,
  book: BookOpen,
  monitor: Monitor,
  list: LayoutList,
};

const statusConfig: Record<
  HistoryStatus,
  { label: string; chip: string; icon: typeof CircleCheck; bar: string }
> = {
  COMPLETED: {
    label: "Completed",
    chip: "bg-success-soft text-success",
    icon: CircleCheck,
    bar: "bg-success",
  },
  INTERRUPTED: {
    label: "Interrupted",
    chip: "bg-warning-soft text-warning",
    icon: Waves,
    bar: "bg-warning",
  },
  ABANDONED: {
    label: "Abandoned",
    chip: "bg-danger-soft text-danger",
    icon: X,
    bar: "bg-danger",
  },
};

const recoveryConfig: Record<
  RecoveryAction["icon"],
  { icon: typeof Flag; className: string }
> = {
  flag: { icon: Flag, className: "bg-warning-soft text-warning" },
  rescue: { icon: RotateCcw, className: "bg-[#eeebff] text-[#7658e8]" },
  break: { icon: Coffee, className: "bg-warning-soft text-warning" },
};

function interruptionLabel(count: number) {
  return `${count} ${count === 1 ? "interruption" : "interruptions"}`;
}

export function History() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(
    historySessions[0]?.id ?? null,
  );

  const groups = useMemo(() => {
    const filtered =
      activeFilter === "ALL"
        ? historySessions
        : historySessions.filter((session) => session.status === activeFilter);
    return groupSessionsByDate(filtered);
  }, [activeFilter]);

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] overflow-hidden"
        aria-hidden="true"
      >
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 pb-12 pt-8 lg:px-10 xl:px-12">
        <header className="relative z-10 mb-8 max-w-[700px]">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">
              History
            </p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
          </div>
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">
            Your focus journey
          </h1>
          <p className="mt-4 max-w-[520px] text-[18px] leading-relaxed text-ink-600">
            Review your previous sessions and see your progress.
          </p>
        </header>

        <div
          className="relative z-10 mb-6 flex flex-col gap-3 rounded-[18px] border border-white/80 bg-white/90 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          role="toolbar"
          aria-label="Filter sessions"
        >
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;
              const Icon =
                filter.value === "ALL"
                  ? null
                  : statusConfig[filter.value].icon;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200",
                    isActive
                      ? "bg-navy-900 text-white shadow-control"
                      : "text-ink-800 hover:bg-sky-50",
                  )}
                >
                  {Icon && (
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? "text-white"
                          : filter.value === "COMPLETED"
                            ? "text-success"
                            : filter.value === "INTERRUPTED"
                              ? "text-warning"
                              : "text-danger"
                      }
                    />
                  )}
                  {filter.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-[14px] font-semibold text-ink-800 transition-colors hover:bg-sky-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200 sm:w-auto"
            aria-label="Change date range"
          >
            <span className="flex items-center gap-2">
              <Clock3 size={16} className="text-sky-500" />
              This week
            </span>
            <ChevronDown size={16} className="text-ink-600" />
          </button>
        </div>

        <div className="relative z-10 space-y-8">
          {groups.length === 0 ? (
            <div className="rounded-[18px] border border-white/80 bg-white/85 px-6 py-16 text-center text-[14px] text-ink-600 shadow-soft">
              No sessions match this filter yet.
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key} aria-label={`Sessions on ${group.dateLabel}`}>
                <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold text-ink-950">
                  {group.label}
                  <span className="h-1 w-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <span className="text-[14px] font-medium text-ink-600">
                    {group.dateLabel}
                  </span>
                </h2>
                <div className="space-y-3">
                  {group.sessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      expanded={expandedId === session.id}
                      onToggle={() => toggle(session.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SessionRow({
  session,
  expanded,
  onToggle,
}: {
  session: HistorySession;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = sessionIcons[session.icon];
  const status = statusConfig[session.status];
  const StatusIcon = status.icon;
  const completion = Math.min(
    100,
    Math.round((session.focusMinutes / session.plannedMinutes) * 100),
  );
  const panelId = `session-panel-${session.id}`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] border bg-white/90 shadow-soft transition-colors",
        expanded
          ? "border-sky-500/70 bg-sky-50/60 ring-1 ring-sky-200"
          : "border-slate-200/70",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-sky-50/60 focus-visible:outline focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-sky-200 sm:px-6"
      >
        <div className="w-16 shrink-0">
          <p className="text-[15px] font-semibold text-ink-950">
            {session.timeLabel}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-600">{session.dateLabel}</p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <Icon size={19} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink-950">
            {session.goal}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-ink-600">
            {session.description}
          </p>
        </div>

        <div className="hidden w-20 shrink-0 lg:block">
          <p className="text-[14px] font-semibold text-ink-950">
            {session.plannedMinutes} min
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
            <span
              className={cn("block h-full rounded-full", status.bar)}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <span
          className={cn(
            "hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold sm:inline-flex",
            status.chip,
          )}
        >
          <StatusIcon size={14} />
          {status.label}
        </span>

        <span className="hidden shrink-0 items-center gap-1.5 text-[13px] text-ink-600 md:inline-flex">
          <MessageSquare size={15} />
          {interruptionLabel(session.interruptionCount)}
        </span>

        <ChevronRight
          size={20}
          className={cn(
            "shrink-0 text-ink-400 transition-transform duration-200",
            expanded && "rotate-90 text-sky-500",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ExpandedSummary session={session} completion={completion} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandedSummary({
  session,
  completion,
}: {
  session: HistorySession;
  completion: number;
}) {
  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  return (
    <div className="border-t border-sky-200/70 px-5 pb-6 pt-5 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-medium text-ink-600">
          {session.dateLabel} · {session.timeLabel} – {session.endTimeLabel}
        </p>
        <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-ink-950">
          {session.goal}
        </h3>
        <p className="text-[14px] text-ink-600">{session.description}</p>
        <span
          className={cn(
            "mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold",
            status.chip,
          )}
        >
          <StatusIcon size={14} />
          {status.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          icon={Clock3}
          accent="blue"
          value={`${session.plannedMinutes}:00`}
          label="Planned duration"
        />
        <Metric
          icon={Target}
          accent="purple"
          value={`${session.focusMinutes}:00`}
          label="Focus time"
        />
        <Metric
          icon={TrendingUp}
          accent="green"
          value={`${completion}%`}
          label="Completion rate"
        />
        <Metric
          icon={Waves}
          accent="red"
          value={`${session.interruptionCount}`}
          label="Interruptions"
        />
      </div>

      <div className="mt-6">
        <h4 className="text-[15px] font-semibold text-ink-950">
          Session timeline
        </h4>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
          {session.timeline.map((segment, index) => (
            <TimelineBar key={index} segment={segment} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-600">
          <span>{session.timeLabel}</span>
          <span>{session.endTimeLabel}</span>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-[15px] font-semibold text-ink-950">
          Recovery actions
        </h4>
        {session.recoveryActions.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {session.recoveryActions.map((action, index) => {
              const config = recoveryConfig[action.icon];
              const ActionIcon = config.icon;
              return (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      config.className,
                    )}
                  >
                    <ActionIcon size={17} />
                  </span>
                  <span className="flex-1 text-[14px] font-medium text-ink-950">
                    {action.title}
                  </span>
                  <time className="text-[13px] font-medium text-ink-600">
                    {action.time}
                  </time>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-[13px] text-ink-600">
            No recovery actions were needed — a clean, focused session.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof Clock3;
  value: string;
  label: string;
  accent: "blue" | "purple" | "green" | "red";
}) {
  const accents = {
    blue: "bg-sky-100 text-sky-500",
    purple: "bg-[#eeebff] text-[#7658e8]",
    green: "bg-success-soft text-success",
    red: "bg-danger-soft text-danger",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          accents[accent],
        )}
      >
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-semibold leading-tight tracking-[-0.03em] text-ink-950">
          {value}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-600">{label}</p>
      </div>
    </div>
  );
}

function TimelineBar({ segment }: { segment: TimelineSegment }) {
  const tones = {
    focus: "bg-sky-500",
    pause: "bg-warning",
    idle: "bg-slate-300",
  };
  return (
    <span
      className={cn("block h-full", tones[segment.tone])}
      style={{ width: `${segment.portion * 100}%` }}
    />
  );
}
