import { localApi } from '@/lib/consoleMode'
import type { ConsoleSettings } from '../../../../../../src/console/settings/types'

export type { ConsoleSettings }

export function loadLocalSettings(signal?: AbortSignal): Promise<ConsoleSettings> {
  return localApi<ConsoleSettings>('/api/console/settings', signal)
}
