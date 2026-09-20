import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
  PreopenDirectory,
  Directory,
  strace,
} from "@bjorn3/browser_wasi_shim";

const spikeDir = path.dirname(fileURLToPath(import.meta.url));

function readVersionPin() {
  const text = fs.readFileSync(path.join(spikeDir, "../VERSION"), "utf8");
  const pin = {};
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    pin[line.slice(0, i)] = line.slice(i + 1);
  }
  if (!pin.zigVersion) {
    throw new Error("VERSION is missing zigVersion");
  }
  return pin;
}

const zigVersion = readVersionPin().zigVersion;
const distDir = path.resolve(spikeDir, `../dist/${zigVersion}`); // matches build.zig dist/{ver}
const helloPath = path.join(spikeDir, "hello.zig");

const stdoutChunks = [];
const stderrChunks = [];

function lineCapture(chunks) {
  return ConsoleStdout.lineBuffered((line) => {
    chunks.push(line);
  });
}

function loadInode(absPath) {
  const stat = fs.statSync(absPath);
  if (stat.isDirectory()) {
    const entries = new Map();
    for (const name of fs.readdirSync(absPath)) {
      if (name === "." || name === "..") continue;
      entries.set(name, loadInode(path.join(absPath, name)));
    }
    return new Directory(entries);
  }
  return new File(fs.readFileSync(absPath));
}

function requireFile(rel) {
  const abs = path.join(distDir, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing artifact ${abs}. Run: zig build --release=small (from tools/zig-wasm)`);
  }
  return abs;
}

async function compile(source) {
  const zigWasm = fs.readFileSync(requireFile("zig.wasm"));
  const libDir = loadInode(requireFile("lib"));
  const crtName = ["libcompiler_rt.a", "compiler_rt.a"].find((name) =>
    fs.existsSync(path.join(distDir, name))
  );
  const cwdEntries = new Map([
    ["main.zig", new File(new TextEncoder().encode(source))],
  ]);
  // Self-hosted wasm backend (no LLVM/LLD inside the guest compiler).
  const compileArgs = ["zig.wasm", "build-exe", "main.zig", "-fno-llvm", "-fno-lld"];
  if (crtName) {
    cwdEntries.set("libcompiler_rt.a", new File(fs.readFileSync(path.join(distDir, crtName))));
    compileArgs.push("libcompiler_rt.a", "-fno-compiler-rt", "-fno-entry");
  }

  // Do not pass --zig-lib-dir /lib: WASI path_open rejects absolute paths.
  const wasi = new WASI(
    compileArgs,
    [],
    [
      new OpenFile(new File([])),
      lineCapture(stdoutChunks),
      lineCapture(stderrChunks),
      new PreopenDirectory(".", cwdEntries),
      new PreopenDirectory("/lib", libDir.contents),
      new PreopenDirectory("/cache", new Map()),
    ],
    { debug: false }
  );

  const wasiImport =
    process.env.SPIKE_STRACE === "1" ? strace(wasi.wasiImport, []) : wasi.wasiImport;
  const { instance } = await WebAssembly.instantiate(zigWasm, {
    wasi_snapshot_preview1: wasiImport,
  });
  try {
    return { exitCode: wasi.start(instance), cwd: wasi.fds[3] }; // fd 3 is preopen "."
  } catch (err) {
    const log = [...stdoutChunks, ...stderrChunks].join("\n");
    if (log) console.error(log);
    throw err;
  }
}

async function runProgram(wasmBytes) {
  const runOut = [];
  const runErr = [];
  const wasi = new WASI(
    ["main.wasm"],
    [],
    [
      new OpenFile(new File([])),
      lineCapture(runOut),
      lineCapture(runErr),
      new PreopenDirectory(".", new Map()),
    ],
    { debug: false }
  );
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });
  const exitCode = wasi.start(instance);
  return { exitCode, stdout: runOut.join("\n"), stderr: runErr.join("\n") };
}

console.error(`compiling hello.zig with zig.wasm ${zigVersion}…`);
const source = fs.readFileSync(helloPath, "utf8");
const compiled = await compile(source);
const compileLog = [...stdoutChunks, ...stderrChunks].join("\n");
if (compileLog) {
  console.error(compileLog);
}
if (compiled.exitCode !== 0) {
  console.error(`compile failed: exit ${compiled.exitCode}`);
  process.exit(1);
}

const mainWasm = compiled.cwd.dir.contents.get("main.wasm");
if (!mainWasm) {
  console.error("compile succeeded but main.wasm was not produced");
  process.exit(1);
}

console.error("running main.wasm…");
const ran = await runProgram(mainWasm.data);
if (ran.stderr) console.error(ran.stderr);
if (ran.stdout) console.log(ran.stdout);
if (ran.exitCode !== 0) {
  console.error(`run failed: exit ${ran.exitCode}`);
  process.exit(1);
}
// std.debug.print writes stderr on Zig 0.16.
const printed = `${ran.stdout}\n${ran.stderr}`;
if (!printed.includes("Hello, ZigLab")) {
  console.error("program did not print Hello, ZigLab");
  process.exit(1);
}
