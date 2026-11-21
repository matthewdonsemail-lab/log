import { noul } from 'jev-spec'
import type { RequirementAnchors } from '../anchors/types'
import { MET, NOT_VIOLATED } from '../types'

const facts = 'src/storage/platform/helpers/facts.ts'
const platformTypes = 'src/storage/platform/types.ts'
const storage = 'src/storage/platform/client.ts'
const migrations = 'src/storage/schema/helpers/migrations.ts'
const client = 'src/people/facts/client.ts'
const types = 'src/people/facts/types.ts'
const screen = 'src/people/facts/helpers/screen.ts'
const decide = 'src/people/facts/helpers/decide.ts'
const extract = 'src/people/facts/helpers/extract.ts'
const stream = 'src/people/facts/helpers/stream.ts'
const owner = 'src/relate/owner/client.ts'
const ownerScript = 'scripts/relate/owner.ts'
const card = 'src/people/helpers/card.ts'
const voice = 'src/cli/twitter/helpers/voice.ts'
const memory = 'src/relate/graph/helpers/memory.ts'
const graph = 'src/relate/graph/client.ts'
const cli = 'src/cli/people/index.ts'
const python = 'python/facts/screen.py'

const anchors: RequirementAnchors = {
  'REQ-FACTS-01': [
    { kind: 'symbol', file: facts, name: 'personFactRecordedEvent' },
    { kind: 'symbol', file: facts, name: 'factProblem' },
    { kind: 'symbol', file: facts, name: 'derivePersonFact' },
    { kind: 'symbol', file: platformTypes, name: 'FACT_SLOTS' },
    { kind: 'string', file: storage, includes: 'personFactRecorded' },
    { kind: 'string', file: migrations, includes: 'CREATE TABLE IF NOT EXISTS personFacts' },
    { kind: 'symbol', file: client, name: 'recordFact' },
  ],
  'REQ-FACTS-02': [
    { kind: 'symbol', file: platformTypes, name: 'SINGLE_SLOTS' },
    { kind: 'string', file: facts, includes: 'UPDATE personFacts SET validTo = ?, closedAt = ?, supersededBy = ?' },
  ],
  'REQ-FACTS-03': [
    { kind: 'symbol', file: facts, name: 'factsFollowLink' },
    { kind: 'symbol', file: facts, name: 'factsLeaveLink' },
    { kind: 'uses', file: storage, name: 'factsFollowLink' },
  ],
  'REQ-FACTS-04': [
    { kind: 'symbol', file: extract, name: 'extractFacts' },
    { kind: 'symbol', file: extract, name: 'sideAllows' },
    { kind: 'symbol', file: screen, name: 'gliner2Screener' },
    { kind: 'symbol', file: screen, name: 'screenLines' },
    { kind: 'symbol', file: screen, name: 'isCandidate' },
    { kind: 'symbol', file: screen, name: 'endpointsOf' },
    { kind: 'symbol', file: decide, name: 'decideBatch' },
    { kind: 'symbol', file: decide, name: 'factDecider' },
    { kind: 'value', file: types, name: 'DEFAULT_DECIDER', equals: 'subq-snap-1.1' },
    { kind: 'symbol', file: extract, name: 'screenStream' },
    { kind: 'symbol', file: stream, name: 'factStream' },
    { kind: 'uses', file: ownerScript, name: 'factStream' },
    { kind: 'uses', file: owner, name: 'tick' },
    { kind: 'value', file: types, name: 'MARK_MIN', equals: 0.45 },
    { kind: 'value', file: types, name: 'PROMISE_MARK_MIN', equals: 0.3 },
    { kind: 'value', file: types, name: 'DECIDE_BATCH', equals: 8 },
    { kind: 'value', file: types, name: 'LASTING_MIN', equals: 0.6 },
    { kind: 'value', file: types, name: 'SLOT_MIN', equals: 0.5 },
    { kind: 'value', file: types, name: 'DEFAULT_CHATS', equals: 20 },
    { kind: 'string', file: python, includes: 'works at' },
  ],
  'REQ-FACTS-05': [
    { kind: 'symbol', file: client, name: 'repeatedPromise' },
    { kind: 'symbol', file: client, name: 'alreadyPromisedBlock' },
    { kind: 'symbol', file: client, name: 'promiseLines' },
    { kind: 'uses', file: voice, name: 'repeatedPromise' },
    { kind: 'uses', file: card, name: 'promiseLines' },
    { kind: 'value', file: types, name: 'REPEAT_OVERLAP', equals: 0.6 },
    { kind: 'value', file: types, name: 'REPEAT_COSINE', equals: 0.8 },
  ],
  'REQ-FACTS-06': [
    { kind: 'symbol', file: memory, name: 'memoryProjectionOf' },
    { kind: 'symbol', file: memory, name: 'writeMemory' },
    { kind: 'symbol', file: memory, name: 'ensureMemoryIndexes' },
    { kind: 'symbol', file: memory, name: 'RECALL_CYPHER' },
    { kind: 'uses', file: graph, name: 'writeMemory' },
    { kind: 'symbol', file: graph, name: 'recallGraph' },
    { kind: 'uses', file: cli, name: 'recallGraph' },
  ],
}

export const personFacts = {
  description: 'Lasting facts about people as events with their source lines, two-tier extraction, the already-promised check, and the Relate agent-memory projection',
  specPath: 'docs/specs/personFacts.md',
  codePaths: [facts, platformTypes, storage, migrations, client, types, screen, decide, extract, stream, owner, ownerScript, card, voice, memory, graph, cli, python],
  anchors,
  rubrics: {
    'REQ-FACTS-01': noul('Is a fact a personFactRecorded event carrying slot, text, quote, sourceMessageKeys, validFrom, confidence and extractedBy, does recordFact refuse a fact without a source in log.db or with a quote not in its source, and is personFacts a derived table rebuilt from the events?'),
    'REQ-FACTS-02': noul('Does a later fact in a SINGLE_SLOTS slot close the current one by setting validTo, closedAt and supersededBy without deleting or editing its text, and do other slots close only the facts named in supersedes?'),
    'REQ-FACTS-03': noul('Does a fact attach to the linked person when the identity is linked, move to the person when identityLinked is derived later (factsFollowLink, newest wins in one-value slots), and leave it on unlink?'),
    'REQ-FACTS-04': noul('Does extractFacts read only lines after each chat\'s factOffsets offset, mark candidates with one GLiNER2 schema (classification, entities, relations) locally, keep relations only when both ends resolve, skip model calls for repeats of current facts, send only marked lines to SubQ in DECIDE_BATCH batches for ADD, SUPERSEDE or NOOP, and drop slots the speaker cannot state?'),
    'REQ-FACTS-05': noul('Does the voice gate read the recipient\'s open promises, put them on the card SubQ reads, and hold a draft that repeats one with an already promised block, and does the person card show open promises and current facts with their dates and sources?'),
    'REQ-FACTS-06': noul('Does the shared projection write Episode, Fact, FROM, ABOUT, SUPERSEDES and MENTIONS in both the full build and the in-place apply, with a vector index on Fact.embedding that filters on closedAt, and does recall return current facts with their evidence lines and what they replaced?'),
    unspecifiedBehavior: noul('Does any person-facts code send a message, call a paid API other than SubQ in tier 2, or edit or delete a recorded fact instead of superseding it?'),
  },
  assertions: {
    'REQ-FACTS-01': MET,
    'REQ-FACTS-02': MET,
    'REQ-FACTS-03': MET,
    'REQ-FACTS-04': MET,
    'REQ-FACTS-05': MET,
    'REQ-FACTS-06': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
