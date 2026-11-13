import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripPrivateBlocks } from "../../src/privacy/privateBlocks/index.ts";
import { formatFinding, scanText } from "../../src/privacy/scan/index.ts";
import { loadAllowlist, loadDenylist } from "../../src/privacy/scan/client.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sourceDir = join(root, "skills", "published");
const useCasesDir = join(root, "docs", "useCases");
const outDir = join(root, "site", "apps", "web", "public", ".well-known", "skills");
const repoSkillsDir = join(root, ".claude", "skills");
const check = process.argv.includes("--check");
const problems = [];
const LISTING_MAX = 1500;
const PLAY_PREFIX = "log-";

const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const oneLine = (text) => text.replace(/\s+/g, " ").trim();
const yamlValue = (text) => JSON.stringify(oneLine(text));

function publicTextOf(text, file) {
  const { text: kept, problem } = stripPrivateBlocks(text);
  if (problem) problems.push(`${file}: ${problem}`);
  return kept;
}

function frontmatterOf(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    problems.push(`${file}: no frontmatter`);
    return null;
  }
  const field = (key) => match[1].match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^"(.*)"$/, "$1");
  return { block: match[0], name: field("name"), description: field("description"), summary: field("summary"), dependsOn: field("dependsOn")?.split(/\s+/).filter(Boolean) ?? [] };
}

const REPO_BLOB = "https://github.com/matthewdonsemail-lab/log/blob/main/";

function linksOf(text, platform, page) {
  const from = join(useCasesDir, platform);
  return text.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
    if (/^(https?:|mailto:|#)/.test(target)) return whole;
    const [path, anchor] = target.split("#");
    const file = resolve(from, path);
    const hash = anchor ? `#${anchor}` : "";
    if (!existsSync(file)) {
      problems.push(`docs/useCases/${platform}/${page}.md links to ${target}, which doesn't exist`);
      return whole;
    }
    const rel = file.slice(root.length + 1).split("\\").join("/");
    const play = /^docs\/useCases\/([^/]+)\/([^/]+)\.md$/.exec(rel);
    if (play && play[2] !== "README") return `](../${PLAY_PREFIX}${toKebab(play[1])}-${toKebab(play[2])}/SKILL.md${hash})`;
    return `](${REPO_BLOB}${rel}${hash})`;
  });
}

