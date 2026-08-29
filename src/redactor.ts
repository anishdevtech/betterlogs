import { RedactionOptions } from './types';

export const DEFAULT_REDACT_KEYS = [
  'password',
  'pass',
  'secret',
  'token',
  'authorization',
  'auth',
  'apikey',
  'api_key',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'creditcard',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
  'cookie',
  'set-cookie'
];

export class Redactor {
  private paths: string[];
  private censor: string | ((value: unknown, path: string) => unknown);
  private enabled: boolean;

  constructor(options?: RedactionOptions) {
    this.enabled = options?.enabled !== false;
    this.paths = options?.paths || DEFAULT_REDACT_KEYS;
    this.censor = options?.censor || '[REDACTED]';
  }

  redact<T>(data: T): T {
    if (!this.enabled || data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    const seen = new WeakSet();
    return this.traverse(data, '', seen) as T;
  }

  private traverse(value: unknown, currentPath: string, seen: WeakSet<object>): unknown {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (seen.has(value as object)) {
      return '[Circular]';
    }
    seen.add(value as object);

    if (Array.isArray(value)) {
      return value.map((item, idx) =>
        this.traverse(item, currentPath ? `${currentPath}.${idx}` : `${idx}`, seen)
      );
    }

    if (value instanceof Error) {
      return value;
    }

    if (value instanceof Date || value instanceof RegExp) {
      return value;
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;

      if (this.isMatching(key, fullPath)) {
        result[key] = typeof this.censor === 'function' ? this.censor(val, fullPath) : this.censor;
      } else {
        result[key] = this.traverse(val, fullPath, seen);
      }
    }

    return result;
  }

  private isMatching(key: string, fullPath: string): boolean {
    const lowerKey = key.toLowerCase();
    const lowerFullPath = fullPath.toLowerCase();

    for (const pattern of this.paths) {
      const lowerPattern = pattern.toLowerCase();

      // Exact key match
      if (lowerKey === lowerPattern || lowerFullPath === lowerPattern) {
        return true;
      }

      // Wildcard match (e.g. *.password or user.*.secret)
      if (lowerPattern.includes('*')) {
        const regexPattern = '^' + lowerPattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexPattern, 'i');
        if (regex.test(lowerFullPath) || regex.test(lowerKey)) {
          return true;
        }
      }
    }

    return false;
  }
}
