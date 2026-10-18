/**
 * The account data boundary. Today it serves the three Facebook rows of the
 * dashboard's connections seed (listeningkit-hackathon
 * apps/web/src/lib/connections/mock.ts `MOCK_CONNECTIONS`), with the same ids
 * and issues. When the live facebook-camofox-client lands, point these reads
 * at it; the shapes stay the same.
 */
import type { ConnectionRecord } from './types'

/** The Facebook accounts the Marketplace feed is published from. */
const FACEBOOK_ACCOUNTS: ConnectionRecord[] = [
  {
    id: 'fbGalwayRubbish',
    platform: 'facebook',
    label: 'Galway Rubbish Co',
    connectedAt: '2026-09-10T09:02:00+00:00'
  },
  {
    id: 'fbPacer',
    platform: 'facebook',
    label: 'Pacer Marketplace',
    connectedAt: '2026-09-11T17:40:00+00:00',
    lastIssue: 'proxy_unreachable',
    rawSignal: { marker: 'ECONNREFUSED 203.0.113.42:8080' },
    lastCheckedAt: '2026-09-14T06:30:00+00:00'
  },
  {
    id: 'fbPersonal',
    platform: 'facebook',
    label: 'Facebook',
    connectedAt: '2026-09-12T08:15:00+00:00',
    lastIssue: 'checkpointed',
    rawSignal: { code: 190, subcode: 459 },
    lastCheckedAt: '2026-09-14T07:05:00+00:00'
  },
]

/** Every Facebook account, as fresh copies so callers can't mutate the source rows. */
export function listAccounts(): ConnectionRecord[] {
  return FACEBOOK_ACCOUNTS.map((row) => ({ ...row }))
}
