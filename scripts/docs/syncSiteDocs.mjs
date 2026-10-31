import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const docsDir = join(root, "docs");
const check = process.argv.includes("--check");
const outDir = check ? mkdtempSync(join(tmpdir(), "siteDocs-")) : join(root, "site", "apps", "docs", "content", "docs");
const GITHUB = "https://github.com/matthewdonsemail-lab/log/blob/main";
const LEFT_OUT = new Set(["identityLeaks", "providerResearch", "scaleArchitecture", "deviceIsolation", "vendors", "infra"]);
const ORDER = ["index", "install", "mcp", "useCases", "reference", "guides", "platforms", "diagrams", "twenty", "howItWorks"];

const toPosix = (p) => p.split("\\").join("/");

function listDocs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const rel = toPosix(relative(docsDir, full));
    if (statSync(full).isDirectory()) return LEFT_OUT.has(rel.split("/")[0]) ? [] : listDocs(full);
    return /\.(md|mmd)$/.test(name) ? [rel] : [];
  });
}

function slugOf(rel) {
  const noExt = rel.replace(/\.(md|mmd)$/, "");
  return basename(noExt) === "README" ? posix.join(posix.dirname(noExt), "index").replace(/^\.\//, "") : noExt;
}

function urlOf(slug) {
  const clean = slug.replace(/(^|\/)index$/, "");
  return clean ? `/docs/${clean}` : "/docs";
}

const sources = listDocs(docsDir);
const published = new Map(sources.map((rel) => [rel, slugOf(rel)]));
const problems = [];

function rewriteLink(fromRel, target) {
  if (/^([a-z]+:|#|\/)/i.test(target)) return target;
  const [path, anchor] = target.split("#");
  if (!path) return target;
  const repoPath = toPosix(posix.normalize(posix.join("docs", posix.dirname(fromRel), path)));
  const docRel = repoPath.startsWith("docs/") ? repoPath.slice(5) : null;
  const asDoc = docRel && (published.has(docRel) ? docRel : published.has(`${docRel.replace(/\/$/, "")}/README.md`) ? `${docRel.replace(/\/$/, "")}/README.md` : null);
  if (asDoc) return urlOf(published.get(asDoc)) + (anchor ? `#${anchor}` : "");
  if (!existsSync(join(root, repoPath))) problems.push(`docs/${fromRel}: links to ${target}, which doesn't exist (${repoPath})`);
  return `${GITHUB}/${repoPath}` + (anchor ? `#${anchor}` : "");
}

function titleAndBody(rel, text) {
  const body = text.replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "");
  const heading = /^# (.+)\n/m.exec(body);
  if (heading && body.slice(0, heading.index).trim() === "") return { title: heading[1].trim(), body: body.slice(heading.index + heading[0].length) };
  if (extname(rel) === ".md") problems.push(`docs/${rel}: no "# " title on its first line`);
  return { title: basename(rel).replace(/\.(md|mmd)$/, ""), body };
}

function escapeProse(segment) {
  return segment.replace(/<(?!(https?:|mailto:)[^>\s]*>)/g, "&lt;");
}

function plainText(body) {
  let fenced = false;
  return body
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced) return line;
      return line.split(/(`+[^`]*`+)/).map((part, i) => (i % 2 === 1 ? part : escapeProse(part))).join("");
    })
    .join("\n");
}

function render(rel) {
  const text = readFileSync(join(docsDir, rel), "utf8");
  if (rel.endsWith(".mmd")) {
    const name = basename(rel, ".mmd");
    return { title: `Diagram: ${name}`, body: `Generated from the code by \`bun run docs:build\`.\n\n\`\`\`mermaid\n${text.trim()}\n\`\`\`\n` };
  }
  const { title, body } = titleAndBody(rel, text);
  const linked = body.replace(/(\]\()([^)\s]+)(\))/g, (_, open, target, close) => open + rewriteLink(rel, target) + close);
  return { title, body: plainText(linked) };
}

rmSync(outDir, { recursive: true, force: true });
for (const rel of sources) {
  const { title, body } = render(rel);
  const file = join(outDir, `${published.get(rel)}.md`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body.trimStart()}`);
}
if (!published.has("README.md")) problems.push("docs/README.md is missing: it is the docs site's front page");
writeFileSync(join(outDir, "meta.json"), JSON.stringify({ title: "log", pages: [...ORDER, "..."] }, null, 2));

if (check) rmSync(outDir, { recursive: true, force: true });
if (problems.length) {
  console.error(`siteDocs: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`siteDocs: ${sources.length} pages from docs/ ${check ? "check out" : `written to ${toPosix(relative(root, outDir))}`}`);
