import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMMANDS } from "../../src/cli/runner/index.ts";
import { commandKey, PLATFORM_LABELS, PLATFORMS } from "../../src/cli/runner/helpers/platforms.ts";
import { DIRECT_ROUTES } from "../../src/directApi/engine/index.ts";
import { COMMAND_RULES } from "../../src/mcp/server/helpers/agentRules.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const problems: string[] = [];
const has = (path: string) => existsSync(join(root, path));

for (const platform of PLATFORMS.filter((p) => p !== PLATFORMS[0])) {
  if (!PLATFORM_LABELS[platform]) problems.push(`${platform}: no PLATFORM_LABELS entry (src/cli/runner/helpers/platforms.ts)`);
  if (!has(`src/${platform}`)) problems.push(`${platform}: no src/${platform} (rule 64)`);
  if (!has(`src/cli/${platform}/index.ts`)) problems.push(`${platform}: no src/cli/${platform}/index.ts`);
  if (!has(`python/${platform}Api/engine.py`)) problems.push(`${platform}: no python/${platform}Api/engine.py`);
  if (!has(`docs/platforms/${platform}/README.md`) && !has(`docs/${platform}Platform.md`)) problems.push(`${platform}: no docs/platforms/${platform}/README.md`);
  const commands = COMMANDS.filter((c) => c.platform === platform);
  if (!commands.length) problems.push(`${platform}: no command in COMMANDS has platform ${platform}`);
  if (!commands.some((c) => c.name === "session")) problems.push(`${platform}: no log ${platform} session check`);
  if (!DIRECT_ROUTES[`${platform}Session`]) problems.push(`${platform}: no DIRECT_ROUTES.${platform}Session`);
  for (const command of commands) {
    const key = commandKey(command);
    if (!COMMAND_RULES[key]) problems.push(`${platform}: log ${platform} ${command.name} has no COMMAND_RULES.${key}`);
    if (!DIRECT_ROUTES[key]) problems.push(`${platform}: log ${platform} ${command.name} has no DIRECT_ROUTES.${key} (every ${platform} command runs on the direct-API engine)`);
  }
}

if (problems.length) {
  console.error(`platforms: a platform is only half wired (rule 83; log new platform <name> wires one whole):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`platforms: ${PLATFORMS.join(", ")} are each wired whole (label, src, command, engine, routes, rules, docs).`);
