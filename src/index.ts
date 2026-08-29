import { BetterLogger } from './logger';
import { ConfigManager } from './config';
import { ThemeManager, builtInThemes } from './themes';
import {
  DiscordTransport,
  SlackTransport,
  TelegramTransport,
  HttpTransport,
  CallbackTransport
} from './transports';
import { FileLogger } from './fileLogger';
import { RotatingFileLogger } from './rotatingFileLogger';
import { Redactor, DEFAULT_REDACT_KEYS } from './redactor';
import { AsyncContextManager, defaultAsyncContext } from './asyncContext';
import { BoxDrawer } from './box';
import { createHttpMiddleware } from './middleware';
import { Formatter } from './formatter';
import { patchConsole, unpatchConsole } from './patchConsole';
import {
  Colorizer,
  EnvironmentDetector,
  formatTime,
  safeStringify,
  LEVEL_WEIGHTS,
  levelWeights,
  mergeConfigs
} from './utils';
import {
  BetterLogsConfig,
  Theme,
  LogLevel,
  LogLevelConfig,
  ThemeLevels,
  LogEntry,
  LogTransport,
  LogOptions,
  LogMeta,
  TransportFilter,
  DiscordTransportOptions,
  SlackTransportOptions,
  TelegramTransportOptions,
  HttpTransportOptions,
  ChildLoggerOptions,
  BoxOptions,
  ThrottleOptions,
  HttpMiddlewareOptions,
  RedactionOptions,
  FileRotationOptions,
  OutputMode,
  TimestampFormat
} from './types';

const themeManager = new ThemeManager();
const configManager = new ConfigManager(themeManager);
const baseLogger = new BetterLogger(configManager, themeManager);

const betterlogs = {
  info: baseLogger.info.bind(baseLogger),
  success: baseLogger.success.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  error: baseLogger.error.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),
  trace: baseLogger.trace.bind(baseLogger),
  ready: baseLogger.ready.bind(baseLogger),
  start: baseLogger.start.bind(baseLogger),
  pause: baseLogger.pause.bind(baseLogger),
  fatal: baseLogger.fatal.bind(baseLogger),

  label: baseLogger.withLabel.bind(baseLogger),
  withLabel: baseLogger.withLabel.bind(baseLogger),
  with: baseLogger.with.bind(baseLogger),
  child: baseLogger.child.bind(baseLogger),
  throttle: baseLogger.throttle.bind(baseLogger),
  sample: baseLogger.sample.bind(baseLogger),

  box: baseLogger.box.bind(baseLogger),
  runWithContext: baseLogger.runWithContext.bind(baseLogger),
  getContext: baseLogger.getContext.bind(baseLogger),
  httpMiddleware: baseLogger.httpMiddleware.bind(baseLogger),
  patchConsole: baseLogger.patchConsole.bind(baseLogger),
  unpatchConsole: baseLogger.unpatchConsole.bind(baseLogger),

  config: baseLogger.config.bind(baseLogger),
  getConfig: baseLogger.getConfig.bind(baseLogger),
  setLevel: (level: string) => baseLogger.setLevel(level as LogLevel),
  setMode: baseLogger.setMode.bind(baseLogger),
  setTheme: baseLogger.setTheme.bind(baseLogger),
  toggleEmoji: baseLogger.toggleEmoji.bind(baseLogger),
  setTimestampFormat: baseLogger.setTimestampFormat.bind(baseLogger),
  log: baseLogger.log.bind(baseLogger),
  silent: baseLogger.silent.bind(baseLogger),

  addLevel: (name: string, config: LogLevelConfig) => {
    baseLogger.addLevel(name, config);
    (
      betterlogs as unknown as Record<
        string,
        (messageOrError: string | Error, ...data: unknown[]) => void
      >
    )[name] = (messageOrError: string | Error, ...data: unknown[]) => {
      const loggerWithCustomMethod = baseLogger as unknown as Record<
        string,
        (msg: string | Error, ...d: unknown[]) => void
      >;
      loggerWithCustomMethod[name](messageOrError, ...data);
    };
  },

  group: baseLogger.group.bind(baseLogger),
  table: baseLogger.table.bind(baseLogger),
  time: baseLogger.time.bind(baseLogger),
  timeEnd: baseLogger.timeEnd.bind(baseLogger),
  timeLog: baseLogger.timeLog.bind(baseLogger),
  clearTimers: baseLogger.clearTimers.bind(baseLogger),
  file: baseLogger.file.bind(baseLogger),

  addTransport: baseLogger.addTransport.bind(baseLogger),
  removeTransport: baseLogger.removeTransport.bind(baseLogger),
  clearTransports: baseLogger.clearTransports.bind(baseLogger),
  getTransports: baseLogger.getTransports.bind(baseLogger),

  addTheme: (theme: Theme) => themeManager.registerTheme(theme),
  listThemes: () => themeManager.listThemes(),
  hasTheme: (name: string) => themeManager.hasTheme(name),
  deregisterTheme: (name: string) => themeManager.deregisterTheme(name),
  getTheme: (name: string) => themeManager.getTheme(name),

  close: baseLogger.close.bind(baseLogger),

  create: (config?: Partial<BetterLogsConfig>) => {
    const newConfigManager = new ConfigManager(themeManager, config);
    return new BetterLogger(newConfigManager, themeManager);
  }
};

export const log = betterlogs;
export default betterlogs;
export {
  betterlogs,
  BetterLogger,
  ConfigManager,
  ThemeManager,
  DiscordTransport,
  SlackTransport,
  TelegramTransport,
  HttpTransport,
  CallbackTransport,
  Formatter,
  FileLogger,
  RotatingFileLogger,
  Redactor,
  DEFAULT_REDACT_KEYS,
  AsyncContextManager,
  defaultAsyncContext,
  BoxDrawer,
  createHttpMiddleware,
  patchConsole,
  unpatchConsole,
  Colorizer,
  EnvironmentDetector,
  formatTime,
  safeStringify,
  builtInThemes,
  LEVEL_WEIGHTS,
  levelWeights,
  mergeConfigs
};

export type {
  BetterLogsConfig,
  Theme,
  ThemeLevels,
  LogLevel,
  LogLevelConfig,
  LogEntry,
  LogTransport,
  LogOptions,
  LogMeta,
  TransportFilter,
  DiscordTransportOptions,
  SlackTransportOptions,
  TelegramTransportOptions,
  HttpTransportOptions,
  ChildLoggerOptions,
  BoxOptions,
  ThrottleOptions,
  HttpMiddlewareOptions,
  RedactionOptions,
  FileRotationOptions,
  OutputMode,
  TimestampFormat
};
