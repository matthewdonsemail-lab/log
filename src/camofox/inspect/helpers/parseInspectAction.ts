import type { InspectAction } from '../types'

/** Each action and how many arguments it needs. */
const ARITY: Record<InspectAction, number> = { goto: 1, snapshot: 0, click: 1, type: 2, press: 1, solve: 0, upload: 2, signIn: 0, code: 0, back: 0, wait: 0, stop: 0, clickRole: 2, fillRole: 3, uploadRole: 3, waitRole: 2 }

/**
 * Actions that change something on Facebook: a click, typed text, a key, a
 * solved captcha sent, signing in. They need `--live` (rule 8), and over MCP matt's confirmLive.
 */
export const LIVE_ACTIONS: readonly InspectAction[] = ['click', 'type', 'press', 'solve', 'upload', 'signIn', 'code', 'clickRole', 'fillRole', 'uploadRole']

/** `["click", "e12"]` → the action and its args, or why not. Pure. */
export function parseInspectAction(argv: string[]): { ok: true; action: InspectAction; args: string[] } | { ok: false; error: string } {
  const [name, ...args] = argv
  if (!name || !(name in ARITY)) return { ok: false, error: `unknown action "${name ?? ''}" (one of ${Object.keys(ARITY).join(', ')})` }
  const action = name as InspectAction
  if (args.length < ARITY[action]) return { ok: false, error: `${action} needs ${ARITY[action]} argument(s)` }
  if (action === 'goto' && !/^https:\/\/([a-z0-9-]+\.)*facebook\.com(\/|$)/i.test(args[0])) return { ok: false, error: 'goto takes a https://*.facebook.com URL' }
  return { ok: true, action, args }
}
