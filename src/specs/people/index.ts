import { noul } from 'jev-spec'
import type { RequirementAnchors } from '../anchors/types'
import { MET, NOT_VIOLATED } from '../types'

const client = 'src/people/client.ts'
const types = 'src/people/types.ts'
const match = 'src/people/helpers/match.ts'
const card = 'src/people/helpers/card.ts'
const evidence = 'src/people/helpers/evidence.ts'
const review = 'src/people/helpers/review.ts'
const events = 'src/storage/platform/helpers/derivedEvents.ts'
const storage = 'src/storage/platform/client.ts'
const migrations = 'src/storage/schema/helpers/migrations.ts'
const cli = 'src/cli/people/index.ts'
const graph = 'src/relate/graph/client.ts'
const project = 'src/relate/graph/helpers/project.ts'
const answers = 'src/agentHooks/answers/client.ts'

const anchors: RequirementAnchors = {
  'REQ-PEOPLE-01': [
    { kind: 'symbol', file: events, name: 'identityLinkedEvent' },
    { kind: 'symbol', file: events, name: 'identityUnlinkedEvent' },
    { kind: 'symbol', file: events, name: 'personNamedEvent' },
    { kind: 'symbol', file: events, name: 'identityNotLinkedEvent' },
    { kind: 'string', file: storage, includes: 'identityLinked' },
    { kind: 'symbol', file: client, name: 'linkIdentities' },
    { kind: 'symbol', file: client, name: 'unlinkIdentity' },
  ],
  'REQ-PEOPLE-02': [
    { kind: 'string', file: migrations, includes: 'identityLinksActive' },
    { kind: 'string', file: migrations, includes: 'WHERE revokedAt IS NULL' },
  ],
  'REQ-PEOPLE-03': [
    { kind: 'symbol', file: storage, name: 'rekeyIdentity' },
    { kind: 'string', file: storage, includes: 'rekeyConflict' },
    { kind: 'symbol', file: match, name: 'sharedLinkTo' },
    { kind: 'symbol', file: client, name: 'linkableIdentity' },
    { kind: 'symbol', file: events, name: 'IdentitySeenIn' },
  ],
  'REQ-PEOPLE-04': [
    { kind: 'symbol', file: match, name: 'suggestLinks' },
    { kind: 'symbol', file: match, name: 'linksIn' },
    { kind: 'symbol', file: types, name: 'M_PROBABILITIES' },
    { kind: 'value', file: types, name: 'PRIOR_MATCH_SHARE', equals: 0.04 },
    { kind: 'value', file: types, name: 'STRONG_BITS', equals: 4 },
    { kind: 'value', file: types, name: 'REVIEW_BITS', equals: 0 },
    { kind: 'value', file: types, name: 'SOURCES_KEPT', equals: 3 },
    { kind: 'symbol', file: match, name: 'linkCandidates' },
    { kind: 'symbol', file: match, name: 'scoreLinks' },
    { kind: 'symbol', file: match, name: 'learnM' },
    { kind: 'symbol', file: match, name: 'calibrate' },
    { kind: 'symbol', file: types, name: 'M_PRIORS' },
    { kind: 'symbol', file: evidence, name: 'mentionsIn' },
    { kind: 'symbol', file: evidence, name: 'profileOf' },
    { kind: 'symbol', file: evidence, name: 'circleOf' },
  ],
  'REQ-PEOPLE-05': [
    { kind: 'symbol', file: types, name: 'BOT_NAMES' },
    { kind: 'symbol', file: types, name: 'RECOMMENDS' },
    { kind: 'string', file: match, includes: 'identityNotLinked' },
    { kind: 'string', file: cli, includes: 'approvedBy' },
  ],
  'REQ-PEOPLE-06': [
    { kind: 'symbol', file: card, name: 'personCardOf' },
    { kind: 'symbol', file: card, name: 'renderCard' },
    { kind: 'symbol', file: client, name: 'resolveWho' },
    { kind: 'value', file: types, name: 'ONE_TO_ONE_SHARE', equals: 0.95 },
    { kind: 'value', file: types, name: 'CARD_LINES', equals: 8 },
  ],
  'REQ-PEOPLE-07': [
    { kind: 'symbol', file: client, name: 'cardsNamedIn' },
    { kind: 'uses', file: answers, name: 'cardsNamedIn' },
    { kind: 'value', file: types, name: 'PEOPLE_IN_PROMPT', equals: 2 },
    { kind: 'string', file: project, includes: 'identityLinks' },
    { kind: 'symbol', file: graph, name: 'findPeople' },
  ],
  'REQ-PEOPLE-08': [
    { kind: 'symbol', file: match, name: 'vetoOf' },
    { kind: 'symbol', file: match, name: 'clustersOf' },
    { kind: 'symbol', file: review, name: 'reviewBand' },
    { kind: 'uses', file: cli, name: 'reviewBand' },
    { kind: 'uses', file: cli, name: 'linkReport' },
    { kind: 'value', file: types, name: 'REVIEW_SURE', equals: 0.8 },
  ],
}

