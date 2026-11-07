import { SESSION, type SessionEvent } from '../agentSessionScript'

export type PlatformSession = { thread: string; recents: string[]; events: SessionEvent[] }

const SLACK: SessionEvent[] = [
  { kind: 'user', text: 'priya messaged me on slack, reply to her' },
  { kind: 'tool', name: 'getGuide', args: '{ useCase: "slack/dmReply" }', result: ['slack dmReply: find the chat → read → draft → gate → send line by line'] },
  { kind: 'tool', name: 'slackChats', args: '{ account: "you", workspace: "growth-co" }', result: ['growth-co: 14 DMs and 3 group DMs', 'Priya · DM · last message 2m ago'] },
  {
    kind: 'tool',
    name: 'slackRead',
    args: '{ account: "you", workspace: "growth-co", chat: "Priya", limit: "20" }',
    result: ['Priya 4:12 PM: did the outreach sheet work for you?', 'Priya 4:12 PM: we got 9 calls booked off it this week'],
  },
  { kind: 'assistant', text: 'Priya asked if the outreach sheet worked for you, and said it booked her 9 calls this week. Drafting from how you write to her.' },
  { kind: 'tool', name: 'voice', args: '{ to: "Priya", with: "Priya", context: "9 calls booked off the sheet" }', result: ['how you write here: short lines, lowercase, no full stops', '3 of your real replies to things like this'] },
  { kind: 'tool', name: 'voice', args: '{ to: "Priya", context: "…", text: "that’s brilliant\\nwhat changed from last week?" }', result: ['Priya PASS: voice 0.96 · answers them 0.95'] },
  {
    kind: 'tool',
    name: 'slackSendLive',
    args: '{ account: "you", workspace: "growth-co", chat: "Priya", approvedBy: "you", confirmLive: true }',
    result: ['sent 2 messages, one per line', 'Slack answered ok with each ts'],
  },
  { kind: 'user', text: 'she said they made the first line about their own post, react to that' },
  { kind: 'tool', name: 'slackReactLive', args: '{ account: "you", chat: "Priya", message: "1762…4410", emoji: "🙌", approvedBy: "you", confirmLive: true }', result: ['reaction added: raised_hands', 'governor: 0 refusals today'] },
  { kind: 'assistant', text: 'Replied to Priya in two lines and put a 🙌 on her answer. Slack confirmed both.' },
]

const INSTAGRAM: SessionEvent[] = [
  { kind: 'user', text: 'read my instagram dms' },
  { kind: 'tool', name: 'getGuide', args: '{ useCase: "instagram/dmReply" }', result: ['instagram dmReply: session → thread → draft → meme → gate → send'] },
  { kind: 'tool', name: 'instagramSessionCheck', args: '{ account: "you" }', result: ['loggedIn as @you, no browser opened'] },
  { kind: 'tool', name: 'instagramDms', args: '{ account: "you" }', result: ['8 threads, 2 waiting on you', '1. maya.makes · 3m ago: took me 8 months lol'] },
  { kind: 'tool', name: 'instagramDms', args: '{ account: "you", with: "maya.makes" }', result: ['maya.makes: finally launched the shop', 'maya.makes: took me 8 months lol'] },
  { kind: 'assistant', text: 'Maya launched her shop after 8 months. That’s a meme moment, so finding one that fits before answering.' },
  { kind: 'user', text: 'yeah send her a meme then ask what shes selling' },
  { kind: 'tool', name: 'memelordSearch', args: '{ query: ["finally did it after 8 months"], type: "meme" }', result: ['When You Beat the Allegations', 'saved as a picture for the send'] },
  { kind: 'tool', name: 'voice', args: '{ to: "maya.makes", context: "…", text: "massive\\nwhat are you selling first?" }', result: ['maya.makes PASS: voice 0.97 · answers them 0.96'] },
  { kind: 'tool', name: 'instagramSendLive', args: '{ account: "you", with: "maya.makes", photo: "meme.jpg", approvedBy: "you", confirmLive: true }', result: ['sent the meme and 2 lines', 'Instagram answered each with its id'] },
  { kind: 'assistant', text: 'Sent Maya the meme and asked what she’s selling first. Instagram’s own realtime connection will bring her reply in the moment it lands.' },
]

const DISCORD: SessionEvent[] = [
  { kind: 'user', text: 'read the marketing chat over the last 3 hours' },
  { kind: 'tool', name: 'getGuide', args: '{ useCase: "discord/groupChatRead" }', result: ['groupChatRead: read back past the window → who said what, with times'] },
  { kind: 'tool', name: 'discordRead', args: '{ account: "you", channel: "growth-mates #marketing", limit: "50" }', result: ['50 messages back to 1:04 PM', 'mila 3:58 PM: anyone tried the new ads manager?', 'deano 4:01 PM: yeah, cut our cost per lead in half'] },
  { kind: 'assistant', text: 'In the last 3 hours: deano says the new ads manager halved his cost per lead, and mila can’t believe it worked. Nothing was decided yet.' },
  { kind: 'user', text: 'respond with a meme' },
  { kind: 'tool', name: 'memelordSearch', args: '{ query: ["wait it actually worked"], method: "combined", limit: "8" }', result: ['Surprised Snoop Dogg', 'Confused John Cena'] },
  { kind: 'tool', name: 'voice', args: '{ to: "#marketing", with: "#marketing", context: "mila surprised it worked", text: "<media url>" }', result: ['#marketing PASS: fits the room 0.94'] },
  { kind: 'tool', name: 'discordSendLive', args: '{ account: "you", channel: "1550…2243", text: "<media url>", approvedBy: "you", confirmLive: true }', result: ['sent, id 1568…9031', 'Discord shows it inline'] },
  { kind: 'assistant', text: 'Dropped Surprised Snoop Dogg on mila’s message in #marketing. Discord shows it inline.' },
]

