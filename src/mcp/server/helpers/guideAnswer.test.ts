import { describe, expect, test } from "bun:test";
import { activePlay, clearActivePlay, playScope } from "./activePlay.ts";
import { askAnswer, guideAnswer } from "./guideAnswer.ts";

describe("getGuide routes the owner's own words to a use case", () => {
  test("a request names the use case that fits and makes it the session's play", () => {
    const answer = askAnswer("show me who has been messaging me on twitter");
    expect(answer.isError).toBeUndefined();
    expect(answer.text).toStartWith('>>> PLAY MATCH: "Showing it as a view: generative UI in the chat" (inbox/showMe)');
    expect(answer.text).toContain(">>> PLAY inbox/showMe is now this session's play");
    clearActivePlay();
  });

  test("sign-in requests go to the sign-in page", () => {
    expect(askAnswer("my instagram session expired, sign me back in").text).toContain("(inbox/signIn)");
    expect(askAnswer("is my x account still logged in").text).toContain("(inbox/signIn)");
    clearActivePlay();
  });

  test("a request no use case covers says so and lists them, and ask wins over topic", () => {
    const none = askAnswer("what is the weather in lisbon");
    expect(none.isError).toBeUndefined();
    expect(none.text).toStartWith('No use case matches "what is the weather in lisbon"');
    expect(guideAnswer({ ask: "show me who has been messaging me", topic: "ui" }).text).toContain("(inbox/showMe)");
    expect(guideAnswer({ topic: "nope" }).isError).toBe(true);
    clearActivePlay();
  });
});

describe("ask activates a play only on a clear match", () => {
  test("an ambiguous request returns the menu, loads nothing and keeps the play already loaded", () => {
    const scope = playScope("http:askMenu");
    const empty = askAnswer("reply to her", scope);
    expect(empty.routed).toBe("menu");
    expect(empty.text).toContain("none was loaded");
    expect(activePlay(scope)).toBeNull();
    guideAnswer({ useCase: "twitter/followUps" }, scope);
    expect(askAnswer("reply to my dms", scope).text).toContain("twitter/followUps, stays as it was");
    expect(activePlay(scope)?.id).toBe("twitter/followUps");
    clearActivePlay();
  });

  test("a clear match replaces the play, records that ask loaded it, and cites no rule for it", () => {
    const scope = playScope("http:askReplace");
    guideAnswer({ useCase: "twitter/followUps" }, scope);
    const answer = askAnswer("read my instagram dms", scope);
    expect(answer.play?.id).toBe("instagram/dmReply");
    expect(answer.play?.loadedBy).toBe("ask");
    expect(activePlay(scope)?.id).toBe("instagram/dmReply");
    expect(answer.text).not.toContain("rule 157");
    clearActivePlay();
  });
});
