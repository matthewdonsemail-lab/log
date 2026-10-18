/**
 * `log campaign` — one ad on many accounts in one place, through Twenty.
 *
 *   fill  --campaign <id> --from <listingId> --accounts <n>
 *         puts the ad on n accounts in its country: new READY listings, one
 *         per account (same city first, least recently used next)
 *   heal  --campaign <id>
 *         gives every ACCOUNT_LOST listing in it a replacement account
 *   run   --campaign <id> [--live]
 *         publishes its READY listings one by one (dry run unless --live);
 *         each goes through the account check and the proxy gate (rule 12)
 *   show  --campaign <id>
 *
 * Accounts and listings are never deleted. Replaced listings stay as
 * REPLACED, pointing at their replacement.
 */
import { getListing, listListingsWhere, toPublishListing } from "../../marketplace/agencyListing/index.ts";
import { fillCampaign, healCampaign } from "../../marketplace/replacement/index.ts";
import { listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import { renderListingsTable } from "../listing/helpers/index.ts";
import { publishCommand } from "../publish/index.ts";
import { parseArgs, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const CAMPAIGN_USAGE = [
  "Usage: log campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts <n>",
  "       log campaign heal --campaign <agencyCampaignId>",
  "       log campaign run  --campaign <agencyCampaignId> [--live]",
  "       log campaign show --campaign <agencyCampaignId> [--json]",
].join("\n");

export const campaignCommand: Command = {
  name: "campaign",
  summary: "Put one ad on N accounts in one place, replace lost accounts, publish the campaign",
  args: "<fill|heal|run|show> --campaign <id> [...]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["live", "json"], valued: ["campaign", "from", "accounts"] });
    if (!parsed.ok) return { code: 1, stderr: `log campaign: ${parsed.error}\n${CAMPAIGN_USAGE}` };
    const [action, extra] = parsed.positionals;
    const campaignId = parsed.flags["campaign"];
    if (!action || extra !== undefined || !["fill", "heal", "run", "show"].includes(action) || typeof campaignId !== "string") {
      return { code: 1, stderr: `log campaign: pick fill, heal, run or show, with --campaign\n${CAMPAIGN_USAGE}` };
    }
    try {
      if (action === "show") {
        const [listings, accounts] = await Promise.all([listListingsWhere(context.twenty, { campaignId: { eq: campaignId } }), listFacebookAccounts(context.twenty)]);
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ campaignId, listings }, null, 2) };
        return { code: 0, stdout: renderListingsTable(listings, accounts) };
      }

      if (action === "fill") {
        const from = parsed.flags["from"];
        const count = Number(parsed.flags["accounts"]);
        if (typeof from !== "string" || !Number.isInteger(count) || count < 1) {
          return { code: 1, stderr: `log campaign fill: --from <listingId> and --accounts <n> are required\n${CAMPAIGN_USAGE}` };
        }
        const ad = await getListing(context.twenty, from);
        if (!ad) return refuse("campaign fill", "listingNotFound", from);
        const content = toPublishListing(ad);
        if (!content.ok) return refuse("campaign fill", "listingInvalid", content.problems.join("; "));
        const report = await fillCampaign(context.twenty, campaignId, ad, count);
        const lines = report.created.map((c) => `  READY ${c.listing.id} on ${c.account.accountName} (${c.account.homeCity ?? "?"}, ${c.account.homeCountry})`);
        lines.unshift(`Created ${report.created.length} of ${count} listing(s) for "${ad.title}" in ${ad.locationQuery}.`);
        if (report.short) lines.push(`${report.short} short: no more FACEBOOK accounts in ${ad.locationCountry} that are ACTIVE, proxied, under their cap and not already in this campaign.`);
        lines.push("Publish with `log campaign run --campaign <id>` (dry run unless --live).");
        return { code: report.short ? 1 : 0, stdout: lines.join("\n") };
      }

      if (action === "heal") {
        const replacements = await healCampaign(context.twenty, campaignId);
        if (replacements.length === 0) return { code: 0, stdout: "No ACCOUNT_LOST listings in this campaign." };
        const lines = replacements.map((r) =>
          r.next && r.account ? `  "${r.old.title}" → READY ${r.next.id} on ${r.account.accountName}` : `  "${r.old.title}" → still ACCOUNT_LOST: ${r.detail}`,
        );
        return { code: replacements.every((r) => r.next) ? 0 : 1, stdout: lines.join("\n") };
      }

      // run: every READY listing, one at a time, each through the full publish checks.
      const ready = (await listListingsWhere(context.twenty, { campaignId: { eq: campaignId } })).filter((l) => l.status === "ready");
      if (ready.length === 0) return { code: 0, stdout: "No READY listings in this campaign." };
      const summary: string[] = [];
      let failed = 0;
      for (const listing of ready) {
        const args = ["--listing", listing.id, ...(parsed.flags["live"] ? ["--live"] : [])];
        const result = await publishCommand.run(context, args);
        if (result.code !== 0) failed++;
        summary.push(`  ${listing.id} "${listing.title}": ${result.code === 0 ? "ok" : (result.stderr ?? result.stdout ?? "").split("\n")[0]}`);
        if (result.stdout) context.out(result.stdout);
        if (result.stderr) context.err(result.stderr);
      }
      return { code: failed ? 1 : 0, stdout: [`${ready.length - failed}/${ready.length} ${parsed.flags["live"] ? "published" : "dry-run ok"}:`, ...summary].join("\n") };
    } catch (error) {
      return refuseError("campaign", error);
    }
  },
};
