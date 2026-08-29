import { LogEntry, BetterLogsConfig, Theme, LogLevelConfig } from './types';
import { Colorizer, formatTime, safeStringify } from './utils';
import { Redactor } from './redactor';

export class Formatter {
  static formatPretty(entry: LogEntry, config: BetterLogsConfig, theme: Theme): string {
    const parts: string[] = [];

    const levelConfig: LogLevelConfig = theme.levels[entry.level] ||
      theme.levels.info || { color: 'white', emoji: '💡' };

    // 1. Timestamp
    if (config.showTimestamp) {
      const timestamp = formatTime(entry.timestamp, config.timestampFormat);
      const coloredTimestamp = Colorizer.applyColor(`[${timestamp}]`, 'gray');
      parts.push(coloredTimestamp);
    }

    // 2. Emoji
    if (config.showEmoji && levelConfig.emoji) {
      parts.push(levelConfig.emoji);
    }

    // 3. Level badge
    const levelStr = entry.level.toUpperCase();
    const coloredLevel = Colorizer.applyColor(levelStr, levelConfig.color, false);
    parts.push(coloredLevel);

    // 4. Label badge
    if (entry.label) {
      const labelStr = `[${entry.label}]`;
      const coloredLabel = Colorizer.applyColor(labelStr, 'gray');
      parts.push(coloredLabel);
    }

    // 5. Context badge if present
    if (entry.context && entry.context.requestId) {
      const reqStr = `[${entry.context.requestId}]`;
      const coloredReq = Colorizer.applyColor(reqStr, 'magenta');
      parts.push(coloredReq);
    }

    // 6. Message
    parts.push(entry.message);

    let output = parts.join(' ');

    // 7. Error details if error was logged
    if (entry.error && entry.error instanceof Error) {
      const errorStack = entry.error.stack || `${entry.error.name}: ${entry.error.message}`;
      output += '\n' + Colorizer.applyColor(errorStack, 'red');
    }

    return output;
  }

  static formatJson(entry: LogEntry, config?: BetterLogsConfig): string {
    const redactor = new Redactor(config?.redaction);

    const jsonEntry: Record<string, unknown> = {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp.toISOString()
    };

    if (entry.label !== undefined) {
      jsonEntry.label = entry.label;
    }

    if (entry.context !== undefined && Object.keys(entry.context).length > 0) {
      jsonEntry.context = redactor.redact(entry.context);
    }

    if (entry.meta !== undefined && Object.keys(entry.meta).length > 0) {
      jsonEntry.meta = redactor.redact(entry.meta);
    }

    if (entry.data !== undefined && entry.data.length > 0) {
      jsonEntry.data = redactor.redact(entry.data);
    }

    if (entry.error !== undefined) {
      jsonEntry.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
        cause: (entry.error as Error & { cause?: unknown }).cause
      };
    }

    return safeStringify(jsonEntry);
  }

  static format(entry: LogEntry, config: BetterLogsConfig, theme: Theme): string {
    if (config.mode === 'json') {
      return this.formatJson(entry, config);
    }
    return this.formatPretty(entry, config, theme);
  }
}
