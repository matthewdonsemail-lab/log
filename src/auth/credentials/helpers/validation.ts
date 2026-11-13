import type { CredentialFetch, CredentialProvider } from "../types.ts";
import { DEFAULT_ADSPOWER_HOST } from "../types.ts";

type Probe = { url: string; headers?: Record<string, string>; body?: string; accepts: (body: Record<string, unknown> | unknown[]) => boolean };

function probeOf(provider: Exclude<CredentialProvider, "adsPower">, values: Record<string, string>): Probe {
  const key = Object.values(values)[0] ?? "";
  const bearer = { Authorization: `Bearer ${key}` };
  const probes: Record<Exclude<CredentialProvider, "adsPower">, Probe> = {
    typesafe: { url: "https://api.typesafe.ai/v1/models", headers: bearer, accepts: (body) => "models" in body && Array.isArray(body.models) },
    subq: { url: "https://api.subq.ai/v1/models", headers: bearer, accepts: (body) => "data" in body && Array.isArray(body.data) },
    memelord: { url: "https://www.memelord.com/api/v1/image-tools", headers: bearer, accepts: (body) => !("success" in body) || body.success !== false },
    fishAudio: { url: "https://api.fish.audio/wallet/self/api-credit", headers: bearer, accepts: (body) => "credit" in body && Number.isFinite(Number(body.credit)) },
    inworld: { url: "https://api.inworld.ai/voices/v1/voices", headers: { Authorization: `Basic ${key}` }, accepts: (body) => "voices" in body && Array.isArray(body.voices) },
    jina: { url: `https://embeddings-dashboard-api.jina.ai/api/v1/api_key/fe_user?api_key=${encodeURIComponent(key)}`, accepts: (body) => "wallet" in body && Boolean(body.wallet) && typeof body.wallet === "object" },
    assemblyAi: { url: "https://api.assemblyai.com/v2/transcript?limit=1", headers: { authorization: key }, accepts: (body) => "transcripts" in body && Array.isArray(body.transcripts) },
    parallel: { url: "https://api.parallel.ai/v1/monitors?limit=1", headers: { "x-api-key": key }, accepts: (body) => "monitors" in body && Array.isArray(body.monitors) },
    treg: { url: "https://treg.to/orgs", headers: { "X-Treg-Token": key }, accepts: Array.isArray },
    twoCaptcha: { url: "https://api.2captcha.com/getBalance", body: JSON.stringify({ clientKey: key }), accepts: (body) => "errorId" in body && body.errorId === 0 && "balance" in body && Number.isFinite(Number(body.balance)) },
    byteful: { url: "https://api.byteful.com/1.0/public/user/customer/retrieve", headers: { "X-API-Public-Key": values.BYTEFUL_PUBLIC_KEY ?? "", "X-API-Private-Key": values.BYTEFUL_PRIVATE_KEY ?? "" }, accepts: (body) => "data" in body && Boolean(body.data) && typeof body.data === "object" },
  };
  return probes[provider];
}

async function adsPowerReachable(values: Record<string, string>, keyHeld: string | null, fetcher: CredentialFetch): Promise<void> {
  const host = values.ADSPOWER_HOST || DEFAULT_ADSPOWER_HOST;
  const key = values.ADSPOWER_API_KEY || keyHeld || "";
  let response: Response;
  try {
    response = await fetcher(`${host}/status`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, redirect: "error", signal: AbortSignal.timeout(8000) });
  } catch {
    throw new Error("browserProviderUnavailable");
  }
  const answer = (await response.json().catch(() => null)) as { code?: unknown } | null;
  if (response.status === 401 || response.status === 403) throw new Error("credentialRejected");
  if (!response.ok || answer?.code !== 0) throw new Error("browserProviderUnavailable");
}

export async function validateProviderCredentials(provider: CredentialProvider, values: Record<string, string>, options: { fetcher?: CredentialFetch; adsPowerKeyHeld?: string | null } = {}): Promise<void> {
  const fetcher = options.fetcher ?? fetch;
  if (provider === "adsPower") return adsPowerReachable(values, options.adsPowerKeyHeld ?? null, fetcher);
  const probe = probeOf(provider, values);
  let response: Response;
  try {
    response = await fetcher(probe.url, { method: probe.body ? "POST" : "GET", headers: { ...probe.headers, Accept: "application/json", ...(probe.body ? { "Content-Type": "application/json" } : {}) }, ...(probe.body ? { body: probe.body } : {}), redirect: "error", signal: AbortSignal.timeout(20000) });
  } catch {
    throw new Error("credentialValidationUnavailable");
  }
  if (response.status === 401 || response.status === 403) throw new Error("credentialRejected");
  if (response.status === 429) throw new Error("credentialRateLimited");
  if (!response.ok) throw new Error("credentialValidationUnavailable");
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object") throw new Error("credentialValidationUnavailable");
  if (provider === "twoCaptcha" && "errorId" in body && (body as { errorId: unknown }).errorId !== 0) throw new Error("credentialRejected");
  if (!probe.accepts(body as Record<string, unknown> | unknown[])) throw new Error("credentialValidationUnavailable");
}
