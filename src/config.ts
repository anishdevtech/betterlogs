import { BetterLogsConfig, LogLevel, Theme } from './types';
import { ThemeManager } from './themes';
import { LEVEL_WEIGHTS } from './utils';

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

  constructor(themeManager: ThemeManager, initialConfig?: Partial<BetterLogsConfig>) {
    this.themeManager = themeManager;
    this.config = {
      ...defaultConfig,
      ...initialConfig
    };
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

  resetConfig(): void {
    this.config = { ...defaultConfig };
  }

  getCurrentTheme(): Theme {
    const theme = this.config.theme;
    if (typeof theme === 'string') {
      return this.themeManager.getTheme(theme) || this.themeManager.getDefaultTheme();
    }
    return theme;
  }

  shouldLog(level: LogLevel | string): boolean {
    if (level === 'silent') {
      return false;
    }

    const targetWeight = LEVEL_WEIGHTS[level] ?? 1;
    const currentMinWeight = LEVEL_WEIGHTS[this.config.level] ?? 1;

    return targetWeight >= currentMinWeight;
  }
}
