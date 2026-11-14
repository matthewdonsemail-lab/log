import type { AllowContext, PrivacyRule } from './types.ts'

export type { AllowContext, PrivacyRule, PrivacyRuleName } from './types.ts'

export const PUBLIC_X_WEB_BEARER_PREFIX = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs'

export const FORBIDDEN_PATHS = ['log/', 'ruleHistory/', 'docs/infra/', 'docs/identityLeaks/', 'docs/deviceIsolation/', 'docs/vendors/', 'media/personas/', 'RESEARCH/']

export const SKIPPED_PATHS = /(^|\/)(vendor|node_modules)\//

export const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|mp3|mp4|m4a|wav|ogg|opus|webm|mov|avi|mkv|pdf|zip|gz|tgz|7z|rar|whl|woff2?|ttf|otf|eot|exe|dll|so|dylib|node|wasm|onnx|bin|db|sqlite|pyc|har)$/i

const DUMMY_WORDS = /^(x+|\*+|\.+|-+|0+|1+|pass(word)?|secret|changeme|dummy|fake|example|redacted|placeholder|token|value|test|user(name)?|you(r[a-z]*)?|me|name|admin|root|runner|public|default|runneradmin|all users)$/i
const DUMMY_INSIDE = /example|placeholder|redacted|dummy|fake|your[_-]?|changeme|xxxx|\.\.\.|…/i
const TEMPLATED = /^[<{$%[]|[>}\]]$/

export function isDummy(value: string): boolean {
  const bare = value.replace(/^["'`]|["'`]$/g, '')
  if (!bare) return true
  if (TEMPLATED.test(bare) || DUMMY_WORDS.test(bare) || DUMMY_INSIDE.test(bare)) return true
  return new Set(bare.toLowerCase()).size <= 2
}

const ALLOWED_EMAIL_DOMAINS = /@((?:[a-z0-9-]+\.)*example\.(com|org|net)|users\.noreply\.github\.com|localhost|(?:your)?company\.com|(?:your)?domain\.com|[a-z0-9.-]+\.(test|invalid|example|localhost))$/i
const FILE_EXTENSION_TLD = /\.(png|jpe?g|gif|webp|svg|js|mjs|cjs|ts|tsx|css|json|md|html?|py|ya?ml|txt|lock|map|wasm)$/i

const DUMMY_USER = /^(user(name)?|you(r[a-z]*)?|me|name|runner|runneradmin|public|default|all users|example|someone|root)$/i

export function isDummyUser(value: string): boolean {
  return DUMMY_USER.test(value) || /^[<{$%]/.test(value)
}

export function isAllowedEmail(email: string, allowedEmails: ReadonlySet<string>): boolean {
  const lower = email.toLowerCase()
  if (allowedEmails.has(lower)) return true
  if (ALLOWED_EMAIL_DOMAINS.test(lower) || FILE_EXTENSION_TLD.test(lower)) return true
  if (/^(no-?reply|git)@/.test(lower)) return true
  return isDummy(lower.split('@')[0]) && /example|test|invalid/.test(lower)
}

export function ipv4Octets(ip: string): number[] | null {
  const parts = ip.split('.').map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN))
  return parts.length === 4 && parts.every((n) => n >= 0 && n <= 255) ? parts : null
}

export function isTailnetIp(ip: string): boolean {
  const o = ipv4Octets(ip)
  return !!o && o[0] === 100 && o[1] >= 64 && o[1] <= 127
}

export function isNonPublicOrDocumentationIp(ip: string): boolean {
  const o = ipv4Octets(ip)
  if (!o || ip === '1.2.3.4') return true
  const [a, b, c] = o
  if (a === 0 || a === 10 || a === 127 || a >= 224) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 192 && b === 0 && c === 2) return true
  if (a === 198 && b === 51 && c === 100) return true
  if (a === 203 && b === 0 && c === 113) return true
  if (a === 255) return true
  return false
}

const DUMMY_PHONE = /^\+?(1?555\d+|0+|1234567\d*|(\d)\2{6,})$/

const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi

const IPV4 = /(?<![\w.-])(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?!\d|\.\d|-)/g

const SVG_PATH = /<path\b|\sd="[Mm]/

