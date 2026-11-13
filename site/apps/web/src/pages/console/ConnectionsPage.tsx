import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faMagnifyingGlass, faPlug, faTableList, faGrip, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { Spinner, toast } from '@listeningkit/ui'
import { errorText } from '@/lib/controlApi'
import { localConsole } from '@/lib/consoleMode'
import { useErrorToast } from '@/lib/useErrorToast'
import { ConsoleLayout, SectionHeading, WorkspaceChip } from './ConsoleLayout'
import { AddKeyDialog, type KeyProvider } from './AddKeyDialog'
import { ConnectionList, type ConnectionItem } from './ConnectionList'
import { ConnectionPlatformFilter } from './ConnectionPlatformFilter'
import { PlatformSignInDialog } from './PlatformSignInDialog'
import { PlatformConnectionTongue } from './PlatformConnectionTongue'
import { BrowserCheckSeam, useBrowserCheck } from './browserCheckSeam'
import { checkConnection, loadConnections, saveConnectionKeys, type LocalConnections } from './connectionsData'
import { targetKey } from './consoleClient'
import { useConsoleTarget } from './useConsoleTarget'

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
  { key: 'adsPower', label: 'AdsPower', logo: '/logos/adsPower.svg', meta: 'Browser profiles', category: 'Browser' },
  { key: 'typesafe', label: 'TypeSafe Jev', logo: '/logos/tools/typesafeDark.svg', meta: 'Jev · API key', category: 'System One & decision models' },
  { key: 'subq', label: 'Subquadratic Snap', logo: '/logos/stack/subq.svg', meta: 'Snap · API key', category: 'System One & decision models' },
  { key: 'memelord', label: 'MemeLord', logo: '/logos/memelord.png', meta: 'Memes and stickers', category: 'Media' },
  { key: 'fishAudio', label: 'Fish Audio', logo: '/logos/fishAudio.png', meta: 'API key', category: 'AI generation' },
  { key: 'inworld', label: 'Inworld', logo: '/logos/inworld.png', meta: 'API key', category: 'AI generation' },
  { key: 'jina', label: 'Jina', logo: '/logos/jina.png', meta: 'Embeddings and reranking', category: 'AI generation' },
  { key: 'assemblyAi', label: 'AssemblyAI', logo: '/logos/assemblyAi.ico', meta: 'Transcription', category: 'AI generation' },
  { key: 'parallel', label: 'Parallel', logo: '/logos/parallel.svg', meta: 'Search and research', category: 'Data' },
  { key: 'twoCaptcha', label: '2Captcha', logo: '/logos/twoCaptcha.png', meta: 'Captchas and proxies', category: 'Infrastructure' },
  { key: 'byteful', label: 'Byteful', logo: '/logos/byteful.svg', meta: 'Proxies', category: 'Infrastructure' },
  { key: 'treg', label: 'treg', logo: '/logos/treg.png', meta: 'API key and balance', category: 'Data' },
]

const EXTENSION_GROUPS = ['Browser', 'System One & decision models', 'Media', 'AI generation', 'Data', 'Infrastructure'] as const
type View = 'table' | 'cards'
const actionClass = 'inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50'

