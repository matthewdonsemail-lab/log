import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { addImport, addToArray, addToInterface, addToObject, addToReturnedObject, arrayHasText, hasImport, interfaceHasMember, objectHasKey, returnedObjectHasKey } from "./helpers/index.ts";
import { accountIndex, cliIndex, cliTest, platformDoc, pythonEngine, sessionClient, sessionIndex } from "./helpers/index.ts";
import type { NewPlatformOptions, PlannedEdit, PlannedFile, PlatformNames, PlatformPlan } from "./types.ts";
import { NEW_PLATFORM_RULE } from "./types.ts";

export const PLATFORM_NAME = /^[a-z][a-zA-Z0-9]*$/;

const FILES = {
  platforms: "src/cli/runner/helpers/platforms.ts",
  runner: "src/cli/runner/index.ts",
  context: "src/cli/runner/types.ts",
  routes: "src/directApi/engine/client.ts",
  rules: "src/mcp/server/helpers/agentRules.ts",
  twentySchema: "src/twenty/graphql/generated/schema.ts",
} as const;

export function namesOf(options: NewPlatformOptions): PlatformNames {
  const name = options.name;
  const pascal = name[0].toUpperCase() + name.slice(1);
  const constant = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
  const library = options.library?.replace(/\\/g, "/").replace(/\/$/, "") || null;
  return {
    name,
    pascal,
    constant,
    label: options.label?.trim() || pascal,
    twentyPlatform: options.twentyPlatform?.trim() || name.toUpperCase(),
    library,
    libraryText: library ? library.split("/").pop()! : "no client vendored yet",
    sessionCookies: options.sessionCookies ?? [],
    cookieDomain: options.cookieDomain?.trim() || `.${name.toLowerCase()}.com`,
    seam: `direct${pascal}`,
    sessionKey: `${name}Session`,
  };
}

function read(root: string, path: string): string {
  return readFileSync(join(root, path), "utf8");
}

export function twentyPlatforms(root: string): string[] {
  const path = join(root, FILES.twentySchema);
  if (!existsSync(path)) return [];
  const match = /export type SocialAccountPlatformEnum = ([^\n]+)/.exec(readFileSync(path, "utf8"));
  return match ? [...match[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]) : [];
}

