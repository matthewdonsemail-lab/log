export interface ProxyCheck {
  ok: true;
  exitIp: string;
  exitCountry: string;
  country: string;
  latitude?: number;
  longitude?: number;
  facebookMs?: number | null;
}

export const SLOW_FACEBOOK_MS = 2500;

export function slowFacebookMs(env: Record<string, string | undefined> = process.env): number {
  const set = Number(env.LOG_PROXY_MAX_MS);
  return Number.isFinite(set) && set > 0 ? set : SLOW_FACEBOOK_MS;
}
