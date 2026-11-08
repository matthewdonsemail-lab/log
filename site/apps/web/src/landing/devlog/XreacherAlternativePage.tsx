import { useEffect, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { LOG_REPO_URL, RepoLink, parseRepoUrl } from '../RepoLink'
import { DitherFade } from '../useCases/DitherFade'
import { PromptCta } from '../useCases/UseCasesPage'
import { Control } from '../Control'
import { pageForPlatform } from '../useCases/platformPages'
import { CompareTable, Receipt, STICKER, StoryCta, StoryFaq, StoryImage, StoryKicker, StorySection, type FaqItem } from '../story/StorySections'
import { XREACHER_ALTERNATIVE } from './xreacherAlternative'
import { articleOf, articleSchema } from './articles'

const HAND = { fontFamily: "'Schoolbell', cursive" }
const X_LINK = 'font-bold text-[#2A8CFF] underline decoration-dashed underline-offset-4 hover:text-[#1A5FC8]'

function XPage({ children }: { children: ReactNode }) {
  return (
    <a href="/twitter" className={X_LINK}>
      {children}
    </a>
  )
}

function Doc({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={`/docs/${to}`} className={X_LINK}>
      {children}
    </a>
  )
}
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
const X_PAGE = { ...pageForPlatform('x')!, play: XREACHER_ALTERNATIVE }
const ARTICLE = articleOf('xreacher-alternative')
export const XREACHER_FAQ: FaqItem[] = [
  {
    q: 'What is the best Xreacher alternative?',
    a: "If you want to automate X (Twitter) DMs from your own accounts without a monthly bill, log. It's free and open source, runs from Claude Code, Codex or Cursor, reads your X DMs and X Chat, and sends only when you approve.",
  },
  {
    q: 'How much does Xreacher cost?',
    a: 'Pro is $67 a month for one account per platform, $135 for five and $189 for ten. Scale is $299 a month for 100 accounts up to $1,299 for 1,000. Aged X accounts bought from Xreacher cost $3.50 to $10 each.',
  },
  {
    q: 'Is log free?',
    a: "Yes. log is open source under the MIT license. It runs on your own machine with your own accounts, so there's no seat fee and no plan to upgrade.",
  },
  {
    q: 'Do I need proxies to automate Twitter messages with log?',
    a: "No. log talks to X directly through one session per account, the way X's own web app does, so X needs no proxy. For platforms that do need one, you bring your own. We use Byteful.",
  },
  {
    q: 'Do I need to buy X accounts?',
    a: 'No. log runs on the accounts you already have. Xreacher asks for an X account at least 6 months old with X Premium, or sells aged accounts at $3.50 to $10 each.',
  },
  {
    q: 'Does log read X Chat, the encrypted DMs?',
    a: 'Yes. log reads the old X DM inbox and the encrypted X Chat inbox together, so your agent sees the whole thread before it drafts a reply.',
  },
  {
    q: 'Will it send messages without me?',
    a: 'No. Anything that sends is a dry run until you approve it, and a live send needs your explicit go-ahead.',
  },
]
export const XREACHER_SCHEMA = articleSchema(ARTICLE, XREACHER_FAQ)

function LogoChip() {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 align-middle text-[0.9em] font-bold leading-none text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8]">
      <img src="/logo.svg" alt="" className="size-[1.05em] shrink-0 rounded-[22%]" />
      log
    </span>
  )
}

function useMeta() {
  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    document.title = ARTICLE.title
    meta?.setAttribute('content', ARTICLE.description)
    const prerendered = document.getElementById('devlog-schema')
    const schema = prerendered ? null : document.createElement('script')
    if (schema) {
      schema.type = 'application/ld+json'
      schema.text = JSON.stringify(XREACHER_SCHEMA)
      document.head.appendChild(schema)
    }
    return () => {
      schema?.remove()
      document.title = previousTitle
      if (meta && previousDescription !== null) meta.setAttribute('content', previousDescription)
    }
  }, [])
}

