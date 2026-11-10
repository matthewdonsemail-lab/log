import { useEffect } from 'react'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { LOG_REPO_URL, parseRepoUrl } from '../RepoLink'
import { DitherFade } from '../useCases/DitherFade'
import { DEVLOG_ARTICLES, devlogImage, devlogPath } from './articles'

const HAND = { fontFamily: "'Schoolbell', cursive" }
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
export const DEVLOG_TITLE = 'Devlog · log by ListeningKit'
export const DEVLOG_DESCRIPTION = 'What Matthew Don tried, what it cost, why it didn\'t work, and what he built into log instead. Free, open source, his own accounts.'

export function DevlogList() {
  const articles = [...DEVLOG_ARTICLES].sort((a, b) => b.published.localeCompare(a.published))
  return (
    <ul className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 md:px-6">
      {articles.map((article) => (
        <li key={article.slug}>
          <a href={devlogPath(article.slug)} className="group flex flex-col gap-4">
            <img
              src={devlogImage(article.slug)}
              alt={article.headline}
              loading="lazy"
              className="aspect-[1200/630] w-full rounded-2xl object-cover shadow-[0_4px_0_#C8D5E6] transition-transform group-hover:-translate-y-0.5"
            />
            <h2 className="text-[clamp(1.75rem,1.3rem+1.8vw,2.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-[#0D2A4C] group-hover:text-[#2A8CFF]">
              {article.headline}
            </h2>
            <p className="text-[18px] leading-relaxed text-[#0D2A4C]/80">{article.summary}</p>
            <span className="flex items-center gap-3">
              <img src="/images/mattlistening.webp" alt="" className="size-9 rounded-full object-cover ring-2 ring-white shadow-[0_2px_0_#C8D5E6]" />
              <span className="text-[15px] text-[#0D2A4C]/60">
                <span className="font-bold text-[#0D2A4C]">{article.author}</span> · <time dateTime={article.published}>{article.publishedLabel}</time>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function DevlogIndexPage() {
  useEffect(() => {
    const previous = document.title
    document.title = DEVLOG_TITLE
    return () => {
      document.title = previous
    }
  }, [])
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
      <section aria-label="Hero" className="relative isolate w-full overflow-hidden text-left">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#2A8CFF]">
          <ClayClouds className="absolute inset-x-0 top-12 h-[20rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:h-[26rem]" />
          <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} className="absolute inset-x-0 bottom-0 h-32 w-full md:h-44" />
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-56 md:px-6 md:pb-52 md:pt-72">
          <h1 className="text-[clamp(3rem,2rem+4vw,5.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">Devlog</h1>
          <p className="mt-4 text-2xl leading-tight text-white sm:text-3xl" style={HAND}>
            what I tried, what it cost, and what I built instead.
          </p>
        </div>
      </section>
      <DevlogList />
      <SiteFooter />
    </div>
  )
}
