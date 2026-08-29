import {
  LogEntry,
  LogLevel,
  BetterLogsConfig,
  LogTransport,
  LogOptions,
  Theme,
  LogLevelConfig,
  OutputMode,
  TimestampFormat,
  ChildLoggerOptions,
  BoxOptions,
  ThrottleOptions,
  HttpMiddlewareOptions
} from './types';
import { ConfigManager } from './config';
import { ThemeManager } from './themes';
import { Formatter } from './formatter';
import { FileLogger } from './fileLogger';
import { RotatingFileLogger } from './rotatingFileLogger';
import { BoxDrawer } from './box';
import { Redactor } from './redactor';
import { defaultAsyncContext } from './asyncContext';
import { createHttpMiddleware } from './middleware';
import { patchConsole, unpatchConsole } from './patchConsole';
import { EnvironmentDetector } from './utils';

export class BetterLogger {
  private configManager: ConfigManager;
  private themeManager: ThemeManager;
  private fileLogger?: FileLogger | RotatingFileLogger;
  private labels: Map<string, BetterLogger> = new Map();
  private customLevels: Map<string, LogLevelConfig> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private transports: LogTransport[] = [];
  private label?: string;
  private meta?: LogOptions;
  private throttleOptions?: ThrottleOptions;
  private sampleRate?: number;
  private throttleTimestamps: Map<string, number[]> = new Map();

  constructor(
    configManager: ConfigManager,
    themeManager: ThemeManager,
    label?: string,
    meta?: LogOptions
  ) {
    this.configManager = configManager;
    this.themeManager = themeManager;
    this.label = label;
    this.meta = meta ? { ...meta } : undefined;

    this.setupFileLogger();
  }

  private setupFileLogger(): void {
    const currentConfig = this.configManager.getConfig();
    if (EnvironmentDetector.isNode() && currentConfig.file) {
      if (currentConfig.rotation) {
        this.fileLogger = new RotatingFileLogger(currentConfig.file, currentConfig.rotation);
      } else {
        this.fileLogger = new FileLogger(currentConfig.file);
      }
    }
  }

