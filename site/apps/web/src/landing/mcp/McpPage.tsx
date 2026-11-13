import { useEffect, useState } from 'react'
import { SiteHeader } from '../SiteHeader'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faCheck, faComments, faCopy, faLaptop, faPlug } from '@fortawesome/free-solid-svg-icons'
import { AgencyIntro } from '../AgencyIntro'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { Control, Dashed } from '../Control'
import { PLATFORMS } from '../PlatformSuite'
import { Byline } from '../HomeAnswers'
import { StoryFaq } from '../story/StorySections'
import { DitherFade } from '../useCases/DitherFade'
import { HowItWorks } from '../useCases/HowItWorks'
import { LogWith } from '../useCases/PlatformMoney'
import { CtaBand, MoreUseCases, PromptCta, ThreeSteps } from '../useCases/UseCasesPage'
import { USE_CASES } from '../useCases/useCaseCatalog'
import '../RepoModal.css'
import { MCP_CLIENTS, MCP_FAQ, MCP_FIND_TOOLS, MCP_PLATFORMS, MCP_PLAY } from './mcpContent'

const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const PLAYS_LIMIT = 6
const platformOf = (id: string) => PLATFORMS.find((platform) => platform.id === id)!
const ICONS = { platform: faXTwitter, meme: faComments, voice: faComments, react: faComments, voiceGate: faComments }
const iconOfTool = (tool: string, kind: keyof typeof ICONS) => (tool === 'getGuide' ? faPlug : ICONS[kind])

function HeroCommand() {
  const line = MCP_CLIENTS[0].lines[0]
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard
      ?.writeText(line)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {})
  }
  return (
    <div className="flex w-full max-w-xl items-center gap-3 rounded-xl bg-[#0D2A4C] px-4 py-3 font-mono text-[13px] text-white shadow-[0_4px_0_#061a33] sm:text-[14px]">
      <span className="text-[#5CA7FF]">$</span>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{line}</span>
      <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy the command'} className="shrink-0 text-white/60 transition-colors hover:text-white">
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      </button>
    </div>
  )
}

const OUTLINE = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2
  return `${(Math.cos(angle) * 5).toFixed(2)}px ${(Math.sin(angle) * 5).toFixed(2)}px 0 #0D2A4C`
})
  .concat('0 8px 0 #0D2A4C')
  .join(',')

const CLAUDE_MASK = {
  maskImage: 'url(/logos/tools/claude-desktop.svg)',
  WebkitMaskImage: 'url(/logos/tools/claude-desktop.svg)',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
}

const LOGO_MASK = { maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }

const TRY_ON = [
  { label: 'Claude Code', icon: '/logos/tools/claude-desktop.svg', color: '#c96442' },
  { label: 'Codex', icon: '/logos/tools/chatgpt.svg', color: '#0D2A4C' },
  { label: 'Cursor', icon: '/logos/tools/cursor.svg', color: '#0D2A4C' },
]

const LEDE_MARK = 'font-black text-white underline decoration-dashed underline-offset-4'

const HERO_PLATFORMS =['x', 'discord', 'slack', 'instagram', 'reddit']

