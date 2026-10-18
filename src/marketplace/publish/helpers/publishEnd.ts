import { ERROR_CATALOG } from '../../../errors/catalog/index'
import type { ErrorEntry, PublishEnd } from '../../../errors/catalog/index'
import type { PublishFailure } from '../types'

/**
 * Where a publish run ends for a failure, read from the error catalog. Pure.
 *
 * One exception the catalog can't know from the code alone: a runtime failure
 * (a crash, the session dying) after Publish was clicked may have posted the
 * listing. It becomes `crashedAfterPublish`, which ends in `unconfirmedId`, so
 * nobody re-publishes a live listing. Form codes after the click
 * (`publishNotFound`, `rejected`) are certain and stay as they are.
 */
export function publishEnd(failure: PublishFailure, publishClicked: boolean): { end: PublishEnd; failure: PublishFailure } {
  const entry: ErrorEntry = ERROR_CATALOG[failure.code]
  if (publishClicked && entry.layer === 'runtime' && entry.publish !== 'unconfirmedId') {
    const detail = failure.detail ? `${failure.code}: ${failure.detail}` : failure.code
    return { end: 'unconfirmedId', failure: { ...failure, code: 'crashedAfterPublish', detail } }
  }
  return { end: entry.publish ?? 'failed', failure }
}
