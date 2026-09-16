import { motion } from 'motion/react'
import { KeyRound } from 'lucide-react'
import { useSquircleClip } from '@listeningkit/ui'
import type { ApiKey } from '../lib/api'
import {
  AccountScopeVisuals,
  CommunityScopeVisuals,
  ListingScopeVisuals,
  MessageScopeVisuals,
} from './DashboardScopeRows'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">{children}</p>
  )
}

/**
 * In-depth permission view for one API key: the exact scope choices made at
 * setup — which account it acts as, which communities it may touch, what it
 * may do with messages, and whether it may publish listings — rendered in the create form's visual language
 * (platform logos, "All" glyphs, on/off bits) with ids resolved to their
 * workspace names. The read half of the key page; the firehose console is
 * the observe half.
 */
export function DashboardApiKeyScopes({ apiKey }: { apiKey: ApiKey }) {
  const clip = useSquircleClip<HTMLDivElement>(20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div ref={clip.ref} style={clip.style} className="bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2A8CFF] text-white"
          >
            <KeyRound className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Key scopes</h2>
            <p className="text-sm text-text-secondary">
              Exactly what {apiKey.name} may touch — as chosen at setup.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Account scope</SectionLabel>
            <AccountScopeVisuals scope={apiKey.scopes} />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Community scope</SectionLabel>
            <CommunityScopeVisuals scope={apiKey.scopes} />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Message permissions</SectionLabel>
            <MessageScopeVisuals scope={apiKey.scopes} />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionLabel>Marketplace permissions</SectionLabel>
            <ListingScopeVisuals scope={apiKey.scopes} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}