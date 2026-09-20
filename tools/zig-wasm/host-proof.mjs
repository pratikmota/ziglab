#!/usr/bin/env node
/**
 * 07-2 host proof. Not the product UI.
 *
 *   pnpm exec tsx tools/zig-wasm/host-proof.mjs
 *
 * Requires local 07-1 dist/{zigVersion}/ from `zig build --release=small`.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ZigWasiHost } from "../../src/lib/execution/wasi-host.ts";
import { WASM_SOURCE_MAX_BYTES } from "../../src/lib/execution/wasm-limits.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

function readVersionPin() {
  const text = fs.readFileSync(path.join(here, "VERSION"), "utf8");
  /** @type {Record<string, string>} */
  const pin = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    pin[line.slice(0, i)] = line.slice(i + 1);
  }
  if (!pin.zigVersion) throw new Error("VERSION is missing zigVersion");
  return pin;
}

function requireFile(abs, hint) {
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing ${abs}. ${hint}`);
  }
  return abs;
}

function ensureStdTar(distDir) {
  const tarPath = path.join(distDir, "std.tar");
  const libDir = requireFile(path.join(distDir, "lib"), "Run zig build --release=small in tools/zig-wasm.");
  const tarFresh =
    fs.existsSync(tarPath) && fs.statSync(tarPath).mtimeMs >= fs.statSync(libDir).mtimeMs;
  if (tarFresh) return tarPath;
  console.error(`creating ${tarPath} from lib/ (gitignored)…`);
  const packed = spawnSync("tar", ["-C", libDir, "-cf", tarPath, "."], { stdio: "inherit" });
  if (packed.status !== 0) throw new Error("tar of lib/ failed");
  return tarPath;
}

function serveDist(distDir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const abs = path.resolve(distDir, rel);
    if (!abs.startsWith(distDir + path.sep) && abs !== distDir) {
      res.writeHead(403).end();
      return;
    }
    if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "application/octet-stream" });
    fs.createReadStream(abs).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function greetingIn(result) {
  return `${result.stdout}\n${result.stderr}`.includes("Hello, ZigLab");
}

async function main() {
  const { zigVersion } = readVersionPin();
  const distDir = path.resolve(here, `dist/${zigVersion}`);
  requireFile(
    path.join(distDir, "zig.wasm"),
    "Run: cd tools/zig-wasm && zig build --release=small",
  );
  const crt = ["libcompiler_rt.a", "compiler_rt.a"]
    .map((name) => path.join(distDir, name))
    .find((p) => fs.existsSync(p));
  ensureStdTar(distDir);

  const helloPath = path.join(repoRoot, "content/playground/hello.zig");
  const hello = fs.readFileSync(requireFile(helloPath, "Expected playground hello.zig"), "utf8");

  const server = await serveDist(distDir);
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("loopback server failed");
  const base = `http://127.0.0.1:${addr.port}`;
  const artifacts = {
    moduleUrl: `${base}/zig.wasm`,
    stdUrl: `${base}/std.tar`,
    compilerRtUrl: crt ? `${base}/${path.basename(crt)}` : undefined,
  };

  const host = new ZigWasiHost({ mode: "in-process" });
  /** Hello World compile was ~4–9s in the 07-1 spike; load/unpack is not in this budget. */
  const compileTimeoutMs = 60_000;
  const runTimeoutMs = 10_000;

  try {
    console.error("1/3 hello.zig…");
    const helloResult = await host.run({
      code: hello,
      artifacts,
      compileTimeoutMs,
      runTimeoutMs,
    });
    if (!helloResult.ok || !greetingIn(helloResult)) {
      console.error(helloResult);
      throw new Error("hello.zig did not print Hello, ZigLab");
    }
    console.error(`   ok  exit=${helloResult.exitCode} ${helloResult.durationMs}ms`);

    console.error("2/3 syntax error…");
    const broken = await host.run({
      code: "pub fn main() void {\n",
      artifacts,
      compileTimeoutMs,
      runTimeoutMs,
    });
    if (broken.ok || !broken.stderr.trim()) {
      console.error(broken);
      throw new Error("syntax error should return ok: false with stderr");
    }
    console.error(`   ok  compile failed as expected (${broken.stderr.split("\n")[0]})`);

    console.error("3/3 oversized source…");
    const oversized = await host.run({
      code: "a".repeat(WASM_SOURCE_MAX_BYTES + 1),
      artifacts,
      compileTimeoutMs,
      runTimeoutMs,
    });
    if (oversized.ok || oversized.errorKind !== "source_too_large") {
      console.error(oversized);
      throw new Error("oversized source should be rejected without compiling");
    }
    console.error("   ok  rejected before instantiate");
  } finally {
    host.dispose();
    await new Promise((resolve) => server.close(resolve));
  }

  console.error("host-proof passed");
}

await main();
