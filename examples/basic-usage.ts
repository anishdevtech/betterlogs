import log from '../src';

// Basic logging
log.info('Server starting...');
log.success('Database connected successfully');
log.warn('Memory usage is high');
log.error('Failed to load configuration');

// With configuration
log.config({
  theme: 'neon',
  showTimestamp: true,
  showEmoji: true,
  level: 'debug'
});

// Labeled logging
log.label('API').info('Making request to endpoint');
log.label('Auth').error('Invalid token');

// Custom levels
log.addLevel('critical', { color: 'red', emoji: '🔥' });
log.critical('System is on fire!');

// Timer utilities
log.time('databaseQuery');
// Simulate some work
setTimeout(() => {
  log.timeEnd('databaseQuery');
}, 1000);

// Table logging
log.table([
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 }
]);