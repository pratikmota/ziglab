"use client";

import { MockAdapter } from "@/lib/execution/mock-adapter";
import type {
  ExecutionAdapter,
  FormatResult,
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

/** Known-ugly input: zig fmt must rewrite spaces around `=`. */
const FMT_PROBE_SOURCE = "const x=1;";

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
  format?: (code: string) => Promise<FormatResult>;

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
    this.format = undefined;
    const loaded = await this.host.preload(this.artifacts);
    if (!loaded.ok) {
      this.readyStatus = "unavailable";
      return this.readyStatus;
    }
    if (await this.probeFormat()) {
      this.format = (code) => this.formatSource(code);
    }
    this.readyStatus = "idle";
    return this.readyStatus;
  }

  private async probeFormat(): Promise<boolean> {
    const result = await this.host.format({
      code: FMT_PROBE_SOURCE,
      artifacts: this.artifacts,
      compileTimeoutMs: this.compileTimeoutMs,
    });
    if (!result.ok) return false;
    const rewritten = normalizeOutput(result.code);
    if (rewritten === FMT_PROBE_SOURCE || rewritten.trim() === FMT_PROBE_SOURCE) {
      return false;
    }
    return rewritten.includes("x = 1");
  }

  private async formatSource(code: string): Promise<FormatResult> {
    const status = await this.ensureReady();
    if (status === "unavailable") {
      return { ok: false, code, stderr: "unavailable", durationMs: 0 };
    }
    const result = await this.host.format({
      code,
      artifacts: this.artifacts,
      compileTimeoutMs: this.compileTimeoutMs,
    });
    return {
      ok: result.ok,
      code: result.ok ? result.code : code,
      stderr: result.stderr,
      durationMs: result.durationMs,
    };
  }
}
