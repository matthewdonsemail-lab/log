import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@listeningkit/ui'
import { LandingPage } from './landing/LandingPage'
import { UseCasesPage } from './landing/useCases/UseCasesPage'
import { ReaLooksmaxxingPage } from './landing/useCases/ReaLooksmaxxingPage'
import { XreacherAlternativePage } from './landing/devlog/XreacherAlternativePage'
import { DevlogIndexPage } from './landing/devlog/DevlogIndexPage'
import { ShareCardPage } from './landing/shareCard/ShareCardPage'
import { McpPage } from './landing/mcp/McpPage'
import { McpPromo } from './landing/mcp/McpPromo'
import Dither from './components/Dither'
import { AuthPage } from './pages/auth/AuthPage'
import { ConnectionsPage } from './pages/console/ConnectionsPage'
import { StartPage } from './pages/console/StartPage'
import { UsagePage } from './pages/console/UsagePage'
import { EventsPage } from './pages/console/EventsPage'
import { ConsolePlaceholderPage } from './pages/console/ConsolePlaceholderPage'
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
// (it calls Vercel's own /_vercel/insights endpoint); on any other host it is a harmless no-op,
// so this only renders it where it can do something, to avoid an inert script everywhere else.
const VERCEL_ANALYTICS_DOMAIN = 'log.listeningkit.com'

function SitePromo() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/console') || pathname === '/teams') return null
  return <McpPromo />
}

function ConsoleBackdrop() {
  const { pathname } = useLocation()
  if (!pathname.startsWith('/console')) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
      <div className="absolute inset-0">
        <Dither
          waveColor={[0.7, 0.88, 1]}
          backgroundColor={[0.165, 0.55, 1]}
          colorNum={4}
          pixelSize={3}
          waveAmplitude={0.2}
          waveFrequency={3}
          waveSpeed={0.035}
          enableMouseInteraction={false}
        />
      </div>
      <div className="absolute inset-0 bg-white/[0.88]" />
    </div>
  )
}

export function App() {
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      {window.location.hostname === VERCEL_ANALYTICS_DOMAIN ? <Analytics /> : null}
      <ToastProvider>
        <Router>
          <ConsoleBackdrop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/twitter" element={<UseCasesPage key="twitter" platform="twitter" />} />
            <Route path="/discord" element={<UseCasesPage key="discord" platform="discord" />} />
            <Route path="/slack" element={<UseCasesPage key="slack" platform="slack" />} />
            <Route path="/instagram" element={<UseCasesPage key="instagram" platform="instagram" />} />
            <Route path="/reddit" element={<UseCasesPage key="reddit" platform="reddit" />} />
            <Route path="/mcp" element={<McpPage />} />
            <Route path="/rea-looksmaxxing" element={<ReaLooksmaxxingPage />} />
            <Route path="/devlog" element={<DevlogIndexPage />} />
            <Route path="/devlog/xreacher-alternative" element={<XreacherAlternativePage />} />
            <Route path="/docs" element={<StaticDocsRedirect />} />
            <Route path="/docs/*" element={<StaticDocsRedirect />} />
            <Route path="/shareCard/:slug" element={<ShareCardPage />} />
            <Route path="/sign-in" element={<AuthPage key="signIn" mode="signIn" />} />
            <Route path="/verify" element={<AuthPage key="verify" mode="verify" />} />
            <Route path="/console" element={<Navigate to="/console/start" replace />} />
            <Route path="/console/start" element={<StartPage />} />
            <Route path="/console/connections" element={<ConnectionsPage />} />
            <Route path="/console/accounts" element={<Navigate to="/console/connections" replace />} />
            <Route path="/console/settings" element={<ConsolePlaceholderPage title="Settings" subtitle="Team members and invites, the supported workspace and provider setup, the AdsPower connection and session controls." />} />
            <Route path="/console/usage" element={<UsagePage />} />
            <Route path="/console/events" element={<EventsPage />} />
            <Route path="/console/analytics" element={<ConsolePlaceholderPage title="Analytics" subtitle="Private metrics read from the live workspace, shown with their provenance and unavailable while it is offline." />} />
            <Route path="/console/subscription" element={<ConsolePlaceholderPage title="Subscription" subtitle="Billing stays unconfigured until a real billing authority is implemented." />} />
            <Route path="/teams" element={<ConsolePlaceholderPage title="Teams" subtitle="Create a team, join one by invitation, or pick the team you are already in." />} />
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SitePromo />
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  )
}


