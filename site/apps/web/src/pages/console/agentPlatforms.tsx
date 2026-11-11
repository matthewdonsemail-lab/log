export type AgentPlatform = 'claudeCode' | 'codex' | 'claude' | 'grokBot' | 'hermes' | 'cursor' | 'openClaw' | 'openCode' | 'pi' | 'antigravity'

type AgentPlatformDefinition = {
  id: AgentPlatform
  label: string
  logo: string
  darkLogo?: string
  theme: 'dark' | 'light' | 'paper'
}

export const agentPlatforms: AgentPlatformDefinition[] = [
  { id: 'claudeCode', label: 'Claude Code', logo: 'claudeCode.svg', theme: 'dark' },
  { id: 'codex', label: 'Codex', logo: 'chatgpt.svg', theme: 'light' },
  { id: 'claude', label: 'Claude', logo: 'claude-desktop.svg', theme: 'paper' },
  { id: 'grokBot', label: 'Grok Bot', logo: 'grokBot.svg', theme: 'light' },
  { id: 'hermes', label: 'Hermes Agent', logo: 'hermesAgent.png', theme: 'dark' },
  { id: 'cursor', label: 'Cursor', logo: 'cursor.svg', theme: 'light' },
  { id: 'openClaw', label: 'OpenClaw', logo: 'openClaw.svg', theme: 'light' },
  { id: 'openCode', label: 'OpenCode', logo: 'openCode.svg', darkLogo: 'openCodeLight.svg', theme: 'dark' },
  { id: 'pi', label: 'Pi', logo: 'pi.svg', theme: 'dark' },
  { id: 'antigravity', label: 'Antigravity', logo: 'antigravity.svg', theme: 'light' },
]

export function getAgentPlatform(platform: AgentPlatform) {
  return agentPlatforms.find((item) => item.id === platform) ?? agentPlatforms[0]
}

export function AgentPlatformLogo({ platform, className = '', dark = false }: { platform: AgentPlatform; className?: string; dark?: boolean }) {
  const selected = getAgentPlatform(platform)
  const logo = dark && selected.darkLogo ? selected.darkLogo : selected.logo
  return <img src={`/logos/tools/${logo}`} alt="" className={`${platform === 'openCode' ? 'h-5 w-4' : 'size-5'} shrink-0 object-contain ${className}`} />
}
