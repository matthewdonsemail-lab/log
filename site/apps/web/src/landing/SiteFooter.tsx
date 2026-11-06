import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faGithub, faInstagram, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { AskAi, askAiGeneralPrompt } from './PlatformSuite'
import { LOG_REPO_URL, RepoLink } from './RepoLink'

type FooterLink = { label: string; href: string; icon?: IconDefinition }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Platforms',
    links: [
      { label: 'X', href: '/twitter', icon: faXTwitter },
      { label: 'Instagram', href: '/instagram', icon: faInstagram },
      { label: 'Slack', href: '/slack', icon: faSlack },
      { label: 'Discord', href: '/discord', icon: faDiscord },
      { label: 'Reddit', href: '/reddit', icon: faRedditAlien },
    ],
  },
  {
    title: 'log',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Use cases', href: '/useCases' },
      { label: 'Get log', href: LOG_REPO_URL, icon: faGithub },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Install', href: '/docs/getStarted/install' },
      { label: 'Connect your agent', href: '/docs/getStarted/mcp' },
      { label: 'Use cases', href: '/docs/useCases' },
      { label: 'Reference', href: '/docs/reference/reference' },
    ],
  },
  {
    title: 'For machines',
    links: [
      { label: 'Sitemap', href: '/sitemap.xml' },
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'robots.txt', href: '/robots.txt' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#2A8CFF] px-4 pb-10 pt-14 text-white md:px-6 md:pt-20">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
        <div className="flex flex-col items-start gap-4">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="size-11 rounded-xl" />
            <span className="text-2xl font-black tracking-[-0.03em]">log</span>
          </a>
          <p className="max-w-xs text-[15px] leading-snug text-white/85">
            by <span className="font-bold text-white">ListeningKit</span>. Your agent runs your social media marketing, in your own voice, from your own accounts.
          </p>
          <AskAi prompt={askAiGeneralPrompt()} about="your social media marketing" placement="top-start" />
        </div>
        <div className="grid grid-cols-2 gap-8 md:contents">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-2xl text-white" style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}>{column.title}</p>
              {column.links.map((link) => (
                <RepoLink key={link.label} href={link.href} className="flex items-center gap-2 text-[15px] font-bold text-white/85 transition-colors hover:text-white">
                  {link.icon ? <FontAwesomeIcon icon={link.icon} className="w-4 text-[14px]" /> : null}
                  {link.label}
                </RepoLink>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-6 text-[13px] text-white/75">
        <span>© {new Date().getFullYear()} ListeningKit. log is open source.</span>
        <span>log.listeningkit.com</span>
      </div>
    </footer>
  )
}
