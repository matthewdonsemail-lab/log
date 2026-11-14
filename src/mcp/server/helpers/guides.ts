import { operatingRuleIds } from "./agentRules.ts";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Command } from "../../../cli/runner/types.ts";
import type { FlowDefinition } from "../../../browser/flow/index.ts";
import type { LogTool } from "../types.ts";

export const GUIDES_DIR = fileURLToPath(new URL("../../../../docs/guides/", import.meta.url));
export const USE_CASES_DIR = fileURLToPath(new URL("../../../../docs/useCases/", import.meta.url));
export const SKILLS_DIR = fileURLToPath(new URL("../../../../skills/", import.meta.url));
export const CORE_GUIDE = "logMcpInstructions";
export const GUIDE_TOOL = "getGuide";

export interface GuideTopic {
  about: string;
  commands: string[];
  skills: string[];
  flows?: boolean;
  serverTools?: string[];
  next?: string[];
}

export const GUIDE_TOPICS: Readonly<Record<string, GuideTopic>> = {
  logMcpInstructions: { about: "Step-by-step guide to the log MCP: every core rule in full, which guide covers which work, and how runs, jobs, browsers and refusals report back", commands: [], skills: ["logCli"] },
  logCatalog: { about: "Finding and running any log command with three tools: logSearch by what you want done, logGet for its inputs and a call that works, logCall to run it", commands: [], skills: ["logCatalog"] },
  accountBrowser: { about: "An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts", commands: ["any:inspect", "any:browsers", "any:browser", "any:adsPower", "any:localAccount"], skills: ["inspect", "adsPower", "humanMouse"], next: ["sessions", "flows", "facebookBrowser"] },
  sessions: { about: "Whether each account's saved session still works, from the platform's own answer, with the next step to sign it back in; and log's own sign-in for a team (login, logout, whoami)", commands: ["any:sessions", "any:login", "any:logout", "any:whoami"], skills: [], next: ["accountBrowser", "accountsAndProxies"] },
  flows: { about: "Recorded flows and the warm-up on any platform: a recording turned into steps that run in the account's open browser, each step checked against the call it must cause", commands: ["any:flow", "byArgument:warmup"], skills: ["flow", "warmup"], next: ["facebookFlows", "accountBrowser"] },
  inbox: { about: "Every platform's chats as one inbox: listing, reading and watching them, sending, reacting and voice notes, who waits on a reply, claiming a chat before acting in it, and every action's log", commands: ["any:inbox", "any:chats", "any:messages", "any:watchers", "any:voiceNotes"], skills: [], next: ["voiceGate"] },
  voiceGate: { about: "The voice gate every send as the owner passes on every platform: a draft checked against the owner's own writing before it goes out, and the voice and AI-tells indexes behind it", commands: ["any:voice"], skills: [], next: ["inbox"] },
  facebookBrowser: { about: "A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks", commands: ["facebook:preflight", "facebook:connect", "facebook:host", "facebook:lifecycle", "facebook:profile", "facebook:messenger", "facebook:doctor", "facebook:scan", "facebook:status", "facebook:watch", "facebook:check", "facebook:accounts", "facebook:account"], skills: ["facebookInspect", "host", "lifecycle", "profileSetup"], next: ["accountBrowser", "facebookFlows"] },
  facebookFlows: { about: "Facebook's recorded flows and its warm-up, each a facebookFlow tool run as steps in the account's open browser", commands: [], skills: ["facebookFlows", "facebookWarmup", "personaPicture"], flows: true, next: ["flows", "facebookBrowser"] },
  facebookMarketplace: { about: "Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations", commands: ["facebook:listings", "facebook:listing", "facebook:publish", "facebook:campaign", "facebook:conversations", "facebook:conversation"], skills: ["accountToDryRun", "listingCopy", "listingCreative", "nicheCreativeResearch", "conversations"], next: ["facebookBrowser", "facebookFlows"] },
  facebookGroups: { about: "Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls", commands: ["facebook:join", "facebook:read", "facebook:poll"], skills: [], next: ["facebookBrowser"] },
  xInbox: { about: "Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live", commands: ["twitter:dms", "twitter:chat"], skills: ["xchatReplies"], next: ["inbox", "xSending"] },
  xSending: { about: "Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, lists, queues and voice notes", commands: ["twitter:post", "twitter:dm", "twitter:react", "twitter:list", "twitter:reply", "twitter:quote", "twitter:like", "twitter:repost", "twitter:follow", "twitter:queue", "twitter:voice"], skills: ["xPosting"], next: ["voiceGate", "inbox", "xInbox"] },
  xAccount: { about: "An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)", commands: ["twitter:session", "twitter:cookies", "twitter:follows", "twitter:followers", "twitter:notifications"], skills: [] },
  discord: { about: "A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages", commands: ["discord:session", "discord:chats", "discord:servers", "discord:channels", "discord:posts", "discord:search", "discord:read", "discord:watch", "discord:send", "discord:delete", "discord:react", "discord:voice"], skills: ["discordServers"] },
  reddit: { about: "A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting", commands: ["reddit:session", "reddit:read", "reddit:post", "reddit:reply", "reddit:vote"], skills: [] },
  slack: { about: "A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending", commands: ["slack:session", "slack:workspaces", "slack:chats", "slack:read", "slack:watch", "slack:send", "slack:react", "slack:voice"], skills: [] },
  linkedin: { about: "A LinkedIn account's session: saving its cookies from a masked prompt and checking them with LinkedIn", commands: ["linkedin:session", "linkedin:cookies"], skills: [] },
  accountsAndProxies: { about: "Every account in the workspace with its session state, and each account's proxy: checking it, giving it one from a provider in its home city, and providers' traffic; and the interactive launcher that sets log up and adds accounts", commands: ["any:accounts", "any:proxy", "any:launch"], skills: [], next: ["sessions", "accountBrowser"] },
  runsAndEvidence: { about: "What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs, every call's timings, log.db's typed tables checked and rebuilt from its events, and the MCP server itself", commands: ["any:runs", "any:capture", "any:errors", "any:graph", "any:job", "any:mcp", "any:timing", "any:storage"], skills: ["runs", "reaCapture", "callTiming"] },
  knowledgeAndSearch: { about: "Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it", commands: ["any:kb", "any:search", "any:transcribe", "any:media"], skills: ["knowledgeBase"] },
  extensions: { about: "Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, the owner's cloned voice (Inworld or Fish Audio) for the voice notes they ask for, every paid provider's balance, and treg's catalog of endpoints for every lookup", commands: ["any:memelord", "any:clone", "any:balance", "any:treg"], skills: ["memelord", "voiceClone", "tregExtension"] },
  console: { about: "The local console: this machine's log.db, MCP, accounts, usage, events, AI client config, settings and provider keys, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in", commands: ["any:console", "any:credentials"], skills: ["console"] },
  governor: { about: "Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when the owner says so, recorded in log.db", commands: ["any:governor"], skills: ["governor"] },
  newPlatform: { about: "Making a new platform whole with one command, and where every new file goes", commands: ["any:new"], skills: ["layout"] },
  instagram: { about: "An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch", commands: ["instagram:session", "instagram:dms", "instagram:send", "instagram:react", "instagram:voice", "instagram:watch"], skills: ["instagram"] },
  ui: { about: "Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else", commands: ["any:report"], skills: ["report"], serverTools: ["report"] },
  mobile: { about: "One phone per account: the phones that are connected, the phone attached to each account, and the screen, the UI tree and the app's own network calls read off one phone", commands: ["any:mobile"], skills: [] },
};

