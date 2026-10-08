import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Leaf,
  Lightbulb,
  Target,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthProvider";
import { getInsightsData, type InsightsData } from "../features/insights/insights.service";
import { cn } from "../lib/utils";

type DateRange = "today" | "week" | "month";
type ChartTone = "blue" | "success";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: "blue" | "success" | "warning";
};

const dateRanges: Array<{ value: DateRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const axisLabelStyle = {
  fill: "var(--theme-ink-600)",
  fontSize: 11,
  fontFamily: "Raleway, sans-serif",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "blue",
}: MetricCardProps) {
  return (
    <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            tone === "success"
              ? "bg-success-soft text-success"
              : tone === "warning"
                ? "bg-danger-soft text-danger"
                : "bg-sky-100 text-sky-500",
          )}
        >
          <Icon size={21} />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] leading-snug text-ink-600">{label}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <strong className="text-[22px] font-semibold leading-none tracking-[-0.04em] text-ink-950">
              {value}
            </strong>
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-semibold",
                tone === "warning"
                  ? "bg-danger-soft text-danger"
                  : "bg-success-soft text-success",
              )}
            >
              {detail}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChartHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink-950">
            {title}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

function BarChart({
  data,
  max,
  highlightDay,
  label,
}: {
  data: Array<{ day: string; date?: string; value: number }>;
  max: number;
  highlightDay?: string;
  label: string;
}) {
  const width = 720;
  const height = 230;
  const left = 42;
  const right = 12;
  const top = 14;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const slot = chartWidth / data.length;
  const barWidth = Math.min(42, slot * 0.52);

  return (
    <svg
      className="mt-5 h-auto w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      {[0, max / 4, max / 2, (max * 3) / 4, max].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke="var(--theme-divider)"
              strokeWidth="1"
            />
            <text x={4} y={y + 4} style={axisLabelStyle}>
              {tick}m
            </text>
          </g>
        );
      })}
      {data.map((item, index) => {
        const x = left + slot * index + (slot - barWidth) / 2;
        const barHeight = (item.value / max) * chartHeight;
        const y = top + chartHeight - barHeight;
        const highlight = item.day === highlightDay;
        return (
          <g key={item.day}>
            <title>
              {item.day}: {item.value} minutes
            </title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill={highlight ? "var(--theme-primary-hover)" : "var(--theme-sky-500)"}
              opacity={highlight ? 1 : 0.78}
            />
            <text
              x={x + barWidth / 2}
              y={height - 25}
              textAnchor="middle"
              style={axisLabelStyle}
            >
              {item.day}
            </text>
            {item.date && (
              <text
                x={x + barWidth / 2}
                y={height - 11}
                textAnchor="middle"
                style={{ ...axisLabelStyle, fontSize: 10 }}
              >
                {item.date.replace("Sep ", "")}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({
  values,
  max,
  tone,
  label,
  labels,
}: {
  values: number[];
  max: number;
  tone: ChartTone;
  label: string;
  labels?: string[];
}) {
  const width = 720;
  const height = 220;
  const left = 34;
  const right = 12;
  const top = 18;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const denominator = Math.max(1, values.length - 1);
  const points = values.map((value, index) => {
    const x = left + (chartWidth / denominator) * index;
    const y = top + chartHeight - (value / max) * chartHeight;
    return { x, y, value };
  });
  const pointLabels = labels ?? chartLabels;
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${path} L ${points.at(-1)?.x ?? width - right} ${top + chartHeight} L ${left} ${top + chartHeight} Z`;
  const stroke = tone === "success" ? "var(--theme-success)" : "var(--theme-primary-hover)";
  const gradientId = tone === "success" ? "recovery-area" : "interruptions-area";

  return (
    <svg
      className="mt-5 h-auto w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      {[0, max / 2, max].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke="var(--theme-divider)"
              strokeWidth="1"
            />
            <text x={4} y={y + 4} style={axisLabelStyle}>
              {tick}
            </text>
          </g>
        );
      })}
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth="3" />
      {points.map((point, index) => (
        <g key={`${pointLabels[index]}-${point.value}`}>
          <title>
            {pointLabels[index]}: {point.value}
          </title>
          <circle cx={point.x} cy={point.y} r="4.5" fill={stroke} />
          <text
            x={point.x}
            y={height - 12}
            textAnchor="middle"
            style={axisLabelStyle}
          >
            {pointLabels[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CompletionChart({
  completionRate,
  completedSessions,
  otherSessions,
}: {
  completionRate: number | null;
  completedSessions: number;
  otherSessions: number;
}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const percentage = completionRate ?? 0;
  const completed = circumference * (percentage / 100);

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${percentage}% completion rate`}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--theme-sky-200)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--theme-primary-hover)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${completed} ${circumference - completed}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <strong className="text-[24px] font-semibold tracking-[-0.04em] text-ink-950">{completionRate === null ? "—" : `${percentage}%`}</strong>
          <span className="text-[11px] text-ink-600">Completed</span>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-2 gap-3 text-[12px] text-ink-600">
        <div className="flex items-start gap-2">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
          <span>
            <strong className="block text-[13px] text-ink-950">Completed sessions</strong>
            {completedSessions} sessions
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-200" />
          <span>
            <strong className="block text-[13px] text-ink-950">Not completed</strong>
            {otherSessions} sessions
          </span>
        </div>
      </div>
    </div>
  );
}

function Insights() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [chartView, setChartView] = useState("daily");
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [error, setError] = useState<string | null>(null);
  const selectedRangeLabel =
    dateRanges.find((range) => range.value === dateRange)?.label ?? "This week";

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    queueMicrotask(() => setLoading(true));
    void getInsightsData(user.id, dateRange).then((result) => {
      if (!active) return;
      setInsightsData(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [dateRange, user?.id]);

  const data = insightsData;
  const focusTrendData = data?.focusTrend.length ? data.focusTrend : [{ day: "—", value: 0 }];
  const durationData = data?.durationTrend.length ? data.durationTrend : [{ day: "—", value: 0 }];
  const interruptionData = data?.interruptionTrend.length ? data.interruptionTrend : [0];
  const recoveryData = data?.recoveryTrend.length ? data.recoveryTrend : [0];
  const focusMax = Math.max(1, ...focusTrendData.map((point) => point.value));
  const durationMax = Math.max(1, ...durationData.map((point) => point.value));
  const interruptionsMax = Math.max(1, ...interruptionData);
  const recoveryMax = Math.max(1, ...recoveryData);

  return (
    <div className="relative isolate min-h-[calc(100vh-92px)] overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pb-12 pt-8 lg:px-10 xl:px-12">
        <header className="relative z-10 mb-8 max-w-[950px]">
          <div className="mb-4 flex items-center gap-3">
            <p className="font-inter text-[13px] font-bold uppercase tracking-[0.1em] text-sky-500">Insights</p>
            <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
          </div>
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.05em] text-ink-950 sm:text-[56px]">See your progress</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-600">Understand your focus patterns and build better habits.</p>
          {(loading || error) && <p className={error ? "mt-2 text-[12px] text-danger" : "mt-2 text-[12px] text-ink-600"} role={error ? "alert" : "status"}>{error ?? "Loading your focus insights…"}</p>}
        </header>

        <div
          className="relative z-10 mb-6 flex flex-col gap-3 rounded-[18px] border border-white/80 bg-white/90 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          role="toolbar"
          aria-label="Filter insights"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed="true"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-[14px] font-semibold text-white shadow-control transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-200"
            >
              Overview
            </button>
          </div>
          <label className="relative inline-flex self-end items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-[14px] font-semibold text-ink-800 transition-colors hover:bg-sky-50 focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-sky-200 sm:self-auto">
            <span className="flex items-center gap-2">
              <Clock3 size={16} className="text-sky-500" aria-hidden="true" />
              {selectedRangeLabel}
            </span>
            <ChevronDown size={16} className="text-ink-600" aria-hidden="true" />
            <span className="sr-only">Insight date range</span>
            <select
              id="insights-range"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as DateRange)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Clock3} label="Average Focus Duration" value={data?.averageDurationMinutes == null ? "—" : `${data.averageDurationMinutes} min`} detail="Recorded sessions" />
          <MetricCard icon={Target} label="Completion Rate" value={data?.completionRate == null ? "—" : `${data.completionRate}%`} detail="Recorded sessions" tone="success" />
          <MetricCard icon={Zap} label="Interruptions" value={data?.interruptionsPerSession == null ? "—" : String(data.interruptionsPerSession)} detail="Per session" tone="warning" />
          <MetricCard icon={Leaf} label="Recovery Time" value={data?.recoveryMinutes == null ? "—" : `${data.recoveryMinutes} min`} detail="Completed recovery" tone="success" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6 xl:col-span-6" aria-label="Focus trends">
            <ChartHeader icon={BarChart3} title="Focus trends" description="Your focus duration over the selected period." action={<label className="relative shrink-0" htmlFor="focus-chart-view"><span className="sr-only">Focus trend grouping</span><select id="focus-chart-view" value={chartView} onChange={(event) => setChartView(event.target.value)} className="h-9 appearance-none rounded-lg border border-slate-200/80 bg-white px-3 pr-8 text-[12px] font-semibold text-ink-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"><option value="daily">Daily</option><option value="weekly">Weekly</option></select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-600" /></label>} />
            <BarChart data={focusTrendData} max={focusMax} highlightDay={data?.bestDay ?? undefined} label="Focus duration from recorded sessions." />
          </section>

          <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6 xl:col-span-3" aria-label="Completion Rate">
            <ChartHeader icon={CheckCircle2} title="Completion Rate" description="Percentage of focus sessions completed." />
            <CompletionChart completionRate={data?.completionRate ?? null} completedSessions={data?.completedSessions ?? 0} otherSessions={data?.otherSessions ?? 0} />
          </section>

          <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6 xl:col-span-3" aria-label="Average Duration">
            <ChartHeader icon={Clock3} title="Average Duration" description="Your average focus session length." />
            <BarChart data={durationData} max={durationMax} highlightDay={data?.bestDay ?? undefined} label="Average focus duration from recorded sessions." />
            <p className="mt-2 text-center text-[11px] text-ink-600">Best day: <strong className="text-ink-950">{data?.bestDay ?? "—"}</strong></p>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6 xl:col-span-5" aria-label="Interruptions">
            <ChartHeader icon={TriangleAlert} title="Interruptions" description="How often your focus is interrupted." />
            <LineChart values={interruptionData} max={interruptionsMax} tone="blue" label="Interruptions from recorded sessions." />
            <p className="mt-1 text-center text-[12px] text-ink-600">Recorded interruption patterns for the selected period.</p>
          </section>

          <section className="rounded-[18px] border border-slate-200/70 bg-white/90 p-5 shadow-soft sm:p-6 xl:col-span-4" aria-label="Recovery patterns">
            <ChartHeader icon={Leaf} title="Recovery patterns" description="How long it takes to recover after an interruption." />
            <LineChart values={recoveryData} max={recoveryMax} tone="success" label="Recovery time from recorded recovery actions." />
            <p className="mt-1 text-center text-[12px] text-ink-600">Average recovery: <strong className="text-ink-950">{data?.recoveryMinutes == null ? "—" : `${data.recoveryMinutes} minutes`}</strong></p>
          </section>

          <section className="relative isolate overflow-hidden rounded-[18px] border border-sky-200/70 bg-focus-card-blue p-5 shadow-soft sm:p-6 xl:col-span-3" aria-labelledby="personal-insight-heading">
            <div className="relative z-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-sky-500"><Lightbulb size={19} /></span>
              <h2 id="personal-insight-heading" className="mt-4 text-[18px] font-semibold tracking-[-0.025em] text-ink-950">Insight for you</h2>
              <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-600">{data?.insight ?? "Complete a few focus sessions to reveal a personal pattern."}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export { Insights };
