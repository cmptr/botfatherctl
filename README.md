# botfatherctl

Unofficial TypeScript CLI and library for automating Telegram BotFather using a user MTProto session. This project is not affiliated with Telegram.

## Setup

```bash
direnv allow
bun install
```

Create a Telegram API app at <https://my.telegram.org>, then log in once:

```bash
bun run botfatherctl login --api-id 123456 --api-hash your_api_hash
```

This stores a GramJS session at `~/.config/botfatherctl/config.json`.

## Create a bot

```bash
bun run botfatherctl create-bot \
  --name "Project Bot" \
  --username project_example_bot
```

Output is JSON:

```json
{
  "username": "project_example_bot",
  "token": "1234567890:..."
}
```

## Set privacy

Disable privacy so a bot can see group messages:

```bash
bun run botfatherctl set-privacy --bot project_example_bot --enabled false
```

Enable privacy:

```bash
bun run botfatherctl set-privacy --bot project_example_bot --enabled true
```

## Library usage

```ts
import {
  TelegramBotFatherConversation,
  createBot,
  createTelegramClient,
  loadConfig,
  setPrivacy,
} from 'botfatherctl'

const client = await createTelegramClient(await loadConfig())
const conversation = new TelegramBotFatherConversation(client)
const created = await createBot(conversation, {
  displayName: 'Project Bot',
  username: 'project_example_bot',
})
await setPrivacy(conversation, {
  botUsername: created.username,
  enabled: false,
})
```
