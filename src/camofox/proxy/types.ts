/**
 * An account's proxy: the only way a Camoufox for that account reaches the
 * internet (AGENTS.md rule 12). One file per account,
 * `~/.logCli/proxies/<accountId>.json` (`LOG_PROXY_DIR` moves them), outside
 * the repo like the session files. It holds a password: never commit, print
 * or paste it.
 *
 * `country` is where the account must appear to be. Before any browser opens,
 * `python/proxyGate.py` resolves the proxy's exit IP and refuses the launch
 * unless that IP is in this country. Listings must be in it too.
 */
export interface ProxyConfig {
  /** `http://host:port`, `https://host:port` or `socks5://host:port`. */
  server: string;
  username?: string;
  password?: string;
  /** ISO 3166-1 alpha-2, upper case: `IE`, `GB`, `US`. */
  country: string;
}

/** `log proxy check`: what the proxy's exit IP looks like from outside. */
export interface ProxyCheck {
  ok: true;
  exitIp: string;
  exitCountry: string;
  country: string;
}
