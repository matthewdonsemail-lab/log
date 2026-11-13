import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const listNames = args.includes('--names')
const denylistArg = args.indexOf('--denylist')
const denylistPath = denylistArg >= 0 ? args[denylistArg + 1] : join(homedir(), '.logCli', 'privacy', 'denylist.txt')
const targets = args.filter((a, i) => !a.startsWith('--') && (denylistArg < 0 || i !== denylistArg + 1))
const roots = (targets.length ? targets : ['docs/platforms']).map((t) => join(root, t))

const SECRET_KEYS = new Map(
  Object.entries({
    token: 'token', accesstoken: 'token', refreshtoken: 'token', authtoken: 'token', attempttoken: 'token', fbdtsg: 'token', lsd: 'token', jazoest: 'token',
    xfblsd: 'token', xcsrftoken: 'csrf', csrf: 'csrf', csrftoken: 'csrf', ct0: 'csrf',
    cookie: 'cookie', cookies: 'cookie', setcookie: 'cookie', authorization: 'token', xigwwwclaim: 'token', sessionid: 'cookie',
    cuser: 'userId', xs: 'cookie', datr: 'cookie', fr: 'cookie', sb: 'cookie', d: 'cookie', ds: 'cookie', dsuserid: 'userId', mid: 'cookie', igdid: 'cookie',
    encpassword: 'password', password: 'password', pass: 'password', passwd: 'password', secret: 'token', clientsecret: 'token', verifykey: 'token',
    logouthash: 'token', visitorcookie: 'cookie', redditsession: 'cookie', tokenv2: 'token', loid: 'cookie', edgebucket: 'cookie',
  }),
)
const EMAIL_KEYS = new Set(['email', 'email_address', 'emailAddress', 'contact_email'])
const PHONE_KEYS = new Set(['phone', 'phone_number', 'phoneNumber', 'mobile'])
const NAME_KEYS = new Set([
  'name', 'real_name', 'display_name', 'real_name_normalized', 'display_name_normalized', 'name_normalized', 'first_name', 'last_name', 'full_name', 'fullName',
  'username', 'global_name', 'screen_name', 'screenName', 'handle', 'author', 'author_name', 'short_name', 'prefixedName', 'nick', 'nickname', 'pronouns',
  'team_name', 'enterprise_name', 'workspace_name', 'skype', 'title_with_entities', 'profile_name', 'owner_name', 'sender_name', 'alternateName', 'given_name', 'family_name',
])
const PERSON_KEYS = new Set(['real_name', 'display_name', 'first_name', 'last_name', 'full_name', 'fullName', 'username', 'global_name', 'screen_name', 'screenName', 'handle', 'author', 'author_name', 'nick', 'nickname', 'given_name', 'family_name', 'sender_name', 'profile_name'])
const LOCATION_KEYS = new Map(Object.entries({ tz: 'timezone', tz_label: 'timezone', timezone: 'timezone', time_zone: 'timezone', country: 'country', country_code: 'country', city: 'city', postal_code: 'postcode', zip_code: 'postcode' }))
const TEXT_KEYS = new Set([
  'text', 'content', 'body', 'message', 'snippet', 'preview', 'selftext', 'bio', 'status_text', 'status_text_canonical', 'title', 'description', 'topic', 'purpose',
  'accessibility_caption', 'accessibilityLabel', 'fallback', 'plain_text', 'caption', 'comment', 'summary', 'last_message', 'lastMessage', 'note', 'about', 'headline',
])
const ID_KEYS = new Map(
  Object.entries({
    user: 'userId', user_id: 'userId', userID: 'userId', userId: 'userId', actor_id: 'userId', actorID: 'userId', author_id: 'userId', owner_id: 'userId', creator: 'userId',
    other_user_id: 'userId', parent_user_id: 'userId', profile_id: 'userId', profileID: 'userId', __user: 'userId', av: 'userId', sender_id: 'userId', senderId: 'userId',
    recipient_id: 'userId', viewerID: 'userId', viewer_id: 'userId', fbid: 'userId', pk: 'userId', pk_id: 'userId', obfuscated_account_id: 'userId', account_id: 'userId',
    guild_id: 'guildId', team: 'teamId', team_id: 'teamId', context_team_id: 'teamId', user_team: 'teamId', source_team: 'teamId', enterprise_id: 'teamId',
    groupID: 'groupId', group_id: 'groupId', channel_id: 'channelId', channel: 'channelId',
  }),
)
const KEEP_NAME = /^(content-disposition|content-type|accept|general|random|log|slack|discord|facebook|reddit|instagram|x|twitter|linkedin|marketplace|[a-z]+_[a-z_]+)$/i
const SAFE_NUMBER_CONTEXT = /(doc_?[iI][dD]|query_?[iI][dD]|queryID|app_?[iI][dD]|application_?[iI][dD]|client_?[iI][dD]|qpl|rev|__spin_r|__hs|version|build|experiment|config|hash)["'\s:=|`]*$/i
const STOP_NAMES = new Set(['matt', 'Matt', 'admin', 'Admin', 'user', 'User', 'test', 'Test', 'none', 'None', 'null', 'true', 'false', 'Facebook', 'Marketplace', 'Slack', 'Discord', 'Reddit', 'Instagram', 'LinkedIn', 'Twitter', 'general', 'random', 'Log', 'You', 'you', 'Anonymous', 'Deleted', 'deleted'])
const MEDIA_HOSTS = /https?:\/\/(?:avatars\.slack-edge\.com|secure\.gravatar\.com|[a-z0-9.-]*gravatar\.com|cdn\.discordapp\.com\/(?:avatars|attachments|banners|guilds)|media\.discordapp\.net\/attachments|files\.slack\.com|[a-z0-9-]+\.slack-files\.com|slack-files\.com|scontent[a-z0-9.-]*\.(?:fbcdn\.net|cdninstagram\.com)|[a-z0-9-]+\.cdninstagram\.com|[a-z0-9-]+\.fbcdn\.net|pbs\.twimg\.com\/profile_(?:images|banners)|styles\.redditmedia\.com|preview\.redd\.it|i\.redd\.it)[^\s"'`)<>\]|\\]*/g
const SLACK_ID = /(?<=^|[^A-Za-z0-9]|\\[rnt])([TUWCDGEBF])0[A-Z0-9]{7,11}(?![A-Za-z0-9])/g
const SLACK_KIND = { T: 'teamId', E: 'teamId', U: 'userId', W: 'userId', B: 'userId', C: 'channelId', D: 'channelId', G: 'channelId', F: 'fileId' }
const SLACK_HOSTS = new Set(['app', 'api', 'edgeapi', 'wssprimary', 'wssbackup', 'files', 'status', 'www', 'a', 'ca', 'b', 'slackb', 'join', 'slackimgs', 'downloads', 'help', 'docs'])
const normKey = (k) => (k.startsWith('_') ? k : k.toLowerCase().replace(/[-_]/g, ''))

function loadDenylist(path) {
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && l.length >= 3)
}

function harvestPeople(files) {
  const names = new Set()
  const re = /"([A-Za-z_]+)":\s*"((?:[^"\\]|\\.){2,80})"/g
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    for (const m of text.matchAll(re)) {
      if (!PERSON_KEYS.has(m[1])) continue
      const value = m[2].replace(/\\"/g, '"').trim()
      if (!value || value.startsWith('<') || STOP_NAMES.has(value)) continue
      if (value.length >= 3) names.add(value)
      for (const part of value.split(/\s+/)) if (part.length >= 4 && /^[A-Za-z][A-Za-z'-]+$/.test(part) && !STOP_NAMES.has(part)) names.add(part)
    }
  }
  return names
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function makeDoc() {
  const maps = new Map()
  const tag = (kind, value) => {
    if (!maps.has(kind)) maps.set(kind, new Map())
    const m = maps.get(kind)
    if (!m.has(value)) m.set(value, m.size + 1)
    return `<${kind}:${m.get(value)}>`
  }
  return { tag }
}

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function isPlaceholder(v) {
  return /^<[A-Za-z]+(:\d+)?>$/.test(v)
}

function redactValue(doc, key, value, platform) {
  if (!value || isPlaceholder(value)) return value
  const secret = SECRET_KEYS.get(normKey(key))
  if (secret === 'userId') return doc.tag('userId', value)
  if (secret) return `<${secret}>`
  if (EMAIL_KEYS.has(key)) return '<email>'
  if (LOCATION_KEYS.has(key)) return /[A-Za-z]/.test(value) ? `<${LOCATION_KEYS.get(key)}>` : value
  if (PHONE_KEYS.has(key)) return /\d/.test(value) ? '<phone>' : value
  if (ID_KEYS.has(key)) return /^[\w:.-]{3,}$/.test(value) && /\d/.test(value) ? doc.tag(ID_KEYS.get(key), value) : value
  if (NAME_KEYS.has(key)) {
    if (key === 'name' && KEEP_NAME.test(value)) return value
    if (key === 'name' && platform === 'facebook' && /^[A-Z][A-Za-z]+(?:[A-Z][a-z]+)+$/.test(value)) return value
    return doc.tag('name', value)
  }
  if (TEXT_KEYS.has(key)) {
    if (/^\s*[[{]/.test(value) || /^[\w%.-]+=[^&]*&[\w%.-]+=/.test(value)) return value
    if (/\b(error|exception|failed|invalid|not allowed|try again|rate limit|unauthori[sz]ed|forbidden|denied)\b/i.test(value) && !/[\w.%+-]+@[\w-]+\./.test(value)) return value
    if (wordCount(value) >= 4 || value.length >= 25) return '<messageText>'
    return value
  }
  if (key === 'domain' && platform === 'slack') return doc.tag('workspace', value)
  return value
}

function redactText(text, platform, denylist) {
  const doc = makeDoc()
  let t = text
  t = t.replace(/xox[a-z]-[A-Za-z0-9%\-]+/g, '<slackToken>')
  t = t.replace(/https?:\/\/[A-Za-z0-9.-]*trycloudflare\.com[^\s"'`)<>\]|\\]*/g, '<tunnelUrl>')
  t = t.replace(/[A-Za-z0-9-]+\.trycloudflare\.com/g, '<tunnelHost>')
  t = t.replace(/(opencode attach\s+\S+(?:\s+-u\s+)?)(\S+)?(\s+-p\s+)(\S+)/g, (_, a, u, p) => `${a}${u ? '<name:user>' : ''}${p}<password>`)
  t = t.replace(/(\|\s*pass(?:word)?\s*\|\s*)`?[^|\n\\]+?`?(\s*\|)/gi, '$1<password>$2')
  t = t.replace(/(\|\s*user\s*\|\s*)`[^`|\n]+`(\s*\|)/gi, '$1<name:user>$2')
  t = t.replace(/(:\/\/)([^\s:/@"'<>]+):([^\s@/"'<>]+)@/g, '$1<proxyUser>:<proxyPass>@')
  t = t.replace(MEDIA_HOSTS, (url) => (/avatar|gravatar|profile_/.test(url) ? '<avatarUrl>' : '<mediaUrl>'))
  t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, (m) => {
    const domain = m.split('@')[1].toLowerCase()
    if (/\.(png|jpe?g|webp|gif|svg|js|css|mjs|ts|json|map|woff2?)$/.test(domain)) return m
    if (domain === 'example.com' || domain.endsWith('.example.com')) return m
    return '<email>'
  })
  t = t.replace(/(?<![\w.])\+\d[\d ()-]{7,17}\d(?!\d)/g, '<phone>')
  t = t.replace(/(?<![\w./:-])((?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d)\.(?:25[0-5]|2[0-4]\d|1?\d?\d))(?![\w.])/g, (ip) => (/^(127\.|0\.0\.0\.0$|255\.)/.test(ip) ? ip : doc.tag('ip', ip)))
  t = t.replace(/\b(?:Asia|Europe|America|Africa|Australia|Pacific)\/[A-Z][A-Za-z_]+(?:\/[A-Z][A-Za-z_]+)?/g, '<timezone>')
  t = t.replace(/(\\?"(?:latitude|longitude|lat|lng|lon)\\?":\s*)-?\d+\.\d+/g, '$1"<coordinate>"')
  t = t.replace(/[A-Z]:(?:\\\\|\\|\/)Users(?:\\\\|\\|\/)[^\\/\s"'`]+/g, '~')
  t = t.replace(/\/home\/[a-z_][a-z0-9_-]*/g, '~')
  t = t.replace(/"([A-Za-z_][A-Za-z0-9_\-]*)":(\s*)"((?:[^"\\]|\\.)*)"/g, (m, key, sp, value) => `"${key}":${sp}"${redactValue(doc, key, value, platform)}"`)
  t = t.replace(/\\"([A-Za-z_][\w-]*)\\":(\s*)\\"((?:(?!\\").)*)\\"/g, (m, key, sp, value) => `\\"${key}\\":${sp}\\"${redactValue(doc, key, value, platform)}\\"`)
  t = t.replace(/name=\\+"([A-Za-z_][\w-]*)\\+"((?:\\r\\n){2})((?:(?!\\r\\n).)*)/g, (m, key, gap, value) => m.slice(0, m.length - value.length) + redactValue(doc, key, value, platform))
  t = t.replace(/([?&]|\b)([A-Za-z_][\w-]*)=([^&"\s\\`|<>]+)/g, (m, lead, key, value) => {
    const known = SECRET_KEYS.has(normKey(key)) || ID_KEYS.has(key) || EMAIL_KEYS.has(key) || PHONE_KEYS.has(key) || TEXT_KEYS.has(key) || NAME_KEYS.has(key)
    if (!known) return m
    return `${lead}${key}=${redactUrlValue(doc, key, value, platform)}`
  })
  t = t.replace(/\b(c_user|xs|datr|fr|sb|ct0|auth_token|d|d-s|sessionid|ds_user_id|csrftoken|reddit_session|token_v2|loid)=([^;"\s\\]+)/g, (m, key, value) => (isPlaceholder(value) ? m : `${key}=${redactValue(doc, key, value, platform)}`))
  if (platform === 'slack') {
    t = t.replace(SLACK_ID, (m, kind) => doc.tag(SLACK_KIND[kind], m))
    t = t.replace(/\b([a-z0-9][a-z0-9-]*)\.(enterprise\.)?slack\.com/g, (m, sub, ent) => (SLACK_HOSTS.has(normKey(sub)) ? m : `${doc.tag('workspace', sub)}.${ent ?? ''}slack.com`))
  }
  t = t.replace(/(?<![\w-])t2_[a-z0-9]{4,12}\b/g, (m) => doc.tag('userId', m))
  t = t.replace(/(?<!\d)(615\d{11}|1000\d{11})(?!\d)/g, (m) => doc.tag('userId', m))
  t = t.replace(/#PWD_[A-Z_]+:\d+:\d+:[A-Za-z0-9+/=]+/g, '<password>')
  t = t.replace(/("enc_password":\s*\{)([^{}]*)(\})/g, (m, open, inner, close) => `${open}${inner.replace(/"(?:[^"\\]|\\.)*"/g, '"<password>"')}${close}`)
  t = t.replace(/(?<![\w./#-])(\d{15,20})(?![\w])/g, (m, num, offset, whole) => {
    const before = whole.slice(Math.max(0, offset - 40), offset)
    if (SAFE_NUMBER_CONTEXT.test(before)) return m
    if (/^1[5-9]\d{11}$/.test(num) || /^17\d{11}$/.test(num)) return m
    return doc.tag('id', num)
  })
  const terms = [...denylist].filter((n) => n.length >= 3).sort((a, b) => b.length - a.length)
  for (const term of terms) {
    if (!t.includes(term)) continue
    const re = new RegExp(`(?<=^|[^A-Za-z0-9]|\\\\[rnt])${escapeRe(term)}(?![A-Za-z0-9])`, 'g')
    t = t.replace(re, () => (/^\d+$/.test(term) ? doc.tag('id', term) : term.includes('@') ? '<email>' : doc.tag('name', term)))
  }
  return t
}

function redactUrlValue(doc, key, value, platform) {
  const decoded = decodeURIComponentSafe(value.replace(/\+/g, ' '))
  const out = redactValue(doc, key, decoded, platform)
  return out === decoded ? value : out
}

function decodeURIComponentSafe(v) {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

function walk(dir) {
  if (!existsSync(dir)) return []
  if (statSync(dir).isFile()) return [dir]
  return readdirSync(dir).flatMap((n) => walk(join(dir, n)))
}

const files = roots.flatMap(walk).filter((f) => /\.(md|jsonl?|txt|mmd)$/.test(f) && !/operations\.json$/.test(f))
const denylist = loadDenylist(denylistPath)
if (listNames) {
  for (const n of [...harvestPeople(files)].sort()) console.log(n)
  process.exit(0)
}
const changed = []
for (const file of files) {
  const rel = relative(root, file).replace(/\\/g, '/')
  const platform = rel.split('/')[2] ?? ''
  const before = readFileSync(file, 'utf8')
  const after = redactText(before, platform, denylist)
  if (after !== before) {
    changed.push(rel)
    if (!checkOnly) writeFileSync(file, after)
  }
}
console.log(`redactDocs: ${changed.length} of ${files.length} file(s) ${checkOnly ? 'would change' : 'redacted'}; ${denylist.length} denylist term(s)`)
if (checkOnly && changed.length) {
  for (const c of changed.slice(0, 50)) console.log(`  ${c}`)
  process.exit(1)
}
