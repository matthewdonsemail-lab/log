import { afterEach, describe, expect, test } from "bun:test";
import { browserView, browserViews } from "../../browser/inspect/index.ts";
import { runCli } from "../runner/index.ts";
import { browsersDeps } from "./index.ts";

afterEach(() => {
  browsersDeps.read = browserViews;
});

async function run(argv: string[]): Promise<{ code: number; out: string }> {
  const out: string[] = [];
  const code = await runCli(argv, { out: (line) => out.push(line), err: () => {} });
  return { code, out: out.join("\n") };
}

describe("log browsers", () => {
  test("with nothing open it says so", async () => {
    browsersDeps.read = () => [];
    expect(await run(["browsers"])).toEqual({ code: 0, out: "No browser is open." });
  });

  test("a browser on a checkpoint shows its state and the call that resolves it", async () => {
    browsersDeps.read = () => [browserView({ account: "bethlehem", step: "03_goto", url: "https://www.facebook.com/checkpoint/1501092823525282/", text: "- generic [ref=e62]: confirm that you're human to use your account\n- generic [ref=e69]: Continue", failed: null })];
    const text = await run(["browsers"]);
    expect(text.out).toContain("State      checkpointStart");
    expect(text.out).toContain('Next       inspectDoLive {"account":"bethlehem","action":"click","values":["e69"],"confirmLive":true}');
    const json = JSON.parse((await run(["browsers", "--json"])).out) as { browsers: { next: { tool: string } }[] };
    expect(json.browsers[0].next.tool).toBe("inspectDoLive");
  });
});
