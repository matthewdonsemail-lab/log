/**
 * Reading a Facebook group's posts (issue #27, `docs/groupRead.md`). The posts come
 * from the page's own feed query, `GroupsCometFeedRegularStoriesPaginationQuery`
 * (docs/platforms/facebook/groups/), as each step's HAR recorded it: log-cli never
 * calls Facebook's GraphQL itself.
 */

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

/** The read cursor kept per group (on its `agencyGroup`): the newest post read so far. */
export interface ReadCursor {
  lastPostId: string | null;
  /** The newest `creationTime` read, unix seconds. */
  watermark: number | null;
  /** Every post id read at the watermark's second: posts can share one, and none of them is read twice or lost. */
  idsAtWatermark?: string[];
}
