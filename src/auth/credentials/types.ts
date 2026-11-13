export type CredentialInputType = "url" | "password" | "text";

export interface CredentialField {
  id: string;
  label: string;
  secret: boolean;
  required?: boolean;
  inputType?: CredentialInputType;
}

export const CREDENTIAL_PROVIDERS = ["adsPower", "typesafe", "subq", "memelord", "fishAudio", "inworld", "treg", "jina", "assemblyAi", "parallel", "twoCaptcha", "byteful"] as const;
export type CredentialProvider = (typeof CREDENTIAL_PROVIDERS)[number];

const key = (id: string, label = "API key"): CredentialField => ({ id, label, secret: true });

export const credentialFields: Readonly<Record<CredentialProvider, readonly CredentialField[]>> = {
  adsPower: [
    { id: "LOG_ADSPOWER_HOMES", label: "Allowed countries", secret: false, inputType: "text" },
    { id: "ADSPOWER_HOST", label: "Local API URL", secret: false, inputType: "url" },
    { id: "ADSPOWER_API_KEY", label: "API key (optional)", secret: true, required: false },
  ],
  typesafe: [key("JEV_API_KEY")],
  subq: [key("SUBQ_API_KEY")],
  memelord: [key("MEMELORD_API_KEY")],
  fishAudio: [key("FISH_API_KEY")],
  inworld: [key("INWORLD_API_KEY")],
  treg: [key("TREG_TOKEN", "API token")],
  jina: [key("JINA_API_KEY")],
  assemblyAi: [key("ASSEMBLYAI_API_KEY")],
  parallel: [key("PARALLEL_API_KEY")],
  twoCaptcha: [key("TWOCAPTCHA_API_KEY")],
  byteful: [key("BYTEFUL_PUBLIC_KEY", "Public key"), key("BYTEFUL_PRIVATE_KEY", "Private key")],
};

export const CREDENTIAL_MASK = "••••••••••••••••";

export const DEFAULT_ADSPOWER_HOST = "http://local.adspower.net:50325";

export const CREDENTIAL_ERRORS = ["credentialInputInvalid", "credentialRejected", "credentialRateLimited", "credentialValidationUnavailable", "credentialSaveUnconfirmed", "browserProviderUnavailable"] as const;
export type CredentialError = (typeof CREDENTIAL_ERRORS)[number];

export interface CredentialSaveResult {
  saved: true;
  changed: boolean;
}

export type CredentialFetch = (url: string, init?: RequestInit) => Promise<Response>;
