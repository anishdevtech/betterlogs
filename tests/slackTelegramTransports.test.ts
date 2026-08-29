import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SlackTransport, TelegramTransport } from '../src/transports';
import { LogEntry } from '../src/types';

global.fetch = vi.fn();

describe('Slack & Telegram Transports', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockClear();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'ok'
    } as Response);
  });

  describe('SlackTransport', () => {
    it('should format and send Slack webhook messages', async () => {
      const transport = new SlackTransport({
        webhookUrl: 'https://hooks.slack.com/services/test',
        channel: '#alerts',
        username: 'LoggerBot',
        filter: { minLevel: 'error' }
      });

      const entry: LogEntry = {
        level: 'error',
        message: 'Payment Gateway Timeout',
        timestamp: new Date(),
        label: 'Payments',
        error: new Error('Socket timeout')
      };

      await transport.log(entry);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/services/test',
        expect.any(Object)
      );

      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body.channel).toBe('#alerts');
      expect(body.username).toBe('LoggerBot');
      expect(body.text).toContain('Payment Gateway Timeout');
    });

    it('should respect slack: false metadata override', async () => {
      const transport = new SlackTransport({
        webhookUrl: 'https://hooks.slack.com/services/test'
      });

      await transport.log({
        level: 'error',
        message: 'Local error only',
        timestamp: new Date(),
        meta: { slack: false }
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('TelegramTransport', () => {
    it('should send formatted Telegram messages to bot API', async () => {
      const transport = new TelegramTransport({
        botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
        chatId: '-1001234567890',
        filter: { minLevel: 'error' }
      });

      const entry: LogEntry = {
        level: 'error',
        message: 'High Memory Alert',
        timestamp: new Date(),
        label: 'System'
      };

      await transport.log(entry);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/sendMessage',
        expect.any(Object)
      );

      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body.chat_id).toBe('-1001234567890');
      expect(body.text).toContain('High Memory Alert');
    });
  });
});
