export type VisionSignalType = "face_present" | "face_absent" | "head_movement";
export type HeadDirection = "left" | "right" | "up" | "down" | "center";

export type VisionSignal = {
  type: VisionSignalType;
  timestampMs: number;
  confidence?: number;
  metadata?: {
    direction?: HeadDirection;
    yaw?: number;
    pitch?: number;
    landmarkCount?: number;
  };
};

export type VisionTask = "face";

export type VisionWorkerRequest =
  | {
      type: "init";
      requestId: string;
      wasmBaseUrl: string;
      modelAssetPath?: string;
    }
  | {
      type: "process";
      requestId: string;
      timestampMs: number;
      frame: ImageBitmap;
    }
  | {
      type: "dispose";
      requestId: string;
    };

export type VisionWorkerResponse =
  | {
      type: "ready";
      requestId: string;
      runtimeInitialized: boolean;
      modelInitialized: boolean;
      task: VisionTask;
    }
  | {
      type: "result";
      requestId: string;
      timestampMs: number;
      facePresent: boolean;
      headDirection: HeadDirection | null;
      lookingAway: null;
      lookingAwaySupported: false;
      signals: VisionSignal[];
      landmarkCount: number;
      modelInitialized: boolean;
    }
  | {
      type: "disposed";
      requestId: string;
    }
  | {
      type: "error";
      requestId: string;
      message: string;
    };
