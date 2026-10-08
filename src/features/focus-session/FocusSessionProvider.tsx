import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  createFocusSession,
  createRecoveryAction,
  createSessionEvent,
  getFocusSession,
  updateFocusSession,
  updateRecoveryAction,
  type RecoveryActionRow,
  type RecoveryActionStatus,
  type RecoveryActionType,
  type SessionEventType,
} from "./focus-session.service";
import type {
  FocusSession,
  FocusSessionSetup,
  FocusSessionStatus,
} from "./session.types";

const TIMER_REFRESH_MS = 250;

type FocusSessionContextValue = {
  session: FocusSession | null;
  status: FocusSessionStatus;
  loading: boolean;
  creating: boolean;
  error: string | null;
  createSession: (setup: FocusSessionSetup) => Promise<FocusSession | null>;
  loadSession: (sessionId: string) => Promise<FocusSession | null>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  reportDistraction: () => void;
  startRecovery: (actionType?: RecoveryActionType) => Promise<RecoveryActionRow | null>;
  selectRecoveryAction: (actionId: string, actionType: RecoveryActionType) => Promise<void>;
  finishRecovery: (actionId: string, status: RecoveryActionStatus, durationSeconds?: number) => Promise<void>;
  updatePreferences: (
    changes: Partial<
      Pick<FocusSession, "audioEnabled" | "audioCategory" | "audioVolume" | "cameraEnabled">
    >,
  ) => void;
};

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null);

function calculateElapsedSeconds(session: FocusSession, now: number) {
  if (session.activeStartedAt === null) {
    return session.actualDurationSeconds;
  }

  return Math.min(
    session.plannedDurationSeconds,
    session.actualDurationSeconds +
      Math.max(0, Math.floor((now - session.activeStartedAt) / 1000)),
  );
}

