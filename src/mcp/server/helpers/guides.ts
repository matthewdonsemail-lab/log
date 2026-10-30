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
}

export const GUIDE_TOPICS: Readonly<Record<string, GuideTopic>> = {
  logMcpInstructions: { about: "Step-by-step guide to the log MCP: every core rule in full, which guide covers which work, and how runs, jobs, browsers and refusals report back", commands: [], skills: ["logCli"] },
  facebookBrowser: { about: "An account's one browser for its day: preflight, opening and signing in, inspecting a page step by step, the host and its lifecycle, the profile and Messenger PIN, and the account checks", commands: ["facebook:preflight", "facebook:connect", "any:inspect", "facebook:host", "facebook:lifecycle", "any:browsers", "any:adsPower", "facebook:profile", "facebook:messenger", "facebook:doctor", "facebook:scan", "facebook:status", "facebook:watch", "facebook:check", "any:login", "any:logout", "any:whoami"], skills: ["inspect", "host", "lifecycle", "adsPower", "humanMouse", "profileSetup"] },
  facebookFlows: { about: "Recorded flows and the warm-up, run as steps in the account's open browser, each step checked against the call it must cause", commands: ["any:flow", "byArgument:warmup"], skills: ["flow", "warmup", "personaPicture"], flows: true },
  facebookMarketplace: { about: "Marketplace listings from copy to publish, campaigns that fill and heal them, and the buyers' conversations", commands: ["facebook:listings", "facebook:listing", "facebook:publish", "facebook:campaign", "facebook:conversations", "facebook:conversation"], skills: ["accountToDryRun", "listingCopy", "listingCreative", "nicheCreativeResearch", "conversations"] },
  facebookGroups: { about: "Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls", commands: ["facebook:join", "facebook:read", "facebook:poll"], skills: [] },
  xInbox: { about: "Reading an X account's DMs and X Chat as one inbox, synced by sequence id, and watching X Chat live", commands: ["twitter:dms", "twitter:chat"], skills: ["xchatReplies"] },
  xSending: { about: "Sending as an X account: original posts with a video or images, dms one message per line, replies, quotes, likes, follows, queues, and matt's voice gate before every send", commands: ["twitter:post", "twitter:dm", "twitter:reply", "twitter:quote", "twitter:like", "twitter:follow", "twitter:queue", "any:voice"], skills: ["xPosting"] },
  xAccount: { about: "An X account's session: saving and checking its cookies, and who follows whom", commands: ["twitter:session", "twitter:cookies", "twitter:follows", "twitter:followers"], skills: [] },
  discord: { about: "A Discord account: its session, chats, reading, the live gateway watch and sending", commands: ["discord:session", "discord:chats", "discord:read", "discord:watch", "discord:send"], skills: [] },
  reddit: { about: "A Reddit account's session", commands: ["reddit:session"], skills: [] },
  accountsAndProxies: { about: "Accounts in Twenty, their status and secrets, their proxies, and the interactive launcher", commands: ["facebook:accounts", "facebook:account", "any:proxy", "any:launch"], skills: [] },
  runsAndEvidence: { about: "What runs leave behind: run folders and pruning, captures and request docs, error codes, jobs and the MCP server itself", commands: ["any:runs", "facebook:capture", "any:errors", "any:graph", "any:job", "any:mcp"], skills: ["runs", "reaCapture"] },
  knowledgeAndSearch: { about: "Finding context: the knowledge base and the conversation search, keyword and meaning at once", commands: ["any:kb", "any:search"], skills: ["knowledgeBase"] },
  newPlatform: { about: "Making a new platform whole with one command, and where every new file goes", commands: ["any:new"], skills: ["layout"] },
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
      `Use cases are the work the owner asks for again and again, each one tool by tool in order (docs/useCases/<platform>/<page>.md). Read one with useCase instead of topic, and when the owner asks for work a use case covers, follow its page step by step. Use cases: ${useCases.map((u) => `"${u.id}"`).join(", ")}.`,
    ].join("\n"),
    annotations: { title: "Read a log guide", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: Object.keys(GUIDE_TOPICS), description: `The guide topic to read. Available topics:\n${topics}` },
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

export interface GuideInput {
  topic: string;
  tools: LogTool[];
  commands: readonly Command[];
  flows: FlowDefinition[];
  agentsMd: string;
  rulesOf: (tool: LogTool) => number[];
  rules?: number[];
  extra?: string[];
}

export function renderGuide(input: GuideInput): string {
  const topic = GUIDE_TOPICS[input.topic];
  const rules = agentsRules(input.agentsMd);
  const cited = [...new Set([...(input.rules ?? []), ...input.tools.flatMap(input.rulesOf)])].sort((a, b) => a - b);
  const out: string[] = [`# ${input.topic}`, "", `${topic.about}.`, "", `Written by \`bun run docs:build\` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.`, ""];
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
    out.push("## The rules these tools fall under, in full", "", "From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.", "");
    for (const n of cited) if (rules.has(n)) out.push(`**Rule ${n}.** ${rules.get(n)}`, "");
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
