import { afterEach, describe, expect, test } from "bun:test";
import { COMMANDS } from "../../cli/runner/index.ts";
import { actingAsOwnerTools, activePlay, clearActivePlay, gatedToolOf, listUseCases, namedByPlay, PLAY_GATED_ON_MAIN, playGateMode, stepToolsOf, unnamedActingTools, guideAnswer, hostedPlayOwner, mintPlayHandle, PLAY_HANDLE_PATTERN, PLAY_IDLE_MS, playCovers, playFooter, playRefusal, playRequiredTools, playScope, processPlayScope, readUseCase, setActivePlay, stepsOf, toolsFromCommands, toolsFromFlows, withPlayFooter } from "./helpers/index.ts";
import { runToolCall, savedFlows, withCallFooter } from "./index.ts";

afterEach(() => clearActivePlay());

const page = (id: string) => readUseCase(id)!;
const noBrowsers = () => [];

describe("the active play", () => {
  test("a use case page's steps table is read step by step with its tools", () => {
    const steps = stepsOf(page("twitter/getTheAction"));
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0].n).toBe("1");
    expect(steps.some((s) => s.tools.includes("twitterQueueRunLive"))).toBe(true);
  });

  test("both Facebook plays have steps the code can read", () => {
    expect(stepsOf(page("facebook/groups")).map((s) => s.tools[0])).toEqual(["facebookJoin", "facebookReadGroup", "facebookPoll", "facebookReadMembers"]);
    const listings = stepsOf(page("facebook/marketplaceListings"));
    expect(listings.length).toBe(15);
    expect(listings.some((s) => s.tools.includes("flowMarketplaceListingPublishLive"))).toBe(true);
  });

  test("loading a use case makes it the play, and each answer names its step and the next", () => {
    setActivePlay("twitter/getTheAction", page("twitter/getTheAction"));
    expect(activePlay()?.id).toBe("twitter/getTheAction");
    const footer = playFooter("twitterDms");
    expect(footer).toContain(">>> PLAY twitter/getTheAction");
    expect(footer).toContain("This call is step 1");
    expect(footer).toContain("Next, step");
  });

  test("a tool the play doesn't use is named as off the play", () => {
    setActivePlay("twitter/getTheAction", page("twitter/getTheAction"));
    expect(playFooter("memelordSearch")).toContain("isn't a step of this play");
  });

  test("the footer is added to the tool's own answer and its structured result", () => {
    const play = setActivePlay("twitter/getTheAction", page("twitter/getTheAction"));
    const result = withPlayFooter("twitterDms", { content: [{ type: "text", text: "the inbox" }], structuredContent: { exit: 0 } });
    expect((result.content[0] as { text: string }).text).toStartWith("the inbox\n\n>>> PLAY");
    expect((result.structuredContent as { play: { id: string; handle: string } }).play).toMatchObject({ id: "twitter/getTheAction", handle: play.handle });
  });
});

describe("the play is kept per handle", () => {
  test("each caller has its own play, and a minted handle is unguessable", () => {
    const a = playScope("http:a");
    const b = playScope("http:b");
    expect(a.handle).not.toBe(b.handle);
    expect(PLAY_HANDLE_PATTERN.test(a.handle)).toBe(true);
    expect(playScope("http:a").handle).toBe(a.handle);
    setActivePlay("discord/channelReply", page("discord/channelReply"), { scope: a });
    expect(activePlay(a)?.id).toBe("discord/channelReply");
    expect(activePlay(b)).toBeNull();
    expect(activePlay(processPlayScope())).toBeNull();
  });

  test("a handle passed back selects that play, and another caller's handle is ignored", () => {
    const a = playScope("hosted:team:one");
    const other = setActivePlay("twitter/followUps", page("twitter/followUps"), { scope: playScope("hosted:team:two") });
    const own = setActivePlay("slack/dmReply", page("slack/dmReply"), { scope: a, handle: mintPlayHandle() });
    expect(own.handle).toBe(a.handle);
    expect(activePlay(a, other.handle)?.id).toBe("slack/dmReply");
  });

  test("loading a new play replaces the old one for that handle", () => {
    const scope = playScope("http:replace");
    setActivePlay("twitter/followUps", page("twitter/followUps"), { scope });
    setActivePlay("discord/channelReply", page("discord/channelReply"), { scope });
    expect(activePlay(scope)?.id).toBe("discord/channelReply");
  });

  test("a play expires after its idle time", () => {
    const scope = playScope("http:expiry");
    const loaded = new Date("2026-11-14T10:00:00Z");
    setActivePlay("twitter/followUps", page("twitter/followUps"), { scope, now: loaded });
    expect(activePlay(scope, null, new Date(loaded.getTime() + PLAY_IDLE_MS - 1000))?.id).toBe("twitter/followUps");
    expect(activePlay(scope, null, new Date(loaded.getTime() + PLAY_IDLE_MS + 1000))).toBeNull();
    expect(activePlay(scope)).toBeNull();
  });

  test("getGuide clears the play", () => {
    const scope = playScope("http:clear");
    guideAnswer({ useCase: "twitter/followUps" }, scope);
    expect(activePlay(scope)?.id).toBe("twitter/followUps");
    expect(guideAnswer({ clearPlay: true }, scope).text).toContain("is cleared");
    expect(activePlay(scope)).toBeNull();
  });

  test("hosted callers are told apart by team and actor", () => {
    expect(hostedPlayOwner({ teamId: "t1", actorUserId: "u1", grantId: null })).toBe("hosted:t1:u1");
    expect(hostedPlayOwner({ teamId: "t1", actorUserId: null, grantId: "g1" })).toBe("hosted:t1:g1");
  });
});

