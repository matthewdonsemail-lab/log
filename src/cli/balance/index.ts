import { checkBalances, needsMoney, PROVIDER_INFO, PROVIDERS } from "../../billing/index.ts";
import type { Provider, ProviderBalance } from "../../billing/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const BALANCE_USAGE = [
  "Usage: log balance [--provider <name>] [--json]",
  `Every paid provider log calls, with what is left: ${PROVIDERS.join(", ")}.`,
  "A provider with a balance API (Jina, Fish Audio, treg, 2Captcha, Byteful) is read from it. One without one (SubQ, Inworld, AssemblyAI, Parallel) shows its last answer to a real call, which log keeps for every call (~/.logCli/billing/answers.jsonl). A provider that answered it is out of credit shows outOfCredit, so a failing voice note or gate is seen as money, not a bug.",
  "Reading balances spends nothing (rule 41). Topping up is matt's: never done from log.",
].join("\n");

export const BALANCE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Every paid provider log calls (SubQ, Jina, Inworld, Fish Audio, AssemblyAI, Parallel, treg, 2Captcha, Byteful): its balance, or its last answer when it has no balance API, and which are out of credit",
      positionals: [],
      flags: [{ name: "provider", kind: "enum", values: PROVIDERS, description: "Only this provider" }, JSON_FLAG],
    },
  ],
};

const MARK: Record<ProviderBalance["state"], string> = { ok: "ok", low: "LOW", empty: "EMPTY", outOfCredit: "OUT OF CREDIT", failing: "failing", unknown: "unknown", notSetUp: "not set up" };

export function balanceLines(balances: readonly ProviderBalance[]): string[] {
  const lines = balances.map((b) => {
    const last = b.lastAnswer ? `, last answer ${b.lastAnswer.status} at ${b.lastAnswer.at.slice(0, 16).replace("T", " ")} UTC${b.lastAnswer.said ? `: ${b.lastAnswer.said.slice(0, 120)}` : ""}` : "";
    return `  ${b.label.padEnd(11)} ${MARK[b.state].padEnd(13)} ${b.amount ?? ""}${b.amount ? "  " : ""}(${b.detail}${last})`;
  });
  const short = needsMoney(balances);
  const head = short.length ? `>>> NEEDS MONEY: ${short.map((b) => `${b.label} (${MARK[b.state]}, used for ${b.usedFor}; top up at ${b.topUp})`).join("; ")}` : "Every provider that could be read has credit.";
  return [head, ...lines];
}

export const balanceCommand: Command = {
  usage: BALANCE_USAGE,
  platform: "any",
  name: "balance",
  effect: "read",
  input: BALANCE_INPUT,
  summary: "Every paid provider log calls, with what is left and which are out of credit",
  args: "[--provider <name>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(BALANCE_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log balance: ${parsed.error}\n${BALANCE_USAGE}` };
    const only = typeof parsed.flags["provider"] === "string" ? [parsed.flags["provider"] as Provider] : [...PROVIDERS];
    context.err(`log balance: reading ${only.map((p) => PROVIDER_INFO[p].label).join(", ")}`);
    const balances = await checkBalances(only);
    if (parsed.flags["json"] === true) return { code: 0, stdout: JSON.stringify({ balances, needsMoney: needsMoney(balances).map((b) => b.provider) }, null, 2) };
    return { code: 0, stdout: ["log balance:", ...balanceLines(balances)].join("\n") };
  },
};
