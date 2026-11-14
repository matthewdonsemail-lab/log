import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PLATFORMS, PLATFORM_SITES } from "../../cli/runner/helpers/platforms.ts";

const python = join(import.meta.dir, "..", "..", "..", "python");
const fixtures = join(python, "fixtures", "loginPages");

interface Fixture {
  platform: string;
  pages: { name: string; signals: Record<string, unknown>; expect: { state: string; blocked: boolean; inputAllowed: boolean } }[];
}

const SCRIPT = [
  "import json, sys",
  "from browser.viewerState import PLATFORM_HOSTS, viewer_state",
  "cases = json.loads(sys.stdin.read())",
  "print(json.dumps({'hosts': {key: list(value) for key, value in PLATFORM_HOSTS.items()}, 'states': [viewer_state(case) for case in cases]}))",
].join("\n");

function classified(cases: Record<string, unknown>[]): { hosts: Record<string, string[]>; states: unknown[] } {
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", SCRIPT], { cwd: python, encoding: "utf8", input: JSON.stringify(cases) });
  if (run.status !== 0) throw new Error(run.stderr);
  return JSON.parse(run.stdout);
}

const files = readdirSync(fixtures).filter((name) => name.endsWith(".json"));
const loaded = files.map((name) => JSON.parse(readFileSync(join(fixtures, name), "utf8")) as Fixture);

describe("the viewer classifies each platform's sign-in pages from its own fixture", () => {
  test("every platform has a fixture login page", () => {
    expect(loaded.map((fixture) => fixture.platform).sort()).toEqual([...PLATFORMS].sort());
  });

  test("a login and a two-step page take the owner's input; a stopped page is a stop", () => {
    const cases = loaded.flatMap((fixture) => fixture.pages.map((page) => ({ fixture, page })));
    const answer = classified(cases.map(({ page }) => page.signals));
    cases.forEach(({ fixture, page }, index) => {
      expect(answer.states[index], `${fixture.platform} ${page.name}`).toEqual(page.expect);
    });
    for (const fixture of loaded.filter((item) => item.platform !== "facebook")) {
      const login = fixture.pages.find((page) => page.name === "login");
      expect(login?.expect.state).toBe(`${fixture.platform}Login`);
    }
  });

  test("the Python hosts match PLATFORM_SITES", () => {
    const { hosts } = classified([]);
    for (const platform of PLATFORMS) expect(hosts[platform], platform).toEqual([...PLATFORM_SITES[platform].hosts]);
  });
});
