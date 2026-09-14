import { useRef, useState } from 'react'
import type { FirehoseEvent } from '../lib/analytics'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { DashboardFormSheet } from './DashboardFormSheet'
import { RelatedMentionsChain, type RelatedMentionsState } from './RelatedMentionsChain'

/**
 * Dedicated "Related keywords" form — the find Related-mentions chain in its
 * own surface, registered into the dashboard form slot (same dock as the
 * event inspect form, which hands off to this one). The white chain card
 * streams the analysis; picking candidates unlocks the sheet's confirm button, which runs the save, then flips to
 * Done. Closing returns to the inspect form for the same post (the page's
 * slot effect re-registers it — the event is still selected underneath).
 */
export function DashboardRelatedKeywordsForm({
  event,
  phrases,
  onClose,
}: {
  event: FirehoseEvent
  /** Listened phrases the dedup beat reports against. */
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
      title="Related keywords"
      subtitle={
        <>
          <span>What else to listen for from</span>
          {platformIcon ? <SocialGlyph icon={platformIcon} className="size-3.5" /> : null}
          <span className="block max-w-40 truncate">{event.group}</span>
        </>
      }
      stepHint="Pick the phrases worth listening for"
      confirmLabel={
        chain.footer === 'save' ? 'Start listening' : chain.footer === 'done' ? 'Done' : undefined
      }
      busy={chain.saving}
      onConfirm={chain.footer === 'done' ? onClose : chain.footer === 'save' ? () => saveRef.current?.() : undefined}
      onClose={onClose}
    >
      {/*
        Edge fades for the sheet's scroll viewport (same role as the
        onboarding reveal's absolute gradients): white, pointer-through, so
        the stream reads as staying in view while it grows past the fold.
        Sticky keeps them pinned to the viewport edges; the negative margins
        pull them over the body's own padding so they run edge to edge.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-10 -mx-6 -mt-5 h-16 bg-gradient-to-b from-white to-transparent"
      />
      <RelatedMentionsChain
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