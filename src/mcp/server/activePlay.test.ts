import { afterEach, describe, expect, test } from "bun:test";
import { activePlay, clearActivePlay, playFooter, playRefusal, readUseCase, setActivePlay, stepsOf, withPlayFooter } from "./helpers/index.ts";

afterEach(() => clearActivePlay());

describe("the active play", () => {
  test("a use case page's steps table is read step by step with its tools", () => {
    const steps = stepsOf(readUseCase("twitter/getTheAction")!);
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0].n).toBe("1");
    expect(steps.some((s) => s.tools.includes("twitterQueueRunLive"))).toBe(true);
  });

  test("loading a use case makes it the play, and each answer names its step and the next", () => {
    setActivePlay("twitter/getTheAction", readUseCase("twitter/getTheAction")!);
    expect(activePlay()?.id).toBe("twitter/getTheAction");
    const footer = playFooter("twitterDms");
    expect(footer).toContain(">>> PLAY twitter/getTheAction");
    expect(footer).toContain("This call is step 1");
    expect(footer).toContain("Next, step");
  });

  test("a tool the play doesn't use is named as off the play", () => {
    setActivePlay("twitter/getTheAction", readUseCase("twitter/getTheAction")!);
    expect(playFooter("memelordSearch")).toContain("isn't a step of this play");
  });

  test("a send as matt is refused while no play is loaded, naming the plays that use it", () => {
    const refusal = playRefusal("twitterDmLive", ["twitter/followUps", "twitter/networkMaxing"]);
    expect(refusal).toContain("playMissing");
    expect(refusal).toContain('getGuide({ useCase: "twitter/networkMaxing" })');
  });

  test("a send goes ahead once a play is loaded, and reads are never refused", () => {
    expect(playRefusal("twitterDms", [])).toBeNull();
    setActivePlay("twitter/followUps", readUseCase("twitter/followUps")!);
    expect(playRefusal("twitterDmLive", [])).toBeNull();
  });

  test("the footer is added to the tool's own answer", () => {
    setActivePlay("twitter/getTheAction", readUseCase("twitter/getTheAction")!);
    const result = withPlayFooter("twitterDms", { content: [{ type: "text", text: "the inbox" }] });
    expect((result.content[0] as { text: string }).text).toStartWith("the inbox\n\n>>> PLAY");
  });
});
