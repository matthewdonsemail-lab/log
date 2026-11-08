import list from './articles.json'
import type { FaqItem } from '../story/StorySections'

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
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.headline,
        description: article.description,
        author: { '@type': 'Person', name: article.author, url: 'https://x.com/matthewsoldit' },
        datePublished: article.published,
        dateModified: article.published,
        image: `${SITE}${devlogImage(article.slug)}`,
        mainEntityOfPage: `${SITE}${devlogPath(article.slug)}`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
      },
    ],
  }
}
