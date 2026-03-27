# BetterLogs Documentation

A complete developer guide for using BetterLogs in Node.js and browser applications.

## Installation

Install from npm:

```bash
npm install @anishsharma/betterlogs
```

## What is BetterLogs?

BetterLogs is a lightweight logging library that provides:

- simple console logging with nice themes,
- custom log levels,
- label-based log grouping,
- JSON and pretty output modes,
- Discord webhooks and custom transports,
- file logging support in Node.js,
- timer helpers, and
- per-log metadata with `.with()`.

## Importing the package

```ts
import log, { DiscordTransport, Theme, BetterLogger } from '@anishsharma/betterlogs';
```

The package exports a default logger object named `log`. You can also create separate logger instances with `log.create()`.

## Basic usage

```ts
log.info('Application started');
log.success('Operation completed');
log.warn('Warning: check input');
log.error('An error occurred');
log.debug('Debugging details');
```

## Configuration

Use `log.config()` to set global logging behavior:

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

### Configuration options

- `theme`: `'dark' | 'light' | 'neon' | 'minimal' | Theme`
- `level`: `'debug' | 'info' | 'success' | 'warn' | 'error' | 'silent'`
- `showTimestamp`: `true | false`
- `showEmoji`: `true | false`
- `mode`: `'pretty' | 'json'`
- `timestampFormat`: `'12h' | '24h'`
- `file`: optional file path for Node.js log output

## Summary of logger methods

| Method | Description |
|---|---|
| `log.info()` | Standard info log |
| `log.success()` | Success message |
| `log.warn()` | Warning message |
| `log.error()` | Error message |
| `log.debug()` | Debug message |
| `log.log(level, message)` | Generic logging with any level |
| `log.silent(message)` | Suppress output for a specific message |
| `log.withLabel(name)` | Create a named label group |
| `log.with(options)` | Apply per-log metadata |
| `log.config(config)` | Update logger configuration |
| `log.setLevel(level)` | Set the minimum logging level |
| `log.setMode(mode)` | Switch output between `pretty` and `json` |
| `log.setTheme(theme)` | Apply a theme by name or object |
| `log.toggleEmoji(flag)` | Enable or disable emoji output |
| `log.setTimestampFormat(format)` | Choose between `12h` or `24h` time display |
| `log.time(label)` | Start a timer |
| `log.timeEnd(label)` | End a timer and print duration |
| `log.timeLog(label)` | Print elapsed time without stopping the timer |
| `log.clearTimers()` | Clear all active timers |
| `log.table(data)` | Print an array or object as a table |
| `log.file(path)` | Enable file logging in Node.js |
| `log.addTransport(transport)` | Add a custom transport |
| `log.removeTransport(transport)` | Remove a transport |
| `log.clearTransports()` | Remove all transports |
| `log.addTheme(theme)` | Register a new theme |
| `log.listThemes()` | List registered themes |
| `log.deregisterTheme(name)` | Remove a theme by name |
| `log.addLevel(name, config)` | Register a custom log level |
| `log.create(config)` | Create a new logger instance |

## Theme usage

Built-in themes are: `dark`, `light`, `neon`, `minimal`.

```ts
log.setTheme('light');
```

### Custom theme example

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

### Manage themes

```ts
log.addTheme(customTheme);
console.log(log.listThemes());
log.deregisterTheme('ocean');
```

## Custom levels

Add your own log severity levels:

```ts
log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });
(log as any).audit('Audit event recorded');
```

## Label groups and module logging

Labels help organize logs by component:

```ts
const authLog = log.label('Auth');
authLog.info('User logged in');
```

You can also use `group()` as an alias:

```ts
const apiLog = log.group('API');
apiLog.debug('Request received');
```

## Per-log metadata with `.with()`

Apply metadata for a single log entry:

```ts
log.with({ discord: true }).success('Important event');
log.with({ discord: false }).error('Local error only');
```

This is useful for transport-level decisions such as Discord forwarding.

## Timers

```ts
log.time('operation');
// ... run work ...
log.timeLog('operation');
log.timeEnd('operation');
log.clearTimers();
```

## Table output

```ts
log.table([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);
```

## File logging (Node.js only)

```ts
log.file('./logs/application.log');
```

File logging will automatically create directories and append JSON entries.

## Transports

Transports allow custom output destinations.

```ts
const transport = {
  log(entry) {
    console.log('Custom transport', entry);
  }
};
log.addTransport(transport);
log.removeTransport(transport);
log.clearTransports();
```

## DiscordTransport

```ts
import { DiscordTransport } from '@anishsharma/betterlogs';

const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/your-webhook-url',
  filter: {
    minLevel: 'warn',
    includeLevels: ['critical'],
    onlyLabels: ['Auth', 'Payment'],
    contains: 'Database'
  }
});

log.addTransport(discord);
```

### DiscordTransport options

- `webhookUrl`: required Discord webhook URL
- `filter.minLevel`: minimum level to send
- `filter.includeLevels`: always send these levels
- `filter.onlyLabels`: send only from listed labels
- `filter.contains`: send only if the message contains text
- `customCheck`: optional callback to decide per entry

## Creating separate logger instances

```ts
const customLogger = log.create({ level: 'debug' });
customLogger.debug('Independent logger');
```

## Example sequence

```ts
import log, { DiscordTransport } from '@anishsharma/betterlogs';

log.config({ theme: 'neon', level: 'info' });
const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  filter: { minLevel: 'warn' }
});
log.addTransport(discord);
log.setTheme('dark');

log.info('App is ready');
log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });
(log as any).audit('Audit completed');
log.time('startup');

// later...
log.timeEnd('startup');
```

## Example files

See `/examples/basic-usage.ts`, `/examples/advance.ts`, and `/examples/all-features.ts` for runnable usage patterns.