export const guideKey = (command: Pick<Command, "platform" | "name">): string => `${command.platform}:${command.name}`;

export function guideOfCommand(command: Pick<Command, "platform" | "name">): string | null {
  const key = guideKey(command);
  return Object.entries(GUIDE_TOPICS).find(([, t]) => t.commands.includes(key))?.[0] ?? null;
}

export const FLOWS_GUIDE = Object.entries(GUIDE_TOPICS).find(([, t]) => t.flows)![0];

export function guideLine(topic: string): string {
  return `Before first using this tool in a session, load its guide: ${GUIDE_TOOL}({ topic: "${topic}" }) (${GUIDE_TOPICS[topic].about}).`;
}

export function guidePath(topic: string): string {
  return `${GUIDES_DIR}${topic}.md`;
}

export const GUIDE_ALIASES: Readonly<Record<string, string>> = {};

export const GUIDE_LIMIT = 50_000;

export const SHELL_ONLY = { start: "<!-- shell -->", end: "<!-- /shell -->" } as const;
export const NO_SHELL_ONLY = { start: "<!-- noShell -->", end: "<!-- /noShell -->" } as const;

export function shellOnly(lines: readonly string[]): string[] {
  return [SHELL_ONLY.start, ...lines, SHELL_ONLY.end];
}

