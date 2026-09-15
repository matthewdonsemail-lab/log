import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Message, MessageList } from '@chatscope/chat-ui-kit-react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import './chat-theme.css'
import { ArrowUp, Mic, Paperclip, Smile, X } from 'lucide-react'
import {
  Button,
  Select,
  SquircleBorder,
  useComposedRef,
  useSquircleBorder,
  useSquircleClip,
  useToast
} from '@listeningkit/ui'
import { getAccounts } from '@/lib/connections'
import {
  acknowledgeThread,
  DEFAULT_MESSAGING_ACCOUNT,
  getThreadMessages,
  getThreads,
  identityFor,
  sendThreadMessage,
  type ChatMessage,
  type MessagingPlatform,
  type Thread
} from '@/lib/messaging'
import { SOCIAL_ICONS, SocialGlyph, type SocialIcon } from '@/lib/social-icons'
import { DashboardTab } from './DashboardTab'

const MESSAGING_PLATFORM_BY_ICON: Record<string, MessagingPlatform> = {
  facebook: 'facebook',
  x: 'x',
  reddit: 'reddit'
}

/** ISO 8601 → the dashboard's display vocabulary ("9:41 AM" / "Yesterday" / "Tue"). */
function formatChatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const now = new Date()
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (date.toDateString() === now.toDateString()) return time
  if (date.toDateString() === new Date(now.getTime() - 86_400_000).toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'short' })
}

function PlatformTab({ icon, active, onClick }: { icon: SocialIcon; active: boolean; onClick: () => void }) {
  return (
    <DashboardTab
      label={icon.label}
      icon={<SocialGlyph icon={icon} className="size-4" />}
      active={active}
      onClick={onClick}
    />
  )
}

function ThreadAvatar({ name, initials, color }: { name: string; initials: string; color: string }) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )
}

/**
 * Account picker — one of that platform's connected accounts is the
 * "me" side of every conversation in the view. Sending, receiving and
 * read state all belong to the picked account (its platform-native
 * identity: X user id, Facebook person/page id, Reddit username).
 */
function AccountPicker({
  platform,
  accounts,
  value,
  onChange
}: {
  platform: MessagingPlatform
  accounts: { id: string; label: string; handle: string | null }[]
  value: string
  onChange: (accountId: string) => void
}) {
  return (
    <Select
      size="sm"
      matchWidth
      aria-label={`Messaging as account (${platform})`}
      options={accounts.map((account) => ({
        value: account.id,
        label: account.handle ? `${account.label} (@${account.handle})` : account.label
      }))}
      value={value}
      onChange={onChange}
    />
  )
}

const BUBBLE_RADIUS = 10
const BUBBLE_TAIL_RADIUS = 2

function MessageBubble({ tone, image, children }: { tone: 'incoming' | 'outgoing'; image?: string; children: ReactNode }) {
  const clip = useSquircleClip<HTMLDivElement>(
    BUBBLE_RADIUS,
    1,
    tone === 'outgoing' ? { bottomRight: BUBBLE_TAIL_RADIUS } : { bottomLeft: BUBBLE_TAIL_RADIUS }
  )
  const imageOnly = Boolean(image) && !children
  const altText = typeof children === 'string' && children ? children : 'Shared image'

  return (
    <div
      ref={clip.ref}
      style={clip.style}
      className={`max-w-[420px] text-sm leading-relaxed ${imageOnly ? 'overflow-hidden' : 'px-4 py-2.5'} ${
        tone === 'outgoing' ? 'bg-[#2A8CFF] text-white' : 'bg-[#F1F5F9] text-text-primary'
      }`}
    >
      {image && <img src={image} alt={altText} loading="lazy" className="block w-full max-h-[320px] object-cover" />}
      {children}
    </div>
  )
}

const COMPOSER_RADIUS = 24

/**
 * Composer ported from prompt-kit's "prompt input with actions" pattern:
 * click-to-focus squircle shell, borderless auto-growing textarea on top,
 * full-width action bar underneath (left: attach + emoji, right: voice + send).
 */
