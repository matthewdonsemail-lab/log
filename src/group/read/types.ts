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
  /** `page_info.end_cursor` and `has_next_page`, from the response's last (deferred) chunk; null when it had none. */
  endCursor: string | null;
  hasNextPage: boolean | null;
}

/** The read cursor kept per group (on its `agencyGroup`): the newest post read so far. */
export interface ReadCursor {
  lastPostId: string | null;
  /** The newest `creationTime` read, unix seconds. */
  watermark: number | null;
}
