import { noul } from 'jev-spec'
import type { RequirementAnchors } from '../anchors/types'
import { MET, NOT_VIOLATED } from '../types'

const client = 'src/search/conversations/client.ts'
const types = 'src/search/conversations/types.ts'
const fuse = 'src/search/conversations/helpers/fuse.ts'
const embed = 'src/search/conversations/helpers/embed.ts'
const worker = 'src/search/conversations/helpers/embedWorker.ts'
const cli = 'src/cli/search/index.ts'

const anchors: RequirementAnchors = {
  'REQ-SEARCH-01': [
    { kind: 'symbol', file: client, name: 'search' },
    { kind: 'symbol', file: fuse, name: 'reciprocalRankFusion' },
    { kind: 'string', file: client, includes: 'bm25s' },
    { kind: 'string', file: client, includes: 'verso-db' },
  ],
  'REQ-SEARCH-02': [
    { kind: 'value', file: types, name: 'RRF_K', equals: 60 },
    { kind: 'symbol', file: fuse, name: 'reciprocalRankFusion' },
  ],
  'REQ-SEARCH-03': [
    { kind: 'symbol', file: client, name: 'passes' },
    { kind: 'string', file: cli, includes: 'platform' },
    { kind: 'string', file: cli, includes: 'account' },
    { kind: 'string', file: cli, includes: 'with' },
    { kind: 'string', file: cli, includes: 'after' },
  ],
  'REQ-SEARCH-04': [
    { kind: 'value', file: types, name: 'EMBED_MODEL', equals: 'Xenova/all-MiniLM-L6-v2' },
    { kind: 'symbol', file: embed, name: 'localEmbedder' },
    { kind: 'string', file: worker, includes: '@huggingface/transformers' },
    { kind: 'string', file: worker, includes: 'feature-extraction' },
    { kind: 'string', file: worker, includes: 'mean' },
  ],
  'REQ-SEARCH-05': [
    { kind: 'symbol', file: client, name: 'saveConversations' },
    { kind: 'symbol', file: client, name: 'conversationsRoot' },
    { kind: 'string', file: client, includes: '.logCli' },
    { kind: 'string', file: client, includes: 'conversations' },
  ],
  'REQ-SEARCH-06': [
    { kind: 'symbol', file: client, name: 'searchRoot' },
    { kind: 'symbol', file: client, name: 'buildIndex' },
    { kind: 'symbol', file: client, name: 'openIndex' },
    { kind: 'string', file: client, includes: 'chunks.json' },
  ],
  'REQ-SEARCH-07': [
    { kind: 'symbol', file: client, name: 'updateIndex' },
    { kind: 'string', file: client, includes: 'model.json' },
    { kind: 'string', file: cli, includes: 'rebuild' },
  ],
  'REQ-SEARCH-08': [
    { kind: 'symbol', file: cli, name: 'BENCH_QUERIES' },
    { kind: 'symbol', file: client, name: 'benchmark' },
    { kind: 'symbol', file: client, name: 'linearScan' },
    { kind: 'symbol', file: fuse, name: 'percentiles' },
    { kind: 'string', file: cli, includes: 'rounds' },
  ],
}

export const search = {
  description: 'The conversation search: keyword and meaning fused with reciprocal rank fusion, its filters, indexes and bench',
  specPath: 'docs/specs/search.md',
  codePaths: [
    client,
    types,
    fuse,
    embed,
    worker,
    cli,
  ],
  anchors,
  rubrics: {
    'REQ-SEARCH-01': noul('Does search start the keyword list and the meaning list before awaiting either (so they run together), fuse them with reciprocalRankFusion, and keep for each hit its keyword rank and its meaning rank?'),
    'REQ-SEARCH-02': noul('Does reciprocalRankFusion add 1 / (k + index + 1) for each list a chunk is in, with k defaulting to RRF_K, and sort by that sum, highest first?'),
    'REQ-SEARCH-03': noul('Does search drop the chunks that fail the platform, account, with (case-insensitive, with or without @) and after filters from both lists before fusing them, and read each list four times deeper when any filter is set?'),
    'REQ-SEARCH-05': noul('Does log search index read each X account with one export read of its inbox, passing the saved X Chat PIN when there is one, read each Discord account with one export read, and save the conversations with saveConversations, one file each, under conversationsRoot, which an environment variable can move?'),
    'REQ-SEARCH-06': noul('Do buildIndex and updateIndex write the chunks, the bm25 index and the vectors under searchRoot, which an environment variable can move, and does openIndex load them from that same folder?'),
    'REQ-SEARCH-07': noul('Does updateIndex embed only the chunks whose text differs from what was saved, call collection.delete with the ids no longer present, and rebuild the whole index when nothing was saved yet, when the model or dimensions changed, or when the rebuild flag is given?'),
    'REQ-SEARCH-08': noul('Does log search bench time the queries once cold and then over the warm rounds, print p50, p95 and p99 for each, and print the average time a query of the linear scan beside them?'),
    unspecifiedBehavior: noul('Does the search code rank or filter hits, or embed text, by a route the specification does not describe, such as using only one of the two lists or sending text to a hosted service?'),
  },
  assertions: {
    'REQ-SEARCH-01': MET,
    'REQ-SEARCH-02': MET,
    'REQ-SEARCH-03': MET,
    'REQ-SEARCH-05': MET,
    'REQ-SEARCH-06': MET,
    'REQ-SEARCH-07': MET,
    'REQ-SEARCH-08': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
