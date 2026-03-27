import { LogEntry, LogLevel, BetterLogsConfig, LogTransport, LogOptions, Theme } from './types';
import { ConfigManager } from './config';
import { ThemeManager } from './themes';
import { Formatter } from './formatter';
import { FileLogger } from './fileLogger';
import { EnvironmentDetector } from './utils';

export class BetterLogger {
  private configManager: ConfigManager;
  private themeManager: ThemeManager;
  private fileLogger?: FileLogger;
  private labels: Map<string, BetterLogger> = new Map();
  private customLevels: Map<string, { color: string; emoji: string }> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private transports: LogTransport[] = [];
  private label?: string;
  private tempMeta?: LogOptions;

  constructor(
    configManager: ConfigManager,
    themeManager: ThemeManager,
    label?: string,
    meta?: LogOptions
  ) {
    this.configManager = configManager;
    this.themeManager = themeManager;
    this.label = label;
    this.tempMeta = meta;

    if (EnvironmentDetector.isNode() && this.configManager.getConfig().file) {
      this.fileLogger = new FileLogger(this.configManager.getConfig().file!);
    }
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  with(options: LogOptions): BetterLogger {
    const logger = new BetterLogger(this.configManager, this.themeManager, this.label, options);
    logger.transports = this.transports;
    logger.fileLogger = this.fileLogger;
    logger.customLevels = this.customLevels;
    return logger;
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
  error(message: string, ...data: unknown[]): void {
    this.writeLog('error', message, data);
  }
  debug(message: string, ...data: unknown[]): void {
    this.writeLog('debug', message, data);
  }

  withLabel(labelName: string): BetterLogger {
    if (!this.labels.has(labelName)) {
      const logger = new BetterLogger(this.configManager, this.themeManager, labelName);
      logger.transports = this.transports;
      logger.fileLogger = this.fileLogger;
      logger.customLevels = this.customLevels;
      this.labels.set(labelName, logger);
    }
    return this.labels.get(labelName)!;
  }

  config(newConfig: Partial<BetterLogsConfig>): void {
    this.configManager.updateConfig(newConfig);
  }

  setLevel(level: LogLevel): void {
    this.configManager.updateConfig({ level });
  }

  setMode(mode: 'pretty' | 'json'): void {
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

  setTimestampFormat(format: '12h' | '24h'): void {
    this.configManager.updateConfig({ timestampFormat: format });
  }

  log(level: string, message: string, ...data: unknown[]): void {
    this.writeLog(level, message, data);
  }

  silent(message?: string, ...data: unknown[]): void {
    if (!message) {
      return;
    }
    this.writeLog('silent', message, data);
  }

  addLevel(name: string, config: { color: string; emoji: string }): void {
    this.customLevels.set(name, config);

    const currentTheme = this.configManager.getCurrentTheme();
    if (!currentTheme.levels[name]) {
      currentTheme.levels[name] = config;
    }

    (this as any)[name] = (message: string, ...data: unknown[]) => {
      this.writeLog(name, message, data);
    };
  }

  group(name: string): BetterLogger {
    return this.withLabel(name);
  }

  removeTransport(transport: LogTransport): boolean {
    const index = this.transports.indexOf(transport);
    if (index !== -1) {
      this.transports.splice(index, 1);
      return true;
    }
    return false;
  }

  clearTransports(): void {
    this.transports = [];
  }

  timeLog(label: string): void {
    const startTime = this.activeTimers.get(label);
    if (!startTime) {
      this.info(`Timer '${label}' has not been started`);
      return;
    }

    const duration = Date.now() - startTime;
    this.info(`Timer '${label}': ${duration}ms`);
    this.activeTimers.set(label, Date.now());
  }

  clearTimers(): void {
    this.activeTimers.clear();
  }

  table(data: unknown[] | object): void {
    if (console.table) {
      console.table(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  time(label: string): void {
    this.activeTimers.set(label, Date.now());
  }

  timeEnd(label: string): void {
    const startTime = this.activeTimers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info(`Timer '${label}': ${duration}ms`);
      this.activeTimers.delete(label);
    }
  }

  file(filePath: string): void {
    if (EnvironmentDetector.isNode()) {
      this.configManager.updateConfig({ file: filePath });
      this.fileLogger = new FileLogger(filePath);
    } else {
      console.warn('File logging is only available in Node.js environment');
    }
  }

  private writeLog(level: string, message: string, data: unknown[]): void {
    if (level === 'silent') {
      return;
    }

    const levelToCheck = this.customLevels.has(level) ? 'debug' : level;

    if (!this.configManager.shouldLog(levelToCheck as LogLevel)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      label: this.label,
      data: data.length > 0 ? data : undefined,
      meta: this.tempMeta
    };

    const config = this.configManager.getConfig();
    const theme = this.configManager.getCurrentTheme();

    if (!theme.levels[level] && this.customLevels.has(level)) {
      theme.levels[level] = this.customLevels.get(level)!;
    }

    const formattedMessage = Formatter.format(entry, config, theme);

    this.outputToConsole(level, formattedMessage, data);

    if (this.fileLogger) {
      this.fileLogger.write(entry);
    }

    this.transports.forEach((transport) => {
      transport.log(entry)?.catch((err) => console.error('Transport error:', err));
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
      case 'error':
        return console.error;
      case 'warn':
        return console.warn;
      case 'debug':
        return console.debug;
      default:
        return console.log;
    }
  }
}
