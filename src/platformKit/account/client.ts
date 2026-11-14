import type { ConnectionRecord } from './types'

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
    lastIssue: 'proxyUnreachable',
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

export function listAccounts(): ConnectionRecord[] {
  return FACEBOOK_ACCOUNTS.map((row) => ({ ...row }))
}
