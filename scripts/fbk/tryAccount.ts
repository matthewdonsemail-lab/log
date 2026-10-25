import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createTwentyClient } from '../../src/twenty/graphql/client.ts'
import { findAccount } from '../../src/marketplace/socialAccount/client.ts'

async function main(): Promise<number> {
  const name = process.argv[2]
  if (!name) {
    process.stderr.write('usage: tryAccount.ts <accountName>\n')
    return 1
  }
  const twenty = createTwentyClient()
  const account = await findAccount(twenty, name)
  if (!account.proxy) {
    process.stderr.write(`${account.accountName}: no proxy in Twenty; refusing (a wrong-country exit burns it)\n`)
    return 1
  }
  const secrets = await twenty.loginSecrets(account.id)
  if (!secrets?.email || !secrets.password) {
    process.stderr.write(`${account.accountName}: no email/password in Twenty\n`)
    return 1
  }
  process.stderr.write(`${account.accountName} (${account.homeCity}, ${account.homeCountry}): running through fbk via its own proxy\n`)
  const dir = mkdtempSync(join(tmpdir(), 'fbkTry'))
  const spec = join(dir, 'spec.json')
  writeFileSync(spec, JSON.stringify({ account: account.accountName, proxy: account.proxy, email: secrets.email, password: secrets.password, totpSecret: secrets.totpSecret }), { mode: 0o600 })
  const py = process.env.LOG_PYTHON || 'python'
  const code = await new Promise<number>((resolve) => {
    const p = spawn(py, [join(import.meta.dir, '..', '..', 'python', 'directApi', 'fbkTry.py'), spec], { stdio: 'inherit' })
    p.on('close', (c) => resolve(c ?? 1))
  })
  rmSync(dir, { recursive: true, force: true })
  return code
}

main().then((c) => process.exit(c))
