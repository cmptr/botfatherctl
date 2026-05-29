import { describe, expect, test } from 'bun:test'

import { createBot } from '../src/flows/create-bot.js'
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

describe('createBot', () => {
  test('sends newbot, display name, and username and returns token', async () => {
    const conversation = new FakeConversation([
      'Alright, a new bot. How are we going to call it?',
      "Good. Now let's choose a username for your bot.",
      'Done! Congratulations on your new bot. You will find it at t.me/example_project_bot.\nUse this token to access the HTTP API:\n1234567890:AAExample_Token-Value',
    ])

    const result = await createBot(conversation, {
      displayName: 'Example Project',
      username: 'example_project_bot',
    })

    expect(conversation.sent).toEqual(['/newbot', 'Example Project', 'example_project_bot'])
    expect(result).toEqual({
      username: 'example_project_bot',
      token: '1234567890:AAExample_Token-Value',
    })
  })

  test('throws when BotFather rejects username', async () => {
    const conversation = new FakeConversation([
      'Alright, a new bot. How are we going to call it?',
      "Good. Now let's choose a username for your bot.",
      'Sorry, this username is already taken.',
    ])

    await expect(createBot(conversation, {
      displayName: 'Example Project',
      username: 'example_project_bot',
    })).rejects.toThrow('rejected username')
  })
})
