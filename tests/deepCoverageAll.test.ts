import { describe, it, expect, vi, beforeEach } from 'vitest';
import log, {
  BetterLogger,
  ConfigManager,
  ThemeManager,
  FileLogger,
  RotatingFileLogger,
  Redactor,
  AsyncContextManager,
  Colorizer,
  EnvironmentDetector,
  formatTime,
  CallbackTransport
} from '../src';

describe('Deep Coverage for All Modules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FileLogger edge cases', () => {
    it('should test flush and close on uninitialized or closed streams', async () => {
      const fl = new FileLogger('dummy.log');
      await fl.flush();
      await fl.close();
      // Second close should resolve immediately
      await fl.close();
      await fl.flush();
    });
  });

  describe('Redactor edge cases', () => {
    it('should handle RegExp, Dates, non-objects, and disabled redactor', () => {
      const redactor = new Redactor({ enabled: false });
      const data = { password: 'pass', date: new Date(), regex: /abc/i };
      expect(redactor.redact(data)).toEqual(data);

      const activeRedactor = new Redactor({ enabled: true });
      const activeData = {
        date: new Date('2026-01-01'),
        regex: /test/g,
        num: 42,
        str: 'hello',
        empty: null,
        undef: undefined
      };
      const result = activeRedactor.redact(activeData);
      expect(result.num).toBe(42);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.regex).toBeInstanceOf(RegExp);
    });

    it('should handle array redaction paths', () => {
      const redactor = new Redactor({ paths: ['items.0.secret', 'users.1.token'] });
      const payload = {
        items: [{ secret: 'shh' }, { secret: 'keep' }],
        users: [{ token: 'safe' }, { token: 'hidden' }]
      };
      const redacted = redactor.redact(payload);
      expect(redacted.items[0].secret).toBe('[REDACTED]');
      expect(redacted.items[1].secret).toBe('keep');
      expect(redacted.users[0].token).toBe('safe');
      expect(redacted.users[1].token).toBe('[REDACTED]');
    });
  });

  describe('AsyncContextManager fallback', () => {
    it('should handle getContext and run when storage is null', () => {
      const isNodeSpy = vi.spyOn(EnvironmentDetector, 'isNode').mockReturnValue(false);
      const manager = new AsyncContextManager();
      expect(manager.getContext()).toBeUndefined();

      const res = manager.run({ foo: 'bar' }, () => 'result');
      expect(res).toBe('result');
      isNodeSpy.mockRestore();
    });
  });

  describe('BetterLogger edge cases', () => {
    it('should handle table without console.table, timers without start, and silent empty', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const originalTable = console.table;
      (console as any).table = undefined;

      log.table({ a: 1, b: 2 });
      expect(consoleLogSpy).toHaveBeenCalled();
      (console as any).table = originalTable;

      // Timer not started
      log.timeLog('non_existent');
      log.timeEnd('non_existent');

      // Silent without message
      log.silent();

      // Transport registration & removal
      const transport = new CallbackTransport(() => {});
      log.addTransport(transport);
      expect(log.getTransports()).toContain(transport);
      expect(log.removeTransport(transport)).toBe(true);
      expect(log.removeTransport(transport)).toBe(false);

      log.addTransport(transport);
      log.clearTransports();
      expect(log.getTransports().length).toBe(0);

      // Close logger
      await log.close();

      consoleLogSpy.mockRestore();
    });

    it('should handle error logging as second argument or custom level logging', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      log.config({ level: 'debug' });
      log.addLevel('customLevel', { color: 'blue', emoji: '⭐' });
      (log as any).customLevel('Custom log message');
      expect(logSpy).toHaveBeenCalled();

      // Log with error passed in data
      const err = new Error('Second argument error');
      log.error('Failed to execute', err);
      expect(errSpy).toHaveBeenCalled();

      errSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe('Utils & Time formatting edge cases', () => {
    it('should test 12h and 24h formatTime', () => {
      const d = new Date(2026, 0, 1, 14, 5, 9);
      expect(formatTime(d, '12h')).toContain('PM');
      expect(formatTime(d, '24h')).toBe('14:05:09');

      const dMorning = new Date(2026, 0, 1, 9, 5, 9);
      expect(formatTime(dMorning, '12h')).toContain('AM');
    });

    it('should test Colorizer stripAnsi with clean strings', () => {
      expect(Colorizer.stripAnsi('plain text')).toBe('plain text');
    });
  });
});
