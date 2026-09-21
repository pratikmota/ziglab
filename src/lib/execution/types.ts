/** Catalog id for an offered playground compiler (`zigPlayVersions[].id`). */
export type ZigChannel = string;

export type RunStatus =
  | "idle"
  | "loading"
  | "running"
  | "ok"
  | "error"
  | "unavailable";

export type RunRequest = {
  code: string;
  channel: ZigChannel;
  timeoutMs?: number;
  matchSources?: string[];
  expectedOutput?: string;
};

export type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  compilerLabel: string;
  preview?: boolean;
};

export type FormatResult = {
  ok: boolean;
  code: string;
  stderr: string;
  durationMs: number;
};

export interface ExecutionAdapter {
  id: string;
  channel: ZigChannel;
  label: string;
  status: () => RunStatus | Promise<RunStatus>;
  run: (req: RunRequest) => Promise<RunResult>;
  format?: (code: string) => Promise<FormatResult>;
  dispose?: () => void | Promise<void>;
}
