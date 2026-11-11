import type { ReactNode } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faReddit, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faComment, faFaceSmile, faHeart, faImage, faThumbsUp } from '@fortawesome/free-regular-svg-icons'
import {
  faArrowDown,
  faArrowUp,
  faCaretRight,
  faCirclePlus,
  faEarthAmericas,
  faGear,
  faGift,
  faHashtag,
  faLocationDot,
  faMicrophone,
  faMagnifyingGlass,
  faPaperPlane,
  faRetweet,
  faShare,
} from '@fortawesome/free-solid-svg-icons'

const SLOT_SECONDS = 1.6
const SLOTS = 4
const CYCLE_SECONDS = SLOT_SECONDS * SLOTS
const REST_SHADOW = '0 0 0 0px rgba(42, 140, 255, 0), 0 0px 0px -20px rgba(13, 42, 76, 0)'
const RAISED_SHADOW = '0 0 0 6px rgba(42, 140, 255, 0.22), 0 24px 48px -20px rgba(13, 42, 76, 0.35)'

function Step({ index, children, className = '' }: { index: number; children: ReactNode; className?: string }) {
  const focusScale = useMotionValue(1)
  const focusLayer = useTransform(focusScale, (value) => value > 1.000001 ? 30 : 0)
  const slot = SLOT_SECONDS / CYCLE_SECONDS
  const start = index * slot + 0.001
  const times = [0, start, start + slot * 0.25, start + slot * 0.75, start + slot - 0.001, 1]
  const loop = { duration: CYCLE_SECONDS, times, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.9 }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      style={{ scale: focusScale, zIndex: focusLayer }}
      animate={{
        opacity: 1,
        y: 0,
        z: [0, 0, 48, 48, 0, 0],
        scale: [1, 1, 1.04, 1.04, 1, 1],
        boxShadow: [REST_SHADOW, REST_SHADOW, RAISED_SHADOW, RAISED_SHADOW, REST_SHADOW, REST_SHADOW],
      }}
      transition={{
        opacity: { duration: 0.35, delay: 0.15 + index * 0.18, ease: 'easeOut' },
        y: { duration: 0.35, delay: 0.15 + index * 0.18, ease: 'easeOut' },
        z: loop,
        scale: loop,
        boxShadow: loop,
      }}
      className={`relative rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Icon({ icon, className = '' }: { icon: IconDefinition; className?: string }) {
  return <FontAwesomeIcon icon={icon} aria-hidden className={className} />
}

function Avatar({ name, color, size = 'size-10', rounded = 'rounded-full' }: { name: string; color: string; size?: string; rounded?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center font-bold text-white ${size} ${rounded}`} style={{ background: color }}>
      {name[0].toUpperCase()}
    </span>
  )
}

function LogTag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full bg-[#2A8CFF] px-2 py-0.5 text-[11px] font-bold text-white ${className}`}>
      {children}
    </span>
  )
}

const X_FONT = { fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }

