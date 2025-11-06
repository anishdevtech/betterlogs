import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileLogger } from '../src/fileLogger';
import type { LogEntry } from '../src/types';

// Mock fs module
vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  appendFileSync: vi.fn(),
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn()
}));

import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';

describe('FileLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize file logger', () => {
    new FileLogger('test.log');
    
    expect(existsSync).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalledWith('test.log', '', 'utf8');
  });

  it('should write log entries', () => {
    const logger = new FileLogger('test.log');
    const fixedDate = new Date('2023-01-01T00:00:00.000Z');
    const entry: LogEntry = {
      level: 'info',
      message: 'Test message',
      timestamp: fixedDate,
      label: 'TEST'
    };

    logger.write(entry);

    // Check that appendFileSync was called with the correct arguments
    expect(appendFileSync).toHaveBeenCalledWith(
      'test.log',
      '{"timestamp":"2023-01-01T00:00:00.000Z","level":"info","message":"Test message","label":"TEST"}\n',
      'utf8'
    );
  });

  it('should write log entries with data', () => {
    const logger = new FileLogger('test.log');
    const fixedDate = new Date('2023-01-01T00:00:00.000Z');
    const entry: LogEntry = {
      level: 'error',
      message: 'Error occurred',
      timestamp: fixedDate,
      label: 'API',
      data: [{ code: 500, details: 'Internal server error' }]
    };

    logger.write(entry);

    expect(appendFileSync).toHaveBeenCalledWith(
      'test.log',
      '{"timestamp":"2023-01-01T00:00:00.000Z","level":"error","message":"Error occurred","label":"API","data":[{"code":500,"details":"Internal server error"}]}\n',
      'utf8'
    );
  });
});