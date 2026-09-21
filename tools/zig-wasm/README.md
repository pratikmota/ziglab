# ZigLab WASM toolchain

Standalone **build-machine** tools. Not part of the Next.js app. Do not import this folder from `src/`. macOS/Linux (`sh`, `rsync`, `patch`, `curl`).

Cross-compiles official Zig (pin in [`VERSION`](VERSION)) to `wasm32-wasi`. A Node spike then compiles Hello World from **local** artifacts. Visitors never download Zig source.

## How the build works

```
VERSION pin
  → fetch-source.sh     official tarball → gitignored .cache/zig-{ver}/
  → prepare-source.sh   copy + patches  → gitignored .vendor/zig-{ver}/
  → zig build           compiler to wasm → gitignored dist/{ver}/
  → spike/npm start     WASI compile + run Hello World
```

| Path | Git | What |
| --- | --- | --- |
| `VERSION` | commit | version, URL, sha256, minisig |
| `patches/` | commit | tiny WASI diffs |
| `.cache/zig-{ver}/` | ignore | unmodified official extract (and tarball) |
| `.vendor/zig-{ver}/` | ignore | patched tree used to compile `zig.wasm` |
| `dist/{ver}/` | ignore | `zig.wasm` + `lib/` + `libcompiler_rt.a` + `LICENSE` |

`zig build --release=small` runs fetch before compile. If `.cache/zig-{ver}/src/main.zig` already exists, **nothing is downloaded**. If the cache is empty but `../../../ziglang-source/zig-{ver}` exists (old sibling unpack), that tree is copied into `.cache` once.

## What you need

1. **Host Zig** on PATH matching `hostZig` in `VERSION` (native OS binary from [ziglang.org/download](https://ziglang.org/download/) — not wasm).
2. Network only on the **first** fetch (or copy from the sibling unpack). Prefer [community mirrors](https://ziglang.org/download/) in CI later so we do not hammer ziglang.org.

Git fallback for the same tag: Codeberg tag matching `VERSION` ([ziglang/zig tags](https://codeberg.org/ziglang/zig/tags)), not GitHub. This toolchain uses the signed ziglang.org tarball.

Override extract path: `zig build -Dzig-source=/abs/path` (still must be official source for that version).

## Bootstrap is unused

`zig-bootstrap-*.tar.xz` is LLVM/Clang/LLD so you can bootstrap a **native** Zig from C. You already have host Zig. Do not point `-Dzig-source` at bootstrap.

## Reproduce

```bash
cd tools/zig-wasm
zig version          # must match VERSION hostZig
zig build --release=small
cd spike && npm install && npm start
```

Disk: source extract ~280M, vendor copy ~280M, `dist/` ~243M. Compile of `zig.wasm` is about 35–50s after the one-time copy.

Writes `dist/{version}/`:

| Artifact | Typical size |
| --- | --- |
| `zig.wasm` | ~3.8M |
| `lib/` | ~239M (full std tree the compiler expects under `/lib`) |
| `libcompiler_rt.a` | ~165K (self-hosted wasm backend cannot compile compiler-rt) |
| `LICENSE` | Zig MIT (copied from official source) |
| `NOTICE` | Attribution for Zig + WASI shim |

## Spike (Hello World)

Loads **only** `../dist/{version}/` (no ziglang.org, no GitHub). Guest WASI has no network.

Preopens: `.` (user file), `/lib`, `/cache`. Do **not** pass `--zig-lib-dir /lib` — WASI `path_open` rejects absolute paths (`AccessDenied`); official Zig finds `/lib` and `/cache` via preopens.

Expected print: `Hello, ZigLab` (`std.debug.print` goes to stderr on 0.16; the spike accepts stdout or stderr). Logs `compiling…` then `running…`.

`SPIKE_STRACE=1 npm start` logs WASI syscalls.

## Nested compiler flags

`-Dtarget=wasm32-wasi --release=small -Ddev=wasm -Dno-lib -Dversion-string={ver}`

- `-Ddev=wasm` — reduced feature set (wasm backend). Our devenv patch also enables `legalize` (required to emit wasm) and drops `stdio_listen` / `incremental`.
- `-Dno-lib` — std is copied into `dist/`, not embedded in `zig.wasm`.
- Threaded IO (default). `-Dio-mode=evented` does not compile on WASI (`std.Io.Evented` is `void`).

## Patches (vendor copy only)

Only `patches/zig-{version}-*.patch` are applied (so 0.16 hunks are not reused for 0.17).

- `patches/zig-0.16.0-wasi-devenv.patch` — enable `legalize` on `-Ddev=wasm`.
- `patches/zig-0.16.0-wasi-self-exe.patch` — WASI `self_exe_path` is `void`; skip `zig run` / `zig test` exec.

Changing a matching `.patch` file re-copies vendor and re-applies. Delete `.vendor/` to start clean. A new version likely needs new hunks, not only a `VERSION` bump.

## Adding another Zig version

1. Change `VERSION` (`zigVersion`, URLs, sha256, `hostZig` if needed).
2. Add patches if they fail to apply.
3. `zig build --release=small` writes `dist/{newVersion}/` (do not reuse the previous folder).
4. Add a catalog row in `src/lib/zig-version.ts` (`zigPlayVersions`).

## Host proof

After `dist/{version}/` exists, from the repo root:

```bash
pnpm exec tsx tools/zig-wasm/host-proof.mjs
```

Tars `lib/` to gitignored `dist/{version}/std.tar` if needed (or if older than `lib/`), serves it on loopback, and runs Hello World + syntax error + oversized source through `ZigWasiHost({ mode: "in-process" })`. Version is read from `VERSION`; the host itself has no version literals.

Host argv, timeouts, and caps: [`src/lib/execution/README.md`](../../src/lib/execution/README.md).

## Publish for the playground

Copy dist into Next `public/wasm/{version}/` (gitignored, same-origin):

```bash
# from repo root, after zig build --release=small
pnpm wasm:publish
```

Writes `zig.wasm`, `std.tar.gz`, and `compiler_rt.a`. Publish copies dist `libcompiler_rt.a` as `compiler_rt.a` (catalog URL name). The catalog in `src/lib/zig-version.ts` points at those URLs. Missing files → mock fallback, not a fake compile.

## License and attribution

- ZigLab toolchain code: MIT ([repository LICENSE](../../LICENSE)).
- Official Zig source, `zig.wasm`, `lib/`, and `compiler_rt`: MIT. Keep [NOTICE](NOTICE) and `dist/{ver}/LICENSE` with any redistributed artifacts. Patches are allowed modifications of that MIT source.
- Spike WASI helper `@bjorn3/browser_wasi_shim`: MIT OR Apache-2.0 (npm). Not wasi-zigc; not zigtools/playground source.
- Not affiliated with the Zig Software Foundation. Zig marks belong to their owners.

## Build log

Example on one machine (Zig 0.16.0, macOS arm64): source ziglang.org `zig-0.16.0.tar.xz` (sha256 in `VERSION`); spike prints `Hello, ZigLab` and exits 0. After `pnpm wasm:publish`, `/play` loads those same-origin artifacts.
