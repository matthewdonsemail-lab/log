import type { AgentToolCallData } from '../../components/ai-elements/agentToolCall'
import { PLATFORM_SESSIONS } from '../../landing/useCases/platformSessions'

export function getPlayToolCalls(platform: string): AgentToolCallData[] {
  const session = PLATFORM_SESSIONS[platform.toLowerCase()]
  if (session) return session.events.filter((event): event is Extract<typeof event, { kind: 'tool' }> => event.kind === 'tool').slice(0, 3)
  const guide = platform === 'Facebook' ? 'facebookMarketplace' : 'linkedin'
  return [
    { name: 'getGuide', args: JSON.stringify({ topic: guide }), result: [`${platform}: review conversation context before drafting.`] },
    { name: 'search', args: JSON.stringify({ query: `${platform} conversations waiting for a reply` }), result: ['Found recent conversations in your workspace.', 'Read the full thread before preparing a reply.'] },
    { name: 'voice', args: '{ context: "conversation history", text: "draft reply" }', result: ['Draft checked against the conversation and your voice.', 'Ready for your review.'] },
  ]
}
