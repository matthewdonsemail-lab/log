/** X has no gates: subscribe / unsubscribe, nothing else. */
export type XStateValue = 'unsubscribed' | 'subscribed' | 'observationWall'

export type XWallType = 'login' | 'unclassified'

export interface XContext {
  accountId: string | null
  accountIssue?: import('../../account-issues').AccountIssue
  wallType?: XWallType
  priorValue?: XStateValue | null
  /** True while the wall overwrites the membership (guards double-walls). */
  walled: boolean
}

export type XEvent =
  | { type: 'SUBSCRIBE'; accountId?: string | null; accountIssue?: XContext['accountIssue'] }
  | { type: 'UNSUBSCRIBE' }
  | { type: 'OBSERVE_WALL'; wallType: XWallType }

export interface XInput {
  accountId?: string | null
  accountIssue?: XContext['accountIssue']
}
