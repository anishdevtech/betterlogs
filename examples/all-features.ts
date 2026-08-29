import log, { DiscordTransport, HttpTransport, CallbackTransport, Theme } from '../src';

// 1. Install and import
//    import log, { DiscordTransport, HttpTransport, Theme } from '@anishsharma/betterlogs';

// 2. Configure the default logger
log.config({
  theme: 'dracula',
  level: 'debug',
  showTimestamp: true,
  showEmoji: true,
  mode: 'pretty',
  timestampFormat: '24h'
});

// 3. Basic levels
log.info('Application started');
log.success('Setup completed');
log.warn('Cache limit approaching');
log.error(new Error('Failed to load database driver'));
log.debug('Debug payload ready', { host: 'localhost', port: 5432 });

// 4. Generic and silent logs
log.log('info', 'Generic info via log()');
log.silent('This message is hidden intentionally');

// 5. Custom theme and levels
const oceanTheme: Theme = {
  name: 'ocean',
  levels: {
    info: { color: 'blue', emoji: '🌊' },
    success: { color: 'teal', emoji: '✅' },
    warn: { color: 'cyan', emoji: '⚠️' },
    error: { color: 'red', emoji: '❌' },
    debug: { color: 'magenta', emoji: '🔍' }
  }
};

log.setTheme(oceanTheme);
log.addTheme({
  name: 'shadow',
  levels: {
    info: { color: 'gray', emoji: '💬' },
    success: { color: 'green', emoji: '✔️' },
    warn: { color: 'yellow', emoji: '⚠️' },
    error: { color: 'red', emoji: '🚨' },
    debug: { color: 'purple', emoji: '🧪' }
  }
});

log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });
(log as any).audit('Audit event created');

// 6. Child Loggers & Scoped Context
const userLogger = log.child({ label: 'User', meta: { service: 'user-service' } });
userLogger.info('New user registered');

const apiLogger = log.label('API');
apiLogger.debug('Endpoint hit');

// 7. Transports (Discord, HTTP, Custom Callbacks)
const callbackTransport = new CallbackTransport((entry) => {
  if (entry.level === 'error') {
    // Custom in-memory telemetry, Sentry, or alert dispatcher
  }
});

const discord = new DiscordTransport({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/example',
  username: 'Production Logger',
  filter: {
    minLevel: 'error'
  }
});

const httpTransport = new HttpTransport({
  url: 'https://logs.example.com/ingest',
  headers: { 'X-API-Key': 'secret' },
  filter: { minLevel: 'warn' }
});

log.addTransport(callbackTransport);
log.addTransport(discord);
log.addTransport(httpTransport);
log.removeTransport(callbackTransport);
log.clearTransports();

// 8. Per-log structured metadata
log
  .with({ discord: true, transactionId: 'tx_789' })
  .warn('This warning is sent to Discord with metadata');
log.with({ discord: false }).error('This error stays local only');

// 9. Timer helpers (return elapsed milliseconds)
log.time('startup');
setTimeout(() => {
  const elapsedLog = log.timeLog('startup');
  const elapsedEnd = log.timeEnd('startup');
  console.log(`Timer reported: ${elapsedLog}ms (log), ${elapsedEnd}ms (end)`);
  log.clearTimers();
}, 300);

// 10. Table output
log.table([
  { module: 'auth', status: 'ok' },
  { module: 'payments', status: 'pending' }
]);

// 11. File logging (Node.js only)
log.file('./logs/full-example.log');

// 12. Independent logger instances
const separateLogger = log.create({ level: 'debug', theme: 'catppuccin' });
separateLogger.info('Separate logger instance starting');
