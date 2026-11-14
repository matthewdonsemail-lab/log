import { createActor, toPromise } from 'xstate'
import type { InspectionEvent } from 'xstate'
import { postEngagerSummaryOf } from '../feed/index'
import type { EngagerSummary, NotificationStore, PostEngagerSummary } from '../feed/index'
import { notificationUnrollMachine } from './machine'
import type { UnrollDeps, UnrollInput, UnrollReport, UnrollRun } from './types'

export async function runNotificationUnroll(deps: UnrollDeps, input: UnrollInput, trace?: (event: InspectionEvent) => void): Promise<UnrollRun> {
  const actor = createActor(notificationUnrollMachine(deps), { input, ...(trace ? { inspect: trace } : {}) })
  const ended = toPromise(actor)
  actor.start()
  return ended
}

export function unrollReportOf(run: UnrollRun, store: NotificationStore | null): UnrollReport {
  const posts = run.posts.map((post) => postEngagerSummaryOf(store, post.postId))
  return { state: run.outcome, stoppedBeforeTheEnd: run.outcome !== 'done', stop: run.stop, pagesRead: run.pagesRead, posts }
}

function kindText(noun: string, summary: EngagerSummary): string {
  const state = summary.state === 'readToTheEnd' ? 'read to the end' : summary.state === 'stoppedBeforeTheEnd' ? `stopped before the end after ${summary.pages} page${summary.pages === 1 ? '' : 's'}, more left` : 'not unrolled'
  return `${noun} ${summary.fromNotifications} from notifications + ${summary.addedByUnroll} added by unrolling = ${summary.total} (${state})`
}

export function engagerLine(summary: PostEngagerSummary): string {
  return `  post ${summary.postId}: ${kindText('likers', summary.likes)}; ${kindText('reposters', summary.reposts)}`
}
