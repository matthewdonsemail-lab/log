import { createActor, toPromise } from "xstate";
import { actionMachine } from "./machine.ts";
import type { ActionActors, ActionOptions, ActionRefusal, ActionResult, Confirmation, GateVerdict, PartsOutcome } from "./types.ts";

export async function runAction<Held, Answer>(actors: ActionActors<Held, Answer>, options: ActionOptions = {}): Promise<ActionResult<Held, Answer>> {
  const actor = createActor(actionMachine(actors, options));
  const finished = toPromise(actor);
  actor.start();
  return (await finished) as ActionResult<Held, Answer>;
}

export function confirmAnswer(answer: { ok: boolean; code?: string; detail?: string }): Confirmation {
  return answer.ok ? { ok: true } : { ok: false, code: answer.code ?? "platformRefused", detail: answer.detail ?? "" };
}

export function confirmParts(parts: PartsOutcome): Confirmation {
  if (parts.movedOn || parts.interrupted) return { ok: false, code: "chatMovedOn", detail: `they wrote while it was being sent: ${parts.sent} of ${parts.total} sent` };
  if (parts.lost) return { ok: false, code: "chatClaimLost", detail: `the claim on this chat was lost: ${parts.sent} of ${parts.total} sent` };
  if (parts.sent === parts.total) return { ok: true };
  return confirmAnswer({ ok: false, code: parts.last?.code, detail: parts.last?.detail });
}

export async function actOnEngine<Run extends { answer: { ok: boolean; code?: string; detail?: string } }>(act: () => Run | Promise<Run>): Promise<Run> {
  const acted = await runAction<null, Run>({ gate: passGate, act: async () => act(), confirm: (run) => confirmAnswer(run.answer) });
  rethrowFailure(acted);
  return acted.answer!;
}

export const passGate = async (): Promise<GateVerdict<null>> => ({ ok: true, held: null });

export const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function rethrowFailure<Held, Answer>(result: ActionResult<Held, Answer>): void {
  if (result.error !== undefined) throw result.error;
}

export interface LiveResult {
  code: number;
  error?: string;
  stderr?: string;
}

export const LIVE_ACTION = Symbol.for("log.liveThroughAction");

export function asksLive(argv: readonly string[], flags: readonly string[]): boolean {
  return argv.some((arg) => flags.some((flag) => arg === `--${flag}` || (arg.startsWith(`--${flag}=`) && arg !== `--${flag}=false`)));
}

export const confirmExit = (result: LiveResult): Confirmation => (result.code === 0 ? { ok: true } : { ok: false, code: result.error ?? "commandFailed", detail: result.stderr ?? "" });

export async function runLive<R extends LiveResult>(act: () => R | Promise<R>, gate: () => Promise<GateVerdict<null>> = passGate, options: ActionOptions = {}): Promise<R | ActionRefusal> {
  const acted = await runAction<null, R>({ gate, act: async () => act(), confirm: confirmExit }, options);
  rethrowFailure(acted);
  if (acted.answer !== undefined) return acted.answer;
  return { ok: false, code: acted.code ?? "commandFailed", detail: acted.detail ?? "" };
}

export interface LiveActionHolder {
  flags: readonly string[];
  inner: { run(context: unknown, argv: string[]): LiveResult | Promise<LiveResult> };
  gate: () => Promise<GateVerdict<null>>;
}

export function liveThroughAction<C extends { run(context: never, argv: string[]): LiveResult | Promise<LiveResult> }>(command: C, flags: readonly string[]): C {
  const holder: LiveActionHolder = { flags, inner: { run: command.run.bind(command) as unknown as LiveActionHolder["inner"]["run"] }, gate: passGate };
  const run = (context: unknown, argv: string[]): LiveResult | Promise<LiveResult> => {
    if (!asksLive(argv, flags)) return holder.inner.run(context, argv);
    return runLive(() => holder.inner.run(context, argv), () => holder.gate()).then((done): LiveResult => ("ok" in done && done.ok === false ? { code: 1, error: done.code, stderr: done.detail } : (done as LiveResult)));
  };
  return Object.assign({ ...command, run }, { [LIVE_ACTION]: holder }) as unknown as C;
}

export function liveActionOf(command: object): LiveActionHolder | null {
  return (command as Record<symbol, LiveActionHolder | undefined>)[LIVE_ACTION] ?? null;
}
