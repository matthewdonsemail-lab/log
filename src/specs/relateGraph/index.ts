import { noul } from 'jev-spec'
import type { RequirementAnchors } from '../anchors/types'
import { MET, NOT_VIOLATED } from '../types'

const client = 'src/relate/graph/client.ts'
const types = 'src/relate/graph/types.ts'
const project = 'src/relate/graph/helpers/project.ts'
const mentions = 'src/relate/graph/helpers/mentions.ts'
const cli = 'src/cli/relate/index.ts'
const answers = 'src/agentHooks/answers/client.ts'
const registry = 'src/agentHooks/registry/index.ts'
const searched = 'src/relate/search/client.ts'
const searchedTypes = 'src/relate/search/types.ts'
const postInstallTypes = 'src/release/postInstall/types.ts'
const rings = 'src/relate/network/helpers/rings.ts'
const networkClient = 'src/relate/network/client.ts'
const networkRead = 'src/relate/network/helpers/read.ts'
const storeClient = 'src/storage/platform/client.ts'
const networkCli = 'src/cli/network/index.ts'
const graphNetwork = 'src/relate/graph/helpers/network.ts'
const networkPeople = 'src/relate/network/helpers/people.ts'
const store = 'src/relate/graph/helpers/store.ts'
const owner = 'src/relate/owner/client.ts'
const ownerTypes = 'src/relate/owner/types.ts'
const fence = 'src/relate/owner/helpers/fence.ts'
const link = 'src/relate/owner/helpers/link.ts'
const mcpServer = 'src/mcp/server/index.ts'
const machine = 'src/relate/machine/client.ts'

