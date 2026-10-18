/**
 * The one id generator for the app. A generated id is an *opaque key* — it is
 * never derived from user input, a label, a timestamp, or any other field, so
 * no two rows can ever collide and no id encodes meaning. This consolidates
 * what was four copy-pasted `crypto.randomUUID`-with-fallback implementations
 * (`messaging/uuid`, `api/mock#apiKeyId`, `keywords/mock#keywordId`,
 * `connections/store#newAccountId`); those now delegate here.
 *
 * Real, **random** UUID v4. The v4-template fallback only engages where
 * `crypto.randomUUID` is unavailable (non-secure context) and still emits a
 * valid v4, so an id is never assembled from other data.
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