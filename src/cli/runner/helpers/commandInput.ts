import type { Command, CommandInput, FlagSpec, InputForm, PositionalSpec } from "../types.ts";
import { countProblem, countSentence, FORMATS, groupProblem, groupSentence, readText, takesOf } from "./flagValues.ts";
import type { ParserSpec } from "./parseArgs.ts";
import { toolBaseName } from "./platforms.ts";

export type TypedInput = Record<string, unknown>;

export type InputArgv = { ok: true; argv: string[]; live: boolean; bypass: boolean } | { ok: false; message: string };

export const PROXY_MS_FLAG: FlagSpec = { name: "proxyMs", kind: "integer", min: 500, max: 60_000, description: "This run's proxy speed limit to Facebook, in ms (500-60000, default 2500, rule 33)", global: true };

export const JSON_FLAG: FlagSpec = { name: "json", kind: "boolean", description: "Answer as JSON (the tool's result carries it parsed in `json`)" };

export function parserSpecOf(input: CommandInput): Required<Pick<ParserSpec, "boolean" | "valued" | "typed" | "forms">> {
  const typed = new Map<string, FlagSpec>();
  for (const form of input.forms) for (const flag of form.flags) if (!typed.has(flag.name)) typed.set(flag.name, flag);
  const all = [...typed.values()];
  return { boolean: all.filter((f) => f.kind === "boolean").map((f) => f.name), valued: all.filter((f) => f.kind !== "boolean").map((f) => f.name), typed: all, forms: input.forms };
}

export function formToolName(command: Pick<Command, "name" | "platform">, form: InputForm): string {
  return toolBaseName(command) + form.words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
}

function bounds(spec: FlagSpec): Record<string, number> {
  return { ...(spec.min !== undefined ? { minimum: spec.min } : {}), ...(spec.max !== undefined ? { maximum: spec.max } : {}) };
}

function shapeOf(spec: FlagSpec): Record<string, string> {
  if (spec.pattern) return { pattern: spec.pattern };
  const format = spec.format ? FORMATS[spec.format] : null;
  return { ...(format?.pattern ? { pattern: format.pattern } : {}), ...(format?.schemaFormat ? { format: format.schemaFormat } : {}) };
}

function propertyOf(spec: FlagSpec | PositionalSpec, extra: string): Record<string, unknown> {
  const values = spec.values ? ` One of: ${spec.values.join(", ")}.` : "";
  const description = `${spec.description}${extra}`;
  if (spec.kind === "rest") return { type: "array", items: { type: "string" }, description: `${description}${values}` };
  if (spec.kind === "enum") return { type: "string", enum: [...(spec.values ?? [])], description };
  const flag = spec as FlagSpec;
  switch (flag.kind) {
    case "boolean":
    case "booleanValue":
      return { type: "boolean", description };
    case "integer":
    case "number":
      return { type: flag.kind, ...bounds(flag), description };
    case "pairs":
      return { type: "object", additionalProperties: { type: "string" }, description };
    case "list":
      return { type: "array", items: { type: "string", ...shapeOf(flag) }, minItems: 1, description };
    default:
      return { type: "string", ...shapeOf(flag), description: `${description}${values}` };
  }
}

export function inputSchemaOf(form: InputForm, options: { live?: boolean } = {}): { properties: Record<string, unknown>; required: string[] } {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const sentences = new Map<string, string>();
  for (const group of form.groups ?? []) for (const name of group.names) sentences.set(name, `${sentences.get(name) ?? ""} ${groupSentence(group)}`);
  for (const rule of form.counts ?? []) sentences.set(rule.name, `${sentences.get(rule.name) ?? ""} ${countSentence({ ...form, counts: [rule] }).join(" ")}`);
  for (const spec of [...form.positionals, ...form.flags]) {
    properties[spec.name] = propertyOf(spec, sentences.get(spec.name) ?? "");
    if (spec.required || (options.live && (spec as FlagSpec).approval)) required.push(spec.name);
  }
  return { properties, required };
}