  /**
   * Add a transport destination for log entries.
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a registered transport destination.
   */
  removeTransport(transport: LogTransport): boolean {
    const index = this.transports.indexOf(transport);
    if (index !== -1) {
      this.transports.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all registered transports.
   */
  clearTransports(): void {
    this.transports = [];
  }

  /**
   * Returns a copy of all active transports.
   */
  getTransports(): LogTransport[] {
    return [...this.transports];
  }

  /**
   * Create a scoped child logger with metadata or transport options.
   */
  with(options: LogOptions): BetterLogger {
    const mergedMeta = {
      ...(this.meta || {}),
      ...options
    };
    const child = new BetterLogger(this.configManager, this.themeManager, this.label, mergedMeta);
    child.transports = this.transports;
    child.fileLogger = this.fileLogger;
    child.customLevels = this.customLevels;
    return child;
  }

  /**
   * Create a child logger with a dedicated label or options.
   */
  child(options: ChildLoggerOptions | string): BetterLogger {
    if (typeof options === 'string') {
      return this.withLabel(options);
    }

    const mergedMeta = {
      ...(this.meta || {}),
      ...(options.meta || {})
    };

    let configManager = this.configManager;
    if (options.level) {
      configManager = new ConfigManager(this.themeManager, {
        ...this.configManager.getConfig(),
        level: options.level
      });
    }

    const child = new BetterLogger(
      configManager,
      this.themeManager,
      options.label || this.label,
      mergedMeta
    );
    child.transports = this.transports;
    child.fileLogger = this.fileLogger;
    child.customLevels = this.customLevels;
    return child;
  }

  /**
   * Create a rate-limited/throttled logger wrapper to avoid flooding logs.
   */
  throttle(options: ThrottleOptions = { limit: 1, windowMs: 1000 }): BetterLogger {
    const child = this.child({});
    child.throttleOptions = options;
    return child;
  }

  /**
   * Create a sampled logger (e.g. 0.1 for 10% sampling) for high-throughput loops.
   */
  sample(rate: number): BetterLogger {
    const child = this.child({});
    child.sampleRate = Math.max(0, Math.min(1, rate));
    return child;
  }

  /**
   * Run an asynchronous function with request-level context (requestId, userId, etc.).
   */
  runWithContext<R>(context: Record<string, unknown>, fn: () => R): R {
    return defaultAsyncContext.run(context, fn);
  }

  /**
   * Retrieve active async context if available.
   */
  getContext(): Record<string, unknown> | undefined {
    return defaultAsyncContext.getContext();
  }

  /**
   * Create Express / Connect / Node.js HTTP request logging middleware.
   */
  httpMiddleware(options: HttpMiddlewareOptions = {}) {
    return createHttpMiddleware(this, options);
  }

  /**
   * Intercept standard global console methods (console.log, console.error, etc.).
   */
  patchConsole(): void {
    patchConsole(this);
  }

  /**
   * Restore original global console methods.
   */
  unpatchConsole(): void {
    unpatchConsole();
  }

  /**
   * Render a stylish Unicode border box around text.
   */
  box(text: string, options?: BoxOptions): void {
    const boxedText = BoxDrawer.draw(text, options);
    console.log(boxedText);
  }

  /**
   * Create or retrieve a labeled sub-logger.
   */
  withLabel(labelName: string): BetterLogger {
    if (!this.labels.has(labelName)) {
      const logger = new BetterLogger(this.configManager, this.themeManager, labelName, this.meta);
      logger.transports = this.transports;
      logger.fileLogger = this.fileLogger;
      logger.customLevels = this.customLevels;
      this.labels.set(labelName, logger);
    }
    return this.labels.get(labelName)!;
  }

  /**
   * Alias for `withLabel(name)`.
   */
  group(name: string): BetterLogger {
    return this.withLabel(name);
  }

  info(message: string, ...data: unknown[]): void {
    this.writeLog('info', message, data);
  }

  success(message: string, ...data: unknown[]): void {
    this.writeLog('success', message, data);
  }

  warn(message: string, ...data: unknown[]): void {
    this.writeLog('warn', message, data);
  }

  error(messageOrError: string | Error, ...data: unknown[]): void {
    this.writeLog('error', messageOrError, data);
  }

  debug(message: string, ...data: unknown[]): void {
    this.writeLog('debug', message, data);
  }

  trace(message: string, ...data: unknown[]): void {
    this.writeLog('trace', message, data);
  }

  ready(message: string, ...data: unknown[]): void {
    this.writeLog('ready', message, data);
  }

  start(message: string, ...data: unknown[]): void {
    this.writeLog('start', message, data);
  }

  pause(message: string, ...data: unknown[]): void {
    this.writeLog('pause', message, data);
  }

  fatal(messageOrError: string | Error, ...data: unknown[]): void {
    this.writeLog('fatal', messageOrError, data);
  }

  log(level: string, messageOrError: string | Error, ...data: unknown[]): void {
    this.writeLog(level, messageOrError, data);
  }

  silent(message?: string, ...data: unknown[]): void {
    if (!message) {
      return;
    }
    this.writeLog('silent', message, data);
  }

  config(newConfig: Partial<BetterLogsConfig>): void {
    this.configManager.updateConfig(newConfig);
    if (newConfig.file || newConfig.rotation) {
      this.setupFileLogger();
    }
  }

  getConfig(): BetterLogsConfig {
    return this.configManager.getConfig();
  }

  setLevel(level: LogLevel): void {
    this.configManager.updateConfig({ level });
  }

  setMode(mode: OutputMode): void {
    this.configManager.updateConfig({ mode });
  }

  setTheme(theme: string | Theme): void {
    if (typeof theme === 'object') {
      this.themeManager.registerTheme(theme);
      this.configManager.updateConfig({ theme: theme.name });
    } else {
      this.configManager.updateConfig({ theme });
    }
  }

  toggleEmoji(enabled = true): void {
    this.configManager.updateConfig({ showEmoji: enabled });
  }

  setTimestampFormat(format: TimestampFormat): void {
    this.configManager.updateConfig({ timestampFormat: format });
  }

  file(filePath: string, rotation?: import('./types').FileRotationOptions): void {
    if (EnvironmentDetector.isNode()) {
      this.configManager.updateConfig({ file: filePath, rotation });
      this.setupFileLogger();
    } else {
      console.warn('File logging is only available in Node.js environment');
    }
  }

  addLevel(name: string, config: LogLevelConfig): void {
    this.customLevels.set(name, config);

    const currentTheme = this.configManager.getCurrentTheme();
    if (!currentTheme.levels[name]) {
      currentTheme.levels[name] = config;
    }

    (
      this as unknown as Record<
        string,
        (messageOrError: string | Error, ...data: unknown[]) => void
      >
    )[name] = (messageOrError: string | Error, ...data: unknown[]) => {
      this.writeLog(name, messageOrError, data);
    };
  }

  time(label: string): void {
    this.activeTimers.set(label, Date.now());
  }

  timeLog(label: string): number | undefined {
    const startTime = this.activeTimers.get(label);
    if (startTime === undefined) {
      this.info(`Timer '${label}' has not been started`);
      return undefined;
    }

    const duration = Date.now() - startTime;
    this.info(`Timer '${label}': ${duration}ms`);
    return duration;
  }

  timeEnd(label: string): number | undefined {
    const startTime = this.activeTimers.get(label);
    if (startTime === undefined) {
      this.info(`Timer '${label}' has not been started`);
      return undefined;
    }

    const duration = Date.now() - startTime;
    this.info(`Timer '${label}': ${duration}ms`);
    this.activeTimers.delete(label);
    return duration;
  }

  clearTimers(): void {
    this.activeTimers.clear();
  }

  table(data: unknown[] | object): void {
    if (typeof console.table === 'function') {
      console.table(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Flush and close open resources (file handles, transports).
   */
  async close(): Promise<void> {
    if (this.fileLogger) {
      await this.fileLogger.close();
    }
    for (const transport of this.transports) {
      if (typeof transport.close === 'function') {
        await transport.close();
      }
    }
  }

  private writeLog(level: string, messageOrError: string | Error, data: unknown[]): void {
    if (level === 'silent') {
      return;
    }

    // Check sample rate
    if (this.sampleRate !== undefined && Math.random() > this.sampleRate) {
      return;
    }

    // Check throttle limit
    if (this.throttleOptions) {
      const now = Date.now();
      const windowMs = this.throttleOptions.windowMs || 1000;
      const limit = this.throttleOptions.limit || 1;
      const key = `${level}:${String(messageOrError)}`;

      let timestamps = this.throttleTimestamps.get(key) || [];
      timestamps = timestamps.filter((ts) => now - ts < windowMs);

      if (timestamps.length >= limit) {
        return; // throttled
      }

      timestamps.push(now);
      this.throttleTimestamps.set(key, timestamps);
    }

    const levelToCheck = this.customLevels.has(level) ? 'debug' : level;

    if (!this.configManager.shouldLog(levelToCheck as LogLevel)) {
      return;
    }

    let message = '';
    let errorObj: Error | undefined;

    if (messageOrError instanceof Error) {
      message = messageOrError.message;
      errorObj = messageOrError;
    } else {
      message = String(messageOrError);
      if (data.length > 0 && data[0] instanceof Error) {
        errorObj = data[0];
      }
    }

    const config = this.configManager.getConfig();
    const redactor = new Redactor(config.redaction);

    const redactedData = data.length > 0 ? (redactor.redact(data) as unknown[]) : undefined;
    const asyncCtx = defaultAsyncContext.getContext();

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      label: this.label,
      data: redactedData,
      meta: this.meta ? (redactor.redact(this.meta) as LogOptions) : undefined,
      context: asyncCtx ? (redactor.redact(asyncCtx) as Record<string, unknown>) : undefined,
      error: errorObj
    };

    const theme = this.configManager.getCurrentTheme();

    if (!theme.levels[level] && this.customLevels.has(level)) {
      theme.levels[level] = this.customLevels.get(level)!;
    }

    const formattedMessage = Formatter.format(entry, config, theme);

    this.outputToConsole(level, formattedMessage, redactedData || []);

    if (this.fileLogger) {
      this.fileLogger.write(entry);
    }

    this.transports.forEach((transport) => {
      try {
        const res = transport.log(entry);
        if (res && typeof res.catch === 'function') {
          res.catch((err) => console.error('Transport error:', err));
        }
      } catch (err) {
        console.error('Transport synchronous error:', err);
      }
    });
  }

  private outputToConsole(level: string, formattedMessage: string, data: unknown[]): void {
    const consoleMethod = this.getConsoleMethod(level);

    if (data.length > 0) {
      consoleMethod(formattedMessage, ...data);
    } else {
      consoleMethod(formattedMessage);
    }
  }

  private getConsoleMethod(level: string): (...args: unknown[]) => void {
    switch (level) {
      case 'fatal':
      case 'critical':
      case 'error':
        return console.error;
      case 'pause':
      case 'warn':
        return console.warn;
      case 'trace':
      case 'debug':
        return console.debug;
      default:
        return console.log;
    }
  }
}
