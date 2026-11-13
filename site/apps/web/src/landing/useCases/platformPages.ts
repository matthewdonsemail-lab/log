import type { ShowcaseId } from './useCaseCatalog'
import type { HarnessId, HarnessSetup } from './harnessPages'

export type PlatformPageId = 'slack' | 'instagram' | 'discord' | 'twitter' | 'reddit'

export type PageId = PlatformPageId | HarnessId

export type RunCall = { tool: string; done: string; acts: boolean }

export type RunLine = { who: string; text: string; at: number; side: 'them' | 'you' | 'note' }

export type Run = {
  ask: string
  where: string
  working: string
  finished: string
  calls: RunCall[]
  lines: RunLine[]
  caption: string
}

export type PlayStep = { title: string; body: string }

export type Play = {
  name: string
  ask: string
  calls: string[]
  outcome: { label: string; tag: string }[]
  steps: [PlayStep, PlayStep, PlayStep]
  how: PlayHow
}

export type PlayRow = { who: string; what: string; status: string }

export type MomentKind = 'platform' | 'meme' | 'voice' | 'react' | 'voiceGate'

export type Moment = { label: string; tool: string; kind: MomentKind }

export type PlayHow = { steps: Moment[]; rows: PlayRow[]; done: string }

export type PlatformPage = {
  id: PageId
  path: string
  platformId: string
  showcaseId: ShowcaseId | null
  run: Run
  prompt: string
  moments: Moment[]
  play: Play
  harness?: HarnessSetup
}

export const SLACK_RUN: Run = {
  ask: 'go on docs/useCases/slack/dmReply.md for priya',
  where: 'growth-co · DM with Priya',
  working: 'reading',
  finished: 'sent, one line at a time',
  calls: [
    { tool: 'slackSessionCheck', done: 'Slack says loggedIn', acts: false },
    { tool: 'slackWorkspaces', done: 'the workspace is found', acts: false },
    { tool: 'slackChats', done: 'one DM with that person', acts: false },
    { tool: 'slackRead', done: 'their latest message, and before it', acts: false },
    { tool: 'voice', done: 'how you write to them', acts: false },
    { tool: 'voice + draft', done: 'the draft passes the check', acts: false },
    { tool: 'slackSendLive', done: 'Slack answers each line', acts: true },
  ],
  lines: [
    { who: 'Priya', text: 'did the outreach sheet work for you?', at: 3, side: 'them' },
    { who: 'Priya', text: 'we got 9 calls booked off it this week', at: 3, side: 'them' },
    { who: 'You', text: 'that’s brilliant', at: 5, side: 'you' },
    { who: 'You', text: 'what changed from last week?', at: 5, side: 'you' },
  ],
  caption: 'The Slack DM use case, call by call. Each step reads Slack’s own answer before the next one fires, and nothing is sent until the last one.',
}

const INSTAGRAM_RUN: Run = {
  ask: 'go on docs/useCases/instagram/dmReply.md for maya.makes',
  where: 'Instagram · DM with maya.makes',
  working: 'reading',
  finished: 'sent through the engine',
  calls: [
    { tool: 'instagramSessionCheck', done: 'loggedIn as the account’s handle', acts: false },
    { tool: 'instagramDms', done: 'their latest message, and before it', acts: false },
    { tool: 'voice', done: 'how you write to them', acts: false },
    { tool: 'memelordSearch', done: 'a meme that fits, saved as a picture', acts: false },
    { tool: 'voice + draft', done: 'the draft or the meme passes', acts: false },
    { tool: 'instagramSendLive', done: 'Instagram answers each message', acts: true },
  ],
  lines: [
    { who: 'maya.makes', text: 'finally launched the shop', at: 2, side: 'them' },
    { who: 'maya.makes', text: 'took me 8 months lol', at: 2, side: 'them' },
    { who: 'You', text: '[a meme that fits the moment, sent as a photo]', at: 4, side: 'you' },
    { who: 'You', text: 'massive, what are you selling first?', at: 5, side: 'you' },
  ],
  caption: 'The Instagram DM use case, call by call, through Instagram’s own app calls. No browser opens, and nothing is sent until the last call.',
}

