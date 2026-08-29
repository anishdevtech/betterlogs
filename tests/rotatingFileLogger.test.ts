import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RotatingFileLogger } from '../src/rotatingFileLogger';
import fs from 'fs';

const { mockWrite, mockEnd, mockCork, mockUncork, mocks } = vi.hoisted(() => {
  const mockWrite = vi.fn();
  const mockEnd = vi.fn((cb?: () => void) => {
    if (cb) cb();
  });
  const mockCork = vi.fn();
  const mockUncork = vi.fn();
  const mockStream = {
    write: mockWrite,
    end: mockEnd,
    cork: mockCork,
    uncork: mockUncork,
    on: vi.fn(),
    destroyed: false
  };

  const mocks = {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    statSync: vi.fn(() => ({ size: 0 })),
    createWriteStream: vi.fn(() => mockStream),
    renameSync: vi.fn(),
    unlinkSync: vi.fn()
  };

  return { mockWrite, mockEnd, mockCork, mockUncork, mocks };
});

vi.mock('fs', () => {
  return {
    default: mocks,
    ...mocks
  };
});

describe('RotatingFileLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write logs to stream and handle size rotation', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ size: 1000 } as any);

    // Set max size to tiny size so rotation triggers
    const logger = new RotatingFileLogger('test.log', { maxSize: '50B', maxFiles: 3 });

    logger.write({
      level: 'info',
      message: 'A relatively long message that definitely exceeds 50 bytes',
      timestamp: new Date()
    });

    expect(mockWrite).toHaveBeenCalled();
  });

  it('should flush and close streams properly', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const logger = new RotatingFileLogger('test.log');

    await logger.flush();
    expect(mockUncork).toHaveBeenCalled();

    await logger.close();
    expect(mockEnd).toHaveBeenCalled();
  });
});