export function noShellOnly(lines: readonly string[]): string[] {
  return [NO_SHELL_ONLY.start, ...lines, NO_SHELL_ONLY.end];
}

const blockOf = (marks: { start: string; end: string }): RegExp => new RegExp(`${marks.start}\\n[\\s\\S]*?${marks.end}\\n?`, "g");
const markOf = (marks: { start: string; end: string }): RegExp => new RegExp(`${marks.start}\\n|${marks.end}\\n?`, "g");

export function guideForCaller(text: string, shell: boolean): string {
  const drop = shell ? NO_SHELL_ONLY : SHELL_ONLY;
  const keep = shell ? SHELL_ONLY : NO_SHELL_ONLY;
  return text.replace(/\r\n/g, "\n").replace(blockOf(drop), "").replace(markOf(keep), "").replace(/\n{3,}/g, "\n\n");
}

export function topicOf(topic: string): string | null {
  if (GUIDE_TOPICS[topic]) return topic;
  return Object.hasOwn(GUIDE_ALIASES, topic) ? GUIDE_ALIASES[topic] : null;
}

export function readGuide(topic: string, shell = true): string | null {
  const found = topicOf(topic);
  if (!found || !existsSync(guidePath(found))) return null;
  const text = guideForCaller(readFileSync(guidePath(found), "utf8"), shell);
  return found === topic ? text : `The guide "${topic}" is now "${found}" (the old name goes in the next release).\n\n${text}`;
}

export function nextGuidesLine(topic: string): string {
  const next = (GUIDE_TOPICS[topic]?.next ?? []).filter((t) => GUIDE_TOPICS[t]);
  return next.length ? `Load next, when the work needs it: ${next.map((t) => `${GUIDE_TOOL}({ topic: "${t}" }) (${GUIDE_TOPICS[t].about})`).join("; ")}.` : "";
}

export interface UseCase {
  id: string;
  title: string;
  asks: string;
  text: string;
  tools: string[];
}

