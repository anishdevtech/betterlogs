# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-08-29

### Added

- **Sensitive Data Redaction**: Automatic masking of sensitive fields (`password`, `token`, `authorization`, `apiKey`, `creditCard`, `cookie`) with wildcard path matching (`*.secret`) and custom censor callbacks (`src/redactor.ts`).
- **Zero-Dependency Rotating File Logger**: File logger supporting size-based (`maxSize: '10MB'`) and date-based (`datePattern: 'YYYY-MM-DD'`) log rotation with strict retention cleanup (`maxFiles: 5`) (`src/rotatingFileLogger.ts`).
- **Async Context Tracing (`AsyncLocalStorage`)**: Request context tracking across asynchronous call trees via `log.runWithContext()` and `log.getContext()` (`src/asyncContext.ts`).
- **HTTP Server Middleware**: Universal request logging middleware for Express, Connect, and Node `http.createServer` with color-coded status codes, request duration, and URL filtering (`src/middleware.ts`).
- **CLI Box & Banner Formatter**: Unicode border box drawer supporting `rounded`, `double`, `single`, and `bold` border styles with customizable titles (`src/box.ts`).
- **Extended CLI Status Levels**: Added `log.ready()` (🚀 READY), `log.start()` (⏳ START), `log.pause()` (⏸️ PAUSE), `log.fatal()` (💀 FATAL), and `log.trace()` (🔬 TRACE).
- **Log Throttling & Sampling**: Added `log.throttle({ limit, windowMs })` to deduplicate repetitive log floods and `log.sample(rate)` for high-frequency streams.
- **Slack & Telegram Transports**: Direct alerting transports for Slack Incoming Webhooks (`SlackTransport`) and Telegram Bot API (`TelegramTransport`) (`src/transports.ts`).
- **Global Console Monkey-Patching**: Added `log.patchConsole()` and `log.unpatchConsole()` to seamlessly upgrade existing codebases without modifying call sites (`src/patchConsole.ts`).
- **New Built-in Themes**: Added `dracula`, `nord`, and `catppuccin` presets alongside `dark`, `light`, `neon`, and `minimal` (`src/themes.ts`).
- **AI Coding Agent Auto-Adoption**: Added standardized `llms.txt`, `llms-full.txt` (llmstxt.org v2 standard), `AGENTS.md`, `.cursorrules`, and `.github/copilot-instructions.md`.

### Fixed

- **24-bit TrueColor ANSI parsing**: Fixed 6-digit hex (`#RRGGBB`), 3-digit hex (`#RGB`), `rgb(r,g,b)` parsing, and added full `NO_COLOR` and `FORCE_COLOR` compliance.
- **Safe JSON Serialization**: Fixed `safeStringify` to handle `BigInt`, `Error` objects (`name`, `message`, `stack`, `cause`), `Map`, `Set`, `Symbol`, and circular structures without crashing.
- **Discord Transport Resilience**: Fixed silent HTTP 4xx/5xx/429 failures in `DiscordTransport`.
- **Level Weights Consistency**: Centralized severity weights across all transport and configuration files.
- **Stream Lifecycle Management**: Added `.flush()` and `.close()` methods to `FileLogger`, `RotatingFileLogger`, and `BetterLogger`.

### Changed

- Complete developer-first documentation overhaul for `README.md` and `DOCUMENTATION.md` removing marketing buzzwords in favor of practical recipes and quickstarts.
- Upgraded test suite to 125 tests across 21 test files with over 90.8% code coverage.
- Updated GitHub Actions CI workflow to validate TypeScript typechecks, code coverage, and builds on Ubuntu runner.

---

## [1.0.6] - 2025-12-28

### Added

- Silent logging support in `ConfigManager` and `BetterLogger`.
- Logger methods: `setTheme`, `toggleEmoji`, `setTimestampFormat`, `log`, `silent`, `removeTransport`, `clearTransports`, `timeLog`, and `clearTimers`.
- Theme management methods: `listThemes` and `deregisterTheme`.
- Browser and Node.js support in `DiscordTransport`.
- Example suite under `/examples/`.

---

## [1.0.5] - 2025-12-28

### Added

- Initial public release of BetterLogs with custom themes, timestamps, child loggers, Discord transports, and timers.
