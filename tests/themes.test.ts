import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, builtInThemes } from '../src/themes';
import { Theme } from '../src/types';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
  });

  it('should have all built-in themes registered', () => {
    expect(themeManager.getTheme('dark')).toBeDefined();
    expect(themeManager.getTheme('light')).toBeDefined();
    expect(themeManager.getTheme('neon')).toBeDefined();
    expect(themeManager.getTheme('minimal')).toBeDefined();
    expect(themeManager.getTheme('dracula')).toBeDefined();
    expect(themeManager.getTheme('nord')).toBeDefined();
    expect(themeManager.getTheme('catppuccin')).toBeDefined();
  });

  it('should check theme existence via hasTheme()', () => {
    expect(themeManager.hasTheme('dracula')).toBe(true);
    expect(themeManager.hasTheme('non_existent')).toBe(false);
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
    expect(themeManager.hasTheme('ocean')).toBe(true);
  });

  it('should list registered themes', () => {
    const themes = themeManager.listThemes();
    expect(themes).toContain('dark');
    expect(themes).toContain('light');
    expect(themes).toContain('dracula');
    expect(themes).toContain('nord');
    expect(themes).toContain('catppuccin');
  });

  it('should deregister a theme by name', () => {
    const customTheme: Theme = {
      name: 'ocean',
      levels: builtInThemes.dark.levels
    };

    themeManager.registerTheme(customTheme);
    expect(themeManager.deregisterTheme('ocean')).toBe(true);
    expect(themeManager.getTheme('ocean')).toBeUndefined();
    expect(themeManager.hasTheme('ocean')).toBe(false);
  });
});
