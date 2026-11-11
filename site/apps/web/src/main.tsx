import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { App } from './App'
import './globals.css'
import './index.css'

const clerkPublishableKey = import.meta.env.PROD
  ? 'pk_live_Y2xlcmsubG9nLmxpc3RlbmluZ2tpdC5jb20k'
  : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aW50ZXJuYWwtcGlnbGV0LTIzMDEuY2xlcmsuYWNjb3VudHMuZGV2JA'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
