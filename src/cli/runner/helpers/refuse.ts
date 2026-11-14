import { ERROR_CATALOG, isErrorCode } from "../../../errors/catalog/index.ts";
import type { ErrorCode } from "../../../errors/catalog/index.ts";
import { TwentyError } from "../../../twenty/graphql/index.ts";
import type { CommandResult } from "../types.ts";

export function refuse(name: string, code: ErrorCode, detail?: string): CommandResult {
  const entry = ERROR_CATALOG[code];
  const exit = entry.layer === "runtime" || code === "twentyUnreachable" || code === "twentyRequestFailed" ? 2 : 1;
  return { code: exit, error: code, stderr: `log ${name}: ${code}: ${entry.meaning}${detail ? ` (${detail})` : ""}\n${entry.action}` };
}

export function refuseGated(name: string, refusal: { code?: string; detail?: string }, fallback: ErrorCode): CommandResult {
  return refuse(name, isErrorCode(refusal.code) ? refusal.code : fallback, refusal.detail);
}

export function codeOfText(text: string): ErrorCode {
  const head = /^([a-z][A-Za-z]+):/.exec(text.trim())?.[1];
  return head && isErrorCode(head) ? head : "inputInvalid";
}

export function refuseInput(name: string, problem: string, usage?: string): CommandResult {
  return { code: 1, error: codeOfText(problem), stderr: `log ${name}: ${problem}${usage ? `\n${usage}` : ""}` };
}

export function resultCodeOf(result: CommandResult): ErrorCode | null {
  if (result.error) return result.error;
  return result.code === 0 ? null : "commandFailed";
}

export function refuseError(name: string, error: unknown): CommandResult {
  if (error instanceof TwentyError) return refuse(name, error.code, error.message);
  const code = (error as { code?: unknown } | null)?.code;
  if (isErrorCode(code)) return refuse(name, code, error instanceof Error ? error.message : undefined);
  return refuse(name, "crashed", error instanceof Error ? `${error.name}: ${error.message}` : String(error));
}
