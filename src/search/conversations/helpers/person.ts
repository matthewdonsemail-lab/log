import { dropMirrors, personKeyOf } from '../../../twitter/dm/person/index'
import type { Conversation } from '../types'

export function onePerPerson(conversations: readonly Conversation[]): Conversation[] {
  const groups = new Map<string, Conversation[]>()
  for (const c of conversations) {
    const key = `${c.platform}\u0000${c.account}\u0000${personKeyOf(c.conversationId)}`
    groups.set(key, [...(groups.get(key) ?? []), c])
  }
  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0]
    const first = group[0]
    return {
      ...first,
      conversationId: personKeyOf(first.conversationId),
      box: [...new Set(group.map((c) => c.box))].join('+'),
      with: [...new Set(group.flatMap((c) => c.with))],
      messages: dropMirrors(group.flatMap((c) => c.messages)),
    }
  })
}
