/**
 * A UUID v4 in the live client's shape — `crypto.randomUUID()` when available,
 * with a v4 hex-template fallback for non-secure contexts where the method is
 * absent (mirrors `apiKeyId`/`keywordId`). Shared by the messaging seed
 * fixtures and the runtime store so seeded ids and runtime ids are minted the
 * same way. A leaf module (imports nothing) so fixtures can use it without
 * importing the store that loads them.
 */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16)
    return (char === 'x' ? rand : (rand & 0x3) | 0x8).toString(16)
  })
}