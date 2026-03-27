import { describe, it, expect } from 'vitest';
import log, { BetterLogger, ConfigManager, DiscordTransport } from '../src/index';

describe('Index Exports', () => {
  it('should export default logger instance', () => {
    expect(log).toBeDefined();
    expect(typeof log.info).toBe('function');
    expect(typeof log.with).toBe('function');
  });

  it('should export classes', () => {
    expect(BetterLogger).toBeDefined();
    expect(ConfigManager).toBeDefined();
    expect(DiscordTransport).toBeDefined();
  });

  it('should create new instances via create()', () => {
    const newLogger = log.create({ level: 'debug' });
    expect(newLogger).toBeInstanceOf(BetterLogger);
    expect(newLogger).not.toBe(log); // Ensure it's a separate instance
  });

  it('should expose new helper methods on the default logger', () => {
    expect(typeof log.log).toBe('function');
    expect(typeof log.silent).toBe('function');
    expect(typeof log.setTheme).toBe('function');
    expect(typeof log.toggleEmoji).toBe('function');
    expect(typeof log.setTimestampFormat).toBe('function');
    expect(typeof log.removeTransport).toBe('function');
    expect(typeof log.clearTransports).toBe('function');
    expect(typeof log.timeLog).toBe('function');
    expect(typeof log.clearTimers).toBe('function');
    expect(typeof log.listThemes).toBe('function');
    expect(typeof log.deregisterTheme).toBe('function');
  });
});
