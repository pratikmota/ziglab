import { siteConfig } from "@/config/site";
import type { ZigChannel } from "@/lib/execution/types";

export type ZigPlayVersion = {
  id: ZigChannel;
  zigVersion: string;
  docsBase: string;
  moduleUrl: string;
  stdUrl: string;
  compilerRtUrl?: string;
  compileTimeoutMs: number;
  runTimeoutMs: number;
};

/** Offered playground compilers. Add a row + /wasm/{ver}/ tree for another Zig version. */
export const zigPlayVersions: ZigPlayVersion[] = [
  {
    id: "stable",
    zigVersion: siteConfig.zigStableLabel,
    docsBase: `${siteConfig.zigOfficial}documentation/${siteConfig.zigStableLabel}/`,
    moduleUrl: `/wasm/${siteConfig.zigStableLabel}/zig.wasm`,
    stdUrl: `/wasm/${siteConfig.zigStableLabel}/std.tar.gz`,
    compilerRtUrl: `/wasm/${siteConfig.zigStableLabel}/compiler_rt.a`,
    compileTimeoutMs: 60_000,
    runTimeoutMs: 2_000,
  },
];

export function playVersion(channel: ZigChannel): ZigPlayVersion | undefined {
  return zigPlayVersions.find((item) => item.id === channel);
}

export function zigVersionLabel(channel: ZigChannel = "stable") {
  const match = playVersion(channel);
  return `Zig ${match?.zigVersion ?? siteConfig.zigStableLabel}`;
}

export function zigDocsUrl(hash = "") {
  const base = `${siteConfig.zigOfficial}documentation/${siteConfig.zigStableLabel}/`;
  return hash ? `${base}${hash.startsWith("#") ? hash : `#${hash}`}` : base;
}

export function offeredZigChannel(channel: ZigChannel): ZigChannel {
  return zigPlayVersions.some((item) => item.id === channel)
    ? channel
    : "stable";
}
