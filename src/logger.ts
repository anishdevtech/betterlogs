import { LogEntry, LogLevel, BetterLogsConfig } from "./types";
import { ConfigManager } from "./config";
import { ThemeManager } from "./themes";
import { Formatter } from "./formatter";
import { FileLogger } from "./fileLogger";
import { EnvironmentDetector } from "./utils";



export class BetterLogger {
    private configManager: ConfigManager;
    private themeManager: ThemeManager;
    private fileLogger?: FileLogger;
    private labels: Map<string, BetterLogger> = new Map();
    private customLevels: Map<string, { color: string; emoji: string }> =
        new Map();
    private activeTimers: Map<string, number> = new Map();
    private label?: string;

    constructor(
        configManager: ConfigManager,
        themeManager: ThemeManager,
        label?: string
    ) {
        this.configManager = configManager;
        this.themeManager = themeManager;
        this.label = label;

        if (
            EnvironmentDetector.isNode() &&
            this.configManager.getConfig().file
        ) {
            this.fileLogger = new FileLogger(
                this.configManager.getConfig().file!
            );
        }
    }

    // Core logging methods
    info(message: string, ...data: unknown[]): void {
        this.log("info", message, data);
    }

    success(message: string, ...data: unknown[]): void {
        this.log("success", message, data);
    }

    warn(message: string, ...data: unknown[]): void {
        this.log("warn", message, data);
    }

    error(message: string, ...data: unknown[]): void {
        this.log("error", message, data);
    }

    debug(message: string, ...data: unknown[]): void {
        this.log("debug", message, data);
    }

    // Label system
    withLabel(labelName: string): BetterLogger {
        if (!this.labels.has(labelName)) {
            this.labels.set(
                labelName,
                new BetterLogger(
                    this.configManager,
                    this.themeManager,
                    labelName
                )
            );
        }
        return this.labels.get(labelName)!;
    }

    // Configuration
    config(newConfig: Partial<BetterLogsConfig>): void {
        this.configManager.updateConfig(newConfig);
    }

    setLevel(level: LogLevel): void {
        this.configManager.updateConfig({ level });
    }

    setMode(mode: "pretty" | "json"): void {
        this.configManager.updateConfig({ mode });
    }

    // Custom levels
    addLevel(name: string, config: { color: string; emoji: string }): void {
        this.customLevels.set(name, config);

        // Add the level to the current theme for proper formatting
        const currentTheme = this.configManager.getCurrentTheme();
        if (!currentTheme.levels[name]) {
            currentTheme.levels[name] = config;
        }

        (this as any)[name] = (message: string, ...data: unknown[]) => {
            this.log(name, message, data);
        };
    }

    // Grouped logs
    group(name: string): BetterLogger {
        return this.withLabel(name);
    }

    // Table logging
    table(data: unknown[] | object): void {
        if (console.table) {
            console.table(data);
        } else {
            // Fallback for environments without console.table
            console.log(JSON.stringify(data, null, 2));
        }
    }

    // Timer utilities
    time(label: string): void {
        this.activeTimers.set(label, Date.now());
    }

    timeEnd(label: string): void {
        const startTime = this.activeTimers.get(label);
        if (startTime) {
            const duration = Date.now() - startTime;
            this.info(`Timer '${label}': ${duration}ms`);
            this.activeTimers.delete(label);
        }
    }

    // File logging (Node.js only)
    file(filePath: string): void {
        if (EnvironmentDetector.isNode()) {
            this.configManager.updateConfig({ file: filePath });
            this.fileLogger = new FileLogger(filePath);
        } else {
            this.warn("File logging is only available in Node.js environment");
        }
    }

    // Private methods
    private log(level: string, message: string, data: unknown[]): void {
        // For custom levels, check against 'debug' level to ensure they're logged
        const levelToCheck = this.customLevels.has(level) ? "debug" : level;

        if (!this.configManager.shouldLog(levelToCheck as LogLevel)) {
            return;
        }

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            label: this.label,
            data: data.length > 0 ? data : undefined
        };

        const config = this.configManager.getConfig();
        const theme = this.configManager.getCurrentTheme();

        // Ensure custom levels are available in the theme for formatting
        if (!theme.levels[level] && this.customLevels.has(level)) {
            theme.levels[level] = this.customLevels.get(level)!;
        }

        const formattedMessage = Formatter.format(entry, config, theme);

        // Output to console
        this.outputToConsole(level, formattedMessage, data);

        // Output to file if configured
        if (this.fileLogger) {
            this.fileLogger.write(entry);
        }
    }

    private outputToConsole(
        level: string,
        formattedMessage: string,
        data: unknown[]
    ): void {
        const consoleMethod = this.getConsoleMethod(level);

        if (data.length > 0) {
            consoleMethod(formattedMessage, ...data);
        } else {
            consoleMethod(formattedMessage);
        }
    }

    private getConsoleMethod(level: string): (...args: unknown[]) => void {
        switch (level) {
            case "error":
                return console.error;
            case "warn":
                return console.warn;
            case "debug":
                return console.debug;
            default:
                return console.log;
        }
    }
}
