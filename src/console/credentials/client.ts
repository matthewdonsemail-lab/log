import { savedCredential, saveProviderCredentials, validateCredentialInput, validateProviderCredentials } from "../../auth/credentials/index.ts";
import type { CredentialFetch, CredentialSaveResult } from "../../auth/credentials/index.ts";
import { credentialValue, readExtensionPublicValues } from "../connections/index.ts";

type Env = Record<string, string | undefined>;

export async function saveConsoleCredentials(input: { provider?: unknown; values?: unknown }, options: { fetcher?: CredentialFetch; env?: Env } = {}): Promise<CredentialSaveResult> {
  const env = options.env ?? process.env;
  const { provider, values } = validateCredentialInput(input.provider, input.values);
  if (provider === "adsPower") {
    const held = credentialValue("ADSPOWER_API_KEY", env);
    await validateProviderCredentials(provider, values, { fetcher: options.fetcher, adsPowerKeyHeld: held });
  } else {
    await validateProviderCredentials(provider, values, { fetcher: options.fetcher });
  }
  const result = saveProviderCredentials(provider, values, env);
  for (const [name, value] of Object.entries(values)) if (savedCredential(name, env) !== value) throw new Error("credentialSaveUnconfirmed");
  return result;
}

export function readConsoleCredentials(input: { provider?: unknown }, env: Env = process.env): Record<string, string> {
  return readExtensionPublicValues(input.provider, env);
}
