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
  { kind: 'user', text: 'who in growth-mates #help asked for help with ads today? answer them' },
  { kind: 'tool', name: 'getGuide', args: '{ useCase: "discord/channelReply" }', result: ['channelReply: read the chat → draft → gate → send'] },
  { kind: 'tool', name: 'discordRead', args: '{ account: "you", channel: "growth-mates #help", limit: "50" }', result: ['50 messages back to 9:12 AM', 'mila 1:58 PM: our ads stopped working overnight, anyone here fix this for money?', 'deano 2:01 PM: turn it off and on again lol'] },
  { kind: 'assistant', text: 'mila’s ads stopped overnight and she’ll pay for a fix. The only answer is a joke. Drafting the real one.' },
  { kind: 'tool', name: 'voice', args: '{ to: "#help", with: "growth-mates #help", context: "mila: ads stopped overnight", text: "the pixel probably dropped after the update…" }', result: ['#help PASS: fits the room 0.95 · answers them 0.97'] },
  { kind: 'tool', name: 'discordSendLive', args: '{ account: "you", channel: "growth-mates #help", approvedBy: "you", confirmLive: true }', result: ['sent, Discord answered with its id'] },
  { kind: 'user', text: 'she dmed me, book her in' },
  { kind: 'tool', name: 'discordRead', args: '{ account: "you", channel: "mila", limit: "20" }', result: ['mila: that was it lol. can you look at the rest of our setup?'] },
  { kind: 'tool', name: 'voice', args: '{ to: "mila", with: "mila", text: "yeah course, thursday work for a quick call?" }', result: ['mila PASS: voice 0.96 · answers them 0.98'] },
  { kind: 'tool', name: 'discordSendLive', args: '{ account: "you", channel: "mila", approvedBy: "you", confirmLive: true }', result: ['sent', 'mila: thursday works'] },
  { kind: 'assistant', text: 'Answered mila first in #help, and she’s booked for Thursday. That’s a client from a server you were already in.' },
]

const REDDIT: SessionEvent[] = [
  { kind: 'user', text: 'find who on r/smallbusiness is asking for a booking website this week and answer them' },
  { kind: 'tool', name: 'redditReadSubreddits', args: '{ account: "you", query: "small business owners" }', result: ['r/smallbusiness, r/Entrepreneur, r/sweatystartup', 'each with its members and what it is about'] },
  { kind: 'tool', name: 'redditReadPosts', args: '{ account: "you", subreddit: "smallbusiness", days: "7" }', result: ['this week’s posts, 3 asking for a booking website', 'u/sparkleclean: Need a website that takes bookings. Where do I even start?'] },
  { kind: 'tool', name: 'redditReadPost', args: '{ account: "you", post: "1oq…k2" }', result: ['2 vans, losing jobs because people can’t book online', 'u/vanlife_dan: just use wix lol'] },
  { kind: 'assistant', text: 'u/sparkleclean runs a cleaning business with 2 vans and is losing jobs because people can’t book online. The only answer so far is "just use wix". Drafting what nobody has said yet.' },
  { kind: 'tool', name: 'voice', args: '{ to: "sparkleclean", context: "losing jobs, no online booking", text: "wix will do it but the booking bit is where you lose people…" }', result: ['sparkleclean PASS: voice 0.95 · answers them 0.96'] },
  { kind: 'tool', name: 'redditReplyLive', args: '{ account: "you", post: "1oq…k2", text: "…", approvedBy: "you", confirmLive: true }', result: ['commented, Reddit answered with its id'] },
  { kind: 'tool', name: 'redditVoteLive', args: '{ account: "you", id: "1oq…k2", direction: "up", approvedBy: "you", confirmLive: true }', result: ['upvoted'] },
  { kind: 'assistant', text: 'Answered u/sparkleclean with the fix nobody else gave, no link to your product, and upvoted the post. The other 2 threads are next, minutes apart.' },
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
  discord: { thread: 'Answer #help, book mila', recents: ['Answer #help, book mila', 'Welcome the new members', 'Voice note to the group'], events: DISCORD },
  x: { thread: 'Answer my X DMs', recents: ['X inbox follow-ups', 'Network maxing', 'Reply to the comments'], events: SESSION },
  reaLooksmaxxing: { thread: '/rea-looksmaxxing', recents: ['/rea-looksmaxxing', 'Answer the replies', 'Funnel to the Discord'], events: REA_LOOKSMAXXING },
  reddit: { thread: 'Answer r/smallbusiness', recents: ['Answer r/smallbusiness', 'Find my subreddits', 'Reply to the comments'], events: REDDIT },
}
