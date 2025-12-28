import { Theme } from './types';

export const builtInThemes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    levels: {
      info: { color: 'cyan', emoji: '💡' },
      success: { color: 'green', emoji: '✅' },
      warn: { color: 'yellow', emoji: '⚠️' },
      error: { color: 'red', emoji: '❌' },
      debug: { color: 'magenta', emoji: '🔍' }
    },
    background: '#1a1a1a'
  },

  light: {
    name: 'light',
    levels: {
      info: { color: 'blue', emoji: '💡' },
      success: { color: 'green', emoji: '✅' },
      warn: { color: 'orange', emoji: '⚠️' },
      error: { color: 'red', emoji: '❌' },
      debug: { color: 'purple', emoji: '🔍' }
    },
    background: '#ffffff'
  },

  neon: {
    name: 'neon',
    levels: {
      info: { color: '#00FFFF', emoji: '💡' },
      success: { color: '#00FF7F', emoji: '✅' },
      warn: { color: '#FFD700', emoji: '⚠️' },
      error: { color: '#FF5555', emoji: '❌' },
      debug: { color: '#8888FF', emoji: '🔍' }
    },
    background: '#111111'
  },

  minimal: {
    name: 'minimal',
    levels: {
      info: { color: 'gray', emoji: '•' },
      success: { color: 'gray', emoji: '✓' },
      warn: { color: 'gray', emoji: '!' },
      error: { color: 'gray', emoji: '✗' },
      debug: { color: 'gray', emoji: '>' }
    }
  }
};

export class ThemeManager {
  private themes: Map<string, Theme> = new Map();

  constructor() {
    // Register built-in themes
    Object.values(builtInThemes).forEach((theme) => {
      this.registerTheme(theme);
    });
  }

  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
  }

  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  getDefaultTheme(): Theme {
    return builtInThemes.dark;
  }
}
