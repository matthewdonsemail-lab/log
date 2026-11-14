import { openRequestState, sealRequestState } from "./requestState.ts";
import type { InputRequiredResult, RequestStateBody, StatelessCaller } from "../types.ts";

export const ELICIT_ACTIONS: readonly string[] = ["accept", "decline", "cancel"];

export function isInputRequired(result: unknown): result is InputRequiredResult {
  return Boolean(result && typeof result === "object" && (result as { resultType?: unknown }).resultType === "input_required");
}

export function urlInputRequired(expect: Omit<RequestStateBody, "expiresAt">, url: string, message: string, stateKey: Uint8Array, now: number = Date.now()): InputRequiredResult {
  return {
    resultType: "input_required",
    inputRequests: { [expect.key]: { method: "elicitation/create", params: { mode: "url", url, message } } },
    requestState: sealRequestState(expect, stateKey, now),
  };
}

export function answeredAction(caller: Pick<StatelessCaller, "inputResponses" | "requestState">, expect: Omit<RequestStateBody, "expiresAt">, stateKey: Uint8Array, now: number = Date.now()): string | null {
  if (!openRequestState(caller.requestState, stateKey, expect, now)) return null;
  const answer = caller.inputResponses?.[expect.key];
  const action = answer && typeof answer === "object" ? (answer as { action?: unknown }).action : undefined;
  return typeof action === "string" && ELICIT_ACTIONS.includes(action) ? action : null;
}
