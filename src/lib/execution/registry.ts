import { MockAdapter } from "@/lib/execution/mock-adapter";
import type { ExecutionAdapter, ZigChannel } from "@/lib/execution/types";

const adapters: Record<ZigChannel, ExecutionAdapter> = {
  stable: new MockAdapter("stable"),
  master: new MockAdapter("master"),
};

export function getAdapter(channel: ZigChannel): ExecutionAdapter {
  return adapters[channel];
}
