import type { CommentPage, CommentRejectReason, GroupComment } from "../types.ts";
import { at, chunksOf, embeddedResults, type Json, obj, responsesOf, str } from "./json.ts";

/**
 * The requests that answer with a post's comments (run 20261020T151100): opening the post
 * (`CometSinglePostDialogContentQuery`), picking a sort (`CommentListComponentsRootQuery`), and
 * scrolling for more (`CommentsListComponentsPaginationQuery`). A post opened by its link carries
 * the first ones in its HTML instead (`commentsFromPostPage`).
 */
export const COMMENT_QUERIES = ["CometSinglePostDialogContentQuery", "CommentListComponentsRootQuery", "CommentsListComponentsPaginationQuery"] as const;

/** `Y29tbWVudDo…` → `comment:<postId>_<commentId>` → its two ids. Pure. */
export function commentIdsOf(relayId: string): { postId: string; commentId: string } | null {
  let decoded: string;
  try {
    decoded = Buffer.from(relayId, "base64").toString("utf8");
  } catch {
    return null;
  }
  const match = decoded.match(/^comment:(\d+)_(\d+)$/);
  return match ? { postId: match[1]!, commentId: match[2]! } : null;
}

/** One `Comment` node → a comment, or why not. A stub (a reply's `parent_object_ent`, no `legacy_fbid`) isn't one. Pure. */
export function commentOf(node: unknown, expectedGroupId: string): GroupComment | CommentRejectReason {
  const commentId = str(at(node, "legacy_fbid"));
  if (!commentId) return "missingCommentId";
  const ids = commentIdsOf(str(at(node, "id")));
  if (!ids) return "missingPost";
  const groupId = str(at(node, "group_comment_info", "group", "id"));
  if (!groupId) return "missingGroup";
  if (groupId !== expectedGroupId) return "wrongGroup";
  const created = at(node, "created_time");
  if (typeof created !== "number" || !Number.isFinite(created)) return "missingCreationTime";
  const depth = at(node, "depth");
  const replies = at(node, "feedback", "replies_fields", "total_count");
  return {
    commentId,
    postId: ids.postId,
    groupId,
    parentCommentId: commentIdsOf(str(at(node, "comment_direct_parent", "id")))?.commentId ?? null,
    depth: typeof depth === "number" ? depth : 0,
    createdTime: created,
    createdAt: new Date(created * 1000).toISOString(),
    author: {
      id: str(at(node, "author", "id")),
      name: str(at(node, "author", "name")),
      url: str(at(node, "author", "url")),
      anonymous: at(node, "group_comment_info", "is_author_anonymous") === true,
    },
    text: str(at(node, "body", "text")),
    permalink: str(at(node, "feedback", "url")),
    feedbackId: str(at(node, "feedback", "id")),
    replyCount: typeof replies === "number" ? replies : 0,
  };
}

/** Every comment and reply under some answers, each kept once, and the top-level list's page_info. Pure. */
function commentPageOf(roots: Json[], expectedGroupId: string): CommentPage {
  const page: CommentPage = { comments: [], rejected: {}, endCursor: null, hasNextPage: null };
  const seen = new Set<string>();
  const walk = (v: unknown, key: string): void => {
    if (!v || typeof v !== "object") return;
    const node = obj(v);
    // The top-level list's paging (`…comments.page_info`), not a reply thread's (`replies_connection`).
    if (key === "comments" && node && obj(node.page_info)) {
      const info = obj(node.page_info)!;
      if (str(info.end_cursor)) page.endCursor = str(info.end_cursor);
      if (typeof info.has_next_page === "boolean") page.hasNextPage = info.has_next_page;
    }
    if (node?.__typename === "Comment" && node.legacy_fbid) {
      const comment = commentOf(node, expectedGroupId);
      if (typeof comment === "string") page.rejected[comment] = (page.rejected[comment] ?? 0) + 1;
      else if (!seen.has(comment.commentId)) {
        seen.add(comment.commentId);
        page.comments.push(comment);
      }
    }
    for (const [childKey, child] of Object.entries(v)) walk(child, childKey);
  };
  for (const root of roots) walk(root, "");
  return page;
}

/** The comments in one answer of a comment query. Pure. */
export function commentsFromResponse(text: string, expectedGroupId: string): CommentPage {
  return commentPageOf(chunksOf(text), expectedGroupId);
}

/** The first comments a post's own page (`/groups/<id>/permalink/<post>/`) carries in its HTML. Pure. */
export function commentsFromPostPage(html: string, expectedGroupId: string): CommentPage {
  return commentPageOf(embeddedResults(html), expectedGroupId);
}

/** The comment answers a recorded step holds, in the order they came. Pure. */
export function commentResponses(har: { log?: { entries?: unknown[] } }): string[] {
  return responsesOf(har, COMMENT_QUERIES);
}
