import { describe, it, expect, vi, beforeEach } from 'vitest';
import betterlogs from '../src';

describe('Extended Features', () => {
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
  };

  beforeEach(() => {
    vi.clearAllMocks();
    betterlogs.config({ level: 'trace' });
  });

  it('should support ready, start, pause, fatal, and trace methods', () => {
    betterlogs.ready('Ready on port 3000');
    expect(consoleSpy.log).toHaveBeenCalled();
    expect(consoleSpy.log.mock.calls[0][0]).toContain('READY');

    betterlogs.start('Building bundle...');
    expect(consoleSpy.log).toHaveBeenCalled();
    expect(consoleSpy.log.mock.calls[1][0]).toContain('START');

    betterlogs.pause('Awaiting approval');
    expect(consoleSpy.warn).toHaveBeenCalled();
    expect(consoleSpy.warn.mock.calls[0][0]).toContain('PAUSE');

    betterlogs.fatal('System panic');
    expect(consoleSpy.error).toHaveBeenCalled();
    expect(consoleSpy.error.mock.calls[0][0]).toContain('FATAL');

    betterlogs.trace('Trace detail');
    expect(consoleSpy.debug).toHaveBeenCalled();
    expect(consoleSpy.debug.mock.calls[0][0]).toContain('TRACE');
  });

  it('should support box rendering', () => {
    betterlogs.box('App Ready\nVisit: http://localhost:3000', {
      title: 'DevServer',
      borderStyle: 'rounded'
    });

    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0][0];
    expect(output).toContain('DevServer');
    expect(output).toContain('App Ready');
  });

  it('should support log throttling to prevent flooding', () => {
    const throttled = betterlogs.throttle({ limit: 2, windowMs: 1000 });

    throttled.warn('Repeated error');
    throttled.warn('Repeated error');
    throttled.warn('Repeated error'); // 3rd call in window should be dropped

    expect(consoleSpy.warn).toHaveBeenCalledTimes(2);
  });

  it('should support log sampling', () => {
    const sampled0 = betterlogs.sample(0);
    sampled0.info('Never logged');
    expect(consoleSpy.log).not.toHaveBeenCalled();

    const sampled1 = betterlogs.sample(1);
    sampled1.info('Always logged');
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
  });
});
