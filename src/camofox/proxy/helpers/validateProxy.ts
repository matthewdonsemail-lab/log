import type { ProxyConfig } from "../types.ts";

const SERVER = /^(https?|socks5):\/\/[^\s:/@]+:\d{1,5}$/;
const COUNTRY = /^[A-Z]{2}$/;

/** Problems with a proxy file's contents. Pure. Empty = fine. */
export function validateProxy(value: unknown): string[] {
  if (!value || typeof value !== "object") return ["the proxy file is not a JSON object"];
  const proxy = value as Partial<ProxyConfig>;
  const problems: string[] = [];
  if (typeof proxy.server !== "string" || !SERVER.test(proxy.server)) {
    problems.push("server must look like http://host:port, https://host:port or socks5://host:port (credentials go in username/password)");
  }
  if (typeof proxy.country !== "string" || !COUNTRY.test(proxy.country)) {
    problems.push("country must be a 2-letter ISO code in capitals, e.g. IE");
  }
  for (const key of ["username", "password"] as const) {
    if (proxy[key] !== undefined && typeof proxy[key] !== "string") problems.push(`${key} must be a string`);
  }
  return problems;
}

/** The proxy for display: never the password. Pure. */
export function maskProxy(proxy: ProxyConfig): Record<string, string> {
  return {
    server: proxy.server,
    username: proxy.username ?? "",
    password: proxy.password ? "••••••" : "",
    country: proxy.country,
  };
}
