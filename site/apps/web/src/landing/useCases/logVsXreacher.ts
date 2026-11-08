import type { Play } from './platformPages'

export const LOG_VS_XREACHER: Play = {
  name: 'Read, draft, approve on X',
  ask: 'read my X DMs and X Chat, draft a reply to Jay, and wait for my approval',
  calls: ['twitterDms', 'voice', 'twitterDmLive'],
  outcome: [
    { label: 'Both X inboxes read', tag: 'twitterDms' },
    { label: 'Draft checked', tag: 'voice' },
    { label: 'Sent only with your yes', tag: '--live' },
  ],
  steps: [
    { title: 'Read the whole thread', body: 'log brings old X DMs and X Chat into one view and reads the conversation before drafting.' },
    { title: 'Check your voice', body: 'The draft is checked against how you write and the context of the chat before a send is allowed.' },
    { title: 'Approve the send', body: 'Review the draft first. Nothing goes out until you explicitly approve the live send.' },
  ],
  how: {
    steps: [
      { label: 'Read both X inboxes', tool: 'twitterDms', kind: 'platform' },
      { label: 'Check the draft against your voice', tool: 'voice', kind: 'voiceGate' },
      { label: 'Send only after you approve', tool: 'twitterDmLive', kind: 'platform' },
    ],
    rows: [
      { who: 'log', what: 'product flow shown, not a benchmark', status: 'Demo' },
      { who: 'Xreacher', what: 'same-DM run and captures still needed', status: 'Test needed' },
    ],
    done: 'log’s flow is mapped. No winner is claimed until the same real test runs on Xreacher.',
  },
}
