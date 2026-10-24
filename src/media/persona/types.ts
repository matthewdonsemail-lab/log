export const PERSONA_IMAGE_ENDPOINT = 'reapi.image-gen.gemini-3-pro-image'
export const PERSONA_IMAGE_MODEL = 'gemini-3-pro-image-preview'
export const PERSONA_IMAGE_SIZE = '3:4'
export const PERSONA_IMAGE_RESOLUTION = '1K'
export const PERSONA_MAX_ATTEMPTS = 5
export const PERSONA_MIN_AGE = 18
export const PERSONA_PASS = 0.6
export const PERSONA_OVERALL_PASS = 0.7
export const PROFILE_PICTURE_FILE = 'profilePicture.png'

export type PictureFacet = 'matchesPersona' | 'ageFits' | 'genderFits' | 'lifeFits' | 'selfieStyle' | 'looksReal' | 'noText' | 'armHidden' | 'lowAngle' | 'unflattering' | 'backgroundDistinct' | 'likeReference'

export interface PictureCheck {
  scores: Record<PictureFacet, number>
  passed: boolean
  failed: PictureFacet[]
  inputTokens: number
}

export interface PictureAttempt {
  n: number
  task: string
  url: string
  credits: number
  prompt: string
  check: PictureCheck
}

export interface GeneratedImage {
  task: string
  url: string
  credits: number
}

export interface PersonaRecord {
  personaId: string
  seed: number
  country: string
  characteristics: Record<string, string>
  sources: string[]
  prompt: string
  avoid: string
  size: string
  resolution: string
  generatedWith: string
  attempts: PictureAttempt[]
  profilePicture: string | null
  matched: boolean
  rejected?: { at: string; by: string; reason: string; tasks: string[] }[]
  rechecks?: { at: string; check: PictureCheck }[]
  approved?: { at: string; by: string }
  styleReference?: boolean
  backgroundsTried?: string[]
}

export interface PictureDeps {
  generate: (prompt: string, avoid: string) => Promise<GeneratedImage>
  download: (url: string) => Promise<Uint8Array>
  check: (record: PersonaRecord, png: Uint8Array) => Promise<PictureCheck>
  save: (record: PersonaRecord, png: Uint8Array) => Promise<string>
  toPng: (bytes: Uint8Array) => Promise<Uint8Array>
  log: (line: string) => void
}
