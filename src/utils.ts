import { BetterLogsConfig, TimestampFormat } from './types';

export const LEVEL_WEIGHTS: Record<string, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  ready: 2,
  start: 2,
  success: 3,
  pause: 4,
  warn: 4,
  error: 5,
  fatal: 6,
  critical: 6,
  silent: 999
};

// Backward compatibility export
export const levelWeights = LEVEL_WEIGHTS;

export class EnvironmentDetector {
  static isNode(): boolean {
    return (
      typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    );
  }

  static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  static supportsEmoji(): boolean {
    if (this.isNode()) {
      if (process.env.NO_EMOJI === 'true' || process.env.NO_EMOJI === '1') {
        return false;
      }
      const isTTY = process.stdout?.isTTY;
      return isTTY !== false;
    }
    return true;
  }

  static supportsColor(): boolean {
    if (this.isNode()) {
      if (process.env.NO_COLOR != null && process.env.NO_COLOR !== '') {
        return false;
      }
      if (process.env.FORCE_COLOR != null && process.env.FORCE_COLOR !== '0') {
        return true;
      }
      if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
        return true;
      }
      return !!process.stdout?.isTTY;
    }
    return true;
  }
}

export class Colorizer {
  private static ANSI_RESET = '\x1b[0m';

  private static STANDARD_COLORS: Record<string, string> = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    grey: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    orange: '\x1b[38;5;208m',
    purple: '\x1b[38;2;128;0;128m',
    pink: '\x1b[38;2;255;192;203m',
    teal: '\x1b[38;2;0;128;128m',
    reset: '\x1b[0m'
  };

  private static STANDARD_BG_COLORS: Record<string, string> = {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    gray: '\x1b[100m',
    grey: '\x1b[100m',
    orange: '\x1b[48;5;208m',
    purple: '\x1b[48;2;128;0;128m',
    pink: '\x1b[48;2;255;192;203m',
    teal: '\x1b[48;2;0;128;128m',
    reset: '\x1b[0m'
  };

  static applyColor(text: string, color: string, isBackground = false): string {
    if (!EnvironmentDetector.isNode()) {
      return text;
    }

    if (!EnvironmentDetector.supportsColor()) {
      return text;
    }

    return this.applyNodeColor(text, color, isBackground);
  }

  static stripAnsi(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private static applyNodeColor(text: string, color: string, isBackground: boolean): string {
    if (!color) return text;

    const trimmed = color.trim().toLowerCase();

    // Check standard named colors
    const standardMap = isBackground ? this.STANDARD_BG_COLORS : this.STANDARD_COLORS;
    if (standardMap[trimmed]) {
      return `${standardMap[trimmed]}${text}${this.ANSI_RESET}`;
    }

    // Check hex codes (#RRGGBB or #RGB)
    const hexMatch =
      trimmed.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i) ||
      trimmed.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);

    if (hexMatch) {
      const r =
        hexMatch[1].length === 1
          ? parseInt(hexMatch[1] + hexMatch[1], 16)
          : parseInt(hexMatch[1], 16);
      const g =
        hexMatch[2].length === 1
          ? parseInt(hexMatch[2] + hexMatch[2], 16)
          : parseInt(hexMatch[2], 16);
      const b =
        hexMatch[3].length === 1
          ? parseInt(hexMatch[3] + hexMatch[3], 16)
          : parseInt(hexMatch[3], 16);

      const code = isBackground ? `\x1b[48;2;${r};${g};${b}m` : `\x1b[38;2;${r};${g};${b}m`;
      return `${code}${text}${this.ANSI_RESET}`;
    }

    // Check rgb(r, g, b)
    const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = Math.min(255, parseInt(rgbMatch[1], 10));
      const g = Math.min(255, parseInt(rgbMatch[2], 10));
      const b = Math.min(255, parseInt(rgbMatch[3], 10));

      const code = isBackground ? `\x1b[48;2;${r};${g};${b}m` : `\x1b[38;2;${r};${g};${b}m`;
      return `${code}${text}${this.ANSI_RESET}`;
    }

    return text;
  }
}

export function mergeConfigs(
  defaultConfig: BetterLogsConfig,
  userConfig: Partial<BetterLogsConfig>
): BetterLogsConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    level: userConfig.level ?? defaultConfig.level
  };
}

export function formatTime(date: Date, format: TimestampFormat): string {
  const hours =
    format === '12h' ? date.getHours() % 12 || 12 : date.getHours().toString().padStart(2, '0');

  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  if (format === '12h') {
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes}:${seconds} ${ampm}`;
  }

  return `${hours}:${minutes}:${seconds}`;
}

export function safeStringify(data: unknown, indent?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    data,
    (_key, value) => {
      if (typeof value === 'bigint') {
        return `${value.toString()}n`;
      }
      if (typeof value === 'symbol') {
        return value.toString();
      }
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
          cause: (value as Error & { cause?: unknown }).cause
        };
      }
      if (value instanceof Map) {
        return Object.fromEntries(value.entries());
      }
      if (value instanceof Set) {
        return Array.from(value.values());
      }
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    },
    indent
  );
}
