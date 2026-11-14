export interface LinkedinBrowser {
  userAgent: string;
  secChUa?: string;
  secChUaMobile?: string;
  secChUaPlatform?: string;
  acceptLanguage?: string;
  xLiTrack?: string;
}

export interface CopiedRequest {
  url: string | null;
  cookies: Record<string, string>;
  browser: LinkedinBrowser | null;
}

export type CopiedRequestProblem = "notCurl" | "notLinkedin" | "noCookies" | "noSessionCookies" | "noBrowserCookies" | "noUserAgent" | "mobileBrowser";
