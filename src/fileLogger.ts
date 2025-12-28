import { LogEntry } from './types';
import { createWriteStream, WriteStream, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { safeStringify } from './utils';

export class FileLogger {
  private filePath: string;
  private stream: WriteStream | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.ensureDirectoryExists();
    this.initializeStream();
  }

  write(entry: LogEntry): void {
    if (!this.stream || this.stream.destroyed) {
      this.initializeStream();
    }

    const logLine = this.formatLogEntry(entry);
    this.stream?.write(logLine + '\n');
  }

  private ensureDirectoryExists(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private initializeStream(): void {
    try {
      this.stream = createWriteStream(this.filePath, { flags: 'a' });
      this.stream.on('error', (err) => {
        console.error('FileLogger Stream Error:', err);
      });
    } catch (error) {
      console.error('Failed to initialize log file stream:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return safeStringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      label: entry.label,
      ...(entry.data && { data: entry.data })
    });
  }
}
