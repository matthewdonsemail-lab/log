import { platformStateRoot, twitterStateRoot } from "../../../directApi/engine/index.ts";
import { replaceHungOwners } from "../../../inbox/relay/index.ts";
import { codeStamp, coolingDown, ensureLiveWatchers, stopStaleWatchers, twitterAccounts } from "../../../inbox/watch/index.ts";
import { startWatcher, superviseWatchers, watcherHeld } from "../client.ts";
import type { SuperviseDeps, WatcherPlatform, WatcherSupervision } from "../types.ts";

export function stateRootOf(platform: WatcherPlatform): string {
  return platform === "twitter" ? twitterStateRoot() : platformStateRoot(platform);
}

export function signedInAccounts(platform: WatcherPlatform): string[] {
  return twitterAccounts(stateRootOf(platform));
}

export function localSuperviseDeps(repo: string): SuperviseDeps {
  return {
    accounts: signedInAccounts,
    coolingDown: (platform, account) => coolingDown(stateRootOf(platform), account),
    start: (platform, account) => startWatcher(platform, account, repo),
    replaceHung: (platform, accounts) => replaceHungOwners(platform, accounts),
    stopStale: (platform, accounts) => stopStaleWatchers(platform, accounts, codeStamp(repo, platform)),
    ensure: (platform, accounts, start) => ensureLiveWatchers(platform, accounts, start),
    held: (platform, account) => watcherHeld(platform, account),
  };
}

export function superviseLocalWatchers(repo: string, filter: { platform?: WatcherPlatform; account?: string } = {}): WatcherSupervision {
  return superviseWatchers(localSuperviseDeps(repo), filter);
}
