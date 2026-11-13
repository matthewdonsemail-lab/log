import { Header } from './Header'
import { LOG_REPO_URL, parseRepoUrl } from './RepoLink'

const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!

export const SIGN_IN_HREF = '/sign-in?returnPath=/console/start'

export type SiteHeaderCta = { href: string; label: string }

export function SiteHeader({ cta = { href: LOG_REPO_URL, label: 'Set up log' } }: { cta?: SiteHeaderCta }) {
  return (
    <Header
      tone="light"
      homeHref="/"
      logoLabel="ListeningKit"
      githubRepo={`${LOG_REPO.owner}/${LOG_REPO.repo}`}
      className="z-[70]"
      accountItems={[
        { href: SIGN_IN_HREF, label: 'Sign in', variant: 'ghost' },
        { href: cta.href, label: cta.label, variant: 'cta' },
      ]}
    />
  )
}
