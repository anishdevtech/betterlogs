import { Theme } from './types';

export const builtInThemes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    levels: {
      trace: { color: 'gray', emoji: '🔬' },
      debug: { color: 'magenta', emoji: '🔍' },
      info: { color: 'cyan', emoji: '💡' },
      ready: { color: 'green', emoji: '🚀' },
      start: { color: 'cyan', emoji: '⏳' },
      success: { color: 'green', emoji: '✅' },
      pause: { color: 'yellow', emoji: '⏸️' },
      warn: { color: 'yellow', emoji: '⚠️' },
      error: { color: 'red', emoji: '❌' },
      fatal: { color: 'brightRed', emoji: '💀' }
    },
    background: '#1a1a1a'
  },

  light: {
    name: 'light',
    levels: {
      trace: { color: 'gray', emoji: '🔬' },
      debug: { color: 'purple', emoji: '🔍' },
      info: { color: 'blue', emoji: '💡' },
      ready: { color: 'green', emoji: '🚀' },
      start: { color: 'blue', emoji: '⏳' },
      success: { color: 'green', emoji: '✅' },
      pause: { color: 'orange', emoji: '⏸️' },
      warn: { color: 'orange', emoji: '⚠️' },
      error: { color: 'red', emoji: '❌' },
      fatal: { color: 'red', emoji: '💀' }
    },
    background: '#ffffff'
  },

  neon: {
    name: 'neon',
    levels: {
      trace: { color: '#888888', emoji: '🔬' },
      debug: { color: '#8888FF', emoji: '🔍' },
      info: { color: '#00FFFF', emoji: '💡' },
      ready: { color: '#00FF7F', emoji: '🚀' },
      start: { color: '#00FFFF', emoji: '⏳' },
      success: { color: '#00FF7F', emoji: '✅' },
      pause: { color: '#FFD700', emoji: '⏸️' },
      warn: { color: '#FFD700', emoji: '⚠️' },
      error: { color: '#FF5555', emoji: '❌' },
      fatal: { color: '#FF0055', emoji: '💀' }
    },
    background: '#111111'
  },

  minimal: {
    name: 'minimal',
    levels: {
      trace: { color: 'gray', emoji: '·' },
      debug: { color: 'gray', emoji: '>' },
      info: { color: 'gray', emoji: '•' },
      ready: { color: 'gray', emoji: '»' },
      start: { color: 'gray', emoji: '…' },
      success: { color: 'gray', emoji: '✓' },
      pause: { color: 'gray', emoji: '||' },
      warn: { color: 'gray', emoji: '!' },
      error: { color: 'gray', emoji: '✗' },
      fatal: { color: 'gray', emoji: '✕' }
    }
  },

  dracula: {
    name: 'dracula',
    levels: {
      trace: { color: '#6272A4', emoji: '🔬' },
      debug: { color: '#BD93F9', emoji: '🔍' },
      info: { color: '#8BE9FD', emoji: '💡' },
      ready: { color: '#50FA7B', emoji: '🚀' },
      start: { color: '#8BE9FD', emoji: '⏳' },
      success: { color: '#50FA7B', emoji: '✅' },
      pause: { color: '#F1FA8C', emoji: '⏸️' },
      warn: { color: '#F1FA8C', emoji: '⚠️' },
      error: { color: '#FF5555', emoji: '❌' },
      fatal: { color: '#FF5555', emoji: '💀' }
    },
    background: '#282a36'
  },

  nord: {
    name: 'nord',
    levels: {
      trace: { color: '#4C566A', emoji: '🔬' },
      debug: { color: '#B48EAD', emoji: '🔍' },
      info: { color: '#88C0D0', emoji: '💡' },
      ready: { color: '#A3BE8C', emoji: '🚀' },
      start: { color: '#81A1C1', emoji: '⏳' },
      success: { color: '#A3BE8C', emoji: '✅' },
      pause: { color: '#EBCB8B', emoji: '⏸️' },
      warn: { color: '#EBCB8B', emoji: '⚠️' },
      error: { color: '#BF616A', emoji: '❌' },
      fatal: { color: '#BF616A', emoji: '💀' }
    },
    background: '#2E3440'
  },

  catppuccin: {
    name: 'catppuccin',
    levels: {
      trace: { color: '#6C7086', emoji: '🔬' },
      debug: { color: '#CBA6F7', emoji: '🔍' },
      info: { color: '#89DCEB', emoji: '💡' },
      ready: { color: '#A6E3A1', emoji: '🚀' },
      start: { color: '#89DCEB', emoji: '⏳' },
      success: { color: '#A6E3A1', emoji: '✅' },
      pause: { color: '#F9E2AF', emoji: '⏸️' },
      warn: { color: '#F9E2AF', emoji: '⚠️' },
      error: { color: '#F38BA8', emoji: '❌' },
      fatal: { color: '#F38BA8', emoji: '💀' }
    },
    background: '#1E1E2E'
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

  listThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }

  deregisterTheme(name: string): boolean {
    return this.themes.delete(name);
  }

  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  getDefaultTheme(): Theme {
    return builtInThemes.dark;
  }
}
