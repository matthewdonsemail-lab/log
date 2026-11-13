import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faCopy, faKey, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { ConsoleLayout } from './ConsoleLayout'
import { PlatformInterfaceTongue } from './PlatformInterfaceTongue'
import { AgentPlatformSelector } from './AgentPlatformSelector'
import { agentPlatforms, type AgentPlatform } from './agentPlatforms'
import { getPlayToolCalls } from './playToolCalls'
import { AgentCover } from './AgentCover'
import { useQuery } from '@tanstack/react-query'
import { localConsole } from '@/lib/consoleMode'
import { useErrorToast } from '@/lib/useErrorToast'
import { loadLocalStart } from './startData'

const SETUP_COMMAND = 'set up log — https://log.listeningkit.com/mcp'
const MASKED_KEY = 'lg_••••••••••••••••••••••'

const EXAMPLES: { play: string; title: string; icon: IconDefinition; description: string; prompt: string }[] = [
  { play: 'Reply guy', title: 'X', icon: faXTwitter, description: 'Catch up on DMs and mentions, then draft thoughtful replies in your voice.', prompt: 'Review my X DMs and mentions. Show me who is waiting for a reply, summarize the context, and draft a thoughtful response in my voice for each one.' },
  { play: 'Inbox catch-up', title: 'Discord', icon: faDiscord, description: 'Find unanswered DMs and mentions, and get relevant replies ready.', prompt: 'Catch up on my Discord DMs and mentions. Show me the conversations that need a reply, summarize what each person needs, and draft a response for each.' },
  { play: 'Answer the queue', title: 'Slack', icon: faSlack, description: 'See which conversations need you and prepare clear, contextual replies.', prompt: 'Review my Slack conversations that are waiting on me. Summarize the context and draft a clear, relevant reply for each one.' },
  { play: 'DM replies', title: 'Instagram', icon: faInstagram, description: 'Review your DMs and draft natural replies that sound like you.', prompt: 'Review my Instagram DMs that need a reply. Summarize each conversation and draft a natural response in my voice.' },
  { play: 'Find the buyers', title: 'Reddit', icon: faRedditAlien, description: 'Find relevant requests and draft useful replies that fit each thread.', prompt: 'Find recent Reddit conversations where people are asking for what I offer. Show the thread context and draft a useful, on-topic reply for each.' },
  { play: 'Marketplace buyers', title: 'Facebook', icon: faFacebook, description: 'Review listing questions and prepare helpful replies for buyers.', prompt: 'Review Facebook Marketplace messages about my listings. Show each buyer’s question and the listing context, then draft a helpful reply.' },
  { play: 'New messages', title: 'LinkedIn', icon: faLinkedin, description: 'Catch up on new messages and prepare professional replies.', prompt: 'Review my new LinkedIn messages. Tell me who each message is from, summarize the context, and draft a professional reply when one is needed.' },
]

