import { siteConfig } from "@/config/site";
import type { ZigChannel } from "@/lib/execution/types";

/** Offered playground compilers. Add rows here when more Zig versions ship. */
export const zigPlayVersions: { id: ZigChannel; version: string }[] = [
  { id: "stable", version: siteConfig.zigStableLabel },
];

export function zigVersionLabel(channel: ZigChannel = "stable") {
  const match = zigPlayVersions.find((item) => item.id === channel);
  return `Zig ${match?.version ?? siteConfig.zigStableLabel}`;
}

export function offeredZigChannel(channel: ZigChannel): ZigChannel {
  return zigPlayVersions.some((item) => item.id === channel)
    ? channel
    : "stable";
}
