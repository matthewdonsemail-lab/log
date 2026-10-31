import { useRef, useState } from 'react'
import type { FirehoseEvent } from '../lib/analytics'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { DashboardFormSheet } from './DashboardFormSheet'
import { RelatedCommunitiesChain } from './RelatedCommunitiesChain'
import type { RelatedMentionsState } from './RelatedMentionsChain'

/**
 * Dedicated "Related communities" form — the find Related-communities chain
 * walked step by step (dorking → sibling communities → joins → the keyword
 * × community map), registered into the dashboard form slot (same dock as
 * the event inspect form, which hands off to this one). The tracked phrase
 * goes in as the map's keyword. Closing returns to the inspect form for the
 * same post (the page's slot effect re-registers it — the event is still
 * selected underneath).
 */
export function DashboardRelatedCommunitiesForm({
  event,
  phrases,
  onClose,
}: {
  event: FirehoseEvent
  /** Listened phrases — the first seeds the map's keyword. */
  phrases?: string[]
  onClose: () => void
}) {
  const [chain, setChain] = useState<RelatedMentionsState>({ picked: [], footer: 'hidden', saving: false, saved: false })
  // The sheet's confirm button can't reach into the chain's xstate machine,
  // so the chain parks its save handler here for the footer's single call.
  const saveRef = useRef<(() => void) | null>(null)
  const platformIcon = SOCIAL_ICONS.find((row) => row.id === event.platform)

  return (
    <DashboardFormSheet
      open
      title={event.platform === 'reddit' ? 'Related communities' : 'Related groups'}
      subtitle={
        <>
          <span>More places talking about this in</span>
          {platformIcon ? <SocialGlyph icon={platformIcon} className="size-3.5" /> : null}
          <span className="block max-w-40 truncate">{event.group}</span>
        </>
      }
      stepHint="Find and join sibling communities"
      confirmLabel={
        chain.footer === 'save' ? 'Start listening' : chain.footer === 'done' ? 'Done' : undefined
      }
      busy={chain.saving}
      onConfirm={chain.footer === 'done' ? onClose : chain.footer === 'save' ? () => saveRef.current?.() : undefined}
      onClose={onClose}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-10 -mx-6 -mt-5 h-16 bg-gradient-to-b from-white to-transparent"
      />
      <RelatedCommunitiesChain
        event={event}
        trackedPhrases={phrases ?? []}
        saveRef={saveRef}
        onStateChange={setChain}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none sticky bottom-0 z-10 -mx-6 -mb-5 h-16 bg-gradient-to-t from-white to-transparent"
      />
    </DashboardFormSheet>
  )
}