export const people = {
  description: "One person across platforms: links as events, Fellegi-Sunter suggestions, the person card, and the hook and graph seeing a person",
  specPath: 'docs/specs/people.md',
  codePaths: [client, types, match, evidence, review, card, events, storage, migrations, cli, graph, project, answers],
  anchors,
  rubrics: {
    'REQ-PEOPLE-01': noul('Does log people link append personNamed and identityLinked events (unlink identityUnlinked, different identityNotLinked) through insertEventRow, do deriveInternal write persons, identityLinks and identityNotLinked from them, are those tables in DERIVED_TABLES and the fingerprint, and does an unlink only set revokedAt?'),
    'REQ-PEOPLE-02': noul('Is one active link per identity enforced by the identityLinksActive partial unique index, does linkIdentities refuse identities of two different people, and does a replayed link to an already linked identity get ignored?'),
    'REQ-PEOPLE-03': noul('Does rekeyIdentity move identityLinks rows to the new id and revoke with rekeyConflict a handle link that could not move because the id was linked already; does linkIdentities accept an identity with no identities row only when sharedLinkTo finds a non-owner, non-recommending message linking to it, carry that message as seenIn on the identityLinked event, and does the projection create the handle-keyed identity from it?'),
    'REQ-PEOPLE-04': noul('Does scoreLinks score candidate pairs (loose handle matches, cross-platform post links, handles written in messages, same display names) on sharesOwnPosts, handle, displayName, mentionsHandle, claimsPlatform, writingStyle, meaning, activeHours, topicsWithOwner and sharedCircle, with u measured from log.db (similarity levels cut at random-pair quantiles), m learned by EM per blocking session from the M_PRIORS, the handle factor divided by the distinct handles that reduce to the same letters, the prior from PRIOR_MATCH_SHARE, bands at STRONG_BITS and REVIEW_BITS, and up to SOURCES_KEPT sources per comparison?'),
    'REQ-PEOPLE-05': noul('Does suggestLinks skip bots, recommending messages, account pairs without a handle match, identityNotLinked pairs, already linked pairs, pairs whose sides belong to two different people and handle-keyed duplicates, does clusterLines print no link command for a group spanning two people, and does every people write require --approvedBy?'),
    'REQ-PEOPLE-06': noul('Does personCardOf cover every linked identity, treat a chat as one-to-one when no other sender wrote twice or the two wrote ONE_TO_ONE_SHARE of it, leave out chats on an account log runs for that person, dedupe repeated lines, show empty lines as [attachment], flag chats never read from the start, and keep CARD_LINES lines in time order tagged by platform?'),
    'REQ-PEOPLE-08': noul('Are pairs with different real names or with identities on one platform that talk in the same chat vetoed, are links already made re-checked, are accounts suggested together grouped as one person, and does --check ask SubQ about the review band in at most two steps without linking anything?'),
    'REQ-PEOPLE-07': noul('Does relateAnswer add cardsNamedIn cards (by any linked handle or a word of the name, at most PEOPLE_IN_PROMPT), does the projection set personId and personNames on linked identities, and does findPeople group by person, expand to every identity of the person and match by name?'),
    unspecifiedBehavior: noul('Does any people code send anything off the machine other than the --check review and the person-facts tier 2 to SubQ, or write a link without the owner\'s approval?'),
  },
  assertions: {
    'REQ-PEOPLE-01': MET,
    'REQ-PEOPLE-02': MET,
    'REQ-PEOPLE-03': MET,
    'REQ-PEOPLE-04': MET,
    'REQ-PEOPLE-05': MET,
    'REQ-PEOPLE-06': MET,
    'REQ-PEOPLE-07': MET,
    'REQ-PEOPLE-08': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
