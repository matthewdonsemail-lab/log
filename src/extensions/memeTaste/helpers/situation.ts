import type { MemeTemplate } from '../../memelord/index'
import { TASTE_STYLES } from '../types'
import type { NichePerson, TasteIndex } from '../types'
import { jsonIn } from './llm'
import type { Llm } from './llm'
import type { NicheMapEntry, ReplyProfile } from './nicheMap'
import { captionLines } from './learn'
import type { TasteLines } from './learn'

export interface ThreadPost {
  handle: string
  name: string
  text: string
  img?: string | null
}

export interface Situation {
  thread: ThreadPost[]
  replyingTo: string
  moment: string
  searches: string[]
  person?: NichePerson & { bio: string; followers: number; img: string | null }
}

export async function situationFromPerson(llm: Llm, index: TasteIndex | null, person: NicheMapEntry, profile: ReplyProfile, random: () => number = Math.random, taste: TasteLines = { picked: [], passed: [] }, avoid: { searches: string[]; names: string[] } = { searches: [], names: [] }): Promise<Situation> {
  const pick = person.posts[Math.floor(random() * person.posts.length)]!
  const post = pick.text
  const above = pick.parents.map((p) => '@' + p.handle + ': ' + JSON.stringify(p.text)).join('\n')
  const text = await llm([
    { role: 'system', content: 'You read X posts for a meme picker. Answer with JSON only.' },
    {
      role: 'user',
      content: [
        "matt is a founder on X who answers posts with memes. His meme taste: " + Object.values(TASTE_STYLES).join(' | '),
        'Lines he has posted with memes before: ' + JSON.stringify(theirLines(index)),
        profile.repliedTo.length ? 'Moments he chose to reply to: ' + JSON.stringify(profile.repliedTo) : '',
        profile.skippedPast.length ? 'Moments he skipped: ' + JSON.stringify(profile.skippedPast) : '',
        taste.picked.length ? 'Memes he picked before, so search for that kind: ' + JSON.stringify(taste.picked) : '',
        taste.passed.length ? 'Memes he keeps passing over, so never search for that kind: ' + JSON.stringify(taste.passed) : '',
        taste.captions?.length ? 'Replies he actually wrote here, the meme and his own caption together. This is his voice and how he pairs a meme with words, so search for memes that would carry a caption like his on this post:\n' + captionLines(taste.captions) : '',
        above ? 'The thread above it:\n' + above : '',
        'The post, by @' + person.handle + ' (' + person.name + ', ' + person.role.replace(/_/g, ' ') + ', bio: ' + JSON.stringify(person.bio.slice(0, 200)) + '): ' + JSON.stringify(post),
        avoid.searches.length ? 'Searches already used in earlier rounds, never repeat them or anything close: ' + JSON.stringify(avoid.searches) : '',
        avoid.names.length ? 'Memes already shown lately, so search away from them: ' + JSON.stringify(avoid.names) : '',
        'Not every post is a dunk: matt also hypes friends up, agrees, jokes along, relates, or plays dumb. Read what this post actually is and how matt would really answer it.',
        'Say in one line what is happening in this post that a meme reply would answer, and give 5 meme searches for memes that would answer THIS post. Each search names something specific a meme site would have: a reaction, a character, a show, a clip, a face, a situation ("guy blinking", "spongebob mocking", "kid crying at desk"). Never put the style words in a search (no "deep fried", "larp", "shitpost", "meme"), never money, cash or rich guys unless the post is about money, and make the 5 differ from each other.',
        'JSON: {"moment":"…","searches":["…"]}',
      ].filter(Boolean).join('\n\n'),
    },
  ], { temperature: 0.5, maxTokens: 400 })
  const parsed = jsonIn(text) as { moment?: string; searches?: unknown[] } | null
  const searches = (parsed?.searches ?? []).filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, 4)
  return {
    thread: [...pick.parents.map((p) => ({ handle: p.handle, name: p.name, text: p.text, img: p.img })), { handle: person.handle, name: person.name, text: post, img: person.img }],
    replyingTo: person.handle,
    moment: String(parsed?.moment ?? post.slice(0, 120)),
    searches: searches.length ? searches : [post.split(' ').slice(0, 3).join(' ')],
    person: { handle: person.handle, name: person.name, role: person.role, degree: person.degree, followsYou: person.followsYou, bio: person.bio, followers: person.followers, img: person.img },
  }
}

export interface LabelledMeme {
  id: string
  name: string
  type: string | null
  mediaUrl: string | null
  previewUrl: string | null
  fitsWhen: string
  fit: number
}

