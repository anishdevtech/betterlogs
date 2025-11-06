import { LogEntry, BetterLogsConfig } from "./types";
import { Colorizer, formatTime, EnvironmentDetector } from "./utils";
import { Theme } from "./types";
export class Formatter {
   static formatPretty(entry: LogEntry, config: BetterLogsConfig, theme: Theme): string {
    const parts: string[] = [];
    
    // Timestamp
    if (config.showTimestamp) {
        const timestamp = formatTime(entry.timestamp, config.timestampFormat);
        parts.push(`[${timestamp}]`);
    }
    
    // Emoji - FIXED: Always check config.showEmoji first
    if (config.showEmoji) {
        const levelConfig = theme.levels[entry.level] || theme.levels.info;
        parts.push(levelConfig.emoji);
    }
    
    // Level with color
    const levelConfig = theme.levels[entry.level] || theme.levels.info;
    const levelStr = entry.level.toUpperCase();
    const coloredLevel = Colorizer.applyColor(levelStr, levelConfig.color);
    parts.push(coloredLevel);
    
    // Label
    if (entry.label) {
        const labelStr = `[${entry.label}]`;
        const coloredLabel = Colorizer.applyColor(labelStr, 'gray');
        parts.push(coloredLabel);
    }
    
    // Message
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

        return JSON.stringify(jsonEntry);
    }

    static format(
        entry: LogEntry,
        config: BetterLogsConfig,
        theme: Theme
    ): string {
        if (config.mode === "json") {
            return this.formatJson(entry);
        }
        return this.formatPretty(entry, config, theme);
    }
}
