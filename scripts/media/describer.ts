import { assemblyAiTranscriber, loadDescriber, runDescriber } from '../../src/media/describer/index'
import { assemblyAiKey, createAssemblyAiClient } from '../../src/media/voiceNotes/client'
import { JINA_DIMENSIONS, JINA_EMBED_MODEL, jinaEmbedder } from '../../src/voice/aiTells/index'

const log = (line: string) => console.error(`${new Date().toISOString()} ${line}`)
const embedder = process.env.JINA_API_KEY ? jinaEmbedder() : null
if (!embedder) log('media describer: JINA_API_KEY is not set, so descriptions are stored without their vector')
const key = assemblyAiKey()
if (!key) log('media describer: no AssemblyAI key, so a video is described from its scenes without its sound')
const transcriber = key ? assemblyAiTranscriber(createAssemblyAiClient({ key })) : null
const run = await runDescriber({ load: async () => [await loadDescriber()], transcriber, ...(embedder ? { embed: (texts: string[]) => embedder.embed(texts), embedModel: { model: JINA_EMBED_MODEL, dimensions: JINA_DIMENSIONS } } : {}), log })
log(run.ok ? `media describer: stopped after describing ${run.described}` : `media describer: ${run.reason}`)
process.exit(run.ok ? 0 : 1)
