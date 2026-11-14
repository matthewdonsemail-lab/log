import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { CREDENTIAL_PROVIDERS, credentialFields } from "../../auth/credentials/index.ts";
import type { CredentialFetch, CredentialProvider } from "../../auth/credentials/index.ts";
import { READABLE_PROVIDERS, readConsoleCredentials, saveConsoleCredentials } from "../../console/credentials/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { shouldPrompt } from "../launch/helpers/shouldPrompt.ts";
import type { LaunchTTY } from "../launch/helpers/shouldPrompt.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult } from "../runner/types.ts";

export const CREDENTIALS_USAGE = [
  `Usage: log credentials save --provider <${CREDENTIAL_PROVIDERS.join("|")}> [--host <url>] [--homes <CC,CC|all>]`,
  `       log credentials read --provider <${READABLE_PROVIDERS.join("|")}> [--json]`,
  "save keeps a provider's keys in this machine's settings file, the same save as the console's Settings page: each key is typed in a masked prompt, never passed as a flag or printed, and is checked with the provider before it is written; nothing is written when the provider refuses it. --host and --homes are the browser provider's local API URL and allowed countries (default: what is saved now). read shows a provider's saved values that are not secret, the same read the console's form starts from.",
].join("\n");

const PUBLIC_FIELD_FLAGS: Readonly<Record<string, string>> = { ADSPOWER_HOST: "host", LOG_ADSPOWER_HOMES: "homes" };

export const CREDENTIALS_INPUT: CommandInput = {
  forms: [
    {
      words: ["save"],
      effect: "write",
      terminalOnly: "asks for each key in a masked prompt and checks it with the provider before saving: the owner runs it in a terminal",
      summary: "Save a provider's keys to this machine's settings file from masked prompts, checked with the provider first",
      positionals: [],
      flags: [
        { name: "provider", kind: "enum", values: CREDENTIAL_PROVIDERS, required: true, refusal: "credentialInputInvalid", description: "Whose keys to save" },
        { name: "host", kind: "string", description: "The browser provider's local API URL (default: the saved one)" },
        { name: "homes", kind: "string", description: "The browser provider's allowed countries, two-letter codes or all (default: the saved ones)" },
      ],
    },
    {
      words: ["read"],
      effect: "read",
      summary: "A provider's saved values that are not secret, the same read the console's form starts from",
      positionals: [],
      flags: [{ name: "provider", kind: "enum", values: READABLE_PROVIDERS, required: true, refusal: "credentialInputInvalid", description: "Whose saved values to read" }, JSON_FLAG],
    },
  ],
};

interface CredentialPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

export const credentialsDeps: { prompts: CredentialPrompts; tty: () => LaunchTTY; fetcher?: CredentialFetch; env?: Record<string, string | undefined> } = {
  prompts: { intro, outro, cancel, password: password as CredentialPrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

function refused(name: string, error: unknown): CommandResult {
  const code = error instanceof Error ? error.message.split(":")[0] : "";
  return isErrorCode(code) ? refuse(name, code) : refuse(name, "crashed", error instanceof Error ? error.message : String(error));
}

async function askSecrets(provider: CredentialProvider): Promise<Record<string, string> | null> {
  const prompts = credentialsDeps.prompts;
  const values: Record<string, string> = {};
  for (const field of credentialFields[provider].filter((f) => f.secret)) {
    const optional = field.required === false;
    const answer = await prompts.password({ message: `${field.label}${optional ? " (empty: keep the saved one)" : ""}`, mask: "•", validate: (v) => (optional || (v ?? "").trim() ? undefined : "this key is needed") });
    if (isCancel(answer)) return null;
    const value = String(answer ?? "").trim();
    if (value) values[field.id] = value;
  }
  return values;
}

async function save(provider: CredentialProvider, flags: Record<string, string | true>): Promise<CommandResult> {
  const name = "credentials save";
  const env = credentialsDeps.env ?? process.env;
  const publicIds = credentialFields[provider].filter((f) => !f.secret).map((f) => f.id);
  const given = Object.entries(PUBLIC_FIELD_FLAGS).filter(([, flag]) => typeof flags[flag] === "string");
  if (given.some(([id]) => !publicIds.includes(id))) return refuse(name, "credentialInputInvalid", `${given.map(([, flag]) => `--${flag}`).join(", ")} is not a ${provider} field`);
  if (!shouldPrompt(false, credentialsDeps.tty())) return refuse(name, "terminalOnly", "the keys are typed in a masked prompt, so it runs in a terminal (they are never passed as flags)");
  const saved = publicIds.length ? readConsoleCredentials({ provider }, env) : {};
  const values: Record<string, string> = Object.fromEntries(publicIds.map((id) => [id, typeof flags[PUBLIC_FIELD_FLAGS[id]] === "string" ? String(flags[PUBLIC_FIELD_FLAGS[id]]) : (saved[id] ?? "")]));
  const prompts = credentialsDeps.prompts;
  prompts.intro(`log credentials save: ${provider}`);
  const secrets = await askSecrets(provider);
  if (!secrets) {
    prompts.cancel("Nothing saved.");
    return refuse(name, "inputInvalid", "cancelled, nothing saved");
  }
  try {
    const result = await saveConsoleCredentials({ provider, values: { ...values, ...secrets } }, { fetcher: credentialsDeps.fetcher, env });
    prompts.outro(result.changed ? "Checked with the provider and saved." : "Checked with the provider; nothing had changed.");
    return { code: 0, stdout: `log credentials save: ${provider} ${result.changed ? "saved" : "unchanged"} (checked with the provider first; keys <set>)` };
  } catch (error) {
    prompts.cancel("Nothing saved.");
    return refused(name, error);
  }
}

export const credentialsCommand: Command = {
  usage: CREDENTIALS_USAGE,
  platform: "any",
  name: "credentials",
  effect: "write",
  input: CREDENTIALS_INPUT,
  summary: "A provider's keys on this machine: save them from masked prompts, checked with the provider first, or read the values that are not secret",
  args: "save --provider <p> [--host <url>] [--homes <list>] | read --provider <p> [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(CREDENTIALS_INPUT));
    if (!parsed.ok) return refuseInput("credentials", parsed.error, CREDENTIALS_USAGE);
    const [sub, extra] = parsed.positionals;
    if (extra !== undefined || (sub !== "save" && sub !== "read")) return { code: 1, error: "inputInvalid", stderr: `log credentials: say save or read\n${CREDENTIALS_USAGE}` };
    const provider = String(parsed.flags["provider"] ?? "") as CredentialProvider;
    if (sub === "save") return save(provider, parsed.flags);
    try {
      const values = readConsoleCredentials({ provider }, credentialsDeps.env ?? process.env);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ provider, values }, null, 2) };
      return { code: 0, stdout: [`log credentials read: ${provider}'s saved values that are not secret:`, ...Object.entries(values).map(([id, value]) => `  ${id}: ${value || "(not set)"}`)].join("\n") };
    } catch (error) {
      return refused("credentials read", error);
    }
  },
};
