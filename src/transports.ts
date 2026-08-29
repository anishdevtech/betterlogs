import {
  LogEntry,
  LogTransport,
  DiscordTransportOptions,
  SlackTransportOptions,
  TelegramTransportOptions,
  HttpTransportOptions,
  TransportFilter
} from './types';
import { safeStringify, EnvironmentDetector, LEVEL_WEIGHTS } from './utils';
import http, { IncomingMessage, ClientRequest } from 'http';
import https from 'https';

export type {
  TransportFilter,
  DiscordTransportOptions,
  SlackTransportOptions,
  TelegramTransportOptions,
  HttpTransportOptions
};

export class DiscordTransport implements LogTransport {
  private options: DiscordTransportOptions;

  constructor(options: DiscordTransportOptions) {
    this.options = options;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry)) {
      return;
    }
    await this.sendToWebhook(entry);
  }

  private shouldLog(entry: LogEntry): boolean {
    if (entry.meta?.discord === true) return true;
    if (entry.meta?.discord === false) return false;

    if (this.options.customCheck && !this.options.customCheck(entry)) {
      return false;
    }

    const filter = this.options.filter || {};

    if (filter.onlyLabels && (!entry.label || !filter.onlyLabels.includes(entry.label))) {
      return false;
    }

    if (filter.contains && !entry.message.includes(filter.contains)) {
      return false;
    }

    if (filter.includeLevels && filter.includeLevels.includes(entry.level)) {
      return true;
    }

    const minLevel = filter.minLevel || 'error';
    const entryWeight = LEVEL_WEIGHTS[entry.level] ?? 0;
    const minWeight = LEVEL_WEIGHTS[minLevel] ?? LEVEL_WEIGHTS.error;

    return entryWeight >= minWeight;
  }

  private async sendToWebhook(entry: LogEntry): Promise<void> {
    try {
      const color = this.getDiscordColor(entry.level);

      const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

      if (entry.label) {
        fields.push({
          name: 'Label',
          value: entry.label,
          inline: true
        });
      }

      if (entry.context && Object.keys(entry.context).length > 0) {
        fields.push({
          name: 'Context',
          value: '```json\n' + safeStringify(entry.context).substring(0, 1000) + '\n```',
          inline: false
        });
      }

      if (entry.meta) {
        const customMeta = { ...entry.meta };
        delete customMeta.discord;
        if (Object.keys(customMeta).length > 0) {
          fields.push({
            name: 'Meta',
            value: '```json\n' + safeStringify(customMeta).substring(0, 1000) + '\n```',
            inline: false
          });
        }
      }

      if (entry.data && entry.data.length > 0) {
        const dataString = safeStringify(entry.data);
        const truncated =
          dataString.length > 1000 ? dataString.substring(0, 1000) + '...' : dataString;
        fields.push({
          name: 'Data',
          value: '```json\n' + truncated + '\n```',
          inline: false
        });
      }

      if (entry.error && entry.error.stack) {
        const stackString = entry.error.stack.substring(0, 1000);
        fields.push({
          name: 'Stack Trace',
          value: '```\n' + stackString + '\n```',
          inline: false
        });
      }

      const payload: Record<string, unknown> = {
        embeds: [
          {
            title: `${entry.level.toUpperCase()} Log`,
            description: entry.message,
            color,
            timestamp: entry.timestamp.toISOString(),
            fields
          }
        ]
      };

      if (this.options.username) {
        payload.username = this.options.username;
      }
      if (this.options.avatarUrl) {
        payload.avatar_url = this.options.avatarUrl;
      }

      const body = JSON.stringify(payload);

      if (typeof fetch !== 'undefined') {
        const res = await fetch(this.options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          if (res.status === 429) {
            console.warn(`Discord webhook rate limited (429): ${errText}`);
          } else {
            console.error(`Discord webhook failed (${res.status}): ${errText}`);
          }
        }
        return;
      }

      if (EnvironmentDetector.isNode()) {
        await this.sendViaNodeRequest(this.options.webhookUrl, body);
        return;
      }

      console.error('Failed to send log to Discord: Fetch API is unavailable in this environment.');
    } catch (err) {
      console.error('Failed to send log to Discord:', err);
    }
  }

  private async sendViaNodeRequest(webhookUrl: string, body: string): Promise<void> {
    const parsedUrl = new URL(webhookUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestFn = isHttps ? https.request : http.request;

    return new Promise<void>((resolve) => {
      const req: ClientRequest = requestFn(
        parsedUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        },
        (res: IncomingMessage) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const errorMsg = `Discord webhook request failed with status ${res.statusCode}: ${Buffer.concat(chunks).toString()}`;
            console.error(errorMsg);
            resolve();
          });
        }
      );

      req.on('error', (err: unknown) => {
        console.error('Discord webhook request error:', err);
        resolve();
      });
      req.write(body);
      req.end();
    });
  }

  private getDiscordColor(level: string): number {
    switch (level) {
      case 'fatal':
      case 'critical':
        return 0x992d22; // Dark Red
      case 'error':
        return 0xed4245; // Red
      case 'warn':
        return 0xfee75c; // Yellow
      case 'success':
      case 'ready':
        return 0x57f287; // Green
      case 'info':
        return 0x5865f2; // Blurple
      case 'start':
      case 'debug':
      case 'trace':
        return 0xeb459e; // Magenta
      default:
        return 0x95a5a6; // Gray
    }
  }
}

