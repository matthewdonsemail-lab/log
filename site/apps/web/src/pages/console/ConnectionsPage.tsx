import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, errorText, useSelectedTeam, useWorkspaces, type AccountView } from '@/lib/controlApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { ConsoleLayout, SectionHeading, WorkspaceChip, workspaceStateOf } from './ConsoleLayout'
import { AddKeyDialog, type KeyProvider } from './AddKeyDialog'

type Platform = { service: string; label: string; icon: IconDefinition; summary: string }

const PLATFORMS: Platform[] = [
  { service: 'x', label: 'X', icon: faXTwitter, summary: 'Read DMs, post, reply and follow from the account you sign in with.' },
  { service: 'discord', label: 'Discord', icon: faDiscord, summary: 'Read servers and DMs, reply, react and send in the account’s own session.' },
  { service: 'slack', label: 'Slack', icon: faSlack, summary: 'Read channels and DMs, reply and react in the workspaces the account is in.' },
  { service: 'instagram', label: 'Instagram', icon: faInstagram, summary: 'Read DM threads, reply with text or a photo, and watch them live.' },
  { service: 'reddit', label: 'Reddit', icon: faRedditAlien, summary: 'Read subreddits and posts, reply, vote and post from the account.' },
  { service: 'facebook', label: 'Facebook', icon: faFacebook, summary: 'Groups, Marketplace and the seller inbox, in the account’s own browser.' },
  { service: 'linkedin', label: 'LinkedIn', icon: faLinkedin, summary: 'Read the account’s LinkedIn session and keep its cookies.' },
]

type ExtensionProvider = { key: string; label: string; logo: string; meta: string; category: string }

const EXTENSION_PROVIDERS: ExtensionProvider[] = [
  { key: 'typesafe', label: 'TypeSafe Jev', logo: '/logos/tools/typesafeDark.svg', meta: 'Jev · API key', category: 'System One & decision models' },
  { key: 'subq', label: 'Subquadratic Snap', logo: '/logos/stack/subq.svg', meta: 'Snap · API key', category: 'System One & decision models' },
  { key: 'memelord', label: 'MemeLord', logo: '/logos/memelord.png', meta: 'Memes and stickers', category: 'Media' },
  { key: 'fishAudio', label: 'Fish Audio', logo: '/logos/fishAudio.png', meta: 'API key', category: 'AI generation' },
  { key: 'inworld', label: 'Inworld', logo: '/logos/inworld.png', meta: 'API key', category: 'AI generation' },
  { key: 'treg', label: 'treg', logo: '/logos/treg.png', meta: 'API key and balance', category: 'Data' },
]

const EXTENSION_GROUPS = ['System One & decision models', 'Media', 'AI generation', 'Data'] as const

