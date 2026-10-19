// Gate: enforces the {library}/{domain}/ convention in docs/namingConventions.md.
//
// For src/ and bin/:
// 1. Every directory and every .ts file name is camelCase (never kebab-case).
// 2. Every domain (src/{library}/{domain}) has an index.ts entrypoint.
// 3. Every helpers/ directory has an index.ts barrel.
// 4. No helper imports its parent domain's barrel (../index).
// 5. No kebab-case string literal in src/, bin/, scripts/, python/, and no
//    kebab-case file or folder name in skills/, python/, scripts/.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;
// `.test` is a role suffix, not part of the name: `filterListings.test.ts`.
const TS_FILE = /^([a-z][a-zA-Z0-9]*)(\.test)?\.ts$/;
const violations = [];
const rel = (path) => relative(root, path).split(sep).join('/');

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!CAMEL.test(entry.name)) violations.push(`${rel(path)}: directory name must be camelCase.`);
      if (entry.name === 'helpers') checkHelpers(path);
      walk(path);
    } else if (entry.name.endsWith('.ts') && !TS_FILE.test(entry.name)) {
      violations.push(`${rel(path)}: file name must be camelCase.`);
    }
  }
}

function checkHelpers(helpersPath) {
  if (!existsSync(join(helpersPath, 'index.ts'))) {
    violations.push(`${rel(helpersPath)}: missing required barrel "helpers/index.ts".`);
  }
  for (const file of readdirSync(helpersPath).filter((f) => f.endsWith('.ts'))) {
    readFileSync(join(helpersPath, file), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/from ['"]\.\.\/index(\.ts)?['"]/.test(line) && !line.trim().startsWith('//')) {
          violations.push(`${rel(join(helpersPath, file))}:${index + 1}: helper imports its parent domain barrel.`);
        }
      });
  }
}

function checkDomains(src) {
  for (const library of readdirSync(src, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const libraryPath = join(src, library.name);
    const domains = readdirSync(libraryPath, { withFileTypes: true }).filter((e) => e.isDirectory());
    if (domains.length === 0) violations.push(`${rel(libraryPath)}: library must contain at least one domain.`);
    for (const domain of domains) {
      if (!existsSync(join(libraryPath, domain.name, 'index.ts'))) {
        violations.push(`${rel(join(libraryPath, domain.name))}: missing required entrypoint "index.ts".`);
      }
    }
  }
}

// Names we can't rename (other systems' spellings). Everything else is camelCase.
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;
// zone-custom: 2Captcha proxy username token (src/proxyVendor/twoCaptcha).
// 2-digit: Intl.DateTimeFormat option value (src/marketplace/home).
// set-cookie, proxy-authorization: HTTP header names (src/rea/firefox).
// inspect-web-network-capture, analyze-javascript-application: rea-agents commands (src/rea/firefox).
// wilkes-barre: the real city name in Pennsylvania (src/marketplace/home).
// Numbers joined by dashes (`3-5`, `300-600`: the warm-up's draws, rule 36; a date, `2026-10-19`) are quantities, not names: rule 1 doesn't apply.
const ALLOWED_KEBAB = [/^\d+(?:-\d+)+$/, /^2-digit$/, /^rev-parse$/, /^xdg-open$/, /^zone-custom$/, /^set-cookie$/, /^content-type$/, /^proxy-authorization$/, /^x-fb-friendly-name$/, /^inspect-web-network-capture$/, /^analyze-javascript-application$/, /^photo-\d+-[0-9a-f]+$/, /^x{8}-x{4}-4x{3}-yx{3}-x{12}$/, /^wilkes-barre$/, /^aria-[a-z]+$/];
// A single- or double-quoted string on one line.
const LITERAL = /(['"])((?:(?!\1)[^\\\n])*)\1/g;

function checkLiterals(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '__pycache__') checkLiterals(path);
      continue;
    }
    if (!/\.(ts|mjs|py)$/.test(entry.name)) continue;
    readFileSync(path, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const code = line.trim();
        if (code.startsWith('//') || code.startsWith('#') || code.startsWith('*')) return;
        for (const [, , value] of line.matchAll(LITERAL)) {
          if (KEBAB.test(value) && !ALLOWED_KEBAB.some((allowed) => allowed.test(value))) {
            violations.push(`${rel(path)}:${index + 1}: kebab-case value "${value}" must be camelCase.`);
          }
        }
      });
  }
}

function checkNames(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__pycache__' || entry.name.startsWith('.')) continue;
    const base = entry.name.replace(/\.[^.]+$/, '');
    // SKILL.md is the skill format's fixed file name.
    if (entry.name !== 'SKILL.md' && KEBAB.test(base)) {
      violations.push(`${rel(join(dir, entry.name))}: name must be camelCase, never kebab-case.`);
    }
    if (entry.isDirectory()) checkNames(join(dir, entry.name));
  }
}

for (const dir of ['src', 'bin']) {
  const path = join(root, dir);
  if (existsSync(path) && statSync(path).isDirectory()) walk(path);
}
checkDomains(join(root, 'src'));
for (const dir of ['src', 'bin', 'scripts', 'python']) {
  const path = join(root, dir);
  if (existsSync(path)) checkLiterals(path);
}
for (const dir of ['skills', 'python', 'scripts']) {
  const path = join(root, dir);
  if (existsSync(path)) checkNames(path);
}

if (violations.length > 0) {
  console.error('check:naming FAIL');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error('\nSee docs/namingConventions.md.');
  process.exit(1);
}
console.log('check:naming OK — {library}/{domain}/ layout, camelCase names and values, no kebab-case.');
