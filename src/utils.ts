import { BetterLogsConfig, LogLevel } from "./types";

export class EnvironmentDetector {
  static isNode(): boolean {
    return typeof process !== 'undefined' && 
           process.versions != null && 
           process.versions.node != null;
  }

  static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  static supportsEmoji(): boolean {
    if (this.isNode()) {
      // Check if we're in a TTY terminal that supports emoji
      const isTTY = process.stdout?.isTTY;
      const hasNoEmojiFlag = process.env.NO_EMOJI === 'true';
      return !!isTTY && !hasNoEmojiFlag;
    }
    
    if (this.isBrowser()) {
      // Most modern browsers support emoji
      return true;
    }
    
    // Default to true for other environments
    return true;
  }
}

export class Colorizer {
    static applyColor(
        text: string,
        color: string,
        isBackground = false
    ): string {
        if (EnvironmentDetector.isNode()) {
            return this.applyNodeColor(text, color, isBackground);
        } else {
            return this.applyBrowserColor(text, color, isBackground);
        }
    }

    private static applyNodeColor(
        text: string,
        color: string,
        isBackground: boolean
    ): string {
        // In Node.js, we'll use a simple approach since chalk v5 is pure ESM
        // For production, you might want to use a different color library
        const colors: { [key: string]: string } = {
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            gray: "\x1b[90m",
            reset: "\x1b[0m"
        };

        const bgColors: { [key: string]: string } = {
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

    private static applyBrowserColor(
        text: string,
        color: string,
        isBackground: boolean
    ): string {
        // In browser, we return the text as-is since we can't modify console colors directly
        // Applications can choose to implement CSS styling in their own console wrappers
        return text;
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
    const hours =
        format === "12h"
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

export const levelWeights: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3,
    silent: 999
};
