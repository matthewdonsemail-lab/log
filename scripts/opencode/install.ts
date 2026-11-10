import { installOpenCode, opencodeConfigDir } from "../../src/agentHooks/opencode/index.ts";

const args = process.argv.slice(2);
const dir = args.includes("--config-dir") ? args[args.indexOf("--config-dir") + 1] : undefined;

const got = installOpenCode(dir ?? opencodeConfigDir());

console.log(
  got.changed
    ? `log: OpenCode's log MCP server is in ${got.configPath}, native (codemode off)`
    : `log: OpenCode's log MCP server is already native in ${got.configPath}`,
);
if (!got.pluginFiles.length) {
  console.log("log: this install has no OpenCode plugin to copy");
} else {
  console.log(`log: OpenCode's log hooks are in ${got.pluginDir} (${got.pluginFiles.length} file(s))`);
}
console.log("log: reload OpenCode once (opencode reload) and its log tools are native, with the hooks running");
