import { BetterLogsConfig, LogLevel } from "./types";

export class EnvironmentDetector {
    static isNode(): boolean {
        return (
            typeof process !== "undefined" &&
            process.versions != null &&
            process.versions.node != null
        );
    }

    static isBrowser(): boolean {
        return typeof window !== "undefined" && typeof document !== "undefined";
    }

    static supportsEmoji(): boolean {
        if (this.isNode()) {
            const isTTY = process.stdout?.isTTY;
            const hasNoEmojiFlag = process.env.NO_EMOJI === "true";
            return !!isTTY && !hasNoEmojiFlag;
        }
        return true; 
    }
}

export class Colorizer {
    static applyColor(text: string, color: string, isBackground = false): string {
        if (EnvironmentDetector.isNode()) {
            return this.applyNodeColor(text, color, isBackground);
        }
        return text;
    }

    private static applyNodeColor(text: string, color: string, isBackground: boolean): string {
        const colors: Record<string, string> = {
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            gray: "\x1b[90m",
            orange: "\x1b[33m",
            reset: "\x1b[0m"
        };

        const bgColors: Record<string, string> = {
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            reset: "\x1b[0m"
        };

        const code = isBackground ? bgColors[color] : colors[color];
        return code ? `${code}${text}${colors.reset}` : text;
    }
}

export function mergeConfigs(
    defaultConfig: BetterLogsConfig,
    userConfig: Partial<BetterLogsConfig>
): BetterLogsConfig {
    return {
        ...defaultConfig,
        ...userConfig,
        level: userConfig.level || defaultConfig.level
    };
}

export function formatTime(date: Date, format: "12h" | "24h"): string {
    const hours = format === "12h"
            ? date.getHours() % 12 || 12
            : date.getHours().toString().padStart(2, "0");

    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    if (format === "12h") {
        const ampm = date.getHours() >= 12 ? "PM" : "AM";
        return `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    return `${hours}:${minutes}:${seconds}`;
}

export function safeStringify(data: any): string {
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular]";
            }
            seen.add(value);
        }
        return value;
    });
}

export const levelWeights: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3,
    silent: 999
};
