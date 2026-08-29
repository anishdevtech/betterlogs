import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  EnvironmentDetector,
  Colorizer,
  formatTime,
  safeStringify,
  LEVEL_WEIGHTS,
  mergeConfigs
} from '../src/utils';
import { defaultConfig } from '../src/config';

describe('Utils', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('EnvironmentDetector', () => {
    it('should detect Node environment', () => {
      expect(EnvironmentDetector.isNode()).toBe(true);
    });

    it('should detect browser environment correctly in node', () => {
      expect(EnvironmentDetector.isBrowser()).toBe(false);
    });

    it('should respect NO_EMOJI environment variable', () => {
      process.env.NO_EMOJI = 'true';
      expect(EnvironmentDetector.supportsEmoji()).toBe(false);

      delete process.env.NO_EMOJI;
      expect(EnvironmentDetector.supportsEmoji()).toBe(true);
    });

    it('should respect NO_COLOR environment variable', () => {
      process.env.NO_COLOR = '1';
      expect(EnvironmentDetector.supportsColor()).toBe(false);

      delete process.env.NO_COLOR;
      expect(EnvironmentDetector.supportsColor()).toBe(true);
    });
  });

  describe('Colorizer', () => {
    it('should apply standard ANSI codes in Node', () => {
      const result = Colorizer.applyColor('test', 'red');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('test');
      expect(result).toContain('\x1b[0m');
    });

    it('should apply 24-bit TrueColor for 6-digit hex colors', () => {
      const result = Colorizer.applyColor('neon', '#00FFFF');
      expect(result).toContain('\x1b[38;2;0;255;255m');
      expect(result).toContain('neon');
      expect(result).toContain('\x1b[0m');
    });

    it('should apply 24-bit TrueColor for 3-digit hex colors', () => {
      const result = Colorizer.applyColor('shortHex', '#F00');
      expect(result).toContain('\x1b[38;2;255;0;0m');
    });

    it('should apply 24-bit TrueColor for rgb() colors', () => {
      const result = Colorizer.applyColor('rgbText', 'rgb(120, 200, 50)');
      expect(result).toContain('\x1b[38;2;120;200;50m');
    });

    it('should apply background colors correctly', () => {
      const result = Colorizer.applyColor('bgText', '#112233', true);
      expect(result).toContain('\x1b[48;2;17;34;51m');
    });

    it('should return raw text if color is not found/invalid', () => {
      const result = Colorizer.applyColor('test', 'unknownColor');
      expect(result).toBe('test');
    });

    it('should strip ANSI escape codes cleanly', () => {
      const colored = Colorizer.applyColor('hello', 'green');
      expect(Colorizer.stripAnsi(colored)).toBe('hello');
    });

    it('should return plain text when NO_COLOR is enabled', () => {
      process.env.NO_COLOR = 'true';
      const result = Colorizer.applyColor('plain', 'red');
      expect(result).toBe('plain');
    });
  });

  describe('formatTime', () => {
    const date = new Date('2023-01-01T15:30:45');

    it('should format 24h correctly', () => {
      expect(formatTime(date, '24h')).toBe('15:30:45');
    });

    it('should format 12h correctly', () => {
      expect(formatTime(date, '12h')).toBe('3:30:45 PM');
    });
  });

  describe('safeStringify', () => {
    it('should stringify simple objects', () => {
      const obj = { a: 1 };
      expect(safeStringify(obj)).toBe('{"a":1}');
    });

    it('should handle circular references without throwing', () => {
      const obj: any = { name: 'circular' };
      obj.self = obj;

      const result = safeStringify(obj);
      expect(result).toContain('"self":"[Circular]"');
      expect(result).toContain('"name":"circular"');
    });

    it('should serialize BigInt without throwing', () => {
      const data = { count: BigInt(9007199254740991) };
      const result = safeStringify(data);
      expect(result).toContain('"count":"9007199254740991n"');
    });

    it('should serialize Error objects with details', () => {
      const err = new Error('Database connection failed');
      const result = safeStringify(err);
      expect(result).toContain('"message":"Database connection failed"');
      expect(result).toContain('"name":"Error"');
      expect(result).toContain('"stack":');
    });

    it('should serialize Map and Set instances', () => {
      const map = new Map<string, number>([['key1', 42]]);
      const set = new Set<string>(['item1', 'item2']);
      const result = safeStringify({ map, set });
      expect(result).toContain('"map":{"key1":42}');
      expect(result).toContain('"set":["item1","item2"]');
    });

    it('should serialize Symbols', () => {
      const sym = Symbol('testSym');
      const result = safeStringify({ symbol: sym });
      expect(result).toContain('"symbol":"Symbol(testSym)"');
    });
  });

  describe('LEVEL_WEIGHTS and mergeConfigs', () => {
    it('should define consistent log weights', () => {
      expect(LEVEL_WEIGHTS.debug).toBeLessThan(LEVEL_WEIGHTS.info);
      expect(LEVEL_WEIGHTS.info).toBeLessThan(LEVEL_WEIGHTS.success);
      expect(LEVEL_WEIGHTS.success).toBeLessThan(LEVEL_WEIGHTS.warn);
      expect(LEVEL_WEIGHTS.warn).toBeLessThan(LEVEL_WEIGHTS.error);
      expect(LEVEL_WEIGHTS.error).toBeLessThan(LEVEL_WEIGHTS.critical);
    });

    it('should merge configs properly', () => {
      const merged = mergeConfigs(defaultConfig, { level: 'error', showEmoji: false });
      expect(merged.level).toBe('error');
      expect(merged.showEmoji).toBe(false);
      expect(merged.theme).toBe('dark');
    });
  });
});
