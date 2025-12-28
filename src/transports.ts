import { LogEntry, LogTransport, LogLevel } from './types';
import { safeStringify } from './utils';

export interface TransportFilter {
  minLevel?: LogLevel | string;
  includeLevels?: string[];
  onlyLabels?: string[];
  contains?: string;
}

export interface DiscordTransportOptions {
  webhookUrl: string;
  filter?: TransportFilter;
  customCheck?: (entry: LogEntry) => boolean;
}

const levelWeights: Record<string, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
  critical: 5
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
    const entryWeight = levelWeights[entry.level] ?? 0;
    const minWeight = levelWeights[minLevel] ?? 3;

    return entryWeight >= minWeight;
  }

  private async sendToWebhook(entry: LogEntry): Promise<void> {
    try {
      const color = this.getDiscordColor(entry.level);

      const payload = {
        embeds: [
          {
            title: `${entry.level.toUpperCase()} Log`,
            description: entry.message,
            color: color,
            timestamp: entry.timestamp.toISOString(),
            fields: [] as any[]
          }
        ]
      };

      if (entry.label) {
        payload.embeds[0].fields.push({
          name: 'Label',
          value: entry.label,
          inline: true
        });
      }

      if (entry.data && entry.data.length > 0) {
        const dataString = safeStringify(entry.data);
        const truncated =
          dataString.length > 1000 ? dataString.substring(0, 1000) + '...' : dataString;
        payload.embeds[0].fields.push({
          name: 'Data',
          value: '```json\n' + truncated + '\n```',
          inline: false
        });
      }

      await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to send log to Discord:', err);
    }
  }

  private getDiscordColor(level: string): number {
    switch (level) {
      case 'critical':
        return 10038562;
      case 'error':
        return 15548997;
      case 'warn':
        return 16776960;
      case 'success':
        return 5763719;
      case 'info':
        return 3447003;
      default:
        return 9807270;
    }
  }
}
