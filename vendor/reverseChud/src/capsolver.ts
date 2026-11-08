import type {
  CaptchaSolution,
  CaptchaSolveOptions,
  CaptchaSolver,
  RecaptchaEnterpriseV3Challenge,
} from "./captcha.js";

const DEFAULT_ENDPOINT = "https://api.capsolver.com/";
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 120_000;

type Fetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface CapSolverOptions {
  readonly apiKey: string;
  readonly endpoint?: string | URL;
  readonly fetch?: Fetch;
  readonly proxy?: string;
  readonly pollIntervalMs?: number;
  readonly timeoutMs?: number;
}

/** CapSolver returned an error or a response that violated its API contract. */
export class CapSolverError extends Error {
  override readonly name = "CapSolverError";

  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

/** CapSolver adapter for score-based reCAPTCHA Enterprise challenges. */
export class CapSolver
  implements CaptchaSolver<RecaptchaEnterpriseV3Challenge>
{
  readonly #apiKey: string;
  readonly #endpoint: URL;
  readonly #fetch: Fetch;
  readonly #proxy: string | undefined;
  readonly #pollIntervalMs: number;
  readonly #timeoutMs: number;

  constructor(options: CapSolverOptions) {
    if (options.apiKey.trim().length === 0) {
      throw new TypeError("CapSolver API key cannot be empty");
    }

    this.#apiKey = options.apiKey;
    this.#endpoint = endpoint(options.endpoint ?? DEFAULT_ENDPOINT);
    this.#fetch = options.fetch ?? globalThis.fetch;
    const proxy = nonEmptyOptional(options.proxy, "CapSolver proxy");
    this.#proxy = proxy === undefined ? undefined : capSolverProxy(proxy);
    this.#pollIntervalMs = nonNegativeDuration(
      options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
      "CapSolver poll interval",
    );
    this.#timeoutMs = positiveDuration(
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      "CapSolver timeout",
    );
  }

  async solve(
    challenge: RecaptchaEnterpriseV3Challenge,
    options: CaptchaSolveOptions = {},
  ): Promise<CaptchaSolution> {
    validateChallenge(challenge);
    options.signal?.throwIfAborted();

    const proxy = options.proxy === undefined
      ? this.#proxy
      : capSolverProxy(options.proxy);

    const task: Record<string, unknown> = {
      type:
        proxy === undefined
          ? "ReCaptchaV3EnterpriseTaskProxyLess"
          : "ReCaptchaV3EnterpriseTask",
      websiteURL: challenge.websiteUrl,
      websiteKey: challenge.websiteKey,
      pageAction: challenge.pageAction,
    };

    if (challenge.enterprisePayload !== undefined) {
      task.enterprisePayload = challenge.enterprisePayload;
    }
    if (challenge.requiresSession !== undefined) {
      task.isSession = challenge.requiresSession;
    }
    if (proxy !== undefined) task.proxy = proxy;

    const created = await this.#post(
      "createTask",
      { clientKey: this.#apiKey, task },
      options.signal,
    );
    const taskId = stringProperty(created, "taskId");
    if (taskId === undefined) {
      throw new CapSolverError("CapSolver did not return a task ID");
    }

    const deadline = Date.now() + this.#timeoutMs;
    while (Date.now() < deadline) {
      const result = await this.#post(
        "getTaskResult",
        { clientKey: this.#apiKey, taskId },
        options.signal,
      );
      const status = stringProperty(result, "status");

      if (status === "ready") return solution(result);
      if (status === "failed") {
        throw apiError(result, "CapSolver failed to solve the CAPTCHA");
      }
      if (status !== "processing" && status !== "idle") {
        throw new CapSolverError(
          `CapSolver returned an unknown task status: ${status ?? "missing"}`,
        );
      }

      await delay(
        Math.min(this.#pollIntervalMs, Math.max(0, deadline - Date.now())),
        options.signal,
      );
    }

    throw new CapSolverError(
      `CapSolver did not finish within ${this.#timeoutMs}ms`,
      "TIMEOUT",
    );
  }

  async #post(
    path: string,
    body: Readonly<Record<string, unknown>>,
    signal: AbortSignal | undefined,
  ): Promise<Record<string, unknown>> {
    const response = await this.#fetch(new URL(path, this.#endpoint), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      ...(signal === undefined ? {} : { signal }),
    });

    if (!response.ok) {
      throw new CapSolverError(
        `CapSolver request failed with HTTP ${response.status}`,
        `HTTP_${response.status}`,
      );
    }

    let bodyValue: unknown;
    try {
      bodyValue = await response.json();
    } catch {
      throw new CapSolverError("CapSolver returned invalid JSON");
    }
    if (!isRecord(bodyValue)) {
      throw new CapSolverError("CapSolver returned an invalid response body");
    }

    const errorId = bodyValue.errorId;
    if (typeof errorId === "number" && errorId !== 0) {
      throw apiError(bodyValue, "CapSolver rejected the request");
    }

    return bodyValue;
  }
}