describe("a play unlocks only the sends it covers", () => {
  const flows = savedFlows();
  const pages = listUseCases();
  const required = playRequiredTools(COMMANDS, flows, pages);
  const acting = actingAsOwnerTools(COMMANDS, flows);
  const named = stepToolsOf(pages);
  const UNNAMED = ["discordDeleteLive", "flowDeletePostLive", "flowPostCommentLive", "flowProfilePhotoPostLive", "flowProfilePostLive", "redditPostLive", "redditReplyLive", "redditVoteLive", "twitterListAddLive", "twitterListCreateLive", "twitterQuoteLive", "twitterRepostLive", "twitterVoiceLive"];

  test("acting as the owner is derived from each tool's effect", () => {
    const ungatedOnMain = ["twitterPostLive", "twitterLikeLive", "twitterRepostLive", "twitterFollowLive", "twitterReactLive", "redditPostLive", "redditReplyLive", "discordDeleteLive", "discordReactLive", "discordVoiceLive", "slackReactLive", "slackVoiceLive", "instagramReactLive", "instagramVoiceLive", "flowPostCommentLive", "flowProfilePostLive", "flowProfilePhotoPostLive", "flowDeletePostLive"];
    for (const tool of [...PLAY_GATED_ON_MAIN, ...ungatedOnMain]) expect(acting.has(tool)).toBe(true);
    for (const tool of ["twitterDm", "twitterDms", "discordRead", "tregCallLive", "inspectDoLive", "flowGroupTabsLive", "warmupLive"]) expect(acting.has(tool)).toBe(false);
  });

  test("the acting tools no use case names are exported, and are what this fixture expects", () => {
    expect(unnamedActingTools(COMMANDS, flows, pages)).toEqual(UNNAMED);
    for (const tool of UNNAMED) expect(namedByPlay(tool, named)).toBe(false);
  });

  test("an acting tool a use case names needs a play that covers it; one no use case names is not play-gated", () => {
    expect(playGateMode("discordSendLive", acting, named)).toBe("covered");
    expect(playGateMode("twitterPostLive", acting, named)).toBe("covered");
    expect(playGateMode("discordDeleteLive", acting, named)).toBe("none");
    expect(playGateMode("redditPostLive", acting, named)).toBe("none");
    expect(playRefusal("discordDeleteLive", { mode: "none", useCases: [], play: null })).toBeNull();
    expect(required.has("discordDeleteLive")).toBe(false);
    expect(required.has("discordSendLive")).toBe(true);
  });

  test("the eight tools gated on main are never less gated", () => {
    expect(PLAY_GATED_ON_MAIN.size).toBe(8);
    for (const tool of PLAY_GATED_ON_MAIN) {
      expect(required.has(tool)).toBe(true);
      expect(playGateMode(tool, acting, named)).not.toBe("none");
      expect(playRefusal(tool, { mode: playGateMode(tool, acting, named), useCases: [], play: null })).toStartWith("playMissing");
    }
    expect(playGateMode("twitterQuoteLive", acting, named)).toBe("anyPlay");
    expect(playGateMode("twitterVoiceLive", acting, named)).toBe("anyPlay");
    const discord = setActivePlay("discord/channelReply", page("discord/channelReply"));
    expect(playRefusal("twitterQuoteLive", { mode: "anyPlay", useCases: [], play: discord })).toBeNull();
  });

  test("every acting tool takes a play handle in its schema", () => {
    const tools = [...toolsFromCommands(COMMANDS), ...toolsFromFlows(flows)];
    for (const tool of tools) expect(Boolean((tool.inputSchema.properties as Record<string, unknown>).playHandle)).toBe(acting.has(tool.name));
  });

  test("a send as the owner is refused while no play is loaded, naming the plays that use it", () => {
    const refusal = playRefusal("twitterDmLive", { mode: "covered", useCases: ["twitter/followUps", "twitter/networkMaxing"], play: null });
    expect(refusal).toContain("playMissing");
    expect(refusal).toContain('getGuide({ useCase: "twitter/networkMaxing" })');
    expect(refusal).not.toContain("matt");
  });

  test("a play for one platform doesn't unlock a send on another", () => {
    const discord = setActivePlay("discord/channelReply", page("discord/channelReply"));
    expect(playCovers(discord, "discordSendLive")).toBe(true);
    expect(playCovers(discord, "twitterDmLive")).toBe(false);
    expect(playRefusal("twitterDmLive", { mode: "covered", useCases: [], play: discord })).toStartWith("playNotCovering");
    expect(playRefusal("discordSendLive", { mode: "covered", useCases: [], play: discord })).toBeNull();
    expect(playRefusal("discordReactLive", { mode: "covered", useCases: [], play: discord })).toStartWith("playNotCovering");
  });

  test("naming the dry run covers its live twin, and reads are never refused", () => {
    const followUps = setActivePlay("twitter/followUps", page("twitter/followUps"));
    expect(playCovers(followUps, "twitterDmLive")).toBe(true);
    expect(playRefusal("twitterDms", { mode: "none", useCases: [], play: null })).toBeNull();
  });

  test("a hand-run flowLive of an acting flow is gated as that flow's tool", () => {
    expect(gatedToolOf("flowLive", { args: ["run", "postComment", "--account", "a"] }, savedFlows())).toBe("flowPostCommentLive");
    expect(gatedToolOf("flowLive", { args: ["run", "groupTabs", "--account", "a"] }, savedFlows())).toBe("flowLive");
  });

  test("runToolCall refuses an X DM under a Discord play, before anything runs", async () => {
    const scope = playScope("http:gate");
    guideAnswer({ useCase: "discord/channelReply" }, scope);
    const result = await runToolCall("twitterDmLive", { account: "fakeBird", userId: "100", text: "hi", confirmLive: true }, {}, () => {}, noBrowsers, undefined, false, scope);
    expect(result.isError).toBe(true);
    expect((result.structuredContent as { stderr: string }).stderr).toStartWith("playNotCovering");
    const none = await runToolCall("twitterDmLive", { account: "fakeBird", userId: "100", text: "hi", confirmLive: true }, {}, () => {}, noBrowsers, undefined, false, playScope("http:empty"));
    expect((none.structuredContent as { stderr: string }).stderr).toStartWith("playMissing");
  });

  test("a play handle passed as a tool argument selects the play it names", async () => {
    const scope = playScope("http:handles");
    const play = setActivePlay("discord/channelReply", page("discord/channelReply"), { scope, handle: mintPlayHandle() });
    const result = await runToolCall("twitterDmLive", { account: "fakeBird", userId: "100", text: "hi", confirmLive: true, playHandle: play.handle }, {}, () => {}, noBrowsers, undefined, false, scope);
    expect((result.structuredContent as { stderr: string }).stderr).toContain("discord/channelReply");
  });

  test("the call footer comes from the caller's own play", () => {
    const scope = playScope("http:footer");
    setActivePlay("twitter/getTheAction", page("twitter/getTheAction"), { scope });
    const footed = withCallFooter("twitterDms", undefined, { content: [{ type: "text", text: "x" }], structuredContent: { exit: 0 } }, scope);
    expect((footed.content[0] as { text: string }).text).toContain(">>> PLAY twitter/getTheAction");
    const other = withCallFooter("twitterDms", undefined, { content: [{ type: "text", text: "x" }] }, playScope("http:nofooter"));
    expect((other.content[0] as { text: string }).text).toBe("x");
  });
});

describe("a closed HTTP session drops its plays", () => {
  test("forgetting a caller removes its play and its default handle", async () => {
    const { forgetPlayScope } = await import("./helpers/index.ts");
    const first = playScope("http:closing");
    setActivePlay("twitter/followUps", page("twitter/followUps"), { scope: first });
    forgetPlayScope("http:closing");
    expect(activePlay(first)).toBeNull();
    expect(playScope("http:closing").handle).not.toBe(first.handle);
  });
});
