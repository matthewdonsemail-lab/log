#!/usr/bin/env bun
import '../../src/config/userEnv/autoload.ts'
import { defaultDbPath, openDatabase } from '../../src/storage/schema/index'
import { factStream } from '../../src/people/facts/index'
import { runGraphOwner } from '../../src/relate/owner/index'

const stamp = () => new Date().toISOString()
let stopped = false
process.on('SIGTERM', () => { stopped = true })
process.on('SIGINT', () => { stopped = true })
const log = (line: string) => console.log(`${stamp()} ${line}`)
const outcome = await runGraphOwner({ dbPath: defaultDbPath(), log, stopped: () => stopped, facts: factStream(openDatabase(defaultDbPath()), { log }) })
console.log(`${stamp()} graph owner: ${outcome.ok ? `stopped (${outcome.reason}) after ${outcome.batches} batches` : `${outcome.code}: ${outcome.reason}`}`)
process.exit(outcome.ok ? 0 : outcome.code === 'graphOwnerRunning' ? 3 : 1)