function Hero() {
  return (
    <section aria-label="Hero" className="relative isolate w-full overflow-hidden bg-[#2A8CFF] text-[#0D2A4C]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
        <ClayClouds className="absolute inset-x-0 top-10 h-[30rem] [mask-image:linear-gradient(to_bottom,black_80%,transparent)] md:h-[40rem]" />
        <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} className="absolute inset-x-0 bottom-0 h-[16rem] w-full md:h-[22rem]" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
        <img
          src="/logo.svg"
          alt=""
          className="absolute right-6 top-36 hidden size-24 rotate-[4deg] rounded-[22px] shadow-[0_0_0_5px_#fff,0_0_0_10px_#0D2A4C,0_13px_0_10px_#0D2A4C] md:block lg:size-28"
        />
        <a
          href="/sign-in?returnPath=/console/start"
          className="inline-flex max-w-full items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-1.5 transition-transform hover:-translate-y-px"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2A8CFF]">
            <span aria-hidden className="block size-6 bg-white" style={CLAUDE_MASK} />
          </span>
          <span className="whitespace-nowrap text-[16px] font-black tracking-[-0.01em] text-[#0D2A4C] sm:text-[17px]">Create your log account</span>
          <span aria-hidden className="hidden h-6 border-l-2 border-dashed border-[#B5D6FF] sm:block" />
          <span className="hidden whitespace-nowrap text-[16px] font-medium text-[#0D2A4C]/65 sm:inline sm:text-[17px]">Connect the native MCP to your workspace</span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2A8CFF] text-[15px] text-white">
            <FontAwesomeIcon icon={faArrowRight} />
          </span>
        </a>
        <h1
          className="mt-5 flex origin-left -rotate-2 flex-col gap-2 text-[clamp(3rem,1.6rem+6vw,6rem)] leading-[0.95] text-white [-webkit-text-stroke:2px_#fff]"
          style={{ ...HAND, textShadow: OUTLINE }}
        >
          <span>let claude run</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-3">
            your DMs on
            <span className="flex flex-wrap items-center gap-2.5 [text-shadow:none] md:gap-3">
              {HERO_PLATFORMS.map((id, index) => (
                <span
                  key={id}
                  className={`grid size-[0.85em] place-items-center rounded-[0.22em] bg-white text-[#1E88FF] shadow-[0_0_0_4px_#0D2A4C,0_7px_0_4px_#0D2A4C] ${index % 2 ? 'rotate-[4deg]' : '-rotate-[3deg]'}`}
                >
                  <FontAwesomeIcon icon={platformOf(id).icon} className="text-[0.5em]" />
                </span>
              ))}
            </span>
          </span>
        </h1>
        <p className="text-lede mt-8 max-w-2xl text-white/90">
          Connect your <span className={LEDE_MARK}>X, Discord, Slack, Instagram and Reddit</span> to Claude, Codex or Cursor. Your AI reads your DMs,{' '}
          <span className={LEDE_MARK}>replies in your voice</span> and follows up, and log sends it from your own accounts{' '}
          <span className={LEDE_MARK}>when you say go</span>. No tab switching, no copy and paste.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <HeroCommand />
          <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
            {TRY_ON.map((agent) => (
              <a
                key={agent.label}
                 href="/sign-in?returnPath=/console/start"
                className="inline-flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                <span className="text-[13px] font-medium text-[#0D2A4C]/60">Try on</span>
                <span aria-hidden className="block size-5 shrink-0" style={{ ...LOGO_MASK, maskImage: `url(${agent.icon})`, WebkitMaskImage: `url(${agent.icon})`, backgroundColor: agent.color }} />
                <span className="text-[16px] font-black">{agent.label}</span>
              </a>
            ))}
            <span className="inline-flex items-center gap-2.5 rounded-xl bg-white/15 px-4 py-2.5 text-white">
              <FontAwesomeIcon icon={faLaptop} className="text-[15px]" />
              <span className="flex flex-col leading-tight">
                 <span className="text-[14px] font-bold">Runs in your workspace</span>
                 <span className="text-[12px] text-white/75">Your account sessions stay there</span>
              </span>
            </span>
          </div>
        </div>
        <div className="mx-auto mt-14 w-full max-w-4xl overflow-hidden rounded-[24px] bg-[#F7F9FC] shadow-[0_0_0_4px_#0D2A4C,0_11px_0_4px_#0D2A4C] md:mt-16">
          <div className="flex items-center gap-3 border-b-2 border-[#0D2A4C]/10 bg-white px-5 py-3 text-[18px] font-black md:text-[20px]">
            <span aria-hidden className="block size-6 bg-[#c96442]" style={CLAUDE_MASK} />
            Claude Code
            <span className="ml-auto flex gap-2">
              {[0, 1, 2].map((dot) => (
                <i key={dot} className="size-3 rounded-full bg-[#0D2A4C]/15" />
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-3 px-5 py-5 md:gap-4 md:px-6">
            <p className="ml-auto max-w-[90%] rounded-[20px] bg-[#2A8CFF] px-5 py-3 text-[20px] font-bold leading-tight text-white md:text-[26px]">{MCP_PLAY.ask}</p>
            <p className="max-w-[90%] self-start rounded-[20px] bg-white px-5 py-3 text-[20px] font-bold leading-tight shadow-[0_0_0_2px_rgba(13,42,76,0.1)] md:text-[26px]">
              Done. Everyone waiting on you has a reply in your voice.
            </p>
            <div className="flex flex-wrap gap-3">
              {MCP_PLAY.how.rows.map((row) => (
                <p key={row.who} className="flex items-center gap-2.5 rounded-[16px] bg-white px-4 py-2 text-[17px] font-bold shadow-[0_0_0_2px_rgba(13,42,76,0.1)] md:text-[20px]">
                  {row.who}
                  <em className="rounded-lg bg-[#E8F7EE] px-2.5 py-0.5 text-[14px] font-black not-italic text-[#1E8E4F] md:text-[16px]">{row.status}</em>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlayDemo() {
  return (
    <section aria-label="The play, step by step" className="w-full overflow-x-clip bg-white px-4 pb-8 pt-12 md:px-6 md:pt-16">
      <div className="mx-auto w-full max-w-[86rem]">
        <AgencyIntro />
        <HowItWorks
          ask={MCP_PLAY.ask}
          done={MCP_PLAY.how.done}
          title={MCP_PLAY.name}
          steps={MCP_PLAY.how.steps.map((moment) => ({ icon: iconOfTool(moment.tool, moment.kind), label: moment.label, tool: moment.tool }))}
          platformLabel="X"
          platformIcon={faXTwitter}
          rows={MCP_PLAY.how.rows}
          onWhite
        />
      </div>
    </section>
  )
}

function ToolCard({ name, title, does, badge, icon }: { name: string; title: string; does: string; badge: 'reads' | 'sends' | 'any'; icon: IconDefinition }) {
  return (
    <li className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_0_0_1px_#C9E3FF,0_4px_0_#B5D6FF] transition-transform hover:-translate-y-0.5">
      <span className="flex items-center justify-between gap-3">
        <span className={`grid size-12 place-items-center rounded-xl text-[20px] ${badge === 'sends' ? 'bg-[#2A8CFF] text-white shadow-[0_3px_0_#1A5FC8]' : 'bg-[#EAF3FF] text-[#2A8CFF]'}`}>
          <FontAwesomeIcon icon={icon} />
        </span>
        {badge === 'any' ? null : (
          <span className={`rounded-full px-3 py-1 text-[13px] font-bold ${badge === 'sends' ? 'bg-[#2A8CFF] text-white shadow-[0_2px_0_#1A5FC8]' : 'bg-[#EAF3FF] text-[#1A5FC8]'}`}>
            {badge === 'sends' ? 'Sends when you say go' : 'Only reads'}
          </span>
        )}
      </span>
      <span className="text-[26px] font-black leading-tight tracking-[-0.02em] text-[#0D2A4C]">{title}</span>
      <span className="text-[17px] leading-relaxed text-[#0D2A4C]/75">{does}</span>
      <span className="mt-auto self-start rounded-lg bg-[#F3F6FA] px-2.5 py-1 font-mono text-[13px] text-[#0D2A4C]/70">{name}</span>
    </li>
  )
}

function GroupHeader({ icon, label, note }: { icon: IconDefinition; label: string; note: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-[#2A8CFF] text-[22px] text-white shadow-[0_3px_0_#1A5FC8]">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="text-[32px] font-black leading-none tracking-[-0.03em] text-[#0D2A4C]">{label}</span>
      </span>
      <span className="text-[17px] font-bold text-[#0D2A4C]/60">{note}</span>
      <span aria-hidden className="hidden h-0.5 flex-1 border-t-2 border-dashed border-[#D6E8FF] sm:block" />
    </div>
  )
}

function Platforms() {
  return (
    <section id="tools" aria-label="What your agent can do" className="w-full scroll-mt-24 bg-white px-4 pb-24 pt-20 text-[#0D2A4C] md:px-6 md:pb-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-title max-w-4xl">
            The tools your agent
            <br />
            <span className={STICKER}>reaches for.</span>
          </h2>
          <p className="text-lede max-w-2xl text-[#0D2A4C]/70">
            A few on each platform. Every other log command is a tool too. Tools that read are safe to call; tools that send wait until you say go.
          </p>
        </div>
        {MCP_PLATFORMS.map((item) => {
          const platform = platformOf(item.platformId)
          return (
            <div key={item.platformId} className="flex flex-col gap-4">
              <GroupHeader icon={platform.icon} label={platform.label} note={`${item.tools.length} tools your agent uses here`} />
              <ul className="grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
                {item.tools.map((tool) => (
                  <ToolCard key={tool.name} name={tool.name} title={tool.title} does={tool.does} badge={tool.acts ? 'sends' : 'reads'} icon={platform.icon} />
                ))}
              </ul>
              <a href={item.path} className="inline-flex items-center gap-1.5 self-start text-[14px] font-bold text-[#2A8CFF] hover:underline">
                Everything log does on {platform.label}
                <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
              </a>
            </div>
          )
        })}
        <div className="flex flex-col gap-4">
          <GroupHeader icon={faPlug} label="Any other command" note="so your agent never has to guess which tool" />
          <ul className="grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-3">
            {MCP_FIND_TOOLS.map((tool) => (
              <ToolCard key={tool.name} name={tool.name} title={tool.title} does={`It ${tool.does}.`} badge="any" icon={faPlug} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const ASKED = USE_CASES.filter((useCase) => useCase.asks.length > 0)

function Plays() {
  const [all, setAll] = useState(false)
  const shown = all ? ASKED : ASKED.slice(0, PLAYS_LIMIT)
  return (
    <section id="plays" className="w-full scroll-mt-24 bg-[#F7FAFD] px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <h2 className="text-title text-center text-[#0D2A4C]">
          Plays your agent <span className={STICKER}>runs.</span>
        </h2>
        <p className="text-lede max-w-2xl text-center text-[#0D2A4C]/70">Say it the way you’d say it to a person. Your agent finds the play and runs it step by step.</p>
        <ul className="grid w-full list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((useCase) => {
            const platform = PLATFORMS.find((item) => item.id === useCase.platform)
            return (
              <li key={useCase.page} className="flex flex-col gap-4 rounded-3xl border border-[#E1E8F0] bg-white p-4 shadow-[0_3px_0_#E1E8F0]">
                <h3 className="lk-repo px-2 pt-2 text-[2rem] leading-[1.2]">
                  <span className="lk-bluekey">{useCase.title} on</span>{' '}
                  <span className="inline-flex items-center gap-2 whitespace-nowrap align-middle">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#2A8CFF] text-[18px] text-white shadow-[0_3px_0_#1A5FC8]">
                      <FontAwesomeIcon icon={platform ? platform.icon : faComments} />
                    </span>
                    <span className="lk-bluekey">{platform ? platform.label : 'every chat'}</span>
                  </span>
                </h3>
                <p className="-mt-2 px-1 text-[15px] leading-snug text-[#0D2A4C]/70">{useCase.does}</p>
                <div className="flex flex-col gap-2 rounded-2xl bg-[#F3F6FA] p-4">
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[#0D2A4C]/60">
                    <img src="/logo.svg" alt="" className="size-5 rounded-md" />
                    How you ask for it
                  </span>
                  <span className="self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[17px] leading-snug text-[#0D2A4C] shadow-[0_2px_0_#E1E8F0]" style={HAND}>
                    “{useCase.asks[0]}”
                  </span>
                </div>
                <a
                  href={`/docs/useCases/${useCase.page}`}
                  className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2A8CFF] px-3 py-3 text-[14px] font-bold text-white shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
                >
                  Every step
                  <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
                </a>
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {ASKED.length > PLAYS_LIMIT ? (
            <button
              type="button"
              onClick={() => setAll((current) => !current)}
              className="rounded-xl bg-white px-4 py-2 text-[14px] font-bold text-[#0D2A4C] shadow-[0_0_0_1px_#E1E8F0,0_3px_0_#E1E8F0] transition-transform hover:-translate-y-px"
            >
              {all ? 'Show fewer' : `+ ${ASKED.length - PLAYS_LIMIT} more plays`}
            </button>
          ) : null}
          <a href="/docs/useCases" className="button-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-bold text-white shadow-[0_3px_0_#1A5FC8]">
            Every use case
            <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
          </a>
        </div>
      </div>
    </section>
  )
}

export function McpPage() {
  useEffect(() => {
    const previous = document.title
    document.title = 'The log MCP · log by ListeningKit'
    return () => {
      document.title = previous
    }
  }, [])
  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      <SiteHeader cta={{ href: '/sign-in?returnPath=/console/start', label: 'Create account' }} />
      <Hero />
      <PlayDemo />
      <Control
        title={
          <>
            Every log command,
            <br className="hidden sm:block" /> <span className={STICKER}>as a tool.</span>
          </>
        }
        lede={
          <>
            Anything that sends is its own <Dashed>Live tool</Dashed> and needs <Dashed>confirmLive: true</Dashed>. Everything else is a read or a dry run.
          </>
        }
        platformLabel="your agent"
        showSession={false}
      />
      <ThreeSteps play={MCP_PLAY} platform={{ ...platformOf('x'), label: 'AI agent' }} icon={faPlug} />
      <Platforms />
      <CtaBand>
        <LogWith />
      </CtaBand>
      <div className="quick-answers">
        <StoryFaq title="The log MCP: quick answers" items={MCP_FAQ} />
        <Byline />
      </div>
      <Plays />
      <PromptCta title="Add log to your agent" ask={MCP_PLAY.ask} isCommand={false} />
      <MoreUseCases current={null} />
      <SiteFooter />
    </div>
  )
}
