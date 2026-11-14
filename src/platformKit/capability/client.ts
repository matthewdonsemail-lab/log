import { commandKey, PLATFORM_LABELS, PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { Command, InputForm } from "../../cli/runner/types.ts";
import { CAPABILITIES } from "./helpers/index.ts";
import type { CanonicalInput, CapabilityAccount, CapabilityArgv, CapabilityDefinition, CapabilityRefusal, CapabilityRow, InputMapping, PlatformBinding, PlatformChoice } from "./types.ts";

const capital = (word: string): string => word[0].toUpperCase() + word.slice(1);

export const capabilityTool = (definition: Pick<CapabilityDefinition, "noun" | "verb">): string => `${definition.noun}${capital(definition.verb)}`;

export function capabilityOf(tool: string, definitions: readonly CapabilityDefinition[] = CAPABILITIES): CapabilityDefinition | undefined {
  return definitions.find((definition) => capabilityTool(definition) === tool);
}

export function platformsWith(definition: CapabilityDefinition): Platform[] {
  return PLATFORMS.filter((platform) => definition.platforms[platform] !== undefined);
}

const mappedFlags = (mapping: InputMapping): readonly string[] => ("flag" in mapping ? [mapping.flag] : "choose" in mapping ? mapping.flags : []);

function formOf(commands: readonly Command[], binding: PlatformBinding): { command: Command; form: InputForm } {
  const command = commands.find((c) => commandKey(c) === binding.command);
  if (!command) throw new Error(`capability binding names ${binding.command}, which no command is`);
  const form = command.input?.forms.find((f) => f.words.join(" ") === binding.words.join(" "));
  if (!form) throw new Error(`capability binding names ${binding.command} ${binding.words.join(" ")}, which has no input form`);
  for (const mapping of Object.values(binding.inputs)) {
    for (const flag of mappedFlags(mapping)) if (!form.flags.some((f) => f.name === flag)) throw new Error(`capability binding maps to --${flag}, which ${binding.command} ${binding.words.join(" ")} doesn't take`);
    if ("positional" in mapping && !form.positionals.length) throw new Error(`capability binding maps to a positional, which ${binding.command} ${binding.words.join(" ")} doesn't take`);
  }
  return { command, form };
}

export function capabilityRows(commands: readonly Command[], definitions: readonly CapabilityDefinition[] = CAPABILITIES): CapabilityRow[] {
  return definitions.flatMap((definition) =>
    platformsWith(definition).map((platform): CapabilityRow => {
      const binding = definition.platforms[platform] as PlatformBinding;
      const { command, form } = formOf(commands, binding);
      return {
        tool: capabilityTool(definition),
        noun: definition.noun,
        verb: definition.verb,
        platform,
        command: binding.command,
        words: binding.words,
        effect: form.effect ?? command.effect,
        live: form.flags.some((f) => f.live),
        takes: definition.inputs.map((input) => input.name).filter((name) => name === "account" || binding.inputs[name] !== undefined),
      };
    }),
  );
}

const normalName = (name: string): string => name.trim().replace(/^@/, "").toLowerCase();

export function choosePlatform(accounts: readonly CapabilityAccount[], account: string, platform?: Platform): PlatformChoice {
  const kept = accounts.filter((a) => normalName(a.name) === normalName(account));
  const where = [...new Set(kept.map((a) => a.platform))];
  if (platform) {
    if (where.includes(platform)) return { ok: true, platform, account: kept.find((a) => a.platform === platform)!.name };
    if (where.length) return { ok: false, code: "accountPlatformMismatch", detail: `${account} is kept under ${where.map((p) => PLATFORM_LABELS[p]).join(", ")}, not ${PLATFORM_LABELS[platform]}` };
    return { ok: true, platform, account: account.trim() };
  }
  if (where.length === 1) return { ok: true, platform: where[0], account: kept[0].name };
  if (where.length > 1) return { ok: false, code: "platformAmbiguous", detail: `${account} is kept under ${where.map((p) => PLATFORM_LABELS[p]).join(" and ")}: give the platform` };
  return { ok: false, code: "accountNotFound", detail: `no account ${account} in this workspace's accounts file or sessions; give the platform to look it up on that platform` };
}

export function capabilityMissing(definition: CapabilityDefinition, platform: Platform): CapabilityRefusal {
  const platformsWithIt = platformsWith(definition);
  return { ok: false, code: "capabilityMissing", detail: `${capabilityTool(definition)} isn't on ${PLATFORM_LABELS[platform]}; it is on ${platformsWithIt.map((p) => PLATFORM_LABELS[p]).join(", ")}`, platformsWithIt };
}

export function argvFor(definition: CapabilityDefinition, platform: Platform, input: Partial<Record<CanonicalInput, string | number | boolean>>): CapabilityArgv {
  const binding = definition.platforms[platform];
  if (!binding) return capabilityMissing(definition, platform);
  const argv: string[] = [...binding.words];
  const flags: string[] = [];
  for (const spec of definition.inputs) {
    const value = input[spec.name];
    if (value === undefined || value === "" || value === false) continue;
    const mapping = binding.inputs[spec.name];
    if (!mapping) {
      if (spec.name === "account") continue;
      return { ok: false, code: "inputUnsupported", detail: `${spec.name} isn't taken by ${capabilityTool(definition)} on ${PLATFORM_LABELS[platform]}` };
    }
    const text = String(value);
    if (value === true && "flag" in mapping) flags.push(`--${mapping.flag}`);
    else if ("positional" in mapping) argv.push(text);
    else flags.push(`--${"flag" in mapping ? mapping.flag : mapping.choose(text).flag}`, text);
  }
  return { ok: true, platform, command: binding.command, argv: [...argv, ...flags] };
}
