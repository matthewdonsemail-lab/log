/**
 * A group read in Twenty (#27, rule 13): the group's posts are `agencyGroupPosts` on its
 * `agencyGroups` row (so on one account), keyed on the row and Facebook's post id; their
 * comments are `agencyGroupComments` on the post, keyed on the post and Facebook's comment id.
 * A rerun adds nothing it already has. Rows are never deleted. Nothing here touches Facebook.
 *
 *   readStateOf    before a read: the row's cursor, and each saved post's comment count at its last comment read
 *   saveRead       after it: the new posts, the counts of the ones seen again, the comments, then the cursor
 */
import type { TwentyClient, TwentyObjects } from "../../../twenty/graphql/index.ts";
import type { GroupComment, GroupPost, GroupReadOutput, ReadCursor } from "./types.ts";

export const AGENCY_GROUP_POSTS = "agencyGroupPosts" as const;
export const AGENCY_GROUP_COMMENTS = "agencyGroupComments" as const;

type PostRow = TwentyObjects["agencyGroupPosts"]["row"];
type CommentRow = TwentyObjects["agencyGroupComments"]["row"];

const EMPTY_CURSOR: ReadCursor = { lastPostId: null, watermark: null, idsAtWatermark: [] };

/** `agencyGroups.readCursor` → the cursor; anything unreadable is a first read. Pure. */
export function cursorOf(raw: unknown): ReadCursor {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    lastPostId: typeof value.lastPostId === "string" ? value.lastPostId : null,
    watermark: typeof value.watermark === "number" ? value.watermark : null,
    idsAtWatermark: Array.isArray(value.idsAtWatermark) ? value.idsAtWatermark.filter((id): id is string => typeof id === "string") : [],
    // Kept only when the row has them: a cursor written before reads by the time rule once (`seenBy`).
    ...(Array.isArray(value.seenIds) ? { seenIds: value.seenIds.filter((id): id is string => typeof id === "string") } : {}),
  };
}

/** A row's name: the text's start, or what the post is when it has none. Pure. */
export function nameOf(text: string, author: string, what: string): string {
  const line = text.replace(/\s+/g, " ").trim();
  return line ? (line.length > 80 ? `${line.slice(0, 79)}…` : line) : `${what} by ${author || "an anonymous member"}`;
}

/** Every saved post of the group row, by Facebook's post id. */
async function postsOf(twenty: TwentyClient, groupRowId: string, postIds?: string[]): Promise<Map<string, PostRow>> {
  if (postIds && !postIds.length) return new Map();
  const rows = await twenty.list(AGENCY_GROUP_POSTS, { agencyGroupId: { eq: groupRowId }, ...(postIds ? { facebookPostId: { in: postIds } } : {}) });
  return new Map(rows.filter((r) => r.facebookPostId).map((r) => [r.facebookPostId!, r]));
}

/** Before a read: where the last one stopped, and how many comments each saved post had when they were last read. */
export async function readStateOf(twenty: TwentyClient, groupRowId: string): Promise<{ cursor: ReadCursor; commentsRead: Record<string, number> }> {
  const row = await twenty.get("agencyGroups", groupRowId);
  const commentsRead: Record<string, number> = {};
  for (const [postId, post] of await postsOf(twenty, groupRowId)) if (typeof post.commentsReadCount === "number") commentsRead[postId] = post.commentsReadCount;
  return { cursor: row ? cursorOf(row.readCursor) : EMPTY_CURSOR, commentsRead };
}

function postFields(post: GroupPost) {
  return {
    name: nameOf(post.text, post.author.name, "A post"),
    facebookPostId: post.postId,
    facebookGroupId: post.groupId,
    authorName: post.author.name,
    authorFacebookId: post.author.id,
    authorUrl: post.author.url,
    text: post.text,
    permalink: post.permalink,
    feedbackId: post.feedbackId,
    postedAt: post.createdAt,
    ...(post.commentCount === null ? {} : { commentCount: post.commentCount }),
  };
}

