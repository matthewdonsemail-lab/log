import { SCAN_RULES } from '../rules/index.ts'
import type { PrivacyRuleName } from '../rules/index.ts'
import type { FixedKind, KeyKind, NumberedKind, Redactor } from './types.ts'

export type { FixedKind, KeyKind, NumberedKind, Redactor } from './types.ts'

const KEY_KINDS: Record<string, KeyKind> = {
  password: 'password',
  pass: 'password',
  passwd: 'password',
  pwd: 'password',
  encpassword: 'password',
  csrf: 'csrfToken',
  csrftoken: 'csrfToken',
  xcsrftoken: 'csrfToken',
  ct0: 'csrfToken',
  fbdtsg: 'csrfToken',
  lsd: 'csrfToken',
  jazoest: 'csrfToken',
  cookie: 'cookie',
  cookies: 'cookie',
  verifykey: 'token',
  fingerprint: 'token',
  xfingerprint: 'token',
  setcookie: 'cookie',
  token: 'token',
  accesstoken: 'token',
  authtoken: 'token',
  refreshtoken: 'token',
  idtoken: 'token',
  authorization: 'token',
  session: 'token',
  sessionid: 'token',
  sessiontoken: 'token',
  xs: 'token',
  datr: 'token',
  secret: 'token',
  clientsecret: 'token',
  apikey: 'token',
  userid: 'userId',
  user: 'userId',
  av: 'userId',
  uid: 'userId',
  cuser: 'userId',
  twid: 'userId',
  restid: 'userId',
  profileid: 'userId',
  ownerid: 'userId',
  senderid: 'userId',
  authorid: 'userId',
  viewerid: 'userId',
  memberid: 'userId',
  recipientid: 'userId',
  participantid: 'userId',
  targetid: 'userId',
  fromid: 'userId',
  actorid: 'actorId',
  accountid: 'accountId',
  id: 'id',
  name: 'name',
  firstname: 'name',
  lastname: 'name',
  fullname: 'name',
  displayname: 'name',
  realname: 'name',
  shortname: 'name',
  globalname: 'name',
  authorname: 'name',
  sendername: 'name',
  profilename: 'name',
  username: 'username',
  screenname: 'username',
  handle: 'username',
  login: 'username',
  vanity: 'username',
  email: 'email',
  emailaddress: 'email',
  phone: 'phone',
  phonenumber: 'phone',
  mobile: 'phone',
  text: 'messageText',
  message: 'messageText',
  messagetext: 'messageText',
  content: 'messageText',
  snippet: 'messageText',
  caption: 'messageText',
  fulltext: 'messageText',
  preview: 'messageText',
  msg: 'messageText',
}

const NUMBERED = new Set<KeyKind>(['userId', 'actorId', 'accountId', 'id', 'name', 'username'])

const RULE_PLACEHOLDERS: Partial<Record<PrivacyRuleName, string>> = {
  slackToken: '<slackToken>',
  encPassword: '<password>',
  sessionCookie: '<token>',
  nostrSecret: '<nostrKey>',
  aiApiKey: '<apiKey>',
  githubToken: '<githubToken>',
  privateKey: '<privateKey>',
  urlCredentials: '<password>',
  cloudflareTunnel: '<tunnelId>',
  trycloudflareCredentials: '<tunnelUrl>',
  bearerToken: '<token>',
  tailnetHost: '<tailnetHost>',
  tailnetIp: '<ip>',
  publicIp: '<ip>',
  homePath: '<user>',
  windowsUserPath: '<name>',
  email: '<email>',
  phone: '<phone>',
}

const PLACEHOLDER = /^<[A-Za-z]+(:\d+)?>$/

export const keyKindOf = (key: string): KeyKind | undefined => KEY_KINDS[key.toLowerCase().replace(/[^a-z0-9]/g, '')]

