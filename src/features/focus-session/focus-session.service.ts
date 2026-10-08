import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { FocusSession, FocusSessionSetup } from "./session.types";

export type DatabaseSessionStatus =
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "interrupted"
  | "abandoned";

export type SessionEventType =
  | "session_started"
  | "session_paused"
  | "session_resumed"
  | "session_completed"
  | "session_ended"
  | "distraction_reported"
  | "rescue_mode_started"
  | "rescue_mode_completed"
  | "break_started"
  | "break_completed"
  | "audio_changed"
  | "camera_enabled"
  | "camera_disabled";

export type FocusSessionRow = {
  id: string;
  user_id: string;
  goal: string;
  planned_duration_minutes: number;
  actual_duration_seconds: number | null;
  status: DatabaseSessionStatus;
  started_at: string;
  paused_at: string | null;
  completed_at: string | null;
  ended_at: string | null;
  interruption_count: number | null;
  audio_enabled: boolean;
  audio_type: string | null;
  audio_volume: number | null;
  camera_monitoring_enabled: boolean;
  recommendation_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SessionEventRow = {
  id: string;
  session_id: string;
  event_type: SessionEventType;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type SessionFeedbackRow = {
  id: string;
  session_id: string;
  user_id: string;
  reflection: string | null;
  focus_rating: number | null;
  difficulty_rating: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type RecoveryActionRow = {
  id: string;
  session_id: string;
  action_type: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  status: string;
  source: string;
  created_at: string | null;
};

export type RecoveryActionType =
  | "short_break"
  | "hydrate"
  | "quick_stretch"
  | "change_environment"
  | "breathing"
  | "rescue_mode";

export type RecoveryActionStatus = "started" | "completed" | "skipped" | "cancelled";

export type SessionActivity = {
  events: SessionEventRow[];
  recoveryActions: RecoveryActionRow[];
};

export type FocusSessionDetails = {
  session: FocusSessionRow;
  events: SessionEventRow[];
  recoveryActions: RecoveryActionRow[];
  feedback: SessionFeedbackRow | null;
};

export type FocusSessionResult<T> = {
  data: T | null;
  error: string | null;
};

const configurationError =
  "Your focus session could not be saved because Supabase is not configured.";
const loadError = "We could not load this focus session right now.";
const saveError = "We could not save this focus session right now.";
const eventError = "The session is running, but an activity could not be synced.";
const feedbackError = "We could not save your reflection right now.";

function canUseSupabase() {
  return Boolean(supabase && isSupabaseConfigured);
}

function toDatabaseAudioType(audioCategory: string) {
  return audioCategory === "focus" ? "focus_sound" : audioCategory;
}

function fromDatabaseAudioType(audioType: string | null) {
  return audioType === "focus_sound" ? "focus" : audioType ?? "ambient";
}

function toUiStatus(status: DatabaseSessionStatus): FocusSession["status"] {
  if (status === "active") return "ACTIVE";
  if (status === "paused") return "PAUSED";
  if (status === "completed") return "COMPLETED";
  if (status === "interrupted" || status === "abandoned") return "ENDED";
  return "IDLE";
}

export function mapFocusSessionRow(row: FocusSessionRow): FocusSession {
  const plannedDurationSeconds = Math.max(1, row.planned_duration_minutes) * 60;
  const actualDurationSeconds = Math.max(0, row.actual_duration_seconds ?? 0);
  const active = row.status === "active";

  return {
    id: row.id,
    goal: row.goal,
    plannedDurationSeconds,
    actualDurationSeconds,
    remainingSeconds: Math.max(0, plannedDurationSeconds - actualDurationSeconds),
    status: toUiStatus(row.status),
    audioEnabled: row.audio_enabled,
    audioCategory: fromDatabaseAudioType(row.audio_type),
    audioVolume: Math.min(100, Math.max(0, row.audio_volume ?? 70)),
    cameraEnabled: row.camera_monitoring_enabled,
    startedAt: row.started_at,
    activeStartedAt: active ? Date.now() : null,
    pausedAt: row.paused_at,
    completedAt: row.completed_at,
    endedAt: row.ended_at,
    interruptionCount: Math.max(0, row.interruption_count ?? 0),
  };
}

export async function createFocusSession(
  userId: string,
  setup: FocusSessionSetup,
): Promise<FocusSessionResult<FocusSession>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const startedAt = new Date().toISOString();
  const { data, error } = await supabase!
    .from("focus_sessions")
    .insert({
      user_id: userId,
      goal: setup.goal.trim(),
      planned_duration_minutes: Math.max(1, Math.round(setup.durationMinutes)),
      actual_duration_seconds: 0,
      status: "active",
      started_at: startedAt,
      paused_at: null,
      completed_at: null,
      ended_at: null,
      interruption_count: 0,
      audio_enabled: setup.audioEnabled,
      audio_type: toDatabaseAudioType(setup.audioCategory),
      audio_volume: Math.min(100, Math.max(0, setup.audioVolume)),
      camera_monitoring_enabled: setup.cameraEnabled,
      recommendation_id: null,
    })
    .select("*")
    .single();

  if (error || !data) return { data: null, error: saveError };

  const session = mapFocusSessionRow(data as FocusSessionRow);
  const activity = await createSessionEvent(userId, session.id, "session_started");
  return { data: session, error: activity.error };
}

export async function getFocusSession(
  userId: string,
  sessionId: string,
): Promise<FocusSessionResult<FocusSession>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const { data, error } = await supabase!
    .from("focus_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return { data: null, error: loadError };
  return { data: mapFocusSessionRow(data as FocusSessionRow), error: null };
}

export async function listFocusSessionRows(
  userId: string,
): Promise<FocusSessionResult<FocusSessionRow[]>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const { data, error } = await supabase!
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) return { data: null, error: loadError };
  return { data: (data ?? []) as FocusSessionRow[], error: null };
}

