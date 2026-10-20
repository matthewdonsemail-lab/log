/**
 * Proxy traffic per account (matt, 2026-10-20: Reels ran 2Captcha's traffic
 * out, about 4.5 MB a reel). Each run's use, in MB, is measured on 2Captcha's
 * own counter (`use_flow`, MB) before and after, and kept in
 * `~/.logCli/proxyTraffic.jsonl`. An account may use `budgetMb` in any 24
 * hours (default 1024, 1 GB); a run that would pass it is refused before it
 * opens and stopped when it reaches it. The counter is 2Captcha's for the
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

/** 2Captcha's used counter in MB, read on demand; injected in tests. */
export type TrafficMeter = () => Promise<number>
