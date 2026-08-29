import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordTransport, HttpTransport, CallbackTransport } from '../src/transports';
import { LogEntry } from '../src/types';

global.fetch = vi.fn();

describe('Transports', () => {
  const dummyUrl = 'https://discord.com/api/webhooks/test';

  beforeEach(() => {
    vi.mocked(global.fetch).mockClear();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'OK'
    } as Response);
  });

  describe('DiscordTransport', () => {
    it('should send logs meeting criteria', async () => {
      const transport = new DiscordTransport({
        webhookUrl: dummyUrl,
        username: 'Bot',
        avatarUrl: 'https://example.com/avatar.png',
        filter: { minLevel: 'error' }
      });

      const entry: LogEntry = {
        level: 'error',
        message: 'Fail',
        timestamp: new Date(),
        label: 'Auth',
        data: [{ userId: 42 }],
        error: new Error('DB Error')
      };

      await transport.log(entry);
      expect(global.fetch).toHaveBeenCalledWith(dummyUrl, expect.any(Object));

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(callBody.username).toBe('Bot');
      expect(callBody.avatar_url).toBe('https://example.com/avatar.png');
      expect(callBody.embeds[0].title).toBe('ERROR Log');
    });

    it('should skip logs below level', async () => {
      const transport = new DiscordTransport({
        webhookUrl: dummyUrl,
        filter: { minLevel: 'error' }
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Hello',
        timestamp: new Date()
      };

      await transport.log(entry);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle rate limits (429) gracefully without throwing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded'
      } as Response);

      const transport = new DiscordTransport({ webhookUrl: dummyUrl });
      await expect(
        transport.log({ level: 'error', message: 'Test', timestamp: new Date() })
      ).resolves.not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should handle "with" metadata overrides', async () => {
      const transport = new DiscordTransport({ webhookUrl: dummyUrl });

      // Force Send Info
      await transport.log({
        level: 'info',
        message: 'Force',
        timestamp: new Date(),
        meta: { discord: true }
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      vi.mocked(global.fetch).mockClear();

      // Force Mute Error
      await transport.log({
        level: 'error',
        message: 'Mute',
        timestamp: new Date(),
        meta: { discord: false }
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('HttpTransport', () => {
    const httpEndpoint = 'https://api.example.com/logs';

    it('should send POST request to HTTP endpoint', async () => {
      const httpTransport = new HttpTransport({
        url: httpEndpoint,
        headers: { Authorization: 'Bearer token123' },
        filter: { minLevel: 'warn' }
      });

      await httpTransport.log({
        level: 'warn',
        message: 'High CPU usage',
        timestamp: new Date()
      });

      expect(global.fetch).toHaveBeenCalledWith(
        httpEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token123' })
        })
      );
    });

    it('should support transform function', async () => {
      const httpTransport = new HttpTransport({
        url: httpEndpoint,
        transform: (entry) => ({ text: entry.message, sev: entry.level })
      });

      await httpTransport.log({
        level: 'info',
        message: 'Transformed message',
        timestamp: new Date()
      });

      expect(global.fetch).toHaveBeenCalled();
      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body).toEqual({ text: 'Transformed message', sev: 'info' });
    });
  });

  describe('CallbackTransport', () => {
    it('should execute callback with log entry', async () => {
      const logs: LogEntry[] = [];
      const transport = new CallbackTransport((entry) => {
        logs.push(entry);
      });

      const entry: LogEntry = {
        level: 'info',
        message: 'Callback test',
        timestamp: new Date()
      };

      await transport.log(entry);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Callback test');
    });
  });
});