const DISCORD_RUN: Run = {
  ask: 'go on docs/useCases/discord/memeReply.md for the marketing chat',
  where: 'growth-mates · #marketing',
  working: 'reading',
  finished: 'sent, shown inline',
  calls: [
    { tool: 'discordRead', done: 'the latest messages, and the chat id', acts: false },
    { tool: 'the moment', done: 'one message, with its time and author', acts: false },
    { tool: 'memelordSearch', done: 'a meme whose name fits the moment', acts: false },
    { tool: 'voice', done: 'it passes against how you write there', acts: false },
    { tool: 'discordSendLive', done: 'Discord answers sent, with its id', acts: true },
  ],
  lines: [
    { who: 'mila', text: 'anyone tried the new ads manager?', at: 1, side: 'them' },
    { who: 'deano', text: 'yeah, cut our cost per lead in half', at: 1, side: 'them' },
    { who: 'mila', text: 'wait it actually worked??', at: 2, side: 'them' },
    { who: 'You', text: '[the meme’s link, which Discord shows inline]', at: 4, side: 'you' },
  ],
  caption: 'The Discord meme reply, call by call. The chat is read first, the meme is checked like any other send, and nothing goes out until the last call.',
}

const TWITTER_RUN: Run = {
  ask: 'go on docs/useCases/twitter/dmInbox.md',
  where: 'X · DMs and X Chat, one inbox',
  working: 'reading',
  finished: 'sorted, nothing sent',
  calls: [
    { tool: 'twitterDms waiting', done: 'who is waiting on you, newest first', acts: false },
    { tool: 'twitterDms', done: 'the newest 10, whoever spoke last', acts: false },
    { tool: 'twitterDms conversation', done: 'what they asked, and when', acts: false },
    { tool: 'profile read', done: 'one line per person', acts: false },
    { tool: 'sort it', done: 'reply now, waiting on them, no action', acts: false },
  ],
  lines: [
    { who: 'Reply now', text: 'Sarah: how much for a full site?', at: 1, side: 'note' },
    { who: 'Reply now', text: 'Jay: yeah let’s do thursday', at: 2, side: 'note' },
    { who: 'Waiting on them', text: 'Tom opened your message, no reply yet', at: 3, side: 'note' },
    { who: 'No action', text: 'a pitch for a growth agency', at: 4, side: 'note' },
  ],
  caption: 'The X inbox use case, call by call. It reads the old DMs and X Chat as one inbox, sorts who is waiting on you, and sends nothing.',
}

const REDDIT_RUN: Run = {
  ask: 'find who on r/smallbusiness is asking for a booking website this week and answer them',
  where: 'r/smallbusiness · your own account',
  working: 'reading',
  finished: 'answered, in your voice',
  calls: [
    { tool: 'redditReadSubreddits', done: 'the subreddits your buyers post in', acts: false },
    { tool: 'redditReadPosts', done: 'this week’s threads asking for it', acts: false },
    { tool: 'redditReadPost', done: 'each thread and its comments, read in full', acts: false },
    { tool: 'voice', done: 'the reply passes as you', acts: false },
    { tool: 'redditReplyLive', done: 'your comment is up', acts: true },
  ],
  lines: [
    { who: 'u/sparkleclean', text: 'Need a website that takes bookings. Where do I even start?', at: 0, side: 'them' },
    { who: 'u/vanlife_dan', text: 'just use wix lol', at: 1, side: 'them' },
    { who: 'You', text: 'wix will do it but the booking bit is where you lose people. put the calendar on the first screen and take a deposit', at: 2, side: 'you' },
    { who: 'u/sparkleclean', text: 'this is really helpful, is this something you set up for people?', at: 3, side: 'them' },
  ],
  caption: 'A buyer describes their problem, and your answer is the one that helps.',
}

