import { isBareId } from '../../inbox/store/client'

export const CHAT_ARGUMENTS = ['channel', 'chat', 'with'] as const

export interface ChatNameVerdict {
  deny?: string
}

export function chatNameVerdict(toolName: string, input: Record<string, unknown>): ChatNameVerdict {
  const tool = toolName.replace(/^mcp__log__/, '')
  if (!/^(discord|slack|instagram)/.test(tool)) return {}
  for (const key of CHAT_ARGUMENTS) {
    const value = input[key]
    if (typeof value === 'string' && value.trim() && isBareId(value.trim())) {
      return { deny: `${tool}: "${key}" is an id (${value.trim()}), so matt can't see where this goes. Pass the chat by its name, the way he says it: a person ("ace"), a group ("log"), or a server channel as "<server> #<channel>" ("pennyserver #general"). The tool turns the name into the id itself (rule 154).` }
    }
  }
  return {}
}
