import { betterlogs, Theme, DiscordTransport } from '../src';

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

// Register and apply a custom theme
betterlogs.addTheme(customTheme);
betterlogs.setTheme('sunset');
betterlogs.toggleEmoji(true);
betterlogs.setTimestampFormat('12h');
betterlogs.setMode('json');
betterlogs.setLevel('debug');

// Custom levels
betterlogs.addLevel('critical', { color: 'red', emoji: '🔥' });
(betterlogs as any).critical('Critical threshold reached');

// Labels and grouped logging
const paymentLog = betterlogs.label('Payment');
paymentLog.success('Payment processed successfully');

const securityLog = betterlogs.label('Security');
securityLog.warn('Suspicious login attempt');

// Per-message metadata
betterlogs.with({ discord: true }).success('Important event sent to Discord');
betterlogs.with({ discord: false }).error('Local error only');

// Discord transport example
const discord = new DiscordTransport({
  webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  filter: {
    minLevel: 'warn',
    includeLevels: ['critical'],
    onlyLabels: ['Payment', 'Security'],
    contains: 'Server'
  }
});

betterlogs.addTransport(discord);
betterlogs.removeTransport(discord);
betterlogs.clearTransports();

// Theme helpers
console.log('Registered themes:', betterlogs.listThemes());
betterlogs.deregisterTheme('sunset');

// Create an independent logger instance
const customLogger = betterlogs.create({ level: 'debug' });
customLogger.debug('A new logger instance is ready');