export const SCAN_RULES: PrivacyRule[] = [
  { name: 'slackToken', pattern: /\bxox[abcdpr]-[A-Za-z0-9%-]{10,}/g },
  { name: 'encPassword', pattern: /enc_password["']?\s*[:=]\s*["']?([^\s"'&,;}<]{6,})/g, value: 1, allowed: isDummy },
  {
    name: 'sessionCookie',
    pattern: /(?<![\w-])["']?(?:auth_token|ct0|c_user|xs|sessionid)["']?\s*[:=]\s*["']?([^\s"'&,;}<>|`()[\]]{6,})/g,
    value: 1,
    allowed: (value) => isDummy(value) || /^[A-Za-z_]+$/.test(value),
  },
  {
    name: 'sessionCookie',
    pattern: /"name"\s*:\s*"(?:auth_token|ct0|c_user|xs|sessionid)"\s*,\s*"value"\s*:\s*"([^"]{6,})"/g,
    value: 1,
    allowed: isDummy,
  },
  { name: 'nostrSecret', pattern: /\bnsec1[02-9ac-hj-np-z]{20,}/g },
  { name: 'aiApiKey', pattern: /(?<![\w-])sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g, allowed: isDummy },
  { name: 'githubToken', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/g },
  { name: 'privateKey', pattern: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g },
  { name: 'urlCredentials', pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/'"<>`]+:([^\s@/'"<>`]+)@[^\s/'"<>`]+/gi, value: 1, allowed: isDummy },
  { name: 'cloudflareTunnel', pattern: UUID, lineMustMatch: /tunnel/i },
  { name: 'trycloudflareCredentials', pattern: /\bhttps?:\/\/(?:[^\s/@'"<>`]+@[a-z0-9-]+\.trycloudflare\.com|[a-z0-9-]+\.trycloudflare\.com\/?[^\s'"<>`]*[?&](?:token|key|secret|password|auth)=[^\s&'"<>`]+)/gi },
  {
    name: 'bearerToken',
    pattern: /\bBearer\s+([A-Za-z0-9._~+/%-]{20,}=*)/g,
    value: 1,
    allowed: (value) => value.startsWith(PUBLIC_X_WEB_BEARER_PREFIX) || isDummy(value),
  },
  { name: 'tailnetHost', pattern: /\b(?:[a-z0-9-]+\.)+ts\.net\b/gi, allowed: (value) => /example|your-?/i.test(value) },
  { name: 'tailnetIp', pattern: IPV4, value: 1, lineSkip: SVG_PATH, allowed: (value) => !isTailnetIp(value) || value === '100.64.0.0' },
  { name: 'publicIp', pattern: IPV4, value: 1, lineSkip: SVG_PATH, allowed: (value) => isTailnetIp(value) || isNonPublicOrDocumentationIp(value) },
  { name: 'homePath', pattern: /(?<![\w.~-])\/home\/([a-z_][a-z0-9_.-]*)\//gi, value: 1, allowed: isDummyUser },
  { name: 'windowsUserPath', pattern: /\b[A-Za-z]:(?:\\{1,2}|\/)Users(?:\\{1,2}|\/)([^\\/\s"'<>`%$*|]+)/gi, value: 1, allowed: isDummyUser },
  {
    name: 'email',
    pattern: /(?:(?<=mailto:)|(?<![\w.+%:-]))[A-Za-z0-9][A-Za-z0-9._%+-]*@(?=[A-Za-z0-9-]*[A-Za-z])[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b/g,
    allowed: (value, context: AllowContext) => isAllowedEmail(value, context.allowedEmails),
  },
  { name: 'phone', pattern: /(?<![\w+/=.-])\+[1-9]\d{7,14}(?![\d.])/g, allowed: (value) => DUMMY_PHONE.test(value) },
  { name: 'linkedinProfile', pattern: /(?<=\/in\/|memberIdentity:|vanityName:|publicIdentifier:)([A-Za-z0-9][A-Za-z0-9%_-]{2,99})(?=[/?#"'`\s)|]|$)/g, value: 1, allowed: (value) => isDummy(value) || isDummyUser(value) || /^(publicId|profile|handle|me|someone(-[a-z]+)?)$/i.test(value) || /doe\d*$/i.test(value) || /[A-Z]/.test(value) },
  { name: 'linkedinMemberId', pattern: /(?:(?<=%3A)|(?<![A-Za-z0-9_-]))ACoA[A-Za-z0-9_-]{20,}/g, allowed: (value) => /^ACoA(?:x+|X+|0+)$/.test(value) },
]
