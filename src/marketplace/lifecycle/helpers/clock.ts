/**
 * The lifecycle's clock, outside the machine's context: the context is saved
 * and restored as JSON (XState's persisted snapshot, how the host resumes), so
 * it holds data only. Tests set `clock.now`.
 */
export const clock = { now: (): number => Date.now() }
