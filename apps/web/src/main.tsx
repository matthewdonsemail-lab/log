import { ClerkProvider } from '@clerk/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './globals.css'
import './index.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {publishableKey ? (
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInForceRedirectUrl="/onboarding"
        signUpForceRedirectUrl="/onboarding"
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    ) : (
      <main className="p-8" role="alert">Set VITE_CLERK_PUBLISHABLE_KEY in apps/web/.env.local to enable sign-in.</main>
    )}
  </React.StrictMode>
)