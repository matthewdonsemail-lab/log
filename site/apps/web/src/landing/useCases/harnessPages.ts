import type { Platform } from '../PlatformSuite'
import type { SessionEvent } from '../agentSessionScript'
import { faChatgptMark, faClaudeMark, faCursorMark, faGrokMark, faHermesMark } from '../agentMarks'
import type { Moment, PlatformPage, Play, Run } from './platformPages'

export type HarnessId = 'cursor' | 'claude' | 'chatgpt' | 'hermes' | 'grok'

export const HOSTED_MCP = 'https://mcp.listeningkit.com/mcp'

export const LOG_INSTALL = 'curl -fsSL https://log.listeningkit.com/install.sh | sh'

export type SetupStep = { text: string; code?: string }

export type SetupSource = { label: string; href: string }

export type SetupRoute = { id: string; label: string; best: string; steps: SetupStep[]; sources: SetupSource[] }

export type HarnessWindow = {
  dark: boolean
  bg: string
  side: string
  line: string
  text: string
  muted: string
  user: string
  accent: string
  font: string
  placeholder: string
  sideItems: string[]
  variant: 'claude' | 'codex' | 'dark'
}

export type HarnessSetup = {
  name: string
  logo: string
  lede: string
  why: string
  lines: string[]
  wall: string
  window: HarnessWindow
  session: { thread: string; recents: string[]; events: SessionEvent[] }
  connect: { label: string; line: string }[]
  routes: SetupRoute[]
  plays: Play[]
}

const MCP_DOCS: SetupSource = { label: 'log: connect your agent', href: 'https://github.com/matthewdonsemail-lab/log/blob/main/docs/mcp.md' }

const GUIDE_CALL: SessionEvent = { kind: 'tool', name: 'getGuide', args: '{ topic: "logMcpInstructions" }', result: ['log MCP guide loaded: every use case and how to ask for it'] }

const CURSOR_JSON = `{
  "mcpServers": {
    "log": { "url": "${HOSTED_MCP}" }
  }
}`

const CURSOR_LOCAL_JSON = `{
  "mcpServers": {
    "log": { "type": "stdio", "command": "logMcp" }
  }
}`

const HERMES_YAML = `mcp_servers:
  log:
    url: "${HOSTED_MCP}"
    auth: oauth`

const HERMES_LOCAL_YAML = `mcp_servers:
  log:
    command: "logMcp"`

const GROK_API = `import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("XAI_API_KEY"), base_url="https://api.x.ai/v1")
response = client.responses.create(
    model="grok-4.7",
    input="who is waiting on me in my x dms?",
    tools=[{
        "type": "mcp",
        "server_url": "https://<your-host>/mcp",
        "server_label": "log",
        "authorization": os.getenv("LOG_MCP_TOKEN"),
    }],
)`

const CURSOR_RUN: Run = {
  ask: 'i just shipped dark mode, tell everyone who asked for it',
  where: 'Cursor · Agent chat, next to your code',
  working: 'searching',
  finished: 'told, in your voice',
  calls: [
    { tool: 'getGuide', done: 'log’s guide, loaded once', acts: false },
    { tool: 'search', done: 'every conversation that asked for it', acts: false },
    { tool: 'twitterDms', done: 'each thread, read in full', acts: false },
    { tool: 'voice', done: 'each draft passes as you', acts: false },
    { tool: 'twitterDmLive', done: 'X answers each send', acts: true },
  ],
  lines: [
    { who: 'Asked for it', text: '@dana_builds on X, in March', at: 1, side: 'note' },
    { who: 'Asked for it', text: 'mila in Discord, in April', at: 2, side: 'note' },
    { who: 'You', text: 'dark mode is live', at: 3, side: 'you' },
    { who: 'You', text: 'you asked first so you get to break it first', at: 3, side: 'you' },
  ],
  caption: 'You ship in Cursor, and the same chat tells everyone who asked for it.',
}

