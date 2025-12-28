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
