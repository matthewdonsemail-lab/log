export const TASTE_STYLES = {
  deepFried: 'Deep fried: the picture is blown out, oversaturated, crusted with jpeg noise, glowing eyes or distorted text, made to look burnt',
  larping: 'Larping: someone roleplaying as what they are not (a trader, a founder, an alpha, a knight, a rich guy), the joke is the act',
  streamerReacts: 'Streamer reacts: a real person reacting on camera, the FlightReacts, Zias and Bloo kind of clip or face, shock, laughing, disgust',
  shitpost: 'Shitpost: a low-effort, absurd or ugly meme where the joke is how bad or random it is',
} as const

export type TasteStyle = keyof typeof TASTE_STYLES

export const TASTE_OTHER = 'other'

export const MEME_AT = 0.5
export const FIT_AT = 0.5

export interface TasteCandidate {
  id: string
  source: 'x'
  url: string
  text: string
  at: string | null
  imageUrl: string
  mediaUrl: string | null
  kind: 'photo' | 'video' | 'gif'
}

export interface TasteMeme extends TasteCandidate {
  meme: number
  style: TasteStyle | typeof TASTE_OTHER
  styleConfidence: number
}

export interface TasteIndex {
  builtAt: string
  from: string
  read: number
  memes: TasteMeme[]
}

export interface TasteFit {
  fit: number
  style: TasteStyle | typeof TASTE_OTHER
  styleConfidence: number
}


export interface NichePerson {
  handle: string
  name: string
  role: string
  degree: number
  followsYou: boolean
}

export interface TasteRating {
  word: string
  person?: NichePerson
  skipped?: boolean
  thread?: { handle: string; text: string }[]
  templateId: string
  name: string
  mediaUrl: string | null
  good: boolean
  fitsWhen?: string
  other?: string
  reply?: string
  searched?: string
  fromSearch?: boolean
  shown?: string[]
  call?: ModelCall
  callMatched?: boolean
  at: string
}

export interface ModelCall {
  action: 'reply' | 'skip'
  templateId: string
  name: string
  caption: string
  confidence: number
  odds?: { wouldReply: number; meme: number }
}
