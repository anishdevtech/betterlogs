# BetterLogs AI Chatbot Summary

Use the following prompt when asking an AI assistant to understand the BetterLogs package:

```txt
You are reviewing the BetterLogs TypeScript package. It exports a default logger and several helper classes.

Package name: betterlogs
Language: TypeScript

Main exports:
- default logger object: `log`
- `BetterLogger`
- `ConfigManager`
- `ThemeManager`
- `DiscordTransport`

Key logger methods:
- `log.info(message)`
- `log.success(message)`
- `log.warn(message)`
- `log.error(message)`
- `log.debug(message)`
- `log.log(level, message)`
- `log.silent(message)`
- `log.withLabel(name)`
- `log.with(options)`
- `log.config(config)`
- `log.setLevel(level)`
- `log.setMode(mode)`
- `log.setTheme(theme)`
- `log.toggleEmoji(flag)`
- `log.setTimestampFormat(format)`
- `log.time(label)`
- `log.timeLog(label)`
- `log.timeEnd(label)`
- `log.clearTimers()`
- `log.table(data)`
- `log.file(path)`
- `log.addTransport(transport)`
- `log.removeTransport(transport)`
- `log.clearTransports()`
- `log.addTheme(theme)`
- `log.listThemes()`
- `log.deregisterTheme(name)`
- `log.addLevel(name, config)`
- `log.create(config)`

Important package behavior:
- Supports built-in themes (`dark`, `light`, `neon`, `minimal`) and custom theme registration.
- Supports custom log levels with colors and emojis.
- Supports Node.js file logging.
- Supports Discord webhook transports with filter options and custom checks.
- Uses pretty formatting by default and JSON mode when configured.
- Supports label-based grouping and per-log metadata via `with()`.

Explain how developers can use BetterLogs in both Node.js and browser environments, including:
- installation
- importing the package
- configuring themes and formatting
- creating labels and groups
- adding custom log levels
- using transports and Discord integration
- timer helpers and table output
- creating separate logger instances

Also list the most important files in the package and how the default export is created.
```
