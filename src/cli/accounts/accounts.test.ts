import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commandTools } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { accountsList } from "../runtime/index.ts";
import { COMMANDS } from "../runner/index.ts";
import type { CommandResult } from "../runner/types.ts";
import { workspaceAccountsCommand } from "./index.ts";

const before = process.env.LOG_LOCAL_ACCOUNTS;
let dir = "";
const quiet = { out: () => {}, err: () => {} } as never;
const run = (argv: string[]): Promise<CommandResult> => Promise.resolve(workspaceAccountsCommand.run(quiet, argv));

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "consoleTwinsAccounts"));
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [
    { id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird", sessionState: "loggedIn", cookies: { auth_token: "fakeCookieValue" } },
    { id: "local:facebook:fakeSeller", platform: "FACEBOOK", accountName: "fakeSeller", adsPowerProfileId: "fakeProfile", password: "fakePassword" },
    { id: "local:discord:fakeGuild", platform: "DISCORD", accountName: "fakeGuild" },
  ] }));
});

afterAll(() => {
  if (before === undefined) delete process.env.LOG_LOCAL_ACCOUNTS;
  else process.env.LOG_LOCAL_ACCOUNTS = before;
  rmSync(dir, { recursive: true, force: true });
});

describe("accountsList is the hosted runtime's list, as a command", () => {
  test("log accounts list --json answers what the runtime answers, page by page, with no credential", async () => {
    for (const args of [{}, { limit: 2 }, { limit: 2, cursor: "2" }]) {
      const argv = ["list", "--json", ...("limit" in args ? ["--limit", String(args.limit)] : []), ...("cursor" in args ? ["--cursor", String(args.cursor)] : [])];
      const twin = await run(argv);
      expect(twin.code).toBe(0);
      expect(JSON.parse(String(twin.stdout))).toEqual(accountsList(args).result);
    }
    const all = await run(["list", "--json"]);
    expect(String(all.stdout)).not.toContain("fakeCookieValue");
    expect(String(all.stdout)).not.toContain("fakePassword");
    expect(JSON.parse(String((await run(["list", "--json", "--limit", "2"])).stdout)).cursor).toBe("2");
  });

  test("its tool is accountsList, a read, and a bad page is refused before anything is read", async () => {
    const tool = commandTools(COMMANDS).find((entry) => entry.tool === "accountsList");
    expect(tool?.effect).toBe("read");
    expect((await run(["list", "--limit", "0"])).error).toBe("inputInvalid");
    expect((await run(["list", "--cursor", "next"])).error).toBe("inputInvalid");
    expect((await run(["show"])).error).toBe("inputInvalid");
  });
});
