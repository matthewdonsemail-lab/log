#!/usr/bin/env bun
import '../../src/config/userEnv/autoload.ts'
import { defaultDbPath, openDatabase } from '../../src/storage/schema/index'
import { factStream } from '../../src/people/facts/index'
import { botBackfillStream, defaultBotSources } from '../../src/people/bots/index'
import { indexStream } from '../../src/indexPass/index'
import { runGraphOwner } from '../../src/relate/owner/index'

const stamp = () => new Date().toISOString()
let stopped = false
process.on('SIGTERM', () => { stopped = true })
process.on('SIGINT', () => { stopped = true })
const log = (line: string) => console.log(`${stamp()} ${line}`)
const handle = openDatabase(defaultDbPath())
const bots = botBackfillStream(handle, { log, sources: () => defaultBotSources({ handle }) })
const outcome = await runGraphOwner({ dbPath: defaultDbPath(), log, stopped: () => stopped, facts: factStream(handle, { log }), pass: indexStream(handle, { log }), bots })
console.log(`${stamp()} graph owner: ${outcome.ok ? `stopped (${outcome.reason}) after ${outcome.batches} batches` : `${outcome.code}: ${outcome.reason}`}`)
process.exit(outcome.ok ? 0 : outcome.code === 'graphOwnerRunning' ? 3 : 1)
