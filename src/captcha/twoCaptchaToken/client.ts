import { appendAttempt } from "../router/index.ts";
import type { CaptchaSolution, CaptchaSolveOptions, CaptchaSolver, RecaptchaEnterpriseV3Challenge } from "../../../vendor/reverseChud/src/index.ts";

const API = "https://api.2captcha.com";
const POLL_MS = 5000;
const TIMEOUT_MS = 180000;
const MIN_SCORE = 0.9;

export interface TwoCaptchaTokenDeps {
  post: (path: string, body: Record<string, unknown>) => Promise<Record<string, unknown>>;
  sleep: (ms: number) => Promise<void>;
  record: typeof appendAttempt;
  now: () => Date;
}

export const twoCaptchaTokenDeps: TwoCaptchaTokenDeps = {
  post: async (path, body) => {
    const response = await fetch(API + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await response.json()) as Record<string, unknown>;
  },
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  record: appendAttempt,
  now: () => new Date(),
};

export function twoCaptchaKey(env: Record<string, string | undefined> = process.env): string {
  return (env.TWOCAPTCHA_API_KEY ?? env["2CAPTCHA_API_KEY"] ?? "").trim();
}

export class TwoCaptchaTokenError extends Error {
  override readonly name = "RedditPostCaptchaRequiredError";
  constructor(message: string, readonly code: string) {
    super(message);
  }
}

export class TwoCaptchaRecaptchaSolver implements CaptchaSolver<RecaptchaEnterpriseV3Challenge> {
  constructor(
    readonly key: string,
    readonly accountId: string,
    readonly deps: TwoCaptchaTokenDeps = twoCaptchaTokenDeps,
  ) {}

  async solve(challenge: RecaptchaEnterpriseV3Challenge, options: CaptchaSolveOptions = {}): Promise<CaptchaSolution> {
    const fail = (code: string, detail: string): never => {
      this.deps.record({ at: this.deps.now().toISOString(), accountId: this.accountId, kind: "recaptcha", solver: "twoCaptcha", solved: false, accepted: null, detail: `${code}: ${detail}` });
      throw new TwoCaptchaTokenError(`2Captcha: ${detail}`, code);
    };
    if (!this.key) return fail("missingApiKey", "2CAPTCHA_API_KEY (or TWOCAPTCHA_API_KEY) is not set");
    const created = await this.deps.post("/createTask", {
      clientKey: this.key,
      task: {
        type: "RecaptchaV3TaskProxyless",
        websiteURL: challenge.websiteUrl,
        websiteKey: challenge.websiteKey,
        pageAction: challenge.pageAction,
        minScore: MIN_SCORE,
        isEnterprise: true,
      },
    });
    if (created.errorId !== 0 || typeof created.taskId !== "number") return fail(String(created.errorCode ?? "createTaskFailed"), String(created.errorDescription ?? "2Captcha didn't take the task"));
    const started = this.deps.now().getTime();
    while (this.deps.now().getTime() - started < TIMEOUT_MS) {
      options.signal?.throwIfAborted();
      await this.deps.sleep(POLL_MS);
      const result = await this.deps.post("/getTaskResult", { clientKey: this.key, taskId: created.taskId });
      if (result.errorId !== 0) return fail(String(result.errorCode ?? "taskFailed"), String(result.errorDescription ?? "2Captcha couldn't solve it"));
      if (result.status !== "ready") continue;
      const solution = (result.solution ?? {}) as { gRecaptchaResponse?: string; token?: string; userAgent?: string };
      const token = solution.gRecaptchaResponse ?? solution.token ?? "";
      if (!token) return fail("noToken", "2Captcha answered ready with no token");
      this.deps.record({ at: this.deps.now().toISOString(), accountId: this.accountId, kind: "recaptcha", solver: "twoCaptcha", solved: true, accepted: null, detail: `reCAPTCHA Enterprise v3 for ${challenge.pageAction}` });
      return { token, ...(solution.userAgent ? { userAgent: solution.userAgent } : {}) };
    }
    return fail("timeout", `no token in ${TIMEOUT_MS / 1000} s`);
  }
}
