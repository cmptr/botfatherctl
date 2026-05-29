# botfatherctl

Unofficial CLI and TypeScript library for automating Telegram BotFather using a user MTProto session. This project is not affiliated with Telegram.

## Install

Run without installing:

```bash
npx botfatherctl --help
# or
bunx botfatherctl --help
```

Install globally:

```bash
npm install -g botfatherctl
botfatherctl --help
```

For local development in this repository:

```bash
direnv allow
bun install
bun run botfatherctl
```

## Login

Create a Telegram API app at <https://my.telegram.org>, then log in once:

```bash
botfatherctl login --api-id 123456 --api-hash your_api_hash
```

This stores a GramJS session at `~/.config/botfatherctl/config.json`. Treat that file as sensitive because it contains a Telegram user session.

## Create a bot

```bash
botfatherctl create-bot \
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

Bot tokens are secrets. Store them with the same care as passwords or API keys.

## Manage a bot

```bash
botfatherctl get-token --bot project_example_bot
botfatherctl revoke-token --bot project_example_bot
botfatherctl set-name --bot project_example_bot --name "Project Bot"
botfatherctl set-description --bot project_example_bot --description "A bot for project updates."
botfatherctl set-about-text --bot project_example_bot --about "Project updates"
botfatherctl set-join-groups --bot project_example_bot --enabled true
botfatherctl set-privacy --bot project_example_bot --enabled false
```

Set slash commands from a JSON file:

```json
[
  { "command": "start", "description": "Start the bot" },
  { "command": "help", "description": "Show help" }
]
```

```bash
botfatherctl set-commands --bot project_example_bot --commands commands.json
```

Delete a bot only with an explicit matching confirmation:

```bash
botfatherctl delete-bot --bot project_example_bot --confirm project_example_bot
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
try {
  const conversation = new TelegramBotFatherConversation(client)
  const created = await createBot(conversation, {
    displayName: 'Project Bot',
    username: 'project_example_bot',
  })
  await setPrivacy(conversation, {
    botUsername: created.username,
    enabled: false,
  })
} finally {
  await client.disconnect()
}
```
