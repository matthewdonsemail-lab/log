import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { App } from './App'
import './globals.css'
import './index.css'

const clerkPublishableKey = 'pk_test_dXAtc2hpbmVyLTgyMTEuY2xlcmsuYWNjb3VudHMuZGV2JA'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