function PromptComposer({
  onSend,
  disabled
}: {
  onSend: (body: string, image?: string) => void
  disabled: boolean
}) {
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clip = useSquircleClip<HTMLDivElement>(COMPOSER_RADIUS)
  const border = useSquircleBorder<HTMLDivElement>(COMPOSER_RADIUS + 2)
  const shellRef = useComposedRef(clip.ref, border.ref)

  const canSend = (draft.trim().length > 0 || attachment !== null) && !disabled

  function adjustHeight(el: HTMLTextAreaElement | null) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  function send() {
    if (!canSend) return
    onSend(draft, attachment ?? undefined)
    setDraft('')
    setAttachment(null)
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setAttachment(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  return (
    <div
      ref={shellRef}
      style={clip.style}
      onClick={() => textareaRef.current?.focus()}
      className="relative w-full cursor-text bg-white transition-shadow"
    >
      <SquircleBorder
        border={border.state}
        stroke={focused ? '#2A8CFF' : '#E4E7EC'}
        strokeWidth={focused ? 2 : 1.5}
      />
      <div className="flex h-full flex-col">
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          disabled={disabled}
          onChange={(e) => {
            setDraft(e.target.value)
            requestAnimationFrame(() => adjustHeight(e.target))
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
          }}
          placeholder={disabled ? 'Sending…' : 'Send a message…'}
          className="block min-h-[44px] w-full resize-none border-none bg-transparent px-4 pt-3 pb-1 text-[15px] leading-[1.35] text-text-primary outline-none placeholder:text-text-tertiary disabled:opacity-60"
        />
        {attachment ? (
          <div className="flex px-4 pb-1">
            <span className="relative inline-block">
              <img src={attachment} alt="Attachment preview" className="h-20 w-20 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#1D2433] text-white transition-colors hover:bg-black"
              >
                <X size={12} />
              </button>
            </span>
          </div>
        ) : null}
        <div className="flex w-full items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-full"
              title="Attach image"
              aria-label="Attach image"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} />
            </Button>
            <Button variant="outline" size="icon-lg" className="rounded-full" title="Insert emoji" aria-label="Insert emoji">
              <Smile size={18} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-lg" className="rounded-full" title="Voice message" aria-label="Voice message">
              <Mic size={18} />
            </Button>
            <Button
              type="button"
              disabled={!canSend}
              variant={canSend ? 'blue' : 'secondary'}
              size="icon-lg"
              className="rounded-full"
              title={disabled ? 'Sending…' : 'Send message'}
              aria-label="Send message"
              onClick={send}
            >
              <ArrowUp size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardMessages() {
  const { error: notifyError } = useToast()
  const [platform, setPlatform] = useState(SOCIAL_ICONS[0].id)
  const [accountSelection, setAccountSelection] = useState<Partial<Record<MessagingPlatform, string>>>({
    ...DEFAULT_MESSAGING_ACCOUNT
  })
  const [accounts, setAccounts] = useState<{ id: string; label: string; handle: string | null }[] | null>(null)
  const [threads, setThreads] = useState<Thread[] | null>(null)
  const [activeIds, setActiveIds] = useState<Partial<Record<MessagingPlatform, string>>>({})
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const CHAT_SQUIRCLE_RADIUS = 20
  const chatClip = useSquircleClip<HTMLDivElement>(CHAT_SQUIRCLE_RADIUS)
  const chatBorder = useSquircleBorder<HTMLDivElement>(CHAT_SQUIRCLE_RADIUS)
  const chatPaneRef = useComposedRef(chatClip.ref, chatBorder.ref)

  const messagesPlatform = MESSAGING_PLATFORM_BY_ICON[platform] ?? 'facebook'
  const selectedAccountId = accountSelection[messagesPlatform] ?? DEFAULT_MESSAGING_ACCOUNT[messagesPlatform]
  const activeId: string | null = activeIds[messagesPlatform] ?? null

  useEffect(() => {
    getAccounts()
      .then((list) =>
        setAccounts(
          list
            .filter((account) => account.platform === messagesPlatform)
            .map((account) => {
              const identity = identityFor(account.id)
              return {
                id: account.id,
                label: account.label,
                // X shows @handle, Reddit the bare username, Facebook none.
                handle:
                  account.platform === 'x' ? (identity?.handle ?? account.label) : account.platform === 'reddit' ? identity?.handle ?? account.id : null
              }
            })
        )
      )
      .catch(() => setAccounts([]))
  }, [messagesPlatform])

  // Load the selected account's inbox whenever the platform tab or the
  // account pick changes; threads are an account-scoped resource.
  useEffect(() => {
    let cancelled = false
    setThreads(null)
    setActiveIds((prev) => {
      const next = { ...prev }
      delete next[messagesPlatform]
      return next
    })
    getThreads(selectedAccountId)
      .then((res) => {
        if (cancelled) return
        setThreads(res.threads)
        setMessagesByThread({})
        setAccountSelection((prev) => (prev[messagesPlatform] === selectedAccountId ? prev : { ...prev, [messagesPlatform]: selectedAccountId }))
        setActiveIds((prev) => {
          const first = res.threads.find((t) => t.platform === messagesPlatform)
          if (!first || prev[messagesPlatform]) return prev
          return { ...prev, [messagesPlatform]: first.id }
        })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          notifyError('Messages failed to load', err instanceof Error ? err.message : 'Could not load threads.')
          setThreads([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [messagesPlatform, selectedAccountId, notifyError])

  useEffect(() => {
    if (!activeId || messagesByThread[activeId]) return
    let cancelled = false
    const thread = threads?.find((t) => t.id === activeId)
    if (!thread) return
    setLoadingMessages(true)
    getThreadMessages(messagesPlatform, selectedAccountId, activeId)
      .then((res) => {
        if (!cancelled) setMessagesByThread((prev) => ({ ...prev, [activeId]: res.messages }))
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          notifyError('Messages failed to load', err instanceof Error ? err.message : 'Could not load messages.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeId, messagesByThread, threads, messagesPlatform, selectedAccountId, notifyError])

  function openThread(id: string) {
    setActiveIds((prev) => ({ ...prev, [messagesPlatform]: id }))
    setThreads((prev) => prev?.map((t) => (t.id === id ? { ...t, unread: 0 } : t)) ?? prev)
    // What opening a conversation does natively; the local unread: 0 above
    // is the instant UI, this is the server-side read state.
    const thread = threads?.find((t) => t.id === id)
    if (thread) acknowledgeThread(messagesPlatform, selectedAccountId, id).catch(() => {})
  }

  function pickAccount(accountId: string) {
    setAccountSelection((prev) => ({ ...prev, [messagesPlatform]: accountId }))
  }

  async function sendMessage(body: string, image?: string) {
    const text = body.trim()
    if ((!text && !image) || !activeId || sending) return
    setSending(true)
    try {
      const { message, thread } = await sendThreadMessage(messagesPlatform, selectedAccountId, activeId, {
        body: text,
        ...(image && { image })
      })
      setMessagesByThread((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), message] }))
      setThreads((prev) => prev?.map((t) => (t.id === activeId ? thread : t)) ?? prev)
    } catch (err: unknown) {
      notifyError('Message not sent', err instanceof Error ? err.message : 'Could not send the message.')
    } finally {
      setSending(false)
    }
  }

  // Connected accounts of the visible platform that this inbox belongs to.
  const visible = (threads ?? []).filter((t) => t.platform === messagesPlatform)
  const active = threads?.find((t) => t.id === activeId) ?? null
  const messages = activeId ? (messagesByThread[activeId] ?? []) : []
  const pickerAccounts = accounts ?? []

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 pt-5 pb-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="lk-no-scrollbar flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            {SOCIAL_ICONS.map((icon) => (
              <PlatformTab key={icon.id} icon={icon} active={icon.id === platform} onClick={() => setPlatform(icon.id)} />
            ))}
            {pickerAccounts.length > 0 && (
              <div className="ml-auto">
                <AccountPicker
                  platform={messagesPlatform}
                  accounts={pickerAccounts}
                  value={selectedAccountId}
                  onChange={pickAccount}
                />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            {threads === null ? (
              <>
                <div className="h-16 animate-pulse rounded-xl bg-black/5" />
                <div className="h-16 animate-pulse rounded-xl bg-black/5" />
                <div className="h-16 animate-pulse rounded-xl bg-black/5" />
              </>
            ) : visible.length === 0 ? (
              <p className="rounded-xl bg-black/5 p-4 text-sm text-text-secondary">No conversations here yet.</p>
            ) : (
              visible.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread.id)}
                  aria-current={thread.id === activeId}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                    thread.id === activeId ? 'bg-brand-600/10' : 'hover:bg-black/5'
                  }`}
                >
                  <ThreadAvatar
                    name={thread.participant.name}
                    initials={thread.participant.initials}
                    color={thread.participant.color}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-text-primary">
                        {thread.participant.name}
                      </span>
                      <span className="shrink-0 text-xs text-text-secondary">{formatChatTime(thread.updatedAt)}</span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-text-secondary">{thread.subject ? `${thread.subject} — ${thread.preview}` : thread.preview}</span>
                      {thread.unread > 0 && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2A8CFF] text-[11px] font-bold text-white">
                          {thread.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div
          ref={chatPaneRef}
          style={chatClip.style}
          className="relative flex min-h-80 min-w-0 flex-col overflow-hidden bg-white lg:min-h-0"
        >
          <SquircleBorder border={chatBorder.state} stroke="#E4E7EC" strokeWidth={2} className="z-10" />
          {!active ? (
            <p className="m-auto text-sm text-text-secondary">Select a conversation to read it.</p>
          ) : (
            <div className="cs-messenger absolute inset-0 flex flex-col bg-white">
                <header className="flex items-center gap-3 border-b border-[#E4E7EC] px-4 py-3">
                  <ThreadAvatar
                    name={active.participant.name}
                    initials={active.participant.initials}
                    color={active.participant.color}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold text-text-primary">{active.participant.name}</span>
                    <span className="truncate text-xs text-text-secondary">
                      {active.participant.handle ? active.participant.handle : identityFor(selectedAccountId)?.accountLabel ?? ''}
                    </span>
                  </span>
                </header>
                <MessageList loading={loadingMessages && messages.length === 0}>
                  <MessageList.Content>
                    {messages.map((message, index) => (
                      <Message
                        key={message.id}
                        model={{
                          sentTime: formatChatTime(message.sentAt),
                          sender: message.from === 'me' ? 'You' : active.participant.name,
                          direction: message.from === 'me' ? 'outgoing' : 'incoming',
                          position:
                            messages.length === 1 ? 'single' : index === 0 ? 'first' : index === messages.length - 1 ? 'last' : 'normal'
                        }}
                      >
                        <Message.CustomContent>
                          <MessageBubble tone={message.from === 'me' ? 'outgoing' : 'incoming'} image={message.image}>
                            {message.body}
                          </MessageBubble>
                        </Message.CustomContent>
                      </Message>
                    ))}
                  </MessageList.Content>
                </MessageList>
                <div className="px-4 pb-4 pt-2">
                  <PromptComposer onSend={sendMessage} disabled={sending} />
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}