import { describe, expect, test } from "bun:test";
import { PAGE_STATES, refOf, RESOLVE_CALLS } from "../../browser/flow/helpers/pageState.ts";
import { browserView } from "../../browser/inspect/index.ts";
import type { BrowserAt } from "../../browser/inspect/index.ts";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { browserLines, runToolCall, savedFlows, toolsFromCommands, toolsFromFlows } from "./index.ts";

const CHECKPOINT = "https://www.facebook.com/checkpoint/1501092823525282/";
const at = (url: string, text: string, extra: Partial<BrowserAt> = {}): BrowserAt => ({ account: "bethlehem", step: "04_snapshot", url, text, failed: null, ...extra });

describe("where every open browser is, in every tool result (rules 54-55)", () => {
  test("a checkpoint's first page resolves with a live click on its Continue, by the ref in the snapshot", () => {
    const view = browserView(at(CHECKPOINT, "- generic [ref=e62]: Fitri, confirm that you're human to use your account\n- generic [ref=e69]: Continue"));
    expect(view.state?.id).toBe("checkpointStart");
    expect(view.next).toEqual({ tool: "inspectDoLive", input: { account: "bethlehem", action: "click", values: ["e69"], confirmLive: true } });
    expect(view.needsMatt).toBeNull();
  });

  test("a video selfie is matt's: no next, needsMatt says so", () => {
    const view = browserView(at(CHECKPOINT, "- generic [ref=e130]: Confirm that you're a real person with a video selfie"));
    expect(view.state).toMatchObject({ id: "videoSelfie", person: true });
    expect(view.next).toBeNull();
    expect(view.needsMatt).toContain("video selfie");
  });

  test("Messenger's Create PIN runs the recorded flow when the PIN is in Twenty, and is matt's when it isn't", () => {
    const text = "- heading \"Create a PIN to access your chats on any device\" [ref=e3]";
    expect(browserView(at("https://www.facebook.com/messages/", text, { messengerPin: true })).next).toEqual({ tool: "flowMessengerPinCreateLive", input: { account: "bethlehem", confirmLive: true } });
    const without = browserView(at("https://www.facebook.com/messages/", text));
    expect(without.next).toBeNull();
    expect(without.needsMatt).toContain("messenger pin");
  });

  test("a failed step with no known state is a snapshot first; a clear page has nothing to do", () => {
    expect(browserView(at("https://www.facebook.com/marketplace/", "- main [ref=e1]", { failed: "timeout" })).next).toEqual({ tool: "inspectDo", input: { account: "bethlehem", action: "snapshot" } });
    expect(browserView(at("https://www.facebook.com/marketplace/", "- main [ref=e1]"))).toMatchObject({ state: null, next: null, needsMatt: null });
  });

  test("a label without a ref of its own takes its nearest parent's", () => {
    expect(refOf("- button \"Next\" [ref=e9]:\n  - text: Update", /(:\s*|")Update"?\s*$/)).toBe("e9");
    expect(refOf("- main", /Update/)).toBeNull();
  });

  test("every state a log-cli resolver clears has a resolver call, and every call is a real MCP tool", () => {
    const tools = new Set([...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())].map((t) => t.name));
    for (const state of PAGE_STATES) {
      expect(Object.keys(RESOLVE_CALLS)).toContain(state.id);
      const call = RESOLVE_CALLS[state.id]({ account: "a", text: "- generic [ref=e1]: Continue\n- generic [ref=e2]: Update\n- generic [ref=e3]: Dismiss", messengerPin: true });
      if (state.person) expect(call).toBeNull();
      else expect(tools.has(call!.tool)).toBe(true);
    }
  });

  test("the result's first lines say it, and its structured part carries it", async () => {
    const views = [browserView(at(CHECKPOINT, "- generic [ref=e62]: confirm that you're human to use your account\n- generic [ref=e69]: Continue"))];
    expect(browserLines(views)[0]).toContain("page state checkpointStart");
    expect(browserLines(views)[1]).toContain("Next: call `inspectDoLive`");
    const result = await runToolCall("errors", { code: "locationNotSet" }, { twenty: marketplaceFixture() }, () => {}, () => views);
    const text = (result.content as { text: string }[])[0].text;
    expect(text.split("\n")[0]).toContain("bethlehem on " + CHECKPOINT);
    expect(result.structuredContent).toMatchObject({ next: { tool: "inspectDoLive" }, needsMatt: null, browsers: [{ account: "bethlehem", state: { id: "checkpointStart" } }] });
    const refused = await runToolCall("check", {}, {}, () => {}, () => views);
    expect(refused.isError).toBe(true);
    expect(refused.structuredContent).toMatchObject({ next: { tool: "inspectDoLive" } });
  });

  test("progress carries every streamed line with its time", async () => {
    const result = await runToolCall("accounts", {}, { twenty: marketplaceFixture() }, () => {}, () => []);
    const progress = (result.structuredContent as { progress: { at: string; source: string; line: string }[] }).progress;
    expect(progress.length).toBeGreaterThan(0);
    for (const p of progress) expect(Number.isNaN(Date.parse(p.at))).toBe(false);
  });
});
