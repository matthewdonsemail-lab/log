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
    { q: 'How fast does my agent see a new message?', a: "The moment it lands. log holds Discord's own live connection open, so nothing waits on polling." },
    { q: 'Can it reply with a meme?', a: 'Yes. When a meme fits the moment, your agent finds one and sends it in the chat, only when you say so.' },
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
    { q: 'What is log for Reddit?', a: 'A free, open-source tool that keeps your Reddit account signed in and lets your AI agent run the steps you recorded, in the account’s own browser.' },
    { q: 'Does it post without asking me?', a: 'No. Everything is a dry run until you say go.' },
    COST,
  ],
}
