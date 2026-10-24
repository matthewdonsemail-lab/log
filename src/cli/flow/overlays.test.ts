import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { overlayOf } from "../../browser/flow/index.ts";
import { pageStateOf, resolveCallOf } from "../../browser/flow/helpers/pageState.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import type { CurrentInspect, InspectAction, InspectStepResult } from "../../browser/inspect/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { clearOverlays, runFlowInSession } from "./helpers/index.ts";

const fixture = (name: string) => readFileSync(join(import.meta.dir, "..", "..", "..", "python", "fixtures", "controls", `${name}.yml`), "utf8");
const PROFILE = "https://www.facebook.com/profile.php";
const NOTICE = fixture("browserNotificationsNotice");
const PAST = fixture("pastNoticeDialog");
const CLEAN = '- main [ref=e99]:\n  - button "Profile picture actions" [ref=e133] [cursor=pointer]:';
const HAZLETON = { uid: "61593939852820", homeCity: "Hazleton", homeCountry: "US" };
const current: CurrentInspect = { account: "61593939852820", runDir: "x", commandsPath: "x", repliesPath: "x", startedAt: "2026-10-24T21:15:41Z" };

function scripted(pages: string[], clearAnswer: boolean | null = true) {
  const root = mkdtempSync(join(tmpdir(), "overlays"));
  const sent: string[] = [];
  let shown = 0;
  const sendInspect = async (_c: CurrentInspect, action: InspectAction, args: string[], _t: number, expect?: { name: string }): Promise<InspectStepResult> => {
    sent.push([action, ...args, ...(expect ? [`waits ${expect.name}`] : [])].join(" "));
    const folder = join(root, String(sent.length));
    mkdirSync(folder);
    if (action === "pageText") return { ok: true, url: PROFILE, text: pages[Math.min(shown, pages.length - 1)], folder } as InspectStepResult;
    if (action === "press") {
      const closing = pages[shown];
      shown++;
      const exchanges = closing === PAST && clearAnswer !== null ? [{ offsetMs: 0, kind: "api", name: "useAccountStatusClearEnrollmentEntryPointActionMutation", method: "POST", host: "www.facebook.com", path: "/api/graphql/", status: 200, ms: 1280, sent: {}, answer: { data: { xfb_ixt_gateway_clear_flow: clearAnswer } }, errors: [], known: true }] : [];
      writeFileSync(join(folder, "exchanges.json"), JSON.stringify(exchanges));
      return { ok: true, url: PROFILE, folder } as InspectStepResult;
    }
    writeFileSync(join(folder, "exchanges.json"), "[]");
    return { ok: true, url: PROFILE, folder } as InspectStepResult;
  };
  const context = { sendInspect, err: () => {} } as unknown as CommandContext;
  return { context, sent };
}

describe("the two overlays on Hazleton's profile are known states (rule 54)", () => {
  test("the browser-notifications notice and an ended 'What happened' notice are named, each resolved with Escape", () => {
    expect(pageStateOf(PROFILE, NOTICE)).toMatchObject({ id: "browserNotificationsNotice", person: false });
    expect(pageStateOf(PROFILE, PAST)).toMatchObject({ id: "pastNoticeDialog", person: false });
    for (const text of [NOTICE, PAST]) expect(resolveCallOf(pageStateOf(PROFILE, text)!, { account: "a", text })).toEqual({ tool: "inspectDoLive", input: { account: "a", action: "press", values: ["Escape"], confirmLive: true } });
  });

  test("a 'What happened' that hasn't ended is not cleared: it stays unknown, for SubQ to read", () => {
    const active = PAST.replace(/Ended on Sep 10, 2026/g, "Your account is limited");
    expect(pageStateOf(PROFILE, active)).toBeNull();
    expect(overlayOf(PROFILE, active)).toBeNull();
    expect(overlayOf(PROFILE, CLEAN)).toBeNull();
  });
});

describe("a flow clears them with Escape before its first click, each checked (rule 79)", () => {
  test("the notice, then the past notice as they came on Hazleton: two Escapes, the second waits on its clear call", async () => {
    const { context, sent } = scripted([NOTICE, PAST, CLEAN]);
    expect(await clearOverlays(context, current, HAZLETON)).toBeNull();
    expect(sent).toEqual(["pageText", "press Escape", "pageText", "press Escape waits useAccountStatusClearEnrollmentEntryPointActionMutation", "pageText"]);
  });

  test("the past notice's clear call must answer true, and an overlay still there after Escape stops the flow", async () => {
    expect(await clearOverlays(scripted([PAST, CLEAN], false).context, current, HAZLETON)).toContain("xfb_ixt_gateway_clear_flow");
    expect(await clearOverlays(scripted([PAST, CLEAN], null).context, current, HAZLETON)).toContain("useAccountStatusClearEnrollmentEntryPointActionMutation");
    const stuck = scripted([NOTICE, NOTICE]);
    stuck.context.sendInspect = (async (c: CurrentInspect, action: InspectAction, args: string[], t: number, e?: { name: string }) => {
      const reply = await scripted([NOTICE]).context.sendInspect(c, action, args, t, e);
      stuck.sent.push(action);
      return reply;
    }) as CommandContext["sendInspect"];
    expect(await clearOverlays(stuck.context, current, HAZLETON)).toBe("browserNotificationsNotice is still over the page after Escape");
  });

  test("the run checks once, right before its first click, and a blocked one fails that step with overlayNotCleared", async () => {
    const flow: FlowDefinition = {
      name: "picture",
      summary: "",
      params: [],
      steps: [
        { id: "s01_gotome", action: "goto", url: "https://www.facebook.com/me", recorded: { step: "", ms: null, reaEvidenceId: null, requests: [] } },
        { id: "s02_clickProfilePictureActions", action: "click", role: "button", name: "Profile picture actions", recorded: { step: "", ms: null, reaEvidenceId: null, requests: [] } },
        { id: "s03_clickChooseProfilePicture", action: "click", role: "menuitem", name: "Choose profile picture", recorded: { step: "", ms: null, reaEvidenceId: null, requests: [] } }
      ],
      source: { runDir: "", account: "", builtAt: "" }
    };
    const clean = scripted([NOTICE, CLEAN]);
    expect((await runFlowInSession(clean.context, current, flow, {}, { account: HAZLETON })).result).toBe("done");
    expect(clean.sent).toEqual(["goto https://www.facebook.com/me", "pageText", "press Escape", "pageText", "clickRole button Profile picture actions", "clickRole menuitem Choose profile picture"]);
    const blocked = scripted([PAST, CLEAN], false);
    const out = await runFlowInSession(blocked.context, current, flow, {}, { account: HAZLETON });
    expect(out).toMatchObject({ result: "failed", failedAt: "s02_clickProfilePictureActions" });
    expect(out.steps.at(-1)).toMatchObject({ ok: false, issue: "overlayNotCleared" });
  });
});
