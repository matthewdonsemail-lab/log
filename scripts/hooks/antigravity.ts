#!/usr/bin/env bun
import { join } from 'node:path'
import { answerEvent } from '../../src/agentHooks/answers/index'
import { chatNameVerdict } from '../../src/agentHooks/chatNames/index'
import { liveLogVerdict } from '../../src/agentHooks/liveLog/index'
import { askRoute, readService, startService } from '../../src/contextLayer/service/index'

const repo = join(import.meta.dir, '..', '..')
const raw = await Bun.stdin.text().catch(() => '')

let event = process.argv[2] ?? ''
let input: Record<string, unknown> = {}
try {
  input = JSON.parse(raw || '{}') as Record<string, unknown>
} catch {
  input = {}
}

if (!event) {
  event = typeof input.event === 'string' ? input.event : 'PreInvocation'
}

const service = readService()
if (!service) startService(repo)

const route = (prompt: string) => askRoute(prompt, service)

if (event === 'SessionStart') {
  const answered = await answerEvent('SessionStart', raw, repo, route)
  const additionalContext = answered.body?.hookSpecificOutput?.additionalContext
  const output = {
    injectSteps: additionalContext
      ? [
          {
            systemMessage: {
              systemMessage: additionalContext,
            },
          },
        ]
      : [],
  }
  process.stdout.write(JSON.stringify(output))
} else if (event === 'PreInvocation') {
  const prompt = typeof input.lastUserInput === 'string' ? input.lastUserInput : ''
  const payload = JSON.stringify({ hook_event_name: 'UserPromptSubmit', prompt })
  const answered = await answerEvent('UserPromptSubmit', payload, repo, route)
  const additionalContext = answered.body?.hookSpecificOutput?.additionalContext
  const output = {
    injectSteps: additionalContext
      ? [
          {
            ephemeralMessage: additionalContext,
          },
        ]
      : [],
  }
  process.stdout.write(JSON.stringify(output))
} else if (event === 'PreToolUse') {
  const toolCall = (input.toolCall ?? {}) as { name?: string; args?: Record<string, unknown> }
  const toolName = toolCall.name ?? ''
  const args = toolCall.args ?? {}

  if (toolName === 'run_command' || toolName === 'Bash' || toolName === 'PowerShell') {
    const cmd = String(args.CommandLine ?? args.command ?? '')
    const verdict = liveLogVerdict(toolName, cmd)
    if (verdict.deny) {
      process.stdout.write(JSON.stringify({ decision: 'deny', reason: verdict.deny }))
      process.exit(0)
    }
  }

  const chatVerdict = chatNameVerdict(toolName, args)
  if (chatVerdict.deny) {
    process.stdout.write(JSON.stringify({ decision: 'deny', reason: chatVerdict.deny }))
    process.exit(0)
  }

  process.stdout.write(JSON.stringify({ decision: 'allow' }))
} else if (event === 'PostToolUse') {
  const toolCall = (input.toolCall ?? {}) as { name?: string; args?: Record<string, unknown> }
  const toolName = toolCall.name ?? ''
  const payload = JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: toolName, tool_input: toolCall.args })
  await answerEvent('PostToolUse', payload, repo, route)
  process.stdout.write(JSON.stringify({}))
} else if (event === 'Stop') {
  const answered = await answerEvent('Stop', raw, repo, route)
  if (answered.body?.decision === 'block') {
    const reason = typeof answered.body.reason === 'string' ? answered.body.reason : 'A browser sits on a state log-cli can resolve (rule 54).'
    process.stdout.write(JSON.stringify({ decision: 'continue', reason }))
  } else {
    process.stdout.write(JSON.stringify({ decision: 'allow' }))
  }
} else {
  process.stdout.write(JSON.stringify({}))
}
