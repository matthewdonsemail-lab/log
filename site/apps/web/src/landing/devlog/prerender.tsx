import type { ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DEVLOG_ARTICLES, SITE, devlogImage, devlogPath } from './articles'
import { DEVLOG_DESCRIPTION, DEVLOG_TITLE, DevlogList } from './DevlogIndexPage'
import { XREACHER_SCHEMA, XreacherStory } from './XreacherAlternativePage'
import sharePages from '../useCases/sharePages.json'
import { PLATFORM_PAGES } from '../useCases/platformPages'
import { QUICK_ANSWERS } from '../useCases/quickAnswers'
import { PLATFORMS } from '../PlatformSuite'
import { UPDATED, devlogIndexSchema, homeSchema, platformSchema } from '../structuredData'

export type PrerenderedPage = {
  path: string
  title: string
  description: string
  image: string
  type: 'article' | 'website'
  schema: object | null
  body: string
  markdown?: string
}

const BODIES: Record<string, { Story: ComponentType; schema: object }> = {
  'xreacher-alternative': { Story: XreacherStory, schema: XREACHER_SCHEMA },
}

export const HOME_SCHEMA = homeSchema()

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
    schema: devlogIndexSchema(
      DEVLOG_TITLE,
      DEVLOG_DESCRIPTION,
      DEVLOG_ARTICLES.map((article) => ({ title: article.title, headline: article.headline, description: article.description, path: devlogPath(article.slug), image: `${SITE}${devlogImage(article.slug)}`, published: article.published })),
    ),
    body: renderToStaticMarkup(
      <main>
        <h1>Devlog</h1>
        <DevlogList />
      </main>,
    ),
  }
  const platforms: PrerenderedPage[] = sharePages.map((share) => {
    const page = PLATFORM_PAGES.find((item) => item.id === share.slug)
    if (!page) throw new Error(`share page ${share.slug} has no platform page`)
    const platform = PLATFORMS.find((item) => item.id === page.platformId)
    if (!platform) throw new Error(`platform page ${page.id} has no platform ${page.platformId}`)
    const faq = QUICK_ANSWERS[page.id]
    const image = `${SITE}/og/pages/${share.slug}.png`
    return {
      path: page.path,
      title: share.title,
      description: share.description,
      image,
      type: 'website' as const,
      schema: platformSchema({
        path: page.path,
        label: platform.label,
        title: share.title,
        description: share.description,
        image,
        faq,
        play: page.play,
        features: page.moments.map((moment) => moment.label),
      }),
      markdown: [
        `# ${share.title}`,
        '',
        `canonical_url: ${SITE}${page.path}`,
        `last_updated: ${UPDATED}`,
        `author: Matthew Don (https://x.com/matthewsoldit)`,
        '',
        share.description,
        '',
        `## The play: ${page.play.name}`,
        '',
        `Ask your agent: "${page.play.ask}"`,
        '',
        ...page.play.steps.map((step, index) => `${index + 1}. **${step.title}.** ${step.body}`),
        '',
        `## ${platform.label} with log: quick answers`,
        '',
        ...faq.flatMap((item) => [`### ${item.q}`, '', item.a, '']),
        `Source and install: https://github.com/matthewdonsemail-lab/log`,
        '',
      ].join('\n'),
      body: renderToStaticMarkup(
        <main>
          <h1>{share.title}</h1>
          <p>{share.description}</p>
          <section className="quick-answers">
            <h2>{platform.label} with log: quick answers</h2>
            {faq.map((item) => (
              <div key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </section>
          <p>
            By Matthew Don. Updated <time dateTime={UPDATED}>{UPDATED}</time>.
          </p>
        </main>,
      ),
    }
  })
  return [index, ...articles, ...platforms]
}
