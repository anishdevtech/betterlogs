import { LogEntry, BetterLogsConfig, Theme } from './types';
import { Colorizer, formatTime, safeStringify } from './utils';

export class Formatter {
  static formatPretty(entry: LogEntry, config: BetterLogsConfig, theme: Theme): string {
    const parts: string[] = [];

    if (config.showTimestamp) {
      const timestamp = formatTime(entry.timestamp, config.timestampFormat);
      parts.push(`[${timestamp}]`);
    }

    if (config.showEmoji) {
      const levelConfig = theme.levels[entry.level] || theme.levels.info;
      parts.push(levelConfig.emoji);
    }

    const levelConfig = theme.levels[entry.level] || theme.levels.info;
    const levelStr = entry.level.toUpperCase();
    const coloredLevel = Colorizer.applyColor(levelStr, levelConfig.color);
    parts.push(coloredLevel);

    if (entry.label) {
      const labelStr = `[${entry.label}]`;
      const coloredLabel = Colorizer.applyColor(labelStr, 'gray');
      parts.push(coloredLabel);
    }

    parts.push(entry.message);

    return parts.join(' ');
  }

  static formatJson(entry: LogEntry): string {
    const jsonEntry = {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp.toISOString(),
      label: entry.label,
      ...(entry.data && entry.data.length > 0 ? { data: entry.data } : {})
    };

    return safeStringify(jsonEntry);
  }

  static format(entry: LogEntry, config: BetterLogsConfig, theme: Theme): string {
    if (config.mode === 'json') {
      return this.formatJson(entry);
    }
    return this.formatPretty(entry, config, theme);
  }
}
