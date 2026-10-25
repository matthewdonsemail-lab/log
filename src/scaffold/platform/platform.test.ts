import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { addImport, addToArray, addToInterface, addToObject, addToReturnedObject, AstEditError, applyPlan, namesOf, planNewPlatform } from "./index.ts";

const REPO = join(import.meta.dir, "..", "..", "..");

describe("the syntax-tree edits", () => {
  test("an array gains an element, multi-line or on one line, `as const` kept", () => {
    expect(addToArray(`export const A = [\n  "a",\n  "b",\n] as const;\n`, "A", `"c"`)).toBe(`export const A = [\n  "a",\n  "b",\n  "c",\n] as const;\n`);
    expect(addToArray(`export const A = ["a", "b"] as const;\n`, "A", `"c"`)).toBe(`export const A = ["a", "b", "c"] as const;\n`);
    expect(addToArray(`const C: X[] = [\n  one,\n  two\n];\n`, "C", "three")).toBe(`const C: X[] = [\n  one,\n  two,\n  three\n];\n`);
  });

  test("an object, a returned object and an interface gain a member; an import is added", () => {
    expect(addToObject(`export const R: Readonly<Record<string, number[]>> = {\n  a: [1],\n  b: [2],\n};\n`, "R", "c", "[3]")).toContain("  b: [2],\n  c: [3],\n};");
    expect(addToReturnedObject(`export function make(o: O) {\n  return {\n    a: o.a,\n    b: o.b,\n  };\n}\n`, "make", "c", "o.c ?? z")).toContain("    b: o.b,\n    c: o.c ?? z,\n  };");
    expect(addToInterface(`export interface Ctx {\n  a: string;\n  b?: number;\n}\n`, "Ctx", "c", "c?: boolean;")).toBe(`export interface Ctx {\n  a: string;\n  b?: number;\n  c?: boolean;\n}\n`);
    expect(addImport(`import { a } from "./a.ts";\nimport { b } from "./b.ts";\n\nconst x = 1;\n`, "./c.ts", "c")).toBe(`import { a } from "./a.ts";\nimport { b } from "./b.ts";\nimport { c } from "./c.ts";\n\nconst x = 1;\n`);
  });

  test("an edit that is already there, or whose target is missing, is refused", () => {
    expect(() => addToArray(`const A = ["a"];\n`, "A", `"a"`)).toThrow(AstEditError);
    expect(() => addToObject(`const R = { a: 1 };\n`, "R", "a", "2")).toThrow(AstEditError);
    expect(() => addToArray(`const B = ["a"];\n`, "A", `"b"`)).toThrow(AstEditError);
  });
});

function copyOfRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "newPlatform"));
  for (const path of ["src/cli/runner/helpers/platforms.ts", "src/cli/runner/index.ts", "src/cli/runner/types.ts", "src/directApi/engine/client.ts", "src/mcp/server/helpers/agentRules.ts", "src/twenty/graphql/generated/schema.ts"]) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    cpSync(join(REPO, path), join(root, path));
  }
  return root;
}

describe("log new platform", () => {
  test("names follow the platform's name", () => {
    expect(namesOf({ name: "blueSky" })).toMatchObject({ pascal: "BlueSky", constant: "BLUE_SKY", label: "BlueSky", twentyPlatform: "BLUESKY", seam: "directBlueSky", sessionKey: "blueSkySession", cookieDomain: ".bluesky.com" });
  });

  test("the plan wires every registration through the syntax tree and writes the platform's files", () => {
    const root = copyOfRepo();
    const plan = planNewPlatform(root, { name: "reddit", sessionCookies: ["reddit_session"] });
    expect(plan.notes.join(" ")).toContain("no REDDIT option");
    applyPlan(root, plan);
    const read = (p: string) => readFileSync(join(root, p), "utf8");
    expect(read("src/cli/runner/helpers/platforms.ts")).toMatch(/PLATFORMS = \[[^\]]*"reddit"/);
    expect(read("src/cli/runner/helpers/platforms.ts")).toContain('reddit: "Reddit"');
    expect(read("src/cli/runner/index.ts")).toContain('import { redditSessionCommand } from "../reddit/index.ts";');
    expect(read("src/cli/runner/index.ts")).toContain("directReddit: overrides.directReddit ?? runRedditEngine");
    expect(read("src/cli/runner/types.ts")).toContain("directReddit?: (account:");
    expect(read("src/directApi/engine/client.ts")).toContain("redditSession: { platform: 'reddit'");
    expect(read("src/mcp/server/helpers/agentRules.ts")).toContain("redditSession: [13, 63, 64, 73, 83]");
    for (const file of ["src/reddit/account/session/client.ts", "src/cli/reddit/index.ts", "src/cli/reddit/reddit.test.ts", "python/redditApi/engine.py", "python/redditApi/__init__.py", "docs/platforms/reddit/README.md"]) expect(existsSync(join(root, file))).toBe(true);
    expect(read("src/reddit/account/session/client.ts")).toContain("sessionCookies: ['reddit_session']");
  });

  test("an existing platform, a bad name or a missing library is refused before anything is written", () => {
    const root = copyOfRepo();
    expect(() => planNewPlatform(root, { name: "twitter" })).toThrow("already a platform");
    expect(() => planNewPlatform(root, { name: "Red-dit" })).toThrow("camelCase");
    expect(() => planNewPlatform(root, { name: "reddit", library: "vendor/nothingHere" })).toThrow("doesn't exist");
  });
});
