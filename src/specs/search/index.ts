import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const search = {
  description: 'The conversation search: keyword and meaning fused with reciprocal rank fusion, its filters, indexes and bench',
  specPath: 'docs/specs/search.md',
  codePaths: [
    'src/search/conversations/client.ts',
    'src/search/conversations/types.ts',
    'src/search/conversations/helpers/fuse.ts',
    'src/search/conversations/helpers/embed.ts',
    'src/search/conversations/helpers/embedWorker.ts',
    'src/cli/search/index.ts',
  ],
  rubrics: {
    'REQ-SEARCH-01': noul('Does search run the keyword list from index.keyword.retrieve and the meaning list from index.vectors.search together with Promise.all, and fuse them with reciprocal rank fusion, keeping keywordRank and meaningRank on each hit?'),
    'REQ-SEARCH-02': noul('Does reciprocalRankFusion add 1 / (k + index + 1) for each list a chunk is in, with k defaulting to RRF_K which is 60, and sort by that score, highest first?'),
    'REQ-SEARCH-03': noul('Does search drop chunks that fail passes (platform, account, with compared case-insensitively without @, at not before after) from both lists before fusing, and multiply the depth by 4 when any filter is set?'),
    'REQ-SEARCH-04': noul('Does the embedder run EMBED_MODEL Xenova/all-MiniLM-L6-v2 locally through the @huggingface/transformers feature-extraction pipeline with mean pooling and normalize true, without calling a hosted embedding API?'),
    'REQ-SEARCH-05': noul('Does log search index read each X account with one engine call with action inbox and export true, passing chatPin from loginSecrets messengerPin when it is saved, read each Discord account with one export action, and save the conversations with saveConversations under conversationsRoot?'),
    'REQ-SEARCH-06': noul('Do buildIndex and updateIndex write chunks.json, the bm25 index and the vectors under searchRoot (LOG_SEARCH_DIR or ~/.logCli/search), and does openIndex load them from there?'),
    'REQ-SEARCH-07': noul('Does updateIndex embed only the chunks whose text differs from chunks.json, delete the ids no longer present, and call buildIndex when chunks.json or model.json is missing or the model or dimensions changed?'),
    'REQ-SEARCH-08': noul('Does log search bench time BENCH_QUERIES with benchmark for cold and warm rounds, print p50, p95 and p99 from percentiles for each, and print the linearScan average a query?'),
    unspecifiedBehavior: noul('Does the search code rank or filter hits, or embed text, by a route the specification does not describe, such as using only one of the two lists or sending text to a hosted service?'),
  },
  assertions: {
    'REQ-SEARCH-01': MET,
    'REQ-SEARCH-02': MET,
    'REQ-SEARCH-03': MET,
    'REQ-SEARCH-04': MET,
    'REQ-SEARCH-05': MET,
    'REQ-SEARCH-06': MET,
    'REQ-SEARCH-07': MET,
    'REQ-SEARCH-08': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
