import { describe, it, expect } from 'vitest';
import { Formatter } from '../src/formatter';
import { builtInThemes } from '../src/themes';
import { LogEntry, BetterLogsConfig } from '../src/types';
import { formatTime } from '../src/utils'; // Import the actual utility

describe('Formatter', () => {
  const testDate = new Date('2023-01-01T10:00:00Z');

  const mockEntry: LogEntry = {
    level: 'info',
    message: 'Test message',
    timestamp: testDate,
    label: 'Auth'
  };

  const mockConfig: BetterLogsConfig = {
    showTimestamp: true,
    showEmoji: true,
    theme: 'dark',
    level: 'info',
    mode: 'pretty',
    timestampFormat: '24h'
  };

  it('should format pretty log string', () => {
    const result = Formatter.formatPretty(mockEntry, mockConfig, builtInThemes.dark);

    // Dynamic Expectation: Ask the util what this time looks like locally
    const expectedTime = formatTime(testDate, '24h');

    expect(result).toContain(`[${expectedTime}]`);
    expect(result).toContain('Test message');
    expect(result).toContain('💡');
    expect(result).toContain('[Auth]');
  });

  it('should format JSON string', () => {
    const result = Formatter.formatJson(mockEntry);
    const parsed = JSON.parse(result);

    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
    expect(parsed.label).toBe('Auth');
    expect(parsed.timestamp).toBe(mockEntry.timestamp.toISOString());
  });

  it('should respect config options in pretty mode', () => {
    const minimalConfig = { ...mockConfig, showTimestamp: false, showEmoji: false };
    const result = Formatter.formatPretty(mockEntry, minimalConfig, builtInThemes.dark);

    const expectedTime = formatTime(testDate, '24h');
    expect(result).not.toContain(`[${expectedTime}]`);
    expect(result).not.toContain('💡');
    expect(result).toContain('Test message');
  });
});
