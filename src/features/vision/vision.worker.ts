import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type {
  HeadDirection,
  VisionSignal,
  VisionWorkerRequest,
  VisionWorkerResponse,
} from "./vision.protocol";

let faceLandmarker: FaceLandmarker | null = null;
let runtimeInitialized = false;

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<VisionWorkerRequest>) => void) | null;
  postMessage: (message: VisionWorkerResponse) => void;
};

function respond(message: VisionWorkerResponse) {
  workerScope.postMessage(message);
}

async function initialize(request: Extract<VisionWorkerRequest, { type: "init" }>) {
  faceLandmarker = null;
  previousFacePresent = null;
  previousPose = null;
  previousMovementDirection = null;
  const visionFileset = await FilesetResolver.forVisionTasks(request.wasmBaseUrl);
  runtimeInitialized = true;

  if (request.modelAssetPath) {
    faceLandmarker = await FaceLandmarker.createFromOptions(visionFileset, {
      baseOptions: {
        modelAssetPath: request.modelAssetPath,
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
  }

  respond({
    type: "ready",
    requestId: request.requestId,
    runtimeInitialized,
    modelInitialized: faceLandmarker !== null,
    task: "face",
  });
}

let previousFacePresent: boolean | null = null;
let previousPose: { yaw: number; pitch: number } | null = null;
let previousMovementDirection: HeadDirection | null = null;

function getLandmarkMetrics(result: FaceLandmarkerResult, timestampMs: number) {
  const landmarks = result.faceLandmarks[0];
  const signals: VisionSignal[] = [];

  if (!landmarks) {
    if (previousFacePresent !== false) {
      signals.push({ type: "face_absent", timestampMs });
    }
    previousFacePresent = false;
    previousPose = null;
    previousMovementDirection = null;
    return {
      landmarkCount: 0,
      facePresent: false,
      headDirection: null,
      lookingAway: null,
      lookingAwaySupported: false as const,
      signals,
    };
  }

  const facePresent = landmarks.length >= 100;
  if (!facePresent) {
    if (previousFacePresent !== false) {
      signals.push({ type: "face_absent", timestampMs, metadata: { landmarkCount: landmarks.length } });
    }
    previousFacePresent = false;
    previousPose = null;
    previousMovementDirection = null;
    return {
      landmarkCount: landmarks.length,
      facePresent: false,
      headDirection: null,
      lookingAway: null,
      lookingAwaySupported: false as const,
      signals,
    };
  }

  if (previousFacePresent !== true) {
    signals.push({ type: "face_present", timestampMs, metadata: { landmarkCount: landmarks.length } });
  }
  previousFacePresent = true;

  const nose = landmarks[1];
  const rightEyeOuter = landmarks[33];
  const leftEyeOuter = landmarks[263];
  const canEstimateHeadPose = Boolean(nose && rightEyeOuter && leftEyeOuter);

  if (!canEstimateHeadPose) {
    previousPose = null;
    previousMovementDirection = null;
    return {
      landmarkCount: landmarks.length,
      facePresent: true,
      headDirection: null,
      lookingAway: null,
      lookingAwaySupported: false as const,
      signals,
    };
  }

  const eyeCenterX = (rightEyeOuter.x + leftEyeOuter.x) / 2;
  const eyeCenterY = (rightEyeOuter.y + leftEyeOuter.y) / 2;
  const eyeWidth = Math.max(Math.abs(leftEyeOuter.x - rightEyeOuter.x), 0.001);
  const yaw = (nose.x - eyeCenterX) / eyeWidth;
  const pitch = (nose.y - eyeCenterY) / eyeWidth;
  const direction: HeadDirection =
    Math.abs(yaw) > Math.abs(pitch)
      ? yaw < -0.18
        ? "left"
        : yaw > 0.18
          ? "right"
          : "center"
      : pitch < -0.18
        ? "up"
        : pitch > 0.18
          ? "down"
          : "center";

  const previousDirection = previousMovementDirection;
  if (
    previousPose &&
    Math.hypot(yaw - previousPose.yaw, pitch - previousPose.pitch) > 0.08 &&
    direction !== previousDirection
  ) {
    signals.push({
      type: "head_movement",
      timestampMs,
      metadata: {
        direction,
        yaw: Number(yaw.toFixed(3)),
        pitch: Number(pitch.toFixed(3)),
        landmarkCount: landmarks.length,
      },
    });
  }
  previousMovementDirection = direction;

  previousPose = { yaw, pitch };
  return {
    landmarkCount: landmarks.length,
    facePresent: true,
    headDirection: direction,
    lookingAway: null,
    lookingAwaySupported: false as const,
    signals,
  };
}

async function processFrame(request: Extract<VisionWorkerRequest, { type: "process" }>) {
  try {
    const metrics = faceLandmarker
      ? getLandmarkMetrics(
          faceLandmarker.detectForVideo(request.frame, request.timestampMs),
          request.timestampMs,
        )
      : {
          landmarkCount: 0,
          facePresent: false,
          headDirection: null,
          lookingAway: null,
          lookingAwaySupported: false as const,
          signals: [],
        };

    if (metrics.signals.length === 0) return;

    respond({
      type: "result",
      requestId: request.requestId,
      timestampMs: request.timestampMs,
      ...metrics,
      modelInitialized: faceLandmarker !== null,
    });
  } finally {
    request.frame.close();
  }
}

workerScope.onmessage = (event) => {
  const request = event.data;

  void (async () => {
    try {
      if (request.type === "init") {
        await initialize(request);
        return;
      }

      if (request.type === "process") {
        if (!runtimeInitialized) {
          throw new Error("MediaPipe runtime is not initialized.");
        }
        await processFrame(request);
        return;
      }

      faceLandmarker?.close();
      faceLandmarker = null;
      runtimeInitialized = false;
      respond({ type: "disposed", requestId: request.requestId });
    } catch (error) {
      respond({
        type: "error",
        requestId: request.requestId,
        message: error instanceof Error ? error.message : "MediaPipe worker failed.",
      });
    }
  })();
};
