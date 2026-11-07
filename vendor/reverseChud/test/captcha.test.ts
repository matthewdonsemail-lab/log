import { describe, expect, test } from "bun:test";

import {
  CapSolver,
  CapSolverError,
  type CaptchaSolution,
  type CaptchaSolver,
  type RecaptchaEnterpriseV3Challenge,
} from "../src";

const CHALLENGE: RecaptchaEnterpriseV3Challenge = {
  type: "recaptcha-enterprise-v3",
  websiteUrl: "https://www.reddit.com/",
  websiteKey: "public-test-site-key",
  pageAction: "v1/web/login_with_password",
};

describe("CaptchaSolver", () => {
  test("accepts any structurally compatible solver", async () => {
    const solver: CaptchaSolver = {
      async solve(challenge): Promise<CaptchaSolution> {
        return { token: `solved:${challenge.pageAction}` };
      },
    };

    expect((await solver.solve(CHALLENGE)).token).toBe(
      "solved:v1/web/login_with_password",
    );
  });
});

describe("CapSolver", () => {
  test("creates, polls, and normalizes an Enterprise v3 solution", async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const responses = [
      { errorId: 0, taskId: "task-123" },
      { errorId: 0, status: "processing" },
      {
        errorId: 0,
        status: "ready",
        solution: {
          gRecaptchaResponse: "captcha-token",
          userAgent: "solver-user-agent",
          secChUa: '"Chromium";v="127"',
          "recaptcha-ca-t": "session-cookie",
        },
      },
    ];
    const fetch = mockFetch(responses, requests);
    const solver: CaptchaSolver = new CapSolver({
      apiKey: "test-api-key",
      fetch,
      pollIntervalMs: 0,
    });

    const result = await solver.solve({
      ...CHALLENGE,
      enterprisePayload: { s: "enterprise-payload" },
      requiresSession: true,
    });

    expect(requests.map(({ url }) => url)).toEqual([
      "https://api.capsolver.com/createTask",
      "https://api.capsolver.com/getTaskResult",
      "https://api.capsolver.com/getTaskResult",
    ]);
    expect(requests[0]?.body).toEqual({
      clientKey: "test-api-key",
      task: {
        type: "ReCaptchaV3EnterpriseTaskProxyLess",
        websiteURL: CHALLENGE.websiteUrl,
        websiteKey: CHALLENGE.websiteKey,
        pageAction: CHALLENGE.pageAction,
        enterprisePayload: { s: "enterprise-payload" },
        isSession: true,
      },
    });
    expect(requests[1]?.body).toEqual({
      clientKey: "test-api-key",
      taskId: "task-123",
    });
    expect(result).toEqual({
      token: "captcha-token",
      userAgent: "solver-user-agent",
      headers: { "sec-ch-ua": '"Chromium";v="127"' },
      cookies: { "recaptcha-ca-t": "session-cookie" },
    });
  });

  test("uses the proxy task when a proxy is supplied", async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const solver = new CapSolver({
      apiKey: "test-api-key",
      proxy: "http:127.0.0.1:8080:user:password",
      fetch: mockFetch(
        [
          { errorId: 0, taskId: "task-123" },
          {
            errorId: 0,
            status: "ready",
            solution: { gRecaptchaResponse: "captcha-token" },
          },
        ],
        requests,
      ),
      pollIntervalMs: 0,
    });

    await solver.solve(CHALLENGE);

    expect(requests[0]?.body).toMatchObject({
      task: {
        type: "ReCaptchaV3EnterpriseTask",
        proxy: "http:127.0.0.1:8080:user:password",
      },
    });
  });

  test("converts a per-attempt proxy URL for the provider", async () => {
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const solver = new CapSolver({
      apiKey: "test-api-key",
      fetch: mockFetch(
        [
          { errorId: 0, taskId: "task-123" },
          {
            errorId: 0,
            status: "ready",
            solution: { gRecaptchaResponse: "captcha-token" },
          },
        ],
        requests,
      ),
      pollIntervalMs: 0,
    });

    await solver.solve(CHALLENGE, {
      proxy: "http://user:password@127.0.0.1:8080/",
    });

    expect(requests[0]?.body).toMatchObject({
      task: {
        type: "ReCaptchaV3EnterpriseTask",
        proxy: "http:127.0.0.1:8080:user:password",
      },
    });
  });

  test("surfaces CapSolver API errors without exposing the API key", async () => {
    const solver = new CapSolver({
      apiKey: "secret-test-api-key",
      fetch: mockFetch(
        [
          {
            errorId: 1,
            errorCode: "ERROR_ZERO_BALANCE",
            errorDescription: "Insufficient balance",
          },
        ],
        [],
      ),
    });

    try {
      await solver.solve(CHALLENGE);
      throw new Error("Expected CapSolver to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(CapSolverError);
      expect((error as CapSolverError).code).toBe("ERROR_ZERO_BALANCE");
      expect(String(error)).not.toContain("secret-test-api-key");
    }
  });
});

function mockFetch(
  responses: unknown[],
  requests: Array<{ url: string; body: Record<string, unknown> }>,
): typeof fetch {
  return (async (input, init) => {
    requests.push({
      url: String(input),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    const response = responses.shift();
    if (response === undefined) throw new Error("Unexpected request");
    return Response.json(response);
  }) as typeof fetch;
}
