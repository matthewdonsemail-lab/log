import type { Command, CommandInput, FlagSpec, InputForm, PositionalSpec } from "../types.ts";

export type TypedInput = Record<string, unknown>;

export type InputArgv = { ok: true; argv: string[]; live: boolean; bypass: boolean } | { ok: false; message: string };

export const PROXY_MS_FLAG: FlagSpec = { name: "proxyMs", kind: "integer", description: "This run's proxy speed limit to Facebook, in ms (500-60000, default 2500, rule 33)", global: true };

export const JSON_FLAG: FlagSpec = { name: "json", kind: "boolean", description: "Answer as JSON (the tool's result carries it parsed in `json`)" };

export function parserSpecOf(input: CommandInput): { boolean: string[]; valued: string[] } {
  const boolean = new Set<string>();
  const valued = new Set<string>();
  for (const form of input.forms) {
    for (const flag of form.flags) {
      if (flag.global || flag.kind === "pairs") continue;
      (flag.kind === "boolean" ? boolean : valued).add(flag.name);
    }
  }
  return { boolean: [...boolean], valued: [...valued] };
}

export function formToolName(command: Pick<Command, "name">, form: InputForm): string {
  return command.name + form.words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
}

function propertyOf(spec: FlagSpec | PositionalSpec): Record<string, unknown> {
  const values = spec.values ? ` One of: ${spec.values.join(", ")}.` : "";
  switch (spec.kind) {
    case "boolean":
      return { type: "boolean", description: spec.description };
    case "integer":
      return { type: "integer", description: spec.description };
    case "enum":
      return { type: "string", enum: [...(spec.values ?? [])], description: spec.description };
    case "pairs":
      return { type: "object", additionalProperties: { type: "string" }, description: spec.description };
    case "rest":
      return { type: "array", items: { type: "string" }, description: `${spec.description}${values}` };
    default:
      return { type: "string", description: `${spec.description}${values}` };
  }
}

export function inputSchemaOf(form: InputForm): { properties: Record<string, unknown>; required: string[] } {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const spec of [...form.positionals, ...form.flags]) {
    properties[spec.name] = propertyOf(spec);
    if (spec.required) required.push(spec.name);
  }
  return { properties, required };
}

function checkValue(spec: FlagSpec | PositionalSpec, value: unknown): string | null {
  switch (spec.kind) {
    case "boolean":
      return typeof value === "boolean" ? null : "must be true or false";
    case "integer":
      return Number.isInteger(value) ? null : "must be a whole number";
    case "enum":
      return typeof value === "string" && (spec.values ?? []).includes(value) ? null : `must be one of ${(spec.values ?? []).join(", ")}`;
    case "pairs":
      return value !== null && typeof value === "object" && !Array.isArray(value) && Object.values(value).every((v) => typeof v === "string") ? null : "must be an object of strings";
    case "rest":
      return Array.isArray(value) && value.every((v) => typeof v === "string") ? null : "must be an array of strings";
    default:
      return typeof value === "string" && value !== "" ? null : "must be a non-empty string";
  }
}

export function argvOfInput(form: InputForm, input: TypedInput | undefined): InputArgv {
  const given = input ?? {};
  const known = new Set([...form.positionals, ...form.flags].map((s) => s.name));
  for (const key of Object.keys(given)) if (!known.has(key)) return { ok: false, message: `unknown field "${key}"` };
  const argv: string[] = [...form.words];
  let live = false;
  let bypass = false;
  for (const spec of form.positionals) {
    const value = given[spec.name];
    if (value === undefined) {
      if (spec.required) return { ok: false, message: `${spec.name} is needed` };
      continue;
    }
    const problem = checkValue(spec, value);
    if (problem) return { ok: false, message: `${spec.name} ${problem}` };
    if (spec.kind === "rest") argv.push(...(value as string[]));
    else argv.push(value as string);
  }
  for (const spec of form.flags) {
    const value = given[spec.name];
    if (value === undefined || value === false) {
      if (spec.required) return { ok: false, message: `${spec.name} is needed` };
      continue;
    }
    const problem = checkValue(spec, value);
    if (problem) return { ok: false, message: `${spec.name} ${problem}` };
    if (spec.live) live = true;
    if (spec.bypass) bypass = true;
    if (spec.kind === "boolean") argv.push(`--${spec.name}`);
    else if (spec.kind === "pairs") for (const [k, v] of Object.entries(value as Record<string, string>)) argv.push(`--${spec.name}`, `${k}=${v}`);
    else argv.push(`--${spec.name}=${String(value)}`);
  }
  return { ok: true, argv, live, bypass };
}

export function inputFlagNames(input: CommandInput): string[] {
  return [...new Set(input.forms.flatMap((f) => f.flags.map((flag) => flag.name)))];
}
