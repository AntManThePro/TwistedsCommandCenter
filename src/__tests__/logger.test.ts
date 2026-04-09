import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../lib/logger'

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logger.info calls console.log', () => {
    logger.info('test message')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][0]).toContain('[NEXUS:INFO]')
    expect(logSpy.mock.calls[0][0]).toContain('test message')
  })

  it('logger.warn calls console.warn', () => {
    logger.warn('low stock warning')
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(warnSpy.mock.calls[0][0]).toContain('[NEXUS:WARN]')
    expect(warnSpy.mock.calls[0][0]).toContain('low stock warning')
  })

  it('logger.error calls console.error', () => {
    logger.error('something failed')
    expect(errorSpy).toHaveBeenCalledOnce()
    expect(errorSpy.mock.calls[0][0]).toContain('[NEXUS:ERROR]')
    expect(errorSpy.mock.calls[0][0]).toContain('something failed')
  })

  it('logger.debug calls console.log', () => {
    logger.debug('debug trace')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][0]).toContain('[NEXUS:DEBUG]')
    expect(logSpy.mock.calls[0][0]).toContain('debug trace')
  })

  it('includes an ISO timestamp in the log line', () => {
    logger.info('timestamp check')
    const line: string = logSpy.mock.calls[0][0]
    // ISO 8601 pattern
    expect(line).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('serialises context as JSON in the log line', () => {
    logger.info('with context', { id: 'abc', qty: 5 })
    const line: string = logSpy.mock.calls[0][0]
    expect(line).toContain('"id":"abc"')
    expect(line).toContain('"qty":5')
  })

  it('omits context key when no context is provided', () => {
    logger.info('no context')
    const line: string = logSpy.mock.calls[0][0]
    // Line should not contain a JSON object
    expect(line).not.toContain('{')
  })
})