const anchors: RequirementAnchors = {
  'REQ-RELATE-01': [
    { kind: 'symbol', file: project, name: 'projectionOf' },
    { kind: 'symbol', file: project, name: 'readOnce' },
    { kind: 'string', file: project, includes: 'FROM handleAliases' },
    { kind: 'uses', file: project, name: 'ownerHandles' },
  ],
  'REQ-RELATE-02': [
    { kind: 'symbol', file: client, name: 'buildGraph' },
    { kind: 'symbol', file: client, name: 'buildGraphHere' },
    { kind: 'symbol', file: client, name: 'writeProjection' },
    { kind: 'symbol', file: client, name: 'buildFileHere' },
    { kind: 'symbol', file: client, name: 'putPointer' },
    { kind: 'symbol', file: client, name: 'prune' },
    { kind: 'value', file: types, name: 'KEPT_SNAPSHOTS', equals: 3 },
    { kind: 'uses', file: client, name: 'claimGraphOwner' },
  ],
  'REQ-RELATE-03': [
    { kind: 'symbol', file: client, name: 'verifyGraph' },
    { kind: 'symbol', file: client, name: 'countsIn' },
    { kind: 'symbol', file: client, name: 'expectedCounts' },
  ],
  'REQ-RELATE-04': [
    { kind: 'symbol', file: client, name: 'workspaceOf' },
    { kind: 'symbol', file: client, name: 'graphDir' },
    { kind: 'symbol', file: client, name: 'pointerOf' },
    { kind: 'value', file: types, name: 'PROJECTOR_VERSION', equals: 5 },
  ],
  'REQ-RELATE-05': [
    { kind: 'symbol', file: mentions, name: 'mentionedTokens' },
    { kind: 'symbol', file: client, name: 'findPeople' },
    { kind: 'symbol', file: answers, name: 'relateAnswer' },
    { kind: 'value', file: types, name: 'MENTIONED_PEOPLE', equals: 3 },
    { kind: 'value', file: types, name: 'TOKEN_MIN', equals: 4 },
    { kind: 'string', file: registry, includes: 'scripts/hooks/relate.ts' },
  ],
  'REQ-RELATE-06': [
    { kind: 'symbol', file: client, name: 'connectedContext' },
    { kind: 'symbol', file: client, name: 'renderContext' },
    { kind: 'value', file: types, name: 'CONTEXT_CHARS', equals: 2000 },
  ],
  'REQ-RELATE-07': [
    { kind: 'symbol', file: owner, name: 'ensureGraphOwner' },
    { kind: 'symbol', file: owner, name: 'startGraphOwner' },
    { kind: 'uses', file: answers, name: 'ensureGraphOwner' },
    { kind: 'uses', file: mcpServer, name: 'ensureGraphOwner' },
    { kind: 'value', file: ownerTypes, name: 'OWNER_START_BACKOFF_MS', equals: 20000 },
    { kind: 'string', file: postInstallTypes, includes: 'relateGraph' },
  ],
  'REQ-RELATE-08': [
    { kind: 'symbol', file: client, name: 'queryGraph' },
    { kind: 'symbol', file: client, name: 'readOnlyRows' },
    { kind: 'symbol', file: cli, name: 'relateCommand' },
    { kind: 'value', file: types, name: 'QUERY_ROWS', equals: 100 },
  ],
  'REQ-RELATE-09': [
    { kind: 'symbol', file: searched, name: 'connectedSearch' },
    { kind: 'symbol', file: searched, name: 'renderSearched' },
    { kind: 'value', file: searchedTypes, name: 'SEARCHED_HITS', equals: 3 },
    { kind: 'value', file: searchedTypes, name: 'MIN_LIKELIHOOD', equals: 0.6 },
    { kind: 'value', file: searchedTypes, name: 'SEARCH_BUDGET_MS', equals: 6000 },
    { kind: 'value', file: searchedTypes, name: 'SEARCH_CHARS', equals: 1500 },
    { kind: 'uses', file: answers, name: 'connectedSearch' },
  ],
  'REQ-RELATE-10': [
    { kind: 'uses', file: project, name: 'roomCatalog' },
    { kind: 'uses', file: project, name: 'channelNameOf' },
    { kind: 'string', file: client, includes: 'IN_SERVER' },
  ],
  'REQ-RELATE-11': [
    { kind: 'string', file: client, includes: 'LINKED_TO' },
    { kind: 'string', file: project, includes: 'FROM identityLinks' },
  ],
  'REQ-RELATE-12': [
    { kind: 'string', file: client, includes: 'REPLIED_TO' },
    { kind: 'string', file: client, includes: 'MENTIONED' },
    { kind: 'symbol', file: mentions, name: 'pointedAt' },
  ],
  'REQ-RELATE-13': [
    { kind: 'symbol', file: client, name: 'GraphUnreadable' },
    { kind: 'string', file: client, includes: 'graphUnreadable' },
  ],
  'REQ-RELATE-14': [
    { kind: 'symbol', file: rings, name: 'ringsFromEvent' },
    { kind: 'symbol', file: rings, name: 'ringsFromMessage' },
    { kind: 'symbol', file: rings, name: 'ringsFromInteraction' },
    { kind: 'symbol', file: rings, name: 'rebuildRingsIn' },
    { kind: 'symbol', file: networkClient, name: 'ensureRings' },
    { kind: 'symbol', file: graphNetwork, name: 'applyRings' },
    { kind: 'uses', file: storeClient, name: 'ringsFromEvent' },
    { kind: 'symbol', file: networkRead, name: 'RESEARCH_FIT_FIELD' },
  ],
  'REQ-RELATE-15': [
    { kind: 'symbol', file: client, name: 'applyBatch' },
    { kind: 'symbol', file: client, name: 'applyProjection' },
    { kind: 'symbol', file: client, name: 'deltaScopeOf' },
    { kind: 'symbol', file: client, name: 'readOffset' },
    { kind: 'symbol', file: project, name: 'projectionOf' },
    { kind: 'value', file: types, name: 'CHECKPOINT_ROWS', equals: 20000 },
    { kind: 'value', file: types, name: 'APPLY_MAX_EVENTS', equals: 20000 },
    { kind: 'value', file: ownerTypes, name: 'OWNER_BATCH_EVENTS', equals: 2000 },
  ],
  'REQ-RELATE-16': [
    { kind: 'symbol', file: networkClient, name: 'networkRings' },
    { kind: 'symbol', file: networkCli, name: 'networkCommand' },
  ],
  'REQ-RELATE-17': [
    { kind: 'symbol', file: networkPeople, name: 'networkMapOf' },
    { kind: 'symbol', file: networkPeople, name: 'peopleOf' },
    { kind: 'symbol', file: networkPeople, name: 'platformRingsOf' },
    { kind: 'symbol', file: networkClient, name: 'suggestedMatches' },
    { kind: 'symbol', file: rings, name: 'linkedTo' },
    { kind: 'symbol', file: graphNetwork, name: 'applyPersonRings' },
    { kind: 'symbol', file: graphNetwork, name: 'WHO_TO_TALK_TO' },
    { kind: 'uses', file: cli, name: 'PLATFORMS' },
    { kind: 'uses', file: networkCli, name: 'suggestedMatches' },
  ],
  'REQ-RELATE-18': [
    { kind: 'symbol', file: owner, name: 'runGraphOwner' },
    { kind: 'symbol', file: owner, name: 'stopGraphOwner' },
    { kind: 'value', file: ownerTypes, name: 'OWNER_BATCH_MS', equals: 200 },
    { kind: 'value', file: ownerTypes, name: 'OWNER_HEARTBEAT_MS', equals: 2000 },
    { kind: 'string', file: owner, includes: 'owner.ts' },
  ],
  'REQ-RELATE-19': [
    { kind: 'symbol', file: fence, name: 'claimGraphOwner' },
    { kind: 'symbol', file: fence, name: 'checkGraphFence' },
    { kind: 'symbol', file: fence, name: 'GraphOwnerFenced' },
    { kind: 'symbol', file: client, name: 'fenceStore' },
    { kind: 'value', file: ownerTypes, name: 'OWNER_STALE_CONFIRM_MS', equals: 10000 },
    { kind: 'uses', file: fence, name: 'sameProcess' },
  ],
  'REQ-RELATE-20': [
    { kind: 'symbol', file: link, name: 'ownerRequest' },
    { kind: 'symbol', file: client, name: 'readFromFile' },
    { kind: 'symbol', file: store, name: 'openStore' },
    { kind: 'value', file: ownerTypes, name: 'OWNER_READ_MS', equals: 3000 },
    { kind: 'uses', file: machine, name: 'ownerRequest' },
  ],
  'REQ-RELATE-21': [
    { kind: 'symbol', file: client, name: 'buildFileAsync' },
    { kind: 'symbol', file: client, name: 'needsFullBuild' },
  ],
  'REQ-RELATE-22': [
    { kind: 'symbol', file: owner, name: 'graphOwnerStatus' },
    { kind: 'symbol', file: client, name: 'renderContext' },
  ],
}

