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
