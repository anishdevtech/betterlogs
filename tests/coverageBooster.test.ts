import { describe, it, expect, vi, beforeEach } from 'vitest';
import log, {
  betterlogs,
  ConfigManager,
  ThemeManager,
  DiscordTransport,
  HttpTransport,
  patchConsole,
  unpatchConsole,
  builtInThemes,
  createHttpMiddleware,
  RotatingFileLogger
} from '../src';
import { Formatter } from '../src/formatter';
import fs from 'fs';

global.fetch = vi.fn();

describe('Coverage Booster & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'OK'
    } as Response);
  });

  describe('ConfigManager & Themes', () => {
    it('should handle object themes in getCurrentTheme', () => {
      const themeManager = new ThemeManager();
      const customTheme = {
        name: 'customObjTheme',
        levels: builtInThemes.dark.levels
      };
      const config = new ConfigManager(themeManager, { theme: customTheme });
      expect(config.getCurrentTheme()).toBe(customTheme);
    });

    it('should reset config with resetConfig()', () => {
      const themeManager = new ThemeManager();
      const config = new ConfigManager(themeManager);
      config.updateConfig({ level: 'error' });
      expect(config.getConfig().level).toBe('error');
      config.resetConfig();
      expect(config.getConfig().level).toBe('info');
    });

    it('should return false for shouldLog with silent level', () => {
      const themeManager = new ThemeManager();
      const config = new ConfigManager(themeManager);
      expect(config.shouldLog('silent')).toBe(false);
    });
  });

  describe('Console Patching Full Coverage', () => {
    it('should handle all console methods, double patching, and unpatching when unpatched', () => {
      const infoSpy = vi.spyOn(betterlogs, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(betterlogs, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(betterlogs, 'error').mockImplementation(() => {});
      const debugSpy = vi.spyOn(betterlogs, 'debug').mockImplementation(() => {});

      unpatchConsole(); // should safely do nothing when not patched

      patchConsole(betterlogs as any);
      patchConsole(betterlogs as any); // double patch should return early

      console.info('info msg', { a: 1 });
      expect(infoSpy).toHaveBeenCalledWith('info msg', { a: 1 });

      console.warn('warn msg');
      expect(warnSpy).toHaveBeenCalledWith('warn msg');

      console.debug('debug msg');
      expect(debugSpy).toHaveBeenCalledWith('debug msg');

      const testErr = new Error('console error test');
      console.error(testErr);
      expect(errorSpy).toHaveBeenCalledWith(testErr);

      console.error('plain error string');
      expect(errorSpy).toHaveBeenCalledWith('plain error string');

      unpatchConsole();
      unpatchConsole(); // double unpatch should safely do nothing

      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
      debugSpy.mockRestore();
    });
  });

  describe('HTTP Middleware Status Coloring and Error Handling', () => {
    it('should colorize 3xx, 4xx, and 5xx status codes correctly', () => {
      const logSpy = vi.spyOn(betterlogs, 'log').mockImplementation(() => {});

      const middleware = createHttpMiddleware(betterlogs as any);

      // Test 301
      let finishCb: (() => void) | undefined;
      middleware(
        { method: 'GET', url: '/redirect' },
        {
          statusCode: 301,
          on: (_e, cb) => {
            finishCb = cb;
          }
        },
        () => {}
      );
      finishCb?.();
      expect(logSpy).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('301'),
        expect.any(Object)
      );

      // Test 404
      logSpy.mockClear();
      middleware(
        { method: 'POST', url: '/not-found' },
        {
          statusCode: 404,
          on: (_e, cb) => {
            finishCb = cb;
          }
        },
        () => {}
      );
      finishCb?.();
      expect(logSpy).toHaveBeenCalledWith(
        'warn',
        expect.stringContaining('404'),
        expect.any(Object)
      );

      // Test 500
      logSpy.mockClear();
      middleware(
        { method: 'POST', url: '/server-error' },
        {
          statusCode: 500,
          on: (_e, cb) => {
            finishCb = cb;
          }
        },
        () => {}
      );
      finishCb?.();
      expect(logSpy).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('500'),
        expect.any(Object)
      );

      logSpy.mockRestore();
    });
  });

  describe('Formatter with Context and Causes', () => {
    it('should format pretty log with requestId in context', () => {
      const formatted = Formatter.formatPretty(
        {
          level: 'info',
          message: 'Hello Context',
          timestamp: new Date(),
          context: { requestId: 'req_xyz' }
        },
        {
          showTimestamp: true,
          showEmoji: true,
          theme: 'dark',
          level: 'info',
          mode: 'pretty',
          timestampFormat: '24h'
        },
        builtInThemes.dark
      );

      expect(formatted).toContain('[req_xyz]');
      expect(formatted).toContain('Hello Context');
    });

    it('should serialize error causes in formatJson', () => {
      const err = new Error('Outer error');
      (err as any).cause = new Error('Root cause');

      const jsonStr = Formatter.formatJson({
        level: 'error',
        message: 'Failed',
        timestamp: new Date(),
        error: err
      });

      const parsed = JSON.parse(jsonStr);
      expect(parsed.error.cause).toBeDefined();
    });
  });

  describe('Index Methods Delegation', () => {
    it('should call all delegated methods on index object', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(log.listThemes()).toBeInstanceOf(Array);
      expect(log.hasTheme('dracula')).toBe(true);
      expect(log.getTheme('dracula')).toBeDefined();
      expect(log.getTransports()).toBeInstanceOf(Array);

      log.setLevel('debug');
      log.setMode('pretty');
      log.setTheme('dracula');
      log.toggleEmoji(true);
      log.setTimestampFormat('24h');

      log.trace('test trace');
      log.ready('test ready');
      log.start('test start');
      log.pause('test pause');
      log.fatal('test fatal');
      log.box('test box');

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Transports Color Mapping & Fallbacks', () => {
    it('should map Discord colors for fatal, ready, start, trace', async () => {
      const discord = new DiscordTransport({
        webhookUrl: 'https://discord.com/api/webhooks/mock',
        filter: { minLevel: 'trace' }
      });

      await discord.log({
        level: 'fatal',
        message: 'Fatal error',
        timestamp: new Date()
      });

      await discord.log({
        level: 'ready',
        message: 'Ready server',
        timestamp: new Date()
      });

      await discord.log({
        level: 'start',
        message: 'Starting task',
        timestamp: new Date()
      });

      await discord.log({
        level: 'trace',
        message: 'Trace step',
        timestamp: new Date()
      });

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should test HttpTransport with PUT and transform', async () => {
      const http = new HttpTransport({
        url: 'https://api.example.com/put-log',
        method: 'PUT',
        transform: (e) => ({ customMsg: e.message })
      });

      await http.log({
        level: 'info',
        message: 'Put log message',
        timestamp: new Date()
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/put-log',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('RotatingFileLogger Date and Size Rotation', () => {
    it('should handle datePattern rotation and file limits', () => {
      const mockStream = {
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn(),
        destroyed: false
      };
      const writeStreamSpy = vi.spyOn(fs, 'createWriteStream').mockReturnValue(mockStream as any);
      const statSpy = vi.spyOn(fs, 'statSync').mockReturnValue({ size: 10000 } as any);
      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation(() => {});
      const unlinkSpy = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      const rotating = new RotatingFileLogger('app.log', {
        maxSize: '100B',
        maxFiles: 3,
        datePattern: 'YYYY-MM-DD'
      });

      rotating.write({
        level: 'info',
        message: 'Message that triggers rotation',
        timestamp: new Date()
      });

      expect(mockStream.write).toHaveBeenCalled();

      writeStreamSpy.mockRestore();
      statSpy.mockRestore();
      existsSpy.mockRestore();
      renameSpy.mockRestore();
      unlinkSpy.mockRestore();
    });
  });
});
