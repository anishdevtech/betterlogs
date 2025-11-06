import { describe, it, expect, beforeEach } from "vitest";
import { ThemeManager, builtInThemes } from "../src/themes";
import type { Theme } from "../src/types";

describe("ThemeManager", () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
        themeManager = new ThemeManager();
    });

    it("should have built-in themes", () => {
        const darkTheme = themeManager.getTheme("dark");
        const lightTheme = themeManager.getTheme("light");
        const neonTheme = themeManager.getTheme("neon");
        const minimalTheme = themeManager.getTheme("minimal");

        expect(darkTheme).toBeDefined();
        expect(lightTheme).toBeDefined();
        expect(neonTheme).toBeDefined();
        expect(minimalTheme).toBeDefined();
    });

    it("should register custom themes", () => {
        const customTheme: Theme = {
            name: "sunset",
            levels: {
                info: { color: "#FFA500", emoji: "🌅" },
                success: { color: "#FF6B6B", emoji: "🌟" },
                warn: { color: "#FFE66D", emoji: "⚠️" },
                error: { color: "#FF0000", emoji: "💥" },
                debug: { color: "#4ECDC4", emoji: "🔧" }
            }
        };

        themeManager.registerTheme(customTheme);
        const retrievedTheme = themeManager.getTheme("sunset");

        expect(retrievedTheme).toEqual(customTheme);
    });

    it("should return default theme when theme not found", () => {
        const theme = themeManager.getTheme("nonexistent");
        const defaultTheme = themeManager.getDefaultTheme();

        expect(theme).toBeUndefined();
        expect(defaultTheme).toEqual(builtInThemes.dark);
    });
});
