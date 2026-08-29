import { EnvironmentDetector } from './utils';
import { AsyncLocalStorage } from 'async_hooks';

export class AsyncContextManager {
  private storage: AsyncLocalStorage<Record<string, unknown>> | null = null;

  constructor() {
    if (EnvironmentDetector.isNode()) {
      try {
        this.storage = new AsyncLocalStorage<Record<string, unknown>>();
      } catch {
        this.storage = null;
      }
    }
  }

  run<R>(context: Record<string, unknown>, fn: () => R): R {
    if (this.storage) {
      const parent = this.storage.getStore() || {};
      const merged = { ...parent, ...context };
      return this.storage.run(merged, fn);
    }
    return fn();
  }

  getContext(): Record<string, unknown> | undefined {
    if (this.storage) {
      return this.storage.getStore();
    }
    return undefined;
  }
}

export const defaultAsyncContext = new AsyncContextManager();
