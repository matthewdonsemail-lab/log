import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sourceDir = join(root, "skills", "published");
const outDir = join(root, "site", "apps", "web", "public", ".well-known", "skills");
const check = process.argv.includes("--check");
const problems = [];

const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

function frontmatterOf(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    problems.push(`${file}: no frontmatter`);
    return null;
  }
  const field = (key) => match[1].match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^"(.*)"$/, "$1");
  return { block: match[0], name: field("name"), description: field("description"), summary: field("summary"), dependsOn: field("dependsOn")?.split(/\s+/).filter(Boolean) ?? [] };
}

const skills = existsSync(sourceDir)
  ? readdirSync(sourceDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  : [];

const files = new Map();
const index = { skills: [] };
for (const folder of skills) {
  const file = `skills/published/${folder}/SKILL.md`;
  const text = readFileSync(join(sourceDir, folder, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const meta = frontmatterOf(text, file);
  if (!meta) continue;
  if (meta.name !== folder) problems.push(`${file}: name is ${meta.name}, the folder is ${folder}`);
  if (!meta.description) problems.push(`${file}: no description`);
  const name = toKebab(folder);
  const published = text.replace(meta.block, meta.block.replace(/^name:.*$/m, `name: ${name}`));
  files.set(join(name, "SKILL.md"), published);
  index.skills.push({ name, description: meta.description, files: ["SKILL.md"], ...(meta.summary ? { summary: meta.summary } : {}), ...(meta.dependsOn.length ? { dependsOn: meta.dependsOn } : {}) });
}
files.set("index.json", `${JSON.stringify(index, null, 2)}\n`);

if (check) {
  for (const [path, text] of files) {
    const target = join(outDir, path);
    const current = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : null;
    if (current !== text) problems.push(`site/apps/web/public/.well-known/skills/${path.split("\\").join("/")} is out of date: run bun run skills:build`);
  }
} else {
  rmSync(outDir, { recursive: true, force: true });
  for (const [path, text] of files) {
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    writeFileSync(join(outDir, path), text);
  }
}

if (problems.length) {
  console.error("check:siteSkills FAIL");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`${check ? "check:siteSkills OK" : "skills:build wrote"} ${index.skills.length} published skill(s): ${index.skills.map((skill) => skill.name).join(", ")}`);
