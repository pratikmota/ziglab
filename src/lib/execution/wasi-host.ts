import {
  cloneInodeTree,
  compileZigSource,
  fetchZigArtifacts,
  loadTimeoutSignal,
  rejectOversizedSource,
  runCompiledWasm,
  unpackStdLib,
  WasiGuestError,
} from "./wasi-guest";
import type { HostRunRequest, HostRunResult } from "./wasi-guest";
import {
  WASM_COMPILE_TIMEOUT_MS,
  WASM_LOAD_TIMEOUT_MS,
  WASM_RUN_TIMEOUT_MS,
} from "./wasm-limits";
import type { ZigWorkerEvent, ZigWorkerRequest } from "./wasi-protocol";
import type { Inode } from "@bjorn3/browser_wasi_shim";

export type {
  HostRunRequest,
  HostRunResult,
  LoadedZigArtifacts,
  ZigWasmArtifacts,
} from "./wasi-guest";
export { rejectOversizedSource, WasiGuestError } from "./wasi-guest";

export type ZigWasiHostMode = "worker" | "in-process";

export type ZigWasiHostOptions = {
  /** Default `worker`. `in-process` is for the Node proof only — do not use on the Next server. */
  mode?: ZigWasiHostMode;
};

type TimeoutStage = "load" | "compile" | "run";

function timeoutResult(_stage: TimeoutStage, durationMs: number): HostRunResult {
  return {
    ok: false,
    stdout: "",
    stderr: "timed out",
    exitCode: null,
    durationMs,
    errorKind: "timeout",
  };
}

function unavailable(message: string): HostRunResult {
  return {
    ok: false,
    stdout: "",
    stderr: message,
    exitCode: null,
    durationMs: 0,
    errorKind: "unavailable",
  };
}

function asHostResult(err: unknown): HostRunResult {
  if (err instanceof WasiGuestError) {
    return {
      ok: false,
      stdout: "",
      stderr: err.kind === "timeout" ? "timed out" : err.message,
      exitCode: null,
      durationMs: 0,
      errorKind: err.kind,
    };
  }
  const message = err instanceof Error ? err.message : "unavailable";
  return unavailable(`unavailable: ${message}`);
}

type PendingJob = {
  id: number;
  loadTimeoutMs: number;
  compileTimeoutMs: number;
  runTimeoutMs: number;
  loadStartedAt: number | null;
  compileStartedAt: number | null;
  runStartedAt: number | null;
  timer: ReturnType<typeof setTimeout> | null;
  resolve: (result: HostRunResult) => void;
};

function browserWorkersAvailable(): boolean {
  return typeof Worker !== "undefined" && typeof window !== "undefined";
}

/**
 * One-at-a-time WASI host. Default mode uses a browser Worker so compile/run
 * timeouts abort via worker.terminate() (WASI _start is synchronous).
 * Next.js must import this from a client module only.
 */
export class ZigWasiHost {
  private readonly mode: ZigWasiHostMode;
  private worker: Worker | null = null;
  private nextId = 1;
  private queue: Promise<void> = Promise.resolve();
  private pending: PendingJob | null = null;
  private disposed = false;
  private readonly artifactCache = new Map<string, Uint8Array>();
  private readonly libTreeCache = new Map<string, Map<string, Inode>>();

  constructor(options: ZigWasiHostOptions = {}) {
    this.mode = options.mode ?? "worker";
  }

  async run(req: HostRunRequest): Promise<HostRunResult> {
    if (this.disposed) return unavailable("unavailable: host has been disposed");
    const oversized = rejectOversizedSource(req.code);
    if (oversized) return oversized;

    return this.enqueue(async () => {
      if (this.disposed) return unavailable("unavailable: host has been disposed");
      if (this.mode === "in-process") return this.runInProcess(req);
      if (!browserWorkersAvailable()) {
        return unavailable(
          "unavailable: WASI host requires a browser Worker (do not import from the server)",
        );
      }
      return this.runInWorker(req);
    });
  }

  dispose(): void {
    this.disposed = true;
    this.clearTimer();
    if (this.pending) {
      this.pending.resolve(unavailable("unavailable: host has been disposed"));
      this.pending = null;
    }
    this.worker?.terminate();
    this.worker = null;
  }

