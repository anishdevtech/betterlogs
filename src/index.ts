import { BetterLogger } from './logger';
import { ConfigManager } from './config';
import { ThemeManager } from './themes';
import { BetterLogsConfig, Theme } from './types';

// Create singleton instances
const themeManager = new ThemeManager();
const configManager = new ConfigManager(themeManager);
const baseLogger = new BetterLogger(configManager, themeManager);

// Define the betterlogs interface
interface BetterLogsInstance {
  // Core logging methods
  info: (message: string, ...data: unknown[]) => void;
  success: (message: string, ...data: unknown[]) => void;
  warn: (message: string, ...data: unknown[]) => void;
  error: (message: string, ...data: unknown[]) => void;
  debug: (message: string, ...data: unknown[]) => void;
  
  // Label system
  label: (labelName: string) => BetterLogger;
  
  // Configuration
  config: (newConfig: Partial<BetterLogsConfig>) => void;
  setLevel: (level: string) => void;
  setMode: (mode: 'pretty' | 'json') => void;
  
  // Advanced features
  addLevel: (name: string, config: { color: string; emoji: string }) => void;
  group: (name: string) => BetterLogger;
  table: (data: unknown[] | object) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  file: (filePath: string) => void;
  
  // Theme management
  addTheme: (theme: Theme) => void;
  
  // Create new instance
  create: (config?: Partial<BetterLogsConfig>) => BetterLogger;
  
  // Allow custom levels with index signature
  [key: string]: ((message: string, ...data: unknown[]) => void) | unknown;
}

// Create the betterlogs object with ALL methods
const betterlogs: BetterLogsInstance = {
  // Core logging methods
  info: baseLogger.info.bind(baseLogger),
  success: baseLogger.success.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  error: baseLogger.error.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),
  
  // Label system
  label: baseLogger.withLabel.bind(baseLogger),
  
  // Configuration
  config: baseLogger.config.bind(baseLogger),
  setLevel: baseLogger.setLevel.bind(baseLogger),
  setMode: baseLogger.setMode.bind(baseLogger),
  
  // Advanced features
  addLevel: (name: string, config: { color: string; emoji: string }) => {
    baseLogger.addLevel(name, config);
    // Add the custom level method to betterlogs object
    betterlogs[name] = (message: string, ...data: unknown[]) => {
      const customLogger = baseLogger as Record<string, (message: string, ...data: unknown[]) => void>;
      customLogger[name](message, ...data);
    };
  },
  group: baseLogger.group.bind(baseLogger),
  table: baseLogger.table.bind(baseLogger),
  time: baseLogger.time.bind(baseLogger),
  timeEnd: baseLogger.timeEnd.bind(baseLogger),
  file: baseLogger.file.bind(baseLogger),
  
  // Theme management
  addTheme: (theme: Theme) => themeManager.registerTheme(theme),
  
  // Create new instance
  create: (config?: Partial<BetterLogsConfig>) => {
    const newConfigManager = new ConfigManager(themeManager);
    if (config) {
      newConfigManager.updateConfig(config);
    }
    return new BetterLogger(newConfigManager, themeManager);
  }
};

// Export the main logger instance as default
export default betterlogs;

// Named exports for advanced usage
export { BetterLogger, ConfigManager, ThemeManager };
export type { BetterLogsConfig, Theme };

// Also export the betterlogs object for backward compatibility
export { betterlogs };