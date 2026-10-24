import { existsSync } from "node:fs";
import { adsPowerHomes, createAdsPowerClient, ensureKernel, homesOf, newestKernel } from "../../browser/adsPower/index.ts";
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import { slowFacebookMs } from "../../browser/proxy/index.ts";
import { listLaunches, prepareRun } from "../../browser/run/index.ts";
import { readProgress } from "../../marketplace/host/index.ts";
import { preflightOf, renderPreflight } from "../../marketplace/preflight/index.ts";
import type { KernelFact, PreflightFacts, ProxyFact } from "../../marketplace/preflight/index.ts";
import { findAccount, listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext } from "../runner/types.ts";

export const PREFLIGHT_USAGE = [
  "Usage: log facebook preflight [--account <accountName>] [--homes <US,CA>] [--noProxy] [--apply] [--json]",
  "  Before any browser opens: each account's home timezone, waking hours, proxy (country and speed), AdsPower profile and browser kernel, today's launches and host opens, a session left open, and its profile picture on disk.",
  "  --apply downloads AdsPower's newest SunBrowser kernel when it is missing and waits for it. Nothing opens on Facebook.",
].join("\n");

async function proxyFact(context: CommandContext, account: FacebookAccount): Promise<ProxyFact | null> {
  if (!account.proxy) return null;
  const prepared = prepareRun(account, "check");
  if (!prepared.ok) return { ok: false, code: prepared.code, detail: prepared.detail };
  try {
    const result = await context.worker({ action: "proxy.check", account_id: account.id, proxy_path: prepared.run.proxyPath });
    if (!result.ok) return { ok: false, code: result.code, detail: result.detail };
    const check = result as { exitCountry?: string; facebookMs?: number | null };
    return { ok: true, exitCountry: check.exitCountry ?? null, facebookMs: check.facebookMs ?? null };
  } catch (error) {
    return { ok: false, code: "proxyCheckFailed", detail: error instanceof Error ? error.message : String(error) };
  } finally {
    prepared.run.cleanup();
  }
}

async function kernelFact(context: CommandContext, apply: boolean): Promise<KernelFact> {
  const adsPower = context.adsPower ?? createAdsPowerClient();
  if (!(await adsPower.status())) return { reachable: false, newest: null, downloaded: false, detail: "the AdsPower Local API does not answer (is AdsPower running?)" };
  try {
    if (apply) {
      const ensured = await ensureKernel(adsPower, context.err);
      if (!ensured.ok) return { reachable: true, newest: null, downloaded: false, detail: ensured.detail };
    }
    const { newest, downloaded } = await newestKernel(adsPower);
    return { reachable: true, newest, downloaded };
  } catch (error) {
    return { reachable: false, newest: null, downloaded: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

const onDisk = (path: string | null): boolean | null => (!path || /^https?:\/\//i.test(path) ? null : existsSync(path));

export const preflightCommand: Command = {
  usage: PREFLIGHT_USAGE,
  platform: "facebook",
  name: "preflight",
  effect: "read",
  summary: "Before any browser opens, check each account will get through: home timezone, hours, proxy speed and country, the account's browser and its kernel, launches and host opens left, no session left open, its picture on disk",
  args: "[--account <a>] [--homes <US,CA>] [--noProxy] [--apply] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "apply", "noProxy"], valued: ["account", "homes"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook preflight: ${parsed.error}\n${PREFLIGHT_USAGE}` };
    try {
      const homes = typeof parsed.flags["homes"] === "string" ? homesOf(parsed.flags["homes"]) : adsPowerHomes();
      const accounts = typeof parsed.flags["account"] === "string"
        ? [await findAccount(context.twenty, parsed.flags["account"])]
        : (await listFacebookAccounts(context.twenty)).filter((a) => a.status !== "deactivated" && (!homes || homes.includes((a.homeCountry ?? "").toUpperCase())));
      const now = (context.now ?? (() => new Date()))();
      context.err(`preflight: ${accounts.length} account(s), AdsPower kernel first`);
      const kernel = await kernelFact(context, Boolean(parsed.flags["apply"]));
      const rows = [];
      for (const [i, account] of accounts.entries()) {
        context.err(`preflight ${i + 1}/${accounts.length}: ${account.accountName} (${account.homeCity ?? "?"})${parsed.flags["noProxy"] ? "" : ", measuring its proxy"}`);
        const progress = readProgress(account.accountName);
        const facts: PreflightFacts = {
          proxy: parsed.flags["noProxy"] ? null : await proxyFact(context, account),
          kernel,
          launches: listLaunches(account.accountName),
          hostOpensToday: progress?.resume.opensToday ?? 0,
          hostDay: progress?.day ?? null,
          sessionPid: readCurrentInspect(undefined, account.accountName)?.pid ?? null,
          profilePhotoOnDisk: onDisk(account.profilePhoto),
        };
        rows.push(preflightOf(account, facts, now, slowFacebookMs()));
      }
      const blocked = rows.some((r) => !r.ready);
      if (parsed.flags["json"]) return { code: blocked ? 1 : 0, stdout: JSON.stringify({ accounts: rows }, null, 2) };
      return { code: blocked ? 1 : 0, stdout: renderPreflight(rows) };
    } catch (error) {
      return refuseError("preflight", error);
    }
  },
};
