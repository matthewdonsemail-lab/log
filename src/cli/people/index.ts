import { cardFor, linkIdentities, linkReport, listPeople, markNotLinked, reviewBand, unlinkIdentity } from "../../people/index.ts";
import { backfillBots, botBackfillText, defaultBotSources } from "../../people/bots/index.ts";
import type { Cluster, LinkReport, Recheck, Suggestion } from "../../people/index.ts";
import { localEmbedder } from "../../search/conversations/index.ts";
import { DEFAULT_DECIDER, factDecider, factLine, factsAbout, gliner2Screener, percentile, promiseLines, resolveWho as whoOf } from "../../people/index.ts";
import type { FactDecider, Screener } from "../../people/index.ts";
import { runIndexPass } from "../../indexPass/index.ts";
import type { PassReport } from "../../indexPass/index.ts";
import { storedEmbedder } from "../../inbox/store/index.ts";
import { pointerOf, recallGraph } from "../../relate/graph/index.ts";
import { createDecisionsClient } from "../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../subq/decisions/index.ts";
import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const PEOPLE_USAGE = [
  "Usage: log people [--json]",
  "       log people show <who> [--json]",
  "       log people suggest [--limit <n>] [--check] [--json]   (--check asks SubQ)",
  "       log people link <identity> <identity>... --approvedBy \"<the owner's words>\" [--name \"<name>\"] [--evidence \"<why>\"]",
  "       log people unlink <identity> --approvedBy \"<the owner's words>\"",
  "       log people different <identity> <identity> --approvedBy \"<the owner's words>\"",
  "       log people facts <who> [--all]",
  "       log people facts extract [--who <w>] [--since <t>] [--limit <n>] [--platform <p>]",
  "       log people facts recall \"<q>\" [--limit <n>]",
  "       log people bots [--platform <p>] [--json]",
  "bots: records who each platform itself says is automated (Discord member lists, Slack is_bot), so a bot with an ordinary name leaves the network view; names are never guessed, and a platform with no such flag is skipped and said so.",
  "<who> is a person id (p_…), a linked person's name, or an identity. An identity is platform:handle or platform:id, e.g. discord:someone, twitter:@someone, twitter:1234567890.",
].join("\n");

const APPROVED = { name: "approvedBy", kind: "string", description: "The owner's own words saying yes to this, quoted" } as const;

export const PEOPLE_INPUT: CommandInput = {
  forms: [
    { words: [], summary: "List everyone linked across platforms, with each person's identities", positionals: [], flags: [JSON_FLAG] },
    { words: ["show"], summary: "The person card for someone across every platform: chats, groups, who is waiting, and the last lines in time order", positionals: [{ name: "who", kind: "string", required: true, description: "A person id, a linked person's name, or platform:handle" }], flags: [JSON_FLAG] },
    { words: ["suggest"], summary: "Accounts on different platforms that are probably one person, with every factor", positionals: [], flags: [{ name: "limit", kind: "integer", min: 1, max: 200, description: "How many, default 20" }, { name: "check", kind: "boolean", description: "Ask SubQ about the review band" }, JSON_FLAG] },
    { words: ["link"], effect: "write", summary: "Make these identities one person, after the owner says yes (appended to log.db as events; nothing is sent)", positionals: [{ name: "identities", kind: "rest", required: true, description: "Two or more identities, platform:handle or platform:id" }], flags: [APPROVED, { name: "name", kind: "string", description: "The person's name" }, { name: "evidence", kind: "string", description: "Why, e.g. the suggestion's evidence" }, JSON_FLAG] },
    { words: ["unlink"], effect: "write", summary: "Take an identity out of its person, after the owner says so (the link stays in the history)", positionals: [{ name: "identity", kind: "string", required: true, description: "platform:handle or platform:id" }], flags: [APPROVED, JSON_FLAG] },
    { words: ["facts"], summary: "Someone's lasting facts (job, promises, money owed) with date and source", positionals: [{ name: "who", kind: "string", required: true, description: "A person id, a linked person's name, or platform:handle" }], flags: [{ name: "all", kind: "boolean", description: "Also the replaced ones" }, JSON_FLAG] },
    { words: ["facts", "extract"], effect: "write", summary: "Find facts in new DM lines and record them as events (sends nothing)", positionals: [], flags: [{ name: "who", kind: "string", description: "Only this person" }, { name: "since", kind: "string", description: "Only lines since this time" }, { name: "limit", kind: "integer", min: 1, max: 200, description: "How many recent DMs, default 20" }, { name: "platform", kind: "string", description: "One platform" }, JSON_FLAG] },
    { words: ["facts", "recall"], summary: "Recall current facts by meaning, with evidence", positionals: [{ name: "question", kind: "string", required: true, description: "What to recall" }], flags: [{ name: "limit", kind: "integer", min: 1, max: 50, description: "How many, default 5" }, JSON_FLAG] },
    { words: ["bots"], effect: "write", summary: "Record who each platform itself says is automated, so a bot with an ordinary name leaves the network view", positionals: [], flags: [{ name: "platform", kind: "string", description: "Only this platform (discord, slack, x, instagram, linkedin)" }, JSON_FLAG] },
    { words: ["different"], effect: "write", summary: "Record that two identities are not the same person, after the owner says so, so they are never suggested again", positionals: [{ name: "first", kind: "string", required: true, description: "platform:handle or platform:id" }, { name: "second", kind: "string", required: true, description: "platform:handle or platform:id" }], flags: [APPROVED, JSON_FLAG] },
  ],
};