const REDDIT: SessionEvent[] = [
  { kind: 'user', text: 'is my reddit still signed in' },
  { kind: 'tool', name: 'redditSessionCheck', args: '{ account: "you" }', result: ['Reddit says loggedIn', 'nothing sent'] },
  { kind: 'assistant', text: 'Reddit still accepts the saved session.' },
  { kind: 'user', text: 'open it and look at r/smallbusiness' },
  { kind: 'tool', name: 'inspectStart', args: '{ account: "you" }', result: ['the account’s own browser is open on Reddit', 'no proxy, its own timezone'] },
  { kind: 'tool', name: 'inspectDo', args: '{ action: "goto", url: "reddit.com/r/smallbusiness" }', result: ['on r/smallbusiness', 'snapshot taken, nothing clicked'] },
  { kind: 'assistant', text: 'The account’s browser is on r/smallbusiness and the page is recorded. Nothing was clicked: clicks and typing only happen with --live.' },
]

const REA_LOOKSMAXXING: SessionEvent[] = [
  { kind: 'user', text: '/rea-looksmaxxing how clavicular gets paid' },
  { kind: 'tool', name: 'getGuide', args: '{ useCase: "inbox/reaLooksmaxxing" }', result: ['rea-looksmaxxing: clips → formula → accounts → post → replies → funnel'] },
  { kind: 'tool', name: 'catalog_search', args: '{ query: "tiktok search videos" }', result: ['treg.tiktok.search.videos · priced per call', 'routed: TikHub, ScrapeCreators'], server: 'treg' },
  { kind: 'tool', name: 'call', args: '{ id: "treg.tiktok.search.videos", data: { keyword: "clavicular" } }', result: ['40 clips, top one 8.44M views', '@bestclavicularclips "NEVER DRINK" 578K'], server: 'treg' },
  { kind: 'assistant', text: 'His formula: comedy skits 3.7M, mog edits 1.75M, morning routines 1.5M, "NEVER do X" takes 579K. He sells a $1,000 looksmaxxing program. Posting the top format from your account.' },
  { kind: 'tool', name: 'twitterSessionCheck', args: '{ account: "you" }', result: ['X says loggedIn'] },
  { kind: 'user', text: 'yeah post it' },
  { kind: 'tool', name: 'twitterPostLive', args: '{ account: "you", text: "NEVER sleep on your back if you want a jawline…", approvedBy: "you", confirmLive: true }', result: ['posted, X answered with its id'] },
  { kind: 'tool', name: 'twitterNotifications', args: '{ account: "you" }', result: ['31 replies, 212 likes', 'mogger_420: how do i look like that'] },
  { kind: 'tool', name: 'twitterDms', args: '{ account: "you", with: "mogger_420" }', result: ['mogger_420 replied to your post', 'no DMs yet'] },
  { kind: 'tool', name: 'voice', args: '{ to: "mogger_420", context: "how do i look like that", text: "start with the morning routine, its all in the discord" }', result: ['mogger_420 PASS: voice 0.95 · answers them 0.94'] },
  { kind: 'tool', name: 'twitterDmLive', args: '{ account: "you", userId: "…", approvedBy: "you", confirmLive: true }', result: ['sent', 'X answered ok'] },
  { kind: 'tool', name: 'discordSendLive', args: '{ account: "you", channel: "camp #welcome", text: "welcome in mogger" }', result: ['sent, Discord shows it'] },
  { kind: 'assistant', text: 'Posted the formula, answered mogger_420 in your voice and welcomed him in the Discord. 30 more replies are queued, minutes apart.' },
]

export const PLATFORM_SESSIONS: Record<string, PlatformSession> = {
  slack: { thread: 'Reply to Priya on Slack', recents: ['Reply to Priya on Slack', 'Read the team DMs', 'React to her answer'], events: SLACK },
  instagram: { thread: 'Answer my Instagram DMs', recents: ['Answer my Instagram DMs', 'Send Maya a meme', 'Voice note to Maya'], events: INSTAGRAM },
  discord: { thread: 'Catch up on #marketing', recents: ['Catch up on #marketing', 'Meme in the chat', 'Voice note to the group'], events: DISCORD },
  x: { thread: 'Answer my X DMs', recents: ['X inbox follow-ups', 'Network maxing', 'Reply to the comments'], events: SESSION },
  reaLooksmaxxing: { thread: '/rea-looksmaxxing', recents: ['/rea-looksmaxxing', 'Answer the replies', 'Funnel to the Discord'], events: REA_LOOKSMAXXING },
  reddit: { thread: 'Check my Reddit', recents: ['Check my Reddit', 'Look at r/smallbusiness', 'Run the recorded steps'], events: REDDIT },
}
