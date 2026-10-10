import type {
  VisionWorkerRequest,
  VisionWorkerResponse,
} from "./vision.protocol";

export type VisionInitializationResult = Extract<VisionWorkerResponse, { type: "ready" }>;
export type VisionDetectionResult = Extract<VisionWorkerResponse, { type: "result" }>;

export const DEFAULT_VISION_WASM_BASE_URL = `${import.meta.env.BASE_URL}mediapipe/wasm`;
export const DEFAULT_FACE_LANDMARKER_MODEL_URL = `${import.meta.env.BASE_URL}models/face_landmarker.task`;

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `vision-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class VisionWorkerClient {
  private readonly worker: Worker;
  private readonly pending = new Map<
    string,
    { resolve: (response: VisionWorkerResponse) => void; reject: (error: Error) => void }
  >();
  private readonly resultListeners = new Set<(result: VisionDetectionResult) => void>();
  private readonly errorListeners = new Set<(error: Error) => void>();

  constructor() {
    this.worker = new Worker(new URL("./vision.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.addEventListener("message", (event: MessageEvent<VisionWorkerResponse>) => {
      const response = event.data;
      if (response.type === "result") {
        this.resultListeners.forEach((listener) => listener(response));
        return;
      }
      if (response.type === "error") {
        const request = this.pending.get(response.requestId);
        if (request) {
          this.pending.delete(response.requestId);
          request.reject(new Error(response.message));
        } else {
          this.errorListeners.forEach((listener) => listener(new Error(response.message)));
        }
        return;
      }
      const request = this.pending.get(response.requestId);
      if (!request) return;
      this.pending.delete(response.requestId);
      request.resolve(response);
    });
    this.worker.addEventListener("error", (event) => {
      const error = new Error(event.message || "Vision worker failed.");
      this.errorListeners.forEach((listener) => listener(error));
      for (const request of this.pending.values()) request.reject(error);
      this.pending.clear();
    });
  }

  private request<T extends VisionWorkerResponse>(
    message: VisionWorkerRequest,
    transfer: Transferable[] = [],
  ) {
    return new Promise<T>((resolve, reject) => {
      this.pending.set(message.requestId, {
        resolve: (response) => resolve(response as T),
        reject,
      });
      this.worker.postMessage(message, transfer);
    });
  }

  initialize(options: { wasmBaseUrl?: string; modelAssetPath?: string } = {}) {
    return this.request<VisionInitializationResult>({
      type: "init",
      requestId: createRequestId(),
      wasmBaseUrl: options.wasmBaseUrl ?? DEFAULT_VISION_WASM_BASE_URL,
      modelAssetPath: options.modelAssetPath ?? DEFAULT_FACE_LANDMARKER_MODEL_URL,
    });
  }

  onResult(listener: (result: VisionDetectionResult) => void) {
    this.resultListeners.add(listener);
    return () => this.resultListeners.delete(listener);
  }

  onError(listener: (error: Error) => void) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  processFrame(frame: ImageBitmap, timestampMs = performance.now()) {
    this.worker.postMessage(
      {
        type: "process",
        requestId: createRequestId(),
        frame,
        timestampMs,
      } satisfies VisionWorkerRequest,
      [frame],
    );
  }

  async dispose() {
    await this.request<Extract<VisionWorkerResponse, { type: "disposed" }>>({
      type: "dispose",
      requestId: createRequestId(),
    });
    this.worker.terminate();
  }
}

export function createVisionWorkerClient() {
  return new VisionWorkerClient();
}
