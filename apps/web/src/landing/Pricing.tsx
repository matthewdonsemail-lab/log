import { Link } from 'react-router-dom'
import { PLAN_CARDS } from '@/lib/plans'

/** The plans, on the landing page. Free is the real, enforced plan; Pro is announced only. */
export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="py-16 text-center sm:py-20">
      <h2 id="pricing-title" className="text-3xl font-black sm:text-4xl">Simple pricing</h2>
      <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">Start free. One of each, so you can see it work.</p>
      <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLAN_CARDS.map((plan) => (
          <div key={plan.id} className="flex flex-col rounded-2xl bg-white p-6 text-left text-slate-900 shadow-[0_6px_0_0_rgba(13,42,76,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold">{plan.name}</h3>
              {plan.badge ? <span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold uppercase text-[#1f6fe6]">{plan.badge}</span> : null}
            </div>
            <p className="mt-3"><span className="text-4xl font-black">{plan.price}</span> <span className="text-sm text-slate-500">{plan.period}</span></p>
            <p className="mt-2 text-sm text-slate-600">{plan.blurb}</p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2"><span aria-hidden className="text-[#2a8cff]">✓</span><span>{feature}</span></li>
              ))}
            </ul>
            {plan.href ? (
              <Link to={plan.href} className="mt-6 block rounded-xl bg-[#2A8CFF] px-4 py-3 text-center font-bold text-white shadow-[0_4px_0_0_#1F6FE6]">{plan.cta}</Link>
            ) : (
              <button type="button" disabled className="mt-6 block w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-center font-bold text-slate-500">{plan.cta}</button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
