import { useSelectedTeam, useWorkspaces } from '@/lib/controlApi'
import { localConsole } from '@/lib/consoleMode'
import { workspaceStateOf, type WorkspaceState } from './ConsoleLayout'
import type { ConsoleTarget } from './consoleClient'

export function useConsoleTarget(): { target: ConsoleTarget | null; workspaceState: WorkspaceState } {
  const { team } = useSelectedTeam()
  const workspaces = useWorkspaces(localConsole ? null : team?.id ?? null)
  if (localConsole) return { target: { kind: 'local' }, workspaceState: 'ready' }
  const workspaceState = workspaceStateOf(workspaces.data, workspaces.isError)
  return { target: team && workspaceState === 'ready' ? { kind: 'hosted', teamId: team.id } : null, workspaceState }
}
