import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, builtInThemes } from '../src/themes';
import { Theme } from '../src/types';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
  });

  it('should have built-in themes registered', () => {
    expect(themeManager.getTheme('dark')).toBeDefined();
    expect(themeManager.getTheme('light')).toBeDefined();
    expect(themeManager.getTheme('neon')).toBeDefined();
  });

  it('should return default theme when requested', () => {
    expect(themeManager.getDefaultTheme()).toEqual(builtInThemes.dark);
  });

  it('should register and retrieve custom themes', () => {
    const customTheme: Theme = {
      name: 'ocean',
      levels: builtInThemes.dark.levels
    };

    themeManager.registerTheme(customTheme);
    expect(themeManager.getTheme('ocean')).toEqual(customTheme);
  });

  it('should list registered themes', () => {
    const themes = themeManager.listThemes();
    expect(themes).toContain('dark');
    expect(themes).toContain('light');
  });

  it('should deregister a theme by name', () => {
    const customTheme: Theme = {
      name: 'ocean',
      levels: builtInThemes.dark.levels
    };

    themeManager.registerTheme(customTheme);
    expect(themeManager.deregisterTheme('ocean')).toBe(true);
    expect(themeManager.getTheme('ocean')).toBeUndefined();
  });
});
