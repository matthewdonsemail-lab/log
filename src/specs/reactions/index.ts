import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const REACT = 'src/cli/react/index.ts'
const KIT = 'python/platformKit/reactions.py'

export const reactions = {
  description: 'The account reacts to a message with an emoji on X, Discord, Slack and Instagram through each engine',
  specPath: 'docs/specs/reactions.md',
  codePaths: [REACT, KIT, 'python/twitterApi/engine.py', 'python/discordApi/engine.py', 'python/slackApi/engine.py', 'python/instagramApi/engine.py', 'src/inbox/claims/client.ts'],
  anchors: {
    'REQ-REACT-01': [
      { kind: 'symbol', file: REACT, name: 'reactCommandOf' },
      { kind: 'symbol', file: REACT, name: 'twitterReactCommand' },
      { kind: 'symbol', file: REACT, name: 'discordReactCommand' },
      { kind: 'symbol', file: REACT, name: 'slackReactCommand' },
      { kind: 'symbol', file: REACT, name: 'instagramReactCommand' },
      { kind: 'string', file: REACT, includes: 'reactInvalid' },
    ],
    'REQ-REACT-02': [
      { kind: 'string', file: REACT, includes: 'chatClaimedElsewhere' },
    ],
    'REQ-REACT-03': [
      { kind: 'symbol', file: 'python/twitterApi/engine.py', name: 'react' },
      { kind: 'symbol', file: 'python/discordApi/engine.py', name: 'react_of' },
      { kind: 'symbol', file: 'python/slackApi/engine.py', name: 'react' },
      { kind: 'symbol', file: 'python/instagramApi/engine.py', name: 'react_sync' },
    ],
    'REQ-REACT-04': [
      { kind: 'symbol', file: KIT, name: 'unicode_of' },
      { kind: 'symbol', file: KIT, name: 'slack_name_of' },
    ],
  },
  rubrics: {
    'REQ-REACT-01': noul('Are twitterReactCommand, discordReactCommand, slackReactCommand and instagramReactCommand all made by reactCommandOf, which returns a dry run without --live that calls no engine, refuses --live without --approvedBy as notApproved, and refuses an empty message or emoji as reactInvalid?'),
    'REQ-REACT-02': noul('With --live, does reactCommandOf call guardSend for the platform, account and chat before the resolved send, refuse with chatClaimedElsewhere when the guard is not ok, and call guard.done with sent when the answer is ok, failed otherwise, and failed when the send throws?'),
    'REQ-REACT-03': noul('Is react in the WRITES of the X, Discord, Slack and Instagram engines; does the X react call the DM reaction add or remove mutation with the conversation id with colons turned into dashes and return reactRefused when the answer has errors or no data; does the Discord react_of call send_reaction or remove_reaction; does the Slack react call reactions.add or reactions.remove with channel, timestamp and name and treat already_reacted or no_reaction as done; and does the Instagram react_sync call direct_send_reaction or direct_delete_reaction inside locked?'),
    'REQ-REACT-04': noul('Does unicode_of turn a known name, with or without colons, into its emoji and pass an emoji through, does slack_name_of turn a known emoji into its Slack name and strip colons from a name, and does each engine refuse with reactInvalid when they give nothing?'),
    unspecifiedBehavior: noul('Does any react command or engine react through a browser, retry a refused reaction, or react without live and approvedBy, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-REACT-01': MET,
    'REQ-REACT-02': MET,
    'REQ-REACT-03': MET,
    'REQ-REACT-04': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
