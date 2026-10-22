import { describe, expect, test } from 'bun:test'
import { createTwentyClient } from './client'

const ENV = { TWENTY_BASE_URL: 'https://twenty.test', TWENTY_API_KEY: 'k' }

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

  const LIMITED = { errors: [{ message: 'Limit reached (100 tokens per 60000 ms)' }] }
  function limited(times: number, data: unknown) {
    let calls = 0
    const fetchImpl = (async () => {
      calls++
      const body = calls <= times ? LIMITED : { data }
      return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
    }) as unknown as typeof fetch
    return { fetchImpl, calls: () => calls }
  }

  test("Twenty's rate limit is waited out and the save goes through, never read as a bad API key", async () => {
    const net = limited(1, { updateSocialAccount: { id: 'a1' } })
    const row = await createTwentyClient(ENV, net.fetchImpl, 1).update('socialAccounts', 'a1', { statusReason: 'connected' })
    expect(row).toMatchObject({ id: 'a1' })
    expect(net.calls()).toBe(2)
  })

  test('a rate-limited create is retried too (it was refused whole), and it gives up after two waits', async () => {
    const ok = limited(2, { createAgencyListing: { id: 'l1' } })
    expect(await createTwentyClient(ENV, ok.fetchImpl, 1).create('agencyListings', { title: 'x' } as never)).toMatchObject({ id: 'l1' })
    const stuck = limited(9, {})
    await expect(createTwentyClient(ENV, stuck.fetchImpl, 1).update('socialAccounts', 'a1', {})).rejects.toMatchObject({ code: 'twentyRateLimited' })
    expect(stuck.calls()).toBe(3)
  })
})
