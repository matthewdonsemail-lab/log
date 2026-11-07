import type { Play } from './platformPages'

export const REA_LOOKSMAXXING: Play = {
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
}
