import { HOME_COUNTRIES } from '../../../marketplace/home/index'
import type { FacebookAccount } from '../../../marketplace/socialAccount/index'
import type { CreateProfileBody } from '../../localApi/index'

/** The remark that ties a profile back to its Twenty record, so a lost link can be found again. */
export const twentyRemark = (accountId: string) => `log-cli twenty:${accountId}`
export const remarkAccountId = (remark: string | null): string | null => remark?.match(/twenty:(\S+)/)?.[1] ?? null

/**
 * The create body for an account's profile. A Windows Chrome profile (the engine most
 * Facebook users run, SubQ's `commonEngine`), the language pinned from the home country
 * (rule 16, HOME_COUNTRIES), timezone and geolocation from the exit IP, and AdsPower's
 * per-profile canvas, WebGL image, audio, client-rects and media-device noise (the
 * `renderUniqueness` issue). No proxy: the gate sets it at open (rule 12). Pure.
 */
export function profileRequest(account: FacebookAccount, groupId: string): CreateProfileBody | null {
  const home = HOME_COUNTRIES[account.homeCountry ?? '']
  if (!home) return null
  const language = [home.locale, home.locale.split('-')[0]]
  return {
    name: account.accountName,
    group_id: groupId,
    remark: twentyRemark(account.id),
    platform: 'facebook.com',
    user_proxy_config: { proxy_soft: 'no_proxy' },
    fingerprint_config: {
      browser_kernel_config: { type: 'chrome', version: 'ua_auto' },
      random_ua: { ua_system_version: ['Windows 10', 'Windows 11'] },
      automatic_timezone: '1',
      language_switch: '0',
      language,
      page_language_switch: '1',
      location_switch: '1',
      location: 'ask',
      webrtc: 'forward',
      canvas: '1',
      webgl_image: '1',
      webgl: '3',
      audio: '1',
      client_rects: '1',
      media_devices: '1',
      speech_switch: '1',
      device_name_switch: '1',
      scan_port_type: '1'
    }
  }
}
