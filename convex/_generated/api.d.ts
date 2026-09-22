/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as alerts from "../alerts.js";
import type * as apiKeys from "../apiKeys.js";
import type * as brand from "../brand.js";
import type * as crons from "../crons.js";
import type * as feed from "../feed.js";
import type * as hits from "../hits.js";
import type * as http from "../http.js";
import type * as ingest from "../ingest.js";
import type * as keywords from "../keywords.js";
import type * as lib_accounts from "../lib/accounts.js";
import type * as lib_agentmail from "../lib/agentmail.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_firecrawl from "../lib/firecrawl.js";
import type * as lib_hash from "../lib/hash.js";
import type * as lib_keywordOps from "../lib/keywordOps.js";
import type * as lib_match from "../lib/match.js";
import type * as lib_mcp from "../lib/mcp.js";
import type * as lib_plan from "../lib/plan.js";
import type * as lib_posts from "../lib/posts.js";
import type * as lib_proxy from "../lib/proxy.js";
import type * as lib_redditFeed from "../lib/redditFeed.js";
import type * as lib_scopes from "../lib/scopes.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_server from "../lib/server.js";
import type * as lib_token from "../lib/token.js";
import type * as lib_webhookSign from "../lib/webhookSign.js";
import type * as lib_webhookUrl from "../lib/webhookUrl.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as plan from "../plan.js";
import type * as publicApi from "../publicApi.js";
import type * as reddit from "../reddit.js";
import type * as scoring from "../scoring.js";
import type * as sessions from "../sessions.js";
import type * as treg from "../treg.js";
import type * as watch from "../watch.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  alerts: typeof alerts;
  apiKeys: typeof apiKeys;
  brand: typeof brand;
  crons: typeof crons;
  feed: typeof feed;
  hits: typeof hits;
  http: typeof http;
  ingest: typeof ingest;
  keywords: typeof keywords;
  "lib/accounts": typeof lib_accounts;
  "lib/agentmail": typeof lib_agentmail;
  "lib/crypto": typeof lib_crypto;
  "lib/firecrawl": typeof lib_firecrawl;
  "lib/hash": typeof lib_hash;
  "lib/keywordOps": typeof lib_keywordOps;
  "lib/match": typeof lib_match;
  "lib/mcp": typeof lib_mcp;
  "lib/plan": typeof lib_plan;
  "lib/posts": typeof lib_posts;
  "lib/proxy": typeof lib_proxy;
  "lib/redditFeed": typeof lib_redditFeed;
  "lib/scopes": typeof lib_scopes;
  "lib/scoring": typeof lib_scoring;
  "lib/server": typeof lib_server;
  "lib/token": typeof lib_token;
  "lib/webhookSign": typeof lib_webhookSign;
  "lib/webhookUrl": typeof lib_webhookUrl;
  messages: typeof messages;
  notifications: typeof notifications;
  plan: typeof plan;
  publicApi: typeof publicApi;
  reddit: typeof reddit;
  scoring: typeof scoring;
  sessions: typeof sessions;
  treg: typeof treg;
  watch: typeof watch;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
  treg: import("@listeningkit/treg/_generated/component.js").ComponentApi<"treg">;
};