function XDemo() {
  const rows = [
    { name: 'Sarah Builds', handle: 'sarah_builds', when: '2m', text: 'how much for a full site?', tag: 'Waiting on you', color: '#1D9BF0', unread: true },
    { name: 'Tom', handle: 'tomgrowth', when: '1h', text: 'You: saw your post about cold email', tag: 'Seen, no reply', color: '#7856FF', unread: false },
    { name: 'Jay', handle: 'jaylocal', when: '3h', text: 'yeah let’s do thursday', tag: 'Waiting on you', color: '#F91880', unread: true },
  ]
  return (
    <div className="w-full rounded-2xl border border-[#EFF3F4] bg-white text-left text-[15px] text-[#0F1419]" style={X_FONT}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xl font-extrabold">Messages</span>
        <div className="flex items-center gap-4 text-[#0F1419]">
          <Icon icon={faGear} className="text-lg" />
          <Icon icon={faXTwitter} className="text-xl" />
        </div>
      </div>
      <div className="mx-4 mb-2 flex items-center gap-2 rounded-full border border-[#CFD9DE] px-4 py-2 text-sm text-[#536471]">
        <Icon icon={faMagnifyingGlass} className="text-sm" />
        Search Direct Messages
      </div>
      {rows.map((row, index) => (
        <Step key={row.handle} index={index} className="flex items-start gap-3 rounded-xl bg-white px-4 py-3">
          <Avatar name={row.name} color={row.color} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="truncate font-bold">{row.name}</span>
              <span className="truncate text-[#536471]">@{row.handle} {row.when}</span>
            </div>
            <div className={`truncate ${row.unread ? 'font-semibold text-[#0F1419]' : 'text-[#536471]'}`}>{row.text}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LogTag>{row.tag}</LogTag>
            {row.unread ? <span className="size-2.5 rounded-full bg-[#1D9BF0]" /> : null}
          </div>
        </Step>
      ))}
      <Step index={3} className="rounded-b-2xl border-t border-[#EFF3F4] bg-white px-4 py-3">
        <div className="flex items-center gap-3 rounded-2xl bg-[#EFF3F4] px-4 py-2.5">
          <span className="min-w-0 flex-1 truncate">depends what you need, what&apos;s the site for?</span>
          <LogTag className="bg-[#0F1419]">dry run</LogTag>
          <Icon icon={faPaperPlane} className="text-lg text-[#1D9BF0]" />
        </div>
      </Step>
    </div>
  )
}

const FB_FONT = { fontFamily: 'Helvetica, Arial, "Segoe UI", sans-serif' }

