import type { ComponentType, ReactElement } from 'react'
import { lazy, Suspense, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@listeningkit/ui'
import { OnboardingRoute, AuthRoute, AuthSetup, RequireAuth, SignInRoute, SignUpRoute } from './components/AuthGate'
import { keywordsOnConvex } from './lib/live-keywords'
import { LandingPage } from './landing/LandingPage'

/**
 * Every dashboard page and the docs redirect loads on demand, so a landing-page visitor does not download the
 * dashboard's code (it was one 3.7 MB file). The landing page and the sign-in flow stay eager so first paint is not delayed.
 */
function lazyNamed(load: () => Promise<Record<string, unknown>>, name: string) {
  return lazy(() => load().then((m) => ({ default: m[name] as ComponentType })))
}

const DashboardLayout = lazyNamed(() => import('./components/DashboardLayout'), 'DashboardLayout')
const DashboardSettings = lazyNamed(() => import('./components/DashboardSettings'), 'DashboardSettings')
const DashboardGroups = lazyNamed(() => import('./components/DashboardGroups'), 'DashboardGroups')
const DashboardAccounts = lazyNamed(() => import('./components/DashboardAccounts'), 'DashboardAccounts')
const DashboardMessages = lazyNamed(() => import('./components/DashboardMessages'), 'DashboardMessages')
const DashboardMessagesLive = lazyNamed(() => import('./components/DashboardMessagesLive'), 'DashboardMessagesLive')
const DashboardListings = lazyNamed(() => import('./components/DashboardListings'), 'DashboardListings')
const DashboardKeywords = lazyNamed(() => import('./components/DashboardKeywords'), 'DashboardKeywords')
const DashboardKeywordsLive = lazyNamed(() => import('./components/DashboardKeywordsLive'), 'DashboardKeywordsLive')
const DashboardAnalyticsOverview = lazyNamed(() => import('./components/DashboardAnalyticsOverview'), 'DashboardAnalyticsOverview')
const DashboardAnalyticsPage = lazyNamed(() => import('./components/DashboardAnalyticsPage'), 'DashboardAnalyticsPage')
const DashboardAccountPage = lazyNamed(() => import('./components/DashboardAccountPage'), 'DashboardAccountPage')
const DashboardChallengePage = lazyNamed(() => import('./components/DashboardChallengePage'), 'DashboardChallengePage')
const DashboardFeed = lazyNamed(() => import('./components/DashboardFeed'), 'DashboardFeed')
const DashboardDocs = lazyNamed(() => import('./components/DashboardDocs'), 'DashboardDocs')
const StaticDocsRedirect = lazyNamed(() => import('./components/StaticDocsRedirect'), 'StaticDocsRedirect')
const DashboardAPI = lazyNamed(() => import('./components/DashboardAPI'), 'DashboardAPI')
const DashboardApiKeyPage = lazyNamed(() => import('./components/DashboardApiKeyPage'), 'DashboardApiKeyPage')
const DashboardApiLive = lazyNamed(() => import('./components/DashboardApiLive'), 'DashboardApiLive')
const DashboardBrand = lazyNamed(() => import('./components/DashboardBrand'), 'DashboardBrand')

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
})

/** Demo-only pages (mock data, no backend) send people to the feed on the live site. */
function demoOnly(page: ReactElement): ReactElement {
  return keywordsOnConvex() ? <Navigate to="/dashboard" replace /> : page
}

function HealthPage() {
  return (
    <div className="min-h-screen bg-surface-primary p-8 text-text-primary">
      <p className="text-sm text-text-secondary">ok — router + query client wired.</p>
      <Link to="/onboarding" className="text-brand-600 underline">
        Back to onboarding
      </Link>
    </div>
  )
}

// Vercel Analytics only actually reports when the page is served from Vercel's own infrastructure
// (it calls Vercel's own /_vercel/insights endpoint); on the Convex-hosted copy it is a harmless no-op,
// so this only renders it where it can do something, to avoid an inert script everywhere else.
const VERCEL_ANALYTICS_DOMAIN = 'log.listeningkit.com'

export function App() {
  // AuthSetup remounts on session changes; do not share cached queries across users.
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      {window.location.hostname === VERCEL_ANALYTICS_DOMAIN ? <Analytics /> : null}
      <ToastProvider>
        <Router>
          <AuthSetup>
          <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingRoute />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/sign-in/*" element={<SignInRoute />} />
            <Route path="/sign-up/*" element={<SignUpRoute />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<DashboardFeed />} />
              <Route path="groups" element={demoOnly(<DashboardGroups />)} />
              <Route path="facebook/listings" element={demoOnly(<DashboardListings />)} />
              <Route path="facebook/listings/:id" element={demoOnly(<DashboardListings />)} />
              <Route path="keywords" element={keywordsOnConvex() ? <DashboardKeywordsLive /> : <DashboardKeywords />} />
              <Route path="analytics" element={demoOnly(<DashboardAnalyticsOverview />)} />
              <Route path="analytics/:keywordId" element={demoOnly(<DashboardAnalyticsPage />)} />
              <Route path="accounts" element={<DashboardAccounts />} />
              <Route path="accounts/:accountId" element={<DashboardAccountPage />} />
              <Route path="accounts/:accountId/challenge" element={<DashboardChallengePage />} />
              <Route path="brand" element={demoOnly(<DashboardBrand />)} />
              <Route path="messages" element={keywordsOnConvex() ? <DashboardMessagesLive /> : <DashboardMessages />} />
              <Route path="messages/:platform" element={demoOnly(<DashboardMessages />)} />
              <Route path="messages/:platform/:accountId" element={demoOnly(<DashboardMessages />)} />
              <Route path="messages/:platform/:accountId/:threadId" element={demoOnly(<DashboardMessages />)} />
              <Route
                path="messages/:platform/:accountId/:threadId/:messageId"
                element={demoOnly(<DashboardMessages />)}
              />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="api" element={keywordsOnConvex() ? <DashboardApiLive /> : <DashboardAPI />} />
              <Route path="api/:keyId" element={<DashboardApiKeyPage />} />
              <Route path="docs/*" element={<DashboardDocs />} />
            </Route>
            <Route path="/docs" element={<StaticDocsRedirect />} />
            <Route path="/docs/*" element={<StaticDocsRedirect />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
          </Suspense>
          </AuthSetup>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}
