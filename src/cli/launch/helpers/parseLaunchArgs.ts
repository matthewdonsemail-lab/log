export type ParseLaunchArgsResult = { ok: true; json: boolean } | { ok: false; error: string };

export function parseLaunchArgs(argv: string[]): ParseLaunchArgsResult {
  for (const token of argv) {
    if (token === "--json") continue;
    if (token.startsWith("--json=")) {
      return { ok: false, error: `option "--json" takes no value` };
    }
    if (token.startsWith("--")) {
      return { ok: false, error: `unknown option "${token}"` };
    }
    return { ok: false, error: `unexpected argument "${token}"` };
  }
  return { ok: true, json: argv.includes("--json") };
}
