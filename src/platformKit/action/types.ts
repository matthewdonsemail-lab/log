export const ACTION_STAGES = ["gating", "acting", "confirming"] as const;
export type ActionStage = (typeof ACTION_STAGES)[number];

export const ACTION_OUTCOMES = ["done", "refused", "uncertain"] as const;
export type ActionOutcome = (typeof ACTION_OUTCOMES)[number];

export interface ActionRefusal {
  ok: false;
  code: string;
  detail: string;
}

export type GateVerdict<Held> = { ok: true; held: Held } | ActionRefusal;

export type Confirmation = { ok: true } | ActionRefusal;

export interface ActionActors<Held, Answer> {
  gate: () => Promise<GateVerdict<Held>>;
  act: (held: Held) => Promise<Answer>;
  confirm: (answer: Answer, held: Held) => Confirmation | Promise<Confirmation>;
}

export interface ActionResult<Held, Answer> {
  outcome: ActionOutcome;
  stage: ActionStage;
  held?: Held;
  answer?: Answer;
  code?: string;
  detail?: string;
  error?: unknown;
}

export interface PartsOutcome {
  sent: number;
  total: number;
  interrupted?: boolean;
  movedOn?: boolean;
  lost?: boolean;
  last?: { ok: boolean; code?: string; detail?: string };
}

export interface ActionOptions {
  onStage?: (stage: ActionStage) => void;
}