function playSkillOf(platform, page, text) {
  const id = `${platform}/${page}`;
  const name = `${PLAY_PREFIX}${toKebab(platform)}-${toKebab(page)}`;
  const title = (/^# (.+)$/m.exec(text)?.[1] ?? page).trim();
  const lead = oneLine(text.split("\n\n").find((block, i) => i > 0 && !block.startsWith("#")) ?? "");
  const asks = oneLine(/^How the owner asks for it: (.+)$/m.exec(text)?.[1] ?? "");
  const description = `${title}. A log play (docs/useCases/${id}.md): ${lead}`.slice(0, 900);
  const whenToUse = (asks ? `Use when matt asks for this, in words like: ${asks}` : `Use when matt asks for: ${title.toLowerCase()}.`).slice(0, LISTING_MAX - description.length);
  const body = [
    `# ${title}`,
    "",
    `This is the log play \`${id}\`. Before anything else, call the log MCP tool \`getGuide({ useCase: "${id}" })\`: it returns this page and makes it the session's play, so every log tool's answer says which step you are on and a send with no play loaded is refused (rules 157, 158). Then follow the steps in order.`,
    "",
    "Draft every message from that person's own thread and matt's real replies (`voice` with no text, `search`), never from memory, and never send two that read alike (`sameAsSent`).",
    "",
    linksOf(text.replace(/^# .+\n/, "").replace(/<!-- stepsDiagram[\s\S]*?<!-- \/stepsDiagram -->\n?/, "").trim(), platform, page),
    "",
  ].join("\n");
  const skill = `---\nname: ${name}\ndescription: ${yamlValue(description)}\nwhen_to_use: ${yamlValue(whenToUse)}\nmetadata:\n  summary: ${yamlValue(title)}\n---\n\n${body}`;
  return { name, description, summary: title, skill };
}

function plainValueProblem(value) {
  if (/^['"]/.test(value)) return null;
  if (/^[[{&*!|>%@`]/.test(value)) return `starts with ${value[0]}`;
  if (/: /.test(value)) return `has ": " in it`;
  if (/ #/.test(value)) return `has " #" in it`;
  return null;
}

function headerProblems(dir, label) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const file = join(dir, entry.name, "SKILL.md");
    if (!existsSync(file)) {
      headerProblems(join(dir, entry.name), `${label}/${entry.name}`);
      continue;
    }
    const block = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(file, "utf8").replace(/\r\n/g, "\n"))?.[1];
    if (!block) {
      problems.push(`${label}/${entry.name}/SKILL.md: no frontmatter`);
      continue;
    }
    for (const line of block.split("\n")) {
      const field = /^(\s*[A-Za-z_]+):\s+(.+)$/.exec(line);
      const problem = field && plainValueProblem(field[2]);
      if (problem) problems.push(`${label}/${entry.name}/SKILL.md: ${field[1].trim()} ${problem}, so its header doesn't parse: quote the value`);
    }
  }
}

headerProblems(join(root, "skills"), "skills");

const files = new Map();
const repoFiles = new Map();
const sources = new Map();
const index = { skills: [] };

const skills = existsSync(sourceDir)
  ? readdirSync(sourceDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  : [];
for (const folder of skills) {
  const file = `skills/published/${folder}/SKILL.md`;
  const text = publicTextOf(readFileSync(join(sourceDir, folder, "SKILL.md"), "utf8").replace(/\r\n/g, "\n"), file);
  const meta = frontmatterOf(text, file);
  if (!meta) continue;
  if (meta.name !== folder) problems.push(`${file}: name is ${meta.name}, the folder is ${folder}`);
  if (!meta.description) problems.push(`${file}: no description`);
  const name = toKebab(folder);
  const published = text.replace(meta.block, meta.block.replace(/^name:.*$/m, `name: ${name}`));
  files.set(join(name, "SKILL.md"), published);
  sources.set(join(name, "SKILL.md"), file);
  index.skills.push({ name, description: meta.description, files: ["SKILL.md"], ...(meta.summary ? { summary: meta.summary } : {}), ...(meta.dependsOn.length ? { dependsOn: meta.dependsOn } : {}) });
}

const platforms = existsSync(useCasesDir) ? readdirSync(useCasesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
for (const platform of platforms) {
  for (const file of readdirSync(join(useCasesDir, platform)).filter((f) => f.endsWith(".md") && f !== "README.md").sort()) {
    const page = file.slice(0, -3);
    const text = publicTextOf(readFileSync(join(useCasesDir, platform, file), "utf8").replace(/\r\n/g, "\n"), `docs/useCases/${platform}/${file}`);
    const play = playSkillOf(platform, page, text);
    files.set(join(play.name, "SKILL.md"), play.skill);
    repoFiles.set(join(play.name, "SKILL.md"), play.skill);
    sources.set(join(play.name, "SKILL.md"), `docs/useCases/${platform}/${file}`);
    index.skills.push({ name: play.name, description: play.description, files: ["SKILL.md"], summary: play.summary });
  }
}
files.set("index.json", `${JSON.stringify(index, null, 2)}\n`);

const privacy = { allowlist: loadAllowlist(join(root, "scripts", "privacy", "allowlist.json")), denylist: loadDenylist() };
const stagedOnly = process.argv.includes("--staged");
const staged = stagedOnly ? new Set(spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], { cwd: root, windowsHide: true, encoding: "utf8" }).stdout.split(/\r?\n/).filter(Boolean)) : null;
for (const [label, wanted] of [["site/apps/web/public/.well-known/skills", files], [".claude/skills", repoFiles]]) {
  for (const [path, text] of wanted) {
    if (staged && !staged.has(sources.get(path))) continue;
    for (const hit of scanText(`${label}/${path.split("\\").join("/")}`, text, privacy)) problems.push(`privacy: ${formatFinding(hit)} (wrap it in <!-- private --> … <!-- /private --> in the source, or take it out)`);
  }
}

function compare(dir, label, wanted) {
  for (const [path, text] of wanted) {
    const target = join(dir, path);
    const current = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : null;
    if (current !== text) problems.push(`${label}/${path.split("\\").join("/")} is out of date: run bun run skills:build`);
  }
}

if (check) {
  compare(outDir, "site/apps/web/public/.well-known/skills", files);
  compare(repoSkillsDir, ".claude/skills", repoFiles);
  if (existsSync(repoSkillsDir)) {
    const wanted = new Set([...repoFiles.keys()].map((p) => p.split(/[\\/]/)[0]));
    for (const entry of readdirSync(repoSkillsDir)) if (entry.startsWith(PLAY_PREFIX) && !wanted.has(entry)) problems.push(`.claude/skills/${entry} has no use case any more: run bun run skills:build`);
  }
} else if (!problems.some((problem) => problem.startsWith("privacy:"))) {
  rmSync(outDir, { recursive: true, force: true });
  for (const [path, text] of files) {
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    writeFileSync(join(outDir, path), text);
  }
  if (existsSync(repoSkillsDir)) for (const entry of readdirSync(repoSkillsDir)) if (entry.startsWith(PLAY_PREFIX)) rmSync(join(repoSkillsDir, entry), { recursive: true, force: true });
  for (const [path, text] of repoFiles) {
    mkdirSync(dirname(join(repoSkillsDir, path)), { recursive: true });
    writeFileSync(join(repoSkillsDir, path), text);
  }
}

if (problems.length) {
  console.error("check:siteSkills FAIL");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`${check ? "check:siteSkills OK" : "skills:build wrote"} ${index.skills.length} skill(s), ${repoFiles.size} of them use-case plays also in .claude/skills: ${index.skills.map((skill) => skill.name).join(", ")}`);
