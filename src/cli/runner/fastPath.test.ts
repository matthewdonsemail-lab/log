import { describe, expect, test } from "bun:test";
import { COMMAND_INDEX } from "./helpers/commandIndex.ts";
import { loadIndexed, runFast } from "./client.ts";
import { COMMANDS, runCli } from "./index.ts";

async function capture(run: typeof runCli, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await run(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log loads only the command it runs", () => {
  test("every indexed command loads the very command COMMANDS holds, and none is missing", async () => {
    expect(COMMAND_INDEX).toHaveLength(COMMANDS.length);
    for (const entry of COMMAND_INDEX) {
      const command = await loadIndexed(entry);
      expect(COMMANDS).toContain(command!);
      expect(String(command!.platform)).toBe(entry.platform);
    }
  });

  test("a command answers the same through the fast path as through the full runner", async () => {
    for (const argv of [["twitter", "dms", "--account", "x", "--limit", "0"], ["dms", "--account", "x"], ["twitter", "search", "x"], ["twitter"], ["discord", "session"]]) {
      expect(await capture(runFast, argv)).toEqual(await capture(runCli, argv));
    }
  });

  test("help and an unknown command fall back to the full catalog", async () => {
    const help = await capture(runFast, []);
    expect(help.code).toBe(0);
    expect(help.out).toEqual((await capture(runCli, [])).out);
    expect((await capture(runFast, ["nope"])).code).toBe(2);
  });
});
