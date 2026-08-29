import { describe, it, expect } from 'vitest';
import log, {
  betterlogs,
  BetterLogger,
  ConfigManager,
  ThemeManager,
  DiscordTransport,
  HttpTransport,
  CallbackTransport,
  FileLogger,
  Colorizer,
  EnvironmentDetector
} from '../src/index';

describe('Index Exports', () => {
  it('should export default and named logger instance', () => {
    expect(log).toBeDefined();
    expect(betterlogs).toBe(log);
    expect(typeof log.info).toBe('function');
    expect(typeof log.with).toBe('function');
    expect(typeof log.child).toBe('function');
  });

  it('should export classes and utilities', () => {
    expect(BetterLogger).toBeDefined();
    expect(ConfigManager).toBeDefined();
    expect(ThemeManager).toBeDefined();
    expect(DiscordTransport).toBeDefined();
    expect(HttpTransport).toBeDefined();
    expect(CallbackTransport).toBeDefined();
    expect(FileLogger).toBeDefined();
    expect(Colorizer).toBeDefined();
    expect(EnvironmentDetector).toBeDefined();
  });

  it('should create new instances via create()', () => {
    const newLogger = log.create({ level: 'debug' });
    expect(newLogger).toBeInstanceOf(BetterLogger);
    expect(newLogger).not.toBe(log); // Ensure it's a separate instance
  });

  it('should expose helper methods on the default logger', () => {
    expect(typeof log.log).toBe('function');
    expect(typeof log.silent).toBe('function');
    expect(typeof log.setTheme).toBe('function');
    expect(typeof log.toggleEmoji).toBe('function');
    expect(typeof log.setTimestampFormat).toBe('function');
    expect(typeof log.removeTransport).toBe('function');
    expect(typeof log.clearTransports).toBe('function');
    expect(typeof log.getTransports).toBe('function');
    expect(typeof log.timeLog).toBe('function');
    expect(typeof log.clearTimers).toBe('function');
    expect(typeof log.listThemes).toBe('function');
    expect(typeof log.hasTheme).toBe('function');
    expect(typeof log.deregisterTheme).toBe('function');
    expect(typeof log.close).toBe('function');
  });
});
