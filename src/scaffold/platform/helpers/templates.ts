import type { PlatformNames } from "../types.ts";

export function sessionClient(n: PlatformNames): string {
  return `import { join } from 'node:path'
import { findPlatformAccount, platformGate, recordPlatformSession, runPlatformEngine } from '../../../platformKit/session/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from '../../../platformKit/session/index'
import type { TwentyClient } from '../../../twenty/graphql/index'

export const ${n.constant}_PLATFORM: PlatformShape = {
  platform: '${n.name}',
  twentyPlatform: '${n.twentyPlatform}',
  label: '${n.label}',
  engine: join(import.meta.dir, '..', '..', '..', '..', 'python', '${n.name}Api', 'engine.py'),
  sessionCookies: [${n.sessionCookies.map((c) => `'${c}'`).join(", ")}]
}

export const ${n.constant}_COOKIE_DOMAIN = '${n.cookieDomain}'

export function find${n.pascal}Account(twenty: TwentyClient, ref: string): Promise<PlatformAccount> {
  return findPlatformAccount(twenty, ${n.constant}_PLATFORM, ref)
}

export function ${n.name}Gate(account: PlatformAccount): PlatformGate {
  return platformGate(account, ${n.constant}_PLATFORM)
}

export function run${n.pascal}Engine(account: PlatformAccount, spec: PlatformEngineSpec): PlatformEngineRun {
  return runPlatformEngine(${n.constant}_PLATFORM, account, spec)
}

export function record${n.pascal}Session(twenty: TwentyClient, account: PlatformAccount, run: PlatformEngineRun, now: Date): Promise<string[]> {
  return recordPlatformSession(twenty, ${n.constant}_PLATFORM, account, run, now, ${n.constant}_COOKIE_DOMAIN)
}
`;
}

export const sessionIndex = () => `export * from './client'\n`;

export const accountIndex = () => `export * as session from "./session/index.ts";\n`;

export function cliIndex(n: PlatformNames): string {
  return `import { find${n.pascal}Account, record${n.pascal}Session, ${n.name}Gate } from "../../${n.name}/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const ${n.constant}_SESSION_USAGE = [
  "Usage: log ${n.name} session check --account <accountName> [--json]",
  "Checks that ${n.label} still accepts the account's saved session, on the direct-API engine (${n.libraryText}, no browser). Sends nothing.",
  "${n.label}'s own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\\n");

export const ${n.constant}_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that ${n.label} still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The ${n.twentyPlatform} socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return \`log ${n.name} session check: \${accountName} is loggedIn\${answer.screenName ? \` as \${answer.screenName}\` : ""}, via the direct-API engine (${n.libraryText}, no browser).\`;
  return \`log ${n.name} session check: \${accountName}: \${answer.code}\${answer.loginState ? \` (\${answer.loginState})\` : ""}: \${answer.detail ?? ""}\`;
}

export const ${n.name}SessionCommand: Command = {
  usage: ${n.constant}_SESSION_USAGE,
  platform: "${n.name}",
  name: "session",
  effect: "read",
  input: ${n.constant}_SESSION_INPUT,
  summary: "Check that ${n.label} still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(${n.constant}_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: \`log ${n.name} session: \${parsed.error}\\n\${${n.constant}_SESSION_USAGE}\` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: \`log ${n.name} session: give check\\n\${${n.constant}_SESSION_USAGE}\` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: \`log ${n.name} session check: --account is needed\\n\${${n.constant}_SESSION_USAGE}\` };
    try {
      const account = await find${n.pascal}Account(context.twenty, ref);
      const gate = ${n.name}Gate(account);
      if (!gate.ok) return refuse("${n.name} session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.${n.seam}) return { code: 1, stderr: "log ${n.name} session check: the direct-API engine isn't wired in this context" };
      context.err(\`\${account.accountName}: session check on the direct-API engine (${n.libraryText})\`);
      const run = context.${n.seam}(account, { action: "ping" });
      for (const line of await record${n.pascal}Session(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "${n.name}", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("${n.name} session check", error);
    }
  },
};
`;
}

export function cliTest(n: PlatformNames): string {
  return `import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { ${n.constant}_PLATFORM } from "../../${n.name}/account/session/index.ts";
import { runCli } from "../runner/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "${n.name}One", accountName: "${n.name}One", platform: "${n.twentyPlatform}", cookies: { ${n.sessionCookies.length ? n.sessionCookies.map((c) => `${JSON.stringify(c)}: "x".repeat(20)`).join(", ") : `session: "x".repeat(20)`} }, proxy: null } as never);
  return twenty;
}

async function run(argv: string[], engine?: PlatformEngineRun, twenty = fixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    ${n.seam}: (account, spec) => {
      calls.push(\`\${account.accountName}:\${spec.action}\`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "${n.name}One")!;
  return { code, out: out.join("\\n"), err: err.join("\\n"), calls, row };
}

describe("log ${n.name} session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["${n.name}", "session", "check", "--account", "${n.name}One"], { answer: { ok: true, loginState: "loggedIn", screenName: "${n.name}One" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["${n.name}One:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["${n.name}", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountNotFound");
    expect(r.calls).toEqual([]);
  });

  test("the generated engine answers engineNotBuilt until its client is wired in", () => {
    const dir = mkdtempSync(join(tmpdir(), "${n.name}Engine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "ping", account: "${n.name}One", platform: "${n.name}", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [${n.constant}_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\\n").pop()!)).toMatchObject({ ok: false, code: "engineNotBuilt" });
  });
});
`;
}

export function pythonEngine(n: PlatformNames): string {
  return `from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platformKit import engine as kit

PLATFORM = "${n.name}"
LIBRARY = ${n.library ? `"${n.library}"` : "None"}
WRITES: tuple[str, ...] = ()


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return kit.not_built(PLATFORM, "ping")


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
`;
}

export function platformDoc(n: PlatformNames): string {
  return `# ${n.label}

Made by \`log new platform ${n.name}\`. ${n.label} is a platform of its own: every command is \`log ${n.name} <command> …\`, and each one is an MCP tool named \`${n.name}<Command>\`.

## What is here

| Part | Where |
| --- | --- |
| The accounts | Twenty \`socialAccounts\` with platform \`${n.twentyPlatform}\` |
| The session (find the account, its gate, its engine, the answer back to Twenty) | \`src/${n.name}/account/session\`, on the shared \`src/platformKit/session\` |
| The commands | \`src/cli/${n.name}/index.ts\`: \`log ${n.name} session check\` (MCP \`${n.name}SessionCheck\`) |
| The engine | \`python/${n.name}Api/engine.py\`, on the shared \`python/platformKit/engine.py\`; each account's governor is under \`~/.logCli/${n.name}/<account>\` |
| The client | ${n.library ? `\`${n.library}\`` : "not vendored yet"} |

## Next

1. Vendor ${n.label}'s client under \`vendor/<library>\` and set \`LIBRARY\` in \`python/${n.name}Api/engine.py\`.
2. Fill in \`ping\` there: call ${n.label} with the account's cookies and answer \`loginState\` from ${n.label}'s own answer.
3. Add each family as an action in the engine, a command in \`src/cli/${n.name}\` and its rules in \`COMMAND_RULES\`, with a \`…Live\` flag for anything that acts on ${n.label}.
`;
}
