/** URL helpers for the blaster sign-in handoff. Pure. */

/** Never print a token in full; first/last four with the middle masked. */
export function maskSecret(token: string): string {
  if (token.length <= 12) return "***";
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

/** Accept http(s) origins only. Returns the problem, or undefined when fine. */
export function validateHttpUrl(value: string | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return "URL is required";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "URL must use http or https";
  } catch {
    return "URL must be an absolute URL";
  }
  return undefined;
}

/**
 * The page the CLI opens: blaster's `/login`, carrying this run's state,
 * PKCE challenge and the loopback exchange URL the browser posts back to.
 * blaster's web app (`apps/web/src/lib/auth/cliHandoff`) does the rest.
 */
export function buildAuthorizeUrl(webUrl: string, state: string, challenge: string, exchangeUrl: string): string {
  const url = new URL("/login", webUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("exchange", exchangeUrl);
  return url.toString();
}

/** The marker blaster's `apps/web/index.html` carries. */
export const HANDOFF_MARKER = /name\s*=\s*["']blaster-web["']/i;

/**
 * How to open a URL in the browser per OS (blaster's approach). Windows goes
 * through PowerShell `Start-Process` with `-EncodedCommand`, so `&` in the
 * query never reaches a shell parser.
 */
export function buildBrowserCommand(url: string, platform: string): { command: string; args: string[] } {
  if (platform === "win32") {
    const encoded = Buffer.from(`Start-Process '${url}'`, "utf16le").toString("base64");
    return { command: "powershell", args: ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded] };
  }
  if (platform === "darwin") return { command: "open", args: [url] };
  return { command: "xdg-open", args: [url] };
}
