import { createAdsPowerClient } from "../../browser/adsPower/index.ts";
import { adsPowerHomes, homesOf, remarkAccountId, syncProfiles } from "../../browser/adsPower/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseError, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { liveThroughAction } from "../../platformKit/action/index.ts";

export const ADS_POWER_USAGE = [
  "Usage: log adsPower status",
  "       log adsPower profiles [--json]",
  "       log adsPower sync [--apply] [--account <accountName>] [--homes <US,IE>] [--json]   (dry run unless --apply; a DEACTIVATED account, or one whose home isn't in --homes or LOG_ADSPOWER_HOMES, gives its profile back first)",
].join("\n");

export const ADS_POWER_INPUT: CommandInput = {
  forms: [
    { words: ["status"], effect: "read", summary: "Whether the AdsPower Local API answers", positionals: [], flags: [] },
    { words: ["profiles"], effect: "read", summary: "Every AdsPower profile, and which account each belongs to", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["sync"],
      summary: "One AdsPower profile per account: release, make and link them (a dry run unless apply)",
      positionals: [],
      flags: [
        { name: "apply", kind: "boolean", live: true, description: "Release, make and link the profiles; without it a dry run that changes nothing" },
        { name: "account", kind: "string", description: "Only this account" },
        { name: "homes", kind: "list", pattern: "^[A-Za-z]{2}$", takes: "two-letter country codes", description: "Only accounts whose home country is one of these (default LOG_ADSPOWER_HOMES)" },
        JSON_FLAG,
      ],
    },
  ],
};

export const adsPowerCommand: Command = liveThroughAction<Command>({
  usage: ADS_POWER_USAGE,
  platform: "any",
  name: "adsPower",
  effect: "write",
  input: ADS_POWER_INPUT,
  summary: "AdsPower: Local API status, its profiles, and one profile per Twenty account (sync)",
  args: "<status|profiles|sync> [--apply] [--account <a>] [--homes <US,IE>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(ADS_POWER_INPUT));
    if (!parsed.ok) return refuseInput("adsPower", parsed.error, ADS_POWER_USAGE);
    const [action, extra] = parsed.positionals;
    if (!action || extra !== undefined || !["status", "profiles", "sync"].includes(action)) return { code: 1, error: "inputInvalid", stderr: `log adsPower: pick status, profiles or sync\n${ADS_POWER_USAGE}` };
    const adsPower = context.adsPower ?? createAdsPowerClient();
    try {
      if (action === "status") {
        const up = await adsPower.status();
        return up ? { code: 0, stdout: "AdsPower Local API: up." } : { code: 1, stderr: "AdsPower Local API: not answering (adsPowerUnavailable). Start the AdsPower app, check ADSPOWER_HOST." };
      }
      if (action === "profiles") {
        const profiles = await adsPower.listProfiles();
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ profiles }, null, 2) };
        if (profiles.length === 0) return { code: 0, stdout: "No AdsPower profiles." };
        const lines = profiles.map((p) => `${p.profileId.padEnd(10)} ${p.name.padEnd(22)} ${remarkAccountId(p.remark) ? `twenty ${remarkAccountId(p.remark)}` : "(not log-cli)"}`);
        return { code: 0, stdout: [`${profiles.length} AdsPower profile(s):`, ...lines].join("\n") };
      }
      const apply = parsed.flags["apply"] === true;
      const account = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : undefined;
      const homes = typeof parsed.flags["homes"] === "string" ? homesOf(parsed.flags["homes"]) : adsPowerHomes();
      const result = await syncProfiles(context.twenty, adsPower, { apply, account, homes, log: (line) => context.err(line) });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(result, null, 2) };
      const counts = result.entries.reduce<Record<string, number>>((n, e) => ({ ...n, [e.action]: (n[e.action] ?? 0) + 1 }), {});
      const failed = result.entries.filter((e) => apply && (e.action === "create" || e.action === "relink") && !e.profileId);
      const lines = result.entries.map((e) => `${e.accountName.padEnd(18)} ${e.action.padEnd(7)} ${e.profileId ?? "-"}${e.note ? `  (${e.note})` : ""}`);
      const head = `${apply ? "AdsPower sync applied" : "AdsPower sync (dry run; --apply to release, make and link the profiles)"}${homes ? `, homes ${homes.join(", ")}` : ""}:`;
      const summary = Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ");
      return { code: failed.length ? 1 : 0, stdout: [head, ...lines, summary].join("\n") };
    } catch (error) {
      return refuseError("adsPower", error);
    }
  },
}, ["apply"]);
