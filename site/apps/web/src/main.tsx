import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './globals.css'
import './index.css'

// Sign-in, onboarding and the dashboard are gone, so the site needs no sign-in provider and no
// backend: it is the landing page plus the docs, and renders without any keys.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
