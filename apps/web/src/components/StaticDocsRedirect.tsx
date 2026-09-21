import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * The hosted docs are static files, and the hosting only serves exact file names. A docs address without `.html`
 * (a typed link, a refresh, a shared URL) reaches the app instead; send it to the page file it stands for.
 */
export function StaticDocsRedirect() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    const page = pathname.replace(/\/+$/, '')
    if (page.endsWith('.html')) return
    window.location.replace(`${page}.html${search}${hash}`)
  }, [pathname, search, hash])
  return null
}
