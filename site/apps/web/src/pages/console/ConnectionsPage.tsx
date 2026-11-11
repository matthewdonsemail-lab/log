import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { ConsoleLayout, SectionHeading, type WorkspaceState } from './ConsoleLayout'
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

function currentWorkspaceState(): WorkspaceState {
  return 'ready'
}

export function ConnectionsPage() {
  const workspaceState = currentWorkspaceState()
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


      {running ? (
        <section className="mb-8">
          <SectionHeading title="Connected" count={0} />
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">No accounts signed in yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">
              Sign one in below. The platform decides whether it worked, and the session stays in your workspace.
            </p>
          </div>
        </section>
      ) : null}

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
