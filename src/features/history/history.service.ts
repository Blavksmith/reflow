import {
  getUserSessionActivity,
  listFocusSessionRows,
  type FocusSessionRow,
  type RecoveryActionRow,
} from "../focus-session/focus-session.service";
import type {
  HistoryGroup,
  HistoryIcon,
  HistorySession,
  RecoveryAction,
  TimelineSegment,
} from "../../data/history";

export type HistoryResult = { data: HistorySession[] | null; error: string | null };

function dateParts(value: string) {
  const date = new Date(value);
  return {
    key: date.toLocaleDateString("en-CA"),
    dateLabel: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date),
    timeLabel: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function toStatus(status: FocusSessionRow["status"]): HistorySession["status"] {
  if (status === "completed") return "COMPLETED";
  if (status === "abandoned") return "ABANDONED";
  return "INTERRUPTED";
}

function toIcon(goal: string): HistoryIcon {
  const value = goal.toLowerCase();
  if (value.includes("plan")) return "list";
  if (value.includes("review")) return "monitor";
  if (value.includes("design")) return "target";
  return "file";
}

function toTimeline(row: FocusSessionRow): TimelineSegment[] {
  const planned = Math.max(1, row.planned_duration_minutes * 60);
  const focus = Math.min(1, Math.max(0, (row.actual_duration_seconds ?? 0) / planned));
  const segments: TimelineSegment[] = [];
  if (focus > 0) segments.push({ portion: focus, tone: "focus" });
  if (focus < 1) segments.push({ portion: 1 - focus, tone: "idle" });
  return segments.length > 0 ? segments : [{ portion: 1, tone: "idle" }];
}

function toRecoveryAction(action: RecoveryActionRow): RecoveryAction {
  const icon = action.action_type === "rescue_mode" ? "rescue" : action.action_type === "short_break" ? "break" : "flag";
  return {
    time: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(action.started_at)),
    title: `${action.action_type.replaceAll("_", " ")} (${action.status})`,
    icon,
  };
}

export function groupRealSessionsByDate(sessions: HistorySession[]): HistoryGroup[] {
  const todayKey = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString("en-CA");
  const groups = new Map<string, HistoryGroup>();

  for (const session of sessions) {
    if (!groups.has(session.dateKey)) {
      groups.set(session.dateKey, {
        key: session.dateKey,
        label: session.dateKey === todayKey ? "Today" : session.dateKey === yesterdayKey ? "Yesterday" : session.dateLabel,
        dateLabel: session.dateLabel,
        sessions: [],
      });
    }
    groups.get(session.dateKey)!.sessions.push(session);
  }
  return [...groups.values()];
}

export async function getHistorySessions(userId: string): Promise<HistoryResult> {
  const sessionsResult = await listFocusSessionRows(userId);
  if (sessionsResult.error || !sessionsResult.data) return { data: null, error: sessionsResult.error };

  const activityResult = await getUserSessionActivity(userId, sessionsResult.data.map((row) => row.id));
  if (activityResult.error || !activityResult.data) return { data: null, error: activityResult.error };

  const recoveryBySession = new Map<string, RecoveryActionRow[]>();
  activityResult.data.recoveryActions.forEach((action) => {
    const current = recoveryBySession.get(action.session_id) ?? [];
    current.push(action);
    recoveryBySession.set(action.session_id, current);
  });

  return {
    data: sessionsResult.data.map((row) => {
      const start = dateParts(row.started_at);
      const endValue = row.completed_at ?? row.ended_at ?? row.updated_at ?? row.started_at;
      const end = dateParts(endValue);
      return {
        id: row.id,
        dateKey: start.key,
        dateLabel: start.dateLabel,
        timeLabel: start.timeLabel,
        endTimeLabel: end.timeLabel,
        goal: row.goal,
        description: `${row.status === "completed" ? "Completed" : "Session activity"} · ${row.planned_duration_minutes} minute plan`,
        plannedMinutes: row.planned_duration_minutes,
        focusMinutes: Math.round((row.actual_duration_seconds ?? 0) / 60),
        status: toStatus(row.status),
        interruptionCount: Math.max(0, row.interruption_count ?? 0),
        icon: toIcon(row.goal),
        timeline: toTimeline(row),
        recoveryActions: (recoveryBySession.get(row.id) ?? []).map(toRecoveryAction),
      } satisfies HistorySession;
    }),
    error: null,
  };
}
