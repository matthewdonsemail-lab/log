import type { Play } from './platformPages'

export type Beat = { kicker: string; head: string; sticker: string; joke: string; tool?: string }

const BEATS: Beat[] = [
  {
    kicker: 'Step 1',
    head: 'Create "content"',
    sticker: 'goto nightclubs, bars, the beach.',
    joke: 'The quotation marks are doing a lot of work. treg pulled 40 of his clips, and the top one has 8.44M views.',
    tool: 'treg',
  },
  {
    kicker: 'Step 2',
    head: 'Be controversial.',
    sticker: 'the more outlandish the takes the better.',
    joke: 'Nobody shares "drink water and sleep 8 hours". They share "NEVER drink water".',
    tool: 'SubQ',
  },
  {
    kicker: 'Step 3',
    head: 'Buy your accounts. The aged the better',
    sticker: "we're building a bot farm.",
    joke: 'TikTok, YouTube, Instagram. Like a fine wine, but it posts.',
  },
  {
    kicker: 'Step 4',
    head: 'Download log by ListeningKit',
    sticker: 'free, open sourced & goated.',
    joke: 'It can automate your entire social media. It cannot automate your cheekbones.',
    tool: 'npm i -g @listeningkit/log',
  },
  {
    kicker: 'Step 5',
    head: 'Connect up the accounts',
    sticker: 'let Claude Code warm up the',
    joke: 'Instagram, Twitter, Reddit, Discord, Facebook, YouTube, TikTok. One browser per account, so nobody looks like a robot. Except you, mewing.',
    tool: 'warmupLive',
  },
  {
    kicker: 'Step 6',
    head: 'Go',
    sticker: 'f*cking viral.',
    joke: 'This step is left as an exercise for the reader.',
  },
  {
    kicker: 'Step 7',
    head: "Create an offer playing on people's insecurities",
    sticker: 'insecurity sells.',
    joke: "(we don't recommend it)",
  },
  {
    kicker: 'Step 8',
    head: 'Call to actions everywhere',
    sticker: 'funnel them to discord, instagram, wherever you want!',
    joke: 'Link in bio. Link in comments. Link tattooed on the jawline.',
    tool: 'twitterQueueRunLive',
  },
  {
    kicker: 'Step 9',
    head: 'Deploy Claude Code to funnel them into your offer',
    sticker: 'if you’re hungry enough you can too!',
    joke: 'Clav created Camp Looksmax, he made millions of dollars. Claude Code answers every DM in your voice while you do your morning facial icing.',
    tool: 'discordSendLive',
  },
  {
    kicker: 'Step 10',
    head: 'Repeat step 1, 2, 3',
    sticker: 'plaster yourself on social media.',
    joke: 'Nightclub, hot take, more accounts. Rinse, repeat, moisturise.',
  },
  {
    kicker: 'Step 11',
    head: 'Profit.',
    sticker: 'limo not included.',
    joke: 'Results may vary. Jawlines may vary more.',
  },
]

export const REA_LOOKSMAXXING: Play & { beats: Beat[] } = {
  name: 'Moneymaxx like Clavicular',
  ask: '/rea-looksmaxxing how clavicular gets paid',
  calls: ['treg', 'SubQ', 'warmupLive', 'voice', 'discordSendLive'],
  outcome: [
    { label: 'His 40 most viral clips', tag: 'treg' },
    { label: 'The formula, scored 92/100', tag: 'SubQ' },
    { label: 'Everyone funnelled into your offer', tag: '--live' },
  ],
  steps: [
    { title: 'Ask how he gets paid', body: 'treg pulls his clips and the clip farms around him. You learn more about his face than his dermatologist.' },
    { title: 'log runs the accounts', body: 'SubQ picks the winning formats, log warms up every account and posts through each one’s single session.' },
    { title: 'Funnel them into your offer', body: 'Every DM and every “how do I look like that” answered in your voice, then sent to the Discord.' },
  ],
  how: {
    steps: [
      { label: 'Warm up the accounts', tool: 'warmupLive', kind: 'platform' },
      { label: 'Read who replied to the clip', tool: 'twitterNotifications', kind: 'platform' },
      { label: 'Check it sounds like you, not a bot farm', tool: 'voice', kind: 'voiceGate' },
      { label: 'Slide into the DMs', tool: 'twitterDmLive', kind: 'platform' },
      { label: 'Funnel them to the Discord', tool: 'discordSendLive', kind: 'platform' },
    ],
    rows: [
      { who: 'mogger_420', what: 'asked about the jawline routine', status: 'Funnelled' },
      { who: 'gymcel_99', what: 'asked what he eats', status: 'Funnelled' },
      { who: 'lookscope_ana', what: 'asked "is this ai"', status: 'Answered' },
    ],
    done: 'Done. Everyone who asked how he does it is in the Discord, and nobody asked about the bot farm.',
  },
  beats: BEATS,
}
