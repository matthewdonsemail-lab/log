import { load } from "cheerio/slim";

import { AuthenticatedRedditAuthenticationContext } from "./authentication.js";
import type {
  CaptchaSolution,
  CaptchaSolver,
  RecaptchaEnterpriseV3Challenge,
} from "./captcha.js";
import { RedditJavaScriptChallenge } from "./challenge.js";
import { RedditFeedClient } from "./feed.js";
import {
  createRedditLoginCaptchaChallenge,
  REDDIT_LOGIN_FLOW,
} from "./login.js";
import { RedditPostClient } from "./post.js";
import { RedditSearchClient } from "./search.js";
import {
  createRedditSession,
  DEFAULT_REDDIT_BROWSER_OS,
  DEFAULT_REDDIT_BROWSER_PROFILE,
  normalizeRedditProxy,
  type RedditProxy,
  type RedditSession,
  type RedditSessionOptions,
  type RedditSessionResponse,
} from "./session.js";
import {
  normalizeRedditOrigin,
  RedditSessionState,
  type RedditSessionCookie,
} from "./session-state.js";

const DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/";
const PARTIAL_HTML_ACCEPT = "text/vnd.reddit.partial+html";
const HTML_ACCEPT = "text/html";
const AUTHENTICATED_COOKIE = "reddit_session";
const SIX_DIGIT_OTP = /^\d{6}$/;
const RESERVED_CAPTCHA_HEADERS = new Set([
  "accept",
  "content-length",
  "content-type",
  "cookie",
  "host",
  "origin",
  "referer",
]);

export interface RedditOtpRequest {
  readonly signal?: AbortSignal;
  readonly username: string;
}

export type RedditOtpProvider = (
  request: RedditOtpRequest,
) => string | Promise<string>;

export interface RedditClientLoginOptions {
  readonly captchaSolver: CaptchaSolver<RecaptchaEnterpriseV3Challenge>;
  readonly getOtp?: RedditOtpProvider;
  readonly origin?: string | URL;
  readonly password: string;
  /** Route Reddit and solver challenge traffic through one proxy. */
  readonly proxy?: RedditProxy;
  readonly session?: RedditSession;
  readonly sessionOptions?: RedditSessionOptions;
  readonly signal?: AbortSignal;
  readonly username: string;
}

export interface RedditClientResumeOptions {
  readonly captchaSolver?: CaptchaSolver<RecaptchaEnterpriseV3Challenge>;
  /** Route restored Reddit and solver challenge traffic through one proxy. */
  readonly proxy?: RedditProxy;
  readonly session?: RedditSession;
  readonly sessionOptions?: Omit<RedditSessionOptions, "browser" | "os">;
  readonly signal?: AbortSignal;
  readonly state: unknown;
}

export type RedditLoginPhase =
  | "login-page"
  | "password"
  | "otp"
  | "verification";

/** Reddit rejected a login stage or returned an unexpected login contract. */
export class RedditLoginError extends Error {
  override readonly name = "RedditLoginError";

  constructor(
    message: string,
    readonly phase: RedditLoginPhase,
    readonly status?: number,
  ) {
    super(message);
  }
}

/** Authenticated entry point that owns one persistent Reddit session. */
export class RedditClient {
  readonly feeds: RedditFeedClient;
  readonly posts: RedditPostClient;
  readonly search: RedditSearchClient;
  readonly username: string;
  readonly #browser: RedditSessionState["browser"];
  readonly #origin: URL;
  readonly #os: RedditSessionState["os"];
  readonly #session: RedditSession;

  private constructor(
    session: RedditSession,
    authentication: AuthenticatedRedditAuthenticationContext,
    origin: URL,
    browser: RedditSessionState["browser"],
    os: RedditSessionState["os"],
    captchaSolver?: CaptchaSolver<RecaptchaEnterpriseV3Challenge>,
    proxy?: string,
  ) {
    this.#session = session;
    this.#origin = origin;
    this.#browser = browser;
    this.#os = os;
    this.username = authentication.username;
    this.feeds = new RedditFeedClient(session, authentication, { origin });
    this.posts = new RedditPostClient(session, authentication, {
      origin,
      ...(captchaSolver === undefined ? {} : { captchaSolver }),
      ...(proxy === undefined ? {} : { proxy }),
    });
    this.search = new RedditSearchClient(session, authentication, { origin });
  }

