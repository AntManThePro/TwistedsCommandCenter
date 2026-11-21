import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '../../lib/logger'

interface Props {
  children: ReactNode
  /** Optional custom fallback rendered instead of the default NEXUS error screen. */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — catches React render errors anywhere in its subtree,
 * logs them via the structured logger, and displays a NEXUS-themed
 * recovery screen so the rest of the app does not go dark.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled render error', {
      error: error.message,
      componentStack: info.componentStack ?? '',
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          role="alert"
          className="flex h-screen flex-col items-center justify-center bg-[#050510] p-8 text-center"
        >
          <div className="mb-4 text-4xl" aria-hidden="true">
            ⚠
          </div>
          <h1
            className="text-xl font-black tracking-tight"
            style={{ color: '#ff0080', textShadow: '0 0 12px rgba(255,0,128,0.6)' }}
          >
            SYSTEM ERROR
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            An unexpected error occurred. Reload the page to continue.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-md overflow-auto rounded-lg border border-[#1a1a3e] bg-[#0a0a18] p-3 text-left text-[10px] text-[#ff0080]/70">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg border border-[#ff0080]/30 bg-[#ff0080]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#ff0080] transition-all hover:bg-[#ff0080]/20"
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
