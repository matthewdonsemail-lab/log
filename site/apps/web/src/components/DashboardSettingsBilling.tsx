import { useMemo } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { planMineRef } from '@/lib/convex'
import { keywordsOnConvex } from '@/lib/live-keywords'
import { livePlanSchema, PLAN_CARDS, platformLabel, usageText } from '@/lib/plans'

const PLATFORMS = ['reddit', 'x', 'facebook'] as const

/** The person's plan and how much of it they use. Read-only: nothing here charges anything. */
export function DashboardSettingsBilling() {
  const { isAuthenticated } = useConvexAuth()
  const live = keywordsOnConvex()
  const data = useQuery(planMineRef, live && isAuthenticated ? {} : 'skip')
  const plan = useMemo(() => {
    const parsed = data === undefined ? null : livePlanSchema.safeParse(data)
    return parsed?.success ? parsed.data : null
  }, [data])
  const free = PLAN_CARDS[0]
  const pro = PLAN_CARDS[1]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Your plan: {plan?.name ?? free.name}</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">Current</span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">One of each at a time, on every platform. No card, no charge.</p>
        {plan ? (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="text-text-secondary">
                <th className="py-1 font-semibold">Platform</th>
                <th className="py-1 font-semibold">Phrases</th>
                <th className="py-1 font-semibold">Connected accounts</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORMS.map((platform) => (
                <tr key={platform} className="border-t border-slate-100">
                  <td className="py-2 font-semibold text-text-primary">{platformLabel(platform)}</td>
                  <td className="py-2">{usageText(plan.usage.phrases[platform] ?? 0, plan.limits.phrasesPerPlatform)}</td>
                  <td className="py-2">{usageText(plan.usage.accounts[platform] ?? 0, plan.limits.accountsPerPlatform)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="mt-3 list-disc pl-5 text-sm text-text-secondary">
            {free.features.slice(0, 2).map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        )}
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{pro.name} <span className="text-sm font-normal text-text-secondary">{pro.price} {pro.period}</span></h2>
          <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold uppercase text-[#1f6fe6]">{pro.badge}</span>
        </div>
        <ul className="mt-2 list-disc pl-5 text-sm text-text-secondary">
          {pro.features.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
        <p className="mt-3 text-sm text-text-secondary">Pro is not available yet, so there is nothing to buy.</p>
      </div>
    </div>
  )
}
