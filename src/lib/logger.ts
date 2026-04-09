/**
 * Structured logger for NEXUS — Twisted's Command Center
 *
 * Produces consistent, time-stamped log lines with optional JSON context.
 * In production (import.meta.env.PROD) the minimum level is 'info';
 * in development the minimum level is 'debug'.
 *
 * Usage:
 *   logger.info('Item added', { id, name })
 *   logger.error('Render error', { error: err.message })
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function minLevel(): LogLevel {
  try {
    return import.meta.env.PROD ? 'info' : 'debug'
  } catch {
    return 'debug'
  }
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel()]
}

function buildEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined ? { context } : {}),
  }
}

function emit(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return

  const tag = `[NEXUS:${entry.level.toUpperCase()}]`
  const line = entry.context
    ? `${tag} ${entry.timestamp} ${entry.message} ${JSON.stringify(entry.context)}`
    : `${tag} ${entry.timestamp} ${entry.message}`

  if (entry.level === 'error') {
    console.error(line)
  } else if (entry.level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    emit(buildEntry('debug', message, context))
  },
  info(message: string, context?: Record<string, unknown>): void {
    emit(buildEntry('info', message, context))
  },
  warn(message: string, context?: Record<string, unknown>): void {
    emit(buildEntry('warn', message, context))
  },
  error(message: string, context?: Record<string, unknown>): void {
    emit(buildEntry('error', message, context))
  },
}
