import type { FaqItem } from './story/StorySections'
import { GG_REVIEWS } from './ggReviews'
import { VIDEOS } from './VideoCarousel'
import { HOME_ANSWERS, SETUP_STEPS } from './homeQuickAnswers'

export const SITE = 'https://log.listeningkit.com'
export const REPO_URL = 'https://github.com/matthewdonsemail-lab/log'
export const COMMUNITY_URL = 'https://whop.com/checkout/plan_mfRXqGBMpZ4Jx'

const ORG_ID = `${SITE}/#organization`
const APP_ID = `${SITE}/#software`
const AUTHOR_ID = `${SITE}/#matthew`
const SITE_ID = `${SITE}/#website`
const COMMUNITY_ID = `${SITE}/#goGetters`

export type Crumb = { name: string; path: string }

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'ListeningKit',
  url: 'https://listeningkit.com',
  logo: { '@type': 'ImageObject', url: `${SITE}/logo.svg` },
  founder: { '@id': AUTHOR_ID },
  sameAs: [REPO_URL, 'https://x.com/matthewsoldit'],
}

export const AUTHOR = {
  '@type': 'Person',
  '@id': AUTHOR_ID,
  name: 'Matthew Don',
  url: 'https://x.com/matthewsoldit',
  image: `${SITE}/images/mattlistening.webp`,
  worksFor: { '@id': ORG_ID },
  sameAs: ['https://x.com/matthewsoldit', 'https://github.com/matthewdonsemail-lab'],
}

export const COMMUNITY = {
  '@type': 'Organization',
  '@id': COMMUNITY_ID,
  name: 'Go Getters',
  description: 'The community that keeps the open-source tools free. The plays run with these tools go to members first.',
  url: COMMUNITY_URL,
  parentOrganization: { '@id': ORG_ID },
}

export const ACTIONS = [
  {
    '@type': 'JoinAction',
    name: 'Join the Go Getters community',
    object: { '@id': COMMUNITY_ID },
    target: { '@type': 'EntryPoint', urlTemplate: COMMUNITY_URL, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
  },
  {
    '@type': 'InstallAction',
    name: 'Install log',
    object: { '@id': APP_ID },
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/docs/install` },
  },
  {
    '@type': 'DownloadAction',
    name: 'Get the code on GitHub',
    object: { '@id': APP_ID },
    target: { '@type': 'EntryPoint', urlTemplate: REPO_URL },
  },
]


const TWITTER_EPOCH = 1288834974657n

export function tweetDate(id: string) {
  return new Date(Number((BigInt(id) >> 22n) + TWITTER_EPOCH)).toISOString()
}

export function isoDuration(minutes: string) {
  const [m, sec] = minutes.split(':').map(Number)
  return `PT${m}M${sec}S`
}

export const REVIEWS = GG_REVIEWS.map((review) => ({
  '@type': 'Review',
  name: `${review.name} on X`,
  reviewBody: review.quote.replace(/\*\*/g, ''),
  author: { '@type': 'Person', name: review.name, url: `https://x.com/${review.handle.slice(1)}` },
  itemReviewed: { '@id': APP_ID },
}))

export const VIDEO_OBJECTS = VIDEOS.map((video) => ({
  '@type': 'VideoObject',
  name: video.hook,
  description: `${video.hook}. Matthew Don on how he uses log, posted on X.`,
  thumbnailUrl: video.poster,
  contentUrl: video.mp4,
  embedUrl: `https://x.com/matthewsoldit/status/${video.id}`,
  uploadDate: tweetDate(video.id),
  duration: isoDuration(video.minutes),
  author: { '@id': AUTHOR_ID },
  about: { '@id': APP_ID },
}))

export const PLATFORM_LIST = [
  { name: 'log for X (Twitter)', path: '/twitter' },
  { name: 'log for Discord', path: '/discord' },
  { name: 'log for Slack', path: '/slack' },
  { name: 'log for Instagram', path: '/instagram' },
  { name: 'log for Reddit', path: '/reddit' },
]

