import { describe, it, expect } from 'vitest';
import { defaultAsyncContext } from '../src/asyncContext';
import betterlogs from '../src';

describe('AsyncContext', () => {
  it('should propagate context across async execution tree', async () => {
    await defaultAsyncContext.run({ requestId: 'req_999', userId: 'usr_42' }, async () => {
      const ctx = defaultAsyncContext.getContext();
      expect(ctx).toBeDefined();
      expect(ctx?.requestId).toBe('req_999');
      expect(ctx?.userId).toBe('usr_42');

      // Nested async function
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(defaultAsyncContext.getContext()?.requestId).toBe('req_999');
    });

    // Outside the scope
    expect(defaultAsyncContext.getContext()).toBeUndefined();
  });

  it('should support runWithContext directly from logger', async () => {
    let capturedReqId: unknown;

    await betterlogs.runWithContext({ requestId: 'req_logger_test' }, async () => {
      capturedReqId = betterlogs.getContext()?.requestId;
    });

    expect(capturedReqId).toBe('req_logger_test');
  });
});