const JSON_PAIR = /"([A-Za-z_][\w.-]*)"(\s*:\s*)("(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?)/g
const ESCAPED_JSON_PAIR = /\\"([A-Za-z_][\w.-]*)\\"(\s*:\s*)(\\"(?:[^"\\]|\\[^"])*\\"|-?\d+)/g
const FORM_PAIR = /(^|[?&;,\s])([A-Za-z_][\w.-]*)=([^&;,\s"'<>]*)/g
const HEADER_LINE = /^(\s*(?:[-*]\s+)?)(authorization|cookie|set-cookie|x-csrf-token|x-csrftoken)(\s*:\s*)(.+)$/gim

const PATTERN_RULES = SCAN_RULES.filter((rule) => RULE_PLACEHOLDERS[rule.name]).map((rule) => ({
  rule,
  pattern: new RegExp(rule.pattern.source, rule.pattern.flags.includes('d') ? rule.pattern.flags : `${rule.pattern.flags}d`),
  placeholder: RULE_PLACEHOLDERS[rule.name] as string,
}))

const escapeTerm = (term: string): string => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function createRedactor(options: { byKeys?: boolean; denylist?: string[] } = {}): Redactor {
  const numbering = new Map<NumberedKind, Map<string, number>>()
  const placeholderFor = (kind: KeyKind, value: string): string => {
    if (!NUMBERED.has(kind)) return `<${kind as FixedKind}>`
    const seen = numbering.get(kind as NumberedKind) ?? new Map<string, number>()
    numbering.set(kind as NumberedKind, seen)
    if (!seen.has(value)) seen.set(value, seen.size + 1)
    return `<${kind}:${seen.get(value)}>`
  }
  const keep = (value: string) => value === '' || value === 'null' || PLACEHOLDER.test(value)

  const redactPair = (key: string, raw: string, quote: string): string | null => {
    const kind = keyKindOf(key)
    if (!kind) return null
    const quoted = raw.startsWith(quote) && raw.endsWith(quote) && raw.length >= quote.length * 2
    const value = quoted ? raw.slice(quote.length, raw.length - quote.length) : raw
    if (keep(value)) return null
    return quoted || quote === '' ? `${quote}${placeholderFor(kind, value)}${quote}` : `"${placeholderFor(kind, value)}"`
  }

  const byKeys = (text: string): string =>
    text
      .replace(HEADER_LINE, (whole, lead: string, key: string, sep: string, value: string) => (keep(value.trim()) ? whole : `${lead}${key}${sep}<${keyKindOf(key) ?? 'token'}>`))
      .replace(JSON_PAIR, (whole, key: string, sep: string, raw: string) => {
        const next = redactPair(key, raw, '"')
        return next === null ? whole : `"${key}"${sep}${next}`
      })
      .replace(ESCAPED_JSON_PAIR, (whole, key: string, sep: string, raw: string) => {
        const next = redactPair(key, raw, '\\"')
        return next === null ? whole : `\\"${key}\\"${sep}${next}`
      })
      .replace(FORM_PAIR, (whole, lead: string, key: string, raw: string) => {
        const kind = keyKindOf(key)
        if (!kind || kind === 'messageText' || keep(raw)) return whole
        return `${lead}${key}=${placeholderFor(kind, raw)}`
      })

  const byPatterns = (line: string): string => {
    let out = line
    for (const { rule, pattern, placeholder } of PATTERN_RULES) {
      if (rule.lineMustMatch && !rule.lineMustMatch.test(out)) continue
      if (rule.lineSkip?.test(out)) continue
      const edits: [number, number][] = []
      for (const match of out.matchAll(pattern)) {
        const group = rule.value ?? 0
        const value = match[group]
        const span = match.indices?.[group]
        if (!value || !span || PLACEHOLDER.test(value)) continue
        if (rule.allowed?.(value, { allowedEmails: new Set() })) continue
        edits.push(span)
      }
      for (const [start, end] of edits.reverse()) out = `${out.slice(0, start)}${placeholder}${out.slice(end)}`
    }
    return out
  }

  const terms = [...new Set(options.denylist ?? [])].filter((term) => term.length >= 3).sort((a, b) => b.length - a.length)
  const byDenylist = (text: string): string => {
    let out = text
    for (const term of terms) {
      if (!out.includes(term)) continue
      const pattern = new RegExp(`(?<=^|[^A-Za-z0-9]|\\\\[rnt])${escapeTerm(term)}(?![A-Za-z0-9])`, 'g')
      out = out.replace(pattern, () => (/^\d+$/.test(term) ? placeholderFor('id', term) : term.includes('@') ? '<email>' : placeholderFor('name', term)))
    }
    return out
  }

  return {
    redact: (text: string) => byDenylist((options.byKeys === false ? text : byKeys(text)).split('\n').map(byPatterns).join('\n')),
  }
}

export const redactDoc = (text: string, denylist: string[] = []): string => createRedactor({ denylist }).redact(text)

export const redactPatterns = (text: string): string => createRedactor({ byKeys: false }).redact(text)
