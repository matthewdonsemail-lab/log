import { describe, expect, test } from "bun:test";
import { clearActivePlay } from "./activePlay.ts";
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
