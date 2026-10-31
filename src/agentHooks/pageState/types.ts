import type { PageState } from "../../browser/flow/helpers/pageState.ts";
import type { HookEvent } from "../registry/types.ts";

import type { BrowserAt } from "../../browser/inspect/types.ts";

export type { BrowserAt };

export interface Finding {
  account: string;
  kind: "state" | "failed" | "reading" | "clear";
  state: PageState | null;
  mark: string;
  line: string;
  resolvable: boolean;
}

export interface HookMemory {
  seen: Record<string, string>;
  stopBlocked: string | null;
}

export interface HookReply {
  output: Record<string, unknown> | null;
  memory: HookMemory;
}

export type { HookEvent };
