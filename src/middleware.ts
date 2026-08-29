import { BetterLogger } from './logger';
import { HttpMiddlewareOptions } from './types';
import { Colorizer } from './utils';
import { defaultAsyncContext } from './asyncContext';

export interface HttpRequestLike {
  method?: string;
  url?: string;
  originalUrl?: string;
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  id?: string;
  socket?: { remoteAddress?: string };
  [key: string]: unknown;
}

export interface HttpResponseLike {
  statusCode?: number;
  on(event: string, listener: () => void): unknown;
  [key: string]: unknown;
}

export function createHttpMiddleware(logger: BetterLogger, options: HttpMiddlewareOptions = {}) {
  return (req: HttpRequestLike, res: HttpResponseLike, next?: () => void) => {
    const startTime = Date.now();
    const url = req.originalUrl || req.url || '/';
    const method = req.method || 'GET';

    // Check ignoreUrls
    if (options.ignoreUrls) {
      for (const ignore of options.ignoreUrls) {
        if (typeof ignore === 'string' && url === ignore) {
          if (typeof next === 'function') next();
          return;
        }
        if (ignore instanceof RegExp && ignore.test(url)) {
          if (typeof next === 'function') next();
          return;
        }
      }
    }

    const rawReqId = req.headers?.['x-request-id'];
    const headerReqId = Array.isArray(rawReqId) ? rawReqId[0] : rawReqId;
    const requestId =
      headerReqId || req.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Wrap execution inside async context so all downstream logs contain requestId
    defaultAsyncContext.run({ requestId, method, url }, () => {
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode || 200;

        let statusColor = 'green';
        if (statusCode >= 500) {
          statusColor = 'red';
        } else if (statusCode >= 400) {
          statusColor = 'yellow';
        } else if (statusCode >= 300) {
          statusColor = 'cyan';
        }

        const coloredStatus = Colorizer.applyColor(String(statusCode), statusColor);
        const coloredMethod = Colorizer.applyColor(method, 'blue');
        const coloredDuration = Colorizer.applyColor(`${duration}ms`, 'gray');

        const message = options.format
          ? options.format(req, res, duration)
          : `${coloredMethod} ${url} ${coloredStatus} in ${coloredDuration}`;

        const level =
          options.level || (statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info');

        logger.log(level, message, {
          http: {
            method,
            url,
            statusCode,
            durationMs: duration,
            ip: req.ip || req.socket?.remoteAddress,
            userAgent: req.headers?.['user-agent']
          }
        });
      });

      if (typeof next === 'function') {
        next();
      }
    });
  };
}