export function planNewPlatform(root: string, options: NewPlatformOptions): PlatformPlan {
  if (!PLATFORM_NAME.test(options.name)) throw new Error(`${options.name} isn't a platform name: camelCase, starting with a lowercase letter (rule 1)`);
  const n = namesOf(options);
  const platformsSource = read(root, FILES.platforms);
  if (arrayHasText(platformsSource, "PLATFORMS", `"${n.name}"`)) throw new Error(`${n.name} is already a platform`);
  if (n.library && !existsSync(join(root, n.library))) throw new Error(`--library ${n.library} doesn't exist: vendor the client there first, or leave it out`);
  const files: PlannedFile[] = [
    { path: `src/${n.name}/account/session/client.ts`, content: sessionClient(n) },
    { path: `src/${n.name}/account/session/index.ts`, content: sessionIndex() },
    { path: `src/${n.name}/account/index.ts`, content: accountIndex() },
    { path: `src/cli/${n.name}/index.ts`, content: cliIndex(n) },
    { path: `src/cli/${n.name}/${n.name}.test.ts`, content: cliTest(n) },
    { path: `python/${n.name}Api/__init__.py`, content: "" },
    { path: `python/${n.name}Api/engine.py`, content: pythonEngine(n) },
    { path: `docs/platforms/${n.name}/README.md`, content: platformDoc(n) },
  ];
  for (const file of files) if (existsSync(join(root, file.path))) throw new Error(`${file.path} already exists: nothing is overwritten`);
  const contextType = `import("../../platformKit/session/index.ts")`;
  const edits: PlannedEdit[] = [
    { path: FILES.platforms, what: `PLATFORMS gains "${n.name}"`, apply: (s) => addToArray(s, "PLATFORMS", `"${n.name}"`), landed: (s) => arrayHasText(s, "PLATFORMS", `"${n.name}"`) },
    { path: FILES.platforms, what: `PLATFORM_LABELS gains ${n.name}: "${n.label}"`, apply: (s) => addToObject(s, "PLATFORM_LABELS", n.name, JSON.stringify(n.label)), landed: (s) => objectHasKey(s, "PLATFORM_LABELS", n.name) },
    { path: FILES.runner, what: `imports ${n.name}SessionCommand`, apply: (s) => addImport(s, `../${n.name}/index.ts`, `${n.name}SessionCommand`), landed: (s) => hasImport(s, `../${n.name}/index.ts`, `${n.name}SessionCommand`) },
    { path: FILES.runner, what: `imports run${n.pascal}Engine`, apply: (s) => addImport(s, `../../${n.name}/account/session/index.ts`, `run${n.pascal}Engine`), landed: (s) => hasImport(s, `../../${n.name}/account/session/index.ts`, `run${n.pascal}Engine`) },
    { path: FILES.runner, what: `COMMANDS gains ${n.name}SessionCommand`, apply: (s) => addToArray(s, "COMMANDS", `${n.name}SessionCommand`), landed: (s) => arrayHasText(s, "COMMANDS", `${n.name}SessionCommand`) },
    { path: FILES.runner, what: `createContext wires context.${n.seam}`, apply: (s) => addToReturnedObject(s, "createContext", n.seam, `overrides.${n.seam} ?? run${n.pascal}Engine`), landed: (s) => returnedObjectHasKey(s, "createContext", n.seam) },
    { path: FILES.context, what: `CommandContext gains ${n.seam}`, apply: (s) => addToInterface(s, "CommandContext", n.seam, `${n.seam}?: (account: ${contextType}.PlatformAccount, spec: ${contextType}.PlatformEngineSpec) => ${contextType}.PlatformEngineRun;`), landed: (s) => interfaceHasMember(s, "CommandContext", n.seam) },
    { path: FILES.routes, what: `DIRECT_ROUTES gains ${n.sessionKey}`, apply: (s) => addToObject(s, "DIRECT_ROUTES", n.sessionKey, `{ platform: '${n.name}', library: '${n.libraryText}', only: true, surface: 'account', method: 'ping', when: 'session check', seam: '${n.seam}' }`), landed: (s) => objectHasKey(s, "DIRECT_ROUTES", n.sessionKey) },
    { path: FILES.rules, what: `COMMAND_RULES gains ${n.sessionKey}`, apply: (s) => addToObject(s, "COMMAND_RULES", n.sessionKey, `[13, 63, 64, 73, ${NEW_PLATFORM_RULE}]`), landed: (s) => objectHasKey(s, "COMMAND_RULES", n.sessionKey) },
  ];
  const notes: string[] = [];
  const known = twentyPlatforms(root);
  if (known.length && !known.includes(n.twentyPlatform)) notes.push(`Twenty's socialAccounts.platform has no ${n.twentyPlatform} option (it has ${known.join(", ")}): add it in scripts/twenty/twentySetup.mjs (fields are only added, rule 13), run it against Twenty, then bun run twenty:client. Until then no account can be found for ${n.name}.`);
  if (!n.library) notes.push(`No client is vendored: python/${n.name}Api/engine.py answers engineNotBuilt until one is (--library vendor/<folder>).`);
  return { names: n, files, edits, notes };
}

export function applyPlan(root: string, plan: PlatformPlan): string[] {
  const sources = new Map<string, string>();
  for (const edit of plan.edits) sources.set(edit.path, sources.get(edit.path) ?? read(root, edit.path));
  for (const edit of plan.edits) sources.set(edit.path, edit.apply(sources.get(edit.path)!));
  const missed = plan.edits.filter((edit) => !edit.landed(sources.get(edit.path)!));
  if (missed.length) throw new Error(`the syntax tree didn't take: ${missed.map((e) => `${e.path}: ${e.what}`).join("; ")}`);
  for (const file of plan.files) {
    mkdirSync(dirname(join(root, file.path)), { recursive: true });
    writeFileSync(join(root, file.path), file.content, "utf8");
  }
  for (const [path, source] of sources) writeFileSync(join(root, path), source, "utf8");
  return [...plan.files.map((f) => `wrote ${f.path}`), ...plan.edits.map((e) => `${e.path}: ${e.what}`)];
}
