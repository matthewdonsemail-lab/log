import { describe, expect, test } from "bun:test";
import { barrelsOf, buildGraph, distancesFrom, FULL_RUN_SHARE, importsOf, isBarrel, reachedFrom, selectTests } from "./affectedTests.ts";

const repo: Record<string, string> = {
  "src/a/b/index.ts": 'import { c } from "../c/index.ts";\nexport const b = c;\n',
  "src/a/c/index.ts": 'export { d } from "./helpers";\nexport const c = 1;\n',
  "src/a/c/helpers.ts": "export const d = 2;\n",
  "src/a/b/b.test.ts": 'import { b } from "./index.ts";\n',
  "src/a/c/c.test.ts": 'import { c } from "./index";\n',
  "src/a/e/e.test.ts": 'const { e } = await import("../e/client.js");\nconst run = () => spawnSync("python", [join(root, "python", "fakeApi", "engine.py")]);\n',
  "src/a/e/client.ts": 'export const e = () => spawnSync("python", [join(root, "python", "otherApi", "engine.py")]);\n',
  "src/a/f/f.test.ts": 'import { f } from "./index.ts";\n',
  "src/a/f/index.ts": "export const f = 1;\n",
  "python/fakeApi/engine.py": "from fakeApi import helpers\nfrom .wire import send\n",
  "python/fakeApi/helpers.py": "import json\n",
  "python/fakeApi/wire.py": "",
  "python/otherApi/engine.py": "",
};
const files = Object.keys(repo);
const tests = files.filter((f) => f.endsWith(".test.ts"));
const graph = buildGraph(files, (p) => repo[p]);

describe("pre-push runs only the tests a change can reach (parallel worktrees)", () => {
  test("relative imports resolve with or without the extension, through index files and .js specifiers", () => {
    const known = new Set(files);
    expect(importsOf("src/a/b/index.ts", repo["src/a/b/index.ts"], known)).toEqual(["src/a/c/index.ts"]);
    expect(importsOf("src/a/c/index.ts", repo["src/a/c/index.ts"], known)).toEqual(["src/a/c/helpers.ts"]);
    expect(importsOf("src/a/e/e.test.ts", repo["src/a/e/e.test.ts"], known)).toEqual(["src/a/e/client.ts"]);
  });

  test("python imports resolve from the python root and relative to the package", () => {
    expect(importsOf("python/fakeApi/engine.py", repo["python/fakeApi/engine.py"], new Set(files)).sort()).toEqual(["python/fakeApi/helpers.py", "python/fakeApi/wire.py"]);
  });

  test("a changed helper reaches every test that imports it, directly or through other files", () => {
    expect([...reachedFrom(["src/a/c/helpers.ts"], graph)].filter((f) => f.endsWith(".test.ts")).sort()).toEqual(["src/a/b/b.test.ts", "src/a/c/c.test.ts"]);
  });

  test("a python module reaches the test that spawns its engine by path, not one that only imports code spawning it, nor another engine of the same name", () => {
    expect(selectTests(["python/fakeApi/wire.py"], tests, graph, []).tests).toEqual(["src/a/e/e.test.ts"]);
    expect(selectTests(["python/otherApi/engine.py"], tests, graph, []).tests).toEqual([]);
  });

  test("a changed test runs itself, and the smoke set always runs", () => {
    expect(selectTests(["src/a/f/f.test.ts"], tests, graph, ["src/a/c/c.test.ts"]).tests).toEqual(["src/a/c/c.test.ts", "src/a/f/f.test.ts"]);
  });

  test("a change every test depends on, or one reaching most tests, runs the full suite", () => {
    expect(selectTests(["bun.lock"], tests, graph, [])).toMatchObject({ full: true });
    expect(selectTests(["vendor/twikit/x.py"], tests, graph, [])).toMatchObject({ full: true });
    expect(FULL_RUN_SHARE).toBeLessThan(1);
    expect(selectTests(["src/a/c/helpers.ts", "src/a/f/index.ts", "src/a/e/client.ts"], tests, graph, [])).toMatchObject({ full: true, reason: "3 of 4 test files import a changed file directly" });
  });

  test("a deleted file still reaches the tests that import it", () => {
    const importer: Record<string, string> = { ...repo, "src/a/f/index.ts": 'export { gone } from "./gone.ts";\n' };
    const withGone = buildGraph([...files, "src/a/f/gone.ts"], (p) => {
      if (!(p in importer)) throw new Error("deleted");
      return importer[p];
    });
    expect(selectTests(["src/a/f/gone.ts"], tests, withGone, []).tests).toEqual(["src/a/f/f.test.ts"]);
  });
});

