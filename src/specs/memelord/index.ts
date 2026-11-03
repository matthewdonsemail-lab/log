import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TYPES = 'src/extensions/memelord/types.ts'
const CLIENT = 'src/extensions/memelord/client.ts'
const COMMAND = 'src/cli/memelord/index.ts'
const TASTE_TYPES = 'src/extensions/memeTaste/types.ts'
const TASTE = 'src/extensions/memeTaste/client.ts'

export const memelord = {
  description: 'The Memelord extension: only its four free discovery tools, called with GET and the key, answered as templates with a media url',
  specPath: 'docs/specs/memelord.md',
  codePaths: [TYPES, CLIENT, COMMAND, TASTE_TYPES, TASTE],
  anchors: {
    'REQ-MEME-01': [
      { kind: 'value', file: TYPES, name: 'MEMELORD_API', equals: 'https://www.memelord.com/api/v1' },
      { kind: 'value', file: TYPES, name: 'MEMELORD_TOOLS', path: ['searchMemes'], equals: '/templates/search' },
      { kind: 'value', file: TYPES, name: 'MEMELORD_TOOLS', path: ['getMemeTemplate'], equals: '/templates/' },
      { kind: 'value', file: TYPES, name: 'MEMELORD_TOOLS', path: ['getTrendingMemes'], equals: '/templates/trending' },
      { kind: 'value', file: TYPES, name: 'MEMELORD_TOOLS', path: ['listImageTools'], equals: '/image-tools' },
      { kind: 'symbol', file: CLIENT, name: 'toolUrl' },
    ],
    'REQ-MEME-02': [
      { kind: 'symbol', file: CLIENT, name: 'createMemelordClient' },
      { kind: 'string', file: CLIENT, includes: 'GET' },
    ],
    'REQ-MEME-03': [
      { kind: 'symbol', file: CLIENT, name: 'memelordKey' },
      { kind: 'string', file: CLIENT, includes: 'memelordKeyMissing' },
    ],
    'REQ-MEME-04': [{ kind: 'symbol', file: COMMAND, name: 'refused' }],
    'REQ-MEME-05': [
      { kind: 'symbol', file: CLIENT, name: 'templateOf' },
      { kind: 'symbol', file: CLIENT, name: 'templatesIn' },
    ],
    'REQ-MEME-06': [
      { kind: 'value', file: TYPES, name: 'IMAGE_TOOL_CATEGORIES', path: ['imageToImage'], equals: 'image-to-image' },
      { kind: 'value', file: TYPES, name: 'SEARCH_METHOD_FLAGS', path: ['combined'], equals: 'semantic_combined' },
    ],
    'REQ-MEME-08': [{ kind: 'string', file: COMMAND, includes: 'log never runs them' }],
    'REQ-MEME-09': [
      { kind: 'value', file: TASTE_TYPES, name: 'MEME_AT', equals: 0.5 },
      { kind: 'symbol', file: TASTE_TYPES, name: 'TASTE_STYLES' },
      { kind: 'symbol', file: TASTE, name: 'buildTaste' },
      { kind: 'symbol', file: TASTE, name: 'readCandidate' },
      { kind: 'symbol', file: TASTE, name: 'candidatesFromXPosts' },
    ],
    'REQ-MEME-10': [
      { kind: 'symbol', file: COMMAND, name: 'rankByTaste' },
      { kind: 'symbol', file: TASTE, name: 'tasteFit' },
      { kind: 'symbol', file: TASTE, name: 'tasteSummary' },
    ],
  },
  rubrics: {
    'REQ-MEME-01': noul('Does every call the Memelord client makes go to a url built by toolUrl from one of the four MEMELORD_TOOLS paths, with no other Memelord path anywhere in the code?'),
    'REQ-MEME-02': noul('Does the call function in createMemelordClient fetch with method GET and an Authorization header of Bearer followed by the key, sending no body?'),
    'REQ-MEME-03': noul('When the key is null, does the call function in createMemelordClient return code memelordKeyMissing without calling the fetcher?'),
    'REQ-MEME-04': noul('When the status is not 200 or the body says success false, does the client return ok false with the status, the body code and the body error, and does the command turn that into exit code 1 through refused?'),
    'REQ-MEME-05': noul('Does templateOf give each template its id, name, type, the first https url found among the media fields as mediaUrl, its text slot count and its context or description?'),
    'REQ-MEME-06': noul('Does the command take the camelCase category and method flags and look up the value it sends in IMAGE_TOOL_CATEGORIES and SEARCH_METHOD_FLAGS?'),
    'REQ-MEME-07': noul('Does the memelord command return code 1 for a search limit outside 1 to 100 or a trending limit outside 1 to 12 before calling the client?'),
    'REQ-MEME-08': noul('Does the tools subcommand only list the image tool catalog, with no code anywhere that runs an image tool?'),
    'REQ-MEME-09': noul('Does buildTaste send each candidate picture to SubQ as an image through readCandidate, and keep a candidate only when its meme answer is at least MEME_AT, with the style SubQ chose from TASTE_STYLES or other?'),
    'REQ-MEME-10': noul('Unless noTaste is set, does the search subcommand score each template with tasteFit from its preview picture, sort them by that score from highest down, and put tasteSummary as the first line of its answer?'),
    unspecifiedBehavior: noul('Does the code reach a Memelord endpoint that can spend money, send a POST, or send the key anywhere other than the Memelord API, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-MEME-01': MET,
    'REQ-MEME-02': MET,
    'REQ-MEME-03': MET,
    'REQ-MEME-04': MET,
    'REQ-MEME-05': MET,
    'REQ-MEME-06': MET,
    'REQ-MEME-07': MET,
    'REQ-MEME-08': MET,
    'REQ-MEME-09': MET,
    'REQ-MEME-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
