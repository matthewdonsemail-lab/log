import { describe, expect, test } from "bun:test";

import {
  RedditClient,
  RedditLoginError,
  RedditSessionState,
  type RedditSession,
  type RedditSessionRequestInit,
  type RedditSessionResponse,
} from "../src";

const ORIGIN = "https://www.reddit.test/";
const FIXTURE_URL = new URL("./fixtures/home-feed.html", import.meta.url);
const SEARCH_FIXTURE_URL = new URL(
  "./fixtures/community-search.html",
  import.meta.url,
);
const TOKEN = "7afd7253fec22262ff1c52b1703fe9ecc121ed575f7576c7f8eae2aa41b34485";

describe("RedditClient", () => {
  test("owns edge challenge, CAPTCHA, 2FA, and bound feed orchestration", async () => {
    const session = new MockRedditSession();
    const solved: string[] = [];
    const otpRequests: string[] = [];

    const reddit = await RedditClient.login({
      username: "example_user",
      password: "example_password",
      captchaSolver: {
        async solve() {
          const token = `captcha-${solved.length + 1}`;
          solved.push(token);
          return {
            token,
            userAgent: "solver-user-agent",
            cookies: { solver_cookie: token },
          };
        },
      },
      async getOtp(request) {
        otpRequests.push(request.username);
        return "123456";
      },
      origin: ORIGIN,
      session,
    });

    const feed = await reddit.feeds.getHome();
    const communities = await reddit.search.communities("typescript");
    const passwordRequest = session.requests.find(
      ({ url }) => url.pathname === "/svc/shreddit/account/login",
    );
    const otpRequest = session.requests.find(
      ({ url }) => url.pathname === "/svc/shreddit/account/login/otp",
    );

    expect(reddit.username).toBe("example_user");
    expect(feed.posts).toHaveLength(2);
    expect(communities.loaded[0]?.prefixedName).toBe("r/typescript");
    expect(solved).toEqual(["captcha-1", "captcha-2"]);
    expect(otpRequests).toEqual(["example_user"]);
    expect(session.challengeSolved).toBeTrue();
    expect(session.cookies.solver_cookie).toBe("captcha-2");
    expect(passwordRequest?.body).toMatchObject({
      username: "example_user",
      password: "example_password",
      recaptcha_token: "captcha-1",
    });
    expect(passwordRequest?.headers["user-agent"]).toBe("solver-user-agent");
    expect(otpRequest?.body).toMatchObject({
      username: "example_user",
      password: "example_password",
      appOtp: "123456",
      recaptcha_token: "captcha-2",
    });

    await reddit.close();
    expect(reddit.closed).toBeTrue();
  });

  test("does not require an OTP provider for accounts without 2FA", async () => {
    const session = new MockRedditSession({ twoFactor: false });

    const reddit = await RedditClient.login({
      username: "example_user",
      password: "example_password",
      captchaSolver: { async solve() { return { token: "captcha" }; } },
      origin: ORIGIN,
      session,
    });

    expect(reddit.closed).toBeFalse();
    expect(
      session.requests.some(
        ({ url }) => url.pathname === "/svc/shreddit/account/login/otp",
      ),
    ).toBeFalse();
    await reddit.close();
  });

  test("closes the session and returns Reddit's safe error on failure", async () => {
    const session = new MockRedditSession({ rejectPassword: true });

    try {
      await RedditClient.login({
        username: "example_user",
        password: "wrong_password",
        captchaSolver: { async solve() { return { token: "captcha" }; } },
        origin: ORIGIN,
        session,
      });
      throw new Error("expected login to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(RedditLoginError);
      expect(error).toMatchObject({ phase: "password", status: 400 });
      expect((error as Error).message).toBe("Incorrect username or password");
    }

    expect(session.closed).toBeTrue();
  });

  test("resumes normalized cookies and exports a reusable snapshot", async () => {
    const session = new MockRedditSession();
    const state = RedditSessionState.fromCookies(
      {
        csrf_token: "csrf",
        reddit_session: "authenticated",
      },
      { username: "example_user", origin: ORIGIN },
    );

    const reddit = await RedditClient.resume({ state, session });
    const feed = await reddit.feeds.getHome();
    const exported = reddit.exportSession();

    expect(reddit.username).toBe("example_user");
    expect(feed.posts).toHaveLength(2);
    expect(exported.toJSON()).toMatchObject({
      version: 1,
      username: "example_user",
      origin: ORIGIN,
      cookies: expect.arrayContaining([
        { name: "reddit_session", value: "authenticated" },
      ]),
    });

    await reddit.close();
  });
});

interface MockSessionOptions {
  readonly rejectPassword?: boolean;
  readonly twoFactor?: boolean;
}

class MockRedditSession implements RedditSession {
  closed = false;
  challengeSolved = false;
  readonly cookies: Record<string, string> = {};
  readonly requests: Array<{
    body: Record<string, string>;
    headers: Record<string, string>;
    url: URL;
  }> = [];
  readonly #rejectPassword: boolean;
  readonly #twoFactor: boolean;

  constructor(options: MockSessionOptions = {}) {
    this.#rejectPassword = options.rejectPassword ?? false;
    this.#twoFactor = options.twoFactor ?? true;
  }

  async fetch(
    input: string | URL,
    init: RedditSessionRequestInit = {},
  ): Promise<RedditSessionResponse> {
    const url = new URL(input);
    const body =
      init.body instanceof URLSearchParams
        ? Object.fromEntries(init.body)
        : {};
    const headers = { ...(init.headers ?? {}) };
    this.requests.push({ body, headers, url });

    if (url.pathname === "/login/" && !url.searchParams.has("js_challenge")) {
      this.cookies.csrf_token = "csrf";
      return response(url, 200, challengeHtml());
    }
    if (url.pathname === "/login/") {
      this.challengeSolved = true;
      return response(
        url,
        200,
        '<faceplate-partial name="LoginStep_test" src="/login-partial"></faceplate-partial>',
      );
    }
    if (url.pathname === "/login-partial") {
      return response(
        url,
        200,
        '<auth-flow-login captcha-site-key="site-key" captcha-action="v1/web/login_with_password"></auth-flow-login>',
      );
    }
    if (url.pathname === "/svc/shreddit/account/login") {
      if (this.#rejectPassword) {
        return response(
          url,
          400,
          '<faceplate-alert message="Incorrect username or password"></faceplate-alert>',
        );
      }
      if (this.#twoFactor) return response(url, 202, "");
      this.cookies.reddit_session = "authenticated";
      return response(url, 200, "");
    }
    if (url.pathname === "/svc/shreddit/account/login/otp") {
      this.cookies.reddit_session = "authenticated";
      return response(url, 200, "");
    }
    if (url.pathname === "/svc/shreddit/feeds/home-feed") {
      return response(url, 200, await Bun.file(FIXTURE_URL).text());
    }
    if (url.pathname === "/search/") {
      return response(url, 200, await Bun.file(SEARCH_FIXTURE_URL).text());
    }
    if (url.pathname === "/" && this.cookies.reddit_session !== undefined) {
      return response(
        url,
        200,
        '<a href="/notifications">Inbox</a><a href="/submit">Create post</a>',
      );
    }

    return response(url, 404, "not found");
  }

  getCookies(): Record<string, string> {
    return { ...this.cookies };
  }

  setCookie(name: string, value: string): void {
    this.cookies[name] = value;
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

function response(
  url: URL,
  status: number,
  body: string,
): RedditSessionResponse {
  return {
    headers: new Headers(),
    ok: status >= 200 && status < 300,
    status,
    url: url.href,
    async text() {
      return body;
    },
  };
}

function challengeHtml(): string {
  return `
    <script>await(async value=>value+value)("3ec5f4284515cb06")</script>
    <form hidden method="GET" action="/login/">
      <input name="solution" />
      <input name="js_challenge" value="1" />
      <input name="token" value="${TOKEN}" />
      <input name="jsc_orig_r" value="" />
    </form>
  `;
}
