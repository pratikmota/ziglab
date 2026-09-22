/**
 * Playground share payload helpers. Not wired to `/play` yet — no Share button
 * and no `location.hash` hydrate. Future Share copies `siteConfig.domain` +
 * `/play` + hash. The payload is untrusted editor text, not HTML.
 *
 * Hash shape: `/play#v1.{payload}` where payload is gzip(JSON) then base64url.
 * Unknown versions are rejected. Decoded size is capped at WASM_SOURCE_MAX_BYTES.
 */
import { WASM_SOURCE_MAX_BYTES } from "zigeditor";

import { DEFAULT_ZIG_CHANNEL, offeredZigChannel, type ZigChannel } from "@/lib/zig-version";

export type PlaySharePayload = {
  code: string;
  channel: ZigChannel;
};

const SHARE_VERSION = "v1";

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  const padded = value.length % 4 === 0 ? value : `${value}${"=".repeat(4 - (value.length % 4))}`;
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function blobFromBytes(bytes: Uint8Array): Blob {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return new Blob([copy]);
}

async function gzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = blobFromBytes(bytes).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = blobFromBytes(bytes).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function utf8Size(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Returns the hash fragment (`v1.{payload}`), without a leading `#`. */
export async function encodePlayShare(payload: PlaySharePayload): Promise<string> {
  const json = JSON.stringify({
    code: payload.code,
    channel: offeredZigChannel(payload.channel),
  });
  if (utf8Size(json) > WASM_SOURCE_MAX_BYTES || utf8Size(payload.code) > WASM_SOURCE_MAX_BYTES) {
    throw new Error("share payload too large");
  }
  const compressed = await gzipBytes(new TextEncoder().encode(json));
  return `${SHARE_VERSION}.${bytesToBase64Url(compressed)}`;
}

/** Accepts `location.hash` (`#v1.…`) or a bare `v1.…` fragment. */
export async function decodePlayShare(hash: string): Promise<PlaySharePayload | null> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const version = raw.slice(0, dot);
  const payload = raw.slice(dot + 1);
  if (version !== SHARE_VERSION || !payload) return null;

  const compressed = base64UrlToBytes(payload);
  if (!compressed) return null;

  let decompressed: Uint8Array;
  try {
    decompressed = await gunzipBytes(compressed);
  } catch {
    return null;
  }
  if (decompressed.length > WASM_SOURCE_MAX_BYTES) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(decompressed));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as { code?: unknown; channel?: unknown };
  if (typeof record.code !== "string") return null;
  if (utf8Size(record.code) > WASM_SOURCE_MAX_BYTES) return null;

  const channel =
    typeof record.channel === "string"
      ? offeredZigChannel(record.channel)
      : DEFAULT_ZIG_CHANNEL;

  return { code: record.code, channel };
}
