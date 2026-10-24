import { homeOf, localClock, outsideActiveHours } from '../home/index'
import { homePlace } from '../../facebook/marketplace/location/index'
import { OPENS_PER_DAY } from '../lifecycle/index'
import { LAUNCH_LIMITS, overLaunchBudget } from '../../browser/run/helpers/launchBudget'
import type { PreflightAccount, PreflightCheck, PreflightFacts, PreflightRow } from './types'

const pass = (name: PreflightCheck['name'], detail: string): PreflightCheck => ({ name, ok: true, detail })
const fail = (name: PreflightCheck['name'], code: string, detail: string): PreflightCheck => ({ name, ok: false, code, detail })

export function preflightOf(account: PreflightAccount, facts: PreflightFacts, now: Date, proxyLimitMs: number): PreflightRow {
  const checks: PreflightCheck[] = []
  const home = homeOf(account)
  if (!home.ok) {
    checks.push(fail('home', home.code, home.detail))
  } else {
    checks.push(pass('home', `${home.home.timezone}, ${home.home.locale}`))
    const place = homePlace(account)
    checks.push(place ? pass('location', `Marketplace location "${place}"`) : fail('location', 'noHomeRegion', `${account.homeCity ?? '?'} (${account.homeCountry ?? '?'}) has no state or province in CITY_REGIONS, so its Marketplace location can't be written out`))
    const closed = outsideActiveHours(account, home.home.timezone, now)
    checks.push(closed ? fail('hours', 'outsideActiveHours', closed) : pass('hours', `local ${localClock(now, home.home.timezone).label}`))
    const over = overLaunchBudget(facts.launches, now, home.home.timezone, LAUNCH_LIMITS)
    const today = localClock(now, home.home.timezone).date
    const launchedToday = facts.launches.filter((at) => localClock(at, home.home.timezone).date === today).length
    checks.push(over ? fail('launches', over.code, over.detail) : pass('launches', `${launchedToday} of ${LAUNCH_LIMITS.perDay} today`))
    const opens = facts.hostDay === today ? facts.hostOpensToday : 0
    checks.push(opens >= OPENS_PER_DAY ? fail('hostOpens', 'opensSpent', `the host opened the browser ${opens} times today, the most is ${OPENS_PER_DAY} (rule 35)`) : pass('hostOpens', `${opens} of ${OPENS_PER_DAY} today`))
  }
  if (!account.proxy) checks.push(fail('proxy', 'noProxy', 'no proxy in Twenty (rule 12)'))
  else if (!facts.proxy) checks.push(pass('proxy', 'not measured'))
  else if (!facts.proxy.ok) checks.push(fail('proxy', facts.proxy.code ?? 'proxyCheckFailed', facts.proxy.detail ?? 'the proxy check failed'))
  else if (facts.proxy.exitCountry && account.homeCountry && facts.proxy.exitCountry !== account.homeCountry.toUpperCase()) checks.push(fail('proxy', 'proxyWrongCountry', `exits in ${facts.proxy.exitCountry}, the account's home is ${account.homeCountry}`))
  else if (typeof facts.proxy.facebookMs === 'number' && facts.proxy.facebookMs > proxyLimitMs) checks.push(fail('proxy', 'proxyTooSlow', `${facts.proxy.facebookMs} ms for one Facebook file (limit ${proxyLimitMs} ms; --proxyMs sets it per run, rule 33)`))
  else checks.push(pass('proxy', `${facts.proxy.exitCountry ?? '?'}, ${facts.proxy.facebookMs ?? '?'} ms`))
  checks.push(account.adsPowerProfileId ? pass('adsPower', `profile ${account.adsPowerProfileId}`) : fail('adsPower', 'noAdsPowerProfile', 'no AdsPower profile linked (log adsPower sync --apply)'))
  if (!facts.kernel) checks.push(pass('kernel', 'no profile to start'))
  else if (!facts.kernel.reachable) checks.push(fail('kernel', 'adsPowerUnavailable', facts.kernel.detail ?? 'the AdsPower Local API does not answer'))
  else if (!facts.kernel.version) checks.push(fail('kernel', 'adsPowerKernelMissing', "the profile's user agent names no Chrome version, so the kernel it starts is unknown"))
  else if (!facts.kernel.downloaded) checks.push(fail('kernel', 'adsPowerKernelMissing', `SunBrowser ${facts.kernel.version}, the kernel this profile's user agent needs, is not downloaded${facts.kernel.detail ? ` (${facts.kernel.detail})` : ''}: --apply downloads it`))
  else checks.push(pass('kernel', `SunBrowser ${facts.kernel.version} ready (the profile's user agent)`))
  checks.push(facts.sessionPid ? fail('session', 'sessionOpen', `a live session holds the account (process ${facts.sessionPid}): log inspect do stop --account ${account.accountName}`) : pass('session', 'none open'))
  if (account.profilePhoto && facts.profilePhotoOnDisk === false) checks.push(fail('profilePhoto', 'profilePhotoMissing', `${account.profilePhoto} is not on this machine`))
  else checks.push(pass('profilePhoto', account.profilePhoto ? 'on disk' : 'none set'))
  return { accountName: account.accountName, homeCity: account.homeCity, checks, ready: checks.every((c) => c.ok) }
}

export function renderPreflight(rows: PreflightRow[]): string {
  const lines: string[] = []
  for (const row of rows) {
    lines.push(`${row.ready ? 'READY  ' : 'BLOCKED'} ${row.accountName} (${row.homeCity ?? '?'})`)
    for (const check of row.checks) lines.push(`  ${check.ok ? 'ok  ' : 'FAIL'} ${check.name.padEnd(12)} ${check.ok ? '' : `${check.code}: `}${check.detail}`)
  }
  const ready = rows.filter((r) => r.ready).length
  lines.push(`${ready} of ${rows.length} ready`)
  return lines.join('\n')
}
