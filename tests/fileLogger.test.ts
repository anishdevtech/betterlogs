import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileLogger } from '../src/fileLogger';
import fs from 'fs';

// 1. Use vi.hoisted() so these variables exist BEFORE vi.mock() runs
const { mockWrite, mocks } = vi.hoisted(() => {
    const mockWrite = vi.fn();
    const mockStream = { write: mockWrite, on: vi.fn(), destroyed: false };
    
    const mocks = {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
        createWriteStream: vi.fn(() => mockStream),
        appendFileSync: vi.fn(),
        writeFileSync: vi.fn(),
    };
    
    return { mockWrite, mocks };
});

// 2. Now use the hoisted variables safely
vi.mock('fs', () => {
    return {
        default: mocks,
        ...mocks
    };
});

describe('FileLogger', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create directory if needed', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        
        new FileLogger('./logs/test.log');
        
        expect(fs.mkdirSync).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    it('should write to stream', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        const logger = new FileLogger('test.log');
        
        logger.write({
            level: 'info',
            message: 'test',
            timestamp: new Date()
        });

        expect(mockWrite).toHaveBeenCalled();
        const output = mockWrite.mock.calls[0][0];
        expect(output).toContain('"message":"test"');
    });
});
