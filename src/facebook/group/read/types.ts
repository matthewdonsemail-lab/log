/**
 * Reading a Facebook group's posts (issue #27, `docs/groupRead.md`). The posts come
 * from the page's own feed query, `GroupsCometFeedRegularStoriesPaginationQuery`
 * (docs/platforms/facebook/groups/), as each step's HAR recorded it: log-cli never
 * calls Facebook's GraphQL itself.
 */
import type { ErrorCode } from "../../../errors/catalog/index.ts";

/** One post, as the feed answered it (recorded 2026-10-20, run 20261020T134155). */
export interface GroupPost {
  /** `node.post_id`. */
  postId: string;
  /** `content.story.target_group.id`: always the group read. */
  groupId: string;
  /** `node.creation_time`, unix seconds. */
  createdTime: number;
  /** The same, ISO. */
  createdAt: string;
  /** `content.story.actors[0]`. */
  author: { id: string; name: string; url: string };
  /** `content.story.message.text`; "" for a post with no text (a photo, a share). */
  text: string;
  /** `content.story.wwwURL`. */
  permalink: string;
  /** `content.story.feedback.id`: what a comment or a reaction on the post is sent to. */
  feedbackId: string;
  /**
   * The comment count the feed showed (`comet_sections.feedback.story.story_ufi_container.story.feedback_context
   * .feedback_target_with_context.comment_rendering_instance.comments.total_count`, run 20261020T143506); null when
   * the unit had none. A read opens a post again only when this grew.
   */
  commentCount: number | null;
}

/** Why a feed unit was not kept (facebook-camofox-client's rules: never patched, always counted). */
export type RejectReason = "missingPostId" | "missingGroup" | "wrongGroup" | "missingCreationTime";

/** What one feed response yielded. */
export interface FeedPage {
  posts: GroupPost[];
  rejected: Partial<Record<RejectReason, number>>;
  /** Feed units that aren't posts, by `__typename` (the page's "New posts" `GroupsSectionHeaderUnit`). */
  skipped: Record<string, number>;
  /** `page_info.end_cursor` and `has_next_page`, from the response's last (deferred) chunk; null when it had none. */
  endCursor: string | null;
  hasNextPage: boolean | null;
}

/**
 * One comment or reply on a group post, as the comment queries answered it (recorded 2026-10-20,
 * run 20261020T151100: `CometSinglePostDialogContentQuery`, `CommentListComponentsRootQuery`,
 * `CommentsListComponentsPaginationQuery`, and the post page's own HTML).
 */
export interface GroupComment {
  /** `legacy_fbid`. */
  commentId: string;
  /** The post it is on: its `id` decodes to `comment:<postId>_<commentId>`. */
  postId: string;
  /** `group_comment_info.group.id`: always the group read. */
  groupId: string;
  /** A reply's comment (`comment_direct_parent.id`, decoded the same way); null on a comment. */
  parentCommentId: string | null;
  /** 0 a comment, 1 a reply. */
  depth: number;
  /** `created_time`, unix seconds. */
  createdTime: number;
  createdAt: string;
  /** `author`; `anonymous` when the group shows it as an anonymous member (`group_comment_info.is_author_anonymous`). */
  author: { id: string; name: string; url: string; anonymous: boolean };
  /** `body.text`; "" for a comment that is only a photo or a sticker. */
  text: string;
  /** `feedback.url`: the post's link with `comment_id` (and `reply_comment_id`). */
  permalink: string;
  /** `feedback.id`: what a reply or a reaction to the comment is sent to. */
  feedbackId: string;
  /** `feedback.replies_fields.total_count`. */
  replyCount: number;
}

/** Why a comment was not kept (the post's rules: never patched, always counted). */
export type CommentRejectReason = "missingCommentId" | "missingPost" | "missingGroup" | "wrongGroup" | "missingCreationTime";

/** What one comment answer yielded. */
export interface CommentPage {
  comments: GroupComment[];
  rejected: Partial<Record<CommentRejectReason, number>>;
  /** The top-level list's `comments.page_info`: more comments follow while `hasNextPage`. */
  endCursor: string | null;
  hasNextPage: boolean | null;
}

