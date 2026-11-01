import { useEffect, useState } from 'react'

/** Mobile boundary matching tailwind's `sm` breakpoint (640px). */
const MOBILE_QUERY = '(max-width: 639px)'

/**
 * True while the viewport is below the `sm` breakpoint. Powers the mobile
 * treatments that inline styles can't express (squircle `clipPath` skips,
 * full-screen form docking) — class-driven tweaks stay in `sm:` variants.
 */
export function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    setIsMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
