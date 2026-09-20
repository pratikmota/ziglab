import type { HostRunResult, ZigWasmArtifacts } from "./wasi-guest";

export type ZigWorkerRequest = {
  type: "run";
  id: number;
  code: string;
  artifacts: ZigWasmArtifacts;
  loadTimeoutMs?: number;
};

export type ZigWorkerStage = "fetch" | "compile" | "run";

export type ZigWorkerEvent =
  | { type: "stage"; id: number; stage: ZigWorkerStage }
  | { type: "result"; id: number; result: HostRunResult };
