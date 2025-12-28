export interface LogLevelConfig {
  color: string;
  emoji: string;
  bgColor?: string;
}

export interface Theme {
  name: string;
  levels: {
    info: LogLevelConfig;
    success: LogLevelConfig;
    warn: LogLevelConfig;
    error: LogLevelConfig;
    debug: LogLevelConfig;
    [key: string]: LogLevelConfig;
  };
  background?: string;
}

export interface BetterLogsConfig {
  showTimestamp: boolean;
  showEmoji: boolean;
  theme: string | Theme;
  level: LogLevel;
  mode: 'pretty' | 'json';
  file?: string;
  timestampFormat: '12h' | '24h';
}

export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error' | 'silent';

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  label?: string;
  data?: unknown[];
}

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
}

export interface DiscordTransportOptions {
  webhookUrl: string;
  level?: LogLevel;
  allowedLabels?: string[];
  filter?: (entry: LogEntry) => boolean;
}
export interface LogOptions {
  discord?: boolean;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  label?: string;
  data?: unknown[];
  meta?: LogOptions;
}