export function ConnectionsPage() {
  const { team } = useSelectedTeam()
  const workspaces = useWorkspaces(team?.id ?? null)
  const workspaceState = workspaceStateOf(workspaces.data, workspaces.isError)
  const accounts = useQuery({
    queryKey: ['controlAccounts', team?.id],
    queryFn: ({ signal }) => api<{ accounts: AccountView[]; cursor: string | null }>(`/teams/${team?.id}/accounts?limit=200`, { signal }),
    enabled: Boolean(team?.id) && workspaceState === 'ready',
    staleTime: 30_000,
  })
  const iconOf = (platform: string) => PLATFORMS.find((item) => item.service === (platform === 'twitter' ? 'x' : platform))?.icon ?? faMagnifyingGlass
  const [query, setQuery] = useState('')
  const [keyDialog, setKeyDialog] = useState<{ open: boolean; provider: KeyProvider | null }>({ open: false, provider: null })
  const running = workspaceState === 'ready' || workspaceState === 'reconnecting' || workspaceState === 'offline'

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return PLATFORMS
    return PLATFORMS.filter((platform) => platform.label.toLowerCase().includes(needle) || platform.service.includes(needle))
  }, [query])

  return (
    <ConsoleLayout
      title="Connections"
      subtitle="Your own accounts and extension keys."
    >


      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <WorkspaceChip state={workspaceState} />
          {workspaceState === 'notConnected' || workspaceState === 'awaitingConnection' ? <Link to="/console/settings" className="text-sm font-semibold text-[#1B6FD6]">Set up your workspace →</Link> : null}
          {workspaceState === 'offline' ? <span className="text-sm text-slate-600">Start <code className="rounded bg-slate-100 px-1">log runtime connect</code> in your workspace to see its accounts.</span> : null}
        </div>
        <SectionHeading title="Connected" count={workspaceState === 'ready' ? accounts.data?.accounts.length ?? 0 : undefined} />
        {workspaceState !== 'ready' ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">Accounts show while your workspace is connected</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">They stay in your workspace. Nothing is copied here.</p>
          </div>
        ) : accounts.isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Asking your workspace…</div>
        ) : accounts.isError ? (
          <div role="status" className="rounded-2xl border border-red-200 bg-white p-6 text-center text-sm text-red-700">{errorText(accounts.error)} <button type="button" onClick={() => accounts.refetch()} className="font-semibold underline">Try again</button></div>
        ) : accounts.data?.accounts.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.data.accounts.map((account) => (
              <li key={account.id || `${account.platform}:${account.account}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2A8CFF]"><FontAwesomeIcon icon={iconOf(account.platform)} className="size-[1.1rem]" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{account.displayName || account.account}</span>
                  <span className="block truncate text-xs text-slate-500">{account.platform} · {account.account}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${account.sessionState === 'loggedIn' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{account.sessionState ?? account.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">No accounts signed in yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">Sign one in below. The platform decides whether it worked, and the session stays in your workspace.</p>
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Add a connection" count={shown.length} />
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Filter platforms</span>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 size-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter platforms, e.g. discord, slack, instagram"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20"
            />
          </label>
        </div>

        {shown.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((platform) => (
              <div
                key={platform.service}
                className="relative flex items-start gap-3 rounded-2xl p-4 text-white shadow-[0_6px_0_#1A5FC8] transition-transform hover:-translate-y-px"
                style={{ background: 'radial-gradient(at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2A8CFF]">
                  <FontAwesomeIcon icon={platform.icon} className="size-[1.1rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{platform.label}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/85">{platform.summary}</p>
                  <button
                    type="button"
                    disabled={!running}
                    className="relative mt-3 h-8 rounded-lg bg-white px-2.5 text-xs font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform active:not-disabled:translate-y-px disabled:bg-white disabled:text-[#0D2A4C]/60"
                    title={running ? `Log in to ${platform.label} and approve access` : 'Connect a workspace first'}
                  >
                    {running ? 'Sign in' : 'Needs workspace'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            No platform matches “{query.trim()}”.
          </p>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="shrink-0 text-base font-bold tracking-tight">Extensions</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-slate-300" />
          <em className="shrink-0 text-xs font-semibold not-italic text-slate-500">{EXTENSION_PROVIDERS.length}</em>
        </div>

        {EXTENSION_GROUPS.map((category) => {
          const items = EXTENSION_PROVIDERS.filter((provider) => provider.category === category)
          if (!items.length) return null
          return (
            <div key={category}>
              <SectionHeading quiet title={category} count={items.length} />
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((provider) => (
                  <div
                    key={provider.key}
                    className="relative flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-[0_6px_0_#1A5FC8]"
                    style={{ background: 'radial-gradient(at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                      <img src={provider.logo} alt="" className="size-full object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{provider.label}</span>
                      <span className="block truncate text-[11px] font-semibold text-white/75">{provider.meta}</span>
                    </span>
                    <button
                      type="button"
                      disabled={!running}
                      onClick={() => setKeyDialog({ open: true, provider })}
                      className="relative h-8 shrink-0 rounded-lg bg-white px-3 text-xs font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform active:not-disabled:translate-y-px disabled:bg-white disabled:text-[#0D2A4C]/60"
                      title={running ? `Add a key for ${provider.label}` : 'Connect a workspace first'}
                    >
                      Add key
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <AddKeyDialog
        open={keyDialog.open}
        provider={keyDialog.provider}
        providers={EXTENSION_PROVIDERS}
        onClose={() => setKeyDialog({ open: false, provider: null })}
      />
    </ConsoleLayout>
  )
}
