import { describe, it, expect } from 'vitest';
import { Redactor } from '../src/redactor';

describe('Redactor', () => {
  it('should mask default sensitive keys in objects', () => {
    const redactor = new Redactor();
    const data = {
      username: 'alice',
      password: 'superSecretPassword',
      token: 'jwt.token.here',
      authorization: 'Bearer secret_key',
      apiKey: 'api_12345'
    };

    const redacted = redactor.redact(data);
    expect(redacted.username).toBe('alice');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.authorization).toBe('[REDACTED]');
    expect(redacted.apiKey).toBe('[REDACTED]');
  });

  it('should support nested objects and arrays', () => {
    const redactor = new Redactor();
    const payload = {
      users: [
        { id: 1, secret: 'shh' },
        { id: 2, secret: 'top_secret' }
      ],
      config: {
        db: {
          password: 'db_password'
        }
      }
    };

    const redacted = redactor.redact(payload);
    expect(redacted.users[0].secret).toBe('[REDACTED]');
    expect(redacted.users[1].secret).toBe('[REDACTED]');
    expect(redacted.config.db.password).toBe('[REDACTED]');
  });

  it('should support custom censor replacement string or function', () => {
    const stringCensor = new Redactor({ censor: '***' });
    expect(stringCensor.redact({ password: '123' })).toEqual({ password: '***' });

    const fnCensor = new Redactor({
      censor: (val) => `MASKED(${String(val).length} chars)`
    });
    expect(fnCensor.redact({ password: 'secret_value' })).toEqual({
      password: 'MASKED(12 chars)'
    });
  });

  it('should support custom wildcard paths', () => {
    const redactor = new Redactor({ paths: ['user.*.ssn', 'account.number'] });
    const payload = {
      user: {
        profile: { ssn: '123-45-6789' }
      },
      account: {
        number: 'ACC-99128'
      },
      other: {
        ssn: 'not_matched'
      }
    };

    const redacted = redactor.redact(payload);
    expect(redacted.user.profile.ssn).toBe('[REDACTED]');
    expect(redacted.account.number).toBe('[REDACTED]');
    expect(redacted.other.ssn).toBe('not_matched');
  });

  it('should handle circular structures safely', () => {
    const redactor = new Redactor();
    const circular: any = { name: 'loop' };
    circular.self = circular;

    const redacted = redactor.redact(circular);
    expect(redacted.name).toBe('loop');
    expect(redacted.self).toBe('[Circular]');
  });
});
