import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

/** Parent of both checkouts when zigeditor is linked from outside this app. */
function outsidePackageRoot(): string | undefined {
  try {
    const real = fs.realpathSync(path.join(appDir, "node_modules", "zigeditor"));
    const inside = real === appDir || real.startsWith(appDir + path.sep);
    if (inside) return undefined;
    const appParts = appDir.split(path.sep);
    const pkgParts = real.split(path.sep);
    const shared: string[] = [];
    for (let i = 0; i < Math.min(appParts.length, pkgParts.length); i++) {
      if (appParts[i] !== pkgParts[i]) break;
      shared.push(appParts[i]);
    }
    const root = shared.join(path.sep);
    return root.length > 0 ? root : undefined;
  } catch {
    return undefined;
  }
}

const linkedRoot = outsidePackageRoot();

function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV === "development";

  // Header-based CSP (no nonce): production keeps 'unsafe-inline' so Next.js can boot.

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "frame-src https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  // A sibling link lives outside this app. Turbopack will not read its CSS
  // until the root covers both checkouts. A normal install stays inside
  // node_modules, so a ZigLab-only deploy leaves this unset.
  ...(linkedRoot ? { turbopack: { root: linkedRoot } } : {}),
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
