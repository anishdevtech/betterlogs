# betterlogs

A simple, friendly logger for Node.js and browsers.

## Install

```bash
npm install @anishsharma/betterlogs
```

## Quick Start

```ts
import log, { DiscordTransport } from '@anishsharma/betterlogs';

log.info('Server started');
log.success('Connected to database');
log.warn('Cache is almost full');
log.error('Request failed');
log.debug('Debug value: %o', { count: 3 });
```

## Simple Configuration

```ts
log.config({
  theme: 'neon',
  level: 'debug',
  showTimestamp: true,
  showEmoji: true,
  mode: 'pretty',
  timestampFormat: '24h'
});
```

## Useful Helpers

```ts
log.log('warn', 'Dynamic warning message');
log.silent('Hidden message');
log.toggleEmoji(false);
log.setTimestampFormat('12h');
log.time('load');
log.timeEnd('load');
```

## Custom Theme

```ts
log.setTheme({
  name: 'ocean',
  levels: {
    info: { color: 'blue', emoji: '🌊' },
    success: { color: 'green', emoji: '✅' },
    warn: { color: 'yellow', emoji: '⚠️' },
    error: { color: 'red', emoji: '❌' },
    debug: { color: 'magenta', emoji: '🔍' }
  }
});
```

## Discord Webhooks

```ts
const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/your-webhook-url'
});

log.addTransport(discord);
log.error('Important alert');
```

## Examples

See `/examples/basic-usage.ts`, `/examples/advance.ts`, and `/examples/all-features.ts` for runnable usage patterns.

## AI assistant prompt

Use `README_AI.md` when you want to explain this package to an AI chatbot.

## Learn More

Read `DOCUMENTATION.md` for more examples and advanced usage.
