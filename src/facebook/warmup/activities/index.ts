export * from './helpers/index'
export * from './machine'
export * from './types'

import { FEED } from './helpers/feed'
import { REEL } from './helpers/reel'
import type { PlatformActivity } from './types'

export const FACEBOOK_ACTIVITIES: Record<string, PlatformActivity> = { reel: REEL, feed: FEED }
