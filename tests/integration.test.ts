import { describe, it, expect, beforeEach } from "vitest";
import { betterlogs } from "../src";
import type { Theme } from "../src/types";

describe("Integration Tests", () => {
    beforeEach(() => {
        // Reset to default config before each test
        betterlogs.config({
            showTimestamp: true,
            showEmoji: true,
            theme: "dark",
            level: "info",
            mode: "pretty",
            timestampFormat: "24h"
        });
    });

    // Update the integration test to use the correct method name
it('should handle complete workflow', () => {
    // Test configuration
    betterlogs.config({
        theme: 'neon',
        showTimestamp: false,
        showEmoji: true,
        level: 'debug' // Ensure debug level to capture all logs
    });

    // Test logging at different levels
    betterlogs.debug('Debug message');
    betterlogs.info('Info message');
    betterlogs.success('Success message');
    betterlogs.warn('Warning message');
    betterlogs.error('Error message');

    // Test labeled logging
    const apiLogger = betterlogs.label('API');
    apiLogger.info('API request');

    // Test custom level - FIXED: Now it should be available on betterlogs
    betterlogs.addLevel('notice', { color: 'yellow', emoji: '📢' });
    betterlogs.notice('Custom level message'); // No need for (betterlogs as any)

    // We should have multiple log calls now
    // Check that at least some logging happened
    const totalCalls = 
        (console.log as any).mock.calls.length +
        (console.warn as any).mock.calls.length +
        (console.error as any).mock.calls.length +
        (console.debug as any).mock.calls.length;

    expect(totalCalls).toBeGreaterThan(0);
});

it('should support custom themes', () => {
  const customTheme: Theme = {
    name: 'custom',
    levels: {
      info: { color: '#FFA500', emoji: '🎨' },
      success: { color: '#00FF00', emoji: '🎉' },
      warn: { color: '#FFFF00', emoji: '🚧' },
      error: { color: '#FF0000', emoji: '💀' },
      debug: { color: '#800080', emoji: '🐛' }
    }
  };

  betterlogs.addTheme(customTheme);
  betterlogs.config({ theme: 'custom', showEmoji: true }); // Ensure emoji is enabled
  
  betterlogs.info('Message with custom theme');

  // Check that console.log was called with a string containing the custom emoji
  const logCalls = (console.log as any).mock.calls;
  const lastCall = logCalls[logCalls.length - 1][0];
  
  expect(lastCall).toContain('🎨');
});

    it("should handle JSON mode", () => {
        betterlogs.setMode("json");
        betterlogs.info("JSON formatted message");

        const logCall = (console.log as any).mock.calls[0][0];
        const parsed = JSON.parse(logCall);

        expect(parsed).toHaveProperty("level", "info");
        expect(parsed).toHaveProperty("message", "JSON formatted message");
        expect(parsed).toHaveProperty("timestamp");
    });
    
});
describe('Integration Tests - Extended', () => {
  it('should handle file logging in Node.js', () => {
    if (betterlogs.label('FileTest').isNode) {
      betterlogs.file('test.log');
      betterlogs.info('File log test');
      // File logging should not throw errors
      expect(() => betterlogs.info('File test')).not.toThrow();
    }
  });

  it('should handle all configuration options', () => {
    betterlogs.config({
      showTimestamp: false,
      showEmoji: false,
      theme: 'minimal',
      level: 'debug',
      mode: 'pretty',
      timestampFormat: '12h'
    });

    betterlogs.debug('Debug with minimal theme');
    betterlogs.info('Info with minimal theme');
    
    // Should not throw with various configs
    expect(() => {
      betterlogs.config({ theme: 'dark' });
      betterlogs.config({ theme: 'light' });
      betterlogs.config({ theme: 'neon' });
    }).not.toThrow();
  });

  it('should handle table logging', () => {
    const testData = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];
    
    expect(() => betterlogs.table(testData)).not.toThrow();
  });
});
