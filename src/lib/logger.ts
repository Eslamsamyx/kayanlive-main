/**
 * Structured Logging Service
 *
 * Provides consistent logging across the application with different log levels,
 * structured data, and environment-aware output.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = this.getMinLevel();
  }

  private getMinLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.isProduction) {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(entry);
    } else {
      // Human-readable format for development
      const parts = [
        `[${entry.timestamp}]`,
        `[${entry.level.toUpperCase()}]`,
        entry.message,
      ];

      if (entry.context && Object.keys(entry.context).length > 0) {
        parts.push(`\n  Context: ${JSON.stringify(entry.context, null, 2)}`);
      }

      if (entry.error) {
        parts.push(`\n  Error: ${entry.error.message}`);
        if (entry.error.stack) {
          parts.push(`\n  Stack: ${entry.error.stack}`);
        }
      }

      return parts.join(' ');
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    const formatted = this.formatLogEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, contextOrError?: LogContext | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log(LogLevel.ERROR, message, undefined, contextOrError);
    } else {
      this.log(LogLevel.ERROR, message, contextOrError, error);
    }
  }

  // Utility methods for common logging scenarios
  logApiRequest(method: string, path: string, userId?: string): void {
    this.info('API Request', {
      method,
      path,
      userId,
    });
  }

  logApiError(method: string, path: string, error: Error, userId?: string): void {
    this.error('API Error', {
      method,
      path,
      userId,
    }, error);
  }

  logDatabaseQuery(operation: string, model: string, duration?: number): void {
    this.debug('Database Query', {
      operation,
      model,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  logWorkerJob(jobType: string, jobId: string, status: 'started' | 'completed' | 'failed'): void {
    const level = status === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `Worker Job ${status}`, {
      jobType,
      jobId,
      status,
    });
  }

  logAssetProcessing(assetId: string, operation: string, status: 'started' | 'completed' | 'failed', details?: LogContext): void {
    const level = status === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `Asset Processing: ${operation} ${status}`, {
      assetId,
      operation,
      status,
      ...details,
    });
  }

  logAuth(action: string, userId?: string, success: boolean = true): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(level, `Authentication: ${action}`, {
      action,
      userId,
      success,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Type-safe helper for creating context objects
export function createLogContext(context: LogContext): LogContext {
  return context;
}
