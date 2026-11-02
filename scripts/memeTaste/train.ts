import { createMemelordClient } from '../../src/extensions/memelord/index.ts'
import { createLlm, llmConfig, nicheMapPath, ratingsPath, readNicheMap, readTaste, startTrainer } from '../../src/extensions/memeTaste/index.ts'

const port = Number(process.env.MEME_TASTE_PORT) || 4747
const config = llmConfig()
if (!config) console.log('meme taste trainer: OPENAI_API_KEY, OPENAI_BASE_URL and OPENAI_ANALYSIS_MODEL are needed in .env.local')
const people = readNicheMap()
console.log(`meme taste trainer: ${people.length} niche map people with posts, from ${nicheMapPath()}`)
const server = startTrainer({ port, client: createMemelordClient(), llm: createLlm(config), taste: () => readTaste(), people, log: (line) => console.log(line) })
console.log(`meme taste trainer on http://127.0.0.1:${server.port} with ${config?.model ?? 'no model'}, ratings in ${ratingsPath()}`)
