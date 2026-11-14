export const HARNESS_IDS = ["claudeCode", "codex", "cursor", "hermes", "opencode", "antigravity", "claudeApp", "chatgpt", "grok"] as const;

export type HarnessId = (typeof HARNESS_IDS)[number];

export const HOOK_HOSTS = ["claudeCode", "codex", "cursor", "hermes", "opencode", "antigravity"] as const satisfies readonly HarnessId[];

export type HookHost = (typeof HOOK_HOSTS)[number];

export type Support = "yes" | "no" | "unknown";

export const HARNESS_CAPABILITIES = ["promptHook", "sessionStartHook", "toolHooks", "mcpApps", "serverInstructions", "skills", "elicitation"] as const;

export type HarnessCapability = (typeof HARNESS_CAPABILITIES)[number];

export type PluginFormat = "claudeCodeSettings" | "codexHooks" | "cursorHooks" | "hermesNative" | "opencodePlugin" | "antigravityHooks" | "none";

export type RouterPath = "promptHook" | "preLlmCall" | "ask";

export type Connects = "local" | "hosted" | "both";

export interface Harness {
  id: HarnessId;
  label: string;
  doc: string;
  capabilities: Readonly<Record<HarnessCapability, Support>>;
  pluginFormat: PluginFormat;
  router: RouterPath;
  contextLimit: number | null;
  limitSource: string;
  connects: Connects;
  hookFile?: string;
  installedBy?: "launchSetup";
}

export type HookBody = Record<string, unknown>;

const ALL_UNKNOWN: Readonly<Record<HarnessCapability, Support>> = { promptHook: "unknown", sessionStartHook: "unknown", toolHooks: "unknown", mcpApps: "unknown", serverInstructions: "unknown", skills: "unknown", elicitation: "unknown" };

const NO_HOOKS = { promptHook: "no", sessionStartHook: "no", toolHooks: "no" } as const;

export const UNSTATED_LIMIT = 7500;

export const HARNESSES: readonly Harness[] = [
  {
    id: "claudeCode",
    label: "Claude Code",
    doc: "claudeApp.md#claude-code",
    capabilities: { promptHook: "yes", sessionStartHook: "yes", toolHooks: "yes", mcpApps: "no", serverInstructions: "yes", skills: "yes", elicitation: "yes" },
    pluginFormat: "claudeCodeSettings",
    router: "promptHook",
    contextLimit: 10000,
    limitSource: "each additionalContext string is capped at 10,000 characters (sources.md, Hooks per harness)",
    connects: "both",
    hookFile: ".claude/settings.json",
  },
  {
    id: "codex",
    label: "Codex",
    doc: "codex.md",
    capabilities: { ...ALL_UNKNOWN, promptHook: "yes", sessionStartHook: "yes", toolHooks: "yes", serverInstructions: "yes" },
    pluginFormat: "codexHooks",
    router: "promptHook",
    contextLimit: UNSTATED_LIMIT,
    limitSource: "about 2,500 tokens per hook output (sources.md), counted as 3 characters a token",
    connects: "both",
    hookFile: ".codex/hooks.json",
  },
  {
    id: "cursor",
    label: "Cursor",
    doc: "cursor.md",
    capabilities: { ...ALL_UNKNOWN, promptHook: "no", sessionStartHook: "yes", toolHooks: "yes", mcpApps: "yes" },
    pluginFormat: "cursorHooks",
    router: "ask",
    contextLimit: UNSTATED_LIMIT,
    limitSource: "Cursor states no limit for additional_context, so the strictest stated one (Codex's) is used",
    connects: "both",
    hookFile: ".cursor/hooks.json",
  },
  {
    id: "hermes",
    label: "Hermes",
    doc: "hermes.md",
    capabilities: { ...ALL_UNKNOWN, promptHook: "yes", sessionStartHook: "no", toolHooks: "yes", skills: "yes", elicitation: "no" },
    pluginFormat: "hermesNative",
    router: "preLlmCall",
    contextLimit: UNSTATED_LIMIT,
    limitSource: "Hermes states no limit for pre_llm_call context, so the strictest stated one (Codex's) is used",
    connects: "both",
    hookFile: "hermesPlugin/native/plugin.yaml",
    installedBy: "launchSetup",
  },
  {
    id: "opencode",
    label: "OpenCode",
    doc: "README.md",
    capabilities: { ...ALL_UNKNOWN, promptHook: "yes", sessionStartHook: "yes", toolHooks: "yes" },
    pluginFormat: "opencodePlugin",
    router: "promptHook",
    contextLimit: 20000,
    limitSource: "the logHooks plugin's own cap (MAX_CONTEXT); OpenCode states none on the pages read",
    connects: "local",
    hookFile: ".opencode/plugins/logHooks/index.ts",
    installedBy: "launchSetup",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    doc: "README.md",
    capabilities: { ...ALL_UNKNOWN, promptHook: "yes", sessionStartHook: "yes", toolHooks: "yes" },
    pluginFormat: "antigravityHooks",
    router: "promptHook",
    contextLimit: UNSTATED_LIMIT,
    limitSource: "Antigravity's limit is not in sources.md, so the strictest stated one (Codex's) is used",
    connects: "local",
    hookFile: ".agents/hooks.json",
  },
  {
    id: "claudeApp",
    label: "Claude (web, desktop, mobile)",
    doc: "claudeApp.md",
    capabilities: { ...ALL_UNKNOWN, ...NO_HOOKS, mcpApps: "yes" },
    pluginFormat: "none",
    router: "ask",
    contextLimit: null,
    limitSource: "no hooks",
    connects: "hosted",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    doc: "chatgpt.md",
    capabilities: { ...ALL_UNKNOWN, ...NO_HOOKS, mcpApps: "yes", serverInstructions: "yes" },
    pluginFormat: "none",
    router: "ask",
    contextLimit: null,
    limitSource: "no hooks",
    connects: "hosted",
  },
  {
    id: "grok",
    label: "Grok (xAI API)",
    doc: "grok.md",
    capabilities: { ...ALL_UNKNOWN, ...NO_HOOKS },
    pluginFormat: "none",
    router: "ask",
    contextLimit: null,
    limitSource: "no hooks",
    connects: "hosted",
  },
];

export const SCRATCH_ACCOUNT = "fakeBird";
