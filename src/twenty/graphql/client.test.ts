import { describe, expect, test } from 'bun:test'
import { createTwentyClient } from './client'

const ENV = { TWENTY_BASE_URL: 'https://twenty.test', TWENTY_API_KEY: 'k' }

/** A fetch that drops the socket `drops` times, then answers `data`. Counts calls. */
function flaky(drops: number, data: unknown) {
  let calls = 0
  const fetchImpl = (async () => {
    calls++
    if (calls <= drops) throw new TypeError('The socket connection was closed unexpectedly.')
    return new Response(JSON.stringify({ data }), { headers: { 'Content-Type': 'application/json' } })
  }) as unknown as typeof fetch
  return { fetchImpl, calls: () => calls }
}

describe('createTwentyClient', () => {
  test('a dropped connection on an update is retried, so a sign-in is never lost to it', async () => {
    const net = flaky(1, { updateSocialAccount: { id: 'a1' } })
    const row = await createTwentyClient(ENV, net.fetchImpl).update('socialAccounts', 'a1', { statusReason: 'connected' })
    expect(row).toMatchObject({ id: 'a1' })
    expect(net.calls()).toBe(2)
  })

  test('a create is never retried: a second write could make the row twice', async () => {
    const net = flaky(1, { createAgencyListing: { id: 'l1' } })
    await expect(createTwentyClient(ENV, net.fetchImpl).create('agencyListings', { title: 'x' } as never)).rejects.toMatchObject({ code: 'twentyUnreachable' })
    expect(net.calls()).toBe(1)
  })
})
