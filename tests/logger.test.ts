import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BetterLogger } from '../src/logger';
import { ConfigManager } from '../src/config';
import { ThemeManager } from '../src/themes';
import { LogEntry } from '../src/types';

describe('BetterLogger', () => {
  let logger: BetterLogger;
  let configManager: ConfigManager;
  let themeManager: ThemeManager;

  // Spies
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {})
  };

  beforeEach(() => {
    themeManager = new ThemeManager();
    configManager = new ConfigManager(themeManager);
    logger = new BetterLogger(configManager, themeManager);
    vi.clearAllMocks();
  });

  it('should log basic messages to console', () => {
    logger.info('Info message');
    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0][0];
    expect(output).toContain('Info message');
  });

  it('should create labelled loggers', () => {
    const labeled = logger.withLabel('API');
    labeled.info('Request received');

    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0][0];
    expect(output).toContain('[API]');
  });

  it('should support dynamic custom levels', () => {
    logger.config({ level: 'debug' });

    logger.addLevel('audit', { color: 'blue', emoji: '🛡️' });
    (logger as any).audit('User login');

    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0][0];
    expect(output).toContain('AUDIT');
    expect(output).toContain('🛡️');
  });

  it('should support timer functions', () => {
    vi.useFakeTimers();
    logger.time('db');
    vi.advanceTimersByTime(100);
    logger.timeEnd('db');

    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0][0];
    expect(output).toContain("Timer 'db': 100ms");
    vi.useRealTimers();
  });

  it('should support generic log entries', () => {
    logger.config({ level: 'debug' });
    logger.log('info', 'Generic warning');

    expect(consoleSpy.log).toHaveBeenCalled();
    expect(consoleSpy.log.mock.calls[0][0]).toContain('Generic warning');
  });

  it('should silence explicit silent logs', () => {
    logger.config({ level: 'debug' });
    logger.silent('Should not appear');

    expect(consoleSpy.log).not.toHaveBeenCalled();
  });

  it('should allow theme and emoji updates', () => {
    logger.setTheme('light');
    logger.toggleEmoji(false);
    logger.config({ level: 'debug' });
    logger.info('No emoji');

    expect(consoleSpy.log).toHaveBeenCalled();
    expect(consoleSpy.log.mock.calls[0][0]).not.toContain('💡');
  });

  it('should remove and clear transports', () => {
    const mockTransport = { log: vi.fn() };
    logger.addTransport(mockTransport);

    expect(logger.removeTransport(mockTransport)).toBe(true);
    logger.error('Stopped transport');
    expect(mockTransport.log).not.toHaveBeenCalled();

    logger.addTransport(mockTransport);
    logger.clearTransports();
    logger.error('Cleared transports');
    expect(mockTransport.log).not.toHaveBeenCalled();
  });

  it('should support timeLog and clearTimers', () => {
    vi.useFakeTimers();
    logger.time('cache');
    vi.advanceTimersByTime(120);
    logger.timeLog('cache');
    expect(consoleSpy.log).toHaveBeenCalled();

    logger.clearTimers();
    logger.timeLog('cache');
    expect(consoleSpy.log.mock.calls[1][0]).toContain("Timer 'cache' has not been started");
    vi.useRealTimers();
  });

  it('should update timestamp format', () => {
    logger.setTimestampFormat('12h');
    expect(configManager.getConfig().timestampFormat).toBe('12h');
  });

  it('should support setTheme by object', () => {
    const customTheme = {
      name: 'sunrise',
      levels: {
        info: { color: 'pink', emoji: '🌅' },
        success: { color: 'green', emoji: '✅' },
        warn: { color: 'yellow', emoji: '⚠️' },
        error: { color: 'red', emoji: '❌' },
        debug: { color: 'magenta', emoji: '🔍' }
      }
    };

    logger.setTheme(customTheme);
    expect(configManager.getConfig().theme).toBe('sunrise');
  });

  it('should preserve metadata through with()', () => {
    const mockTransport = { log: vi.fn() };
    logger.addTransport(mockTransport);

    logger.with({ discord: true }).info('Chained');

    expect(mockTransport.log).toHaveBeenCalled();
    const entry = mockTransport.log.mock.calls[0][0] as LogEntry;
    expect(entry.meta).toEqual({ discord: true });
  });

  it('should propagate logs to transports', async () => {
    const mockTransport = { log: vi.fn() };
    logger.addTransport(mockTransport);

    logger.error('Critical failure');

    expect(mockTransport.log).toHaveBeenCalled();
    const entry = mockTransport.log.mock.calls[0][0] as LogEntry;
    expect(entry.level).toBe('error');
    expect(entry.message).toBe('Critical failure');
  });

  it('should pass options through "with()" chaining', () => {
    const mockTransport = { log: vi.fn() };
    logger.addTransport(mockTransport);

    logger.with({ discord: true }).info('Chained');

    expect(mockTransport.log).toHaveBeenCalled();
    const entry = mockTransport.log.mock.calls[0][0] as LogEntry;
    expect(entry.meta).toEqual({ discord: true });
  });
});
