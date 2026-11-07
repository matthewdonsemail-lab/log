import { load } from "cheerio/slim";

/** Hidden field names in Reddit's edge-challenge form. */
const FIELD = {
  marker: "js_challenge",
  originalRedirect: "jsc_orig_r",
  solution: "solution",
  token: "token",
} as const;

/** The observed form declares the transparent challenge with this flag. */
const CHALLENGE_FLAG = "1";

/** Browsers submit Reddit's challenge form as a same-origin GET request. */
const FORM_METHOD = "GET";

/** The current script duplicates one 16-character hexadecimal seed. */
const SOLUTION_COPIES = 2;
const SEED_PATTERN =
  /await\s*\(\s*async\s+([A-Za-z_$][\w$]*)\s*=>\s*\1\s*\+\s*\1\s*\)\(\s*["']([0-9a-f]{16})["']\s*\)/i;

/** Reject anything that's not a 64-character hexadecimal token. */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

/** Cookie Reddit sets alongside the observed anonymous edge challenge. */
export const REDDIT_EDGE_COOKIE_NAME = "edgebucket";

/** Reddit returned a JavaScript challenge shape we do not support. */
export class UnsupportedRedditJavaScriptChallengeError extends Error {
  override readonly name = "UnsupportedRedditJavaScriptChallengeError";
}

/** Reddit's JavaScript challenge. */
export class RedditJavaScriptChallenge {
  readonly #action: URL;
  readonly #token: string;

  private constructor(
    action: URL,
    readonly seed: string,
    token: string,
    readonly originalRedirect: string,
  ) {
    this.#action = new URL(action);
    this.#token = token;
  }

  get action(): URL {
    return new URL(this.#action);
  }

  get solution(): string {
    return this.seed.repeat(SOLUTION_COPIES);
  }

  /** Parse the observed seed-duplication challenge without executing its JS. */
  static parse(
    responseUrl: string | URL,
    html: string,
  ): RedditJavaScriptChallenge | undefined {
    const $ = load(html, undefined, false);
    const markerInput = $(`input[name="${FIELD.marker}"]`).first();
    if (markerInput.length === 0) return undefined;

    const form = markerInput.closest("form");
    if (form.length === 0) fail("challenge form is missing");

    const fields = new Map(
      form
        .find("input[name]")
        .toArray()
        .map(
          (input): [string, string] => [
            $(input).attr("name") ?? "",
            $(input).attr("value") ?? "",
          ],
        ),
    );
    const marker = markerInput.attr("value") ?? "";
    if (marker !== CHALLENGE_FLAG || !fields.has(FIELD.solution)) {
      fail("challenge form fields are invalid");
    }

    const method = form.attr("method")?.toUpperCase() ?? FORM_METHOD;
    if (method !== FORM_METHOD) fail(`unsupported form method: ${method}`);

    const sourceUrl = new URL(responseUrl);
    const action = new URL(
      form.attr("action") ?? fail("form action is missing"),
      sourceUrl,
    );
    if (action.origin !== sourceUrl.origin) {
      fail("challenge form action is not same-origin");
    }

    const token = fields.get(FIELD.token) ?? fail("token is missing");
    if (!TOKEN_PATTERN.test(token)) fail("challenge token is invalid");

    const originalRedirect =
      fields.get(FIELD.originalRedirect) ??
      fail("original redirect field is missing");
    const seed =
      html.match(SEED_PATTERN)?.[2] ??
      fail("seed-duplication script is missing");

    return new RedditJavaScriptChallenge(
      action,
      seed,
      token,
      originalRedirect,
    );
  }

  /** Reproduce the GET submission made by Reddit's hidden form. */
  createSubmissionUrl(originalRequestUrl: string | URL): URL {
    const originalUrl = new URL(originalRequestUrl);
    if (originalUrl.origin !== this.#action.origin) {
      throw new TypeError(
        "original request and challenge action must be same-origin",
      );
    }

    const submissionUrl = new URL(this.#action);
    submissionUrl.search = "";
    submissionUrl.searchParams.set(FIELD.solution, this.solution);
    submissionUrl.searchParams.set(FIELD.marker, CHALLENGE_FLAG);
    submissionUrl.searchParams.set(FIELD.token, this.#token);
    submissionUrl.searchParams.set(
      FIELD.originalRedirect,
      this.originalRedirect,
    );

    for (const [name, value] of originalUrl.searchParams) {
      submissionUrl.searchParams.append(name, value);
    }

    return submissionUrl;
  }
}

function fail(message: string): never {
  throw new UnsupportedRedditJavaScriptChallengeError(message);
}
