import { currentRuleIds } from "./agentRules.ts";
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
}

export const GUIDE_TOPICS: Readonly<Record<string, GuideTopic>> = {
  logMcpInstructions: { about: "Step-by-step guide to the log MCP: every core rule in full, which guide covers which work, and how runs, jobs, browsers and refusals report back", commands: [], skills: ["logCli"] },
  logCatalog: { about: "Finding and running any log command with three tools: logSearch by what you want done, logGet for its inputs and a call that works, logCall to run it", commands: [], skills: ["logCatalog"] },
  facebookBrowser: { about: "An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks", commands: ["facebook:preflight", "facebook:connect", "any:inspect", "facebook:host", "facebook:lifecycle", "any:browsers", "any:browser", "any:adsPower", "any:localAccount", "facebook:profile", "facebook:messenger", "facebook:doctor", "facebook:scan", "facebook:status", "facebook:watch", "facebook:check", "any:login", "any:logout", "any:whoami"], skills: ["inspect", "host", "lifecycle", "adsPower", "humanMouse", "profileSetup"] },
  facebookFlows: { about: "Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause", commands: ["any:flow", "byArgument:warmup"], skills: ["flow", "warmup", "personaPicture"], flows: true },
  facebookMarketplace: { about: "Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations", commands: ["facebook:listings", "facebook:listing", "facebook:publish", "facebook:campaign", "facebook:conversations", "facebook:conversation"], skills: ["accountToDryRun", "listingCopy", "listingCreative", "nicheCreativeResearch", "conversations"] },
  facebookGroups: { about: "Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls", commands: ["facebook:join", "facebook:read", "facebook:poll"], skills: [] },
  xInbox: { about: "Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live", commands: ["twitter:dms", "twitter:chat", "any:inbox"], skills: ["xchatReplies"] },
  xSending: { about: "Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send", commands: ["twitter:post", "twitter:dm", "twitter:react", "twitter:list", "twitter:reply", "twitter:quote", "twitter:like", "twitter:repost", "twitter:follow", "twitter:queue", "twitter:voice", "any:voice"], skills: ["xPosting"] },
  xAccount: { about: "An X account's session: saving and checking its cookies, who follows whom, and its notifications (who liked, reposted, replied to, quoted or followed it)", commands: ["twitter:session", "twitter:cookies", "twitter:follows", "twitter:followers", "twitter:notifications"], skills: [] },
  discord: { about: "A Discord account: its session, DMs and group DMs, servers with their channels, forums, posts and threads, server search, reading, the live gateway watch, sending and deleting its own messages", commands: ["discord:session", "discord:chats", "discord:servers", "discord:channels", "discord:posts", "discord:search", "discord:read", "discord:watch", "discord:send", "discord:delete", "discord:react", "discord:voice"], skills: ["discordServers"] },
  reddit: { about: "A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting", commands: ["reddit:session", "reddit:read", "reddit:post", "reddit:reply", "reddit:vote"], skills: [] },
  slack: { about: "A Slack account: its session and workspaces, chats, reading, the live websocket watch and sending", commands: ["slack:session", "slack:workspaces", "slack:chats", "slack:read", "slack:watch", "slack:send", "slack:react", "slack:voice"], skills: [] },
  linkedin: { about: "A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, inviting people LinkedIn suggests, liking posts, and reading its inbox and conversations", commands: ["linkedin:session", "linkedin:cookies", "linkedin:post", "linkedin:delete", "linkedin:suggestions", "linkedin:connect", "linkedin:like", "linkedin:inbox", "linkedin:messages"], skills: [] },
  accountsAndProxies: { about: "Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher", commands: ["any:sessions", "facebook:accounts", "facebook:account", "any:proxy", "any:launch"], skills: [] },
  runsAndEvidence: { about: "What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs, every call's timings, log.db's typed tables checked and rebuilt from its events, and the MCP server itself", commands: ["any:runs", "facebook:capture", "any:errors", "any:graph", "any:job", "any:mcp", "any:timing", "any:storage"], skills: ["runs", "reaCapture", "callTiming"] },
  knowledgeAndSearch: { about: "Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it", commands: ["any:kb", "any:search", "any:transcribe", "any:media"], skills: ["knowledgeBase"] },
  extensions: { about: "Extensions that make an account more human on social media: Memelord's memes found for the moment in a chat and sent in context, and matt's cloned voice (Inworld or Fish Audio) for the voice notes he asks for, every paid provider's balance, and treg's catalog of endpoints for every lookup", commands: ["any:memelord", "any:clone", "any:balance", "any:treg"], skills: ["memelord", "voiceClone", "tregExtension"] },
  console: { about: "The local console: this machine's log.db, MCP, accounts, usage, events, AI client config and settings, read in the terminal, as JSON per screen, or in the web console on loopback with no sign-in", commands: ["any:console"], skills: ["console"] },
  governor: { about: "Every platform account's governor: its daily count of requests and writes, reading it, and putting it back to 0 when matt says so, recorded in log.db", commands: ["any:governor"], skills: ["governor"] },
  newPlatform: { about: "Making a new platform whole with one command, and where every new file goes", commands: ["any:new"], skills: ["layout"] },
  instagram: { about: "An Instagram account: its session, reading its DMs, sending text and photos, and the live realtime watch", commands: ["instagram:session", "instagram:dms", "instagram:send", "instagram:react", "instagram:voice", "instagram:watch"], skills: ["instagram"] },
  ui: { about: "Generative UI in the chat: the report tool, where you write a small React view against log's kit (in the spirit of Lynx workspaces) and log draws it with data from log.db, or send just data for a starter view; text everywhere else", commands: ["any:report"], skills: ["report"], serverTools: ["report"] },
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

export function readGuide(topic: string): string | null {
  if (!GUIDE_TOPICS[topic] || !existsSync(guidePath(topic))) return null;
  return readFileSync(guidePath(topic), "utf8");
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
      "Each tool's description names its guide: load it before first using that tool. A guide holds the work step by step (the skills), every tool it covers with its full usage, and every AGENTS.md rule those tools fall under, in full.",
      `Guides live in docs/guides/<topic>.md. Topics: ${Object.keys(GUIDE_TOPICS).map((t) => `"${t}"`).join(", ")}.`,
      "When the owner asks for something and this app has no log prompt hook (Claude app, ChatGPT, Cursor, Hermes, Grok), pass their request word for word as ask: getGuide({ ask: \"<their words>\" }) returns the use case that fits, as the session's play, or says none does.",
      `Use cases are the work the owner asks for again and again, each one tool by tool in order (docs/useCases/<platform>/<page>.md). Read one with useCase instead of topic, and when the owner asks for work a use case covers, follow its page step by step. Use cases: ${useCases.map((u) => `"${u.id}"`).join(", ")}.`,
    ].join("\n"),
    annotations: { title: "Read a log guide", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: Object.keys(GUIDE_TOPICS), description: `The guide topic to read. Available topics:\n${topics}` },
        ask: { type: "string", description: "The owner's request in their own words: log finds the use case that fits and returns it, as when its prompt hook routes a prompt" },
        useCase: { type: "string", enum: useCases.map((u) => u.id), description: `A use case to read instead of a topic: its steps, tool by tool. Available use cases:\n${useCases.map((u) => `"${u.id}": ${u.title}`).join("\n")}` },
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

export function renderGuide(input: GuideInput): string {
  const topic = GUIDE_TOPICS[input.topic];
  const rules = agentsRules(input.agentsMd);
  const cited = currentRuleIds([...(input.rules ?? []), ...input.tools.flatMap(input.rulesOf)]).sort((a, b) => a - b);
  const out: string[] = [`# ${input.topic}`, "", `${topic.about}.`, "", `Written by \`bun run docs:build\` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.`, ""];
  out.push("## Current scope", "", "This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.", "");
  if (input.extra?.length) out.push(...input.extra, "");
  if (input.tools.length) {
    out.push("## The tools in this guide", "", "| Tool | What it does |", "|---|---|", ...input.tools.map((t) => `| \`${t.name}\` | ${t.title ?? ""} |`), "");
  }
  for (const name of topic.skills) {
    const body = skillBody(name);
    if (body) out.push(`## The work, step by step: ${name}`, "", `From \`skills/${name}/SKILL.md\`.`, "", shift(body, 1), "");
  }
  if (input.tools.length) {
    out.push("## Every tool, in full", "");
    for (const tool of input.tools) out.push(`### \`${tool.name}\``, "", tool.description, "");
  }
  if (cited.length) {
    out.push("## The rules these tools fall under, in full", "", "From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.", "");
    for (const n of cited) if (rules.has(n)) out.push(`**Rule ${n}.** ${rules.get(n)}`, "");
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
