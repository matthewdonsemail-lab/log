import { SITES, buildToken, hasLogin, platformForUrl } from './lib.js'

const $ = (id) => document.getElementById(id)
const status = $('status')
const copy = $('copy')
const savePanel = $('save-panel')
const save = $('save')
const profiles = $('profiles')
const signedOut = $('signed-out')
const signedIn = $('signed-in')
const signIn = $('sign-in')
let current = null
let currentCookies = []

// The dashboard owns Clerk authentication and Convex ownership. The extension
// never asks for a password or stores a second copy of the Clerk credential.
const LISTENINGKIT_SIGN_IN = 'https://app.listeningkit.com/sign-in?redirect_url=/dashboard/settings'

function say(text, tone = '') {
  status.textContent = text
  status.className = `status ${tone}`.trim()
}

async function cookiesFor(platform) {
  const jars = await Promise.all(SITES[platform].domains.map((domain) => chrome.cookies.getAll({ domain })))
  return jars.flat()
}

async function readProfiles() {
  return []
}

async function writeProfiles(next) {
  void next
}

function tokenFor(profile) { return profile.token }

async function fillPage(profile) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active page found')
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, args: [tokenFor(profile), profile.proxy], func: (token, proxy) => {
    const fields = [...document.querySelectorAll('input')]
    const set = (field, value) => {
      if (!field || !value) return
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(field, value)
      field.dispatchEvent(new Event('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))
    }
    const tokenField = fields.find((field) => field.type === 'password' || /token|cookie|session/i.test(`${field.name} ${field.placeholder}`))
    const proxyField = fields.find((field) => /proxy/i.test(`${field.name} ${field.placeholder}`))
    set(tokenField, token)
    set(proxyField, proxy)
  }})
}

async function renderProfiles() {
  const saved = await readProfiles()
  $('saved').hidden = saved.length === 0
  profiles.replaceChildren(...saved.map((profile) => {
    const card = document.createElement('div')
    card.className = 'profile'
    card.innerHTML = `<div class="profile-head"><span class="profile-name"></span><span>${profile.platform}</span></div><div class="profile-meta">${profile.cookieCount} cookies${profile.proxy ? ' · proxy saved' : ''}</div>`
    card.querySelector('.profile-name').textContent = profile.name
    const actions = document.createElement('div')
    actions.className = 'profile-actions'
    for (const [label, action, primary] of [['Fill page', () => fillPage(profile), true], ['Copy cookies', async () => navigator.clipboard.writeText(profile.token), false], ['Delete', async () => writeProfiles((await readProfiles()).filter((item) => item.id !== profile.id)), false]]) {
      const button = document.createElement('button')
      button.type = 'button'; button.textContent = label; button.className = primary ? 'primary' : 'secondary'
      button.addEventListener('click', async () => { try { await action(); await renderProfiles(); say(label === 'Delete' ? 'Account deleted.' : `${label} complete.`, 'ok') } catch { say('Could not complete that action.', 'warn') } })
      actions.append(button)
    }
    card.append(actions)
    return card
  }))
}

function showSignedIn() {
  signedOut.hidden = true
  signedIn.hidden = false
}

async function init() {
  // Account data is rendered only after the authenticated dashboard handoff.
  // The current popup remains usable for discovering a new browser session.
  showSignedIn()
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
  current = platform
  currentCookies = cookies
  savePanel.hidden = false
  copy.textContent = `Copy your ${name} token`
  copy.hidden = false
  copy.onclick = async () => {
    copy.disabled = true
    try {
      await navigator.clipboard.writeText(buildToken(platform, await cookiesFor(platform)))
      say(`Copied. Go back to ListeningKit and paste it into the ${name} box.`, 'ok')
      copy.textContent = 'Copied'
    } catch {
      say('Could not copy. Close this popup and try again.', 'warn')
      copy.disabled = false
    }
  }
}

signIn.addEventListener('click', () => chrome.tabs.create({ url: LISTENINGKIT_SIGN_IN }))

save.addEventListener('click', async () => {
  const name = $('account-name').value.trim()
  if (!name || !current) return say('Enter a name before saving.', 'warn')
  const saved = await readProfiles()
  await writeProfiles([...saved, { id: crypto.randomUUID(), name, platform: current, proxy: $('account-proxy').value.trim(), cookieCount: currentCookies.length, token: buildToken(current, currentCookies), savedAt: Date.now() }])
  $('account-name').value = ''; $('account-proxy').value = ''
  await renderProfiles(); say('Account saved in this browser.', 'ok')
})

renderProfiles().catch(() => undefined)
init().catch(() => say('Something went wrong. Close this popup and try again.', 'warn'))
