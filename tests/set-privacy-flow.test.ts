import { describe, expect, test } from 'bun:test'

import { setPrivacy } from '../src/flows/set-privacy.js'
import type { BotFatherConversation } from '../src/botfather-client.js'

class FakeConversation implements BotFatherConversation {
  readonly sent: string[] = []
  private readonly responses: string[]

  constructor(responses: string[]) {
    this.responses = [...responses]
  }

  async send(text: string): Promise<string> {
    this.sent.push(text)
    const response = this.responses.shift()
    if (!response) throw new Error('missing fake response')
    return response
  }
}

describe('setPrivacy', () => {
  test('disables privacy for a bot', async () => {
    const conversation = new FakeConversation([
      'Choose a bot to change group messages settings.',
      'Enable or disable privacy mode for example_project_bot.',
      'Success! The new status is: DISABLED.',
    ])

    await setPrivacy(conversation, {
      botUsername: 'example_project_bot',
      enabled: false,
    })

    expect(conversation.sent).toEqual(['/setprivacy', '@example_project_bot', 'Disable'])
  })

  test('enables privacy for a bot', async () => {
    const conversation = new FakeConversation([
      'Choose a bot to change group messages settings.',
      'Enable or disable privacy mode for example_project_bot.',
      'Success! The new status is: ENABLED.',
    ])

    await setPrivacy(conversation, {
      botUsername: 'example_project_bot',
      enabled: true,
    })

    expect(conversation.sent).toEqual(['/setprivacy', '@example_project_bot', 'Enable'])
  })
})
