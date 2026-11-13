import { localApi } from '@/lib/consoleMode'
import type { ConsoleStart } from '../../../../../../src/console/start/types'

export type { ConsoleStart }

export function loadLocalStart(signal?: AbortSignal): Promise<ConsoleStart> {
  return localApi<ConsoleStart>('/api/console/start', signal)
}
