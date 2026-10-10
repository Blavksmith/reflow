import {
  createVisionWorkerClient,
  type VisionDetectionResult,
} from "./vision.client";

export type CameraVisionStatus =
  | "idle"
  | "requesting_permission"
  | "initializing"
  | "running"
  | "permission_denied"
  | "unsupported"
  | "error"
  | "stopped";

export type CameraVisionResult = Pick<
  VisionDetectionResult,
  | "timestampMs"
  | "facePresent"
  | "headDirection"
  | "lookingAway"
  | "lookingAwaySupported"
  | "signals"
  | "landmarkCount"
  | "modelInitialized"
>;
type StatusListener = (status: CameraVisionStatus, error?: Error) => void;
type ResultListener = (result: CameraVisionResult) => void;

export class CameraVisionController {
  private readonly workerClient = createVisionWorkerClient();
  private readonly video = document.createElement("video");
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private processing = false;
  private stopped = false;
  private lastFrameAt = 0;
  private status: CameraVisionStatus = "idle";

  private workerDisposed = false;

  constructor(
    private readonly onResult: ResultListener,
    private readonly onStatus: StatusListener,
  ) {
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.autoplay = false;
    this.workerClient.onResult((result) => {
      if (!this.stopped) this.onResult(result);
    });
    this.workerClient.onError((error) => {
      if (!this.stopped) this.setStatus("error", error);
    });
  }

  async start(existingStream: MediaStream) {
    if (this.status === "running" || this.status === "initializing") {
      return this.status;
    }

    if (!existingStream.active) {
      this.setStatus("error", new Error("The existing camera stream is no longer active."));
      return this.status;
    }

    this.stopped = false;
    this.stream = existingStream;
    this.setStatus("initializing");

    try {
      this.video.srcObject = existingStream;
      await this.video.play();
      const ready = await this.workerClient.initialize();
      if (!ready.modelInitialized) {
        throw new Error("FaceLandmarker model did not initialize.");
      }
      if (this.stopped) return "stopped";

      this.setStatus("running");
      this.scheduleFrame();
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("Camera initialization failed.");
      this.setStatus("error", normalizedError);
      this.stop();
    }

    return this.status;
  }

  stop(disposeWorker = true) {
    this.stopped = true;
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stream = null;
    this.video.pause();
    this.video.srcObject = null;
    if (disposeWorker && !this.workerDisposed) {
      this.workerDisposed = true;
      void this.workerClient.dispose().catch(() => undefined);
    }
    if (this.status !== "permission_denied" && this.status !== "unsupported" && this.status !== "error") {
      this.setStatus("stopped");
    }
  }

  private scheduleFrame() {
    if (this.stopped) return;
    this.animationFrameId = window.requestAnimationFrame((timestamp) => {
      void this.processFrame(timestamp);
    });
  }

  private async processFrame(timestamp: number) {
    if (this.stopped) return;
    if (this.processing || this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.scheduleFrame();
      return;
    }

    if (timestamp - this.lastFrameAt < 100) {
      this.scheduleFrame();
      return;
    }

    this.processing = true;
    this.lastFrameAt = timestamp;
    try {
      const frame = await createImageBitmap(this.video);
      await this.workerClient.processFrame(frame, timestamp);
    } catch (error) {
      if (!this.stopped) {
        this.setStatus("error", error instanceof Error ? error : new Error("Camera frame processing failed."));
      }
    } finally {
      this.processing = false;
      this.scheduleFrame();
    }
  }

  private setStatus(status: CameraVisionStatus, error?: Error) {
    this.status = status;
    this.onStatus(status, error);
  }
}
