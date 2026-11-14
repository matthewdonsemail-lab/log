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
  cursor: [
    { q: 'How do I add log to Cursor?', a: 'Put log in ~/.cursor/mcp.json as a remote server, { "mcpServers": { "log": { "url": "https://mcp.listeningkit.com/mcp" } } }, then sign in and approve Cursor in the browser window it opens. With log installed on your own machine, use { "command": "logMcp" } instead.' },
    { q: 'What can Cursor do with log?', a: 'Everything log does, from the same Agent chat you code in: read your DMs on X, Slack, Discord and Instagram, find who asked for something, and answer them in your voice.' },
    { q: 'Does it send without asking me?', a: 'No. Reading is always safe. Every send is a dry run until you say go, and each draft is checked against how you write first.' },
    { q: 'Where are my accounts kept?', a: 'In your own log workspace, or in ~/.logCli when log runs on your machine. Cursor only calls log’s tools.' },
    COST,
  ],
  claude: [
    { q: 'How do I add log to Claude Code?', a: 'Run claude mcp add --transport http log https://mcp.listeningkit.com/mcp, then type /mcp in Claude Code to sign in. With log installed on your machine, claude mcp add log -- logMcp runs it locally.' },
    { q: 'Does it work in the Claude app, not just Claude Code?', a: 'Yes. In claude.ai or the desktop app, go to Customize › Connectors, add a custom connector with https://mcp.listeningkit.com/mcp, sign in, then switch log on from the “+” menu in a chat.' },
    { q: 'Which Claude plans can add it?', a: 'Custom connectors work on Free, Pro, Max, Team and Enterprise. Free plans can add one. On Team and Enterprise, an owner adds it for the organisation first.' },
    { q: 'Does it send without asking me?', a: 'No. Every send is a dry run until you say go.' },
    COST,
  ],
  chatgpt: [
    { q: 'How do I add log to ChatGPT?', a: 'Go to chatgpt.com/plugins, choose “+” then “Add custom MCP server”, set the connection to the public endpoint https://mcp.listeningkit.com/mcp with OAuth, then “Create as a plugin” and sign in to log.' },
    { q: 'Can ChatGPT use log running on my laptop?', a: 'Not directly. ChatGPT connects over the internet, so it needs a public HTTPS address. That is what your log workspace’s address is for.' },
    { q: 'Can everyone add one?', a: 'It depends on your ChatGPT plan and, on a work account, on your workspace’s settings. If you can’t see “Add custom MCP server”, your plan or workspace doesn’t allow it yet.' },
    { q: 'Does it send without asking me?', a: 'No. ChatGPT shows you each reply first, and nothing goes out until you say go.' },
    COST,
  ],
  hermes: [
    { q: 'How do I add log to Hermes?', a: 'Add log under mcp_servers in ~/.hermes/config.yaml with url: https://mcp.listeningkit.com/mcp and auth: oauth, run hermes mcp login log once, then /reload-mcp in a running session.' },
    { q: 'Is there a log plugin for Hermes?', a: 'Yes. With log installed on the same machine, hermes plugins pack install https://log.listeningkit.com/hermes-pack.yaml installs log’s tools, every log play as a skill, a log tab in the Hermes dashboard and the router hook, in one command. Install it from log.listeningkit.com or matthewdonsemail-lab/log, not from deepmroot/listeningkit-log, which is no longer updated.' },
    { q: 'What are the tools called inside Hermes?', a: 'Hermes names MCP tools mcp_<server>_<tool>, so log’s tools show up as mcp_log_twitterDms, mcp_log_voice and so on.' },
    { q: 'Why run log inside Hermes?', a: 'Hermes stays on all day on a server and talks to you on Telegram and other chats. So it can check your inboxes on a schedule, and you approve a reply with a word from your phone.' },
    { q: 'Does it send without asking me?', a: 'No. Every send waits for your yes, wherever you give it.' },
    COST,
  ],
  grok: [
    { q: 'How do I add log to Grok?', a: 'On grok.com/connectors, click New Connector, choose Custom, paste https://mcp.listeningkit.com/mcp and sign in to log. Grok then uses log’s tools when your question needs them.' },
    { q: 'Can I use it from the xAI API?', a: 'Yes. The Responses API takes an MCP server as a tool with server_url, server_label and an authorization token. Point it at a logMcp you serve over HTTPS with LOG_MCP_TOKEN set.' },
    { q: 'Does Grok see my X inbox on its own?', a: 'No. With log connected, Grok reads your own X DMs and X Chat through log, from your own account, only when you ask.' },
    { q: 'Does it send without asking me?', a: 'No. Every send is a dry run until you say go.' },
    COST,
  ],
}
