export type FocusSessionStatus =
  | "IDLE"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ENDED";

export type FocusSessionSetup = {
  goal: string;
  durationMinutes: number;
  audioEnabled: boolean;
  audioCategory: string;
  audioVolume: number;
  cameraEnabled: boolean;
};

export type FocusSession = {
  id: string;
  goal: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  remainingSeconds: number;
  status: FocusSessionStatus;
  audioEnabled: boolean;
  audioCategory: string;
  audioVolume: number;
  cameraEnabled: boolean;
  interruptionCount: number;
  startedAt: string;

  activeStartedAt: number | null;
  pausedAt: string | null;
  completedAt: string | null;
  endedAt: string | null;
};
