import { BetterLogger } from './logger';
import { ConfigManager } from './config';
import { ThemeManager } from './themes';
import { BetterLogsConfig, Theme } from './types';

// Create singleton instances
const themeManager = new ThemeManager();
const configManager = new ConfigManager(themeManager);
const baseLogger = new BetterLogger(configManager, themeManager);

// Create the betterlogs object with ALL methods
const betterlogs = {
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
    // Use proper typing instead of 'any'
    (betterlogs as Record<string, (message: string, ...data: unknown[]) => void>)[name] = (message: string, ...data: unknown[]) => {
        (baseLogger as Record<string, (message: string, ...data: unknown[]) => void>)[name](message, ...data);
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