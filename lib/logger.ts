/**
 * Secure error logging utility
 * Prevents sensitive information exposure in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  /**
   * Log an error securely
   * In production: logs generic message to console, detailed to server logs
   * In development: logs full error details
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, {
        error,
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Generic message for production console
      console.error(`[ERROR] ${message}`);

      // In production, send detailed errors to a logging service
      // TODO: Integrate with logging service (Sentry, LogRocket, etc.)
      this.sendToLoggingService('error', message, error, context);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn(`[WARN] ${message}`);
      this.sendToLoggingService('warn', message, undefined, context);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`[INFO] ${message}`);
      this.sendToLoggingService('info', message, undefined, context);
    }
  }

  /**
   * Log debug information (dev only)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Send logs to external logging service
   * This is a placeholder for future integration
   */
  private sendToLoggingService(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
  ): void {
    // TODO: Integrate with your logging service
    // Examples: Sentry, LogRocket, DataDog, New Relic

    // For now, store in a safe format for server logs
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      // Safely extract error information
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        // Don't include stack trace in production logs sent to client
      } : undefined,
    };

    // This would typically send to your logging service API
    // For now, it's a no-op in production
    if (process.env.NEXT_PUBLIC_LOGGING_ENDPOINT) {
      // Send to logging endpoint
      // fetch(process.env.NEXT_PUBLIC_LOGGING_ENDPOINT, {
      //   method: 'POST',
      //   body: JSON.stringify(logEntry),
      // }).catch(() => {
      //   // Silently fail if logging service is unavailable
      // });
    }
  }

  /**
   * Create a safe error message for API responses
   */
  getSafeErrorMessage(error: unknown): string {
    if (this.isDevelopment) {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    }
    return 'An error occurred. Please try again later.';
  }

  /**
   * Extract error details safely
   */
  extractErrorInfo(error: unknown): {
    message: string;
    name?: string;
    stack?: string;
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }
    return {
      message: String(error),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext };
