import type { FlagSpec, InputForm, InputGroup, ValueFormat } from "../types.ts";

export type FlagValue = string | number | boolean | string[] | Record<string, string>;

export type ValueRead = { ok: true; value: FlagValue } | { ok: false; takes: string };

const SPAN = /^\d{1,4}[dwh]$/;

export const FORMATS: Readonly<Record<ValueFormat, { takes: string; pattern?: string; schemaFormat?: string; test: (text: string) => boolean }>> = {
  date: { takes: "a day, YYYY-MM-DD", pattern: "^\\d{4}-\\d{2}-\\d{2}$", schemaFormat: "date", test: (text) => /^\d{4}-\d{2}-\d{2}$/.test(text) },
  dateOrSpan: { takes: "a date (2026-11-01) or a span (7d, 4w, 12h)", test: (text) => SPAN.test(text.trim()) || !Number.isNaN(Date.parse(text.trim())) },
  time: { takes: "a date or an ISO time (2026-11-01, 2026-11-01T09:00:00Z)", test: (text) => !Number.isNaN(Date.parse(text.trim())) },
  jsonObject: { takes: "a JSON object", test: (text) => {
    try {
      const value: unknown = JSON.parse(text);
      return value !== null && typeof value === "object" && !Array.isArray(value);
    } catch {
      return false;
    }
  } },
};

function range(spec: FlagSpec): string {
  if (spec.min !== undefined && spec.max !== undefined) return ` from ${spec.min} to ${spec.max}`;
  if (spec.min !== undefined) return ` of at least ${spec.min}`;
  if (spec.max !== undefined) return ` of at most ${spec.max}`;
  return "";
}

export function takesOf(spec: FlagSpec): string {
  const shape = spec.pattern ? (spec.takes ?? `text matching ${spec.pattern}`) : spec.format ? FORMATS[spec.format].takes : null;
  switch (spec.kind) {
    case "integer":
      return `a whole number${range(spec)}`;
    case "number":
      return `a number${range(spec)}`;
    case "booleanValue":
      return "true or false";
    case "enum":
      return `one of ${(spec.values ?? []).join(", ")}`;
    case "list":
      return `a list${shape ? ` of ${shape}` : ""}, comma separated or the flag repeated`;
    case "pairs":
      return "key=value";
    case "boolean":
      return "no value";
    default:
      return shape ?? "a value";
  }
}

function inRange(spec: FlagSpec, n: number): boolean {
  return (spec.min === undefined || n >= spec.min) && (spec.max === undefined || n <= spec.max);
}

export function shapeOk(spec: FlagSpec, text: string): boolean {
  if (spec.pattern) return new RegExp(spec.pattern).test(text);
  return spec.format ? FORMATS[spec.format].test(text) : true;
}

export function readText(spec: FlagSpec, raw: string): ValueRead {
  const bad: ValueRead = { ok: false, takes: takesOf(spec) };
  switch (spec.kind) {
    case "integer":
    case "number": {
      const text = raw.trim();
      const n = Number(text);
      if (!text || !Number.isFinite(n) || (spec.kind === "integer" && !Number.isInteger(n)) || !inRange(spec, n)) return bad;
      return { ok: true, value: n };
    }
    case "booleanValue":
      return raw === "true" || raw === "false" ? { ok: true, value: raw === "true" } : bad;
    case "enum":
      return (spec.values ?? []).includes(raw) ? { ok: true, value: raw } : bad;
    case "list": {
      const items = raw.split(",").map((item) => item.trim()).filter(Boolean);
      return items.length && items.every((item) => shapeOk(spec, item)) ? { ok: true, value: items } : bad;
    }
    default:
      return shapeOk(spec, raw.trim()) ? { ok: true, value: raw } : bad;
  }
}

export function refusalText(spec: FlagSpec, got: unknown): string {
  const shown = typeof got === "string" ? `"${got}"` : JSON.stringify(got);
  return `${spec.refusal ?? "inputInvalid"}: --${spec.name} got ${shown}; it takes ${takesOf(spec)}`;
}

export function groupSentence(group: InputGroup): string {
  const names = group.names.join(", ");
  return group.rule === "atLeastOne" ? `Give at least one of ${names}.` : `Give at most one of ${names}.`;
}

export function groupProblem(groups: readonly InputGroup[] | undefined, given: (name: string) => boolean): string | null {
  for (const group of groups ?? []) {
    const present = group.names.filter(given);
    const code = group.refusal ?? "inputInvalid";
    if (group.rule === "atLeastOne" && present.length === 0) return `${code}: ${group.names.map((n) => `--${n}`).join(" or ")} is needed`;
    if (group.rule === "atMostOne" && present.length > 1) return `${code}: ${present.map((n) => `--${n}`).join(" and ")} exclude each other`;
  }
  return null;
}

export function countSentence(form: InputForm): string[] {
  return (form.counts ?? []).map((c) => `With ${c.when.name} ${c.when.values.join(" or ")}, ${c.name} has at least ${c.min} entr${c.min === 1 ? "y" : "ies"}.`);
}

export function countProblem(form: InputForm, valueOf: (name: string) => unknown): string | null {
  for (const rule of form.counts ?? []) {
    const when = valueOf(rule.when.name);
    if (typeof when !== "string" || !rule.when.values.includes(when)) continue;
    const value = valueOf(rule.name);
    const n = Array.isArray(value) ? value.length : value === undefined ? 0 : 1;
    if (n < rule.min) return `inputInvalid: ${rule.when.name} ${when} needs at least ${rule.min} entr${rule.min === 1 ? "y" : "ies"} in ${rule.name}, got ${n}`;
  }
  return null;
}
