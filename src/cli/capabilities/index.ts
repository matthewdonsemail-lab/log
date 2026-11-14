import { readConnectionAccounts } from "../../console/connections/index.ts";
import { argvFor, CAPABILITIES, capabilityTool, choosePlatform, platformsWith } from "../../platformKit/capability/index.ts";
import type { CapabilityAccount, CapabilityDefinition, CapabilityInput } from "../../platformKit/capability/index.ts";
import { commandKey, isPlatform, JSON_FLAG, parseArgs, parserSpecOf, PLATFORM_LABELS, PLATFORMS, refuse } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const capabilityDeps: { accounts: () => CapabilityAccount[]; commands: () => Promise<readonly Command[]> } = {
  accounts: () => readConnectionAccounts().map((account) => ({ name: account.name, platform: account.platform })),
  commands: async () => (await import("../runner/index.ts")).COMMANDS,
};

const PLATFORM_FLAG: FlagSpec = { name: "platform", kind: "enum", values: PLATFORMS, description: "The platform; left out, it is the one the account is kept under. Given, it must be the account's" };

const flagOf = (input: CapabilityInput): FlagSpec => ({ name: input.name, kind: input.kind, description: input.description, ...(input.required ? { required: true } : {}), ...(input.min !== undefined ? { min: input.min } : {}) });

const platformsLine = (definition: CapabilityDefinition): string => `Platforms: ${platformsWith(definition).map((p) => PLATFORM_LABELS[p]).join(", ")}.`;

function usageLine(definition: CapabilityDefinition): string {
  const flags = definition.inputs.map((input) => (input.required ? ` --${input.name} <${input.name}>` : ` [--${input.name} <${input.name}>]`)).join("");
  return `log ${definition.noun} ${definition.verb}${flags} [--platform <p>] [--json]`;
}

function usageOf(noun: string, definitions: readonly CapabilityDefinition[]): string {
  return [
    `Usage: ${definitions.map(usageLine).join("\n       ")}`,
    ...definitions.flatMap((definition) => [`${definition.verb}: ${definition.summary}. It runs that platform's own command with the inputs renamed to its flags (${capabilityTool(definition)}), so the answer is that command's answer.`, platformsLine(definition)]),
    `The platform comes from the account: one account by that name gives its platform, two give platformAmbiguous (give --platform), none gives accountNotFound. A platform without the capability answers capabilityMissing with the platforms that have it, and an input its command doesn't take answers inputUnsupported. Nothing is contacted before that. log ${noun} only reads.`,
  ].join("\n");
}

export function capabilityCommandOf(noun: string, definitions: readonly CapabilityDefinition[] = CAPABILITIES.filter((d) => d.noun === noun)): Command {
  const input: CommandInput = {
    forms: definitions.map((definition) => ({ words: [definition.verb], effect: definition.effect, summary: definition.summary, positionals: [], flags: [...definition.inputs.map(flagOf), PLATFORM_FLAG, JSON_FLAG] })),
  };
  const usage = usageOf(noun, definitions);
  return {
    usage,
    platform: "any",
    name: noun,
    effect: definitions.every((d) => d.effect === "read") ? "read" : "write",
    input,
    summary: definitions.map((d) => d.summary).join("; "),
    args: definitions.map((d) => usageLine(d).slice(`log ${noun} `.length)).join(" | "),
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(input));
      if (!parsed.ok) return { code: 1, error: "inputInvalid", stderr: `log ${noun}: ${parsed.error}\n${usage}` };
      const [verb, ...rest] = parsed.positionals;
      const definition = definitions.find((d) => d.verb === verb);
      if (!definition || rest.length) return { code: 1, error: "inputInvalid", stderr: `log ${noun}: pick ${definitions.map((d) => d.verb).join(" or ")}\n${usage}` };
      const label = `${noun} ${verb}`;
      const text = (name: string): string | undefined => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() || undefined : undefined);
      const given = Object.fromEntries(definition.inputs.map((spec) => [spec.name, text(spec.name)]));
      for (const spec of definition.inputs) if (spec.required && !given[spec.name]) return { code: 1, error: "inputInvalid", stderr: `log ${label}: --${spec.name} is needed\n${usage}` };
      for (const flag of Object.keys(parsed.flags)) if (!["json", "platform", ...definition.inputs.map((s) => s.name)].includes(flag)) return { code: 1, error: "inputInvalid", stderr: `log ${label}: --${flag} isn't one of ${label}'s inputs\n${usage}` };
      const limit = given["limit"];
      if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) return { code: 1, error: "inputInvalid", stderr: `log ${label}: --limit must be a whole number above 0\n${usage}` };
      const platform = text("platform");
      if (platform !== undefined && !isPlatform(platform)) return { code: 1, error: "inputInvalid", stderr: `log ${label}: --platform must be one of ${PLATFORMS.join(", ")}\n${usage}` };
      const chosen = choosePlatform(capabilityDeps.accounts(), String(given["account"]), platform);
      if (!chosen.ok) return refuse(label, chosen.code, chosen.detail);
      const mapped = argvFor(definition, chosen.platform, { ...given, account: chosen.account });
      if (!mapped.ok) return refuse(label, mapped.code, mapped.detail);
      const target = (await capabilityDeps.commands()).find((c) => commandKey(c) === mapped.command);
      if (!target) return refuse(label, "capabilityMissing", `${mapped.command} isn't a command here`);
      const argvOut = [...mapped.argv, ...(parsed.flags["json"] === true ? ["--json"] : [])];
      context.err(`${label}: ${chosen.account} is on ${PLATFORM_LABELS[chosen.platform]}: log ${chosen.platform} ${target.name} ${argvOut.join(" ")}`);
      return target.run(context, argvOut);
    },
  };
}

export const chatsCommand = capabilityCommandOf("chats");

export const messagesCommand = capabilityCommandOf("messages");
