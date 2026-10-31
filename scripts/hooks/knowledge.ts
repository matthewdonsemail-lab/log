#!/usr/bin/env bun
import { kbConfig } from '../../src/knowledge/base/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'SessionStart'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

async function chunkCount(url: string): Promise<number | null> {
  const redis = new Bun.RedisClient(url, { connectionTimeout: 3000, autoReconnect: false })
  try {
    const info = (await Promise.race([redis.send('FT.INFO', ['kbIdx']), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))])) as Record<string, unknown>
    return Number(info.num_docs ?? NaN)
  } catch {
    return null
  } finally {
    redis.close()
  }
}

const config = kbConfig()
const count = 'missing' in config ? null : await chunkCount(config.redisUrl)
const reach = 'missing' in config ? `not set up on this machine (${config.missing})` : count === null ? 'not reachable right now (node02 over the tailnet)' : `${count} indexed chunks`
const text = `log-cli knowledge base (rule 93): every AGENTS.md rule, skill, doc, infra note, Claude memory file, page state, account and agent note, in ListeningKit's Twenty and searched through Redis, ${reach}. Before guessing how something works, where a login lives or what an earlier session found, run \`log kb search "<query>"\` (MCP kbSearch) and \`log kb show <key>\`; save what this session learns with \`log kb remember "<text>"\`, never a secret.`
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
