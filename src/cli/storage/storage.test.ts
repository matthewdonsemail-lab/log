import { describe, expect, test } from "bun:test";
import { appendEvent, db } from "../../inbox/store/index.ts";
import { storageCommand } from "./index.ts";

const context = () => {
  const err: string[] = [];
  return { err, ctx: { err: (line: string) => err.push(line), out: () => {} } as never };
};

describe("log storage", () => {
  test("verify says every typed table is what the events derive, and rebuild needs --apply", async () => {
    appendEvent({ platform: "discord", account: "storageCmd", conversationId: "c1", type: "message", with: "jd", text: "hi", payload: { id: "1" }, sourceAt: "2026-11-08T01:00:00Z" });
    const verified = await storageCommand.run(context().ctx, ["verify"]);
    expect(verified.code).toBe(0);
    expect(verified.stdout).toContain("Every typed table is what the events derive.");
    const dry = await storageCommand.run(context().ctx, ["rebuild"]);
    expect(dry.stdout).toContain("log storage rebuild:");
    expect(dry.stdout).toContain("Every typed table");
  });

  test("a row the events don't derive is reported, and rebuild --apply replaces it", async () => {
    db().exec("UPDATE messages SET text = 'tampered' WHERE chatId = 'discord:storageCmd:c1'");
    const verified = await storageCommand.run(context().ctx, ["verify", "--json"]);
    expect(verified.code).toBe(1);
    expect(JSON.parse(verified.stdout!).differs).toContain("messages");
    const rebuilt = await storageCommand.run(context().ctx, ["rebuild", "--apply"]);
    expect(rebuilt.code).toBe(0);
    expect((db().prepare("SELECT text FROM messages WHERE chatId = 'discord:storageCmd:c1'").get() as { text: string }).text).toBe("hi");
  });

  test("anything but verify or rebuild is refused with the usage", async () => {
    const out = await storageCommand.run(context().ctx, ["drop"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("say verify or rebuild");
  });
});
