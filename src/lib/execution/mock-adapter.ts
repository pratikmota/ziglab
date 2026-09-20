import {
  PLAYGROUND_HELLO_SOURCE,
  PLAYGROUND_HELLO_STDOUT,
} from "@/lib/content/hello-zig";
import type {
  ExecutionAdapter,
  RunRequest,
  RunResult,
  RunStatus,
  ZigChannel,
} from "@/lib/execution/types";
import { zigVersionLabel } from "@/lib/zig-version";

export const MOCK_PREVIEW_MESSAGE =
  "The in-browser Zig compiler is not wired up yet. Your code is kept locally. Try changing the sample and check the expected output.";

function normalizeWhitespace(code: string) {
  return code.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class MockAdapter implements ExecutionAdapter {
  readonly id: string;
  readonly channel: ZigChannel;
  readonly label: string;
  readonly compilerLabel: string;

  constructor(channel: ZigChannel) {
    this.channel = channel;
    this.id = `mock-${channel}`;

    this.label = zigVersionLabel(channel);
    this.compilerLabel = zigVersionLabel(channel);
  }

  status(): RunStatus {
    return "idle";
  }

  async run(req: RunRequest): Promise<RunResult> {
    const waitMs = 400 + Math.floor(Math.random() * 401);
    await delay(waitMs);

    const normalizedCode = normalizeWhitespace(req.code);
    const expected = req.expectedOutput?.replace(/\r\n/g, "\n");
    const matchSources = req.matchSources ?? [];

    if (expected && matchSources.length > 0) {
      const matchesKnown = matchSources.some(
        (source) => normalizedCode === normalizeWhitespace(source)
      );
      if (matchesKnown) {
        return {
          ok: true,
          stdout: expected.endsWith("\n") ? expected : `${expected}\n`,
          stderr: "",
          exitCode: 0,
          durationMs: 0,
          compilerLabel: this.compilerLabel,
          preview: true,
        };
      }
    }

    const matchesHello = normalizedCode === normalizeWhitespace(PLAYGROUND_HELLO_SOURCE);

    if (matchesHello) {
      return {
        ok: true,
        stdout: PLAYGROUND_HELLO_STDOUT,
        stderr: "",
        exitCode: 0,
        durationMs: 0,
        compilerLabel: this.compilerLabel,
        preview: true,
      };
    }

    return {
      ok: false,
      stdout: "",
      stderr: MOCK_PREVIEW_MESSAGE,
      exitCode: null,
      durationMs: 0,
      compilerLabel: this.compilerLabel,
      preview: true,
    };
  }
}
