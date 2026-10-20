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
| button "Invite" | Invite friends | sending an invite | opening: [`GroupsCometInviteFriendsDialogQuery`](GroupsCometInviteFriendsDialogQuery.md), [`triggerGroupsCometHeaderInviteWithEmailExposureQuery`](../background/triggerGroupsCometHeaderInviteWithEmailExposureQuery.md), [`GroupsCometInviteFriendsCategorizedInviteSearchQuery`](GroupsCometInviteFriendsCategorizedInviteSearchQuery.md) (run 20261020T153648; sending not recorded) |
| button "Share group" | The share sheet for the group | sharing | [`CometUnifiedShareSheetDialogQuery`](../background/CometUnifiedShareSheetDialogQuery.md), [`UnifiedShareSheetMessengerSectionQuery`](../background/UnifiedShareSheetMessengerSectionQuery.md); opening it also sends, by itself, [`useLinkSharingCreateWrappedUrlMutation`](../background/useLinkSharingCreateWrappedUrlMutation.md), [`useIncrementLinkSharingDisclosureImpressionCountMutation`](../background/useIncrementLinkSharingDisclosureImpressionCountMutation.md), [`CometLinkSharingInlineDisclosureCountQuery`](../background/CometLinkSharingInlineDisclosureCountQuery.md), [`MAWFetchXMAData_fetchXmaPreviewDataQuery`](../background/MAWFetchXMAData_fetchXmaPreviewDataQuery.md) and the composer's mention queries ([`useFeedComposerCometMentionsBootloadDataSourceQuery`](../background/useFeedComposerCometMentionsBootloadDataSourceQuery.md) and its two tagging versions) |
| button "Joined" | The membership menu: Manage notifications, Unfollow group, Leave group | each of its items | opening: [`GroupsCometJoinedActionMenuQuery`](GroupsCometJoinedActionMenuQuery.md) (run 20261020T153648; no item recorded). For a non-member it is Join: [`useGroupRequestToJoinMutation`](useGroupRequestToJoinMutation.md), `log join group` |
| button "See Recommended Groups" | Other groups Facebook suggests | no | [`GroupsCometRecAffordanceSectionQuery`](GroupsCometRecAffordanceSectionQuery.md) |
| button "Search within this group" | Search the group's posts | no | opening: [`GroupsEntityScopedCometTypeaheadDialogQuery`](../background/GroupsEntityScopedCometTypeaheadDialogQuery.md), [`useGroupsEntityScopedRecentSearchAndExploreDataSourceQuery`](useGroupsEntityScopedRecentSearchAndExploreDataSourceQuery.md), [`withSearchCometTypeaheadSERPWarmCallDecoratorQuery`](../background/withSearchCometTypeaheadSERPWarmCallDecoratorQuery.md) (typing not recorded) |
| button "More" | The group's menu: Your content, Share, Manage notifications, Pin group, Report group | depends on the item | opening: [`GroupsCometMoreActionMenuQuery`](GroupsCometMoreActionMenuQuery.md) (no item recorded) |

The header repeats as a sticky bar once the page scrolls (the group's name as
a link, Invite, Share, Joined): the same controls.

### Group tabs

| Control | What it does | Writes | Request |
| --- | --- | --- | --- |
| tab "Discussion" (selected) | The feed below | no | [`CometGroupDiscussionRootSuccessQuery`](CometGroupDiscussionRootSuccessQuery.md) (on load) |
| tab "Featured" | `/announcements`, the featured posts | no | [`CometGroupAnnouncementsRootFeedQuery`](CometGroupAnnouncementsRootFeedQuery.md) |
| tab "Open questions" | `/questions`, the question posts, each with its first comments | no | [`GroupsCometQuestionsRootSuccessQuery`](GroupsCometQuestionsRootSuccessQuery.md) |
| tab "People" | `/members`: admins, moderators, members in common | no (its Follow buttons are) | [`GroupsCometMembersRootQuery`](GroupsCometMembersRootQuery.md) |
| tab "Events" | `/events`: upcoming and past | no (Interested, Going are) | [`CometGroupEventsRootQuery`](CometGroupEventsRootQuery.md) |
| tab "Media" | `/media`: the photos grid (Photos, Videos, Albums) | no | [`GroupsCometPhotosRootQueryContainerQuery`](GroupsCometPhotosRootQueryContainerQuery.md) |
| tab "Files" | `/files/files`: shared files | no | [`GroupsCometFilesTabRootQuery`](GroupsCometFilesTabRootQuery.md) |
| tab "About" | `/about`: description, history, rules | no | [`CometGroupAboutRootQuery`](CometGroupAboutRootQuery.md) |

