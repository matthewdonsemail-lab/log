import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import type { ConsoleEvent } from './eventsData'

const platformIcons = { facebook: faFacebook, twitter: faXTwitter, discord: faDiscord, slack: faSlack, instagram: faInstagram, reddit: faRedditAlien, linkedin: faLinkedin }

export function EventLogo({ platform, model }: { platform?: ConsoleEvent['platform']; model?: ConsoleEvent['model'] }) {
  if (platform) return <FontAwesomeIcon icon={platformIcons[platform]} className="size-4 shrink-0" aria-hidden="true" />
  if (!model) return null
  const mask = `url('${model === 'SubQ' ? '/logos/stack/subq.svg' : '/logos/tools/typesafeDark.svg'}') center / contain no-repeat`
  return <span aria-hidden="true" className="block size-5 shrink-0 bg-current" style={{ mask, WebkitMask: mask }} />
}
