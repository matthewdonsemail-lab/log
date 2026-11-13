import { localApi } from '@/lib/consoleMode'
import type { ConsoleAiClients } from '../../../../../../src/console/aiClients/types'

export type { ConsoleAiClients }

export function loadLocalAiClients(signal?: AbortSignal): Promise<ConsoleAiClients> {
  return localApi<ConsoleAiClients>('/api/console/aiClients', signal)
}
