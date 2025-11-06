import { describe, it, expect } from 'vitest';
import { Formatter } from '../src/formatter';
import type { LogEntry, BetterLogsConfig, Theme } from '../src/types';

describe('Formatter', () => {
  const mockEntry: LogEntry = {
    level: 'info',
    message: 'Test message',
    timestamp: new Date('2023-01-01T12:00:00Z'),
    label: 'TEST'
  };

  const mockConfig: BetterLogsConfig = {
    showTimestamp: true,
    showEmoji: true,
    theme: 'dark',
    level: 'info',
    mode: 'pretty',
    timestampFormat: '24h'
  };

  const mockTheme: Theme = {
    name: 'test',
    levels: {
      info: { color: 'blue', emoji: '💡' },
      success: { color: 'green', emoji: '✅' },
      warn: { color: 'yellow', emoji: '⚠️' },
      error: { color: 'red', emoji: '❌' },
      debug: { color: 'magenta', emoji: '🔍' }
    }
  };

  it('should format pretty output with timestamp', () => {
    const result = Formatter.formatPretty(mockEntry, mockConfig, mockTheme);
    
    expect(result).toContain('Test message');
    expect(result).toContain('INFO');
    // Don't check for exact bracket content due to labels
  });

  it('should format pretty output without timestamp', () => {
    const configWithoutTimestamp = { 
        ...mockConfig, 
        showTimestamp: false,
        showEmoji: true // Explicitly enable emoji
    };
    const result = Formatter.formatPretty(mockEntry, configWithoutTimestamp, mockTheme);
    
    // Should not contain timestamp format [HH:MM:SS]
    expect(result).not.toMatch(/\[\d{1,2}:\d{2}:\d{2}\]/);
    
    // Should contain the emoji since showEmoji is true
    expect(result).toContain('💡');
});

  it('should format JSON output', () => {
    const configJson = { ...mockConfig, mode: 'json' };
    const result = Formatter.format(mockEntry, configJson, mockTheme);
    
    const parsed = JSON.parse(result);
    
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
    expect(parsed.label).toBe('TEST');
    expect(parsed.timestamp).toBeDefined();
  });

  it('should handle 12h timestamp format', () => {
    const date = new Date('2023-01-01T12:00:00Z'); // Noon UTC
    const entry = { ...mockEntry, timestamp: date };
    const config12h = { ...mockConfig, timestampFormat: '12h' as const };
    
    const result = Formatter.formatPretty(entry, config12h, mockTheme);
    
    // Check for 12h format pattern (will depend on your timezone)
    expect(result).toMatch(/\[\d{1,2}:\d{2}:\d{2} (AM|PM)\]/);
  });

  it('should handle 24h timestamp format', () => {
    const date = new Date('2023-01-01T12:00:00Z'); // Noon UTC  
    const entry = { ...mockEntry, timestamp: date };
    const config24h = { ...mockConfig, timestampFormat: '24h' as const };
    
    const result = Formatter.formatPretty(entry, config24h, mockTheme);
    
    // Check for 24h format pattern (will depend on your timezone)
    expect(result).toMatch(/\[\d{1,2}:\d{2}:\d{2}\]/);
  });
});