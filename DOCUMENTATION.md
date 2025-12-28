# 📚 BetterLogs

> **The ultimate logging solution for Node.js & Browser applications**  
> Zero configuration • Beautiful output • Discord integration • Type-safe

---

## 🚀 Quick Start

Get up and running in seconds with zero configuration required.

```bash
npm install @anishsharma/betterlogs
```

### ✨ Key Features

| Feature                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| ⚡ **Zero Config**      | Start logging immediately without any setup |
| 🎨 **Beautiful Output** | Color-coded logs with emojis and timestamps |
| 🔒 **Type Safe**        | Full TypeScript support out of the box      |
| 🔌 **Discord Ready**    | Built-in webhook integration for alerts     |
| 💾 **File Persistence** | Automatic file logging in Node.js           |
| 🌐 **Universal**        | Works seamlessly in Node.js and browsers    |

### 📝 Basic Usage

```javascript
import log from '@anishsharma/betterlogs';

// Standard logging levels
log.info('Server starting on port 3000');
log.success('Database connected successfully');
log.warn('Memory usage is above 80%');
log.error('Failed to process payment');
log.debug('Payload size: 12kb'); // Hidden by default

// Organize with Labels
const authLog = log.label('Auth');
authLog.info('User logged in');
// Output: [INFO] [Auth] User logged in
```

---

## ⚙️ Configuration

Customize the look and behavior to match your preferences using `log.config()`.

### Configuration Options

| Option            | Type      | Default    | Description                                                                |
| ----------------- | --------- | ---------- | -------------------------------------------------------------------------- |
| `theme`           | `string`  | `'dark'`   | Choose from: `dark`, `light`, `neon`, `minimal`, or custom object          |
| `showTimestamp`   | `boolean` | `true`     | Display timestamp with each log                                            |
| `showEmoji`       | `boolean` | `true`     | Show emojis for different log levels                                       |
| `level`           | `string`  | `'info'`   | Minimum level to display (`debug` < `info` < `success` < `warn` < `error`) |
| `mode`            | `string`  | `'pretty'` | Output format: `pretty` or `json` (for log aggregators)                    |
| `timestampFormat` | `string`  | `'24h'`    | Time format: `24h` or `12h`                                                |

### 🎨 Example Configuration

```javascript
log.config({
  theme: 'neon', // Use the neon theme
  showTimestamp: true, // Show timestamps
  showEmoji: true, // Show emojis
  level: 'info', // Minimum level to display
  mode: 'pretty', // Pretty print format
  timestampFormat: '24h' // 24-hour time format
});
```

---

## 🔌 Discord Integration (Transports)

Send critical alerts directly to Discord using the built-in transport system.

> 💡 **Pro Tip:** Discord transports are perfect for monitoring production errors and critical events in real-time!

### 🔧 Basic Setup

**Default behavior:** Sends errors only

```javascript
import log, { DiscordTransport } from '@anishsharma/betterlogs';

const discordLayer = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL'
});

log.addTransport(discordLayer);
```

### 🎚️ Custom Level Filtering

Change the minimum level required to trigger a webhook:

```javascript
new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  filter: {
    minLevel: 'warn' // Sends 'warn' and 'error' logs
  }
});
```

---

## 🎯 Smart Filtering

Declarative control over what gets sent to external services like Discord.

### 🔢 Level-Based Filtering

```javascript
filter: {
  minLevel: 'error'; // Only send error-level logs and above
}
```

### 🏷️ Exception Handling

```javascript
filter: {
  minLevel: 'error',
  includeLevels: ['critical']  // Always send 'critical' logs
}
```

### 📋 Label Whitelist

```javascript
filter: {
  onlyLabels: ['Payment', 'Security', 'Auth'];
  // Only send logs from these specific modules
}
```

### 🔍 Content-Based Filtering

```javascript
filter: {
  contains: 'Database'; // Only send logs containing this text
}
```

### 🎛️ Combined Filtering

Use multiple filters together for precise control:

```javascript
new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  filter: {
    // 1. Minimum standard
    minLevel: 'error',

    // 2. Exceptions: Always send 'critical' logs
    includeLevels: ['critical'],

    // 3. Whitelist: Only send logs from these modules
    onlyLabels: ['Payment', 'Security', 'Auth'],

    // 4. Content check: Only send logs containing this text
    contains: 'Database'
  }
});
```

---

## ⛓ Granular Control with `.with()`

Override global rules on a per-log basis for ultimate flexibility.

### 🔔 Force Send

Send a log to Discord even if it normally wouldn't qualify:

```javascript
// Force this success log to be sent to Discord
log.with({ discord: true }).success('Big payment received: $500.00');
```

