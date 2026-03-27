import log from '../src';

// Basic logging levels
log.info('Server starting...');
log.success('Database connected successfully');
log.warn('Memory usage is high');
log.error('Failed to load configuration');
log.debug('Debug details are visible when the logger level is set to debug');

// Configure the logger
log.config({
  theme: 'neon',
  level: 'debug',
  showTimestamp: true,
  showEmoji: true,
  mode: 'pretty',
  timestampFormat: '24h'
});

// Group logs with labels
const apiLog = log.label('API');
apiLog.info('Request received');
const authLog = log.label('Auth');
authLog.error('Invalid token provided');

// Dynamic logging and helper methods
log.log('warn', 'This is a generic warning message');
log.silent('This message will not appear in the console');
log.toggleEmoji(false);
log.setTimestampFormat('12h');

// Custom log level
log.addLevel('audit', { color: 'magenta', emoji: '🛡️' });
(log as any).audit('User login recorded');

// Table output
log.table([
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' }
]);

// Timer helpers - Node.js and browser safe
log.time('databaseQuery');
setTimeout(() => {
  log.timeLog('databaseQuery');
  log.timeEnd('databaseQuery');
  log.clearTimers();
}, 1000);

// File logging is supported in Node.js only
log.file('./logs/app.log');
