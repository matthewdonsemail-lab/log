import type { ReactElement } from 'react'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@listeningkit/ui'
import { OnboardingRoute, AuthRoute, AuthSetup, RequireAuth, SignInRoute, SignUpRoute } from './components/AuthGate'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardSettings } from './components/DashboardSettings'
import { DashboardGroups } from './components/DashboardGroups'
import { DashboardAccounts } from './components/DashboardAccounts'
import { DashboardMessages } from './components/DashboardMessages'
import { DashboardListings } from './components/DashboardListings'
import { DashboardKeywords } from './components/DashboardKeywords'
import { DashboardKeywordsLive } from './components/DashboardKeywordsLive'
import { keywordsOnConvex } from './lib/live-keywords'
import { DashboardAnalyticsOverview } from './components/DashboardAnalyticsOverview'
import { DashboardAnalyticsPage } from './components/DashboardAnalyticsPage'
import { DashboardAccountPage } from './components/DashboardAccountPage'
import { DashboardChallengePage } from './components/DashboardChallengePage'
import { DashboardFeed } from './components/DashboardFeed'
import { DashboardDocs } from './components/DashboardDocs'
import { StaticDocsRedirect } from './components/StaticDocsRedirect'
import { DashboardAPI } from './components/DashboardAPI'
import { DashboardApiKeyPage } from './components/DashboardApiKeyPage'
import { DashboardApiLive } from './components/DashboardApiLive'
import { DashboardBrand } from './components/DashboardBrand'
import { LandingPage } from './landing/LandingPage'

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

export function App() {
  // AuthSetup remounts on session changes; do not share cached queries across users.
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <AuthSetup>
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
              <Route path="analytics" element={<DashboardAnalyticsOverview />} />
              <Route path="analytics/:keywordId" element={<DashboardAnalyticsPage />} />
              <Route path="accounts" element={<DashboardAccounts />} />
              <Route path="accounts/:accountId" element={<DashboardAccountPage />} />
              <Route path="accounts/:accountId/challenge" element={<DashboardChallengePage />} />
              <Route path="brand" element={demoOnly(<DashboardBrand />)} />
              <Route path="messages" element={demoOnly(<DashboardMessages />)} />
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
          </AuthSetup>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}
