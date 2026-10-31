import { describe, expect, test } from "bun:test";
import { argvOfInput, formToolName, inputSchemaOf, parseArgs, parserSpecOf } from "./helpers/index.ts";
import { COMMANDS } from "./index.ts";
import type { FlagSpec, InputForm, PositionalSpec } from "./types.ts";

const typed = COMMANDS.filter((c) => c.input);

function sample(spec: FlagSpec | PositionalSpec): unknown {
  switch (spec.kind) {
    case "boolean":
      return true;
    case "integer":
      return spec.name === "proxyMs" ? 4000 : 7;
    case "enum":
      return spec.values![spec.values!.length - 1];
    case "pairs":
      return { "1": "two words = one value" };
    case "rest":
      return ["e12", "Bethlehem, Pennsylvania"];
    default:
      return `${spec.name} with "quotes" = and spaces`;
  }
}

function fullInput(form: InputForm): Record<string, unknown> {
  return Object.fromEntries([...form.positionals, ...form.flags].map((s) => [s.name, sample(s)]));
}

describe("one flag spec per command", () => {
  test("Duet's commands declare their input", () => {
    for (const name of ["accounts", "account", "check", "inspect", "listings", "listing", "publish", "conversations", "conversation", "host", "errors", "runs"]) {
      expect(COMMANDS.find((c) => c.name === name)?.input).toBeDefined();
    }
  });

  test("every form, filled in full, parses back through the command's own parser to the same words, values and flags", () => {
    for (const command of typed) {
      for (const form of command.input!.forms) {
        const input = fullInput(form);
        const built = argvOfInput(form, input);
        if (!built.ok) throw new Error(`${formToolName(command, form)}: ${built.message}`);
        const parsed = parseArgs(built.argv.filter((a) => !a.startsWith("--proxyMs=")), parserSpecOf(command.input!));
        if (!parsed.ok) throw new Error(`${formToolName(command, form)}: ${parsed.error}`);
        const positionals = form.positionals.flatMap((p) => (p.kind === "rest" ? (input[p.name] as string[]) : [input[p.name] as string]));
        expect(parsed.positionals).toEqual([...form.words, ...positionals]);
        for (const flag of form.flags.filter((f) => !f.global && f.kind !== "pairs")) {
          expect(parsed.flags[flag.name]).toEqual(flag.kind === "boolean" ? true : String(input[flag.name]));
        }
      }
    }
  });

  test("a form's schema lists every positional and flag, with the required ones", () => {
    for (const command of typed) {
      for (const form of command.input!.forms) {
        const { properties, required } = inputSchemaOf(form);
        expect(Object.keys(properties)).toEqual([...form.positionals, ...form.flags].map((s) => s.name));
        expect(required).toEqual([...form.positionals, ...form.flags].filter((s) => s.required).map((s) => s.name));
      }
    }
  });

  test("a form's tool name is the command and its words, and no two forms share one", () => {
    const names = typed.flatMap((c) => c.input!.forms.map((f) => formToolName(c, f)));
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(expect.arrayContaining(["inspectStart", "inspectDo", "hostSend", "conversationLead", "accountResetOpens", "runsSpace"]));
  });

  test("false booleans and unset fields add nothing", () => {
    const check = COMMANDS.find((c) => c.name === "check")!.input!.forms[0];
    expect(argvOfInput(check, { account: "a", bypass: false, json: false })).toEqual({ ok: true, argv: ["--account=a"], live: false, bypass: false });
  });
});
