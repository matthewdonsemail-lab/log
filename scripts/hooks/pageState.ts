#!/usr/bin/env bun
/**
 * Claude Code hook (rule 54): after every tool call (PostToolUse) and every
 * prompt (UserPromptSubmit), read the latest step of every open inspect
 * session, match its page against the known states (`pageStateOf`) and put the
 * state and what resolves it into the agent's context (`additionalContext`),
 * so a known state (a checkpoint, a captcha, a prompt) is resolved, never a
 * reason to stop. After a tool call it speaks only when a session's state is
 * new; on a prompt it always says where each open browser is. Reads only the
 * session's own files; never prints a snapshot's typed values (they are
 * redacted already) or anything from Twenty.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { openInspects } from '../../src/camofox/inspect/index'
import { pageStateOf } from '../../src/camofox/flow/helpers/pageState'

interface HookInput {
  hook_event_name?: string
}

const raw = await Bun.stdin.text().catch(() => '')
let input: HookInput = {}
try {
  input = JSON.parse(raw || '{}') as HookInput
} catch {
  input = {}
}
const event = input.hook_event_name ?? 'PostToolUse'

const seenPath = join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.logCli', 'runs', 'inspect', 'hookState.json')
let seen: Record<string, string> = {}
try {
  seen = JSON.parse(readFileSync(seenPath, 'utf8')) as Record<string, string>
} catch {
  seen = {}
}

const lines: string[] = []
for (const session of openInspects()) {
  const stepsDir = join(session.runDir, 'steps')
  if (!existsSync(stepsDir)) continue
  const last = readdirSync(stepsDir).filter((d) => /^\d+_/.test(d)).sort().pop()
  if (!last) continue
  const snapshotPath = join(stepsDir, last, 'snapshot.yml')
  const text = existsSync(snapshotPath) ? readFileSync(snapshotPath, 'utf8') : ''
  // The step's URL from the session's replies (the last one with this step's folder).
  let url = ''
  try {
    const replies = readFileSync(session.repliesPath ?? join(session.runDir, 'replies.jsonl'), 'utf8').trim().split('\n').reverse()
    for (const line of replies) {
      const reply = (JSON.parse(line) as { result?: { step?: string; url?: string } }).result
      if (reply?.step === last && reply.url) {
        url = reply.url
        break
      }
    }
  } catch {
    // No replies yet: the snapshot alone decides.
  }
  const state = pageStateOf(url, text)
  const key = `${session.account}`
  const mark = `${last}:${state?.id ?? 'none'}`
  if (event !== 'UserPromptSubmit' && seen[key] === mark) continue
  seen[key] = mark
  if (!state) {
    if (event === 'UserPromptSubmit') lines.push(`${session.account}: open browser on ${url || 'a page'} (step ${last}), no known blocking state.`)
    continue
  }
  lines.push(`${session.account}: page state **${state.id}**: ${state.what} (step ${last}, ${url}). ${state.person ? 'Only a person can clear it: stop this account and tell matt.' : 'Known state, resolve it, do not stop:'} ${state.resolve}.`)
}
writeFileSync(seenPath, JSON.stringify(seen))

if (lines.length) {
  const context = ['log-cli page state (rule 54, scripts/hooks/pageState.ts):', ...lines.map((l) => `- ${l}`)].join('\n')
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: context } }))
}