export function softwareApplication(featureList: string[] = []) {
  return {
    '@type': 'SoftwareApplication',
    '@id': APP_ID,
    name: 'log',
    alternateName: 'log by ListeningKit',
    description: 'A free, open-source tool that lets your AI agent read and answer your DMs on X, Discord, Slack, Instagram and Reddit, from your own accounts, in your own voice, only when you say so.',
    url: SITE,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Social media inbox for AI agents',
    operatingSystem: 'Windows, macOS, Linux',
    softwareRequirements: 'Bun, Python 3.12, and an MCP client such as Claude Code, Codex or Cursor',
    license: 'https://opensource.org/licenses/MIT',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    downloadUrl: REPO_URL,
    installUrl: `${SITE}/docs/install`,
    image: `${SITE}/og/og.png`,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    ...(featureList.length ? { featureList } : {}),
    review: REVIEWS,
    potentialAction: ACTIONS,
  }
}

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: 'log by ListeningKit',
  url: SITE,
  publisher: { '@id': ORG_ID },
  about: { '@id': APP_ID },
}

export function breadcrumbs(trail: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: `${SITE}${crumb.path}` })),
  }
}

export function faqPage(faq: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
  }
}

export function howTo(name: string, description: string, steps: { title: string; body: string }[]) {
  return {
    '@type': 'HowTo',
    name,
    description,
    tool: { '@type': 'HowToTool', name: 'log' },
    step: steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.title, text: step.body })),
  }
}

export function homeSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      AUTHOR,
      COMMUNITY,
      WEBSITE,
      softwareApplication(),
      breadcrumbs([{ name: 'log', path: '/' }]),
      {
        '@type': 'ItemList',
        name: 'log on every platform',
        itemListElement: PLATFORM_LIST.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: `${SITE}${item.path}` })),
      },
      howTo('Set up log', 'Install log, connect your accounts and connect your AI agent.', SETUP_STEPS),
      faqPage(HOME_ANSWERS),
      ...VIDEO_OBJECTS,
    ],
  }
}

export type PlatformSchemaInput = {
  path: string
  label: string
  title: string
  description: string
  image: string
  faq: FaqItem[]
  play: { name: string; ask: string; steps: { title: string; body: string }[] }
  features: string[]
}

export function platformSchema(page: PlatformSchemaInput) {
  const url = `${SITE}${page.path}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': APP_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: page.image },
        breadcrumb: breadcrumbs([{ name: 'log', path: '/' }, { name: page.label, path: page.path }]),
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.quick-answers'] },
        potentialAction: ACTIONS,
      },
      ORGANIZATION,
      AUTHOR,
      COMMUNITY,
      WEBSITE,
      breadcrumbs([{ name: 'log', path: '/' }, { name: page.label, path: page.path }]),
      softwareApplication(page.features),
      howTo(page.play.name, `Ask your agent: "${page.play.ask}"`, page.play.steps),
      faqPage(page.faq),
    ],
  }
}

export type DevlogEntry = { title: string; headline: string; description: string; path: string; image: string; published: string }

export function devlogIndexSchema(title: string, description: string, entries: DevlogEntry[]) {
  const url = `${SITE}/devlog`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${url}#blog`,
        url,
        name: title,
        description,
        publisher: { '@id': ORG_ID },
        author: { '@id': AUTHOR_ID },
        blogPost: entries.map((entry) => ({ '@type': 'BlogPosting', headline: entry.headline, description: entry.description, url: `${SITE}${entry.path}`, image: entry.image, datePublished: entry.published, author: { '@id': AUTHOR_ID } })),
      },
      breadcrumbs([{ name: 'log', path: '/' }, { name: 'Devlog', path: '/devlog' }]),
      ORGANIZATION,
      AUTHOR,
    ],
  }
}
