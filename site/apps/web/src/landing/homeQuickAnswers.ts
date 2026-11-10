import type { FaqItem } from './story/StorySections'

export const SETUP_STEPS = [
  { title: 'Install log', body: 'Run the one-line installer for macOS, Linux or Windows. It installs the log and logMcp commands and the Python the platform engines need.' },
  { title: 'Connect your accounts', body: 'Add each account once and sign it in, then check that the platform still accepts it with log <platform> session check.' },
  { title: 'Connect your agent', body: 'Add logMcp to Claude Code, Codex or Cursor, then ask in plain words, like "read my X DMs and tell me who’s waiting on me".' },
]

export const HOME_ANSWERS: FaqItem[] = [
  { q: 'What is log?', a: 'A free, open-source tool that lets your AI agent read and answer your DMs on X, Discord, Slack, Instagram and Reddit, from your own accounts, in your own voice.' },
  { q: 'Who is it for?', a: 'Service businesses, startups and solopreneurs who sell through conversations and want their agent to find the people asking, answer them and follow up.' },
  { q: 'How do I set it up?', a: 'Install log with one line, connect your accounts, then add logMcp to your agent. After that you just ask it what to do.' },
  { q: 'Does it sound like me?', a: 'Every message is checked against how you already write to that person before it goes out, and nothing is sent until you say go.' },
  { q: 'What does it cost?', a: 'Nothing. log is free and open source under the MIT license, and runs on your own machine.' },
]
