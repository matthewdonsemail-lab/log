import { ERROR_CATALOG } from '../../../errors/catalog/index'
import type { ErrorEntry, PublishEnd } from '../../../errors/catalog/index'
import type { PublishFailure } from '../types'

export function publishEnd(failure: PublishFailure, publishClicked: boolean): { end: PublishEnd; failure: PublishFailure } {
  const entry: ErrorEntry = ERROR_CATALOG[failure.code]
  if (publishClicked && entry.layer === 'runtime' && entry.publish !== 'unconfirmedId') {
    const detail = failure.detail ? `${failure.code}: ${failure.detail}` : failure.code
    return { end: 'unconfirmedId', failure: { ...failure, code: 'crashedAfterPublish', detail } }
  }
  return { end: entry.publish ?? 'failed', failure }
}
