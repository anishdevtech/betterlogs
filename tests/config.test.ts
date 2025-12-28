import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager, defaultConfig } from '../src/config';
import { ThemeManager } from '../src/themes';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
    configManager = new ConfigManager(themeManager);
  });

  it('should initialize with default configuration', () => {
    expect(configManager.getConfig()).toEqual(defaultConfig);
  });

  it('should update configuration partially', () => {
    configManager.updateConfig({ level: 'error', showEmoji: false });
    const config = configManager.getConfig();
    expect(config.level).toBe('error');
    expect(config.showEmoji).toBe(false);
    expect(config.theme).toBe('dark'); // Should remain unchanged
  });

  it('should resolve theme string to theme object', () => {
    const theme = configManager.getCurrentTheme();
    expect(theme.name).toBe('dark');
    expect(theme.levels.info).toBeDefined();
  });

  it('should correct determine if log should be emitted', () => {
    configManager.updateConfig({ level: 'warn' });

    expect(configManager.shouldLog('error')).toBe(true);
    expect(configManager.shouldLog('warn')).toBe(true);
    expect(configManager.shouldLog('info')).toBe(false);
    expect(configManager.shouldLog('debug')).toBe(false);
  });
});
