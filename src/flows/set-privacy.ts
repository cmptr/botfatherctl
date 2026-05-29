import type { BotFatherConversation } from '../botfather-client.js'
import { isPrivacyConfirmation } from '../botfather-parser.js'

export type SetPrivacyInput = {
  botUsername: string
  enabled: boolean
}

export async function setPrivacy(
  conversation: BotFatherConversation,
  input: SetPrivacyInput,
): Promise<void> {
  await conversation.send('/setprivacy')
  await conversation.send(normalizeBotUsername(input.botUsername))
  const response = await conversation.send(input.enabled ? 'Enable' : 'Disable')

  if (!isPrivacyConfirmation(response)) {
    throw new Error(`BotFather did not confirm privacy change for ${input.botUsername}`)
  }
}

function normalizeBotUsername(username: string): string {
  const trimmed = username.trim()
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}