/** The read cursor kept per group (on its `agencyGroup`): what the reads have already seen. */
export interface ReadCursor {
  lastPostId: string | null;
  /** The newest `creationTime` read, unix seconds. */
  watermark: number | null;
  /** Every post id read at the watermark's second: posts can share one, and none of them is read twice or lost. */
  idsAtWatermark?: string[];
  /**
   * The ids of the posts the latest reads saw, newest first, at most SEEN_IDS_KEPT. A post is new when its id
   * isn't here, whatever its time (matt, 2026-10-22: never judged by time alone). A cursor without them (written
   * before) is read by the time rule once, then gets them.
   */
  seenIds?: string[];
}

/** A step the read sends to the account's open browser (`log inspect`'s actions; none of them clicks unless `live`). */
export interface ReadStepInput {
  action: "goto" | "scroll" | "scrollIn" | "clickRole";
  args: string[];
}

/** A step's reply, with its own HAR read by the caller (rule 22): the posts and comments are read from it. */
export interface ReadStepReply {
  ok: boolean;
  error?: string;
  url?: string;
  title?: string;
  folder?: string;
  har?: { log?: { entries?: unknown[] } };
}

export interface GroupReadInput {
  account: string;
  /** The group as the run was given it, and its numeric id when Twenty already holds it. */
  group: { key: string; url: string; facebookGroupId: string | null };
  cursor: ReadCursor;
  /** The comment count each saved post had when its comments were last read (`commentsReadCount`), by post id. */
  commentsRead: Record<string, number>;
  /** Scrolls down the feed at most (each `scroll 2 700`, as recorded). */
  maxScrolls: number;
  /** Posts whose comments are read at most; 0 reads none. */
  maxCommentPosts: number;
  /** Switch each post's comments to Newest before scrolling them (two clicks, rule 8). */
  live: boolean;
}

/** One post whose comments the read opened, and what it got. */
export interface CommentRead {
  postId: string;
  /** The feed's count when it was opened. */
  commentCount: number | null;
  comments: number;
  /** Why the post's comments stopped short, when they did (a step failed; the read went on). */
  problem: string | null;
}

export interface GroupReadContext extends GroupReadInput {
  groupId: string | null;
  /** Every post the feed showed this read, newest first, each once. */
  seen: GroupPost[];
  rejected: Partial<Record<RejectReason, number>>;
  skipped: Record<string, number>;
  scrolls: number;
  hasNextPage: boolean | null;
  /** The feed reached a post the last read already had. */
  reachedCursor: boolean;
  /** The feed was read to its end for this run (the posts and the cursor after them are settled). */
  feedDone: boolean;
  fresh: GroupPost[];
  cursorAfter: ReadCursor;
  targets: GroupPost[];
  index: number;
  commentScrolls: number;
  pageComments: GroupComment[];
  commentHasNext: boolean | null;
  postProblem: string | null;
  comments: GroupComment[];
  commentReads: CommentRead[];
  problem: { code: ErrorCode; detail: string } | null;
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[];
}

export interface GroupReadOutput {
  account: string;
  groupId: string | null;
  result: "read" | "stopped";
  /** New since the cursor, newest first. */
  posts: GroupPost[];
  /** Every post the feed showed, new or not (their comment counts are kept up to date). */
  seen: GroupPost[];
  comments: GroupComment[];
  commentReads: CommentRead[];
  cursor: ReadCursor;
  /** False when the read stopped before its feed was settled: the cursor isn't moved then. */
  feedDone: boolean;
  reachedCursor: boolean;
  /** The scrolls ran out before the last read's posts showed: posts between may not have been read. */
  gap: boolean;
  rejected: Partial<Record<RejectReason, number>>;
  skipped: Record<string, number>;
  problem: { code: ErrorCode; detail: string } | null;
  steps: { step: string; ok: boolean; folder?: string; detail?: string }[];
}
