import { db } from '../../inbox/store'
import { projectUsageSummary } from './helpers'

export function readUsageSummary(fromMs: number, toMs = Date.now()) {
  return projectUsageSummary(db(), fromMs, toMs)
}
