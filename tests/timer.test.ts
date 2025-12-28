import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BetterLogger } from '../src/logger';
import { ConfigManager } from '../src/config';
import { ThemeManager } from '../src/themes';

describe('Timer Utilities', () => {
    let logger: BetterLogger;

    beforeEach(() => {
        // Spy on console.log so we can check if it was called
        vi.spyOn(console, 'log').mockImplementation(() => {}); 
        
        const themeManager = new ThemeManager();
        const configManager = new ConfigManager(themeManager);
        logger = new BetterLogger(configManager, themeManager);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks(); // Clean up spies
        vi.useRealTimers();
    });

    it('should measure time correctly', () => {
        logger.time('test-timer');
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
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("Timer 'timer2': 300ms")
        );

        logger.timeEnd('timer1');
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("Timer 'timer1': 800ms")
        );
    });
});
