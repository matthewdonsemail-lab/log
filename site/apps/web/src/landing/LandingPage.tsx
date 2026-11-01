import type { CSSProperties } from 'react'
import { BigGithubButton } from './BigGithubButton'
import { ClayClouds } from './ClayClouds'
import { Control } from './Control'
import { GoGettersCta } from './GoGettersCta'
import { Header } from './Header'
import { HowWeThink } from './HowWeThink'
import { ListeningIntro } from './ListeningIntro'
import { OtherCases } from './OtherCases'
import { PlatformSuite } from './PlatformSuite'
import { PlugTooltip } from './PlugTooltip'
import { LOG_REPO_URL, parseRepoUrl } from './RepoLink'
import { Socials } from './Socials'
import { Usecase } from './Usecase'
import { Unemployed } from './Unemployed'
import { Rasputin } from './rasputin'

const PLUGS = [
  {
    href: '/docs/getStarted/mcp#claude-code',
    label: 'Claude',
    src: '/logos/tools/claude-desktop.svg',
    setup: 'claude mcp add log -- logMcp, and Claude Code runs every log command as a tool.',
  },
  {
    href: '/docs/getStarted/mcp#codex',
    label: 'Codex',
    src: '/logos/tools/chatgpt.svg',
    setup: 'codex mcp add log -- logMcp, and Codex runs every log command as a tool.',
  },
  {
    href: '/docs/getStarted/mcp#cursor',
    label: 'Cursor',
    src: '/logos/tools/cursor.svg',
    setup: 'Add logMcp to the MCP servers in Cursor, and its agent runs every log command as a tool.',
  },
  {
    href: '/docs/getStarted/mcp#any-other-mcp-client',
    label: 'MCP',
    src: '/logos/tools/mcp.svg',
    setup: 'Any MCP client: the command is logMcp. Anything that acts on an account needs your confirmation.',
  },
]

const BUILT_WITH: { label: string; role: string; src: string }[] = [
  { label: 'SubQ', role: 'reads what each step did', src: '/logos/stack/subq.svg' },
  { label: 'Treg', role: 'finds people, groups and facts', src: '/logos/stack/treg.svg' },
  { label: 'Twenty', role: 'holds your accounts', src: '/logos/stack/twenty.svg' },
  { label: 'AdsPower', role: 'one browser per account', src: '/logos/stack/adspower-mark.png' },
]

const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!

export function LandingPage() {
  return (
    <div
      className="flex min-h-screen flex-col text-white"
      style={{ backgroundColor: '#ffffff', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[46rem]"
        style={{
          background:
            'radial-gradient(ellipse 130% 100% at 50% 0%, rgba(92,167,255,0.8) 0%, transparent 80%)',
        }}
      />
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        githubRepo={`${LOG_REPO.owner}/${LOG_REPO.repo}`}
        className="z-[70]"
        accountItems={[{ href: LOG_REPO_URL, label: 'Get started', variant: 'cta' }]}
      />
      <div style={{ backgroundColor: '#2a8cff' }}>
      <div aria-hidden className="h-24 shrink-0" />
      <ClayClouds>
        <div
          className="flex flex-col items-center px-12 py-10 text-center sm:px-20 sm:py-12"
          style={{ background: 'radial-gradient(ellipse at center, #2a8cff 45%, transparent 72%)' }}
        >
          <img src="/logo.svg" alt="ListeningKit logo" className="size-20 shrink-0 rounded-[20px] object-contain sm:size-24" />
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            The best tool for social media marketing.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-snug text-white/80 sm:text-xl">
            Listen, reply, DM, post and run listings across every account you have. Free, open source, and built for marketers working at scale.
          </p>
          {/* The big GitHub button replaces the old website form; the "Find new customers" note points at it. */}
          <div className="relative mt-7 w-full sm:mt-8">
            <img
              src="/images/FindNewCustomers.png"
              alt="Find new customers"
              className="pointer-events-none absolute bottom-full right-[-1.5rem] z-10 mb-1 w-24 max-w-none rotate-3 drop-shadow-lg sm:right-[-3rem] sm:w-32"
            />
            <BigGithubButton tone="white" />
          </div>
          <div className="plugs is-visible mt-6 flex w-full flex-row items-center justify-start gap-4" data-reveal="load" style={{ '--d': '320ms' } as CSSProperties}>
            <p className="plugs-text text-sm font-medium uppercase text-white/70">Works with</p>
            <ul className="plugs-row m-0 flex list-none items-center gap-4 p-0">
              {PLUGS.map((plug) => (
                <li key={plug.label}>
                  <PlugTooltip label={plug.label} setup={plug.setup} docsHref={plug.href} src={plug.src}>
                    <a href={plug.href} target="_blank" rel="noopener noreferrer" aria-label={plug.label} title={plug.label} className="flex items-center transition-opacity hover:opacity-70">
                      <img src={plug.src} alt="" width="22" height="22" className="brightness-0 invert" />
                    </a>
                  </PlugTooltip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ClayClouds>
      </div>
      <section
        id="features"
        className="w-full pb-16"
        style={{ background: 'linear-gradient(to bottom, #2a8cff 0%, #2a8cff 40%, #ffffff 100%)' }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start px-6 pt-16 sm:px-10">
          <p className="text-sm font-medium uppercase text-white/80">Built with</p>
          <ul className="mt-5 flex list-none flex-wrap items-start gap-x-10 gap-y-5 p-0">
            {BUILT_WITH.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-white p-1.5 shadow-[0_3px_0_#B5D6FF] sm:size-10">
                  <span
                    className="size-full bg-[#2A8CFF]"
                    style={{
                      maskImage: `url(${item.src})`,
                      WebkitMaskImage: `url(${item.src})`,
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }}
                  />
                </span>
                <span className="flex flex-col text-left leading-tight">
                  <span className="text-base font-bold text-white">{item.label}</span>
                  <span className="text-sm text-white/75">{item.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PlatformSuite />
      <ListeningIntro />
      <Usecase />
      <Socials />
      <Control />
      <HowWeThink />
      <GoGettersCta />
      <OtherCases />
      <Unemployed />
      <Rasputin />
    </div>
  )
}
