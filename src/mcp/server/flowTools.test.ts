import { describe, expect, test } from "bun:test";
import { loadFlow } from "../../camofox/flow/index.ts";
import { flowArgv, runToolCall, toolsFromFlows } from "./index.ts";

const flow = loadFlow("profileSetup")!;

describe("flows as MCP tools (rule 31)", () => {
  test("profileSetup is the tool flowProfileSetup, with its params by name", () => {
    const [tool] = toolsFromFlows([flow]);
    expect(tool.name).toBe("flowProfileSetup");
    expect(Object.keys(tool.inputSchema.properties)).toEqual(["account", "profilePhoto", "coverPhoto", "firstName", "lastName", "live", "bypass", "now", "proxyMs", "confirmLive", "confirmBypass"]);
  });

  test("a call becomes log flow run with --set per param", () => {
    expect(flowArgv(flow, { account: "a", profilePhoto: "p.jpg", coverPhoto: "c.jpg", firstName: "Bethlehem", lastName: "Trash", live: true })).toEqual({
      ok: true,
      live: true,
      argv: ["flow", "run", "profileSetup", "--account", "a", "--set", "profilePhoto=p.jpg", "--set", "coverPhoto=c.jpg", "--set", "firstName=Bethlehem", "--set", "lastName=Trash", "--live"],
    });
    expect(flowArgv(flow, { account: "a" })).toMatchObject({ ok: false });
  });

  test("live without confirmLive never runs; without live it lists the steps and opens nothing", async () => {
    const input = { account: "galwayOne", profilePhoto: "p.jpg", coverPhoto: "c.jpg", firstName: "Galway", lastName: "Trash" };
    const refused = await runToolCall("flowProfileSetup", { ...input, live: true } as never);
    expect(refused.isError).toBe(true);
    const dry = await runToolCall("flowProfileSetup", input as never);
    const text = (dry.content as { text: string }[]).map((c) => c.text).join("\n");
    expect(text).toContain("dry run: nothing opens");
    expect(text).toContain('upload button "Upload Photo"');
  });
});
