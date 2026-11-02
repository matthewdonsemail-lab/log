export const MEMELORD_API = 'https://www.memelord.com/api/v1'

export const MEMELORD_TOOLS = {
  searchMemes: '/templates/search',
  getMemeTemplate: '/templates/',
  getTrendingMemes: '/templates/trending',
  listImageTools: '/image-tools',
} as const

export type MemelordTool = keyof typeof MEMELORD_TOOLS

export const MEME_TYPES = ['meme', 'video', 'sticker'] as const
export type MemeType = (typeof MEME_TYPES)[number]

export const SEARCH_METHODS = ['semantic_context', 'semantic_combined', 'semantic_media', 'fulltext', 'fuzzy'] as const
export type SearchMethod = (typeof SEARCH_METHODS)[number]

export const TRENDING_MEDIA = ['image', 'video'] as const

export const IMAGE_TOOL_CATEGORIES = { imageToImage: 'image-to-image', imageTextToImage: 'image-text-to-image', textToImage: 'text-to-image' } as const
export type ImageToolCategory = keyof typeof IMAGE_TOOL_CATEGORIES

export const SEARCH_METHOD_FLAGS = { context: 'semantic_context', combined: 'semantic_combined', media: 'semantic_media', fulltext: 'fulltext', fuzzy: 'fuzzy' } as const
export type SearchMethodFlag = keyof typeof SEARCH_METHOD_FLAGS

export interface MemeSearch {
  query: string
  type?: MemeType
  method?: SearchMethod
  limit?: number
  offset?: number
}

export interface MemeTemplate {
  id: string
  name: string
  type: string | null
  mediaUrl: string | null
  textSlots: number | null
  context: string | null
  raw: Record<string, unknown>
}

export interface MemelordAnswer<T> {
  ok: boolean
  status: number
  code: string | null
  error: string | null
  data: T | null
}

export type MemelordFetch = (url: string, init: { method: 'GET'; headers: Record<string, string> }) => Promise<{ status: number; json: () => Promise<unknown> }>
