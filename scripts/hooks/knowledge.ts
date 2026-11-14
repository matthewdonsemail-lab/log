#!/usr/bin/env bun
import { kbConfig } from '../../src/knowledge/base/index'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'

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
const reach = 'missing' in config ? `not set up on this machine (${config.missing})` : count === null ? 'not reachable right now (the KB_TWENTY_URL host)' : `${count} indexed chunks`
const text = `log-cli knowledge base: every AGENTS.md rule, skill, doc, infra note, memory file, page state, account and agent note, kept in Twenty and searched through Redis, ${reach}. The MCP tools read it: \`kbSearch\` { query } finds what an earlier session found or how something works, \`kbShow\` { key } reads one entry, and \`kbRemember\` { text } saves what this session learns, never a secret.`
process.stdout.write(contextOutput(event, text, hookHostOf(process.argv)))
