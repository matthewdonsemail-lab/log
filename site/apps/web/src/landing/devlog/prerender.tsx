import type { ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DEVLOG_ARTICLES, SITE, devlogImage, devlogPath } from './articles'
import { DEVLOG_DESCRIPTION, DEVLOG_TITLE, DevlogList } from './DevlogIndexPage'
import { XREACHER_SCHEMA, XreacherStory } from './XreacherAlternativePage'

export type PrerenderedPage = {
  path: string
  title: string
  description: string
  image: string
  type: 'article' | 'website'
  schema: object | null
  body: string
}

const BODIES: Record<string, { Story: ComponentType; schema: object }> = {
  'xreacher-alternative': { Story: XreacherStory, schema: XREACHER_SCHEMA },
}

export function prerenderedPages(): PrerenderedPage[] {
  const articles = DEVLOG_ARTICLES.map((article) => {
    const body = BODIES[article.slug]
    if (!body) throw new Error(`devlog article ${article.slug} has no story to render`)
    const { Story } = body
    return {
      path: devlogPath(article.slug),
      title: article.title,
      description: article.description,
      image: `${SITE}${devlogImage(article.slug)}`,
      type: 'article' as const,
      schema: body.schema,
      body: renderToStaticMarkup(
        <main>
          <h1>{article.headline}</h1>
          <p>
            By {article.author}, published <time dateTime={article.published}>{article.publishedLabel}</time>
          </p>
          <Story />
        </main>,
      ),
    }
  })
  const latest = [...DEVLOG_ARTICLES].sort((a, b) => b.published.localeCompare(a.published))[0]
  const index: PrerenderedPage = {
    path: '/devlog',
    title: DEVLOG_TITLE,
    description: DEVLOG_DESCRIPTION,
    image: latest ? `${SITE}${devlogImage(latest.slug)}` : `${SITE}/og/og.png`,
    type: 'website',
    schema: null,
    body: renderToStaticMarkup(
      <main>
        <h1>Devlog</h1>
        <DevlogList />
      </main>,
    ),
  }
  return [index, ...articles]
}
