import {
  createVisionWorkerClient,
  type VisionInitializationResult,
} from "./vision.client";

export async function runVisionInitializationSmokeTest(): Promise<VisionInitializationResult> {
  const client = createVisionWorkerClient();
  try {
    return await client.initialize();
  } finally {
    await client.dispose();
  }
}
