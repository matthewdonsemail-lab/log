import { useEffect, useMemo, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@listeningkit/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faBolt, faChartColumn, faCoins, faGift, faHouse, faPlug } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import './console.css'

export type WorkspaceState = 'notConnected' | 'awaitingConnection' | 'connecting' | 'ready' | 'reconnecting' | 'offline' | 'failed' | 'stateMissing'

const WORKSPACE_COPY: Record<WorkspaceState, { label: string; tone: string }> = {
  notConnected: { label: 'No workspace connected', tone: 'bg-slate-100 text-slate-600 ring-slate-200' },
  awaitingConnection: { label: 'Waiting for your workspace', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  connecting: { label: 'Connecting', tone: 'bg-[#EFF6FF] text-[#1B6FD6] ring-[#BFD9FA]' },
  ready: { label: 'Workspace ready', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  reconnecting: { label: 'Reconnecting', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  offline: { label: 'Workspace offline', tone: 'bg-slate-100 text-slate-600 ring-slate-200' },
  failed: { label: 'Setup failed', tone: 'bg-red-50 text-red-700 ring-red-200' },
  stateMissing: { label: 'Workspace data missing', tone: 'bg-red-50 text-red-700 ring-red-200' },
}

const NAV: { to: string; label: string; icon: IconDefinition }[] = [
  { to: '/console/start', label: 'Start', icon: faHouse },
  { to: '/console/connections', label: 'Connections', icon: faPlug },
  { to: '/console/usage', label: 'Usage', icon: faChartColumn },
  { to: '/console/events', label: 'Events', icon: faBolt },
]

export function WorkspaceChip({ state, className }: { state: WorkspaceState; className?: string }) {
  const copy = WORKSPACE_COPY[state]
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1', copy.tone, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {copy.label}
    </span>
  )
}

export function TeamSwitch() {
  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 rounded-md bg-[#2A8CFF] px-2.5 py-1.5 text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(13,42,76,0.25)] transition-colors hover:bg-[#1F6FE6] sm:text-sm [&::-webkit-details-marker]:hidden"
        aria-label="Teams"
      >
        <span className="hidden rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:inline">owner</span>
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#1B6FD6]">P</span>
        <b className="max-w-[5rem] truncate font-semibold sm:max-w-[7rem]">Personal</b>
        <span aria-hidden="true" className="text-[10px] text-white/70">▾</span>
      </summary>
      <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-56 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Your teams</p>
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
          <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-[#2A8CFF] text-[10px] font-bold text-white">P</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">Personal</span>
            <span className="text-[11px] text-slate-500">owner</span>
          </span>
          <span className="text-[11px] font-semibold text-[#1B6FD6]">✓ active</span>
        </div>
        <div className="my-1 h-px bg-slate-200" />
        <Link to="/teams" className="block rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-slate-50">＋ New team</Link>
        <Link to="/teams" className="block rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-slate-50">⤷ Join by code</Link>
        <Link to="/console/settings" className="block rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-slate-50">⚙ Team settings</Link>
      </div>
    </details>
  )
}

export function BalanceChip() {
  return (
    <div className="flex h-9 items-center gap-1.5 rounded-md bg-[#2A8CFF] px-2.5 py-1.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(13,42,76,0.25)]">
      <FontAwesomeIcon icon={faCoins} className="size-3.5" />
      <button
        type="button"
        className="rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold transition-colors hover:bg-white/30"
        title="Top up credits"
      >
        Top up
      </button>
    </div>
  )
}

export function ReferralLink() {
  return (
    <Link
      to="/console/subscription"
      className="hidden h-9 items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 sm:flex"
      title="Referral"
    >
      <FontAwesomeIcon icon={faGift} className="size-3.5" />
      Referral
    </Link>
  )
}

export function AccountMenu() {
  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-white/40 [&::-webkit-details-marker]:hidden"
        aria-label="Account"
      >
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-[#2A8CFF] text-xs font-bold text-white">LK</span>
        <span className="text-[10px] text-slate-400">▾</span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-60 rounded-md border border-slate-200 bg-white p-1.5 text-sm shadow-xl shadow-slate-900/10">
        <p className="truncate px-2 py-1 text-xs font-semibold text-slate-500">you@listeningkit.com</p>
        <div className="my-1 h-px bg-slate-200" />
        <Link to="/console/settings" className="block rounded-md px-2 py-1.5 font-semibold hover:bg-slate-50">Team settings</Link>
        <Link to="/console/subscription" className="block rounded-md px-2 py-1.5 font-semibold hover:bg-slate-50">Billing</Link>
        <Link to="/console/connections" className="block rounded-md px-2 py-1.5 font-semibold hover:bg-slate-50">Connections</Link>
        <div className="my-1 h-px bg-slate-200" />
        <Link to="/sign-in" className="flex items-center gap-2 rounded-md px-2 py-1.5 font-semibold hover:bg-slate-50">
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="size-3.5" />
          Sign out
        </Link>
      </div>
    </details>
  )
}

export function PageHero({ title, lede, children }: { title: string; lede: string; children?: ReactNode }) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight sm:text-[1.9rem]">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{lede}</p>
        </div>
        {children}
      </div>
    </header>
  )
}

export function SectionHeading({ title, count, quiet = false }: { title: string; count?: number; quiet?: boolean }) {
  return (
    <div className={cn('mb-4 flex items-center gap-3', quiet ? 'mt-7' : '')}>
      <h2 className={cn('shrink-0 font-bold tracking-tight', quiet ? 'text-xs uppercase tracking-[0.08em] text-slate-500' : 'text-base')}>{title}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-slate-300" />
      {count === undefined ? null : <em className="shrink-0 text-xs font-semibold not-italic text-slate-500">{count}</em>}
    </div>
  )
}

export function ConsoleLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { pathname } = useLocation()
  const active = useMemo(() => NAV.find((item) => pathname.startsWith(item.to))?.to ?? '', [pathname])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('lk-console-scroll')
    return () => root.classList.remove('lk-console-scroll')
  }, [])

  return (
    <div className="relative min-h-screen font-sans text-slate-900">
      <div className="relative z-10">
        <header className="sticky top-0 z-50 w-full px-4 pb-2 sm:px-6 md:pb-0">
          <div className="flex h-16 items-center gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <div className="relative z-30 flex w-fit min-w-0 items-center gap-1 rounded-md border border-white/80 bg-white/85 p-1 shadow-[0_2px_14px_rgba(13,42,76,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] motion-reduce:transform-none sm:gap-2">
              <Link to="/" className="ml-1 flex shrink-0 items-center gap-2.5 font-bold tracking-tight" aria-label="ListeningKit home">
                <img src="/logo.svg" alt="" className="size-8 rounded-[9px]" />
              </Link>
              <TeamSwitch />
            </div>
            <nav
              aria-label="Console"
              className="relative z-10 hidden items-center justify-center gap-0.5 rounded-md border border-white/80 bg-white/85 p-1 shadow-[0_2px_14px_rgba(13,42,76,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] motion-reduce:transform-none md:flex"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={active === item.to ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                    active === item.to
                      ? 'bg-white/60 text-[#0D2A4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_2px_rgba(13,42,76,0.12)]'
                      : 'text-slate-700/85 hover:bg-white/30 hover:text-slate-900',
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="size-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="relative z-30 ml-auto flex w-fit shrink-0 items-center justify-end gap-1 rounded-md border border-white/80 bg-white/85 p-1 shadow-[0_2px_14px_rgba(13,42,76,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] motion-reduce:transform-none sm:gap-2 md:ml-0 md:justify-self-end">
              <ReferralLink />
              <BalanceChip />
              <AccountMenu />
            </div>
          </div>
          <nav
            aria-label="Console sections"
            className="relative z-10 flex items-center gap-0.5 overflow-x-auto rounded-md border border-white/80 bg-white/85 p-1 shadow-[0_2px_14px_rgba(13,42,76,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-transform duration-200 hover:scale-[1.02] motion-reduce:transform-none md:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={active === item.to ? 'page' : undefined}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
                  active === item.to
                    ? 'bg-white/60 text-[#0D2A4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_2px_rgba(13,42,76,0.12)]'
                    : 'text-slate-700/85',
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
          <PageHero title={title} lede={subtitle} />
          {children}
        </main>
      </div>
    </div>
  )
}
