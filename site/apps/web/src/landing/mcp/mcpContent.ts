import type { FaqItem } from '../story/StorySections'
import type { Play, PlayStep } from '../useCases/platformPages'

export const MCP_PATH = '/mcp'

export const MCP_TITLE = 'The log MCP: your AI agent runs your DMs on X, Discord, Slack, Instagram and Reddit'

export const MCP_DESCRIPTION =
  'logMcp is the MCP server for log by ListeningKit. Add it to Claude Code, Codex or Cursor and your agent reads your inbox, drafts replies in your voice and sends from your own accounts, only when you say so. Free and open source.'

export const MCP_INSTALL = 'curl -fsSL https://log.listeningkit.com/install.sh | sh'

export const MCP_INSTALL_WINDOWS = 'irm https://log.listeningkit.com/install.ps1 | iex'

export type McpClient = { id: string; label: string; icon: string; lines: string[]; note: string }

export const MCP_CLIENTS: McpClient[] = [
  { id: 'claude', label: 'Claude Code', icon: '/logos/tools/claude-desktop.svg', lines: ['claude mcp add --transport http log https://mcp.listeningkit.com/mcp'], note: 'Add the hosted native MCP once. Your browser opens to sign in, select your team and approve the connection.' },
  { id: 'codex', label: 'Codex', icon: '/logos/tools/chatgpt.svg', lines: ['codex mcp add log -- logMcp'], note: 'The same server, added to Codex.' },
  { id: 'cursor', label: 'Cursor', icon: '/logos/tools/cursor.svg', lines: ['{ "mcpServers": { "log": { "command": "logMcp" } } }'], note: 'In ~/.cursor/mcp.json, or .cursor/mcp.json in a project.' },
  { id: 'http', label: 'Over HTTP', icon: '/logos/tools/mcp.svg', lines: ['logMcp --http --port 7337', 'claude mcp add --transport http log http://127.0.0.1:7337/mcp'], note: 'For a client that can’t start a process. Off your own machine it won’t start without a token (LOG_MCP_TOKEN).' },
]

export const MCP_STEPS: [PlayStep, PlayStep, PlayStep] = [
  { title: 'Create your account', body: 'Sign in with your email, create or select your team, then pair the cloud workspace where your account sessions and conversations stay.' },
  { title: 'Add the native MCP', body: 'Point Claude Code or another MCP client at https://mcp.listeningkit.com/mcp, then approve the team it may use.' },
  { title: 'Ask in plain words', body: 'Your agent’s first call loads log’s guide, which lists every use case and how to ask for it. Then say what you want, like “answer everyone waiting in my dms”.' },
]

export type McpTool = { name: string; title: string; does: string; acts: boolean }

export type McpPlatform = { platformId: string; path: string; tools: McpTool[] }

export const MCP_PLATFORMS: McpPlatform[] = [
  {
    platformId: 'x',
    path: '/twitter',
    tools: [
      { name: 'twitterDms', title: 'See who’s waiting on you', does: 'Reads your old DMs and the encrypted X Chat as one inbox, and shows who is waiting on a reply.', acts: false },
      { name: 'twitterNotifications', title: 'See who engaged with your posts', does: 'Shows everyone who liked, reposted, replied to, quoted or followed you.', acts: false },
      { name: 'twitterDmLive', title: 'Send a DM', does: 'Sends a DM in your voice, one message per line.', acts: true },
      { name: 'twitterReplyLive', title: 'Reply to a post', does: 'Replies under someone’s post.', acts: true },
      { name: 'twitterQueueRunLive', title: 'Message many people, slowly', does: 'Sends replies or DMs to many people, approved first and sent one at a time.', acts: true },
    ],
  },
  {
    platformId: 'discord',
    path: '/discord',
    tools: [
      { name: 'discordChats', title: 'List your chats', does: 'Lists your DMs and group DMs.', acts: false },
      { name: 'discordRead', title: 'Read any chat or channel', does: 'Reads the latest messages in any chat or server channel.', acts: false },
      { name: 'discordWatch', title: 'Hear new messages live', does: 'Tells your agent about every new message the moment it lands.', acts: false },
      { name: 'discordSendLive', title: 'Send a message', does: 'Sends a message to a DM, a group or a channel.', acts: true },
    ],
  },
  {
    platformId: 'slack',
    path: '/slack',
    tools: [
      { name: 'slackWorkspaces', title: 'Find your workspaces', does: 'Lists every workspace you’re signed in to.', acts: false },
      { name: 'slackRead', title: 'Read a chat', does: 'Reads the latest messages in a chat, found by who it’s with.', acts: false },
      { name: 'slackWatch', title: 'Hear new messages live', does: 'Tells your agent about every new message the moment Slack sends it.', acts: false },
      { name: 'slackSendLive', title: 'Send a message', does: 'Sends a message to a DM or a group, one line at a time.', acts: true },
    ],
  },
  {
    platformId: 'instagram',
    path: '/instagram',
    tools: [
      { name: 'instagramDms', title: 'Read your DMs', does: 'Reads your DM threads, newest first, or one person’s thread.', acts: false },
      { name: 'instagramWatch', title: 'Hear new DMs live', does: 'Tells your agent about every new DM the moment it lands.', acts: false },
      { name: 'instagramSendLive', title: 'Send a DM or a meme', does: 'Sends text, one message per line, or a meme as a photo.', acts: true },
    ],
  },
  {
    platformId: 'reddit',
    path: '/reddit',
    tools: [
      { name: 'redditReadSubreddits', title: 'Find where your buyers post', does: 'Finds the subreddits your buyers post in.', acts: false },
      { name: 'redditReadPosts', title: 'Read a subreddit', does: 'Reads a subreddit’s newest posts, with their links.', acts: false },
      { name: 'redditReplyLive', title: 'Reply to a thread', does: 'Comments on a post, or replies to one of its comments.', acts: true },
    ],
  },
]

