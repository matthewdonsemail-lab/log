import { ERROR_CATALOG, isErrorCode } from "../../../errors/catalog/index.ts";
import type { ErrorCode } from "../../../errors/catalog/index.ts";
import { TwentyError } from "../../../twenty/graphql/index.ts";
import type { CommandResult } from "../types.ts";

/**
 * A refused or failed command, explained from the error catalog: the code,
 * what it means, the detail, and what a person does. Exit 1 for things a
 * person fixes (account, listing, config), 2 for runtime and network. Pure.
 */
export function refuse(name: string, code: ErrorCode, detail?: string): CommandResult {
  const entry = ERROR_CATALOG[code];
  const exit = entry.layer === "runtime" || code === "twentyUnreachable" || code === "twentyRequestFailed" ? 2 : 1;
  return { code: exit, stderr: `log ${name}: ${code}: ${entry.meaning}${detail ? ` (${detail})` : ""}\n${entry.action}` };
}

/** A thrown error → a refusal: TwentyErrors keep their code, anything else is `crashed`. Pure. */
export function refuseError(name: string, error: unknown): CommandResult {
  if (error instanceof TwentyError) return refuse(name, error.code, error.message);
  const code = (error as { code?: unknown } | null)?.code;
  if (isErrorCode(code)) return refuse(name, code, error instanceof Error ? error.message : undefined);
  return refuse(name, "crashed", error instanceof Error ? `${error.name}: ${error.message}` : String(error));
}
