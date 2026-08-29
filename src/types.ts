export interface LogLevelConfig {
  color: string;
  emoji: string;
  bgColor?: string;
}

export interface ThemeLevels {
  info: LogLevelConfig;
  success: LogLevelConfig;
  warn: LogLevelConfig;
  error: LogLevelConfig;
  debug: LogLevelConfig;
  ready?: LogLevelConfig;
  start?: LogLevelConfig;
  pause?: LogLevelConfig;
  fatal?: LogLevelConfig;
  trace?: LogLevelConfig;
  [key: string]: LogLevelConfig | undefined;
}

export interface Theme {
  name: string;
  levels: ThemeLevels;
  background?: string;
}

export type LogLevel =
  | 'trace'
  | 'debug'
  | 'info'
  | 'ready'
  | 'start'
  | 'success'
  | 'pause'
  | 'warn'
  | 'error'
  | 'fatal'
  | 'silent';

export type TimestampFormat = '12h' | '24h';

export type OutputMode = 'pretty' | 'json';

export interface RedactionOptions {
  paths?: string[];
  censor?: string | ((value: unknown, path: string) => unknown);
  enabled?: boolean;
}

export interface FileRotationOptions {
  maxSize?: string | number; // e.g. '10MB', '500KB', or number of bytes
  maxFiles?: number; // e.g. 5 (keeps last 5 files)
  datePattern?: string; // e.g. 'YYYY-MM-DD'
}

export interface BetterLogsConfig {
  showTimestamp: boolean;
  showEmoji: boolean;
  theme: string | Theme;
  level: LogLevel;
  mode: OutputMode;
  file?: string;
  rotation?: FileRotationOptions;
  redaction?: RedactionOptions;
  timestampFormat: TimestampFormat;
}

export interface LogOptions {
  discord?: boolean;
  slack?: boolean;
  telegram?: boolean;
  [key: string]: unknown;
}

export type LogMeta = LogOptions;

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  label?: string;
  data?: unknown[];
  meta?: LogOptions;
  error?: Error;
  context?: Record<string, unknown>;
}

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
  close?(): void | Promise<void>;
}

export interface TransportFilter {
  minLevel?: LogLevel | string;
  includeLevels?: string[];
  onlyLabels?: string[];
  contains?: string;
}

export interface DiscordTransportOptions {
  webhookUrl: string;
  filter?: TransportFilter;
  customCheck?: (entry: LogEntry) => boolean;
  username?: string;
  avatarUrl?: string;
}

export interface SlackTransportOptions {
  webhookUrl: string;
  filter?: TransportFilter;
  customCheck?: (entry: LogEntry) => boolean;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

export interface TelegramTransportOptions {
  botToken: string;
  chatId: string | number;
  filter?: TransportFilter;
  customCheck?: (entry: LogEntry) => boolean;
  parseMode?: 'Markdown' | 'HTML';
}

export interface HttpTransportOptions {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  filter?: TransportFilter;
  customCheck?: (entry: LogEntry) => boolean;
  transform?: (entry: LogEntry) => unknown;
}

export interface ChildLoggerOptions {
  label?: string;
  meta?: LogOptions;
  level?: LogLevel;
}

export interface BoxOptions {
  title?: string;
  borderColor?: string;
  borderStyle?: 'single' | 'double' | 'rounded' | 'bold';
  padding?: number;
  margin?: number;
}

export interface ThrottleOptions {
  limit?: number; // max logs allowed per window (default 1)
  windowMs?: number; // window duration in ms (default 1000)
}

export interface HttpMiddlewareOptions {
  autoLogging?: boolean;
  format?: (req: unknown, res: unknown, durationMs: number) => string;
  level?: LogLevel;
  ignoreUrls?: Array<string | RegExp>;
}
