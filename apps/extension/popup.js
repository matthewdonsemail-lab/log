import { SITES, buildToken, hasLogin, platformForUrl } from './lib.js'

const $ = (id) => document.getElementById(id)
const status = $('status')
const copy = $('copy')

function say(text, tone = '') {
  status.textContent = text
  status.className = `status ${tone}`.trim()
}

async function cookiesFor(platform) {
  const jars = await Promise.all(SITES[platform].domains.map((domain) => chrome.cookies.getAll({ domain })))
  return jars.flat()
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const platform = tab?.url ? platformForUrl(tab.url) : null
  if (!platform) {
    say('Open Reddit, X or Facebook in this tab and log in, then click this button again.', 'warn')
    $('sites').hidden = false
    return
  }

  const name = SITES[platform].name
  const cookies = await cookiesFor(platform)
  if (!hasLogin(platform, cookies)) {
    say(`You are not logged in to ${name} in this browser. Log in, then click this button again.`, 'warn')
    return
  }

  say(`Ready. You are logged in to ${name}.`, 'ok')
  copy.textContent = `Copy your ${name} token`
  copy.hidden = false
  copy.addEventListener('click', async () => {
    copy.disabled = true
    try {
      await navigator.clipboard.writeText(buildToken(platform, await cookiesFor(platform)))
      say(`Copied. Go back to ListeningKit and paste it into the ${name} box.`, 'ok')
      copy.textContent = 'Copied'
    } catch {
      say('Could not copy. Close this popup and try again.', 'warn')
      copy.disabled = false
    }
  })
}

init().catch(() => say('Something went wrong. Close this popup and try again.', 'warn'))