const label = (i: { platform: string; handle: string | null; userId: string; name: string | null }): string => `${i.platform}:${i.handle ? `@${i.handle}` : i.userId}${i.name ? ` (${i.name})` : ""}`;

const ref = (i: { platform: string; userId: string }): string => `${i.platform}:${i.userId}`;

export function suggestionLines(list: readonly Suggestion[]): string[] {
  return list.flatMap((s, n) => [
    `${n + 1}. ${label(s.a)}  ~  ${label(s.b)}   ${s.band}, ${s.matchWeight.toFixed(1)} bits, p ${s.probability.toFixed(3)}${s.review ? `; SubQ says ${s.review.choice} (${Math.round(s.review.confidence * 100)}%, ${s.review.steps} step${s.review.steps === 1 ? "" : "s"})` : ""}${s.veto ? `; VETOED: ${s.veto}` : ""}`,
    `     prior ${s.prior.toFixed(1)} bits`,
    ...s.comparisons.map((c) => `     ${c.comparison} ${c.level}${c.count ? ` (${c.count}x${c.asks ? `, ${c.asks} asking to like or share` : ""})` : ""}${c.values.length && !c.count ? ` [${c.values.join(" / ")}]` : ""}: ${c.matchWeight >= 0 ? "+" : ""}${c.matchWeight.toFixed(1)} bits (m ${c.m.toFixed(3)}, u ${c.u.toPrecision(2)})${c.sources?.[0] ? `  e.g. "${c.sources[0].text.slice(0, 90)}"` : ""}`),
    `     → log people link ${ref(s.a)} ${ref(s.b)} --approvedBy "…"`,
  ]);
}