export async function updateFocusSession(
  userId: string,
  sessionId: string,
  changes: Record<string, unknown>,
): Promise<FocusSessionResult<FocusSessionRow>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const { data, error } = await supabase!
    .from("focus_sessions")
    .update(changes)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error || !data) return { data: null, error: saveError };
  return { data: data as FocusSessionRow, error: null };
}

export async function createSessionEvent(
  userId: string,
  sessionId: string,
  eventType: SessionEventType,
  metadata?: Record<string, unknown>,
): Promise<FocusSessionResult<SessionEventRow>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };
  const ownedSession = await getFocusSessionRow(userId, sessionId);
  if (ownedSession.error || !ownedSession.data) return { data: null, error: loadError };

  const { data, error } = await supabase!
    .from("session_events")
    .insert({
      session_id: sessionId,
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      metadata: metadata ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return { data: null, error: eventError };
  return { data: data as SessionEventRow, error: null };
}

export async function createRecoveryAction(
  userId: string,
  sessionId: string,
  actionType: RecoveryActionType,
): Promise<FocusSessionResult<RecoveryActionRow>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };
  const ownedSession = await getFocusSessionRow(userId, sessionId);
  if (ownedSession.error || !ownedSession.data) return { data: null, error: loadError };

  const { data, error } = await supabase!
    .from("recovery_actions")
    .insert({
      session_id: sessionId,
      action_type: actionType,
      started_at: new Date().toISOString(),
      completed_at: null,
      duration_seconds: null,
      status: "started",
      source: "user",
    })
    .select("*")
    .single();

  if (error || !data) return { data: null, error: saveError };
  return { data: data as RecoveryActionRow, error: null };
}

