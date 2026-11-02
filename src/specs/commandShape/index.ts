import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const platforms = 'src/cli/runner/helpers/platforms.ts'
const warmup = 'src/cli/warmup/index.ts'
const buildDocs = 'scripts/docs/buildDocs.ts'
const catalog = 'src/surface/catalog/index.ts'

export const commandShape = {
  description: 'The shape of every log command: the platform first, old forms refused, the usage and the generated reference',
  specPath: 'docs/specs/commandShape.md',
  codePaths: [
    'src/cli/runner/helpers/platforms.ts',
    'src/cli/runner/client.ts',
    'src/cli/runner/types.ts',
    'src/cli/warmup/index.ts',
    'scripts/docs/buildDocs.ts',
    'src/surface/catalog/index.ts',
    'src/surface/readme/index.ts',
  ],
  anchors: {
    'REQ-COMMAND-01': [
      { kind: 'symbol', file: platforms, name: 'resolvePlatformForm' },
      { kind: 'symbol', file: platforms, name: 'PLATFORMS' },
      { kind: 'symbol', file: platforms, name: 'isPlatform' },
    ],
    'REQ-COMMAND-06': [
      { kind: 'symbol', file: warmup, name: 'MOVED' },
      { kind: 'value', file: warmup, name: 'MOVED', path: ['plan'], equals: 'log facebook warmup stages plan' },
      { kind: 'value', file: warmup, name: 'MOVED', path: ['record'], equals: 'log facebook warmup stages record' },
      { kind: 'string', file: warmup, includes: 'log facebook warmup stages run' },
      { kind: 'string', file: warmup, includes: 'log facebook warmup stages log' },
    ],
    'REQ-COMMAND-07': [{ kind: 'symbol', file: 'src/cli/runner/types.ts', name: 'Command' }],
    'REQ-COMMAND-08': [
      { kind: 'symbol', file: catalog, name: 'GLOBAL_FLAGS' },
      { kind: 'string', file: catalog, includes: 'proxyMs' },
      { kind: 'symbol', file: catalog, name: 'flagsOf' },
    ],
    'REQ-COMMAND-11': [
      { kind: 'string', file: buildDocs, includes: 'docs/reference.md' },
      { kind: 'symbol', file: 'src/surface/readme/index.ts', name: 'withSurface' },
    ],
    'REQ-COMMAND-12': [
      { kind: 'string', file: buildDocs, includes: '--check' },
      { kind: 'symbol', file: buildDocs, name: 'put' },
    ],
    'REQ-COMMAND-13': [{ kind: 'string', file: buildDocs, includes: 'mermaid' }],
    'REQ-COMMAND-14': [{ kind: 'symbol', file: buildDocs, name: 'BROWSER_NAME' }],
  },
  rubrics: {
    'REQ-COMMAND-01': noul('When the first word is a platform, does resolvePlatformForm find the command named by the second word for that platform and return the remaining words as argv, with the platform kept as the first argument when the command platform is byArgument?'),
    'REQ-COMMAND-02': noul('When the first word is a one-platform command and no platform comes before it, does resolvePlatformForm return ok false with an error that prints log, the platform, the command and the remaining words?'),
    'REQ-COMMAND-03': noul('When the command found after a platform word has a different platform, does resolvePlatformForm return ok false with an error that prints the form that starts with the platform the command belongs to?'),
    'REQ-COMMAND-04': noul('When the command found after a platform word has platform any, does resolvePlatformForm return ok false with an error that prints the form without the platform?'),
    'REQ-COMMAND-05': noul('When the first word is a platform and find returns no command for the second word, does resolvePlatformForm return ok false with an error saying to name a command after the platform?'),
    'REQ-COMMAND-06': noul('Does warmupCommand return code 1 with the MOVED form when its first positional is one of the MOVED keys, before checking WARMUP_PLATFORMS?'),
    'REQ-COMMAND-07': noul('Is platform a required (not optional) field of the Command interface, typed as Platform, "any" or "byArgument"?'),
    'REQ-COMMAND-08': noul('Does buildDocs add a problem for each flag a src/cli directory parses that no usage of its commands names, and for each flag a usage names that nothing parses, skipping GLOBAL_FLAGS?'),
    'REQ-COMMAND-09': noul('For a command with input, does buildDocs add a problem when an input form has no usage line starting with log and the form words, and when an input flag that is not global is missing from the entry flags?'),
    'REQ-COMMAND-10': noul('Does buildDocs add a problem when a usage line of a command whose platform is not any does not start with a platform, when an any command usage puts a word in front of it, when a one-platform command line starts with another platform, and when a byArgument line starts with a word that is not a platform?'),
    'REQ-COMMAND-11': noul('Does buildDocs write the generated surface section into the reference page with withSurface, write each diagram to docs/diagrams/<name>.mmd, and remove a .mmd file that is no longer generated?'),
    'REQ-COMMAND-12': noul('With --check, does put add a problem instead of writing when a file differs from what the code would write, and does buildDocs exit 1 when there is any problem?'),
    'REQ-COMMAND-13': noul('Does buildDocs call mermaid.parse on every generated diagram and on every mermaid code block in the markdown files under docs, adding a problem when one throws?'),
    'REQ-COMMAND-14': noul('Does buildDocs add a problem when a command summary matches BROWSER_NAME, unless the named browser is the name of the command itself or it is camoufox on a camoufoxOnly command?'),
    unspecifiedBehavior: noul('Does the code let a one-platform command run without its platform first, or let the docs check pass a usage, flag or diagram the specification says it refuses, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-COMMAND-01': MET,
    'REQ-COMMAND-02': MET,
    'REQ-COMMAND-03': MET,
    'REQ-COMMAND-04': MET,
    'REQ-COMMAND-05': MET,
    'REQ-COMMAND-06': MET,
    'REQ-COMMAND-07': MET,
    'REQ-COMMAND-08': MET,
    'REQ-COMMAND-09': MET,
    'REQ-COMMAND-10': MET,
    'REQ-COMMAND-11': MET,
    'REQ-COMMAND-12': MET,
    'REQ-COMMAND-13': MET,
    'REQ-COMMAND-14': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
