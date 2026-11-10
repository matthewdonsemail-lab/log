import type { FaqItem } from '../story/StorySections'
import type { PageId } from './platformPages'

const COST: FaqItem = {
  q: 'What does log cost?',
  a: 'Nothing. log is free and open source under the MIT license, and runs on your own machine with your own AI agent, like Claude Code, Codex or Cursor.',
}

export const QUICK_ANSWERS: Record<PageId, FaqItem[]> = {
  twitter: [
    { q: 'What is log for X (Twitter)?', a: 'A free, open-source tool that lets your AI agent read your X DMs and send your replies, posts and DMs in your own voice. It works through your own X account, the way the X app does.' },
    { q: 'Does it read X Chat as well as the old DMs?', a: 'Yes. Your old DM inbox and the new encrypted X Chat are read as one inbox, so your agent sees everyone who is waiting on you.' },
    { q: 'Does it send without asking me?', a: 'No. Every send is a dry run until you say go, and several sends go out from one queue at random times. A refusal from X stops the run.' },
    COST,
  ],
  discord: [
    { q: 'What is log for Discord?', a: "A free, open-source tool that lets your AI agent read your Discord DMs, groups and channels and reply for you. It works through your own account and Discord's own live connection." },
    { q: 'How do people make money with it on Discord?', a: 'Two ways. Answer the people asking for what you do in the servers you’re already in, so they DM you and book a call. Or run your own paid community, where every member is welcomed and every question answered.' },
    { q: 'How fast does my agent see a new message?', a: "The moment it lands. log holds Discord's own live connection open, so nothing waits on polling." },
    { q: 'Can it reply with a meme or a voice note?', a: 'Yes. When a meme fits the moment your agent finds one, and a voice note goes out in your own cloned voice, only when you ask.' },
    COST,
  ],
  slack: [
    { q: 'What is log for Slack?', a: 'A free, open-source tool that lets your AI agent read your Slack DMs and group DMs in every workspace you are in, and reply for you in your own voice.' },
    { q: 'Does it work across several workspaces?', a: 'Yes. Your agent lists every workspace your account is in, finds the chat by who it is with, and reads it in full before it drafts.' },
    { q: 'Does it send without asking me?', a: 'No. A reply goes out one line at a time, only when you say go.' },
    COST,
  ],
  instagram: [
    { q: 'What is log for Instagram?', a: "A free, open-source tool that lets your AI agent answer your Instagram DMs as they land, with text, a meme or a voice note, through Instagram's own app connection." },
    { q: 'Does it open a browser?', a: "No. log talks to Instagram the way its app does, through one session per account, and never opens a browser for an Instagram action." },
    { q: 'Does it send without asking me?', a: 'No. Every send is a dry run until you say go.' },
    COST,
  ],
  reddit: [
    { q: 'What is log for Reddit?', a: 'A free, open-source tool that lets your AI agent read the subreddits where your buyers describe their problem, find the threads worth answering, and draft a reply that gives value first, from your own Reddit account.' },
    { q: 'Does it automate my comments?', a: 'No. The research is automated: reading the threads, finding the leads and drafting the reply. The engagement stays yours: you press send from your real account, with no link to your product.' },
    { q: 'Can it help grow my own subreddit?', a: 'Yes. Your agent can read the subreddits your community cares about, write the day’s signal as a post for your own subreddit, and answer the comments on it.' },
    { q: 'Why bother with Reddit?', a: 'AI answer engines cite Reddit threads, so a genuinely useful answer there keeps getting found long after you post it.' },
    COST,
  ],
}
