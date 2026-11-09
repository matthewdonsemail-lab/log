import list from './articles.json'
import type { FaqItem } from '../story/StorySections'
import { AUTHOR, ORGANIZATION, breadcrumbs, faqPage, softwareApplication } from '../structuredData'

export const SITE = 'https://log.listeningkit.com'

export type DevlogCard = { lead: string; name: string; pitch: string }

export type DevlogArticle = {
  slug: string
  title: string
  headline: string
  description: string
  summary: string
  published: string
  publishedLabel: string
  author: string
  card: DevlogCard
}

export const DEVLOG_ARTICLES: DevlogArticle[] = list

export const devlogPath = (slug: string) => `/devlog/${slug}`

export const devlogImage = (slug: string) => `/og/devlog/${slug}.png`

export function articleOf(slug: string): DevlogArticle {
  const article = DEVLOG_ARTICLES.find((item) => item.slug === slug)
  if (!article) throw new Error(`no devlog article ${slug}`)
  return article
}

export function articleSchema(article: DevlogArticle, faq: FaqItem[]) {
  const path = devlogPath(article.slug)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.headline,
        name: article.title,
        description: article.description,
        abstract: article.summary,
        author: { '@id': AUTHOR['@id'] },
        publisher: { '@id': ORGANIZATION['@id'] },
        datePublished: article.published,
        dateModified: article.published,
        image: `${SITE}${devlogImage(article.slug)}`,
        mainEntityOfPage: `${SITE}${path}`,
        isPartOf: { '@id': `${SITE}/devlog#blog` },
        about: { '@id': `${SITE}/#software` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '#faq'] },
      },
      breadcrumbs([{ name: 'log', path: '/' }, { name: 'Devlog', path: '/devlog' }, { name: article.title, path }]),
      ORGANIZATION,
      AUTHOR,
      softwareApplication(),
      faqPage(faq),
    ],
  }
}
