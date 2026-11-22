import { localEngineStates, platformStateRoot } from '../../directApi/engine/client'
import { PLATFORMS } from '../../cli/runner/helpers/platforms'

export function signedInAccounts(env: Record<string, string | undefined> = process.env, now: Date = new Date()): Set<string> {
  const out = new Set<string>()
  for (const platform of PLATFORMS) {
    for (const state of localEngineStates(platformStateRoot(platform), now)) {
      if (state.sessionState === 'loggedIn') out.add(`${platform}:${state.account}`.toLowerCase())
    }
  }
  void env
  return out
}
