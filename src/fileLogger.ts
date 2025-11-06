import { LogEntry } from "./types";
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export class FileLogger {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.ensureDirectoryExists();
        this.initializeFile();
    }

    write(entry: LogEntry): void {
        const logLine = this.formatLogEntry(entry);

        try {
            appendFileSync(this.filePath, logLine + "\n", "utf8");
        } catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }

    private ensureDirectoryExists(): void {
        const dir = dirname(this.filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    private initializeFile(): void {
        if (!existsSync(this.filePath)) {
            writeFileSync(this.filePath, "", "utf8");
        }
    }

    private formatLogEntry(entry: LogEntry): string {
        return JSON.stringify({
            timestamp: entry.timestamp.toISOString(),
            level: entry.level,
            message: entry.message,
            label: entry.label,
            ...(entry.data && { data: entry.data })
        });
    }
}
