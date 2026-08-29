import log from '../src';

// 1. Basic logging levels
log.info('Server starting...');
log.success('Database connected successfully');
log.warn('Memory usage is high');
log.error('Failed to load configuration');
log.debug('Debug details are visible when level is set to debug');

// 2. Configure the logger
log.config({
  theme: 'dracula', // 'dark' | 'light' | 'neon' | 'minimal' | 'dracula' | 'nord' | 'catppuccin'
  level: 'debug',
  showTimestamp: true,
  showEmoji: true,
  mode: 'pretty',
  timestampFormat: '24h'
});

// 3. Child Loggers & Labels
const apiLog = log.child({ label: 'API', meta: { service: 'gateway' } });
apiLog.info('Request received');

const authLog = log.label('Auth');
authLog.error(new Error('Invalid authentication token provided'));

// 4. Structured metadata per log
log.with({ userId: 'u_9921', action: 'checkout' }).info('User completed purchase');

// 5. Dynamic logging and helper methods
log.log('warn', 'This is a generic warning message');
log.silent('This message will not appear in the console');
log.toggleEmoji(false);
log.setTimestampFormat('12h');

// 6. Custom log level
log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });
(log as any).audit('User login recorded');

// 7. Table output
log.table([
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' }
]);

// 8. Timer helpers
log.time('databaseQuery');
setTimeout(() => {
  log.timeLog('databaseQuery');
  log.timeEnd('databaseQuery');
  log.clearTimers();
}, 500);

// 9. File logging (Node.js only)
log.file('./logs/app.log');
