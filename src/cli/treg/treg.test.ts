import { afterEach, describe, expect, test } from "bun:test";
import { callArgs, createTregClient, endpointOf, isFreePrice, paramsOf, shownCommand } from "../../extensions/treg/index.ts";
import type { TregRun } from "../../extensions/treg/index.ts";
import { tregCommand, tregDeps } from "./index.ts";

const FREE = "id: tinyfish.web.search\nsummary: \"Search the web\"\nprice: free\ncall: treg call tinyfish.web.search --query 'query=x'\n";
const PRICED = "id: tikhub.x.user-tweets\nsummary: \"A user's tweets\"\nprice: $0.001/call\n";

const context = () => {
  const err: string[] = [];
  return { err, ctx: { err: (line: string) => err.push(line), out: () => {} } as never };
};

function fake(getText: string, callAnswer: TregRun = { ok: true, code: 0, stdout: "{\"results\":[1]}", stderr: "" }) {
  const seen: string[][] = [];
  const client = createTregClient(async (args) => {
    seen.push(args);
    if (args[0] === "catalog" && args[1] === "get") return { ok: true, code: 0, stdout: getText, stderr: "" };
    if (args[0] === "catalog") return { ok: true, code: 0, stdout: "tinyfish.web.search  free", stderr: "" };
    return callAnswer;
  });
  tregDeps.client = () => client;
  return seen;
}

const original = tregDeps.client;
afterEach(() => {
  tregDeps.client = original;
});

describe("treg extension", () => {
  test("a price of free or $0 is free, anything else is priced", () => {
    expect(isFreePrice("free")).toBe(true);
    expect(isFreePrice("$0 per request")).toBe(true);
    expect(isFreePrice("$0.001/call")).toBe(false);
    expect(isFreePrice(null)).toBe(false);
    expect(endpointOf("x", FREE)).toMatchObject({ id: "tinyfish.web.search", summary: "Search the web", price: "free", free: true });
    expect(endpointOf("y", PRICED)).toMatchObject({ price: "$0.001/call", free: false });
  });

  test("params are a JSON object, a list sent comma-separated", () => {
    expect(paramsOf('{"query":"a b","include_domains":["x.com","y.com"],"page":2}')).toEqual({ ok: true, params: [["query", "a b"], ["include_domains", "x.com,y.com"], ["page", "2"]] });
    expect(paramsOf("[1]").ok).toBe(false);
    expect(paramsOf("not json").ok).toBe(false);
    expect(paramsOf(undefined)).toEqual({ ok: true, params: [] });
  });

  test("a call is one --query per param, with path, method, body and await", () => {
    const args = callArgs({ id: "e.x", path: "v1/thing", params: [["q", "a b"]], method: "post", data: "{}", wait: true });
    expect(args).toEqual(["call", "e.x", "v1/thing", "--query", "q=a b", "--method", "POST", "--data", "{}", "--await"]);
    expect(shownCommand(args)).toBe("treg call e.x v1/thing --query 'q=a b' --method POST --data '{}' --await");
  });

  test("search runs the catalog by the job's words", async () => {
    const seen = fake(FREE);
    const out = await tregCommand.run(context().ctx, ["search", "web", "search", "--limit", "5"]);
    expect(out.code).toBe(0);
    expect(seen[0]).toEqual(["catalog", "search", "web", "search", "--limit", "5"]);
  });

  test("a free endpoint is called straight away", async () => {
    const seen = fake(FREE);
    const out = await tregCommand.run(context().ctx, ["call", "tinyfish.web.search", "--params", '{"query":"kick managers","domain_type":"web"}']);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("results");
    expect(seen.map((a) => a[0])).toEqual(["catalog", "call"]);
    expect(seen[1]).toEqual(["call", "tinyfish.web.search", "--query", "query=kick managers", "--query", "domain_type=web"]);
  });

  test("a priced endpoint is a dry run with its price unless live", async () => {
    const seen = fake(PRICED);
    const out = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--params", '{"user":"matthewsoldit"}']);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain("dry run, nothing called or spent");
    expect(out.stdout).toContain("$0.001/call");
    expect(seen.some((a) => a[0] === "call")).toBe(false);
  });

  test("a priced endpoint live without approvedBy is refused, and with it is called", async () => {
    fake(PRICED);
    const refused = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live"]);
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain("notApproved");
    const seen = fake(PRICED);
    const ran = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live", "--approvedBy", "matt"]);
    expect(ran.code).toBe(0);
    expect(seen.some((a) => a[0] === "call")).toBe(true);
  });

  test("an answer drops treg's raw copy, and maxItems, fields and where trim its lists", async () => {
    const posts = [
      { id: "1", text: "a", isReply: true, views: 9 },
      { id: "2", text: "b", isReply: false, views: 8 },
      { id: "3", text: "c", isReply: false, views: 7 },
      { id: "4", text: "d", isReply: false, views: 6 },
    ];
    const stdout = JSON.stringify({ output: { posts, next_cursor: "x" }, raw: { output: { data: { tweets: posts } } }, _treg: { charged_micro: 450 } });
    fake(PRICED, { ok: true, code: 0, stdout, stderr: "" });
    const plain = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live", "--approvedBy", "matt", "--json"]);
    const whole = JSON.parse(plain.stdout ?? "{}").answer;
    expect(whole.raw).toBeUndefined();
    expect(whole.output.posts).toHaveLength(4);
    fake(PRICED, { ok: true, code: 0, stdout, stderr: "" });
    const trimmed = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live", "--approvedBy", "matt", "--json", "--where", "isReply=false", "--maxItems", "2", "--fields", "id,text"]);
    const answer = JSON.parse(trimmed.stdout ?? "{}").answer;
    expect(answer.output.posts).toEqual([{ id: "2", text: "b" }, { id: "3", text: "c" }]);
    expect(answer.output.next_cursor).toBe("x");
    expect(answer._treg).toEqual({ charged_micro: 450 });
    fake(PRICED, { ok: true, code: 0, stdout, stderr: "" });
    const kept = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live", "--approvedBy", "matt", "--json", "--raw"]);
    expect(JSON.parse(kept.stdout ?? "{}").answer.raw).toBeDefined();
    fake(PRICED);
    const bad = await tregCommand.run(context().ctx, ["call", "tikhub.x.user-tweets", "--live", "--approvedBy", "matt", "--where", "isReply"]);
    expect(bad.stderr).toContain("tregTrimInvalid");
  });

  test("a failed run and bad params are refused with their codes", async () => {
    fake(FREE, { ok: false, code: 2, stdout: "", stderr: "402 balance empty" });
    const failed = await tregCommand.run(context().ctx, ["call", "tinyfish.web.search"]);
    expect(failed.stderr).toContain("tregFailed (exit 2): 402 balance empty");
    const bad = await tregCommand.run(context().ctx, ["call", "tinyfish.web.search", "--params", "[1]"]);
    expect(bad.stderr).toContain("tregParamsInvalid");
  });
});
