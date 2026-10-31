import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMemoryTwenty, pullLocalAccounts, readLocalAccounts, upsertLocalAccount, withLocalAccounts } from './helpers/index'
import { findAccount } from '../../marketplace/socialAccount/index'

function setup(only = false) {
  const path = join(mkdtempSync(join(tmpdir(), 'localAccounts')), 'localAccounts.json')
  const remote = createMemoryTwenty({
    socialAccounts: [
      { id: 't1', accountName: 'onTwenty', name: 'onTwenty', platform: 'DISCORD' },
      { id: 't2', accountName: 'both', name: 'both', platform: 'DISCORD' }
    ]
  })
  upsertLocalAccount({ accountName: 'both', platform: 'DISCORD', adsPowerProfileId: 'k1' }, path)
  upsertLocalAccount({ accountName: 'onlyLocal', platform: 'DISCORD' }, path)
  const env = { LOG_LOCAL_ACCOUNTS: path, ...(only ? { LOG_ACCOUNTS: 'local' } : {}) }
  return { path, remote, twenty: withLocalAccounts(remote, env) }
}

describe('withLocalAccounts', () => {
  test('an account only in the local file is found by its accountName, Twenty never having it', async () => {
    const { twenty } = setup()
    expect((await findAccount(twenty, 'onlyLocal')).id).toBe('local:discord:onlyLocal')
  })

  test('a local row wins over a Twenty row of the same accountName, so the lookup is not ambiguous', async () => {
    const { twenty } = setup()
    const account = await findAccount(twenty, 'both')
    expect(account.id).toBe('local:discord:both')
    expect(account.adsPowerProfileId).toBe('k1')
  })

  test('a session saved to a local account goes to the file and leaves Twenty alone', async () => {
    const { twenty, remote, path } = setup()
    await twenty.update('socialAccounts', 'local:discord:onlyLocal', { sessionState: 'loggedIn' })
    expect(readLocalAccounts(path).find((r) => r.id === 'local:discord:onlyLocal')?.sessionState).toBe('loggedIn')
    await twenty.update('socialAccounts', 't1', { sessionState: 'loggedOut' })
    expect((await remote.get('socialAccounts', 't1'))?.sessionState).toBe('loggedOut')
  })

  test('LOG_ACCOUNTS=local leaves Twenty out of accounts entirely', async () => {
    const { twenty } = setup(true)
    const names = (await twenty.list('socialAccounts')).map((r) => r.accountName).sort()
    expect(names).toEqual(['both', 'onlyLocal'])
    expect(await twenty.get('socialAccounts', 't1')).toBeNull()
  })

  test('pull copies every Twenty account in under its Twenty id, keeps one already local, and its updates then go to the file', async () => {
    const { twenty, remote, path } = setup()
    const pulled = await pullLocalAccounts(remote, {}, path)
    expect(pulled.added.map((r) => r.accountName)).toEqual(['onTwenty'])
    expect(pulled.kept.map((r) => r.accountName)).toEqual(['both'])
    expect((await findAccount(twenty, 'onTwenty')).id).toBe('t1')
    await twenty.update('socialAccounts', 't1', { sessionState: 'loggedIn' })
    expect(readLocalAccounts(path).find((r) => r.id === 't1')?.sessionState).toBe('loggedIn')
    expect((await remote.get('socialAccounts', 't1'))?.sessionState).toBeUndefined()
  })

  test('pull --refresh replaces a local copy with what Twenty has', async () => {
    const { remote, path } = setup()
    await pullLocalAccounts(remote, {}, path)
    await remote.update('socialAccounts', 't1', { sessionState: 'loggedOut' })
    const pulled = await pullLocalAccounts(remote, { refresh: true }, path)
    expect(pulled.refreshed.map((r) => r.accountName).sort()).toEqual(['both', 'onTwenty'])
    expect(readLocalAccounts(path).find((r) => r.id === 't1')?.sessionState).toBe('loggedOut')
  })
})
