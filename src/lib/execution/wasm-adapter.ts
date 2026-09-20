"use client";

import { MockAdapter } from "@/lib/execution/mock-adapter";
import type {
  ExecutionAdapter,
  RunRequest,
  RunResult,
  RunStatus,
  ZigChannel,
} from "@/lib/execution/types";
import { ZigWasiHost } from "@/lib/execution/wasi-host";
import type { ZigWasmArtifacts } from "@/lib/execution/wasi-guest";
import { zigVersionLabel } from "@/lib/zig-version";

function normalizeOutput(text: string) {
  return text.replace(/\r\n/g, "\n");
}

function matchesExpected(stdout: string, stderr: string, expected: string) {
  const want = normalizeOutput(expected).trim();
  if (!want) return true;
  const streams = [normalizeOutput(stdout), normalizeOutput(stderr)];
  if (`${streams[0]}\n${streams[1]}`.trim() === want) return true;
  for (const stream of streams) {
    for (const line of stream.split("\n")) {
      if (line.trim() === want) return true;
    }
  }
  return false;
}

export class WasmAdapter implements ExecutionAdapter {
  readonly id: string;
  readonly channel: ZigChannel;
  readonly label: string;
  readonly compilerLabel: string;

  private readonly artifacts: ZigWasmArtifacts;
  private readonly compileTimeoutMs: number;
  private readonly runTimeoutMs: number;
  private readonly host = new ZigWasiHost();
  private readonly mock: MockAdapter;
  private ready: Promise<RunStatus> | null = null;
  private readyStatus: RunStatus = "loading";

  constructor({
    channel,
    artifacts,
    compileTimeoutMs,
    runTimeoutMs,
  }: {
    channel: ZigChannel;
    artifacts: ZigWasmArtifacts;
    compileTimeoutMs: number;
    runTimeoutMs: number;
  }) {
    this.channel = channel;
    this.id = `wasm-${channel}`;
    this.artifacts = artifacts;
    this.compileTimeoutMs = compileTimeoutMs;
    this.runTimeoutMs = runTimeoutMs;
    this.label = zigVersionLabel(channel);
    this.compilerLabel = zigVersionLabel(channel);
    this.mock = new MockAdapter(channel);
    this.ready = this.preload();
  }

  status(): RunStatus | Promise<RunStatus> {
    if (this.readyStatus !== "loading") return this.readyStatus;
    return this.ensureReady();
  }

  async run(req: RunRequest): Promise<RunResult> {
    const status = await this.ensureReady();
    if (status === "unavailable") {
      return this.mock.run(req);
    }

    const hostResult = await this.host.run({
      code: req.code,
      artifacts: this.artifacts,
      compileTimeoutMs: this.compileTimeoutMs,
      runTimeoutMs: this.runTimeoutMs,
    });

    let ok = hostResult.ok;
    if (ok && req.expectedOutput) {
      ok = matchesExpected(hostResult.stdout, hostResult.stderr, req.expectedOutput);
    }

    return {
      ok,
      stdout: hostResult.stdout,
      stderr: hostResult.stderr,
      exitCode: hostResult.exitCode,
      durationMs: hostResult.durationMs,
      compilerLabel: this.compilerLabel,
    };
  }

  dispose(): void {
    this.host.dispose();
  }

  private async ensureReady(): Promise<RunStatus> {
    if (!this.ready) this.ready = this.preload();
    return this.ready;
  }

  private async preload(): Promise<RunStatus> {
    this.readyStatus = "loading";
    const loaded = await this.host.preload(this.artifacts);
    this.readyStatus = loaded.ok ? "idle" : "unavailable";
    return this.readyStatus;
  }
}
