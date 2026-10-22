export interface TrafficEntry {
  at: string
  account: string
  run: string
  mb: number
}

export interface TrafficBudget {
  budgetMb: number
  usedMb: number
  leftMb: number
}

export type TrafficMeter = () => Promise<number>
