import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BetterLogger } from "../src/logger";
import { ConfigManager } from "../src/config";
import { ThemeManager } from "../src/themes";

describe("BetterLogger - Core Functionality", () => {
    let logger: BetterLogger;
    let configManager: ConfigManager;
    let themeManager: ThemeManager;

    beforeEach(() => {
        themeManager = new ThemeManager();
        configManager = new ConfigManager(themeManager);
        logger = new BetterLogger(configManager, themeManager);
    });

    it("should log info messages", () => {
        logger.info("Test info message");
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("Test info message")
        );
    });

    it("should log success messages", () => {
        logger.success("Test success message");
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("Test success message")
        );
    });

    it("should log warning messages", () => {
        logger.warn("Test warning message");
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Test warning message")
        );
    });

    it("should log error messages", () => {
        logger.error("Test error message");
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Test error message")
        );
    });

    it("should log debug messages when level is set to debug", () => {
        logger.setLevel("debug");
        logger.debug("Test debug message");
        expect(console.debug).toHaveBeenCalledWith(
            expect.stringContaining("Test debug message")
        );
    });

    it("should not log debug messages when level is set to info", () => {
        logger.setLevel("info");
        logger.debug("Test debug message");
        expect(console.debug).not.toHaveBeenCalled();
    });

    it("should respect log level filtering", () => {
        logger.setLevel("error");

        logger.info("This should not appear");
        logger.warn("This should not appear");
        logger.error("This should appear");

        expect(console.log).not.toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledTimes(1);
    });
});

describe("BetterLogger - Label System", () => {
    let logger: BetterLogger;

    beforeEach(() => {
        const themeManager = new ThemeManager();
        const configManager = new ConfigManager(themeManager);
        logger = new BetterLogger(configManager, themeManager);
    });

    // In the Label System tests, change:
    it("should create labeled loggers", () => {
        const apiLogger = logger.withLabel("API"); // Changed from .label()
        apiLogger.info("Request sent");

        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("[API]")
        );
    });

    it("should maintain separate label instances", () => {
        const apiLogger = logger.withLabel("API"); // Changed from .label()
        const dbLogger = logger.withLabel("Database"); // Changed from .label()

        expect(apiLogger).not.toBe(dbLogger);
    });
});

describe("BetterLogger - Custom Levels", () => {
    let logger: BetterLogger;

    beforeEach(() => {
        const themeManager = new ThemeManager();
        const configManager = new ConfigManager(themeManager);
        logger = new BetterLogger(configManager, themeManager);
    });

    it("should add custom log levels", () => {
        // Set level to debug to ensure custom levels are logged
        logger.setLevel("debug");

        logger.addLevel("critical", { color: "red", emoji: "🔥" });

        // Call the custom level method
        (logger as any).critical("System failure!");

        // Check that some console method was called
        // Custom levels might use different console methods
        const wasCalled =
            (console.error as any).mock.calls.length > 0 ||
            (console.log as any).mock.calls.length > 0 ||
            (console.warn as any).mock.calls.length > 0;

        expect(wasCalled).toBe(true);

        // Check the content by looking at all console calls
        const allCalls = [
            ...(console.error as any).mock.calls,
            ...(console.log as any).mock.calls,
            ...(console.warn as any).mock.calls,
            ...(console.debug as any).mock.calls
        ];

        const found = allCalls.some(
            call => call[0] && call[0].includes("System failure!")
        );

        expect(found).toBe(true);
    });
});
