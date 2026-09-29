import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  MoreHorizontal,
  Play,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  adaptiveRecommendation,
  overviewMetrics,
  recentSessions,
} from "../data/dashboard";
import type { RecentSession } from "../types/dashboard";
import { ReflowCharacter } from "../components/ReflowCharacter";

function SessionStatus({ status }: Pick<RecentSession, "status">) {
  const completed = status === "COMPLETED";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${completed ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}
    >
      {completed ? "Completed" : "Ended early"}
    </span>
  );
}

const sessionIcons = [FileText, FileText, Clock3];

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1320px] px-6 pb-12 pt-9 lg:px-10 xl:px-12">
      <header className="mb-6 flex items-start justify-between gap-8">
        <div>
          <p className="mb-3 text-[14px] font-semibold text-ink-600">
            Tuesday, September 21, 2026
          </p>
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.05em] text-ink-950 sm:text-[44px]">
            Welcome back, Maya!
          </h1>
          <p className="mt-2 text-[17px] text-ink-600">
            A focused day is a collection of small, intentional moments.
          </p>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="rounded-2xl bg-white px-6 py-5 text-[14px] leading-relaxed text-ink-600 shadow-soft">
            Small steps
            <br />
            lead to a calmer, brighter you.
          </div>
          <ReflowCharacter size="large" variant="hero" className="h-32 w-32" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.95fr)]">
        <section
          className="relative min-h-[323px] overflow-hidden rounded-2xl bg-[#dfeefe] px-8 py-7 shadow-soft sm:px-9"
          aria-labelledby="focus-heading"
        >
          <div className="relative z-10 max-w-[535px]">
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-sky-500">
              Ready to focus?
            </p>
            <h2
              id="focus-heading"
              className="text-[34px] font-semibold leading-[1.12] tracking-[-0.045em] text-ink-950"
            >
              Start a focus session
            </h2>
            <p className="mt-3 max-w-[420px] text-[17px] leading-relaxed text-ink-600">
              Give your attention to what matters most.
              <br className="hidden sm:block" /> A calmer, more productive you
              is just one session away.
            </p>
            <Link
              to="/session/setup"
              className="mt-6 inline-flex items-center gap-4 rounded-2xl bg-sky-500 px-6 py-4 text-[16px] font-semibold text-white shadow-control transition-transform hover:-translate-y-0.5 hover:bg-[#216fc9]"
            >
              <Play size={20} fill="currentColor" />
              Start Focus Session <ArrowRight size={19} />
            </Link>
            <div className="mt-7 flex items-center gap-5 text-[13px] text-ink-600">
              <span className="flex items-center gap-2">
                <Clock3 size={20} className="text-ink-800" />
                <span>
                  Recommended for you
                  <br />
                  <strong className="text-[16px] text-ink-950">
                    {adaptiveRecommendation.recommendedDurationMinutes} minutes
                  </strong>
                </span>
              </span>
              <span className="h-8 w-px bg-[#c5daef]" />
              <span className="flex items-center gap-2">
                <BarChart3 size={20} className="text-sky-500" />
                <span>
                  Based on your recent
                  <br />
                  session performance
                </span>
              </span>
            </div>
          </div>
          <img
            src="/assets/focus-horizon.png"
            alt="Soft blue horizon"
            className="absolute -bottom-10 -right-[5%] w-[115%] max-w-none opacity-90"
          />
        </section>

        <div className="flex flex-col gap-5">
          <section
            className="rounded-2xl bg-white px-5 py-5 shadow-soft"
            aria-labelledby="overview-heading"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="overview-heading"
                className="text-[18px] font-semibold text-ink-950"
              >
                Today's Focus Overview
              </h2>
              <button
                type="button"
                aria-label="More overview options"
                className="rounded-lg p-1 text-ink-800 hover:bg-sky-50"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {overviewMetrics.map((metric, index) => {
                const Icon =
                  index === 0 ? Clock3 : index === 1 ? Check : TriangleAlert;
                const value = index === 0 ? "2h 45m" : index === 1 ? "4" : "2";
                const label =
                  index === 0
                    ? "Total Focus Time"
                    : index === 1
                      ? "Completed Sessions"
                      : "Interruptions";
                const change =
                  index === 2 ? "↓ 20%" : index === 1 ? "↑ 33%" : "↑ 12%";
                return (
                  <div
                    key={metric.label}
                    className="flex min-w-0 items-start gap-2 px-3 first:pl-1"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-sky-100 text-sky-500" : index === 1 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[19px] font-bold leading-none tracking-[-0.035em] text-ink-950">
                        {value}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[10px] leading-tight text-ink-600">
                        {label}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${index === 2 ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}
                      >
                        {change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section
            className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-soft"
            aria-labelledby="adaptive-heading"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-500">
              <Sparkles size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="adaptive-heading"
                className="text-[14px] font-bold text-ink-950"
              >
                Adaptive Recommendation
              </h2>
              <p className="mt-1 text-[14px] font-semibold text-ink-950">
                A 25-minute session is a good fit today.
              </p>
              <p className="mt-1 line-clamp-2 text-[13px] text-ink-600">
                You’ve been completing most of your sessions this week. Keep the
                momentum going!
              </p>
            </div>
            <button
              type="button"
              aria-label="Open adaptive recommendation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-ink-800 hover:bg-sky-100"
            >
              <ChevronRight size={20} />
            </button>
          </section>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,.95fr)]">
        <section
          className="overflow-hidden rounded-2xl bg-white shadow-soft"
          aria-labelledby="recent-heading"
        >
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h2
              id="recent-heading"
              className="text-[18px] font-semibold text-ink-950"
            >
              Recent Sessions
            </h2>
            <button
              type="button"
              className="text-[14px] font-semibold text-sky-500 hover:text-sky-500"
            >
              View all
            </button>
          </div>
          {recentSessions.length > 0 ? (
            recentSessions.map((session, index) => {
              const Icon = sessionIcons[index % sessionIcons.length];
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 border-t border-slate-100 px-6 py-3.5 transition-colors hover:bg-sky-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-ink-950">
                      {session.goal}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-600">
                      {session.dateLabel}, {session.timeLabel}
                    </p>
                  </div>
                  <span className="hidden w-12 text-[14px] text-ink-800 sm:block">
                    {session.duration}
                  </span>
                  <SessionStatus status={session.status} />
                  <button
                    type="button"
                    aria-label={`More options for ${session.goal}`}
                    className="rounded-lg p-2 text-ink-400 hover:bg-sky-50 hover:text-ink-800"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-sm text-ink-600">
              Your completed sessions will appear here.
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-5">
          <section
            aria-labelledby="actions-heading"
            className="rounded-2xl bg-white p-5 shadow-soft"
          >
            <h2
              id="actions-heading"
              className="mb-4 text-[18px] font-semibold text-ink-950"
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <Link
                to="/session/setup"
                className="group rounded-xl bg-sky-50 p-3 transition-colors hover:bg-sky-100"
              >
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <Play size={17} fill="currentColor" />
                </span>
                <strong className="block text-[13px] leading-tight text-ink-950">
                  Start
                  <br />
                  Focus Session
                </strong>
                <p className="mt-3 hidden text-[11px] leading-relaxed text-ink-600 sm:block">
                  Begin a new focus session
                </p>
                <ChevronRight className="ml-auto mt-3 text-ink-800" size={16} />
              </Link>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-50 p-3 text-left"
              >
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
                  <ShieldCheck size={17} />
                </span>
                <strong className="block text-[13px] leading-tight text-ink-950">
                  Open
                  <br />
                  Rescue Mode
                </strong>
                <p className="mt-3 hidden text-[11px] leading-relaxed text-ink-600 sm:block">
                  Get back on track when it’s difficult
                </p>
                <span className="mt-3 block text-[10px] text-ink-400">
                  Soon
                </span>
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-slate-50 p-3 text-left"
              >
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9edff] text-[#426de1]">
                  <Headphones size={17} />
                </span>
                <strong className="block text-[13px] leading-tight text-ink-950">
                  Audio
                  <br />
                  Library
                </strong>
                <p className="mt-3 hidden text-[11px] leading-relaxed text-ink-600 sm:block">
                  Explore focus sounds
                </p>
                <span className="mt-3 block text-[10px] text-ink-400">
                  Soon
                </span>
              </button>
            </div>
          </section>
          <section className="relative min-h-[130px] overflow-hidden rounded-2xl bg-[#eaf2fb] bg-[linear-gradient(115deg,rgba(255,251,241,0.94),rgba(234,242,251,0.62)),url('/assets/bg.png')] bg-cover bg-[center_bottom] px-6 py-5 shadow-soft">
            <h2 className="relative z-10 max-w-[180px] text-[17px] font-semibold leading-tight text-ink-950">
              A calmer mind leads to a brighter day.
            </h2>
            <p className="relative z-10 mt-3 text-[12px] text-ink-600">
              Focus. Recover. Grow.
            </p>
            <ReflowCharacter
              size="large"
              variant="card"
              className="absolute -bottom-1 right-5"
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
