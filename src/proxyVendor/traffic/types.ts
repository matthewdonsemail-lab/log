/**
 * Proxy traffic per account (matt, 2026-10-20: Reels ran 2Captcha's traffic
 * out, about 4.5 MB a reel). Each run's use, in MB, is measured on its proxy
 * provider's own counter (2Captcha's `use_flow`, Byteful's residential bytes) before and after, and kept in
 * `~/.logCli/proxyTraffic.jsonl`. An account may use `budgetMb` in any 24
 * hours (default 1024, 1 GB); a run that would pass it is refused before it
 * opens and stopped when it reaches it. A static IP is billed per IP with its
 * traffic included, so it isn't metered. The counter is the provider's for the
 * whole proxy account, so a run's figure includes anything else using it at
 * the same time.
 */
export interface TrafficEntry {
  at: string
  account: string
  /** The run that used it: `warmup facebook reel 20261020T082836`. */
  run: string
  mb: number
}

export interface TrafficBudget {
  budgetMb: number
  /** Used by the account in the 24 hours before `now`. */
  usedMb: number
  leftMb: number
}

/** The provider's used counter in MB, read on demand; injected in tests. */
export type TrafficMeter = () => Promise<number>