  static async login(options: RedditClientLoginOptions): Promise<RedditClient> {
    validateCredentials(options.username, options.password);
    options.signal?.throwIfAborted();
    if (options.session !== undefined && options.sessionOptions !== undefined) {
      throw new TypeError("Reddit login cannot combine session and sessionOptions");
    }
    if (options.session !== undefined && options.proxy !== undefined) {
      throw new TypeError("Reddit login cannot apply a proxy to a custom session");
    }
    if (
      options.proxy !== undefined &&
      options.sessionOptions?.proxy !== undefined
    ) {
      throw new TypeError(
        "Reddit login cannot combine proxy and sessionOptions.proxy",
      );
    }

    const origin = normalizeRedditOrigin(
      options.origin ?? DEFAULT_REDDIT_ORIGIN,
    );
    const browser =
      options.sessionOptions?.browser ?? DEFAULT_REDDIT_BROWSER_PROFILE;
    const os = options.sessionOptions?.os ?? DEFAULT_REDDIT_BROWSER_OS;
    const proxyInput = options.proxy ?? options.sessionOptions?.proxy;
    const proxy = proxyInput === undefined
      ? undefined
      : normalizeRedditProxy(proxyInput);
    const session = options.session ??
      (await createRedditSession({
        ...options.sessionOptions,
        ...(options.proxy === undefined ? {} : { proxy: options.proxy }),
      }));

    try {
      await authenticate(session, origin, options, proxy);
      return new RedditClient(
        session,
        new AuthenticatedRedditAuthenticationContext(options.username),
        origin,
        browser,
        os,
        options.captchaSolver,
        proxy,
      );
    } catch (error) {
      await session.close().catch(() => undefined);
      throw error;
    }
  }

  static async resume(
    options: RedditClientResumeOptions,
  ): Promise<RedditClient> {
    options.signal?.throwIfAborted();
    if (options.session !== undefined && options.sessionOptions !== undefined) {
      throw new TypeError("Reddit resume cannot combine session and sessionOptions");
    }
    if (options.session !== undefined && options.proxy !== undefined) {
      throw new TypeError("Reddit resume cannot apply a proxy to a custom session");
    }
    if (
      options.proxy !== undefined &&
      options.sessionOptions?.proxy !== undefined
    ) {
      throw new TypeError(
        "Reddit resume cannot combine proxy and sessionOptions.proxy",
      );
    }
    const state = RedditSessionState.from(options.state);
    const origin = normalizeRedditOrigin(state.origin);
    const proxyInput = options.proxy ?? options.sessionOptions?.proxy;
    const proxy = proxyInput === undefined
      ? undefined
      : normalizeRedditProxy(proxyInput);
    const session =
      options.session ??
      (await createRedditSession({
        ...options.sessionOptions,
        browser: state.browser,
        os: state.os,
        ...(options.proxy === undefined ? {} : { proxy: options.proxy }),
      }));

    try {
      restoreCookies(session, origin, state.cookies);
      await verifyAuthentication(session, origin, options.signal);
      return new RedditClient(
        session,
        new AuthenticatedRedditAuthenticationContext(state.username),
        origin,
        state.browser,
        state.os,
        options.captchaSolver,
        proxy,
      );
    } catch (error) {
      await session.close().catch(() => undefined);
      throw error;
    }
  }

  get closed(): boolean {
    return this.#session.closed;
  }

  close(): Promise<void> {
    return this.#session.close();
  }

  exportSession(): RedditSessionState {
    return RedditSessionState.fromCookies(
      this.#session.getCookies(this.#origin),
      {
        username: this.username,
        origin: this.#origin,
        browser: this.#browser,
        os: this.#os,
      },
    );
  }
}

