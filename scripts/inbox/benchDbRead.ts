#!/usr/bin/env bun
import { chatContextOf } from '../../src/inbox/context/index'
import { chatMessageCount, chatMessages, readSourceFor, userIdOfHandle } from '../../src/inbox/dbRead/index'
import { db } from '../../src/inbox/store/index'

const ROUNDS = Number(process.env.BENCH_ROUNDS) || 5
const pct = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b)
  return Math.round(sorted[Math.min(sorted.length - 1, Math.round((p / 100) * (sorted.length - 1)))] * 10) / 10
}
const summary = (ms: number[]) => ({ n: ms.length, p50: pct(ms, 50), p95: pct(ms, 95), p99: pct(ms, 99), p999: pct(ms, 99.9) })

const owners = db().prepare("SELECT platform, account FROM owners WHERE platform IN ('discord', 'twitter') AND status = 'streaming'").all() as { platform: string; account: string }[]
const report: Record<string, unknown> = {}
for (const { platform, account } of owners) {
  const sources: Record<string, number> = {}
  const ms: number[] = []
  if (platform === 'discord') {
    const chats = db().prepare("SELECT conversationId FROM events WHERE platform = 'discord' AND account = ? AND box = 'dm' AND type IN ('message', 'ownMessage') GROUP BY conversationId ORDER BY COUNT(*) DESC LIMIT 20").all(account) as { conversationId: string }[]
    for (let round = 0; round < ROUNDS; round++)
      for (const { conversationId } of chats) {
        const started = performance.now()
        const source = await readSourceFor(platform, account, conversationId, chatMessageCount(platform, account, conversationId), 20)
        if (source.from === 'db') chatMessages(platform, account, conversationId, 20)
        ms.push(performance.now() - started)
        if (!round) sources[source.from === 'db' ? `db (${source.reason})` : source.from === 'platform' ? `platform (${source.reason})` : 'refused'] = (sources[source.from === 'db' ? `db (${source.reason})` : source.from === 'platform' ? `platform (${source.reason})` : 'refused'] ?? 0) + 1
      }
  } else {
    const people = db().prepare("SELECT withWho FROM events WHERE platform = 'twitter' AND account = ? AND type = 'message' AND withWho NOT GLOB '[0-9]*' GROUP BY withWho ORDER BY COUNT(*) DESC LIMIT 20").all(account) as { withWho: string }[]
    for (let round = 0; round < ROUNDS; round++)
      for (const { withWho } of people) {
        const started = performance.now()
        const held = chatContextOf(platform, account, { handle: withWho, userId: userIdOfHandle(platform, account, withWho) })
        const source = await readSourceFor(platform, account, `with:${withWho.toLowerCase()}`, held.messages.length, 20)
        ms.push(performance.now() - started)
        const key = source.from === 'db' ? `db (${source.reason})` : source.from === 'platform' ? `platform (${source.reason})` : 'refused'
        if (!round) sources[key] = (sources[key] ?? 0) + 1
      }
  }
  report[`${platform} ${account}`] = { decided: sources, ms: summary(ms) }
}
console.log(JSON.stringify(report, null, 2))
