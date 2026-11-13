import { describe, expect, test } from "bun:test";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { toolRunner } from "../../cli/runtime/index.ts";
import { runCli } from "../../cli/runner/index.ts";
import { refuse, refuseInput, resultCodeOf } from "../../cli/runner/helpers/index.ts";
import { ERROR_CATALOG } from "../../errors/catalog/index.ts";
import type { ErrorCode } from "../../errors/catalog/index.ts";
import { runToolCall } from "./index.ts";
import { TOOL_RESULT_SCHEMA } from "./types.ts";

const noBrowsers = () => [];
const call = (name: string, input: Record<string, unknown>) => runToolCall(name, input, { out: () => {}, err: () => {} }, () => {}, noBrowsers, undefined, false);
const shape = (result: CallToolResult) => result.structuredContent as Record<string, unknown>;

const PLATFORM_NAMES = /\b(X|twitter|tweet|discord|slack|instagram|reddit|linkedin|facebook|marketplace)\b/i;
const SHARED: readonly ErrorCode[] = ["limitInvalid", "secondsInvalid", "mediaInvalid", "crashed", "inputInvalid", "commandFailed"];

describe("one result envelope", () => {
  test("code, platform and capability are required fields of every tool result", () => {
    for (const field of ["code", "platform", "capability"]) {
      expect(TOOL_RESULT_SCHEMA.required as readonly string[]).toContain(field);
      expect(field in TOOL_RESULT_SCHEMA.properties).toBe(true);
    }
  });

  test("a guard refusal carries its code as a field, with the tool's platform and capability", async () => {
    expect(shape(await call("facebookCheck", {}))).toMatchObject({ exit: 1, ok: false, code: "inputInvalid", platform: "facebook", capability: "check" });
    expect(shape(await call("discordSendLive", { account: "fakeGuild", channel: "1", text: "hi", approvedBy: "fakeOwner" }))).toMatchObject({ code: "liveNotConfirmed", platform: "discord", capability: "send" });
    expect(shape(await call("noSuchTool", {}))).toMatchObject({ code: "toolUnknown", platform: null, capability: null });
    expect(shape(await call("login", {}))).toMatchObject({ code: "terminalOnly" });
  });

  test("a refusal inside the command reaches the result as its code", async () => {
    const refused = shape(await call("errors", { code: "noSuchCode" }));
    expect(refused).toMatchObject({ exit: 1, code: "inputInvalid", platform: null, capability: "errors" });
    const done = shape(await call("errors", { code: "crashed" }));
    expect(done).toMatchObject({ exit: 0, ok: true, code: null });
  });

  test("runCli reports the refusing command's catalog code, and commandFailed when it gave none", async () => {
    const codes: string[] = [];
    const quiet = { out: () => {}, err: () => {}, refused: (code: string) => codes.push(code) };
    await runCli(["discord", "watch", "--account", "fakeGuild", "--seconds", "3"], quiet);
    await runCli(["discord", "watch", "--account", "fakeGuild", "--seconds", "soon"], quiet);
    await runCli(["discord", "watch", "--account", "fakeGuild", "--bogus"], quiet);
    await runCli(["noSuchCommand"], quiet);
    expect(codes).toEqual(["secondsInvalid", "secondsInvalid", "inputInvalid", "toolUnknown"]);
    expect(resultCodeOf({ code: 1, stderr: "something went wrong" })).toBe("commandFailed");
    expect(resultCodeOf({ code: 0, stdout: "fine" })).toBeNull();
    expect(refuse("x", "accountBusy").error).toBe("accountBusy");
    expect(refuseInput("x", "limitInvalid: --limit got 0").error).toBe("limitInvalid");
    expect(refuseInput("x", 'unknown option "--bogus"').error).toBe("inputInvalid");
  });

  test("the hosted relay forwards the refusal's code instead of toolFailed", async () => {
    const authority = { teamId: "fakeTeam", actorUserId: "fakeActor", grantId: null } as unknown as Parameters<ReturnType<typeof toolRunner>>[2];
    const run = toolRunner(async () => ({ isError: true, content: [{ type: "text", text: "refused" }], structuredContent: { exit: 1, ok: false, code: "secondsInvalid", platform: "discord", capability: "watch", stderr: "log discord watch: secondsInvalid" } }));
    const answer = await run("discordWatch", { account: "fakeGuild", seconds: 3 }, authority);
    expect(answer.state).toBe("failed");
    expect(answer.error?.code).toBe("secondsInvalid");
    expect((answer.result as Record<string, unknown>).platform).toBe("discord");
  });
});

describe("shared error codes name no platform", () => {
  test("their meaning and action read the same on every platform", () => {
    for (const code of SHARED) {
      const entry = ERROR_CATALOG[code];
      expect(`${entry.meaning} ${entry.action}`, code).not.toMatch(PLATFORM_NAMES);
    }
  });

  test("no tool-layer code names a platform", () => {
    for (const [code, entry] of Object.entries(ERROR_CATALOG)) {
      if (entry.layer === "tool") expect(`${entry.meaning} ${entry.action}`, code).not.toMatch(PLATFORM_NAMES);
    }
  });
});