export const relateGraph = {
  description: "The Relate graph projected from log.db and the connected context its hook injects for the people a prompt names",
  specPath: 'docs/specs/relateGraph.md',
  codePaths: [client, types, project, mentions, cli, answers, postInstallTypes, rings, networkClient, networkRead, networkPeople, networkCli, graphNetwork, storeClient, store, owner, ownerTypes, fence, link, machine],
  anchors,
  rubrics: {
    'REQ-RELATE-01': noul('Does projectionOf run every read inside one read transaction (readOnce), take throughSeq as the highest events seq in that same transaction, and mark as owner the identities that are an account\'s own id, a self: id or an account\'s own handle?'),
    'REQ-RELATE-02': noul('Does a full build run in a separate short-lived process (buildGraph spawns buildGraphHere, the owner spawns buildFileHere), write a new graph-<throughSeq>-<ms>.rl file in one Relate transaction with its offsets and generation on the Snapshot node, checkpoint and close it before putPointer stores the relateGraph pointer inside a generation-checked transaction, does buildGraphHere take the graph owner claim for its run, and does prune keep the newest KEPT_SNAPSHOTS files and the current one?'),
    'REQ-RELATE-03': noul('Does verifyGraph compare every count of expectedCounts(projectionOf) with countsIn of the current graph, and report a graph behind log.db as behind instead of comparing it?'),
    'REQ-RELATE-04': noul('Does pointerOf return null when the stored pointer\'s workspace differs from workspaceOf(dbPath), its projector version differs from PROJECTOR_VERSION, or its file does not exist?'),
    'REQ-RELATE-05': noul('Does relateAnswer return nothing for an empty prompt or one starting with <, and does findPeople match handles, aliases and display or sender names (multi-word anywhere, one-word only capitalised or tagged), skip owner identities, merge identities of one platform with the same handle into one person, and keep at most MENTIONED_PEOPLE people?'),
    'REQ-RELATE-06': noul('Does renderContext say, for each person, the talks, engagement, groups, introducers and same-orbit people from connectedContext, name throughSeq and how far behind log.db the graph is, and cut the text to CONTEXT_CHARS?'),
    'REQ-RELATE-07': noul('Does the after-install routine build the graph after migrations, and do the relate hook and the MCP server only call ensureGraphOwner, which reads the owners row and starts the owner as a detached hidden process only when it is not alive and no relateOwnerStart claim is younger than OWNER_START_BACKOFF_MS, never spawning a build or an apply?'),
    'REQ-RELATE-08': noul('Does queryGraph run the statement on the current graph through the owner or a read-only open of the last file, refuse a statement whose EXPLAIN query type is not a read, and return at most QUERY_ROWS rows with whether more were cut?'),
    'REQ-RELATE-09': noul('When the prompt names someone the graph knows, does relateAnswer also run connectedSearch (keyword, meaning and relationship fused) and add up to SEARCHED_HITS hits with likelihood at least MIN_LIKELIHOOD that a text retriever found, under FROM THE CONVERSATIONS within SEARCH_CHARS, running nothing when no one is named, the index or graph is missing, and dropping a search past SEARCH_BUDGET_MS?'),
    'REQ-RELATE-10': noul('Does projectionOf take a Discord room\'s kind and name from the channel catalog, make an unlisted Discord room with a serverId a channel without a speaker\'s name, and give every room with a server an IN_SERVER edge to one Server node?'),
    'REQ-RELATE-11': noul('Does every active identityLinks row become a LINKED_TO edge from its Identity to one Person node per personId?'),
    'REQ-RELATE-12': noul('Does SAID carry firstAtMs and lastAtMs, and do replies (replyToKey) and mentions (<@id> or @handle of a known identity or the owner) become REPLIED_TO and MENTIONED edges with room, times and first and last times, the owner side being the room\'s Account?'),
    'REQ-RELATE-13': noul('When the owner is down and the graph file cannot be opened read-only, does relateContext return the graphUnreadable outcome and graphPriorFor return null instead of throwing?'),
    'REQ-RELATE-14': noul('Does ringsFromEvent, called by insertEventRow in the same transaction, put a like, reply, quote, repost, reaction or mention of the owner or a one-to-one DM from them in ring 1, a follow in ring 3, a reply to or mention of a follower or ring-1 person in ring 2 (also when that person qualifies later), only ever move a person closer, need no imported data, and does rebuildRingsIn give the same rings from log.db?'),
    'REQ-RELATE-15': noul('Does applyBatch project only the rooms, actors and ring changes of at most maxEvents events after the store offset (plus rooms naming a new handle), write them and the new Snapshot offsets and generation in one Relate transaction committed only after checkGraphFence passes, checkpoint only past CHECKPOINT_ROWS, and does a full build happen on no pointer, a merge, a new import or more than APPLY_MAX_EVENTS events (needsFullBuild)?'),
    'REQ-RELATE-16': noul('Does log network status compute the rings once when missing and show the count per ring, the event they are live through against the latest event, and the import or that nothing was imported?'),
    'REQ-RELATE-17': noul('Are rings counted per person: do identities the owner linked (active identityLinks) count once at their closest ring, listing every linked account with its ring, reason and via, while pairs suggestLinks only suggests stay separate people shown as suggested; does a reply to a person whose linked account is ring 1 or follows the owner put the replier in ring 2, with a link or unlink recomputing the rings; does log network status, with no platform, show the per-platform breakdown and the combined view, and with --platform only that platform\'s accounts and rings; and does WHO_TO_TALK_TO list a linked person once through Person ring, lead and accounts, leave out a person with a dm on any linked account, and honour $platform, which log relate query sets from --platform?'),
    'REQ-RELATE-18': noul('Does runGraphOwner open the current store once, keep it open, and on one loop every OWNER_BATCH_MS apply new events in order, write a fenced pointer and a heartbeat every OWNER_HEARTBEAT_MS, and does stopGraphOwner ask it to stop and kill it only when it does not answer and its start time matches?'),
    'REQ-RELATE-19': noul('Does claimGraphOwner raise owners.generation inside BEGIN IMMEDIATE, refuse while the holder heartbeat is fresh, replace a silent holder only after two stale readings OWNER_STALE_CONFIRM_MS apart killing it only when sameProcess matches, does every batch commit, heartbeat and pointer write check the generation and pid, and does fenceStore refuse a store whose Snapshot generation is newer?'),
    'REQ-RELATE-20': noul('Do relateContext, graphPriorFor, queryGraph, verifyGraph and relateMachine ask the owner first through ownerRequest with a timeout, does the owner serve each read on its own connection while a batch applies, and with the owner down do they open the last file read-only for one read, close it and mark the answer served from the file and behind?'),
    'REQ-RELATE-21': noul('Does the owner run a full rebuild through buildFileAsync in a child process on one read snapshot while its loop keeps applying, then open the new file, catch up the events since its throughSeq, swap it in after reads on the old store finish, and move the pointer?'),
    'REQ-RELATE-22': noul('Do log relate status, log relate owner status and the hook context say how many events the graph is behind, from the owner offset against the highest events seq?'),
    unspecifiedBehavior: noul('Does the Relate graph or network code write to log.db anything other than its relateGraph pointer, its owners row, its relateOwnerStart claim, the network import and the ring tables, read a platform, or send anything off the machine?'),
  },
  assertions: {
    'REQ-RELATE-01': MET,
    'REQ-RELATE-02': MET,
    'REQ-RELATE-03': MET,
    'REQ-RELATE-04': MET,
    'REQ-RELATE-05': MET,
    'REQ-RELATE-06': MET,
    'REQ-RELATE-07': MET,
    'REQ-RELATE-08': MET,
    'REQ-RELATE-09': MET,
    'REQ-RELATE-10': MET,
    'REQ-RELATE-11': MET,
    'REQ-RELATE-12': MET,
    'REQ-RELATE-13': MET,
    'REQ-RELATE-14': MET,
    'REQ-RELATE-15': MET,
    'REQ-RELATE-16': MET,
    'REQ-RELATE-17': MET,
    'REQ-RELATE-18': MET,
    'REQ-RELATE-19': MET,
    'REQ-RELATE-20': MET,
    'REQ-RELATE-21': MET,
    'REQ-RELATE-22': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