export function ConnectionsPage() {
  const queryClient = useQueryClient()
  const { target, workspaceState } = useConsoleTarget()
  const queryKey = ['consoleConnections', targetKey(target)]
  const [statusTime, setStatusTime] = useState(Date.now)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const { browserCheckAccountId, openBrowserCheck, closeBrowserCheck } = useBrowserCheck()
  const [view, setView] = useState<View>(() => { try { return localStorage.getItem('logConsoleConnectionsView') === 'cards' ? 'cards' : 'table' } catch { return 'table' } })
  const [query, setQuery] = useState('')
  const [platformQuery, setPlatformQuery] = useState('')
  const [signInPlatform, setSignInPlatform] = useState<Platform | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [keyDialog, setKeyDialog] = useState<{ open: boolean; provider: KeyProvider | null }>({ open: false, provider: null })
  const connections = useQuery({ queryKey, queryFn: ({ signal }) => loadConnections(target!, signal), enabled: Boolean(target), retry: false, refetchOnWindowFocus: true, refetchInterval: (state) => state.state.data?.accounts.some((account) => account.lastCheck?.state === 'running') ? 2000 : false })
  useErrorToast(connections.isError, connections.error, localConsole ? 'Local connections could not be read' : 'Your workspace’s connections could not be read')
  const connected = connections.data?.accounts ?? []
  const now = Math.max(statusTime, Date.now())
  const nextCooldown = Math.min(...connected.map((account) => account.lastCheck?.launchOutcome).filter((outcome) => outcome?.phase === 'launchCooldown' && outcome.retryAt && Date.parse(outcome.retryAt) > now).map((outcome) => Date.parse(outcome!.retryAt!)))
  const refetchConnections = connections.refetch
  useEffect(() => {
    if (!Number.isFinite(nextCooldown)) return
    const timer = window.setTimeout(() => { setStatusTime(Date.now()); void refetchConnections() }, Math.min(2147483647, Math.max(0, nextCooldown - Date.now()) + 100))
    return () => window.clearTimeout(timer)
  }, [nextCooldown, refetchConnections])
  const extensionStates = new Map(connections.data?.extensions.map((extension) => [extension.key, extension.state]) ?? [])
  const running = Boolean(target && connections.data)
  const browserCheckAccount = connected.find((account) => account.id === browserCheckAccountId)
  const keep = (data: LocalConnections) => queryClient.setQueryData(queryKey, data)

  async function checkStatus(accountId: string) {
    if (checkingId || !target) return
    setCheckingId(accountId)
    try { keep(await checkConnection(target, accountId)) }
    catch (error) { toast.error('Status check not finished', errorText(error)) }
    finally { setCheckingId(null); void connections.refetch() }
  }

  const accountItems: ConnectionItem[] = connected.filter((account) => !selectedPlatforms.length || selectedPlatforms.includes(account.platform === 'twitter' ? 'x' : account.platform)).map((account) => {
    const platform = PLATFORMS.find((item) => item.service === (account.platform === 'twitter' ? 'x' : account.platform))
    const nativeLabels: Partial<Record<typeof account.status, string>> = { deactivated: 'Deactivated', banned: 'Banned', dead: 'Unavailable', restricted: 'Restricted', checkpoint: 'Checkpoint', paused: 'Paused', limited: 'Limited', warming: 'Warming up', needsLogin: 'Sign-in required' }
    const accountStopped = ['deactivated', 'banned', 'dead', 'restricted', 'checkpoint'].includes(account.status)
    const needsAttention = ['checkpoint', 'restricted', 'shadowSuspect', 'accountWarning'].includes(account.state)
    const pending = checkingId === account.id || account.lastCheck?.state === 'running'
    const launch = account.lastCheck?.launchOutcome
    const launchCurrent = Boolean(account.lastCheck && (!account.checkedAt || Date.parse(account.lastCheck.checkedAt) >= Date.parse(account.checkedAt)))
    const cooldown = Boolean(launchCurrent && launch?.phase === 'launchCooldown' && launch.code === 'launchTooSoon' && launch.retryAt && Date.parse(launch.retryAt) > now)
    const stopped = Boolean(launch?.phase !== 'launchCooldown' && account.lastCheck && ['stopped', 'unknown'].includes(account.lastCheck.state) && (!account.checkedAt || Date.parse(account.checkedAt) <= Date.parse(account.lastCheck.checkedAt)))
    const browserVerified = account.platform === 'facebook' && account.lastCheck?.state === 'succeeded' && (!account.checkedAt || Date.parse(account.lastCheck.checkedAt) >= Date.parse(account.checkedAt))
    const browserCheckRequired = account.platform === 'facebook' && !browserVerified
    const status = accountStopped ? nativeLabels[account.status]! : account.state === 'restricted' ? 'Restricted' : account.state === 'checkpoint' ? 'Checkpoint' : needsAttention ? 'Needs attention' : pending ? 'Checking…' : cooldown ? 'Cooling down' : stopped ? (account.lastCheck?.state === 'unknown' ? 'Check interrupted' : 'Check stopped') : nativeLabels[account.status] ? nativeLabels[account.status]! : browserCheckRequired ? 'Browser check required' : browserVerified ? 'Signed in' : account.state === 'loggedIn' ? 'Signed in' : account.state === 'loggedOut' ? 'Signed out' : 'Not checked'
    const tone = needsAttention || accountStopped ? 'error' : status === 'Cooling down' ? 'warning' : stopped || (!browserCheckRequired && account.state === 'loggedOut') ? 'error' : !browserCheckRequired && (account.state === 'loggedIn' || browserVerified) && !pending ? 'active' : 'neutral'
    const reviewBrowserCheck = account.platform === 'facebook'
    const checkNote = status === 'Cooling down' && launch?.retryAt ? `Available at ${new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(new Date(launch.retryAt))}` : !browserCheckRequired && account.lastCheck?.state === 'unavailable' ? 'Check service unavailable' : null
    return {
      id: account.id, name: account.name, subtitle: platform?.label ?? account.platform, status, tone,
      icon: <FontAwesomeIcon icon={platform?.icon ?? faPlug} className="size-7" />,
      homeCountry: account.homeCountry, proxyProvider: account.proxyProvider, checkedAt: browserVerified ? account.lastCheck!.checkedAt : account.checkedAt, checkNote,
      search: `${account.name} ${platform?.label ?? account.platform} ${status}`,
      action: {
        kind: reviewBrowserCheck ? 'browserCheck' : 'sessionCheck',
        label: reviewBrowserCheck ? 'Browser check' : pending ? 'Checking…' : 'Check status', accessibleLabel: `${reviewBrowserCheck ? 'Browser check' : 'Check status'} for ${account.name} on ${platform?.label ?? account.platform}`,
        disabled: !reviewBrowserCheck && (Boolean(checkingId) || pending || stopped || needsAttention || account.status === 'deactivated' || browserCheckRequired),
        reason: account.status === 'deactivated' ? 'This account is deactivated' : stopped || needsAttention ? 'Resolve the recorded stop in Log before checking again' : pending ? 'A status check is running' : checkingId ? 'Another account check is running' : 'Check the saved session through Log',
        pending, onClick: () => { if (reviewBrowserCheck) openBrowserCheck(account.id); else void checkStatus(account.id) },
      },
    }
  })
  const shownPlatforms = PLATFORMS.filter((platform) => `${platform.label} ${platform.service}`.toLowerCase().includes(platformQuery.trim().toLowerCase()))
  const items = accountItems.filter((item) => item.search.toLowerCase().includes(query.trim().toLowerCase()))
  const pageSize = 12
  const currentPage = Math.min(page, Math.max(0, Math.ceil(items.length / pageSize) - 1))
  const rows = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const label = 'Connected profiles'
  const where = localConsole ? 'on this machine' : 'in your workspace'

  return <ConsoleLayout title="Connections" subtitle="Your own accounts and extension keys.">
    {!localConsole ? <div className="mb-4 flex flex-wrap items-center gap-3">
      <WorkspaceChip state={workspaceState} />
      {workspaceState === 'notConnected' || workspaceState === 'awaitingConnection' ? <Link to="/console/settings" className="text-sm font-semibold text-[#1B6FD6]">Set up your workspace →</Link> : null}
      {workspaceState === 'offline' ? <span className="text-sm text-slate-600">Start <code className="rounded bg-slate-100 px-1">log runtime connect</code> in your workspace to see its accounts.</span> : null}
    </div> : null}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="px-4 pt-4 sm:px-5"><SectionHeading title="Connected" count={connected.length} /></div>
      <div className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
        <label className="relative min-w-0 basis-full sm:max-w-sm sm:flex-1"><span className="sr-only">Search {label.toLowerCase()}</span><FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 top-3 size-3.5 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Search accounts, platforms or status" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
        <div role="group" aria-label="Connected profile layout" className="inline-flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:ml-auto">{(['table', 'cards'] as const).map((value) => <button key={value} type="button" aria-pressed={view === value} onClick={() => { setView(value); try { localStorage.setItem('logConsoleConnectionsView', value) } catch {} }} className={`inline-flex min-h-8 items-center gap-2 rounded-md px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${view === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><FontAwesomeIcon icon={value === 'table' ? faTableList : faGrip} className="size-3.5" />{value === 'table' ? 'Table' : 'Cards'}</button>)}</div>
        <ConnectionPlatformFilter options={PLATFORMS.map((platform) => ({ value: platform.service, label: platform.label, icon: platform.icon, count: connected.filter((account) => (account.platform === 'twitter' ? 'x' : account.platform) === platform.service).length }))} selected={selectedPlatforms} onChange={(values) => { setSelectedPlatforms(values); setPage(0) }} />
        <button type="button" onClick={() => connections.refetch()} disabled={!target || connections.isFetching} className={actionClass}><FontAwesomeIcon icon={faRotateRight} className={`size-3.5 ${connections.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} /><span>Refresh</span></button>
      </div>
      {!target ? <div className="p-10 text-center"><p className="text-sm font-semibold text-slate-700">Accounts show while your workspace is connected</p><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">They stay in your workspace. Nothing is copied here.</p></div>
        : connections.isLoading ? <Spinner className="min-h-0 py-10" label={localConsole ? 'Reading local connections' : 'Asking your workspace'} />
        : connections.isError ? <div className="p-10 text-center"><button type="button" onClick={() => connections.refetch()} className={actionClass}>Try again</button></div>
        : rows.length ? <ConnectionList items={rows} view={view} label={label} />
        : <p role="status" className="p-10 text-center text-sm text-slate-600">{query.trim() || selectedPlatforms.length ? 'No profiles match your filters.' : localConsole ? 'No local accounts added yet.' : 'No accounts in your workspace yet.'}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:px-5"><span aria-live="polite">{items.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, items.length)} of {items.length}</span>{items.length > pageSize ? <div className="flex gap-2"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className={actionClass}>Previous</button><button type="button" disabled={(currentPage + 1) * pageSize >= items.length} onClick={() => setPage(currentPage + 1)} className={actionClass}>Next</button></div> : null}</div>
    </div>
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="px-4 pt-4 sm:px-5"><SectionHeading title="Add a connection" count={shownPlatforms.length} /></div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 sm:px-5"><label className="relative min-w-0 basis-full sm:max-w-sm sm:flex-1"><span className="sr-only">Filter platforms</span><FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 top-3 size-3.5 text-slate-400" /><input value={platformQuery} onChange={(event) => setPlatformQuery(event.target.value)} placeholder="Filter platforms" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label></div>
      {shownPlatforms.length ? <div className="grid grid-cols-1 items-stretch gap-x-4 gap-y-6 px-4 pb-6 pt-4 sm:grid-cols-2 sm:px-5">{shownPlatforms.map((platform, index) => <article key={platform.service} aria-label={`Connect ${platform.label}`} className="relative isolate flex min-w-0 flex-col">
        <PlatformConnectionTongue platform={platform.service} label={platform.label} order={index} />
        <div className="relative z-10 -mt-5 flex min-h-36 flex-1 flex-col rounded-2xl p-4 text-white shadow-[0_6px_0_#1A5FC8] sm:p-5" style={{ background: 'radial-gradient(at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center text-white"><FontAwesomeIcon icon={platform.icon} className="size-9" /></span>
            <h3 className="min-w-0 flex-1 font-toddler text-2xl leading-tight">{platform.label}</h3>
            <button type="button" disabled={!running} onClick={() => setSignInPlatform(platform)} aria-haspopup="dialog" aria-label={`Sign in to ${platform.label}`} className="relative min-h-9 shrink-0 whitespace-nowrap rounded-lg bg-white px-3 text-sm font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform active:not-disabled:translate-y-px disabled:text-[#0D2A4C]/60" title={running ? `Sign in to ${platform.label}` : 'Connect a workspace first'}>Sign in</button>
          </div>
          <p className="mt-3 text-base leading-6 text-white/95">{platform.summary}</p>
        </div>
      </article>)}</div> : <p className="p-10 text-center text-sm text-slate-600">No platform matches “{platformQuery.trim()}”.</p>}
    </section>
    <section className="mt-10">
      {connections.data ? <p className="mb-4 text-sm font-semibold text-slate-600">{connections.data.extensions.filter((extension) => extension.state === 'configured').length} extensions configured {where}</p> : null}
      <div className="mb-4 flex items-center gap-3"><h2 className="shrink-0 text-base font-bold tracking-tight">Extensions</h2><span aria-hidden="true" className="h-px flex-1 bg-slate-300" /><em className="shrink-0 text-xs font-semibold not-italic text-slate-500">{EXTENSION_PROVIDERS.length}</em></div>
      {EXTENSION_GROUPS.map((category) => {
        const providers = EXTENSION_PROVIDERS.filter((provider) => provider.category === category).sort((left, right) => Number(extensionStates.get(right.key) === 'configured') - Number(extensionStates.get(left.key) === 'configured'))
        return <div key={category}><SectionHeading quiet title={category} count={providers.length} /><div className="grid gap-3 sm:grid-cols-2">{providers.map((provider) => <div key={provider.key} className="relative flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-[0_6px_0_#1A5FC8]" style={{ background: 'radial-gradient(at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5"><img src={provider.logo} alt="" className="size-full object-contain" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{provider.label}</span><span className="block text-sm font-medium text-white/90">{extensionStates.get(provider.key) === 'configured' ? (provider.key === 'adsPower' ? 'Configured' : 'Key saved') : extensionStates.get(provider.key) === 'unavailable' ? 'Configuration unavailable' : provider.key === 'adsPower' ? 'Not configured' : provider.meta}</span></span><button type="button" disabled={!running} onClick={() => setKeyDialog({ open: true, provider })} className="relative h-8 shrink-0 rounded-lg bg-white px-3 text-xs font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform active:not-disabled:translate-y-px disabled:bg-white disabled:text-[#0D2A4C]/60" title={running ? `Add a key for ${provider.label}` : 'Connect a workspace first'}>{extensionStates.get(provider.key) === 'configured' ? (provider.key === 'adsPower' ? 'Manage' : 'Manage key') : (provider.key === 'adsPower' ? 'Configure' : 'Add key')}</button>
        </div>)}</div></div>
      })}
    </section>
    {browserCheckAccount && target ? <BrowserCheckSeam key={browserCheckAccount.id} account={browserCheckAccount} target={target} onClose={() => { closeBrowserCheck(); void connections.refetch() }} onResolved={() => { closeBrowserCheck(); void connections.refetch() }} onConfigureProvider={() => { closeBrowserCheck(); setKeyDialog({ open: true, provider: EXTENSION_PROVIDERS.find((item) => item.key === 'adsPower')! }) }} /> : null}
    {signInPlatform ? <PlatformSignInDialog key={signInPlatform.service} platform={signInPlatform} target={target} accounts={connected} onClose={() => setSignInPlatform(null)} onSignedIn={(answer) => { keep(answer.connections); setSignInPlatform(null); if (answer.next === 'browserCheck') openBrowserCheck(answer.accountId) }} /> : null}
    <AddKeyDialog open={keyDialog.open} provider={keyDialog.provider} providers={EXTENSION_PROVIDERS} credentials={connections.data?.extensions ?? []} target={target} onSave={running && target ? async (provider, values) => { keep(await saveConnectionKeys(target, provider, values)) } : undefined} onClose={() => setKeyDialog({ open: false, provider: null })} />
  </ConsoleLayout>
}
