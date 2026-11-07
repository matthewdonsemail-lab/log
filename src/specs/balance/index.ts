import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TYPES = 'src/billing/balance/types.ts'
const CLIENT = 'src/billing/balance/client.ts'
const ANSWERS = 'src/billing/balance/helpers/answers.ts'
const COMMAND = 'src/cli/balance/index.ts'
const SUBQ = 'src/subq/decisions/client.ts'
const JINA = 'src/voice/aiTells/helpers/jina.ts'
const INWORLD = 'src/extensions/inworld/client.ts'
const FISH = 'src/extensions/fishAudio/client.ts'
const ASSEMBLY = 'src/media/voiceNotes/client.ts'

export const balance = {
  description: 'Every paid provider log calls, with what is left: balance APIs where they exist, otherwise the last real answer, and out of credit said in the failure itself',
  specPath: 'docs/specs/balance.md',
  codePaths: [TYPES, CLIENT, ANSWERS, COMMAND, SUBQ, JINA, INWORLD, FISH, ASSEMBLY],
  anchors: {
    'REQ-BALANCE-01': [
      { kind: 'symbol', file: TYPES, name: 'PROVIDERS' },
      { kind: 'symbol', file: CLIENT, name: 'checkBalances' },
      { kind: 'symbol', file: CLIENT, name: 'needsMoney' },
      { kind: 'symbol', file: COMMAND, name: 'balanceLines' },
    ],
    'REQ-BALANCE-02': [
      { kind: 'symbol', file: TYPES, name: 'JINA_BALANCE_URL' },
      { kind: 'symbol', file: TYPES, name: 'FISH_BALANCE_URL' },
      { kind: 'symbol', file: CLIENT, name: 'amountOf' },
    ],
    'REQ-BALANCE-03': [{ kind: 'symbol', file: CLIENT, name: 'balanceOf' }],
    'REQ-BALANCE-04': [
      { kind: 'symbol', file: ANSWERS, name: 'noteProviderAnswer' },
      { kind: 'symbol', file: ANSWERS, name: 'isOutOfCredit' },
      { kind: 'value', file: TYPES, name: 'ANSWERS_ENV', equals: 'LOG_BILLING_ANSWERS' },
      { kind: 'uses', file: SUBQ, name: 'noteProviderAnswer' },
      { kind: 'uses', file: JINA, name: 'noteProviderAnswer' },
      { kind: 'uses', file: INWORLD, name: 'withCreditNote' },
      { kind: 'uses', file: FISH, name: 'withCreditNote' },
      { kind: 'uses', file: ASSEMBLY, name: 'withCreditNote' },
    ],
    'REQ-BALANCE-05': [
      { kind: 'symbol', file: ANSWERS, name: 'outOfCreditNote' },
      { kind: 'string', file: SUBQ, includes: 'providerOutOfCredit' },
    ],
  },
  rubrics: {
    'REQ-BALANCE-01': noul('Does log balance check every provider in PROVIDERS (or only the one --provider names), and does balanceLines put a >>> NEEDS MONEY line first naming each provider that needsMoney found low, empty or out of credit?'),
    'REQ-BALANCE-02': noul('Does amountOf read Jina, Fish Audio, treg, 2Captcha and Byteful only with reads (GET requests or the treg balance CLI), with no request that buys, tops up or spends?'),
    'REQ-BALANCE-03': noul('For a provider without a balance API, does balanceOf take its state from its last recorded answer, and for a provider with no key does it return notSetUp without calling anything?'),
    'REQ-BALANCE-04': noul('Do the SubQ, Jina, Inworld, Fish Audio and AssemblyAI clients each pass the provider\'s answer status (and what it said on a failure) to noteProviderAnswer, directly or through withCreditNote, and does isOutOfCredit mark a 402 or credit words as out of credit?'),
    'REQ-BALANCE-05': noul('When a provider answers out of credit, does the error the client returns include outOfCreditNote\'s words naming where to top up, and does the SubQ client throw with code providerOutOfCredit?'),
    unspecifiedBehavior: noul('Does the balance code spend money, top up an account, or print a key anywhere, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-BALANCE-01': MET,
    'REQ-BALANCE-02': MET,
    'REQ-BALANCE-03': MET,
    'REQ-BALANCE-04': MET,
    'REQ-BALANCE-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
