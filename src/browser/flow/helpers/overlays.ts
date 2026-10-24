import { pageStateOf } from './pageState'
import type { AnswerExpect, FlowAction } from '../types'

export interface OverlayClear {
  id: string
  key: string
  answers: AnswerExpect[]
}

export const OVERLAY_CLEARS: Readonly<Record<string, OverlayClear>> = {
  browserNotificationsNotice: { id: 'browserNotificationsNotice', key: 'Escape', answers: [] },
  pastNoticeDialog: {
    id: 'pastNoticeDialog',
    key: 'Escape',
    answers: [{ call: 'useAccountStatusClearEnrollmentEntryPointActionMutation', says: [{ answer: 'data.xfb_ixt_gateway_clear_flow', is: true }] }]
  }
}

export const PRESSING_ACTIONS: ReadonlySet<FlowAction> = new Set(['click', 'fill', 'upload'])

export function overlayOf(url: string, text: string): OverlayClear | null {
  const state = pageStateOf(url, text)
  return state ? OVERLAY_CLEARS[state.id] ?? null : null
}