export class SlackTransport implements LogTransport {
  private options: SlackTransportOptions;

  constructor(options: SlackTransportOptions) {
    this.options = options;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry)) {
      return;
    }

    try {
      const colorMap: Record<string, string> = {
        fatal: '#7f1d1d',
        error: '#ef4444',
        warn: '#f59e0b',
        success: '#10b981',
        ready: '#10b981',
        info: '#3b82f6',
        debug: '#8b5cf6'
      };

      const color = colorMap[entry.level] || '#6b7280';
      const labelText = entry.label ? `[${entry.label}] ` : '';

      const attachment: {
        color: string;
        ts: number;
        fields: Array<{ title: string; value: string; short?: boolean }>;
      } = {
        color,
        ts: Math.floor(entry.timestamp.getTime() / 1000),
        fields: []
      };

      const payload: Record<string, unknown> = {
        text: `${labelText}*${entry.level.toUpperCase()}*: ${entry.message}`,
        attachments: [attachment]
      };

      if (this.options.username) payload.username = this.options.username;
      if (this.options.channel) payload.channel = this.options.channel;
      if (this.options.iconEmoji) payload.icon_emoji = this.options.iconEmoji;

      if (entry.context) {
        attachment.fields.push({
          title: 'Context',
          value: '```' + safeStringify(entry.context).substring(0, 500) + '```',
          short: false
        });
      }

      if (entry.error?.stack) {
        attachment.fields.push({
          title: 'Stack',
          value: '```' + entry.error.stack.substring(0, 500) + '```',
          short: false
        });
      }

      const body = JSON.stringify(payload);

      if (typeof fetch !== 'undefined') {
        const res = await fetch(this.options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        if (!res.ok) {
          console.error(`Slack webhook error (${res.status}): ${await res.text().catch(() => '')}`);
        }
      }
    } catch (err) {
      console.error('SlackTransport log error:', err);
    }
  }

  private shouldLog(entry: LogEntry): boolean {
    if (entry.meta?.slack === true) return true;
    if (entry.meta?.slack === false) return false;

    if (this.options.customCheck && !this.options.customCheck(entry)) {
      return false;
    }

    const filter = this.options.filter || {};
    if (filter.onlyLabels && (!entry.label || !filter.onlyLabels.includes(entry.label))) {
      return false;
    }
    if (filter.contains && !entry.message.includes(filter.contains)) {
      return false;
    }
    if (filter.includeLevels && filter.includeLevels.includes(entry.level)) {
      return true;
    }

    const minLevel = filter.minLevel || 'error';
    const entryWeight = LEVEL_WEIGHTS[entry.level] ?? 0;
    const minWeight = LEVEL_WEIGHTS[minLevel] ?? LEVEL_WEIGHTS.error;

    return entryWeight >= minWeight;
  }
}

export class TelegramTransport implements LogTransport {
  private options: TelegramTransportOptions;

