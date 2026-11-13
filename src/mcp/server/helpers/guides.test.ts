import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COMMANDS } from "../../../cli/runner/index.ts";
import { isPlatform } from "../../../cli/runner/helpers/platforms.ts";
import { platformOfTopic } from "../../../surface/scorecard/index.ts";
import { cite, DEVELOPER_RULES, HOSTED_INSTRUCTIONS_FILE, operatingRuleIds, serverInstructions, SERVER_INSTRUCTIONS } from "./agentRules.ts";
import { guideAnswer } from "./guideAnswer.ts";
import { CORE_GUIDE, GUIDE_LIMIT, GUIDE_TOPICS, guideForCaller, guideOfCommand, GUIDES_DIR, nextGuidesLine, noShellOnly, ownerNeutral, readGuide, ruleSummary, ruleText, shellOnly } from "./guides.ts";

const ROOT = join(import.meta.dir, "..", "..", "..", "..");

describe("guide topics by capability and platform", () => {
  test("no shared command is filed under a platform-named topic, and a platform topic holds only its own platform's commands", () => {
    for (const command of COMMANDS) {
      const topic = guideOfCommand(command);
      if (!topic) continue;
      const owner = platformOfTopic(topic);
      if (!isPlatform(command.platform)) expect(`${command.name} ${owner ?? "shared"}`).toBe(`${command.name} shared`);
      else if (owner) expect(owner).toBe(command.platform);
    }
  });

  test("the shared topics hold the shared commands", () => {
    expect(guideOfCommand({ platform: "any", name: "inspect" })).toBe("accountBrowser");
    expect(guideOfCommand({ platform: "any", name: "sessions" })).toBe("sessions");
    expect(guideOfCommand({ platform: "any", name: "whoami" })).toBe("sessions");
    expect(guideOfCommand({ platform: "byArgument", name: "warmup" })).toBe("flows");
    expect(guideOfCommand({ platform: "any", name: "inbox" })).toBe("inbox");
    expect(guideOfCommand({ platform: "any", name: "voice" })).toBe("voiceGate");
  });

  test("every topic names only topics that exist as the ones to load next", () => {
    for (const [topic, about] of Object.entries(GUIDE_TOPICS)) for (const next of about.next ?? []) expect(`${topic} → ${next} ${Boolean(GUIDE_TOPICS[next])}`).toBe(`${topic} → ${next} true`);
    expect(nextGuidesLine("facebookBrowser")).toContain('getGuide({ topic: "accountBrowser" })');
    expect(nextGuidesLine("console")).toBe("");
  });

  test("every generated guide is under the size a host takes whole, and only the core guide carries the scope block and the rules in full", () => {
    for (const topic of Object.keys(GUIDE_TOPICS)) {
      const text = readFileSync(join(GUIDES_DIR, `${topic}.md`), "utf8");
      expect(`${topic} ${text.length <= GUIDE_LIMIT}`).toBe(`${topic} true`);
      expect(text.includes("## Current scope")).toBe(topic === CORE_GUIDE);
      expect(text).not.toContain("## Every tool, in full");
      expect(/\bmatt\b/i.test(text)).toBe(false);
    }
  });

  test("the shared guides say nothing that is only true of Facebook in their own text", () => {
    for (const topic of ["accountBrowser", "flows", "sessions", "inbox", "voiceGate"]) expect(GUIDE_TOPICS[topic].about).not.toMatch(/facebook|marketplace|\bX\b|twitter/i);
  });
});

describe("guides for a caller with or without a shell", () => {
  const text = ["# t", "", ...shellOnly(["- tail it"]), ...noShellOnly(["- read progress"]), "- both", ""].join("\n");

  test("a caller with a shell keeps the shell lines, one without keeps the others", () => {
    expect(guideForCaller(text, true)).toBe("# t\n\n- tail it\n- both\n");
    expect(guideForCaller(text, false)).toBe("# t\n\n- read progress\n- both\n");
  });

  test("getGuide answers the core guide without the shell text for a hosted caller", () => {
    const hosted = guideAnswer({ topic: CORE_GUIDE }, undefined, false).text;
    const local = guideAnswer({ topic: CORE_GUIDE }, undefined, true).text;
    expect(hosted).not.toContain("tail -f");
    expect(hosted).toContain("`progress`");
    expect(local).toContain("tail -f");
    for (const answer of [hosted, local]) expect(answer).not.toContain("<!--");
  });

  test("an unknown topic is refused", () => {
    expect(readGuide("noSuchGuide")).toBeNull();
  });
});

describe("rules in served text", () => {
  test("old rules map to the current one, developer rules never land on a tool", () => {
    expect(cite(8, 10)).toBe("rule 8");
    expect(cite(20, 33, 54)).toBe("rule 35");
    expect(cite(64, 13)).toBe("");
    expect(operatingRuleIds([2, 63, 83, 175, 55, 117, 94])).toEqual([94]);
    for (const n of operatingRuleIds([...Array(180).keys()])) expect(DEVELOPER_RULES.has(n)).toBe(false);
  });

  test("a rule is cited by its first sentence, in the owner's terms", () => {
    expect(ruleSummary("2026-10-19 · Do one thing. Then another.")).toBe("Do one thing.");
    expect(ruleText("Ask Matt first. His scope stays.")).toBe("Ask the owner first. Their scope stays.");
    expect(ownerNeutral("Matt's call; needsMatt stays")).toBe("the owner's call; needsMatt stays");
  });
});

describe("one source for the server instructions", () => {
  test("the hosted instructions are generated from the same lines, with accountsList first and no shell", () => {
    const hosted = serverInstructions("hosted");
    expect(readFileSync(join(ROOT, HOSTED_INSTRUCTIONS_FILE), "utf8")).toBe(`${hosted}\n`);
    expect(hosted).toContain("Start with accountsList");
    expect(hosted).not.toContain("tail -f");
    expect(SERVER_INSTRUCTIONS).toContain("tail -f");
    for (const text of [hosted, SERVER_INSTRUCTIONS]) {
      expect(text).toContain('getGuide({ topic: "logMcpInstructions" })');
      expect(text).toContain("loads that use case as the play only on a clear match");
      expect(/\bmatt\b/i.test(text)).toBe(false);
    }
  });

  test("the guides folder holds exactly the topics", () => {
    expect(existsSync(GUIDES_DIR)).toBe(true);
    expect(readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort()).toEqual(Object.keys(GUIDE_TOPICS).sort());
  });
});