export function clusterLines(list: readonly Cluster[]): string[] {
  return list.map((c) => `  together (${c.identities.length} accounts, weakest pair ${c.weakestBits.toFixed(1)} bits): ${c.identities.map(label).join(", ")}\n     → ${c.personIds.length > 1 ? `already ${c.personIds.length} people (${c.personIds.join(", ")}); merging people isn't built, so link the unlinked ones to one of them` : `log people link ${c.identities.map(ref).join(" ")} --approvedBy "…"`}`);
}

export function recheckLines(list: readonly Recheck[]): string[] {
  return list.map((r) => `  ${r.personId}: ${label(r.a)} and ${label(r.b)} ${r.veto ? `hit a veto: ${r.veto}` : `score only ${r.matchWeight.toFixed(1)} bits on the evidence now`} → log people unlink <identity> if wrong`);
}

export function reportText(report: LinkReport, limit: number, checked: { checked: number; usd: number } | null): string {
  const list = report.suggestions.slice(0, limit);
  const learned = report.learned;
  return [
    `log people suggest: ${list.length} of ${report.suggestions.length} pair${report.suggestions.length === 1 ? "" : "s"}, strongest first. Nothing is linked until the owner says yes. Weights learned by EM over ${learned.candidates} candidate pairs, ${learned.sessions} blocking sessions, ${learned.rounds} rounds (match share ${learned.matchShare}); ${report.vetoed.length} vetoed${checked ? `; SubQ checked ${checked.checked} in the review band for $${checked.usd.toFixed(5)}` : ""}.`,
    ...suggestionLines(list),
    ...(report.clusters.length ? ["", "One person across several accounts:", ...clusterLines(report.clusters)] : []),
    ...(report.rechecks.length ? ["", "Links already made that the evidence now doubts:", ...recheckLines(report.rechecks)] : []),
  ].join("\n");
}

export const peopleDeps: { embedder: () => { embed: (texts: string[]) => Promise<Float32Array[]>; stop?: () => void } | null; decisions: () => DecisionsClient; decider: () => FactDecider; screener: () => Screener; factEmbedder: () => { embed: (texts: string[]) => Promise<Float32Array[]>; stop?: () => void } | null } = {
  embedder: () => localEmbedder(),
  decisions: () => createDecisionsClient(),
  screener: () => gliner2Screener(),
  decider: () => factDecider(),
  factEmbedder: () => storedEmbedder(localEmbedder(), "fact"),
};

export function extractText(report: PassReport): string {
  const tail = report.waiting ? `; ${report.waiting}` : "";
  return `log people facts extract: ${report.chats} conversation${report.chats === 1 ? "" : "s"} read, ${report.screened} new line${report.screened === 1 ? "" : "s"} screened and marked, ${report.decided} lasting fact${report.decided === 1 ? "" : "s"} recorded, ${report.queued} mark${report.queued === 1 ? "" : "s"} waiting on the decider, ${percentile(report.ms, 50).toFixed(0)} ms p50 / ${percentile(report.ms, 95).toFixed(0)} ms p95 a conversation${tail}. Every room kind is read, not DMs only.`;
}

function chatsOfIdentities(handle: ReturnType<typeof openDatabase>, identities: readonly { platform: string; userId: string }[]): string[] {
  if (!identities.length) return [];
  const pairs = identities.map(() => "(platform = ? AND userId = ?)").join(" OR ");
  const sent = identities.map(() => "(senderPlatform = ? AND senderUserId = ?)").join(" OR ");
  const values = [...identities.flatMap((i) => [i.platform, i.userId]), ...identities.flatMap((i) => [i.platform, i.userId])];
  const rows = handle.prepare(`SELECT DISTINCT chatId FROM chats WHERE chatId IN (SELECT roomId FROM memberships WHERE ${pairs}) OR chatId IN (SELECT chatId FROM messages WHERE ${sent})`).all(...values) as { chatId: string }[];
  return rows.map((r) => r.chatId);
}

export const peopleCommand: Command = {
  usage: PEOPLE_USAGE,
  platform: "any",
  name: "people",
  effect: "read",
  input: PEOPLE_INPUT,
  summary: "People across platforms: links, suggestions, cards, facts",
  args: "[show <who>|facts <who>|facts extract|facts recall <q>|suggest|link <identity>...|unlink <identity>|different <a> <b>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(PEOPLE_INPUT));
    if (!parsed.ok) return refuseInput("people", parsed.error, PEOPLE_USAGE);
    const [sub, ...rest] = parsed.positionals;
    const json = parsed.flags["json"] === true;
    const approvedBy = typeof parsed.flags["approvedBy"] === "string" ? (parsed.flags["approvedBy"] as string).trim() : "";
    const handle = openDatabase(defaultDbPath());
    if (!sub) {
      const people = listPeople(handle);
      if (json) return { code: 0, stdout: JSON.stringify({ people }, null, 2) };
      if (!people.length) return { code: 0, stdout: "log people: no one is linked across platforms yet. `log people suggest` shows who probably is." };
      return { code: 0, stdout: people.map((p) => `${p.personId}  ${p.name ?? "(no name)"}: ${p.identities.map(label).join(", ")}`).join("\n") };
    }
    if (sub === "show" && rest.length === 1) {
      const found = cardFor(handle, rest[0]);
      if (!found.ok) return refuseInput("people", found.problem, PEOPLE_USAGE);
      return { code: 0, stdout: json ? JSON.stringify(found.card, null, 2) : found.card.text };
    }
    if (sub === "facts" && rest[0] === "extract" && rest.length === 1) {
      let screener: Screener | null = null;
      try {
        const decider: FactDecider = _context.decisions ? { ok: true, model: DEFAULT_DECIDER, decisions: _context.decisions } : peopleDeps.decider();
        screener = (_context.factScreener ?? peopleDeps.screener)();
        const who = typeof parsed.flags["who"] === "string" ? whoOf(handle, parsed.flags["who"] as string) : null;
        if (who && !who.ok) return refuseInput("people", who.problem, PEOPLE_USAGE);
        const chatIds = who && who.ok ? chatsOfIdentities(handle, who.identities) : undefined;
        if (who && chatIds && !chatIds.length) return { code: 0, stdout: `log people facts extract: no chat with ${parsed.flags["who"] as string} in log.db` };
        const report = await runIndexPass(handle, {
          only: "facts",
          screener: () => screener!,
          decider: () => decider,
          ...(chatIds ? { chatIds } : {}),
          ...(typeof parsed.flags["since"] === "string" ? { since: parsed.flags["since"] as string } : {}),
          ...(numberOf(parsed, "limit") ? { limit: numberOf(parsed, "limit")! } : {}),
          ...(typeof parsed.flags["platform"] === "string" ? { platform: parsed.flags["platform"] as string } : {}),
          log: (line) => _context.err(line),
        });
        if (!decider.ok) return { ...refuse("people facts extract", "factDeciderUnavailable", `${decider.problem}; ${report.queued} marked message${report.queued === 1 ? "" : "s"} stay queued`), stdout: json ? JSON.stringify(report, null, 2) : extractText(report) };
        return { code: 0, stdout: json ? JSON.stringify(report, null, 2) : extractText(report) };
      } catch (error) {
        return refuseError("people facts extract", error);
      } finally {
        screener?.stop?.();
      }
    }
    if (sub === "facts" && rest[0] === "recall" && rest.length === 2) {
      const pointer = pointerOf();
      if (!pointer) return refuse("people facts recall", "factsNoGraph");
      let embedder: { embed: (texts: string[]) => Promise<Float32Array[]>; stop?: () => void } | null = null;
      try {
        embedder = _context.embedder ? _context.embedder() : peopleDeps.embedder();
        if (!embedder) return refuse("people facts recall", "factScreenUnavailable", "no embedder");
        const [vector] = await embedder.embed([rest[1]]);
        const { facts: found } = await recallGraph(vector, numberOf(parsed, "limit") ?? 5);
        if (json) return { code: 0, stdout: JSON.stringify({ facts: found }, null, 2) };
        if (!found.length) return { code: 0, stdout: "log people facts recall: no current fact is near that." };
        return { code: 0, stdout: found.map((f) => `${f.score.toFixed(2)}  ${f.slot} about ${f.about.join(", ") || "?"} since ${f.validFrom.slice(0, 10)}: "${f.memory}"\n      evidence: ${f.evidence.map((e, i) => `"${e.slice(0, 120)}" (${(f.evidenceAt[i] ?? "").slice(0, 10)})`).join("; ")}${f.replaced.length ? `\n      replaced: ${f.replaced.map((r) => `"${r.slice(0, 80)}"`).join("; ")}` : ""}`).join("\n") };
      } catch (error) {
        return refuseError("people facts recall", error);
      } finally {
        embedder?.stop?.();
      }
    }
    if (sub === "facts" && rest.length === 1) {
      const who = whoOf(handle, rest[0]);
      if (!who.ok) return refuseInput("people", who.problem, PEOPLE_USAGE);
      const facts = factsAbout(handle, { personId: who.personId, identities: who.identities }, { all: parsed.flags["all"] === true });
      if (json) return { code: 0, stdout: JSON.stringify({ personId: who.personId, identities: who.identities, facts }, null, 2) };
      if (!facts.length) return { code: 0, stdout: `log people facts: no lasting facts about ${rest[0]} yet. log people facts extract --who ${rest[0]} reads their chats for them.` };
      return { code: 0, stdout: [`log people facts: ${rest[0]}, ${facts.length} fact${facts.length === 1 ? "" : "s"}, newest first`, ...facts.map((f) => `  ${factLine(f)}\n    source: "${f.quote.slice(0, 160)}" (${f.source?.sentAt.slice(0, 16).replace("T", " ") ?? "?"})`), ...promiseLines(facts)].join("\n") };
    }
    if (sub === "bots" && rest.length === 0) {
      const asked = typeof parsed.flags["platform"] === "string" ? (parsed.flags["platform"] as string).toLowerCase().replace(/^x$|^twitter$/, "x") : null;
      try {
        const report = await backfillBots(handle, defaultBotSources({ handle, twenty: _context.twenty }), { now: _context.now ? _context.now() : new Date(), ...(asked ? { platforms: [asked] } : {}) });
        const nothing = report.platforms.every((p) => !p.accounts.some((a) => !a.refused));
        if (nothing && report.refused) return { ...refuse("people bots", "noPlatformSession", report.platforms.flatMap((p) => p.accounts.flatMap((a) => (a.refused ? [`${p.platform} ${a.account}: ${a.refused.detail}`] : []))).join("; ")), stdout: json ? JSON.stringify(report, null, 2) : "" };
        return { code: 0, stdout: json ? JSON.stringify(report, null, 2) : botBackfillText(report) };
      } catch (error) {
        return refuseError("people bots", error);
      }
    }
    if (sub === "suggest" && rest.length === 0) {
      const limit = numberOf(parsed, "limit") ?? 20;
      const embedder = peopleDeps.embedder();
      const report = await linkReport(handle, { embedder }).finally(() => embedder?.stop?.());
      const checked = parsed.flags["check"] === true ? await reviewBand(handle, report, peopleDeps.decisions()).catch(() => null) : null;
      if (json) return { code: 0, stdout: JSON.stringify({ ...report, suggestions: report.suggestions.slice(0, limit), ...(checked ? { checked } : {}) }, null, 2) };
      if (!report.suggestions.length && !report.rechecks.length) return { code: 0, stdout: "log people suggest: no identities look like one person right now." };
      return { code: 0, stdout: reportText(report, limit, checked) };
    }
    if (sub === "link" || sub === "unlink" || sub === "different") {
      if (!approvedBy) return refuseInput("people", `${sub} changes who log.db thinks someone is, so it needs --approvedBy with the owner's own words`, PEOPLE_USAGE);
      if (sub === "link" && rest.length >= 1) {
        const result = linkIdentities(handle, rest, approvedBy, { name: typeof parsed.flags["name"] === "string" ? (parsed.flags["name"] as string) : null, evidence: typeof parsed.flags["evidence"] === "string" ? (parsed.flags["evidence"] as string) : null });
        if (!result.ok) return refuseInput("people", result.problem ?? "not linked", PEOPLE_USAGE);
        if (json) return { code: 0, stdout: JSON.stringify(result, null, 2) };
        const seen = result.seen.map((s) => ` ${ref(s.identity)} was known only from a link in ${s.seenIn.messageKey}, so log.db now keeps it by handle until it learns its id.`).join("");
        return { code: 0, stdout: `log people link: ${result.personId} now has ${[...result.already, ...result.linked].map(label).join(", ")}${result.linked.length ? "" : " (nothing new: already linked)"}.${seen}` };
      }
      if (sub === "unlink" && rest.length === 1) {
        const result = unlinkIdentity(handle, rest[0], approvedBy);
        if (!result.ok) return refuseInput("people", result.problem ?? "not unlinked", PEOPLE_USAGE);
        return { code: 0, stdout: json ? JSON.stringify(result, null, 2) : `log people unlink: ${label(result.identity!)} is no longer part of ${result.personId}.` };
      }
      if (sub === "different" && rest.length === 2) {
        const result = markNotLinked(handle, rest[0], rest[1], approvedBy);
        if (!result.ok) return refuseInput("people", result.problem ?? "not recorded", PEOPLE_USAGE);
        return { code: 0, stdout: json ? JSON.stringify(result, null, 2) : `log people different: ${rest[0]} and ${rest[1]} are recorded as different people and won't be suggested again.` };
      }
    }
    return refuseInput("people", "say show <who>, facts <who>, facts extract, facts recall <question>, suggest, link <identity> <identity>..., unlink <identity> or different <a> <b>", PEOPLE_USAGE);
  },
};