**Use case:** You want to see a "Success" log in Discord, even though your transport is set to "Errors Only".

### 🔇 Force Mute

Prevent a log from being sent to Discord:

```javascript
// Prevent this error from spamming Discord
log.with({ discord: false }).error('Client disconnected unexpectedly');
```

**Use case:** You have a recurring error that isn't important and want to prevent it from spamming your Discord channel.

---

## 💾 File Logging

**🏷️ Node.js Only**

Automatically persist logs to the file system with zero configuration.

```javascript
// Logs will be appended to this file
log.file('./logs/application.log');
```

### ✨ Smart Features

- ✅ Automatic directory creation if the folder doesn't exist
- ✅ Append mode (doesn't overwrite existing logs)
- ✅ Thread-safe writes
- ✅ Gracefully disabled in browser environments

---

## 🛠 Advanced Usage

### 🎨 Custom Log Levels

Create your own log levels with custom colors and emojis:

```javascript
// 1. Register the level
log.addLevel('audit', {
  color: 'magenta',
  emoji: '🛡️'
});

// 2. Use it
// TypeScript users: Cast to any or extend the interface
(log as any).audit('User changed password');
```

### ⏱️ Performance Timers

Measure how long code takes to execute:

```javascript
log.time('db-query');

// ... perform heavy operation ...

log.timeEnd('db-query');
// Output: [INFO] Timer 'db-query': 142ms
```

### 📊 Table View

Pretty-print arrays or objects:

```javascript
const users = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' }
];

log.table(users);
```

**Output:**

```
┌─────────┬────┬─────────┬─────────┐
│ (index) │ id │  name   │  role   │
├─────────┼────┼─────────┼─────────┤
│    0    │ 1  │ 'Alice' │ 'Admin' │
│    1    │ 2  │ 'Bob'   │ 'User'  │
└─────────┴────┴─────────┴─────────┘
```

---

## 🌐 Browser Support

**🏷️ Universal - Works Everywhere**

BetterLogs automatically detects its environment and adapts accordingly.

### 🎨 Browser Features

| Feature                   | Status       | Description                                          |
| ------------------------- | ------------ | ---------------------------------------------------- |
| 🎨 **CSS Styling**        | ✅ Supported | Uses browser-native CSS for beautiful console output |
| 🔌 **Discord Transports** | ✅ Supported | Still works via browser fetch API                    |
| 💾 **File Logging**       | ⚠️ Disabled  | Safely disabled (no errors thrown)                   |
| 🎯 **All Log Levels**     | ✅ Supported | Full feature parity with Node.js                     |

### 📦 Browser Usage

```html
<script type="module">
  import log from 'https://esm.sh/@anishsharma/betterlogs';

  log.success('Hello from the Browser!');
  log.info('BetterLogs works seamlessly in browsers');

  // Discord integration still works!
  const discord = new DiscordTransport({
    webhookUrl: 'https://discord.com/api/webhooks/...'
  });
  log.addTransport(discord);
</script>
```

---

## 📖 Complete Example

Here's a comprehensive example showing multiple features together:

```javascript
import log, { DiscordTransport } from '@anishsharma/betterlogs';

// Configure the logger
log.config({
  theme: 'neon',
  level: 'info',
  showTimestamp: true
});

// Set up Discord alerts for critical issues
const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/...',
  filter: {
    minLevel: 'error',
    onlyLabels: ['Payment', 'Auth']
  }
});
log.addTransport(discord);

// Enable file logging
log.file('./logs/app.log');

// Create labeled loggers for different modules
const paymentLog = log.label('Payment');
const authLog = log.label('Auth');

// Use them in your application
authLog.info('User login attempt');
authLog.success('User authenticated successfully');

paymentLog.info('Processing payment...');
log.time('payment-processing');

// ... payment logic ...

log.timeEnd('payment-processing');

// Force send important success to Discord
paymentLog.with({ discord: true }).success('Payment of $1,234.56 processed');

// Suppress noisy errors from Discord
paymentLog.with({ discord: false }).error('Payment validation failed: invalid card number');
```

---

## 🤝 Contributing

Found a bug or have a feature request? We'd love to hear from you!

- 🐛 [Report Issues](https://github.com/anishdevtech/betterlogs/issues)
- 💡 [Request Features](https://github.com/anishdevtech/betterlogs/issues)


---

## 📄 License

MIT License © 2025-26 BetterLogs

---

<div align="center">

**Made with 💜 by Anish**

[GitHub](https://github.com/anishdevtech/betterlogs) • [NPM](https://www.npmjs.com/package/@anishsharma/betterlogs)

</div>
