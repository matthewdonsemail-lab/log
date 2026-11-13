export const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "[::1]"]);
export const LOOPBACK_REMOTES: ReadonlySet<string> = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export interface ConsoleRequestFacts {
  host: string | null | undefined;
  remote: string | null | undefined;
  origin: string | null | undefined;
  fetchSite: string | null | undefined;
}

export function consoleRequestAllowed(facts: ConsoleRequestFacts): boolean {
  try {
    const host = new URL(`http://${facts.host ?? ""}`);
    if (!LOOPBACK_HOSTS.has(host.hostname)) return false;
    if (!LOOPBACK_REMOTES.has(facts.remote ?? "")) return false;
    if (facts.origin && new URL(facts.origin).host !== host.host) return false;
    return facts.fetchSite !== "cross-site";
  } catch {
    return false;
  }
}
