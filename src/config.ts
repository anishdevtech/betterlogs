import { BetterLogsConfig, LogLevel } from './types';
import { ThemeManager } from './themes';

export const defaultConfig: BetterLogsConfig = {
  showTimestamp: true,
  showEmoji: true,
  theme: 'dark',
  level: 'info',
  mode: 'pretty',
  timestampFormat: '24h'
};

export class ConfigManager {
  private config: BetterLogsConfig;
  private themeManager: ThemeManager;

  constructor(themeManager: ThemeManager) {
    this.themeManager = themeManager;
    this.config = { ...defaultConfig };
  }

  updateConfig(newConfig: Partial<BetterLogsConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  getConfig(): BetterLogsConfig {
    return { ...this.config };
  }

  getCurrentTheme() {
    const theme = this.config.theme;
    if (typeof theme === 'string') {
      return this.themeManager.getTheme(theme) || this.themeManager.getDefaultTheme();
    }
    return theme;
  }

  shouldLog(level: LogLevel): boolean {
    const levelWeights = {
      debug: 0,
      info: 1,
      success: 1,
      warn: 2,
      error: 3,
      silent: 999
    };

    return levelWeights[level] >= levelWeights[this.config.level];
  }
}
