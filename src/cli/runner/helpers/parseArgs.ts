import type { FlagSpec, InputForm } from "../types.ts";
import { countProblem, groupProblem, readText, refusalText } from "./flagValues.ts";
import type { FlagValue } from "./flagValues.ts";

export interface ParserSpec {
  boolean?: readonly string[];
  valued?: readonly string[];
  typed?: readonly FlagSpec[];
  forms?: readonly InputForm[];
}

export type ParsedArgs =
  | { ok: true; flags: Record<string, string | true>; positionals: string[]; values: Record<string, FlagValue> }
  | { ok: false; error: string };

export function formOfWords(forms: readonly InputForm[], positionals: readonly string[]): InputForm | null {
  const matching = forms.filter((f) => f.words.every((w, i) => positionals[i] === w));
  const longest = Math.max(-1, ...matching.map((f) => f.words.length));
  const best = matching.filter((f) => f.words.length === longest);
  return best.length === 1 ? best[0] : null;
}

function formValues(form: InputForm, positionals: readonly string[], values: Record<string, FlagValue>): (name: string) => unknown {
  const rest = positionals.slice(form.words.length);
  const byName: Record<string, unknown> = { ...values };
  form.positionals.forEach((spec, i) => {
    if (spec.kind === "rest") byName[spec.name] = rest.slice(i);
    else if (rest[i] !== undefined) byName[spec.name] = rest[i];
  });
  return (name) => byName[name];
}

function checkForm(form: InputForm, positionals: string[], values: Record<string, FlagValue>): string | null {
  const valueOf = formValues(form, positionals, values);
  const given = (name: string) => {
    const value = valueOf(name);
    return value !== undefined && value !== false && value !== "" && !(Array.isArray(value) && value.length === 0);
  };
  return groupProblem(form.groups, given) ?? countProblem(form, valueOf);
}

export function parseArgs(argv: string[], spec: ParserSpec): ParsedArgs {
  const merged = new Map((spec.typed ?? []).map((s) => [s.name, s]));
  const booleans = new Set(spec.boolean ?? []);
  const valued = new Set(spec.valued ?? []);
  const flags: Record<string, string | true> = {};
  const values: Record<string, FlagValue> = {};
  const positionals: string[] = [];
  const given: { name: string; value: string }[] = [];

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
      values[name] = true;
      continue;
    }
    if (!valued.has(name) && !merged.has(name)) return { ok: false, error: `unknown option "${token}"` };
    const value = eq !== -1 ? token.slice(eq + 1) : argv[++i];
    if (value === undefined || value === "") return { ok: false, error: `option "--${name}" needs a value` };
    given.push({ name, value });
  }
  const form = spec.forms ? formOfWords(spec.forms, positionals) : null;
  const specOf = (name: string) => form?.flags.find((f) => f.name === name) ?? merged.get(name);
  for (const { name, value } of given) {
    const flag = specOf(name);
    if (flag?.kind === "list") {
      const read = readText(flag, value);
      if (!read.ok) return { ok: false, error: refusalText(flag, value) };
      flags[name] = typeof flags[name] === "string" ? `${flags[name]},${value}` : value;
      values[name] = [...((values[name] as string[] | undefined) ?? []), ...(read.value as string[])];
      continue;
    }
    if (flag?.kind === "pairs") {
      const at = value.indexOf("=");
      if (at <= 0) return { ok: false, error: `inputInvalid: --${name} got "${value}"; it takes key=value` };
      flags[name] = value;
      values[name] = { ...((values[name] as Record<string, string> | undefined) ?? {}), [value.slice(0, at)]: value.slice(at + 1) };
      continue;
    }
    if (name in flags) return { ok: false, error: `inputInvalid: --${name} was given more than once; it takes one value` };
    flags[name] = value;
    if (!flag) {
      values[name] = value;
      continue;
    }
    const read = readText(flag, value);
    if (!read.ok) return { ok: false, error: refusalText(flag, value) };
    values[name] = read.value;
  }
  const problem = form ? checkForm(form, positionals, values) : null;
  if (problem) return { ok: false, error: problem };
  return { ok: true, flags, positionals, values };
}

export function numberOf(parsed: { values: Record<string, FlagValue> }, name: string): number | undefined {
  const value = parsed.values[name];
  return typeof value === "number" ? value : undefined;
}

export function listOf(parsed: { values: Record<string, FlagValue> }, name: string): string[] | undefined {
  const value = parsed.values[name];
  return Array.isArray(value) ? value : undefined;
}

export function truthOf(parsed: { values: Record<string, FlagValue> }, name: string): boolean | undefined {
  const value = parsed.values[name];
  return typeof value === "boolean" ? value : undefined;
}
