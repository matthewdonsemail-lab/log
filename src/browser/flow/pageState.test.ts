import { describe, expect, test } from 'bun:test'
import { pageStateOf } from './helpers/pageState'

const CHECKPOINT = 'https://www.facebook.com/checkpoint/1501092823525282/'

describe('pageStateOf: the known page states and what resolves each (rule 54)', () => {
  test("Reading's checkpoint as recorded: its first page, the text captcha, then the video selfie", () => {
    expect(pageStateOf(CHECKPOINT, "- generic [ref=e62]: Fitri Ramdani, confirm that you're human to use your account\n- generic [ref=e69]: Continue")?.id).toBe('checkpointStart')
    expect(pageStateOf(CHECKPOINT, "- generic [ref=e90]: Confirm that you're human\n- generic [ref=e92]: Enter the text from the image.")?.id).toBe('textCaptcha')
    const selfie = pageStateOf(CHECKPOINT, '- generic [ref=e130]: Confirm that you\'re a real person with a video selfie')
    expect(selfie).toMatchObject({ id: 'videoSelfie', person: true })
  })

  test('the feed prompt, the login form, an unmapped checkpoint; an ordinary page is none', () => {
    expect(pageStateOf('https://www.facebook.com/', '- heading "Remember password" [level=3]')?.id).toBe('rememberPassword')
    expect(pageStateOf('https://www.facebook.com/login/', '- textbox "Email or phone number"')?.id).toBe('loginForm')
    expect(pageStateOf(CHECKPOINT, '- heading "Something new"')).toMatchObject({ id: 'checkpoint', person: false })
    expect(pageStateOf('https://www.facebook.com/marketplace/', '- heading "Marketplace"')).toBeNull()
  })
})

describe('Messenger PIN', () => {
  const CREATE = 'heading "Create a PIN to access your chats on any device" [level=2]\nbutton "Create PIN"'

  test("\"Create a PIN\" without the PIN in Twenty is matt's: he gives it in the Clack prompt", () => {
    const state = pageStateOf('https://www.facebook.com/messages/', CREATE)
    expect(state?.id).toBe('messengerPinCreate')
    expect(state?.person).toBe(true)
    expect(state?.resolve).toContain('log facebook messenger pin')
  })

  test('"Create a PIN" with the PIN in Twenty resolves itself with the recorded flow', () => {
    const state = pageStateOf('https://www.facebook.com/messages/', CREATE, { messengerPin: true })
    expect(state?.person).toBe(false)
    expect(state?.resolve).toContain('log flow run messengerPinCreate')
  })

  test("\"Enter your PIN\" is mapped: typed from Twenty when it is there, matt's when not", () => {
    const page = 'heading "Enter your PIN to access your chats" [level=2]\ntextbox "PIN"'
    expect(pageStateOf('https://www.facebook.com/messages/', page, { messengerPin: true })).toMatchObject({ id: 'messengerPinEnter', person: false })
    expect(pageStateOf('https://www.facebook.com/messages/', page, { messengerPin: true })?.resolve).toContain('log inspect do pin --live')
    expect(pageStateOf('https://www.facebook.com/messages/', page)?.person).toBe(true)
  })

  test("the confirm screen is neither: it is the flow's own step", () => {
    expect(pageStateOf('https://www.facebook.com/messages/', 'heading "Confirm your PIN to avoid losing chat history"\ntextbox "Confirm your PIN"', { messengerPin: true })).toBeNull()
  })
})
