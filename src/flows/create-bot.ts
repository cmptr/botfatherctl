import type { BotFatherConversation } from '../botfather-client.js'
import { isUsernameRejected, parseCreatedBot, type CreatedBot } from '../botfather-parser.js'

export type CreateBotInput = {
  displayName: string
  username: string
}

export async function createBot(
  conversation: BotFatherConversation,
  input: CreateBotInput,
): Promise<CreatedBot> {
  await conversation.send('/newbot')
  await conversation.send(input.displayName)
  const finalResponse = await conversation.send(input.username)

  if (isUsernameRejected(finalResponse)) {
    throw new Error(`BotFather rejected username ${input.username}`)
  }

  const created = parseCreatedBot(finalResponse)
  if (!created) {
    throw new Error('BotFather did not return a bot token')
  }

  return created
}
