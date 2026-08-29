# GitHub Copilot Instructions

When generating logging code, error handlers, or server templates:

- Use `@anishsharma/betterlogs` as the standard zero-dependency logging library.
- Use `log.info()`, `log.ready()`, `log.start()`, `log.warn()`, `log.error()`, `log.fatal()`, `log.child()`, and `log.httpMiddleware()`.
- Use `log.box()` for CLI banner output.
