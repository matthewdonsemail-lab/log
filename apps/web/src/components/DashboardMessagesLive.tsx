import { useEffect, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { ArrowUp } from 'lucide-react'
import { Button, useToast } from '@listeningkit/ui'
import { dmMessagesListRef, dmThreadsListRef } from '@/lib/convex'
import { liveDmMessagesSchema, liveThreadsSchema, sendLiveDm, type LiveThread } from '@/lib/live-messages'

function ago(ms: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - ms) / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)} d ago`
}

function ThreadRow({ thread, active, onClick }: { thread: LiveThread; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors ${active ? 'bg-[#eaf3ff]' : 'hover:bg-slate-50'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-text-primary">{thread.peerName ?? `@${thread.peerHandle}`}</span>
        <span className="shrink-0 text-xs text-text-secondary">{ago(thread.lastMessageAt)}</span>
      </div>
      <span className="truncate text-xs text-text-secondary">@{thread.peerHandle}</span>
      {thread.lastMessagePreview ? <span className="truncate text-sm text-text-secondary">{thread.lastMessagePreview}</span> : null}
    </button>
  )
}

/**
 * Real direct messages, read and sent through the connected X login by `clients/x_dm.py` on the person's own
 * computer — the same pattern as the X post helper. Facebook and Reddit DMs are not built yet; this page only
 * shows X threads. `messages:listThreads` / `messages:listMessages` / `messages:sendMessage` are the live queries.
 */
export function DashboardMessagesLive() {
  const { isAuthenticated } = useConvexAuth()
  const { error: notifyError } = useToast()
  const threadsData = useQuery(dmThreadsListRef, isAuthenticated ? {} : 'skip')
  const threads = threadsData === undefined ? undefined : liveThreadsSchema.safeParse(threadsData).data ?? []
  const [selected, setSelected] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (threads && threads.length > 0 && (selected === null || !threads.some((thread) => thread.id === selected))) {
      setSelected(threads[0].id)
    }
  }, [threads, selected])

  const messagesData = useQuery(dmMessagesListRef, isAuthenticated && selected ? { threadId: selected } : 'skip')
  const messages = messagesData === undefined ? undefined : liveDmMessagesSchema.safeParse(messagesData).data ?? []
  const activeThread = threads?.find((thread) => thread.id === selected) ?? null

  async function send() {
    const text = draft.trim()
    if (!text || !selected || sending) return
    setSending(true)
    try {
      await sendLiveDm(selected, text)
      setDraft('')
    } catch (error) {
      notifyError('Could not send the message', error instanceof Error ? error.message : 'Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col gap-4 pb-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Messages</h1>
        <p className="text-sm text-text-secondary">
          Real X direct messages, read and sent by a helper on your own computer through your connected X login. See{' '}
          <a className="font-semibold underline" href="/docs/guide/helpers.html" target="_blank" rel="noopener noreferrer">the Guide</a> to run it (<code>clients/x_dm.py</code>). Facebook and Reddit messages are not built yet.
        </p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
          {threads === undefined ? (
            <p className="p-3 text-sm text-text-secondary">Loading…</p>
          ) : threads.length === 0 ? (
            <p className="p-3 text-sm text-text-secondary">No conversations yet. New X messages a lead sends you will show up here once <code>x_dm.py</code> reads them.</p>
          ) : (
            threads.map((thread) => <ThreadRow key={thread.id} thread={thread} active={thread.id === selected} onClick={() => setSelected(thread.id)} />)
          )}
        </div>
        <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
          {activeThread ? (
            <>
              <div className="border-b border-slate-100 p-3">
                <p className="text-sm font-bold text-text-primary">{activeThread.peerName ?? `@${activeThread.peerHandle}`}</p>
                <p className="text-xs text-text-secondary">@{activeThread.peerHandle} on X</p>
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                {(messages ?? []).map((message) => (
                  <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.direction === 'out' ? 'self-end bg-[#2A8CFF] text-white' : 'self-start bg-slate-100 text-text-primary'}`}>
                    {message.text}
                    {message.status === 'pending' ? <span className="ml-2 text-xs opacity-70">sending…</span> : null}
                    {message.status === 'failed' ? <span className="ml-2 text-xs text-red-200">not sent</span> : null}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 p-3">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }}
                  placeholder="Write a reply — your X helper sends it"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2A8CFF]"
                  maxLength={2000}
                />
                <Button type="button" variant="blue" size="icon" onClick={() => void send()} disabled={sending || !draft.trim()} aria-label="Send">
                  <ArrowUp size={16} />
                </Button>
              </div>
            </>
          ) : (
            <p className="p-4 text-sm text-text-secondary">Select a conversation to read it.</p>
          )}
        </div>
      </div>
    </div>
  )
}
