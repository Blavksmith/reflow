import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { AdaptiveRecommendation, RecentSession } from "../../types/dashboard";
import {
  listFocusSessionRows,
  type FocusSessionRow,
} from "../focus-session/focus-session.service";

export type DashboardMetric = {
  id: "focus-time" | "completed-sessions" | "interruptions";
  label: string;
  value: string;
  change: string;
  tone: "positive" | "negative" | "neutral";
  icon: "clock" | "completed" | "interruptions";
};

export type DashboardData = {
  metrics: DashboardMetric[];
  recentSessions: RecentSession[];
  recommendation: AdaptiveRecommendation | null;
};

export type DashboardResult = {
  data: DashboardData | null;
  error: string | null;
};

const loadError = "We could not load your focus data right now.";

function formatFocusTime(seconds: number) {
  const totalMinutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatRecentDate(value: string) {
  const date = new Date(value);
  return {
    dateLabel: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date),
    timeLabel: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function formatDuration(seconds: number) {
  return `${Math.max(0, Math.round(seconds / 60))} min`;
}

function toRecentSession(row: FocusSessionRow): RecentSession {
  const date = formatRecentDate(row.started_at);
  return {
    id: row.id,
    dateLabel: date.dateLabel,
    timeLabel: date.timeLabel,
    duration: formatDuration(row.actual_duration_seconds ?? 0),
    goal: row.goal,
    status: row.status === "completed" ? "COMPLETED" : "ENDED",
  };
}

function buildMetrics(rows: FocusSessionRow[]): DashboardMetric[] {
  const totalSeconds = rows.reduce(
    (total, row) => total + Math.max(0, row.actual_duration_seconds ?? 0),
    0,
  );
  const completed = rows.filter((row) => row.status === "completed").length;
  const interruptions = rows.reduce(
    (total, row) => total + Math.max(0, row.interruption_count ?? 0),
    0,
  );
  const neutralChange = "—";

  return [
    {
      id: "focus-time",
      label: "Total Focus Time",
      value: formatFocusTime(totalSeconds),
      change: neutralChange,
      tone: "positive",
      icon: "clock",
    },
    {
      id: "completed-sessions",
      label: "Completed Sessions",
      value: String(completed),
      change: neutralChange,
      tone: "positive",
      icon: "completed",
    },
    {
      id: "interruptions",
      label: "Interruptions",
      value: String(interruptions),
      change: neutralChange,
      tone: "negative",
      icon: "interruptions",
    },
  ];
}

export async function getAdaptiveRecommendation(userId: string): Promise<AdaptiveRecommendation | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("adaptive_focus_recommendations")
    .select("recommended_duration_minutes, reason")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    recommendedDurationMinutes: data.recommended_duration_minutes,
    explanation: data.reason ?? "Based on your saved focus data.",
    detail: "You can change this before starting.",
  };
}

export async function getDashboardData(userId: string): Promise<DashboardResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { data: null, error: "Focus data is unavailable until Supabase is configured." };
  }

  const sessionsResult = await listFocusSessionRows(userId);
  if (sessionsResult.error || !sessionsResult.data) {
    return { data: null, error: loadError };
  }

  const { data: savedSettings } = await supabase
    .from("user_settings")
    .select("adaptive_focus_enabled, smart_session_length_enabled, use_session_history_for_recommendations")
    .eq("user_id", userId)
    .maybeSingle();
  const recommendationEnabled =
    (savedSettings?.adaptive_focus_enabled ?? true) &&
    (savedSettings?.smart_session_length_enabled ?? true) &&
    (savedSettings?.use_session_history_for_recommendations ?? true);
  const recommendation = recommendationEnabled
    ? await getAdaptiveRecommendation(userId)
    : null;

  return {
    data: {
      metrics: buildMetrics(sessionsResult.data),
      recentSessions: sessionsResult.data.slice(0, 3).map(toRecentSession),
      recommendation,
    },
    error: null,
  };
}
