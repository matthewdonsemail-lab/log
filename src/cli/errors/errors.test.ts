import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runCli } from "../runner/index.ts";
import { renderCatalogMarkdown } from "./index.ts";

const root = join(import.meta.dir, "..", "..", "..");

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log errors", () => {
  test("lists every code, or one layer", async () => {
    const all = await run(["errors"]);
    expect(all.code).toBe(0);
    expect(all.out).toContain("crashedAfterPublish");
    const account = await run(["errors", "--layer", "account"]);
    expect(account.out).toContain("checkpointed");
    expect(account.out).not.toContain("titleNotSet");
  });

  test("--code explains one code; unknown codes and layers exit 1", async () => {
    const one = await run(["errors", "--code", "rateLimited"]);
    expect(one.out).toContain("publish→blocked, monitor→resting");
    expect((await run(["errors", "--code", "nope"])).code).toBe(1);
    expect((await run(["errors", "--layer", "nope"])).code).toBe(1);
  });

  test("--json is the catalog", async () => {
    const json = JSON.parse((await run(["errors", "--json"])).out);
    expect(json.rejected).toMatchObject({ layer: "form", publish: "failed" });
  });

  test("docs/errorCatalog.md is the current export (run `bun run errors:export`)", () => {
    expect(readFileSync(join(root, "docs", "errorCatalog.md"), "utf8").trimEnd()).toBe(renderCatalogMarkdown().trimEnd());
  });
});

describe("log graph", () => {
  test("draws the publish machine, stopping and all", async () => {
    const { code, out } = await run(["graph", "publish"]);
    expect(code).toBe(0);
    expect(out).toStartWith("stateDiagram-v2");
    expect(out).toContain("stopping --> blocked: always [endsBlocked]");
    expect(out).toContain("openingForm --> routingCaptcha: done [formCaptcha]");
  });

  test("needs exactly one known machine", async () => {
    expect((await run(["graph"])).code).toBe(1);
    expect((await run(["graph", "nope"])).code).toBe(1);
  });
});
