import { db } from '../../inbox/store'
import { projectConsoleEvents } from './helpers'

export function readConsoleEvents() {
  return projectConsoleEvents(db())
}
