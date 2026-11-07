export type ParseLaunchArgsResult = { ok: true; json: boolean; setup: boolean } | { ok: false; error: string };

export function parseLaunchArgs(argv: string[]): ParseLaunchArgsResult {
  for (const token of argv) {
    if (token === "--json" || token === "--setup") continue;
    if (token.startsWith("--json=")) {
      return { ok: false, error: `option "--json" takes no value` };
    }
    if (token.startsWith("--setup=")) {
      return { ok: false, error: `option "--setup" takes no value` };
    }
    if (token.startsWith("--")) {
      return { ok: false, error: `unknown option "${token}"` };
    }
    return { ok: false, error: `unexpected argument "${token}"` };
  }
  return { ok: true, json: argv.includes("--json"), setup: argv.includes("--setup") };
}
