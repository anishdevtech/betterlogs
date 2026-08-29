import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DiscordTransport,
  SlackTransport,
  TelegramTransport,
  HttpTransport,
  CallbackTransport
} from '../src/transports';
import { LogEntry } from '../src/types';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';

describe('Transports Deep Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DiscordTransport Filters & Payload Details', () => {
    it('should handle all filters, labels, truncation, avatarUrl, and rate limiting', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limited'
      });
      global.fetch = fetchSpy;

      const discord = new DiscordTransport({
        webhookUrl: 'https://discord.com/api/webhooks/mock',
        username: 'Bot',
        avatarUrl: 'https://example.com/avatar.png',
        filter: {
          onlyLabels: ['Auth'],
          contains: 'failed',
          includeLevels: ['warn'],
          minLevel: 'error'
        }
      });

      const entry: LogEntry = {
        level: 'warn',
        message: 'Auth login failed',
        timestamp: new Date(),
        label: 'Auth',
        context: { ip: '1.2.3.4' },
        meta: { region: 'us-east', customField: 123 },
        data: ['long-data-string'.repeat(100)],
        error: new Error('Auth stack trace error')
      };

      await discord.log(entry);

      expect(fetchSpy).toHaveBeenCalled();
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.username).toBe('Bot');
      expect(body.avatar_url).toBe('https://example.com/avatar.png');
      expect(body.embeds[0].fields.length).toBeGreaterThan(0);
    });

    it('should respect customCheck returning false', async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const discord = new DiscordTransport({
        webhookUrl: 'https://discord.com/api/webhooks/mock',
        customCheck: () => false
      });

      await discord.log({
        level: 'error',
        message: 'Error',
        timestamp: new Date()
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should test sendViaNodeRequest when fetch is undefined', async () => {
      const originalFetch = global.fetch;
      (global as any).fetch = undefined;

      const mockReq = new EventEmitter() as any;
      mockReq.write = vi.fn();
      mockReq.end = vi.fn();

      const requestSpy = vi.spyOn(https, 'request').mockImplementation((_url, _opts, cb: any) => {
        const mockRes = new EventEmitter() as any;
        mockRes.statusCode = 200;
        process.nextTick(() => {
          cb(mockRes);
          mockRes.emit('end');
        });
        return mockReq;
      });

      const discord = new DiscordTransport({
        webhookUrl: 'https://discord.com/api/webhooks/node-test'
      });

      await discord.log({
        level: 'error',
        message: 'Node request test',
        timestamp: new Date()
      });

      expect(requestSpy).toHaveBeenCalled();
      expect(mockReq.write).toHaveBeenCalled();
      expect(mockReq.end).toHaveBeenCalled();

      requestSpy.mockRestore();
      global.fetch = originalFetch;
    });
  });

  describe('SlackTransport Deep Coverage', () => {
    it('should test Slack filters, includeLevels, and error stack fields', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'ok'
      });
      global.fetch = fetchSpy;

      const slack = new SlackTransport({
        webhookUrl: 'https://hooks.slack.com/services/mock',
        channel: '#ops',
        username: 'OpsBot',
        iconEmoji: ':robot_face:',
        filter: {
          onlyLabels: ['Billing'],
          contains: 'card',
          includeLevels: ['info']
        }
      });

      // Filter match
      await slack.log({
        level: 'info',
        message: 'Processed credit card',
        timestamp: new Date(),
        label: 'Billing',
        context: { orderId: 99 },
        error: new Error('Card charge failed')
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Filter mismatch (label)
      await slack.log({
        level: 'info',
        message: 'Processed credit card',
        timestamp: new Date(),
        label: 'Other'
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Filter mismatch (contains)
      await slack.log({
        level: 'info',
        message: 'Processed invoice',
        timestamp: new Date(),
        label: 'Billing'
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle customCheck in SlackTransport', async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const slack = new SlackTransport({
        webhookUrl: 'https://hooks.slack.com/services/mock',
        customCheck: () => false
      });

      await slack.log({
        level: 'error',
        message: 'Error',
        timestamp: new Date()
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('TelegramTransport Deep Coverage', () => {
    it('should test Telegram filters and parseMode HTML', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'ok'
      });
      global.fetch = fetchSpy;

      const telegram = new TelegramTransport({
        botToken: '123:ABC',
        chatId: '456',
        parseMode: 'HTML',
        filter: {
          onlyLabels: ['Security'],
          contains: 'brute',
          includeLevels: ['warn']
        }
      });

      await telegram.log({
        level: 'warn',
        message: 'Possible brute force detected',
        timestamp: new Date(),
        label: 'Security'
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.parse_mode).toBe('HTML');
      expect(body.chat_id).toBe('456');
    });

    it('should handle customCheck and telegram: false override', async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const telegram = new TelegramTransport({
        botToken: '123:ABC',
        chatId: '456',
        customCheck: () => false
      });

      await telegram.log({
        level: 'error',
        message: 'Error',
        timestamp: new Date()
      });
      expect(fetchSpy).not.toHaveBeenCalled();

      const telegram2 = new TelegramTransport({
        botToken: '123:ABC',
        chatId: '456'
      });
      await telegram2.log({
        level: 'error',
        message: 'Error',
        timestamp: new Date(),
        meta: { telegram: false }
      });
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('HttpTransport Deep Coverage', () => {
    it('should test filters, node requests, and callbacks', async () => {
      const originalFetch = global.fetch;
      (global as any).fetch = undefined;

      const mockReq = new EventEmitter() as any;
      mockReq.write = vi.fn();
      mockReq.end = vi.fn();

      const requestSpy = vi.spyOn(http, 'request').mockImplementation((_url, _opts, cb: any) => {
        const mockRes = new EventEmitter() as any;
        mockRes.statusCode = 200;
        mockRes.resume = vi.fn();
        process.nextTick(() => {
          cb(mockRes);
        });
        return mockReq;
      });

      const httpTransport = new HttpTransport({
        url: 'http://localhost:8080/log',
        headers: { 'X-Custom': 'test' },
        filter: {
          onlyLabels: ['App'],
          contains: 'match',
          includeLevels: ['debug']
        }
      });

      await httpTransport.log({
        level: 'debug',
        message: 'match this string',
        timestamp: new Date(),
        label: 'App'
      });

      expect(requestSpy).toHaveBeenCalled();
      expect(mockReq.write).toHaveBeenCalled();
      expect(mockReq.end).toHaveBeenCalled();

      requestSpy.mockRestore();
      global.fetch = originalFetch;
    });

    it('should handle CallbackTransport', async () => {
      const handler = vi.fn();
      const callbackTransport = new CallbackTransport(handler);

      const entry: LogEntry = {
        level: 'info',
        message: 'Callback test',
        timestamp: new Date()
      };

      await callbackTransport.log(entry);
      expect(handler).toHaveBeenCalledWith(entry);
    });
  });
});
