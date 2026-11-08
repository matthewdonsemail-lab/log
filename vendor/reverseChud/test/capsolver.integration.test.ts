import { expect, test } from "bun:test";

import {
  CapSolver,
  createRedditLoginCaptchaChallenge,
} from "../src/index";

const apiKey = process.env.CAPSOLVER_API_KEY;
const siteKey = process.env.REDDIT_CAPTCHA_SITE_KEY;

if (
  apiKey === undefined ||
  apiKey.length === 0 ||
  siteKey === undefined ||
  siteKey.length === 0
) {
  test.skip("solves Reddit's login CAPTCHA with CapSolver", () => {});
} else {
  test(
    "solves Reddit's login CAPTCHA with CapSolver",
    async () => {
      const challenge = createRedditLoginCaptchaChallenge(
        process.env.REDDIT_CAPTCHA_WEBSITE_URL ?? "https://www.reddit.com/",
        siteKey,
      );
      const solver = new CapSolver({ apiKey });

      const solution = await solver.solve(challenge);

      expect(solution.token.length).toBeGreaterThan(0);
    },
    130_000,
  );
}
