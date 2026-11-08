import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function python(): string {
  if (process.env.LOG_PYTHON) return process.env.LOG_PYTHON;
  const local = join(root, ".env.local");
  const line = existsSync(local) ? readFileSync(local, "utf8").split(/\r?\n/).find((l) => l.startsWith("LOG_PYTHON=")) : undefined;
  return line ? line.slice("LOG_PYTHON=".length).replace(/^"|"$/g, "") : "python";
}

const mode = process.argv[2] ?? "--check";
const run = spawnSync(python(), [join(root, "python", "checks", "instagramTransport.py"), mode], { windowsHide: true, encoding: "utf8", stdio: ["ignore", "inherit", "inherit"] });
if (run.status !== 0) console.error("instagramTransport: python/instagramApi/engine.py must reach Instagram only through vendor/instagrapi with both its private and public transports on curl_cffi; the realtime MQTT socket is the one exception (rule 128).");
process.exit(run.status ?? 1);