const CURSOR_MOMENTS: Moment[] = [
  { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
  { label: 'Find who asked for it', tool: 'search', kind: 'platform' },
  { label: 'Read each thread', tool: 'twitterDms', kind: 'platform' },
  { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Tell them it shipped', tool: 'twitterDmLive', kind: 'platform' },
  { label: 'Read #help for bug reports', tool: 'discordRead', kind: 'platform' },
  { label: 'Answer with the fix', tool: 'discordSendLive', kind: 'platform' },
]

const CURSOR_PLAY: Play = {
  name: 'Tell everyone who asked, the moment you ship',
  ask: 'i just shipped dark mode, find everyone who asked for it and tell them',
  calls: ['searchIndex', 'search', 'twitterDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Everyone who asked for it', tag: 'search' },
    { label: 'A line in your voice', tag: 'voice gate' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ship it in Cursor', body: 'Same chat, same window. Say what you shipped and Cursor’s agent asks log who wanted it.' },
    { title: 'log finds who asked', body: 'Every conversation on every platform, searched by words and by meaning, then each thread read in full.' },
    { title: 'They hear it from you', body: 'A short note in your own voice to each person, sent only when you say yes. Early users become your first fans.' },
  ],
  how: {
    steps: [
      { label: 'Read every conversation', tool: 'searchIndex', kind: 'platform' },
      { label: 'Find who asked for it', tool: 'search', kind: 'platform' },
      { label: 'Read their whole thread', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Tell them it shipped', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: 'dana_builds', what: 'asked in March', status: 'Sent' },
      { who: 'leo_ops', what: 'asked in April', status: 'Sent' },
      { who: 'mila', what: 'asked in Discord', status: 'Sent' },
    ],
    done: 'Done. Everyone who asked for dark mode knows it shipped, each in your own words.',
  },
}

const CURSOR_PLAYS: Play[] = [
  {
    name: 'Answer bug reports from your Discord',
    ask: 'read #help in my server since yesterday, anything that is a bug in this repo?',
    calls: ['discordRead', 'voice', 'discordSendLive'],
    outcome: [
      { label: 'Bug reports, with who and when', tag: 'the chat read back' },
      { label: 'Checked against your code', tag: 'Cursor' },
      { label: 'Answered with your yes', tag: '--live' },
    ],
    steps: [
      { title: 'Ask what broke', body: 'log reads #help back a day. Cursor already has your code open, so it tells a real bug from a setup question.' },
      { title: 'Fix it where you are', body: 'The fix lands in the same window, and the reply says what changed, in the way you write in that server.' },
      { title: 'They see you answer', body: 'Each person gets their answer in the thread, only when you say go.' },
    ],
    how: {
      steps: [
        { label: 'Read #help back a day', tool: 'discordRead', kind: 'platform' },
        { label: 'Check it fits the room', tool: 'voice', kind: 'voiceGate' },
        { label: 'Answer in the thread', tool: 'discordSendLive', kind: 'platform' },
      ],
      rows: [
        { who: 'kai', what: 'login loop on Safari, fixed', status: 'Answered' },
        { who: 'rory', what: 'setup question', status: 'Answered' },
      ],
      done: 'Done. The Safari bug is fixed in your branch, and both people in #help have an answer.',
    },
  },
  {
    name: 'Turn what people ask into your docs',
    ask: 'what do people keep asking me about setup? write the answers into the FAQ',
    calls: ['search', 'twitterDms', 'slackRead'],
    outcome: [
      { label: 'The questions, counted', tag: 'reads only' },
      { label: 'An FAQ in your repo', tag: 'Cursor edits' },
      { label: 'Nothing sent', tag: 'safe' },
    ],
    steps: [
      { title: 'Ask what keeps coming up', body: 'log searches your DMs and client chats for the setup questions people ask again and again.' },
      { title: 'Cursor writes the page', body: 'The answers go straight into your docs as a change you review, like any other edit.' },
      { title: 'Fewer of the same DMs', body: 'Next time someone asks, the answer is already a link.' },
    ],
    how: {
      steps: [
        { label: 'Find the repeat questions', tool: 'search', kind: 'platform' },
        { label: 'Read the X threads', tool: 'twitterDms', kind: 'platform' },
        { label: 'Read the client chats', tool: 'slackRead', kind: 'platform' },
      ],
      rows: [
        { who: 'how do I connect it?', what: 'asked 9 times', status: 'Added' },
        { who: 'does it work on Windows?', what: 'asked 5 times', status: 'Added' },
      ],
      done: 'Done. The FAQ has the five questions people ask most, ready for you to review.',
    },
  },
]

const CURSOR_SESSION: SessionEvent[] = [
  { kind: 'user', text: 'i just shipped dark mode, tell everyone who asked for it' },
  GUIDE_CALL,
  { kind: 'tool', name: 'search', args: '{ query: "dark mode" }', result: ['4 conversations asked for dark mode', '@dana_builds · X · 12 Mar', 'mila · Discord · 2 Apr'] },
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", with: "dana_builds" }', result: ['dana_builds: any chance of a dark mode? my eyes', 'You: it’s on the list'] },
  { kind: 'assistant', text: 'Dana asked in March and you told her it was on the list. Drafting from how you write to her.' },
  { kind: 'tool', name: 'voice', args: '{ to: "dana_builds", text: "dark mode is live\\nyou asked first so you get to break it first" }', result: ['dana_builds PASS: voice 0.96 · answers them 0.95'] },
  { kind: 'user', text: 'send it' },
  { kind: 'tool', name: 'twitterDmLive', args: '{ account: "you", userId: "…", approvedBy: "you", confirmLive: true }', result: ['sent 2 messages, one per line', 'X answered ok'] },
  { kind: 'assistant', text: 'Told Dana it shipped. The other 3 are drafted the same way from their own threads, waiting on your yes.' },
]

const CLAUDE_RUN: Run = {
  ask: 'who is waiting on me everywhere?',
  where: 'Claude · one chat, every inbox',
  working: 'reading',
  finished: 'sorted, nothing sent',
  calls: [
    { tool: 'getGuide', done: 'log’s guide, loaded once', acts: false },
    { tool: 'twitterDms', done: 'who is waiting on X', acts: false },
    { tool: 'slackChats', done: 'the Slack DMs with a new message', acts: false },
    { tool: 'instagramDms', done: 'the Instagram threads waiting on you', acts: false },
    { tool: 'discordChats', done: 'the Discord DMs waiting on you', acts: false },
  ],
  lines: [
    { who: 'X', text: 'Sarah: how much for a full site?', at: 1, side: 'note' },
    { who: 'Slack', text: 'Priya: can you take on the next launch?', at: 2, side: 'note' },
    { who: 'Instagram', text: 'maya.makes: do you do custom orders?', at: 3, side: 'note' },
    { who: 'Discord', text: 'nobody waiting', at: 4, side: 'note' },
  ],
  caption: 'One question in Claude, every inbox read, nothing sent until you say so.',
}

const CLAUDE_MOMENTS: Moment[] = [
  { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
  { label: 'See who is waiting on X', tool: 'twitterDms', kind: 'platform' },
  { label: 'Check your Slack DMs', tool: 'slackChats', kind: 'platform' },
  { label: 'Check your Instagram DMs', tool: 'instagramDms', kind: 'platform' },
  { label: 'Draft each reply in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Send it once you say so', tool: 'twitterDmLive', kind: 'platform' },
  { label: 'Follow up with who went quiet', tool: 'twitterQueueRunLive', kind: 'platform' },
]

const CLAUDE_PLAY: Play = {
  name: 'Clear every inbox from one chat',
  ask: 'who is waiting on me everywhere? answer them',
  calls: ['twitterDms', 'slackChats', 'instagramDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Everyone waiting, every platform', tag: 'reads' },
    { label: 'Replies in your voice', tag: 'voice gate' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask Claude once', body: 'In Claude Code or the Claude app, ask who is waiting on you. log reads X, Slack, Instagram and Discord for it.' },
    { title: 'log reads each thread', body: 'Every chat read in full first, then a reply drafted from how you already write to that person.' },
    { title: 'Inbox zero, in your voice', body: 'You read the drafts and say go. Each one goes out from your own account, one line at a time.' },
  ],
  how: {
    steps: [
      { label: 'See who is waiting on X', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check your Slack DMs', tool: 'slackChats', kind: 'platform' },
      { label: 'Check your Instagram DMs', tool: 'instagramDms', kind: 'platform' },
      { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Send it, once you say so', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: 'Sarah', what: 'X, a price for a site', status: 'Replied' },
      { who: 'Priya', what: 'Slack, the next launch', status: 'Replied' },
      { who: 'maya.makes', what: 'Instagram, a custom order', status: 'Replied' },
    ],
    done: 'Done. Everyone waiting on you has a reply in your voice, and nothing went out before you said so.',
  },
}

const CLAUDE_PLAYS: Play[] = [
  {
    name: 'Follow up with everyone who went quiet',
    ask: 'who opened my dm and never replied? queue a follow-up for each',
    calls: ['twitterDms', 'voice', 'twitterQueueAdd', 'twitterQueueApprove', 'twitterQueueRunLive'],
    outcome: [
      { label: 'Who went quiet', tag: 'followUpDue' },
      { label: 'A follow-up per person', tag: 'voice gate' },
      { label: 'Sent slowly, after you approve', tag: 'queue' },
    ],
    steps: [
      { title: 'Ask who went quiet', body: 'log finds everyone who opened your message and never answered.' },
      { title: 'One follow-up each', body: 'Each one written from that thread, not a template, and checked against how you write.' },
      { title: 'Approve, then it runs', body: 'You approve the queue and log sends one at a time, minutes apart, inside your waking hours.' },
    ],
    how: {
      steps: [
        { label: 'Find who went quiet', tool: 'twitterDms', kind: 'platform' },
        { label: 'Check each one sounds like you', tool: 'voice', kind: 'voiceGate' },
        { label: 'Queue the follow-ups', tool: 'twitterQueueAdd', kind: 'platform' },
        { label: 'Approve the queue', tool: 'twitterQueueApprove', kind: 'platform' },
        { label: 'Send them slowly', tool: 'twitterQueueRunLive', kind: 'platform' },
      ],
      rows: [
        { who: 'Tom', what: 'opened, no reply', status: 'Queued' },
        { who: 'jess_writes', what: 'opened, no reply', status: 'Queued' },
      ],
      done: 'Done. Two follow-ups approved and going out minutes apart.',
    },
  },
  {
    name: 'Answer your buyers on Reddit',
    ask: 'find who on r/smallbusiness is asking for a booking website this week',
    calls: ['redditReadPosts', 'redditReadPost', 'voice', 'redditReplyLive'],
    outcome: [
      { label: 'Threads worth answering', tag: 'found by log' },
      { label: 'A reply that helps first', tag: 'voice gate' },
      { label: 'Posted with your yes', tag: '--live' },
    ],
    steps: [
      { title: 'Ask Claude to look', body: 'log reads this week’s threads where your buyers describe their problem.' },
      { title: 'Claude reads every comment', body: 'So your answer adds what nobody has said yet, written the way you write.' },
      { title: 'You press send', body: 'The reply gives value first, with no link, and goes up from your own account.' },
    ],
    how: {
      steps: [
        { label: 'Read this week’s threads', tool: 'redditReadPosts', kind: 'platform' },
        { label: 'Read each thread in full', tool: 'redditReadPost', kind: 'platform' },
        { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
        { label: 'Comment from your account', tool: 'redditReplyLive', kind: 'platform' },
      ],
      rows: [
        { who: 'u/sparkleclean', what: 'asking for a booking site', status: 'Answered' },
        { who: 'u/bakeryowner', what: 'asking for a website', status: 'Answered' },
      ],
      done: 'Done. Two people asking for a booking website have your answer under their post.',
    },
  },
]

const CLAUDE_SESSION: SessionEvent[] = [
  { kind: 'user', text: 'who is waiting on me everywhere?' },
  GUIDE_CALL,
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", waiting: true }', result: ['2 waiting on you', 'Sarah · 2h ago: how much for a full site?'] },
  { kind: 'tool', name: 'slackChats', args: '{ account: "you", workspace: "growth-co" }', result: ['Priya · DM · 20m ago: can you take on the next launch?'] },
  { kind: 'tool', name: 'instagramDms', args: '{ account: "you" }', result: ['8 threads, 1 waiting on you', 'maya.makes · 1h ago: do you do custom orders?'] },
  { kind: 'assistant', text: 'Three people are waiting: Sarah on X wants a price, Priya on Slack wants you for the next launch, and Maya on Instagram asked about custom orders. Want replies for all three?' },
  { kind: 'user', text: 'yes, start with priya' },
  { kind: 'tool', name: 'voice', args: '{ to: "Priya", text: "yeah i’m in\\nwhen does it kick off?" }', result: ['Priya PASS: voice 0.97 · answers them 0.96'] },
  { kind: 'tool', name: 'slackSendLive', args: '{ account: "you", chat: "Priya", approvedBy: "you", confirmLive: true }', result: ['sent 2 messages, one per line', 'Slack answered ok'] },
  { kind: 'assistant', text: 'Replied to Priya. Sarah and Maya are drafted next, each from their own thread.' },
]

const CHATGPT_RUN: Run = {
  ask: 'what are people on r/smallbusiness asking for this week?',
  where: 'ChatGPT · log added as an app',
  working: 'reading',
  finished: 'researched, ready to answer',
  calls: [
    { tool: 'getGuide', done: 'log’s guide, loaded once', acts: false },
    { tool: 'redditReadPosts', done: 'this week’s posts', acts: false },
    { tool: 'redditReadPost', done: 'the best threads, read in full', acts: false },
    { tool: 'voice', done: 'a reply that passes as you', acts: false },
  ],
  lines: [
    { who: '#1', text: 'a website that takes bookings', at: 1, side: 'note' },
    { who: '#2', text: 'more leads without ads', at: 2, side: 'note' },
    { who: '#3', text: 'someone to answer the phone', at: 3, side: 'note' },
  ],
  caption: 'Ask ChatGPT what your buyers want, and it reads the threads through log.',
}

const CHATGPT_MOMENTS: Moment[] = [
  { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
  { label: 'Read this week’s posts', tool: 'redditReadPosts', kind: 'platform' },
  { label: 'Read the best threads in full', tool: 'redditReadPost', kind: 'platform' },
  { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Comment from your own account', tool: 'redditReplyLive', kind: 'platform' },
  { label: 'Sort your X inbox', tool: 'twitterDms', kind: 'platform' },
]

const CHATGPT_PLAY: Play = {
  name: 'Research your buyers from one chat',
  ask: 'what are people on r/smallbusiness asking for this week? answer the best one',
  calls: ['redditReadSubreddits', 'redditReadPosts', 'redditReadPost', 'voice', 'redditReplyLive'],
  outcome: [
    { label: 'What your buyers ask for most', tag: 'reads' },
    { label: 'A reply that helps first', tag: 'voice gate' },
    { label: 'Posted with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask ChatGPT', body: 'Turn log on in the chat and ask what your buyers keep asking for. log reads the subreddits they post in.' },
    { title: 'log reads the threads', body: 'Every comment on the best threads, so the answer adds what nobody has said yet.' },
    { title: 'You press send', body: 'ChatGPT shows you the reply first. It goes up from your own account only when you say yes.' },
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
      { who: 'a booking website', what: 'asked 7 times', status: '#1' },
      { who: 'more leads', what: 'asked 5 times', status: '#2' },
      { who: 'u/sparkleclean', what: 'answered', status: 'Sent' },
    ],
    done: 'Done. You know what r/smallbusiness wants most, and the best thread has your answer.',
  },
}

const CHATGPT_PLAYS: Play[] = [
  {
    name: 'Sort your X inbox before you reply',
    ask: 'sort my x dms: who do I reply to now?',
    calls: ['twitterDms', 'profile'],
    outcome: [
      { label: 'Reply now', tag: 'waiting on you' },
      { label: 'Waiting on them', tag: 'seen, no reply' },
      { label: 'No action', tag: 'nothing sent' },
    ],
    steps: [
      { title: 'Ask ChatGPT to sort it', body: 'log reads your old DMs and X Chat as one inbox, newest first.' },
      { title: 'One line per person', body: 'Who they are and what they asked, so you know who matters before you open a thread.' },
      { title: 'Nothing sent', body: 'It only reads. You decide who gets a reply.' },
    ],
    how: {
      steps: [
        { label: 'See who is waiting on you', tool: 'twitterDms', kind: 'platform' },
        { label: 'Read who each person is', tool: 'profile', kind: 'platform' },
      ],
      rows: [
        { who: 'Sarah', what: 'how much for a full site?', status: 'Reply now' },
        { who: 'Tom', what: 'opened, no reply', status: 'Waiting' },
      ],
      done: 'Done. Two people to answer now, one waiting on them, and a pitch you can ignore.',
    },
  },
  {
    name: 'Answer every DM about your offer',
    ask: 'read my instagram dms, draft an answer for anyone asking about my offer',
    calls: ['instagramDms', 'voice', 'instagramSendLive'],
    outcome: [
      { label: 'Every asker found', tag: 'the inbox read' },
      { label: 'Answers in your voice', tag: 'voice gate' },
      { label: 'Sent with your yes', tag: '--live' },
    ],
    steps: [
      { title: 'Ask for the buyers', body: 'log reads your Instagram DMs and finds everyone asking about what you sell.' },
      { title: 'A draft for each', body: 'Written from each thread and checked against how you write.' },
      { title: 'Nobody waits', body: 'You say go in the chat and each answer goes out from your account.' },
    ],
    how: {
      steps: [
        { label: 'Read your DMs', tool: 'instagramDms', kind: 'platform' },
        { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
        { label: 'Answer each one', tool: 'instagramSendLive', kind: 'platform' },
      ],
      rows: [
        { who: 'jess.fit', what: 'asked about coaching', status: 'Sent' },
        { who: 'tom.builds', what: 'asked about the price', status: 'Sent' },
      ],
      done: 'Done. Everyone asking about your offer has an answer.',
    },
  },
]

const CHATGPT_SESSION: SessionEvent[] = [
  { kind: 'user', text: 'what are people on r/smallbusiness asking for this week?' },
  GUIDE_CALL,
  { kind: 'tool', name: 'redditReadPosts', args: '{ account: "you", subreddit: "smallbusiness", days: "7" }', result: ['this week’s posts, 7 asking for a booking website', 'u/sparkleclean: Need a website that takes bookings. Where do I even start?'] },
  { kind: 'tool', name: 'redditReadPost', args: '{ account: "you", post: "1oq…k2" }', result: ['2 vans, losing jobs because people can’t book online', 'u/vanlife_dan: just use wix lol'] },
  { kind: 'assistant', text: 'The top ask this week is a website that takes bookings (7 posts), then more leads without ads. The best thread is u/sparkleclean, losing jobs with no online booking. Want a reply?' },
  { kind: 'user', text: 'yes, value first, no link' },
  { kind: 'tool', name: 'voice', args: '{ to: "sparkleclean", text: "wix will do it but the booking bit is where you lose people…" }', result: ['sparkleclean PASS: voice 0.95 · answers them 0.96'] },
  { kind: 'tool', name: 'redditReplyLive', args: '{ account: "you", post: "1oq…k2", approvedBy: "you", confirmLive: true }', result: ['commented, Reddit answered with its id'] },
  { kind: 'assistant', text: 'Answered u/sparkleclean from your account with the fix nobody else gave, and no link.' },
]

const HERMES_RUN: Run = {
  ask: 'every morning at 8, tell me on telegram who is waiting on me',
  where: 'Hermes · on your server, you on Telegram',
  working: 'watching',
  finished: 'a list on your phone each morning',
  calls: [
    { tool: 'getGuide', done: 'log’s guide, loaded once', acts: false },
    { tool: 'twitterDms', done: 'who is waiting on X', acts: false },
    { tool: 'slackChats', done: 'the Slack DMs with a new message', acts: false },
    { tool: 'instagramDms', done: 'the Instagram threads waiting', acts: false },
    { tool: 'twitterDmLive', done: 'sent after your yes on Telegram', acts: true },
  ],
  lines: [
    { who: 'Hermes', text: '3 people are waiting on you', at: 1, side: 'them' },
    { who: 'Hermes', text: 'Sarah on X wants a price. draft ready', at: 2, side: 'them' },
    { who: 'You', text: 'send it', at: 3, side: 'you' },
    { who: 'Hermes', text: 'sent. X answered ok', at: 4, side: 'them' },
  ],
  caption: 'Hermes runs on a server all day and reports to your phone. You answer with a word.',
}

const HERMES_MOMENTS: Moment[] = [
  { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
  { label: 'Check who is waiting on X', tool: 'twitterDms', kind: 'platform' },
  { label: 'Check your Slack DMs', tool: 'slackChats', kind: 'platform' },
  { label: 'Check your Instagram DMs', tool: 'instagramDms', kind: 'platform' },
  { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
  { label: 'Send it when you say yes', tool: 'twitterDmLive', kind: 'platform' },
  { label: 'Welcome new Discord members', tool: 'discordSendLive', kind: 'platform' },
]

const HERMES_PLAY: Play = {
  name: 'Who is waiting on you, on your phone every morning',
  ask: 'every morning at 8, tell me on telegram who is waiting on me and draft the replies',
  calls: ['twitterDms', 'slackChats', 'instagramDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'A list each morning', tag: 'scheduled' },
    { label: 'Drafts in your voice', tag: 'voice gate' },
    { label: 'Sent when you reply yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask Hermes once', body: 'From Telegram or any chat Hermes is on, ask for a morning list. Hermes runs it on a schedule on its own server.' },
    { title: 'log reads every inbox', body: 'X, Slack and Instagram read through log, with a reply drafted for each person from how you write to them.' },
    { title: 'Say yes from your phone', body: 'The list lands on Telegram. Reply “send it” and log sends from your own account.' },
  ],
  how: {
    steps: [
      { label: 'Check who is waiting on X', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check your Slack DMs', tool: 'slackChats', kind: 'platform' },
      { label: 'Check your Instagram DMs', tool: 'instagramDms', kind: 'platform' },
      { label: 'Draft it in your voice', tool: 'voice', kind: 'voiceGate' },
      { label: 'Send it when you say yes', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: 'Sarah', what: 'X, wants a price', status: 'Sent' },
      { who: 'Priya', what: 'Slack, next launch', status: 'Drafted' },
      { who: 'maya.makes', what: 'Instagram, custom order', status: 'Drafted' },
    ],
    done: 'Done. Your 8am list is on Telegram, and Sarah already has her answer.',
  },
}

const HERMES_PLAYS: Play[] = [
  {
    name: 'Welcome every new member of your community',
    ask: 'whenever someone joins my discord, welcome them in #welcome in my voice',
    calls: ['discordWatch', 'discordRead', 'voice', 'discordSendLive'],
    outcome: [
      { label: 'Every new member seen', tag: 'live' },
      { label: 'A welcome in your voice', tag: 'voice gate' },
      { label: 'Posted in #welcome', tag: '--live' },
    ],
    steps: [
      { title: 'Ask Hermes once', body: 'Hermes stays on all day, so it can keep log’s live Discord watch running while you sleep.' },
      { title: 'log hears them join', body: 'The moment a new member says hello, Hermes reads what they said and drafts a welcome.' },
      { title: 'Nobody joins to silence', body: 'Each welcome sounds like you and asks what brought them in.' },
    ],
    how: {
      steps: [
        { label: 'Hear new messages live', tool: 'discordWatch', kind: 'platform' },
        { label: 'Read what they said', tool: 'discordRead', kind: 'platform' },
        { label: 'Check it fits the room', tool: 'voice', kind: 'voiceGate' },
        { label: 'Welcome them in #welcome', tool: 'discordSendLive', kind: 'platform' },
      ],
      rows: [
        { who: 'finn', what: 'joined at 2am', status: 'Welcomed' },
        { who: 'ivy', what: 'joined at 6am', status: 'Welcomed' },
      ],
      done: 'Done. Everyone who joined overnight was welcomed in your voice.',
    },
  },
  {
    name: 'Catch the leads in the servers you’re in',
    ask: 'check growth-mates #help every hour and tell me on telegram when someone asks for help with ads',
    calls: ['discordRead', 'voice', 'discordSendLive'],
    outcome: [
      { label: 'Who asked, with the time', tag: 'every hour' },
      { label: 'A reply ready to send', tag: 'voice gate' },
      { label: 'Sent with your yes', tag: '--live' },
    ],
    steps: [
      { title: 'Set it once', body: 'Hermes checks the channel through log on a schedule you choose.' },
      { title: 'A ping on your phone', body: 'When someone asks for what you do, the message and a draft reply land on Telegram.' },
      { title: 'Answer first', body: 'Reply “send it” and log answers before anyone else in the server.' },
    ],
    how: {
      steps: [
        { label: 'Read #help each hour', tool: 'discordRead', kind: 'platform' },
        { label: 'Check it fits the room', tool: 'voice', kind: 'voiceGate' },
        { label: 'Answer in the chat', tool: 'discordSendLive', kind: 'platform' },
      ],
      rows: [
        { who: 'mila', what: 'ads stopped overnight', status: 'Answered' },
        { who: 'zee', what: 'wants a funnel audit', status: 'Drafted' },
      ],
      done: 'Done. mila got your answer first, and zee’s draft is waiting on Telegram.',
    },
  },
]

const HERMES_SESSION: SessionEvent[] = [
  { kind: 'user', text: 'every morning at 8, tell me on telegram who is waiting on me' },
  GUIDE_CALL,
  { kind: 'assistant', text: 'Scheduled for 8:00 every morning. Here is today’s, so you can see what it looks like.' },
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", waiting: true }', result: ['1 waiting on you', 'Sarah · 40m ago: how much for a full site?'] },
  { kind: 'tool', name: 'slackChats', args: '{ account: "you", workspace: "growth-co" }', result: ['Priya · DM · 2h ago: can you take on the next launch?'] },
  { kind: 'tool', name: 'instagramDms', args: '{ account: "you" }', result: ['maya.makes · 5h ago: do you do custom orders?'] },
  { kind: 'tool', name: 'voice', args: '{ to: "Sarah", text: "depends what you need\\nwhat’s the site for?" }', result: ['Sarah PASS: voice 0.96 · answers them 0.97'] },
  { kind: 'assistant', text: '3 waiting: Sarah on X wants a price (draft ready), Priya on Slack, Maya on Instagram. Reply “send it” for Sarah.' },
  { kind: 'user', text: 'send it' },
  { kind: 'tool', name: 'twitterDmLive', args: '{ account: "you", userId: "…", approvedBy: "you", confirmLive: true }', result: ['sent 2 messages, one per line', 'X answered ok'] },
]

const GROK_RUN: Run = {
  ask: 'who is waiting on me in my x dms?',
  where: 'Grok · log added as a connector',
  working: 'reading',
  finished: 'answered, in your voice',
  calls: [
    { tool: 'getGuide', done: 'log’s guide, loaded once', acts: false },
    { tool: 'twitterDms', done: 'who is waiting on you, newest first', acts: false },
    { tool: 'twitterDms', done: 'their whole thread', acts: false },
    { tool: 'voice', done: 'the draft passes as you', acts: false },
    { tool: 'twitterDmLive', done: 'X answers each line', acts: true },
  ],
  lines: [
    { who: 'Reply now', text: 'Sarah: how much for a full site?', at: 1, side: 'note' },
    { who: 'Reply now', text: 'Jay: yeah let’s do thursday', at: 2, side: 'note' },
    { who: 'You', text: 'depends what you need', at: 3, side: 'you' },
    { who: 'You', text: 'what’s the site for?', at: 3, side: 'you' },
  ],
  caption: 'Ask Grok who is waiting on you, and log reads your X inbox and answers as you.',
}

const GROK_MOMENTS: Moment[] = [
  { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
  { label: 'See who is waiting on you', tool: 'twitterDms', kind: 'platform' },
  { label: 'Read their whole thread', tool: 'twitterDms', kind: 'platform' },
  { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
  { label: 'Answer their DM', tool: 'twitterDmLive', kind: 'platform' },
  { label: 'See who engaged with your post', tool: 'twitterNotifications', kind: 'platform' },
  { label: 'Reply under their comment', tool: 'twitterReplyLive', kind: 'platform' },
]

const GROK_PLAY: Play = {
  name: 'Answer everyone waiting in your X DMs',
  ask: 'who is waiting on me in my x dms? answer them',
  calls: ['twitterDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Who is waiting on you', tag: 'reads' },
    { label: 'Replies in your voice', tag: 'voice gate' },
    { label: 'Sent with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Ask Grok', body: 'With log connected, Grok reaches your own X inbox: the old DMs and X Chat, read as one.' },
    { title: 'log reads each thread', body: 'Their whole history first, then a reply drafted from how you already write to them.' },
    { title: 'You say go', body: 'Each reply goes out from your own account, one line at a time, only when you say so.' },
  ],
  how: {
    steps: [
      { label: 'See who is waiting on you', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Answer their DM', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: '@dana_builds', what: 'asked how it works', status: 'Replied' },
      { who: '@leo_ops', what: 'asked for the link', status: 'Replied' },
      { who: '@tomgrowth', what: 'opened, no reply', status: 'Waiting' },
    ],
    done: 'Done. Everyone waiting in your X DMs has a reply in your voice.',
  },
}

const GROK_PLAYS: Play[] = [
  {
    name: 'Reply to everyone who engaged with your post',
    ask: 'who replied to my last post? answer the ones worth answering',
    calls: ['twitterNotifications', 'voice', 'twitterReplyLive'],
    outcome: [
      { label: 'Everyone who engaged', tag: 'notifications' },
      { label: 'Replies in your voice', tag: 'voice gate' },
      { label: 'Posted with your yes', tag: '--live' },
    ],
    steps: [
      { title: 'Ask who engaged', body: 'log reads who liked, replied to, quoted or reposted your post.' },
      { title: 'Grok picks the ones worth it', body: 'Questions and real comments first, each reply drafted from what they said.' },
      { title: 'The thread keeps going', body: 'Your replies go up under their comments from your own account, when you say so.' },
    ],
    how: {
      steps: [
        { label: 'See who engaged', tool: 'twitterNotifications', kind: 'platform' },
        { label: 'Check it sounds like you', tool: 'voice', kind: 'voiceGate' },
        { label: 'Reply under their comment', tool: 'twitterReplyLive', kind: 'platform' },
      ],
      rows: [
        { who: '@mira_ugc', what: 'asked a question', status: 'Replied' },
        { who: '@kai_agency', what: 'quoted your post', status: 'Replied' },
      ],
      done: 'Done. The people who engaged with your post have your reply.',
    },
  },
  {
    name: 'Follow up with everyone who went quiet',
    ask: 'who opened my dm and never replied? queue a follow-up for each',
    calls: ['twitterDms', 'voice', 'twitterQueueAdd', 'twitterQueueApprove', 'twitterQueueRunLive'],
    outcome: [
      { label: 'Who went quiet', tag: 'followUpDue' },
      { label: 'A follow-up per person', tag: 'voice gate' },
      { label: 'Sent slowly, after you approve', tag: 'queue' },
    ],
    steps: [
      { title: 'Ask who went quiet', body: 'log finds everyone who opened your message and never answered.' },
      { title: 'One follow-up each', body: 'Written from each thread, not a template, and checked against how you write.' },
      { title: 'Approve, then it runs', body: 'log sends one at a time, minutes apart, inside your waking hours.' },
    ],
    how: {
      steps: [
        { label: 'Find who went quiet', tool: 'twitterDms', kind: 'platform' },
        { label: 'Check each one sounds like you', tool: 'voice', kind: 'voiceGate' },
        { label: 'Queue the follow-ups', tool: 'twitterQueueAdd', kind: 'platform' },
        { label: 'Approve the queue', tool: 'twitterQueueApprove', kind: 'platform' },
        { label: 'Send them slowly', tool: 'twitterQueueRunLive', kind: 'platform' },
      ],
      rows: [
        { who: '@tomgrowth', what: 'opened, no reply', status: 'Queued' },
        { who: '@jess_writes', what: 'opened, no reply', status: 'Queued' },
      ],
      done: 'Done. Two follow-ups approved and going out minutes apart.',
    },
  },
]

const GROK_SESSION: SessionEvent[] = [
  { kind: 'user', text: 'who is waiting on me in my x dms?' },
  GUIDE_CALL,
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", waiting: true }', result: ['2 waiting on you, newest first', '1. Sarah · 2h ago: how much for a full site?', '2. Jay · 5h ago: yeah let’s do thursday'] },
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", with: "sarah_builds" }', result: ['Sarah: saw your post about booking sites', 'Sarah: how much for a full site?'] },
  { kind: 'assistant', text: 'Sarah and Jay are waiting. Sarah wants a price for a site after your post. Drafting from how you write to her.' },
  { kind: 'tool', name: 'voice', args: '{ to: "sarah_builds", text: "depends what you need\\nwhat’s the site for?" }', result: ['sarah_builds PASS: voice 0.96 · answers them 0.97'] },
  { kind: 'user', text: 'send it' },
  { kind: 'tool', name: 'twitterDmLive', args: '{ account: "you", userId: "…", approvedBy: "you", confirmLive: true }', result: ['sent 2 messages, one per line', 'X answered ok'] },
  { kind: 'assistant', text: 'Sent Sarah your reply. Jay is next.' },
]

const LIGHT_SIDE = ['New chat', 'Search', 'Library']

const CURSOR: HarnessSetup = {
  name: 'Cursor',
  logo: '/logos/tools/cursor.svg',
  lede: 'Add log to Cursor once and the agent next to **your code** reads **every inbox you have**, tells the people who asked **the moment you ship**, and answers bug reports **in your voice**.',
  why: 'so the editor you already ship from also tells your users, in your own voice',
  lines: ['Do the whole job from', 'Tell everyone you shipped from', 'Answer bug reports from', 'Read every inbox from', 'Follow up for you from'],
  wall: 'discord',
  window: { dark: true, bg: '#181818', side: '#141414', line: 'rgba(255,255,255,0.08)', text: '#E4E4E4', muted: '#8B8B8B', user: '#2A2A2A', accent: '#E4E4E4', font: 'Inter, system-ui, sans-serif', placeholder: 'Plan, search, build anything', sideItems: ['Agents', 'your-app', 'main'], variant: 'dark' },
  session: { thread: 'Tell who asked for dark mode', recents: ['Tell who asked for dark mode', 'Bug reports from #help', 'Setup FAQ from DMs'], events: CURSOR_SESSION },
  connect: [
    { label: 'Cursor', line: `"log": { "url": "${HOSTED_MCP}" }` },
    { label: 'Cursor on your machine', line: '"log": { "type": "stdio", "command": "logMcp" }' },
  ],
  routes: [
    {
      id: 'hosted',
      label: 'Through your log workspace',
      best: 'Best when your accounts run in your log cloud workspace.',
      steps: [
        { text: 'Open ~/.cursor/mcp.json for every project, or .cursor/mcp.json for one project, and add log as a remote server:', code: CURSOR_JSON },
        { text: 'Cursor opens log in your browser. Sign in with your email, pick your team and approve Cursor.' },
        { text: 'Check log is switched on under Customize in Cursor’s sidebar. If it won’t connect, the Output panel’s “MCP Logs” say why.' },
        { text: 'Ask in Agent chat: “who is waiting on me?” The first call loads log’s guide.' },
      ],
      sources: [{ label: 'Cursor docs: Model Context Protocol', href: 'https://cursor.com/docs/context/mcp' }, MCP_DOCS],
    },
    {
      id: 'local',
      label: 'With log on your own machine',
      best: 'Best when log runs on the same computer as Cursor.',
      steps: [
        { text: 'Install log:', code: LOG_INSTALL },
        { text: 'Add logMcp to ~/.cursor/mcp.json as a local server:', code: CURSOR_LOCAL_JSON },
        { text: 'Cursor starts logMcp itself. Your sessions and settings stay in ~/.logCli on your machine.' },
      ],
      sources: [MCP_DOCS],
    },
  ],
  plays: CURSOR_PLAYS,
}

const CLAUDE: HarnessSetup = {
  name: 'Claude',
  logo: '/logos/tools/claude-desktop.svg',
  lede: 'Connect log to **Claude Code** or the **Claude app** once, then ask in plain words: Claude reads **every inbox you have**, sorts who is waiting on you, and answers each person **in your voice**, only when you say so.',
  why: 'so one chat with Claude clears every inbox you have, in your own voice',
  lines: ['Do the whole job from', 'Read every inbox from', 'Answer in your voice from', 'Follow up for you from', 'Find your buyers from'],
  wall: 'slack',
  window: { dark: false, bg: '#F0ECE0', side: '#EAE4D3', line: '#DCD4C2', text: '#1a1a18', muted: '#5b5950', user: '#E5E0D6', accent: '#c96442', font: 'ui-serif, Georgia, serif', placeholder: 'Reply to Claude…', sideItems: ['New chat', 'Chats', 'Projects'], variant: 'claude' },
  session: { thread: 'Who is waiting on me?', recents: ['Who is waiting on me?', 'Follow up with Tom', 'r/smallbusiness this week'], events: CLAUDE_SESSION },
  connect: [
    { label: 'Claude Code', line: `claude mcp add --transport http log ${HOSTED_MCP}` },
    { label: 'the Claude app', line: `Customize › Connectors › Add custom connector › ${HOSTED_MCP}` },
  ],
  routes: [
    {
      id: 'claudeCode',
      label: 'Claude Code',
      best: 'In your terminal, IDE or the Claude desktop app’s Code tab.',
      steps: [
        { text: 'Add the hosted log MCP once:', code: `claude mcp add --transport http log ${HOSTED_MCP}` },
        { text: 'Type /mcp in Claude Code, pick log and sign in. Your browser opens: sign in with your email, pick your team and approve Claude Code.' },
        { text: 'Or, with log installed on your own machine, run it locally instead:', code: 'claude mcp add log -- logMcp' },
      ],
      sources: [MCP_DOCS],
    },
    {
      id: 'claudeApp',
      label: 'The Claude app (claude.ai and desktop)',
      best: 'For chatting with Claude on the web, desktop or phone.',
      steps: [
        { text: 'Go to Customize › Connectors, click “+ Add”, then “Add custom connector”.' },
        { text: 'Name it log and paste the server URL, then click Continue:', code: HOSTED_MCP },
        { text: 'Under Authentication choose “Sign in now”, then click Add. Sign in to log, pick your team and approve Claude.' },
        { text: 'In a chat, click “+” › Connectors and switch log on.' },
        { text: 'On Team and Enterprise plans an owner adds the connector under Organization settings › Connectors first. Free plans can add one custom connector.' },
      ],
      sources: [{ label: 'Claude help: custom connectors using remote MCP', href: 'https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp' }],
    },
  ],
  plays: CLAUDE_PLAYS,
}

const CHATGPT: HarnessSetup = {
  name: 'ChatGPT',
  logo: '/logos/tools/chatgpt.svg',
  lede: 'Add log to ChatGPT as a **custom MCP server** and ask from any chat: ChatGPT does **the research** across your inboxes and the subreddits your buyers use, and drafts each reply **in your voice**. Nothing sends until you say so.',
  why: 'so the chat you already ask everything also reads your buyers and answers them as you',
  lines: ['Do the whole job from', 'Research your buyers from', 'Sort your inbox from', 'Answer in your voice from', 'Find the leads from'],
  wall: 'reddit',
  window: { dark: false, bg: '#FFFFFF', side: '#F9F9F9', line: '#ECECEC', text: '#0D0D0D', muted: '#5D5D5D', user: '#F3F3F3', accent: '#0D0D0D', font: 'ui-sans-serif, system-ui, sans-serif', placeholder: 'Ask anything', sideItems: LIGHT_SIDE, variant: 'codex' },
  session: { thread: 'r/smallbusiness this week', recents: ['r/smallbusiness this week', 'Sort my X DMs', 'Answer my Instagram DMs'], events: CHATGPT_SESSION },
  connect: [{ label: 'ChatGPT', line: `chatgpt.com/plugins › + › Add custom MCP server › ${HOSTED_MCP}` }],
  routes: [
    {
      id: 'chatgptWeb',
      label: 'ChatGPT on the web',
      best: 'ChatGPT reaches log over the internet, so it uses your log workspace’s public address.',
      steps: [
        { text: 'Go to chatgpt.com/plugins, select “+”, then “Add custom MCP server”.' },
        { text: 'Name it log and give it a description, like “my inboxes and social accounts”.' },
        { text: 'Under Connection choose Public endpoint and paste the URL, /mcp included:', code: HOSTED_MCP },
        { text: 'Set authentication to OAuth, read the warning and select “I understand and want to continue”, then “Create as a plugin”.' },
        { text: 'Sign in to log, pick your team and approve ChatGPT. Review the tools ChatGPT found, then turn log on in a chat.' },
        { text: 'Whether you can add one depends on your ChatGPT plan and, on a work account, your workspace’s settings.' },
      ],
      sources: [{ label: 'OpenAI: connect a custom MCP server to ChatGPT', href: 'https://developers.openai.com/apps-sdk/deploy/connect-chatgpt' }],
    },
  ],
  plays: CHATGPT_PLAYS,
}

const HERMES: HarnessSetup = {
  name: 'Hermes',
  logo: '/logos/tools/hermes.svg',
  lede: 'Hermes runs **on a server, all day**. Add log to its config and it checks your inboxes on **a schedule**, sends **who is waiting on you** to Telegram, and answers the moment **you say yes from your phone**.',
  why: 'so an agent that never sleeps keeps every inbox answered while you are away',
  lines: ['Do the whole job from', 'Watch every inbox from', 'Say yes from your phone with', 'Welcome new members with', 'Follow up for you from'],
  wall: 'x',
  window: { dark: true, bg: '#0B1015', side: '#070B0F', line: 'rgba(255,255,255,0.08)', text: '#E6EDF3', muted: '#8B98A5', user: '#17212B', accent: '#7FD1FF', font: 'ui-monospace, SFMono-Regular, Menlo, monospace', placeholder: 'message hermes…', sideItems: ['hermes', 'telegram', 'cron'], variant: 'dark' },
  session: { thread: 'Morning list on Telegram', recents: ['Morning list on Telegram', 'Welcome new members', '#help every hour'], events: HERMES_SESSION },
  connect: [
    { label: 'Hermes', line: `mcp_servers › log › url: ${HOSTED_MCP} · auth: oauth` },
    { label: 'Hermes on your machine', line: 'mcp_servers › log › command: logMcp' },
  ],
  routes: [
    {
      id: 'hosted',
      label: 'Through your log workspace',
      best: 'Best when Hermes runs on a server and your accounts run in your log cloud workspace.',
      steps: [
        { text: 'Add log under mcp_servers in ~/.hermes/config.yaml:', code: HERMES_YAML },
        { text: 'Sign in once. Hermes opens your browser, or prints a link if it runs on a server:', code: 'hermes mcp login log' },
        { text: 'Sign in to log, pick your team and approve Hermes. In a running session, /reload-mcp picks up the change.' },
        { text: 'log’s tools show up in Hermes as mcp_log_<tool>, like mcp_log_twitterDms.' },
      ],
      sources: [{ label: 'Hermes Agent docs: MCP', href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp' }, MCP_DOCS],
    },
    {
      id: 'local',
      label: 'With log on the same machine as Hermes',
      best: 'Best when log is installed where Hermes runs.',
      steps: [
        { text: 'Install log:', code: LOG_INSTALL },
        { text: 'Add logMcp under mcp_servers in ~/.hermes/config.yaml, then /reload-mcp:', code: HERMES_LOCAL_YAML },
      ],
      sources: [{ label: 'Hermes Agent docs: MCP', href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp' }, MCP_DOCS],
    },
  ],
  plays: HERMES_PLAYS,
}

const GROK: HarnessSetup = {
  name: 'Grok',
  logo: '/logos/tools/grokBot.svg',
  lede: 'Add log as a **custom connector on grok.com** and Grok reaches **your own X inbox** and every other platform: it sees who is waiting on you, reads the thread, and drafts the reply **in your voice**.',
  why: 'so asking Grok about your X turns into replies from your own account',
  lines: ['Do the whole job from', 'Read your X inbox from', 'Answer in your voice from', 'Reply to your comments from', 'Follow up for you from'],
  wall: 'x',
  window: { dark: true, bg: '#000000', side: '#0A0A0A', line: 'rgba(255,255,255,0.1)', text: '#F5F5F5', muted: '#8E8E8E', user: '#1F1F1F', accent: '#F5F5F5', font: 'ui-sans-serif, system-ui, sans-serif', placeholder: 'What do you want to know?', sideItems: ['Search', 'Chat', 'Connectors'], variant: 'dark' },
  session: { thread: 'Who is waiting in my X DMs?', recents: ['Who is waiting in my X DMs?', 'Replies to my last post', 'Follow up with who went quiet'], events: GROK_SESSION },
  connect: [{ label: 'Grok', line: `grok.com/connectors › New Connector › Custom › ${HOSTED_MCP}` }],
  routes: [
    {
      id: 'grokCom',
      label: 'grok.com',
      best: 'For chatting with Grok. Grok connects from xAI’s servers, so it uses your log workspace’s public address.',
      steps: [
        { text: 'Go to grok.com/connectors, click New Connector and choose Custom.' },
        { text: 'Paste the log server URL:', code: HOSTED_MCP },
        { text: 'Sign in to log, pick your team and approve Grok.' },
        { text: 'Grok finds log’s tools and uses them on its own when your question needs them, like “who is waiting on me in my x dms?”' },
        { text: 'On Grok Business and Enterprise a team admin sets up connectors first.' },
      ],
      sources: [{ label: 'xAI docs: Grok connectors', href: 'https://docs.x.ai/grok/connectors' }],
    },
    {
      id: 'xaiApi',
      label: 'The xAI API',
      best: 'For your own scripts. The API sends a fixed token instead of signing in, so it talks to a logMcp you serve yourself.',
      steps: [
        { text: 'On your server, set LOG_MCP_TOKEN in ~/.logCli/.env and serve log over HTTP, behind your own HTTPS address:', code: 'logMcp --http --host 0.0.0.0 --port 7337' },
        { text: 'Give Grok the server as an MCP tool in the Responses API:', code: GROK_API },
      ],
      sources: [{ label: 'xAI docs: remote MCP tools', href: 'https://docs.x.ai/docs/guides/tools/remote-mcp-tools' }, MCP_DOCS],
    },
  ],
  plays: GROK_PLAYS,
}

const SETUP_DOCS = '/docs/getStarted/mcp'

const doesOf = (setup: HarnessSetup) => setup.routes.map((route) => `${route.label}: ${route.steps.map((step) => (step.code ? `${step.text} ${step.code.split('\n')[0]}` : step.text)).join(' ')}`)

export const HARNESS_PLATFORMS: Platform[] = [
  { id: 'cursor', icon: faCursorMark, label: 'Cursor', body: 'log puts **every inbox** next to your code: tell the people who asked **the moment you ship**, and answer bug reports **in your voice**.', example: CURSOR_JSON, docsHref: SETUP_DOCS, does: doesOf(CURSOR) },
  { id: 'claude', icon: faClaudeMark, label: 'Claude', body: 'log gives **Claude Code** and **the Claude app** every inbox you have, so one chat finds **who is waiting on you** and answers them **in your voice**.', example: `claude mcp add --transport http log ${HOSTED_MCP}`, docsHref: SETUP_DOCS, does: doesOf(CLAUDE) },
  { id: 'chatgpt', icon: faChatgptMark, label: 'ChatGPT', body: 'log is a **custom MCP server** for ChatGPT: it **researches your buyers**, sorts your inbox and drafts each reply **in your voice**.', example: HOSTED_MCP, docsHref: SETUP_DOCS, does: doesOf(CHATGPT) },
  { id: 'hermes', icon: faHermesMark, label: 'Hermes', body: 'log runs inside **Hermes Agent** all day: a list of **who is waiting on you** on Telegram each morning, sent when **you say yes**.', example: HERMES_YAML, docsHref: SETUP_DOCS, does: doesOf(HERMES) },
  { id: 'grok', icon: faGrokMark, label: 'Grok', body: 'log is a **custom connector on grok.com**, so Grok reads **your own X inbox** and answers each person **in your voice**.', example: HOSTED_MCP, docsHref: SETUP_DOCS, does: doesOf(GROK) },
]

export const HARNESS_PAGES: PlatformPage[] = [
  { id: 'cursor', path: '/cursor', platformId: 'cursor', showcaseId: null, run: CURSOR_RUN, prompt: CURSOR_RUN.ask, moments: CURSOR_MOMENTS, play: CURSOR_PLAY, harness: CURSOR },
  { id: 'claude', path: '/claude', platformId: 'claude', showcaseId: null, run: CLAUDE_RUN, prompt: CLAUDE_RUN.ask, moments: CLAUDE_MOMENTS, play: CLAUDE_PLAY, harness: CLAUDE },
  { id: 'chatgpt', path: '/chatgpt', platformId: 'chatgpt', showcaseId: null, run: CHATGPT_RUN, prompt: CHATGPT_RUN.ask, moments: CHATGPT_MOMENTS, play: CHATGPT_PLAY, harness: CHATGPT },
  { id: 'hermes', path: '/hermes', platformId: 'hermes', showcaseId: null, run: HERMES_RUN, prompt: HERMES_RUN.ask, moments: HERMES_MOMENTS, play: HERMES_PLAY, harness: HERMES },
  { id: 'grok', path: '/grok', platformId: 'grok', showcaseId: null, run: GROK_RUN, prompt: GROK_RUN.ask, moments: GROK_MOMENTS, play: GROK_PLAY, harness: GROK },
]

export const pageForHarness = (platformId: string) => HARNESS_PAGES.find((page) => page.platformId === platformId)
