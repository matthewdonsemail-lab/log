import { cardFor, linkIdentities, linkReport, listPeople, markNotLinked, reviewBand, unlinkIdentity } from "../../people/index.ts";
import type { Cluster, LinkReport, Recheck, Suggestion } from "../../people/index.ts";
import { localEmbedder } from "../../search/conversations/index.ts";
import { createDecisionsClient } from "../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../subq/decisions/index.ts";
import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const PEOPLE_USAGE = [
  "Usage: log people [--json]",
  "       log people show <who> [--json]                             (the person card: every platform, one-to-one chats and groups, who is waiting, the last lines across platforms)",
  "       log people suggest [--limit <n>] [--check] [--json]        (probably one person across platforms, every factor; --check asks SubQ)",
  "       log people link <identity> <identity>... --approvedBy \"<the owner's words>\" [--name \"<name>\"] [--evidence \"<why>\"]   (one person across these identities, appended to log.db as events)",
  "       log people unlink <identity> --approvedBy \"<the owner's words>\"   (that identity is no longer part of its person; the link stays in the history)",
  "       log people different <identity> <identity> --approvedBy \"<the owner's words>\"   (not the same person, so they are never suggested again)",
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
  return list.map((c) => `  together (${c.identities.length} accounts, weakest pair ${c.weakestBits.toFixed(1)} bits): ${c.identities.map(label).join(", ")}\n     → log people link ${c.identities.map(ref).join(" ")} --approvedBy "…"`);
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

export const peopleDeps: { embedder: () => { embed: (texts: string[]) => Promise<Float32Array[]>; stop?: () => void } | null; decisions: () => DecisionsClient } = {
  embedder: () => localEmbedder(),
  decisions: () => createDecisionsClient(),
};

export const peopleCommand: Command = {
  usage: PEOPLE_USAGE,
  platform: "any",
  name: "people",
  effect: "read",
  input: PEOPLE_INPUT,
  summary: "One person across platforms: link identities into a person, Fellegi-Sunter suggestions, the person card",
  args: "[show <who>|suggest|link <identity>...|unlink <identity>|different <a> <b>] [--json]",
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
        return { code: 0, stdout: `log people link: ${result.personId} now has ${[...result.already, ...result.linked].map(label).join(", ")}${result.linked.length ? "" : " (nothing new: already linked)"}.` };
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
    return refuseInput("people", "say show <who>, suggest, link <identity> <identity>..., unlink <identity> or different <a> <b>", PEOPLE_USAGE);
  },
};
