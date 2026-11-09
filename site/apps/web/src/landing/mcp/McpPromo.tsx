import { useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faInstagram, faRedditAlien, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { MCP_PATH } from './mcpContent'
import './McpPromo.css'

const CLOSED_KEY = 'logMcpPromoClosed'

const TILES = [
  { icon: faXTwitter, label: 'X', x: 13, y: 30, rotate: -8 },
  { icon: faDiscord, label: 'Discord', x: 29, y: 74, rotate: 6 },
  { icon: faRedditAlien, label: 'Reddit', x: 50, y: 16, rotate: -3 },
  { icon: faSlack, label: 'Slack', x: 76, y: 28, rotate: 8 },
  { icon: faInstagram, label: 'Instagram', x: 87, y: 72, rotate: -6 },
]

const CENTER = { x: 55, y: 58 }

function readClosed() {
  try {
    return window.localStorage.getItem(CLOSED_KEY) === '1'
  } catch {
    return false
  }
}

function saveClosed() {
  try {
    window.localStorage.setItem(CLOSED_KEY, '1')
  } catch {
    return
  }
}

function Art() {
  return (
    <div aria-hidden className="relative h-[136px] w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--mcp-promo-art-top) 0%, var(--mcp-promo-art-bottom) 100%)' }}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {TILES.map((tile) => (
          <line key={tile.label} x1={CENTER.x} y1={CENTER.y} x2={tile.x} y2={tile.y} stroke="var(--mcp-promo-line)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {TILES.map((tile) => (
        <span
          key={tile.label}
          className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl text-[16px] shadow-[0_3px_0_rgba(13,42,76,0.12)]"
          style={{ left: `${tile.x}%`, top: `${tile.y}%`, rotate: `${tile.rotate}deg`, background: 'var(--mcp-promo-tile)', color: 'var(--mcp-promo-tile-ink)' }}
        >
          <FontAwesomeIcon icon={tile.icon} />
        </span>
      ))}
      <span
        className="absolute grid size-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl shadow-[0_4px_0_#1A5FC8,0_10px_24px_-8px_rgba(13,42,76,0.45)]"
        style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%`, background: 'var(--mcp-promo-tile)' }}
      >
        <img src="/logo.svg" alt="" className="size-11 rounded-xl" />
      </span>
    </div>
  )
}

export function McpPromo() {
  const { pathname } = useLocation()
  const [closed, setClosed] = useState(readClosed)
  const close = () => {
    saveClosed()
    setClosed(true)
  }
  const shown = !closed && pathname !== MCP_PATH && !pathname.startsWith('/shareCard')
  return (
    <AnimatePresence>
      {shown ? (
        <motion.aside
          key="mcpPromo"
          aria-label="New: the log MCP"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30, delay: 0.6 }}
          className="fixed bottom-4 left-4 z-[80] max-w-[calc(100vw-2rem)] sm:bottom-6 sm:left-6"
          style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif", color: 'var(--mcp-promo-ink)' }}
        >
          <div
            className="flex items-center gap-1 rounded-full py-1 pl-1 pr-1 shadow-[0_4px_0_#1A5FC8,0_12px_24px_-12px_rgba(13,42,76,0.45)] ring-1 sm:hidden"
            style={{ background: 'var(--mcp-promo-card)', '--tw-ring-color': 'var(--mcp-promo-ring)' } as CSSProperties}
          >
            <a href={MCP_PATH} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-[13px] font-bold">
              <img src="/logo.svg" alt="" className="size-7 rounded-lg" />
              <span className="rounded-full bg-[#2A8CFF] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">New</span>
              log MCP
              <FontAwesomeIcon icon={faArrowRight} className="text-[11px] text-[#2A8CFF]" />
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-7 place-items-center rounded-full text-[13px] transition-colors hover:bg-[var(--mcp-promo-close-hover)]"
              style={{ color: 'var(--mcp-promo-muted)' }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div
            className="hidden w-[320px] overflow-hidden rounded-3xl shadow-[0_5px_0_#1A5FC8,0_24px_48px_-16px_rgba(13,42,76,0.5)] ring-1 sm:block"
            style={{ background: 'var(--mcp-promo-card)', '--tw-ring-color': 'var(--mcp-promo-ring)' } as CSSProperties}
          >
            <Art />
            <div className="flex flex-col gap-3 p-5">
              <span className="self-start rounded-full bg-[#2A8CFF] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white">New: log MCP</span>
              <p className="text-[20px] font-black leading-tight tracking-[-0.02em]">Your AI agent runs your DMs</p>
              <p className="text-[14px] leading-snug" style={{ color: 'var(--mcp-promo-muted)' }}>
                Claude Code or Codex reads your inbox, drafts replies in your voice and sends from your own accounts on X, Discord, Slack, Instagram and Reddit, only when you say so.
              </p>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl px-4 py-2.5 text-[15px] font-bold transition-colors hover:bg-[var(--mcp-promo-close-hover)]"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--mcp-promo-close-ring)' }}
                >
                  Close
                </button>
                <a
                  href={MCP_PATH}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2A8CFF] px-4 py-2.5 text-[15px] font-bold text-white shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
                >
                  See the log MCP
                  <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
                </a>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
