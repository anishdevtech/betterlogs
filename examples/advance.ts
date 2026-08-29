import { betterlogs, Theme, DiscordTransport, HttpTransport } from '../src';

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

// 1. Register and apply a custom theme
betterlogs.addTheme(customTheme);
betterlogs.setTheme('sunset');
betterlogs.toggleEmoji(true);
betterlogs.setTimestampFormat('12h');
betterlogs.setMode('json');
betterlogs.setLevel('debug');

// 2. Custom levels
betterlogs.addLevel('critical', { color: 'red', emoji: '🔥' });
(betterlogs as any).critical('Critical threshold reached');

// 3. Child loggers and grouped logging
const paymentLog = betterlogs.child({ label: 'Payment', meta: { currency: 'USD' } });
paymentLog.success('Payment processed successfully');

const securityLog = betterlogs.label('Security');
securityLog.warn('Suspicious login attempt');

// 4. Per-message metadata & error objects
betterlogs.with({ discord: true, alert: 'high' }).success('Important event sent to Discord');
betterlogs.with({ discord: false }).error(new Error('Local error only, muted from Discord'));

// 5. Discord transport example
const discord = new DiscordTransport({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/example',
  username: 'BetterLogs Notifier',
  filter: {
    minLevel: 'warn',
    includeLevels: ['critical'],
    onlyLabels: ['Payment', 'Security'],
    contains: 'Server'
  }
});

// 6. Generic HTTP webhook transport
const httpEndpoint = new HttpTransport({
  url: 'https://httpbin.org/post',
  headers: { 'X-Custom-Header': 'betterlogs' },
  filter: { minLevel: 'error' }
});

betterlogs.addTransport(discord);
betterlogs.addTransport(httpEndpoint);

betterlogs.removeTransport(discord);
betterlogs.clearTransports();

// 7. Theme helpers
console.log('Registered themes:', betterlogs.listThemes());
betterlogs.deregisterTheme('sunset');

// 8. Create an independent logger instance
const customLogger = betterlogs.create({ level: 'debug', theme: 'nord' });
customLogger.debug('A new logger instance is ready');
