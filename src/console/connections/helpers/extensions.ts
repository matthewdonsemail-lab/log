import { homedir } from "node:os";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CREDENTIAL_MASK, CREDENTIAL_PROVIDERS, credentialFields, readPublicCredentials, savedCredential } from "../../../auth/credentials/index.ts";
import type { CredentialProvider } from "../../../auth/credentials/index.ts";
import { memelordKey } from "../../../extensions/memelord/client.ts";
import { envValue } from "../../../extensions/voiceClone/helpers/provider.ts";
import { subqKey } from "../../../subq/decisions/client.ts";
import type { ExtensionConnection } from "../types.ts";

type Env = Record<string, string | undefined>;

function tregToken(env: Env, home: string): string | null {
  const saved = envValue("TREG_TOKEN", env, home);
  if (saved) return saved;
  try {
    const path = join(home, ".treg", "config.json");
    if (!existsSync(path)) return null;
    const token = (JSON.parse(readFileSync(path, "utf8")) as { token?: unknown }).token;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

export function credentialValue(name: string, env: Env = process.env, home = homedir()): string | null {
  if (name === "SUBQ_API_KEY") return subqKey(env, join(home, ".config", "listeningkit", "subq-api-key.txt")) || envValue(name, env, home);
  if (name === "MEMELORD_API_KEY") return memelordKey(env, home);
  if (name === "TREG_TOKEN") return tregToken(env, home);
  if (name === "JEV_API_KEY") return envValue(name, env, home) || envValue("TYPESAFE_API_KEY", env, home);
  if (name === "ASSEMBLYAI_API_KEY") return envValue(name, env, home) || envValue("ASSEMBLY_AI_KEY", env, home);
  if (name === "TWOCAPTCHA_API_KEY") return envValue(name, env, home) || envValue("2CAPTCHA_API_KEY", env, home);
  return envValue(name, env, home);
}

function configuredOf(key: CredentialProvider, has: (name: string) => boolean): boolean {
  if (key === "adsPower") return has("ADSPOWER_HOST") || has("ADSPOWER_API_KEY");
  return credentialFields[key].every((field) => field.required === false || has(field.id));
}

export function readExtensionStates(env: Env = process.env, home = homedir()): ExtensionConnection[] {
  return CREDENTIAL_PROVIDERS.map((key): ExtensionConnection => {
    const fields = credentialFields[key];
    try {
      const has = (name: string) => Boolean(credentialValue(name, env, home));
      return {
        key,
        state: configuredOf(key, has) ? "configured" : "notConfigured",
        persisted: fields.some((field) => Boolean(savedCredential(field.id, env))),
        fields: fields.map((field) => {
          const hasValue = has(field.id);
          return { id: field.id, label: field.label, secret: field.secret, required: field.required !== false, inputType: field.inputType ?? "password", hasValue, masked: field.secret && hasValue ? CREDENTIAL_MASK : null };
        }),
      };
    } catch {
      return { key, state: "unavailable", persisted: false, fields: fields.map((field) => ({ id: field.id, label: field.label, secret: field.secret, required: field.required !== false, inputType: field.inputType ?? "password", hasValue: false, masked: null })) };
    }
  });
}

export function readExtensionPublicValues(provider: unknown, env: Env = process.env, home = homedir()): Record<string, string> {
  return readPublicCredentials(provider, (name) => credentialValue(name, env, home));
}