function numeric(spec: FlagSpec, value: unknown): unknown {
  if ((spec.kind === "integer" || spec.kind === "number") && typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  if (spec.kind === "booleanValue" && (value === "true" || value === "false")) return value === "true";
  if (spec.kind === "list" && typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return value;
}

export function coerceInput(form: InputForm, input: TypedInput): TypedInput {
  const out: TypedInput = { ...input };
  for (const spec of form.flags) if (spec.name in out) out[spec.name] = numeric(spec, out[spec.name]);
  return out;
}

function checkPositional(spec: PositionalSpec, value: unknown): string | null {
  switch (spec.kind) {
    case "enum":
      return typeof value === "string" && (spec.values ?? []).includes(value) ? null : `must be one of ${(spec.values ?? []).join(", ")}`;
    case "rest":
      return Array.isArray(value) && value.every((v) => typeof v === "string") ? null : "must be an array of strings";
    default:
      return typeof value === "string" && value !== "" ? null : "must be a non-empty string";
  }
}

function checkFlag(spec: FlagSpec, value: unknown): string | null {
  switch (spec.kind) {
    case "boolean":
    case "booleanValue":
      return typeof value === "boolean" ? null : "must be true or false";
    case "integer":
    case "number":
      return typeof value === "number" && readText(spec, String(value)).ok ? null : `must be ${takesOf(spec)}`;
    case "pairs":
      return value !== null && typeof value === "object" && !Array.isArray(value) && Object.values(value).every((v) => typeof v === "string") ? null : "must be an object of strings";
    case "list":
      return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim() !== "" && readText(spec, v).ok) ? null : `must be ${takesOf(spec).replace(", comma separated or the flag repeated", "")} (an array of strings)`;
    case "enum":
      return typeof value === "string" && (spec.values ?? []).includes(value) ? null : `must be one of ${(spec.values ?? []).join(", ")}`;
    default:
      return typeof value === "string" && value !== "" ? (readText(spec, value).ok ? null : `must be ${takesOf(spec)}`) : "must be a non-empty string";
  }
}

export function argvOfInput(form: InputForm, input: TypedInput | undefined, options: { live?: boolean } = {}): InputArgv {
  const given = coerceInput(form, input ?? {});
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
    const problem = checkPositional(spec, value);
    if (problem) return { ok: false, message: `${spec.name} ${problem}` };
    if (spec.kind === "rest") argv.push(...(value as string[]));
    else argv.push(value as string);
  }
  for (const spec of form.flags) {
    const value = given[spec.name];
    if (value === undefined || (value === false && spec.kind === "boolean")) {
      if (spec.required) return { ok: false, message: `${spec.name} is needed` };
      if (options.live && spec.approval) return { ok: false, message: `${spec.name} is needed on a live run (rule 8)` };
      continue;
    }
    const problem = checkFlag(spec, value);
    if (problem) return { ok: false, message: `${spec.name} ${problem}` };
    if (spec.live) live = true;
    if (spec.bypass) bypass = true;
    if (spec.kind === "boolean") argv.push(`--${spec.name}`);
    else if (spec.kind === "pairs") for (const [k, v] of Object.entries(value as Record<string, string>)) argv.push(`--${spec.name}`, `${k}=${v}`);
    else if (spec.kind === "list") for (const item of value as string[]) argv.push(`--${spec.name}=${item}`);
    else argv.push(`--${spec.name}=${String(value)}`);
  }
  const present = (name: string) => given[name] !== undefined && given[name] !== false && given[name] !== "";
  const problem = groupProblem(form.groups, present) ?? countProblem(form, (name) => given[name]);
  if (problem) return { ok: false, message: problem };
  return { ok: true, argv, live, bypass };
}

export function inputFlagNames(input: CommandInput): string[] {
  return [...new Set(input.forms.flatMap((f) => f.flags.map((flag) => flag.name)))];
}
