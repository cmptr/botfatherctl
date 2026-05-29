import { describe, expect, test } from 'bun:test'

import {
  isPrivacyConfirmation,
  isUsernameRejected,
  parseCreatedBot,
} from '../src/botfather-parser.js'

describe('BotFather parser', () => {
  test('extracts bot username and token from successful newbot response', () => {
    const result = parseCreatedBot(`Done! Congratulations on your new bot. You will find it at t.me/example_project_bot. You can now add a description.

Use this token to access the HTTP API:
1234567890:AAExample_Token-Value
Keep your token secure and store it safely.`)

    expect(result).toEqual({
      username: 'example_project_bot',
      token: '1234567890:AAExample_Token-Value',
    })
  })

  test('returns null when response does not contain a token', () => {
    expect(parseCreatedBot('Good. Now let\'s choose a username for your bot.')).toBeNull()
  })

  test('detects rejected usernames', () => {
    expect(isUsernameRejected('Sorry, this username is already taken. Please try something different.')).toBe(true)
    expect(isUsernameRejected('Done! Congratulations on your new bot.')).toBe(false)
  })

  test('detects privacy confirmations', () => {
    expect(isPrivacyConfirmation('Success! The new status is: ENABLED.')).toBe(true)
    expect(isPrivacyConfirmation('Success! The new status is: DISABLED.')).toBe(true)
    expect(isPrivacyConfirmation('Choose a bot to change group messages settings.')).toBe(false)
  })
})
