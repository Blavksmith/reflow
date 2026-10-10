import type { CameraVisionResult } from "./camera.controller";

export const DISTRACTION_THRESHOLD_MS = 5_000;
export const DISTRACTION_RECOVERY_MS = 2_000;

type DetectorState = "normal" | "candidate" | "alerted" | "recovering";

export type ConfirmedDistraction = {
  direction: Exclude<NonNullable<CameraVisionResult["headDirection"]>, "center">;
  durationMs: number;
};

export class DistractionDetector {
  private state: DetectorState = "normal";
  private candidateDirection: ConfirmedDistraction["direction"] | null = null;
  private candidateStartedAt: number | null = null;
  private candidateTimer: number | null = null;
  private recoveryTimer: number | null = null;

  constructor(
    private readonly onConfirmed: (episode: ConfirmedDistraction) => void,
    private readonly onStateChange?: (state: DetectorState) => void,
  ) {}

  observe(result: CameraVisionResult) {
    if (!result.modelInitialized || !result.facePresent) {
      this.cancelCandidate();
      return;
    }

    const direction = result.headDirection;
    if (!direction || direction === "center") {
      this.cancelCandidate();
      this.beginRecovery();
      return;
    }

    this.cancelRecovery();
    if (this.state === "alerted") return;
    if (this.candidateDirection === direction && this.candidateStartedAt !== null) return;

    this.cancelCandidate();
    this.candidateDirection = direction;
    this.candidateStartedAt = Date.now();
    this.setState("candidate");
    const startedAt = this.candidateStartedAt;
    this.candidateTimer = window.setTimeout(() => {
      if (
        this.state !== "candidate" ||
        this.candidateStartedAt !== startedAt ||
        this.candidateDirection !== direction
      ) {
        return;
      }

      this.candidateTimer = null;
      this.state = "alerted";
      this.setState("alerted");
      this.onConfirmed({ direction, durationMs: Date.now() - startedAt });
    }, DISTRACTION_THRESHOLD_MS);
  }

  reset() {
    this.cancelCandidate();
    this.cancelRecovery();
    this.setState("normal");
  }

  dispose() {
    this.reset();
  }

  private beginRecovery() {
    if (this.state !== "alerted" || this.recoveryTimer !== null) return;
    this.setState("recovering");
    this.recoveryTimer = window.setTimeout(() => {
      this.recoveryTimer = null;
      this.setState("normal");
    }, DISTRACTION_RECOVERY_MS);
  }

  private cancelCandidate() {
    if (this.candidateTimer !== null) {
      window.clearTimeout(this.candidateTimer);
      this.candidateTimer = null;
    }
    this.candidateDirection = null;
    this.candidateStartedAt = null;
    if (this.state === "candidate") this.setState("normal");
  }

  private cancelRecovery() {
    if (this.recoveryTimer !== null) {
      window.clearTimeout(this.recoveryTimer);
      this.recoveryTimer = null;
    }
    if (this.state === "recovering") this.setState("alerted");
  }

  private setState(nextState: DetectorState) {
    this.state = nextState;
    this.onStateChange?.(nextState);
  }
}
