export type ParsedArgs =
  | { ok: true; flags: Record<string, string | true>; positionals: string[] }
  | { ok: false; error: string };

export function parseArgs(argv: string[], spec: { boolean?: string[]; valued?: string[] }): ParsedArgs {
  const booleans = new Set(spec.boolean ?? []);
  const valued = new Set(spec.valued ?? []);
  const flags: Record<string, string | true> = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const eq = token.indexOf("=");
    const name = token.slice(2, eq === -1 ? undefined : eq);
    if (booleans.has(name)) {
      if (eq !== -1) return { ok: false, error: `option "--${name}" takes no value` };
      flags[name] = true;
      continue;
    }
    if (valued.has(name)) {
      const value = eq !== -1 ? token.slice(eq + 1) : argv[++i];
      if (value === undefined || value === "") return { ok: false, error: `option "--${name}" needs a value` };
      flags[name] = value;
      continue;
    }
    return { ok: false, error: `unknown option "${token}"` };
  }
  return { ok: true, flags, positionals };
}