export function listUseCases(toolNames: readonly string[] = [], dir = USE_CASES_DIR): UseCase[] {
  if (!existsSync(dir)) return [];
  const known = new Set(toolNames);
  const out: UseCase[] = [];
  for (const platform of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    for (const file of readdirSync(`${dir}${platform}`).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
      const text = readFileSync(`${dir}${platform}/${file}`, "utf8").replace(/\r\n/g, "\n");
      const tools = [...new Set([...text.matchAll(/`(\w+)`/g)].map((m) => m[1]).filter((name) => known.has(name)))];
      out.push({ id: `${platform}/${file.slice(0, -3)}`, title: (/^# (.+)$/m.exec(text)?.[1] ?? file).trim(), asks: (/^How the owner asks for it: (.+)$/m.exec(text)?.[1] ?? "").trim(), text, tools });
    }
  }
  return out;
}

export function readUseCase(id: string, dir = USE_CASES_DIR): string | null {
  if (!/^\w+\/\w+$/.test(id)) return null;
  const path = `${dir}${id}.md`;
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

export function useCaseLine(ids: readonly string[]): string {
  return `Use cases that call it, each a workflow the owner asks for, tool by tool: ${ids.map((id) => `${GUIDE_TOOL}({ useCase: "${id}" })`).join(", ")}.`;
}

export function withUseCases<T extends { name: string; description: string }>(tools: T[], useCases: readonly UseCase[]): T[] {
  return tools.map((tool) => {
    const ids = useCases.filter((u) => u.tools.includes(tool.name)).map((u) => u.id);
    if (!ids.length || tool.name === GUIDE_TOOL) return tool;
    const lines = tool.description.split("\n");
    const at = lines.findIndex((line) => line.startsWith("Before first using this tool"));
    lines.splice(at >= 0 ? at : Math.max(0, lines.length - 1), 0, useCaseLine(ids));
    return { ...tool, description: lines.join("\n") };
  });
}

export function guideTool(): Omit<LogTool, "outputSchema"> {
  const topics = Object.entries(GUIDE_TOPICS).map(([name, t]) => `"${name}": ${t.about}`).join("\n");
  const useCases = listUseCases();
  return {
    name: GUIDE_TOOL,
    title: "Read a log guide",
    description: [
      `Read a detailed guide on one kind of work. Call with topic "${CORE_GUIDE}" before using other log tools, once per session; call again if a long thread may have dropped guide text.`,
      "Each tool's description names its guide: load it before first using that tool. A guide holds the work step by step (the skills), every tool it covers with its usage line, the AGENTS.md rules those tools fall under, and the guides to load next.",
      `Guides live in docs/guides/<topic>.md. Topics: ${Object.keys(GUIDE_TOPICS).map((t) => `"${t}"`).join(", ")}.`,
      "When the owner asks for something and this app has no log prompt hook (Claude app, ChatGPT, Cursor, Hermes, Grok), pass their request word for word as ask: getGuide({ ask: \"<their words>\" }) loads the use case that clearly fits as this caller's play, or lists the close ones and loads nothing. A play ends after two idle hours, when another loads, or with clearPlay: true.",
      `Use cases are the work the owner asks for again and again, each one tool by tool in order (docs/useCases/<platform>/<page>.md). Read one with useCase instead of topic, and when the owner asks for work a use case covers, follow its page step by step. Use cases: ${useCases.map((u) => `"${u.id}"`).join(", ")}.`,
    ].join("\n"),
    annotations: { title: "Read a log guide", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: Object.keys(GUIDE_TOPICS), description: `The guide topic to read. Available topics:\n${topics}` },
        ask: { type: "string", description: "The owner's request in their own words: log finds the use case that fits and returns it, as when its prompt hook routes a prompt" },
        useCase: { type: "string", enum: useCases.map((u) => u.id), description: `A use case to read instead of a topic: its steps, tool by tool. Available use cases:\n${useCases.map((u) => `"${u.id}": ${u.title}`).join("\n")}` },
        playHandle: { type: "string", description: "The play handle a getGuide answer named, to load into or clear that play; left out, the caller's own play is used" },
        clearPlay: { type: "boolean", description: "Ends this caller's play, so no send as the owner goes out until another is loaded" },
      },
      additionalProperties: false,
    },
  };
}

export function agentsRules(agentsMd: string): Map<number, string> {
  const section = agentsMd.slice(agentsMd.indexOf("## Hard rules"));
  const end = section.indexOf("\n## ", 5);
  const body = end > 0 ? section.slice(0, end) : section;
  const rules = new Map<number, string>();
  for (const m of body.matchAll(/^(\d+)\. ([\s\S]*?)(?=^\d+\. |(?![\s\S]))/gm)) rules.set(Number(m[1]), m[2].replace(/\s+\n/g, "\n").replace(/\n\s+/g, " ").trim());
  return rules;
}

export function agentsSection(agentsMd: string, heading: string): string {
  const start = agentsMd.indexOf(`## ${heading}`);
  if (start < 0) return "";
  const end = agentsMd.indexOf("\n## ", start + 4);
  return agentsMd.slice(start, end > 0 ? end : undefined).replace(/^## [^\n]*\n/, "").trim();
}

export function skillBody(name: string): string {
  const path = `${SKILLS_DIR}${name}/SKILL.md`;
  if (!existsSync(path)) return "";
  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  return text.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/^# [^\n]*\n/, "").trim();
}

const shift = (markdown: string, levels: number): string => markdown.replace(/^(#{1,4}) /gm, (_, h: string) => `${"#".repeat(Math.min(6, h.length + levels))} `);

export type GuideTool = Pick<LogTool, "name" | "title" | "description">;

export interface GuideInput {
  topic: string;
  tools: GuideTool[];
  commands: readonly Command[];
  flows: FlowDefinition[];
  agentsMd: string;
  rulesOf: (tool: GuideTool) => number[];
  rules?: number[];
  extra?: string[];
}

export function ownerNeutral(text: string): string {
  return text
    .replace(/\bMatt's\b/g, "the owner's")
    .replace(/\bmatt's\b/g, "the owner's")
    .replace(/(^|[.!?]\s+|\n[-*]?\s*)Matt\b/g, "$1The owner")
    .replace(/\b[Mm]att\b/g, "the owner");
}

export function ruleText(text: string): string {
  return ownerNeutral(text).replace(/\bHis\b/g, "Their").replace(/\bhis\b/g, "their").replace(/\bhim\b/g, "them").replace(/\bHe\b/g, "They").replace(/\bhe\b/g, "they");
}

export function ruleSummary(text: string): string {
  const body = text.replace(/^\d{4}-\d{2}-\d{2}\s*·\s*/, "");
  const sentence = /^[\s\S]*?[.!?](?=\s|$)/.exec(body)?.[0] ?? body;
  return sentence.length > 200 ? `${sentence.slice(0, 197).trimEnd()}…` : sentence;
}

export function usageOf(description: string): string {
  return description.split("\n").find((line) => line.startsWith("log ")) ?? "";
}

const cell = (text: string): string => text.replace(/\|/g, "\\|");

export function renderGuide(input: GuideInput): string {
  const topic = GUIDE_TOPICS[input.topic];
  const core = input.topic === CORE_GUIDE;
  const rules = agentsRules(input.agentsMd);
  const cited = operatingRuleIds([...(input.rules ?? []), ...input.tools.flatMap(input.rulesOf)]).sort((a, b) => a - b);
  const next = nextGuidesLine(input.topic);
  const out: string[] = [`# ${input.topic}`, "", `${topic.about}.`, "", ...(next ? [next, ""] : []), "Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.", ""];
  if (core) out.push("## Current scope", "", "The guides describe the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.", "");
  if (input.extra?.length) out.push(...input.extra, "");
  if (input.tools.length) {
    const rows = input.tools.map((t) => {
      const usage = usageOf(t.description);
      return `| \`${t.name}\` | ${cell(t.title ?? "")} | ${usage ? `\`${cell(usage)}\`` : ""} |`;
    });
    out.push("## The tools in this guide", "", "Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.", "", "| Tool | What it does | Usage |", "|---|---|---|", ...rows, "");
  }
  for (const name of topic.skills) {
    const body = skillBody(name);
    if (body) out.push(`## The work, step by step: ${name}`, "", `From \`skills/${name}/SKILL.md\`.`, "", shift(body, 1), "");
  }
  if (cited.length && core) {
    out.push("## The rules these tools fall under, in full", "", "From the current AGENTS.md (`log://agents`). Every other guide cites its rules by number and first line.", "");
    for (const n of cited) if (rules.has(n)) out.push(`**Rule ${n}.** ${ruleText(rules.get(n)!)}`, "");
  } else if (cited.length) {
    out.push("## The rules these tools fall under", "", `Each by its number and first line. The full text is in AGENTS.md (\`log://agents\`); the core rules are in full in \`${GUIDE_TOOL}({ topic: "${CORE_GUIDE}" })\`.`, "");
    for (const n of cited) if (rules.has(n)) out.push(`- **Rule ${n}.** ${ruleSummary(ruleText(rules.get(n)!))}`);
    out.push("");
  }
  return `${ownerNeutral(out.join("\n")).replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