const SLACK_MOMENTS: Moment[] = [
  { label: 'Priya DMs you', tool: 'slackWatch', kind: 'platform' },
  { label: 'Find the DM with Priya', tool: 'slackChats', kind: 'platform' },
  { label: 'Read what she asked', tool: 'slackRead', kind: 'platform' },
  { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Send it one line at a time', tool: 'slackSendLive', kind: 'platform' },
  { label: 'React to her reply', tool: 'slackReactLive', kind: 'react' },
  { label: 'Send her a voice note', tool: 'slackVoiceLive', kind: 'voice' },
]

const INSTAGRAM_MOMENTS: Moment[] = [
  { label: 'maya.makes DMs you', tool: 'instagramWatch', kind: 'platform' },
  { label: 'Read the thread', tool: 'instagramDms', kind: 'platform' },
  { label: 'Find a meme that fits', tool: 'memelordSearch', kind: 'meme' },
  { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
  { label: 'Send the meme and a line', tool: 'instagramSendLive', kind: 'platform' },
  { label: 'Heart her reply', tool: 'instagramReactLive', kind: 'react' },
  { label: 'Send a voice note', tool: 'instagramVoiceLive', kind: 'voice' },
]

const DISCORD_MOMENTS: Moment[] = [
  { label: '#marketing lights up', tool: 'discordWatch', kind: 'platform' },
  { label: 'Catch up on the last 3 hours', tool: 'discordRead', kind: 'platform' },
  { label: 'Find a meme for the moment', tool: 'memelordSearch', kind: 'meme' },
  { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
  { label: 'Drop it in the chat', tool: 'discordSendLive', kind: 'platform' },
  { label: 'React to deano', tool: 'discordReactLive', kind: 'react' },
  { label: 'Send the group a voice note', tool: 'discordVoiceLive', kind: 'voice' },
]

const TWITTER_MOMENTS: Moment[] = [
  { label: 'Someone likes your post', tool: 'twitterNotifications', kind: 'platform' },
  { label: 'See who is waiting on you', tool: 'twitterDms', kind: 'platform' },
  { label: 'Read their whole thread', tool: 'twitterDms', kind: 'platform' },
  { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
  { label: 'Answer their comment', tool: 'twitterReplyLive', kind: 'platform' },
  { label: 'Queue the openers', tool: 'twitterQueueAdd', kind: 'platform' },
  { label: 'Follow up in their DMs', tool: 'twitterDmLive', kind: 'platform' },
  { label: 'Send a voice note', tool: 'twitterVoiceLive', kind: 'voice' },
]

const REDDIT_MOMENTS: Moment[] = [
  { label: 'Find the subreddits your buyers use', tool: 'redditReadSubreddits', kind: 'platform' },
  { label: 'Read the threads asking for it', tool: 'redditReadPosts', kind: 'platform' },
  { label: 'Read each thread in full', tool: 'redditReadPost', kind: 'platform' },
  { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Comment from your own account', tool: 'redditReplyLive', kind: 'platform' },
]

const SLACK_PLAY: Play = {
  name: 'Turn client chats into more work',
  ask: 'read my DMs in growth-co, who asked about more work?',
  calls: ['slackChats', 'slackRead', 'voice', 'slackSendLive', 'slackVoiceLive'],
  outcome: [
    { label: 'Who asked for more', tag: 'found in the chats' },
    { label: 'Replies in your voice', tag: 'voice gate' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask who wants more', body: 'Your agent reads every DM in the client’s workspace and finds who asked about more work.' },
    { title: 'log reads each chat', body: 'Found by who it is with, read in full, then a reply drafted from how you already write to them.' },
    { title: 'Answer them first', body: 'One message per line, or a voice note in your own voice when you ask. Nothing goes out without your yes.' },
  ],
  how: {
    steps: [
      { label: 'Find the client chats', tool: 'slackChats', kind: 'platform' },
      { label: 'Read who asked for more', tool: 'slackRead', kind: 'platform' },
      { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
      { label: 'Send it one line at a time', tool: 'slackSendLive', kind: 'platform' },
      { label: 'Or send a voice note', tool: 'slackVoiceLive', kind: 'voice' },
    ],
    rows: [
      { who: 'Priya', what: 'more work, reply sent', status: 'Sent' },
      { who: 'Tom', what: 'more work, reply sent', status: 'Sent' },
      { who: 'Jay', what: 'voice note', status: 'Sent' },
    ],
    done: 'Done. The clients who asked for more have their replies, one line at a time.',
  },
}

const INSTAGRAM_PLAY: Play = {
  name: 'Answer everyone who asks about your offer',
  ask: 'read my instagram dms, answer anyone asking about my offer',
  calls: ['instagramDms', 'memelordSearch', 'voice', 'instagramSendLive', 'instagramReactLive'],
  outcome: [
    { label: 'Every asker found', tag: 'the inbox read' },
    { label: 'A meme where it fits', tag: 'checked like a send' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask for the buyers', body: 'Your agent reads your Instagram DMs and finds everyone asking about what you sell.' },
    { title: 'log answers each one', body: 'Each thread read through Instagram’s own app calls, a reply in your voice, a meme where it fits.' },
    { title: 'Nobody waits', body: 'Sent with your yes, and the realtime connection brings their reply back the moment it lands.' },
  ],
  how: {
    steps: [
      { label: 'Read your DMs', tool: 'instagramDms', kind: 'platform' },
      { label: 'Find a meme that fits', tool: 'memelordSearch', kind: 'meme' },
      { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Answer each one', tool: 'instagramSendLive', kind: 'platform' },
      { label: 'Heart their reply', tool: 'instagramReactLive', kind: 'react' },
    ],
    rows: [
      { who: 'maya.makes', what: 'meme and a line', status: 'Sent' },
      { who: 'jess.fit', what: 'answer about your offer', status: 'Sent' },
      { who: 'tom.builds', what: 'answer about your offer', status: 'Sent' },
    ],
    done: 'Done. Everyone asking about your offer has an answer, with a meme where it fit.',
  },
}

const DISCORD_PLAY: Play = {
  name: 'Land clients from the servers you’re in',
  ask: 'read growth-mates #help over the last 24 hours, who is asking for help with ads?',
  calls: ['discordRead', 'memelordSearch', 'voice', 'discordSendLive', 'discordReactLive'],
  outcome: [
    { label: 'Who asked, with the times', tag: 'the chat read back' },
    { label: 'Your answer checked', tag: 'fits the room' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask who needs help', body: 'Your agent reads the channel back over the last day and finds who asked about what you do.' },
    { title: 'log answers them first', body: 'A reply that fixes what they asked, before anyone else in the server, checked against how you write there.' },
    { title: 'They DM you', body: 'The people with the problem message you, and your agent books the call in your voice. That’s a client from a server you were already in.' },
  ],
  how: {
    steps: [
      { label: 'Read #marketing back a day', tool: 'discordRead', kind: 'platform' },
      { label: 'Find a meme for the moment', tool: 'memelordSearch', kind: 'meme' },
      { label: 'Check it fits the room', tool: 'voice', kind: 'voiceGate' },
      { label: 'Answer in the chat', tool: 'discordSendLive', kind: 'platform' },
      { label: 'React to their thanks', tool: 'discordReactLive', kind: 'react' },
    ],
    rows: [
      { who: 'mila', what: 'answer about ads', status: 'Sent' },
      { who: 'deano', what: 'meme, shown inline', status: 'Sent' },
      { who: 'kai', what: 'answer about ads', status: 'Sent' },
    ],
    done: 'Done. Everyone who asked for help with ads has an answer, and mila is booked for Thursday.',
  },
}

const TWITTER_PLAY: Play = {
  name: 'Affiliate marketing through your DMs',
  ask: 'find everyone who asked about the tool I use and follow up with my affiliate link',
  calls: ['searchIndex', 'search', 'twitterDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Everyone who asked about it', tag: 'search' },
    { label: 'A follow-up in your voice', tag: 'voice gate' },
    { label: 'Your link, where it helps', tag: '--live' },
  ],
  steps: [
    { title: 'Name the tool you use', body: 'Your agent searches every conversation, X Chat included, for anyone who asked about it or went quiet on it.' },
    { title: 'log reads each thread', body: 'Their whole history first, then a follow-up that picks up where the thread left off.' },
    { title: 'Earn on the tool you love', body: 'Your affiliate credit only where it really helps them, sent with your yes, minutes apart.' },
  ],
  how: {
    steps: [
      { label: 'Read every conversation', tool: 'searchIndex', kind: 'platform' },
      { label: 'Find who asked about the tool', tool: 'search', kind: 'platform' },
      { label: 'Read their whole thread', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Follow up, your link where it helps', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: 'dana_builds', what: 'follow-up, your link', status: 'Sent' },
      { who: 'leo_ops', what: 'follow-up in your voice', status: 'Sent' },
      { who: 'priya_ships', what: 'follow-up, your link', status: 'Sent' },
    ],
    done: 'Done. Everyone who asked about the tool has a follow-up in your voice, your link only where it helps.',
  },
}

const REDDIT_PLAY: Play = {
  name: 'Answer your buyers with value first',
  ask: 'find who on r/smallbusiness is asking for a booking website this week and answer them',
  calls: ['redditReadSubreddits', 'redditReadPosts', 'redditReadPost', 'voice', 'redditReplyLive'],
  outcome: [
    { label: 'Buyers describing their problem', tag: 'found by log' },
    { label: 'Replies in your voice', tag: 'voice gate' },
    { label: 'Posted with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Name your buyers’ subreddits', body: 'Your agent reads this week’s threads where your buyers describe their problem, not keyword noise.' },
    { title: 'log reads each thread', body: 'Every comment read first, so your reply adds what nobody has said yet, written the way you write.' },
    { title: 'You press send', body: 'The reply gives value first, with no link to your product. You press send, and it goes up from your own account.' },
  ],
  how: {
    steps: [
      { label: 'Find the subreddits', tool: 'redditReadSubreddits', kind: 'platform' },
      { label: 'Read this week’s threads', tool: 'redditReadPosts', kind: 'platform' },
      { label: 'Read each thread in full', tool: 'redditReadPost', kind: 'platform' },
      { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
      { label: 'Comment from your account', tool: 'redditReplyLive', kind: 'platform' },
    ],
    rows: [
      { who: 'u/sparkleclean', what: 'asking for a booking site', status: 'Answered' },
      { who: 'u/plumbpro', what: 'asking for more leads', status: 'Answered' },
      { who: 'u/bakeryowner', what: 'asking for a website', status: 'Answered' },
    ],
    done: 'Done. 3 people asking for a booking website have your answer under their post.',
  },
}

export const PLATFORM_PAGES: PlatformPage[] = [
  { id: 'twitter', path: '/twitter', platformId: 'x', showcaseId: 'x', run: TWITTER_RUN, prompt: 'go on docs/useCases/twitter/dmInbox.md', moments: TWITTER_MOMENTS, play: TWITTER_PLAY },
  { id: 'discord', path: '/discord', platformId: 'discord', showcaseId: 'discord', run: DISCORD_RUN, prompt: 'go on docs/useCases/discord/memeReply.md for <chat>', moments: DISCORD_MOMENTS, play: DISCORD_PLAY },
  { id: 'slack', path: '/slack', platformId: 'slack', showcaseId: 'slack', run: SLACK_RUN, prompt: 'go on docs/useCases/slack/dmReply.md for <someone>', moments: SLACK_MOMENTS, play: SLACK_PLAY },
  { id: 'instagram', path: '/instagram', platformId: 'instagram', showcaseId: 'instagram', run: INSTAGRAM_RUN, prompt: 'go on docs/useCases/instagram/dmReply.md for <someone>', moments: INSTAGRAM_MOMENTS, play: INSTAGRAM_PLAY },
  { id: 'reddit', path: '/reddit', platformId: 'reddit', showcaseId: null, run: REDDIT_RUN, prompt: 'find who on r/smallbusiness is asking for a booking website this week and answer them', moments: REDDIT_MOMENTS, play: REDDIT_PLAY },
]

export const pageForPlatform = (platformId: string) => PLATFORM_PAGES.find((page) => page.platformId === platformId)
