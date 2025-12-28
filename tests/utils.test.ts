import { describe, it, expect, vi, afterEach } from 'vitest';
import { EnvironmentDetector, Colorizer, formatTime, safeStringify } from '../src/utils';

describe('Utils', () => {
    describe('EnvironmentDetector', () => {
        it('should detect Node environment', () => {
            expect(EnvironmentDetector.isNode()).toBe(true);
        });
    });

    describe('Colorizer', () => {
        it('should apply ANSI codes in Node', () => {
            const result = Colorizer.applyColor('test', 'red');
            expect(result).toContain('\x1b[31m');
            expect(result).toContain('test');
            expect(result).toContain('\x1b[0m');
        });

        it('should return raw text if color is not found', () => {
            const result = Colorizer.applyColor('test', 'unknownColor');
            expect(result).toBe('test');
        });
    });

    describe('formatTime', () => {
        const date = new Date('2023-01-01T15:30:45');

        it('should format 24h correctly', () => {
            expect(formatTime(date, '24h')).toBe('15:30:45');
        });

        it('should format 12h correctly', () => {
            expect(formatTime(date, '12h')).toBe('3:30:45 PM');
        });
    });

    describe('safeStringify', () => {
        it('should stringify simple objects', () => {
            const obj = { a: 1 };
            expect(safeStringify(obj)).toBe('{"a":1}');
        });

        it('should handle circular references', () => {
            const obj: any = { name: 'circular' };
            obj.self = obj;
            
            const result = safeStringify(obj);
            expect(result).toContain('"self":"[Circular]"');
            expect(result).toContain('"name":"circular"');
        });
    });
});