const theirLines = (index: TasteIndex | null) => (index?.memes ?? []).map((m) => m.text.replace(/^(@\w+\s*)+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 20)

export async function makeSituation(llm: Llm, index: TasteIndex | null, seen: readonly string[] = []): Promise<Situation> {
  const text = await llm([
    { role: 'system', content: 'You write realistic X (Twitter) threads for a meme picker to practise on. Answer with JSON only.' },
    {
      role: 'user',
      content: [
        "matt is a founder on X who answers threads with memes. His taste: " + Object.values(TASTE_STYLES).join(' | '),
        'Lines he has posted with memes before: ' + JSON.stringify(theirLines(index)),
        'Write one new X thread from his world (his posts above show what it is about) that matt would want to answer with a meme: 1 to 3 posts by other people, the last one the post matt replies to. Make it specific and real, lowercase like X, no hashtags.',
        seen.length ? 'Do not repeat these moments: ' + JSON.stringify(seen.slice(-15)) : '',
        'JSON: {"thread":[{"handle":"…","name":"…","text":"…"}],"replyingTo":"<handle of the last post>","moment":"<one line: what is happening that a meme would answer>","searches":["<3 to 4 short meme searches, 1 to 3 words each, for memes that would answer it>"]}',
      ].filter(Boolean).join('\n\n'),
    },
  ])
  const parsed = jsonIn(text) as Partial<Situation> | null
  const thread = (parsed?.thread ?? []).filter((p): p is ThreadPost => !!p && typeof p.text === 'string').map((p) => ({ handle: String(p.handle ?? 'someone').replace(/^@/, ''), name: String(p.name ?? p.handle ?? ''), text: p.text }))
  if (!thread.length) throw Object.assign(new Error('the model gave no thread'), { code: 'llmFailed' })
  const searches = (parsed?.searches ?? []).filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, 4)
  return { thread, replyingTo: String(parsed?.replyingTo ?? thread.at(-1)!.handle).replace(/^@/, ''), moment: String(parsed?.moment ?? thread.at(-1)!.text), searches: searches.length ? searches : [thread.at(-1)!.text.split(' ').slice(0, 3).join(' ')] }
}

export function unlabelled(t: MemeTemplate): LabelledMeme {
  return { id: t.id, name: t.name, type: t.type, mediaUrl: t.mediaUrl, previewUrl: typeof t.raw.preview_url === 'string' ? t.raw.preview_url : t.mediaUrl, fitsWhen: '', fit: 0 }
}

export async function labelMemes(llm: Llm, situation: Situation, templates: readonly MemeTemplate[], taste: TasteLines = { picked: [], passed: [] }, reply = ''): Promise<LabelledMeme[]> {
  if (!templates.length) return []
  const text = await llm([
    { role: 'system', content: 'You label memes by the situation they answer. Answer with JSON only.' },
    {
      role: 'user',
      content: [
        'The thread: ' + JSON.stringify(situation.thread),
        'The moment: ' + situation.moment,
        reply ? 'matt is replying with: ' + JSON.stringify(reply) + '. Score each meme by how well it goes with his reply.' : '',
        taste.picked.length ? 'Memes matt has picked before (his taste, score their kind higher): ' + JSON.stringify(taste.picked) : '',
        taste.passed.length ? 'Memes matt keeps passing over (not his taste, score their kind lower): ' + JSON.stringify(taste.passed) : '',
        taste.captions?.length ? 'Replies matt actually wrote, meme and caption together (score higher the memes that would carry a caption like his here):\n' + captionLines(taste.captions) : '',
        'For each meme below, from its own name and description, say in a few plain words the situation that meme fits, starting with "when". Every meme is different, so every label is its own: never the same words for two memes, and never just this thread\'s moment. Then say how well it answers this moment, from 0 to 1.',
        'Memes: ' + JSON.stringify(templates.map((t) => ({ id: t.id, name: t.name, description: typeof t.raw.description === 'string' ? t.raw.description.slice(0, 220) : '' }))),
        'JSON: [{"id":"…","fitsWhen":"…","fit":0.0}]',
      ].filter(Boolean).join('\n\n'),
    },
  ], { temperature: 0.2, maxTokens: 2400 })
  const labels = new Map(((jsonIn(text) as { id?: string; fitsWhen?: string; fit?: number }[] | null) ?? []).filter((l) => l?.id).map((l) => [l.id!, l]))
  return templates
    .map((t) => {
      const label = labels.get(t.id)
      return { ...unlabelled(t), fitsWhen: label?.fitsWhen ?? '', fit: typeof label?.fit === 'number' ? label.fit : 0 }
    })
    .sort((a, b) => b.fit - a.fit)
}
