import { Api, TelegramClient } from 'telegram'

export type BotFatherConversation = {
  send(text: string): Promise<string>
}

export type TelegramBotFatherConversationOptions = {
  timeoutMs?: number
  pollIntervalMs?: number
}

export class TelegramBotFatherConversation implements BotFatherConversation {
  private readonly client: TelegramClient
  private readonly timeoutMs: number
  private readonly pollIntervalMs: number
  private botFatherEntity: Api.TypeEntityLike | null = null

  constructor(client: TelegramClient, options: TelegramBotFatherConversationOptions = {}) {
    this.client = client
    this.timeoutMs = options.timeoutMs ?? 60_000
    this.pollIntervalMs = options.pollIntervalMs ?? 500
  }

  async send(text: string): Promise<string> {
    const botFather = await this.getBotFatherEntity()
    const beforeId = await this.latestBotFatherMessageId(botFather)
    await this.client.sendMessage(botFather, { message: text })
    return this.waitForReply(botFather, beforeId)
  }

  private async getBotFatherEntity(): Promise<Api.TypeEntityLike> {
    if (!this.botFatherEntity) {
      this.botFatherEntity = await this.client.getEntity('BotFather')
    }
    return this.botFatherEntity
  }

  private async latestBotFatherMessageId(entity: Api.TypeEntityLike): Promise<number> {
    const messages = await this.client.getMessages(entity, { limit: 10 })
    const newest = messages.find((message) => this.isIncomingMessage(message))
    return newest?.id ?? 0
  }

  private async waitForReply(entity: Api.TypeEntityLike, afterId: number): Promise<string> {
    const deadline = Date.now() + this.timeoutMs
    while (Date.now() < deadline) {
      const messages = await this.client.getMessages(entity, { limit: 10 })
      const response = messages
        .filter((message) => message.id > afterId)
        .filter((message) => this.isIncomingMessage(message))
        .sort((a, b) => a.id - b.id)[0]
      if (response) return response.message ?? ''
      await sleep(this.pollIntervalMs)
    }
    throw new Error('Timed out waiting for BotFather response')
  }

  private isIncomingMessage(message: Api.Message): boolean {
    return !message.out
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
