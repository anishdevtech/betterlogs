# BetterLogs

[![npm version](https://img.shields.io/npm/v/@anishsharma/betterlogs.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/@anishsharma/betterlogs)
[![npm downloads](https://img.shields.io/npm/dm/@anishsharma/betterlogs.svg?color=blue&logo=npm)](https://www.npmjs.com/package/@anishsharma/betterlogs)
[![CI Tests](https://img.shields.io/github/actions/workflow/status/anishdevtech/betterlogs/test.yml?branch=main&label=CI&logo=github)](https://github.com/anishdevtech/betterlogs/actions)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/anishdevtech/betterlogs?logo=codecov)](https://codecov.io/gh/anishdevtech/betterlogs)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/@anishsharma/betterlogs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENCE)

A fast, zero-dependency logger for Node.js, TypeScript, and browsers. Pretty terminal output in development, structured JSON in production, automatic secret redaction, and built-in Discord/Slack alerts.

```bash
npm install @anishsharma/betterlogs
```

---

## 30-Second Quickstart

```ts
import log from '@anishsharma/betterlogs';

log.info('Server starting...');
log.ready('Listening on http://localhost:3000');
log.warn('Database query slow (240ms)');
log.error(new Error('Connection failed'));
```

**Terminal Output:**

```text
[20:45:10] 💡 INFO Server starting...
[20:45:10] 🚀 READY Listening on http://localhost:3000
[20:45:10] ⚠️  WARN Database query slow (240ms)
[20:45:10] ❌ ERROR Connection failed
Error: Connection failed
    at connect (/app/src/db.ts:42:11)
```

---

## Why BetterLogs?

- **Zero dependencies**: No bloated `node_modules` tree, no transitive security alerts.
- **24-bit TrueColor themes**: Includes `dracula`, `nord`, `catppuccin`, `neon`, `dark`, `light`, and `minimal`. Respects `NO_COLOR` standards.
- **Automatic secret & PII redaction**: Masks passwords, tokens, API keys, and authorization headers before output.
- **Structured JSON & Pretty mode**: Human-readable colored logs locally, machine-parsable JSON in production.
- **Drop-in console upgrade**: Call `log.patchConsole()` once to upgrade all `console.log` calls across an entire app.
- **Zero-dependency file rotation**: Rotate logs by size (`10MB`) or date (`YYYY-MM-DD`) without extra packages.
- **Built-in webhooks**: Direct transports for Discord, Slack, Telegram, and arbitrary HTTP endpoints.
- **Universal**: Works in Node.js (CJS & ESM), browsers, Vite, Next.js, and Edge runtimes.

---

## Common Recipes

### 1. Dev (Pretty) vs Production (JSON)

Switch modes using `process.env.NODE_ENV`:

```ts
log.config({
  mode: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  theme: 'dracula'
});

log.info('User logged in', { userId: 42 });
```

**Production JSON Output:**

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2026-08-29T15:15:30.123Z",
  "data": [{ "userId": 42 }]
}
```

---

### 2. Automatic Secret Redaction

Prevents accidental leakage of passwords, bearer tokens, API keys, and credit cards:

```ts
log.config({
  redaction: {
    paths: ['password', 'token', 'authorization', '*.apiKey']
  }
});

log.info('Incoming request payload', {
  username: 'alice',
  password: 'mySecretPassword123',
  headers: { authorization: 'Bearer eyJhbGciOi...' }
});

// Output: { username: 'alice', password: '[REDACTED]', headers: { authorization: '[REDACTED]' } }
```

---

### 3. Upgrade Existing Codebases with `patchConsole()`

Upgrade an existing project without rewriting hundreds of `console.log` calls:

```ts
import log from '@anishsharma/betterlogs';

// Put this in your app entry point (e.g. index.ts or server.ts)
log.patchConsole();

console.log('Now formatted with timestamps and themes!');
console.error('Errors now include clean stack traces');
```

---

### 4. Express / Node HTTP Request Logger

Replace heavy middleware packages with the built-in HTTP request logger:

```ts
import express from 'express';
import log from '@anishsharma/betterlogs';

const app = express();

// Logs: GET /api/users 200 in 14ms (color-coded by status)
app.use(log.httpMiddleware());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  log.ready('Server running at http://localhost:3000');
});
```

---

### 5. Child Loggers & Module Scopes

Create sub-loggers with dedicated labels and metadata:

```ts
const userLog = log.child({
  label: 'UserService',
  meta: { version: '2.0' }
});

userLog.info('Password reset requested', { email: 'user@example.com' });
// Output: [20:45:10] 💡 INFO [UserService] Password reset requested
```

---

### 6. Discord & Slack Webhook Alerts

Forward warnings and errors to your team's alert channels:

```ts
import { DiscordTransport, SlackTransport } from '@anishsharma/betterlogs';

// Discord Webhook
log.addTransport(
  new DiscordTransport({
    webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
    filter: { minLevel: 'error' }
  })
);

// Slack Webhook
log.addTransport(
  new SlackTransport({
    webhookUrl: process.env.SLACK_WEBHOOK_URL!,
    channel: '#backend-alerts',
    filter: { minLevel: 'error' }
  })
);

// Normal error -> sent to Discord & Slack
log.error(new Error('Stripe payment gateway timeout'));

// Force send or mute per call:
log.with({ discord: true }).success('Milestone: 10,000 active users reached!');
log.with({ discord: false }).error('Local test error only');
```

---

### 7. Rotating Log Files (Node.js)

Save logs to disk with automatic file rotation and retention cleanup:

```ts
log.file('./logs/app.log', {
  maxSize: '10MB', // Rotates when file reaches 10MB
  maxFiles: 5, // Keeps latest 5 log files
  datePattern: 'YYYY-MM-DD'
});
```

---

### 8. CLI Banners & Startup Boxes

Draw clean terminal boxes for CLIs and scripts:

```ts
log.box('BetterLogs CLI v1.0\nReady on http://localhost:3000', {
  title: 'Server Info',
  borderColor: 'cyan',
  borderStyle: 'rounded'
});
```

---

## API Summary

| Method                                    | Description                                                   |
| ----------------------------------------- | ------------------------------------------------------------- |
| `log.info(msg, ...data)`                  | Info log                                                      |
| `log.ready(msg, ...data)`                 | Readiness log (`🚀 READY`)                                    |
| `log.start(msg, ...data)`                 | Task started log (`⏳ START`)                                 |
| `log.success(msg, ...data)`               | Success log (`✅ SUCCESS`)                                    |
| `log.warn(msg, ...data)`                  | Warning log (`⚠️ WARN`)                                       |
| `log.error(err, ...data)`                 | Error log with formatted stack traces (`❌ ERROR`)            |
| `log.fatal(err, ...data)`                 | Fatal exception log (`💀 FATAL`)                              |
| `log.debug(msg, ...data)`                 | Debug log (`🔍 DEBUG`)                                        |
| `log.trace(msg, ...data)`                 | Trace log (`🔬 TRACE`)                                        |
| `log.child({ label, meta, level })`       | Creates an isolated child logger                              |
| `log.with(meta)`                          | Attaches metadata or transport flags to a log                 |
| `log.box(text, options)`                  | Renders a styled Unicode border box                           |
| `log.time(label)` / `log.timeEnd(label)`  | Measures and returns execution time in ms                     |
| `log.throttle({ limit, windowMs })`       | Returns a rate-limited logger instance                        |
| `log.sample(rate)`                        | Returns a probabilistically sampled logger (e.g. `0.1` = 10%) |
| `log.runWithContext(ctx, fn)`             | Injects request context via Node `AsyncLocalStorage`          |
| `log.httpMiddleware(options)`             | Express / Node HTTP request logger                            |
| `log.patchConsole()` / `unpatchConsole()` | Global console monkey-patching                                |
| `log.config(options)`                     | Updates global configuration                                  |
| `log.file(path, rotationOptions)`         | Enables file logging with optional rotation                   |
| `log.addTransport(transport)`             | Adds a custom destination (Discord, Slack, HTTP, etc.)        |
| `log.close()`                             | Flushes and closes file handles and transports                |

---

## Documentation

For full configuration options, custom theme creation, and advanced transport options, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## License

[MIT](./LICENCE) © Anish Sharma
