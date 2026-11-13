import { playReminder, sessionPlayOf, transcriptTail } from '../session/index'
import { readUseCase } from '../../mcp/server/helpers/guides.ts'
import { isPrompt, outcomeOf, playMatchText } from '../../useCases/router/client'
import type { PlayMatch } from '../../useCases/router/types'
import type { HookInput, HookResult } from './types'

export type RouteFn = (prompt: string) => Promise<{ play?: PlayMatch | null; menu?: PlayMatch[]; skipped?: string } | null>

export async function hookAnswer(input: HookInput, route: RouteFn): Promise<HookResult> {
  const event = input.hook_event_name ?? 'UserPromptSubmit'
  if (event === 'SessionStart') {
    const play = sessionPlayOf(transcriptTail(input.transcript_path ?? ''))
    const page = play ? readUseCase(play.id) : null
    return play && page ? { event, text: playReminder(play, page), outcome: `reinjected ${play.id}` } : { event, text: '', outcome: 'noPlay' }
  }
  const prompt = String(input.prompt ?? '')
  if (!isPrompt(prompt)) return { event, text: '', outcome: 'notAPrompt' }
  const answer = await route(prompt)
  if (!answer) return { event, text: '', outcome: 'serviceTimeout' }
  const play = answer.play ?? null
  const menu = answer.menu ?? []
  return { event, text: playMatchText(play ? [play] : [], menu), outcome: answer.skipped ?? outcomeOf({ play, menu }), ...(menu.length && !play ? { menu: menu.map((m) => m.id) } : {}) }
}

export function hookOutput(result: HookResult): string {
  return result.text ? JSON.stringify({ hookSpecificOutput: { hookEventName: result.event, additionalContext: result.text } }) : ''
}
