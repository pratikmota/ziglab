# ZigLab WASI host

Version-agnostic compile/run host. Artifact **URLs** come from the caller (catalog in `zig-version.ts` / toolchain `dist/`). This folder does not hardcode a Zig version. Build and publish artifacts: [`tools/zig-wasm/README.md`](../../tools/zig-wasm/README.md).

`acquireAdapter()` returns `WasmAdapter` for the offered catalog row when the app runs in the browser. **Import `ZigWasiHost` from a client module only** — the default mode requires `window` + `Worker` and will not run WASI on the Next server. `releaseAdapter()` disposes the worker when the last playground unmounts.

## API

```ts
const host = new ZigWasiHost(); // browser Worker (default)
const result = await host.run({
  code,
  artifacts: { moduleUrl, stdUrl, compilerRtUrl },
  loadTimeoutMs,    // optional; default 120s for fetch + tar unpack
  compileTimeoutMs, // optional; default 5s after WASI zig.wasm _start
  runTimeoutMs,     // optional; default 2s after guest program _start
});
host.dispose(); // worker.terminate(); drops queued jobs
```

Node proof only: `new ZigWasiHost({ mode: "in-process" })`. That path cannot abort a stuck WASI `_start`.

`stdUrl` must be a **tar** (optionally gzip) of the compiler `lib/` tree, not a directory listing. The worker unpacks it into preopen `/lib` (cached by URL; each compile gets a cloned readonly tree).

## Guest argv and preopens

Compile:

```
zig.wasm build-exe main.zig -fno-llvm -fno-lld
# when compilerRtUrl is set:
libcompiler_rt.a -fno-compiler-rt -fno-entry
```

Empty env. Preopens:

| Guest path | Contents |
| --- | --- |
| `.` | in-memory `main.zig` (+ `libcompiler_rt.a`) |
| `/lib` | unpacked std archive |
| `/cache` | empty |

Do **not** pass `--zig-lib-dir /lib`. WASI `path_open` rejects absolute paths.

The HTTP artifact may be named `compiler_rt.a` (catalog / `public/wasm/`); the guest cwd always exposes it as `libcompiler_rt.a`.

A second WASI instance runs `main.wasm` with `.` empty, fds 0/1/2 as stdin + captured stdout/stderr strings. Guest `sock_*` returns WASI `ENOTSUP`. No real FS, no env secrets.

## Timeouts vs fetch

| Stage | Clock starts | Default |
| --- | --- | --- |
| Load | worker `fetch` stage (HTTP + tar unpack) | 120s |
| Compile | WASI zig.wasm `_start` (after load) | 5s |
| Run | guest program `_start` | 2s |

Hello World compile on toolchain artifacts was ~2–9s depending on machine. The 5s default is the requirement 12.2 example; proofs and the catalog should pass a measured `compileTimeoutMs`. Live playground value: `zigPlayVersions[].compileTimeoutMs` in [`src/lib/zig-version.ts`](../zig-version.ts) (currently 60s; the host-proof uses the same budget).

WASI `_start` is synchronous. Aborting a stuck compile/run uses `worker.terminate()` (browser). In-process mode cannot kill mid-`_start`. Fetch uses `AbortSignal.timeout`.

## Caps (`wasm-limits.ts`)

| Cap | Default |
| --- | --- |
| Source | 64KB (reject before instantiate) |
| Artifact body (zig.wasm / std / crt) | 512MB |
| Load | 120s |
| Compile | 5s |
| Run | 2s |
| Captured stdout/stderr | truncate at 128KB |
| `WebAssembly.Memory` | abort if over 512MB (`zig.wasm` already wants ~48MB stack; `memory.grow` wrapped in JS, checked again after `_start`) |

## stderr vs stdout

Zig 0.16 `std.debug.print` writes **stderr**. Keep streams separate in `HostRunResult`. Hello World proofs accept the greeting in stdout **or** stderr.

## Proof (local toolchain `dist/`)

From the repo root, after `zig build --release=small` in `tools/zig-wasm`:

```bash
pnpm exec tsx tools/zig-wasm/host-proof.mjs
```

The script reads `tools/zig-wasm/VERSION` for the dist folder, tars `lib/` to gitignored `dist/{ver}/std.tar` if missing or older than `lib/`, and serves artifacts on loopback. It does not copy files into `public/`.