function Hero() {
  return (
    <section aria-label="Hero" className="relative isolate w-full overflow-hidden text-left">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#2A8CFF]">
        <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
        <ClayClouds className="absolute inset-x-0 top-12 h-[26rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:top-14 md:h-[36rem]" />
        <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} className="absolute inset-x-0 bottom-0 h-40 w-full md:h-56" />
      </div>
      <div className="mx-auto w-full max-w-[86rem] px-4 pb-48 pt-72 md:px-6 md:pb-64 md:pt-[26rem]">
        <div className="grid items-end gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2.75rem,1.4rem+4.2vw,5.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
              <span className="block">The Xreacher alternative</span>
              <span className="block text-white/65">I built because it didn&apos;t work.</span>
            </h1>
            <div className="flex items-center gap-3 text-white">
              <img
                src="/images/mattlistening.webp"
                alt="Matthew Don"
                className="size-12 shrink-0 rounded-full object-cover ring-[3px] ring-white shadow-[0_3px_0_#1A5FC8]"
              />
              <p className="text-[16px] leading-tight">
                <span className="block font-black">By Matthew Don</span>
                <span className="text-white/75">
                  Published <time dateTime={ARTICLE.published}>{ARTICLE.publishedLabel}</time>
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-6 md:pb-2">
            <p className="text-2xl leading-tight text-white sm:text-3xl" style={HAND}>
              I wanted my X DMs automated. <span className="text-white/70">Xreacher never got going.</span>
            </p>
            <p className="text-lede text-white/85">
              <LogoChip /> is free and open source. It reads your <a href="/twitter" className="font-black text-white underline decoration-dashed underline-offset-4">X DMs and X Chat</a>, drafts in your voice and sends only when you say yes, from your
              own accounts on your own machine.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <RepoLink
                href={LOG_REPO_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[16px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                Set up log
                <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
              </RepoLink>
              <a href="#story" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-[16px] font-bold text-white shadow-[0_3px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-white/25">
                Read what happened
                <FontAwesomeIcon icon={faAnglesRight} className="text-[13px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function XreacherStory() {
  return (
    <article id="story" className="w-full bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 md:px-6">
        <StoryKicker>
          why would you <span className={STICKER}>pay</span> monthly to DM people from accounts you also have to buy?
        </StoryKicker>
        <div className="mt-6 rounded-2xl bg-[#F3F8FF] px-5 py-5 sm:px-6">
          <h2 className="text-[22px] font-black tracking-[-0.02em] text-[#0D2A4C]">The short version</h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[17px] leading-relaxed text-[#0D2A4C]/85">
            <li>Xreacher costs $67 to $1,299 a month, plus X accounts at $3.50 to $10 each, plus your own proxies.</li>
            <li>log is free and open source (MIT), runs on your own X accounts, and needs no proxy for X.</li>
            <li>I signed up for Xreacher on 17 July 2026 and my X account never connected.</li>
            <li>
              If you want to automate Twitter DMs from your own accounts, log is the Xreacher alternative to try first.
            </li>
          </ul>
        </div>
      </div>

      <StorySection id="looking" title="I was looking for exactly this." punch="something to automate my X DMs">
        <p>
          In July I wanted my X outreach automated: find the right people, open a conversation, follow up, and let me step in when someone
          answers. I wanted to automate Twitter messages without sitting in the inbox all day. Xreacher kept coming up on lists of the best cold DM
          tools, so I signed up on 17 July 2026.
        </p>
        <p>It covers X, Telegram and LinkedIn from one dashboard, with lead scraping, AI openers, follow-ups and a bot that answers replies.</p>
      </StorySection>

      <StorySection id="tried" title="I put my details in. It didn't work." punch="not on X, not on Telegram">
        <p>
          To connect an X account it wants your username, email, password and 2FA secret key, plus a proxy. The account has to be at least 6
          months old and on X Premium at $8 a month.
        </p>
        <p>
          I put it all in and the account never connected. Telegram didn&apos;t work for me either. The next day their email landed: &ldquo;Saw you
          haven&apos;t connected your X account yet.&rdquo; My dashboard still says no campaign created, from July to today.
        </p>
        <StoryImage
          src="/images/devlog/xreacherSignupEmail.webp"
          alt="Xreacher's welcome email to Matthew, 17 July 2026: You signed up for Xreacher"
          caption="Their welcome email, 17 July 2026"
        />
        <p>To be honest, it probably works now. But back when I used it, it didn&apos;t.</p>
      </StorySection>

      <StoryCta page={X_PAGE} href={LOG_REPO_URL} title="Want your X DMs automated without the dashboard?" />

      <StorySection id="price" title="Then I looked at the price." punch="and what you're paying for">
        <p>The monthly plans, from Xreacher&apos;s own pricing page:</p>
        <Receipt
          title="Xreacher, per month"
          rows={[
            { label: 'Pro, 1 account per platform', value: '$67' },
            { label: 'Pro, 5 accounts', value: '$135' },
            { label: 'Pro, 10 accounts', value: '$189' },
            { label: 'Scale, 100 accounts', value: '$299' },
            { label: 'Scale, 1,000 accounts', value: '$1,299' },
          ]}
          total={{ label: 'log, any number of accounts', value: '$0' }}
        />
        <p>
          That&apos;s before the accounts. Their emails sell you aged, warmed X accounts with Premium to send from, and pitch a $297 call to fix
          your campaign.
        </p>
        <Receipt
          title="X accounts from Xreacher"
          rows={[
            { label: '1 to 49 accounts', value: '$10 each' },
            { label: '50 to 99', value: '$7 each' },
            { label: '100 to 499', value: '$5 each' },
            { label: '500 to 1,000', value: '$3.50 each' },
          ]}
        />
      </StorySection>

      <StorySection id="accounts" title="So I priced accounts myself." punch="it's the same market">
        <p>
          We looked at who else sells X accounts. Public listings in November 2026 put fresh accounts at $5 to $20, aged accounts with a few
          thousand followers at $50 to $300, and the cheapest single account we found at $2.59. Premium is another $8 a month on every one.
        </p>
        <p>
          It&apos;s not a good deal anywhere. You&apos;re renting someone else&apos;s accounts to talk to people as if they were you, and paying a
          monthly fee on top to press send.
        </p>
      </StorySection>

      <StorySection id="proxies" title="And you bring your own proxies." punch="one more bill">
        <p>
          Connect more than one account and Xreacher wants your own Twitter proxies, active and in the right format. That&apos;s a third thing to buy and
          keep alive.
        </p>
        <p>
          With log, <Doc to="platforms/x">X doesn&apos;t need a proxy at all</Doc>: every account talks to X directly, through one session, the way X&apos;s own web app does.
          For the platforms that do need one, <Doc to="howItWorks/proxies">we use Byteful</Doc>.
        </p>
        <Receipt
          title="What we pay Byteful"
          rows={[
            { label: 'Residential, 10 GB plan', value: '$3.25/GB' },
            { label: 'Residential, 100 GB plan', value: '$2.75/GB' },
            { label: 'Static IP, per month', value: '$3' },
            { label: 'One account, a day and a half of testing', value: '957 MB', note: 'about $3.11' },
          ]}
        />
      </StorySection>

      <StorySection id="built" title="So I built my own." punch="it was free and cheap to run">
        <p>
          log is the Xreacher alternative I wanted: a CLI and an <Doc to="getStarted/mcp">MCP server</Doc> that runs <XPage>your X account</XPage> from your agent. You point Claude Code, Codex or Cursor at it and say what you want:
          &ldquo;read my X DMs and X Chat, draft a reply to Jay, and wait for my approval.&rdquo; It <XPage>reads both X inboxes</XPage>, checks the draft against
          <Doc to="howItWorks/specs/voiceGate">how you actually write</Doc>, and sends nothing until you say yes.
        </p>
        <CompareTable
          them="Xreacher"
          us="log"
          rows={[
            { what: 'Price', them: '$67 to $1,299 a month', us: 'Free, MIT licensed' },
            { what: 'Accounts', them: '6+ months old with Premium, or bought from them at $3.50 to $10', us: 'Your own accounts' },
            { what: 'Proxies', them: 'Theirs for one account, yours for more', us: 'None for X, Byteful where needed' },
            { what: 'Your login', them: 'Username, email, password and 2FA secret in their dashboard', us: 'Your session stays on your machine' },
            { what: 'Where it runs', them: 'Their web app', us: 'Your terminal and your AI agent' },
            { what: 'Platforms', them: 'X, Telegram, LinkedIn', us: 'X, Discord, Slack, Instagram, Reddit' },
          ]}
        />
      </StorySection>

      <StorySection id="fast" title="It's fast because it reads from your machine." punch="and your accounts stay quiet">
        <p>
          Every account keeps <Doc to="howItWorks/liveInbox">one live connection to its platform</Doc>, the same push channel X&apos;s own app
          listens on, and everything that comes in or goes out is written once to a local database on your machine. When your agent wants a
          thread, it reads that database, not X.
        </p>
        <p>
          So the only network traffic is your account&apos;s own client talking to the platform. No dashboard in the middle, no second login, no
          polling. Fewer connections and fewer cold starts look less like a bot, so the account is less likely to get burnt.
        </p>
        <Receipt
          title="Reading one chat, typical time"
          rows={[
            { label: 'An X thread, asked from X', value: '11 s' },
            { label: 'The same thread, from the local database', value: '25 ms' },
            { label: 'A Discord chat, asked from Discord', value: '91 s' },
            { label: 'The same chat, from the local database', value: '0.6 ms', note: 'measured 7 November 2026' },
          ]}
        />
      </StorySection>

      <StorySection id="own" title="We're in the age of owning your stuff." punch="your accounts, your agent, your machine">
        <p>
          A few years ago you needed a SaaS dashboard to <XPage>automate X DMs</XPage>. Now an agent on your own laptop can read the thread, write in your voice
          and send through your own account. No seat fees, no rented accounts, nobody else holding your password.
        </p>
        <p>
          That&apos;s why log is open source. <Doc to="getStarted/install">Install it</Doc>, fork it, and if it breaks, open an issue and we fix it in
          the open.
        </p>
      </StorySection>

      <StoryFaq title="Xreacher alternative: questions" items={XREACHER_FAQ} />

      <StoryCta page={X_PAGE} href={LOG_REPO_URL} title="Run it on your own X account tonight." />
    </article>
  )
}

export function XreacherAlternativePage() {
  useMeta()
  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        githubRepo={`${LOG_REPO.owner}/${LOG_REPO.repo}`}
        className="z-[70]"
        accountItems={[{ href: LOG_REPO_URL, label: 'Set up log', variant: 'cta' }]}
      />
      <Hero />
      <XreacherStory />
      <Control />
      <PromptCta title="Try log on your own X DMs" ask={XREACHER_ALTERNATIVE.ask} isCommand={false} install="curl -fsSL https://log.listeningkit.com/install.sh | sh" />
      <SiteFooter />
    </div>
  )
}