  private enqueue(fn: () => Promise<HostRunResult>): Promise<HostRunResult> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async runInProcess(req: HostRunRequest): Promise<HostRunResult> {
    try {
      const loadTimeoutMs = req.loadTimeoutMs ?? WASM_LOAD_TIMEOUT_MS;
      const loaded = await fetchZigArtifacts(req.artifacts, {
        cache: this.artifactCache,
        signal: loadTimeoutSignal(loadTimeoutMs),
      });
      let tree = this.libTreeCache.get(req.artifacts.stdUrl);
      if (!tree) {
        tree = await unpackStdLib(loaded.stdArchive);
        this.libTreeCache.set(req.artifacts.stdUrl, tree);
      }
      const compiled = await compileZigSource(req.code, loaded, cloneInodeTree(tree));
      if (!compiled.ok) return compiled.result;
      const ran = await runCompiledWasm(compiled.wasm);
      return { ...ran, durationMs: compiled.durationMs + ran.durationMs };
    } catch (err) {
      return asHostResult(err);
    }
  }

  private runInWorker(req: HostRunRequest): Promise<HostRunResult> {
    const worker = this.ensureWorker();
    const id = this.nextId;
    this.nextId += 1;
    const loadTimeoutMs = req.loadTimeoutMs ?? WASM_LOAD_TIMEOUT_MS;
    const compileTimeoutMs = req.compileTimeoutMs ?? WASM_COMPILE_TIMEOUT_MS;
    const runTimeoutMs = req.runTimeoutMs ?? WASM_RUN_TIMEOUT_MS;

    return new Promise((resolve) => {
      this.pending = {
        id,
        loadTimeoutMs,
        compileTimeoutMs,
        runTimeoutMs,
        loadStartedAt: null,
        compileStartedAt: null,
        runStartedAt: null,
        timer: null,
        resolve,
      };
      const message: ZigWorkerRequest = {
        type: "run",
        id,
        code: req.code,
        artifacts: req.artifacts,
        loadTimeoutMs,
      };
      worker.postMessage(message);
    });
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    this.worker = new Worker(new URL("./zig.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.addEventListener("message", (event: MessageEvent<ZigWorkerEvent>) => {
      this.onWorkerEvent(event.data);
    });
    this.worker.addEventListener("error", (event) => {
      const pending = this.pending;
      if (!pending) return;
      this.pending = null;
      this.clearTimer();
      pending.resolve(unavailable(`unavailable: ${event.message || "worker error"}`));
      this.recycleWorker();
    });
    return this.worker;
  }

  private onWorkerEvent(event: ZigWorkerEvent | undefined): void {
    const pending = this.pending;
    if (!pending || !event || event.id !== pending.id) return;

    if (event.type === "stage") {
      if (event.stage === "fetch") {
        pending.loadStartedAt = Date.now();
        this.armTimer(pending, "load", pending.loadTimeoutMs);
      } else if (event.stage === "compile") {
        pending.compileStartedAt = Date.now();
        this.armTimer(pending, "compile", pending.compileTimeoutMs);
      } else if (event.stage === "run") {
        pending.runStartedAt = Date.now();
        this.armTimer(pending, "run", pending.runTimeoutMs);
      }
      return;
    }

    this.clearTimer();
    this.pending = null;
    pending.resolve(event.result);
  }

  private armTimer(job: PendingJob, stage: TimeoutStage, ms: number): void {
    this.clearTimer();
    const startedAt =
      stage === "load"
        ? (job.loadStartedAt ?? Date.now())
        : stage === "compile"
          ? (job.compileStartedAt ?? Date.now())
          : (job.runStartedAt ?? Date.now());
    job.timer = setTimeout(() => {
      if (this.pending !== job) return;
      this.pending = null;
      this.recycleWorker();
      job.resolve(timeoutResult(stage, Date.now() - startedAt));
    }, ms);
  }

  private clearTimer(): void {
    if (!this.pending?.timer) return;
    clearTimeout(this.pending.timer);
    this.pending.timer = null;
  }

  private recycleWorker(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