export async function updateRecoveryAction(
  userId: string,
  sessionId: string,
  actionId: string,
  changes: Partial<Pick<RecoveryActionRow, "action_type" | "status" | "completed_at" | "duration_seconds">>,
): Promise<FocusSessionResult<RecoveryActionRow>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };
  const ownedSession = await getFocusSessionRow(userId, sessionId);
  if (ownedSession.error || !ownedSession.data) return { data: null, error: loadError };

  const { data, error } = await supabase!
    .from("recovery_actions")
    .update(changes)
    .eq("id", actionId)
    .eq("session_id", sessionId)
    .select("*")
    .maybeSingle();

  if (error || !data) return { data: null, error: saveError };
  return { data: data as RecoveryActionRow, error: null };
}

export async function getUserSessionActivity(
  userId: string,
  sessionIds: string[],
): Promise<FocusSessionResult<SessionActivity>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };
  if (sessionIds.length === 0) return { data: { events: [], recoveryActions: [] }, error: null };

  const ownedSessions = await supabase!
    .from("focus_sessions")
    .select("id")
    .eq("user_id", userId)
    .in("id", sessionIds);
  if (ownedSessions.error) return { data: null, error: loadError };
  const ownedIds = (ownedSessions.data ?? []).map((row) => row.id as string);
  if (ownedIds.length === 0) return { data: { events: [], recoveryActions: [] }, error: null };

  const [eventsResult, recoveryResult] = await Promise.all([
    supabase!
      .from("session_events")
      .select("*")
      .in("session_id", ownedIds)
      .order("occurred_at", { ascending: true }),
    supabase!
      .from("recovery_actions")
      .select("*")
      .in("session_id", ownedIds)
      .order("started_at", { ascending: true }),
  ]);

  if (eventsResult.error || recoveryResult.error) return { data: null, error: loadError };
  return {
    data: {
      events: (eventsResult.data ?? []) as SessionEventRow[],
      recoveryActions: (recoveryResult.data ?? []) as RecoveryActionRow[],
    },
    error: null,
  };
}
export async function getFocusSessionDetails(
  userId: string,
  sessionId: string,
): Promise<FocusSessionResult<FocusSessionDetails>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const sessionResult = await getFocusSessionRow(userId, sessionId);
  if (sessionResult.error || !sessionResult.data) {
    return { data: null, error: sessionResult.error ?? loadError };
  }

  const [eventsResult, recoveryResult, feedbackResult] = await Promise.all([
    supabase!
      .from("session_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("occurred_at", { ascending: true }),
    supabase!
      .from("recovery_actions")
      .select("*")
      .eq("session_id", sessionId)
      .order("started_at", { ascending: true }),
    supabase!
      .from("session_feedback")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (eventsResult.error || recoveryResult.error || feedbackResult.error) {
    return { data: null, error: loadError };
  }

  return {
    data: {
      session: sessionResult.data,
      events: (eventsResult.data ?? []) as SessionEventRow[],
      recoveryActions: (recoveryResult.data ?? []) as RecoveryActionRow[],
      feedback: (feedbackResult.data as SessionFeedbackRow | null) ?? null,
    },
    error: null,
  };
}

async function getFocusSessionRow(userId: string, sessionId: string) {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const { data, error } = await supabase!
    .from("focus_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return { data: null, error: loadError };
  return { data: data as FocusSessionRow, error: null };
}

export async function saveSessionFeedback(
  userId: string,
  sessionId: string,
  reflection: string,
): Promise<FocusSessionResult<SessionFeedbackRow>> {
  if (!canUseSupabase()) return { data: null, error: configurationError };

  const existing = await supabase!
    .from("session_feedback")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.error) return { data: null, error: feedbackError };

  if (existing.data) {
    const { data, error } = await supabase!
      .from("session_feedback")
      .update({ reflection, updated_at: new Date().toISOString() })
      .eq("id", existing.data.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    return error || !data
      ? { data: null, error: feedbackError }
      : { data: data as SessionFeedbackRow, error: null };
  }

  const { data, error } = await supabase!
    .from("session_feedback")
    .insert({ session_id: sessionId, user_id: userId, reflection })
    .select("*")
    .single();

  return error || !data
    ? { data: null, error: feedbackError }
    : { data: data as SessionFeedbackRow, error: null };
}
