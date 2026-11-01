import { useEffect, useRef, useState } from 'react'

const PLAN_ID = 'plan_mfRXqGBMpZ4Jx'
const SCRIPT = 'https://cdn.whop.com/elements/amber/elements.js'

type WhopCheckout = {
  create: (el: 'checkout', props?: Record<string, unknown>) => { mount: (target: string | HTMLElement) => void }
  destroy: () => void
}

declare global {
  interface Window {
    WhopElements?: () => { checkout: { create: (options: Record<string, unknown>) => WhopCheckout } }
    dataLayer?: Array<Record<string, unknown>>
  }
}

const INK = '#0d2a4c'
const LINE = '#d4e8ff'
const APPEARANCE = {
  classes: {
    'whop-CheckoutDetails': { display: 'none' },
    'whop-EmailLabel': { color: INK, fontWeight: '700', fontSize: '15px' },
    'whop-CheckoutRequirementLabel': { color: INK, fontWeight: '700', fontSize: '15px' },
    'whop-EmailInput': { border: `2px solid ${LINE}`, borderRadius: '8px', fontSize: '16px', color: INK },
    'whop-CheckoutRequirementInput': { border: `2px solid ${LINE}`, borderRadius: '8px', fontSize: '16px', color: INK },
    'whop-CheckoutPayButton': {
      background: '#2a8cff',
      borderRadius: '6px',
      fontWeight: '900',
      fontSize: '17px',
      textTransform: 'uppercase',
      letterSpacing: '.8px',
      boxShadow: '0 4px 0 #1f68c0',
    },
  },
}

function loadScript(): Promise<void> {
  if (window.WhopElements) return Promise.resolve()
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
  const s = existing ?? Object.assign(document.createElement('script'), { src: SCRIPT })
  if (!existing) {
    s.setAttribute('data-whop-elements', '')
    document.head.appendChild(s)
  }
  return new Promise((resolve, reject) => {
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('whop elements failed to load')))
  })
}

export function WhopJoin() {
  const host = useRef<HTMLDivElement>(null)
  const [joined, setJoined] = useState(() => new URLSearchParams(window.location.search).has('joined'))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (joined) return
    let checkout: WhopCheckout | undefined
    let cancelled = false
    const params = new URLSearchParams(window.location.search)
    const metadata: Record<string, string> = { source: 'log-landing' }
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'ref']) {
      const v = params.get(k)
      if (v) metadata[k] = v
    }
    const back = new URL(window.location.href)
    back.hash = 'go-getters'
    back.searchParams.set('joined', '1')

    loadScript()
      .then(() => {
        if (cancelled || !host.current || !window.WhopElements) return
        checkout = window.WhopElements().checkout.create({
          plan: PLAN_ID,
          metadata,
          appearance: APPEARANCE,
          returnUrl: back.href,
          onComplete: (p: { entryId?: string }) => {
            window.dataLayer?.push({ event: 'gg_waitlist_joined', entry_id: p?.entryId, source: 'log-landing' })
            setJoined(true)
          },
        })
        checkout.create('checkout').mount(host.current)
      })
      .catch(() => setFailed(true))
    return () => {
      cancelled = true
      checkout?.destroy()
    }
  }, [joined])

  if (joined) {
    return (
      <div className="text-left">
        <p className="text-2xl font-black">you're on the list</p>
        <p className="lk-body mt-2 text-lg">
          i read every application myself. if you're a fit you'll hear from me on x or email. first 10 get founding price.
        </p>
        <p className="lk-hand mt-3 text-3xl text-[#2A8CFF]">see you in there. matt</p>
      </div>
    )
  }

  return (
    <div className="text-left">
      <p className="text-2xl font-black">save your spot. free, no card, about 2 minutes.</p>
      <p className="mb-3 mt-1 text-base" style={{ color: 'var(--lk-muted)' }}>
        your email and 5 short answers. one line each is fine. i read every one.
      </p>
      {failed ? (
        <a href={`https://whop.com/checkout/${PLAN_ID}`} className="lk-btn w-full justify-center px-7 py-4 text-base">
          join the waitlist on whop →
        </a>
      ) : (
        <div ref={host} className="min-h-[420px]" />
      )}
    </div>
  )
}
