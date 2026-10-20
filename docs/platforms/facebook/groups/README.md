# Facebook groups: the page and its requests

The `groups` domain of Facebook's client (rule 48): the requests a group page
makes, one doc each, built by `log capture --docs` from the runs' recordings.
The code that works on groups is its own library, `src/group/<domain>/`
(rule 45): `join` (request to join), `answer` (the membership questions),
`read` (the posts, issue #27, `docs/groupRead.md`).

## What can be done on a group page

Every interactive element on a group's Discussion tab, as the accessibility
snapshots of run 20261020T143506 recorded them (Bethlehem, a group it is a
member of: load, a snapshot, three scrolls; `log inspect`, rule 29). There
were 810 refs on the page after the scrolls; these are the 110 kinds they
fall into. **Writes** is what changes something on Facebook, which needs
matt and `--live` (rule 8). **Request** is what the page sends, linked to its
doc where a run has recorded it; "not recorded" means no run has clicked it
yet, and code that clicks it waits for a recording that does (rule 29).

### Top bar (every Facebook page, not the group's)

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| link "Facebook", "Home", "Reels", "Friends", "Groups" | Navigate away from the group | no | the target page's root query |
| combobox "Search Facebook" | Facebook-wide search | no | [`CometSearchBootstrapKeywordsDataSourceQuery`](../background/CometSearchBootstrapKeywordsDataSourceQuery.md) (on load), [`SearchCometResultsInitialResultsQuery`](../background/SearchCometResultsInitialResultsQuery.md) |
| button "Facebook menu", "Messenger", "Your profile" | Open the menus | no | not recorded |
| button "Notifications, N unread" | The notifications list | no | [`CometNotificationsDropdownQuery`](../background/CometNotificationsDropdownQuery.md) (on load) |

### Group header

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| link "Cover photo" | Opens the cover photo | no | not recorded |
| heading (the group's name) | The group | — | [`CometGroupRootQuery`](CometGroupRootQuery.md), [`GroupsCometDiscussionLayoutRootQuery`](GroupsCometDiscussionLayoutRootQuery.md) (on load) |
| link "N members", "See everyone" | The People tab | no | not recorded |
| 20 links, one per member's avatar | That member's profile; resting the cursor shows their hover card | no | [`CometHovercardQueryRendererQuery`](../background/CometHovercardQueryRendererQuery.md) |
| button "Invite" | Invite friends | sending an invite | not recorded |
| button "Share group" | The share sheet for the group | sharing | [`CometUnifiedShareSheetDialogQuery`](../background/CometUnifiedShareSheetDialogQuery.md), [`UnifiedShareSheetMessengerSectionQuery`](../background/UnifiedShareSheetMessengerSectionQuery.md) |
| button "Joined" | The membership menu (notifications, follow, leave) | each of its items | not recorded (for a non-member it is Join: [`useGroupRequestToJoinMutation`](useGroupRequestToJoinMutation.md), `log join group`) |
| button "See Recommended Groups" | Other groups Facebook suggests | no | [`GroupsCometRecAffordanceSectionQuery`](GroupsCometRecAffordanceSectionQuery.md) |
| button "Search within this group" | Search the group's posts | no | not recorded |
| button "More" | The group's menu | depends on the item | not recorded |

The header repeats as a sticky bar once the page scrolls (the group's name as
a link, Invite, Share, Joined): the same controls.

### Group tabs

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| tab "Discussion" (selected) | The feed below | no | [`CometGroupDiscussionRootSuccessQuery`](CometGroupDiscussionRootSuccessQuery.md) (on load) |
| tab "Featured", "Open questions", "People", "Events", "Media", "Files", "About" | Each opens its own section | no | not recorded |

A second, sticky copy of the tabs is in the page with every tab disabled and
unnamed (24 refs): it isn't clickable.

### Composer and featured section

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| link "<account>'s profile" | The account's own profile | no | — |
| button "Write something..." | Opens the post composer | posting | not recorded |
| button "Anonymous post", "Feeling/activity", "Poll" | The composer, in that mode | posting | not recorded |
| button "About featured section", "Expand/Collapse featured section" | The featured posts' panel | no | not recorded |

### Feed

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| button "sort group feed by New posts" | The sort switcher (the read keeps New posts: `CHRONOLOGICAL`) | no | not recorded; the choice is the feed query's sort |
| (scrolling) | Loads three more posts | no | [`GroupsCometFeedRegularStoriesPaginationQuery`](GroupsCometFeedRegularStoriesPaginationQuery.md): what `src/group/read` reads |

### Each post

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| link (the author's name) | The author's profile; resting the cursor shows the hover card | no | [`CometHovercardQueryRendererQuery`](../background/CometHovercardQueryRendererQuery.md) |
| link "N hours ago" (the time) | The post's own page (its permalink) | no | [`CometSinglePostDialogContentQuery`](../background/CometSinglePostDialogContentQuery.md) |
| button "Actions for this post by <author>" | The post's menu (save, hide, notifications, report) | each of its items | not recorded |
| button "Follow" / "Follow <page>" | Follow the author | yes | not recorded |
| button "See more" | Shows the rest of a long text (the feed query already holds all of it) | no | none |
| link "May be an image of …", "No photo description available.", "N remaining items" | Opens the photo viewer | no | not recorded |
| link "<page>, view story", "<page>" | A shared post's story, and its page | no | not recorded |
| link "Open reel in Reels Viewer", button "Unmute", "<page> · Original audio", link "See owner profile" | A reel in the feed | no | [`FBReelsEntityDialogImplQuery`](../background/FBReelsEntityDialogImplQuery.md) (when it comes into view) |
| button "AI content" | The AI label's explanation | no | not recorded |
| (the reaction icons) | Who reacted, on hover | no | [`CometUFIReactionIconTooltipContentQuery`](../background/CometUFIReactionIconTooltipContentQuery.md) |
| button "Like" | Likes the post | yes | [`CometUFIFeedbackReactMutation`](../background/CometUFIFeedbackReactMutation.md) |
| button "React" | The reaction picker; picking one sets it | yes | [`CometUFIFeedbackReactMutation`](../background/CometUFIFeedbackReactMutation.md) |
| button "Leave a comment" | Opens the post with its comments | no (until one is sent) | [`CometSinglePostDialogContentQuery`](../background/CometSinglePostDialogContentQuery.md) |
| textbox "Submit your first comment…" | The comment box | sending a comment | on focus: [`useGroupsCometTypeaheadBootloadDataSourceQuery`](useGroupsCometTypeaheadBootloadDataSourceQuery.md), [`useGroupsCometMentionsBootloadDataSourceWithTaggingTransparencyQuery`](useGroupsCometMentionsBootloadDataSourceWithTaggingTransparencyQuery.md), [`CometUFIConversationGuideContainerQuery`](../background/CometUFIConversationGuideContainerQuery.md) |
| button "Comment with an avatar sticker", "Insert an emoji", "Attach a photo or video", "Comment with a GIF", "Comment with a sticker" | Parts of a comment | with the comment | not recorded |
| button "Share, send this to friends or post it on your profile." | The share sheet for the post | sharing | [`CometUnifiedShareSheetDialogQuery`](../background/CometUnifiedShareSheetDialogQuery.md) |
| button "View more comments" | Loads more of the post's comments | no | not shown on run 20261020T151100: scrolling the post's dialog loads them, [`CommentsListComponentsPaginationQuery`](../background/CommentsListComponentsPaginationQuery.md) |
| button "Most relevant" (in the post) | The comments' sort: Most relevant, Newest (every comment, newest first), All comments (with potential spam) | no | picking one: [`CommentListComponentsRootQuery`](../background/CommentListComponentsRootQuery.md) |

### Each comment (shown under a post)

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| link (the commenter), link (the comment's time) | Their profile; the comment's own link | no | [`CometHovercardQueryRendererQuery`](../background/CometHovercardQueryRendererQuery.md) |
| button "Like", "React" | React to the comment | yes | [`CometUFIFeedbackReactMutation`](../background/CometUFIFeedbackReactMutation.md) |
| button "Reply" | The reply box | sending a reply | not recorded |
| button "Share" | Share the comment | sharing | not recorded |
| button "Edited" | The comment's edit history | no | not recorded |
| button "Hide …" | Hides the comment for the account | yes | not recorded |

### Elsewhere on the page

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| button "New message" | A Messenger chat | sending a message | not recorded |
| button "Choose File" | The page's hidden file input | — | — |

## What the read uses

The group read touches none of these: it scrolls, and reads the posts from
what the page already sent, the group page's HTML and the feed query (rule 22,
`src/group/read`). Comments are read too (matt, 2026-10-20): from the post's
dialog or its own page, sorted Newest, scrolled until the list ends
(`commentsFromResponse`, `commentsFromPostPage`, recorded on run
20261020T151100). Every control marked "not recorded" is one `log inspect` step
away from a doc of its own.
