# BetterLogs AI Assistant Reference

When instructing an AI assistant to use BetterLogs in a codebase, provide this reference:

```txt
You are working with @anishsharma/betterlogs, a zero-dependency TypeScript logging library for Node.js and browsers.

Package: @anishsharma/betterlogs
Installation: npm install @anishsharma/betterlogs

Main exports:
- Default export: log (and betterlogs)
- Classes: BetterLogger, ConfigManager, ThemeManager, FileLogger, RotatingFileLogger, Redactor, BoxDrawer
- Transports: DiscordTransport, SlackTransport, TelegramTransport, HttpTransport, CallbackTransport
- Middleware: createHttpMiddleware

Key Methods:
- log.info(msg, ...data), log.warn(msg, ...data), log.error(err, ...data), log.debug(msg, ...data), log.trace(msg, ...data)
- log.ready(msg, ...data), log.start(msg, ...data), log.success(msg, ...data), log.pause(msg, ...data), log.fatal(err, ...data)
- log.child({ label, meta, level }) -> Creates an isolated child logger
- log.with(meta) -> Attaches scoped metadata or transport overrides (e.g. { discord: true })
- log.box(text, options) -> Renders styled Unicode border boxes
- log.runWithContext(ctx, fn) -> Traces request context via Node.js AsyncLocalStorage
- log.httpMiddleware(options) -> Color-coded request logging for Express/Node HTTP servers
- log.patchConsole() / log.unpatchConsole() -> Upgrades existing global console.log calls
- log.throttle({ limit, windowMs }) -> Rate limits repetitive logs
- log.sample(rate) -> Probabilistic log sampling for high-frequency loops
- log.config(options) -> Configures themes (dracula, nord, catppuccin, neon, dark, light, minimal), mode (pretty / json), secret redaction, and log rotation
- log.file(path, rotationOptions) -> Zero-dependency file logging with size/date rotation
- log.addTransport(transport) -> Direct alerting to Discord, Slack, Telegram, or HTTP endpoints
- log.close() -> Flushes and closes file handles and transports

Code Patterns:

1. Express Server:
app.use(log.httpMiddleware());
app.listen(3000, () => log.ready('Server listening on http://localhost:3000'));

2. Secret Redaction:
log.config({ redaction: { paths: ['password', 'token', 'authorization', '*.secret'] } });

3. Upgrade Legacy Projects:
log.patchConsole();
```
