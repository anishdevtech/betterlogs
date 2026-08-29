# BetterLogs Complete Documentation

This guide covers all configuration options, methods, transports, and advanced recipes for `@anishsharma/betterlogs`.

---

## Table of Contents

1. [Installation & Imports](#installation--imports)
2. [Core Logging API](#core-logging-api)
3. [Configuration Reference](#configuration-reference)
4. [Themes & Terminal Styling](#themes--terminal-styling)
5. [Child Loggers & Scopes](#child-loggers--scopes)
6. [Async Context Tracing](#async-context-tracing)
7. [Sensitive Data Redaction](#sensitive-data-redaction)
8. [HTTP Request Middleware](#http-request-middleware)
9. [File Logging & Rotation](#file-logging--rotation)
10. [Transports & Webhooks](#transports--webhooks)
11. [CLI Utilities & Boxes](#cli-utilities--boxes)
12. [Global Console Patching](#global-console-patching)
13. [Independent Instances](#independent-instances)

---

## Installation & Imports

Install the package:

```bash
npm install @anishsharma/betterlogs
```

### TypeScript / ES Modules:

```ts
import log, {
  betterlogs,
  BetterLogger,
  DiscordTransport,
  SlackTransport,
  TelegramTransport,
  HttpTransport,
  CallbackTransport,
  RotatingFileLogger,
  FileLogger,
  Colorizer,
  BoxDrawer
} from '@anishsharma/betterlogs';
```

### CommonJS:

```js
const { default: log, DiscordTransport } = require('@anishsharma/betterlogs');
```

---

## Core Logging API

### Standard Log Levels

```ts
log.info('System operational');
log.warn('Cache threshold reached');
log.error('Database connection lost');
log.debug('Query payload', { sql: 'SELECT * FROM users' });
log.trace('Entering function parseHeader()');
```

### CLI & Status Levels

```ts
log.ready('Server listening on http://localhost:3000'); // 🚀 READY
log.start('Building distribution bundle...'); // ⏳ START
log.success('Migration 004 applied successfully'); // ✅ SUCCESS
log.pause('Awaiting manual confirmation'); // ⏸️  PAUSE
log.fatal(new Error('Fatal memory allocation failure')); // 💀 FATAL
```

### Error Handling

Passing an `Error` instance automatically formats stack traces with red highlighting in pretty mode, and parses `{ name, message, stack, cause }` into JSON mode:

```ts
try {
  throw new Error('Socket timeout');
} catch (err) {
  log.error(err);
}
```

---

## Configuration Reference

Configure logger defaults with `log.config()`:

```ts
log.config({
  theme: 'dracula',
  level: 'debug',
  mode: 'pretty',
  showTimestamp: true,
  timestampFormat: '24h',
  showEmoji: true,
  redaction: {
    paths: ['password', 'token', 'authorization']
  },
  rotation: {
    maxSize: '10MB',
    maxFiles: 5,
    datePattern: 'YYYY-MM-DD'
  }
});
```

### Options Breakdown

| Option            | Type                  | Default     | Description                                                                                       |
| ----------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `theme`           | `string \| Theme`     | `'dark'`    | Theme name (`dark`, `light`, `neon`, `minimal`, `dracula`, `nord`, `catppuccin`) or custom object |
| `level`           | `LogLevel`            | `'info'`    | Minimum severity level to emit                                                                    |
| `mode`            | `'pretty' \| 'json'`  | `'pretty'`  | Terminal colored mode or structured JSON mode                                                     |
| `showTimestamp`   | `boolean`             | `true`      | Includes `[HH:MM:SS]` timestamp prefix                                                            |
| `timestampFormat` | `'12h' \| '24h'`      | `'24h'`     | 12-hour (with AM/PM) or 24-hour time                                                              |
| `showEmoji`       | `boolean`             | `true`      | Prefix level with emoji icon                                                                      |
| `file`            | `string`              | `undefined` | Target file path for Node.js file logging                                                         |
| `rotation`        | `FileRotationOptions` | `undefined` | Auto-rotation options (`maxSize`, `maxFiles`, `datePattern`)                                      |
| `redaction`       | `RedactionOptions`    | `undefined` | Mask sensitive keys in data objects                                                               |

---

## Themes & Terminal Styling

BetterLogs generates 24-bit TrueColor ANSI escape codes with automatic fallback to standard 16-color ANSI.

### Built-in Themes

- `dark`: Default theme with cyan/green/yellow/red highlights.
- `light`: High-contrast blue/orange/red styling for light terminals.
- `neon`: Electric neon palette (`#00FFFF`, `#00FF7F`, `#FFD700`, `#FF5555`, `#8888FF`).
- `minimal`: Monochromatic symbols (`•`, `✓`, `!`, `✗`, `>`) without bright colors.
- `dracula`: Dracula theme palette (`#8BE9FD`, `#50FA7B`, `#F1FA8C`, `#FF5555`, `#BD93F9`).
- `nord`: Arctic Nord palette (`#88C0D0`, `#A3BE8C`, `#EBCB8B`, `#BF616A`, `#B48EAD`).
- `catppuccin`: Pastel Catppuccin palette (`#89DCEB`, `#A6E3A1`, `#F9E2AF`, `#F38BA8`, `#CBA6F7`).

### Registering Custom Themes

```ts
log.addTheme({
  name: 'cyberpunk',
  levels: {
    info: { color: '#00e5ff', emoji: '🌐' },
    success: { color: '#00ff66', emoji: '💎' },
    warn: { color: '#ffea00', emoji: '⚠️' },
    error: { color: '#ff0055', emoji: '⚡' },
    debug: { color: '#d500f9', emoji: '🔬' }
  }
});

log.setTheme('cyberpunk');
```

### Adding Custom Log Levels

```ts
log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });

// Call the dynamic method:
(log as any).audit('Admin changed organization permissions');
```

---

## Child Loggers & Scopes

Child loggers inherit parent configuration and transports while attaching a persistent label or scoped metadata:

```ts
const dbLog = log.child({
  label: 'Database',
  meta: { host: '10.0.0.12', poolSize: 20 },
  level: 'debug'
});

dbLog.info('Pool initialized');
// Output: [20:45:10] 💡 INFO [Database] Pool initialized
```

### Per-Log Metadata with `.with()`

```ts
log.with({ transactionId: 'tx_9981' }).info('Order placed');
```

---

## Async Context Tracing

Trace request IDs or user sessions across asynchronous call trees using Node.js `AsyncLocalStorage`:

```ts
import log from '@anishsharma/betterlogs';

async function handleRequest(reqId: string, userId: string) {
  await log.runWithContext({ requestId: reqId, userId }, async () => {
    await fetchUserProfile();
  });
}

async function fetchUserProfile() {
  // Automatically attaches [reqId] without passing arguments around
  log.info('Fetching profile from database');
}
```

---

## Sensitive Data Redaction

Automatically masks sensitive keys before they hit stdout, disk, or remote webhooks:

```ts
log.config({
  redaction: {
    paths: ['password', 'token', 'authorization', 'secret', '*.creditCard'],
    censor: '[REDACTED]' // or a function: (val) => '***'
  }
});

log.info('Auth payload', {
  user: 'admin',
  password: 'plaintext_password',
  token: 'eyJhbGciOi...'
});
```

---

## HTTP Request Middleware

Universal middleware for Express, Connect, and Node.js `http.createServer`:

```ts
import express from 'express';
import log from '@anishsharma/betterlogs';

const app = express();

app.use(
  log.httpMiddleware({
    ignoreUrls: ['/healthz', '/favicon.ico']
  })
);

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

**Logs output:**

```text
[20:45:10] 💡 INFO GET /api/users 200 in 14ms
```

---

## File Logging & Rotation

### Basic File Logging

```ts
log.file('./logs/app.log');
```

### Size and Date-Based Log Rotation

```ts
log.file('./logs/app.log', {
  maxSize: '10MB', // Rotates when file reaches 10MB ('1GB', '500KB', or bytes)
  maxFiles: 5, // Retains latest 5 files (deletes older ones)
  datePattern: 'YYYY-MM-DD' // Rotates daily
});
```

---

## Transports & Webhooks

BetterLogs supports sending logs to external systems simultaneously.

### Discord Webhooks

```ts
import { DiscordTransport } from '@anishsharma/betterlogs';

const discord = new DiscordTransport({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
  username: 'AlertBot',
  filter: {
    minLevel: 'error',
    onlyLabels: ['Auth', 'Payments']
  }
});

log.addTransport(discord);
```

### Slack Webhooks

```ts
import { SlackTransport } from '@anishsharma/betterlogs';

const slack = new SlackTransport({
  webhookUrl: process.env.SLACK_WEBHOOK_URL!,
  channel: '#alerts',
  filter: { minLevel: 'error' }
});

log.addTransport(slack);
```

### Telegram Bot API

```ts
import { TelegramTransport } from '@anishsharma/betterlogs';

const telegram = new TelegramTransport({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
  filter: { minLevel: 'error' }
});

log.addTransport(telegram);
```

### Generic HTTP / REST Transport

```ts
import { HttpTransport } from '@anishsharma/betterlogs';

const http = new HttpTransport({
  url: 'https://logs.example.com/ingest',
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`
  },
  filter: { minLevel: 'warn' }
});

log.addTransport(http);
```

---

## CLI Utilities & Boxes

### Banner Boxes

```ts
log.box('Project Scaffolding CLI\nReady to generate files', {
  title: 'Welcome',
  borderColor: 'cyan',
  borderStyle: 'rounded' // 'single' | 'double' | 'rounded' | 'bold'
});
```

### Execution Timers

```ts
log.time('dbQuery');
// ... perform query
const elapsed = log.timeEnd('dbQuery'); // Prints and returns duration in ms
```

### Log Throttling & Sampling

```ts
// Drop duplicate warnings within 2 seconds
const throttled = log.throttle({ limit: 1, windowMs: 2000 });
throttled.warn('Connection retrying...');

// Sample high-throughput debug logs (only log 10% of calls)
const sampled = log.sample(0.1);
sampled.debug('High-frequency packet');
```

---

## Global Console Patching

Upgrade legacy projects with one line of code:

```ts
import log from '@anishsharma/betterlogs';

log.patchConsole();

// All console calls are now routed through BetterLogs
console.log('Formatted message');
console.error('Error with stack trace');

// Restore original console if needed:
log.unpatchConsole();
```

---

## Independent Instances

If your library or microservice needs an isolated logger instance that does not affect the global logger:

```ts
const myLogger = log.create({
  theme: 'nord',
  level: 'debug'
});

myLogger.info('Independent log');
```
