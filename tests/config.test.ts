import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../src/config';
import { ThemeManager } from '../src/themes';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
    configManager = new ConfigManager(themeManager);
  });

  it('should have default configuration', () => {
    const config = configManager.getConfig();
    
    expect(config.showTimestamp).toBe(true);
    expect(config.showEmoji).toBe(true);
    expect(config.theme).toBe('dark');
    expect(config.level).toBe('info');
    expect(config.mode).toBe('pretty');
  });

  it('should update configuration', () => {
    configManager.updateConfig({
      showTimestamp: false,
      theme: 'neon',
      level: 'debug'
    });

    const config = configManager.getConfig();
    
    expect(config.showTimestamp).toBe(false);
    expect(config.theme).toBe('neon');
    expect(config.level).toBe('debug');
  });

  it('should determine if level should be logged', () => {
    configManager.updateConfig({ level: 'warn' });
    
    expect(configManager.shouldLog('debug')).toBe(false);
    expect(configManager.shouldLog('info')).toBe(false);
    expect(configManager.shouldLog('warn')).toBe(true);
    expect(configManager.shouldLog('error')).toBe(true);
  });
});