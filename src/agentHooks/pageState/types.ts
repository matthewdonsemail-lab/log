import type { PageState } from "../../browser/flow/helpers/pageState.ts";
import type { HookEvent } from "../registry/types.ts";

/** Where one open browser is: its last step, read from the session's own files. */
export interface BrowserAt {
  account: string;
  step: string;
  url: string;
  /** The step's accessibility snapshot (typed values already redacted), or "" when it has none. */
  text: string;
  /** The step's error when it failed: the page it left is unconfirmed. */
  failed: string | null;
}

/** What the hook makes of one browser. */
export interface Finding {
  account: string;
  /** `state`: a known page state; `failed`: the last step failed, so where the page is isn't confirmed; `clear`: nothing to resolve. */
  kind: "state" | "failed" | "clear";
  state: PageState | null;
  /** Changes whenever the step or its state does. */
  mark: string;
  line: string;
  /** log-cli resolves it itself (not a person's state). */
  resolvable: boolean;
}

/** What the hook remembers between calls: each account's last mark, and what the last Stop block was for. */
export interface HookMemory {
  seen: Record<string, string>;
  stopBlocked: string | null;
}

export interface HookReply {
  /** The JSON the hook prints, or null for nothing to say. */
  output: Record<string, unknown> | null;
  memory: HookMemory;
}

export type { HookEvent };
