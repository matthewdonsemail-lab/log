import { describe, expect, test } from "bun:test";
import { loadFlow } from "../../browser/flow/index.ts";
import { flowArgv, flowOfTool, runToolCall, toolsFromFlows } from "./index.ts";

const flow = loadFlow("profileSetup")!;

describe("flows as MCP tools (rule 31)", () => {
  test("profileSetup is a dry tool flowProfileSetup and a live one flowProfileSetupLive, with its params by name", () => {
    const [dry, live] = toolsFromFlows([flow]);
    expect(dry.name).toBe("flowProfileSetup");
    expect(Object.keys(dry.inputSchema.properties)).toEqual(["account", "profilePhoto", "coverPhoto", "firstName", "lastName", "bypass", "now", "proxyMs", "confirmBypass"]);
    expect(dry.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    expect(live.name).toBe("flowProfileSetupLive");
    expect(Object.keys(live.inputSchema.properties)).toEqual(["account", "profilePhoto", "coverPhoto", "firstName", "lastName", "bypass", "now", "proxyMs", "confirmLive", "confirmBypass"]);
    expect(live.inputSchema.required).toContain("confirmLive");
    expect(live.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true, openWorldHint: true });
    expect(flowOfTool([flow], "flowProfileSetupLive")).toEqual({ flow, live: true });
  });

  test("a call becomes log flow run with --set per param, and --live only from the live tool", () => {
    const input = { account: "a", profilePhoto: "p.jpg", coverPhoto: "c.jpg", firstName: "Bethlehem", lastName: "Trash" };
    expect(flowArgv(flow, input, true)).toEqual({
      ok: true,
      live: true,
      argv: ["flow", "run", "profileSetup", "--account", "a", "--set", "profilePhoto=p.jpg", "--set", "coverPhoto=c.jpg", "--set", "firstName=Bethlehem", "--set", "lastName=Trash", "--live"],
    });
    expect(flowArgv(flow, input)).toMatchObject({ ok: true, live: false });
    expect(flowArgv(flow, { ...input, live: true })).toMatchObject({ ok: false });
    expect(flowArgv(flow, { account: "a" })).toMatchObject({ ok: false });
  });

  test("the live tool without confirmLive never runs; the dry one lists the steps and opens nothing", async () => {
    const input = { account: "galwayOne", profilePhoto: "p.jpg", coverPhoto: "c.jpg", firstName: "Galway", lastName: "Trash" };
    const refused = await runToolCall("flowProfileSetupLive", input as never);
    expect(refused.isError).toBe(true);
    const dry = await runToolCall("flowProfileSetup", input as never);
    const text = (dry.content as { text: string }[]).map((c) => c.text).join("\n");
    expect(text).toContain("dry run: nothing opens");
    expect(text).toContain('upload button "Upload Photo"');
  });
});
