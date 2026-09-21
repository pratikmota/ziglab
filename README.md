# ZigLab

A friendly lab for learning Zig in the browser: [ziglab.org](https://ziglab.org).

This is an independent community project. Zig is developed at [ziglang.org](https://ziglang.org/).

## What you get

- **Learn** — MDX lessons under `/learn` (curriculum in `content/`)
- **Play** — `/play` compiles and runs Zig in the browser when WASM artifacts are published; otherwise a mock preview runner
- **Site** — Home, About, Blog, Sponsors, Privacy, Terms

No login. Playground and lesson drafts stay in the browser (`localStorage`). There is no ZigLab compile server — user code never leaves the visitor’s machine for compilation.

## Stack

- Next.js 16.3.5, React 19.3.0, TypeScript
- Tailwind CSS 4, shadcn/ui CLI v4
- pnpm

## Prerequisites

- **Node.js** and **pnpm** (see `packageManager` in `package.json`)
- **Host Zig** on PATH only if you build the in-browser compiler (must match `hostZig` in [`tools/zig-wasm/VERSION`](tools/zig-wasm/VERSION)). Details: [`tools/zig-wasm/README.md`](tools/zig-wasm/README.md)

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Without WASM artifacts, `/play` uses the mock preview runner.

## In-browser compiler (optional)

Publish toolchain artifacts into `public/wasm/` (gitignored). Full build steps: [`tools/zig-wasm/README.md`](tools/zig-wasm/README.md). Host API and sandbox limits: [`src/lib/execution/README.md`](src/lib/execution/README.md).

```bash
cd tools/zig-wasm && zig build --release=small
cd ../.. && pnpm wasm:publish
pnpm dev
```

Home never downloads `zig.wasm`. Missing files under `public/wasm/` → mock fallback, not a fake compile.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next.js development server |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm wasm:publish` | Copy toolchain `dist/` → `public/wasm/` |

## Project layout

| Path | Role |
| --- | --- |
| `src/app/` | App Router pages (`/`, `/learn`, `/play`, …) |
| `src/components/` | UI (playground, learn, layout, shadcn) |
| `src/lib/execution/` | WASI host, worker, WasmAdapter / mock |
| `src/lib/zig-version.ts` | Playground compiler catalog (`zigPlayVersions`) |
| `src/config/site.ts` | Site URLs, Zig version label, sponsors |
| `content/` | Lessons, curriculum, playground starters, blog |
| `tools/zig-wasm/` | Build-machine toolchain → `zig.wasm` (not imported by the app) |
| `public/wasm/` | Published compiler artifacts (gitignored) |

## Config

No environment variables are required. Edit [`src/config/site.ts`](src/config/site.ts) for domain, social links, and the stable Zig version label.

## Launch placeholders

These are config values, not fake companies. Fill them before going live:

- Discord and X URLs are empty, so those footer icons stay hidden
- Maintainer name and bio on `/about` are still placeholders
- Confirm the GitHub Sponsors page at the URL in `siteConfig.sponsorsGithub` is enabled
- Production Open Graph image is not exported yet

## License

The application is MIT ([LICENSE](LICENSE)). Original lesson prose in `content/lessons/` is CC BY-SA 4.0. Official Zig compiler artifacts built under [`tools/zig-wasm/`](tools/zig-wasm/) remain MIT; see [`tools/zig-wasm/NOTICE`](tools/zig-wasm/NOTICE).