async function authenticate(
  session: RedditSession,
  origin: URL,
  options: RedditClientLoginOptions,
  proxy: string | undefined,
): Promise<void> {
  const loginUrl = new URL("/login/", origin);
  const loginHtml = await loadLoginPage(session, loginUrl, options.signal);
  const captcha = await discoverLoginCaptcha(
    session,
    loginUrl,
    loginHtml,
    options.signal,
  );

  const passwordSolution = await solveCaptcha(options, captcha, proxy);
  applyCaptchaCookies(session, origin, passwordSolution);
  const passwordResponse = await submitLogin(
    session,
    origin,
    loginUrl,
    REDDIT_LOGIN_FLOW.password.path,
    {
      username: options.username,
      password: options.password,
      recaptcha_token: passwordSolution.token,
      recaptcha_use_checkbox: "false",
      recaptcha_action: captcha.pageAction,
    },
    passwordSolution,
    options.signal,
  );

  if (passwordResponse.status === 202) {
    if (options.getOtp === undefined) {
      throw new RedditLoginError(
        "Reddit requires a six-digit authenticator code",
        "otp",
      );
    }

    const otpSolution = await solveCaptcha(options, captcha, proxy);
    applyCaptchaCookies(session, origin, otpSolution);
    const otp = (
      await options.getOtp({
        username: options.username,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
    ).trim();
    if (!SIX_DIGIT_OTP.test(otp)) {
      throw new TypeError("Reddit authenticator code must contain six digits");
    }

    const otpResponse = await submitLogin(
      session,
      origin,
      loginUrl,
      REDDIT_LOGIN_FLOW.authenticatorOtp.path,
      {
        username: options.username,
        password: options.password,
        appOtp: otp,
        recaptcha_token: otpSolution.token,
        recaptcha_use_checkbox: "false",
        recaptcha_action: captcha.pageAction,
      },
      otpSolution,
      options.signal,
    );
    if (otpResponse.status !== 200) {
      throw await responseError(otpResponse, "otp");
    }
  } else if (passwordResponse.status !== 200) {
    throw await responseError(passwordResponse, "password");
  }

  await verifyAuthentication(session, origin, options.signal);
}

async function loadLoginPage(
  session: RedditSession,
  loginUrl: URL,
  signal: AbortSignal | undefined,
): Promise<string> {
  let response = await session.fetch(loginUrl, {
    headers: { accept: HTML_ACCEPT },
    ...(signal === undefined ? {} : { signal }),
  });
  if (!response.ok) throw await responseError(response, "login-page");

  let html = await response.text();
  const challenge = RedditJavaScriptChallenge.parse(response.url, html);
  if (challenge !== undefined) {
    response = await session.fetch(challenge.createSubmissionUrl(loginUrl), {
      headers: { accept: HTML_ACCEPT, referer: loginUrl.href },
      ...(signal === undefined ? {} : { signal }),
    });
    if (!response.ok) throw await responseError(response, "login-page");
    html = await response.text();

    if (RedditJavaScriptChallenge.parse(response.url, html) !== undefined) {
      throw new RedditLoginError(
        "Reddit returned another JavaScript challenge after it was solved",
        "login-page",
      );
    }
  }

  return html;
}

async function discoverLoginCaptcha(
  session: RedditSession,
  loginUrl: URL,
  loginHtml: string,
  signal: AbortSignal | undefined,
): Promise<RecaptchaEnterpriseV3Challenge> {
  let $ = load(loginHtml, undefined, false);
  let component = $("auth-flow-login").first();

  if (component.length === 0) {
    const partialPath = $('faceplate-partial[name^="LoginStep_"]')
      .first()
      .attr("src");
    if (partialPath === undefined) {
      throw new RedditLoginError(
        "Reddit login page did not contain the login component",
        "login-page",
      );
    }

    const partialUrl = new URL(partialPath, loginUrl);
    if (partialUrl.origin !== loginUrl.origin) {
      throw new RedditLoginError(
        "Reddit login partial was not same-origin",
        "login-page",
      );
    }

    const response = await session.fetch(partialUrl, {
      headers: { accept: PARTIAL_HTML_ACCEPT, referer: loginUrl.href },
      ...(signal === undefined ? {} : { signal }),
    });
    if (!response.ok) throw await responseError(response, "login-page");
    $ = load(await response.text(), undefined, false);
    component = $("auth-flow-login").first();
  }

  const siteKey = component.attr("captcha-site-key");
  const pageAction = component.attr("captcha-action");
  if (siteKey === undefined || siteKey.length === 0) {
    throw new RedditLoginError(
      "Reddit login component did not contain a CAPTCHA site key",
      "login-page",
    );
  }

  const challenge = createRedditLoginCaptchaChallenge(loginUrl, siteKey);
  if (pageAction !== challenge.pageAction) {
    throw new RedditLoginError(
      "Reddit login CAPTCHA action changed",
      "login-page",
    );
  }

  return challenge;
}

function solveCaptcha(
  options: RedditClientLoginOptions,
  challenge: RecaptchaEnterpriseV3Challenge,
  proxy: string | undefined,
): Promise<CaptchaSolution> {
  return options.captchaSolver.solve(
    challenge,
    {
      ...(proxy === undefined ? {} : { proxy }),
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    },
  );
}

async function submitLogin(
  session: RedditSession,
  origin: URL,
  loginUrl: URL,
  path: string,
  fields: Readonly<Record<string, string>>,
  solution: CaptchaSolution,
  signal: AbortSignal | undefined,
): Promise<RedditSessionResponse> {
  const csrfToken = session.getCookies(origin).csrf_token;
  if (csrfToken === undefined || csrfToken.length === 0) {
    throw new RedditLoginError(
      "Reddit did not set a CSRF token",
      "login-page",
    );
  }

  return session.fetch(new URL(path, origin), {
    method: "POST",
    headers: {
      ...captchaHeaders(solution),
      accept: PARTIAL_HTML_ACCEPT,
      "content-type": "application/x-www-form-urlencoded",
      origin: origin.origin,
      referer: loginUrl.href,
    },
    body: new URLSearchParams({ csrf_token: csrfToken, ...fields }),
    ...(signal === undefined ? {} : { signal }),
  });
}

function applyCaptchaCookies(
  session: RedditSession,
  origin: URL,
  solution: CaptchaSolution,
): void {
  for (const [name, value] of Object.entries(solution.cookies ?? {})) {
    session.setCookie(name, value, origin);
  }
}

function captchaHeaders(solution: CaptchaSolution): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(solution.headers ?? {})) {
    if (!RESERVED_CAPTCHA_HEADERS.has(name.toLowerCase())) headers[name] = value;
  }
  if (solution.userAgent !== undefined) {
    headers["user-agent"] = solution.userAgent;
  }
  return headers;
}