export const MCP_FIND_TOOLS = [
  { name: 'logSearch', title: 'Find a command by the job', input: '{ "query": "send a dm on x" }', does: 'finds the commands for a job, in plain words' },
  { name: 'logGet', title: 'See how to call it', input: '{ "id": "twitter.dm" }', does: 'gives the command’s inputs and a call that works' },
  { name: 'logCall', title: 'Run it', input: '{ "id": "twitter.dm", "inputs": { … } }', does: 'runs it, through the same checks as the command’s own tool' },
]

export const MCP_FAQ: FaqItem[] = [
  {
    q: 'What is the log MCP?',
    a: 'A native remote MCP connection that gives your AI agent log’s tools. Sign in once, select your team, pair your workspace and approve the client; your account sessions remain in that workspace.',
  },
  {
    q: 'Which agents does it work with?',
    a: 'Claude Code, Codex, Cursor and any other client that speaks MCP. You add it with one line, once. When log updates, your agent gets the new version without a restart.',
  },
  {
    q: 'What can I ask it to do?',
    a: 'Ask the way you would ask a person: “answer everyone waiting in my dms” or “who’s worth following up”. Your agent finds the play that fits and runs it step by step.',
  },
  {
    q: 'Does it send without asking me?',
    a: 'No. Every send is a dry run until you say go. Reading is always safe.',
  },
  {
    q: 'Will the replies sound like me?',
    a: 'Each draft is written from how you already write to that person, and checked against it before it can go out.',
  },
  {
    q: 'Is it safe for my accounts?',
    a: 'Each account paces itself, with its own daily limits, gaps between actions and waking hours. If a platform refuses something, the run stops instead of trying again.',
  },
  {
    q: 'What does it cost?',
    a: 'Nothing. log is free and open source under the MIT license, and runs on your own machine with your own AI agent.',
  },
]

export const MCP_PLAY: Play = {
  name: 'Answer everyone waiting in your DMs',
  ask: 'answer everyone waiting in my dms',
  calls: ['getGuide', 'twitterDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Every log command, as a tool', tag: 'logMcp' },
    { label: 'Who is waiting on you', tag: 'reads' },
    { label: 'Replies in your voice', tag: '--live' },
  ],
  steps: [MCP_STEPS[0], MCP_STEPS[1], MCP_STEPS[2]],
  how: {
    steps: [
      { label: 'Load log’s guide', tool: 'getGuide', kind: 'platform' },
      { label: 'Read who is waiting on you', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check each draft sounds like you', tool: 'voice', kind: 'voiceGate' },
      { label: 'Send it, once you say so', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: '@dana_builds', what: 'asked how it works', status: 'Replied' },
      { who: '@leo_ops', what: 'asked for the link', status: 'Replied' },
      { who: '@priya', what: 'said thanks', status: 'Read' },
    ],
    done: 'Done. Everyone waiting on you has a reply in your voice, and nothing went out before you said so.',
  },
}
