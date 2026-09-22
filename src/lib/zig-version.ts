import { siteConfig } from "@/config/site";

export type ZigChannel = string;

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

export const DEFAULT_ZIG_CHANNEL: ZigChannel =
  zigPlayVersions.find((item) => item.id === "stable")?.id ?? zigPlayVersions[0].id;

export function playVersion(channel: ZigChannel): ZigPlayVersion | undefined {
  return zigPlayVersions.find((item) => item.id === channel);
}

export function zigVersionLabel(channel: ZigChannel = DEFAULT_ZIG_CHANNEL) {
  const match = playVersion(channel);
  return `Zig ${match?.zigVersion ?? siteConfig.zigStableLabel}`;
}

export function zigDocsUrl(hash = "") {
  const base = `${siteConfig.zigOfficial}documentation/${siteConfig.zigStableLabel}/`;
  return hash ? `${base}${hash.startsWith("#") ? hash : `#${hash}`}` : base;
}

/** Unknown or retired catalog ids fall back to the default offered row. */
export function offeredZigChannel(channel: string): ZigChannel {
  return zigPlayVersions.some((item) => item.id === channel)
    ? channel
    : DEFAULT_ZIG_CHANNEL;
}
