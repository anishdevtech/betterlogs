import { BetterLogger } from './logger';
import { ConfigManager } from './config';
import { ThemeManager } from './themes';
import { DiscordTransport } from './transports'; // <--- Added missing import
import { BetterLogsConfig, Theme, LogLevel } from './types';

const themeManager = new ThemeManager();
const configManager = new ConfigManager(themeManager);
const baseLogger = new BetterLogger(configManager, themeManager);

const betterlogs = {
  info: baseLogger.info.bind(baseLogger),
  success: baseLogger.success.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  error: baseLogger.error.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),

  label: baseLogger.withLabel.bind(baseLogger),
  with: baseLogger.with.bind(baseLogger),

  config: baseLogger.config.bind(baseLogger),
  setLevel: (level: string) => baseLogger.setLevel(level as LogLevel),
  setMode: baseLogger.setMode.bind(baseLogger),
  setTheme: baseLogger.setTheme.bind(baseLogger),
  toggleEmoji: baseLogger.toggleEmoji.bind(baseLogger),
  setTimestampFormat: baseLogger.setTimestampFormat.bind(baseLogger),
  log: baseLogger.log.bind(baseLogger),
  silent: baseLogger.silent.bind(baseLogger),

  addLevel: (name: string, config: { color: string; emoji: string }) => {
    baseLogger.addLevel(name, config);
    (betterlogs as any)[name] = (message: string, ...data: unknown[]) => {
      const loggerWithCustomMethod = baseLogger as any;
      loggerWithCustomMethod[name](message, ...data);
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

  addTheme: (theme: Theme) => themeManager.registerTheme(theme),
  listThemes: () => themeManager.listThemes(),
  deregisterTheme: (name: string) => themeManager.deregisterTheme(name),

  create: (config?: Partial<BetterLogsConfig>) => {
    const newConfigManager = new ConfigManager(themeManager);
    if (config) {
      newConfigManager.updateConfig(config);
    }
    return new BetterLogger(newConfigManager, themeManager);
  }
};

export default betterlogs;
export { BetterLogger, ConfigManager, ThemeManager, DiscordTransport }; 
export type { BetterLogsConfig, Theme };
export { betterlogs };