async function verifyAuthentication(
  session: RedditSession,
  origin: URL,
  signal: AbortSignal | undefined,
): Promise<void> {
  if (session.getCookies(origin)[AUTHENTICATED_COOKIE] === undefined) {
    throw new RedditLoginError(
      "Reddit session does not contain an authentication cookie",
      "verification",
    );
  }

  const response = await session.fetch(origin, {
    headers: { accept: HTML_ACCEPT },
    ...(signal === undefined ? {} : { signal }),
  });
  if (!response.ok) throw await responseError(response, "verification");

  const html = await response.text();
  const $ = load(html, undefined, false);
  const authenticated =
    $('[is-user-logged-in="true"]').length > 0 ||
    $('faceplate-partial[src^="/svc/shreddit/user-drawer-button-logged-in"]')
      .length > 0 ||
    $('a[href="/notifications"]').length > 0;
  if (!authenticated) {
    throw new RedditLoginError(
      "Reddit returned success without an authenticated session",
      "verification",
    );
  }
}

function restoreCookies(
  session: RedditSession,
  origin: URL,
  cookies: readonly RedditSessionCookie[],
): void {
  for (const cookie of cookies) {
    const url = cookieUrl(cookie, origin);
    if (url !== undefined) session.setCookie(cookie.name, cookie.value, url);
  }
}

function cookieUrl(
  cookie: RedditSessionCookie,
  origin: URL,
): URL | undefined {
  const domain = cookie.domain?.replace(/^\./, "").toLowerCase();
  const hostname = origin.hostname.toLowerCase();
  if (
    domain !== undefined &&
    hostname !== domain &&
    !hostname.endsWith(`.${domain}`)
  ) {
    return undefined;
  }

  const url = new URL(origin);
  url.pathname = cookie.path?.startsWith("/") ? cookie.path : "/";
  return url;
}

async function responseError(
  response: RedditSessionResponse,
  phase: RedditLoginPhase,
): Promise<RedditLoginError> {
  const html = await response.text().catch(() => "");
  const message = load(html, undefined, false)("faceplate-alert")
    .first()
    .attr("message");

  return new RedditLoginError(
    message ?? `Reddit login ${phase} failed with HTTP ${response.status}`,
    phase,
    response.status,
  );
}

function validateCredentials(username: string, password: string): void {
  if (username.trim().length === 0) {
    throw new TypeError("Reddit username cannot be empty");
  }
  if (password.length === 0) {
    throw new TypeError("Reddit password cannot be empty");
  }
}
