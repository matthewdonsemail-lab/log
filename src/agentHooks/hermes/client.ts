import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { HarnessInstall } from "../opencode/types.ts";
import { PACKAGE_ROOT } from "../opencode/client.ts";
import { HERMES_PLUGIN_DIR, HERMES_PLUGIN_NAME } from "../registry/index.ts";
import { HERMES_PLUGIN_FILES } from "./types.ts";

export function hermesHome(): string {
  return process.env.LOG_HERMES_DIR || join(homedir(), ".hermes");
}

export function installedPluginYaml(source: string, root: string): string {
  const body = source.replace(/\r\n/g, "\n").replace(/^log_root:.*\n?/m, "");
  return `${body.endsWith("\n") ? body : `${body}\n`}log_root: '${root.replace(/'/g, "''")}'\n`;
}

export function installHermes(home: string = hermesHome(), root: string = PACKAGE_ROOT): HarnessInstall {
  const from = join(root, HERMES_PLUGIN_DIR);
  const pluginDir = join(home, "plugins", HERMES_PLUGIN_NAME);
  mkdirSync(pluginDir, { recursive: true });
  const pluginFiles: string[] = [];
  let changed = false;
  for (const name of HERMES_PLUGIN_FILES) {
    const source = readFileSync(join(from, name), "utf8");
    const wanted = name === "plugin.yaml" ? installedPluginYaml(source, root) : source;
    const target = join(pluginDir, name);
    const before = existsSync(target) ? readFileSync(target, "utf8") : null;
    if (before !== wanted) {
      writeFileSync(target, wanted);
      changed = true;
    }
    pluginFiles.push(target);
  }
  return { configPath: join(pluginDir, "plugin.yaml"), changed, pluginDir, pluginFiles };
}
