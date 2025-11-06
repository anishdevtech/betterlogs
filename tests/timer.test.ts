import { describe, it, expect,afterEach, beforeEach, vi } from 'vitest';
import { BetterLogger } from '../src/logger';
import { ConfigManager } from '../src/config';
import { ThemeManager } from '../src/themes';

describe('Timer Utilities', () => {
  let logger: BetterLogger;

  beforeEach(() => {
    vi.useFakeTimers();
    const themeManager = new ThemeManager();
    const configManager = new ConfigManager(themeManager);
    logger = new BetterLogger(configManager, themeManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should measure time correctly', () => {
    logger.time('test-timer');
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000);
    
    logger.timeEnd('test-timer');
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Timer 'test-timer': 1000ms")
    );
  });

  it('should handle multiple timers', () => {
    logger.time('timer1');
    vi.advanceTimersByTime(500);
    logger.time('timer2');
    vi.advanceTimersByTime(300);
    
    logger.timeEnd('timer2');
    logger.timeEnd('timer1');
    
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Timer 'timer2': 300ms")
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Timer 'timer1': 800ms")
    );
  });
});