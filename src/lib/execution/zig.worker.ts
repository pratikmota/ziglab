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
import type { HostRunResult } from "./wasi-guest";
import { WASM_LOAD_TIMEOUT_MS } from "./wasm-limits";
import type { ZigWorkerEvent, ZigWorkerRequest } from "./wasi-protocol";
import type { Inode } from "@bjorn3/browser_wasi_shim";

const artifactCache = new Map<string, Uint8Array>();
const libTreeCache = new Map<string, Map<string, Inode>>();

function post(event: ZigWorkerEvent): void {
  postMessage(event);
}

function asResult(err: unknown): HostRunResult {
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
  return {
    ok: false,
    stdout: "",
    stderr: `unavailable: ${message}`,
    exitCode: null,
    durationMs: 0,
    errorKind: "unavailable",
  };
}

async function libTreeFor(stdUrl: string, stdArchive: Uint8Array): Promise<Map<string, Inode>> {
  const hit = libTreeCache.get(stdUrl);
  if (hit) return cloneInodeTree(hit);
  const tree = await unpackStdLib(stdArchive);
  libTreeCache.set(stdUrl, tree);
  return cloneInodeTree(tree);
}

async function handleRun(req: ZigWorkerRequest): Promise<void> {
  const oversized = rejectOversizedSource(req.code);
  if (oversized) {
    post({ type: "result", id: req.id, result: oversized });
    return;
  }

  post({ type: "stage", id: req.id, stage: "fetch" });
  const loaded = await fetchZigArtifacts(req.artifacts, {
    cache: artifactCache,
    signal: loadTimeoutSignal(req.loadTimeoutMs ?? WASM_LOAD_TIMEOUT_MS),
  });
  const libTree = await libTreeFor(req.artifacts.stdUrl, loaded.stdArchive);

  post({ type: "stage", id: req.id, stage: "compile" });
  const compiled = await compileZigSource(req.code, loaded, libTree);
  if (!compiled.ok) {
    post({ type: "result", id: req.id, result: compiled.result });
    return;
  }

  post({ type: "stage", id: req.id, stage: "run" });
  const ran = await runCompiledWasm(compiled.wasm);
  post({
    type: "result",
    id: req.id,
    result: { ...ran, durationMs: compiled.durationMs + ran.durationMs },
  });
}

addEventListener("message", (event: MessageEvent<ZigWorkerRequest>) => {
  const data = event.data;
  if (!data || data.type !== "run") return;
  void handleRun(data).catch((err: unknown) => {
    post({ type: "result", id: data.id, result: asResult(err) });
  });
});
