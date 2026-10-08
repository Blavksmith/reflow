import {
  getUserSessionActivity,
  listFocusSessionRows,
  type RecoveryActionRow,
} from "../focus-session/focus-session.service";

export type InsightsDateRange = "today" | "week" | "month";
export type InsightPoint = { day: string; date?: string; value: number };

export type InsightsData = {
  averageDurationMinutes: number | null;
  completionRate: number | null;
  interruptionsPerSession: number | null;
  recoveryMinutes: number | null;
  focusTrend: InsightPoint[];
  durationTrend: InsightPoint[];
  interruptionTrend: number[];
  recoveryTrend: number[];
  completedSessions: number;
  otherSessions: number;
  bestDay: string | null;
  insight: string;
};

export type InsightsResult = { data: InsightsData | null; error: string | null };

function startOfRange(range: InsightsDateRange) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (range === "today") return date;
  date.setDate(date.getDate() - (range === "week" ? 6 : 29));
  return date;
}

function bucketCount(range: InsightsDateRange) {
  return range === "today" ? 1 : range === "week" ? 7 : 5;
}

function bucketIndex(value: string, range: InsightsDateRange, start: Date) {
  const date = new Date(value);
  const day = Math.max(0, Math.floor((date.getTime() - start.getTime()) / 86_400_000));
  return range === "month" ? Math.min(4, Math.floor(day / 7)) : Math.min(bucketCount(range) - 1, day);
}

function labels(range: InsightsDateRange, start: Date) {
  return Array.from({ length: bucketCount(range) }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + (range === "month" ? index * 7 : index));
    return {
      day: range === "month" ? `Week ${index + 1}` : new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      date: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date),
    };
  });
}

function completedRecoverySeconds(actions: RecoveryActionRow[]) {
  return actions.reduce((total, action) => {
    if (action.status !== "completed") return total;
    if (action.duration_seconds != null) return total + Math.max(0, action.duration_seconds);
    if (action.completed_at) {
      return total + Math.max(0, (new Date(action.completed_at).getTime() - new Date(action.started_at).getTime()) / 1000);
    }
    return total;
  }, 0);
}

export async function getInsightsData(
  userId: string,
  range: InsightsDateRange,
): Promise<InsightsResult> {
  const sessionsResult = await listFocusSessionRows(userId);
  if (sessionsResult.error || !sessionsResult.data) return { data: null, error: sessionsResult.error };

  const start = startOfRange(range);
  const rows = sessionsResult.data.filter((row) => new Date(row.started_at) >= start && row.status !== "active" && row.status !== "paused");
  const activityResult = await getUserSessionActivity(userId, rows.map((row) => row.id));
  if (activityResult.error || !activityResult.data) return { data: null, error: activityResult.error };

  const completedSessions = rows.filter((row) => row.status === "completed").length;
  const terminalCount = rows.filter((row) => ["completed", "interrupted", "abandoned"].includes(row.status)).length;
  const totalActualSeconds = rows.reduce((sum, row) => sum + Math.max(0, row.actual_duration_seconds ?? 0), 0);
  const interruptions = rows.reduce((sum, row) => sum + Math.max(0, row.interruption_count ?? 0), 0);
  const recoverySeconds = completedRecoverySeconds(activityResult.data.recoveryActions);
  const bucketLabels = labels(range, start);
  const focusValues = bucketLabels.map(() => 0);
  const durationCounts = bucketLabels.map(() => 0);
  const interruptionsValues = bucketLabels.map(() => 0);
  const recoveryValues = bucketLabels.map(() => 0);
  const recoveryCounts = bucketLabels.map(() => 0);

  rows.forEach((row) => {
    const index = bucketIndex(row.started_at, range, start);
    const minutes = Math.round(Math.max(0, row.actual_duration_seconds ?? 0) / 60);
    focusValues[index] += minutes;
    durationCounts[index] += 1;
    interruptionsValues[index] += Math.max(0, row.interruption_count ?? 0);
  });

  activityResult.data.recoveryActions.forEach((action) => {
    if (action.status !== "completed") return;
    const index = bucketIndex(action.started_at, range, start);
    const seconds = action.duration_seconds ?? (action.completed_at ? (new Date(action.completed_at).getTime() - new Date(action.started_at).getTime()) / 1000 : 0);
    recoveryValues[index] += Math.round(Math.max(0, seconds) / 60);
    recoveryCounts[index] += 1;
  });

  const durationTrend = bucketLabels.map((label, index) => ({ day: label.day, date: label.date, value: durationCounts[index] ? Math.round(focusValues[index] / durationCounts[index]) : 0 }));
  const focusTrend = bucketLabels.map((label, index) => ({ day: label.day, date: label.date, value: focusValues[index] }));
  const recoveryTrend = recoveryValues.map((value, index) => recoveryCounts[index] ? Math.round(value / recoveryCounts[index]) : 0);
  const bestIndex = durationTrend.reduce((best, point, index) => point.value > durationTrend[best].value ? index : best, 0);
  const bestDay = rows.length > 0 ? durationTrend[bestIndex]?.day ?? null : null;
  const averageDurationMinutes = rows.length ? Math.round(totalActualSeconds / rows.length / 60) : null;
  const completionRate = terminalCount ? Math.round((completedSessions / terminalCount) * 100) : null;
  const completedRecoveryCount = activityResult.data.recoveryActions.filter((action) => action.status === "completed").length;
  const recoveryMinutes = completedRecoveryCount ? Math.round(recoverySeconds / 60 / completedRecoveryCount) : null;

  let insight = "Complete a few focus sessions to reveal a personal pattern.";
  if (rows.length > 0 && averageDurationMinutes !== null) {
    insight = `Your recorded sessions average ${averageDurationMinutes} minutes. Use this as a gentle reference, not a score.`;
  }

  return {
    data: {
      averageDurationMinutes,
      completionRate,
      interruptionsPerSession: rows.length ? Number((interruptions / rows.length).toFixed(1)) : null,
      recoveryMinutes,
      focusTrend,
      durationTrend,
      interruptionTrend: interruptionsValues,
      recoveryTrend,
      completedSessions,
      otherSessions: Math.max(0, terminalCount - completedSessions),
      bestDay,
      insight,
    },
    error: null,
  };
}