function solution(response: Record<string, unknown>): CaptchaSolution {
  const value = response.solution;
  if (!isRecord(value)) {
    throw new CapSolverError("CapSolver returned no solution");
  }

  const token = stringProperty(value, "gRecaptchaResponse");
  if (token === undefined || token.length === 0) {
    throw new CapSolverError("CapSolver returned an empty reCAPTCHA token");
  }

  const userAgent = stringProperty(value, "userAgent");
  const secChUa = stringProperty(value, "secChUa");
  const sessionCookie = stringProperty(value, "recaptcha-ca-t");
  const eligibilityCookie = stringProperty(value, "recaptcha-ca-e");
  const headers = secChUa === undefined ? undefined : { "sec-ch-ua": secChUa };
  const cookies = {
    ...(sessionCookie === undefined ? {} : { "recaptcha-ca-t": sessionCookie }),
    ...(eligibilityCookie === undefined
      ? {}
      : { "recaptcha-ca-e": eligibilityCookie }),
  };

  return {
    token,
    ...(userAgent === undefined ? {} : { userAgent }),
    ...(headers === undefined ? {} : { headers }),
    ...(Object.keys(cookies).length === 0 ? {} : { cookies }),
  };
}

function validateChallenge(challenge: RecaptchaEnterpriseV3Challenge): void {
  if (challenge.type !== "recaptcha-enterprise-v3") {
    throw new TypeError(`Unsupported CAPTCHA type: ${String(challenge.type)}`);
  }

  const websiteUrl = new URL(challenge.websiteUrl);
  if (websiteUrl.protocol !== "https:" && websiteUrl.protocol !== "http:") {
    throw new TypeError("CAPTCHA website URL must use HTTP or HTTPS");
  }
  if (challenge.websiteKey.trim().length === 0) {
    throw new TypeError("CAPTCHA website key cannot be empty");
  }
  if (challenge.pageAction.trim().length === 0) {
    throw new TypeError("CAPTCHA page action cannot be empty");
  }
}

function apiError(
  response: Record<string, unknown>,
  fallback: string,
): CapSolverError {
  const description = stringProperty(response, "errorDescription");
  const code = stringProperty(response, "errorCode");
  return new CapSolverError(description ?? fallback, code);
}

function endpoint(value: string | URL): URL {
  const parsed = new URL(value);
  if (!parsed.pathname.endsWith("/")) parsed.pathname += "/";
  return parsed;
}

function nonEmptyOptional(
  value: string | undefined,
  name: string,
): string | undefined {
  if (value === undefined) return undefined;
  if (value.trim().length === 0) throw new TypeError(`${name} cannot be empty`);
  return value;
}

/** Convert a conventional proxy URL into CapSolver's colon-delimited format. */
function capSolverProxy(value: string): string {
  const proxy = nonEmptyOptional(value, "CapSolver proxy");
  if (proxy === undefined) throw new TypeError("CapSolver proxy cannot be empty");
  if (/^(?:http|https|socks4|socks5):[^/]/i.test(proxy)) return proxy;

  let parsed: URL;
  try {
    parsed = new URL(proxy);
  } catch {
    throw new TypeError("CapSolver proxy must be a valid proxy URL");
  }

  const protocol = parsed.protocol === "socks5h:"
    ? "socks5"
    : parsed.protocol.slice(0, -1);
  if (!["http", "https", "socks4", "socks5"].includes(protocol)) {
    throw new TypeError(
      "CapSolver proxy must use HTTP, HTTPS, SOCKS4, SOCKS5, or SOCKS5H",
    );
  }
  if (parsed.hostname.length === 0) {
    throw new TypeError("CapSolver proxy must contain a hostname");
  }

  const port = parsed.port || defaultProxyPort(protocol);
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  return username.length === 0 && password.length === 0
    ? `${protocol}:${parsed.hostname}:${port}`
    : `${protocol}:${parsed.hostname}:${port}:${username}:${password}`;
}

function defaultProxyPort(protocol: string): string {
  if (protocol === "http") return "80";
  if (protocol === "https") return "443";
  return "1080";
}

function nonNegativeDuration(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
  return value;
}

function positiveDuration(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive finite number`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringProperty(
  value: Record<string, unknown>,
  name: string,
): string | undefined {
  const property = value[name];
  return typeof property === "string" ? property : undefined;
}

function delay(milliseconds: number, signal: AbortSignal | undefined) {
  signal?.throwIfAborted();

  if (milliseconds === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(finish, milliseconds);

    function finish(): void {
      signal?.removeEventListener("abort", abort);
      resolve();
    }

    function abort(): void {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    }

    signal?.addEventListener("abort", abort, { once: true });
  });
}