export function FocusSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [session, setSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<FocusSession | null>(null);

  const setCurrentSession = useCallback((nextSession: FocusSession | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const syncTransition = useCallback(
    async (
      nextSession: FocusSession,
      changes: Record<string, unknown>,
      eventType?: SessionEventType,
      metadata?: Record<string, unknown>,
    ) => {
      if (!userId) {
        setError("Sign in to save your focus session.");
        return;
      }

      const updateResult = await updateFocusSession(
        userId,
        nextSession.id,
        changes,
      );
      if (updateResult.error) {
        setError(updateResult.error);
        return;
      }

      if (eventType) {
        const eventResult = await createSessionEvent(
          userId,
          nextSession.id,
          eventType,
          metadata,
        );
        if (eventResult.error) {
          setError(eventResult.error);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    if (user) {
      return;
    }

    queueMicrotask(() => {
      sessionRef.current = null;
      setSession(null);
      setError(null);
    });
  }, [user]);

  const sessionId = session?.id ?? null;
  const sessionStatus = session?.status ?? "IDLE";
  const activeStartedAt = session?.activeStartedAt ?? null;

  useEffect(() => {
    if (sessionId === null || sessionStatus !== "ACTIVE" || activeStartedAt === null) {
      return;
    }

    const timer = window.setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.id !== sessionId || current.status !== "ACTIVE") {
        return;
      }

      const actualDurationSeconds = calculateElapsedSeconds(current, Date.now());
      const remainingSeconds = Math.max(
        0,
        current.plannedDurationSeconds - actualDurationSeconds,
      );

      if (remainingSeconds === 0) {
        const nextSession: FocusSession = {
          ...current,
          actualDurationSeconds: current.plannedDurationSeconds,
          remainingSeconds: 0,
          status: "COMPLETED",
          activeStartedAt: null,
          completedAt: new Date().toISOString(),
        };
        setCurrentSession(nextSession);
        void syncTransition(
          nextSession,
          {
            status: "completed",
            actual_duration_seconds: nextSession.actualDurationSeconds,
            completed_at: nextSession.completedAt,
            paused_at: null,
          },
          "session_completed",
        );
        return;
      }

      setCurrentSession({ ...current, remainingSeconds });
    }, TIMER_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [activeStartedAt, sessionId, sessionStatus, setCurrentSession, syncTransition]);

  const createSession = useCallback(
    async (setup: FocusSessionSetup) => {
      if (!userId) {
        setError("Sign in to save your focus session.");
        return null;
      }

      setCreating(true);
      setError(null);
      const result = await createFocusSession(userId, setup);
      setCreating(false);
      if (result.data) {
        setCurrentSession(result.data);
      }
      setError(result.error);
      return result.data;
    },
    [setCurrentSession, userId],
  );

  const loadSession = useCallback(
    async (requestedSessionId: string) => {
      if (!userId) {
        setError("Sign in to load your focus session.");
        return null;
      }

      setLoading(true);
      setError(null);
      const result = await getFocusSession(userId, requestedSessionId);
      if (result.data) {
        setCurrentSession(result.data);
      }
      setError(result.error);
      setLoading(false);
      return result.data;
    },
    [setCurrentSession, userId],
  );

  const pauseSession = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.status !== "ACTIVE") return;

    const actualDurationSeconds = calculateElapsedSeconds(current, Date.now());
    const nextSession: FocusSession = {
      ...current,
      actualDurationSeconds,
      remainingSeconds: Math.max(
        0,
        current.plannedDurationSeconds - actualDurationSeconds,
      ),
      status: "PAUSED",
      activeStartedAt: null,
      pausedAt: new Date().toISOString(),
    };
    setCurrentSession(nextSession);
    void syncTransition(
      nextSession,
      {
        status: "paused",
        actual_duration_seconds: nextSession.actualDurationSeconds,
        paused_at: nextSession.pausedAt,
      },
      "session_paused",
    );
  }, [setCurrentSession, syncTransition]);

  const resumeSession = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.status !== "PAUSED" || current.remainingSeconds <= 0) {
      return;
    }

    const nextSession: FocusSession = {
      ...current,
      status: "ACTIVE",
      activeStartedAt: Date.now(),
      pausedAt: null,
    };
    setCurrentSession(nextSession);
    void syncTransition(
      nextSession,
      { status: "active", paused_at: null },
      "session_resumed",
    );
  }, [setCurrentSession, syncTransition]);

  const endSession = useCallback(() => {
    const current = sessionRef.current;
    if (!current || (current.status !== "ACTIVE" && current.status !== "PAUSED")) {
      return;
    }

    const actualDurationSeconds = calculateElapsedSeconds(current, Date.now());
    const nextSession: FocusSession = {
      ...current,
      actualDurationSeconds,
      remainingSeconds: Math.max(
        0,
        current.plannedDurationSeconds - actualDurationSeconds,
      ),
      status: "ENDED",
      activeStartedAt: null,
      endedAt: new Date().toISOString(),
    };
    setCurrentSession(nextSession);
    void syncTransition(
      nextSession,
      {
        status: "interrupted",
        actual_duration_seconds: nextSession.actualDurationSeconds,
        ended_at: nextSession.endedAt,
      },
      "session_ended",
    );
  }, [setCurrentSession, syncTransition]);

  const reportDistraction = useCallback(() => {
    const current = sessionRef.current;
    if (!current || (current.status !== "ACTIVE" && current.status !== "PAUSED")) {
      return;
    }

    const nextSession = {
      ...current,
      interruptionCount: current.interruptionCount + 1,
    };
    setCurrentSession(nextSession);
    void syncTransition(
      nextSession,
      { interruption_count: nextSession.interruptionCount },
      "distraction_reported",
      { source: "user" },
    );
  }, [setCurrentSession, syncTransition]);

  const startRecovery = useCallback(
    async (actionType: RecoveryActionType = "rescue_mode") => {
      const current = sessionRef.current;
      if (!userId || !current) {
        setError("Start a focus session before using Rescue Mode.");
        return null;
      }
      const result = await createRecoveryAction(userId, current.id, actionType);
      setError(result.error);
      if (result.data) {
        const eventType = actionType === "rescue_mode" ? "rescue_mode_started" : "break_started";
        await createSessionEvent(userId, current.id, eventType, { action_type: actionType });
      }
      return result.data;
    },
    [userId],
  );

  const selectRecoveryAction = useCallback(
    async (actionId: string, actionType: RecoveryActionType) => {
      const current = sessionRef.current;
      if (!userId || !current) return;
      const result = await updateRecoveryAction(userId, current.id, actionId, {
        action_type: actionType,
      });
      setError(result.error);
    },
    [userId],
  );

  const finishRecovery = useCallback(
    async (actionId: string, status: RecoveryActionStatus, durationSeconds?: number) => {
      const current = sessionRef.current;
      if (!userId || !current) return;
      const completedAt = status === "started" ? null : new Date().toISOString();
      const result = await updateRecoveryAction(userId, current.id, actionId, {
        status,
        completed_at: completedAt,
        duration_seconds: durationSeconds ?? null,
      });
      setError(result.error);
      if (!result.error) {
        await createSessionEvent(
          userId,
          current.id,
          status === "completed" ? "rescue_mode_completed" : "break_completed",
          { action_id: actionId, status },
        );
      }
    },
    [userId],
  );
  const updatePreferences = useCallback(
    (
      changes: Partial<
        Pick<FocusSession, "audioEnabled" | "audioCategory" | "audioVolume" | "cameraEnabled">
      >,
    ) => {
      const current = sessionRef.current;
      if (!current) return;

      const nextSession = { ...current, ...changes };
      setCurrentSession(nextSession);
      const databaseChanges: Record<string, unknown> = {};
      if ("audioEnabled" in changes) databaseChanges.audio_enabled = changes.audioEnabled;
      if ("audioCategory" in changes) {
        databaseChanges.audio_type = changes.audioCategory === "focus" ? "focus_sound" : changes.audioCategory;
      }
      if ("audioVolume" in changes) databaseChanges.audio_volume = changes.audioVolume;
      if ("cameraEnabled" in changes) {
        databaseChanges.camera_monitoring_enabled = changes.cameraEnabled;
      }
      const eventType =
        "cameraEnabled" in changes
          ? changes.cameraEnabled
            ? "camera_enabled"
            : "camera_disabled"
          : "audio_changed";
      void syncTransition(nextSession, databaseChanges, eventType);
    },
    [setCurrentSession, syncTransition],
  );

  const value = useMemo(
    () => ({
      session,
      status: session?.status ?? "IDLE",
      loading,
      creating,
      error,
      createSession,
      loadSession,
      pauseSession,
      resumeSession,
      endSession,
      reportDistraction,
      startRecovery,
      selectRecoveryAction,
      finishRecovery,
      updatePreferences,
    }),
    [
      createSession,
      creating,
      endSession,
      error,
      finishRecovery,
      loadSession,
      loading,
      pauseSession,
      reportDistraction,
      resumeSession,
      selectRecoveryAction,
      session,
      startRecovery,
      updatePreferences,
    ],
  );

  return (
    <FocusSessionContext.Provider value={value}>
      {children}
    </FocusSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFocusSession() {
  const context = useContext(FocusSessionContext);

  if (!context) {
    throw new Error("useFocusSession must be used inside a FocusSessionProvider");
  }

  return context;
}
