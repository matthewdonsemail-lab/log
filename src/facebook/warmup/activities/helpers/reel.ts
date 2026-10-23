import type { PlatformActivity } from '../types'

const RUN = 'run 20261020T050610_61594063207669 (Bethlehem, AdsPower)'

export const REEL: PlatformActivity = {
  platform: 'facebook',
  activity: 'reel',
  summary: "Facebook Reels watched as a person does: open Reels, watch, on to the next with Next card, sometimes the comments opened and scrolled, sometimes the creator's profile, sometimes a like.",
  steps: [
    {
      id: 'openReels',
      action: 'goto',
      args: ['https://www.facebook.com/reel/'],
      why: 'Reels, signed in: Facebook sends it to the first reel',
      expect: { urlMatches: '/reel/\\d+', answers: [{ call: 'FBUnifiedVideoContainerQuery', says: [] }] },
      recorded: `${RUN} step 01: /reel/ → /reel/1075919665236018, 167 requests, 24 s; FBUnifiedVideoContainerQuery answered 200 on each goto /reel/ (its doc)`
    },
    {
      id: 'unmute',
      action: 'clickRole',
      args: ['button', 'Unmute'],
      why: 'sound on: Reels start muted, and nobody watches a reel with the sound off (matt, 2026-10-20)',
      expect: { hides: { role: 'button', name: 'Unmute' } },
      clicks: true,
      recorded: `${RUN} step 03: the player showed button "Unmute" [pressed] (muted); run 20261020T052708 step 12: clicked, the Unmute button gone (11/11 with the sound on)`
    },
    { id: 'watch', action: 'dwell', args: ['6-12'], why: 'watch it with the sound on, the cursor moving (rule 32)' },
    {
      id: 'swipe',
      action: 'clickRole',
      args: ['button', 'Next card'],
      why: "on to the next reel: desktop Reels' own control (the wheel only scrolls the page)",
      expect: { urlChanges: true, urlMatches: '/reel/\\d+' },
      clicks: true,
      recorded: `${RUN} step 11: Next card → /reel/1049925804499764, FBUnifiedVideoSeenStateMutation 200`
    },
    {
      id: 'glance',
      action: 'dwell',
      args: ['1-3'],
      why: "a glance: most reels aren't watched through, a person skips on after a second or two (matt, 2026-10-20)"
    },
    { id: 'swipe', action: 'clickRole', args: ['button', 'Next card'], why: 'skip on', expect: { urlChanges: true, urlMatches: '/reel/\\d+' }, clicks: true },
    { id: 'glance', action: 'dwell', args: ['1-3'], why: 'another glance' },
    { id: 'swipe', action: 'clickRole', args: ['button', 'Next card'], why: 'skip on again: a few in a row', expect: { urlChanges: true, urlMatches: '/reel/\\d+' }, clicks: true },
    { id: 'watch', action: 'dwell', args: ['5-10'], why: 'this one catches: watch it' },
    {
      id: 'openComments',
      action: 'clickRole',
      args: ['button', 'Comment'],
      why: "open this reel's comments: a side panel",
      expect: { shows: { role: 'heading', name: 'Comments' } },
      clicks: true,
      recorded: `${RUN} step 12: the panel opened (heading "Comments", Most relevant, each comment's Like and Reply)`
    },
    {
      id: 'scrollComments',
      action: 'scrollIn',
      args: ['heading', 'Comments', '2-3', '300-500'],
      why: 'read down the comments: the wheel over the panel, not the video',
      expect: { shows: { role: 'heading', name: 'Comments' } },
      recorded: 'not recorded yet: scrollIn is new (the session must load it)'
    },
    {
      id: 'closeComments',
      action: 'clickRole',
      args: ['button', 'Comment'],
      why: 'close the comments: the same button toggles them',
      expect: { hides: { role: 'heading', name: 'Comments' } },
      clicks: true,
      recorded: `${RUN} step 13: closed, the video grew to the middle`
    },
    {
      id: 'openProfile',
      action: 'clickAny',
      args: ['link', 'see owner profile$', '1'],
      why: "open the creator's profile",
      expect: { urlChanges: true },
      clicks: true,
      recorded: `${RUN} step 14: didn't open it; run 20261020T051842 step 08 opened it; run 20261020T052254 step 08 didn't (clickAny chose a covered card's link): now only a link a person can click`
    },
    {
      id: 'backToReel',
      action: 'goto',
      args: ['{urlBefore:openProfile}'],
      why: "back to the reel it came from, by the reel's own URL (the browser's back left Facebook when the reel was the first page)",
      expect: { urlMatches: '/reel/\\d+' },
      recorded: `${RUN} step 16: back went to about:blank; run 20261020T052254 step 09 the same after the profile didn't open: now the reel's URL`
    },
    {
      id: 'like',
      action: 'clickRole',
      args: ['button', 'Like'],
      why: 'like the reel (acts on Facebook)',
      expect: { answers: [{ call: 'CometUFIFeedbackReactMutation', says: [{ answer: 'data.feedback_react.feedback.viewer_feedback_reaction_info.id', sent: 'variables.input.feedback_reaction_id' }] }] },
      clicks: true,
      likes: true,
      recorded: 'run 20261020T052708 step 10: Like became button "Remove Like"; from 2026-10-23 it passes on Facebook\'s answer instead (rule 73): CometUFIFeedbackReactMutation answered 200 with the reaction we sent saved (Bethlehem inspect 20261023T051540 steps 03 and 05)'
    }
  ],
  knownIssues: [
    "glance and the skip streaks: new (matt, 2026-10-20: people skip past most reels); first checked live by a drawn session (`run`)"
  ]
}
