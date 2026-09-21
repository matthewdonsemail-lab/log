import type { CSSProperties, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveLandingWebsite } from '@/pages/onboarding/auth-handoff'
import { Clouds } from './Clouds'
import { Control } from './Control'
import { Header } from './Header'
import { Pricing } from './Pricing'
import { ListeningIntro } from './ListeningIntro'
import { PlugTooltip } from './PlugTooltip'
import { Socials } from './Socials'
import { Usecase } from './Usecase'

const PLUGS = [
  {
    href: '/docs/guide/mcp.html#chatgpt',
    label: 'ChatGPT',
    src: '/logos/tools/chatgpt.svg',
    setup: 'ChatGPT connectors cannot send an API key yet, so it is not supported. Sign-in for ChatGPT is planned.',
  },
  {
    href: '/docs/guide/mcp.html#claude-code',
    label: 'Claude',
    src: '/logos/tools/claude-desktop.svg',
    setup: 'Add the listeningkit MCP server to Claude Code or Claude Desktop with an API key, then ask about your matches.',
  },
  {
    href: '/docs/guide/mcp.html#cursor',
    label: 'Cursor',
    src: '/logos/tools/cursor.svg',
    setup: 'Add the listeningkit MCP server to Cursor and its agent can read your matches and manage your phrases.',
  },
  {
    href: '/docs/guide/mcp.html#hermes',
    label: 'Hermes',
    src: '/logos/tools/hermes.svg',
    setup: 'Register the listeningkit MCP server in Hermes to query your matches from your workflows.',
  },
  {
    href: '/docs/guide/mcp.html#any-other-mcp-client',
    label: 'MCP',
    src: '/logos/tools/mcp.svg',
    setup: 'Point any MCP client at the listeningkit server. Read-only keys can only read.',
  },
]

/**
 * Landing page — header plus the drifting cloud band for now.
 * Sections get built out in <main> as the landing page takes shape.
 */
export function LandingPage() {
  const navigate = useNavigate()

  // The website form leads into onboarding: keep what was typed, and it is waiting in the brand step after sign-in.
  function startOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const site = new FormData(event.currentTarget).get('website')
    if (typeof site === 'string') saveLandingWebsite(site)
    navigate('/onboarding')
  }

  return (
    <div
      className="flex min-h-screen flex-col text-white"
      style={{ backgroundColor: '#2a8cff', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
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
        className="z-[70]"
        navItems={[]}
        accountItems={[
          { href: '/sign-in', label: 'Sign in', variant: 'ghost' },
          { href: '/onboarding', label: 'Get started', variant: 'cta' },
        ]}
      />
      <div aria-hidden className="h-24 shrink-0" />
      <Clouds>
        <div
          className="flex flex-col items-center px-12 py-10 text-center sm:px-20 sm:py-12"
          style={{ background: 'radial-gradient(ellipse at center, #2a8cff 45%, transparent 72%)' }}
        >
          <img src="/logo.svg" alt="ListeningKit logo" className="size-20 shrink-0 rounded-[20px] object-contain sm:size-24" />
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            Listen to what your customers are really saying.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-snug text-white/80 sm:text-xl">
            The only free social listening tool on your terms.
          </p>
          <form
            className="mt-7 flex w-full items-center gap-2 rounded-[14px] bg-white py-[5px] pl-4 pr-[5px] sm:mt-8 sm:gap-2.5 sm:py-[7px] sm:pl-[26px] sm:pr-[7px]"
            onSubmit={startOnboarding}
          >
            <input
              name="website"
              aria-label="Your website"
              placeholder="Enter your website"
              className="min-w-0 grow bg-transparent text-[16px] leading-[1.3] text-[#0D2A4C] outline-none placeholder:text-[#0D2A4C]/60 sm:text-[17px]"
            />
            <span className="relative flex h-[46px] flex-col sm:h-[54px]">
              <img
                src="/images/FindNewCustomers.png"
                alt="Find new customers"
                className="pointer-events-none absolute bottom-full right-[-3rem] z-10 mb-2 w-24 max-w-none rotate-3 drop-shadow-lg sm:right-[-4rem] sm:w-32"
              />
              <button
                type="submit"
                className="flex h-[42px] shrink-0 cursor-pointer items-center rounded-[10px] bg-[#2A8CFF] px-4 text-white shadow-[0_4px_0_0_#1F6FE6] transition-transform duration-100 active:translate-y-1 active:shadow-none sm:h-[50px] sm:px-[24px]"
              >
                <span className="whitespace-nowrap text-[16px] font-medium leading-[1.3] sm:text-[17px]">
                  Get started
                </span>
              </button>
            </span>
          </form>
          <div className="plugs is-visible mt-6 flex w-full flex-row items-center justify-start gap-4" data-reveal="load" style={{ '--d': '320ms' } as CSSProperties}>
            <p className="plugs-text text-sm font-medium uppercase tracking-[0.2em] text-white/70">Works with</p>
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
      </Clouds>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-10">
        <Pricing />
      </main>
      <section
        id="features"
        className="w-full pb-16"
        style={{ background: 'linear-gradient(to bottom, #2a8cff 0%, #2a8cff 40%, #ffffff 100%)' }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start px-6 pt-16 sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">Built with</p>
          <ul className="mt-5 flex list-none flex-wrap items-center gap-x-8 gap-y-4 p-0">
            {[
              { label: 'OpenMagPie', src: '/logos/stack/openmagpie.png', whiten: true, showLabel: true },
              { label: 'Convex', src: '/logos/stack/convex.svg', whiten: false, showLabel: false },
              { label: 'Firecrawl', src: '/logos/stack/firecrawl.svg', whiten: true, showLabel: true },
              { label: 'Treg', src: '/logos/stack/treg.svg', whiten: false, showLabel: true },
              { label: 'TypeSafe', src: '/logos/tools/typesafe.svg', whiten: true, showLabel: true },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <img
                  src={item.src}
                  alt={item.showLabel ? '' : item.label}
                  className={`h-8 w-auto sm:h-9 ${item.whiten ? 'brightness-0 invert' : ''}`}
                />
                {item.showLabel ? (
                  <span className="text-base font-bold text-white">{item.label}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ListeningIntro />
      <Usecase />
      <Socials />
      <Control />
    </div>
  )
}
