import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@listeningkit/ui'
import { LandingPage } from './landing/LandingPage'
import { StaticDocsRedirect } from './components/StaticDocsRedirect'

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
})

function HealthPage() {
  return (
    <div className="min-h-screen bg-surface-primary p-8 text-text-primary">
      <p className="text-sm text-text-secondary">ok — router + query client wired.</p>
      <Link to="/" className="text-brand-600 underline">
        Back to the landing page
      </Link>
    </div>
  )
}

// Vercel Analytics only actually reports when the page is served from Vercel's own infrastructure
// (it calls Vercel's own /_vercel/insights endpoint); on the Convex-hosted copy it is a harmless no-op,
// so this only renders it where it can do something, to avoid an inert script everywhere else.
const VERCEL_ANALYTICS_DOMAIN = 'log.listeningkit.com'

/**
 * The site is the landing page plus the docs. Onboarding, sign-in and the dashboard are deprecated:
 * every "Get started" and GitHub button opens the repository modal instead (landing/RepoLink.tsx),
 * and any old link (/onboarding, /sign-in, /dashboard/..., anything unknown) lands back on "/".
 */
export function App() {
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      {window.location.hostname === VERCEL_ANALYTICS_DOMAIN ? <Analytics /> : null}
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<StaticDocsRedirect />} />
            <Route path="/docs/*" element={<StaticDocsRedirect />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}
