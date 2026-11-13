import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { HOSTED_MCP_URL, PLATFORM_SETUP_COMMAND } from '../controlApi'

type Rewrite = { readonly source: string; readonly destination: string }

const config = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../../../../vercel.json', import.meta.url)), 'utf8'),
) as { readonly rewrites: readonly Rewrite[] }
const mcpPage = readFileSync(fileURLToPath(new URL('../../landing/mcp/McpPage.tsx', import.meta.url)), 'utf8')
const connectionsPage = readFileSync(fileURLToPath(new URL('../../pages/console/ConnectionsPage.tsx', import.meta.url)), 'utf8')

describe('hosted control routing', () => {
  it('gives every MCP client the public MCP transport, not the marketing-page origin', () => {
    expect(HOSTED_MCP_URL).toBe('https://mcp.listeningkit.com/mcp')
  })

  it('proxies control API requests before the SPA fallback', () => {
    const apiIndex = config.rewrites.findIndex((rewrite) => rewrite.source === '/api/v1/:path*')
    const fallbackIndex = config.rewrites.findIndex((rewrite) => rewrite.destination === '/index.html')

    expect(apiIndex).toBeGreaterThanOrEqual(0)
    expect(config.rewrites[apiIndex]?.destination).toBe('https://mcp.listeningkit.com/api/v1/:path*')
    expect(apiIndex).toBeLessThan(fallbackIndex)
  })

  it('sends the public MCP call to account creation instead of a repository link', () => {
    expect(mcpPage).toContain('href="/sign-in?returnPath=/console/start"')
  })

  it('gives every platform card a real sign-in action', () => {
    expect(PLATFORM_SETUP_COMMAND).toBe('log launch --setup')
    expect(connectionsPage).toMatch(/onClick=\{\(\) => setSignInPlatform\(platform\)\}/)
  })
})
