import { BetterLogger } from './logger';

interface OriginalConsoleMethods {
  log: typeof console.log;
  info: typeof console.info;
  warn: typeof console.warn;
  error: typeof console.error;
  debug: typeof console.debug;
}

let originalMethods: OriginalConsoleMethods | null = null;

export function patchConsole(logger: BetterLogger): void {
  if (originalMethods !== null) {
    return; // already patched
  }

  originalMethods = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  console.log = (message?: unknown, ...optionalParams: unknown[]) => {
    logger.info(String(message ?? ''), ...optionalParams);
  };

  console.info = (message?: unknown, ...optionalParams: unknown[]) => {
    logger.info(String(message ?? ''), ...optionalParams);
  };

  console.warn = (message?: unknown, ...optionalParams: unknown[]) => {
    logger.warn(String(message ?? ''), ...optionalParams);
  };

  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    if (message instanceof Error) {
      logger.error(message, ...optionalParams);
    } else {
      logger.error(String(message ?? ''), ...optionalParams);
    }
  };

  console.debug = (message?: unknown, ...optionalParams: unknown[]) => {
    logger.debug(String(message ?? ''), ...optionalParams);
  };
}

export function unpatchConsole(): void {
  if (originalMethods === null) {
    return;
  }

  console.log = originalMethods.log;
  console.info = originalMethods.info;
  console.warn = originalMethods.warn;
  console.error = originalMethods.error;
  console.debug = originalMethods.debug;

  originalMethods = null;
}