function LocalStatus() {
  const query = useQuery({ queryKey: ['consoleStart'], queryFn: ({ signal }) => loadLocalStart(signal), retry: false, refetchOnWindowFocus: false })
  useErrorToast(query.isError, query.error, 'Could not read this machine.')
  const data = query.data
  const rows = data ? [
    ['log.db', data.database.found ? `Found: ${data.database.path}` : `Not found yet: ${data.database.path}`],
    ['MCP', data.mcp.running ? `Running${data.mcp.pid ? ` (pid ${data.mcp.pid})` : ''}` : 'Not running: your agent starts it (see AI clients)'],
    ['Accounts', String(data.accounts)],
    ['Last event', data.lastEventAt ? new Date(data.lastEventAt).toLocaleString() : 'None yet'],
  ] : []
  return (
    <section className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">This machine</h2>
        <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-50">{query.isFetching ? 'Reading…' : 'Refresh'}</button>
      </div>
      {query.isError ? <p className="mt-3 text-sm text-slate-600"><button type="button" onClick={() => query.refetch()} className="font-semibold underline">Try again</button></p> : null}
      {rows.length ? (
        <dl className="mt-3 divide-y divide-slate-100">
          {rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-3 py-2 text-sm"><dt className="text-slate-600">{label}</dt><dd className="min-w-0 break-all text-right font-medium">{value}</dd></div>)}
        </dl>
      ) : query.isLoading ? <p className="mt-3 text-sm text-slate-500">Reading this machine…</p> : null}
    </section>
  )
}

function CopyButton({ value, light = false }: { value: string; light?: boolean }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={
        light
          ? 'flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform active:translate-y-px'
          : 'flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#0D2A4C] px-2.5 text-xs font-bold text-white transition-colors hover:bg-[#123a66]'
      }
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="size-3" />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function StartPage() {
  const [cardsReady, setCardsReady] = useState(false)
  const [agentPlatform, setAgentPlatform] = useState<AgentPlatform>('claudeCode')
  const [visiblePlays, setVisiblePlays] = useState<number[]>([])
  const [activePlay, setActivePlay] = useState<number | null>(null)
  const agentLabel = agentPlatforms.find((platform) => platform.id === agentPlatform)?.label ?? 'Claude Code'

  const handlePlayVisibility = useCallback((index: number, visible: boolean) => {
    setVisiblePlays((current) => {
      if (current.includes(index) === visible) return current
      return visible ? [...current, index].sort((left, right) => left - right) : current.filter((item) => item !== index)
    })
  }, [])

  useEffect(() => {
    setActivePlay((current) => current !== null && visiblePlays.includes(current) ? current : visiblePlays[0] ?? null)
  }, [visiblePlays])

  const handlePlayComplete = useCallback((index: number) => {
    setActivePlay((current) => {
      if (current !== index) return current
      return visiblePlays[(visiblePlays.indexOf(index) + 1) % visiblePlays.length] ?? null
    })
  }, [visiblePlays])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCardsReady(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <ConsoleLayout title="Getting started" subtitle="Three steps and your agent is running on your own accounts.">
      {localConsole ? <LocalStatus /> : null}
      <section className="min-w-0 max-w-full rounded-2xl border-2 border-slate-200 bg-white">
        <div className="grid min-w-0 grid-cols-1 gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 border-b-2 border-slate-200 p-4 sm:p-5 md:border-b-0 md:border-r-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0D2A4C] text-[11px] font-bold text-white">1</span>
                <h2 className="text-base font-bold">Set up your agent</h2>
              </div>
              <AgentPlatformSelector value={agentPlatform} onChange={setAgentPlatform} />
            </div>
            <AgentCover platform={agentPlatform} />
            <p className="mt-4 text-sm leading-6 text-slate-600">Choose your harness above to preview each play in its interface.</p>
          </div>

          <div className="min-w-0 p-4 sm:p-5">
            <p className="mt-3 text-sm font-semibold text-slate-700">Setting up log for {agentLabel}</p>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">In your agent’s chat, send:</p>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                <FontAwesomeIcon icon={faTerminal} className="size-3.5 shrink-0 text-slate-400" />
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">{SETUP_COMMAND}</code>
                <CopyButton value={SETUP_COMMAND} />
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FontAwesomeIcon icon={faKey} className="size-3.5 text-slate-400" />
                Your API key
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Setup signs your agent in automatically. Additional keys are shown once; manage them in Settings.</p>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">{MASKED_KEY}</code>
                <CopyButton value={MASKED_KEY} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#0D2A4C] text-[11px] font-bold text-white">2</span>
          <h2 className="text-base font-bold">Try it out</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">See each play inside your selected platform, or copy its prompt to try it yourself.</p>

        <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
          {EXAMPLES.map((example, index) => (
            <div key={example.title} className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg p-2">
              <PlatformInterfaceTongue
                platform={agentPlatform}
                prompt={example.prompt}
                steps={getPlayToolCalls(example.title)}
                previewIndex={index}
                active={activePlay === index}
                onVisibilityChange={handlePlayVisibility}
                onCycleComplete={handlePlayComplete}
              />
              <div
                aria-busy={!cardsReady}
                className="relative -mt-5 flex min-h-[9rem] flex-1 flex-col overflow-hidden rounded-lg bg-[radial-gradient(at_50%_0%,#4FA6FF_0%,#2A8CFF_55%,#1F78F0_100%)] px-4 py-4 text-white shadow-[0_6px_0_#1A5FC8,0_8px_3px_rgba(15,23,42,0.15)]"
              >
                {cardsReady ? <>
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={example.icon} className="size-7 shrink-0" aria-hidden="true" />
                  <p className="min-w-0 flex-1 break-words font-toddler text-[clamp(1rem,3vw,1.5rem)] leading-tight">{example.play} on {example.title}</p>
                  <CopyButton value={example.prompt} light />
                </div>
                <p className="mt-3 text-base leading-6 text-white/95">{example.description}</p>
                </> : (
                  <div role="status" aria-label="Loading play" className="animate-pulse motion-reduce:animate-none">
                    <div className="flex items-center gap-3" aria-hidden="true">
                      <div className="size-7 shrink-0 rounded bg-white/25" />
                      <div className="h-6 flex-1 rounded bg-white/25" />
                      <div className="h-8 w-16 rounded bg-white/25" />
                    </div>
                    <div className="mt-4 h-4 w-full rounded bg-white/25" aria-hidden="true" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-white/25" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#0D2A4C] text-[11px] font-bold text-white">3</span>
          <h2 className="text-base font-bold">Connect your accounts</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Sign a platform in from Connections. The session stays in your workspace, and your agent uses that account from then on.
        </p>
      </section>
    </ConsoleLayout>
  )
}
