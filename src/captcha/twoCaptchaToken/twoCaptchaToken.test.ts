import { describe, expect, test } from "bun:test";
import { TwoCaptchaRecaptchaSolver, twoCaptchaKey } from "./index.ts";
import type { TwoCaptchaTokenDeps } from "./index.ts";

const CHALLENGE = { type: "recaptcha-enterprise-v3" as const, websiteUrl: "https://www.reddit.com/r/x/submit", websiteKey: "site", pageAction: "submit" };

function deps(answers: Array<Record<string, unknown>>) {
  const sent: Array<{ path: string; body: Record<string, unknown> }> = [];
  const recorded: Array<{ solved: boolean; detail?: string }> = [];
  let clock = 0;
  const d: TwoCaptchaTokenDeps = {
    post: async (path, body) => {
      sent.push({ path, body });
      return answers.shift() ?? { errorId: 0, status: "processing" };
    },
    sleep: async (ms) => {
      clock += ms;
    },
    record: (attempt) => {
      recorded.push(attempt);
    },
    now: () => new Date(clock),
  };
  return { d, sent, recorded };
}

describe("2Captcha reCAPTCHA Enterprise v3 tokens", () => {
  test("asks for an enterprise v3 token and returns it once ready", async () => {
    const { d, sent, recorded } = deps([{ errorId: 0, taskId: 7 }, { errorId: 0, status: "processing" }, { errorId: 0, status: "ready", solution: { gRecaptchaResponse: "tok" } }]);
    const solution = await new TwoCaptchaRecaptchaSolver("key", "acct", d).solve(CHALLENGE);
    expect(solution.token).toBe("tok");
    expect(sent[0]).toEqual({ path: "/createTask", body: { clientKey: "key", task: { type: "RecaptchaV3TaskProxyless", websiteURL: CHALLENGE.websiteUrl, websiteKey: "site", pageAction: "submit", minScore: 0.9, isEnterprise: true } } });
    expect(sent.slice(1).every((s) => s.path === "/getTaskResult")).toBe(true);
    expect(recorded).toMatchObject([{ solved: true }]);
  });

  test("a refusal or a missing key fails with what 2Captcha said, and is recorded", async () => {
    const refused = deps([{ errorId: 10, errorCode: "ERROR_ZERO_BALANCE", errorDescription: "no money" }]);
    await expect(new TwoCaptchaRecaptchaSolver("key", "acct", refused.d).solve(CHALLENGE)).rejects.toThrow("no money");
    expect(refused.recorded).toMatchObject([{ solved: false, detail: "ERROR_ZERO_BALANCE: no money" }]);
    const none = deps([]);
    await expect(new TwoCaptchaRecaptchaSolver("", "acct", none.d).solve(CHALLENGE)).rejects.toThrow("2CAPTCHA_API_KEY");
    expect(none.sent).toEqual([]);
  });

  test("the key is read from either name", () => {
    expect(twoCaptchaKey({ "2CAPTCHA_API_KEY": " a " })).toBe("a");
    expect(twoCaptchaKey({ TWOCAPTCHA_API_KEY: "b", "2CAPTCHA_API_KEY": "a" })).toBe("b");
  });
});
