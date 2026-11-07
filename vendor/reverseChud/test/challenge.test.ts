import { describe, expect, test } from "bun:test";

import {
  RedditJavaScriptChallenge,
  UnsupportedRedditJavaScriptChallengeError,
} from "../src";

const TOKEN = "7afd7253fec22262ff1c52b1703fe9ecc121ed575f7576c7f8eae2aa41b34485";

function challengeHtml(
  seed = "3ec5f4284515cb06",
  script = `await(async value=>value+value)("${seed}")`,
): string {
  return `
    <!doctype html>
    <script>
      document.addEventListener("DOMContentLoaded", async function () {
        const solution = ${script};
      });
    </script>
    <form hidden method="GET" action="/r/typescript/">
      <input type="hidden" name="solution" />
      <input type="hidden" name="js_challenge" value="1" />
      <input type="hidden" name="token" value="${TOKEN}" />
      <input type="hidden" name="jsc_orig_r" value="" />
    </form>
  `;
}

describe("RedditJavaScriptChallenge", () => {
  test("ignores ordinary HTML", () => {
    expect(
      RedditJavaScriptChallenge.parse(
        "https://www.reddit.com/r/typescript/",
        "<html><body>Reddit</body></html>",
      ),
    ).toBeUndefined();
  });

  test("parses the observed seed-duplication challenge", () => {
    const challenge = RedditJavaScriptChallenge.parse(
      "https://www.reddit.com/r/typescript/",
      challengeHtml(),
    );

    expect(challenge).toBeDefined();
    expect(challenge?.action.href).toBe(
      "https://www.reddit.com/r/typescript/",
    );
    expect(challenge?.seed).toBe("3ec5f4284515cb06");
    expect(challenge?.solution).toBe(
      "3ec5f4284515cb063ec5f4284515cb06",
    );
  });

  test("builds the same GET submission as the challenge form", () => {
    const challenge = RedditJavaScriptChallenge.parse(
      "https://www.reddit.com/r/typescript/",
      challengeHtml(),
    );
    const submission = challenge?.createSubmissionUrl(
      "https://www.reddit.com/r/typescript/?sort=new&sort=top",
    );

    expect(submission?.pathname).toBe("/r/typescript/");
    expect(submission?.searchParams.get("solution")).toBe(
      "3ec5f4284515cb063ec5f4284515cb06",
    );
    expect(submission?.searchParams.get("js_challenge")).toBe("1");
    expect(submission?.searchParams.get("token")).toBe(TOKEN);
    expect(submission?.searchParams.get("jsc_orig_r")).toBe("");
    expect(submission?.searchParams.getAll("sort")).toEqual(["new", "top"]);
  });

  test("rejects a changed challenge algorithm", () => {
    expect(() =>
      RedditJavaScriptChallenge.parse(
        "https://www.reddit.com/r/typescript/",
        challengeHtml(
          "3ec5f4284515cb06",
          'await(async value=>value+value+value)("3ec5f4284515cb06")',
        ),
      ),
    ).toThrow(UnsupportedRedditJavaScriptChallengeError);
  });

  test("rejects a cross-origin form action", () => {
    const html = challengeHtml().replace(
      'action="/r/typescript/"',
      'action="https://example.com/"',
    );

    expect(() =>
      RedditJavaScriptChallenge.parse(
        "https://www.reddit.com/r/typescript/",
        html,
      ),
    ).toThrow("challenge form action is not same-origin");
  });
});
