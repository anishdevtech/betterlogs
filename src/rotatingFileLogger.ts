import { LogEntry, FileRotationOptions } from './types';
import { safeStringify, EnvironmentDetector } from './utils';
import fs, { WriteStream } from 'fs';
import path from 'path';

export class RotatingFileLogger {
  private filePath: string;
  private options: FileRotationOptions;
  private stream: WriteStream | null = null;
  private currentSize = 0;
  private currentDateStr = '';
  private maxSizeBytes: number;
  private maxFiles: number;
  private initialized = false;

  constructor(filePath: string, options: FileRotationOptions = {}) {
    this.filePath = filePath;
    this.options = options;
    this.maxSizeBytes = this.parseSize(options.maxSize || '10MB');
    this.maxFiles = options.maxFiles || 5;

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

    const logLine = this.formatLogEntry(entry) + '\n';
    const lineBytes = Buffer.byteLength(logLine);

    if (this.shouldRotate(lineBytes)) {
      this.rotate();
    }

    if (this.stream && typeof this.stream.write === 'function') {
      this.stream.write(logLine);
      this.currentSize += lineBytes;
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

  private shouldRotate(incomingBytes: number): boolean {
    // 1. Check size limit
    if (this.currentSize + incomingBytes >= this.maxSizeBytes) {
      return true;
    }

    // 2. Check date change if datePattern configured
    if (this.options.datePattern) {
      const todayStr = this.getFormattedDate();
      if (this.currentDateStr && todayStr !== this.currentDateStr) {
        return true;
      }
    }

    return false;
  }

  private rotate(): void {
    try {
      if (this.stream) {
        this.stream.end();
        this.stream = null;
      }

      if (fs.existsSync(this.filePath)) {
        const dir = path.dirname(this.filePath);
        const ext = path.extname(this.filePath);
        const base = path.basename(this.filePath, ext);
        const timestamp = this.getFormattedDate();

        // Shift existing rotated files: base.N.ext -> base.N+1.ext
        for (let i = this.maxFiles - 1; i >= 1; i--) {
          const oldFile = path.join(dir, `${base}.${timestamp}.${i}${ext}`);
          const newFile = path.join(dir, `${base}.${timestamp}.${i + 1}${ext}`);
          if (fs.existsSync(oldFile)) {
            if (i + 1 >= this.maxFiles) {
              fs.unlinkSync(oldFile);
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }

        // Rename current active file to .1
        const archiveFile = path.join(dir, `${base}.${timestamp}.1${ext}`);
        fs.renameSync(this.filePath, archiveFile);
      }

      this.currentSize = 0;
      this.currentDateStr = this.getFormattedDate();
      this.initializeStream();
    } catch (err) {
      console.error('Failed to rotate log file:', err);
    }
  }

  private initializeStream(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const stat = fs.statSync(this.filePath);
        this.currentSize = stat.size;
      } else {
        this.currentSize = 0;
      }

      this.currentDateStr = this.getFormattedDate();
      this.stream = fs.createWriteStream(this.filePath, { flags: 'a' });
      this.stream.on('error', (err: unknown) => {
        console.error('RotatingFileLogger Stream Error:', err);
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize rotating log stream:', error);
    }
  }

  private parseSize(size: string | number): number {
    if (typeof size === 'number') return size;

    const match = String(size)
      .trim()
      .match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);
    if (!match) return 10 * 1024 * 1024; // 10MB default

    const num = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case 'G':
      case 'GB':
        return num * 1024 * 1024 * 1024;
      case 'M':
      case 'MB':
        return num * 1024 * 1024;
      case 'K':
      case 'KB':
        return num * 1024;
      default:
        return num;
    }
  }

  private getFormattedDate(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatLogEntry(entry: LogEntry): string {
    return safeStringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...(entry.label ? { label: entry.label } : {}),
      ...(entry.context && Object.keys(entry.context).length > 0 ? { context: entry.context } : {}),
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
