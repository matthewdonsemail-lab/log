import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

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
  rubrics: {
    'REQ-KB-01': noul('Does twentyKbStore keep articles in the knowledgeArticle object (plural knowledgeArticles) with key, kind, title, body, source, tags, author and hash fields, and is KB_DEFAULT_TWENTY_URL https://node02.tail4fcf85.ts.net?'),
    'REQ-KB-02': noul('Does kbConfig read the Twenty API key and the Redis URL from KB_TWENTY_API_KEY and KB_REDIS_URL or from files in ~/.config/listeningkit/, and return missing naming which one is absent?'),
    'REQ-KB-03': noul('Does searchKnowledge run index.keyword (FT.SEARCH with SCORER BM25) and index.meaning (KNN on the HNSW vec field of kbIdx) with Promise.all, fuse them with reciprocalRankFusion, filter by kind when given, and keep one hit per article key?'),
    'REQ-KB-04': noul('Does collectAll gather collectRules (numbered rules and other ## sections of AGENTS.md), collectSkills, collectDocs (docs/infra/ as kind infra), collectMemories, collectPageStates and collectAccounts, and does kb sync pass no accounts when --noAccounts is set?'),
    'REQ-KB-05': noul('Does collectDocs skip paths under docs/vendors/ and paths matching Enforcement, and does collectAccounts write only whether a proxy is attached, never the proxy URL, cookies, email, password or totpSecret?'),
    'REQ-KB-06': noul('Does syncKnowledge compare articleHash with the hash Twenty holds for each key, create the new keys, save only the ones whose hash changed, and count the rest as unchanged?'),
    'REQ-KB-07': noul('Does syncKnowledge re-index every article in existing (the rows Twenty holds, not only the collected ones) whose hash differs from index.hashes(), and drop from Redis every indexed key that Twenty no longer has?'),
    'REQ-KB-08': noul('Does rememberKnowledge build a note article with noteArticle (kind note, key note:<timestamp>-<slug>), save it with store.save and index it with indexArticle in the same call?'),
    'REQ-KB-09': noul('Does kb show print the article for the key in full and return kbArticleMissing when no article has that key?'),
    'REQ-KB-10': noul('Do both article in collect.ts and noteArticle pass the body through scrubSecrets, which replaces JWTs, URLs with user:password@, named api key, secret, token, password and pin values, sk- and ghp- style keys, private key blocks and long random strings?'),
    unspecifiedBehavior: noul('Does the knowledge base code write an article to Twenty or Redis without scrubbing it, write account credentials, or search by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-KB-01': MET,
    'REQ-KB-02': MET,
    'REQ-KB-03': MET,
    'REQ-KB-04': MET,
    'REQ-KB-05': MET,
    'REQ-KB-06': MET,
    'REQ-KB-07': MET,
    'REQ-KB-08': MET,
    'REQ-KB-09': MET,
    'REQ-KB-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