function FacebookDemo() {
  return (
    <div className="w-full rounded-lg border border-[#DADDE1] bg-[#F0F2F5] text-left text-[15px] text-[#050505]" style={FB_FONT}>
      <div className="flex items-center gap-2 rounded-t-lg bg-white px-4 py-2.5">
        <Icon icon={faFacebook} className="text-4xl text-[#0866FF]" />
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2 text-sm text-[#65676B]">
          <Icon icon={faMagnifyingGlass} className="text-sm" />
          Search Marketplace
        </div>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <Step index={0} className="flex gap-3 rounded-lg bg-white p-3">
          <img src="/images/listingClearOut.webp" alt="" className="size-24 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-bold">$80</div>
            <div className="truncate">Same-day rubbish removal</div>
            <div className="mt-0.5 flex items-center gap-1 text-[13px] text-[#65676B]">
              <Icon icon={faLocationDot} className="text-xs" />Bethlehem, PA
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-[#E7F3E8] px-2 py-0.5 text-xs font-semibold text-[#31A24C]">Active</span>
              <span className="rounded-md bg-[#E4E6EB] px-2 py-0.5 text-xs font-semibold text-[#65676B]">14 clicks</span>
            </div>
          </div>
        </Step>
        <Step index={1} className="rounded-lg bg-white">
          <div className="flex items-start gap-2 px-3 pt-3">
            <Avatar name="Dana" color="#E4405F" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">Dana Miller <span className="font-normal text-[#65676B]"><Icon icon={faCaretRight} className="mx-1" />Lehigh Valley Locals</span></div>
              <div className="text-[13px] text-[#65676B]">12m <Icon icon={faEarthAmericas} className="text-[11px]" /></div>
            </div>
            <LogTag>Asking for you</LogTag>
          </div>
          <div className="px-3 py-2">anyone know someone who can clear a garage this week?</div>
          <div className="mx-3 flex justify-around border-t border-[#CED0D4] py-1 text-sm font-semibold text-[#65676B]">
            <span className="flex items-center gap-1.5 py-1"><Icon icon={faThumbsUp} />Like</span>
            <span className="flex items-center gap-1.5 py-1"><Icon icon={faComment} />Comment</span>
            <span className="flex items-center gap-1.5 py-1"><Icon icon={faShare} />Share</span>
          </div>
        </Step>
      </div>
    </div>
  )
}

const DC_FONT = { fontFamily: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }

function DiscordDemo() {
  const messages = [
    { name: 'mila', color: '#F47FFF', time: 'Today at 4:12 PM', text: 'anyone tried the new ads manager?' },
    { name: 'deano', color: '#43B581', time: 'Today at 4:13 PM', text: 'yeah, cut our cost per lead in half' },
    { name: 'mila', color: '#F47FFF', time: 'Today at 4:13 PM', text: 'send me the setup?' },
  ]
  return (
    <div className="flex w-full rounded-lg bg-[#313338] text-left text-[15px] text-[#DBDEE1]" style={DC_FONT}>
      <div className="hidden w-[72px] shrink-0 flex-col items-center gap-2 rounded-l-lg bg-[#1E1F22] py-3 sm:flex">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#5865F2] text-white">
          <Icon icon={faDiscord} className="text-2xl" />
        </span>
        <span className="h-0.5 w-8 rounded bg-[#35363C]" />
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#2A8CFF] text-lg font-bold text-white">GM</span>
        <span className="flex size-12 items-center justify-center rounded-full bg-[#313338] text-lg font-bold text-[#DBDEE1]">SL</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-[#1F2023] px-4 py-3 font-semibold text-[#F2F3F5]">
          <Icon icon={faHashtag} className="text-lg text-[#80848E]" />
          marketing
          <LogTag className="ml-auto">watching live</LogTag>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4">
          {messages.map((message, index) => (
            <Step key={index} index={index} className="flex items-start gap-3 rounded-md bg-[#313338] p-1">
              <Avatar name={message.name} color={message.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium" style={{ color: message.color }}>{message.name}</span>
                  <span className="text-xs text-[#949BA4]">{message.time}</span>
                </div>
                <div>{message.text}</div>
              </div>
            </Step>
          ))}
        </div>
        <Step index={3} className="mx-4 mb-4 rounded-lg bg-[#313338]">
          <div className="flex items-center gap-3 rounded-lg bg-[#383A40] px-4 py-2.5">
            <Icon icon={faCirclePlus} className="text-xl text-[#B5BAC1]" />
            <span className="min-w-0 flex-1 truncate text-[#DBDEE1]">here you go, it&apos;s three steps</span>
            <LogTag className="bg-[#1E1F22]">dry run</LogTag>
            <Icon icon={faGift} className="text-lg text-[#B5BAC1]" />
            <Icon icon={faFaceSmile} className="text-lg text-[#B5BAC1]" />
          </div>
        </Step>
      </div>
    </div>
  )
}

const RD_FONT = { fontFamily: '-apple-system, "Segoe UI", Roboto, "IBM Plex Sans", Arial, sans-serif' }

function RedditDemo() {
  return (
    <div className="w-full rounded-2xl border border-[#E5EBEE] bg-white text-left text-sm text-[#0F1A1C]" style={RD_FONT}>
      <div className="flex items-center gap-2 border-b border-[#E5EBEE] px-4 py-2.5">
        <Icon icon={faReddit} className="text-3xl text-[#FF4500]" />
        <span className="text-xl font-extrabold tracking-tight">reddit</span>
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-full bg-[#EAEDEF] px-3 py-1.5 text-[#576F76] sm:flex">
          <Icon icon={faMagnifyingGlass} className="text-sm" />
          Search Reddit
        </div>
        <Step index={0} className="ml-auto flex items-center gap-2 rounded-full bg-white p-1">
          <Avatar name="you" color="#FF4500" size="size-7" />
          <LogTag>signed in</LogTag>
        </Step>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {[
          { sub: 'r/marketing', when: '5 hr. ago', title: 'What actually worked for you to get your first 100 customers?', votes: '1.2k', comments: '348' },
          { sub: 'r/smallbusiness', when: '9 hr. ago', title: 'Is anyone still getting leads from Facebook groups?', votes: '412', comments: '97' },
        ].map((post, index) => (
          <Step key={post.title} index={index + 1} className="rounded-2xl bg-white px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Avatar name={post.sub[2]} color="#0079D3" size="size-5" />
              <span className="font-semibold">{post.sub}</span>
              <span className="text-[#576F76]">• {post.when}</span>
            </div>
            <div className="mt-1 text-base font-semibold leading-snug">{post.title}</div>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1 rounded-full bg-[#EAEDEF] px-2 py-1.5">
                <Icon icon={faArrowUp} />{post.votes}<Icon icon={faArrowDown} />
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#EAEDEF] px-3 py-1.5"><Icon icon={faComment} />{post.comments}</span>
              <span className="flex items-center gap-1 rounded-full bg-[#EAEDEF] px-3 py-1.5"><Icon icon={faShare} />Share</span>
            </div>
          </Step>
        ))}
        <Step index={3} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-[#576F76]">
          <LogTag>recorded steps</LogTag>
          go to r/marketing → snapshot → open post → back
        </Step>
      </div>
    </div>
  )
}

const LI_FONT = { fontFamily: '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }

function LinkedinDemo() {
  return (
    <div className="w-full rounded-lg border border-[#E0DFDC] bg-[#F4F2EE] text-left text-sm text-[#191919]" style={LI_FONT}>
      <div className="flex items-center gap-2 rounded-t-lg bg-white px-4 py-2">
        <Icon icon={faLinkedin} className="text-4xl text-[#0A66C2]" />
        <div className="flex flex-1 items-center gap-2 rounded bg-[#EDF3F8] px-3 py-1.5 text-[#666]">
          <Icon icon={faMagnifyingGlass} className="text-sm" />
          Search
        </div>
        <Step index={0} className="rounded-full">
          <LogTag>session saved</LogTag>
        </Step>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <Step index={1} className="overflow-hidden rounded-lg border border-[#E0DFDC] bg-white">
          <div className="h-14 bg-gradient-to-r from-[#A0B4B7] to-[#D1DCDD]" />
          <div className="-mt-7 px-4 pb-3">
            <span className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-[#0A66C2] text-xl font-bold text-white">Y</span>
            <div className="mt-1 text-base font-semibold">Your Name</div>
            <div className="text-[#666]">Growth marketer helping local businesses get found</div>
          </div>
        </Step>
        <Step index={2} className="rounded-lg border border-[#E0DFDC] bg-white p-3">
          <div className="flex items-center gap-2">
            <Avatar name="Priya" color="#8F5849" size="size-10" />
            <div>
              <div className="font-semibold">Priya Shah</div>
              <div className="text-xs text-[#666]">Head of Growth 1h</div>
            </div>
          </div>
          <div className="mt-2">We tested 4 outreach channels this quarter. Here is what booked meetings…</div>
          <div className="mt-2 flex justify-around border-t border-[#E0DFDC] pt-2 text-xs font-semibold text-[#666]">
            <span className="flex items-center gap-1"><Icon icon={faThumbsUp} />Like</span>
            <span className="flex items-center gap-1"><Icon icon={faComment} />Comment</span>
            <span className="flex items-center gap-1"><Icon icon={faRetweet} />Repost</span>
            <span className="flex items-center gap-1"><Icon icon={faPaperPlane} />Send</span>
          </div>
        </Step>
      </div>
    </div>
  )
}

const SL_FONT = { fontFamily: 'Lato, "Slack-Lato", "Helvetica Neue", Helvetica, Arial, sans-serif' }

function SlackDemo() {
  const chats = [
    { name: 'Priya', color: '#E01E5A', active: true },
    { name: 'Tom, Jay', color: '#2EB67D', active: false },
    { name: 'Sam', color: '#ECB22E', active: false },
  ]
  const messages = [
    { name: 'Priya', color: '#E01E5A', time: '4:12 PM', text: 'did the outreach sheet work for you?' },
    { name: 'Priya', color: '#E01E5A', time: '4:12 PM', text: 'we got 9 calls booked off it this week' },
  ]
  return (
    <div className="flex w-full rounded-lg border border-[#DDDDDD] bg-white text-left text-[15px] text-[#1D1C1D]" style={SL_FONT}>
      <div className="hidden w-[150px] shrink-0 flex-col gap-1 rounded-l-lg bg-[#4A154B] px-2 py-3 text-[14px] text-[#CFC3CF] sm:flex">
        <div className="mb-2 flex items-center gap-2 px-2 font-bold text-white">
          <Icon icon={faSlack} className="text-lg" />
          growth-co
        </div>
        <div className="px-2 text-[12px] font-semibold uppercase tracking-wide text-[#CFC3CF]/80">Direct messages</div>
        {chats.map((chat) => (
          <div key={chat.name} className={`flex items-center gap-2 rounded-md px-2 py-1 ${chat.active ? 'bg-[#1164A3] text-white' : ''}`}>
            <Avatar name={chat.name} color={chat.color} size="size-5" rounded="rounded" />
            <span className="truncate">{chat.name}</span>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-[#DDDDDD] px-4 py-3 font-bold">
          <Avatar name="Priya" color="#E01E5A" size="size-6" rounded="rounded" />
          Priya
          <Step index={0} className="ml-auto rounded-full">
            <LogTag>watching live</LogTag>
          </Step>
        </div>
        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          {messages.map((message, index) => (
            <Step key={index} index={index + 1} className="flex items-start gap-3 rounded-md bg-white p-1">
              <Avatar name={message.name} color={message.color} size="size-9" rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">{message.name}</span>
                  <span className="text-xs text-[#616061]">{message.time}</span>
                </div>
                <div>{message.text}</div>
              </div>
            </Step>
          ))}
        </div>
        <Step index={3} className="mx-4 mb-4 rounded-lg bg-white">
          <div className="flex items-center gap-3 rounded-lg border border-[#BBBBBB] px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate">that&apos;s brilliant, what changed?</span>
            <LogTag className="bg-[#4A154B]">dry run</LogTag>
            <Icon icon={faPaperPlane} className="text-lg text-[#007A5A]" />
          </div>
        </Step>
      </div>
    </div>
  )
}

const IG_FONT = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }
const IG_GRADIENT = 'linear-gradient(45deg, #FEDA75 0%, #FA7E1E 25%, #D62976 50%, #962FBF 75%, #4F5BD5 100%)'

function InstagramDemo() {
  return (
    <div className="w-full rounded-2xl border border-[#DBDBDB] bg-white text-left text-[15px] text-[#000000]" style={IG_FONT}>
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-[#DBDBDB] bg-white px-4 py-3">
        <span className="rounded-full p-[2px]" style={{ background: IG_GRADIENT }}>
          <span className="block rounded-full border-2 border-white">
            <Avatar name="maya" color="#962FBF" size="size-9" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">maya.makes</div>
          <div className="text-xs text-[#737373]">Active now</div>
        </div>
        <Icon icon={faInstagram} className="text-2xl" />
        <Step index={0} className="rounded-full">
          <LogTag>watching live</LogTag>
        </Step>
      </div>
      <div className="flex flex-col gap-2 px-4 py-4">
        <Step index={1} className="flex items-end gap-2 self-start rounded-3xl bg-white">
          <Avatar name="maya" color="#962FBF" size="size-7" />
          <span className="rounded-3xl bg-[#EFEFEF] px-4 py-2">finally launched the shop</span>
        </Step>
        <Step index={2} className="flex flex-col items-end gap-1.5 self-end rounded-3xl bg-white">
          <div className="flex w-40 flex-col items-center justify-center gap-1 rounded-3xl bg-[#1D1C1D] px-3 py-6 text-center text-white">
            <Icon icon={faImage} className="text-2xl text-white/70" />
            <span className="text-[13px] font-bold uppercase leading-tight">a meme that fits the moment</span>
          </div>
          <LogTag className="bg-[#0F1419]">sent with --photo</LogTag>
        </Step>
      </div>
      <Step index={3} className="mx-3 mb-3 rounded-full bg-white">
        <div className="flex items-center gap-3 rounded-full border border-[#DBDBDB] px-4 py-2.5">
          <Icon icon={faFaceSmile} className="text-lg" />
          <span className="min-w-0 flex-1 truncate">massive, what are you selling first?</span>
          <LogTag className="bg-[#0F1419]">dry run</LogTag>
          <Icon icon={faMicrophone} className="text-lg" />
          <Icon icon={faHeart} className="text-lg" />
        </div>
      </Step>
    </div>
  )
}

export const PLATFORM_DEMOS: Record<string, () => ReactNode> = {
  x: XDemo,
  facebook: FacebookDemo,
  discord: DiscordDemo,
  slack: SlackDemo,
  instagram: InstagramDemo,
  reddit: RedditDemo,
  linkedin: LinkedinDemo,
}

