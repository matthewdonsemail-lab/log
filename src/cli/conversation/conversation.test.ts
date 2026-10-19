import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { parseThreads } from "./index.ts";

async function run(argv: string[], twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n"), twenty };
}

const THREADS = [
  {
    facebookThreadId: "9001",
    buyerName: "Sam Buyer",
    listingTitle: "Rubbish Removal Galway",
    facebookListingId: "111",
    messages: [
      { direction: "inbound", body: "Is this still available?", sentAt: "2026-10-19T14:00:00.000Z", senderName: "Sam Buyer" },
      { direction: "outbound", body: "Yes, when suits?", sentAt: "2026-10-19T14:05:00.000Z", senderName: "Galway One" },
    ],
  },
  {
    facebookThreadId: "9002",
    buyerName: "Alex",
    listingTitle: "Something we never listed",
    messages: [{ direction: "inbound", body: "price?", sentAt: "2026-10-19T14:30:00.000Z", senderName: "Alex" }],
  },
];

function withFile<T>(content: unknown, use: (path: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), "logConversation"));
  const path = join(dir, "threads.json");
  writeFileSync(path, JSON.stringify(content));
  return use(path).finally(() => rmSync(dir, { recursive: true, force: true }));
}

describe("log conversation", () => {
  test("record stores scanned threads, ties them to listings, and a second record adds nothing", async () => {
    const twenty = marketplaceFixture();
    await withFile(THREADS, async (file) => {
      const first = await run(["conversation", "record", "--account", "galwayOne", "--file", file], twenty);
      expect(first.code).toBe(0);
      expect(first.err).toContain("conversation 1/2: thread 9001");
      expect(first.out).toContain("2 message(s) added, 0 already stored; listing liveOne (by facebookListingId); lead contacted");
      expect(first.out).toContain("listing not matched");
      const again = await run(["conversation", "record", "--account", "galwayOne", "--file", file], twenty);
      expect(again.out).toContain("0 message(s) added, 2 already stored");
    });
    const list = await run(["conversations", "--listing", "liveOne"], twenty);
    expect(list.out).toContain("1 conversation(s):");
    expect(list.out).toContain("Sam Buyer · Rubbish Removal Galway");
  });

  test("show, read, lead and link", async () => {
    const twenty = marketplaceFixture();
    await withFile(THREADS, (file) => run(["conversation", "record", "--account", "galwayOne", "--file", file], twenty));
    const [unmatched] = (twenty.rows.agencyConversations ?? []).filter((r) => r.facebookThreadId === "9002");
    const id = unmatched.id;

    const show = await run(["conversation", "show", id], twenty);
    expect(show.out).toContain("listing: not matched");
    expect(show.out).toContain("* Alex: price?");

    expect((await run(["conversation", "read", id], twenty)).out).toBe("Marked 1 message(s) read.");
    expect((await run(["conversation", "lead", id, "SPAM"], twenty)).out).toBe("Lead is now spam.");
    expect((await run(["conversation", "lead", id, "WHATEVER"], twenty)).code).toBe(1);

    // A listing on another account is refused; the account's own is linked.
    expect((await run(["conversation", "link", id, "--listing", "liveTwo"], twenty)).err).toContain("on another account");
    expect((await run(["conversation", "link", id, "--listing", "readyOne"], twenty)).out).toContain("Linked to listing readyOne");
    expect((await run(["conversations", "--listing", "readyOne", "--json"], twenty)).out).toContain('"leadStatus": "spam"');
  });

  test("a scan file must have a thread id, messages, and directions", () => {
    expect(parseThreads({ threads: THREADS })).toMatchObject({ ok: true });
    expect(parseThreads([{ messages: [] }])).toEqual({ ok: false, error: "thread 1 has no facebookThreadId" });
    expect(parseThreads({ facebookThreadId: "1", messages: [{ direction: "sideways", body: "x" }] })).toMatchObject({ ok: false });
  });

  test("unknown actions and missing ids print the usage", async () => {
    const result = await run(["conversation", "delete", "x"]);
    expect(result.code).toBe(1);
    expect(result.err).toContain("Usage: log conversation show <id>");
  });
});
