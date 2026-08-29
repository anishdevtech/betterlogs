import { LogEntry } from './types';
import { safeStringify, EnvironmentDetector } from './utils';
import fs, { WriteStream } from 'fs';
import path from 'path';

export class FileLogger {
  private filePath: string;
  private stream: WriteStream | null = null;
  private initialized = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    if (EnvironmentDetector.isNode()) {
      this.initializeStream();
    }
  }

  write(entry: LogEntry): void {
    if (!EnvironmentDetector.isNode()) {
      return;
    }

    if (!this.initialized || !this.stream || this.stream.destroyed) {
      this.initializeStream();
    }

    const logLine = this.formatLogEntry(entry);
    if (this.stream && typeof this.stream.write === 'function') {
      this.stream.write(logLine + '\n');
    }
  }

  async flush(): Promise<void> {
    if (!this.stream || this.stream.destroyed) return;

    return new Promise((resolve) => {
      if (typeof this.stream?.cork === 'function' && typeof this.stream?.uncork === 'function') {
        this.stream.uncork();
      }
      resolve();
    });
  }

  async close(): Promise<void> {
    if (!this.stream || this.stream.destroyed) return;

    return new Promise((resolve) => {
      this.stream?.end(() => {
        this.stream = null;
        this.initialized = false;
        resolve();
      });
    });
  }

  private initializeStream(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.stream = fs.createWriteStream(this.filePath, { flags: 'a' });
      this.stream.on('error', (err: unknown) => {
        console.error('FileLogger Stream Error:', err);
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize log file stream:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return safeStringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...(entry.label ? { label: entry.label } : {}),
      ...(entry.meta && Object.keys(entry.meta).length > 0 ? { meta: entry.meta } : {}),
      ...(entry.data && entry.data.length > 0 ? { data: entry.data } : {}),
      ...(entry.error
        ? {
            error: {
              name: entry.error.name,
              message: entry.error.message,
              stack: entry.error.stack
            }
          }
        : {})
    });
  }
}
