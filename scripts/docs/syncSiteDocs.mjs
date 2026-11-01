import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const docsDir = join(root, "docs");
const check = process.argv.includes("--check");
const outDir = check ? mkdtempSync(join(tmpdir(), "siteDocs-")) : join(root, "site", "apps", "docs", "content", "docs");
const GITHUB = "https://github.com/matthewdonsemail-lab/log/blob/main";
const site = JSON.parse(readFileSync(join(docsDir, "site.json"), "utf8"));
const privateRoots = new Set(site.private ?? []);
const problems = [];

const toPosix = (p) => p.split("\\").join("/");
const stripExt = (p) => p.replace(/\.(md|mmd)$/, "");
const FOLDER_TITLES = { twitter: "X", facebook: "Facebook", reddit: "Reddit", discord: "Discord", linkedin: "LinkedIn", x: "X" };
const prettyFolder = (name) => FOLDER_TITLES[name] ?? name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

function listDocs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const rel = toPosix(relative(docsDir, full));
    if (privateRoots.has(rel.split("/")[0])) return [];
    if (statSync(full).isDirectory()) return listDocs(full);
    return /\.(md|mmd)$/.test(name) ? [rel] : [];
  });
}

function pageSlug(rel) {
  const noExt = stripExt(rel);
  return basename(noExt) === "README" ? posix.join(posix.dirname(noExt), "index").replace(/^\.\//, "") : noExt;
}

const placed = new Map();
const tabMeta = [];
function place(rel, slug) {
  if (placed.has(rel)) problems.push(`docs/site.json places docs/${rel} twice`);
  placed.set(rel, slug);
}

const all = listDocs(docsDir);
if (site.front) place(site.front, "index");

for (const tab of site.tabs) {
  const pages = [];
  const soleFolder = tab.sections.length === 1 && tab.sections[0].folder === tab.id && !tab.sections[0].pages;
  for (const section of tab.sections) {
    if (!soleFolder) pages.push(`---${section.title}---`);
    for (const rel of section.pages ?? []) {
      if (!existsSync(join(docsDir, rel))) problems.push(`docs/site.json lists docs/${rel}, which doesn't exist`);
      const name = basename(stripExt(rel));
      place(rel, `${tab.id}/${name}`);
      pages.push(name);
    }
    for (const folder of [section.folder, ...(section.folders ?? [])].filter(Boolean)) {
      if (!existsSync(join(docsDir, folder))) problems.push(`docs/site.json lists docs/${folder}/, which doesn't exist`);
      const base = soleFolder ? tab.id : `${tab.id}/${folder}`;
      for (const rel of all.filter((r) => r.startsWith(`${folder}/`))) place(rel, `${base}/${pageSlug(rel.slice(folder.length + 1))}`);
      pages.push(soleFolder ? "..." : folder);
    }
  }
  tabMeta.push({ dir: tab.id, meta: { title: tab.title, description: tab.description, root: true, pages } });
}

for (const rel of all) if (!placed.has(rel)) problems.push(`docs/${rel} isn't in any section of docs/site.json: add it to a tab, or to "private"`);

function urlOf(slug) {
  const clean = slug.replace(/(^|\/)index$/, "");
  return clean ? `/docs/${clean}` : "/docs";
}

function rewriteLink(fromRel, target) {
  if (/^([a-z]+:|#|\/)/i.test(target)) return target;
  const [path, anchor] = target.split("#");
  if (!path) return target;
  const repoPath = toPosix(posix.normalize(posix.join("docs", posix.dirname(fromRel), path)));
  const docRel = repoPath.startsWith("docs/") ? repoPath.slice(5).replace(/\/$/, "") : null;
  const asDoc = docRel && (placed.has(docRel) ? docRel : placed.has(`${docRel}/README.md`) ? `${docRel}/README.md` : null);
  if (asDoc) return urlOf(placed.get(asDoc)) + (anchor ? `#${anchor}` : "");
  if (!existsSync(join(root, repoPath))) problems.push(`docs/${fromRel}: links to ${target}, which doesn't exist (${repoPath})`);
  return `${GITHUB}/${repoPath}` + (anchor ? `#${anchor}` : "");
}

function titleAndBody(rel, text) {
  const body = text.replace(/\r\n/g, "\n").replace(/^---\n[\s\S]*?\n---\n/, "");
  const heading = /^# (.+)\n/m.exec(body);
  if (heading && body.slice(0, heading.index).trim() === "") return { title: heading[1].trim(), body: body.slice(heading.index + heading[0].length) };
  if (rel.endsWith(".md")) problems.push(`docs/${rel}: no "# " title on its first line`);
  return { title: basename(stripExt(rel)), body };
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
    return { title: `Diagram: ${basename(rel, ".mmd")}`, body: `Generated from the code by \`bun run docs:build\`.\n\n\`\`\`mermaid\n${text.trim()}\n\`\`\`\n` };
  }
  const { title, body } = titleAndBody(rel, text);
  const linked = body.replace(/(\]\()([^)\s]+)(\))/g, (_, open, target, close) => open + rewriteLink(rel, target) + close);
  return { title, body: plainText(linked) };
}

rmSync(outDir, { recursive: true, force: true });
for (const [rel, slug] of placed) {
  if (!existsSync(join(docsDir, rel))) continue;
  const { title, body } = render(rel);
  const file = join(outDir, `${slug}.md`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body.trimStart()}`);
}
writeFileSync(join(outDir, "meta.json"), JSON.stringify({ title: "log", pages: ["index", ...site.tabs.map((t) => t.id)] }, null, 2));
for (const { dir, meta } of tabMeta) {
  mkdirSync(join(outDir, dir), { recursive: true });
  writeFileSync(join(outDir, dir, "meta.json"), JSON.stringify(meta, null, 2));
}
const folderDirs = new Set([...placed.values()].map((slug) => posix.dirname(slug)).filter((d) => d.includes("/")));
for (const dir of folderDirs) {
  const metaPath = join(outDir, dir, "meta.json");
  if (!existsSync(metaPath)) writeFileSync(metaPath, JSON.stringify({ title: prettyFolder(posix.basename(dir)) }, null, 2));
}

if (check) rmSync(outDir, { recursive: true, force: true });
if (problems.length) {
  console.error(`siteDocs: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`siteDocs: ${placed.size} pages in ${site.tabs.length} tabs ${check ? "check out" : `written to ${toPosix(relative(root, outDir))}`}`);
