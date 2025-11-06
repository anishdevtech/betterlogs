import { betterlogs, Theme } from '../src';

// Create a custom theme
const customTheme: Theme = {
  name: 'sunset',
  levels: {
    info: { color: '#FFA500', emoji: '🌅' },
    success: { color: '#FF6B6B', emoji: '🌟' },
    warn: { color: '#FFE66D', emoji: '⚠️' },
    error: { color: '#FF0000', emoji: '💥' },
    debug: { color: '#4ECDC4', emoji: '🔧' }
  }
};

// Register custom theme
betterlogs.addTheme(customTheme);

// Use custom theme
betterlogs.config({
  theme: 'sunset',
  mode: 'json'
});

// Create specialized loggers
const apiLogger = betterlogs.label('API');
const dbLogger = betterlogs.label('Database');

apiLogger.info('Request received');
dbLogger.success('Query executed');