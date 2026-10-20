/**
 * `log adsPower status` — is the AdsPower app's Local API up.
 * `log adsPower profiles [--json]` — the profiles in AdsPower, and which Twenty account each belongs to.
 * `log adsPower sync [--apply] [--account <a>]` — one AdsPower profile per Facebook account in
 * Twenty, linked by socialAccounts.adsPowerProfileId (rule 42). A dry run unless --apply.
 * Nothing opens a browser: profiles hold no proxy, password or cookies (those stay in Twenty).
 */
import { createAdsPowerClient } from "../../browser/adsPower/index.ts";
import { remarkAccountId, syncProfiles } from "../../browser/adsPower/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const ADS_POWER_USAGE = [
  "Usage: log adsPower status",
  "       log adsPower profiles [--json]",
  "       log adsPower sync [--apply] [--account <accountName>] [--json]   (dry run unless --apply)",
].join("\n");

export const adsPowerCommand: Command = {
  usage: ADS_POWER_USAGE,
  platform: "any",
  name: "adsPower",
  summary: "AdsPower: Local API status, its profiles, and one profile per Twenty account (sync)",
  args: "<status|profiles|sync> [--apply] [--account <a>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json", "apply"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log adsPower: ${parsed.error}\n${ADS_POWER_USAGE}` };
    const [action, extra] = parsed.positionals;
    if (!action || extra !== undefined || !["status", "profiles", "sync"].includes(action)) return { code: 1, stderr: `log adsPower: pick status, profiles or sync\n${ADS_POWER_USAGE}` };
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
      const result = await syncProfiles(context.twenty, adsPower, { apply, account, log: (line) => context.err(line) });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(result, null, 2) };
      const counts = result.entries.reduce<Record<string, number>>((n, e) => ({ ...n, [e.action]: (n[e.action] ?? 0) + 1 }), {});
      const failed = result.entries.filter((e) => apply && (e.action === "create" || e.action === "relink") && !e.profileId);
      const lines = result.entries.map((e) => `${e.accountName.padEnd(18)} ${e.action.padEnd(7)} ${e.profileId ?? "-"}${e.note ? `  (${e.note})` : ""}`);
      const head = apply ? "AdsPower sync applied:" : "AdsPower sync (dry run; --apply to make and link the profiles):";
      const summary = Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ");
      return { code: failed.length ? 1 : 0, stdout: [head, ...lines, summary].join("\n") };
    } catch (error) {
      return refuseError("adsPower", error);
    }
  },
};
