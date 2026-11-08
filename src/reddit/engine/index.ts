import { runRedditBridge } from "./client.ts";
import type { RedditBridgeRequest } from "./types.ts";

export { commentOf, linksOf, postOf, redditBridgeDeps, refusalOf, runRedditBridge, threadPostOf } from "./client.ts";
export type { RedditBridgeDeps } from "./client.ts";
export type { RedditBridgeAction, RedditBridgeAnswer, RedditBridgeComment, RedditBridgePost, RedditBridgeRequest, RedditBridgeSubreddit, RedditVoteDirection } from "./types.ts";
export { REDDIT_BRIDGE_WRITES } from "./types.ts";

if (import.meta.main) {
  const request = JSON.parse(await Bun.stdin.text()) as RedditBridgeRequest;
  const answer = await runRedditBridge(request);
  process.stdout.write(`${JSON.stringify(answer)}\n`);
  process.exit(answer.ok ? 0 : 1);
}
