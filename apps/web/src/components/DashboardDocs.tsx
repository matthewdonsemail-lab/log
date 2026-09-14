import { useEffect, type SyntheticEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useComposedRef, SquircleBorder, useSquircleBorder, useSquircleClip } from '@listeningkit/ui'

const DASHBOARD_DOCS_PREFIX = '/dashboard/docs'

// The docs are rendered by the real fumadocs app (apps/docs — Next.js +
// fumadocs-ui notebook layout, MDX via fumadocs-mdx). That stack only runs
// in the docs app, so this page embeds it in an iframe instead of
// re-implementing any of its content. In dev the /docs path is proxied to
// the docs app by apps/web/vite.config.ts, which keeps the iframe
// same-origin. Do NOT recreate docs pages here as JSX — edit the MDX in
// apps/docs/content/docs and it shows up here automatically.
function toDocsSrc(pathname: string, search: string, hash: string): string {
  const suffix = pathname.startsWith(DASHBOARD_DOCS_PREFIX)
    ? pathname.slice(DASHBOARD_DOCS_PREFIX.length)
    : ''
  return `/docs${suffix || ''}${search}${hash}`
}

// Rendered inside DashboardLayout's <Outlet/> at /dashboard/docs/*.
export function DashboardDocs() {
  const { pathname, search, hash } = useLocation()
  const src = toDocsSrc(pathname, search, hash)

  // In-flow page like every other dashboard page, positioned like the
  // floating header card: 20px squircle top corners (same radius as the
  // header), bottom corners flat (radius 0) so the card fits snug to the
  // bottom of the panel and the panel's own 28px squircle clip shapes the
  // dashboard edge instead of clipping the white bottom twice. `main`
  // carries the halved gutter (px-3/sm:px-4, pt-3/sm:pt-4) so the card's
  // left/right edge lines up with the header card's m-4 inset.
  const clip = useSquircleClip<HTMLDivElement>(20, 1, { bottomLeft: 0, bottomRight: 0 })
  const border = useSquircleBorder<HTMLDivElement>(21, 1, { bottomLeft: 0, bottomRight: 0 })
  const setRef = useComposedRef(clip.ref, border.ref)

  useEffect(() => {
    console.log(`[DashboardDocs] loading docs page: ${src} (from dashboard route ${pathname}${search}${hash})`)
  }, [src, pathname, search, hash])

  const handleLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    let detail = src
    try {
      const title = event.currentTarget.contentDocument?.title
      detail += title ? ` — title: "${title}"` : ' — (loaded, no title)'
    } catch {
      detail += ' — (loaded, cross-origin: title unreadable)'
    }
    console.log(`[DashboardDocs] docs iframe loaded: ${detail}`)
  }

  return (
    <div
      ref={setRef}
      style={clip.style}
      // flex-1 + `main`'s pb-0: the card fits snug to the panel bottom; the
      // iframe fills it. overflow-hidden keeps the iframe's square corners
      // inside the shape on first paint, before the clipPath measures.
      className="relative flex-1 overflow-hidden bg-white"
    >
      <iframe
        key={src}
        src={src}
        title="Documentation"
        onLoad={handleLoad}
        className="block h-full w-full"
      />
      <SquircleBorder border={border.state} stroke="rgba(0,0,0,0.06)" />
    </div>
  )
}