  constructor(options: TelegramTransportOptions) {
    this.options = options;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry)) {
      return;
    }

    try {
      const labelText = entry.label ? `[${entry.label}] ` : '';
      const text = `🚨 *${entry.level.toUpperCase()}* ${labelText}\n${entry.message}`;

      const url = `https://api.telegram.org/bot${this.options.botToken}/sendMessage`;
      const body = JSON.stringify({
        chat_id: this.options.chatId,
        text,
        parse_mode: this.options.parseMode || 'Markdown'
      });

      if (typeof fetch !== 'undefined') {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        if (!res.ok) {
          console.error(
            `Telegram transport error (${res.status}): ${await res.text().catch(() => '')}`
          );
        }
      }
    } catch (err) {
      console.error('TelegramTransport log error:', err);
    }
  }

  private shouldLog(entry: LogEntry): boolean {
    if (entry.meta?.telegram === true) return true;
    if (entry.meta?.telegram === false) return false;

    if (this.options.customCheck && !this.options.customCheck(entry)) {
      return false;
    }

    const filter = this.options.filter || {};
    if (filter.onlyLabels && (!entry.label || !filter.onlyLabels.includes(entry.label))) {
      return false;
    }
    if (filter.contains && !entry.message.includes(filter.contains)) {
      return false;
    }
    if (filter.includeLevels && filter.includeLevels.includes(entry.level)) {
      return true;
    }

    const minLevel = filter.minLevel || 'error';
    const entryWeight = LEVEL_WEIGHTS[entry.level] ?? 0;
    const minWeight = LEVEL_WEIGHTS[minLevel] ?? LEVEL_WEIGHTS.error;

    return entryWeight >= minWeight;
  }
}

export class HttpTransport implements LogTransport {
  private options: HttpTransportOptions;

  constructor(options: HttpTransportOptions) {
    this.options = options;
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry)) {
      return;
    }

    try {
      const payloadData = this.options.transform
        ? this.options.transform(entry)
        : {
            level: entry.level,
            message: entry.message,
            timestamp: entry.timestamp.toISOString(),
            label: entry.label,
            context: entry.context,
            meta: entry.meta,
            data: entry.data,
            error: entry.error
              ? { message: entry.error.message, stack: entry.error.stack }
              : undefined
          };

      const body = safeStringify(payloadData);
      const headers = {
        'Content-Type': 'application/json',
        ...(this.options.headers || {})
      };

      if (typeof fetch !== 'undefined') {
        const res = await fetch(this.options.url, {
          method: this.options.method || 'POST',
          headers,
          body
        });
        if (!res.ok) {
          console.error(
            `HttpTransport failed (${res.status}): ${await res.text().catch(() => '')}`
          );
        }
        return;
      }

      if (EnvironmentDetector.isNode()) {
        const parsedUrl = new URL(this.options.url);
        const isHttps = parsedUrl.protocol === 'https:';
        const requestFn = isHttps ? https.request : http.request;

        await new Promise<void>((resolve) => {
          const req: ClientRequest = requestFn(
            parsedUrl,
            {
              method: this.options.method || 'POST',
              headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(body)
              }
            },
            (res: IncomingMessage) => {
              res.resume();
              resolve();
            }
          );
          req.on('error', (err: unknown) => {
            console.error('HttpTransport request error:', err);
            resolve();
          });
          req.write(body);
          req.end();
        });
      }
    } catch (err) {
      console.error('HttpTransport log error:', err);
    }
  }

  private shouldLog(entry: LogEntry): boolean {
    if (this.options.customCheck && !this.options.customCheck(entry)) {
      return false;
    }

    const filter = this.options.filter || {};

    if (filter.onlyLabels && (!entry.label || !filter.onlyLabels.includes(entry.label))) {
      return false;
    }

    if (filter.contains && !entry.message.includes(filter.contains)) {
      return false;
    }

    if (filter.includeLevels && filter.includeLevels.includes(entry.level)) {
      return true;
    }

    if (filter.minLevel) {
      const entryWeight = LEVEL_WEIGHTS[entry.level] ?? 0;
      const minWeight = LEVEL_WEIGHTS[filter.minLevel] ?? 0;
      return entryWeight >= minWeight;
    }

    return true;
  }
}

export class CallbackTransport implements LogTransport {
  private handler: (entry: LogEntry) => void | Promise<void>;

  constructor(handler: (entry: LogEntry) => void | Promise<void>) {
    this.handler = handler;
  }

  async log(entry: LogEntry): Promise<void> {
    await this.handler(entry);
  }
}
