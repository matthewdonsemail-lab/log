export const credentialFields: Record<string, { id: string; label: string; required?: boolean; inputType?: 'url' | 'password' | 'text' }[]> = {
  adsPower: [{ id: 'LOG_ADSPOWER_HOMES', label: 'Allowed countries', inputType: 'text' }, { id: 'ADSPOWER_HOST', label: 'Local API URL', inputType: 'url' }, { id: 'ADSPOWER_API_KEY', label: 'API key (optional)', required: false }],
  browser: [{ id: 'LOG_ADSPOWER_HOMES', label: 'Allowed countries', inputType: 'text' }, { id: 'LOG_BROWSER_DRIVER', label: 'Browser provider' }, { id: 'ADSPOWER_HOST', label: 'Local API URL' }, { id: 'ADSPOWER_API_KEY', label: 'API key' }],
  typesafe: [{ id: 'JEV_API_KEY', label: 'API key' }], subq: [{ id: 'SUBQ_API_KEY', label: 'API key' }],
  memelord: [{ id: 'MEMELORD_API_KEY', label: 'API key' }], fishAudio: [{ id: 'FISH_API_KEY', label: 'API key' }],
  inworld: [{ id: 'INWORLD_API_KEY', label: 'API key' }], treg: [{ id: 'TREG_TOKEN', label: 'API token' }],
  jina: [{ id: 'JINA_API_KEY', label: 'API key' }], assemblyAi: [{ id: 'ASSEMBLYAI_API_KEY', label: 'API key' }],
  parallel: [{ id: 'PARALLEL_API_KEY', label: 'API key' }], twoCaptcha: [{ id: 'TWOCAPTCHA_API_KEY', label: 'API key' }],
  byteful: [{ id: 'BYTEFUL_PUBLIC_KEY', label: 'Public key' }, { id: 'BYTEFUL_PRIVATE_KEY', label: 'Private key' }],
}
