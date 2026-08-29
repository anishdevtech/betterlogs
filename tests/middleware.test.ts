import { describe, it, expect, vi } from 'vitest';
import betterlogs from '../src';
import { createHttpMiddleware } from '../src/middleware';

describe('HTTP Middleware', () => {
  it('should log request on response finish', () => {
    const logSpy = vi.spyOn(betterlogs, 'log').mockImplementation(() => {});

    const middleware = createHttpMiddleware(betterlogs as any);

    const finishHandlers: Array<() => void> = [];
    const req = { method: 'GET', url: '/api/v1/items', headers: {} };
    const res = {
      statusCode: 200,
      on: (event: string, handler: () => void) => {
        if (event === 'finish') finishHandlers.push(handler);
      }
    };
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();

    // Trigger response finish
    finishHandlers.forEach((h) => h());

    expect(logSpy).toHaveBeenCalled();
    const [level, message] = logSpy.mock.calls[0];
    expect(level).toBe('info');
    expect(message).toContain('GET');
    expect(message).toContain('/api/v1/items');
    expect(message).toContain('200');

    logSpy.mockRestore();
  });

  it('should respect ignoreUrls configuration', () => {
    const logSpy = vi.spyOn(betterlogs, 'log').mockImplementation(() => {});

    const middleware = createHttpMiddleware(betterlogs as any, {
      ignoreUrls: ['/health', /^\/static\/.*/]
    });

    const finishHandlers: Array<() => void> = [];
    const req = { method: 'GET', url: '/health', headers: {} };
    const res = {
      statusCode: 200,
      on: (event: string, handler: () => void) => {
        if (event === 'finish') finishHandlers.push(handler);
      }
    };
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    finishHandlers.forEach((h) => h());

    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
