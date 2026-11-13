import { PLATFORMS, type Platform } from '../PlatformSuite'
import { HARNESS_PAGES, HARNESS_PLATFORMS } from './harnessPages'
import { PLATFORM_PAGES, type PageId, type PlatformPage } from './platformPages'

export const SITE_PAGES: PlatformPage[] = [...PLATFORM_PAGES, ...HARNESS_PAGES]

export const SITE_PLATFORMS: Platform[] = [...PLATFORMS, ...HARNESS_PLATFORMS]

export const pageById = (id: PageId) => SITE_PAGES.find((page) => page.id === id)

export const pageForAnyPlatform = (platformId: string) => SITE_PAGES.find((page) => page.platformId === platformId)

export const siteOf = (platformId: string) => SITE_PLATFORMS.find((platform) => platform.id === platformId)
