import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/knowledge/base/client.ts'
const TYPES = 'src/knowledge/base/types.ts'
const COLLECT = 'src/knowledge/base/helpers/collect.ts'
const SCRUB = 'src/knowledge/base/helpers/scrub.ts'
const REDIS = 'src/knowledge/base/helpers/redisIndex.ts'
const STORE = 'src/knowledge/base/helpers/twentyStore.ts'
const CHUNK = 'src/knowledge/base/helpers/chunk.ts'
const CLI = 'src/cli/kb/index.ts'

export const knowledgeBase = {
  description: 'The knowledge base: articles in Twenty, searched through Redis, synced from every source with secrets scrubbed',
  specPath: 'docs/specs/knowledgeBase.md',
  codePaths: [
    'src/knowledge/base/client.ts',
    'src/knowledge/base/types.ts',
    'src/knowledge/base/helpers/collect.ts',
    'src/knowledge/base/helpers/scrub.ts',
    'src/knowledge/base/helpers/redisIndex.ts',
    'src/knowledge/base/helpers/twentyStore.ts',
    'src/knowledge/base/helpers/chunk.ts',
    'src/cli/kb/index.ts',
  ],
  anchors: {
    'REQ-KB-01': [
      { kind: 'value', file: TYPES, name: 'KB_OBJECT_PLURAL', equals: 'knowledgeArticles' },
      { kind: 'value', file: TYPES, name: 'KB_DEFAULT_TWENTY_URL', equals: 'https://node02.tail4fcf85.ts.net' },
      { kind: 'symbol', file: STORE, name: 'twentyKbStore' },
      { kind: 'symbol', file: STORE, name: 'FIELDS' },
      { kind: 'string', file: STORE, includes: 'key' },
      { kind: 'string', file: STORE, includes: 'kind' },
      { kind: 'string', file: STORE, includes: 'body' },
      { kind: 'string', file: STORE, includes: 'source' },
      { kind: 'string', file: STORE, includes: 'tags' },
      { kind: 'string', file: STORE, includes: 'author' },
      { kind: 'string', file: STORE, includes: 'contentHash' },
    ],
    'REQ-KB-02': [
      { kind: 'symbol', file: CLIENT, name: 'kbConfig' },
      { kind: 'string', file: CLIENT, includes: '.config' },
      { kind: 'string', file: CLIENT, includes: 'listeningkit' },
    ],
    'REQ-KB-03': [
      { kind: 'value', file: TYPES, name: 'KB_INDEX', equals: 'kbIdx' },
      { kind: 'symbol', file: CLIENT, name: 'searchKnowledge' },
      { kind: 'string', file: REDIS, includes: 'BM25' },
      { kind: 'string', file: REDIS, includes: 'HNSW' },
      { kind: 'string', file: CLI, includes: 'kind' },
    ],
    'REQ-KB-04': [
      { kind: 'symbol', file: COLLECT, name: 'collectAll' },
      { kind: 'symbol', file: COLLECT, name: 'collectRules' },
      { kind: 'symbol', file: COLLECT, name: 'collectSkills' },
      { kind: 'symbol', file: COLLECT, name: 'collectDocs' },
      { kind: 'symbol', file: COLLECT, name: 'collectMemories' },
      { kind: 'symbol', file: COLLECT, name: 'collectPageStates' },
      { kind: 'symbol', file: COLLECT, name: 'collectAccounts' },
      { kind: 'string', file: COLLECT, includes: 'docs/infra/' },
      { kind: 'string', file: CLI, includes: 'noAccounts' },
    ],
    'REQ-KB-05': [{ kind: 'symbol', file: COLLECT, name: 'SKIPPED_DOCS' }],
    'REQ-KB-06': [
      { kind: 'symbol', file: CHUNK, name: 'articleHash' },
      { kind: 'symbol', file: CLIENT, name: 'syncKnowledge' },
    ],
    'REQ-KB-08': [
      { kind: 'symbol', file: CLIENT, name: 'noteArticle' },
      { kind: 'symbol', file: CLIENT, name: 'rememberKnowledge' },
    ],
    'REQ-KB-10': [
      { kind: 'symbol', file: SCRUB, name: 'scrubSecrets' },
      { kind: 'symbol', file: SCRUB, name: 'looksRandom' },
    ],
  },
  rubrics: {
    'REQ-KB-02': noul('Does kbConfig take the Twenty API key and the Redis URL only from the environment or from files in the home config folder, never from the repo, and return missing naming which of the two is absent?'),
    'REQ-KB-03': noul('Does searchKnowledge run index.keyword (FT.SEARCH with the BM25 scorer) and index.meaning (KNN on the HNSW vec field) together with Promise.all, fuse them with reciprocalRankFusion, filter by kind when one is given, and keep one hit per article key at its best chunk?'),
    'REQ-KB-04': noul('Does collectAll gather collectRules (numbered rules and the other sections of AGENTS.md), collectSkills, collectDocs (docs/infra/ as kind infra), collectMemories, collectPageStates and collectAccounts, and does kb sync pass no accounts when noAccounts is set?'),
    'REQ-KB-05': noul('Does collectDocs skip every path SKIPPED_DOCS matches, the ones under docs/vendors/ and the ones about enforcement, and does the Proxy line of collectAccounts write only the word attached or none, never the value of a.proxy itself, with no line carrying cookies, email, password or totpSecret?'),
    'REQ-KB-06': noul('Does syncKnowledge compare articleHash with the hash Twenty holds for each key, create the new keys, save only the ones whose hash changed, and count the rest as unchanged?'),
    'REQ-KB-07 reindex': noul('In syncKnowledge, does the loop over all, built from existing (every article Twenty holds), call indexArticle for each article whose hash differs from indexed.get of its key?'),
    'REQ-KB-07 drop': noul('In syncKnowledge, does the loop over indexed.keys() call index.drop for each key that existing does not have?'),
    'REQ-KB-08': noul('Does rememberKnowledge build a note article with noteArticle (kind note, a key of note: then a timestamp and a slug), save it with store.save and index it with indexArticle in the same call?'),
    'REQ-KB-09': noul('Does kb show print the article for the key in full, and return code 1 with kbArticleMissing when no article has that key?'),
    'REQ-KB-10': noul('Do both article in collect.ts and noteArticle pass the body through scrubSecrets before it is written, and does scrubSecrets replace JWTs, URLs with user:password@, named api key, secret, token, password and pin values, sk- and ghp- style keys, private key blocks and long random strings?'),
    unspecifiedBehavior: noul('Does the knowledge base code write an article to Twenty or Redis without scrubbing it, write account credentials, or search by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-KB-02': MET,
    'REQ-KB-03': MET,
    'REQ-KB-04': MET,
    'REQ-KB-05': MET,
    'REQ-KB-06': MET,
    'REQ-KB-07 reindex': MET,
    'REQ-KB-07 drop': MET,
    'REQ-KB-08': MET,
    'REQ-KB-09': MET,
    'REQ-KB-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
