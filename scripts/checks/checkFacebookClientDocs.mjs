import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const docsDir = join(root, 'docs', 'platforms', 'facebook');
const indexPath = join(docsDir, 'operations.json');
const problems = [];

if (!existsSync(indexPath)) {
  console.error('facebookClient docs: docs/platforms/facebook/operations.json is missing. Run `bun bin/log.ts facebook capture --docs`.');
  process.exit(1);
}
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const listed = new Set(index.operations.map((o) => o.doc));

for (const operation of index.operations) {
  const path = join(docsDir, operation.doc);
  if (!existsSync(path)) {
    problems.push(`${operation.doc}: listed in operations.json but the doc is missing`);
    continue;
  }
  if (readFileSync(path, 'utf8').includes('<!-- toWrite -->')) problems.push(`${operation.doc}: reasoning not written yet (<!-- toWrite -->)`);
  if (operation.kind !== 'endpoint' && !operation.reaEvidenceId) problems.push(`${operation.doc}: rea has not read this request's slice`);
}
for (const domain of readdirSync(docsDir)) {
  if (domain === 'flows' || !statSync(join(docsDir, domain)).isDirectory()) continue;
  for (const file of readdirSync(join(docsDir, domain))) {
    if (file.endsWith('.md') && file !== 'README.md' && !listed.has(`${domain}/${file}`)) problems.push(`${domain}/${file}: not in operations.json (rebuild the docs)`);
  }
}

const flowsDir = join(root, 'src', 'camofox', 'flow', 'definitions');
if (existsSync(flowsDir)) {
  for (const file of readdirSync(flowsDir).filter((f) => f.endsWith('.json'))) {
    const name = file.slice(0, -5);
    if (!existsSync(join(docsDir, 'flows', `${name}.md`))) problems.push(`flow ${name}: no docs/platforms/facebook/flows/${name}.md (run \`bun bin/log.ts flow docs ${name}\`)`);
  }
}

const captures = process.env.LOG_CAPTURES_ROOT || join(homedir(), '.logCli');
const builtAt = Date.parse(index.builtAt);
const newer = [];
const walk = (dir, depth) => {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  if (names.includes('session.har') && statSync(join(dir, 'session.har')).mtimeMs > builtAt) newer.push(relative(captures, dir));
  if (depth > 0) for (const name of names) if (statSync(join(dir, name), { throwIfNoEntry: false })?.isDirectory()) walk(join(dir, name), depth - 1);
};
for (const top of ['runs', 'publish']) walk(join(captures, top), 6);
if (newer.length) problems.push(`${newer.length} run(s) recorded after the docs were built (${newer.slice(0, 3).join(', ')}${newer.length > 3 ? ', …' : ''}): run \`bun bin/log.ts facebook capture --docs\``);

const documented = new Set(index.operations.map((o) => o.name));
const named = new Map();
const scan = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'node_modules' && name !== 'generated' && name !== '__pycache__') scan(path);
      continue;
    }
    if (!/\.(ts|py)$/.test(name) || /\.test\.ts$/.test(name)) continue;
    for (const match of readFileSync(path, 'utf8').matchAll(/\b((?:use|Comet|Marketplace|Commerce)[A-Za-z0-9]*(?:Query|Mutation))\b/g)) {
      if (!named.has(match[1])) named.set(match[1], relative(root, path));
    }
  }
};
scan(join(root, 'src'));
scan(join(root, 'python'));
for (const [name, file] of named) if (!documented.has(name)) problems.push(`${name} (named in ${file}): no doc in docs/platforms/facebook`);

if (problems.length) {
  console.error(`facebookClient docs: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`facebookClient docs: ${index.operations.length} requests documented, rea read every GraphQL slice.`);
