import { load } from "cheerio/slim";

import type { AuthenticatedRedditAuthenticationContext } from "./authentication.js";
import type {
  CaptchaSolution,
  CaptchaSolver,
  RecaptchaEnterpriseV3Challenge,
} from "./captcha.js";
import { RedditJavaScriptChallenge } from "./challenge.js";
import type { RedditFetchTransport } from "./feed.js";
import {
  normalizeRedditProxy,
  type RedditProxy,
} from "./session.js";

const DEFAULT_REDDIT_ORIGIN = "https://www.reddit.com/";
const HTML_ACCEPT = "text/html";
const PARTIAL_HTML_ACCEPT = "text/vnd.reddit.partial+html";
const POST_ID = /^(?:t3_)?([a-z0-9]+)$/i;
const POST_PATH = /^\/(?:r\/[^/]+\/)?comments\/[a-z0-9]+(?:\/[^/?#]*)?\/?$/i;
const MORE_COMMENTS_PATH =
  /^\/svc\/shreddit\/more-comments\/r\/[^/]+\/t3_[a-z0-9]+$/i;
const COMMENT_CAPTCHA_ACTION = "comment_submit";
const POST_CAPTCHA_ACTION = "post_submit";
const GRAPHQL_PATH = "/svc/shreddit/graphql";
const JSON_ACCEPT = "application/json";
const JSON_CONTENT_TYPE = "application/json";
const URL_ENCODED = "application/x-www-form-urlencoded";
const RESERVED_CAPTCHA_HEADERS = new Set([
  "accept",
  "content-length",
  "content-type",
  "cookie",
  "host",
  "origin",
  "referer",
]);

export type RedditCommentSort =
  | "best"
  | "top"
  | "new"
  | "controversial"
  | "old"
  | "qa";

export interface RedditPostClientOptions {
  /** Override Reddit's origin for testing or a compatible frontend. */
  readonly origin?: string | URL;
  /** Solver used for Reddit's post and comment reCAPTCHA tokens. */
  readonly captchaSolver?: CaptchaSolver<RecaptchaEnterpriseV3Challenge>;
  /** Proxy the solver must use for Reddit-bound CAPTCHA work. */
  readonly proxy?: RedditProxy;
}

export interface RedditPostRequest {
  readonly signal?: AbortSignal | null;
  readonly sort?: RedditCommentSort;
}

export interface RedditMoreCommentsRequest {
  readonly signal?: AbortSignal | null;
}

export interface RedditCommentReplyRequest {
  /** Plain text converted to Reddit's RTJSON document format. */
  readonly text: string;
  readonly signal?: AbortSignal | null;
}

export interface RedditTextPostCreateRequest {
  /** Community name, with or without the `r/` prefix. */
  readonly subreddit: string;
  readonly title: string;
  /** Optional Reddit-flavored Markdown body. */
  readonly text?: string;
  /** A flair returned by `getFlairs()`, or its exact id/display text. */
  readonly flair?: RedditPostFlair | string;
  readonly nsfw?: boolean;
  readonly spoiler?: boolean;
  readonly signal?: AbortSignal | null;
}

/** A post flair currently offered by a subreddit. */
export interface RedditPostFlair {
  readonly id: string;
  readonly text: string;
}

export interface RedditPostFlairRequest {
  readonly signal?: AbortSignal | null;
}

/** Stable fields returned by Reddit after creating a text post. */
export interface RedditCreatedPost {
  readonly id: `t3_${string}`;
  readonly permalink: string;
}

export interface RedditVoteRequest {
  readonly signal?: AbortSignal | null;
}

/** Vote state accepted by Reddit for both posts and comments. */
export type RedditVoteState = "up" | "down" | "none";

export interface RedditPost {
  readonly author: string | null;
  readonly authorId: string | null;
  readonly awardCount: number | null;
  readonly body: string | null;
  readonly bodyHtml: string | null;
  readonly commentCount: number | null;
  readonly contentHref: string | null;
  readonly createdAt: string | null;
  readonly domain: string | null;
  readonly id: `t3_${string}`;
  readonly permalink: string;
  readonly postType: string | null;
  readonly score: number | null;
  readonly subredditId: string | null;
  readonly subredditName: string | null;
  readonly subredditPrefixedName: string | null;
  readonly title: string;
  readonly upvoteRatio: number | null;
}

export interface RedditComment {
  readonly author: string | null;
  readonly awardCount: number | null;
  readonly body: string | null;
  readonly bodyHtml: string | null;
  readonly contentType: string | null;
  readonly createdAt: string | null;
  readonly depth: number | null;
  readonly id: `t1_${string}`;
  readonly moreRepliesCount: number | null;
  /** Opaque URL accepted by `RedditPostClient.getMoreComments()`. */
  readonly moreRepliesUrl: string | null;
  readonly parentId: `t1_${string}` | null;
  readonly parentPositions: readonly number[];
  readonly permalink: string;
  readonly position: number | null;
  readonly postId: `t3_${string}`;
  readonly score: number | null;
}

/** Pure parser result before a transport-bound paginator is attached. */
export interface RedditPostPage {
  /** reCAPTCHA contract used when creating comments on this page. */
  readonly commentCaptcha: RecaptchaEnterpriseV3Challenge | null;
  readonly comments: readonly RedditComment[];
  /** Opaque URL accepted by `RedditPostClient.getMoreComments()`. */
  readonly nextCommentsPageUrl: string | null;
  readonly post: RedditPost;
  readonly requestUrl: string;
}

export interface RedditCommentPage {
  readonly comments: readonly RedditComment[];
  /** Opaque URL accepted by `RedditPostClient.getMoreComments()`. */
  readonly nextPageUrl: string | null;
  readonly requestUrl: string;
}

export interface RedditCommentCollectOptions extends RedditMoreCommentsRequest {
  /** Maximum number of unique comments to return. */
  readonly maxComments: number;
}

type RedditCommentPageFetcher = (
  pageUrl: string,
  request?: RedditMoreCommentsRequest,
) => Promise<RedditCommentPage>;

/** Lazy, reusable view over Reddit's opaque comment and reply cursors. */
export class RedditCommentListing implements AsyncIterable<RedditComment> {
  readonly #expandNestedReplies: boolean;
  readonly #fetchPage: RedditCommentPageFetcher;
  readonly #initialPage: RedditCommentPage;
  readonly #yieldInitialPage: boolean;

  constructor(
    initialPage: RedditCommentPage,
    fetchPage: RedditCommentPageFetcher,
    options: {
      readonly expandNestedReplies?: boolean;
      readonly yieldInitialPage?: boolean;
    } = {},
  ) {
    this.#initialPage = initialPage;
    this.#fetchPage = fetchPage;
    this.#expandNestedReplies = options.expandNestedReplies ?? false;
    this.#yieldInitialPage = options.yieldInitialPage ?? true;
  }

  /** Comments already present in the response that created this listing. */
  get loaded(): readonly RedditComment[] {
    return this.#initialPage.comments;
  }

  /** First opaque continuation URL, retained for advanced/debugging use. */
  get nextPageUrl(): string | null {
    return this.#initialPage.nextPageUrl;
  }

  /** Iterate response pages while the SDK follows Reddit's cursors. */
  async *pages(
    request: RedditMoreCommentsRequest = {},
  ): AsyncGenerator<RedditCommentPage> {
    const cursors: string[] = [];
    const seenCursors = new Set<string>();
    const enqueue = (value: string | null): void => {
      if (value !== null && !seenCursors.has(value) && !cursors.includes(value)) {
        cursors.push(value);
      }
    };
    const enqueuePage = (page: RedditCommentPage): void => {
      enqueue(page.nextPageUrl);
      if (this.#expandNestedReplies) {
        for (const comment of page.comments) enqueue(comment.moreRepliesUrl);
      }
    };

    if (this.#yieldInitialPage) yield this.#initialPage;
    enqueuePage(this.#initialPage);

    while (cursors.length > 0) {
      request.signal?.throwIfAborted();
      const cursor = cursors.shift();
      if (cursor === undefined || seenCursors.has(cursor)) continue;
      seenCursors.add(cursor);

      const page = await this.#fetchPage(cursor, request);
      yield page;
      enqueuePage(page);
    }
  }

  /** Iterate unique comments rather than transport pages. */
  async *values(
    request: RedditMoreCommentsRequest = {},
  ): AsyncGenerator<RedditComment> {
    const seenComments = new Set<string>();
    for await (const page of this.pages(request)) {
      for (const comment of page.comments) {
        if (seenComments.has(comment.id)) continue;
        seenComments.add(comment.id);
        yield comment;
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<RedditComment> {
    return this.values();
  }

  /** Collect a bounded number of comments into memory. */
  async collect(
    options: RedditCommentCollectOptions,
  ): Promise<readonly RedditComment[]> {
    if (!Number.isSafeInteger(options.maxComments) || options.maxComments <= 0) {
      throw new TypeError("maxComments must be a positive safe integer");
    }

    const comments: RedditComment[] = [];
    const request =
      options.signal === undefined ? {} : { signal: options.signal };
    for await (const comment of this.values(request)) {
      comments.push(comment);
      if (comments.length >= options.maxComments) break;
    }
    return comments;
  }

  /** Iterate loaded and omitted descendants of one comment. */
  repliesOf(comment: RedditComment): RedditCommentListing {
    const descendants = loadedDescendants(comment.id, this.loaded);
    return new RedditCommentListing(
      {
        comments: descendants,
        nextPageUrl: comment.moreRepliesUrl,
        requestUrl: this.#initialPage.requestUrl,
      },
      this.#fetchPage,
      {
        expandNestedReplies: true,
        yieldInitialPage: descendants.length > 0,
      },
    );
  }
}

/** A post plus a transport-bound, lazily paginated comment listing. */
export class RedditPostThread {
  constructor(
    readonly post: RedditPost,
    readonly comments: RedditCommentListing,
    readonly requestUrl: string,
  ) {}

  /** @deprecated Prefer iterating `comments`; retained as a raw escape hatch. */
  get nextCommentsPageUrl(): string | null {
    return this.comments.nextPageUrl;
  }
}

/** Reddit returned a non-success status while loading a post or comments. */
export class RedditPostRequestError extends Error {
  override readonly name = "RedditPostRequestError";

  constructor(
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(`Reddit post request failed with HTTP ${status}`);
  }
}

/** Reddit returned a successful page without the expected post contract. */
export class RedditPostContractError extends Error {
  override readonly name = "RedditPostContractError";

  constructor(readonly requestUrl: string) {
    super("Reddit response did not contain a valid Shreddit post");
  }
}

/** The session must complete Reddit's edge challenge before retrying. */
export class RedditPostChallengeRequiredError extends Error {
  override readonly name = "RedditPostChallengeRequiredError";

  constructor(readonly challenge: RedditJavaScriptChallenge) {
    super("Reddit returned a JavaScript challenge instead of a post page");
  }
}

/** A comment mutation needs a solver or a discoverable reCAPTCHA contract. */
export class RedditCommentCaptchaRequiredError extends Error {
  override readonly name = "RedditCommentCaptchaRequiredError";

  constructor(message: string) {
    super(message);
  }
}

/** Reddit rejected a comment or returned an error fragment. */
export class RedditCommentRequestError extends Error {
  override readonly name = "RedditCommentRequestError";

  constructor(
    message: string,
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(message);
  }
}

/** Reddit accepted a comment request without returning the created comment. */
export class RedditCommentContractError extends Error {
  override readonly name = "RedditCommentContractError";

  constructor(readonly requestUrl: string) {
    super("Reddit response did not contain the created Shreddit comment");
  }
}

/** A text-post mutation needs a solver or a discoverable reCAPTCHA contract. */
export class RedditPostCaptchaRequiredError extends Error {
  override readonly name = "RedditPostCaptchaRequiredError";

  constructor(message: string) {
    super(message);
  }
}

/** Reddit rejected a text-post mutation. */
export class RedditPostCreateRequestError extends Error {
  override readonly name = "RedditPostCreateRequestError";

  constructor(
    message: string,
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(message);
  }
}

/** Reddit accepted a text-post request without returning the created post. */
export class RedditPostCreateContractError extends Error {
  override readonly name = "RedditPostCreateContractError";

  constructor(readonly requestUrl: string) {
    super("Reddit response did not contain the created Shreddit post");
  }
}

/** Reddit rejected the authenticated post-flair listing request. */
export class RedditPostFlairRequestError extends Error {
  override readonly name = "RedditPostFlairRequestError";

  constructor(
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(`Reddit post-flair request failed with HTTP ${status}`);
  }
}

/** Reddit returned a post-flair response with an unexpected JSON shape. */
export class RedditPostFlairContractError extends Error {
  override readonly name = "RedditPostFlairContractError";

  constructor(readonly requestUrl: string) {
    super("Reddit response did not contain a valid post-flair listing");
  }
}

/** Reddit rejected a post or comment vote mutation. */
export class RedditVoteRequestError extends Error {
  override readonly name = "RedditVoteRequestError";

  constructor(
    message: string,
    readonly status: number,
    readonly requestUrl: string,
  ) {
    super(message);
  }
}

/** Reddit accepted a vote request without returning a valid vote state. */
export class RedditVoteContractError extends Error {
  override readonly name = "RedditVoteContractError";

  constructor(readonly requestUrl: string) {
    super("Reddit response did not contain a valid vote result");
  }
}

export type RedditReplyTarget = RedditPostThread | RedditPost | RedditComment;
/** Minimal shape accepted for parsed feed posts, post pages, and comments. */
export interface RedditVoteThing {
  readonly id: RedditPost["id"] | RedditComment["id"];
}

export type RedditVoteTarget =
  | RedditPostThread
  | RedditVoteThing
  | RedditPost["id"]
  | RedditComment["id"];

interface RedditPostComposerPage {
  readonly captcha: RecaptchaEnterpriseV3Challenge | null;
}

/** Authenticated reader and writer for Reddit posts and comments. */
export class RedditPostClient {
  readonly #captchaSolver:
    | CaptchaSolver<RecaptchaEnterpriseV3Challenge>
    | undefined;
  readonly #commentCaptchas = new Map<
    RedditPost["id"],
    RecaptchaEnterpriseV3Challenge
  >();
  readonly #origin: URL;
  readonly #proxy: string | undefined;

  constructor(
    readonly transport: RedditFetchTransport,
    readonly authentication: AuthenticatedRedditAuthenticationContext,
    options: RedditPostClientOptions = {},
  ) {
    this.#origin = normalizeOrigin(options.origin ?? DEFAULT_REDDIT_ORIGIN);
    this.#captchaSolver = options.captchaSolver;
    this.#proxy = options.proxy === undefined
      ? undefined
      : normalizeRedditProxy(options.proxy);
  }

  async get(
    post: string | URL,
    request: RedditPostRequest = {},
  ): Promise<RedditPostThread> {
    const requestUrl = this.#createPostUrl(post, request.sort);
    const response = await this.transport.fetch(requestUrl, {
      headers: {
        accept: HTML_ACCEPT,
        referer: this.#origin.href,
      },
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });

    const html = await successfulHtml(response, requestUrl);
    const page = parseRedditPost(
      html,
      response.url.length === 0 ? requestUrl : response.url,
    );
    if (page.commentCaptcha !== null) {
      this.#commentCaptchas.set(page.post.id, page.commentCaptcha);
    }
    const comments = new RedditCommentListing(
      {
        comments: page.comments,
        nextPageUrl: page.nextCommentsPageUrl,
        requestUrl: page.requestUrl,
      },
      (pageUrl, pageRequest) => this.getMoreComments(pageUrl, pageRequest),
    );
    return new RedditPostThread(page.post, comments, page.requestUrl);
  }

  async getMoreComments(
    pageUrl: string | URL,
    request: RedditMoreCommentsRequest = {},
  ): Promise<RedditCommentPage> {
    const requestUrl = this.#createCommentsPageUrl(pageUrl);
    const response = await this.transport.fetch(requestUrl, {
      method: "POST",
      headers: {
        accept: PARTIAL_HTML_ACCEPT,
        referer: this.#origin.href,
      },
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });

    const html = await successfulHtml(response, requestUrl);
    return parseRedditComments(
      html,
      response.url.length === 0 ? requestUrl : response.url,
    );
  }

  /** List post flairs currently offered by a subreddit. */
  async getFlairs(
    subreddit: string,
    request: RedditPostFlairRequest = {},
  ): Promise<readonly RedditPostFlair[]> {
    request.signal?.throwIfAborted();
    return this.#loadPostFlairs(
      normalizeSubredditName(subreddit),
      request.signal,
    );
  }

  /** Create a text post using Reddit's current Shreddit composer contract. */
  async create(
    request: RedditTextPostCreateRequest,
  ): Promise<RedditCreatedPost> {
    request.signal?.throwIfAborted();
    const subreddit = normalizeSubredditName(request.subreddit);
    const title = normalizePostTitle(request.title);
    const composer = await this.#loadPostComposer(subreddit, request.signal);
    const availableFlairs = request.flair === undefined
      ? []
      : await this.#loadPostFlairs(subreddit, request.signal);
    const flair = resolvePostFlair(request.flair, availableFlairs, subreddit);
    const challenge = composer.captcha;
    if (challenge === null) {
      throw new RedditPostCaptchaRequiredError(
        "Reddit post composer did not expose its reCAPTCHA contract",
      );
    }
    if (this.#captchaSolver === undefined) {
      throw new RedditPostCaptchaRequiredError(
        "Reddit text post creation requires a CAPTCHA solver",
      );
    }

    const solution = await this.#captchaSolver.solve(challenge, {
      ...(this.#proxy === undefined ? {} : { proxy: this.#proxy }),
      ...(request.signal === undefined || request.signal === null
        ? {}
        : { signal: request.signal }),
    });
    applyCaptchaCookies(this.transport, this.#origin, solution);

    const requestUrl = new URL(GRAPHQL_PATH, this.#origin);
    const csrfToken = getCsrfToken(
      this.transport,
      this.#origin,
      (message) =>
        new RedditPostCreateRequestError(message, 0, requestUrl.href),
    );
    const text = normalizePostBody(request.text);
    const body = JSON.stringify({
      operation: "CreatePost",
      variables: {
        input: {
          isNsfw: request.nsfw ?? false,
          isSpoiler: request.spoiler ?? false,
          title,
          isCommercialCommunication: false,
          targetLanguage: "",
          recaptchaToken: solution.token,
          content: text === null ? null : { markdown: text },
          ...(flair === null ? {} : { flair }),
          subredditName: subreddit,
          correlationId: "",
        },
      },
      csrf_token: csrfToken,
    });
    const response = await this.transport.fetch(requestUrl, {
      method: "POST",
      headers: {
        ...captchaHeaders(solution),
        accept: JSON_ACCEPT,
        "content-type": JSON_CONTENT_TYPE,
        origin: this.#origin.origin,
        referer: challenge.websiteUrl,
      },
      body,
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });
    const responseText = await response.text();
    const responseUrl = new URL(
      response.url.length === 0 ? requestUrl : response.url,
    );
    throwForChallenge(responseText, responseUrl);
    if (!response.ok) {
      throw new RedditPostCreateRequestError(
        responseText ||
          `Reddit text-post request failed with HTTP ${response.status}`,
        response.status,
        requestUrl.href,
      );
    }
    return parseCreatedPost(responseText, requestUrl.href, this.#origin);
  }

  /** Set or clear a post/comment vote and return Reddit's confirmed state. */
  async vote(
    target: RedditVoteTarget,
    state: RedditVoteState,
    request: RedditVoteRequest = {},
  ): Promise<RedditVoteState> {
    request.signal?.throwIfAborted();
    const id = voteTargetId(target);
    const isPost = id.startsWith("t3_");
    const requestUrl = new URL(GRAPHQL_PATH, this.#origin);
    const csrfToken = getCsrfToken(
      this.transport,
      this.#origin,
      (message) => new RedditVoteRequestError(message, 0, requestUrl.href),
    );
    const body = JSON.stringify({
      operation: isPost
        ? "UpdatePostVoteState"
        : "UpdateCommentVoteState",
      variables: {
        input: {
          [isPost ? "postId" : "commentId"]: id,
          voteState: graphqlVoteState(state),
        },
      },
      csrf_token: csrfToken,
    });
    const response = await this.transport.fetch(requestUrl, {
      method: "POST",
      headers: {
        accept: JSON_ACCEPT,
        "content-type": JSON_CONTENT_TYPE,
        origin: this.#origin.origin,
        referer: this.#origin.href,
      },
      body,
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });
    const responseText = await response.text();
    if (!response.ok) {
      throw new RedditVoteRequestError(
        responseText || `Reddit vote request failed with HTTP ${response.status}`,
        response.status,
        requestUrl.href,
      );
    }
    return parseVoteResult(responseText, isPost, requestUrl.href);
  }

  upvote(
    target: RedditVoteTarget,
    request: RedditVoteRequest = {},
  ): Promise<RedditVoteState> {
    return this.vote(target, "up", request);
  }

  downvote(
    target: RedditVoteTarget,
    request: RedditVoteRequest = {},
  ): Promise<RedditVoteState> {
    return this.vote(target, "down", request);
  }

  /** Remove either an upvote or a downvote. */
  unvote(
    target: RedditVoteTarget,
    request: RedditVoteRequest = {},
  ): Promise<RedditVoteState> {
    return this.vote(target, "none", request);
  }

  /** Create a top-level comment or reply to an existing comment. */
  async reply(
    target: RedditReplyTarget,
    request: RedditCommentReplyRequest,
  ): Promise<RedditComment> {
    request.signal?.throwIfAborted();
    const content = plainTextRtjson(request.text);
    const replyTarget = await this.#resolveReplyTarget(target, request.signal);
    const challenge = this.#commentCaptchas.get(replyTarget.postId);
    if (challenge === undefined) {
      throw new RedditCommentCaptchaRequiredError(
        "Reddit post page did not expose its comment reCAPTCHA contract",
      );
    }
    if (this.#captchaSolver === undefined) {
      throw new RedditCommentCaptchaRequiredError(
        "Reddit comment creation requires a CAPTCHA solver",
      );
    }

    const solution = await this.#captchaSolver.solve(challenge, {
      ...(this.#proxy === undefined ? {} : { proxy: this.#proxy }),
      ...(request.signal === undefined || request.signal === null
        ? {}
        : { signal: request.signal }),
    });
    applyCaptchaCookies(this.transport, this.#origin, solution);

    const csrfToken = getCsrfToken(
      this.transport,
      this.#origin,
      (message) => new RedditCommentRequestError(message, 0, this.#origin.href),
    );
    const requestUrl = new URL(
      `/svc/shreddit/${replyTarget.postId}/create-comment`,
      this.#origin,
    );
    const body = new URLSearchParams({
      csrf_token: csrfToken,
      content,
      recaptchaToken: solution.token,
      ...(replyTarget.parentId === null
        ? {}
        : {
            parentId: replyTarget.parentId,
            commentDepth: String(replyTarget.commentDepth),
          }),
    });
    const response = await this.transport.fetch(requestUrl, {
      method: "POST",
      headers: {
        ...captchaHeaders(solution),
        accept: PARTIAL_HTML_ACCEPT,
        "content-type": URL_ENCODED,
        origin: this.#origin.origin,
        referer: challenge.websiteUrl,
      },
      body,
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });
    const html = await response.text();
    const responseUrl = new URL(
      response.url.length === 0 ? requestUrl : response.url,
    );
    throwForChallenge(html, responseUrl);

    const alertMessage = load(html, undefined, false)("faceplate-alert")
      .first()
      .attr("message");
    if (!response.ok || alertMessage !== undefined) {
      throw new RedditCommentRequestError(
        alertMessage ?? `Reddit comment request failed with HTTP ${response.status}`,
        response.status,
        requestUrl.href,
      );
    }

    const comment = parseRedditComments(html, responseUrl).comments[0];
    if (comment === undefined) {
      throw new RedditCommentContractError(requestUrl.href);
    }
    return comment;
  }

  async #resolveReplyTarget(
    target: RedditReplyTarget,
    signal: AbortSignal | null | undefined,
  ): Promise<{
    commentDepth: number;
    parentId: RedditComment["id"] | null;
    postId: RedditPost["id"];
  }> {
    if (target instanceof RedditPostThread) {
      return { commentDepth: 0, parentId: null, postId: target.post.id };
    }
    if (target.id.startsWith("t1_")) {
      const comment = target as RedditComment;
      if (comment.depth === null) {
        throw new TypeError("Reddit comment depth is required to create a reply");
      }
      if (!this.#commentCaptchas.has(comment.postId)) {
        await this.get(postPermalink(comment.permalink, this.#origin), {
          ...(signal === undefined ? {} : { signal }),
        });
      }
      return {
        commentDepth: comment.depth + 1,
        parentId: comment.id,
        postId: comment.postId,
      };
    }

    const post = target as RedditPost;
    if (!this.#commentCaptchas.has(post.id)) {
      await this.get(post.permalink, {
        ...(signal === undefined ? {} : { signal }),
      });
    }
    return { commentDepth: 0, parentId: null, postId: post.id };
  }

  async #loadPostComposer(
    subreddit: string,
    signal: AbortSignal | null | undefined,
  ): Promise<RedditPostComposerPage> {
    const requestUrl = new URL(
      `/r/${encodeURIComponent(subreddit)}/submit/?type=TEXT`,
      this.#origin,
    );
    const response = await this.transport.fetch(requestUrl, {
      headers: {
        accept: HTML_ACCEPT,
        referer: this.#origin.href,
      },
      ...(signal === undefined ? {} : { signal }),
    });
    const html = await successfulHtml(response, requestUrl);
    const responseUrl = new URL(
      response.url.length === 0 ? requestUrl : response.url,
    );
    const $ = load(html, undefined, false);
    return {
      captcha: parseRecaptchaChallenge($, responseUrl, POST_CAPTCHA_ACTION),
    };
  }

  async #loadPostFlairs(
    subreddit: string,
    signal: AbortSignal | null | undefined,
  ): Promise<readonly RedditPostFlair[]> {
    const requestUrl = new URL(
      `/r/${encodeURIComponent(subreddit)}/api/link_flair_v2.json`,
      this.#origin,
    );
    const response = await this.transport.fetch(requestUrl, {
      headers: {
        accept: JSON_ACCEPT,
        referer: new URL(
          `/r/${encodeURIComponent(subreddit)}/submit/?type=TEXT`,
          this.#origin,
        ).href,
      },
      ...(signal === undefined ? {} : { signal }),
    });
    const responseText = await response.text();
    const responseUrl = new URL(
      response.url.length === 0 ? requestUrl : response.url,
    );
    throwForChallenge(responseText, responseUrl);
    if (!response.ok) {
      throw new RedditPostFlairRequestError(response.status, responseUrl.href);
    }
    return parsePostFlairs(responseText, responseUrl.href);
  }

  #createPostUrl(post: string | URL, sort: RedditCommentSort | undefined): URL {
    const value = post instanceof URL ? post.href : post.trim();
    const id = typeof value === "string" ? POST_ID.exec(value)?.[1] : undefined;
    const url = id === undefined
      ? new URL(value, this.#origin)
      : new URL(`/comments/${id}/`, this.#origin);

    if (url.origin !== this.#origin.origin || !POST_PATH.test(url.pathname)) {
      throw new TypeError(
        "Reddit post must be a same-origin post permalink or post id",
      );
    }
    if (sort !== undefined) {
      if (!isCommentSort(sort)) {
        throw new TypeError(`Unsupported Reddit comment sort: ${sort}`);
      }
      url.searchParams.set("sort", sort);
    }
    url.hash = "";
    return url;
  }

  #createCommentsPageUrl(pageUrl: string | URL): URL {
    const url = new URL(pageUrl, this.#origin);
    if (
      url.origin !== this.#origin.origin ||
      !MORE_COMMENTS_PATH.test(url.pathname)
    ) {
      throw new TypeError(
        "Reddit comments pageUrl must target the configured more-comments endpoint",
      );
    }
    url.hash = "";
    return url;
  }
}

/** Parse one complete Shreddit post page without making a request. */
export function parseRedditPost(
  html: string,
  responseUrl: string | URL,
): RedditPostPage {
  const $ = load(html, undefined, false);
  const sourceUrl = new URL(responseUrl);
  throwForChallenge(html, sourceUrl);

  const element = $("shreddit-post").first();
  const id = element.attr("id");
  const permalink = element.attr("permalink");
  if (!isPostId(id) || permalink === undefined || permalink.length === 0) {
    throw new RedditPostContractError(sourceUrl.href);
  }

  const body = element.find(`[id="${id}-post-rtjson-content"]`).first();
  const commentPage = parseCommentDocument($, sourceUrl);
  return {
    commentCaptcha: parseCommentCaptcha($, sourceUrl),
    post: {
      author: attributeOrNull(element.attr("author")),
      authorId: attributeOrNull(element.attr("author-id")),
      awardCount: integerOrNull(element.attr("award-count")),
      body: elementTextOrNull(body.text()),
      bodyHtml: htmlOrNull(body.html()),
      commentCount: integerOrNull(element.attr("comment-count")),
      contentHref: attributeOrNull(element.attr("content-href")),
      createdAt: attributeOrNull(element.attr("created-timestamp")),
      domain: attributeOrNull(element.attr("domain")),
      id,
      permalink,
      postType: attributeOrNull(element.attr("post-type")),
      score: integerOrNull(element.attr("score")),
      subredditId: attributeOrNull(element.attr("subreddit-id")),
      subredditName: attributeOrNull(element.attr("subreddit-name")),
      subredditPrefixedName: attributeOrNull(
        element.attr("subreddit-prefixed-name"),
      ),
      title: normalizeText(
        element.attr("post-title") ??
          element.find('[slot="title"], h1').first().text(),
      ),
      upvoteRatio: numberOrNull(element.attr("upvote-ratio")),
    },
    comments: commentPage.comments,
    nextCommentsPageUrl: commentPage.nextPageUrl,
    requestUrl: sourceUrl.href,
  };
}

function parseCommentCaptcha(
  $: ReturnType<typeof load>,
  sourceUrl: URL,
): RecaptchaEnterpriseV3Challenge | null {
  return parseRecaptchaChallenge($, sourceUrl, COMMENT_CAPTCHA_ACTION);
}

function parseRecaptchaChallenge(
  $: ReturnType<typeof load>,
  sourceUrl: URL,
  pageAction: string,
): RecaptchaEnterpriseV3Challenge | null {
  const componentKey = $("reputation-recaptcha[site-key]")
    .first()
    .attr("site-key");
  if (componentKey !== undefined && componentKey.length > 0) {
    return recaptchaChallenge(sourceUrl, componentKey, pageAction);
  }

  for (const element of $("script[src]").toArray()) {
    const source = $(element).attr("src");
    if (source === undefined) continue;

    const url = new URL(source, sourceUrl);
    const websiteKey = url.searchParams.get("render");
    if (
      (url.hostname !== "google.com" && !url.hostname.endsWith(".google.com")) ||
      !url.pathname.endsWith("/recaptcha/enterprise.js") ||
      websiteKey === null ||
      websiteKey.length === 0
    ) {
      continue;
    }
    return recaptchaChallenge(sourceUrl, websiteKey, pageAction);
  }
  return null;
}

function recaptchaChallenge(
  websiteUrl: URL,
  websiteKey: string,
  pageAction: string,
): RecaptchaEnterpriseV3Challenge {
  return {
    type: "recaptcha-enterprise-v3",
    websiteUrl: websiteUrl.href,
    websiteKey,
    pageAction,
  };
}

function parsePostFlairs(
  responseText: string,
  requestUrl: string,
): readonly RedditPostFlair[] {
  let payload: unknown;
  try {
    payload = JSON.parse(responseText) as unknown;
  } catch {
    throw new RedditPostFlairContractError(requestUrl);
  }
  if (!Array.isArray(payload)) {
    throw new RedditPostFlairContractError(requestUrl);
  }

  const flairs: RedditPostFlair[] = [];
  const seenIds = new Set<string>();
  for (const item of payload) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new RedditPostFlairContractError(requestUrl);
    }
    const { id, text } = item as { id?: unknown; text?: unknown };
    if (
      typeof id !== "string" ||
      id.trim().length === 0 ||
      typeof text !== "string" ||
      text.trim().length === 0
    ) {
      throw new RedditPostFlairContractError(requestUrl);
    }
    const normalizedId = id.trim();
    if (seenIds.has(normalizedId)) continue;
    seenIds.add(normalizedId);
    flairs.push({ id: normalizedId, text: text.trim() });
  }
  return flairs;
}

function resolvePostFlair(
  selection: RedditPostFlair | string | undefined,
  available: readonly RedditPostFlair[],
  subreddit: string,
): RedditPostFlair | null {
  if (selection === undefined) return null;
  const value = typeof selection === "string"
    ? selection.trim()
    : selection.id.trim();
  if (value.length === 0) {
    throw new TypeError("Reddit post flair cannot be empty");
  }

  const normalizedText = value.toLocaleLowerCase();
  const flair = available.find(({ id, text }) =>
    id === value || text.toLocaleLowerCase() === normalizedText
  );
  if (flair === undefined) {
    throw new TypeError(
      `Reddit post flair is not available in r/${subreddit}: ${value}`,
    );
  }
  return flair;
}

/** Parse one Shreddit more-comments fragment without making a request. */
export function parseRedditComments(
  html: string,
  responseUrl: string | URL,
): RedditCommentPage {
  const $ = load(html, undefined, false);
  const sourceUrl = new URL(responseUrl);
  throwForChallenge(html, sourceUrl);
  return parseCommentDocument($, sourceUrl);
}

function parseCommentDocument(
  $: ReturnType<typeof load>,
  sourceUrl: URL,
): RedditCommentPage {
  const moreReplies = new Map<
    string,
    { count: number | null; url: string }
  >();
  let nextPageUrl: string | null = null;

  $('faceplate-partial[src*="/svc/shreddit/more-comments/"]').each(
    (_, partialElement) => {
      const partial = $(partialElement);
      const url = resolveMoreCommentsUrl(partial.attr("src"), sourceUrl);
      if (url === null) return;

      const parent = partial.parents("shreddit-comment").first();
      const parentId = parent.attr("thingid");
      if (isCommentId(parentId)) {
        if (!moreReplies.has(parentId)) {
          moreReplies.set(parentId, {
            count: integerOrNull(
              partial.find("faceplate-number").first().attr("number"),
            ),
            url,
          });
        }
      } else if (nextPageUrl === null) {
        nextPageUrl = url;
      }
    },
  );

  const comments = $("shreddit-comment")
    .toArray()
    .flatMap((commentElement) => {
      const comment = $(commentElement);
      const id = comment.attr("thingid");
      const postId = comment.attr("postid");
      const permalink = comment.attr("permalink");
      if (
        !isCommentId(id) ||
        !isPostId(postId) ||
        permalink === undefined ||
        permalink.length === 0
      ) {
        return [];
      }

      const body = comment.find(`[id="${id}-comment-rtjson-content"]`).first();
      const continuation = moreReplies.get(id);
      return [
        {
          author: attributeOrNull(comment.attr("author")),
          awardCount: integerOrNull(comment.attr("award-count")),
          body: elementTextOrNull(body.text()),
          bodyHtml: htmlOrNull(body.html()),
          contentType: attributeOrNull(comment.attr("content-type")),
          createdAt: attributeOrNull(comment.attr("created")),
          depth: integerOrNull(comment.attr("depth")),
          id,
          moreRepliesCount: continuation?.count ?? null,
          moreRepliesUrl: continuation?.url ?? null,
          parentId: commentIdOrNull(comment.attr("parentid")),
          parentPositions: integerArray(comment.attr("comment-parent-positions")),
          permalink,
          position: integerOrNull(comment.attr("comment-position")),
          postId,
          score: integerOrNull(comment.attr("score")),
        },
      ];
    });

  return {
    comments,
    nextPageUrl,
    requestUrl: sourceUrl.href,
  };
}

async function successfulHtml(
  response: Awaited<ReturnType<RedditFetchTransport["fetch"]>>,
  requestUrl: URL,
): Promise<string> {
  if (!response.ok) {
    throw new RedditPostRequestError(response.status, requestUrl.href);
  }
  const html = await response.text();
  throwForChallenge(html, new URL(response.url.length === 0 ? requestUrl : response.url));
  return html;
}

function throwForChallenge(html: string, responseUrl: URL): void {
  const challenge = RedditJavaScriptChallenge.parse(responseUrl, html);
  if (challenge !== undefined) {
    throw new RedditPostChallengeRequiredError(challenge);
  }
}

function normalizeOrigin(origin: string | URL): URL {
  const url = new URL(origin);
  if (url.username.length > 0 || url.password.length > 0) {
    throw new TypeError("Reddit origin cannot contain credentials");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function resolveMoreCommentsUrl(
  value: string | undefined,
  sourceUrl: URL,
): string | null {
  if (value === undefined) return null;
  const url = new URL(value, sourceUrl);
  return url.origin === sourceUrl.origin && MORE_COMMENTS_PATH.test(url.pathname)
    ? url.href
    : null;
}

function postPermalink(value: string, origin: URL): URL {
  const url = new URL(value, origin);
  const match = /^(.*\/comments\/[a-z0-9]+\/)/i.exec(url.pathname);
  if (url.origin !== origin.origin || match === null) {
    throw new TypeError("Reddit comment permalink must target the configured origin");
  }
  url.pathname = match[1]!;
  url.search = "";
  url.hash = "";
  return url;
}

function plainTextRtjson(text: string): string {
  if (text.trim().length === 0) {
    throw new TypeError("Reddit comment text cannot be empty");
  }
  return JSON.stringify({
    document: text.replace(/\r\n?/g, "\n").split("\n").map((line) => ({
      e: "par",
      c: line.length === 0 ? [] : [{ e: "text", t: line }],
    })),
  });
}

function normalizeSubredditName(value: string): string {
  const name = value.trim().replace(/^r\//i, "");
  if (!/^[a-z0-9_]{1,21}$/i.test(name)) {
    throw new TypeError("Reddit subreddit must be a valid community name");
  }
  return name;
}

function normalizePostTitle(value: string): string {
  const title = value.trim();
  if (title.length === 0) {
    throw new TypeError("Reddit post title cannot be empty");
  }
  if (title.length > 300) {
    throw new TypeError("Reddit post title cannot exceed 300 characters");
  }
  return title;
}

function normalizePostBody(value: string | undefined): string | null {
  if (value === undefined || value.trim().length === 0) return null;
  return value.replace(/\r\n?/g, "\n");
}

interface RedditCookieTransport extends RedditFetchTransport {
  getCookies(url: string | URL): Record<string, string>;
  setCookie(name: string, value: string, url: string | URL): void;
}

function asCookieTransport(
  transport: RedditFetchTransport,
): RedditCookieTransport | undefined {
  const candidate = transport as Partial<RedditCookieTransport>;
  return typeof candidate.getCookies === "function" &&
      typeof candidate.setCookie === "function"
    ? (candidate as RedditCookieTransport)
    : undefined;
}

function getCsrfToken(
  transport: RedditFetchTransport,
  origin: URL,
  createError: (message: string) => Error,
): string {
  const token = asCookieTransport(transport)?.getCookies(origin).csrf_token;
  if (token === undefined || token.length === 0) {
    throw createError("Reddit session does not contain a CSRF token");
  }
  return token;
}

function voteTargetId(target: RedditVoteTarget): `t1_${string}` | `t3_${string}` {
  const id = target instanceof RedditPostThread
    ? target.post.id
    : typeof target === "string"
      ? target
      : target.id;
  if (!isPostId(id) && !isCommentId(id)) {
    throw new TypeError("Reddit vote target must have a t1_ comment or t3_ post id");
  }
  return id;
}

function graphqlVoteState(state: RedditVoteState): "UP" | "DOWN" | "NONE" {
  switch (state) {
    case "up":
      return "UP";
    case "down":
      return "DOWN";
    case "none":
      return "NONE";
    default:
      throw new TypeError(`Unsupported Reddit vote state: ${String(state)}`);
  }
}

function parseCreatedPost(
  responseText: string,
  requestUrl: string,
  origin: URL,
): RedditCreatedPost {
  let payload: {
    data?: {
      createSubredditPost?: {
        errors?: readonly { message?: unknown }[];
        fieldErrors?: readonly { message?: unknown }[];
        ok?: unknown;
        post?: { id?: unknown; permalink?: unknown };
      };
    };
    errors?: readonly { message?: unknown }[];
    fieldErrors?: readonly { message?: unknown }[];
    operation?: unknown;
  };
  try {
    const parsed = JSON.parse(responseText) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new TypeError("Invalid text-post response");
    }
    payload = parsed as typeof payload;
  } catch {
    throw new RedditPostCreateContractError(requestUrl);
  }

  const mutation = payload.data?.createSubredditPost;
  const error = mutation?.fieldErrors?.[0] ??
    mutation?.errors?.[0] ??
    payload.fieldErrors?.[0] ??
    payload.errors?.[0];
  if (mutation?.ok !== true || error !== undefined) {
    throw new RedditPostCreateRequestError(
      typeof error?.message === "string"
        ? error.message
        : "Reddit rejected the text-post request",
      200,
      requestUrl,
    );
  }

  const id = mutation.post?.id;
  const permalink = mutation.post?.permalink;
  if (typeof id !== "string" || !isPostId(id) ||
      typeof permalink !== "string" || permalink.length === 0) {
    throw new RedditPostCreateContractError(requestUrl);
  }
  const permalinkUrl = new URL(permalink, origin);
  if (permalinkUrl.origin !== origin.origin || !POST_PATH.test(permalinkUrl.pathname)) {
    throw new RedditPostCreateContractError(requestUrl);
  }
  return { id, permalink };
}

function parseVoteResult(
  responseText: string,
  isPost: boolean,
  requestUrl: string,
): RedditVoteState {
  let payload: {
    data?: Record<string, unknown>;
    errors?: readonly { message?: unknown }[];
  };
  try {
    const parsed = JSON.parse(responseText) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new TypeError("Invalid vote response");
    }
    payload = parsed as typeof payload;
  } catch {
    throw new RedditVoteContractError(requestUrl);
  }

  const mutationName = isPost
    ? "updatePostVoteState"
    : "updateCommentVoteState";
  const mutation = payload.data?.[mutationName] as
    | {
        errors?: readonly { message?: unknown }[];
        ok?: unknown;
        voteState?: unknown;
      }
    | undefined;
  const error = mutation?.errors?.[0] ?? payload.errors?.[0];
  if (mutation?.ok !== true || error !== undefined) {
    throw new RedditVoteRequestError(
      typeof error?.message === "string"
        ? error.message
        : "Reddit rejected the vote request",
      200,
      requestUrl,
    );
  }

  switch (mutation.voteState) {
    case "UP":
      return "up";
    case "DOWN":
      return "down";
    case "NONE":
      return "none";
    default:
      throw new RedditVoteContractError(requestUrl);
  }
}

function applyCaptchaCookies(
  transport: RedditFetchTransport,
  origin: URL,
  solution: CaptchaSolution,
): void {
  const cookieTransport = asCookieTransport(transport);
  if (cookieTransport === undefined) return;
  for (const [name, value] of Object.entries(solution.cookies ?? {})) {
    cookieTransport.setCookie(name, value, origin);
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

function isCommentSort(value: string): value is RedditCommentSort {
  return (
    value === "best" ||
    value === "top" ||
    value === "new" ||
    value === "controversial" ||
    value === "old" ||
    value === "qa"
  );
}

function isPostId(value: string | undefined): value is `t3_${string}` {
  return value !== undefined && /^t3_[a-z0-9]+$/i.test(value);
}

function isCommentId(value: string | undefined): value is `t1_${string}` {
  return value !== undefined && /^t1_[a-z0-9]+$/i.test(value);
}

function commentIdOrNull(value: string | undefined): `t1_${string}` | null {
  return isCommentId(value) ? value : null;
}

function attributeOrNull(value: string | undefined): string | null {
  return value === undefined || value.length === 0 ? null : value;
}

function integerOrNull(value: string | undefined): number | null {
  if (value === undefined || !/^-?\d+$/.test(value)) return null;
  const integer = Number(value);
  return Number.isSafeInteger(integer) ? integer : null;
}

function numberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim().length === 0) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerArray(value: string | undefined): readonly number[] {
  if (value === undefined) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(Number.isSafeInteger)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function loadedDescendants(
  rootId: RedditComment["id"],
  comments: readonly RedditComment[],
): readonly RedditComment[] {
  const parentIds = new Set<string>([rootId]);
  const descendants: RedditComment[] = [];
  for (const comment of comments) {
    if (comment.parentId === null || !parentIds.has(comment.parentId)) continue;
    parentIds.add(comment.id);
    descendants.push(comment);
  }
  return descendants;
}

function elementTextOrNull(value: string): string | null {
  const text = normalizeText(value);
  return text.length === 0 ? null : text;
}

function htmlOrNull(value: string | null): string | null {
  if (value === null || value.trim().length === 0) return null;
  return value.trim();
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
