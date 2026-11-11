import { useQuery, useQueryClient } from '@tanstack/react-query'

export type Role = 'owner' | 'admin' | 'member'
export type TeamView = { id: string; name: string; slug: string; role: Role }
export type SessionView = { user: { id: string; email: string; emailVerified: boolean }; teams: TeamView[]; selectedTeamId: string | null; expiresAt: string }
export type AuthChallengeView = { challengeId: string; expiresAt: string; retryAfterSeconds: number }
export type WorkspaceStatus = 'pending' | 'connecting' | 'ready' | 'offline' | 'incompatible' | 'revoked'
export type WorkspaceView = { id: string; provider: 'ownCloud' | 'boat'; status: WorkspaceStatus; selected: boolean; lastContactAt: string | null; capabilities: Record<string, unknown> | null; browserConnection: unknown }
export type PairingView = { id: string; token: string; expiresAt: string; workspaceId: string }
export type MemberView = { id: string; userId: string; email: string; role: Role; status: 'active' | 'revoked' }
export type InviteView = { id: string; email: string; role: Role; expiresAt: string; status: 'pending' | 'accepted' | 'revoked' | 'expired' }
export type AccountView = { id: string; platform: string; account: string; displayName: string | null; status: string; sessionState: string | null; browserLocation: string | null; revision: number }
export type GrantView = { id: string; clientName: string; userId: string; teamId: string; scopes: string[]; revokedAt: string | null }
export type ConsentRequestView = { id: string; clientName: string; redirectHost: string; scopes: string[]; resource: string; expiresAt: string; teams: TeamView[]; selectedTeamId: string | null }

export class ControlError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfterSeconds?: number) {
    super(message)
  }
}

const BASE = '/api/v1'
export const HOSTED_MCP_URL = 'https://mcp.listeningkit.com/mcp'
export const PLATFORM_SETUP_COMMAND = 'log launch --setup'

const MESSAGES: Record<string, string> = {
  invalidInput: 'Check what you typed and try again.',
  unauthenticated: 'Sign in to continue.',
  forbidden: 'You do not have access to that.',
  expiredChallenge: 'That code expired. Ask for a new one.',
  invalidCode: 'That code is not right. Check the email and try again.',
  tooManyAttempts: 'Too many tries. Wait a moment and ask for a new code.',
  inviteExpired: 'This invite was used, withdrawn or has expired.',
  inviteWrongEmail: 'Sign in with the address the invite was sent to.',
  lastOwnerRequired: 'A team needs at least one owner.',
  deliveryFailed: 'The email could not be sent. Try again in a moment.',
  workspaceOffline: 'Your workspace is offline. Start log runtime connect in it.',
  workspaceNotSelected: 'Set up a workspace first.',
  conflict: 'That changed or is taken. Refresh and try again.',
  providerUnavailable: 'That provider is not available yet.',
}

function csrfToken(): string {
  const match = document.cookie.split('; ').find((part) => part.startsWith('logCsrf='))
  return match ? decodeURIComponent(match.slice('logCsrf='.length)) : ''
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const method = init.method ?? 'GET'
  const headers: Record<string, string> = { accept: 'application/json' }
  if (init.body !== undefined) headers['content-type'] = 'application/json'
  if (method !== 'GET') headers['x-csrf-token'] = csrfToken()
  const response = await fetch(`${BASE}${path}`, { method, headers, body: init.body === undefined ? undefined : JSON.stringify(init.body), credentials: 'same-origin', cache: 'no-store', signal: init.signal })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const code = String(data.code ?? `http${response.status}`)
    throw new ControlError(response.status, code, data.safeMessage ?? MESSAGES[code] ?? 'Something went wrong. Try again.', data.retryAfterSeconds)
  }
  return data as T
}

export function errorText(error: unknown): string {
  if (error instanceof ControlError) return error.code === 'tooManyAttempts' && error.retryAfterSeconds ? `${error.message} (${error.retryAfterSeconds}s)` : error.message
  return 'Could not reach the server. Check your connection and try again.'
}

export function safeReturnPath(path: string | null): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\') || path.includes('://')) return null
  return /^\/(teams|console|verify)/.test(path) ? path : null
}

export const sessionKey = ['controlSession'] as const

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: async ({ signal }) => {
      try {
        return await api<SessionView>('/session', { signal })
      } catch (error) {
        if (error instanceof ControlError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 30_000,
    retry: false,
  })
}

export function useSelectedTeam() {
  const session = useSession()
  const team = session.data?.teams.find((item) => item.id === session.data?.selectedTeamId) ?? null
  return { session, team }
}

export function useWorkspaces(teamId: string | null) {
  return useQuery({
    queryKey: ['controlWorkspaces', teamId],
    queryFn: ({ signal }) => api<WorkspaceView[]>(`/teams/${teamId}/workspaces`, { signal }),
    enabled: Boolean(teamId),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })
}

export function useResetPrivate() {
  const client = useQueryClient()
  return () => {
    client.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] })
  }
}