describe("pre-push picks tests by import distance under a cap, and CI runs the rest", () => {
  const chain: Record<string, string> = {
    "src/s/core.ts": "export const core = 1;\n",
    "src/s/index.ts": 'export * from "./core"\nexport { other } from "./other.ts";\n',
    "src/s/other.ts": "export const other = 2;\n",
    "src/u/one.ts": 'import { core } from "../s/index.ts";\nexport const one = core;\n',
    "src/u/two.ts": 'import { one } from "../u/one.ts";\nexport const two = one;\n',
    "src/t/direct.test.ts": 'import { core } from "../s/core.ts";\n',
    "src/t/viaBarrel.test.ts": 'import { core } from "../s/index.ts";\n',
    "src/t/near.test.ts": 'import { one } from "../u/one.ts";\n',
    "src/t/far.test.ts": 'import { two } from "../u/two.ts";\n',
  };
  const chainFiles = Object.keys(chain);
  const chainTests = chainFiles.filter((f) => f.endsWith(".test.ts"));
  const chainGraph = buildGraph(chainFiles, (p) => chain[p]);
  const barrels = barrelsOf(chainFiles, (p) => chain[p]);

  test("an index that only re-exports is a barrel, one with its own code isn't", () => {
    expect([...barrels]).toEqual(["src/s/index.ts"]);
    expect(isBarrel("export const c = 1;\nexport * from './x';\n")).toBe(false);
    expect(isBarrel("")).toBe(false);
  });

  test("a test importing a changed file through a barrel is as near as one importing it directly", () => {
    const distance = distancesFrom(["src/s/core.ts"], chainGraph, barrels);
    expect(distance.get("src/t/direct.test.ts")).toBe(1);
    expect(distance.get("src/t/viaBarrel.test.ts")).toBe(1);
    expect(distance.get("src/t/near.test.ts")).toBe(2);
    expect(distance.get("src/t/far.test.ts")).toBe(3);
  });

  test("under the cap every reachable test runs", () => {
    expect(selectTests(["src/s/core.ts"], chainTests, chainGraph, [], { barrels, cap: 10 }).tests).toEqual(chainTests.slice().sort());
  });

  test("over the cap the nearest whole tiers run, the rest is left to CI with the reason said", () => {
    const picked = selectTests(["src/s/core.ts"], chainTests, chainGraph, [], { barrels, cap: 3 });
    expect(picked).toMatchObject({ full: false, leftToCi: 1 });
    expect(picked.tests).toEqual(["src/t/direct.test.ts", "src/t/near.test.ts", "src/t/viaBarrel.test.ts"]);
    expect(picked.reason).toContain("left 1 further test file(s) to CI");
  });

  test("a test that imports a changed file is never dropped, even past the cap", () => {
    const picked = selectTests(["src/s/core.ts"], [...chainTests, "src/x/a.test.ts", "src/x/b.test.ts", "src/x/c.test.ts", "src/x/d.test.ts"], chainGraph, [], { barrels, cap: 1 });
    expect(picked.tests).toEqual(["src/t/direct.test.ts", "src/t/viaBarrel.test.ts"]);
    expect(picked.leftToCi).toBe(2);
  });

  test("a barrel that re-exports many files still passes a change through to its importers", () => {
    const wide: Record<string, string> = { "src/w/index.ts": Array.from({ length: 45 }, (_, i) => `export * from "./m${i}.ts";`).join("\n"), "src/w/w.test.ts": "", "src/z/z.test.ts": 'import { m0 } from "../w/index.ts";\n' };
    for (let i = 0; i < 45; i++) wide[`src/w/m${i}.ts`] = `export const m${i} = ${i};\n`;
    const wideFiles = Object.keys(wide);
    const picked = selectTests(["src/w/m3.ts"], ["src/w/w.test.ts", "src/z/z.test.ts", "src/q/1.test.ts", "src/q/2.test.ts", "src/q/3.test.ts", "src/q/4.test.ts"], buildGraph(wideFiles, (p) => wide[p]), [], { barrels: barrelsOf(wideFiles, (p) => wide[p]) });
    expect(picked.tests).toContain("src/z/z.test.ts");
  });
});
