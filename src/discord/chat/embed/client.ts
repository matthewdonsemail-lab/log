const X_POST_LINK = /https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+\/status\/\d+)/g

export const DISCORD_X_HOST = 'fixupx.com'

export function embeddableXLinks(text: string): string {
  return text.replace(X_POST_LINK, (_link, path: string) => `https://${DISCORD_X_HOST}/${path}`)
}