Every tab also sends [`CometGroupRootQuery`](CometGroupRootQuery.md) (the header) and `/ajax/navigation/`; back on Discussion, [`useGroupsCometVisitMutation`](useGroupsCometVisitMutation.md). Flow: [`groupTabs`](../flows/groupTabs.md) (run 20261020T153648).

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
| button "Actions for this post by <author>" | The post's menu: Turn on notifications, Report to group admins, Hide post, Report post | each of its items | opening: [`CometFeedStoryMenuQuery`](../background/CometFeedStoryMenuQuery.md) and [`useCIXLogMutation`](../background/useCIXLogMutation.md) (no item recorded) |
| button "Follow" / "Follow <page>" | Follow the author | yes | not recorded |
| button "See more" | Shows the rest of a long text (the feed query already holds all of it) | no | none |
| link "May be an image of …", "No photo description available.", "N remaining items" | Opens the photo viewer (`/photo/`, dialog "Photo viewer": Previous, Next, Zoom, full screen, View Post, the post's comments) | no | [`CometPhotoRootContentQuery`](../photos/CometPhotoRootContentQuery.md), [`CometPhotoTagLayerQuery`](../photos/CometPhotoTagLayerQuery.md) |
| link "<page>, view story", "<page>" | A shared post's story, and its page | no | not recorded |
| link "Open reel in Reels Viewer", button "Unmute", "<page> · Original audio", link "See owner profile" | A reel in the feed | no | [`FBReelsEntityDialogImplQuery`](../background/FBReelsEntityDialogImplQuery.md) (when it comes into view) |
| button "AI content" | The AI label's explanation | no | not recorded |
| (the reaction icons) | Who reacted, on hover | no | [`CometUFIReactionIconTooltipContentQuery`](../background/CometUFIReactionIconTooltipContentQuery.md) |
| button "Like" | Likes the post | yes | [`CometUFIFeedbackReactMutation`](../background/CometUFIFeedbackReactMutation.md) |
| button "React" | The reaction picker; picking one sets it | yes | [`CometUFIFeedbackReactMutation`](../background/CometUFIFeedbackReactMutation.md). Opening the picker is not recorded: the button sits under the Like button (it opens on hover), the cursor check refuses the click, and `log inspect` has no hover step (run 20261020T153648 steps 37, 38, 44) |
| button "Leave a comment" | On Discussion: opens the post in its dialog and focuses the comment box. On Open questions: opens the comments inline under the post | no (until one is sent) | Discussion: [`CometSinglePostDialogContentQuery`](../background/CometSinglePostDialogContentQuery.md) and the comment box's three queries below; Open questions: none (the tab's feed already holds them). Flows: [`groupPostDialog`](../flows/groupPostDialog.md), [`groupPostComments`](../flows/groupPostComments.md) |
| textbox "Submit your first comment…" | The comment box | sending a comment | on focus: [`useGroupsCometTypeaheadBootloadDataSourceQuery`](useGroupsCometTypeaheadBootloadDataSourceQuery.md), [`useGroupsCometMentionsBootloadDataSourceWithTaggingTransparencyQuery`](useGroupsCometMentionsBootloadDataSourceWithTaggingTransparencyQuery.md), [`CometUFIConversationGuideContainerQuery`](../background/CometUFIConversationGuideContainerQuery.md) |
| button "Comment with an avatar sticker", "Insert an emoji", "Attach a photo or video", "Comment with a GIF", "Comment with a sticker" | Parts of a comment | with the comment | not recorded |
| button "Share, send this to friends or post it on your profile." | The share sheet for the post | sharing | [`CometUnifiedShareSheetDialogQuery`](../background/CometUnifiedShareSheetDialogQuery.md) |
| button "View more comments" | Loads more of the post's comments | no | not shown on run 20261020T151100: scrolling the post's dialog loads them, [`CommentsListComponentsPaginationQuery`](../background/CommentsListComponentsPaginationQuery.md) |
| button "Most relevant" (in the post) | The comments' sort: Most relevant, Newest (every comment, newest first), All comments (with potential spam) | no | opening it sends nothing; picking All comments: [`CommentListComponentsRootQuery`](../background/CommentListComponentsRootQuery.md) (run 20261020T153648, inline and in the dialog). Under All comments the replies show inline; this run met no "View … replies" button |

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
away from a doc of its own. Run 20261020T153648 (Bethlehem, 48 steps) recorded the tabs, the
header's menus and dialogs, a post's menu, its comments and the photo viewer;
its flows are `groupTabs`, `groupHeaderMenus`, `groupPostComments` and
`groupPostDialog` (`docs/platforms/facebook/flows/`).
