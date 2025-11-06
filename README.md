
# @anish2dev/betterlogs 🚀

A lightweight yet powerful logging library that makes console output elegant, expressive, and customizable for both Node.js and browsers.

![npm](https://img.shields.io/npm/v/@anishsharma/betterlogs)
![npm](https://img.shields.io/npm/dt/@/anishsharma/betterlogs)
![GitHub](https://img.shields.io/github/license/anishdevtech/betterlogs)
![Tests](https://github.com/anishdevtech/betterlogs/actions/workflows/test.yml/badge.svg)

## ✨ Features

- 🎨 **Beautiful Themes** (dark, light, neon, minimal + custom)
- 📝 **Custom Labels & Levels**
- ⏰ **Timestamps** (12h/24h format)
- 😊 **Emoji Support** (auto-toggle for unsupported terminals)
- 🌐 **Browser & Node.js Support**
- 📊 **Table & JSON Logging**
- ⚡ **TypeScript Ready**
- 🏷️ **Label-based Logging**
- ⏱️ **Timer Utilities**
- 📁 **File Logging** (Node.js)

## 📦 Installation

```bash
npm install @anishsharma/betterlogs
```

🚀 Quick Start

```typescript
import log from '@anishsharma/betterlogs';

// Basic logging
log.info('Server starting...');
log.success('Database connected!');
log.warn('Memory usage high');
log.error('Failed to load config');

// Customization
log.config({
  theme: 'neon',
  showTimestamp: true,
  showEmoji: true
});

// Labeled logging
log.label('API').info('Request sent');
log.label('Auth').error('Invalid token');

// Custom levels
log.addLevel('critical', { color: 'red', emoji: '🔥' });
log.critical('System on fire!');

// Timer utilities
log.time('databaseQuery');
// ... some operation
log.timeEnd('databaseQuery'); // Logs: Timer 'databaseQuery': 150ms
```

🎨 Themes

```typescript
// Built-in themes
log.config({ theme: 'dark' });    // Default
log.config({ theme: 'light' });
log.config({ theme: 'neon' });
log.config({ theme: 'minimal' });

// Custom themes
log.addTheme('sunset', {
  info: { color: '#FFA500', emoji: '🌅' },
  success: { color: '#FF6B6B', emoji: '🌟' },
  // ... define all levels
});
```

📚 API Reference

Core Methods

- log.info(message, ...data)
- log.success(message, ...data)
- log.warn(message, ...data)
- log.error(message, ...data)
- log.debug(message, ...data)

Configuration

- log.config(options)
- log.setLevel(level)
- log.setMode('pretty' | 'json')

Advanced Features

- log.label(name) - Create labeled logger
- log.addLevel(name, config) - Add custom log level
- log.table(data) - Pretty-print tables
- log.time(label) / log.timeEnd(label) - Performance timing
- log.file(path) - File logging (Node.js only)

🌐 Browser Usage

```html
<script type="module">
  import log from 'https://esm.sh/@anishsharma/betterlogs';
  
  log.info('Browser logging activated!');
  log.success('Betterlogs works in browsers!');
</script>
```

📋 Configuration Options

```typescript
interface BetterLogsConfig {
  showTimestamp?: boolean;      // Default: true
  showEmoji?: boolean;          // Default: true  
  theme?: string | Theme;       // Default: 'dark'
  level?: LogLevel;            // Default: 'info'
  mode?: 'pretty' | 'json';    // Default: 'pretty'
  timestampFormat?: '12h' | '24h'; // Default: '24h'
}
```

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author

Anish Sharma

· GitHub: @anishdevtech
· Email: anishdevtech@gmail.com

---

Made with ❤️ by Anish Sharma