function commentFields(comment: GroupComment) {
  return {
    name: nameOf(comment.text, comment.author.name, comment.depth ? "A reply" : "A comment"),
    facebookCommentId: comment.commentId,
    facebookPostId: comment.postId,
    parentCommentId: comment.parentCommentId ?? "",
    depth: comment.depth,
    authorName: comment.author.name,
    authorFacebookId: comment.author.id,
    authorUrl: comment.author.url,
    authorAnonymous: comment.author.anonymous,
    text: comment.text,
    permalink: comment.permalink,
    feedbackId: comment.feedbackId,
    commentedAt: comment.createdAt,
    replyCount: comment.replyCount,
  };
}

export interface SavedRead {
  postsAdded: number;
  postsUpdated: number;
  commentsAdded: number;
  commentsUpdated: number;
  cursorMoved: boolean;
}

/**
 * After a read, in the order that loses nothing (facebook-camofox-client's `listen.py`): every post
 * the feed showed is saved (new ones created, the others' comment count brought up to date), then
 * the comments of each post the read opened (and its `commentsReadCount`, unless its comments
 * stopped short), and only then the group's cursor, which moves only when the feed was settled.
 */
export async function saveRead(twenty: TwentyClient, groupRowId: string, output: GroupReadOutput, reason: string, now: Date, onLine: (line: string) => void = () => {}): Promise<SavedRead> {
  const saved: SavedRead = { postsAdded: 0, postsUpdated: 0, commentsAdded: 0, commentsUpdated: 0, cursorMoved: false };
  const rows = await postsOf(twenty, groupRowId, output.seen.map((p) => p.postId));
  for (const post of [...output.seen].reverse()) {
    const row = rows.get(post.postId);
    if (!row) {
      rows.set(post.postId, await twenty.create(AGENCY_GROUP_POSTS, { ...postFields(post), agencyGroupId: groupRowId } as TwentyObjects["agencyGroupPosts"]["create"]));
      saved.postsAdded++;
      onLine(`  + post ${post.postId} (${post.createdAt.slice(0, 16)}, ${post.author.name || "anonymous"}): ${nameOf(post.text, post.author.name, "A post")}`);
    } else if (post.commentCount !== null && post.commentCount !== row.commentCount) {
      rows.set(post.postId, await twenty.update(AGENCY_GROUP_POSTS, row.id, { commentCount: post.commentCount }));
      saved.postsUpdated++;
      onLine(`  ~ post ${post.postId}: ${row.commentCount ?? "?"} → ${post.commentCount} comment(s)`);
    }
  }

  for (const read of output.commentReads) {
    const postRow = rows.get(read.postId);
    if (!postRow) continue;
    const comments = output.comments.filter((c) => c.postId === read.postId);
    const existing = comments.length
      ? new Map((await twenty.list(AGENCY_GROUP_COMMENTS, { agencyGroupPostId: { eq: postRow.id }, facebookCommentId: { in: comments.map((c) => c.commentId) } })).map((r: CommentRow) => [r.facebookCommentId!, r]))
      : new Map<string, CommentRow>();
    for (const comment of comments) {
      const row = existing.get(comment.commentId);
      if (!row) {
        await twenty.create(AGENCY_GROUP_COMMENTS, { ...commentFields(comment), agencyGroupPostId: postRow.id } as TwentyObjects["agencyGroupComments"]["create"]);
        saved.commentsAdded++;
      } else if (row.replyCount !== comment.replyCount || (row.text ?? "") !== comment.text) {
        await twenty.update(AGENCY_GROUP_COMMENTS, row.id, { replyCount: comment.replyCount, text: comment.text });
        saved.commentsUpdated++;
      }
    }
    onLine(`  comments on ${read.postId}: ${comments.length} read${read.commentCount !== null ? ` of ${read.commentCount}` : ""}${read.problem ? `, stopped short (${read.problem})` : ""}`);
    if (!read.problem) await twenty.update(AGENCY_GROUP_POSTS, postRow.id, { commentsReadAt: now.toISOString(), commentsReadCount: read.commentCount ?? comments.length });
  }

  const group: TwentyObjects["agencyGroups"]["update"] = { lastReadAt: now.toISOString(), lastReadReason: reason };
  if (output.groupId) Object.assign(group, { facebookGroupId: output.groupId, groupUrl: `https://www.facebook.com/groups/${output.groupId}/` });
  if (output.feedDone) {
    group.readCursor = output.cursor as unknown as Record<string, unknown>;
    saved.cursorMoved = true;
  }
  await twenty.update("agencyGroups", groupRowId, group);
  return saved;
}
