export type CameraPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export type CameraPermissionResult = {
  status: Exclude<CameraPermissionStatus, "idle" | "requesting">;
  stream: MediaStream | null;
  error: Error | null;
};

let status: CameraPermissionStatus = "idle";
let stream: MediaStream | null = null;
let requestPromise: Promise<CameraPermissionResult> | null = null;
let requestGeneration = 0;

function result(
  nextStatus: Exclude<CameraPermissionStatus, "idle" | "requesting">,
  nextStream: MediaStream | null = stream,
  error: Error | null = null,
): CameraPermissionResult {
  status = nextStatus;
  stream = nextStream;
  return { status: nextStatus, stream: nextStream, error };
}

function unavailableError(message: string) {
  return new Error(message);
}

export function getCameraPermissionStatus() {
  return status;
}

export function getCameraStream() {
  return stream;
}

export async function requestCameraStream(): Promise<CameraPermissionResult> {
  if (stream?.active) return result("granted", stream);
  if (status === "denied") {
    return result("denied", null, unavailableError("Camera permission was denied."));
  }
  if (requestPromise) return requestPromise;

  if (!navigator.mediaDevices?.getUserMedia) {
    return result("unavailable", null, unavailableError("Camera access is not supported here."));
  }

  const generation = ++requestGeneration;
  status = "requesting";
  requestPromise = navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((nextStream) => {
      if (generation !== requestGeneration) {
        nextStream.getTracks().forEach((track) => track.stop());
        return result("unavailable", null, unavailableError("Camera request was cancelled."));
      }
      return result("granted", nextStream);
    })
    .catch((error: unknown) => {
      const normalized = error instanceof Error ? error : unavailableError("Camera access failed.");
      if (normalized.name === "NotAllowedError" || normalized.name === "SecurityError") {
        return result("denied", null, normalized);
      }
      return result("unavailable", null, normalized);
    })
    .finally(() => {
      requestPromise = null;
    });

  return requestPromise;
}

export function stopCameraStream() {
  requestGeneration += 1;
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  if (status !== "denied") status = "idle";
}
