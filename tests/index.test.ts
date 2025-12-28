import { describe, it, expect } from 'vitest';
import log, { BetterLogger, ConfigManager, DiscordTransport } from '../src/index';

describe('Index Exports', () => {
    it('should export default logger instance', () => {
        expect(log).toBeDefined();
        expect(typeof log.info).toBe('function');
        expect(typeof log.with).toBe('function');
    });

    it('should export classes', () => {
        expect(BetterLogger).toBeDefined();
        expect(ConfigManager).toBeDefined();
        expect(DiscordTransport).toBeDefined();
    });

    it('should create new instances via create()', () => {
        const newLogger = log.create({ level: 'debug' });
        expect(newLogger).toBeInstanceOf(BetterLogger);
        expect(newLogger).not.toBe(log); // Ensure it's a separate instance
    });
});
