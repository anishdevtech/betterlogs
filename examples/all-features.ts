import log, { DiscordTransport, Theme } from '../src';

// 1. Install and import
//    import log, { DiscordTransport, Theme } from '@anishsharma/betterlogs';

// 2. Configure the default logger
log.config({
  theme: 'dark',
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
log.error('Failed to load module');
log.debug('Debug payload ready');

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

// 6. Labels and groups
const userLogger = log.label('User');
userLogger.info('New user registered');
const apiLogger = log.label('API');
apiLogger.debug('Endpoint hit');

// 7. Transport examples
const exampleTransport = {
  log(entry: any) {
    console.log('Custom transport received:', entry.level, entry.message);
  }
};

log.addTransport(exampleTransport);
log.removeTransport(exampleTransport);
log.clearTransports();

// 8. Per-log metadata
log.with({ discord: true }).warn('This warning can be forced to Discord');
log.with({ discord: false }).error('This error stays local');

// 9. Timer helpers
log.time('startup');
setTimeout(() => {
  log.timeLog('startup');
  log.timeEnd('startup');
  log.clearTimers();
}, 500);

// 10. Table output
log.table([
  { module: 'auth', status: 'ok' },
  { module: 'payments', status: 'pending' }
]);

// 11. File logging (Node.js only)
log.file('./logs/full-example.log');

// 12. Discord transport setup
const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  filter: {
    minLevel: 'error'
  }
});
log.addTransport(discord);

// 13. Independent logger instance
const separateLogger = log.create({ level: 'debug' });
separateLogger.info('Separate logger instance starting');
