const BARE_ID = /^@?(?:\d{4,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
const SLACK_ID = /^[UWB](?=[A-Z0-9]*\d)[A-Z0-9]{8,}$/

export function isBareId(label: string | null | undefined): boolean {
  return !label || BARE_ID.test(label.trim()) || SLACK_ID.test(label.trim())
}

export function chatIdOf(platform: string, account: string, conversationId: string): string {
  return `${platform}:${account}:${conversationId}`
}

export function selfIdOf(account: string): string {
  return `self:${account}`
}

export function handleIdOf(handle: string): string {
  return `@${handle.replace(/^@/, '')}`
}

export function textOf(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : typeof value === 'number' ? String(value) : null
}

const OWNER_LABELS = new Set(['me', 'you', ''])

export function isOwnerLabel(label: string | null | undefined): boolean {
  return OWNER_LABELS.has(String(label ?? '').trim().toLowerCase())
}
